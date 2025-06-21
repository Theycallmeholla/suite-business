# VPS Deployment Guide - 100% Free Setup

## Prerequisites on your VPS
- Node.js 18+ 
- PostgreSQL (or use SQLite for simpler setup)
- Nginx
- PM2 for process management
- Git

## 1. Database Setup

### Option A: PostgreSQL (recommended for production)
```bash
sudo apt install postgresql
sudo -u postgres createdb landscaping_saas
sudo -u postgres createuser -P landscaping_user
```

### Option B: SQLite (simpler, good for starting)
Just use the file path in your .env: `DATABASE_URL="file:./prod.db"`

## 2. Nginx Configuration for Subdomains

Create `/etc/nginx/sites-available/landscaping-saas`:

```nginx
# Main app
server {
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Wildcard subdomains for clients
server {
    server_name *.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Custom domains (add as needed)
server {
    server_name customclient.com www.customclient.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 3. SSL with Let's Encrypt (FREE)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d *.yourdomain.com
```

## 4. Deploy with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Build your Next.js app
npm run build

# Start with PM2
pm2 start npm --name "landscaping-saas" -- start

# Save PM2 config
pm2 save
pm2 startup
```

## 5. File Uploads
Store in `/var/www/landscaping-uploads/` or similar directory on your VPS.
No need for external services!

## Total Monthly Cost: $0
(Assuming you already have the VPS)
