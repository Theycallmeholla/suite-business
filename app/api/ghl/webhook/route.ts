import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { createGHLProClient, GHL_WEBHOOK_EVENTS } from '@/lib/ghl';
import { emailService } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

// Enhanced webhook event schema with better type safety
const webhookEventSchema = z.object({
  type: z.string(),
  locationId: z.string(),
  data: z.record(z.any()),
  timestamp: z.number().optional(),
});

// Contact data schema for type safety
const contactDataSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
});

// Opportunity data schema
const opportunityDataSchema = z.object({
  id: z.string(),
  monetaryValue: z.number().optional(),
  status: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
});

// Appointment data schema
const appointmentDataSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  contactEmail: z.string().email().optional(),
  contactName: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Verify webhook signature using HMAC-SHA256
 */
function verifyWebhookSignature(request: NextRequest, body: string): boolean {
  const webhookSecret = process.env.GHL_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.warn('GHL webhook secret not configured - allowing request');
    return true;
  }

  const signature = request.headers.get('x-ghl-signature');
  if (!signature) {
    logger.warn('No signature provided in webhook request');
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');
    
    const providedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  } catch (error) {
    logger.error('Error verifying webhook signature', {}, error as Error);
    return false;
  }
}

/**
 * Enhanced webhook handler with proper error handling and type safety
 */
export async function POST(request: NextRequest) {
  let body: string;
  
  try {
    body = await request.text();
    
    // Verify webhook signature
    if (!verifyWebhookSignature(request, body)) {
      logger.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const parsedBody = JSON.parse(body);
    const event = webhookEventSchema.parse(parsedBody);

    logger.info('Received GHL webhook', {
      metadata: {
      type: event.type,
      locationId: event.locationId,
      timestamp: event.timestamp,
    }
    });

    // Find the site associated with this GHL location
    const site = await prisma.site.findFirst({
      where: {
        ghlLocationId: event.locationId,
      },
      include: {
        user: true,
        team: true,
      },
    });

    if (!site) {
      logger.warn('No site found for GHL location', {
      metadata: {
        locationId: event.locationId,
        eventType: event.type,
      }
    });
      return NextResponse.json(
        { received: true, message: 'No associated site found' },
        { status: 200 }
      );
    }

    // Route to appropriate handler based on event type
    await routeWebhookEvent(event.type, site, event.data);

    return NextResponse.json(
      { received: true, processed: true },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid webhook payload', {
      metadata: {
        errors: error.errors,
      }
    });
      return NextResponse.json(
        { error: 'Invalid payload format' },
        { status: 400 }
      );
    }

    logger.error('Webhook processing failed', {}, error as Error);
    
    // Return 200 to prevent retries for non-recoverable errors
    return NextResponse.json(
      { received: true, error: 'Processing failed' },
      { status: 200 }
    );
  }
}

/**
 * Route webhook events to appropriate handlers
 */
async function routeWebhookEvent(eventType: string, site: any, data: any): Promise<void> {
  try {
    switch (eventType) {
      case 'contact.create':
        await handleContactCreated(site, contactDataSchema.parse(data));
        break;
      case 'contact.update':
        await handleContactUpdated(site, contactDataSchema.parse(data));
        break;
      case 'appointment.create':
        await handleAppointmentScheduled(site, appointmentDataSchema.parse(data));
        break;
      case 'appointment.delete':
        await handleAppointmentCancelled(site, appointmentDataSchema.parse(data));
        break;
      case 'opportunity.create':
        await handleOpportunityCreated(site, opportunityDataSchema.parse(data));
        break;
      case 'opportunity.status_change':
        await handleOpportunityStatusChanged(site, opportunityDataSchema.parse(data));
        break;
      case 'conversation.message.outbound':
        await handleSmsSent(site, data);
        break;
      case 'conversation.message.inbound':
        await handleSmsReceived(site, data);
        break;
      default:
        logger.info('Unhandled webhook event type', {
      metadata: {
          eventType,
          siteId: site.id,
        }
    });
    }
  } catch (error) {
    logger.error('Error processing webhook event', {
      metadata: {
        eventType,
        siteId: site.id,
      }
    }, error as Error);
    throw error;
  }
}

/**
 * Handle new contact creation with comprehensive tracking
 */
async function handleContactCreated(site: any, contactData: z.infer<typeof contactDataSchema>) {
  logger.info('New contact created in GHL', {
      metadata: {
    siteId: site.id,
    contactId: contactData.id,
    email: contactData.email,
  }
    });
  
  try {
    // Store contact in local database for analytics and backup
    await prisma.contact.upsert({
      where: {
        ghlContactId: contactData.id,
      },
      update: {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        source: contactData.source || 'GoHighLevel',
        lastUpdated: new Date(),
      },
      create: {
        ghlContactId: contactData.id,
        siteId: site.id,
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        source: contactData.source || 'GoHighLevel',
        tags: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      },
    });

    // Update site analytics - increment lead count
    const today = new Date().toISOString().split('T')[0];
    await prisma.siteAnalytics.upsert({
      where: {
        siteId_date: {
          siteId: site.id,
          date: today,
        },
      },
      update: {
        leads: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
      create: {
        siteId: site.id,
        date: today,
        leads: 1,
        views: 0,
        conversions: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Send lead notification to business owner
    if (site.email && contactData.email) {
      const leadName = `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim() || 'New Lead';
      
      await emailService.sendEmail({
        to: site.email,
        subject: `New Lead: ${leadName} - ${site.businessName}`,
        html: generateLeadNotificationEmail({
          leadName,
          leadEmail: contactData.email,
          leadPhone: contactData.phone,
          source: contactData.source || 'GoHighLevel',
          businessName: site.businessName,
          siteUrl: `https://${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
        }),
      });
    }

    logger.info('Successfully processed new contact', {
      metadata: {
      siteId: site.id,
      contactId: contactData.id,
    }
    });
  } catch (error) {
    logger.error('Failed to process new contact', {
      metadata: {
      siteId: site.id,
      contactId: contactData.id,
    }
    }, error as Error);
    // Don't throw - webhook should still return success
  }
}

/**
 * Handle contact updates
 */
async function handleContactUpdated(site: any, contactData: z.infer<typeof contactDataSchema>) {
  logger.info('Contact updated in GHL', {
      metadata: {
    siteId: site.id,
    contactId: contactData.id,
  }
    });
  
  try {
    const existingContact = await prisma.contact.findUnique({
      where: { ghlContactId: contactData.id },
    });

    if (existingContact) {
      await prisma.contact.update({
        where: { ghlContactId: contactData.id },
        data: {
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          source: contactData.source || existingContact.source,
          lastUpdated: new Date(),
        },
      });

      logger.info('Successfully updated contact', {
      metadata: {
        siteId: site.id,
        contactId: contactData.id,
      }
    });
    } else {
      logger.warn('Contact not found in local database', {
      metadata: {
        siteId: site.id,
        contactId: contactData.id,
      }
    });
    }
  } catch (error) {
    logger.error('Failed to update contact', {
      metadata: {
      siteId: site.id,
      contactId: contactData.id,
    }
    }, error as Error);
  }
}

/**
 * Handle appointment scheduling with confirmation emails
 */
async function handleAppointmentScheduled(site: any, appointmentData: z.infer<typeof appointmentDataSchema>) {
  logger.info('Appointment scheduled in GHL', {
      metadata: {
    siteId: site.id,
    appointmentId: appointmentData.id,
    date: appointmentData.startTime,
  }
    });
  
  try {
    // Send appointment confirmation email
    if (appointmentData.contactEmail) {
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
        html: generateAppointmentConfirmationEmail({
          contactName: appointmentData.contactName || 'there',
          businessName: site.businessName,
          formattedDate,
          location: appointmentData.location,
          notes: appointmentData.notes,
          businessPhone: site.phone,
          businessEmail: site.email,
        }),
      });
    }

    // Track appointment in analytics
    const today = new Date().toISOString().split('T')[0];
    await prisma.siteAnalytics.upsert({
      where: {
        siteId_date: {
          siteId: site.id,
          date: today,
        },
      },
      update: {
        conversions: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
      create: {
        siteId: site.id,
        date: today,
        leads: 0,
        views: 0,
        conversions: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    logger.info('Successfully processed appointment scheduling', {
      metadata: {
      siteId: site.id,
      appointmentId: appointmentData.id,
    }
    });
  } catch (error) {
    logger.error('Failed to process appointment scheduling', {
      metadata: {
      siteId: site.id,
      appointmentId: appointmentData.id,
    }
    }, error as Error);
  }
}

/**
 * Handle appointment cancellation
 */
async function handleAppointmentCancelled(site: any, appointmentData: z.infer<typeof appointmentDataSchema>) {
  logger.info('Appointment cancelled in GHL', {
      metadata: {
    siteId: site.id,
    appointmentId: appointmentData.id,
  }
    });
  
  try {
    // Send cancellation notification email
    if (appointmentData.contactEmail) {
      await emailService.sendEmail({
        to: appointmentData.contactEmail,
        subject: `Appointment Cancelled - ${site.businessName}`,
        html: generateAppointmentCancellationEmail({
          contactName: appointmentData.contactName || 'there',
          businessName: site.businessName,
          businessPhone: site.phone,
          businessEmail: site.email,
        }),
      });
    }

    logger.info('Successfully processed appointment cancellation', {
      metadata: {
      siteId: site.id,
      appointmentId: appointmentData.id,
    }
    });
  } catch (error) {
    logger.error('Failed to process appointment cancellation', {
      metadata: {
      siteId: site.id,
      appointmentId: appointmentData.id,
    }
    }, error as Error);
  }
}

/**
 * Handle opportunity creation with tracking and notifications
 */
async function handleOpportunityCreated(site: any, opportunityData: z.infer<typeof opportunityDataSchema>) {
  logger.info('Opportunity created in GHL', {
      metadata: {
    siteId: site.id,
    opportunityId: opportunityData.id,
    value: opportunityData.monetaryValue,
  }
    });
  
  try {
    // Track opportunity in analytics
    const today = new Date().toISOString().split('T')[0];
    await prisma.siteAnalytics.upsert({
      where: {
        siteId_date: {
          siteId: site.id,
          date: today,
        },
      },
      update: {
        conversions: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
      create: {
        siteId: site.id,
        date: today,
        leads: 0,
        views: 0,
        conversions: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Notify business owner of new opportunity
    if (site.email && opportunityData.monetaryValue) {
      await emailService.sendEmail({
        to: site.email,
        subject: `New Opportunity: $${opportunityData.monetaryValue} - ${site.businessName}`,
        html: generateOpportunityNotificationEmail({
          businessName: site.businessName,
          value: opportunityData.monetaryValue,
          status: opportunityData.status || 'New',
          contactName: opportunityData.contactName || 'N/A',
        }),
      });
    }

    logger.info('Successfully tracked opportunity', {
      metadata: {
      siteId: site.id,
      opportunityId: opportunityData.id,
    }
    });
  } catch (error) {
    logger.error('Failed to track opportunity', {
      metadata: {
      siteId: site.id,
      opportunityId: opportunityData.id,
    }
    }, error as Error);
  }
}

/**
 * Handle opportunity status changes
 */
async function handleOpportunityStatusChanged(site: any, opportunityData: z.infer<typeof opportunityDataSchema>) {
  logger.info('Opportunity status changed in GHL', {
      metadata: {
    siteId: site.id,
    opportunityId: opportunityData.id,
    status: opportunityData.status,
  }
    });
  
  // Track status changes for analytics
  // Could implement status-based workflows here
}

/**
 * Handle SMS events for analytics
 */
async function handleSmsSent(site: any, smsData: any) {
  logger.info('SMS sent from GHL', {
      metadata: {
    siteId: site.id,
    messageId: smsData.id,
    to: smsData.to,
  }
    });
  
  // Track SMS usage for billing/analytics
}

async function handleSmsReceived(site: any, smsData: any) {
  logger.info('SMS received in GHL', {
      metadata: {
    siteId: site.id,
    messageId: smsData.id,
    from: smsData.from,
  }
    });
  
  // Could trigger auto-responses or team notifications
}

/**
 * Email template generators
 */
function generateLeadNotificationEmail(data: {
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  source: string;
  businessName: string;
  siteUrl: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Lead Alert!</h2>
      <p>You have received a new lead from your website.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Lead Details:</h3>
        <p><strong>Name:</strong> ${data.leadName}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.leadEmail}">${data.leadEmail}</a></p>
        ${data.leadPhone ? `<p><strong>Phone:</strong> <a href="tel:${data.leadPhone}">${data.leadPhone}</a></p>` : ''}
        <p><strong>Source:</strong> ${data.source}</p>
        <p><strong>Website:</strong> <a href="${data.siteUrl}">${data.siteUrl}</a></p>
      </div>
      
      <p>Follow up with this lead as soon as possible to maximize conversion.</p>
      <p>Best regards,<br>Your ${data.businessName} Team</p>
    </div>
  `;
}

function generateAppointmentConfirmationEmail(data: {
  contactName: string;
  businessName: string;
  formattedDate: string;
  location?: string;
  notes?: string;
  businessPhone?: string;
  businessEmail?: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Appointment Confirmed</h2>
      <p>Hi ${data.contactName},</p>
      <p>Your appointment with ${data.businessName} has been confirmed.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date & Time:</strong> ${data.formattedDate}</p>
        ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
        ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
      </div>
      
      <p>If you need to reschedule or cancel, please contact us at:</p>
      <p>
        ${data.businessPhone ? `Phone: <a href="tel:${data.businessPhone}">${data.businessPhone}</a><br>` : ''}
        ${data.businessEmail ? `Email: <a href="mailto:${data.businessEmail}">${data.businessEmail}</a>` : ''}
      </p>
      
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>${data.businessName}</p>
    </div>
  `;
}

function generateAppointmentCancellationEmail(data: {
  contactName: string;
  businessName: string;
  businessPhone?: string;
  businessEmail?: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Appointment Cancelled</h2>
      <p>Hi ${data.contactName},</p>
      <p>Your appointment with ${data.businessName} has been cancelled.</p>
      
      <p>If you would like to reschedule, please contact us at:</p>
      <p>
        ${data.businessPhone ? `Phone: <a href="tel:${data.businessPhone}">${data.businessPhone}</a><br>` : ''}
        ${data.businessEmail ? `Email: <a href="mailto:${data.businessEmail}">${data.businessEmail}</a>` : ''}
      </p>
      
      <p>We apologize for any inconvenience.</p>
      <p>Best regards,<br>${data.businessName}</p>
    </div>
  `;
}

function generateOpportunityNotificationEmail(data: {
  businessName: string;
  value: number;
  status: string;
  contactName: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Opportunity Created!</h2>
      <p>Great news! A new opportunity has been created in your GoHighLevel account.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Opportunity Details:</h3>
        <p><strong>Value:</strong> $${data.value}</p>
        <p><strong>Status:</strong> ${data.status}</p>
        <p><strong>Contact:</strong> ${data.contactName}</p>
        <p><strong>Created:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <p>Log into your GoHighLevel account to view more details and take action.</p>
      <p>Best regards,<br>Your ${data.businessName} Team</p>
    </div>
  `;
}