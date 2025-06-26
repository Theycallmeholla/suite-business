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

    // Check if already published
    if (site.published) {
      return NextResponse.json(
        { error: 'Site is already published' },
        { status: 400 }
      );
    }

    // Update site to published with timestamp
    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: {
        published: true,
        publishedAt: new Date(),
      },
    });

    logger.info('Site published', {
      metadata: {
      siteId,
      userId: session.user.id,
      subdomain: site.subdomain,
      publishedAt: updatedSite.publishedAt,
    }
    });

    // In a real app, you might:
    // - Clear CDN cache
    // - Generate static pages
    // - Send notification email
    // - Update sitemap
    // - Trigger webhooks

    return NextResponse.json({
      success: true,
      site: updatedSite,
      liveUrl: `http://${site.subdomain}.localhost:3000`,
    });

  } catch (error) {
    logger.error('Error publishing site', {
      metadata: { error, siteId: siteId }
    });
    return NextResponse.json(
      { error: 'Failed to publish site' },
      { status: 500 }
    );
  }
}
