import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSiteSchema = z.object({
  businessName: z.string().min(1),
  subdomain: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
  industry: z.string(),
  template: z.string(),
  primaryColor: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  description: z.string().optional(),
  services: z.array(z.string()).optional(),
  serviceAreas: z.array(z.string()).optional(),
  googleBusinessId: z.string().optional(),
  website: z.string().optional(),
  coordinates: z.any().optional(),
  serviceArea: z.any().optional(),
  regularHours: z.any().optional(),
  specialHours: z.any().optional(),
  categories: z.array(z.string()).optional(),
  manualSetup: z.boolean().optional(),
  gbpPlaceId: z.string().optional(),
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
    const validatedData = createSiteSchema.parse(body);

    // Check if subdomain is already taken
    const existingSubdomain = await prisma.site.findUnique({
      where: { subdomain: validatedData.subdomain },
    });

    if (existingSubdomain) {
      return NextResponse.json(
        { error: 'This subdomain is already taken' },
        { status: 400 }
      );
    }

    // Create the site
    const site = await prisma.site.create({
      data: {
        userId: session.user.id,
        businessName: validatedData.businessName,
        subdomain: validatedData.subdomain,
        template: validatedData.template,
        primaryColor: validatedData.primaryColor,
        phone: validatedData.phone,
        email: validatedData.email || session.user.email,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zip: validatedData.zip,
        metaDescription: validatedData.description,
        businessHours: validatedData.regularHours,
        serviceAreas: validatedData.serviceAreas,
        manualSetup: validatedData.manualSetup || false,
        gbpPlaceId: validatedData.gbpPlaceId,
        industry: validatedData.industry || 'general',
        published: true, // Auto-publish for now
      },
    });

    // Create default pages
    const defaultPages = [
      {
        siteId: site.id,
        slug: 'home',
        title: 'Home',
        type: 'home',
        content: {
          hero: {
            title: `Welcome to ${validatedData.businessName}`,
            subtitle: validatedData.description || 'Professional service you can trust',
          },
          services: validatedData.services || [],
          hours: validatedData.regularHours,
          serviceArea: validatedData.serviceArea,
        },
      },
      {
        siteId: site.id,
        slug: 'services',
        title: 'Services',
        type: 'services',
        content: {
          services: validatedData.services?.map(name => ({
            name,
            description: '',
          })) || [],
        },
      },
      {
        siteId: site.id,
        slug: 'contact',
        title: 'Contact',
        type: 'contact',
        content: {
          phone: validatedData.phone,
          address: validatedData.address,
        },
      },
    ];

    await prisma.page.createMany({
      data: defaultPages,
    });

    // Create services if provided
    if (validatedData.services?.length) {
      await prisma.service.createMany({
        data: validatedData.services.map((name, index) => ({
          siteId: site.id,
          name,
          order: index,
        })),
      });
    }

    return NextResponse.json(site);

  } catch (error) {
    console.error('Create site error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sites = await prisma.site.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sites);

  } catch (error) {
    console.error('Get sites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}