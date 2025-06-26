import { TemplateConfig } from '@/types/site-builder';

export const artistryMinimalTemplate: TemplateConfig = {
  id: 'artistry-minimal',
  name: 'Artistry Minimal',
  description: 'Clean, minimal design with focus on visual impact and refined aesthetics',
  compatibility: {
    industries: {
      include: ['landscaping', 'gardening', 'lawn-care', 'tree-service', 'architecture', 'interior-design', 'photography', 'art-gallery'],
      exclude: []
    },
    keywords: {
      positive: ['minimal', 'clean', 'modern', 'refined', 'artistic', 'elegant', 'sophisticated', 'contemporary'],
      negative: ['traditional', 'rustic', 'vintage', 'ornate', 'busy']
    }
  },
  requirements: {
    content: {
      minSections: 3,
      requiredFields: ['businessName', 'services', 'contactInfo'],
      optionalFields: ['gallery', 'testimonials', 'about']
    },
    features: ['minimal-animations', 'grid-layouts', 'clean-typography']
  },
  sections: {
    hero: {
      component: 'hero-artistry-minimal',
      props: {
        layout: 'fullscreen',
        showCTA: true,
        backgroundType: 'image'
      },
      requirements: {
        content: ['businessName', 'tagline'],
        optional: ['heroImage']
      }
    },
    services: {
      component: 'services-artistry-grid',
      props: {
        columns: 3,
        showIcons: false,
        layout: 'grid'
      },
      requirements: {
        content: ['services'],
        minItems: 3
      }
    },
    portfolio: {
      component: 'portfolio-artistry-masonry',
      props: {
        layout: 'masonry',
        showFilter: true,
        hoverEffect: 'minimal'
      },
      requirements: {
        content: ['gallery'],
        minItems: 6
      }
    },
    testimonials: {
      component: 'testimonials-artistry-grid',
      props: {
        layout: 'grid',
        columns: 2,
        minimal: true
      },
      requirements: {
        content: ['testimonials'],
        minItems: 2
      }
    },
    about: {
      component: 'about-artistry-split',
      props: {
        layout: 'split',
        imagePosition: 'right'
      },
      requirements: {
        content: ['about'],
        optional: ['teamPhoto']
      }
    },
    contact: {
      component: 'contact-artistry-cards',
      props: {
        showMap: false,
        cardLayout: true
      },
      requirements: {
        content: ['contactInfo']
      }
    }
  },
  colorScheme: {
    primary: '#1a1a1a',
    secondary: '#f5f5f5',
    accent: '#4a5568',
    background: '#ffffff',
    text: '#2d3748',
    muted: '#e2e8f0'
  },
  typography: {
    headingFont: 'var(--font-serif)',
    bodyFont: 'var(--font-sans)',
    scale: 'minimal'
  }
};