import { NextRequest } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const photoName = searchParams.get('name');
    const maxWidthPx = searchParams.get('maxWidthPx') || '400';

    if (!photoName) {
      return NextResponse.json(
        { error: 'Photo name is required' },
        { status: 400 }
      );
    }

    logger.info('Fetching photo from Places API', {
      metadata: { 
        userId: session.user.id, 
        photoName,
        maxWidthPx 
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

    // Use the new Places API (v1) photo media endpoint
    const url = `https://places.googleapis.com/v1/${photoName}/media?` +
      `maxWidthPx=${maxWidthPx}&` +
      `key=${apiKey}`;

    const response = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,
      }
    });

    if (!response.ok) {
      logger.error('Places API photo fetch error', {
        metadata: { 
          status: response.status,
          statusText: response.statusText,
          photoName 
        }
      });

      return NextResponse.json(
        { 
          error: 'Failed to fetch photo',
          status: response.status 
        },
        { status: response.status }
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image directly
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    logger.error('Error fetching place photo', {
      metadata: { error: error.message }
    });

    return NextResponse.json(
      { error: 'Failed to fetch photo' },
      { status: 500 }
    );
  }
}