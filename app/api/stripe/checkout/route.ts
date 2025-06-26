import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe';
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

    const { plan } = await req.json();

    if (!['starter', 'professional', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    
    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      plan: plan as 'starter' | 'professional' | 'enterprise',
      successUrl: `${protocol}://${host}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${protocol}://${host}/dashboard/billing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    logger.error('Error creating checkout session', {
      metadata: { error }
    });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
