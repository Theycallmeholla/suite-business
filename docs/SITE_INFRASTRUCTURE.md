# Site Infrastructure Documentation

## Overview

The Suite Business platform uses a component-based template system for rendering client sites. Each site is accessible via its subdomain (e.g., `demo.localhost:3000` for local development).

## Architecture

### 1. Subdomain Routing
- **Middleware** (`/middleware.ts`): Detects subdomains and rewrites requests to `/s/[subdomain]`
- **Local Development**: Use `subdomain.localhost:3000` format
- **Production**: Configure DNS to point `*.yourdomain.com` to your server

### 2. Data Structure
Sites are stored in the database with:
- Basic business information (name, phone, email, address)
- Branding (logo, primary color, template)
- SEO metadata
- Services offered
- Published status

### 3. Section Templates

The system includes modular section components:

#### Available Sections
- **Hero**: Eye-catching header with CTA buttons
  - Variants: centered, left-aligned, right-aligned, split
- **About**: Business information and story
  - Variants: simple, with-image, with-stats
- **Services**: Display service offerings
  - Variants: grid, cards, list, carousel
- **Features**: Highlight key benefits
  - Variants: grid, alternating, centered
- **CTA**: Call-to-action sections
  - Variants: simple, gradient, image-bg
- **Contact**: Contact information and forms
  - Variants: split, centered, minimal

### 4. Content Density

The system automatically adjusts content based on available data:
- **Minimal**: Basic information only (< 3 data points)
- **Moderate**: Some details available (3-4 data points)
- **Rich**: Complete information (5+ data points)

### 5. Industry Detection

The system detects industry type from business name and services:
- Landscaping
- HVAC
- Plumbing
- Cleaning
- Roofing
- Electrical
- General (default)

## Usage

### Creating a Site

1. Sites are created during the onboarding process
2. Data is pulled from Google Business Profile if available
3. Default sections are generated based on content density

### Customizing Sections

Currently, sections are auto-generated. Future updates will include:
- Visual page builder
- Section reordering
- Custom content editing
- Additional section types

### Testing

1. Visit `/dev/test-site-setup` to create a demo site
2. Access the site at `http://demo.localhost:3000`
3. The page will render with appropriate sections based on available data

## File Structure

```
/app/s/[subdomain]/page.tsx     - Subdomain page handler
/lib/site-data.ts               - Database queries for sites
/lib/site-builder.ts            - Section generation logic
/types/site-builder.ts          - TypeScript types for sections
/components/
  SectionRenderer.tsx           - Dynamic section renderer
  /site-sections/
    Hero.tsx                    - Hero section component
    About.tsx                   - About section component
    Services.tsx                - Services section component
    Features.tsx                - Features section component
    CTA.tsx                     - CTA section component
    Contact.tsx                 - Contact section component
```

## Future Enhancements

1. **Visual Page Builder**
   - Drag-and-drop interface
   - Real-time preview
   - Custom section creation

2. **Additional Sections**
   - Testimonials
   - Gallery/Portfolio
   - FAQ
   - Stats/Numbers
   - Team Members
   - Blog Posts

3. **Advanced Features**
   - A/B testing
   - Analytics integration
   - Custom forms
   - Appointment booking
   - Live chat integration

4. **Performance**
   - Static site generation
   - Image optimization
   - Lazy loading
   - CDN integration

## Development Tips

1. **Adding New Sections**
   - Create component in `/components/site-sections/`
   - Add type definition in `/types/site-builder.ts`
   - Update `SectionRenderer` to handle new type
   - Add generation logic in `site-builder.ts`

2. **Customizing for Industries**
   - Update `detectIndustry()` function
   - Add industry-specific content helpers
   - Create specialized section variants

3. **Testing Different Scenarios**
   - Create sites with varying data completeness
   - Test all section variants
   - Verify responsive design
   - Check color customization

## API Endpoints

Future API endpoints will include:
- `GET /api/sites/:subdomain` - Get site data
- `PUT /api/sites/:id` - Update site settings
- `POST /api/sites/:id/sections` - Add/update sections
- `DELETE /api/sites/:id/sections/:sectionId` - Remove section
