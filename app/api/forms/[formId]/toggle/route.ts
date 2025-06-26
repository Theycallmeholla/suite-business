import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// PATCH /api/forms/[formId]/toggle - Toggle form enabled status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formId } = await params;
    const body = await request.json();
    const { enabled } = body;

    // Verify form ownership
    const existingForm = await prisma.form.findFirst({
      where: {
        id: formId,
        site: {
          userId: session.user.id
        }
      }
    });

    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Update the form
    const form = await prisma.form.update({
      where: { id: formId },
      data: { enabled },
    });

    logger.info(`Form ${formId} ${enabled ? 'enabled' : 'disabled'}`);

    return NextResponse.json({ success: true, enabled: form.enabled });
  } catch (error) {
    logger.error('Failed to toggle form:', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to toggle form' },
      { status: 500 }
    );
  }
}
