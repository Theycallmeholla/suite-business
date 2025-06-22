import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { createBillingPortalSession } from '@/lib/stripe';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const returnUrl = `${protocol}://${host}/dashboard/billing`;
    
    const portalSession = await createBillingPortalSession(
      session.user.id,
      returnUrl
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    logger.error('Error creating billing portal session', { error });
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
