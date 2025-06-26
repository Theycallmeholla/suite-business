import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const markReadSchema = z.object({
  submissionIds: z.array(z.string()),
  isRead: z.boolean()
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
    const { submissionIds, isRead } = markReadSchema.parse(body);

    // Verify ownership of all submissions
    const submissions = await prisma.formSubmission.findMany({
      where: {
        id: { in: submissionIds },
        form: {
          site: {
            userId: session.user.id
          }
        }
      },
      select: { id: true }
    });

    if (submissions.length !== submissionIds.length) {
      return NextResponse.json(
        { error: 'Some submissions not found or unauthorized' },
        { status: 403 }
      );
    }

    // Update the submissions
    await prisma.formSubmission.updateMany({
      where: {
        id: { in: submissionIds }
      },
      data: {
        isRead,
        readAt: isRead ? new Date() : null
      }
    });

    logger.info('Marked submissions as read', {
      userId: session.user.id,
      submissionIds,
      isRead
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error marking submissions as read', error);
    return NextResponse.json(
      { error: 'Failed to update submissions' },
      { status: 500 }
    );
  }
}