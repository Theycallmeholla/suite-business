# Template System Documentation

**Created**: December 23, 2024, 2:55 PM CST  
**Last Updated**: December 23, 2024, 2:55 PM CST

## Overview

Suite Business uses a sophisticated two-tier template system that combines modular sections with pre-designed templates to create customized websites for service businesses. The system intelligently selects templates and content based on industry, available data, and business characteristics.

## Template Architecture

### Two-Tier System

#### 1. Legacy Section-Based System
Dynamically assembles modular sections based on available data.

**Sections Available:**
- **Hero**: Eye-catching header with CTA
  - Variants: centered, left-aligned, right-aligned, split
- **About**: Business story and information
  - Variants: simple, with-image, with-stats
- **Services**: Service offerings display
  - Variants: grid, cards, list, carousel
- **Features**: Key benefits highlight
  - Variants: grid, alternating, centered
- **Gallery**: Portfolio showcase
- **FAQ**: Frequently asked questions
- **ServiceAreas**: Geographic coverage
- **CTA**: Call-to-action sections
  - Variants: simple, gradient, image-bg
- **Contact**: Contact information
  - Variants: split, centered, minimal

#### 2. Modern Template System
Pre-designed, industry-specific templates with rich animations.

**Current Templates:**
- `dream-garden` - Elegant nature-inspired design for landscaping
- `nature-premium` - Premium template with seasonal effects
- `emerald-elegance` - Sophisticated design with botanical elements
- `artistry-minimal` - Clean, minimal design for creative businesses

## Template Selection Logic

### Decision Flow
```typescript
1. Check if site has explicit template assigned
2. If yes, check if it's a modern template
3. If no explicit template, use getDefaultTemplateForIndustry()
4. If modern template → use TemplateRenderer
5. If legacy or no template → use SectionRenderer
```

### Industry Matching
```typescript
function getDefaultTemplateForIndustry(industry: string): string {
  const industryTemplates = {
    landscaping: ['dream-garden', 'nature-premium', 'emerald-elegance'],
    creative: ['artistry-minimal'],
    // ... more mappings
  };
  
  return industryTemplates[industry]?.[0] || 'dream-garden';
}
```

## Content Density Analysis

The system analyzes available data to determine content richness:

```typescript
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

### Section Generation Based on Density
- **Minimal**: Hero, Services (if any), CTA, Contact
- **Moderate**: + About, Features
- **Rich**: + Gallery, FAQ, all premium variants

## Industry Detection

### Keyword Analysis
Searches business name and service keywords:
- **Landscaping**: 'landscap', 'lawn', 'garden', 'yard'
- **HVAC**: 'hvac', 'heating', 'cooling', 'air condition'
- **Plumbing**: 'plumb', 'pipe', 'drain', 'water'
- **Cleaning**: 'clean', 'maid', 'janitor', 'housekeep'
- **Roofing**: 'roof', 'shingle', 'gutter'
- **Electrical**: 'electric', 'wiring', 'circuit'

### GBP Category Mapping
Maps Google Business Profile categories to industries:
```typescript
const categoryMappings = {
  'Landscaper': 'landscaping',
  'HVAC contractor': 'hvac',
  'Plumber': 'plumbing',
  // ... more mappings
};
```

## Template Configuration

### Modern Template Structure
```typescript
interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  industries: string[];
  thumbnail: string;
  sections: {
    hero: { variant: string; config?: any };
    about?: { variant: string; config?: any };
    services?: { variant: string; config?: any };
    // ... more sections
  };
  requirements: {
    minServices?: number;
    requiredFields?: string[];
    contentDensity?: ContentDensity;
  };
}
```

### Section Variants per Template
Each template defines specific variants:
- `hero-dream-parallax` - Parallax hero for Dream Garden
- `services-nature-modal` - Modal services for Nature Premium
- `portfolio-emerald-slider` - Slider portfolio for Emerald Elegance

## Content Generation

### Industry-Specific Verbiage
Helper functions provide tailored content:
```typescript
function getIndustryVerbiage(industry: string) {
  return {
    tagline: getIndustryTagline(industry),
    heroSubtitle: getHeroSubtitle(industry),
    aboutTitle: getAboutTitle(industry),
    features: getIndustryFeatures(industry),
    ctaHeadline: getCTAHeadline(industry),
    stats: getIndustryStats(industry)
  };
}
```

### Dynamic Content Adaptation
- Uses actual business data when available
- Falls back to industry defaults
- Adapts tone based on business type
- Incorporates local area references

## File Structure

```
/components/
  SectionRenderer.tsx        # Legacy section renderer
  TemplateRenderer.tsx       # Modern template renderer
  /site-sections/           # Legacy section components
    Hero/
    About/
    Services/
    // ... more sections

/templates/                 # Modern template definitions
  /dream-garden/
    index.ts               # Template configuration
    sections/              # Template-specific sections
  /nature-premium/
  /emerald-elegance/
  /artistry-minimal/

/lib/
  template-registry.ts     # Template definitions and loaders
  template-selector.ts     # Selection logic
  site-builder.ts         # Section generation logic

/types/
  template-system.ts      # TypeScript types
```

## LLM Integration Strategy (Future)

### Enhanced Decision Making
Using AI to improve template selection:

1. **Data Collection**
   - GBP data, reviews, photos
   - Competitor analysis
   - Local market research

2. **LLM Analysis**
   ```typescript
   const decision = await analyzeWithLLM({
     businessData: gbpData,
     competitors: localCompetitors,
     marketTrends: industryData
   });
   ```

3. **Intelligent Outputs**
   - Template recommendation with reasoning
   - Custom section configurations
   - Unique value propositions
   - SEO-optimized content

### Implementation Approach
```typescript
interface LLMTemplateDecision {
  template: string;
  reasoning: string;
  sections: SectionConfig[];
  content: {
    headlines: string[];
    taglines: string[];
    cta: string[];
    features: string[];
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}
```

## Customization System

### Color Theming
- Primary, secondary, accent colors
- Applied via CSS variables
- Automatic contrast calculation
- Industry-appropriate defaults

### Typography
- Font selection per template
- Responsive sizing
- Readability optimization
- Brand consistency

### Layout Flexibility
- Section reordering
- Hide/show sections
- Variant switching
- Custom CSS injection

## Performance Optimization

### Loading Strategy
- React Server Components
- Image optimization
- Lazy loading for galleries
- Critical CSS inlining

### Caching
- Template configurations cached
- Generated content cached
- CDN-ready static assets
- Database query optimization

## Testing Templates

### Preview System
- Real-time preview during editing
- Device size simulation
- Color theme testing
- Content density variations

### Quality Checks
- Accessibility compliance
- Mobile responsiveness
- SEO validation
- Performance metrics

## Best Practices

### Template Design
1. **Mobile-first approach**
2. **Accessibility standards**
3. **Performance budgets**
4. **SEO optimization**
5. **Cross-browser testing**

### Content Guidelines
1. **Clear hierarchy**
2. **Scannable content**
3. **Action-oriented CTAs**
4. **Local SEO focus**
5. **Trust indicators**

## Future Enhancements

1. **AI-Powered Customization**
   - Real-time content generation
   - Smart image selection
   - Competitor differentiation

2. **Advanced Templates**
   - Industry sub-specializations
   - Seasonal variations
   - Campaign-specific designs

3. **User Personalization**
   - Visitor behavior adaptation
   - A/B testing framework
   - Conversion optimization

4. **Template Marketplace**
   - Third-party templates
   - Revenue sharing
   - Quality standards

## Related Documentation

- `/docs/SITE_INFRASTRUCTURE.md` - Site rendering details
- `/docs/ONBOARDING.md` - Template selection during onboarding
- `/docs/INTELLIGENT_CONTENT_GENERATION.md` - AI content strategy
- `/lib/template-registry.ts` - Template implementation