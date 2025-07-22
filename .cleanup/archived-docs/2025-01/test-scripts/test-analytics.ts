/**
 * Test Analytics Tracking
 * 
 * Script to generate sample analytics events for testing
 * 
 * Usage: npm run test:analytics <siteId>
 */

import { logger } from '../lib/logger';
import { logger } from '@/lib/logger';

async function generateTestEvents(siteId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const trackingEndpoint = `${baseUrl}/api/analytics/track`;

  logger.info('Starting analytics test', { metadata: { siteId, endpoint: trackingEndpoint } });

  // Sample pages and referrers
  const pages = ['/', '/services', '/about', '/contact', '/landscaping/lawn-care'];
  const referrers = [
    'https://google.com',
    'https://facebook.com',
    'https://bing.com',
    'https://instagram.com',
    'direct',
  ];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/91.0.4472.80 Mobile/15E148 Safari/604.1',
  ];

  // Generate pageviews
  logger.info('Generating pageview events...');
  for (let i = 0; i < 20; i++) {
    const page = pages[Math.floor(Math.random() * pages.length)];
    const referrer = referrers[Math.floor(Math.random() * referrers.length)];
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    try {
      const response = await fetch(trackingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
        },
        body: JSON.stringify({
          siteId,
          eventType: 'pageview',
          url: `${baseUrl}${page}`,
          referrer: referrer === 'direct' ? '' : referrer,
          userAgent,
        }),
      });

      if (!response.ok) {
        logger.error('Failed to track pageview', { 
          metadata: { 
            status: response.status, 
            error: await response.text() 
          } 
        });
      } else {
        logger.info(`Tracked pageview: ${page}`);
      }
    } catch (_error: unknown) {
      logger.error('Error tracking pageview', {}, error as Error);
    }

    // Small delay between events
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Generate some leads
  logger.info('Generating lead events...');
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(trackingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          eventType: 'lead',
          metadata: {
            source: referrers[Math.floor(Math.random() * referrers.length)],
          },
        }),
      });

      if (!response.ok) {
        logger.error('Failed to track lead', { 
          metadata: { 
            status: response.status, 
            error: await response.text() 
          } 
        });
      } else {
        logger.info('Tracked lead event');
      }
    } catch (_error: unknown) {
      logger.error('Error tracking lead', {}, error as Error);
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Generate some conversions
  logger.info('Generating conversion events...');
  for (let i = 0; i < 2; i++) {
    try {
      const response = await fetch(trackingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          eventType: 'conversion',
          metadata: {
            type: 'form_submission',
            value: Math.floor(Math.random() * 1000) + 100,
          },
        }),
      });

      if (!response.ok) {
        logger.error('Failed to track conversion', { 
          metadata: { 
            status: response.status, 
            error: await response.text() 
          } 
        });
      } else {
        logger.info('Tracked conversion event');
      }
    } catch (_error: unknown) {
      logger.error('Error tracking conversion', {}, error as Error);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Generate session events with varying durations
  logger.info('Generating session events...');
  for (let i = 0; i < 10; i++) {
    const sessionDuration = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
    const bounced = Math.random() < 0.3; // 30% bounce rate

    try {
      const response = await fetch(trackingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          eventType: 'session',
          metadata: {
            sessionDuration,
            bounced,
          },
        }),
      });

      if (!response.ok) {
        logger.error('Failed to track session', { 
          metadata: { 
            status: response.status, 
            error: await response.text() 
          } 
        });
      } else {
        logger.info(`Tracked session: ${sessionDuration}s, bounced: ${bounced}`);
      }
    } catch (_error: unknown) {
      logger.error('Error tracking session', {}, error as Error);
    }

    await new Promise(resolve => setTimeout(resolve, 150));
  }

  logger.info('Analytics test complete!');
}

// Main execution
const siteId = process.argv[2];

if (!siteId) {
  logger.error('Please provide a site ID as an argument');
  logger.info('Usage: npm run test:analytics <siteId>');
  process.exit(1);
}

generateTestEvents(siteId)
  .then(() => {
    logger.info('Test completed successfully');
    process.exit(0);
  })
  .catch((_error) => {
    logger.error('Test failed', {}, error);
    process.exit(1);
  });