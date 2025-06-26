import { TemplateConfig } from '@/types/template-system';

export const dreamGardenConfig: TemplateConfig = {
  id: 'dream-garden',
  name: 'Dream Garden',
  description: 'An elegant, nature-inspired design perfect for landscaping and gardening businesses',
  
  compatibility: {
    industries: {
      include: [
        'landscaping',
        'gardening',
        'lawn-care',
        'garden-design',
        'nursery',
        'arborist',
        'outdoor-living',
        'landscape-architecture',
      ],
      exclude: [
        'technology',
        'software',
        'finance',
        'medical',
      ]
    },
    keywords: {
      positive: [
        'garden',
        'landscape',
        'natural',
        'organic',
        'green',
        'outdoor',
        'plants',
        'trees',
        'lawn',
        'bloom',
        'grow',
        'sustainable',
        'eco-friendly',
        'nature'
      ],
      negative: [
        'digital',
        'tech',
        'software',
        'artificial',
        'virtual',
        'cyber'
      ]
    },
    businessTypes: {
      include: ['b2c', 'local', 'residential'],
    }
  },
  
  requirements: {
    colors: {
      primary: true,      // Rich green
      secondary: true,    // Earth brown
      accent: true,       // Sky blue
      minimumCount: 3
    },
    content: {
      businessName: true,
      tagline: true,
      description: {
        minLength: 100,
        required: true
      },
      services: {
        min: 3,
        max: 6
      }
    },
    media: {
      heroImage: true,    // Nature/garden imagery essential
      galleryImages: {
        min: 4            // Before/after, portfolio images
      }
    },
    fonts: {
      heading: 'Playfair Display',  // Elegant serif
      body: 'Inter',                // Clean sans-serif
    }
  },
  
  style: {
    colorScheme: 'light',
    density: 'spacious',
    mood: 'elegant',
    animations: 'rich'    // Floating leaves, parallax, grow-in effects
  },
  
  sections: {
    hero: [
      {
        id: 'hero-dream-parallax',
        name: 'Dream Garden Parallax Hero',
        requires: {
          content: {
            title: true,
            subtitle: true,
            description: {
              minLength: 50,
              maxLength: 200
            }
          },
          media: {
            backgroundImage: true
          },
          features: {
            hasContactInfo: false
          }
        },
        characteristics: {
          contentDensity: 'minimal',
          bestFor: ['landscaping', 'garden-design'],
          layout: 'centered-overlay'
        }
      }
    ],
    services: [
      {
        id: 'services-dream-cards',
        name: 'Dream Garden Service Cards',
        requires: {
          data: {
            services: { min: 4, max: 4 }
          },
          media: {
            image: true  // Each service needs an image
          }
        },
        characteristics: {
          contentDensity: 'rich',
          layout: 'grid-overlay'
        }
      }
    ],
    about: [
      {
        id: 'about-dream-split',
        name: 'Dream Garden About Split',
        requires: {
          content: {
            description: {
              minLength: 200
            }
          },
          media: {
            image: true
          },
          data: {
            features: { min: 3 }  // Key points with icons
          }
        },
        characteristics: {
          contentDensity: 'moderate',
          bestFor: ['established-business'],
          layout: 'split-image-left'
        }
      }
    ],
    gallery: [
      {
        id: 'gallery-dream-showcase',
        name: 'Before/After Garden Showcase',
        requires: {
          media: {
            image: { min: 4 }
          },
          features: {
            hasBeforeAfter: true
          }
        },
        characteristics: {
          contentDensity: 'rich',
          layout: 'interactive-slider'
        }
      }
    ],
    testimonials: [
      {
        id: 'testimonials-dream-cards',
        name: 'Garden Testimonial Cards',
        requires: {
          data: {
            testimonials: { min: 3 }
          }
        },
        characteristics: {
          contentDensity: 'moderate',
          layout: 'card-grid'
        }
      }
    ],
    contact: [
      {
        id: 'contact-dream-garden',
        name: 'Dream Garden Contact',
        requires: {
          features: {
            hasContactInfo: true,
            hasLocation: true
          }
        },
        characteristics: {
          contentDensity: 'moderate',
          layout: 'split-form'
        }
      }
    ]
  }
};