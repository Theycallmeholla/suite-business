import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { createGHLProClient } from '@/lib/ghl';
import { emailService } from '@/lib/email';

// POST /api/forms/submit - Submit a form (public endpoint)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formId, siteId, data } = body;

    // Get form configuration
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        siteId,
        enabled: true,
      },
      include: {
        site: {
          select: {
            ghlEnabled: true,
            ghlLocationId: true,
          }
        }
      }
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found or disabled' }, { status: 404 });
    }

    // Get request metadata
    const metadata = {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      referrer: request.headers.get('referer') || 'direct',
      timestamp: new Date().toISOString(),
    };

    // Create form submission
    const submission = await prisma.formSubmission.create({
      data: {
        formId,
        siteId,
        data,
        metadata,
      }
    });

    logger.info(`Form submission created: ${submission.id} for form ${formId}`);

    // Sync to GoHighLevel if enabled
    if (form.settings?.ghlSync && form.site.ghlEnabled && form.site.ghlLocationId) {
      try {
        const ghlClient = createGHLProClient();
        
        // Submit form data to GHL
        const ghlContact = await ghlClient.submitFormToGHL({
          locationId: form.site.ghlLocationId,
          formId: form.id,
          firstName: data.firstName || data.name?.split(' ')[0] || '',
          lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || '',
          email: data.email,
          phone: data.phone,
          message: data.message || JSON.stringify(data),
          source: `${form.name} Form`,
          customFields: data,
        });

        // Update submission with GHL contact ID
        if (ghlContact?.id) {
          await prisma.formSubmission.update({
            where: { id: submission.id },
            data: { ghlContactId: ghlContact.id }
          });
        }

        logger.info('Form submission synced to GHL', {
          submissionId: submission.id,
          ghlContactId: ghlContact?.id,
        });
      } catch (error) {
        logger.error('Error syncing to GHL:', error);
        // Don't fail the submission if GHL sync fails
      }
    }

    // Send email notification if enabled
    if (form.settings?.emailNotifications && form.settings?.notificationEmail) {
      try {
        // Get site details for email template
        const site = await prisma.site.findUnique({
          where: { id: siteId },
          select: { businessName: true, phone: true }
        });

        const emailTemplate = emailService.getContactFormTemplate({
          firstName: data.firstName || data.name?.split(' ')[0] || 'Form Submission',
          lastName: data.lastName || data.name?.split(' ').slice(1).join(' '),
          email: data.email,
          phone: data.phone,
          message: data.message || JSON.stringify(data, null, 2),
          businessName: site?.businessName || 'Your Business',
          formType: form.name,
        });

        await emailService.sendEmail({
          to: form.settings.notificationEmail,
          ...emailTemplate,
        });

        // Send auto-response if configured and email provided
        if (form.settings?.autoResponse && data.email) {
          const autoResponseTemplate = emailService.getContactAutoResponseTemplate({
            firstName: data.firstName || data.name?.split(' ')[0] || 'there',
            businessName: site?.businessName || 'Our Team',
            businessEmail: form.settings.notificationEmail,
            businessPhone: site?.phone,
          });

          await emailService.sendEmail({
            to: data.email,
            ...autoResponseTemplate,
          });
        }
      } catch (error) {
        logger.error('Error sending email notifications:', error);
        // Don't fail the submission if email fails
      }
    }

    return NextResponse.json({ 
      success: true,
      message: form.settings?.successMessage || 'Form submitted successfully',
      submissionId: submission.id 
    });
  } catch (error) {
    logger.error('Failed to submit form:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
