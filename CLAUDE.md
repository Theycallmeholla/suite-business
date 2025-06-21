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

Commands are defined in `.claude/commands/`

## Project Overview
Suite Business is a multi-industry SaaS platform for service-based businesses (landscaping, HVAC, plumbing, cleaning, roofing, electrical). It's a self-hosted solution leveraging GoHighLevel Pro Plan's SaaS Mode and Google Business Profile API.

## Development Commands
```bash
# Development with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Database commands
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to database
npx prisma studio      # Open database GUI

# Setup scripts
./setup-local.sh       # Quick SQLite development setup
./setup-free.sh        # Open-source friendly setup
./setup-complete.sh    # Full production setup with prompts
```

## Architecture Overview

### Multi-tenant Structure
- Each client gets their own subdomain handled via `/middleware.ts`
- Dynamic subdomain routing at `/app/s/[subdomain]`
- User model has `subdomain` field for tenant isolation

### App Directory Organization
- `/app/(marketing)` - Public landing pages and industry-specific marketing pages
- `/app/(app)` - Authenticated application routes (requires auth)
  - `/onboarding` - Client onboarding flow with GHL/GBP setup
  - `/dashboard` - Main application dashboard
  - `/settings` - Account and configuration settings
- `/app/api` - API routes for external integrations
- `/app/s/[subdomain]` - Client-facing sites with dynamic content

### Key Integration Points
1. **GoHighLevel (`/lib/ghl.ts`)**: 
   - Automated sub-account creation via SaaS Mode
   - Snapshot deployment for industry-specific setups
   - Webhook handling for real-time updates

2. **Google Business Profile (`/lib/google-business-profile.ts`)**:
   - Service account authentication
   - Profile creation and management
   - Local SEO optimization features

3. **Database (`/lib/prisma.ts`)**:
   - Supports both PostgreSQL (production) and SQLite (development)
   - Multi-tenant data isolation
   - Prisma ORM for type-safe queries

### Component Structure
- Uses shadcn/ui components in `/components/ui`
- Form handling with react-hook-form and zod validation
- Radix UI primitives for accessibility
- Tailwind CSS v4 for styling

## Environment Configuration
Required environment variables are defined in `.env.example`. Key integrations:
- `DATABASE_URL` - PostgreSQL or SQLite connection
- `NEXTAUTH_*` - Authentication configuration
- `GHL_*` - GoHighLevel API and SaaS mode credentials
- `GOOGLE_*` - Google Business Profile service account
- `STRIPE_*` - Payment processing keys
- Industry-specific `GHL_SNAPSHOT_ID_*` variables

## Testing Approach
Currently no automated tests are set up. When implementing tests:
- Use Jest for unit tests
- Use Playwright for E2E tests
- Test multi-tenant isolation
- Mock external API calls (GHL, GBP, Stripe)

### Future Testing Commands (placeholders)
```bash
# Unit tests
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report

# E2E tests
npm run test:e2e       # Run Playwright tests
npm run test:e2e:ui    # Open Playwright UI

# Specific test suites
npm run test:auth      # Test authentication flows
npm run test:tenant    # Test multi-tenant isolation
npm run test:ghl       # Test GoHighLevel integration
npm run test:gbp       # Test Google Business Profile integration
```

## Important Considerations
1. **Multi-tenancy**: Always filter data by subdomain/site
2. **Self-hosted**: Code should work on VPS without cloud dependencies
3. **White-label**: UI should be customizable per client
4. **Industry-specific**: Features vary by industry vertical
5. **Revenue model**: Pricing tiers affect feature availability

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