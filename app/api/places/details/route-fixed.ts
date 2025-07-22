import { NextRequest } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

// Correct field names for Places API (New) v1
const VALID_FIELDS = {
  // Basic fields
  id: 'id',
  displayName: 'displayName',
  primaryType: 'primaryType',
  formattedAddress: 'formattedAddress',
  
  // Contact fields
  nationalPhoneNumber: 'nationalPhoneNumber',
  internationalPhoneNumber: 'internationalPhoneNumber',
  websiteUri: 'websiteUri',
  
  // Business details
  businessStatus: 'businessStatus',
  googleMapsUri: 'googleMapsUri',
  plusCode: 'plusCode',
  location: 'location',
  viewport: 'viewport',
  
  // Ratings and reviews
  rating: 'rating',
  userRatingCount: 'userRatingCount', // NOT user_ratings_total!
  reviews: 'reviews',
  
  // Photos
  photos: 'photos',
  
  // Additional info
  regularOpeningHours: 'regularOpeningHours',
  currentOpeningHours: 'currentOpeningHours',
  priceLevel: 'priceLevel',
  editorialSummary: 'editorialSummary',
  
  // Service options
  delivery: 'delivery',
  dineIn: 'dineIn',
  curbsidePickup: 'curbsidePickup',
  reservable: 'reservable',
  servesBreakfast: 'servesBreakfast',
  servesLunch: 'servesLunch',
  servesDinner: 'servesDinner',
  servesBeer: 'servesBeer',
  servesWine: 'servesWine',
  takeout: 'takeout',
};

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    let { placeId, fields } = body;

    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      );
    }

    // Clean up the place ID (remove any prefixes)
    if (placeId.includes('/')) {
      placeId = placeId.split('/').pop();
    }

    // Default fields if none specified
    if (!fields) {
      fields = 'displayName,formattedAddress,location,rating,userRatingCount,photos,reviews,editorialSummary,regularOpeningHours,nationalPhoneNumber,websiteUri,businessStatus,priceLevel';
    }

    logger.info('Fetching place details from Places API', {
      metadata: { 
        userId: session.user.id, 
        placeId,
        fields 
      }
    });

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      logger.error('Google Maps API key not configured');
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Use the new Places API (v1) endpoint with field mask header
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fields, // Use field mask header instead of query param
      }
    });
    
    const data = await response.json() as unknown;

    if (!response.ok) {
      logger.error('Places API error', {
        metadata: { 
          error: data.error,
          placeId,
          status: response.status 
        }
      });

      // Handle specific error cases
      if (response.status === 404 || (data.error && data.error.message?.includes('Place ID is no longer valid'))) {
        return NextResponse.json(
          { 
            error: 'Place ID is no longer valid. The business may have been removed or the ID has changed.',
            code: 'INVALID_PLACE_ID',
            needsRefresh: true 
          },
          { status: 404 }
        );
      }

      if (response.status === 400 && data.error?.details) {
        // Extract field validation errors
        const fieldErrors = data.error.details
          .filter((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.BadRequest')
          .flatMap((d: any) => d.fieldViolations || []);
        
        if (fieldErrors.length > 0) {
          return NextResponse.json(
            { 
              error: 'Invalid fields requested',
              code: 'INVALID_FIELDS',
              fieldErrors: fieldErrors,
              validFields: Object.keys(VALID_FIELDS)
            },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { 
          error: data.error?.message || 'Failed to fetch place details',
          code: data.error?.code || 'UNKNOWN_ERROR'
        },
        { status: response.status || 400 }
      );
    }

    // Transform the response to match our expected format
    const transformedData = {
      // Core info
      placeId: data.id || placeId,
      name: data.displayName?.text || '',
      languageCode: data.displayName?.languageCode || 'en',
      
      // Location
      formattedAddress: data.formattedAddress || '',
      location: data.location,
      plusCode: data.plusCode,
      
      // Contact
      nationalPhoneNumber: data.nationalPhoneNumber,
      internationalPhoneNumber: data.internationalPhoneNumber,
      websiteUri: data.websiteUri,
      
      // Business info
      businessStatus: data.businessStatus,
      primaryType: data.primaryType,
      googleMapsUri: data.googleMapsUri,
      
      // Reviews and ratings
      rating: data.rating,
      userRatingCount: data.userRatingCount, // Correct field name!
      reviews: (data.reviews || []).map((review: any) => ({
        reviewId: review.name?.split('/').pop() || Date.now().toString(),
        reviewer: {
          displayName: review.authorAttribution?.displayName,
          profilePhotoUrl: review.authorAttribution?.photoUri,
          isAnonymous: false,
        },
        rating: review.rating,
        starRating: convertRatingToStarRating(review.rating),
        comment: review.text?.text,
        createTime: review.publishTime,
        updateTime: review.publishTime,
        relativeTimeDescription: review.relativePublishTimeDescription,
        language: review.text?.languageCode,
      })),
      
      // Photos
      photos: (data.photos || []).map((photo: any) => ({
        name: photo.name,
        mediaUrl: `/api/places/photo?name=${encodeURIComponent(photo.name)}&maxWidthPx=1200`,
        thumbnailUrl: `/api/places/photo?name=${encodeURIComponent(photo.name)}&maxWidthPx=400`,
        description: photo.authorAttributions?.[0]?.displayName || '',
        widthPx: photo.widthPx,
        heightPx: photo.heightPx,
      })),
      
      // Additional info
      editorialSummary: data.editorialSummary?.text,
      regularOpeningHours: data.regularOpeningHours,
      currentOpeningHours: data.currentOpeningHours,
      priceLevel: data.priceLevel,
      
      // Service options
      delivery: data.delivery,
      dineIn: data.dineIn,
      curbsidePickup: data.curbsidePickup,
      reservable: data.reservable,
      servesBreakfast: data.servesBreakfast,
      servesLunch: data.servesLunch,
      servesDinner: data.servesDinner,
      servesBeer: data.servesBeer,
      servesWine: data.servesWine,
      takeout: data.takeout,
    };

    logger.info('Successfully fetched place details', {
      metadata: { 
        placeId,
        name: transformedData.name,
        reviewsCount: transformedData.reviews.length,
        photosCount: transformedData.photos.length,
        rating: transformedData.rating,
        totalRatings: transformedData.userRatingCount,
      }
    });

    return NextResponse.json(transformedData);

  } catch (error) {
    logger.error('Error fetching place details', {
      metadata: { error: error.message }
    });

    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}

// Helper function to convert numeric rating to star rating enum
function convertRatingToStarRating(rating: number): string {
  if (rating >= 4.5) return 'FIVE';
  if (rating >= 3.5) return 'FOUR';
  if (rating >= 2.5) return 'THREE';
  if (rating >= 1.5) return 'TWO';
  return 'ONE';
}
