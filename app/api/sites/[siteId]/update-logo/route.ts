import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { unlink } from 'fs/promises';
import path from 'path';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId } = await params;
    const { logo } = await request.json();

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: session.user.id,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // If removing logo, delete the old file
    if (logo === null && site.logo) {
      try {
        const oldLogoPath = path.join(process.cwd(), 'public', site.logo);
        await unlink(oldLogoPath);
        logger.info('Deleted old logo file', {
      metadata: { path: oldLogoPath }
    });
      } catch (error) {
        // File might not exist, which is fine
        logger.warn('Could not delete old logo file', {
      metadata: { error }
    });
      }
    }

    // Update the site
    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: { logo },
    });

    logger.info('Site logo updated', {
      metadata: { 
      siteId, 
      oldLogo: site.logo,
      newLogo: logo 
    }
    });

    return NextResponse.json({ 
      success: true, 
      logo: updatedSite.logo 
    });
  } catch (error) {
    logger.error('Update logo error:', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to update logo' },
      { status: 500 }
    );
  }
}
