import { TemplateConfig } from '@/types/template-system';

export const naturePremiumTemplate: TemplateConfig = {
  id: 'nature-premium',
  name: 'Nature Premium',
  description: 'A sophisticated template with particle effects, seasonal themes, and interactive elements',
  compatibility: {
    industries: {
      include: ['landscaping', 'gardening', 'lawn-care', 'tree-service', 'outdoor-living', 'nursery', 'environmental'],
      exclude: ['automotive', 'technology', 'finance']
    },
    keywords: {
      positive: ['garden', 'landscape', 'outdoor', 'nature', 'eco', 'green', 'sustainable', 'organic', 'environmental'],
      negative: ['industrial', 'corporate', 'tech', 'digital']
    }
  },
  requirements: {
    colors: {
      primary: true,
      secondary: true,
      accent: true,
      minimumCount: 3
    },
    images: {
      hero: { required: true, count: 1, aspectRatio: '16:9' },
      gallery: { required: true, count: 4, aspectRatio: '4:3' },
      services: { required: false, count: 4, aspectRatio: '1:1' },
      team: { required: false, count: 2, aspectRatio: '3:4' }
    },
    content: {
      services: { min: 3, max: 8 },
      testimonials: { min: 2, max: 10 },
      teamMembers: { min: 0, max: 20 },
      portfolioItems: { min: 2, max: 20 }
    },
    features: [
      'particle-effects',
      'seasonal-themes',
      'before-after-slider',
      'service-modals',
      'timeline-process',
      'mouse-tracking',
      'scroll-animations'
    ]
  },
  sections: {
    hero: [
      {
        id: 'hero-nature-seasonal',
        name: 'Seasonal Hero with Particles',
        requiresImage: true,
        requiresContent: ['title', 'subtitle'],
        features: ['particle-engine', 'seasonal-indicator', 'mouse-tracking']
      },
      {
        id: 'hero-nature-video',
        name: 'Video Background with Overlay',
        requiresVideo: true,
        requiresContent: ['title', 'subtitle', 'cta'],
        features: ['video-background', 'animated-overlay']
      },
      {
        id: 'hero-nature-parallax',
        name: 'Multi-layer Parallax',
        requiresImage: true,
        requiresContent: ['title', 'subtitle'],
        features: ['parallax-layers', 'floating-elements']
      }
    ],
    services: [
      {
        id: 'services-nature-modal',
        name: 'Grid with Modal Details',
        requiresContent: ['services'],
        minItems: 3,
        features: ['service-modals', 'gradient-overlays', 'hover-animations']
      },
      {
        id: 'services-nature-carousel',
        name: 'Animated Carousel',
        requiresContent: ['services'],
        minItems: 4,
        features: ['auto-rotate', 'touch-gestures', '3d-transforms']
      },
      {
        id: 'services-nature-timeline',
        name: 'Process Timeline',
        requiresContent: ['services'],
        minItems: 3,
        features: ['timeline-animation', 'scroll-trigger']
      }
    ],
    portfolio: [
      {
        id: 'portfolio-nature-slider',
        name: 'Before/After Slider',
        requiresImages: ['before', 'after'],
        minItems: 2,
        features: ['before-after-slider', 'touch-drag']
      },
      {
        id: 'portfolio-nature-grid',
        name: 'Filterable Grid',
        requiresImages: ['gallery'],
        minItems: 4,
        features: ['category-filter', 'lightbox', 'masonry-layout']
      },
      {
        id: 'portfolio-nature-showcase',
        name: 'Featured Showcase',
        requiresImages: ['gallery'],
        minItems: 3,
        features: ['spotlight-carousel', 'detail-panels']
      }
    ],
    about: [
      {
        id: 'about-nature-values',
        name: 'Values with Icons',
        requiresContent: ['description', 'values'],
        features: ['icon-animations', 'stagger-reveal']
      },
      {
        id: 'about-nature-story',
        name: 'Story Timeline',
        requiresContent: ['history'],
        features: ['vertical-timeline', 'milestone-markers']
      },
      {
        id: 'about-nature-team',
        name: 'Team Showcase',
        requiresContent: ['team'],
        requiresImages: ['team'],
        features: ['team-cards', 'social-links']
      }
    ],
    testimonials: [
      {
        id: 'testimonials-nature-carousel',
        name: 'Auto-rotating Carousel',
        requiresContent: ['testimonials'],
        minItems: 2,
        features: ['auto-rotate', 'navigation-dots']
      },
      {
        id: 'testimonials-nature-grid',
        name: 'Masonry Grid',
        requiresContent: ['testimonials'],
        minItems: 3,
        features: ['masonry-layout', 'rating-stars']
      }
    ],
    contact: [
      {
        id: 'contact-nature-split',
        name: 'Split Layout with Form',
        requiresContent: ['contact'],
        features: ['contact-form', 'office-hours', 'map-integration']
      },
      {
        id: 'contact-nature-minimal',
        name: 'Minimal Contact',
        requiresContent: ['contact'],
        features: ['simple-form', 'social-links']
      }
    ],
    cta: [
      {
        id: 'cta-nature-seasonal',
        name: 'Seasonal Call-to-Action',
        requiresContent: ['cta'],
        features: ['seasonal-messaging', 'animated-background']
      },
      {
        id: 'cta-nature-simple',
        name: 'Simple CTA Banner',
        requiresContent: ['cta'],
        features: ['gradient-background', 'hover-effects']
      }
    ]
  },
  colorSchemes: [
    {
      name: 'Forest',
      primary: '#2F855A',
      secondary: '#8B5A2B',
      accent: '#48BB78'
    },
    {
      name: 'Ocean Garden',
      primary: '#2C7A7B',
      secondary: '#2D3748',
      accent: '#4FD1C5'
    },
    {
      name: 'Sunset Meadow',
      primary: '#D69E2E',
      secondary: '#744210',
      accent: '#F6AD55'
    }
  ]
};