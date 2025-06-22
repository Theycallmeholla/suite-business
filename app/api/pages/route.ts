import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { z } from 'zod';

const createPageSchema = z.object({
  siteId: z.string(),
  type: z.string(),
  slug: z.string(),
  title: z.string(),
  content: z.any(),
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
    const { siteId, type, slug, title, content } = createPageSchema.parse(body);

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: session.user.id,
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if page already exists
    const existingPage = await prisma.page.findUnique({
      where: {
        siteId_slug: {
          siteId,
          slug,
        },
      },
    });

    if (existingPage) {
      return NextResponse.json({
        page: existingPage,
      });
    }

    // Create new page
    const page = await prisma.page.create({
      data: {
        siteId,
        type,
        slug,
        title,
        content,
      },
    });

    logger.info('Page created', {
      pageId: page.id,
      siteId,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      page,
    });
  } catch (error) {
    logger.error('Failed to create page', { error });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}
