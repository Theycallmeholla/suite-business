#!/bin/bash

# Staging Deployment Script for Sitebango
# This script deploys the application to a staging server with smart intake enabled
# Created: December 29, 2024

set -e

# Configuration
STAGING_SERVER="staging.sitebango.com"  # Update this with your staging server
STAGING_USER="deploy"  # Update with your deployment user
STAGING_PATH="/var/www/sitebango-staging"
STAGING_BRANCH="main"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment to staging server...${NC}"

# Function to run commands on staging server
run_remote() {
    ssh "${STAGING_USER}@${STAGING_SERVER}" "$@"
}

# Step 1: Pull latest code on staging server
echo -e "${YELLOW}Step 1: Pulling latest code...${NC}"
run_remote "cd ${STAGING_PATH} && git checkout ${STAGING_BRANCH} && git pull origin ${STAGING_BRANCH}"

# Step 2: Update dependencies
echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
run_remote "cd ${STAGING_PATH} && npm install"

# Step 3: Update environment variables with smart intake enabled
echo -e "${YELLOW}Step 3: Updating environment variables...${NC}"
run_remote "cd ${STAGING_PATH} && \
    if grep -q SMART_INTAKE_ENABLED .env.local; then \
        sed -i 's/SMART_INTAKE_ENABLED=\"false\"/SMART_INTAKE_ENABLED=\"true\"/' .env.local; \
    else \
        echo 'SMART_INTAKE_ENABLED=\"true\"' >> .env.local; \
    fi"

# Step 4: Generate Prisma client
echo -e "${YELLOW}Step 4: Generating Prisma client...${NC}"
run_remote "cd ${STAGING_PATH} && npm run db:generate"

# Step 5: Push database changes
echo -e "${YELLOW}Step 5: Applying database changes...${NC}"
run_remote "cd ${STAGING_PATH} && npm run db:push"

# Step 6: Build the application
echo -e "${YELLOW}Step 6: Building the application...${NC}"
run_remote "cd ${STAGING_PATH} && npm run build"

# Step 7: Seed test data
echo -e "${YELLOW}Step 7: Seeding test data for Phoenix, Boston, and Houston...${NC}"
run_remote "cd ${STAGING_PATH} && node scripts/seed-staging-data.js"

# Step 8: Restart the application with PM2
echo -e "${YELLOW}Step 8: Restarting application...${NC}"
run_remote "cd ${STAGING_PATH} && pm2 restart sitebango-staging || pm2 start npm --name 'sitebango-staging' -- start"

# Step 9: Save PM2 configuration
echo -e "${YELLOW}Step 9: Saving PM2 configuration...${NC}"
run_remote "pm2 save"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}Staging URL: https://${STAGING_SERVER}${NC}"
echo -e "${GREEN}Smart Intake is now ENABLED on staging${NC}"
echo -e "${GREEN}Test scenarios available for: Phoenix, Boston, and Houston${NC}"