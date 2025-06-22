import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';
import { getCacheKey, getFromCache, setInCache } from '@/lib/gbp-cache';

// Helper to add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Google's rate limit is 10 requests per minute
const GOOGLE_RATE_LIMIT_DELAY = 6500; // 6.5 seconds between requests to stay under 10/minute

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    // Get the specific Google account or the most recent one
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
        ...(accountId ? { providerAccountId: accountId } : {}),
      },
      orderBy: {
        id: 'desc', // Get the most recently added account if no specific ID (newer IDs are higher)
      },
    });

    if (!account) {
      return NextResponse.json(
        { 
          error: 'Google account not found',
          details: accountId ? `No Google account found with ID: ${accountId}` : 'No Google accounts connected',
          requestedAccountId: accountId 
        },
        { status: 404 }
      );
    }
    
    if (!account.access_token) {
      return NextResponse.json(
        { 
          error: 'No access token for Google account',
          details: 'The Google account exists but has no valid access token. Please re-authenticate.',
          accountId: account.providerAccountId
        },
        { status: 401 }
      );
    }

    // Use both user ID and Google account ID for cache key to handle multiple Google accounts
    const cacheKey = getCacheKey(session.user.id, account.providerAccountId);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // ALWAYS check cache first unless force refresh
    if (!forceRefresh) {
      const cached = getFromCache(cacheKey);
      if (cached) {
        const ageMinutes = Math.floor((Date.now() - cached.timestamp) / 1000 / 60);
        console.log(`Returning cached data (${ageMinutes} minutes old) for Google account ${account.providerAccountId}`);
        return NextResponse.json({
          ...cached.data,
          cached: true,
          cacheAge: ageMinutes,
          googleAccountId: account.providerAccountId,
        });
      }
    }

    // Initialize Google OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    // Check if token needs refresh
    if (account.expires_at && new Date(account.expires_at * 1000) < new Date()) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        // Update the stored tokens
        await prisma.account.update({
          where: {
            id: account.id,
          },
          data: {
            access_token: credentials.access_token,
            expires_at: Math.floor((credentials.expiry_date || 0) / 1000),
            refresh_token: credentials.refresh_token || account.refresh_token,
          },
        });
        oauth2Client.setCredentials(credentials);
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        
        if (refreshError?.message?.includes('unauthorized_client')) {
          return NextResponse.json(
            { 
              error: 'OAuth credentials have changed',
              details: 'Please sign out and sign in again with Google.',
              action: 'reauth'
            },
            { status: 401 }
          );
        }
        
        return NextResponse.json(
          { error: 'Google authentication expired. Please sign in again.' },
          { status: 401 }
        );
      }
    }

    try {
      console.log('Starting Google Business Profile API calls...');
      
      // Get business accounts
      const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
        version: 'v1',
        auth: oauth2Client,
      });

      console.log('Fetching business accounts...');
      const accountsResponse = await mybusinessaccountmanagement.accounts.list();
      const accounts = accountsResponse.data.accounts || [];
      
      console.log(`Found ${accounts.length} business account(s)`);

      if (accounts.length === 0) {
        // Get the actual Google account email
        let googleEmail = session.user.email; // fallback
        try {
          const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
          const userInfo = await oauth2.userinfo.get();
          googleEmail = userInfo.data.email || session.user.email;
        } catch (error) {
          console.log('Could not fetch Google account email:', error);
        }
        
        const responseData = {
          locations: [],
          message: 'No Google Business Profile accounts found.',
          accountsChecked: 0,
          googleAccountId: account.providerAccountId,
          googleAccountEmail: googleEmail,
        };
        
        // Cache even empty results
        cache.set(cacheKey, {
          data: responseData,
          timestamp: Date.now(),
        });
        
        return NextResponse.json(responseData);
      }

      // Get locations for each account with rate limiting
      const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
        version: 'v1',
        auth: oauth2Client,
      });
      
      const allLocations: any[] = [];
      let apiCallCount = 1; // We already made one call for accounts
      
      for (let i = 0; i < accounts.length; i++) {
        const businessAccount = accounts[i];
        
        if (!businessAccount.name) {
          console.warn('Business account missing name:', businessAccount);
          continue;
        }

        // Add delay between requests to respect rate limit
        if (i > 0) {
          console.log(`Waiting ${GOOGLE_RATE_LIMIT_DELAY}ms before next API call...`);
          await delay(GOOGLE_RATE_LIMIT_DELAY);
        }

        try {
          console.log(`Fetching locations for account ${i + 1}/${accounts.length}: ${businessAccount.name}`);
          apiCallCount++;
          
          const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
            parent: businessAccount.name,
            readMask: 'name,title,languageCode,storeCode,websiteUri,phoneNumbers,storefrontAddress,latlng,serviceArea,categories,regularHours,specialHours,moreHours,openInfo,serviceItems,profile,labels,metadata,relationshipData,adWordsLocationExtensions',
            pageSize: 100, // Get up to 100 locations per account
          });

          const locations = locationsResponse.data.locations || [];
          console.log(`Found ${locations.length} location(s) for account ${businessAccount.name}`);
          
          allLocations.push(...locations.map((location: any) => ({
            // Core identification
            id: location.name,
            name: location.title || 'Unnamed Location',
            languageCode: location.languageCode,
            storeCode: location.storeCode,
            
            // Contact information
            primaryPhone: location.phoneNumbers?.primaryPhone || null,
            additionalPhones: location.phoneNumbers?.additionalPhones || [],
            website: location.websiteUri || null,
            
            // Location details
            address: location.storefrontAddress ? 
              `${location.storefrontAddress.addressLines?.join(', ')}, ${location.storefrontAddress.locality}, ${location.storefrontAddress.administrativeArea} ${location.storefrontAddress.postalCode}` : 
              'Address not available',
            fullAddress: location.storefrontAddress || null,
            coordinates: location.latlng || null,
            serviceArea: location.serviceArea || null,
            
            // Business categorization
            primaryCategory: location.categories?.primaryCategory || null,
            additionalCategories: location.categories?.additionalCategories || [],
            
            // Operating information
            regularHours: location.regularHours || null,
            specialHours: location.specialHours || null,
            moreHours: location.moreHours || [],
            openInfo: location.openInfo || null,
            
            // Services and features
            serviceItems: location.serviceItems || [],
            profile: location.profile || null,
            labels: location.labels || [],
            
            // Metadata
            metadata: location.metadata || null,
            relationshipData: location.relationshipData || null,
            adWordsLocationExtensions: location.adWordsLocationExtensions || null,
            
            // Account info
            accountName: businessAccount.name,
          })));
        } catch (error: any) {
          console.error('Error fetching locations for account:', businessAccount.name, error?.message);
          
          // If we hit rate limit, return what we have so far
          if (error?.code === 429) {
            console.log('Hit rate limit, returning partial results...');
            break;
          }
        }
      }

      console.log(`Total API calls made: ${apiCallCount}`);
      console.log(`Total locations found: ${allLocations.length}`);
      
      // Get the actual Google account email by making a userinfo request
      let googleEmail = session.user.email; // fallback
      try {
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        googleEmail = userInfo.data.email || session.user.email;
      } catch (error) {
        console.log('Could not fetch Google account email:', error);
      }

      // Cache the successful response
      const responseData = {
        locations: allLocations,
        accountsChecked: accounts.length,
        totalLocations: allLocations.length,
        apiCallsUsed: apiCallCount,
        fetchedAt: new Date().toISOString(),
        googleAccountId: account.providerAccountId,
        googleAccountEmail: googleEmail,
      };
      
      setInCache(cacheKey, responseData);
      
      return NextResponse.json(responseData);

    } catch (apiError: any) {
      console.error('Google API Error:', apiError?.message || apiError);
      console.error('Full error details:', JSON.stringify(apiError?.response?.data || apiError, null, 2));
      
      // Handle specific API errors
      if (apiError?.code === 403) {
        // Check for quota = 0 issue
        if (apiError.message?.includes('quota') || apiError.message?.includes('Quota')) {
          return NextResponse.json(
            { 
              error: 'Google Business Profile API access not granted',
              details: 'Your project has a quota of 0. You need to request access to the GBP API.',
              action: 'request_access',
              steps: [
                '1. Go to https://developers.google.com/my-business/content/prereqs',
                '2. Click "Request access to the API"',
                '3. Fill out the application form',
                '4. Wait for approval (usually 1-3 business days)',
                '5. Once approved, your quotas will be increased'
              ],
              currentQuota: 0,
              projectId: process.env.GOOGLE_CLIENT_ID?.split('-')[0],
            },
            { status: 403 }
          );
        }
        
        if (apiError.message?.includes('has not been used in project')) {
          return NextResponse.json(
            { 
              error: 'Google Business Profile API is not enabled',
              details: 'Please enable the required APIs in Google Cloud Console.',
              apis: [
                'Google My Business Account Management API',
                'Google My Business Business Information API'
              ],
              enableUrl: 'https://console.cloud.google.com/apis/library',
              projectId: process.env.GOOGLE_CLIENT_ID?.split('-')[0],
            },
            { status: 403 }
          );
        }
        
        // Check for insufficient permissions
        if (apiError.message?.includes('PERMISSION_DENIED') || apiError.message?.includes('insufficient')) {
          return NextResponse.json(
            { 
              error: 'Insufficient permissions',
              details: 'The authenticated user does not have permission to access Google Business Profile data.',
              possibleReasons: [
                'User is not an owner/manager of any Google Business Profile',
                'OAuth scope is insufficient',
                'API access has not been granted to your project'
              ],
            },
            { status: 403 }
          );
        }
        
        return NextResponse.json(
          { error: 'Access denied to Google Business Profile' },
          { status: 403 }
        );
      }
      
      // Handle quota exceeded
      if (apiError?.code === 429 || apiError?.message?.includes('Quota exceeded')) {
        // Try to return cached data
        const cached = cache.get(cacheKey);
        if (cached) {
          return NextResponse.json({
            ...cached.data,
            warning: 'Using cached data due to API quota limit.',
            cached: true,
            cacheAge: Math.floor((Date.now() - cached.timestamp) / 1000 / 60),
          });
        }
        
        return NextResponse.json(
          { 
            error: 'Google API quota exceeded',
            details: 'Google allows only 10 requests per minute. Please try again in a minute.',
            retryAfter: 60,
          },
          { status: 429 }
        );
      }
      
      throw apiError;
    }

  } catch (error: any) {
    console.error('GBP My Locations Error:', error);
    
    const errorMessage = error?.message || String(error);
    
    // Auth errors
    if (errorMessage.includes('invalid_grant') || errorMessage.includes('Token has been expired')) {
      return NextResponse.json(
        { error: 'Google authentication expired. Please sign in again.' },
        { status: 401 }
      );
    }
    
    // Return error with details in development
    return NextResponse.json(
      { 
        error: 'Failed to fetch business locations',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}