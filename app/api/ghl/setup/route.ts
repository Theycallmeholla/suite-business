import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { createGHLProClient } from '@/lib/ghl';

const setupSchema = z.object({
  siteId: z.string(),
  businessName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  industry: z.string(),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { siteId, businessName, email, phone, address, industry, website } = setupSchema.parse(body);

    logger.info('Setting up GoHighLevel for site', {
      metadata: { siteId, businessName }
    });

    // Verify site ownership
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

    // Check if GHL is already set up
    if (site.ghlLocationId) {
      logger.info('GoHighLevel already set up for site', {
      metadata: { 
        siteId, 
        ghlLocationId: site.ghlLocationId 
      }
    });
      return NextResponse.json({
        ghlLocationId: site.ghlLocationId,
        ghlEnabled: site.ghlEnabled,
      });
    }

    try {
      // Create GHL client
      const ghlClient = createGHLProClient();

      // Create sub-account in GoHighLevel
      const ghlLocation = await ghlClient.createSaasSubAccount({
        businessName,
        email,
        phone,
        address,
        industry,
        website,
      });

      // Set up custom fields for the industry
      const { industryAutomations } = await import('@/lib/ghl');
      const industryConfig = industryAutomations[industry as keyof typeof industryAutomations];
      
      if (industryConfig?.customFields) {
        logger.info('Creating custom fields for industry', {
      metadata: { industry, fieldsCount: industryConfig.customFields.length }
    });
        
        for (const fieldConfig of industryConfig.customFields) {
          try {
            await ghlClient.createCustomField(ghlLocation.id, fieldConfig);
          } catch (fieldError) {
            logger.warn('Failed to create custom field', {
      metadata: { 
              field: fieldConfig.name, 
              error: fieldError 
            }
    });
          }
        }
      }

      // Update site with GHL information
      await prisma.site.update({
        where: { id: siteId },
        data: {
          ghlLocationId: ghlLocation.id,
          ghlEnabled: true,
          // Note: We don't store the API key here for security
        },
      });

      logger.info('GoHighLevel setup completed successfully', {
      metadata: {
        siteId,
        ghlLocationId: ghlLocation.id,
      }
    });

      return NextResponse.json({
        ghlLocationId: ghlLocation.id,
        ghlEnabled: true,
        message: 'GoHighLevel sub-account created successfully',
      });

    } catch (ghlError: any) {
      logger.error('GoHighLevel setup failed', {
      metadata: { 
        error: ghlError,
        message: ghlError.message,
        siteId 
      }
    });
      
      // Don't fail the entire operation, just log and return partial success
      return NextResponse.json({
        ghlLocationId: null,
        ghlEnabled: false,
        error: 'GoHighLevel setup failed but site was created',
        details: ghlError.message,
      });
    }

  } catch (error) {
    logger.error('GHL setup endpoint error', {
      metadata: { error }
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to set up GoHighLevel' },
      { status: 500 }
    );
  }
}
