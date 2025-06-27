# Onboarding Flow Documentation

**Created**: December 23, 2024, 2:50 PM CST  
**Last Updated**: December 28, 2024, 1:45 AM CST

## Overview

Suite Business offers flexible onboarding paths to accommodate both businesses with existing Google Business Profiles and those starting from scratch. The onboarding flow automatically creates websites, sets up GoHighLevel CRM integration, and configures industry-specific features.

### Key Features
- **Automatic Progress Persistence**: All onboarding progress is automatically saved, allowing users to refresh the page or navigate away without losing their work
- **Resume Capability**: Users can return to exactly where they left off, even after closing their browser
- **24-Hour State Retention**: Progress is saved for 24 hours, giving users ample time to complete onboarding
- **Smart State Restoration**: The system remembers selections, form data, and navigation state

## Onboarding Paths

### Path 1: With Google Business Profile (Recommended)
For businesses that already have a Google Business Profile listing.

**Flow:**
1. User signs in with Google
2. System checks for Google Business Profile access
3. User searches for or selects their business
4. Business data is imported automatically
5. Industry is detected and confirmed
6. Site is generated with rich content
7. GoHighLevel sub-account is created
8. User can preview and customize before publishing

### Path 2: Without Google Business Profile
For businesses starting fresh or preferring manual setup.

**Flow:**
1. User signs in with Google
2. Selects "Set up manually" option
3. Enters business information:
   - Business name
   - Industry selection
   - Contact information
   - Business hours
   - Services offered
4. Site is created immediately
5. GoHighLevel sub-account is created
6. Option to add GBP later from dashboard

## Technical Implementation

### Entry Points
- **Primary**: `/onboarding` - Main onboarding flow
- **Manual**: `/onboarding?setup=manual` - Skip GBP and go straight to manual
- **Resume**: `/onboarding?resume=true` - Continue after adding Google accounts

### State Persistence
The onboarding flow includes comprehensive state persistence managed by `/lib/onboarding-persistence.ts`:

#### Features
- **Automatic Saving**: State is saved after every user interaction
- **localStorage Based**: Uses browser's localStorage for client-side persistence
- **24-Hour Expiration**: Saved state expires after 24 hours to ensure data freshness
- **Resume Banner**: Shows when saved progress is detected, allowing users to continue or start fresh

#### Persisted Data
- Current step in the onboarding flow
- Google Business Profile selection (hasGBP answer)
- Selected Google account ID and email
- Selected business and all fetched businesses
- Industry selection (both detected and user-selected)
- Business claim dialog data
- Manual setup form data
- Cache status and age

#### Implementation
```typescript
// State is automatically saved on every change
const persistence = useOnboardingPersistence();

// Save current state
persistence.save(state);

// Load saved state on mount
const savedState = persistence.load();

// Clear state (on completion or manual reset)
persistence.clear();
```

### Key Components

#### BusinessSearch (`/app/onboarding/components/BusinessSearch.tsx`)
- Real-time search using Google Places API
- Autocomplete with session tokens for cost optimization
- Shows ratings, reviews, and verification status
- Handles multiple Google accounts

#### BusinessConfirmation (`/app/onboarding/components/BusinessConfirmation.tsx`)
- Displays imported GBP data
- Allows editing before site creation
- Shows what will be included in the site
- Creates site via API on confirmation

#### IndustrySelector (`/app/onboarding/components/IndustrySelector.tsx`)
- Auto-detects industry from GBP categories
- Allows manual override
- Shows industry-specific features
- Determines template and content generation

#### ManualBusinessSetup (`/app/onboarding/components/ManualBusinessSetup.tsx`)
- Multi-step wizard for manual entry
- Industry selection
- Business information
- Service configuration
- Hours of operation
- Includes `onUpdate` callback for persistence integration

### API Endpoints

#### Create Site from GBP
`POST /api/sites/create-from-gbp`
```typescript
{
  placeId: string;        // Google Place ID
  accountId: string;      // Google account ID
  industry?: string;      // Optional industry override
}
```

#### Create Site Manually
`POST /api/sites`
```typescript
{
  businessName: string;
  industry: string;
  subdomain: string;
  address?: string;
  city?: string;
  state?: string;
  // ... other business details
}
```

## Data Import Features

### From Google Business Profile
- **Basic Information**: Name, phone, address, website
- **Categories**: Primary and additional categories
- **Hours**: Regular and special hours
- **Photos**: Profile, cover, and additional photos
- **Attributes**: Features, amenities, accessibility
- **Service Areas**: For area-serving businesses
- **Description**: Business description

### Industry Detection
The system analyzes:
1. Google Business Profile categories
2. Business name keywords
3. Service descriptions

Supported industries:
- Landscaping
- HVAC
- Plumbing
- Cleaning
- Roofing
- Electrical

## Content Generation

### Template Selection
Based on:
1. Industry type
2. Available data density
3. Business characteristics

### Section Generation
Dynamic sections based on content:
- **Minimal Data**: Hero, Services, Contact
- **Moderate Data**: + About, Features
- **Rich Data**: + Gallery, FAQ, Service Areas

### SEO Optimization
- Meta titles and descriptions
- Structured data markup
- Local business schema
- Industry-specific keywords

## GoHighLevel Integration

### Automatic Setup
When a site is created:
1. GHL sub-account created via SaaS API
2. Industry snapshot deployed
3. User added to sub-account
4. Default pipelines configured
5. Forms connected to CRM

### Features Enabled
- Lead capture forms
- SMS/email automation
- Appointment booking
- Review management
- Pipeline tracking

## Multi-Account Support

### Google Account Management
- Users can connect multiple Google accounts
- Check GBP access across all accounts
- Switch between accounts during search
- Account status badges (active/suspended)

### Adding Accounts
1. During onboarding: "Add another account" button
2. From dashboard: Settings → Connected Accounts
3. Preserves context when returning from OAuth

## Error Handling

### Common Scenarios
1. **No GBP Access**: Directed to manual setup
2. **Suspended Account**: Shows warning, allows continuation
3. **API Errors**: Graceful fallbacks with user guidance
4. **Duplicate Sites**: Prevents creating multiple sites for same business

### Recovery Options
- Resume onboarding after fixing issues
- Switch to manual setup at any point
- Edit imported data before creation
- Delete and start over if needed

## Post-Onboarding

### Immediate Access
- Site preview at subdomain.domain.com
- Dashboard access
- Edit mode for content updates
- Color customization
- Logo upload

### Publishing Flow
1. Preview site
2. Make customizations
3. Click "Publish"
4. Site goes live
5. Optional: Connect custom domain

## Best Practices

### For Users
1. **Complete GBP First**: More data = better site
2. **Verify Information**: Check imported data accuracy
3. **Add Photos**: Upload high-quality images
4. **Review SEO**: Customize meta descriptions

### For Developers
1. **Cache API Calls**: Reduce Google API costs
2. **Validate Early**: Check data before creation
3. **Log Everything**: Use logger.ts for debugging
4. **Handle Edge Cases**: Null checks everywhere

## Testing Checklist

### Google Business Profile Path
- [ ] Search for business
- [ ] Handle no results
- [ ] Multiple account switching
- [ ] Import all data fields
- [ ] Industry detection
- [ ] Site creation
- [ ] GHL integration

### Manual Setup Path
- [ ] All form validations
- [ ] Industry selection
- [ ] Service configuration
- [ ] Hours setup
- [ ] Site creation
- [ ] Add GBP later

### Edge Cases
- [ ] Suspended Google accounts
- [ ] No GBP access
- [ ] API rate limits
- [ ] Duplicate submissions
- [ ] Network errors

## Future Enhancements

1. **AI Content Generation**: Use LLM to write service descriptions
2. **Competitor Analysis**: Analyze local competitors during onboarding
3. **Multi-Location**: Support for businesses with multiple locations
4. **Team Invites**: Add team members during onboarding
5. **Custom Branding**: Upload logos and brand assets
6. **Industry Templates**: More specific templates per industry

## Related Documentation

- `/docs/SITE_INFRASTRUCTURE.md` - How sites are rendered
- `/docs/GHL_INTEGRATION.md` - GoHighLevel setup details
- `/docs/TEMPLATE_SYSTEM.md` - Template selection logic
- `/docs/API_DOCUMENTATION.md` - Complete API reference