import { TemplateConfig } from '@/types/template-system';

export const classicBusinessConfig: TemplateConfig = {
  id: 'classic-business',
  name: 'Classic Professional',
  description: 'A timeless, professional design that conveys trust and stability',
  
  compatibility: {
    industries: {
      include: [
        'law',
        'accounting',
        'insurance',
        'real-estate',
        'medical',
        'dental',
        'financial-services',
        'consulting',
        'landscaping', // Traditional landscaping companies
        'plumbing',    // Established plumbing businesses
        'electrical',  // Traditional electrical contractors
      ],
      exclude: [
        'nightclub',
        'gaming',
        'entertainment',
        'fashion',
      ]
    },
    keywords: {
      positive: [
        'professional',
        'established',
        'trusted',
        'traditional',
        'reliable',
        'experienced',
        'quality',
        'family-owned',
        'local',
        'licensed'
      ],
      negative: [
        'trendy',
        'experimental',
        'startup',
        'disruptive',
        'edgy',
        'modern',
        'innovative'
      ]
    },
    businessTypes: {
      include: ['b2b', 'b2c', 'local'],
      exclude: ['online-only']
    }
  },
  
  requirements: {
    colors: {
      primary: true,
      secondary: false,
      accent: false,
      minimumCount: 1  // Can work with just one color
    },
    content: {
      businessName: true,
      tagline: false,  // Optional for classic businesses
      description: {
        minLength: 50,
        required: true
      },
      services: {
        min: 1,  // Can work with single service
        max: 10
      }
    },
    media: {
      logo: false,  // Can use text-based header
      heroImage: false,  // Can work without hero image
      galleryImages: {
        min: 0  // Gallery optional
      }
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato',
    }
  },
  
  style: {
    colorScheme: 'light',
    density: 'balanced',
    mood: 'professional',
    animations: 'subtle'
  },
  
  sections: {
    hero: [
      {
        id: 'hero-classic-centered',
        name: 'Classic Centered Hero',
        requires: {
          content: {
            title: true,
            subtitle: false,
            description: {
              minLength: 30,
              maxLength: 150
            }
          },
          media: {
            backgroundImage: false
          },
          features: {
            hasContactInfo: true
          }
        },
        characteristics: {
          contentDensity: 'minimal',
          bestFor: ['local-service', 'professional'],
          layout: 'centered'
        }
      },
      {
        id: 'hero-classic-image',
        name: 'Classic Hero with Image',
        requires: {
          content: {
            title: true,
            description: {
              minLength: 50
            }
          },
          media: {
            image: true
          }
        },
        characteristics: {
          contentDensity: 'moderate',
          bestFor: ['b2b', 'professional-services'],
          layout: 'split'
        }
      }
    ],
    services: [
      {
        id: 'services-classic-list',
        name: 'Classic Service List',
        requires: {
          data: {
            services: { min: 1, max: 10 }
          }
        },
        characteristics: {
          contentDensity: 'minimal',
          layout: 'list'
        }
      },
      {
        id: 'services-classic-cards',
        name: 'Classic Service Cards',
        requires: {
          data: {
            services: { min: 2, max: 6 }
          }
        },
        characteristics: {
          contentDensity: 'moderate',
          layout: 'grid'
        }
      }
    ],
    about: [
      {
        id: 'about-classic-simple',
        name: 'Classic About Section',
        requires: {
          content: {
            description: {
              minLength: 100
            }
          },
          media: {
            image: false  // Works with or without image
          }
        },
        characteristics: {
          contentDensity: 'minimal',
          bestFor: ['local-business', 'family-owned'],
          layout: 'centered'
        }
      },
      {
        id: 'about-classic-history',
        name: 'About with History Timeline',
        requires: {
          content: {
            description: {
              minLength: 200
            }
          },
          data: {
            stats: { min: 2 }  // Years in business, projects completed, etc
          }
        },
        characteristics: {
          contentDensity: 'rich',
          bestFor: ['established-business'],
          layout: 'timeline'
        }
      }
    ]
  }
};