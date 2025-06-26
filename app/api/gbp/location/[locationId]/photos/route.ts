import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getUserGoogleBusinessAccess } from '@/lib/google-business-profile';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { locationId } = await params;
    const pageSize = request.nextUrl.searchParams.get('pageSize') || '10';
    const pageToken = request.nextUrl.searchParams.get('pageToken');

    logger.info('Fetching GBP location photos', {
      metadata: { 
      userId: session.user.id, 
      locationId,
      pageSize 
    }
    });

    const gbpAccess = await getUserGoogleBusinessAccess(session.user.id);
    
    if (!gbpAccess.success || !gbpAccess.client) {
      return NextResponse.json(
        { error: gbpAccess.error },
        { status: gbpAccess.requiresAuth ? 401 : 403 }
      );
    }

    const { client } = gbpAccess;

    // Get location photos
    const response = await client.get(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}/media`,
      {
        params: {
          pageSize,
          ...(pageToken && { pageToken }),
        }
      }
    );

    const photos = response.data.mediaItems || [];
    
    // Transform photos to a simpler format
    const transformedPhotos = photos.map((photo: any) => ({
      name: photo.name,
      mediaFormat: photo.mediaFormat,
      googleUrl: photo.googleUrl,
      thumbnailUrl: photo.thumbnailUrl,
      description: photo.description,
      locationAssociation: photo.locationAssociation,
      createTime: photo.createTime,
      dimensions: photo.dimensions,
      insights: photo.insights,
      attributions: photo.attributions,
      dataRef: photo.dataRef,
    }));

    logger.info('Successfully fetched GBP photos', {
      metadata: { 
      locationId,
      photosCount: transformedPhotos.length,
      hasNextPage: !!response.data.nextPageToken
    }
    });

    return NextResponse.json({
      photos: transformedPhotos,
      nextPageToken: response.data.nextPageToken,
      totalSize: response.data.totalSize,
    });

  } catch (error: any) {
    logger.error('Error fetching GBP photos', {
      metadata: { 
      error: error.message,
      locationId: (await params).locationId 
    }
    });

    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Permission denied. You may not have access to this location.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
