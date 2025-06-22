import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { z } from 'zod';

const updateContentSchema = z.object({
  pageId: z.string(),
  sections: z.array(z.any()), // We'll validate sections structure later
});

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pageId, sections } = updateContentSchema.parse(body);

    // Verify page ownership through site
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          userId: session.user.id,
        },
      },
      include: {
        site: true,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update page content
    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        content: {
          sections,
        },
        updatedAt: new Date(),
      },
    });

    logger.info('Page content updated', {
      pageId: page.id,
      siteId: page.site.id,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      page: updatedPage,
    });
  } catch (error) {
    logger.error('Failed to update page content', { error });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    if (!pageId) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      );
    }

    // Get page with ownership check
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          userId: session.user.id,
        },
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      page,
    });
  } catch (error) {
    logger.error('Failed to get page content', { error });
    
    return NextResponse.json(
      { error: 'Failed to get content' },
      { status: 500 }
    );
  }
}
