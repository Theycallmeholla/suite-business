import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// GET /api/forms - Get all forms for the user's sites or public forms for a site
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const type = searchParams.get('type');
    const enabled = searchParams.get('enabled');

    // If requesting forms for a specific site, allow public access
    if (siteId && enabled === 'true') {
      const where: any = { siteId, enabled: true };
      if (type) where.type = type;

      const forms = await prisma.form.findMany({
        where,
        select: {
          id: true,
          name: true,
          type: true,
          fields: true,
          settings: true,
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(forms);
    }

    // Otherwise, require authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const where = siteId 
      ? { siteId, site: { userId: session.user.id } }
      : { site: { userId: session.user.id } };

    const forms = await prisma.form.findMany({
      where,
      include: {
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(forms);
  } catch (error) {
    logger.error('Failed to fetch forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}

// POST /api/forms - Create a new form
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { siteId, name, type, fields, settings } = body;

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: session.user.id
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Create the form
    const form = await prisma.form.create({
      data: {
        siteId,
        name,
        type,
        fields,
        settings,
      },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    logger.info(`Form created: ${form.id} for site ${siteId}`);

    return NextResponse.json({
      id: form.id,
      name: form.name,
      type: form.type,
      enabled: form.enabled,
      createdAt: form.createdAt,
      submissionsCount: form._count.submissions
    });
  } catch (error) {
    logger.error('Failed to create form:', error);
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    );
  }
}
