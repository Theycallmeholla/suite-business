import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Cache search results to reduce API costs
const searchCache = new Map<string, { results: any[], timestamp: number }>();
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

    const { query, location } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${query}-${location || 'none'}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.debug('Returning cached search results', {
      metadata: { 
        action: 'search_cache_hit',
        query,
        resultCount: cached.results.length 
      }
    });
      return NextResponse.json({ results: cached.results, cached: true });
    }

    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      logger.warn('Google Maps API key not configured', { action: 'search_no_api_key' });
      // Return mock data for development
      return NextResponse.json({
        results: [
          {
            id: 'mock-1',
            name: 'Example Landscaping Co.',
            address: '123 Main St, Austin, TX 78701',
            phone: '(512) 555-0123',
            types: ['landscaper', 'lawn_care_service'],
            verified: true,
            rating: 4.5,
            user_ratings_total: 127,
            website: 'https://example-landscaping.com',
            place_id: 'mock-place-1',
          },
          {
            id: 'mock-2',
            name: 'Green Thumb Landscaping',
            address: '456 Oak Ave, Austin, TX 78702',
            phone: '(512) 555-0456',
            types: ['landscaper'],
            verified: false,
            rating: 4.8,
            user_ratings_total: 89,
            place_id: 'mock-place-2',
          },
        ],
        mock: true,
      });
    }

    // Use the newer Places API (Text Search) for better results and field control
    const searchParams = new URLSearchParams({
      query: query,
      key: GOOGLE_MAPS_API_KEY,
      language: 'en',
      region: 'us',
    });

    // Add location bias if provided
    if (location) {
      searchParams.append('location', location);
      searchParams.append('radius', '50000'); // 50km radius
    }

    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?${searchParams.toString()}`;
    
    logger.debug('Searching Google Places API', {
      metadata: { 
      action: 'places_api_search',
      query,
      location 
    }
    });

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      logger.error('Places API request denied', {
      metadata: { 
        action: 'places_api_denied',
        error_message: data.error_message 
      }
    });
      return NextResponse.json(
        { error: 'Search service configuration error', details: data.error_message },
        { status: 500 }
      );
    }

    if (data.status === 'OVER_QUERY_LIMIT') {
      logger.warn('Places API quota exceeded', { action: 'places_api_quota' });
      return NextResponse.json(
        { error: 'Search quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      logger.error('Places API error', {
      metadata: { 
        action: 'places_api_error',
        status: data.status 
      }
    });
      return NextResponse.json(
        { error: 'Search failed', status: data.status },
        { status: 500 }
      );
    }

    // Transform Places API results to our format
    const results = (data.results || []).slice(0, 10).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number || null,
      types: place.types || [],
      verified: place.business_status === 'OPERATIONAL',
      rating: place.rating || null,
      user_ratings_total: place.user_ratings_total || 0,
      website: place.website || null,
      place_id: place.place_id,
      location: place.geometry?.location || null,
      // Detect if this is likely their business based on exact name match
      confidence: query.toLowerCase() === place.name.toLowerCase() ? 'high' : 'medium',
    }));

    // Cache the results
    searchCache.set(cacheKey, { results, timestamp: Date.now() });

    // Clean old cache entries
    if (searchCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of searchCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          searchCache.delete(key);
        }
      }
    }

    logger.info('Places search completed', {
      metadata: { 
      action: 'search_success',
      query,
      resultCount: results.length 
    }
    });

    return NextResponse.json({ results });

  } catch (error) {
    logger.error('Search error', {
      metadata: { 
      action: 'search_error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
    });
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
