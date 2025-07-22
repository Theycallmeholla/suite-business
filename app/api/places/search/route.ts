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
    const { 
      textQuery, 
      locationBias,
      includedType,
      maxResultCount = 10,
      languageCode = 'en'
    } = body;

    if (!textQuery) {
      return NextResponse.json(
        { error: 'Text query is required' },
        { status: 400 }
      );
    }

    logger.info('Searching places with Places API', {
      metadata: { 
        userId: session.user.id, 
        textQuery,
        locationBias,
        includedType
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

    // Use the new Places API (v1) text search endpoint
    const url = 'https://places.googleapis.com/v1/places:searchText';

    const searchBody: any = {
      textQuery,
      maxResultCount,
      languageCode,
    };

    // Add location bias if provided
    if (locationBias) {
      searchBody.locationBias = locationBias;
    }

    // Add place type filter if provided
    if (includedType) {
      searchBody.includedType = includedType;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.primaryType,places.location,places.rating,places.userRatingCount,places.businessStatus,places.googleMapsUri',
      },
      body: JSON.stringify(searchBody),
    });
    
    const data = await response.json() as unknown;

    if (!response.ok) {
      logger.error('Places API search error', {
        metadata: { 
          error: data.error,
          textQuery,
          status: response.status 
        }
      });

      return NextResponse.json(
        { 
          error: data.error?.message || 'Failed to search places',
          code: data.error?.code || 'UNKNOWN_ERROR'
        },
        { status: response.status || 400 }
      );
    }

    // Transform the response to a simpler format
    const transformedResults = (data.places || []).map((place: any) => ({
      placeId: place.id,
      name: place.displayName?.text || '',
      formattedAddress: place.formattedAddress || '',
      primaryType: place.primaryType || '',
      location: place.location,
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      businessStatus: place.businessStatus,
      googleMapsUri: place.googleMapsUri,
    }));

    logger.info('Successfully searched places', {
      metadata: { 
        textQuery,
        resultsCount: transformedResults.length,
      }
    });

    return NextResponse.json({
      places: transformedResults,
      totalResults: transformedResults.length,
    });

  } catch (error) {
    logger.error('Error searching places', {
      metadata: { error: error.message }
    });

    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    );
  }
}
