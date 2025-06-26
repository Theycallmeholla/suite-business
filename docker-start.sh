#!/bin/bash

echo "? Sitebango - Docker PostgreSQL Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}??  Docker is not installed!${NC}"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}??  Docker Compose is not installed!${NC}"
    echo "It should come with Docker Desktop"
    exit 1
fi

echo -e "${GREEN}? Docker is installed${NC}"

# Start PostgreSQL with Docker Compose
echo -e "${YELLOW}? Starting PostgreSQL with Docker...${NC}"
docker-compose up -d

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}? Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Check if PostgreSQL is running
if docker-compose ps | grep -q "postgres.*Up"; then
    echo -e "${GREEN}? PostgreSQL is running!${NC}"
else
    echo -e "${YELLOW}??  PostgreSQL failed to start. Check logs with: docker-compose logs postgres${NC}"
    exit 1
fi

# Copy environment file
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}? Creating .env.local with Docker PostgreSQL connection...${NC}"
    cp .env.local.docker .env.local
    echo -e "${GREEN}? Created .env.local${NC}"
fi

echo ""
echo -e "${GREEN}? PostgreSQL is ready!${NC}"
echo ""
echo -e "${BLUE}Database Info:${NC}"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: suitebusiness"
echo "  User: suitebusiness_user"
echo "  Password: suitebusiness_dev_password"
echo ""
echo -e "${BLUE}Adminer (Database UI):${NC}"
echo "  URL: http://localhost:8080"
echo "  System: PostgreSQL"
echo "  Server: postgres"
echo "  Username: suitebusiness_user"
echo "  Password: suitebusiness_dev_password"
echo "  Database: suitebusiness"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run: npm install"
echo "2. Run: npx prisma db push"
echo "3. Run: npm run dev"
echo ""
echo -e "${BLUE}Useful Docker commands:${NC}"
echo "  Stop: docker-compose down"
echo "  View logs: docker-compose logs -f postgres"
echo "  Restart: docker-compose restart"
echo "  Remove everything: docker-compose down -v"
