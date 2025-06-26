import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const createActivitySchema = z.object({
  leadId: z.string(),
  type: z.enum(['email', 'call', 'meeting', 'note', 'status_change']),
  subject: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/leads/activities - Get activities for a lead
export async function GET(request: NextRequest) {
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

    // Verify user has access to this lead
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        site: {
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
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get activities
    const activities = await prisma.leadActivity.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    logger.error('Error fetching lead activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/leads/activities - Create a new activity
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const activityData = createActivitySchema.parse(body);

    // Verify user has access to this lead
    const lead = await prisma.lead.findFirst({
      where: {
        id: activityData.leadId,
        site: {
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
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Create the activity
    const activity = await prisma.leadActivity.create({
      data: {
        ...activityData,
        userId: session.user.id,
      },
    });

    // Update lead's last contacted date for certain activity types
    if (['email', 'call', 'meeting'].includes(activityData.type)) {
      await prisma.lead.update({
        where: { id: activityData.leadId },
        data: { lastContactedAt: new Date() },
      });
    }

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid activity data', details: error.errors },
        { status: 400 }
      );
    }
    
    logger.error('Error creating lead activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}