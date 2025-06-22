# Onboarding Flow Implementation Checklist

## Quick Reference for Implementation

### 🔴 Critical Path (Must Do First)

- [ ] Fix user association in site creation
  - [ ] Get user ID from session in onboarding page
  - [ ] Pass user ID to site creation
  - [ ] Remove all 'test-user-id' references

- [ ] Create site from GBP data
  - [ ] Add create button to BusinessConfirmation component
  - [ ] Create `/api/sites/create-from-gbp` endpoint
  - [ ] Map GBP fields to Site model
  - [ ] Handle subdomain generation/validation

- [ ] Save and redirect
  - [ ] Save created site to database
  - [ ] Show success message
  - [ ] Redirect to dashboard or preview

### 🟡 Important Enhancements (Do Next)

- [ ] Industry selection step
  - [ ] Create IndustrySelector component
  - [ ] Add industry field to Site model
  - [ ] Update onboarding flow navigation

- [ ] Preview before publish
  - [ ] Create preview route
  - [ ] Add publish/edit buttons
  - [ ] Implement publish flag

- [ ] Progress tracking
  - [ ] Add step indicator component
  - [ ] Track progress in URL params
  - [ ] Allow back navigation

### 🟢 Nice to Have (Do Later)

- [ ] Enhanced GBP import
  - [ ] Import business hours
  - [ ] Import photos
  - [ ] Import service areas
  - [ ] Import categories as services

- [ ] Customization options
  - [ ] Color picker
  - [ ] Logo upload
  - [ ] Template selection
  - [ ] Font choices

- [ ] Polish
  - [ ] Loading animations
  - [ ] Success animations
  - [ ] Help tooltips
  - [ ] Mobile optimization

## Code Snippets to Get Started

### 1. Fix User Association
```typescript
// In onboarding/page.tsx
import { getAuthSession } from '@/lib/auth';

const session = await getAuthSession();
if (!session?.user?.id) {
  redirect('/signin');
}
const userId = session.user.id;
```

### 2. Create Site API Endpoint
```typescript
// /app/api/sites/create-from-gbp/route.ts
export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { locationId, accountId } = await request.json();
  
  // Fetch GBP data
  // Map to site model
  // Create site with session.user.id
  // Return created site
}
```

### 3. Update BusinessConfirmation
```typescript
// Add to BusinessConfirmation component
const handleCreateSite = async () => {
  setIsCreating(true);
  try {
    const response = await fetch('/api/sites/create-from-gbp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId: business.id,
        accountId: selectedAccountId
      })
    });
    
    if (response.ok) {
      const site = await response.json();
      toast.success('Site created successfully!');
      router.push(`/dashboard/sites/${site.id}`);
    }
  } catch (error) {
    toast.error('Failed to create site');
  } finally {
    setIsCreating(false);
  }
};
```

## Testing Checklist

- [ ] New user can complete full flow
- [ ] Existing user can add another site
- [ ] GBP data correctly imported
- [ ] Site accessible at subdomain
- [ ] User sees their site in dashboard
- [ ] Error handling works properly

## Definition of Done

- [ ] User can go from sign up to published site
- [ ] All GBP data is properly imported
- [ ] Site is accessible at subdomain.localhost:3000
- [ ] User can see and manage site from dashboard
- [ ] No console errors or warnings
- [ ] Mobile responsive
- [ ] Loading states for all async operations
