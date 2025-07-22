# Cursive VPS Deployment Guide

**Created**: July 2025, 1:50 AM CST

Your VPS specifications are impressive:
- **32 AMD EPYC CPU cores**
- **125 GB RAM**
- **1.5 TB SSD storage**
- **AlmaLinux 8.10**

This guide provides an optimized deployment configuration for your high-performance server.

## Resource Allocation Strategy

With 125GB RAM and 32 cores, we can run a very robust production environment:

| Service | CPU Cores | RAM | Purpose |
|---------|-----------|-----|---------|
| PostgreSQL | 8 cores (25%) | 30GB (24%) | Database with heavy caching |
| Next.js App | 20 cores (62%) | 60GB (48%) | Application server (scalable) |
| Nginx | 2 cores (6%) | 4GB (3%) | Reverse proxy & caching |
| Redis | 2 cores (6%) | 10GB (8%) | In-memory caching |
| **System Reserve** | - | 21GB (17%) | OS and overhead |

## Quick Deployment

### 1. Initial Server Setup

```bash
# Update system
sudo dnf update -y

# Install Docker (if not already installed)
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl enable --now docker

# Add your user to docker group
sudo usermod -aG docker $USER
```

### 2. Deploy Application

```bash
# Clone repository
git clone [your-repo-url] sitebango
cd sitebango

# Use the custom configuration
cp docker-compose.cursive-vps.yml docker-compose.yml

# Create production environment file
cp .env.local.example .env.production
# Edit .env.production with your values

# Build and start services
docker-compose up -d --build

# Check status
docker-compose ps
docker stats
```

### 3. Enable Swap (Optional but Recommended)

Even with 125GB RAM, swap can help with memory pressure:

```bash
# Create 16GB swap file
sudo fallocate -l 16G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimize for SSD
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

## Performance Optimizations

### 1. Kernel Parameters

Create `/etc/sysctl.d/99-sitebango.conf`:

```conf
# Network performance
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535

# Memory
vm.overcommit_memory = 1
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# File handles
fs.file-max = 2097152
fs.nr_open = 2097152
```

Apply with: `sudo sysctl -p /etc/sysctl.d/99-sitebango.conf`

### 2. Docker Daemon Optimization

Create `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "10"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 131072,
      "Soft": 131072
    }
  }
}
```

### 3. PostgreSQL Huge Pages

Enable huge pages for PostgreSQL performance:

```bash
# Calculate required huge pages (for 8GB shared_buffers)
echo 4096 | sudo tee /proc/sys/vm/nr_hugepages

# Make permanent
echo 'vm.nr_hugepages=4096' | sudo tee -a /etc/sysctl.conf
```

## Scaling Options

With your server capacity, you can:

### 1. Horizontal Scaling (Multiple App Instances)

```yaml
# In docker-compose.yml
app:
  # ... existing config ...
  deploy:
    replicas: 4  # Run 4 instances
```

### 2. Enable Redis Caching

The configuration includes Redis. To use it in your app:

```javascript
// lib/redis.ts
import Redis from 'ioredis';

export const redis = new Redis({
  host: 'redis',
  port: 6379,
  maxRetriesPerRequest: 3,
});
```

### 3. Database Read Replicas

With 30GB allocated to PostgreSQL, you could run read replicas:

```bash
# Add a read replica in docker-compose.yml
postgres-replica:
  image: postgres:16-alpine
  environment:
    POSTGRES_MASTER_SERVICE: postgres
  # ... replica configuration
```

## Monitoring

### 1. Real-time Monitoring

```bash
# Overall system
htop

# Docker specific
docker stats

# Network connections
ss -tulpn

# Disk I/O
iotop
```

### 2. PostgreSQL Monitoring

```bash
# Connection count
docker exec suitebusiness-postgres psql -U suitebusiness_user -c "SELECT count(*) FROM pg_stat_activity;"

# Database size
docker exec suitebusiness-postgres psql -U suitebusiness_user -c "SELECT pg_database_size('suitebusiness')/1024/1024 as size_mb;"

# Slow queries
docker exec suitebusiness-postgres psql -U suitebusiness_user -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

### 3. Application Metrics

```bash
# Next.js memory usage
docker exec suitebusiness-app node -e "console.log(process.memoryUsage())"

# Active connections
docker exec suitebusiness-nginx nginx -T 2>&1 | grep "worker_connections"
```

## Backup Strategy

With ample resources, implement comprehensive backups:

```bash
# Automated PostgreSQL backups
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/postgres"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)

# Backup with compression
docker exec suitebusiness-postgres pg_dump -U suitebusiness_user -d suitebusiness | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x backup.sh
# Add to crontab: 0 2 * * * /path/to/backup.sh
```

## Security Hardening

### 1. Firewall Rules

```bash
# Allow only necessary ports
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload
```

### 2. Fail2ban for SSH

```bash
sudo dnf install -y fail2ban
sudo systemctl enable --now fail2ban
```

### 3. SSL/TLS Setup

```bash
# Install certbot
sudo dnf install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Maintenance Tasks

### Weekly
- Check disk usage: `df -h`
- Review logs: `docker-compose logs --tail=1000`
- Update containers: `docker-compose pull && docker-compose up -d`

### Monthly
- Update system: `sudo dnf update -y`
- Clean Docker: `docker system prune -a`
- Review performance metrics

## Troubleshooting

### High Memory Usage
```bash
# Check memory consumers
ps aux --sort=-%mem | head -20

# Docker memory usage
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}"
```

### High CPU Usage
```bash
# Check CPU consumers
top -b -n 1 | head -20

# PostgreSQL queries
docker exec suitebusiness-postgres psql -U suitebusiness_user -c "SELECT pid, query, state FROM pg_stat_activity WHERE state != 'idle';"
```

Your VPS has exceptional resources - this configuration uses them efficiently while leaving room for growth!