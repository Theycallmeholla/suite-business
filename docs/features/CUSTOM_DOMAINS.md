# Custom Domain Setup Guide

This guide explains how to connect custom domains to your Suite Business sites.

## Overview

Suite Business supports both subdomain access (`business.yourdomain.com`) and custom domain access (`customerbusiness.com`) for all sites. This allows your clients to use their own domains while hosting on your platform.

## Features

### Domain Management
- **Easy Setup**: Simple UI for adding custom domains
- **DNS Verification**: Real-time DNS record validation
- **SSL Automation**: Automatic SSL certificates via Let's Encrypt
- **Multiple Access**: Sites remain accessible via both subdomain and custom domain

### User Interface
- **Visual Status Indicators**: Clear badges showing domain and SSL status
- **Step-by-Step Guides**: Instructions for popular domain registrars
- **Copy-to-Clipboard**: Easy copying of DNS values
- **Troubleshooting Help**: Built-in diagnostics and solutions

## Technical Implementation

### 1. Database Schema
```prisma
model Site {
  customDomain  String?  @unique  // Stores the custom domain
  // ... other fields
}
```

### 2. Middleware Routing
The middleware (`/middleware.ts`) handles both subdomain and custom domain routing:
- Checks if incoming request matches a subdomain
- If not, queries database for matching custom domain
- Routes to appropriate site content
- Includes caching for performance

### 3. API Endpoints

#### Add/Update Domain
```
POST /api/sites/[siteId]/domain
{
  "domain": "customerbusiness.com"
}
```

#### Verify DNS
```
POST /api/sites/[siteId]/domain/verify
```

#### Remove Domain
```
DELETE /api/sites/[siteId]/domain
```

## User Setup Guide

### Step 1: Add Domain in Dashboard
1. Navigate to Site Settings > Domain tab
2. Enter domain name (without www or https://)
3. Click "Add Domain"

### Step 2: Configure DNS Records

#### Option A: Simple A Records
Add these records at your domain registrar:
- **A Record**: `@` → `YOUR_SERVER_IP` (TTL: 3600)
- **A Record**: `www` → `YOUR_SERVER_IP` (TTL: 3600)

#### Option B: CNAME + A Record
- **A Record**: `@` → `YOUR_SERVER_IP` (TTL: 3600)
- **CNAME Record**: `www` → `sites.yourdomain.com` (TTL: 3600)

### Step 3: Verify Configuration
1. Click "Verify DNS" button
2. Wait for propagation (5-48 hours)
3. Domain status will show "Active" when ready

## Server Configuration (AlmaLinux)

### 1. Nginx Configuration
```nginx
server {
    listen 80;
    server_name _;  # Catch-all for custom domains
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. SSL Certificate Setup
```bash
# Install Certbot
sudo dnf install epel-release -y
sudo dnf install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d customerdomain.com -d www.customerdomain.com

# Test renewal
sudo certbot renew --dry-run
```

### 3. Firewall Configuration
```bash
# Open HTTP and HTTPS ports
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Environment Variables

Add these to your `.env.local`:
```env
# Platform Configuration
PLATFORM_IP="YOUR_SERVER_IP"
NEXT_PUBLIC_PLATFORM_IP="YOUR_SERVER_IP"
NEXT_PUBLIC_ROOT_DOMAIN="yourdomain.com"
```

## DNS Propagation

DNS changes can take time to propagate:
- **Most changes**: Visible within 5-30 minutes
- **Global propagation**: Can take up to 48 hours
- **TTL Impact**: Lower TTL values = faster updates

## Troubleshooting

### Domain Not Verifying
1. Check DNS records are correctly configured
2. Ensure no conflicting records exist
3. Wait for full propagation time
4. Clear browser cache and try again

### SSL Certificate Issues
1. Ensure domain is pointing to correct IP
2. Check firewall allows ports 80 and 443
3. Verify Certbot can access `.well-known` directory
4. Check certificate renewal cron job

### Common DNS Providers

#### GoDaddy
1. Sign in to GoDaddy Domain Portfolio
2. Click on your domain
3. Select "DNS" → "Add" → Enter records

#### Namecheap
1. Sign in to Namecheap
2. Domain List → Manage
3. Advanced DNS → Add records

#### Cloudflare
1. Add site to Cloudflare
2. DNS section → Add record
3. Initially disable proxy (orange cloud)

## Security Considerations

1. **Domain Validation**: Verify domain ownership before allowing setup
2. **SSL Only**: Force HTTPS redirect for all custom domains
3. **Rate Limiting**: Limit domain verification attempts
4. **Subdomain Restrictions**: Block certain reserved subdomains

## Future Enhancements

- [ ] Automatic SSL provisioning on domain verification
- [ ] Domain ownership verification via DNS TXT records
- [ ] Bulk domain import for agencies
- [ ] Domain expiration monitoring
- [ ] Custom domain analytics

## API Rate Limits

- Domain additions: 10 per hour per account
- DNS verifications: 60 per hour per domain
- Domain modifications: 20 per hour per site

## Support

For issues with custom domain setup:
1. Check the troubleshooting guide in Settings > Domain > Help
2. Verify DNS records with online tools
3. Contact support with domain name and error details