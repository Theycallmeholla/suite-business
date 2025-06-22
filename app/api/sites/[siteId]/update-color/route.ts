import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const updateColorSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { siteId } = params;
    const body = await request.json();
    const { primaryColor } = updateColorSchema.parse(body);

    // Verify ownership
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: session.user.id,
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Update primary color
    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: { primaryColor },
    });

    logger.info('Site color updated', {
      siteId,
      userId: session.user.id,
      oldColor: site.primaryColor,
      newColor: primaryColor,
    });

    return NextResponse.json({
      success: true,
      site: updatedSite,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid color format', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Error updating site color', { error, siteId: params.siteId });
    return NextResponse.json(
      { error: 'Failed to update color' },
      { status: 500 }
    );
  }
}
