# Suite Business Development

## Prerequisites
- Docker Desktop installed
- Node.js 18+ installed
- Git

## Quick Start with Docker

1. **Clone and setup:**
```bash
cd /Users/cursivemedia/Downloads/scratch-dev/suitebusiness
chmod +x setup-docker.sh
./setup-docker.sh
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up database:**
```bash
npx prisma db push
```

4. **Start development:**
```bash
npm run dev
```

5. **Access:**
- App: http://localhost:3000
- Database UI: http://localhost:8080

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Reset database
docker-compose down -v
docker-compose up -d
```

## Database Access

- **Connection String**: 
  ```
  postgresql://suitebusiness_user:suitebusiness_dev_password@localhost:5432/suitebusiness
  ```

- **Adminer UI**: http://localhost:8080
  - System: PostgreSQL
  - Server: postgres
  - Username: suitebusiness_user
  - Password: suitebusiness_dev_password
  - Database: suitebusiness

## Environment Variables

The `.env.local` file is automatically created with Docker PostgreSQL credentials.
Update it with your actual API keys:
- GoHighLevel API credentials
- Google Business Profile service account
- Stripe test keys

## Production Deployment

For production on your VPS:
1. Install PostgreSQL directly (not Docker)
2. Use strong passwords
3. Enable SSL
4. Set up backups
