# GoHighLevel Integration Guide

## Overview

Suite Business integrates with GoHighLevel Pro Plan using SaaS Mode to provide automated CRM functionality for each client site. When a site is created, a corresponding sub-account is automatically created in GoHighLevel with industry-specific configurations.

## Features

### ✅ Implemented Features

1. **Automatic Sub-Account Creation**
   - When a site is created through the onboarding flow, a GoHighLevel sub-account is automatically created
   - Industry-specific snapshots are applied based on the business type
   - Custom fields are created for each industry

2. **Lead Sync**
   - Contact forms on client sites automatically sync leads to GoHighLevel
   - Leads are tagged with source, form type, and industry
   - Custom fields capture additional information

3. **Webhook Integration**
   - Real-time updates from GoHighLevel events
   - Handles contact creation, appointments, opportunities, and SMS events
   - Webhook endpoint: `/api/ghl/webhook`

4. **GHL Settings in Preview Bar**
   - View connection status
   - Enable/disable lead sync
   - See location ID for debugging

5. **Integrations Dashboard**
   - Overview of all sites and their GHL status
   - Quick access to site settings
   - Visual indicators for connection status

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local`:

```env
# GoHighLevel API Credentials
GHL_API_KEY="your-api-key"
GHL_LOCATION_ID="your-agency-location-id"
GHL_AGENCY_ID="your-agency-id"
GHL_PRIVATE_INTEGRATIONS_KEY="your-private-integration-key"

# Industry Snapshots (optional)
GHL_SNAPSHOT_ID_LANDSCAPING="snapshot-id"
GHL_SNAPSHOT_ID_HVAC="snapshot-id"
GHL_SNAPSHOT_ID_PLUMBING="snapshot-id"
GHL_SNAPSHOT_ID_CLEANING="snapshot-id"
GHL_SNAPSHOT_ID_ROOFING="snapshot-id"
GHL_SNAPSHOT_ID_ELECTRICAL="snapshot-id"
GHL_SNAPSHOT_ID_DEFAULT="default-snapshot-id"

# Webhook Secret (optional)
GHL_WEBHOOK_SECRET="webhook-secret"
```

### 2. GoHighLevel Configuration

1. **Enable SaaS Mode** in your GoHighLevel agency account
2. **Create Industry Snapshots** for each business type with:
   - Pre-built workflows
   - Email templates
   - SMS templates
   - Pipeline stages
3. **Set up Webhook** in GoHighLevel pointing to:
   ```
   https://yourdomain.com/api/ghl/webhook
   ```

### 3. Testing the Integration

1. Create a new site through onboarding
2. Check the GHL settings in the preview bar
3. Submit a test lead through the contact form
4. Verify the lead appears in GoHighLevel

## API Endpoints

### `/api/ghl/setup` (POST)
Creates a GoHighLevel sub-account for a site.

**Request Body:**
```json
{
  "siteId": "site-id",
  "businessName": "Business Name",
  "email": "email@example.com",
  "phone": "(555) 123-4567",
  "address": "123 Main St",
  "industry": "landscaping",
  "website": "https://business.com"
}
```

### `/api/ghl/leads` (POST)
Submits a lead to GoHighLevel.

**Request Body:**
```json
{
  "siteId": "site-id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "message": "I need a quote",
  "formType": "contact",
  "source": "website"
}
```

### `/api/ghl/webhook` (POST)
Receives webhook events from GoHighLevel.

## Industry-Specific Custom Fields

Each industry has custom fields automatically created:

### Landscaping
- Property Size
- Service Frequency (Weekly, Bi-weekly, Monthly, One-time)
- Irrigation System (Yes/No)
- Preferred Service Day

### HVAC
- System Type (Central AC, Heat Pump, Furnace, etc.)
- Install Date
- Warranty Status
- Last Service Date

### Plumbing
- Property Type (Residential, Commercial, Industrial)
- Water Heater Age
- Has Sump Pump (Yes/No)
- Pipe Material

### Cleaning
- Property Size (square footage ranges)
- Service Frequency
- Pets (Dogs, Cats, Other, None)
- Preferred Products (Standard, Eco-friendly, Hypoallergenic)

### Roofing
- Roof Age
- Roof Type (Asphalt, Metal, Tile, etc.)
- Last Inspection Date
- Insurance Claim (Yes/No)

### Electrical
- Panel Type (100A, 150A, 200A, etc.)
- Property Age
- Has Generator (Yes/No)
- Last Inspection Date

## Troubleshooting

### Site Not Connecting to GHL
1. Check environment variables are set correctly
2. Verify GHL API credentials have proper permissions
3. Check browser console for API errors
4. Ensure the agency ID matches your account

### Leads Not Syncing
1. Verify GHL is enabled in site settings
2. Check the site has a valid ghlLocationId
3. Look for errors in the server logs
4. Test the API endpoint directly

### Webhook Not Working
1. Verify webhook URL is accessible publicly
2. Check webhook secret matches (if configured)
3. Look for webhook events in server logs
4. Test with GoHighLevel's webhook tester

## Security Considerations

1. **API Keys**: Store securely in environment variables
2. **Webhook Verification**: Implement signature verification when available
3. **Multi-tenant Isolation**: Each site only accesses its own GHL sub-account
4. **Error Handling**: Never expose sensitive errors to end users

## Future Enhancements

1. **Two-way Sync**: Pull contacts from GHL back to the site
2. **Appointment Booking**: Embed GHL calendar on sites
3. **Analytics Dashboard**: Show lead metrics in Suite Business
4. **Automated Workflows**: Trigger specific workflows based on form submissions
5. **SMS Integration**: Send/receive SMS through the site interface
6. **Pipeline Management**: View and manage opportunities

## Code Quality

Following CLAUDE.md guidelines:
- ✅ No console.log statements - using logger.ts
- ✅ Native fetch instead of axios
- ✅ Proper error handling
- ✅ TypeScript types throughout
- ✅ Multi-tenant isolation
- ✅ Zero technical debt
