import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { emailService } from '@/lib/email';

const assignLeadSchema = z.object({
  leadId: z.string(),
  assignedTo: z.string(), // User ID to assign to
  notes: z.string().optional(),
});

// POST /api/leads/assign - Assign a lead to a team member
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, assignedTo, notes } = assignLeadSchema.parse(body);

    // Get the lead with site and current assignment info
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        site: {
          include: {
            team: {
              include: {
                members: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Verify user has access (must be owner or admin)
    const member = lead.site.team?.members.find(m => m.userId === session.user.id);
    const hasAccess = 
      lead.site.userId === session.user.id ||
      member?.role === 'owner' ||
      member?.role === 'admin';

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized - must be owner or admin' }, { status: 403 });
    }

    // Verify assignee is a team member
    const assignee = lead.site.team?.members.find(m => m.userId === assignedTo);
    if (!assignee) {
      return NextResponse.json({ error: 'Assignee must be a team member' }, { status: 400 });
    }

    const previousAssignee = lead.assignedTo;

    // Update the lead
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        assignedTo,
        assignedAt: new Date(),
      },
    });

    // Create activity log
    await prisma.leadActivity.create({
      data: {
        leadId,
        userId: session.user.id,
        type: 'note',
        subject: 'Lead assigned',
        description: `Lead assigned to ${assignee.user.name || assignee.user.email}${previousAssignee ? ` (previously assigned to user ${previousAssignee})` : ''}`,
        metadata: {
          assignedTo,
          assignedBy: session.user.id,
          previousAssignee,
          notes,
        },
      },
    });

    // Send email notification to assignee
    if (assignee.user.email) {
      await emailService.sendEmail({
        to: assignee.user.email,
        subject: `New Lead Assigned: ${lead.firstName} ${lead.lastName || ''}`,
        html: `
          <h2>You've been assigned a new lead</h2>
          <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName || ''}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          ${lead.phone ? `<p><strong>Phone:</strong> ${lead.phone}</p>` : ''}
          ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ''}
          <p><strong>Score:</strong> ${lead.score}/100</p>
          <p><strong>Temperature:</strong> ${lead.temperature}</p>
          ${notes ? `<p><strong>Assignment Notes:</strong> ${notes}</p>` : ''}
          <hr>
          <p>Assigned by: ${session.user.name || session.user.email}</p>
          <p><a href="${process.env.NEXTAUTH_URL}/dashboard/crm/leads/${lead.id}">View Lead Details</a></p>
        `,
      });
    }

    return NextResponse.json({ 
      lead: updatedLead,
      assignee: {
        id: assignee.userId,
        name: assignee.user.name,
        email: assignee.user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid assignment data', details: error.errors },
        { status: 400 }
      );
    }
    
    logger.error('Error assigning lead:', error);
    return NextResponse.json(
      { error: 'Failed to assign lead' },
      { status: 500 }
    );
  }
}

// POST /api/leads/assign/bulk - Bulk assign leads
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadIds, assignedTo, strategy = 'all' } = body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'Lead IDs array is required' }, { status: 400 });
    }

    // Get all leads with their sites
    const leads = await prisma.lead.findMany({
      where: {
        id: { in: leadIds },
      },
      include: {
        site: {
          include: {
            team: {
              include: {
                members: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (leads.length === 0) {
      return NextResponse.json({ error: 'No valid leads found' }, { status: 404 });
    }

    // Group leads by site for access verification
    const siteGroups = leads.reduce((acc, lead) => {
      const siteId = lead.siteId;
      if (!acc[siteId]) acc[siteId] = [];
      acc[siteId].push(lead);
      return acc;
    }, {} as Record<string, typeof leads>);

    const results = [];
    const errors = [];

    // Process each site group
    for (const [siteId, siteLeads] of Object.entries(siteGroups)) {
      const site = siteLeads[0].site;
      const member = site.team?.members.find(m => m.userId === session.user.id);
      const hasAccess = 
        site.userId === session.user.id ||
        member?.role === 'owner' ||
        member?.role === 'admin';

      if (!hasAccess) {
        errors.push({
          siteId,
          error: 'Unauthorized for this site',
          leadIds: siteLeads.map(l => l.id),
        });
        continue;
      }

      // Handle different assignment strategies
      let assignees = [];
      if (strategy === 'all') {
        // Assign all leads to the same person
        assignees = [assignedTo];
      } else if (strategy === 'round-robin' && Array.isArray(assignedTo)) {
        // Round-robin assignment among multiple team members
        assignees = assignedTo;
      }

      // Assign leads
      for (let i = 0; i < siteLeads.length; i++) {
        const lead = siteLeads[i];
        const assignToUserId = strategy === 'round-robin' 
          ? assignees[i % assignees.length]
          : assignees[0];

        // Verify assignee is a team member
        const assignee = site.team?.members.find(m => m.userId === assignToUserId);
        if (!assignee) {
          errors.push({
            leadId: lead.id,
            error: 'Assignee is not a team member',
          });
          continue;
        }

        try {
          // Update lead
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              assignedTo: assignToUserId,
              assignedAt: new Date(),
            },
          });

          // Create activity
          await prisma.leadActivity.create({
            data: {
              leadId: lead.id,
              userId: session.user.id,
              type: 'note',
              subject: 'Lead assigned (bulk)',
              description: `Lead assigned to ${assignee.user.name || assignee.user.email} as part of bulk assignment`,
              metadata: {
                assignedTo: assignToUserId,
                assignedBy: session.user.id,
                bulkAssignment: true,
                strategy,
              },
            },
          });

          results.push({
            leadId: lead.id,
            assignedTo: assignToUserId,
            success: true,
          });
        } catch (error) {
          errors.push({
            leadId: lead.id,
            error: 'Failed to assign',
          });
        }
      }
    }

    return NextResponse.json({
      success: results.length > 0,
      assigned: results.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    logger.error('Error bulk assigning leads:', error);
    return NextResponse.json(
      { error: 'Failed to bulk assign leads' },
      { status: 500 }
    );
  }
}