---
description: Set up or troubleshoot Google Business Profile integration
arguments:
  - name: BUSINESS_NAME
    description: Name of the business
  - name: TASK_TYPE
    description: Type of task (create, update, verify, troubleshoot)
---

# Google Business Profile Setup: $TASK_TYPE for $BUSINESS_NAME

## Pre-Setup Requirements
- [ ] Service account credentials configured
- [ ] OAuth consent screen approved (if needed)
- [ ] API quotas verified
- [ ] Business location details ready

## Integration Checklist

### 1. Service Account Setup
Location: `/lib/google-business-profile.ts`
Verify:
- [ ] Service account JSON in `/credentials/`
- [ ] Proper permissions granted
- [ ] API enabled in Google Cloud Console
- [ ] Domain-wide delegation (if needed)

### 2. Profile Creation Requirements
Essential information needed:
- [ ] Business name (exact match important)
- [ ] Category selection (primary + additional)
- [ ] Address (service area or storefront)
- [ ] Phone number (local preferred)
- [ ] Website URL
- [ ] Business hours
- [ ] Service area (if applicable)

### 3. Category Mapping
Map industries to GBP categories:
```typescript
// Industry -> Primary Category
landscaping -> "Landscaping Service"
hvac -> "HVAC Contractor"
plumbing -> "Plumber"
cleaning -> "House Cleaning Service"
roofing -> "Roofing Contractor"
electrical -> "Electrician"
```

### 4. Attributes Configuration
Industry-specific attributes:
- [ ] Service options (online, onsite, etc.)
- [ ] Accessibility features
- [ ] Payment methods accepted
- [ ] Certifications/licenses
- [ ] Emergency services
- [ ] Eco-friendly practices

### 5. API Implementation
Key operations to implement:
- [ ] Search for existing listings
- [ ] Create new location
- [ ] Update business information
- [ ] Add/update attributes
- [ ] Upload photos
- [ ] Manage service area
- [ ] Set special hours

### 6. Verification Process
Handle verification scenarios:
- [ ] Postcard verification tracking
- [ ] Phone verification option
- [ ] Email verification
- [ ] Instant verification eligibility
- [ ] Bulk verification (for chains)

### 7. Common Issues & Solutions

**API Errors:**
- `PERMISSION_DENIED`: Check service account permissions
- `QUOTA_EXCEEDED`: Implement rate limiting
- `INVALID_CATEGORY`: Validate category IDs
- `DUPLICATE_LOCATION`: Search before creating

**Data Issues:**
- Address standardization required
- Phone number formatting (E.164)
- Category ID validation
- Hours format compliance

### 8. Testing Procedures
- [ ] Test with sandbox account first
- [ ] Verify category selection
- [ ] Test attribute updates
- [ ] Check service area display
- [ ] Validate data persistence
- [ ] Test error scenarios

## Multi-Tenant Considerations
- [ ] Each tenant owns their GBP
- [ ] Service account manages multiple
- [ ] Proper access delegation
- [ ] Audit trail maintenance

## Implementation Best Practices

### Code Organization
Update `/lib/google-business-profile.ts`:
```typescript
// Extend existing GBPClient class
// Reuse authentication logic
// Follow existing error patterns
// Add proper TypeScript types
```

### Error Handling
- [ ] Graceful API failures
- [ ] User-friendly messages
- [ ] Retry logic for transient errors
- [ ] Logging for debugging

### Performance
- [ ] Cache location data
- [ ] Batch API requests
- [ ] Implement pagination
- [ ] Optimize photo uploads

## Clean Up Tasks
- [ ] Remove test locations
- [ ] Clear debug logs
- [ ] Update documentation
- [ ] Verify no API keys in code
- [ ] Run linting checks

## Important Notes
- Changes may take 24-48 hours to appear
- Some attributes are market-specific
- Verification is required for management
- Regular profile updates improve ranking
- Photo quality affects visibility