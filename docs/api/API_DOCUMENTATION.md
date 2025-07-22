# Suite Business API Documentation

## Overview
Suite Business provides a comprehensive REST API for managing sites, Google Business Profile integration, GoHighLevel CRM operations, and more. All API endpoints require authentication via NextAuth session cookies.

## Authentication
All API endpoints require an authenticated session. Authentication is handled via Google OAuth through NextAuth.

### Session Management
```javascript
// Client-side
import { useSession } from 'next-auth/react';
const { data: session } = useSession();

// Server-side
import { getAuthSession } from '@/lib/auth';
const session = await getAuthSession();
```

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://yourdomain.com/api`

## API Endpoints

### Site Management

#### List Sites
Get all sites for the authenticated user.

```
GET /api/sites
```

**Response:**
```json
{
  "sites": [
    {
      "id": "site_123",
      "businessName": "Joe's Landscaping",
      "subdomain": "joes-landscaping",
      "published": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Site (Manual)
Create a new site with manually entered business information.

```
POST /api/sites
```

**Request Body:**
```json
{
  "businessName": "Joe's Landscaping",
  "subdomain": "joes-landscaping",
  "industry": "landscaping",
  "address": "123 Main St",
  "city": "Houston",
  "state": "TX",
  "zip": "77001",
  "phone": "(555) 123-4567",
  "email": "joe@landscaping.com"
}
```

#### Create Site from GBP
Create a new site by importing Google Business Profile data.

```
POST /api/sites/create-from-gbp
```

**Request Body:**
```json
{
  "locationId": "locations/12345",
  "placeId": "ChIJ...",
  "businessData": {
    "name": "Joe's Landscaping",
    "address": "123 Main St, Houston, TX",
    "phone": "(555) 123-4567",
    "website": "https://example.com",
    "categories": ["Landscaper", "Lawn Care Service"]
  }
}
```

#### Delete Site
Delete a site and optionally its GoHighLevel sub-account.

```
DELETE /api/sites/[siteId]
```

**Query Parameters:**
- `deleteGHL` (boolean): Whether to also delete the associated GoHighLevel sub-account

#### Upload Logo
Upload and resize a logo for a site.

```
POST /api/sites/upload-logo
```

**Request Body (FormData):**
- `file`: Logo image file (PNG, JPG, JPEG, WebP)
- `siteId`: ID of the site

**Response:**
```json
{
  "url": "/uploads/logos/site_123_logo.png",
  "width": 400,
  "height": 100
}
```

### Google Business Profile Integration

#### List Google Accounts
Get all connected Google accounts with their status.

```
GET /api/gbp/accounts
```

**Response:**
```json
{
  "accounts": [
    {
      "id": "acc_123",
      "googleAccountId": "117539137717651",
      "email": "user@gmail.com",
      "isPrimary": true,
      "isActive": true,
      "hasGBPAccess": true
    }
  ],
  "count": 1
}
```

#### Get My Locations
Get Google Business Profile locations for a specific account.

```
GET /api/gbp/my-locations?accountId={googleAccountId}
```

**Query Parameters:**
- `accountId` (optional): Specific Google account ID
- `refresh` (optional): Force refresh cache

**Response:**
```json
{
  "locations": [
    {
      "id": "locations/12345",
      "name": "Joe's Landscaping",
      "address": "123 Main St, Houston, TX 77001",
      "phone": "(555) 123-4567",
      "website": "https://example.com",
      "primaryCategory": {
        "displayName": "Landscaper"
      }
    }
  ],
  "accountsChecked": 1,
  "totalLocations": 1
}
```

#### Search Businesses
Search for businesses using Google Places API.

```
POST /api/gbp/search
```

**Request Body:**
```json
{
  "query": "Joe's Landscaping Houston"
}
```

**Response:**
```json
{
  "predictions": [
    {
      "place_id": "ChIJ...",
      "description": "Joe's Landscaping, Main Street, Houston, TX, USA",
      "structured_formatting": {
        "main_text": "Joe's Landscaping",
        "secondary_text": "Main Street, Houston, TX, USA"
      }
    }
  ],
  "session_token": "token_123"
}
```

#### Get Place Details
Get detailed information about a specific place.

```
POST /api/gbp/place-details
```

**Request Body:**
```json
{
  "placeId": "ChIJ...",
  "sessionToken": "token_123"
}
```

**Response:**
```json
{
  "result": {
    "name": "Joe's Landscaping",
    "formatted_address": "123 Main St, Houston, TX 77001",
    "formatted_phone_number": "(555) 123-4567",
    "website": "https://example.com",
    "rating": 4.5,
    "user_ratings_total": 42,
    "photos": [...],
    "opening_hours": {...}
  }
}
```

#### Check GBP Access
Check if the user has access to a specific business across all their Google accounts.

```
POST /api/gbp/check-access
```

**Request Body:**
```json
{
  "placeId": "ChIJ...",
  "businessName": "Joe's Landscaping",
  "address": "123 Main St, Houston, TX"
}
```

**Response:**
```json
{
  "hasAccess": true,
  "accountId": "117539137717651",
  "accountEmail": "user@gmail.com",
  "locationId": "locations/12345",
  "availableAccounts": [
    {
      "id": "117539137717651",
      "email": "user@gmail.com"
    }
  ]
}
```

#### Check Business Ownership
Check ownership status of a business.

```
POST /api/gbp/check-ownership
```

**Request Body:**
```json
{
  "placeId": "ChIJ...",
  "businessName": "Joe's Landscaping",
  "address": "123 Main St, Houston, TX"
}
```

**Response:**
```json
{
  "status": "owned",
  "canClaim": false,
  "message": "You have access to this business",
  "hasAccess": true,
  "accountEmail": "user@gmail.com"
}
```

**Status Values:**
- `owned`: User has access to this business
- `not_owned`: Business exists but user doesn't have access
- `no_access`: User needs to add the Google account that manages this business
- `not_found`: Business not found on Google

### GoHighLevel Integration

#### Create GHL Sub-Account
Automatically create a GoHighLevel sub-account for a site.

```
POST /api/ghl/create-subaccount
```

**Request Body:**
```json
{
  "siteId": "site_123",
  "businessData": {
    "businessName": "Joe's Landscaping",
    "email": "joe@landscaping.com",
    "phone": "(555) 123-4567",
    "address": "123 Main St, Houston, TX",
    "industry": "landscaping"
  }
}
```

### CRM Operations

#### Create Contact
Create a new contact in GoHighLevel.

```
POST /api/crm/contacts
```

**Request Body:**
```json
{
  "siteId": "site_123",
  "contact": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "source": "Website Form"
  }
}
```

#### List Contacts
Get contacts for a site.

```
GET /api/crm/contacts?siteId={siteId}
```

### Forms

#### Create Form
Create a new form for a site.

```
POST /api/forms
```

**Request Body:**
```json
{
  "siteId": "site_123",
  "name": "Contact Form",
  "fields": [
    {
      "name": "name",
      "label": "Full Name",
      "type": "text",
      "required": true
    }
  ]
}
```

#### Submit Form
Submit a form entry.

```
POST /api/forms/submit
```

**Request Body:**
```json
{
  "formId": "form_123",
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (no access to resource)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

Error Response Format:
```json
{
  "error": "Error message",
  "details": "Additional context about the error",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

### Google APIs
- Places API: No specific rate limit, uses session tokens for billing optimization
- Business Profile API: 10 requests per minute
- Cached responses are returned when available to minimize API calls

### Internal APIs
- No hard rate limits currently implemented
- Reasonable use expected (< 100 requests/minute)

## Caching

### Google Business Profile Data
- Locations cached for 24 hours
- Place details cached for 1 hour
- Access checks cached for 5 minutes
- Force refresh with `?refresh=true` parameter

### Site Data
- Site configurations cached at CDN edge
- Cache invalidated on updates

## Webhooks

### GoHighLevel Webhooks
Endpoint: `POST /api/webhooks/ghl`

Supported events:
- `contact.create`
- `contact.update`
- `opportunity.create`
- `appointment.create`
- `form.submit`

## Best Practices

1. **Authentication**: Always check session before making API calls
2. **Error Handling**: Implement proper error handling for all responses
3. **Caching**: Respect cache headers to minimize API costs
4. **Rate Limiting**: Implement exponential backoff for retries
5. **Data Validation**: Validate all input data before sending

## Examples

### Creating a Site with GBP Import
```javascript
// 1. Search for business
const searchRes = await fetch('/api/gbp/search', {
  method: 'POST',
  body: JSON.stringify({ query: 'Joe\'s Landscaping Houston' })
});
const { predictions, session_token } = await searchRes.json();

// 2. Get place details
const detailsRes = await fetch('/api/gbp/place-details', {
  method: 'POST',
  body: JSON.stringify({ 
    placeId: predictions[0].place_id,
    sessionToken: session_token 
  })
});
const { result } = await detailsRes.json();

// 3. Check if user has access
const accessRes = await fetch('/api/gbp/check-access', {
  method: 'POST',
  body: JSON.stringify({
    placeId: predictions[0].place_id,
    businessName: result.name,
    address: result.formatted_address
  })
});
const { hasAccess, locationId } = await accessRes.json();

// 4. Create site
if (hasAccess) {
  const siteRes = await fetch('/api/sites/create-from-gbp', {
    method: 'POST',
    body: JSON.stringify({
      locationId,
      placeId: predictions[0].place_id,
      businessData: result
    })
  });
}
```

Last Updated: December 22, 2024