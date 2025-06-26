/**
 * Analytics Tracking API
 * 
 * Accepts analytics events from client sites and stores them
 * in the SiteAnalytics table.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { headers } from 'next/headers';

// Types for tracking events
interface TrackingEvent {
  siteId: string;
  eventType: 'pageview' | 'session' | 'lead' | 'conversion';
  url?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

// Helper to get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = headers().get('x-forwarded-for');
  const real = headers().get('x-real-ip');
  const ip = forwarded?.split(',')[0] || real || 'unknown';
  return ip;
}

// Helper to parse user agent for device info
function parseUserAgent(userAgent: string) {
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;
  
  let browser = 'Unknown';
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) browser = 'Chrome';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
  else if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/edge/i.test(userAgent)) browser = 'Edge';
  else if (/opera/i.test(userAgent)) browser = 'Opera';
  
  return {
    device: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    browser,
    isMobile,
    isTablet,
    isDesktop,
  };
}

// Helper to get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackingEvent = await request.json();
    
    // Validate required fields
    if (!body.siteId || !body.eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: siteId and eventType' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Verify site exists
    const site = await prisma.site.findUnique({
      where: { id: body.siteId },
      select: { id: true, subdomain: true },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Invalid site ID' },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get additional tracking info
    const ip = body.ip || getClientIp(request);
    const userAgent = body.userAgent || headers().get('user-agent') || '';
    const deviceInfo = parseUserAgent(userAgent);
    const referrer = body.referrer || headers().get('referer') || '';
    const todayDate = getTodayDate();

    // Get or create today's analytics record
    let analytics = await prisma.siteAnalytics.findUnique({
      where: {
        siteId_date: {
          siteId: body.siteId,
          date: todayDate,
        },
      },
    });

    if (!analytics) {
      analytics = await prisma.siteAnalytics.create({
        data: {
          siteId: body.siteId,
          date: todayDate,
          views: 0,
          leads: 0,
          conversions: 0,
          topPages: [],
          sources: {},
        },
      });
    }

    // Prepare update data
    const updateData: any = {};
    
    // Update metrics based on event type
    switch (body.eventType) {
      case 'pageview':
        updateData.views = { increment: 1 };
        
        // Update top pages
        const topPages = analytics.topPages as any[] || [];
        const pageUrl = body.url || '/';
        const pageIndex = topPages.findIndex((p: any) => p.url === pageUrl);
        
        if (pageIndex >= 0) {
          topPages[pageIndex].views += 1;
        } else {
          topPages.push({ url: pageUrl, views: 1 });
        }
        
        // Keep only top 10 pages
        topPages.sort((a: any, b: any) => b.views - a.views);
        updateData.topPages = topPages.slice(0, 10);
        
        // Update sources
        const sources = analytics.sources as any || {};
        const source = referrer ? new URL(referrer).hostname : 'direct';
        sources[source] = (sources[source] || 0) + 1;
        updateData.sources = sources;
        
        break;
        
      case 'lead':
        updateData.leads = { increment: 1 };
        break;
        
      case 'conversion':
        updateData.conversions = { increment: 1 };
        break;
        
      case 'session':
        // Handle session tracking
        // For now, we'll count unique sessions as views
        updateData.views = { increment: 1 };
        
        // Update bounce rate and session duration if provided
        if (body.metadata?.sessionDuration) {
          const currentAvgSession = analytics.avgSession || 0;
          const currentSessions = analytics.views || 0;
          const newAvgSession = Math.round(
            (currentAvgSession * currentSessions + body.metadata.sessionDuration) / (currentSessions + 1)
          );
          updateData.avgSession = newAvgSession;
        }
        
        if (body.metadata?.bounced !== undefined) {
          const currentBounceRate = analytics.bounceRate || 0;
          const currentSessions = analytics.views || 0;
          const bouncedSessions = Math.round(currentBounceRate * currentSessions / 100);
          const newBouncedSessions = bouncedSessions + (body.metadata.bounced ? 1 : 0);
          const newBounceRate = Math.round((newBouncedSessions / (currentSessions + 1)) * 100);
          updateData.bounceRate = newBounceRate;
        }
        
        break;
    }

    // Update analytics record
    await prisma.siteAnalytics.update({
      where: { id: analytics.id },
      data: updateData,
    });

    logger.info('Analytics event tracked', {
      metadata: {
        siteId: body.siteId,
        eventType: body.eventType,
        date: todayDate,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        source: referrer ? new URL(referrer).hostname : 'direct',
      }
    });

    return NextResponse.json({ 
      success: true,
      eventId: `${body.siteId}-${Date.now()}`,
    }, {
      headers: corsHeaders(),
    });

  } catch (error) {
    logger.error('Failed to track analytics event', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}

// OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, User-Agent',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Add CORS headers to POST response as well
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, User-Agent',
  };
}