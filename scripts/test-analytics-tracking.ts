#!/usr/bin/env ts-node

/**
 * Test Analytics Tracking
 * 
 * This script generates sample analytics events to test the tracking system.
 * Run with: npx ts-node scripts/test-analytics-tracking.ts
 * 
 * Created: June 2025, 11:00 AM CST
 */

import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

// Configuration
const API_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
const TRACKING_ENDPOINT = `${API_URL}/api/analytics/track`;

// Sample user agents for different devices
const userAgents = {
  desktop: {
    chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Safari/537.36',
    firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  },
  mobile: {
    iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    android: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  },
  tablet: {
    ipad: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  },
};

// Sample referrers
const referrers = [
  'https://www.google.com/search?q=landscaping+services',
  'https://www.facebook.com/',
  'https://www.bing.com/search?q=lawn+care',
  'https://www.nextdoor.com/',
  '', // Direct traffic
];

// Sample pages
const pages = [
  '/',
  '/services',
  '/about',
  '/contact',
  '/services/lawn-mowing',
  '/services/landscape-design',
  '/blog/spring-lawn-care-tips',
];

// Helper to send tracking event
async function sendTrackingEvent(event: any) {
  try {
    const response = await fetch(TRACKING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': event.userAgent || userAgents.desktop.chrome,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    logger.error('Failed to send tracking event', { event }, error as Error);
    throw error;
  }
}

// Generate random events for a site
async function generateEventsForSite(siteId: string, numEvents: number = 50) {
  logger.info(`Generating ${numEvents} events for site ${siteId}`);

  const events = [];
  const sessions = new Map<string, any>();

  // Generate events
  for (let i = 0; i < numEvents; i++) {
    // Random device type
    const deviceTypes = ['desktop', 'mobile', 'tablet'];
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)] as keyof typeof userAgents;
    const browsers = Object.keys(userAgents[deviceType]);
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const userAgent = userAgents[deviceType][browser as keyof typeof userAgents[typeof deviceType]];

    // Random session (70% chance of existing session)
    let sessionId;
    if (Math.random() < 0.7 && sessions.size > 0) {
      const sessionIds = Array.from(sessions.keys());
      sessionId = sessionIds[Math.floor(Math.random() * sessionIds.length)];
    } else {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2)}`;
      sessions.set(sessionId, {
        start: Date.now(),
        pageviews: 0,
      });
    }

    const session = sessions.get(sessionId);
    session.pageviews++;

    // Random page
    const url = pages[Math.floor(Math.random() * pages.length)];

    // Random referrer (30% chance of having referrer)
    const referrer = Math.random() < 0.3 ? referrers[Math.floor(Math.random() * referrers.length)] : '';

    // Create pageview event
    const pageviewEvent = {
      siteId,
      eventType: 'pageview' as const,
      url: `${API_URL}${url}`,
      referrer,
      userAgent,
      sessionId,
    };

    events.push(pageviewEvent);

    // 20% chance of generating a lead event
    if (Math.random() < 0.2) {
      const leadEvent = {
        siteId,
        eventType: 'lead' as const,
        url: `${API_URL}/contact`,
        referrer,
        userAgent,
        sessionId,
        metadata: {
          source: url === '/contact' ? 'contact-form' : 'quote-request',
        },
      };
      events.push(leadEvent);
    }

    // 10% chance of generating a conversion event
    if (Math.random() < 0.1) {
      const conversionEvent = {
        siteId,
        eventType: 'conversion' as const,
        url: `${API_URL}/thank-you`,
        referrer,
        userAgent,
        sessionId,
        metadata: {
          type: 'appointment-scheduled',
          value: Math.floor(Math.random() * 500) + 100,
        },
      };
      events.push(conversionEvent);
    }

    // Add small delay to avoid overwhelming the server
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Send session end events
  for (const [sessionId, sessionData] of sessions) {
    const sessionDuration = Math.floor(Math.random() * 600) + 30; // 30s to 10min
    const bounced = sessionData.pageviews === 1 && sessionDuration < 60;

    const sessionEvent = {
      siteId,
      eventType: 'session' as const,
      sessionId,
      metadata: {
        sessionDuration,
        bounced,
        pageLoadTime: Math.floor(Math.random() * 3000) + 500, // 500ms to 3.5s
      },
    };
    events.push(sessionEvent);
  }

  // Send all events
  logger.info(`Sending ${events.length} tracking events...`);
  
  for (const event of events) {
    try {
      await sendTrackingEvent(event);
    } catch (error) {
      logger.error('Failed to send event', { event }, error as Error);
    }
  }

  logger.info(`Successfully sent tracking events for site ${siteId}`);
}

// Main function
async function main() {
  try {
    // Get a test site or use provided site ID
    const siteId = process.argv[2];
    
    if (!siteId) {
      // Find a site to test with
      const site = await prisma.site.findFirst({
        where: { published: true },
        select: { id: true, businessName: true, subdomain: true },
      });

      if (!site) {
        logger.error('No published sites found. Please create and publish a site first.');
        process.exit(1);
      }

      logger.info(`Using site: ${site.businessName} (${site.subdomain})`);
      await generateEventsForSite(site.id);
    } else {
      // Verify site exists
      const site = await prisma.site.findUnique({
        where: { id: siteId },
        select: { id: true, businessName: true },
      });

      if (!site) {
        logger.error(`Site with ID ${siteId} not found`);
        process.exit(1);
      }

      logger.info(`Generating events for: ${site.businessName}`);
      await generateEventsForSite(site.id);
    }

    // Display summary
    const analytics = await prisma.siteAnalytics.findMany({
      where: {
        siteId: siteId || undefined,
        date: new Date().toISOString().split('T')[0],
      },
    });

    if (analytics.length > 0) {
      const stats = analytics[0];
      logger.info('Today\'s analytics summary:', {
        views: stats.views,
        leads: stats.leads,
        conversions: stats.conversions,
        bounceRate: stats.bounceRate,
        avgSession: stats.avgSession,
      });
    }

  } catch (error) {
    logger.error('Test failed', {}, error as Error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
main();