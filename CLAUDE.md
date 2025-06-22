# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference: Claude Commands
Use these slash commands for common tasks:
- `/add-industry` - Add a new industry vertical
- `/test-tenant` - Test multi-tenant isolation
- `/setup-landscaping` - Configure landscaping business
- `/setup-hvac` - Configure HVAC business  
- `/setup-plumbing` - Configure plumbing business
- `/ghl-integration` - GoHighLevel integration tasks
- `/gbp-setup` - Google Business Profile setup
- `/cleanup-tech-debt` - Find and eliminate technical debt
- `/test-manual-setup` - Test manual business setup flow
- `/test-gbp-search` - Test Google Places search integration
- `/test-gbp-access` - Test GBP access checking across accounts
- `/test-site-deletion` - Test site deletion with GHL cleanup

Commands are defined in `.claude/commands/`

## Project Overview
Suite Business is a multi-industry SaaS platform for service-based businesses (landscaping, HVAC, plumbing, cleaning, roofing, electrical). It's a self-hosted solution with flexible onboarding - users can start with or without Google Business Profile, leveraging Google Places API for real business search and optional GoHighLevel Pro Plan's SaaS Mode.

## Recent Enhancements (December 2024)
- **Custom Domain Support**: Full implementation with DNS verification and SSL automation
- **Multi-Account GBP Access**: Fixed critical bug where businesses weren't recognized across multiple Google accounts
- **Account Status Detection**: Shows badges for suspended accounts or accounts without GBP access
- **Smart Site Deletion**: Option to delete associated GoHighLevel sub-account when removing a site
- **Enhanced Auth Flow**: Fixed redirect issues to preserve context when adding Google accounts
- **Shared Caching System**: Optimized API calls with intelligent caching between endpoints
- **Logo Upload**: Smart resizing and optimization for different display contexts
- **Dashboard Redesign**: Comprehensive UI/UX improvements with better information architecture

## Development Commands
```bash
# Development with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Database commands
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run database migrations
npm run db:studio      # Open Prisma Studio GUI

# Docker commands
npm run docker:up      # Start Docker containers (PostgreSQL, Redis)
npm run docker:down    # Stop Docker containers
npm run docker:reset   # Reset Docker containers and volumes

# Complete setup
npm run setup          # Install deps, start Docker, and push DB schema
```

## Architecture Overview

### Multi-tenant Structure
- Each client gets their own subdomain handled via `/middleware.ts`
- Dynamic subdomain routing at `/app/s/[subdomain]`
- User model has `subdomain` field for tenant isolation

### App Directory Organization
- `/app/(app)` - Authenticated application routes (requires auth)
  - `/dashboard` - Main application dashboard
- `/app/(auth)` - Authentication-related pages and components
- `/app/onboarding` - Flexible onboarding flow (manual setup or GBP import)
  - `/components/ManualBusinessSetup.tsx` - Manual business creation wizard
  - `/components/BusinessConfirmation.tsx` - GBP data confirmation
  - `/components/IndustrySelector.tsx` - Industry selection with auto-detection
- `/app/api` - API routes for external integrations
  - `/auth` - Authentication endpoints
  - `/gbp` - Google Business Profile endpoints
    - `/accounts` - List connected Google accounts with status
    - `/search` - Real-time business search with Places API
    - `/place-details` - Detailed business information
    - `/check-access` - Verify GBP access across accounts
    - `/check-ownership` - Check business ownership status
    - `/create-location` - Create new GBP listings
    - `/my-locations` - User's existing GBP locations
  - `/ghl` - GoHighLevel integration endpoints
  - `/crm` - CRM functionality endpoints
  - `/sites` - Site management endpoints
  - `/dev` - Development and debugging endpoints
- `/app/s/[subdomain]` - Client-facing sites with dynamic content
- `/app/admin` - Admin panel for platform management
- `/app/dev` - Development tools and diagnostics

### Key Integration Points
1. **GoHighLevel (`/lib/ghl.ts`)**: 
   - Automated sub-account creation via SaaS Mode
   - Snapshot deployment for industry-specific setups
   - Sub-account deletion when removing sites
   - CRM operations (contacts, opportunities, appointments)
   - Webhook handling for real-time updates

2. **Google Integration**:
   - **Google Business Profile (`/lib/google-business-profile.ts`)**:
     - OAuth2-based authentication (users sign in with Google)
     - Profile fetching and management via API
     - Multi-account support through account switching
   - **Google Places API (`/api/gbp/search`, `/api/gbp/place-details`)**:
     - Real-time business search with intelligent caching
     - Detailed place information retrieval
     - Cost optimization through field masking
     - $200/month free tier usage optimization

3. **Database (`/lib/prisma.ts`)**:
   - Supports both PostgreSQL (production) and SQLite (development)
   - Multi-tenant data isolation
   - Prisma ORM for type-safe queries

### Component Structure
- Uses shadcn/ui components in `/components/ui`
- Form handling with react-hook-form and zod validation
- Radix UI primitives for accessibility
- Tailwind CSS v4 for styling
- Centralized logging system (`/lib/logger.ts`) - replaces all console statements
- Toast notification system (`/lib/toast.ts`) - user feedback with Sonner
- Shared cache system (`/lib/gbp-cache.ts`) - optimizes API calls
- Business claim dialog (`/components/BusinessClaimDialog.tsx`) - handles ownership verification

## Environment Configuration
Required environment variables are defined in `.env.local.example`. Key integrations:
- `DATABASE_URL` - PostgreSQL connection (default: local Docker PostgreSQL)
- `NEXTAUTH_*` - Authentication configuration
- `GHL_*` - GoHighLevel API and SaaS mode credentials
  - `GHL_API_KEY` - Main API key
  - `GHL_LOCATION_ID` - Agency location ID
  - `GHL_AGENCY_ID` - Agency account ID
  - `GHL_PRIVATE_INTEGRATIONS_KEY` - Private integration key
- `GOOGLE_*` - Google credentials
  - `GOOGLE_CLIENT_ID` - OAuth client ID (for authentication)
  - `GOOGLE_CLIENT_SECRET` - OAuth client secret
  - `GOOGLE_MAPS_API_KEY` - Google Maps/Places API key (for business search)
- `STRIPE_*` - Payment processing keys
- `SMTP_*` - Email configuration (optional)
- Industry-specific `GHL_SNAPSHOT_ID_*` variables (placeholders)

## Testing Approach
**Note: Automated testing is not yet implemented.** This section describes the planned testing strategy:

### Future Testing Implementation
When tests are added, the approach will be:
- Jest for unit tests
- Playwright for E2E tests
- Test multi-tenant isolation
- Mock external API calls (GHL, GBP, Stripe)

### Planned Testing Commands
These commands will be available once testing is implemented:
```bash
# Unit tests (not yet available)
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report

# E2E tests (not yet available)
npm run test:e2e       # Run Playwright tests
npm run test:e2e:ui    # Open Playwright UI

# Specific test suites (not yet available)
npm run test:auth      # Test authentication flows
npm run test:tenant    # Test multi-tenant isolation
npm run test:ghl       # Test GoHighLevel integration
npm run test:gbp       # Test Google Business Profile integration
```

### Current Testing Approach
- Manual testing using development environment
- Use `/dev/*` routes for API testing and diagnostics
- Desktop Commander for UI screenshot testing
- Logging system helps with debugging (`/lib/logger.ts`)

## Important Considerations
1. **Multi-tenancy**: Always filter data by subdomain/site
2. **Self-hosted**: Code should work on VPS without cloud dependencies
3. **White-label**: UI should be customizable per client
4. **Industry-specific**: Features vary by industry vertical
5. **Revenue model**: Pricing tiers affect feature availability
6. **Flexible onboarding**: Support both GBP and manual business setup
7. **API cost management**: Cache Google API responses aggressively
8. **Progressive enhancement**: Sites work without GBP, enhance with it
9. **Account management**: Support multiple Google accounts per user
10. **Smart deletion**: Clean up associated services when deleting sites

## Site Infrastructure
The platform uses a component-based template system for client sites:
- **Section Components**: Modular sections (Hero, About, Services, etc.) in `/components/site-sections/`
- **Dynamic Rendering**: Sections auto-generated based on available content density
- **Industry Detection**: Automatic detection and customization based on business type
- **Subdomain Routing**: Each site accessible via subdomain (e.g., `demo.localhost:3000`)
- **Content Adaptation**: Rich/moderate/minimal layouts based on data availability

See `/docs/SITE_INFRASTRUCTURE.md` for detailed documentation.

## Tool Usage Preferences
- **Use fetch for HTTP requests** - Prefer native fetch over external libraries
- **Use desktop-commander for UI testing** - For screenshot-based UI development and testing
- **Avoid unnecessary dependencies** - Use built-in Node.js/browser APIs when possible

## Code Quality Standards
1. **ZERO TOLERANCE for Technical Debt**: 
   - Always refactor code when making changes rather than adding workarounds
   - Use proper abstractions and avoid code duplication
   - Follow DRY (Don't Repeat Yourself) principles
   - Address TODO comments immediately rather than deferring them
   - Choose long-term maintainability over quick fixes
   - Properly handle errors and edge cases
   - Write self-documenting code with clear variable and function names
   - Keep functions small and focused on a single responsibility
   
2. **File Management Philosophy**:
   - ALWAYS prefer updating existing files over creating new ones
   - Append to existing modules rather than creating separate files
   - Clean up any temporary files or debugging code before completing work
   - Consolidate related functionality into existing modules
   
3. **Before Completing Any Task**:
   - Run linting: `npm run lint` (when available)
   - Run type checking: `npm run typecheck` (when available)
   - Ensure no console.logs or debugging code remains
   - Verify no temporary files were left behind