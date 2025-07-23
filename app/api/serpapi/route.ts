// app/api/serpapi/route.ts

import { NextResponse } from 'next/server';
import { searchGooglePlaces, searchDataForSEOSerp } from '@/lib/serpapi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const googlePlacesResults = await searchGooglePlaces(query);
    const dataForSEOResults = await searchDataForSEOSerp(query);

    return NextResponse.json({
      googlePlaces: googlePlacesResults,
      dataForSEO: dataForSEOResults,
    });
  } catch (error: any) {
    console.error('Error in SerpAPI endpoint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}