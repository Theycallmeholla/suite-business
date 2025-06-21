# Suite Business - Multi-Industry Business Suite SaaS

A self-hosted SaaS platform for service-based businesses. Leverages GoHighLevel Pro Plan's SaaS Mode for automated sub-account creation and Google Business Profile API for local SEO dominance.

## Features

- **Multi-Industry Support**: Not just landscaping - any service business (HVAC, plumbing, cleaning, etc.)
- **GHL Pro SaaS Mode**: Automated sub-account creation with rebilling
- **Google Business Profile API**: Full integration for local SEO management
- **Smart Onboarding**: Pre-fills business info using Google Business Profile API
- **Multi-tenant Architecture**: Each client gets their own subdomain
- **White-labeled Experience**: Your branding, not GHL's
- **Automated SEO**: Local rankings, review management, directory listings

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL or SQLite  
- **CRM/Automation**: GoHighLevel Pro (SaaS Mode)
- **Local SEO**: Google Business Profile API
- **Payments**: Stripe + GHL rebilling
- **Auth**: NextAuth.js
- **Hosting**: Your VPS

## GHL Pro Plan Features We're Using

- ? **SaaS Mode**: Auto sub-account creation
- ? **Rebilling**: Markup on SMS, voice, AI features
- ? **White-label**: Custom domains and branding
- ? **API Access**: Full integration capabilities
- ? **Unlimited Sub-Accounts**: Scale without limits

## Revenue Model

- **Base Platform**: $297-997/month per client
- **Add-ons via GHL Rebilling**:
  - SMS/Email campaigns
  - AI chatbots
  - Voice features
  - Review automation

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local

# Configure database
npx prisma init --datasource-provider postgresql
npx prisma migrate dev

# Start development
npm run dev
```

## Google Business Profile API Setup

**Important:** The Google Business Profile API requires special access approval:

1. **Enable APIs** in Google Cloud Console:
   - Google My Business Account Management API
   - Google My Business Business Information API

2. **Request API Access** (Required!):
   - Visit https://developers.google.com/my-business/content/prereqs
   - Click "Request access to the API"
   - Fill out the application form
   - Wait 1-3 business days for approval

3. **Verify Setup**:
   - Run diagnostics at `/dev/gbp-setup` to check your configuration
   - Without API access approval, you'll get quota errors

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# GoHighLevel Pro
GHL_API_KEY="your-api-key"
GHL_LOCATION_ID="your-agency-location"
GHL_SAAS_MODE_KEY="your-saas-key"

# Google Business Profile API
GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"

# Stripe
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Domain
NEXT_PUBLIC_ROOT_DOMAIN="yourdomain.com"
```

## Project Structure

```
/app
  /(marketing)
    /page.tsx          - Landing page
    /industries        - Industry-specific pages
      /landscaping
      /hvac
      /plumbing
  /(app)
    /onboarding        - Smart onboarding
    /dashboard         - Client portal
    /settings
      /gbp            - Google Business Profile
      /automation     - GHL workflows
  /api
    /ghl
      /saas           - SaaS mode endpoints
      /webhook        - GHL webhooks
    /gbp              - Google Business Profile
    /stripe           - Payment handling
```

## Google Business Profile Integration

- **Profile Management**: Update hours, services, photos
- **Review Management**: Monitor and respond at scale
- **Post Scheduling**: Keep profiles active
- **Insights**: Track calls, directions, searches
- **Multi-location**: Manage chains efficiently

## Industry Templates

Each industry gets:
- Optimized website template
- Pre-built GHL automations
- Industry-specific review templates
- Service area page generators
- Content calendars

## Deployment

1. Set up PostgreSQL on VPS
2. Configure Nginx for subdomains
3. Set up Google Cloud project for GBP API
4. Configure GHL webhooks
5. Deploy with PM2

## Next Steps

1. Complete GHL SaaS mode integration
2. Build industry-specific templates
3. Set up Google Business Profile OAuth
4. Create onboarding automations
5. Launch to first industry vertical
