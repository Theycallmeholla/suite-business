# Google Integration Complete Guide

**Created**: December 23, 2024, 3:35 PM CST  
**Last Updated**: December 23, 2024, 3:35 PM CST

## Overview

Suite Business integrates deeply with Google services to provide authentication, business data access, and location-based features. This guide covers OAuth setup, Google Business Profile API integration, and Places API implementation.

## Table of Contents

1. [Google Cloud Project Setup](#google-cloud-project-setup)
2. [OAuth 2.0 Configuration](#oauth-20-configuration)
3. [Google Business Profile API](#google-business-profile-api)
4. [Places API Integration](#places-api-integration)
5. [Authentication Flow](#authentication-flow)
6. [API Implementation](#api-implementation)
7. [Multi-Account Support](#multi-account-support)
8. [Cost Optimization](#cost-optimization)
9. [Security & Best Practices](#security--best-practices)
10. [Troubleshooting](#troubleshooting)

## Google Cloud Project Setup

### Step 1: Create Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Suite Business Production"
3. Note your Project ID for later use

### Step 2: Enable Required APIs

Navigate to **APIs & Services > Library** and enable:

1. **Authentication & Core**:
   - Google+ API (required for OAuth)
   - People API

2. **Google Business Profile**:
   - Google My Business Account Management API
   - Google My Business Business Information API
   - Google My Business Management API

3. **Maps & Places**:
   - Places API (New)
   - Maps JavaScript API
   - Geocoding API (optional)

Or via CLI:
```bash
# Enable all required APIs
gcloud services enable \
  plus.googleapis.com \
  people.googleapis.com \
  mybusinessaccountmanagement.googleapis.com \
  mybusinessbusinessinformation.googleapis.com \
  mybusiness.googleapis.com \
  places-backend.googleapis.com \
  maps-backend.googleapis.com
```

### Step 3: Configure API Restrictions

1. Go to **APIs & Services > Credentials**
2. Create API Key for Places/Maps
3. Add restrictions:
   - **Application restrictions**: HTTP referrers
   - **API restrictions**: Select only needed APIs
   - **Allowed referrers**:
     ```
     http://localhost:3000/*
     https://yourdomain.com/*
     https://*.yourdomain.com/*
     ```

## OAuth 2.0 Configuration

### Step 1: Configure Consent Screen

1. Navigate to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill in application details:
   - **App name**: Suite Business
   - **User support email**: support@yourdomain.com
   - **App logo**: Upload your logo
   - **Application home page**: https://yourdomain.com
   - **Privacy policy**: https://yourdomain.com/privacy
   - **Terms of service**: https://yourdomain.com/terms

4. Add scopes:
   ```
   openid
   email
   profile
   https://www.googleapis.com/auth/business.manage
   ```

5. Add test users during development

### Step 2: Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Configure:
   - **Application type**: Web application
   - **Name**: Suite Business Web Client

4. Add Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://yourdomain.com
   https://app.yourdomain.com
   ```

5. Add Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   https://app.yourdomain.com/api/auth/callback/google
   ```

6. Download credentials and extract:
   - Client ID
   - Client Secret

### Step 3: Environment Configuration

```env
# Google OAuth
GOOGLE_CLIENT_ID="123456789012-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-1234567890abcdefghijk"

# Google Maps/Places API
GOOGLE_MAPS_API_KEY="AIzaSy1234567890abcdefghijklmnop"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"  # Change for production
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"
```

## Google Business Profile API

### Service Account Setup (Optional)

For server-side operations without user interaction:

1. **Create Service Account**:
   ```
   IAM & Admin > Service Accounts > Create Service Account
   Name: suitebusiness-gbp-service
   Role: Google My Business API Editor
   ```

2. **Generate Key**:
   - Click on service account
   - Keys > Add Key > Create new key
   - Choose JSON format
   - Save to `credentials/google-service-account.json`

3. **Configure Environment**:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS="./credentials/google-service-account.json"
   ```

### API Implementation

#### Fetching User's Locations

```typescript
// /lib/google-business-profile.ts
export async function getUserLocations(accessToken: string) {
  const response = await fetch(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    }
  );
  
  const accounts = await response.json();
  const locations = [];
  
  // Get locations for each account
  for (const account of accounts.accounts) {
    const locResponse = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    const data = await locResponse.json();
    locations.push(...(data.locations || []));
  }
  
  return locations;
}
```

#### Creating a New Location

```typescript
export async function createGBPLocation(
  accessToken: string,
  accountId: string,
  locationData: any
) {
  const response = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        languageCode: 'en',
        title: locationData.businessName,
        phoneNumbers: {
          primaryPhone: locationData.phone,
        },
        storefrontAddress: {
          addressLines: [locationData.address],
          locality: locationData.city,
          administrativeArea: locationData.state,
          postalCode: locationData.postalCode,
          regionCode: 'US',
        },
        websiteUri: locationData.website,
        categories: {
          primaryCategory: {
            name: locationData.primaryCategory,
          },
        },
      }),
    }
  );
  
  return response.json();
}
```

## Places API Integration

### Autocomplete Search Implementation

```typescript
// /app/api/gbp/search/route.ts
export async function POST(request: Request) {
  const { input, sessionToken } = await request.json();
  
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
    `input=${encodeURIComponent(input)}&` +
    `types=establishment&` +
    `components=country:us&` +
    `key=${process.env.GOOGLE_MAPS_API_KEY}&` +
    `sessiontoken=${sessionToken}`
  );
  
  const data = await response.json();
  
  // Cache results to reduce API calls
  await cache.set(
    `search:${input}`,
    data.predictions,
    300 // 5 minutes
  );
  
  return Response.json({
    predictions: data.predictions,
    status: data.status,
  });
}
```

### Place Details Fetching

```typescript
// /app/api/gbp/place-details/route.ts
export async function POST(request: Request) {
  const { placeId, sessionToken } = await request.json();
  
  // Check cache first
  const cached = await cache.get(`place:${placeId}`);
  if (cached) {
    return Response.json(cached);
  }
  
  const fields = [
    'name',
    'formatted_address',
    'formatted_phone_number',
    'website',
    'rating',
    'user_ratings_total',
    'opening_hours',
    'photos',
    'types',
    'business_status',
    'place_id',
    'geometry',
  ].join(',');
  
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?` +
    `place_id=${placeId}&` +
    `fields=${fields}&` +
    `key=${process.env.GOOGLE_MAPS_API_KEY}&` +
    `sessiontoken=${sessionToken}`
  );
  
  const data = await response.json();
  
  // Cache for 24 hours
  await cache.set(`place:${placeId}`, data.result, 86400);
  
  return Response.json(data.result);
}
```

## Authentication Flow

### NextAuth Configuration

```typescript
// /lib/auth.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/business.manage',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Store Google tokens
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at * 1000;
      }
      
      // Refresh token if expired
      if (Date.now() > token.accessTokenExpires) {
        return await refreshAccessToken(token);
      }
      
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
};
```

### Token Refresh Implementation

```typescript
async function refreshAccessToken(token: any) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });
    
    const refreshedTokens = await response.json();
    
    if (!response.ok) throw refreshedTokens;
    
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
```

## Multi-Account Support

### Handling Multiple Google Accounts

```typescript
// /app/api/gbp/accounts/route.ts
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Get all connected Google accounts for user
  const accounts = await prisma.account.findMany({
    where: {
      userId: session.user.id,
      provider: 'google',
    },
    select: {
      providerAccountId: true,
      access_token: true,
      scope: true,
    },
  });
  
  // Check GBP access for each account
  const accountsWithStatus = await Promise.all(
    accounts.map(async (account) => {
      const hasGBPAccess = await checkGBPAccess(account.access_token);
      return {
        id: account.providerAccountId,
        hasGBPAccess,
        isActive: account.scope?.includes('business.manage'),
      };
    })
  );
  
  return Response.json({ accounts: accountsWithStatus });
}
```

### Adding Additional Accounts

```typescript
// Preserve context when adding accounts
function addGoogleAccount() {
  // Store current state
  sessionStorage.setItem('onboarding_state', JSON.stringify({
    step: currentStep,
    data: formData,
  }));
  
  // Redirect to add account
  window.location.href = '/api/auth/signin?prompt=select_account';
}

// Resume after authentication
useEffect(() => {
  const saved = sessionStorage.getItem('onboarding_state');
  if (saved) {
    const state = JSON.parse(saved);
    setCurrentStep(state.step);
    setFormData(state.data);
    sessionStorage.removeItem('onboarding_state');
  }
}, []);
```

## Cost Optimization

### Places API Optimization

1. **Session Tokens**:
   ```typescript
   // Generate session token for autocomplete sessions
   const sessionToken = new google.maps.places.AutocompleteSessionToken();
   
   // Reuse token for all requests in a session
   // New token only after place selection
   ```

2. **Caching Strategy**:
   ```typescript
   const CACHE_TIMES = {
     search: 300,        // 5 minutes for searches
     placeDetails: 86400, // 24 hours for place details
     gbpLocations: 3600,  // 1 hour for GBP locations
   };
   ```

3. **Field Masking**:
   ```typescript
   // Only request needed fields
   const fields = ['name', 'formatted_address', 'place_id'];
   // Not all fields - saves API units
   ```

### Free Tier Limits

- **Places API**: $200/month credit (~40,000 autocomplete requests)
- **Maps JavaScript API**: $200/month credit
- **GBP API**: 1,000 requests/day free

### Cost Monitoring

```typescript
// Track API usage
export async function trackAPIUsage(
  apiName: string,
  endpoint: string,
  cost: number
) {
  await prisma.apiUsage.create({
    data: {
      apiName,
      endpoint,
      cost,
      timestamp: new Date(),
    },
  });
  
  // Alert if approaching limits
  const monthlyUsage = await getMonthlyUsage(apiName);
  if (monthlyUsage > 180) { // 90% of $200 credit
    await sendAlertEmail('API usage warning', {
      api: apiName,
      usage: monthlyUsage,
      limit: 200,
    });
  }
}
```

## Security & Best Practices

### API Key Security

1. **Never expose API keys in client code**:
   ```typescript
   // BAD - Don't do this
   fetch(`/api/places?key=${GOOGLE_API_KEY}`)  // ❌
   
   // GOOD - Use server-side API routes
   fetch('/api/gbp/search', { method: 'POST', body })  // ✓
   ```

2. **Restrict API keys**:
   - HTTP referrer restrictions
   - API restrictions
   - IP restrictions for server keys

3. **Rotate keys regularly**:
   ```bash
   # Script to rotate API keys
   gcloud alpha services api-keys update KEY_ID \
     --api-target=service=places-backend.googleapis.com
   ```

### Data Privacy

1. **Token Storage**:
   - Encrypt refresh tokens at rest
   - Use secure session storage
   - Implement token expiration

2. **PII Handling**:
   ```typescript
   // Log sanitization
   logger.info('GBP search', {
     query: query.substring(0, 3) + '***',
     userId: session.user.id,
     // Never log full addresses or phone numbers
   });
   ```

3. **Access Control**:
   ```typescript
   // Verify ownership before API calls
   const hasAccess = await verifyGBPOwnership(
     session.user.id,
     locationId
   );
   if (!hasAccess) {
     throw new Error('Unauthorized access to location');
   }
   ```

## Troubleshooting

### Common Issues

#### "Request had insufficient authentication scopes"
```typescript
// Solution: Request all needed scopes upfront
authorization: {
  params: {
    scope: 'openid email profile https://www.googleapis.com/auth/business.manage',
    prompt: 'consent',  // Force scope approval
    access_type: 'offline',  // Get refresh token
  },
}
```

#### "API not enabled for project"
1. Check all APIs are enabled in Cloud Console
2. Wait 5-10 minutes for propagation
3. Verify project ID matches

#### "Invalid API key"
1. Check key restrictions match your domain
2. Verify API is enabled for the key
3. Try regenerating the key

#### "Quota exceeded"
1. Implement caching layer
2. Use session tokens for Places API
3. Batch GBP API requests
4. Monitor usage in Cloud Console

### Debug Tools

1. **Google OAuth Playground**:
   - Test API calls with your tokens
   - Verify scope access
   - Debug authentication issues

2. **API Explorer**:
   - Test endpoints directly
   - Verify request/response format
   - Check required parameters

3. **Logging**:
   ```typescript
   // Enhanced API logging for debugging
   if (process.env.NODE_ENV === 'development') {
     logger.debug('Google API Request', {
       url: request.url,
       headers: sanitizeHeaders(request.headers),
       method: request.method,
     });
   }
   ```

## Testing Checklist

### Development Testing
- [ ] OAuth flow works with test users
- [ ] Can fetch GBP locations
- [ ] Places autocomplete returns results
- [ ] Place details include all fields
- [ ] Multi-account switching works
- [ ] Token refresh works after expiry
- [ ] API rate limits handled gracefully

### Production Readiness
- [ ] OAuth consent screen approved
- [ ] Production redirect URIs added
- [ ] API keys properly restricted
- [ ] Monitoring and alerts configured
- [ ] Error handling for all edge cases
- [ ] Caching layer implemented
- [ ] Cost tracking enabled

Remember: The Google integration is critical for the onboarding experience. Ensure robust error handling and graceful fallbacks for the best user experience!