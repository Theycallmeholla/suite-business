import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { emailService } from '@/lib/email';

const createLeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string(),
  sourceUrl: z.string().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  formId: z.string().optional(),
  formData: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

// GET /api/leads - Get leads for a site
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }

    // Verify user has access to this site
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        OR: [
          { userId: session.user.id },
          {
            team: {
              members: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          },
        ],
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Build where clause
    const where: any = { siteId };
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;

    // Get total count
    const total = await prisma.lead.count({ where });

    // Get leads with pagination
    const leads = await prisma.lead.findMany({
      where,
      include: {
        contact: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This endpoint can be called both authenticated (from dashboard) 
    // and unauthenticated (from public forms)
    const session = await getAuthSession();
    
    // Parse and validate the lead data
    const leadData = createLeadSchema.parse(body);
    const siteId = body.siteId;

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }

    // Get the site
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        user: true,
        team: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check if contact already exists
    let contact = null;
    if (leadData.email) {
      contact = await prisma.contact.findFirst({
        where: {
          siteId,
          email: leadData.email,
        },
      });
    }

    // Calculate initial lead score
    let score = 0;
    if (leadData.company) score += 10;
    if (leadData.phone) score += 10;
    if (leadData.utmSource) score += 5;
    if (leadData.formData && Object.keys(leadData.formData).length > 3) score += 15;

    // Determine temperature based on source and behavior
    let temperature = 'cold';
    if (leadData.source === 'contact-form' || leadData.source === 'quote-request') {
      temperature = 'warm';
    }
    if (leadData.source === 'demo-request' || leadData.source === 'pricing-inquiry') {
      temperature = 'hot';
      score += 20;
    }

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        siteId,
        contactId: contact?.id,
        ...leadData,
        score,
        temperature,
      },
      include: {
        contact: true,
      },
    });

    // Create initial activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'note',
        subject: 'Lead created',
        description: `Lead captured from ${leadData.source}`,
        metadata: {
          source: leadData.source,
          sourceUrl: leadData.sourceUrl,
        },
      },
    });

    // Update site analytics
    const today = new Date().toISOString().split('T')[0];
    await prisma.siteAnalytics.upsert({
      where: {
        siteId_date: {
          siteId,
          date: today,
        },
      },
      update: {
        leads: { increment: 1 },
      },
      create: {
        siteId,
        date: today,
        leads: 1,
      },
    });

    // Send email notification to site owner
    if (site.email) {
      await emailService.sendEmail({
        to: site.email,
        subject: `New Lead: ${lead.firstName} ${lead.lastName || ''}`,
        html: `
          <h2>New Lead Captured</h2>
          <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName || ''}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          ${lead.phone ? `<p><strong>Phone:</strong> ${lead.phone}</p>` : ''}
          ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ''}
          <p><strong>Source:</strong> ${lead.source}</p>
          <p><strong>Score:</strong> ${lead.score}/100</p>
          <p><strong>Temperature:</strong> ${lead.temperature}</p>
          ${lead.notes ? `<p><strong>Notes:</strong> ${lead.notes}</p>` : ''}
          <hr>
          <p><a href="${process.env.NEXTAUTH_URL}/dashboard/crm/leads/${lead.id}">View Lead Details</a></p>
        `,
      });
    }

    // TODO: Sync with GoHighLevel if enabled
    // This will be implemented in the GHL integration task

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid lead data', details: error.errors },
        { status: 400 }
      );
    }
    
    logger.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

// PATCH /api/leads - Update a lead
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, ...updateData } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    // Get the lead with site info to verify access
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        site: {
          include: {
            team: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Verify user has access
    const hasAccess = 
      lead.site.userId === session.user.id ||
      lead.site.team?.members.some(m => m.userId === session.user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Track status changes
    if (updateData.status && updateData.status !== lead.status) {
      await prisma.leadActivity.create({
        data: {
          leadId,
          userId: session.user.id,
          type: 'status_change',
          subject: 'Status updated',
          description: `Status changed from ${lead.status} to ${updateData.status}`,
          metadata: {
            oldStatus: lead.status,
            newStatus: updateData.status,
          },
        },
      });

      // Update conversion tracking
      if (updateData.status === 'converted' && !lead.converted) {
        updateData.converted = true;
        updateData.convertedAt = new Date();

        // Update analytics
        const today = new Date().toISOString().split('T')[0];
        await prisma.siteAnalytics.upsert({
          where: {
            siteId_date: {
              siteId: lead.siteId,
              date: today,
            },
          },
          update: {
            conversions: { increment: 1 },
          },
          create: {
            siteId: lead.siteId,
            date: today,
            conversions: 1,
          },
        });
      }
    }

    // Update the lead
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
      include: {
        contact: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({ lead: updatedLead });
  } catch (error) {
    logger.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

// DELETE /api/leads - Delete a lead
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    // Get the lead with site info to verify access
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        site: {
          include: {
            team: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Verify user has access
    const hasAccess = 
      lead.site.userId === session.user.id ||
      lead.site.team?.members.some(m => m.userId === session.user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the lead (activities will cascade)
    await prisma.lead.delete({
      where: { id: leadId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}