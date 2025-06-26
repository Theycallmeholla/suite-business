// app/api/crm/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { createGHLCRMClient } from '@/lib/ghl-crm';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createContactSchema = z.object({
  siteId: z.string().min(1, 'Site ID is required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.any().optional(),
});

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
    const source = searchParams.get('source'); // 'database' or 'ghl'

    // If no siteId, return all database contacts for the user
    if (!siteId) {
      const contacts = await prisma.contact.findMany({
        where: {
          site: {
            userId: session.user.id
          }
        },
        include: {
          site: {
            select: {
              businessName: true,
              id: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({ contacts });
    }

    // If siteId is provided, check if we should get from database or GHL
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

    // Default to database unless explicitly requesting GHL
    if (source !== 'ghl') {
      const contacts = await prisma.contact.findMany({
        where: {
          siteId: siteId
        },
        include: {
          site: {
            select: {
              businessName: true,
              id: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({ contacts });
    }

    // GHL integration path
    if (!site.ghlEnabled) {
      return NextResponse.json(
        { error: 'GoHighLevel integration is not enabled for this site' },
        { status: 400 }
      );
    }

    const search = searchParams.get('search') || undefined;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

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
    logger.error('Failed to fetch contacts:', {}, error as Error);
    
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
    const { target, ...data } = body; // target: 'database' or 'ghl'

    // Validate the input
    const validationResult = createContactSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { siteId, ...contactData } = validationResult.data;

    // Get site
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

    // Default to database unless explicitly targeting GHL
    if (target !== 'ghl') {
      // Create contact in database
      const contact = await prisma.contact.create({
        data: {
          siteId,
          firstName: contactData.firstName || null,
          lastName: contactData.lastName || null,
          email: contactData.email || null,
          phone: contactData.phone || null,
          source: contactData.source || 'Manual',
          tags: contactData.tags || [],
          customFields: contactData.customFields || null,
        },
        include: {
          site: {
            select: {
              businessName: true,
              id: true
            }
          }
        }
      });

      logger.info('Created contact in database', { 
        contactId: contact.id, 
        siteId: contact.siteId 
      });

      return NextResponse.json({ contact });
    }

    // GHL integration path
    if (!site.ghlEnabled) {
      return NextResponse.json(
        { error: 'GoHighLevel integration is not enabled for this site' },
        { status: 400 }
      );
    }

    const crmClient = createGHLCRMClient(site);
    const ghlContact = await crmClient.createContact(contactData);

    // Also save to database with GHL reference
    const contact = await prisma.contact.create({
      data: {
        siteId,
        ghlContactId: ghlContact.id,
        firstName: ghlContact.firstName || null,
        lastName: ghlContact.lastName || null,
        email: ghlContact.email || null,
        phone: ghlContact.phone || null,
        source: contactData.source || 'GoHighLevel',
        tags: ghlContact.tags || [],
        customFields: ghlContact.customFields || null,
      },
      include: {
        site: {
          select: {
            businessName: true,
            id: true
          }
        }
      }
    });

    logger.info('Created contact in GHL and database', { 
      contactId: contact.id, 
      ghlContactId: ghlContact.id,
      siteId: contact.siteId 
    });

    return NextResponse.json({ contact });

  } catch (error) {
    logger.error('Failed to create contact:', {}, error as Error);
    
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
