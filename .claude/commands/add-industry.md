---
description: Add a new industry vertical to Suite Business
arguments:
  - name: INDUSTRY_NAME
    description: Name of the industry (e.g., landscaping, HVAC, plumbing)
  - name: INDUSTRY_CODE
    description: Short code for the industry (e.g., LAND, HVAC, PLUM)
---

# Add New Industry: $INDUSTRY_NAME

## Task Overview
Add support for the $INDUSTRY_NAME industry vertical to Suite Business platform.

## Implementation Steps

### 1. Update Industry Configuration
- Add $INDUSTRY_CODE to the industry types enum in `/lib/config/industries.ts`
- Define industry-specific features and pricing tiers
- Add industry-specific GoHighLevel snapshot ID to environment variables

### 2. Create Industry-Specific Marketing Page
- Update `/app/(marketing)/$INDUSTRY_CODE/page.tsx` with industry-specific content
- Include relevant service offerings and benefits
- Add industry-specific testimonials and case studies

### 3. Configure GoHighLevel Integration
- Set up `GHL_SNAPSHOT_ID_$INDUSTRY_CODE` in environment variables
- Define industry-specific workflows and automations
- Configure industry-specific form fields and pipelines

### 4. Google Business Profile Categories
- Map relevant GBP categories for $INDUSTRY_NAME businesses
- Configure industry-specific attributes and services
- Set up location-based features

### 5. Industry-Specific Features
- Implement scheduling/booking features if applicable
- Add industry-specific reporting metrics
- Configure service catalog for the industry

### 6. Testing Checklist
- [ ] Test onboarding flow for $INDUSTRY_NAME business
- [ ] Verify GHL snapshot deployment
- [ ] Test GBP category selection and attributes
- [ ] Ensure multi-tenant isolation works correctly
- [ ] Test industry-specific features

## Important Notes
- Ensure no technical debt is introduced
- Update existing modules rather than creating new files where possible
- Run linting and type checking before completing
- Clean up any temporary code or files