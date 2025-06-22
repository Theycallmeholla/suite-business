import Stripe from 'stripe';
import { logger } from './logger';
import { prisma } from './prisma';
import { pricingPlans } from './config/pricing';

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Helper to get or create a Stripe customer
export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string | null) {
  try {
    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (existingCustomer) {
      return existingCustomer.stripeCustomerId;
    }

    // Create new Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        userId,
      },
    });

    // Save to database
    await prisma.customer.create({
      data: {
        userId,
        stripeCustomerId: stripeCustomer.id,
      },
    });

    logger.info('Created new Stripe customer', {
      userId,
      stripeCustomerId: stripeCustomer.id,
    });

    return stripeCustomer.id;
  } catch (error) {
    logger.error('Error creating Stripe customer', { error, userId });
    throw error;
  }
}

// Create a checkout session for a subscription
export async function createCheckoutSession({
  userId,
  email,
  name,
  plan,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  email: string;
  name?: string | null;
  plan: 'starter' | 'professional' | 'enterprise';
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const customerId = await getOrCreateStripeCustomer(userId, email, name);
    const priceId = pricingPlans[plan].stripePriceId;

    if (!priceId) {
      throw new Error(`No Stripe price ID configured for plan: ${plan}`);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
      },
      metadata: {
        userId,
        plan,
      },
    });

    logger.info('Created checkout session', {
      userId,
      plan,
      sessionId: session.id,
    });

    return session;
  } catch (error) {
    logger.error('Error creating checkout session', { error, userId, plan });
    throw error;
  }
}

// Create a billing portal session for managing subscriptions
export async function createBillingPortalSession(userId: string, returnUrl: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new Error('No customer found for user');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: returnUrl,
    });

    logger.info('Created billing portal session', {
      userId,
      sessionId: session.id,
    });

    return session;
  } catch (error) {
    logger.error('Error creating billing portal session', { error, userId });
    throw error;
  }
}

// Get active subscription for a user
export async function getActiveSubscription(userId: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          where: {
            status: 'active',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    return customer?.subscriptions[0] || null;
  } catch (error) {
    logger.error('Error getting active subscription', { error, userId });
    return null;
  }
}

// Cancel a subscription at period end
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update in database
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });

    logger.info('Canceled subscription', { subscriptionId });

    return subscription;
  } catch (error) {
    logger.error('Error canceling subscription', { error, subscriptionId });
    throw error;
  }
}

// Reactivate a canceled subscription
export async function reactivateSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    // Update in database
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    logger.info('Reactivated subscription', { subscriptionId });

    return subscription;
  } catch (error) {
    logger.error('Error reactivating subscription', { error, subscriptionId });
    throw error;
  }
}

// Update subscription plan
export async function updateSubscriptionPlan(subscriptionId: string, newPlan: 'starter' | 'professional' | 'enterprise') {
  try {
    const newPriceId = pricingPlans[newPlan].stripePriceId;
    
    if (!newPriceId) {
      throw new Error(`No Stripe price ID configured for plan: ${newPlan}`);
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    // Update in database
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        stripePriceId: newPriceId,
        plan: newPlan,
      },
    });

    logger.info('Updated subscription plan', { 
      subscriptionId, 
      oldPlan: subscription.items.data[0].price.id,
      newPlan: newPriceId,
    });

    return updatedSubscription;
  } catch (error) {
    logger.error('Error updating subscription plan', { error, subscriptionId });
    throw error;
  }
}

// Check if user has access to a feature based on their plan
export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  try {
    const subscription = await getActiveSubscription(userId);
    
    if (!subscription) {
      return false;
    }

    const plan = subscription.plan as 'starter' | 'professional' | 'enterprise';
    const planConfig = pricingPlans[plan];

    // Check specific feature limits
    switch (feature) {
      case 'email_marketing':
        return plan === 'professional' || plan === 'enterprise';
      case 'voice_calling':
        return plan === 'enterprise';
      case 'ai_chat':
        return plan === 'enterprise';
      case 'api_access':
        return plan === 'enterprise';
      case 'white_label':
        return plan === 'enterprise';
      default:
        return true;
    }
  } catch (error) {
    logger.error('Error checking feature access', { error, userId, feature });
    return false;
  }
}

// Get usage limits for a user based on their plan
export async function getUsageLimits(userId: string) {
  try {
    const subscription = await getActiveSubscription(userId);
    
    if (!subscription) {
      // Return free tier limits
      return {
        locations: 0,
        users: 1,
        monthlyBlogPosts: 0,
        gbpPosts: 0,
        emailCredits: 0,
        smsCredits: 0,
      };
    }

    const plan = subscription.plan as 'starter' | 'professional' | 'enterprise';
    return pricingPlans[plan].limits;
  } catch (error) {
    logger.error('Error getting usage limits', { error, userId });
    // Return free tier limits on error
    return {
      locations: 0,
      users: 1,
      monthlyBlogPosts: 0,
      gbpPosts: 0,
      emailCredits: 0,
      smsCredits: 0,
    };
  }
}
