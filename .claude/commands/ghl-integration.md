---
description: Implement or troubleshoot GoHighLevel integration
arguments:
  - name: TASK_TYPE
    description: Type of integration task (setup, webhook, automation, troubleshoot)
  - name: ACCOUNT_NAME
    description: Name of the sub-account or client
---

# GoHighLevel Integration: $TASK_TYPE for $ACCOUNT_NAME

## Pre-Implementation Checklist
- [ ] Verify GHL API credentials in environment
- [ ] Check SaaS mode is enabled on Pro plan
- [ ] Ensure webhook URLs are whitelisted
- [ ] Verify sub-account limits not exceeded

## Common Integration Tasks

### 1. Sub-Account Creation
Location: `/lib/ghl.ts`
```typescript
// Ensure these fields are set:
- name: Business name
- email: Primary contact
- phone: Business phone
- industry: Industry vertical
- snapshot_id: Industry-specific template
```

### 2. Webhook Configuration
Essential webhooks to configure:
- [ ] Contact created/updated
- [ ] Appointment scheduled/cancelled
- [ ] Pipeline stage changed
- [ ] Form submitted
- [ ] SMS received
- [ ] Task completed

### 3. Snapshot Deployment
Verify snapshot includes:
- [ ] Industry-specific pipelines
- [ ] Email/SMS templates
- [ ] Custom fields
- [ ] Automation workflows
- [ ] Calendar settings
- [ ] Team member roles

### 4. API Integration Points
Key endpoints to implement:
- [ ] Create/update contacts
- [ ] Manage opportunities
- [ ] Send communications
- [ ] Create appointments
- [ ] Access custom fields
- [ ] Trigger automations

### 5. Error Handling
Common issues and solutions:
- [ ] Rate limiting (implement exponential backoff)
- [ ] Invalid API key (check environment variables)
- [ ] Webhook failures (implement retry logic)
- [ ] Snapshot not found (verify snapshot IDs)
- [ ] Sub-account limit (check plan limits)

### 6. Testing Procedures
- [ ] Test sub-account creation flow
- [ ] Verify webhook delivery
- [ ] Test data synchronization
- [ ] Validate custom field mapping
- [ ] Check automation triggers
- [ ] Test error scenarios

## Implementation Guidelines

### Update Existing Code
Always update `/lib/ghl.ts` rather than creating new files:
```typescript
// Add new methods to existing GHLClient class
// Extend existing interfaces
// Reuse error handling patterns
```

### Multi-Tenant Considerations
- [ ] Sub-account ID linked to tenant
- [ ] Webhooks include tenant identifier
- [ ] API calls scoped to tenant
- [ ] Data isolation verified

### Security Best Practices
- [ ] Never log API keys
- [ ] Validate webhook signatures
- [ ] Sanitize user inputs
- [ ] Use environment variables
- [ ] Implement request validation

## Troubleshooting Steps

1. **API Connection Issues**
   - Check API key validity
   - Verify IP whitelisting
   - Test with Postman/curl
   - Check rate limits

2. **Webhook Problems**
   - Verify endpoint accessibility
   - Check SSL certificates
   - Validate signatures
   - Review server logs

3. **Data Sync Issues**
   - Check field mappings
   - Verify data types
   - Test with minimal payload
   - Check for required fields

## Clean Up Checklist
- [ ] Remove debug console.logs
- [ ] Clean up test data
- [ ] Document new endpoints
- [ ] Update error messages
- [ ] Run type checking

## Notes
- GHL API has rate limits: respect them
- Webhooks must respond within 15 seconds
- Always handle pagination for large datasets
- Use webhook signatures for security