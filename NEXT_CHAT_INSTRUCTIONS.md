# Suite Business - Next Chat Instructions

## Quick Start for Next Chat

Copy and paste this entire message to start your next chat:

---

**Project**: Suite Business - Multi-industry SaaS Platform  
**Location**: `/Users/cursivemedia/Downloads/scratch-dev/suitebusiness/`  
**Status**: Onboarding flow complete (Phases 1-5), Content Editor implemented

**What's Been Built**:
1. ✅ Google OAuth authentication
2. ✅ Multi-tenant subdomain routing  
3. ✅ Google Business Profile integration
4. ✅ Industry-specific site generation
5. ✅ Photo import from GBP
6. ✅ Site preview and publishing
7. ✅ Basic site customization (colors)
8. ✅ **NEW: Content editor with inline editing**

**Key Documents to Read**:
1. `/CLAUDE.md` - Coding standards (MUST READ)
2. `/docs/ONBOARDING_IMPLEMENTATION_SUMMARY.md` - What's built
3. `/docs/CONTENT_EDITOR.md` - Latest feature documentation
4. `/NEXT_STEPS_FOR_CLAUDE.md` - Priority tasks

**Next Priority Tasks** (choose one):
- **Option B**: Complete GoHighLevel Integration
- **Option C**: Logo Upload Feature  
- **Option D**: Lead Capture Forms
- **Option E**: Billing with Stripe

**Development Commands**:
```bash
cd /Users/cursivemedia/Downloads/scratch-dev/suitebusiness
npm run dev  # Starts on http://localhost:3000
```

**Testing the Content Editor**:
1. Sign in at `/signin`
2. Navigate to a site preview
3. Click "Edit Content" in preview bar
4. Hover over text and click pencil to edit

**IMPORTANT**: Follow CLAUDE.md strictly - ZERO technical debt, no console.log, use native fetch, handle all errors.

---

## Detailed Context (if needed)

### Latest Implementation: Content Editor

Just completed implementing an in-place content editing system with these features:

1. **Edit Mode Toggle**: Button in preview bar to enter/exit edit mode
2. **Inline Editing**: Hover over text, click pencil icon to edit
3. **Auto-Save**: Changes saved automatically to database
4. **Visual Feedback**: Toast notifications, hover states
5. **Supported Content**: Hero headlines, About text, Service details

### Technical Architecture

- **Frontend**: React contexts for state, client components for editing
- **Backend**: RESTful API for content updates
- **Database**: JSON content storage in Page model
- **Security**: Authentication required, multi-tenant isolation

### Key Files from Content Editor

- `/contexts/EditModeContext.tsx` - Global edit state
- `/components/EditableText.tsx` - Reusable editor component
- `/components/site-sections/Editable*.tsx` - Editable sections
- `/app/api/pages/content/route.ts` - Content API
- `/hooks/usePageContent.ts` - Update logic

### Recommended Next Steps

1. **GoHighLevel Integration** (Option B)
   - Most complex, highest business value
   - Partial code exists in `/lib/ghl.ts`
   - Needs sub-account creation, webhooks, lead sync

2. **Logo Upload** (Option C)
   - Good UX improvement
   - Relatively simple to implement
   - Can use existing photo infrastructure

3. **Lead Capture Forms** (Option D)
   - Essential for business functionality
   - Integrates with GHL when ready
   - Form builder would be valuable

4. **Stripe Billing** (Option E)
   - Required for monetization
   - Complex but well-documented
   - Needs subscription management UI

### Code Quality Reminders

From CLAUDE.md:
- **ZERO TOLERANCE for technical debt**
- **No console.log** - use `/lib/logger.ts`
- **Use native fetch** - no axios
- **Handle ALL edge cases**
- **Multi-tenant isolation** - always filter by site/user
- **Update existing files** when possible

### Environment Setup

- PostgreSQL via Docker: `npm run docker:up`
- Database migrations: `npm run db:push`
- Dev server: `npm run dev`
- Test at: `http://subdomain.localhost:3000`

### Current Tech Stack

- Next.js 15.3.2 with App Router
- TypeScript
- Prisma ORM with PostgreSQL
- NextAuth for authentication
- Tailwind CSS v4
- shadcn/ui components
- React Hook Form + Zod

### Testing Accounts

Create new accounts via Google OAuth at `/signin`. Each user can have multiple sites with different subdomains.

## Summary

The project is in excellent shape with ZERO technical debt. The content editor is fully functional and follows all best practices. Choose any of the remaining priority tasks and implement following CLAUDE.md guidelines.

Good luck! 🚀
