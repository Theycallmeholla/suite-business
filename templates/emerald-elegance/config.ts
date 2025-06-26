import { TemplateConfig } from '@/types/template-system';

export const emeraldEleganceTemplate: TemplateConfig = {
  id: 'emerald-elegance',
  name: 'Emerald Elegance',
  description: 'A refined template with animated botanicals, integrated forms, and sophisticated interactions',
  compatibility: {
    industries: {
      include: ['landscaping', 'gardening', 'lawn-care', 'tree-service', 'outdoor-living', 'nursery', 'agriculture'],
      exclude: ['technology', 'finance', 'medical']
    },
    keywords: {
      positive: ['luxury', 'premium', 'elegant', 'professional', 'established', 'refined', 'sophisticated'],
      negative: ['budget', 'discount', 'basic', 'simple']
    }
  },
  requirements: {
    colors: {
      primary: true,
      secondary: false,
      accent: false,
      minimumCount: 1
    },
    images: {
      hero: { required: true, count: 1, aspectRatio: '16:9' },
      services: { required: true, count: 4, aspectRatio: '4:3' },
      portfolio: { required: true, count: 2, aspectRatio: '3:2' },
      team: { required: false, count: 1, aspectRatio: '4:5' }
    },
    content: {
      services: { min: 4, max: 8 },
      testimonials: { min: 3, max: 10 },
      faq: { min: 3, max: 10 },
      portfolioItems: { min: 2, max: 6 }
    },
    features: [
      'animated-botanicals',
      'integrated-forms',
      'sticky-navigation',
      'before-after-slider',
      'alternating-layouts',
      'auto-testimonials',
      'accordion-faq',
      'intersection-animations'
    ]
  },
  sections: {
    hero: [
      {
        id: 'hero-emerald-form',
        name: 'Hero with Integrated Form',
        requiresImage: true,
        requiresContent: ['title', 'subtitle', 'features'],
        features: ['split-layout', 'integrated-form', 'feature-list']
      },
      {
        id: 'hero-emerald-cta',
        name: 'Hero with Dual CTA',
        requiresImage: true,
        requiresContent: ['title', 'subtitle'],
        features: ['full-width', 'dual-buttons', 'overlay']
      }
    ],
    services: [
      {
        id: 'services-emerald-alternating',
        name: 'Alternating Image Cards',
        requiresContent: ['services'],
        requiresImages: ['services'],
        minItems: 4,
        features: ['alternating-layout', 'hover-effects', 'image-cards']
      },
      {
        id: 'services-emerald-grid',
        name: 'Icon Grid with Details',
        requiresContent: ['services'],
        minItems: 4,
        features: ['icon-grid', 'expandable-details']
      }
    ],
    portfolio: [
      {
        id: 'portfolio-emerald-slider',
        name: 'Advanced Before/After',
        requiresImages: ['before', 'after'],
        minItems: 2,
        features: ['before-after-slider', 'project-tabs', 'descriptions']
      },
      {
        id: 'portfolio-emerald-gallery',
        name: 'Project Gallery',
        requiresImages: ['gallery'],
        minItems: 4,
        features: ['filterable-gallery', 'hover-overlays']
      }
    ],
    about: [
      {
        id: 'about-emerald-botanical',
        name: 'About with Botanical Animation',
        requiresContent: ['description'],
        requiresImages: ['team'],
        features: ['animated-botanical', 'split-layout']
      },
      {
        id: 'about-emerald-timeline',
        name: 'Company Timeline',
        requiresContent: ['history'],
        features: ['timeline', 'milestones']
      }
    ],
    testimonials: [
      {
        id: 'testimonials-emerald-auto',
        name: 'Auto-rotating Testimonials',
        requiresContent: ['testimonials'],
        minItems: 3,
        features: ['auto-rotate', 'fade-transition', 'dot-navigation']
      },
      {
        id: 'testimonials-emerald-cards',
        name: 'Testimonial Cards',
        requiresContent: ['testimonials'],
        minItems: 3,
        features: ['card-grid', 'ratings']
      }
    ],
    faq: [
      {
        id: 'faq-emerald-accordion',
        name: 'Accordion FAQ',
        requiresContent: ['faq'],
        minItems: 3,
        features: ['accordion', 'smooth-expand', 'icons']
      }
    ],
    cta: [
      {
        id: 'cta-emerald-decorated',
        name: 'Decorated Call-to-Action',
        requiresContent: ['cta'],
        features: ['background-decorations', 'centered-content']
      }
    ],
    contact: [
      {
        id: 'contact-emerald-split',
        name: 'Split Contact Layout',
        requiresContent: ['contact'],
        features: ['split-layout', 'contact-info', 'form']
      }
    ]
  },
  colorSchemes: [
    {
      name: 'Emerald Classic',
      primary: '#10b981',
      secondary: '#6b7280',
      accent: '#059669'
    },
    {
      name: 'Forest Depth',
      primary: '#047857',
      secondary: '#374151',
      accent: '#065f46'
    },
    {
      name: 'Sage Garden',
      primary: '#84cc16',
      secondary: '#78716c',
      accent: '#65a30d'
    }
  ]
};