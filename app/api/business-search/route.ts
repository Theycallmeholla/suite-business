import { NextRequest, NextResponse } from 'next/server';
import { getGoogleBusinessProfileClient } from '@/lib/google-business-profile';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { businessName, city, phone } = await request.json();
    
    // Initialize GBP client
    const gbpClient = getGoogleBusinessProfileClient();
    
    // Search for existing listings
    const searchResults = await gbpClient.searchBusinessListings({
      businessName,
      address: city, // Can be partial address
      phoneNumber: phone,
    });

    if (searchResults.length > 0) {
      // Found existing listing(s)
      const listing: any = searchResults[0];
      
      // Extract useful information
      const businessData = {
        found: true,
        source: 'google_business_profile',
        business: {
          businessName: listing.title || businessName,
          phone: listing.phoneNumbers?.primary || '',
          address: listing.address?.addressLines?.[0] || '',
          city: listing.address?.locality || city,
          state: listing.address?.administrativeArea || '',
          zip: listing.address?.postalCode || '',
          website: listing.websiteUri || '',
          categories: listing.categories?.map((c: any) => c.displayName) || [],
          hours: listing.regularHours || null,
          attributes: listing.attributes || {},
          verified: listing.locationState?.isVerified || false,
          suspended: listing.locationState?.isSuspended || false,
          duplicate: listing.locationState?.isDuplicate || false,
        },
        googleData: {
          locationName: listing.name,
          placeId: listing.metadata?.placeId,
          mapsUrl: listing.metadata?.mapsUrl,
        },
        canClaim: false,
      };

      // If verified, we can potentially claim management
      if (businessData.business.verified) {
        businessData.canClaim = true;
      }

      return NextResponse.json(businessData);
    }

    // No existing listing found - search web for business info
    // This could integrate with other data sources
    return NextResponse.json({
      found: false,
      source: 'none',
      message: 'No existing Google Business Profile found',
    });

  } catch (error) {
    logger.apiError('business-search', error as Error, {
      action: 'search_business_listing'
    });
    
    // Fallback to basic search if GBP API fails
    return NextResponse.json({
      found: false,
      source: 'error',
      message: 'Search service temporarily unavailable',
      // Still return some mock data for development
      business: {
        businessName: '',
        city: '',
      },
    });
  }
}
