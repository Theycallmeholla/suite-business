# Google Business Profile API Setup Guide

## Prerequisites

1. Google Cloud Console account
2. A verified Google Business Profile account with management access
3. Billing enabled on Google Cloud (API has free tier)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: "Suite Business Production"
3. Note your Project ID

## Step 2: Enable APIs

Enable these APIs in your project:
- Google My Business API
- Google Places API (for location search)
- Google Maps JavaScript API (for map displays)

```bash
# Using gcloud CLI
gcloud services enable mybusiness.googleapis.com
gcloud services enable places-backend.googleapis.com
gcloud services enable maps-backend.googleapis.com
```

## Step 3: Create Service Account

1. Go to IAM & Admin > Service Accounts
2. Create service account:
   - Name: `suitebusiness-gbp`
   - Role: `Google My Business API Editor`
3. Create and download JSON key
4. Save as `credentials/google-service-account.json`

## Step 4: Get Google Business Account ID

```javascript
// Use this script to find your account ID
const {google} = require('googleapis');
const mybusiness = google.mybusiness('v4');

async function getAccountId() {
  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials/google-service-account.json',
    scopes: ['https://www.googleapis.com/auth/business.manage'],
  });
  
  const authClient = await auth.getClient();
  google.options({auth: authClient});
  
  const res = await mybusiness.accounts.list();
  console.log('Accounts:', res.data);
}

getAccountId();
```

## Step 5: OAuth Setup (For Client Access)

1. Create OAuth 2.0 credentials in Google Cloud Console
2. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
3. Download OAuth client configuration

## Step 6: Configure Environment

```env
# Google Business Profile
GOOGLE_APPLICATION_CREDENTIALS="./credentials/google-service-account.json"
GOOGLE_ACCOUNT_ID="accounts/1234567890"
GOOGLE_OAUTH_CLIENT_ID="your-client-id"
GOOGLE_OAUTH_CLIENT_SECRET="your-client-secret"
```

## Step 7: Test Connection

```javascript
// Test script
import { getGoogleBusinessProfileClient } from './lib/google-business-profile';

async function test() {
  const client = getGoogleBusinessProfileClient();
  const results = await client.searchBusinessListings({
    businessName: 'Test Business',
    address: 'Austin, TX'
  });
  console.log('Search results:', results);
}

test();
```

## API Quotas & Limits

- **Free Tier**: 1,000 API calls per day
- **Rate Limit**: 10 QPS (queries per second)
- **Batch Operations**: Max 100 locations per batch

## Best Practices

1. **Cache Results**: Store GBP data locally to minimize API calls
2. **Batch Updates**: Use batch endpoints for multiple locations
3. **Error Handling**: Implement exponential backoff for rate limits
4. **Webhooks**: Set up Pub/Sub for real-time updates (reviews, etc)

## Common Operations

### 1. Claim/Verify Location
```javascript
// Check if location can be claimed
const canClaim = location.locationState.isVerified === false;
```

### 2. Update Business Hours
```javascript
await client.updateBusinessInfo(accountId, locationId, {
  regularHours: {
    periods: [
      {
        openDay: 'MONDAY',
        closeDay: 'MONDAY',
        openTime: '09:00',
        closeTime: '17:00'
      }
      // ... other days
    ]
  }
});
```

### 3. Post Updates
```javascript
await client.createPost(accountId, locationId, {
  summary: 'Spring lawn care special! 20% off this week.',
  callToAction: {
    actionType: 'LEARN_MORE',
    url: 'https://client.yourdomain.com/spring-special'
  }
});
```

### 4. Monitor Reviews
```javascript
// Set up webhook or poll for new reviews
const reviews = await client.getReviews(accountId, locationId);
// Process and auto-respond based on rating/content
```

## Troubleshooting

### "Request had insufficient authentication scopes"
- Ensure service account has correct permissions
- Check that all required APIs are enabled

### "The requested URL was not found"
- Verify account ID format: `accounts/1234567890`
- Check location ID format: `locations/1234567890`

### Rate Limit Errors
- Implement exponential backoff
- Use batch operations where possible
- Cache frequently accessed data
