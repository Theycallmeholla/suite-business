import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const updateSchema = z.object({
  enabled: z.boolean(),
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
    const { enabled } = updateSchema.parse(body);

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

    // Can only enable/disable if GHL is set up
    if (!site.ghlLocationId && enabled) {
      return NextResponse.json(
        { error: 'GoHighLevel is not set up for this site' },
        { status: 400 }
      );
    }

    // Update GHL status
    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: { ghlEnabled: enabled },
    });

    logger.info('Updated GHL status', {
      siteId,
      ghlEnabled: enabled,
    });

    return NextResponse.json({
      ghlEnabled: updatedSite.ghlEnabled,
    });

  } catch (error) {
    logger.error('Update GHL status error', { error });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update GoHighLevel status' },
      { status: 500 }
    );
  }
}
