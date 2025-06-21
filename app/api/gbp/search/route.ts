import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // For now, we'll use Google Places API Text Search
    // In production, you'd want to use the Google Maps API key from env
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not configured');
      // Return mock data for development
      return NextResponse.json({
        results: [
          {
            id: 'mock-1',
            name: 'Example Landscaping Co.',
            address: '123 Main St, Austin, TX 78701',
            verified: true,
          },
          {
            id: 'mock-2',
            name: 'Green Thumb Landscaping',
            address: '456 Oak Ave, Austin, TX 78702',
            verified: false,
          },
        ],
      });
    }

    // Search using Google Places Text Search API
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data.status);
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }

    // Transform Places API results to our format
    const results = (data.results || []).slice(0, 5).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      verified: place.business_status === 'OPERATIONAL',
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
    }));

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
