# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Created**: December 2024  
**Last Updated**: December 28, 2024, 3:30 PM CST

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
Sitebango is a multi-industry SaaS platform for service-based businesses (landscaping, HVAC, plumbing, cleaning, roofing, electrical). It's a self-hosted solution with flexible onboarding - users can start with or without Google Business Profile, leveraging Google Places API for real business search and optional GoHighLevel Pro Plan's SaaS Mode.

### Quick Commands Reference
- `npm run add-agency-member email "name" role` - Add team member
- `npm run setup:agency` - Initial agency setup
- `npm run db:studio` - View/edit database
- See `.claude/commands.md` for full command list

## Documentation Structure
All documentation is organized in the `/docs` directory with the following structure:

### `/docs/api/` - API Documentation
- `API_DOCUMENTATION.md` - Complete API endpoint reference

### `/docs/architecture/` - System Architecture
- `IMPLEMENTATION_GUIDE.md` - Overall implementation guide
- `SITE_INFRASTRUCTURE.md` - Client site rendering system
- `TEMPLATE_SYSTEM.md` - Template and theme architecture
- `TEMPLATE_SELECTION_IMPLEMENTATION.md` - New AI template selection system
- `INTELLIGENT_CONTENT_GENERATION.md` - Smart content generation system

### `/docs/deployment/` - Deployment & Infrastructure
- `DEPLOY_VPS.md` - VPS deployment guide

### `/docs/development/` - Development Guides
- `DEVELOPMENT_GUIDE.md` - Development setup and practices
- `GEMINI.md` - Gemini AI assistant context
- `ONBOARDING.md` - Onboarding system documentation
- `template-selection-demo.ts` - Template selection example code

### `/docs/features/` - Feature Documentation
- `ANALYTICS_TRACKING.md` - Analytics implementation
- `AUTHENTICATION_FLOW.md` - Auth system details
- `CONTENT_EDITOR.md` - Content editing features
- `CUSTOM_DOMAINS.md` - Custom domain support
- `ENHANCED_FORMS.md` - Form handling system
- `LOGO_UPLOAD.md` - Logo upload and processing
- `TEAM_MANAGEMENT.md` - Team and permissions
- `STRIPE_BILLING.md` - Payment integration

### `/docs/industries/` - Industry-Specific Implementation
- `INDUSTRY_STANDARDS_LANDSCAPING.md` - Landscaping industry guide
- `LANDSCAPING_IMPLEMENTATION.md` - Landscaping site implementation
- `RESEARCH_DATA_FORMAT.md` - Research data structure

### `/docs/integrations/` - Third-Party Integrations
- `GHL_COMPLETE_GUIDE.md` - GoHighLevel integration guide
- `GOOGLE_INTEGRATION.md` - Google services integration

### `/docs/reports/` - Analysis Reports & Status
- `PRODUCT_COMPLETION_ANALYSIS.md` - Feature completion status
- `DOCUMENTATION_GAPS_ANALYSIS.md` - Missing documentation
- `ERROR_HANDLING_ANALYSIS.md` - Error handling review
- `SECURITY_ANALYSIS_REPORT.md` - Security assessment
- `WORK_COMPLETED.md` - Completed work log
- `ACTION_ITEMS.md` - Pending action items
- `CUSTOM_DOMAIN_REVIEW.md` - Custom domain implementation review

### `/docs/testing/` - Testing Documentation
- `TESTING.md` - Testing strategy and guidelines
- `TESTING_COVERAGE_REPORT.md` - Test coverage analysis

### `/docs/user-guides/` - User Manuals
- `USER_TRAINING_MANUAL.md` - User training guide
- `SITEBANGO_USER_TRAINING_MANUAL.md` - Platform user manual

## Team Structure & Permissions

### Agency Level (Your SaaS Company)
The platform uses a team-based architecture with three levels:

1. **Agency Team** (Your company)
   - **Owner** (Super Admin): Full system access, defined by SUPER_ADMIN_EMAIL
   - **Admin**: Can manage businesses, view financials, manage team
   - **Member**: Can view businesses and reports (read-only)

2. **Business Level** (Your clients)
   - Each business is owned by the user who created it
   - Future: Business teams with their own members

3. **Database Structure**
   ```
   Team (type: 'agency' or 'client')
   ├── TeamMember (links users to teams with roles)
   │   ├── role: 'owner' | 'admin' | 'member'
   │   └── permissions: JSON (future granular permissions)
   └── Site (businesses belong to teams)
   ```

### GoHighLevel Integration

#### Sync Strategy
- **App → GHL**: ALWAYS (All app users must exist in GHL)
- **GHL → App**: OPTIONAL (Not all GHL users need app access)

#### Key Points
- Each business gets a GHL sub-account (created via `createSaasSubAccount()`)
- Sub-accounts are linked via `ghlLocationId` in the Site model
- Users are automatically synced to GHL on creation
- Agency team members can be bulk imported

#### Adding Team Members
```bash
# Single member (creates user + adds to team + syncs to GHL)
npm run add-agency-member email@gmail.com "Full Name" role

# Bulk import
npm run add-agency-members-bulk
```

## Recent Enhancements

### December 2024
- **Custom Domain Support**: Full implementation with DNS verification and SSL automation
- **Multi-Account GBP Access**: Fixed critical bug where businesses weren't recognized across multiple Google accounts
- **Account Status Detection**: Shows badges for suspended accounts or accounts without GBP access
- **Smart Site Deletion**: Option to delete associated GoHighLevel sub-account when removing a site
- **Enhanced Auth Flow**: Fixed redirect issues to preserve context when adding Google accounts
- **Shared Caching System**: Optimized API calls with intelligent caching between endpoints
- **Logo Upload**: Smart resizing and optimization for different display contexts
- **Dashboard Redesign**: Comprehensive UI/UX improvements with better information architecture
- **Onboarding Persistence**: Full state persistence for onboarding flow with 24-hour retention
  - Automatically saves progress at every step
  - Resume capability with visual indicator
  - Handles browser refresh and navigation without data loss
  - Fixed parsing errors from concatenated code lines

### June 2025 - Intelligent Content Generation System
- **Data Scoring Algorithm**: 0-100 point system across 5 categories (basic info, content, visuals, trust, differentiation)
- **Smart Question Components**: 5 engaging UI components for data collection
  - TinderSwipe: Yes/no questions with swipe gestures, "I don't know" support, skip if known
  - ThisOrThat: Binary choice questions for positioning
  - StylePicker: Visual style selection (fonts, colors, layouts)
  - FontPairing: Typography combinations with live preview
  - MultipleChoice: Flexible single/multi-select with 3 variants
- **Question Intelligence**: Automatically skips questions when data is already known from GBP
- **Industry Profiles**: Complete configurations for all 6 supported industries
- **Progressive Enhancement**: Content quality improves as more data becomes available
- See `/docs/architecture/INTELLIGENT_CONTENT_GENERATION.md` for full documentation

### December 2024 - Template Variant Selection System
- **Data Quality Evaluator**: Analyzes business data quality/quantity to inform template selection
- **Template Variant Selector**: Intelligently selects optimal template variants based on data
- **Industry Content Populators**: Populates templates with real data + industry fallbacks
- **AI-Enhanced Selection**: Uses OpenAI when available, works without it
- See `/docs/architecture/TEMPLATE_SELECTION_IMPLEMENTATION.md` for implementation guide

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
  - `/intelligence` - Intelligent content generation endpoints
    - `/analyze` - Analyze business data and calculate scores
    - `/questions` - Generate smart questions based on data gaps
    - `/answers` - Store user responses to questions
    - `/generate` - Generate content based on all available data
  - `/dev` - Development and debugging endpoints
- `/app/s/[subdomain]` - Client-facing sites with dynamic content
- `/app/admin` - Admin panel for platform management
- `/app/dev` - Development tools and diagnostics
  - `/smart-questions` - Demo page for all smart question components

### Key Integration Points
1. **GoHighLevel (`/lib/ghl.ts`)**: 
   - Automated sub-account creation via SaaS Mode
   - Snapshot deployment for industry-specific setups
   - Sub-account deletion when removing sites
   - CRM operations (contacts, opportunities, appointments)
   - Webhook handling for real-time updates
   - See `/docs/integrations/GHL_COMPLETE_GUIDE.md` for full documentation

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
   - See `/docs/integrations/GOOGLE_INTEGRATION.md` for full documentation

3. **Database (`/lib/prisma.ts`)**:
   - Supports both PostgreSQL (production) and SQLite (development)
   - Multi-tenant data isolation
   - Prisma ORM for type-safe queries

### Component Structure
- Uses shadcn/ui components in `/components/ui`
- Smart question components in `/components/SmartQuestionComponents`
- Form handling with react-hook-form and zod validation
- Radix UI primitives for accessibility
- Framer Motion for smooth animations
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
- See `/docs/testing/` for testing documentation

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

See `/docs/architecture/SITE_INFRASTRUCTURE.md` for detailed documentation.

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
   
3. **Documentation Standards**:
   - Always include creation date and time CST when creating new documentation
   - Always update "Last Updated" date and time CST when modifying documentation
   - Use format: **Created**: Month Day, Year, Time CST, **Last Updated**: Month Day, Year, Time CST
   - Keep all documentation organized in `/docs` with appropriate subdirectories
   
4. **Before Completing Any Task**:
   - Run linting: `npm run lint` (when available)
   - Run type checking: `npm run typecheck` (when available)
   - Ensure no console.logs or debugging code remains
   - Verify no temporary files were left behind