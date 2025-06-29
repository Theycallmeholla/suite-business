import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';
import { logger } from '@/lib/logger';

// --- GBP → internal key map ----------------------------
const FIELD_MAP = {
  primaryPhone:           'phoneNumbers.primaryPhone',
  website:                'websiteUri',
  fullAddress:            'storefrontAddress',
  serviceArea:            'serviceArea',
  categories:             'categories.primaryCategory.displayName',
  additionalCategories:   'categories.additionalCategories',
  regularHours:           'regularHours',
  specialHours:           'specialHours',
  moreHours:              'moreHours',
  description:            'profile.description',
  metadata:               'metadata',
  coordinates:            'latlng',
  businessName:           'title',
  languageCode:           'languageCode',
  storeCode:              'storeCode',
  openInfo:               'openInfo',
  labels:                 'labels',
  serviceItems:           'serviceItems',
  relationshipData:       'relationshipData',
} as const;

/**
 * Safely traverse nested properties using dot notation
 */
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params before using
    const { locationId: paramLocationId } = await params;
    
    // Decode the locationId in case it was URL encoded
    const locationId = decodeURIComponent(paramLocationId);
    const accountId = request.nextUrl.searchParams.get('accountId');

    logger.info('Fetching single GBP location', {
      metadata: { 
      userId: session.user.id, 
      locationId,
      encodedLocationId: paramLocationId,
      accountId 
    }
    });

    // Get the Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
        ...(accountId ? { providerAccountId: accountId } : {}),
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (!account) {
      return NextResponse.json(
        { 
          error: 'Google account not found',
          details: accountId ? `No Google account found with ID: ${accountId}` : 'No Google accounts connected',
        },
        { status: 404 }
      );
    }
    
    if (!account.access_token) {
      return NextResponse.json(
        { 
          error: 'No access token for Google account',
          details: 'Please re-authenticate with Google.',
        },
        { status: 401 }
      );
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
        await prisma.account.update({
          where: { id: account.id },
          data: {
            access_token: credentials.access_token,
            expires_at: Math.floor((credentials.expiry_date || 0) / 1000),
            refresh_token: credentials.refresh_token || account.refresh_token,
          },
        });
        oauth2Client.setCredentials(credentials);
      } catch (refreshError) {
        logger.error('Token refresh failed', {}, refreshError as Error);
        return NextResponse.json(
          { error: 'Google authentication expired. Please sign in again.' },
          { status: 401 }
        );
      }
    }

    // Initialize Google Business Information API
    const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: oauth2Client,
    });

    try {
      let resourceName = locationId;
      
      // Check if this is a GBP resource name or might be something else
      if (!locationId.startsWith('locations/')) {
        // This might be a Place ID or just the numeric part
        // We'll try different formats
        
        // First try as if it's just the numeric ID
        try {
          const response = await mybusinessbusinessinformation.locations.get({
            name: `locations/${locationId}`,
            readMask: 'name'
          });
          resourceName = response.data.name!;
        } catch (e) {
          // If that fails, we need to search through user's locations
          logger.info('Direct location lookup failed, searching through user locations');
          
          const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
            version: 'v1',
            auth: oauth2Client,
          });

          const accountsResponse = await mybusinessaccountmanagement.accounts.list();
          const accounts = accountsResponse.data.accounts || [];
          
          let found = false;

          // Search through all accounts and locations
          for (const businessAccount of accounts) {
            if (!businessAccount.name) continue;

            const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
              parent: businessAccount.name,
              readMask: 'name,title',
              pageSize: 100,
            });

            const locations = locationsResponse.data.locations || [];
            
            // Look for a location that matches in various ways
            const targetLocation = locations.find((loc: any) => {
              // Check if the location name ends with our ID
              if (loc.name.endsWith(`/${locationId}`)) return true;
              // Check if it's the full resource name
              if (loc.name === locationId) return true;
              // For Place IDs, we'd need to match by title or other attributes
              // This is a limitation - we can't directly map Place IDs to GBP locations
              return false;
            });

            if (targetLocation && targetLocation.name) {
              resourceName = targetLocation.name;
              found = true;
              break;
            }
          }

          if (!found) {
            // If still not found and it looks like a Place ID (starts with ChIJ), 
            // return a helpful error
            if (locationId.startsWith('ChIJ')) {
              return NextResponse.json(
                { 
                  error: 'Invalid location ID format',
                  details: 'This appears to be a Google Place ID. Please use the Google Business Profile location ID instead.',
                  providedId: locationId,
                  expectedFormat: 'locations/1234567890 or just 1234567890'
                },
                { status: 400 }
              );
            }
            
            throw new Error('Location not found');
          }
        }
      }

      // Now fetch the full details
      const response = await mybusinessbusinessinformation.locations.get({
        name: resourceName,
        readMask: 'name,title,phoneNumbers,storefrontAddress,websiteUri,regularHours,specialHours,categories,languageCode,storeCode,profile,relationshipData,moreHours,serviceArea,labels,adWordsLocationExtensions,latlng,openInfo,metadata,serviceItems'
      });

      const location = response.data;

      // Transform the data using FIELD_MAP for consistency
      const transformedLocation: any = {
        id: location.name,
        name: location.title,
      };
      
      // Apply all field mappings
      for (const [outputKey, sourcePath] of Object.entries(FIELD_MAP)) {
        const value = getNestedProperty(location, sourcePath);
        if (value !== undefined && value !== null) {
          transformedLocation[outputKey] = value;
        }
      }
      
      // Special handling for coordinates to maintain lat/lng structure
      if (location.latlng) {
        transformedLocation.coordinates = {
          latitude: location.latlng.latitude,
          longitude: location.latlng.longitude
        };
      }
      
      // Create a formatted address string for backwards compatibility
      if (location.storefrontAddress) {
        transformedLocation.address = [
          location.storefrontAddress.addressLines?.join(', '),
          location.storefrontAddress.locality,
          location.storefrontAddress.administrativeArea,
          location.storefrontAddress.postalCode
        ].filter(Boolean).join(', ') || 'Address not available';
      }
      
      // Additional fields not in FIELD_MAP but needed for compatibility
      transformedLocation.additionalPhones = location.phoneNumbers?.additionalPhones || [];
      transformedLocation.primaryCategory = location.categories?.primaryCategory;
      transformedLocation.profile = location.profile;

      logger.info('Successfully fetched GBP location', {
      metadata: { 
        locationId,
        resourceName,
        hasServiceArea: !!location.serviceArea,
        categoriesCount: (location.categories?.additionalCategories?.length || 0) + 1
      }
    });

      return NextResponse.json(transformedLocation);

    } catch (apiError: any) {
      logger.error('Google API Error:', {
      metadata: { 
        error: apiError.message,
        locationId,
        code: apiError.code,
        details: apiError.response?.data
      }
    });

      if (apiError.code === 404 || apiError.message?.includes('not found')) {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        );
      }

      if (apiError.code === 403) {
        return NextResponse.json(
          { error: 'Permission denied. You may not have access to this location.' },
          { status: 403 }
        );
      }

      throw apiError;
    }

  } catch (error: any) {
    const { locationId: paramLocationId } = await params;
    logger.error('Error fetching GBP location', {
      metadata: { 
      error: error.message,
      locationId: paramLocationId 
    }
    });

    return NextResponse.json(
      { error: 'Failed to fetch location details' },
      { status: 500 }
    );
  }
}
