/**
 * Analytics Test Endpoint
 * 
 * Creates sample analytics data for testing purposes.
 * This endpoint should be removed or protected in production.
 * 
 * Created: June 2025, 11:15 AM CST
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId, days = 7 } = await request.json();

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID required' }, { status: 400 });
    }

    // Verify user owns this site
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: session.user.id,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Generate analytics data for the past N days
    const today = new Date();
    const analytics = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Generate random metrics
      const views = Math.floor(Math.random() * 500) + 100;
      const leads = Math.floor(Math.random() * (views * 0.1)) + 1;
      const conversions = Math.floor(Math.random() * (leads * 0.5));
      const bounceRate = Math.floor(Math.random() * 30) + 40; // 40-70%
      const avgSession = Math.floor(Math.random() * 180) + 60; // 60-240 seconds

      // Top pages
      const topPages = [
        { url: '/', views: Math.floor(views * 0.4) },
        { url: '/services', views: Math.floor(views * 0.2) },
        { url: '/about', views: Math.floor(views * 0.15) },
        { url: '/contact', views: Math.floor(views * 0.15) },
        { url: '/blog', views: Math.floor(views * 0.1) },
      ];

      // Traffic sources
      const sources = {
        'google.com': Math.floor(views * 0.4),
        'direct': Math.floor(views * 0.3),
        'facebook.com': Math.floor(views * 0.15),
        'bing.com': Math.floor(views * 0.1),
        'nextdoor.com': Math.floor(views * 0.05),
      };

      // Create or update analytics record
      const analyticsData = await prisma.siteAnalytics.upsert({
        where: {
          siteId_date: {
            siteId: siteId,
            date: dateStr,
          },
        },
        update: {
          views,
          leads,
          conversions,
          bounceRate,
          avgSession,
          topPages,
          sources,
        },
        create: {
          siteId,
          date: dateStr,
          views,
          leads,
          conversions,
          bounceRate,
          avgSession,
          topPages,
          sources,
        },
      });

      analytics.push(analyticsData);
    }

    // Create some sample contacts for today
    const contactsToCreate = Math.floor(Math.random() * 5) + 1;
    const contacts = [];

    for (let i = 0; i < contactsToCreate; i++) {
      const sources = ['Google', 'Facebook', 'Direct', 'Referral', 'Organic'];
      const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];

      const contact = await prisma.contact.create({
        data: {
          siteId,
          firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
          lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
          email: `test${Date.now()}${i}@example.com`,
          phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          source: sources[Math.floor(Math.random() * sources.length)],
          tags: ['test', 'sample'],
        },
      });

      contacts.push(contact);
    }

    logger.info('Test analytics data created', {
      metadata: {
        siteId,
        days,
        analyticsRecords: analytics.length,
        contactsCreated: contacts.length,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Created ${analytics.length} days of analytics data and ${contacts.length} sample contacts`,
      analytics: analytics.map(a => ({
        date: a.date,
        views: a.views,
        leads: a.leads,
        conversions: a.conversions,
      })),
    });

  } catch (error) {
    logger.error('Failed to create test analytics data', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to create test data' },
      { status: 500 }
    );
  }
}