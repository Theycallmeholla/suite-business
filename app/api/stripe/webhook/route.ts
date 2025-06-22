import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { pricingPlans } from '@/lib/config/pricing';

// Stripe webhook events we care about
const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    logger.error('Stripe webhook signature verification failed', { error });
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Log webhook event
  logger.info('Received Stripe webhook', {
    type: event.type,
    id: event.id,
  });

  // Check if we've already processed this event
  const existingWebhook = await prisma.billingWebhook.findUnique({
    where: { stripeEventId: event.id },
  });

  if (existingWebhook?.processed) {
    logger.info('Webhook already processed', { eventId: event.id });
    return NextResponse.json({ received: true });
  }

  // Save webhook event
  await prisma.billingWebhook.upsert({
    where: { stripeEventId: event.id },
    create: {
      stripeEventId: event.id,
      type: event.type,
      data: event.data as any,
    },
    update: {
      data: event.data as any,
    },
  });

  // Process relevant events
  if (!relevantEvents.has(event.type)) {
    logger.info('Ignoring irrelevant event type', { type: event.type });
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      default:
        logger.warn('Unhandled webhook event type', { type: event.type });
    }

    // Mark webhook as processed
    await prisma.billingWebhook.update({
      where: { stripeEventId: event.id },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error processing webhook', { error, eventType: event.type });
    
    // Save error for debugging
    await prisma.billingWebhook.update({
      where: { stripeEventId: event.id },
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Return error to Stripe for retry
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  logger.info('Processing checkout session completed', { sessionId: session.id });

  if (session.mode === 'subscription' && session.subscription) {
    // Subscription was created via checkout
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await handleSubscriptionUpdate(subscription);
  }
}

// Handle subscription created or updated
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  logger.info('Processing subscription update', { 
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
  });

  const customer = await prisma.customer.findUnique({
    where: { stripeCustomerId: subscription.customer as string },
  });

  if (!customer) {
    logger.error('Customer not found for subscription', { 
      customerId: subscription.customer,
      subscriptionId: subscription.id,
    });
    return;
  }

  // Determine plan from price ID
  let plan: string | null = null;
  const priceId = subscription.items.data[0]?.price.id;
  
  for (const [planName, planConfig] of Object.entries(pricingPlans)) {
    if (planConfig.stripePriceId === priceId) {
      plan = planName;
      break;
    }
  }

  if (!plan) {
    logger.error('Unknown price ID', { priceId });
    return;
  }

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      stripeSubscriptionId: subscription.id,
      customerId: customer.id,
      stripePriceId: priceId,
      status: subscription.status,
      plan,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      stripePriceId: priceId,
      status: subscription.status,
      plan,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logger.info('Processing subscription deletion', { 
    subscriptionId: subscription.id,
  });

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
    },
  });
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  logger.info('Processing successful invoice payment', { 
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_paid,
  });

  const customer = await prisma.customer.findUnique({
    where: { stripeCustomerId: invoice.customer as string },
  });

  if (!customer) {
    logger.error('Customer not found for invoice', { 
      customerId: invoice.customer,
      invoiceId: invoice.id,
    });
    return;
  }

  // Record payment
  if (invoice.payment_intent) {
    await prisma.payment.upsert({
      where: { stripePaymentId: invoice.payment_intent as string },
      create: {
        stripePaymentId: invoice.payment_intent as string,
        customerId: customer.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        description: invoice.description || `Payment for ${invoice.lines.data[0]?.description || 'subscription'}`,
      },
      update: {
        status: 'succeeded',
      },
    });
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  logger.error('Invoice payment failed', { 
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_due,
  });

  // TODO: Send email notification to customer about failed payment
  // TODO: Update subscription status if needed
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info('Processing successful payment intent', { 
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
  });

  if (!paymentIntent.customer) {
    return;
  }

  const customer = await prisma.customer.findUnique({
    where: { stripeCustomerId: paymentIntent.customer as string },
  });

  if (!customer) {
    logger.error('Customer not found for payment intent', { 
      customerId: paymentIntent.customer,
      paymentIntentId: paymentIntent.id,
    });
    return;
  }

  // Record payment if not already recorded
  await prisma.payment.upsert({
    where: { stripePaymentId: paymentIntent.id },
    create: {
      stripePaymentId: paymentIntent.id,
      customerId: customer.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'succeeded',
      description: paymentIntent.description || 'Payment',
    },
    update: {
      status: 'succeeded',
    },
  });
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.error('Payment intent failed', { 
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    error: paymentIntent.last_payment_error,
  });

  if (!paymentIntent.customer) {
    return;
  }

  const customer = await prisma.customer.findUnique({
    where: { stripeCustomerId: paymentIntent.customer as string },
  });

  if (!customer) {
    return;
  }

  // Record failed payment
  await prisma.payment.upsert({
    where: { stripePaymentId: paymentIntent.id },
    create: {
      stripePaymentId: paymentIntent.id,
      customerId: customer.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'failed',
      description: paymentIntent.description || 'Payment',
    },
    update: {
      status: 'failed',
    },
  });
}
