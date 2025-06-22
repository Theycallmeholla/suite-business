import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Cache place details to reduce API costs
const detailsCache = new Map<string, { details: any, timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { placeId } = await request.json();
    
    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = detailsCache.get(placeId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.debug('Returning cached place details', { 
        action: 'details_cache_hit',
        placeId 
      });
      return NextResponse.json({ details: cached.details, cached: true });
    }

    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      logger.warn('Google Maps API key not configured', { action: 'details_no_api_key' });
      // Return mock data for development
      return NextResponse.json({
        details: {
          place_id: placeId,
          name: 'Example Business',
          formatted_address: '123 Main St, Austin, TX 78701',
          formatted_phone_number: '(512) 555-0123',
          website: 'https://example.com',
          opening_hours: {
            weekday_text: [
              'Monday: 9:00 AM – 5:00 PM',
              'Tuesday: 9:00 AM – 5:00 PM',
              'Wednesday: 9:00 AM – 5:00 PM',
              'Thursday: 9:00 AM – 5:00 PM',
              'Friday: 9:00 AM – 5:00 PM',
              'Saturday: Closed',
              'Sunday: Closed',
            ],
            periods: []
          },
          types: ['landscaper', 'lawn_care_service'],
          business_status: 'OPERATIONAL',
          rating: 4.5,
          user_ratings_total: 127,
        },
        mock: true,
      });
    }

    // Fetch place details from Google Places API
    // Using specific fields to control costs
    const fields = [
      'place_id',
      'name',
      'formatted_address',
      'formatted_phone_number',
      'international_phone_number',
      'website',
      'opening_hours',
      'business_status',
      'types',
      'rating',
      'user_ratings_total',
      'geometry/location',
      'address_components',
      'photos',
      'reviews',
      'price_level',
      'vicinity',
    ].join(',');

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${encodeURIComponent(placeId)}` +
      `&fields=${encodeURIComponent(fields)}` +
      `&key=${GOOGLE_MAPS_API_KEY}`;
    
    logger.debug('Fetching place details from Google', { 
      action: 'places_api_details',
      placeId 
    });

    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      logger.error('Places API request denied', { 
        action: 'places_api_denied',
        error_message: data.error_message 
      });
      return NextResponse.json(
        { error: 'Search service configuration error', details: data.error_message },
        { status: 500 }
      );
    }

    if (data.status === 'OVER_QUERY_LIMIT') {
      logger.warn('Places API quota exceeded', { action: 'places_api_quota' });
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (data.status !== 'OK') {
      logger.error('Places API error', { 
        action: 'places_api_error',
        status: data.status 
      });
      return NextResponse.json(
        { error: 'Failed to fetch place details', status: data.status },
        { status: 500 }
      );
    }

    const place = data.result;
    
    // Transform the data to our format
    const details = {
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
      formatted_phone_number: place.formatted_phone_number,
      international_phone_number: place.international_phone_number,
      website: place.website,
      opening_hours: place.opening_hours,
      business_status: place.business_status,
      types: place.types || [],
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      vicinity: place.vicinity,
      location: place.geometry?.location,
      address_components: place.address_components || [],
      photos: place.photos?.slice(0, 5).map((photo: any) => ({
        photo_reference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
        attributions: photo.html_attributions,
      })) || [],
      reviews: place.reviews?.slice(0, 5).map((review: any) => ({
        author_name: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time,
        relative_time_description: review.relative_time_description,
      })) || [],
    };

    // Extract structured address components
    const addressComponents = place.address_components || [];
    details.structured_address = {
      street_number: addressComponents.find((c: any) => c.types.includes('street_number'))?.long_name || '',
      street_name: addressComponents.find((c: any) => c.types.includes('route'))?.long_name || '',
      city: addressComponents.find((c: any) => c.types.includes('locality'))?.long_name || '',
      state: addressComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '',
      zip: addressComponents.find((c: any) => c.types.includes('postal_code'))?.long_name || '',
      country: addressComponents.find((c: any) => c.types.includes('country'))?.short_name || '',
    };

    // Cache the results
    detailsCache.set(placeId, { details, timestamp: Date.now() });

    // Clean old cache entries
    if (detailsCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of detailsCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          detailsCache.delete(key);
        }
      }
    }

    logger.info('Place details fetched successfully', { 
      action: 'details_success',
      placeId,
      hasWebsite: !!details.website,
      hasPhone: !!details.formatted_phone_number,
      photosCount: details.photos.length,
      reviewsCount: details.reviews.length,
    });

    return NextResponse.json({ details });

  } catch (error) {
    logger.error('Place details error', { 
      action: 'details_error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}