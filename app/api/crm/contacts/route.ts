// app/api/crm/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { createGHLCRMClient } from '@/lib/ghl-crm';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get('siteId');
    const search = searchParams.get('search') || undefined;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Get site with GHL credentials
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: session.user.id,
      },
      select: {
        id: true,
        ghlApiKey: true,
        ghlLocationId: true,
        ghlEnabled: true,
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    if (!site.ghlEnabled) {
      return NextResponse.json(
        { error: 'GoHighLevel integration is not enabled for this site' },
        { status: 400 }
      );
    }

    const crmClient = createGHLCRMClient(site);
    
    const contacts = await crmClient.getContacts({
      search,
      tags,
      limit,
      offset,
    });

    return NextResponse.json({
      contacts,
      total: contacts.length,
      limit,
      offset,
    });

  } catch (error) {
    logger.error('Failed to fetch contacts:', error);
    
    // Check if it's a configuration error
    if (error instanceof Error) {
      if (error.message.includes('GHL_API_KEY') || error.message.includes('example GHL API key')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

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
    const { siteId, ...contactData } = body;

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Get site with GHL credentials
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: session.user.id,
      },
      select: {
        id: true,
        ghlApiKey: true,
        ghlLocationId: true,
        ghlEnabled: true,
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    if (!site.ghlEnabled) {
      return NextResponse.json(
        { error: 'GoHighLevel integration is not enabled for this site' },
        { status: 400 }
      );
    }

    const crmClient = createGHLCRMClient(site);
    
    const contact = await crmClient.createContact(contactData);

    return NextResponse.json({ contact });

  } catch (error) {
    logger.error('Failed to create contact:', error);
    
    // Check if it's a configuration error
    if (error instanceof Error) {
      if (error.message.includes('GHL_API_KEY') || error.message.includes('example GHL API key')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
