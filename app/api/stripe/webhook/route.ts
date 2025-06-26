import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { pricingPlans } from '@/lib/config/pricing';
import { emailService } from '@/lib/email';

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
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    logger.error('Stripe webhook signature verification failed', {
      metadata: { error }
    });
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Log webhook event
  logger.info('Received Stripe webhook', {
      metadata: {
    type: event.type,
    id: event.id,
  }
    });

  // Check if we've already processed this event
  const existingWebhook = await prisma.billingWebhook.findUnique({
    where: { stripeEventId: event.id },
  });

  if (existingWebhook?.processed) {
    logger.info('Webhook already processed', {
      metadata: { eventId: event.id }
    });
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
    logger.info('Ignoring irrelevant event type', {
      metadata: { type: event.type }
    });
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
        logger.warn('Unhandled webhook event type', {
      metadata: { type: event.type }
    });
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
    logger.error('Error processing webhook', {
      metadata: { error, eventType: event.type }
    });
    
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
  logger.info('Processing checkout session completed', {
      metadata: { sessionId: session.id }
    });

  if (session.mode === 'subscription' && session.subscription) {
    // Subscription was created via checkout
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await handleSubscriptionUpdate(subscription);
  }
}

// Handle subscription created or updated
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  logger.info('Processing subscription update', {
      metadata: { 
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
  }
    });

  const customer = await prisma.customer.findUnique({
    where: { stripeCustomerId: subscription.customer as string },
  });

  if (!customer) {
    logger.error('Customer not found for subscription', {
      metadata: { 
      customerId: subscription.customer,
      subscriptionId: subscription.id,
    }
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
    logger.error('Unknown price ID', {
      metadata: { priceId }
    });
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
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    },
    update: {
      stripePriceId: priceId,
      status: subscription.status,
      plan,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    },
  });
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logger.info('Processing subscription deletion', {
      metadata: { 
    subscriptionId: subscription.id,
  }
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
      metadata: { 
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_paid,
  }
    });

  const customer = await prisma.customer.findUnique({
    where: { stripeCustomerId: invoice.customer as string },
  });

  if (!customer) {
    logger.error('Customer not found for invoice', {
      metadata: { 
      customerId: invoice.customer,
      invoiceId: invoice.id,
    }
    });
    return;
  }

  // Record payment
  if ((invoice as any).payment_intent) {
    await prisma.payment.upsert({
      where: { stripePaymentId: (invoice as any).payment_intent as string },
      create: {
        stripePaymentId: (invoice as any).payment_intent as string,
        customerId: customer.id,
        amount: (invoice as any).amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        description: (invoice as any).description || `Payment for ${(invoice as any).lines.data[0]?.description || 'subscription'}`,
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
      metadata: { 
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_due,
  }
    });

  try {
    // Find the customer in our database
    const customer = await prisma.customer.findUnique({
      where: { stripeCustomerId: invoice.customer as string },
      include: { 
        user: true,
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!customer) {
      logger.warn('Customer not found for failed payment', {
      metadata: {
        stripeCustomerId: invoice.customer,
        invoiceId: invoice.id,
      }
    });
      return;
    }

    // Send email notification to customer about failed payment
    if (customer.user.email) {
      await emailService.sendEmail({
        to: customer.user.email,
        subject: 'Payment Failed - Action Required',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Payment Failed</h2>
            <p>Hi ${customer.user.name || 'there'},</p>
            <p>We were unable to process your payment for your SiteBango subscription.</p>
            
            <div style="background: #fee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44;">
              <h3>Payment Details:</h3>
              <p><strong>Amount:</strong> $${(invoice.amount_due / 100).toFixed(2)}</p>
              <p><strong>Invoice:</strong> ${invoice.id}</p>
              <p><strong>Due Date:</strong> ${new Date(invoice.due_date! * 1000).toLocaleDateString()}</p>
            </div>
            
            <p>Please update your payment method to avoid service interruption.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="background: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Update Payment Method</a></p>
            
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>The SiteBango Team</p>
          </div>
        `,
      });
    }

    // Update subscription status if needed (mark as past_due)
    if (customer.subscriptions.length > 0) {
      const subscription = customer.subscriptions[0];
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { 
          status: 'past_due',
          updatedAt: new Date(),
        },
      });

      logger.info('Updated subscription status to past_due', {
      metadata: {
        subscriptionId: subscription.id,
        customerId: customer.id,
      }
    });
    }

    logger.info('Successfully processed failed payment notification', {
      metadata: {
      customerId: customer.id,
      invoiceId: invoice.id,
    }
    });
  } catch (error) {
    logger.error('Failed to process payment failure', {
      metadata: {
        invoiceId: invoice.id,
        customerId: invoice.customer,
      }
    }, error as Error);
  }
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info('Processing successful payment intent', {
      metadata: { 
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
  }
    });

  if (!paymentIntent.customer) {
    return;
  }

  const customer = await prisma.customer.findUnique({
    where: { stripeCustomerId: paymentIntent.customer as string },
  });

  if (!customer) {
    logger.error('Customer not found for payment intent', {
      metadata: { 
      customerId: paymentIntent.customer,
      paymentIntentId: paymentIntent.id,
    }
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
      metadata: { 
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    error: paymentIntent.last_payment_error,
  }
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
