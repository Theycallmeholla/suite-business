# Development Setup Guide

This guide walks you through setting up the Suite Business platform for local development.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- A Google Cloud project with APIs enabled
- A GoHighLevel Pro account with SaaS mode
- (Optional) A Stripe account for payments

## Step 1: Clone and Install

```bash
# Clone the repository
git clone [your-repo-url]
cd suitebusiness

# Install dependencies
npm install
```

## Step 2: Environment Configuration

```bash
# Copy the example environment file
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

### Database Configuration
The default configuration uses Docker PostgreSQL:
```env
DATABASE_URL="postgresql://suitebusiness_user:suitebusiness_dev_password@localhost:5432/suitebusiness"
```

### Authentication Setup
Generate a NextAuth secret:
```bash
openssl rand -base64 32
```

Update in `.env.local`:
```env
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable these APIs:
   - Google My Business Account Management API
   - Google My Business Business Information API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret to `.env.local`

### GoHighLevel Configuration
From your GHL Agency settings, get:
- API Key
- Location ID
- Agency ID
- Private Integration Key (if using webhooks)

## Step 3: Database Setup

```bash
# Start Docker containers (PostgreSQL + Redis)
npm run docker:up

# Wait a few seconds for PostgreSQL to be ready
# Then push the Prisma schema
npm run db:push

# (Optional) Open Prisma Studio to view database
npm run db:studio
```

## Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Step 5: Google Business Profile API Access

**Important**: The GBP API requires special access approval.

1. Visit https://developers.google.com/my-business/content/prereqs
2. Click "Request access to the API"
3. Fill out the application form
4. Wait 1-3 business days for approval

Without API access approval, you'll get quota errors when trying to fetch business profiles.

## Quick Setup Script

For convenience, you can run all setup steps at once:

```bash
npm run setup
```

This will:
1. Install dependencies
2. Start Docker containers
3. Push database schema

## Troubleshooting

### Docker Issues
If PostgreSQL fails to start:
```bash
# Reset Docker containers
npm run docker:reset

# Check Docker logs
docker-compose logs
```

### Database Connection Issues
- Ensure Docker is running
- Check if PostgreSQL is accessible on port 5432
- Verify DATABASE_URL in `.env.local`

### Google API Errors
- Verify API is enabled in Google Cloud Console
- Check OAuth credentials are correct
- Ensure redirect URI matches exactly
- For GBP API: Confirm access request was approved

### Port Conflicts
If port 3000 is in use:
```bash
# Run on different port
PORT=3001 npm run dev
```

## Development Tools

### Available Routes
- `/` - Landing page
- `/signin` - Authentication
- `/onboarding` - Business setup flow
- `/dashboard` - Main app dashboard
- `/dev/gbp-setup` - GBP API diagnostics
- `/admin` - Platform admin panel

### Debugging
- Use the centralized logger: `import { logger } from '@/lib/logger'`
- View logs in development console
- Check `/dev/*` routes for API testing

### Database Management
```bash
# View database GUI
npm run db:studio

# Generate Prisma types after schema changes
npm run db:generate

# Create migration (for production)
npm run db:migrate
```

## Next Steps

1. Sign in with your Google account
2. Complete onboarding to connect a business
3. Explore the dashboard and features
4. Check documentation in `/docs` folder

For production deployment, see `DEPLOYMENT.md` (coming soon).
