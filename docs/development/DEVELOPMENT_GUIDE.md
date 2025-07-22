# Development Guide

**Created**: December 23, 2024, 3:15 PM CST  
**Last Updated**: December 23, 2024, 3:15 PM CST

## Overview

This comprehensive guide covers everything you need to develop, test, and deploy the Suite Business platform, from local development with Docker to production deployment on a VPS.

## Prerequisites

### Development Environment
- Node.js 18+ and npm
- Docker Desktop
- Git
- A code editor (VS Code recommended)

### External Services
- Google Cloud project with APIs enabled
- GoHighLevel Pro account with SaaS mode ($497/month)
- Stripe account (for payment processing)
- A domain name (for production)

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone [your-repo-url]
cd suitebusiness

# Install dependencies
npm install
```

### 2. Quick Setup with Docker

We provide a complete Docker setup for local development:

```bash
# Make setup script executable
chmod +x setup-docker.sh

# Run the setup script
./setup-docker.sh
```

This script will:
- Start PostgreSQL and Redis containers
- Create the `.env.local` file with Docker credentials
- Set up the database

Alternatively, run commands manually:

```bash
# Start Docker services
npm run docker:up

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### 3. Environment Configuration

Copy and configure the environment file:

```bash
cp .env.local.example .env.local
```

#### Essential Environment Variables

```env
# Database (Docker PostgreSQL)
DATABASE_URL="postgresql://suitebusiness_user:suitebusiness_dev_password@localhost:5432/suitebusiness"

# Authentication
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Google Maps API (for Places search)
GOOGLE_MAPS_API_KEY="your-api-key"

# GoHighLevel
GHL_API_KEY="your-ghl-api-key"
GHL_LOCATION_ID="your-agency-location-id"
GHL_AGENCY_ID="your-agency-id"
GHL_PRIVATE_INTEGRATIONS_KEY="pit-..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 4. Google Cloud Setup

1. **Create a Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project

2. **Enable APIs**
   - Google My Business Account Management API
   - Google My Business Business Information API
   - Places API (New)
   - Maps JavaScript API

3. **Create OAuth Credentials**
   - Type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google` (for production)

4. **Create API Key**
   - For Places API and Maps
   - Restrict to your domains
   - Add to `.env.local` as `GOOGLE_MAPS_API_KEY`

5. **Request GBP API Access**
   - Visit https://developers.google.com/my-business/content/prereqs
   - Submit access request form
   - Wait 1-3 business days for approval

### 5. Development Commands

```bash
# Start development server
npm run dev

# Database management
npm run db:studio      # Open Prisma Studio GUI
npm run db:push        # Push schema changes
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Create migrations

# Docker management
npm run docker:up      # Start containers
npm run docker:down    # Stop containers
npm run docker:reset   # Reset and restart

# Testing (when implemented)
npm run test           # Run unit tests
npm run test:e2e       # Run E2E tests

# Building
npm run build          # Production build
npm run start          # Start production server
```

### 6. Accessing Services

- **Application**: http://localhost:3000
- **Database UI**: http://localhost:8080
  - System: PostgreSQL
  - Server: postgres
  - Username: suitebusiness_user
  - Password: suitebusiness_dev_password
  - Database: suitebusiness
- **Prisma Studio**: http://localhost:5555 (when running `npm run db:studio`)

## Development Workflow

### 1. Feature Development

1. Create a feature branch
2. Make changes following CLAUDE.md guidelines
3. Test locally with different scenarios
4. Ensure no console.log statements remain
5. Run linting and type checking (when available)

### 2. Database Changes

1. Update Prisma schema in `prisma/schema.prisma`
2. Run `npm run db:push` for development
3. Test changes thoroughly
4. Create migration for production: `npm run db:migrate`

### 3. API Development

- API routes in `/app/api/`
- Use centralized logger: `import { logger } from '@/lib/logger'`
- Handle errors gracefully
- Return appropriate status codes
- Document endpoints in API_DOCUMENTATION.md

### 4. Debugging Routes

- `/dev/gbp-setup` - Test Google Business Profile connection
- `/dev/test-ghl` - Test GoHighLevel integration
- `/dev/test-email` - Test email configuration
- `/admin` - Platform administration

## Docker Details

### Docker Compose Services

```yaml
services:
  postgres:
    - Port: 5432
    - Data persisted in Docker volume
    - Auto-restarts on failure
    
  redis:
    - Port: 6379
    - Used for caching and queues
    - Data persisted in Docker volume
    
  adminer:
    - Port: 8080
    - Web-based database management
    - Access all databases
```

### Common Docker Commands

```bash
# View logs
docker-compose logs -f

# Access PostgreSQL CLI
docker exec -it suitebusiness-postgres psql -U suitebusiness_user -d suitebusiness

# Reset database
docker-compose down -v
docker-compose up -d

# Check container status
docker-compose ps
```

## Production Deployment

### 1. VPS Requirements

- Ubuntu 20.04+ or similar
- 2GB+ RAM
- 20GB+ storage
- Node.js 18+
- PostgreSQL 13+
- Nginx
- PM2
- SSL certificate

### 2. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2
sudo npm install -g pm2
```

### 3. Database Setup

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE suitebusiness;
CREATE USER suitebusiness_user WITH ENCRYPTED PASSWORD 'strong-password';
GRANT ALL PRIVILEGES ON DATABASE suitebusiness TO suitebusiness_user;
\q
```

### 4. Application Deployment

```bash
# Clone repository
cd /var/www
git clone [your-repo-url] suitebusiness
cd suitebusiness

# Install dependencies
npm install

# Copy and configure environment
cp .env.local.example .env.local
# Edit with production values

# Build application
npm run build

# Run database migrations
npm run db:migrate:deploy

# Start with PM2
pm2 start npm --name "suitebusiness" -- start
pm2 save
pm2 startup
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/suitebusiness`:

```nginx
# Main application
server {
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Wildcard subdomains for client sites
server {
    server_name *.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/suitebusiness /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d *.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 7. File Uploads

Create upload directory:
```bash
sudo mkdir -p /var/www/suitebusiness-uploads
sudo chown -R www-data:www-data /var/www/suitebusiness-uploads
```

Update `.env.local`:
```env
UPLOAD_DIR="/var/www/suitebusiness-uploads"
```

## Troubleshooting

### Docker Issues

**PostgreSQL won't start:**
```bash
# Check logs
docker-compose logs postgres

# Reset completely
npm run docker:reset
```

**Port conflicts:**
```bash
# Check what's using the port
sudo lsof -i :5432

# Use different ports in docker-compose.yml
```

### Database Connection Issues

1. Verify Docker is running: `docker-compose ps`
2. Check connection string in `.env.local`
3. Test connection: `psql $DATABASE_URL`
4. Check firewall isn't blocking ports

### Google API Errors

**"API not enabled":**
- Enable the API in Google Cloud Console
- Wait 5-10 minutes for propagation

**"Invalid credentials":**
- Verify Client ID and Secret
- Check redirect URI matches exactly
- Ensure domain is authorized

**"Quota exceeded":**
- Check API quotas in Cloud Console
- Implement caching to reduce calls
- For GBP: Ensure access was approved

### Build Errors

**"Module not found":**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Out of memory:**
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## Performance Optimization

### Development
- Use React DevTools
- Monitor bundle size
- Implement lazy loading
- Use React Server Components

### Production
- Enable gzip compression in Nginx
- Set up CDN for static assets
- Configure proper caching headers
- Use PM2 cluster mode for multiple cores

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local`
   - Use strong, unique passwords
   - Rotate API keys regularly

2. **Database**
   - Use connection pooling
   - Enable SSL in production
   - Regular backups
   - Limit user permissions

3. **Application**
   - Keep dependencies updated
   - Implement rate limiting
   - Use HTTPS everywhere
   - Validate all inputs

## Monitoring

### PM2 Monitoring
```bash
# View logs
pm2 logs suitebusiness

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Application Logs
- Check `/lib/logger.ts` output
- Set up log rotation
- Consider log aggregation service

### Health Checks
- Set up uptime monitoring
- Monitor API response times
- Track error rates

## Backup Strategy

### Database Backups
```bash
# Manual backup
pg_dump -U suitebusiness_user suitebusiness > backup_$(date +%Y%m%d).sql

# Automated daily backups
0 2 * * * pg_dump -U suitebusiness_user suitebusiness > /backups/db_$(date +\%Y\%m\%d).sql
```

### File Backups
- Backup uploaded files regularly
- Store backups off-server
- Test restore procedures

## Support Resources

- **Documentation**: Check `/docs` folder
- **CLAUDE.md**: Development standards
- **GitHub Issues**: Report bugs
- **Community**: GoHighLevel Facebook group

Remember to follow the ZERO technical debt principle and maintain clean, well-documented code!