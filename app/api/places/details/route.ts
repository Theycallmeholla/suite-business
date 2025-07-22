import { NextRequest } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

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
    const { placeId, fields = 'reviews,photos,rating,userRatingsTotal,editorialSummary,reviews.summary' } = body;

    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      );
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

    // Use the new Places API (v1) endpoint
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?` +
      `fields=${encodeURIComponent(fields)}&` +
      `key=${apiKey}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      }
    });
    const data = await response.json() as unknown;

    if (data.error) {
      logger.error('Places API error', {
        metadata: { 
          error: data.error,
          placeId 
        }
      });

      return NextResponse.json(
        { 
          error: data.error.message || 'Failed to fetch place details',
          status: data.error.status 
        },
        { status: 400 }
      );
    }

    // Transform the response to match our expected format
    const transformedData = {
      placeId,
      reviews: data.reviews?.map((review: any) => ({
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
      })) || [],
      photos: data.photos?.map((photo: any) => ({
        name: photo.name,
        mediaUrl: `/api/places/photo?name=${encodeURIComponent(photo.name)}&maxWidthPx=1200`,
        thumbnailUrl: `/api/places/photo?name=${encodeURIComponent(photo.name)}&maxWidthPx=400`,
        description: photo.authorAttributions?.[0]?.displayName || '',
        widthPx: photo.widthPx,
        heightPx: photo.heightPx,
      })) || [],
      rating: data.rating,
      userRatingsTotal: data.userRatingsTotal,
      editorialSummary: data.editorialSummary?.text,
      reviewSummary: data.reviews?.summary?.text, // AI-powered review summary
    };

    logger.info('Successfully fetched place details', {
      metadata: { 
        placeId,
        reviewsCount: transformedData.reviews.length,
        photosCount: transformedData.photos.length,
        rating: transformedData.rating,
        totalRatings: transformedData.userRatingsTotal,
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