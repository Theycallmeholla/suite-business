import { TemplateConfig } from '@/types/template-system';

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
    colors: {
      primary: true,
      secondary: true,
      accent: false,
      minimumCount: 2
    },
    content: {
      businessName: true,
      tagline: false,
      description: {
        minLength: 50,
        required: false
      },
      services: {
        min: 3,
        max: 9
      }
    },
    media: {
      logo: false,
      heroImage: false,
      galleryImages: {
        min: 4
      }
    }
  },
  style: {
    colorScheme: 'light',
    density: 'spacious',
    mood: 'minimal',
    animations: 'subtle'
  },
  sections: {
    hero: [{
      id: 'hero-artistry-minimal',
      name: 'Artistry Minimal Hero',
      requires: {
        content: {
          title: true,
          subtitle: false
        }
      },
      characteristics: {
        contentDensity: 'minimal',
        bestFor: ['landscaping', 'architecture', 'design'],
        layout: 'fullscreen'
      }
    }],
    services: [{
      id: 'services-artistry-grid',
      name: 'Artistry Grid Services',
      requires: {
        data: {
          services: { min: 3, max: 9 }
        }
      },
      characteristics: {
        contentDensity: 'balanced',
        layout: 'grid'
      }
    }],
    portfolio: [{
      id: 'portfolio-artistry-masonry',
      name: 'Artistry Masonry Portfolio',
      requires: {
        media: {
          image: { min: 6 }
        }
      },
      characteristics: {
        contentDensity: 'rich',
        layout: 'masonry'
      }
    }],
    testimonials: [{
      id: 'testimonials-artistry-grid',
      name: 'Artistry Grid Testimonials',
      requires: {
        data: {
          testimonials: { min: 2 }
        }
      },
      characteristics: {
        contentDensity: 'balanced',
        layout: 'grid'
      }
    }],
    about: [{
      id: 'about-artistry-split',
      name: 'Artistry Split About',
      requires: {
        content: {
          description: { minLength: 100 }
        }
      },
      characteristics: {
        contentDensity: 'balanced',
        layout: 'split'
      }
    }],
    contact: [{
      id: 'contact-artistry-cards',
      name: 'Artistry Cards Contact',
      requires: {
        content: {
          title: true
        }
      },
      characteristics: {
        contentDensity: 'minimal',
        layout: 'cards'
      }
    }]
  }
};