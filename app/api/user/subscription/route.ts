import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getActiveSubscription } from '@/lib/stripe';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await getActiveSubscription(session.user.id);

    return NextResponse.json({ subscription });
  } catch (error) {
    logger.error('Error fetching subscription', {
      metadata: { error }
    });
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
