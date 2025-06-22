import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getCacheKey, getFromCache } from '@/lib/gbp-cache';

// Cache for GBP access results
const gbpAccessCache = new Map<string, { 
  hasAccess: boolean; 
  accountId?: string;
  accountEmail?: string;
  locationId?: string;
  timestamp: number;
}>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { placeId, businessName, address } = await request.json();
    
    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${session.user.id}-${placeId}`;
    const cached = gbpAccessCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        placeId,
        businessName,
        ...cached,
        cached: true
      });
    }

    logger.info('Checking GBP access for place', {
      action: 'gbp_check_access',
      placeId,
      businessName,
    });

    // Get all user's Google accounts
    const googleAccounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });
    
    // Get the primary user email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (googleAccounts.length === 0) {
      return NextResponse.json({
        placeId,
        businessName,
        hasAccess: false,
        message: 'No Google accounts connected',
      });
    }

    // Check each account for GBP access
    let hasAccess = false;
    let accessAccountId: string | undefined;
    let accessAccountEmail: string | undefined;
    let accessLocationId: string | undefined;

    // Try to find the business in user's GBP locations
    for (const account of googleAccounts) {
      try {
        // Call our own my-locations endpoint to check this account
        const locationsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/gbp/my-locations?accountId=${account.providerAccountId}`, {
          method: 'GET',
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          },
        });

        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          const locations = locationsData.locations || [];

          logger.info(`Checking ${locations.length} locations for account ${account.providerAccountId}`, {
            businessName,
            accountEmail: locationsData.googleAccountEmail
          });

          // Check if any location matches our search
          for (const location of locations) {
            // Match by name and address similarity
            const nameMatch = location.name?.toLowerCase().includes(businessName.toLowerCase()) ||
                            businessName.toLowerCase().includes(location.name?.toLowerCase());
            
            const addressMatch = address && location.address && 
                               location.address.toLowerCase().includes(address.toLowerCase().split(',')[0]);

            if (nameMatch || addressMatch) {
              hasAccess = true;
              accessAccountId = account.providerAccountId;
              // Get email from the locations API response
              accessAccountEmail = locationsData.googleAccountEmail || user?.email || 'Connected Account';
              accessLocationId = location.id;
              logger.info('Found matching business!', { 
                locationName: location.name,
                businessName,
                accountEmail: accessAccountEmail 
              });
              break;
            }
          }
        } else {
          logger.warn('Failed to fetch locations for account', {
            accountId: account.providerAccountId,
            status: locationsResponse.status,
            error: await locationsResponse.text()
          });
        }

        if (hasAccess) break;
      } catch (error) {
        logger.warn('Error checking account for GBP access', { 
          accountId: account.providerAccountId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Cache the result
    const result = {
      hasAccess,
      accountId: accessAccountId,
      accountEmail: accessAccountEmail,
      locationId: accessLocationId,
      timestamp: Date.now(),
    };

    gbpAccessCache.set(cacheKey, result);

    return NextResponse.json({
      placeId,
      businessName,
      hasAccess,
      accountId: accessAccountId,
      accountEmail: accessAccountEmail,
      locationId: accessLocationId,
      message: hasAccess 
        ? `You have access to this business profile via ${accessAccountEmail}`
        : 'You do not have access to this business profile with your current accounts',
      availableAccounts: await Promise.all(googleAccounts.map(async (acc, index) => {
        // Try to get the email from shared GBP locations cache
        let email = `Google Account ${index + 1}`;
        
        // Check if we have cached GBP data for this account
        const cacheKey = getCacheKey(session.user.id, acc.providerAccountId);
        const cachedData = getFromCache(cacheKey);
        if (cachedData && cachedData.data.googleAccountEmail) {
          email = cachedData.data.googleAccountEmail;
        } else if (index === 0 && user?.email) {
          // Use primary email for first account as fallback
          email = user.email;
        }
        
        return {
          id: acc.providerAccountId,
          email: email,
        };
      })),
      checkedAccounts: googleAccounts.length,
    });

  } catch (error) {
    logger.error('GBP access check error', {
      action: 'gbp_access_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to check GBP access' },
      { status: 500 }
    );
  }
}