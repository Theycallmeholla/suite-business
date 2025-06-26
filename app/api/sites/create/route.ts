import { NextRequest, NextResponse } from 'next/server';
import { createGHLProClient } from '@/lib/ghl';
import { logger } from '@/lib/logger';
// import { prisma } from '@/lib/prisma'; // You'll need to set this up

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Generate subdomain from business name
    const subdomain = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Create GHL sub-account
    const ghlClient = createGHLProClient();
    let ghlLocationId = null;
    
    try {
      const ghlAccount = await ghlClient.createSaasSubAccount({
        businessName: data.businessName,
        email: data.email,
        phone: data.phone,
        address: `${data.address}, ${data.city}, ${data.state} ${data.zip}`,
        industry: data.industry || 'general', // Use industry from request data
        website: data.website,
      });
      ghlLocationId = ghlAccount.id;
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'create_saas_subaccount',
        metadata: { businessName: data.businessName }
      });
      // Continue without GHL for now
    }
    
    // Create site in database
    // const site = await prisma.site.create({
    //   data: {
    //     businessName: data.businessName,
    //     subdomain,
    //     phone: data.phone,
    //     email: data.email,
    //     address: data.address,
    //     city: data.city,
    //     state: data.state,
    //     zip: data.zip,
    //     ghlLocationId,
    //     userId: 'temp-user-id', // Get from session
    //   },
    // });
    
    // For now, return mock data
    const site = {
      id: 'mock-site-id',
      subdomain,
      businessName: data.businessName,
    };
    
    // Set up default pages
    await setupDefaultPages(site.id);
    
    // Set up SEO tasks
    await createSeoTasks(site.id);
    
    return NextResponse.json({
      success: true,
      siteId: site.id,
      subdomain: site.subdomain,
    });
  } catch (error) {
    logger.apiError('sites/create', error as Error, {
      action: 'create_site'
    });
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}

async function setupDefaultPages(siteId: string) {
  // Create default pages for landscaping site
  const defaultPages = [
    {
      slug: 'home',
      title: 'Home',
      type: 'home',
      content: {
        hero: {
          type: 'centered',
          title: 'Professional Landscaping Services',
          subtitle: 'Transform your outdoor space',
          cta: 'Get Free Quote',
        },
        sections: ['services', 'about', 'testimonials', 'contact'],
      },
    },
    {
      slug: 'services',
      title: 'Our Services',
      type: 'services',
      content: {},
    },
    {
      slug: 'about',
      title: 'About Us',
      type: 'about',
      content: {},
    },
    {
      slug: 'contact',
      title: 'Contact',
      type: 'contact',
      content: {},
    },
  ];
  
  // Would save to database
  // await prisma.page.createMany({ data: pages });
}

async function createSeoTasks(siteId: string) {
  const tasks = [
    'Set up Google Business Profile',
    'Add business to local directories',
    'Create service area pages',
    'Optimize meta descriptions',
    'Add schema markup',
    'Submit sitemap to Google',
    'Set up Google Analytics',
    'Create first blog post',
  ];
  
  // Would save to database
  // await prisma.seoTask.createMany({
  //   data: tasks.map(task => ({ siteId, task })),
  // });
}
