import { TemplateConfig } from '@/types/template-system';

export const modernTechConfig: TemplateConfig = {
  id: 'modern-tech',
  name: 'Modern Technology',
  description: 'A sleek, contemporary design perfect for tech companies and innovative businesses',
  
  compatibility: {
    industries: {
      include: [
        'technology',
        'software',
        'saas',
        'consulting',
        'marketing',
        'design',
        'startup',
        'finance',
        'hvac', // Modern HVAC companies
        'electrical', // Tech-forward electrical
      ],
      exclude: [
        'landscaping',
        'gardening',
        'traditional-crafts',
        'antiques',
      ]
    },
    keywords: {
      positive: [
        'modern',
        'innovative',
        'cutting-edge',
        'digital',
        'tech',
        'smart',
        'advanced',
        'future',
        'streamlined',
        'efficient'
      ],
      negative: [
        'traditional',
        'classic',
        'vintage',
        'rustic',
        'handcrafted',
        'artisanal',
        'old-fashioned'
      ]
    },
    businessTypes: {
      include: ['b2b', 'online', 'saas'],
    }
  },
  
  requirements: {
    colors: {
      primary: true,
      secondary: true,
      accent: true,
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
        max: 8
      },
      testimonials: {
        min: 2
      }
    },
    media: {
      logo: true,
      heroImage: true,
      galleryImages: {
        min: 3
      }
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      accent: 'JetBrains Mono'
    }
  },
  
  style: {
    colorScheme: 'dark',
    density: 'spacious',
    mood: 'bold',
    animations: 'rich'
  },
  
  sections: {
    hero: [
      {
        id: 'hero-modern-gradient',
        name: 'Gradient Hero with Particles',
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
            backgroundImage: false // Uses gradient instead
          },
          features: {
            hasContactInfo: true
          }
        },
        characteristics: {
          contentDensity: 'minimal',
          bestFor: ['saas', 'tech', 'startup'],
          layout: 'centered'
        }
      },
      {
        id: 'hero-modern-split',
        name: 'Split Hero with Animation',
        requires: {
          content: {
            title: true,
            subtitle: true
          },
          media: {
            image: true,
            video: false
          }
        },
        characteristics: {
          contentDensity: 'moderate',
          bestFor: ['b2b', 'consulting'],
          layout: 'split'
        }
      }
    ],
    services: [
      {
        id: 'services-modern-cards',
        name: 'Animated Service Cards',
        requires: {
          data: {
            services: { min: 3, max: 6 }
          },
          features: {
            hasMultipleServices: true
          }
        },
        characteristics: {
          contentDensity: 'moderate',
          layout: 'grid'
        }
      },
      {
        id: 'services-modern-carousel',
        name: 'Service Carousel',
        requires: {
          data: {
            services: { min: 4, max: 12 }
          },
          media: {
            icon: true
          }
        },
        characteristics: {
          contentDensity: 'rich',
          layout: 'carousel'
        }
      }
    ],
    about: [
      {
        id: 'about-modern-stats',
        name: 'About with Statistics',
        requires: {
          content: {
            description: {
              minLength: 200
            }
          },
          data: {
            stats: { min: 3, max: 6 }
          }
        },
        characteristics: {
          contentDensity: 'moderate',
          bestFor: ['b2b', 'enterprise'],
          layout: 'centered'
        }
      }
    ]
  }
};