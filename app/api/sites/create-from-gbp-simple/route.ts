import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSubdomain } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { validateSubdomain } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { locationId, businessName = 'Test Business' } = body;

    // Generate subdomain
    const baseSubdomain = generateSubdomain(businessName);
    let subdomain = baseSubdomain;
    let counter = 1;
    
    // Check if subdomain is already taken or reserved
    let subdomainValid = false;
    while (!subdomainValid) {
      const validation = validateSubdomain(subdomain);
      if (!validation.valid) {
        subdomain = `${baseSubdomain}-${counter}`;
        counter++;
        continue;
      }
      
      const existing = await prisma.site.findUnique({ where: { subdomain: subdomain.toLowerCase() } });
      if (existing) {
        subdomain = `${baseSubdomain}-${counter}`;
        counter++;
        continue;
      }
      
      subdomainValid = true;
    }

    // Create a simple site
    const site = await prisma.site.create({
      data: {
        userId: session.user.id,
        businessName,
        subdomain,
        email: session.user.email,
        industry: 'general',
        template: 'modern',
        primaryColor: '#22C55E',
        published: false,
      },
    });

    logger.info('Simple site created', { siteId: site.id });

    return NextResponse.json({
      id: site.id,
      subdomain: site.subdomain,
      businessName: site.businessName,
      url: `${subdomain}.${new URL(process.env.NEXTAUTH_URL!).hostname}`,
    });

  } catch (error) {
    logger.error('Simple create site error', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}
