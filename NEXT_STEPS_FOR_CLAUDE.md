# Instructions for New Claude Instance

## Project Context
You are working on Suite Business, a multi-industry SaaS platform located at:
`/Users/cursivemedia/Downloads/scratch-dev/suitebusiness/`

## What to Do First
1. Read `/CLAUDE.md` - This contains all coding standards and project guidelines
2. Read `/docs/ONBOARDING_IMPLEMENTATION_SUMMARY.md` - This explains what's been built
3. Read `/docs/CONTENT_EDITOR.md` - Details about the content editing system
4. Read `/docs/GHL_INTEGRATION.md` - GoHighLevel CRM integration details

## Current State
The following major features have been implemented:
- Phase 1-4: Complete onboarding flow with Google Business Profile integration
- Site Content Editor: In-place editing system for site content
- GoHighLevel Integration: Automatic CRM setup and lead syncing

## Completed Features

### ✅ Option A: Site Content Editor [COMPLETED]
Created an in-place content editing system that allows users to edit their site content directly. See `/docs/CONTENT_EDITOR.md` for full documentation.

### ✅ Option B: GoHighLevel Integration [COMPLETED]
Implemented complete GoHighLevel CRM integration with:
- Automatic sub-account creation when sites are created
- Lead capture forms that sync to GHL
- Webhook handlers for real-time updates
- Industry-specific custom fields
- GHL settings in preview bar
- Integrations dashboard at `/dashboard/integrations`
- See `/docs/GHL_INTEGRATION.md` for full documentation

## Completed Features

### ✅ Option A: Site Content Editor [COMPLETED]
Created an in-place content editing system that allows users to edit their site content directly. See `/docs/CONTENT_EDITOR.md` for full documentation.

### ✅ Option B: GoHighLevel Integration [COMPLETED]
Implemented complete GoHighLevel CRM integration with:
- Automatic sub-account creation when sites are created
- Lead capture forms that sync to GHL
- Webhook handlers for real-time updates
- Industry-specific custom fields
- GHL settings in preview bar
- Integrations dashboard at `/dashboard/integrations`
- See `/docs/GHL_INTEGRATION.md` for full documentation

### ✅ Option C: Logo Upload Feature [COMPLETED]
Implemented logo upload functionality with:
- Drag-and-drop upload interface in preview bar
- Support for PNG, JPG, SVG, and WebP formats
- 5MB file size limit
- Logo preview and removal
- Automatic display in site header
- File storage in `/public/uploads/logos/`
- See `/docs/LOGO_UPLOAD.md` for full documentation

## Next Priority Tasks (Choose One)

### ✅ Option D: Enhanced Lead Capture Forms [COMPLETED]
Implemented comprehensive form builder with:
- Form builder interface with drag-and-drop field management
- Multiple form types (contact, quote request, appointment booking, newsletter)
- Custom fields with multiple types (text, email, phone, textarea, select, radio, checkbox, date, time)
- Form analytics and submissions dashboard with CSV export
- Smart form integration that automatically uses custom forms or falls back to default
- GoHighLevel sync for all form submissions
- Full documentation at `/docs/ENHANCED_FORMS.md`

### Option E: Billing with Stripe
Implement subscription billing:
- Set up Stripe webhook handlers
- Create pricing page
- Add subscription management
- Gate features based on plan

### Option F: Email Marketing
Add email capabilities:
- Transactional emails (form submissions, welcome emails)
- Email templates
- Integration with SendGrid/Postmark
- Email campaign builder

## Important Rules (from CLAUDE.md)
1. **ZERO TOLERANCE for technical debt** - No TODOs, fix issues immediately
2. **No console.log** - Use `/lib/logger.ts` instead
3. **Use native fetch** - Don't add axios or other HTTP libraries
4. **Update existing files** - Don't create new files unnecessarily
5. **Handle all errors** - No unhandled edge cases
6. **Multi-tenant isolation** - Always filter by site/user

## How to Start
```bash
cd /Users/cursivemedia/Downloads/scratch-dev/suitebusiness
npm run dev
# Server runs on http://localhost:3000 (or 3001, 3002, etc)
# Test sites at subdomain.localhost:3000
```

## Key Files to Understand
- `/app/onboarding/page.tsx` - Complete onboarding flow
- `/app/api/sites/create-from-gbp/route.ts` - Site creation with GHL setup
- `/app/preview/[siteId]/page.tsx` - Preview system with editing
- `/lib/site-builder.ts` - Site generation logic
- `/lib/ghl.ts` - GoHighLevel client (refactored to use native fetch)
- `/components/forms/ContactForm.tsx` - Lead capture form component
- `/app/api/ghl/*` - GHL API endpoints
- `/prisma/schema.prisma` - Database structure

## Testing Your Work
1. Sign in at http://localhost:3000/signin
2. Go through onboarding if no sites exist
3. Test your new feature
4. Verify multi-tenant isolation
5. Check for console.logs before finishing
6. Run type checking if available

## Latest Implementation: Logo Upload Feature (Completed)

I've successfully implemented the Logo Upload feature with the following capabilities:

### What Was Built
1. **LogoUpload Component**
   - Dialog-based upload interface
   - Drag-and-drop support
   - File type validation (PNG, JPG, SVG, WebP)
   - 5MB file size limit
   - Real-time preview
   - Logo removal option

2. **API Endpoints**
   - `/api/sites/upload-logo` - Handles file upload and storage
   - `/api/sites/[siteId]/update-logo` - Updates database and handles removal

3. **File Storage**
   - Logos stored in `/public/uploads/logos/`
   - Unique naming: `{subdomain}-{timestamp}.{extension}`
   - Proper .gitignore configuration
   - Old file cleanup on removal

4. **UI Integration**
   - Logo button added to preview bar
   - Logo displays in site header
   - Fallback to business name when no logo
   - Responsive sizing (h-8 class)

### How It Works
1. User clicks "Logo" button in preview bar
2. Upload dialog opens with drag-drop area
3. File is validated and uploaded
4. Logo URL is saved to database
5. Logo immediately displays in header
6. Can be removed with X button

### Technical Details
- Zero technical debt - follows all CLAUDE.md guidelines
- Native fetch for all HTTP requests
- Proper error handling with toast notifications
- Multi-tenant isolation maintained
- Full TypeScript support
- Uses existing logger.ts for all logging

### Next Steps
You can now choose one of the remaining priority tasks:
- Option D: Enhanced Lead Capture Forms
- Option E: Billing with Stripe
- Option F: Email Marketing

Or explore other enhancements like:
- Image optimization for logos
- Multiple logo variants (dark/light)
- Favicon generation from logo
- CDN integration for assets

## Latest Implementation: Enhanced Lead Capture Forms (Completed)

I've successfully implemented the Enhanced Lead Capture Forms feature with the following capabilities:

### What Was Built
1. **Form Builder Interface**
   - Intuitive drag-and-drop field management
   - Support for 9 field types: text, email, phone, textarea, select, radio, checkbox, date, time
   - Field validation and requirements
   - Custom placeholder text
   - Reorderable fields with up/down controls

2. **Form Types**
   - Contact Form - Basic contact with message
   - Quote Request - Service selection and project details
   - Appointment Booking - Date and time preferences
   - Newsletter Signup - Simple email subscription

3. **Form Management Dashboard**
   - Multi-site form management
   - Enable/disable forms without deletion
   - View submission counts at a glance
   - Edit existing forms
   - Delete forms with confirmation

4. **Submission Management**
   - Comprehensive submission viewer
   - Export to CSV functionality
   - Bulk selection and deletion
   - Metadata tracking (IP, user agent, referrer)
   - GoHighLevel sync status display

5. **Smart Form Integration**
   - SmartForm component automatically detects custom forms
   - Seamless fallback to default ContactForm
   - Zero configuration required for sites
   - Works with all existing contact sections

### Technical Highlights
- Two new database models: Form and FormSubmission
- RESTful API endpoints for all operations
- Public form submission endpoint with validation
- Automatic GoHighLevel sync when enabled
- Full TypeScript support throughout
- Zero technical debt - follows all CLAUDE.md guidelines

### How to Access
1. Navigate to Dashboard
2. Click "Forms" button in the top right
3. Select a site and create forms
4. Forms automatically appear on the site's contact section

### Next Steps
You can now choose one of the remaining priority tasks:
- Option E: Billing with Stripe
- Option F: Email Marketing

Or explore other enhancements like:
- Advanced form features (conditional logic, multi-step forms)
- File upload support for forms
- Form templates library
- A/B testing for forms
- Advanced analytics dashboard

Choose one of the priority tasks above and implement it following the CLAUDE.md guidelines.
