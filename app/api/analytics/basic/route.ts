/**
 * Basic Analytics API
 * 
 * Provides analytics data using existing database tables
 * without requiring complex analytics setup.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const range = searchParams.get('range') || '30d';

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

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get analytics data
    const [
      totalContacts,
      recentContacts,
      analyticsData,
      previousPeriodContacts,
      previousPeriodAnalytics
    ] = await Promise.all([
      // Total contacts for this period
      prisma.contact.count({
        where: {
          siteId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Recent contacts
      prisma.contact.findMany({
        where: {
          siteId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          source: true,
          createdAt: true,
        },
      }),

      // Site analytics data
      prisma.siteAnalytics.findMany({
        where: {
          siteId,
          date: {
            gte: startDate.toISOString().split('T')[0],
            lte: endDate.toISOString().split('T')[0],
          },
        },
        orderBy: { date: 'asc' },
      }),

      // Previous period for comparison
      prisma.contact.count({
        where: {
          siteId,
          createdAt: {
            gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
            lt: startDate,
          },
        },
      }),

      // Previous period analytics
      prisma.siteAnalytics.findMany({
        where: {
          siteId,
          date: {
            gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())).toISOString().split('T')[0],
            lt: startDate.toISOString().split('T')[0],
          },
        },
      }),
    ]);

    // Calculate totals
    const totalViews = analyticsData.reduce((sum, day) => sum + day.views, 0);
    const totalLeads = analyticsData.reduce((sum, day) => sum + day.leads, 0);
    const totalConversions = analyticsData.reduce((sum, day) => sum + day.conversions, 0);

    const previousViews = previousPeriodAnalytics.reduce((sum, day) => sum + day.views, 0);
    const previousLeads = previousPeriodAnalytics.reduce((sum, day) => sum + day.leads, 0);

    // Calculate growth percentages
    const leadsGrowth = previousLeads > 0 ? 
      Math.round(((totalLeads - previousLeads) / previousLeads) * 100) : 
      totalLeads > 0 ? 100 : 0;

    const viewsGrowth = previousViews > 0 ? 
      Math.round(((totalViews - previousViews) / previousViews) * 100) : 
      totalViews > 0 ? 100 : 0;

    // Calculate conversion rate
    const conversionRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

    // Calculate average response time (mock data for now)
    const avgResponseTime = 2; // Hours - would calculate from actual response data

    // Group leads by source
    const sourceGroups = recentContacts.reduce((acc, contact) => {
      const source = contact.source || 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSources = Object.entries(sourceGroups)
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / totalContacts) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Generate monthly data
    const monthlyData = generateMonthlyData(analyticsData, range);

    // Format recent leads
    const recentLeads = recentContacts.map(contact => ({
      id: contact.id,
      name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown',
      email: contact.email || '',
      phone: contact.phone,
      source: contact.source || 'Direct',
      createdAt: contact.createdAt,
    }));

    const analyticsResponse = {
      totalLeads: totalContacts,
      leadsThisMonth: totalLeads,
      leadsGrowth,
      totalViews,
      viewsThisMonth: totalViews,
      viewsGrowth,
      conversionRate,
      avgResponseTime,
      topSources,
      recentLeads,
      monthlyData,
    };

    logger.info('Analytics data retrieved', {
      metadata: {
        siteId,
        range,
        totalLeads: totalContacts,
        totalViews,
      }
    });

    return NextResponse.json(analyticsResponse);

  } catch (error) {
    logger.error('Failed to fetch analytics data', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

/**
 * Generate monthly data for trends
 */
function generateMonthlyData(analyticsData: any[], range: string) {
  const monthlyMap = new Map<string, { leads: number; views: number }>();

  // Group data by month
  analyticsData.forEach(day => {
    const date = new Date(day.date);
    const monthKey = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });

    const existing = monthlyMap.get(monthKey) || { leads: 0, views: 0 };
    monthlyMap.set(monthKey, {
      leads: existing.leads + day.leads,
      views: existing.views + day.views,
    });
  });

  // Convert to array and sort
  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      leads: data.leads,
      views: data.views,
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Limit based on range
  const maxMonths = range === '7d' ? 1 : range === '30d' ? 3 : 6;
  return monthlyData.slice(-maxMonths);
}