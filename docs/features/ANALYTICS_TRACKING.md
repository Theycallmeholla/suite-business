# Analytics Tracking System

**Created**: June 2025, 11:30 AM CST  
**Last Updated**: June 2025, 11:30 AM CST

## Overview

Sitebango includes a comprehensive analytics tracking system that automatically monitors visitor behavior, tracks conversions, and provides insights into site performance. The system is designed to be lightweight, privacy-conscious, and easy to implement.

## Features

### Automatic Tracking
- **Page Views**: Every page load is automatically tracked
- **Sessions**: User sessions with duration and bounce rate calculation
- **Device Detection**: Identifies mobile, tablet, and desktop visitors
- **Browser Detection**: Tracks Chrome, Safari, Firefox, Edge, and Opera
- **Traffic Sources**: Monitors referrer data to understand traffic origins

### Manual Tracking
- **Lead Tracking**: Track form submissions and contact requests
- **Conversion Tracking**: Monitor specific conversion events with values
- **Custom Events**: Flexible API for tracking any custom event

### Data Collection
- **Daily Aggregation**: Data is aggregated by day for performance
- **Real-time Updates**: Events are processed in real-time
- **Session Management**: 30-minute session timeout with activity tracking
- **Performance Metrics**: Page load times and session durations

## Implementation

### 1. Automatic Implementation (Recommended)

The analytics script is automatically included on all published sites. No additional setup is required.

```html
<!-- Automatically added to all sites -->
<script src="/analytics.js" data-site-id="YOUR_SITE_ID" defer></script>
```

### 2. Manual Implementation

For custom domains or external sites, include the full URL:

```html
<script src="https://yourdomain.com/analytics.js" data-site-id="YOUR_SITE_ID" defer></script>
```

### 3. Tracking Custom Events

Use the global `SitebangoAnalytics` object to track custom events:

```javascript
// Track a lead (e.g., after form submission)
SitebangoAnalytics.trackLead('contact-form');

// Track a conversion with value
SitebangoAnalytics.trackConversion('appointment-scheduled', 250);

// The analytics object is available globally
if (window.SitebangoAnalytics) {
  // Analytics is loaded and ready
}
```

## API Endpoints

### Track Event
`POST /api/analytics/track`

Accepts tracking events from client sites.

**Request Body:**
```json
{
  "siteId": "string",
  "eventType": "pageview | session | lead | conversion",
  "url": "string (optional)",
  "referrer": "string (optional)",
  "userAgent": "string (optional)",
  "sessionId": "string (optional)",
  "metadata": {
    // Additional event-specific data
  }
}
```

### Get Analytics Data
`GET /api/analytics/basic?siteId=XXX&range=30d`

Returns aggregated analytics data for a site.

**Query Parameters:**
- `siteId`: The site ID to get analytics for
- `range`: Time range (7d, 30d, 90d)

**Response:**
```json
{
  "totalLeads": 150,
  "leadsThisMonth": 45,
  "leadsGrowth": 23,
  "totalViews": 3500,
  "viewsThisMonth": 1200,
  "viewsGrowth": 15,
  "conversionRate": 3.75,
  "avgResponseTime": 2,
  "topSources": [
    {"source": "google.com", "count": 450, "percentage": 37},
    {"source": "direct", "count": 380, "percentage": 31}
  ],
  "recentLeads": [...],
  "monthlyData": [...]
}
```

## Data Storage

Analytics data is stored in the `SiteAnalytics` table with the following structure:

- **Daily Aggregation**: One record per site per day
- **Metrics**: Views, leads, conversions, bounce rate, average session duration
- **Top Pages**: Array of most visited pages with view counts
- **Traffic Sources**: Object mapping sources to visit counts

## Privacy & Compliance

- **No Personal Data**: The system doesn't collect personally identifiable information
- **No Cookies**: Uses sessionStorage instead of cookies
- **IP Anonymization**: IP addresses are not stored
- **CORS Enabled**: Supports cross-domain tracking

## Testing

### Generate Test Data

Use the test script to generate sample analytics data:

```bash
# Generate data for a specific site
npx ts-node scripts/test-analytics-tracking.ts SITE_ID

# Generate data for the first published site
npx ts-node scripts/test-analytics-tracking.ts
```

### Create Test Analytics via API

```bash
# Create 7 days of test data
curl -X POST http://localhost:3000/api/analytics/test \
  -H "Content-Type: application/json" \
  -d '{"siteId": "YOUR_SITE_ID", "days": 7}'
```

### View Analytics Demo

Open `/analytics-demo.html` in your browser to see the tracking system in action.

## Dashboard Integration

Analytics data is displayed in the site dashboard at:
- `/dashboard/sites/[id]/analytics` - Detailed analytics for a specific site
- `/dashboard/analytics` - Overview of all sites

The dashboard shows:
- Real-time metrics with growth indicators
- Traffic source breakdown
- Recent leads and contacts
- Monthly trend charts
- Conversion funnel analysis

## Troubleshooting

### Analytics Not Tracking

1. Verify the site ID is correct in the script tag
2. Check browser console for errors
3. Ensure the site is published
4. Verify CORS headers if using custom domain

### Missing Data

1. Analytics are aggregated daily - new events may take time to appear
2. Sessions only end after 30 minutes of inactivity
3. Bounce rate requires at least one interaction event

### Cross-Domain Issues

The tracking endpoint includes CORS headers for cross-domain support. If issues persist:
1. Verify the script src uses the full URL
2. Check browser network tab for blocked requests
3. Ensure no ad blockers are interfering

## Performance Considerations

- **Beacon API**: Uses `navigator.sendBeacon` for reliability
- **Debouncing**: Activity tracking is debounced to reduce requests
- **Async Loading**: Script loads with `defer` attribute
- **Minimal Payload**: Events use compact JSON format
- **Batch Processing**: Future enhancement for high-traffic sites