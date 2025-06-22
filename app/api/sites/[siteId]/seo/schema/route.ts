import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { schemaType, priceRange, servesArea, acceptsReservations, menuUrl } = body;

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: {
        id: params.siteId,
        userId: session.user.id,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Update site with schema settings
    const updatedSite = await prisma.site.update({
      where: { id: params.siteId },
      data: {
        schemaType,
        priceRange,
        servesArea,
        acceptsReservations,
        menuUrl,
      },
    });

    logger.info('Schema settings updated', { 
      siteId: params.siteId, 
      userId: session.user.id 
    });

    return NextResponse.json({ 
      success: true, 
      site: updatedSite 
    });
  } catch (error) {
    logger.error('Failed to update schema settings', error);
    return NextResponse.json(
      { error: 'Failed to update schema settings' },
      { status: 500 }
    );
  }
}