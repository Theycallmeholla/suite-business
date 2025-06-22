import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

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

    // First, check if user has GBP access to this business
    const accessResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/gbp/check-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the session cookie
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({ placeId, businessName, address }),
    });

    const accessData = await accessResponse.json();

    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      // Return mock data for development
      const mockOwnershipStatus = accessData.hasAccess 
        ? 'owned' 
        : businessName.toLowerCase().includes('claimed') 
        ? 'claimed_by_others' 
        : 'unclaimed';

      return NextResponse.json({
        placeId,
        businessName,
        ownershipStatus: mockOwnershipStatus,
        canClaim: mockOwnershipStatus === 'unclaimed',
        verificationRequired: mockOwnershipStatus !== 'owned',
        message: getOwnershipMessage(mockOwnershipStatus),
        hasGbpAccess: accessData.hasAccess,
        gbpAccountEmail: accessData.accountEmail,
        availableAccounts: accessData.availableAccounts,
        mock: true
      });
    }

    // In production, this would:
    // 1. Use GoogleLocations API to search for the place
    // 2. Check if it has a requestAdminRightsUrl (meaning someone else owns it)
    // 3. Combined with access check to determine true ownership
    
    logger.info('Checking GBP ownership', {
      action: 'gbp_check_ownership',
      placeId,
      businessName,
      hasAccess: accessData.hasAccess,
    });

    // Determine ownership status based on access check
    let ownershipStatus: 'owned' | 'claimed_by_others' | 'unclaimed' | 'no_access';
    
    if (accessData.hasAccess) {
      // User has GBP access - they own it
      ownershipStatus = 'owned';
    } else {
      // User doesn't have access - need to check if it's claimed by others
      // In production, would use GoogleLocations API here
      // For now, simulate based on business name patterns
      if (businessName.toLowerCase().includes('claimed')) {
        ownershipStatus = 'claimed_by_others';
      } else {
        ownershipStatus = 'no_access'; // Found but user has no access
      }
    }

    const response = {
      placeId,
      businessName,
      ownershipStatus,
      canClaim: ownershipStatus === 'unclaimed',
      verificationRequired: ownershipStatus !== 'owned',
      message: getOwnershipMessage(ownershipStatus),
      hasGbpAccess: accessData.hasAccess,
      gbpAccountEmail: accessData.accountEmail,
      gbpLocationId: accessData.locationId,
      availableAccounts: accessData.availableAccounts || [],
      // In production, would include:
      // requestAdminRightsUrl: 'https://business.google.com/...' (if claimed by others)
      // verificationMethods: ['postcard', 'phone', 'email'] (if unclaimed)
    };

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Ownership check error', {
      action: 'gbp_ownership_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to check business ownership' },
      { status: 500 }
    );
  }
}

function getOwnershipMessage(status: string): string {
  switch (status) {
    case 'owned':
      return 'You already manage this business on Google. We can import its information.';
    case 'claimed_by_others':
      return 'This business is already claimed by another user. You can request access or create a duplicate listing if you have the right to manage it.';
    case 'unclaimed':
      return 'This business listing appears to be unclaimed. You can claim it to manage its information on Google.';
    case 'no_access':
      return 'This business exists on Google but you don\'t have access to manage it. You may need to add the Google account that manages this business or request access.';
    default:
      return 'Unable to determine ownership status.';
  }
}