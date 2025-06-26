import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// GET /api/forms/[formId] - Get a single form
export async function GET(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formId } = await params;

    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        site: {
          userId: session.user.id
        }
      },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    logger.error('Failed to fetch form:', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}

// PUT /api/forms/[formId] - Update a form
export async function PUT(
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
    const { name, type, fields, settings } = body;

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
      data: {
        name,
        type,
        fields,
        settings,
      },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    logger.info(`Form updated: ${form.id}`);

    return NextResponse.json({
      id: form.id,
      name: form.name,
      type: form.type,
      enabled: form.enabled,
      createdAt: form.createdAt,
      submissionsCount: form._count.submissions
    });
  } catch (error) {
    logger.error('Failed to update form:', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/[formId] - Delete a form
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formId } = await params;

    // Verify form ownership
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        site: {
          userId: session.user.id
        }
      }
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Delete the form (submissions will cascade delete)
    await prisma.form.delete({
      where: { id: formId }
    });

    logger.info(`Form deleted: ${formId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete form:', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    );
  }
}
