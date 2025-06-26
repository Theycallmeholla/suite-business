import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Cache autocomplete results for better performance
const autocompleteCache = new Map<string, { results: any[], timestamp: number }>();
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute (shorter for autocomplete)

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { input, sessionToken } = await request.json();
    
    if (!input || input.length < 2) {
      return NextResponse.json(
        { error: 'Input must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${input.toLowerCase()}-${sessionToken || 'no-session'}`;
    const cached = autocompleteCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ 
        predictions: cached.results, 
        cached: true 
      });
    }

    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      logger.warn('Google Maps API key not configured', { action: 'autocomplete_no_api_key' });
      // Return mock data for development
      return NextResponse.json({
        predictions: [
          {
            place_id: 'mock-place-1',
            description: 'ABC Landscaping - Austin, TX, USA',
            structured_formatting: {
              main_text: 'ABC Landscaping',
              secondary_text: 'Austin, TX, USA',
              main_text_matched_substrings: [{ offset: 0, length: input.length }]
            },
            types: ['establishment', 'point_of_interest']
          },
          {
            place_id: 'mock-place-2',
            description: 'ABC Lawn Care & Landscaping - Round Rock, TX, USA',
            structured_formatting: {
              main_text: 'ABC Lawn Care & Landscaping',
              secondary_text: 'Round Rock, TX, USA',
              main_text_matched_substrings: [{ offset: 0, length: input.length }]
            },
            types: ['establishment', 'point_of_interest']
          },
          {
            place_id: 'mock-place-3',
            description: 'ABC Home Services - Austin, TX, USA',
            structured_formatting: {
              main_text: 'ABC Home Services',
              secondary_text: 'Austin, TX, USA',
              main_text_matched_substrings: [{ offset: 0, length: input.length }]
            },
            types: ['establishment', 'point_of_interest']
          }
        ].filter(p => 
          p.structured_formatting.main_text.toLowerCase().includes(input.toLowerCase())
        ),
        mock: true
      });
    }

    // Build autocomplete request
    const params = new URLSearchParams({
      input: input,
      key: GOOGLE_MAPS_API_KEY,
      types: 'establishment',
      language: 'en',
    });

    // Only limit to US if the search doesn't include location context
    // This allows searching for "ABC Company New York" even if user is in California
    const hasLocationContext = /\b(city|state|street|avenue|road|blvd|st|ave|rd|drive|dr|court|ct|place|pl|lane|ln|way|circle|cir|square|sq|park|pkwy|highway|hwy|route|rt|interstate|county|district|neighborhood|downtown|uptown|midtown|north|south|east|west|ne|nw|se|sw|bay area|valley|beach|coast|port|harbor|airport|station|center|centre|plaza|mall|market|village|town|boro|borough)\b/i.test(input) ||
                              /\b\d{5}\b/.test(input) || // ZIP code
                              /,/.test(input); // Has comma (like "Business Name, City")
    
    if (!hasLocationContext) {
      // Only apply country restriction if no location context
      params.append('components', 'country:us');
    }

    // Add session token if provided (for billing optimization)
    if (sessionToken) {
      params.append('sessiontoken', sessionToken);
    }

    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;
    
    logger.debug('Calling Places Autocomplete API', {
      metadata: { 
      action: 'places_autocomplete',
      input: input.substring(0, 20) // Log only first 20 chars
    }
    });

    const response = await fetch(autocompleteUrl);
    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      logger.error('Places Autocomplete API request denied', {
      metadata: { 
        action: 'autocomplete_denied',
        error_message: data.error_message 
      }
    });
      return NextResponse.json(
        { error: 'Autocomplete service configuration error', details: data.error_message },
        { status: 500 }
      );
    }

    if (data.status === 'OVER_QUERY_LIMIT') {
      logger.warn('Places Autocomplete API quota exceeded', { action: 'autocomplete_quota' });
      return NextResponse.json(
        { error: 'Autocomplete quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      logger.error('Places Autocomplete API error', {
      metadata: { 
        action: 'autocomplete_error',
        status: data.status 
      }
    });
      return NextResponse.json(
        { error: 'Autocomplete failed', status: data.status },
        { status: 500 }
      );
    }

    // Filter and format predictions for businesses
    const predictions = (data.predictions || [])
      .filter((prediction: any) => {
        // Only include establishments/businesses
        return prediction.types.some((type: string) => 
          ['establishment', 'point_of_interest', 'store'].includes(type)
        );
      })
      .slice(0, 5) // Limit to 5 suggestions
      .map((prediction: any) => ({
        place_id: prediction.place_id,
        description: prediction.description,
        structured_formatting: prediction.structured_formatting,
        types: prediction.types,
        // Add confidence based on matching
        confidence: prediction.structured_formatting.main_text_matched_substrings?.[0]?.length 
          ? 'high' : 'medium'
      }));

    // Cache the results
    autocompleteCache.set(cacheKey, { 
      results: predictions, 
      timestamp: Date.now() 
    });

    // Clean old cache entries
    if (autocompleteCache.size > 500) {
      const now = Date.now();
      for (const [key, value] of autocompleteCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          autocompleteCache.delete(key);
        }
      }
    }

    logger.info('Places autocomplete completed', {
      metadata: { 
      action: 'autocomplete_success',
      input: input.substring(0, 20),
      resultCount: predictions.length 
    }
    });

    return NextResponse.json({ 
      predictions,
      sessionToken 
    });

  } catch (error) {
    logger.error('Autocomplete error', {
      metadata: { 
      action: 'autocomplete_error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
    });
    return NextResponse.json(
      { error: 'Autocomplete failed' },
      { status: 500 }
    );
  }
}