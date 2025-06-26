import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// POST /api/forms/submissions/delete - Delete multiple submissions
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid submission IDs' }, { status: 400 });
    }

    // Verify ownership of all submissions
    const submissions = await prisma.formSubmission.findMany({
      where: {
        id: { in: ids },
        form: {
          site: {
            userId: session.user.id
          }
        }
      },
      select: { id: true }
    });

    if (submissions.length !== ids.length) {
      return NextResponse.json({ error: 'Some submissions not found or unauthorized' }, { status: 403 });
    }

    // Delete submissions
    await prisma.formSubmission.deleteMany({
      where: { id: { in: ids } }
    });

    logger.info(`Deleted ${ids.length} form submissions`);

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    logger.error('Failed to delete submissions:', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to delete submissions' },
      { status: 500 }
    );
  }
}
