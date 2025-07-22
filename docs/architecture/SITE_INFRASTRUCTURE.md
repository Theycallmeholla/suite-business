# Site Infrastructure Documentation

## Overview

The Suite Business platform uses a sophisticated two-tier template system for rendering client sites. Each site is accessible via its subdomain (e.g., `demo.localhost:3000` for local development).

## Architecture

### 1. Two-Tier Template System

The platform supports two rendering approaches:

1. **Legacy Section-Based System**: Dynamically assembles modular sections based on available data
2. **Modern Template System**: Pre-designed, industry-specific templates with rich animations and layouts

Current modern templates:
- `dream-garden` - Elegant nature-inspired design for landscaping businesses
- `nature-premium` - Premium template with seasonal effects
- `emerald-elegance` - Sophisticated design with botanical elements
- `artistry-minimal` - Clean, minimal design for creative businesses

### 2. Subdomain Routing
- **Middleware** (`/middleware.ts`): Detects subdomains and rewrites requests to `/s/[subdomain]`
- **Route Handler** (`/app/s/[subdomain]/page.tsx`): Renders the site
- **Local Development**: Use `subdomain.localhost:3000` format
- **Production**: Configure DNS to point `*.yourdomain.com` to your server

### 3. Data Structure
Sites are stored in the database with:
- Basic business information (name, phone, email, address)
- Branding (logo, primary/secondary/accent colors, template selection)
- SEO metadata (title, description)
- Services offered (with descriptions, prices, features)
- Photos (hero images, gallery, categorized)
- Industry classification
- Published status
- Pages (home, about, services, etc.)

### 4. Template Selection Logic

```typescript
// Template selection flow in /app/s/[subdomain]/page.tsx
1. Check if site has explicit template assigned
2. If yes, check if it's a modern template (dream-garden, nature-premium, etc.)
3. If no explicit template, use getDefaultTemplateForIndustry()
4. If modern template → use TemplateRenderer
5. If legacy or no template → use SectionRenderer with auto-generated sections
```

### 5. Section Components

#### Legacy System Sections
- **Hero**: Eye-catching header with CTA buttons
  - Variants: centered, left-aligned, right-aligned, split
- **About**: Business information and story
  - Variants: simple, with-image, with-stats
- **Services**: Display service offerings
  - Variants: grid, cards, list, carousel
- **Features**: Highlight key benefits
  - Variants: grid, alternating, centered
- **Gallery**: Portfolio showcase
- **FAQ**: Frequently asked questions
- **ServiceAreas**: Geographic coverage
- **CTA**: Call-to-action sections
  - Variants: simple, gradient, image-bg
- **Contact**: Contact information and forms
  - Variants: split, centered, minimal

#### Modern Template System
Each template defines specific section variants with unique IDs:
- `hero-dream-parallax` - Parallax hero for Dream Garden
- `services-nature-modal` - Modal-based services for Nature Premium
- `portfolio-emerald-slider` - Slider portfolio for Emerald Elegance
- And many more...

### 6. Content Density Analysis

The system analyzes available data to determine content density:

```typescript
// From /lib/site-builder.ts
function getContentDensity(site: SiteWithPages): ContentDensity {
  const dataPoints = [
    site.services.length > 0,
    site.metaDescription?.length > 100,
    site.address && site.city && site.state,
    site.phone !== null,
    site.email !== null,
    site.logo !== null
  ].filter(Boolean).length;

  if (dataPoints >= 5) return 'rich';
  if (dataPoints >= 3) return 'moderate';
  return 'minimal';
}
```

### 7. Industry Detection

Industry is detected from business name and service keywords:

```typescript
// Keywords searched in business name + service names:
- landscaping: 'landscap', 'lawn', 'garden'
- hvac: 'hvac', 'heating', 'cooling', 'air condition'
- plumbing: 'plumb', 'pipe', 'drain'
- cleaning: 'clean', 'maid', 'janitor'
- roofing: 'roof', 'shingle', 'gutter'
- electrical: 'electric', 'wiring', 'circuit'
```

### 8. Dynamic Content Generation

For the **Legacy System**, sections are generated based on:
1. Content density (determines which sections to include)
2. Industry type (customizes verbiage and features)
3. Available data (only shows sections with sufficient content)

For the **Modern Template System**:
1. Template configuration defines required content
2. System validates if requirements are met
3. Specific variants are loaded based on template config

### 9. Inline Editing

- Powered by `EditableText` component
- Only active when `isEditable={true}`
- Supports single-line and multi-line editing
- Saves changes via `onUpdate` callbacks

### 10. Theme System

The `ThemeProvider` wrapper:
- Applies custom colors via CSS variables
- Supports primary, secondary, and accent colors
- Adapts typography based on template
- Maintains consistent branding

## File Structure

```
/app/s/[subdomain]/page.tsx     - Subdomain page handler
/lib/
  site-data.ts                  - Database queries for sites
  site-builder.ts               - Section generation logic
  template-registry.ts          - Template definitions and loaders
/types/
  site-builder.ts               - TypeScript types (including TemplateConfig)
/components/
  SectionRenderer.tsx           - Legacy section renderer
  TemplateRenderer.tsx          - Modern template renderer
  EditableText.tsx              - Inline editing component
  /site-sections/               - Legacy section components
/templates/                     - Modern template definitions
  /dream-garden/
  /nature-premium/
  /emerald-elegance/
  /artistry-minimal/
```

## Current Decision Making Process

### Template Selection
1. **Explicit Assignment**: If user selects a template
2. **Industry Matching**: `getDefaultTemplateForIndustry()` checks compatibility
3. **Fallback**: First template in registry

### Section Selection (Legacy)
Based on content density:
- **Minimal**: Hero, Services (if any), CTA, Contact
- **Moderate**: + About, Features
- **Rich**: + Gallery, all variants upgraded

### Variant Selection
- **Legacy**: Based on data characteristics (e.g., ≤3 services = cards, >3 = grid)
- **Modern**: Explicitly defined in template configuration

### Verbiage Generation
Industry-specific helpers provide:
- Taglines
- Section subtitles
- Feature lists
- CTA headlines
- Stats

## API Endpoints

Current endpoints that could feed LLM decision-making:
- `/api/gbp/search` - Search for businesses via Google Places
- `/api/gbp/place-details` - Get detailed place information
- `/api/gbp/my-locations` - User's GBP locations
- `/api/sites/[id]` - Site data management

## Next Steps for LLM Integration

See `/docs/LLM_TEMPLATE_SELECTION.md` for detailed analysis of how to leverage LLM for intelligent template and content decisions.
