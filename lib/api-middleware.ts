import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveSubscription, hasFeatureAccess } from '@/lib/stripe';
import { logger } from '@/lib/logger';

export async function requirePlan(
  req: NextRequest,
  requiredPlans: Array<'starter' | 'professional' | 'enterprise'>
) {
  const session = await auth();
  
  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const subscription = await getActiveSubscription(session.user.id);
  
  if (!subscription || !requiredPlans.includes(subscription.plan as any)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'This feature requires an upgraded plan' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, subscription };
}

export async function requireFeature(req: NextRequest, feature: string) {
  const session = await auth();
  
  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const hasAccess = await hasFeatureAccess(session.user.id, feature);
  
  if (!hasAccess) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'This feature is not available in your current plan' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true };
}

// Usage limiter for resources
export async function checkResourceLimit(
  userId: string,
  resource: 'locations' | 'users' | 'monthlyBlogPosts' | 'gbpPosts' | 'emailCredits' | 'smsCredits',
  currentUsage: number
): Promise<{ allowed: boolean; limit: number; remaining: number }> {
  const { getUsageLimits } = await import('@/lib/stripe');
  const limits = await getUsageLimits(userId);
  
  const limit = limits[resource];
  
  if (limit === -1) {
    // Unlimited
    return { allowed: true, limit: -1, remaining: -1 };
  }
  
  const allowed = currentUsage < limit;
  const remaining = Math.max(0, limit - currentUsage);
  
  if (!allowed) {
    logger.warn('Resource limit exceeded', {
      userId,
      resource,
      currentUsage,
      limit,
    });
  }
  
  return { allowed, limit, remaining };
}
