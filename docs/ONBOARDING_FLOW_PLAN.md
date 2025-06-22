# Onboarding Flow Completion Plan

## Current State Analysis

### What's Working
- ✅ Google OAuth authentication
- ✅ Fetching user's Google Business Profile locations
- ✅ Multi-account support for GBP
- ✅ Business selection UI
- ✅ Site template generation based on content

### What's Missing
- ❌ Selected GBP data not saved to database
- ❌ Site creation not triggered after selection
- ❌ User ID not properly linked (using 'test-user-id')
- ❌ No industry confirmation/override
- ❌ No preview before publishing
- ❌ No success feedback or next steps

## Implementation Plan

### Phase 1: Fix Data Flow (Priority 1)

#### 1.1 Update Site Creation API
Create `/app/api/sites/create-from-gbp/route.ts`:
- Accept GBP location ID and account ID
- Fetch full business details from GBP
- Map GBP data to our Site model
- Create site record with proper user association
- Return created site with subdomain

#### 1.2 Update BusinessConfirmation Component
- Add "Create Site" button
- Call site creation API on confirmation
- Handle loading/error states
- Show success message
- Redirect to dashboard or preview

#### 1.3 Fix User Association
- Get user ID from session in API routes
- Update all 'test-user-id' references
- Add proper error handling for unauthenticated requests

### Phase 2: Industry Selection (Priority 2)

#### 2.1 Add Industry Step
Create new onboarding step after GBP selection:
- Auto-detect industry from business data
- Show detected industry with option to change
- List all available industries with descriptions
- Explain how industry affects their site

#### 2.2 Update Site Model
- Add `industry` field to Site model (if not exists)
- Add `industryConfirmed` boolean flag
- Store both detected and selected industry

### Phase 3: Site Preview (Priority 3)

#### 3.1 Create Preview Mode
- Add preview route `/preview/[siteId]`
- Show site as it will appear when published
- Include "Publish" and "Edit" buttons
- Allow basic customization (colors, logo)

#### 3.2 Publishing Flow
- Add published timestamp
- Create publish confirmation dialog
- Generate sitemap on publish
- Send confirmation email

### Phase 4: Enhanced Data Mapping (Priority 4)

#### 4.1 Comprehensive GBP Import
Map additional GBP fields:
- Business categories → services
- Operating hours → site hours
- Photos → gallery
- Attributes → features
- Service areas → coverage

#### 4.2 Smart Defaults
For missing data, provide smart defaults:
- Industry-specific service templates
- Default operating hours
- Placeholder descriptions
- Stock photos by industry

### Phase 5: User Experience (Priority 5)

#### 5.1 Progress Indicators
- Show clear steps: Auth → Select → Confirm → Industry → Preview → Publish
- Save progress in session
- Allow going back to previous steps
- Show what data will be imported

#### 5.2 Error Handling
- Handle GBP API failures gracefully
- Provide manual entry option
- Clear error messages
- Retry mechanisms

#### 5.3 Success Experience
- Confetti animation on publish
- Share buttons for new site
- Quick tour of dashboard
- Next steps checklist

## Technical Implementation Details

### API Endpoints Needed

1. **POST /api/sites/create-from-gbp**
   ```typescript
   {
     locationId: string;
     accountId: string;
     industry?: string;
   }
   ```

2. **GET /api/sites/[id]/preview**
   - Return site data for preview
   - Include unpublished changes

3. **POST /api/sites/[id]/publish**
   - Set published flag
   - Generate static assets
   - Clear caches

### Database Schema Updates

```prisma
model Site {
  // ... existing fields ...
  
  // Add these fields
  industry          String?  @default("general")
  industryConfirmed Boolean  @default(false)
  gbpLocationId     String?  // Track source GBP
  gbpLastSync       DateTime? // For future syncing
  publishedAt       DateTime?
  
  // Ensure we have
  userId            String   // Properly linked to User
}
```

### Component Structure

```
/app/onboarding/
  page.tsx                    // Main orchestrator
  /components/
    StepIndicator.tsx        // Progress bar
    BusinessSelector.tsx     // GBP selection (exists)
    BusinessConfirmation.tsx // Confirm & edit (exists)
    IndustrySelector.tsx     // New: Industry selection
    SitePreview.tsx         // New: Preview before publish
    PublishDialog.tsx       // New: Publish confirmation
```

### State Management

Use URL params to track progress:
- `/onboarding` - Start
- `/onboarding?step=select` - Choose business
- `/onboarding?step=confirm&gbp=[id]` - Confirm details
- `/onboarding?step=industry&site=[id]` - Select industry
- `/onboarding?step=preview&site=[id]` - Preview site

## Testing Plan

### Manual Testing
1. Create new user account
2. Complete full onboarding flow
3. Verify site is created with correct data
4. Check site is accessible at subdomain
5. Verify all imported data displays correctly

### Edge Cases to Test
- User with no GBP locations
- User cancels mid-flow
- GBP API errors
- Duplicate subdomain handling
- Missing required fields

### Automated Tests (Future)
- E2E test for complete flow
- Unit tests for data mapping
- API endpoint tests
- Component tests for each step

## Success Criteria

1. **Data Integrity**
   - All GBP data correctly mapped to Site model
   - No data loss during import
   - Proper user association

2. **User Experience**
   - < 2 minutes from start to published site
   - Clear progress indication
   - Graceful error handling
   - Mobile-responsive flow

3. **Technical Quality**
   - No console errors
   - Proper loading states
   - Secure API endpoints
   - Efficient database queries

## Timeline

- **Day 1-2**: Fix data flow and user association
- **Day 3**: Add industry selection
- **Day 4**: Implement preview mode
- **Day 5**: Testing and polish
- **Day 6-7**: Deploy and monitor

## Next Steps After Completion

1. Add email notifications for new sites
2. Implement GBP data syncing
3. Add more customization options
4. Create onboarding analytics
5. A/B test different flows
