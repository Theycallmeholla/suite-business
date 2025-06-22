import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import dns from 'dns/promises';

export async function POST(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get site with custom domain
    const site = await prisma.site.findFirst({
      where: {
        id: params.siteId,
        user: { email: session.user.email }
      },
      select: {
        customDomain: true,
        subdomain: true
      }
    });

    if (!site || !site.customDomain) {
      return NextResponse.json({ error: 'No custom domain configured' }, { status: 404 });
    }

    const domain = site.customDomain;
    const expectedCname = `sites.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'yourdomain.com'}`;
    const expectedIP = process.env.PLATFORM_IP || 'YOUR_SERVER_IP';

    const records: Array<{ type: string; status: 'valid' | 'invalid' | 'pending' }> = [];
    let allValid = true;

    // Check A record for root domain
    try {
      const aRecords = await dns.resolve4(domain);
      const hasValidA = aRecords.includes(expectedIP);
      records.push({
        type: 'A',
        status: hasValidA ? 'valid' : 'invalid'
      });
      if (!hasValidA) allValid = false;
    } catch (error) {
      records.push({ type: 'A', status: 'pending' });
      allValid = false;
    }

    // Check CNAME or A record for www subdomain
    try {
      const wwwDomain = `www.${domain}`;
      
      // First try CNAME
      try {
        const cnameRecords = await dns.resolveCname(wwwDomain);
        const hasValidCname = cnameRecords.some(record => 
          record.toLowerCase() === expectedCname.toLowerCase()
        );
        records.push({
          type: 'CNAME (www)',
          status: hasValidCname ? 'valid' : 'invalid'
        });
        if (!hasValidCname) allValid = false;
      } catch {
        // If CNAME fails, try A record
        const aRecords = await dns.resolve4(wwwDomain);
        const hasValidA = aRecords.includes(expectedIP);
        records.push({
          type: 'A (www)',
          status: hasValidA ? 'valid' : 'invalid'
        });
        if (!hasValidA) allValid = false;
      }
    } catch (error) {
      records.push({ type: 'www', status: 'pending' });
      allValid = false;
    }

    logger.info('Domain verification check', {
      action: 'verify_domain',
      domain,
      verified: allValid,
      records
    });

    return NextResponse.json({
      verified: allValid,
      records,
      domain
    });
  } catch (error) {
    logger.error('Failed to verify domain', {
      action: 'verify_domain',
      siteId: params.siteId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Failed to verify domain' },
      { status: 500 }
    );
  }
}