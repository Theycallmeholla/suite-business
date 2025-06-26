import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const domainSchema = z.object({
  domain: z.string()
    .toLowerCase()
    .regex(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/, 'Invalid domain format')
    .transform(val => val.replace(/^www\./, '')) // Remove www prefix
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { siteId } = await params;

    const body = await request.json();
    const validation = domainSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { domain } = validation.data;

    // Check if domain is already in use
    const existingDomain = await prisma.site.findFirst({
      where: {
        customDomain: domain,
        NOT: { id: siteId }
      }
    });

    if (existingDomain) {
      return NextResponse.json(
        { error: 'Domain is already in use' },
        { status: 400 }
      );
    }

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        user: { email: session.user.email }
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Update site with custom domain
    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: { customDomain: domain }
    });

    logger.info('Custom domain updated', {
      metadata: {
      action: 'update_custom_domain',
      siteId,
      domain,
      userId: session.user.email
    }
    });

    return NextResponse.json({ 
      success: true,
      domain: updatedSite.customDomain
    });
  } catch (error) {
    const { siteId } = await params;
    logger.error('Failed to update custom domain', {
      metadata: {
      action: 'update_custom_domain',
      siteId,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    });

    return NextResponse.json(
      { error: 'Failed to update domain' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { siteId } = await params;

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        user: { email: session.user.email }
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Remove custom domain
    await prisma.site.update({
      where: { id: siteId },
      data: { customDomain: null }
    });

    logger.info('Custom domain removed', {
      metadata: {
      action: 'remove_custom_domain',
      siteId,
      userId: session.user.email
    }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { siteId } = await params;
    logger.error('Failed to remove custom domain', {
      metadata: {
      action: 'remove_custom_domain',
      siteId,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    });

    return NextResponse.json(
      { error: 'Failed to remove domain' },
      { status: 500 }
    );
  }
}