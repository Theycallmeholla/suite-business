import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    // Delete all OAuth tokens for the current user
    const deleted = await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });

    // Also delete the session to force re-login
    await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      message: 'Authentication tokens cleared successfully',
      deleted: deleted.count,
    });

  } catch (error) {
    console.error('Clear tokens error:', error);
    return NextResponse.json(
      { error: 'Failed to clear tokens' },
      { status: 500 }
    );
  }
}