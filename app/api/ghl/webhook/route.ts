import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { createGHLProClient, GHL_WEBHOOK_EVENTS } from '@/lib/ghl';
import { emailService } from '@/lib/email';
import { z } from 'zod';

// GoHighLevel webhook event schema
const webhookEventSchema = z.object({
  type: z.string(),
  locationId: z.string(),
  data: z.any(),
  timestamp: z.number().optional(),
});

// Verify webhook signature (if GHL provides one)
function verifyWebhookSignature(request: NextRequest): boolean {
  // TODO: Implement signature verification when GHL provides webhook secret
  // For now, we'll rely on the endpoint being secret
  const webhookSecret = process.env.GHL_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.warn('GHL webhook secret not configured');
    return true; // Allow for now
  }
  
  // Implement HMAC verification here when available
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    if (!verifyWebhookSignature(request)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const event = webhookEventSchema.parse(body);

    logger.info('Received GHL webhook', {
      type: event.type,
      locationId: event.locationId,
    });

    // Find the site associated with this GHL location
    const site = await prisma.site.findFirst({
      where: {
        ghlLocationId: event.locationId,
      },
    });

    if (!site) {
      logger.warn('No site found for GHL location', { locationId: event.locationId });
      return NextResponse.json({ received: true });
    }

    // Handle different webhook types
    switch (event.type) {
      case 'ContactCreate':
      case 'contact.created':
        await handleContactCreated(site, event.data);
        break;
        
      case 'ContactUpdate':
      case 'contact.updated':
        await handleContactUpdated(site, event.data);
        break;
        
      case 'AppointmentScheduled':
      case 'appointment.scheduled':
        await handleAppointmentScheduled(site, event.data);
        break;
        
      case 'AppointmentCancelled':
      case 'appointment.cancelled':
        await handleAppointmentCancelled(site, event.data);
        break;
        
      case 'OpportunityCreated':
      case 'opportunity.created':
        await handleOpportunityCreated(site, event.data);
        break;
        
      case 'OpportunityStatusChange':
      case 'opportunity.status_changed':
        await handleOpportunityStatusChanged(site, event.data);
        break;
        
      case 'SMSSent':
      case 'sms.sent':
        await handleSmsSent(site, event.data);
        break;
        
      case 'SMSReceived':
      case 'sms.received':
        await handleSmsReceived(site, event.data);
        
      default:
        logger.debug('Unhandled GHL webhook type', { type: event.type });
    }

    // Call the GHL client to handle any additional processing
    const ghlClient = createGHLProClient();
    await ghlClient.handleWebhook(event);

    return NextResponse.json({ received: true });

  } catch (error) {
    logger.error('GHL webhook error', { error });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid webhook data', details: error.errors },
        { status: 400 }
      );
    }
    
    // Return 200 to prevent retries for non-recoverable errors
    return NextResponse.json(
      { received: true, error: 'Processing failed' },
      { status: 200 }
    );
  }
}

// Handler functions for specific events
async function handleContactCreated(site: any, contactData: any) {
  logger.info('New contact created in GHL', {
    siteId: site.id,
    contactId: contactData.id,
    email: contactData.email,
  });
  
  // Send lead notification to business owner
  if (site.email && contactData.email) {
    const template = emailService.getLeadNotificationTemplate({
      leadName: `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim() || 'New Lead',
      leadEmail: contactData.email,
      leadPhone: contactData.phone,
      source: contactData.source || 'GoHighLevel',
      businessName: site.businessName,
      siteUrl: `https://${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
    });

    await emailService.sendEmail({
      to: site.email,
      ...template,
    });
  }
  
  // TODO: Store contact in local database if needed
  // TODO: Update site analytics
}

async function handleContactUpdated(site: any, contactData: any) {
  logger.info('Contact updated in GHL', {
    siteId: site.id,
    contactId: contactData.id,
  });
  
  // TODO: Update local contact record if stored
}

async function handleAppointmentScheduled(site: any, appointmentData: any) {
  logger.info('Appointment scheduled in GHL', {
    siteId: site.id,
    appointmentId: appointmentData.id,
    date: appointmentData.startTime,
  });
  
  // Send appointment confirmation email
  if (appointmentData.contactEmail && site.email) {
    const appointmentDate = new Date(appointmentData.startTime);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    await emailService.sendEmail({
      to: appointmentData.contactEmail,
      subject: `Appointment Confirmation - ${site.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Appointment Confirmed</h2>
          <p>Hi ${appointmentData.contactName || 'there'},</p>
          <p>Your appointment with ${site.businessName} has been confirmed.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Date & Time:</strong> ${formattedDate}</p>
            ${appointmentData.location ? `<p><strong>Location:</strong> ${appointmentData.location}</p>` : ''}
            ${appointmentData.notes ? `<p><strong>Notes:</strong> ${appointmentData.notes}</p>` : ''}
          </div>
          
          <p>If you need to reschedule or cancel, please contact us at:</p>
          <p>
            ${site.phone ? `Phone: <a href="tel:${site.phone}">${site.phone}</a><br>` : ''}
            ${site.email ? `Email: <a href="mailto:${site.email}">${site.email}</a>` : ''}
          </p>
          
          <p>We look forward to seeing you!</p>
          <p>Best regards,<br>${site.businessName}</p>
        </div>
      `,
    });
  }
  
  // TODO: Update calendar
  // TODO: Create reminder workflow
}

async function handleAppointmentCancelled(site: any, appointmentData: any) {
  logger.info('Appointment cancelled in GHL', {
    siteId: site.id,
    appointmentId: appointmentData.id,
  });
  
  // TODO: Send cancellation email
  // TODO: Update calendar
  // TODO: Trigger re-engagement workflow
}

async function handleOpportunityCreated(site: any, opportunityData: any) {
  logger.info('Opportunity created in GHL', {
    siteId: site.id,
    opportunityId: opportunityData.id,
    value: opportunityData.monetaryValue,
  });
  
  // TODO: Track in analytics
  // TODO: Notify sales team
}

async function handleOpportunityStatusChanged(site: any, opportunityData: any) {
  logger.info('Opportunity status changed in GHL', {
    siteId: site.id,
    opportunityId: opportunityData.id,
    status: opportunityData.status,
  });
  
  // TODO: Update analytics
  // TODO: Trigger status-based workflows
}

async function handleSmsSent(site: any, smsData: any) {
  logger.info('SMS sent from GHL', {
    siteId: site.id,
    messageId: smsData.id,
    to: smsData.to,
  });
  
  // TODO: Track for billing/analytics
}

async function handleSmsReceived(site: any, smsData: any) {
  logger.info('SMS received in GHL', {
    siteId: site.id,
    messageId: smsData.id,
    from: smsData.from,
  });
  
  // TODO: Trigger auto-response if configured
  // TODO: Notify team of new message
}
