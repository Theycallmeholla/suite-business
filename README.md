# Suite Business - Multi-Industry SaaS Platform

A self-hosted SaaS platform for service-based businesses (landscaping, HVAC, plumbing, cleaning, roofing, electrical) with Google Business Profile integration and white-label capabilities.

## Project Status

### ✅ Completed Features

1. **Authentication System**
   - Google OAuth with NextAuth
   - Session management
   - Multi-account support for GBP
   - Account status detection (active/suspended)
   - GBP access verification per account

2. **Flexible Onboarding Flow**
   - **Manual Business Setup** - Create sites without Google Business Profile
   - **Google Business Profile Integration** - Import existing GBP data
   - **Real Business Search** - Search for businesses using Google Places API
   - **Access Verification** - Check GBP ownership across multiple accounts
   - Business information import with auto-detection
   - Industry selection and confirmation
   - Site preview mode before publishing
   - Photo import from GBP
   - Publishing workflow
   - Resume onboarding after adding Google accounts

3. **Google Integration**
   - **Places API Integration** - Real-time business search with caching
   - **Place Details API** - Fetch comprehensive business information
   - **GBP Access Checking** - Verify user has access to claimed businesses
   - **Post-Setup GBP Creation** - Add Google Business Profile after site creation
   - Multi-account Google authentication support
   - Shared caching between API endpoints
   - Cost-optimized API usage with field masking

4. **Multi-Tenant Architecture**
   - Subdomain-based routing
   - Tenant isolation
   - Dynamic site generation

5. **Site Generation & Management**
   - Industry-specific templates
   - Content density adaptation
   - Photo gallery support
   - SEO-friendly structure
   - Business hours management
   - Service area configuration
   - Logo upload with smart resizing
   - Site deletion with optional GHL cleanup

### 🚧 In Progress

1. **GoHighLevel Integration**
   - API connection established
   - Sub-account creation implemented
   - Automated snapshot deployment
   - Optional deletion when removing sites
   - Webhook handling pending
   - CRM features partially implemented

2. **Site Editing**
   - Basic customization (colors, logo) complete
   - SEO settings management
   - Content editing pending
   - Page builder pending

### 📋 Planned Features

1. **Business Tools**
   - Lead capture forms
   - Appointment booking
   - CRM integration
   - Email automation

2. **Enhanced Customization**
   - Logo upload ✅ (completed)
   - Font selection
   - Multiple templates
   - Layout options

3. **Revenue Features**
   - Stripe billing
   - Subscription management
   - Usage tracking
   - White-label options

## Quick Start

### Prerequisites
- Node.js 18+
- Docker (for PostgreSQL)
- Google Cloud Console account (for OAuth and APIs)
- GoHighLevel Pro Plan (optional)

### Setup
```bash
# Clone the repository
git clone [repository-url]
cd suitebusiness

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Start Docker containers
npm run docker:up

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Environment Variables
See `.env.local.example` for required variables:
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_*` - Authentication setup
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `GOOGLE_MAPS_API_KEY` - For Places API (business search)
- `GHL_*` - GoHighLevel API keys (optional)

### Google Cloud Setup
1. **Create a Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create a new project or select existing

2. **Enable Required APIs**
   - Places API (New) - For business search
   - Maps JavaScript API - For maps display (optional)
   - Google Business Profile API - For GBP management
   - Google My Business Account Management API

3. **Create Credentials**
   - **OAuth 2.0 Client ID** (already setup for auth)
     - Add authorized redirect URIs
     - Download credentials
   - **API Key** for Places API
     - Restrict to specific APIs
     - Add HTTP referrer restrictions

4. **Configure API Key Security**
   - Restrict to your domains
   - Limit to required APIs only
   - Use environment variables

## Architecture

### Tech Stack
- **Frontend**: Next.js 15, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth with Google OAuth
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Validation**: Zod
- **Forms**: React Hook Form

### Directory Structure
```
/app                    # Next.js 15 app directory
  /(app)               # Authenticated app routes
  /(auth)              # Auth pages
  /api                 # API endpoints
  /onboarding          # Onboarding flow
  /preview             # Site preview
  /s/[subdomain]       # Client sites
/components            # React components
/lib                   # Core utilities
/prisma               # Database schema
/public               # Static assets
/docs                 # Documentation
```

### Key Design Decisions
1. **Multi-tenancy via subdomains** - Each client gets subdomain.domain.com
2. **Self-hosted first** - No cloud dependencies required
3. **Industry-specific** - Templates and features per industry
4. **API-first** - Clean separation of concerns
5. **Type-safe** - Full TypeScript with Prisma

## Development

### Commands
```bash
npm run dev            # Start dev server
npm run build          # Production build
npm run start          # Start production
npm run db:studio      # Prisma Studio GUI
npm run db:push        # Update database
npm run docker:up      # Start PostgreSQL
npm run docker:down    # Stop PostgreSQL
```

### Code Quality Standards
- **ZERO technical debt policy** - Fix issues immediately
- **No console.log** - Use logger.ts instead
- **No TODOs** - Complete tasks or track in issues
- **Native APIs** - Prefer fetch over axios
- **File consolidation** - Update existing files when possible

### Testing Approach
Currently using manual testing. Automated tests planned:
- Unit tests with Jest
- E2E tests with Playwright
- API tests with Supertest

## Onboarding Flows

### Two Paths to Success
1. **With Google Business Profile**
   - User signs in with Google
   - Searches for or selects their business
   - Imports business data automatically
   - Confirms industry and details
   - Site is created with rich content

2. **Without Google Business Profile** 
   - User provides business information manually
   - Configures business hours
   - Adds services and descriptions
   - Site is created immediately
   - Can add GBP later from dashboard

### Business Search Features
- **Autocomplete Search** - Real-time suggestions as users type
- **Google-like Experience** - Familiar dropdown interface
- **Rich Business Data** - Shows ratings, reviews, and verification status
- **Smart Caching** - Reduces API costs with intelligent caching
- **Session Tokens** - Optimized billing with autocomplete sessions
- **Fallback Options** - Manual entry if business not found

## Documentation

### Key Documents
- `/CLAUDE.md` - AI assistant guidelines
- `/docs/ONBOARDING_IMPLEMENTATION_SUMMARY.md` - Onboarding details
- `/docs/SITE_INFRASTRUCTURE.md` - Site rendering system
- `/docs/ONBOARDING_FLOW_PLAN.md` - Original implementation plan

### API Documentation
API endpoints follow RESTful conventions:
- `GET /api/sites` - List user's sites
- `POST /api/sites` - Create new site (manual or GBP)
- `POST /api/sites/create-from-gbp` - Create from GBP with GHL integration
- `POST /api/sites/[id]/publish` - Publish site
- `POST /api/sites/upload-logo` - Upload and resize logo
- `DELETE /api/sites/[id]` - Delete site (with optional GHL deletion)
- `GET /api/gbp/accounts` - List connected Google accounts
- `GET /api/gbp/my-locations` - Get user's GBP locations
- `POST /api/gbp/search` - Search for businesses
- `POST /api/gbp/place-details` - Get detailed place info
- `POST /api/gbp/check-access` - Verify GBP access
- `POST /api/gbp/check-ownership` - Check business ownership
- `POST /api/gbp/create-location` - Create new GBP listing

## Contributing

### Getting Started
1. Read `/CLAUDE.md` for code standards
2. Check open issues for tasks
3. Follow existing patterns
4. Test thoroughly
5. Update documentation

### Pull Request Process
1. Create feature branch
2. Implement with zero technical debt
3. Test all edge cases
4. Update relevant docs
5. Submit PR with clear description

## Support

### Common Issues

**Google OAuth Setup**
- Enable Google+ API in Cloud Console
- Add authorized redirect URIs
- Set correct scopes for GBP access

**Database Connection**
- Ensure Docker is running
- Check DATABASE_URL format
- Run `npm run db:push` after schema changes

**Subdomain Routing**
- Add subdomains to /etc/hosts for local dev
- Configure DNS for production
- Check middleware.ts for routing logic

## License

[License Type] - See LICENSE file

## Next Steps

For developers continuing this project:
1. Read `/docs/ONBOARDING_IMPLEMENTATION_SUMMARY.md`
2. Check `/CLAUDE.md` for standards
3. Pick a feature from "Planned Features"
4. Follow existing patterns
5. Maintain zero technical debt

## Recent Updates

### December 2024
- ✅ Fixed GBP access checking across multiple accounts
- ✅ Added account status badges (suspended/no GBP)
- ✅ Implemented site deletion with optional GHL cleanup
- ✅ Fixed auth redirect flow to preserve context
- ✅ Added shared caching system for API optimization
- ✅ Implemented logo upload with smart resizing
- ✅ Enhanced error handling and logging throughout

Last Updated: December 22, 2024
Status: Active Development
