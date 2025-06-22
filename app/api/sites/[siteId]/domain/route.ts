import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
  { params }: { params: { siteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
        NOT: { id: params.siteId }
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
        id: params.siteId,
        user: { email: session.user.email }
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Update site with custom domain
    const updatedSite = await prisma.site.update({
      where: { id: params.siteId },
      data: { customDomain: domain }
    });

    logger.info('Custom domain updated', {
      action: 'update_custom_domain',
      siteId: params.siteId,
      domain,
      userId: session.user.email
    });

    return NextResponse.json({ 
      success: true,
      domain: updatedSite.customDomain
    });
  } catch (error) {
    logger.error('Failed to update custom domain', {
      action: 'update_custom_domain',
      siteId: params.siteId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Failed to update domain' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: {
        id: params.siteId,
        user: { email: session.user.email }
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Remove custom domain
    await prisma.site.update({
      where: { id: params.siteId },
      data: { customDomain: null }
    });

    logger.info('Custom domain removed', {
      action: 'remove_custom_domain',
      siteId: params.siteId,
      userId: session.user.email
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to remove custom domain', {
      action: 'remove_custom_domain',
      siteId: params.siteId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Failed to remove domain' },
      { status: 500 }
    );
  }
}