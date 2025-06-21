---
description: Test multi-tenant isolation in Suite Business
arguments:
  - name: TENANT1_SUBDOMAIN
    description: First tenant's subdomain
  - name: TENANT2_SUBDOMAIN
    description: Second tenant's subdomain
---

# Test Multi-Tenant Isolation

## Objective
Ensure complete data isolation between tenants ($TENANT1_SUBDOMAIN and $TENANT2_SUBDOMAIN).

## Test Scenarios

### 1. Database Isolation
```typescript
// Test that queries are properly filtered by subdomain
// Check in: /lib/prisma.ts and all model queries
```
- [ ] Verify user queries include subdomain filter
- [ ] Test site-specific data access
- [ ] Ensure no cross-tenant data leakage
- [ ] Test middleware subdomain extraction

### 2. Authentication & Session Isolation
- [ ] Login to $TENANT1_SUBDOMAIN
- [ ] Attempt to access $TENANT2_SUBDOMAIN resources
- [ ] Verify proper access denial
- [ ] Test session cookies are subdomain-specific

### 3. API Route Protection
Check these API routes for proper tenant filtering:
- [ ] `/api/sites/create` - Should only create for authenticated tenant
- [ ] `/api/business-search` - Should filter results by tenant
- [ ] All CRUD operations should respect tenant boundaries

### 4. File & Asset Isolation
- [ ] Uploaded files are stored with tenant prefix
- [ ] File access is restricted to owning tenant
- [ ] GHL sub-accounts are properly isolated
- [ ] GBP profiles are tenant-specific

### 5. Subdomain Routing
Test in `/middleware.ts`:
- [ ] Correct subdomain extraction
- [ ] Proper routing to tenant-specific pages
- [ ] Handle edge cases (www, multiple subdomains)

### 6. GoHighLevel Integration
- [ ] Sub-accounts are created with unique identifiers
- [ ] Webhooks are routed to correct tenant
- [ ] API calls use tenant-specific credentials

### 7. Google Business Profile
- [ ] Each tenant can only manage their own GBP
- [ ] Service account access is properly scoped
- [ ] Location data is tenant-isolated

## Security Checklist
- [ ] No tenant ID/subdomain in client-side code
- [ ] All queries use server-side tenant validation
- [ ] Proper error messages (don't leak tenant info)
- [ ] Rate limiting is per-tenant

## Testing Commands
```bash
# When tests are implemented:
npm run test:tenant -- --tenant1=$TENANT1_SUBDOMAIN --tenant2=$TENANT2_SUBDOMAIN
```

## Important Reminders
- Never trust client-side tenant identification
- Always validate tenant access on the server
- Use database-level constraints where possible
- Log suspicious cross-tenant access attempts