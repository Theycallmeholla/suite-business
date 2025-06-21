# GoHighLevel Pro Plan - SaaS Mode Setup Guide

## Prerequisites
- GoHighLevel Agency Pro Plan ($497/month)
- Stripe account
- Your agency must be verified in GHL

## Step 1: Connect Stripe to GHL

1. Log into your **Agency** GoHighLevel account
2. Go to **Settings > Payments**
3. Click **"Connect To Your Stripe Account"**
4. Follow the OAuth flow to connect Stripe
5. Once connected, you'll see your Stripe account info

?? **Important**: This Stripe connection is for YOUR agency to collect payments from clients.

## Step 2: Access SaaS Configurator

1. In your Agency dashboard, go to **Settings > SaaS Configurator**
2. You'll see 3 pre-built example plans - you can edit or delete these
3. Click **"Add Your Plan"** to create custom plans

## Step 3: Create Your Pricing Plans

For each plan (Starter, Professional, Enterprise):

1. **Basic Info**:
   - Plan Name: "Starter", "Professional", etc.
   - Description: Brief description

2. **Pricing**:
   - Monthly Price: $297, $597, $997
   - Annual Price: Optional discount
   - Trial Period: 14 days recommended

3. **Features to Include**:
   ```
   Starter ($297):
   ? Conversations
   ? Calendar
   ? Contacts (CRM)
   ? Opportunities
   ? Websites
   ? Forms
   ? Workflows (Basic)
   
   Professional ($597):
   ? Everything in Starter
   ? Email Marketing
   ? SMS Marketing
   ? Funnel Builder
   ? Membership Sites
   ? Reviews Management
   
   Enterprise ($997):
   ? Everything in Professional
   ? AI Features
   ? Advanced Reporting
   ? API Access
   ? Custom Limits
   ```

4. **Rebilling Settings**:
   - SMS Markup: 50%
   - Email Markup: 30%
   - Phone Markup: 40%
   - AI Markup: 60%

5. **Snapshot**: Attach industry template

## Step 4: Get Your API Credentials

1. Go to **Settings > API Keys**
2. Create a new API key with full permissions
3. Copy your API key - this is your `GHL_API_KEY`

4. Find your Location ID:
   - Go to **Settings > Company**
   - Your Location ID is shown there
   - This is your `GHL_LOCATION_ID`

5. Find your Agency ID:
   - It's in the URL when you're in agency view
   - Format: `https://app.gohighlevel.com/v2/location/{AGENCY_ID}/...`

## Step 5: Set Up Webhooks (Optional)

1. Go to **Settings > Webhooks**
2. Click **"Add Webhook"**
3. Configure:
   ```
   URL: https://yourdomain.com/api/ghl/webhook
   
   Events to Subscribe:
   - Contact Created
   - Contact Updated
   - Opportunity Stage Changed
   - Appointment Scheduled
   - Form Submitted
   - Invoice Paid
   ```

4. Save and copy the webhook signature if provided

## Step 6: Create Industry Snapshots

1. Build a complete setup for each industry:
   - Landscaping template
   - HVAC template
   - Plumbing template
   - etc.

2. For each template, go to **Settings > Snapshots**
3. Click **"Create Snapshot"**
4. Include:
   - Funnels
   - Websites
   - Workflows
   - Email Templates
   - SMS Templates
   - Forms
   - Custom Fields

5. Copy each Snapshot ID for your .env file

## Step 7: Enable Auto Sub-Account Creation

When someone signs up through your SaaS sales page:

1. GHL automatically creates a sub-account
2. Applies the selected snapshot
3. Creates user login
4. Sends welcome email
5. Starts billing through Stripe

## Step 8: Test the Flow

1. Create a test purchase through your sales funnel
2. Verify:
   - Sub-account created ?
   - Snapshot applied ?
   - User can login ?
   - Billing works ?

## Common Issues

### "Cannot create sub-account"
- Verify Stripe is connected
- Check API key has full permissions
- Ensure you're on Pro plan

### "Snapshot not applying"
- Verify snapshot ID is correct
- Check snapshot includes all needed assets
- Test snapshot manually first

### "Billing not working"
- Check Stripe products match GHL
- Verify webhook is firing
- Check Stripe logs

## API Endpoints You'll Use

```javascript
// Create sub-account with SaaS mode
POST https://services.leadconnectorhq.com/locations/
{
  "companyName": "Bob's Landscaping",
  "email": "bob@email.com",
  "phone": "+15551234567",
  "address": "123 Main St, Austin, TX 78701",
  "settings": {
    "saasMode": true
  },
  "snapshotId": "your-snapshot-id"
}

// Create user for sub-account
POST https://services.leadconnectorhq.com/locations/{locationId}/users
{
  "email": "bob@email.com",
  "firstName": "Bob",
  "lastName": "Smith",
  "role": "admin"
}
```

## Your Actual ENV Values

Based on SaaS Mode setup:
```env
# From GHL Settings > API Keys
GHL_API_KEY="get-from-api-keys-page"

# From Settings > Company
GHL_LOCATION_ID="get-from-company-settings"

# From URL in agency view
GHL_AGENCY_ID="get-from-url"

# Snapshots you create
GHL_SNAPSHOT_LANDSCAPING="create-and-get-id"
GHL_SNAPSHOT_HVAC="create-and-get-id"
# etc...
```

## Next Steps

1. Complete Stripe connection
2. Create your 3 pricing tiers in SaaS Configurator
3. Build industry snapshots
4. Get API credentials
5. Test with one client
6. Launch!

Remember: The plans you create in SaaS Configurator are automatically created in Stripe - do NOT delete or edit them directly in Stripe.
