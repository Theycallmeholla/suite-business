import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { createGHLProClient } from '@/lib/ghl';
import { emailService } from '@/lib/email';
import { getAuthSession } from '@/lib/auth';

const leadSubmissionSchema = z.object({
  siteId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
  formType: z.string().optional(), // 'contact', 'quote', 'appointment', etc.
  customFields: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const leadData = leadSubmissionSchema.parse(body);

    logger.info('Processing lead submission', {
      metadata: { 
      siteId: leadData.siteId,
      email: leadData.email,
    }
    });

    // Get site details including GHL configuration
    const site = await prisma.site.findUnique({
      where: { id: leadData.siteId },
      select: {
        id: true,
        businessName: true,
        ghlLocationId: true,
        ghlEnabled: true,
        industry: true,
        email: true,
        phone: true,
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Validate that either email or phone is provided
    if (!leadData.email && !leadData.phone) {
      return NextResponse.json(
        { error: 'Either email or phone is required' },
        { status: 400 }
      );
    }

    // TODO: Store lead in local database for backup/analytics
    // This would be a new Lead model in Prisma

    // Sync with GoHighLevel if enabled
    if (site.ghlEnabled && site.ghlLocationId) {
      try {
        const ghlClient = createGHLProClient();
        
        // Prepare tags based on form type and source
        const tags = [
          'website-lead',
          leadData.formType || 'contact-form',
          leadData.source || 'website',
          site.industry,
        ].filter(Boolean);

        // Create contact in GHL
        const ghlContact = await ghlClient.createContact(site.ghlLocationId, {
          firstName: leadData.firstName,
          lastName: leadData.lastName,
          email: leadData.email,
          phone: leadData.phone,
          source: `Website - ${leadData.formType || 'Contact Form'}`,
          tags,
          customFields: {
            ...leadData.customFields,
            website_message: leadData.message,
            submission_date: new Date().toISOString(),
            form_type: leadData.formType,
          },
        });

        logger.info('Lead synced to GoHighLevel', {
      metadata: {
          siteId: site.id,
          ghlContactId: ghlContact.id,
        }
    });

        // Send notification email to business owner
        if (site.email) {
          const emailTemplate = emailService.getContactFormTemplate({
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            email: leadData.email,
            phone: leadData.phone,
            message: leadData.message,
            businessName: site.businessName,
            formType: leadData.formType,
          });

          await emailService.sendEmail({
            to: site.email,
            ...emailTemplate,
          });

          // Send auto-response to lead if they provided email
          if (leadData.email) {
            const autoResponseTemplate = emailService.getContactAutoResponseTemplate({
              firstName: leadData.firstName,
              businessName: site.businessName,
              businessEmail: site.email || undefined,
              businessPhone: site.phone || undefined,
            });

            await emailService.sendEmail({
              to: leadData.email,
              ...autoResponseTemplate,
            });
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Thank you for your submission. We\'ll be in touch soon!',
          ghlContactId: ghlContact.id,
        });

      } catch (ghlError) {
        logger.error('Failed to sync lead to GoHighLevel', {
      metadata: { 
          error: ghlError,
          siteId: site.id,
        }
    });
        
        // Don't fail the submission if GHL sync fails
        // Still return success to the user
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your submission. We\'ll be in touch soon!',
    });

  } catch (error) {
    logger.error('Lead submission error', {
      metadata: { error }
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid submission data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve leads for a site (authenticated)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Verify the user owns this site
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: session.user.id,
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found or unauthorized' },
        { status: 404 }
      );
    }

    // TODO: Retrieve leads from database
    // This would query the Lead model once it's created in the schema

    return NextResponse.json({
      leads: [],
      message: 'Lead retrieval not yet implemented',
    });

  } catch (error) {
    logger.error('Get leads error', {
      metadata: { error }
    });
    
    return NextResponse.json(
      { error: 'Failed to retrieve leads' },
      { status: 500 }
    );
  }
}
