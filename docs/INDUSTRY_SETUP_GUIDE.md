# Industry Setup Guide

**Created**: January 1, 2025, 2:10 AM CST  
**Last Updated**: January 1, 2025, 2:10 AM CST

## Overview

Suite Business supports 6 industry verticals: Landscaping, HVAC, Plumbing, Cleaning, Roofing, and Electrical. Each industry has specific configurations, templates, and GoHighLevel snapshots.

## Quick Setup Commands

```bash
/setup-landscaping   # Configure landscaping business
/setup-hvac         # Configure HVAC business
/setup-plumbing     # Configure plumbing business
/add-industry       # Add a new industry vertical
```

## Industry Configurations

### 1. Landscaping
**Services**: Lawn care, tree trimming, garden design, irrigation, hardscaping
**GHL Snapshot**: `GHL_SNAPSHOT_ID_LANDSCAPING`
**Color Scheme**: Green (#10B981), Earth Brown (#8B4513)
**Key Features**:
- Seasonal service scheduling
- Property size calculator
- Before/after photo galleries
- Maintenance plan options

### 2. HVAC
**Services**: AC repair, heating installation, maintenance, emergency services
**GHL Snapshot**: `GHL_SNAPSHOT_ID_HVAC`
**Color Scheme**: Blue (#3B82F6), Orange (#F97316)
**Key Features**:
- Emergency service booking
- Maintenance contracts
- Energy efficiency calculator
- Seasonal promotions

### 3. Plumbing
**Services**: Repairs, installations, drain cleaning, water heaters, emergency services
**GHL Snapshot**: `GHL_SNAPSHOT_ID_PLUMBING`
**Color Scheme**: Blue (#2563EB), Gray (#6B7280)
**Key Features**:
- 24/7 emergency booking
- Service area maps
- Maintenance reminders
- Water conservation tips

### 4. Cleaning
**Services**: Residential, commercial, deep cleaning, move-in/out, recurring services
**GHL Snapshot**: `GHL_SNAPSHOT_ID_CLEANING`
**Color Scheme**: Teal (#14B8A6), White (#FFFFFF)
**Key Features**:
- Recurring booking system
- Square footage pricing
- Eco-friendly options
- Customer portal

### 5. Roofing
**Services**: Repairs, replacement, inspection, gutters, storm damage
**GHL Snapshot**: `GHL_SNAPSHOT_ID_ROOFING`
**Color Scheme**: Red (#DC2626), Gray (#374151)
**Key Features**:
- Free inspection booking
- Material showcase
- Warranty information
- Insurance claim assistance

### 6. Electrical
**Services**: Wiring, panel upgrades, lighting, generators, smart home
**GHL Snapshot**: `GHL_SNAPSHOT_ID_ELECTRICAL`
**Color Scheme**: Yellow (#FDE047), Black (#000000)
**Key Features**:
- Safety certifications
- Smart home integrations
- Energy audit tools
- Emergency services

## Setup Process

### Step 1: Configure Environment
```bash
# Add to .env.local
GHL_SNAPSHOT_ID_LANDSCAPING=your_snapshot_id
GHL_SNAPSHOT_ID_HVAC=your_snapshot_id
# ... add other industries
```

### Step 2: Run Industry Setup
```bash
# Using slash command
/setup-landscaping

# Or manually via API
curl -X POST /api/industry/setup \
  -d '{"industry": "landscaping"}'
```

### Step 3: Customize Content
Each industry setup includes:
- Industry-specific service pages
- Targeted lead capture forms
- Customized email templates
- Industry-appropriate imagery
- SEO-optimized content

## Adding New Industries

### 1. Update Constants
```typescript
// lib/constants/industries.ts
export const SUPPORTED_INDUSTRIES = [
  'landscaping',
  'hvac',
  'plumbing',
  'cleaning',
  'roofing',
  'electrical',
  'new-industry' // Add here
];
```

### 2. Create Industry Profile
```typescript
// lib/industry-profiles/new-industry.ts
export const newIndustryProfile = {
  name: 'New Industry',
  services: [...],
  keywords: [...],
  colorScheme: {...},
  contentBlocks: {...}
};
```

### 3. Add GHL Snapshot
```bash
# .env.local
GHL_SNAPSHOT_ID_NEW_INDUSTRY=snapshot_id
```

### 4. Create Setup Command
```bash
# .claude/commands/setup-new-industry.md
/setup-new-industry
```

## Industry Detection

The system automatically detects industries based on:
1. Google Business Profile categories
2. Business name keywords
3. Service descriptions
4. Website content analysis

## Content Templates

Each industry includes:
- **Hero Section**: Industry-specific messaging
- **Services Grid**: Customized service offerings
- **Trust Signals**: Relevant certifications/badges
- **Call-to-Actions**: Industry-appropriate CTAs
- **FAQ Section**: Common industry questions

## Smart Questions by Industry

The Intelligent Content Generation system asks industry-specific questions:

### Landscaping
- Design style preferences
- Service area radius
- Equipment capabilities
- Seasonal offerings

### HVAC
- Brand specializations
- Emergency availability
- Warranty offerings
- Energy efficiency focus

### Plumbing
- 24/7 availability
- Service response time
- Specializations
- Commercial vs residential

## GoHighLevel Integration

Each industry has a pre-configured GHL snapshot including:
- Pipelines and stages
- Email/SMS templates
- Automation workflows
- Custom fields
- Tags and segments

## Best Practices

1. **Always test** industry setup in development first
2. **Customize content** beyond the defaults
3. **Update snapshots** regularly with improvements
4. **Monitor conversions** by industry
5. **Gather feedback** from industry-specific clients

## Troubleshooting

### Common Issues
1. **Snapshot not deploying**: Check GHL API key and snapshot ID
2. **Wrong industry detected**: Manually override in BusinessConfirmation
3. **Missing content**: Ensure industry profile is complete
4. **Color conflicts**: Adjust in theme configuration

### Debug Commands
```bash
# Check industry configuration
/test-industry-setup landscaping

# Verify GHL snapshot
/verify-snapshot SNAPSHOT_ID

# Test industry detection
/detect-industry "Joe's Lawn Care"
```
