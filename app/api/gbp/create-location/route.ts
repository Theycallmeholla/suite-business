import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const createLocationSchema = z.object({
  siteId: z.string(),
  businessInfo: z.object({
    title: z.string(),
    address: z.object({
      addressLines: z.array(z.string()),
      locality: z.string(),
      administrativeArea: z.string(),
      postalCode: z.string(),
      regionCode: z.string(),
    }),
    phoneNumbers: z.object({
      primary: z.string(),
    }).optional(),
    websiteUri: z.string().optional(),
    regularHours: z.any().optional(),
    businessType: z.enum(['LOCATION', 'SERVICE_AREA', 'HYBRID']),
    serviceAreas: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    profile: z.object({
      description: z.string().optional(),
    }).optional(),
  }),
  verificationInfo: z.object({
    contactName: z.string(),
    contactPhone: z.string(),
    contactEmail: z.string(),
    method: z.enum(['postcard', 'phone', 'email', 'instant']),
  }),
  hideAddress: z.boolean().optional(),
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
    const validatedData = createLocationSchema.parse(body);

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: {
        id: validatedData.siteId,
        userId: session.user.id,
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Check if site already has GBP
    if (site.gbpLocationId) {
      return NextResponse.json(
        { error: 'This site already has a Google Business Profile' },
        { status: 400 }
      );
    }

    // Get user's Google account access token
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { error: 'Google account not connected' },
        { status: 401 }
      );
    }

    logger.info('Creating Google Business Profile', {
      metadata: {
      action: 'gbp_create_location',
      siteId: validatedData.siteId,
      businessName: validatedData.businessInfo.title,
    }
    });

    // For development/demo purposes, simulate the creation
    // In production, this would make actual API calls to Google Business Profile API
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Simulate API response
      const mockLocationId = `mock-location-${Date.now()}`;
      const mockResponse = {
        name: `accounts/mock-account/locations/${mockLocationId}`,
        locationName: validatedData.businessInfo.title,
        primaryPhone: validatedData.businessInfo.phoneNumbers?.primary,
        address: validatedData.businessInfo.address,
        websiteUri: validatedData.businessInfo.websiteUri,
        regularHours: validatedData.businessInfo.regularHours,
        locationState: {
          isVerified: false,
          canUpdate: true,
          canDelete: false,
          isDisabled: false,
          isPublished: false,
          isDisconnected: false,
          isPendingReview: true,
          isLocalPostApiDisabled: false,
        },
        metadata: {
          duplicateLocation: null,
          canOperateLodgingData: false,
          canOperateHealthData: false,
        },
      };

      // Update site with mock GBP location ID
      await prisma.site.update({
        where: { id: validatedData.siteId },
        data: {
          gbpLocationId: mockLocationId,
          gbpCreationStatus: 'pending',
          gbpVerificationRequired: true,
        },
      });

      logger.info('Mock GBP location created', {
      metadata: {
        action: 'gbp_create_success_mock',
        locationId: mockLocationId,
      }
    });

      return NextResponse.json({
        success: true,
        locationId: mockLocationId,
        verificationRequired: true,
        message: 'Google Business Profile created successfully (development mode)',
        location: mockResponse,
      });
    }

    // Production implementation would go here
    // This would include:
    // 1. First, search for the business account
    // 2. Create the location using the Google Business Profile API
    // 3. Handle verification options
    // 4. Update the site record with the real location ID

    // For now, return a message indicating production implementation needed
    return NextResponse.json(
      { 
        error: 'Google Business Profile creation is not yet implemented in production',
        details: 'Please contact support for assistance with GBP creation',
      },
      { status: 501 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('GBP creation error', {
      metadata: {
      action: 'gbp_create_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
    });

    return NextResponse.json(
      { error: 'Failed to create Google Business Profile' },
      { status: 500 }
    );
  }
}

// GET endpoint to check GBP creation status
export async function GET(request: NextRequest) {
  try {
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

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: session.user.id,
      },
      select: {
        gbpLocationId: true,
        gbpCreationStatus: true,
        gbpVerificationRequired: true,
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      hasGBP: !!site.gbpLocationId,
      status: site.gbpCreationStatus,
      verificationRequired: site.gbpVerificationRequired,
    });

  } catch (error) {
    logger.error('GBP status check error', {
      metadata: {
      action: 'gbp_status_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
    });

    return NextResponse.json(
      { error: 'Failed to check GBP status' },
      { status: 500 }
    );
  }
}