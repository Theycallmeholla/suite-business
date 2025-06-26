# GoHighLevel Complete Integration Guide

**Created**: December 23, 2024, 3:25 PM CST  
**Last Updated**: December 23, 2024, 3:25 PM CST

## Overview

Suite Business leverages GoHighLevel Pro Plan ($497/month) with SaaS Mode to provide a complete CRM and automation backend for each client. This guide covers everything from initial setup to advanced API usage, enabling you to build a fully white-labeled solution on top of GoHighLevel's infrastructure.

## Table of Contents

1. [Initial Setup & SaaS Mode](#initial-setup--saas-mode)
2. [API Configuration](#api-configuration)
3. [Industry Templates & Snapshots](#industry-templates--snapshots)
4. [Core Integration Features](#core-integration-features)
5. [API Capabilities](#api-capabilities)
6. [Custom UI Development](#custom-ui-development)
7. [Webhook Integration](#webhook-integration)
8. [Security & Best Practices](#security--best-practices)
9. [Troubleshooting](#troubleshooting)

## Initial Setup & SaaS Mode

### Prerequisites
- GoHighLevel Agency Pro Plan ($497/month)
- Verified agency account in GHL
- Stripe account for payment processing
- API access enabled

### Step 1: Connect Stripe

1. Log into your **Agency** GoHighLevel account
2. Navigate to **Settings > Payments**
3. Click **"Connect To Your Stripe Account"**
4. Complete OAuth flow to connect Stripe
5. Verify connection shows your Stripe account info

> **Important**: This Stripe connection enables YOUR agency to collect payments from clients through automated billing.

### Step 2: Configure SaaS Plans

1. Go to **Settings > SaaS Configurator**
2. Delete or modify the pre-built example plans
3. Create your pricing tiers:

#### Starter Plan ($297/month)
```
Features:
✓ Conversations & Messaging
✓ Calendar & Appointments
✓ Contacts (CRM)
✓ Opportunities Pipeline
✓ Website Builder
✓ Forms & Surveys
✓ Basic Workflows
✓ 1,000 contacts included
```

#### Professional Plan ($597/month)
```
Features:
✓ Everything in Starter
✓ Email Marketing (5,000 sends)
✓ SMS Marketing (1,000 credits)
✓ Funnel Builder
✓ Membership Sites
✓ Reviews Management
✓ Advanced Workflows
✓ 10,000 contacts included
```

#### Enterprise Plan ($997/month)
```
Features:
✓ Everything in Professional
✓ AI Features & Chatbots
✓ Advanced Reporting
✓ API Access
✓ Custom Integrations
✓ Priority Support
✓ Unlimited contacts
✓ White-label mobile app
```

### Step 3: Configure Rebilling

Set markup percentages for usage-based services:
- **SMS**: 50% markup (you pay $0.015, charge $0.0225)
- **Email**: 30% markup
- **Voice**: 40% markup
- **AI**: 60% markup

### Step 4: Enable Auto Sub-Account Creation

When configured properly:
1. Client signs up on your website
2. GHL automatically creates their sub-account
3. Applies the selected industry snapshot
4. Creates user login credentials
5. Sends welcome email
6. Starts Stripe billing

## API Configuration

### Getting Your Credentials

1. **API Key**
   - Go to **Settings > API Keys**
   - Create new key with full permissions
   - Copy as `GHL_API_KEY`

2. **Location ID**
   - Navigate to **Settings > Company**
   - Find and copy your Location ID
   - Save as `GHL_LOCATION_ID`

3. **Agency ID**
   - Found in URL when in agency view
   - Format: `https://app.gohighlevel.com/v2/location/{AGENCY_ID}/...`
   - Save as `GHL_AGENCY_ID`

4. **Private Integration Key** (for advanced features)
   - Contact GHL support to enable
   - Required for certain API endpoints
   - Save as `GHL_PRIVATE_INTEGRATIONS_KEY`

### Environment Variables

```env
# GoHighLevel Core Configuration
GHL_API_KEY="ghl_api_..."
GHL_LOCATION_ID="loc_..."
GHL_AGENCY_ID="agt_..."
GHL_PRIVATE_INTEGRATIONS_KEY="pit_..."

# Industry Snapshots
GHL_SNAPSHOT_ID_LANDSCAPING="snapshot_..."
GHL_SNAPSHOT_ID_HVAC="snapshot_..."
GHL_SNAPSHOT_ID_PLUMBING="snapshot_..."
GHL_SNAPSHOT_ID_CLEANING="snapshot_..."
GHL_SNAPSHOT_ID_ROOFING="snapshot_..."
GHL_SNAPSHOT_ID_ELECTRICAL="snapshot_..."
GHL_SNAPSHOT_ID_DEFAULT="snapshot_..."

# Webhook Configuration (optional)
GHL_WEBHOOK_SECRET="whsec_..."
GHL_WEBHOOK_ENDPOINT="https://yourdomain.com/api/ghl/webhook"
```

## Industry Templates & Snapshots

### Creating Industry Snapshots

For each industry, create a complete business template:

1. **Go to Settings > Snapshots**
2. **Click "Create Snapshot"**
3. **Include these elements:**

#### Landscaping Snapshot
```
Workflows:
- New Lead Welcome Series
- Quote Follow-up Sequence
- Seasonal Service Reminders
- Review Request Automation

Custom Fields:
- Property Size
- Service Frequency
- Irrigation System
- Preferred Service Day

Pipelines:
- Lead Qualification
- Quote to Close
- Recurring Service Management

Forms:
- Quick Quote Request
- Full Service Inquiry
- Seasonal Cleanup Booking
```

#### HVAC Snapshot
```
Workflows:
- Emergency Service Response
- Maintenance Reminder Series
- Installation Follow-up
- Warranty Expiration Alerts

Custom Fields:
- System Type
- Install Date
- Warranty Status
- Last Service Date

Pipelines:
- Service Requests
- Installation Projects
- Maintenance Contracts
```

### Applying Snapshots via API

```typescript
// When creating a sub-account
const createSubAccount = async (businessData: BusinessData) => {
  const snapshotId = getSnapshotForIndustry(businessData.industry);
  
  const response = await fetch('https://services.leadconnectorhq.com/locations/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      companyName: businessData.name,
      email: businessData.email,
      phone: businessData.phone,
      address: businessData.fullAddress,
      website: businessData.website,
      timezone: businessData.timezone || 'America/Chicago',
      settings: {
        saasMode: true
      },
      snapshotId: snapshotId
    })
  });
  
  return response.json();
};
```

## Core Integration Features

### 1. Automatic Sub-Account Creation

When a site is created through Suite Business:

```typescript
// Implementation in /lib/ghl.ts
export async function createSaasSubAccount(params: {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  industry: string;
  website?: string;
}) {
  const client = createGHLClient();
  const snapshotId = getIndustrySnapshot(params.industry);
  
  const response = await client.post('/locations/', {
    companyName: params.businessName,
    email: params.email,
    phone: params.phone,
    address: `${params.address}, ${params.city}, ${params.state} ${params.postalCode}`,
    website: params.website,
    timezone: 'America/Chicago',
    settings: { saasMode: true },
    snapshotId
  });
  
  return response.data.location;
}
```

### 2. Lead Synchronization

All forms on client sites sync to GoHighLevel:

```typescript
// API endpoint: /api/ghl/leads
export async function submitLead(leadData: LeadFormData) {
  const site = await getSiteById(leadData.siteId);
  if (!site.ghlLocationId || !site.ghlEnabled) return;
  
  const client = createGHLClient();
  
  // Create or update contact
  const contact = await client.post('/contacts/', {
    locationId: site.ghlLocationId,
    firstName: leadData.firstName,
    lastName: leadData.lastName,
    email: leadData.email,
    phone: leadData.phone,
    source: 'Website',
    customFields: [
      { key: 'form_type', value: leadData.formType },
      { key: 'message', value: leadData.message },
      { key: 'submission_page', value: leadData.pageUrl }
    ],
    tags: ['website-lead', leadData.formType, site.industry]
  });
  
  // Trigger workflow if configured
  if (leadData.triggerWorkflow) {
    await client.post(`/workflows/${leadData.workflowId}/trigger`, {
      locationId: site.ghlLocationId,
      contactId: contact.data.contact.id
    });
  }
  
  return contact.data;
}
```

### 3. Industry-Specific Custom Fields

Each industry has tailored fields created automatically:

```typescript
const INDUSTRY_CUSTOM_FIELDS = {
  landscaping: [
    { name: 'property_size', label: 'Property Size', type: 'TEXT' },
    { name: 'service_frequency', label: 'Service Frequency', type: 'DROPDOWN',
      options: ['Weekly', 'Bi-weekly', 'Monthly', 'One-time'] },
    { name: 'irrigation_system', label: 'Irrigation System', type: 'CHECKBOX' },
    { name: 'preferred_day', label: 'Preferred Service Day', type: 'TEXT' }
  ],
  hvac: [
    { name: 'system_type', label: 'System Type', type: 'DROPDOWN',
      options: ['Central AC', 'Heat Pump', 'Furnace', 'Boiler', 'Ductless'] },
    { name: 'install_date', label: 'Install Date', type: 'DATE' },
    { name: 'warranty_status', label: 'Under Warranty', type: 'CHECKBOX' },
    { name: 'last_service', label: 'Last Service Date', type: 'DATE' }
  ],
  // ... more industries
};
```

## API Capabilities

### Contact Management

```typescript
// List contacts with filtering
GET /contacts
Query params: locationId, limit, startAfter, query, tag, customField

// Create new contact
POST /contacts
Body: { locationId, firstName, lastName, email, phone, tags, customFields }

// Update contact
PUT /contacts/{contactId}
Body: { ...updatedFields }

// Delete contact
DELETE /contacts/{contactId}

// Bulk operations
POST /contacts/bulk
Body: { locationId, contacts: [...], operation: 'create|update|delete' }
```

### Pipeline & Opportunities

```typescript
// Get all pipelines
GET /pipelines?locationId={locationId}

// Get opportunities
GET /opportunities?locationId={locationId}&pipelineId={id}

// Create opportunity
POST /opportunities
Body: { 
  locationId, 
  contactId, 
  pipelineId, 
  pipelineStageId,
  name,
  monetaryValue,
  status: 'open|won|lost|abandoned'
}

// Move opportunity stage
PUT /opportunities/{id}
Body: { pipelineStageId, status }
```

### Calendar & Appointments

```typescript
// Get calendars
GET /calendars?locationId={locationId}

// Get available slots
GET /calendars/{calendarId}/free-slots
Query: startDate, endDate, timezone

// Create appointment
POST /appointments
Body: {
  calendarId,
  locationId,
  contactId,
  startTime,
  endTime,
  title,
  appointmentStatus: 'confirmed|pending|cancelled'
}
```

### Communications

```typescript
// Send SMS
POST /conversations/messages
Body: {
  type: 'SMS',
  locationId,
  contactId,
  message
}

// Send Email
POST /emails
Body: {
  locationId,
  contactId,
  subject,
  body,
  attachments: []
}

// Get conversations
GET /conversations?locationId={locationId}&contactId={contactId}
```

### Workflows & Automation

```typescript
// List workflows
GET /workflows?locationId={locationId}

// Trigger workflow
POST /workflows/{workflowId}/trigger
Body: {
  locationId,
  contactId,
  customData: {}
}

// Get workflow history
GET /workflows/{workflowId}/history
```

## Custom UI Development

### Building Your Own CRM Interface

Suite Business can completely replace GoHighLevel's UI:

```typescript
// Example: Custom Contact Dashboard Component
export async function ContactDashboard({ locationId }: Props) {
  // Fetch contacts with opportunities
  const contacts = await fetchContacts(locationId);
  
  // Get pipeline stages for visualization
  const pipelines = await fetchPipelines(locationId);
  
  // Custom UI - users never see GHL interface
  return (
    <div className="custom-crm-dashboard">
      <ContactList contacts={contacts} />
      <PipelineKanban pipelines={pipelines} />
      <CommunicationCenter locationId={locationId} />
      <ActivityFeed locationId={locationId} />
    </div>
  );
}
```

### Architecture Pattern

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Your Custom UI │────▶│  Your Backend    │────▶│  GHL API     │
│   (Next.js)     │     │   API Routes     │     │              │
└─────────────────┘     └──────────────────┘     └──────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │  Database        │
                        │  (Your Data +    │
                        │   GHL Sync)      │
                        └──────────────────┘
```

## Webhook Integration

### Setting Up Webhooks

1. In GHL: **Settings > Webhooks > Add Webhook**
2. Configure endpoint: `https://yourdomain.com/api/ghl/webhook`
3. Select events to subscribe to:
   - Contact Created/Updated
   - Opportunity Stage Changed
   - Appointment Scheduled/Cancelled
   - Form Submitted
   - SMS Received
   - Task Completed

### Webhook Handler Implementation

```typescript
// /api/ghl/webhook/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const signature = request.headers.get('x-ghl-signature');
  
  // Verify webhook signature (if configured)
  if (!verifyWebhookSignature(body, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  // Process different event types
  switch (body.type) {
    case 'ContactCreate':
      await handleNewContact(body.data);
      break;
      
    case 'OpportunityStageChange':
      await handleOpportunityUpdate(body.data);
      break;
      
    case 'AppointmentScheduled':
      await handleNewAppointment(body.data);
      break;
      
    case 'FormSubmitted':
      await handleFormSubmission(body.data);
      break;
      
    default:
      logger.info('Unhandled webhook event', { type: body.type });
  }
  
  return new Response('OK', { status: 200 });
}
```

## Security & Best Practices

### API Security

1. **Never expose API keys to frontend**
   ```typescript
   // BAD - Don't do this
   fetch('/api/ghl/contacts', {
     headers: { 'X-API-Key': 'ghl_api_key' }  // ❌
   });
   
   // GOOD - Use server-side API routes
   fetch('/api/contacts')  // ✓ API key used server-side
   ```

2. **Implement rate limiting**
   ```typescript
   // GHL limits: 100 requests per 10 seconds
   const rateLimiter = new RateLimiter({
     windowMs: 10 * 1000,
     max: 90  // Leave buffer
   });
   ```

3. **Multi-tenant isolation**
   ```typescript
   // Always verify ownership before API calls
   const site = await getSiteById(siteId);
   if (site.userId !== session.user.id) {
     throw new Error('Unauthorized');
   }
   ```

### Performance Optimization

1. **Implement caching**
   ```typescript
   // Cache pipeline structure (rarely changes)
   const pipelines = await cache.remember(
     `pipelines:${locationId}`,
     3600,  // 1 hour
     () => fetchPipelinesFromGHL(locationId)
   );
   ```

2. **Use pagination**
   ```typescript
   // Don't fetch all contacts at once
   const fetchContactsPaginated = async (page = 1) => {
     return await ghlClient.get('/contacts', {
       params: {
         locationId,
         limit: 100,
         startAfter: (page - 1) * 100
       }
     });
   };
   ```

3. **Batch operations**
   ```typescript
   // Update multiple contacts efficiently
   await ghlClient.post('/contacts/bulk', {
     locationId,
     contacts: contactUpdates,
     operation: 'update'
   });
   ```

### Error Handling

```typescript
// Comprehensive error handling
export async function ghlApiCall(fn: () => Promise<any>) {
  try {
    return await fn();
  } catch (error: any) {
    if (error.response?.status === 429) {
      // Rate limited - implement exponential backoff
      await sleep(Math.pow(2, attempt) * 1000);
      return ghlApiCall(fn);
    }
    
    if (error.response?.status === 401) {
      // Invalid API key
      logger.error('GHL API authentication failed');
      throw new Error('Configuration error');
    }
    
    if (error.response?.status >= 500) {
      // GHL server error - retry with backoff
      logger.warn('GHL API server error, retrying...');
      await sleep(5000);
      return ghlApiCall(fn);
    }
    
    // Log and rethrow other errors
    logger.error('GHL API error', error);
    throw error;
  }
}
```

## Troubleshooting

### Common Issues & Solutions

#### "Cannot create sub-account"
- ✓ Verify Stripe is connected in GHL
- ✓ Check API key has full permissions
- ✓ Ensure you're on Pro plan ($497/month)
- ✓ Verify agency is approved for SaaS mode

#### "Snapshot not applying"
- ✓ Verify snapshot ID is correct
- ✓ Check snapshot includes all needed assets
- ✓ Test snapshot manually first
- ✓ Ensure snapshot is shared to agency level

#### "Webhook not receiving events"
- ✓ Verify webhook URL is publicly accessible
- ✓ Check SSL certificate is valid
- ✓ Confirm events are selected in GHL
- ✓ Test with GHL's webhook tester

#### "API rate limits hit"
- ✓ Implement caching strategy
- ✓ Use pagination for large datasets
- ✓ Batch operations when possible
- ✓ Add exponential backoff for retries

### Debugging Tools

1. **GHL API Explorer**
   - Test endpoints directly in GHL dashboard
   - Verify data structure and responses

2. **Webhook Testing**
   ```bash
   # Local webhook testing with ngrok
   ngrok http 3000
   # Use ngrok URL in GHL webhook settings
   ```

3. **API Response Logging**
   ```typescript
   // Log all GHL API responses in development
   if (process.env.NODE_ENV === 'development') {
     ghlClient.interceptors.response.use(response => {
       logger.debug('GHL API Response', {
         url: response.config.url,
         status: response.status,
         data: response.data
       });
       return response;
     });
   }
   ```

## Advanced Features

### Two-Way Sync Implementation

```typescript
// Sync contacts from GHL to your database
export async function syncContactsFromGHL(locationId: string) {
  let hasMore = true;
  let startAfter = 0;
  
  while (hasMore) {
    const response = await ghlClient.get('/contacts', {
      params: { locationId, limit: 100, startAfter }
    });
    
    for (const contact of response.data.contacts) {
      await upsertContact({
        ghlContactId: contact.id,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        tags: contact.tags,
        customFields: contact.customFields,
        locationId
      });
    }
    
    hasMore = response.data.contacts.length === 100;
    startAfter += 100;
  }
}
```

### Custom Workflow Triggers

```typescript
// Trigger workflow based on custom business logic
export async function triggerCustomWorkflow(
  siteId: string,
  workflowType: string,
  data: any
) {
  const site = await getSiteById(siteId);
  const workflowId = getWorkflowId(site.industry, workflowType);
  
  await ghlClient.post(`/workflows/${workflowId}/trigger`, {
    locationId: site.ghlLocationId,
    customData: {
      siteId,
      timestamp: new Date().toISOString(),
      ...data
    }
  });
}
```

## Future Roadmap

1. **Enhanced Integrations**
   - Two-way calendar sync
   - Real-time messaging interface
   - Custom workflow builder UI

2. **Advanced Analytics**
   - Custom reporting dashboards
   - ROI tracking per campaign
   - Predictive lead scoring

3. **Mobile Features**
   - White-label mobile app
   - Push notifications
   - Offline capability

4. **AI Enhancements**
   - Conversation AI integration
   - Automated lead qualification
   - Smart appointment scheduling

Remember: GoHighLevel provides the robust backend infrastructure while Suite Business delivers the tailored, industry-specific experience that clients need!