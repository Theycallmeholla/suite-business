import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership and get GBP location ID
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: session.user.id,
      },
      select: {
        id: true,
        gbpLocationId: true,
        businessName: true,
      },
    });

    if (!site || !site.gbpLocationId) {
      return NextResponse.json(
        { error: 'Site not found or not linked to Google Business Profile' },
        { status: 404 }
      );
    }

    logger.info('Importing photos from GBP', {
      metadata: {
      siteId,
      userId: session.user.id,
      gbpLocationId: site.gbpLocationId,
    }
    });

    // Fetch photos from GBP
    const photosResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/gbp/location/${site.gbpLocationId}/photos?pageSize=20`,
      {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      }
    );

    if (!photosResponse.ok) {
      throw new Error('Failed to fetch photos from Google Business Profile');
    }

    const { photos } = await photosResponse.json();

    // Delete existing photos to avoid duplicates
    await prisma.photo.deleteMany({
      where: { siteId },
    });

    // Import photos
    const importedPhotos = await Promise.all(
      photos.map(async (photo: any, index: number) => {
        // Determine category based on index and type
        let category = 'gallery';
        if (index === 0) category = 'hero'; // First photo as hero
        if (photo.locationAssociation?.category === 'COVER') category = 'hero';
        if (photo.locationAssociation?.category === 'PROFILE') category = 'profile';
        
        return prisma.photo.create({
          data: {
            siteId,
            url: photo.googleUrl,
            thumbnailUrl: photo.thumbnailUrl,
            caption: photo.description?.description || null,
            altText: photo.description?.description || `${site.businessName} photo ${index + 1}`,
            category,
            googlePhotoName: photo.name,
            order: index,
            featured: index < 3, // Feature first 3 photos
          },
        });
      })
    );

    logger.info('Photos imported successfully', {
      metadata: {
      siteId,
      photosCount: importedPhotos.length,
    }
    });

    // Update site to mark last sync
    await prisma.site.update({
      where: { id: siteId },
      data: {
        gbpLastSync: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      imported: importedPhotos.length,
      photos: importedPhotos,
    });

  } catch (error) {
    logger.error('Error importing photos', {
      metadata: { error, siteId: siteId }
    });
    return NextResponse.json(
      { error: 'Failed to import photos' },
      { status: 500 }
    );
  }
}
