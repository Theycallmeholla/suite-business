/**
 * Section Variants System
 * 
 * Defines multiple design variants for each section type.
 * Each variant has different layouts, styles, and content requirements.
 * The dynamic layout generator selects the best variant based on:
 * - Available content
 * - Brand personality
 * - Industry patterns
 * - User preferences
 */

export interface SectionVariant {
  id: string;
  name: string;
  description: string;
  suitableFor: {
    industries?: string[];
    personalities?: string[];
    contentDensity?: ('minimal' | 'moderate' | 'rich')[];
    businessStage?: string[];
  };
  requirements: {
    content?: {
      title?: boolean;
      subtitle?: boolean;
      description?: { required: boolean; minLength?: number };
      items?: { min: number; max?: number };
    };
    media?: {
      images?: { min: number; max?: number };
      video?: boolean;
    };
    data?: {
      reviews?: { min: number };
      services?: { min: number };
      certifications?: boolean;
    };
  };
  layout: {
    structure: 'single-column' | 'two-column' | 'three-column' | 'grid' | 'masonry' | 'carousel';
    alignment: 'left' | 'center' | 'right';
    spacing: 'compact' | 'normal' | 'spacious';
    background: 'none' | 'light' | 'dark' | 'gradient' | 'image';
  };
  styling: {
    emphasis: 'subtle' | 'normal' | 'bold' | 'dramatic';
    borderRadius: 'none' | 'subtle' | 'rounded' | 'pill';
    shadows: 'none' | 'subtle' | 'normal' | 'dramatic';
    animations: 'none' | 'subtle' | 'normal' | 'dynamic';
  };
  conversionOptimized: boolean;
  mobileOptimized: boolean;
}

/**
 * Hero Section Variants
 */
export const heroVariants: SectionVariant[] = [
  {
    id: 'hero-modern',
    name: 'Modern Hero',
    description: 'Clean, minimal design with strong typography and subtle animations',
    suitableFor: {
      personalities: ['modern', 'professional', 'tech-forward'],
      contentDensity: ['minimal', 'moderate'],
      businessStage: ['startup', 'growing'],
    },
    requirements: {
      content: {
        title: true,
        subtitle: true,
        description: { required: false },
      },
      media: {
        images: { min: 0, max: 1 },
      },
    },
    layout: {
      structure: 'two-column',
      alignment: 'left',
      spacing: 'spacious',
      background: 'gradient',
    },
    styling: {
      emphasis: 'bold',
      borderRadius: 'subtle',
      shadows: 'subtle',
      animations: 'normal',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },
  
  {
    id: 'hero-classic',
    name: 'Classic Hero',
    description: 'Traditional, trustworthy design with centered content',
    suitableFor: {
      personalities: ['traditional', 'professional', 'established'],
      industries: ['plumbing', 'hvac', 'electrical'],
      businessStage: ['established', 'mature'],
    },
    requirements: {
      content: {
        title: true,
        subtitle: true,
        description: { required: true, minLength: 50 },
      },
    },
    layout: {
      structure: 'single-column',
      alignment: 'center',
      spacing: 'normal',
      background: 'light',
    },
    styling: {
      emphasis: 'normal',
      borderRadius: 'none',
      shadows: 'none',
      animations: 'subtle',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'hero-urgent',
    name: 'Emergency Hero',
    description: 'High-contrast design emphasizing urgency and immediate action',
    suitableFor: {
      personalities: ['urgent', 'emergency'],
      industries: ['plumbing', 'hvac', 'electrical', 'roofing'],
    },
    requirements: {
      content: {
        title: true,
        subtitle: true,
      },
    },
    layout: {
      structure: 'single-column',
      alignment: 'center',
      spacing: 'compact',
      background: 'dark',
    },
    styling: {
      emphasis: 'dramatic',
      borderRadius: 'subtle',
      shadows: 'dramatic',
      animations: 'dynamic',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'hero-elegant',
    name: 'Premium Hero',
    description: 'Sophisticated design with premium feel and elegant typography',
    suitableFor: {
      personalities: ['premium', 'luxury', 'sophisticated'],
      industries: ['landscaping', 'cleaning'],
      contentDensity: ['moderate', 'rich'],
    },
    requirements: {
      content: {
        title: true,
        subtitle: true,
        description: { required: true, minLength: 100 },
      },
      media: {
        images: { min: 1, max: 3 },
      },
    },
    layout: {
      structure: 'two-column',
      alignment: 'left',
      spacing: 'spacious',
      background: 'image',
    },
    styling: {
      emphasis: 'bold',
      borderRadius: 'rounded',
      shadows: 'normal',
      animations: 'subtle',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'hero-detailed',
    name: 'Content-Rich Hero',
    description: 'Comprehensive hero with multiple content elements and trust signals',
    suitableFor: {
      contentDensity: ['rich'],
      businessStage: ['established', 'mature'],
    },
    requirements: {
      content: {
        title: true,
        subtitle: true,
        description: { required: true, minLength: 150 },
      },
      media: {
        images: { min: 1, max: 5 },
      },
      data: {
        reviews: { min: 10 },
        certifications: true,
      },
    },
    layout: {
      structure: 'three-column',
      alignment: 'left',
      spacing: 'normal',
      background: 'light',
    },
    styling: {
      emphasis: 'normal',
      borderRadius: 'subtle',
      shadows: 'subtle',
      animations: 'normal',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },
];

/**
 * Services Section Variants
 */
export const servicesVariants: SectionVariant[] = [
  {
    id: 'services-grid',
    name: 'Service Grid',
    description: 'Clean grid layout showcasing services with icons and descriptions',
    suitableFor: {
      personalities: ['modern', 'professional'],
      contentDensity: ['moderate', 'rich'],
    },
    requirements: {
      data: {
        services: { min: 3 },
      },
    },
    layout: {
      structure: 'grid',
      alignment: 'center',
      spacing: 'normal',
      background: 'light',
    },
    styling: {
      emphasis: 'normal',
      borderRadius: 'rounded',
      shadows: 'subtle',
      animations: 'subtle',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'services-featured',
    name: 'Featured Services',
    description: 'Highlight top 3 services with large cards and detailed descriptions',
    suitableFor: {
      personalities: ['premium', 'professional'],
      contentDensity: ['minimal', 'moderate'],
    },
    requirements: {
      data: {
        services: { min: 1 },
      },
    },
    layout: {
      structure: 'three-column',
      alignment: 'center',
      spacing: 'spacious',
      background: 'none',
    },
    styling: {
      emphasis: 'bold',
      borderRadius: 'rounded',
      shadows: 'normal',
      animations: 'normal',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'services-tabs',
    name: 'Service Categories',
    description: 'Tabbed interface for organizing many services into categories',
    suitableFor: {
      contentDensity: ['rich'],
    },
    requirements: {
      data: {
        services: { min: 6 },
      },
    },
    layout: {
      structure: 'single-column',
      alignment: 'center',
      spacing: 'normal',
      background: 'light',
    },
    styling: {
      emphasis: 'normal',
      borderRadius: 'subtle',
      shadows: 'subtle',
      animations: 'normal',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'services-elegant',
    name: 'Premium Services',
    description: 'Sophisticated layout with alternating content and imagery',
    suitableFor: {
      personalities: ['premium', 'elegant', 'luxury'],
      industries: ['landscaping', 'cleaning'],
    },
    requirements: {
      data: {
        services: { min: 2 },
      },
      media: {
        images: { min: 2 },
      },
    },
    layout: {
      structure: 'two-column',
      alignment: 'left',
      spacing: 'spacious',
      background: 'none',
    },
    styling: {
      emphasis: 'bold',
      borderRadius: 'rounded',
      shadows: 'normal',
      animations: 'subtle',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },
];

/**
 * About Section Variants
 */
export const aboutVariants: SectionVariant[] = [
  {
    id: 'about-story',
    name: 'Company Story',
    description: 'Narrative-focused about section with timeline and milestones',
    suitableFor: {
      personalities: ['traditional', 'family-owned', 'established'],
      businessStage: ['established', 'mature'],
    },
    requirements: {
      content: {
        description: { required: true, minLength: 200 },
      },
    },
    layout: {
      structure: 'two-column',
      alignment: 'left',
      spacing: 'normal',
      background: 'light',
    },
    styling: {
      emphasis: 'normal',
      borderRadius: 'subtle',
      shadows: 'subtle',
      animations: 'subtle',
    },
    conversionOptimized: false,
    mobileOptimized: true,
  },

  {
    id: 'about-team',
    name: 'Meet the Team',
    description: 'Team-focused about section with photos and credentials',
    suitableFor: {
      personalities: ['personal', 'family-owned', 'professional'],
      contentDensity: ['moderate', 'rich'],
    },
    requirements: {
      media: {
        images: { min: 2 },
      },
      data: {
        certifications: true,
      },
    },
    layout: {
      structure: 'grid',
      alignment: 'center',
      spacing: 'normal',
      background: 'none',
    },
    styling: {
      emphasis: 'normal',
      borderRadius: 'rounded',
      shadows: 'subtle',
      animations: 'normal',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'about-values',
    name: 'Values & Mission',
    description: 'Mission-driven about section highlighting company values',
    suitableFor: {
      personalities: ['professional', 'mission-driven', 'community'],
    },
    requirements: {
      content: {
        description: { required: true, minLength: 150 },
      },
    },
    layout: {
      structure: 'single-column',
      alignment: 'center',
      spacing: 'spacious',
      background: 'gradient',
    },
    styling: {
      emphasis: 'bold',
      borderRadius: 'subtle',
      shadows: 'none',
      animations: 'subtle',
    },
    conversionOptimized: false,
    mobileOptimized: true,
  },
];

/**
 * Gallery Section Variants
 */
export const galleryVariants: SectionVariant[] = [
  {
    id: 'gallery-masonry',
    name: 'Masonry Gallery',
    description: 'Pinterest-style masonry layout showcasing work variety',
    suitableFor: {
      personalities: ['creative', 'modern', 'visual'],
      industries: ['landscaping', 'roofing'],
    },
    requirements: {
      media: {
        images: { min: 6 },
      },
    },
    layout: {
      structure: 'masonry',
      alignment: 'center',
      spacing: 'compact',
      background: 'light',
    },
    styling: {
      emphasis: 'normal',
      borderRadius: 'rounded',
      shadows: 'subtle',
      animations: 'normal',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'gallery-carousel',
    name: 'Featured Work Carousel',
    description: 'Rotating carousel highlighting best work with descriptions',
    suitableFor: {
      personalities: ['premium', 'professional'],
      contentDensity: ['moderate', 'rich'],
    },
    requirements: {
      media: {
        images: { min: 4, max: 12 },
      },
    },
    layout: {
      structure: 'carousel',
      alignment: 'center',
      spacing: 'normal',
      background: 'dark',
    },
    styling: {
      emphasis: 'bold',
      borderRadius: 'rounded',
      shadows: 'dramatic',
      animations: 'dynamic',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'gallery-grid',
    name: 'Project Grid',
    description: 'Organized grid with project categories and hover effects',
    suitableFor: {
      personalities: ['professional', 'organized'],
      contentDensity: ['rich'],
    },
    requirements: {
      media: {
        images: { min: 8 },
      },
    },
    layout: {
      structure: 'grid',
      alignment: 'center',
      spacing: 'normal',
      background: 'none',
    },
    styling: {
      emphasis: 'normal',
      borderRadius: 'subtle',
      shadows: 'subtle',
      animations: 'normal',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },
];

/**
 * Testimonials Section Variants
 */
export const testimonialsVariants: SectionVariant[] = [
  {
    id: 'testimonials-carousel',
    name: 'Review Carousel',
    description: 'Rotating testimonials with customer photos and ratings',
    suitableFor: {
      personalities: ['professional', 'trustworthy'],
      contentDensity: ['moderate', 'rich'],
    },
    requirements: {
      data: {
        reviews: { min: 5 },
      },
    },
    layout: {
      structure: 'carousel',
      alignment: 'center',
      spacing: 'normal',
      background: 'light',
    },
    styling: {
      emphasis: 'normal',
      borderRadius: 'rounded',
      shadows: 'subtle',
      animations: 'normal',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'testimonials-grid',
    name: 'Review Grid',
    description: 'Grid layout showing multiple reviews simultaneously',
    suitableFor: {
      contentDensity: ['rich'],
    },
    requirements: {
      data: {
        reviews: { min: 9 },
      },
    },
    layout: {
      structure: 'grid',
      alignment: 'center',
      spacing: 'normal',
      background: 'none',
    },
    styling: {
      emphasis: 'normal',
      borderRadius: 'subtle',
      shadows: 'subtle',
      animations: 'subtle',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'testimonials-featured',
    name: 'Featured Review',
    description: 'Single prominent testimonial with large quote and photo',
    suitableFor: {
      personalities: ['premium', 'personal'],
      contentDensity: ['minimal', 'moderate'],
    },
    requirements: {
      data: {
        reviews: { min: 1 },
      },
    },
    layout: {
      structure: 'single-column',
      alignment: 'center',
      spacing: 'spacious',
      background: 'gradient',
    },
    styling: {
      emphasis: 'bold',
      borderRadius: 'rounded',
      shadows: 'normal',
      animations: 'subtle',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },
];

/**
 * Contact Section Variants
 */
export const contactVariants: SectionVariant[] = [
  {
    id: 'contact-split',
    name: 'Split Contact',
    description: 'Two-column layout with form and contact information',
    suitableFor: {
      personalities: ['professional', 'modern'],
    },
    requirements: {
      content: {
        title: true,
      },
    },
    layout: {
      structure: 'two-column',
      alignment: 'left',
      spacing: 'normal',
      background: 'light',
    },
    styling: {
      emphasis: 'normal',
      borderRadius: 'subtle',
      shadows: 'subtle',
      animations: 'subtle',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'contact-map',
    name: 'Map Contact',
    description: 'Contact form with integrated map showing service areas',
    suitableFor: {
      personalities: ['local', 'community', 'service-area-focused'],
    },
    requirements: {
      content: {
        title: true,
      },
    },
    layout: {
      structure: 'two-column',
      alignment: 'left',
      spacing: 'normal',
      background: 'none',
    },
    styling: {
      emphasis: 'normal',
      borderRadius: 'rounded',
      shadows: 'normal',
      animations: 'subtle',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'contact-emergency',
    name: 'Emergency Contact',
    description: 'Prominent phone number with emergency service emphasis',
    suitableFor: {
      personalities: ['urgent', 'emergency'],
      industries: ['plumbing', 'hvac', 'electrical'],
    },
    requirements: {
      content: {
        title: true,
      },
    },
    layout: {
      structure: 'single-column',
      alignment: 'center',
      spacing: 'compact',
      background: 'dark',
    },
    styling: {
      emphasis: 'dramatic',
      borderRadius: 'subtle',
      shadows: 'dramatic',
      animations: 'dynamic',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },
];

/**
 * CTA Section Variants
 */
export const ctaVariants: SectionVariant[] = [
  {
    id: 'cta-centered',
    name: 'Centered CTA',
    description: 'Bold, centered call-to-action with strong visual hierarchy',
    suitableFor: {
      personalities: ['modern', 'professional', 'direct'],
    },
    requirements: {
      content: {
        title: true,
      },
    },
    layout: {
      structure: 'single-column',
      alignment: 'center',
      spacing: 'spacious',
      background: 'gradient',
    },
    styling: {
      emphasis: 'dramatic',
      borderRadius: 'rounded',
      shadows: 'normal',
      animations: 'normal',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'cta-split',
    name: 'Split CTA',
    description: 'Two-column CTA with multiple action options',
    suitableFor: {
      personalities: ['professional', 'comprehensive'],
      contentDensity: ['moderate', 'rich'],
    },
    requirements: {
      content: {
        title: true,
        subtitle: true,
      },
    },
    layout: {
      structure: 'two-column',
      alignment: 'center',
      spacing: 'normal',
      background: 'light',
    },
    styling: {
      emphasis: 'bold',
      borderRadius: 'subtle',
      shadows: 'subtle',
      animations: 'subtle',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },

  {
    id: 'cta-urgent',
    name: 'Emergency CTA',
    description: 'High-contrast, urgent call-to-action for emergency services',
    suitableFor: {
      personalities: ['urgent', 'emergency'],
      industries: ['plumbing', 'hvac', 'electrical', 'roofing'],
    },
    requirements: {
      content: {
        title: true,
      },
    },
    layout: {
      structure: 'single-column',
      alignment: 'center',
      spacing: 'compact',
      background: 'dark',
    },
    styling: {
      emphasis: 'dramatic',
      borderRadius: 'pill',
      shadows: 'dramatic',
      animations: 'dynamic',
    },
    conversionOptimized: true,
    mobileOptimized: true,
  },
];

/**
 * Export all variants organized by section type
 */
export const sectionVariants = {
  hero: heroVariants,
  services: servicesVariants,
  about: aboutVariants,
  gallery: galleryVariants,
  testimonials: testimonialsVariants,
  contact: contactVariants,
  cta: ctaVariants,
};

/**
 * Helper function to get variants for a specific section type
 */
export function getVariantsForSection(sectionType: string): SectionVariant[] {
  return sectionVariants[sectionType as keyof typeof sectionVariants] || [];
}

/**
 * Helper function to find the best variant for given criteria
 */
export function findBestVariant(
  sectionType: string,
  criteria: {
    personality?: string;
    industry?: string;
    contentDensity?: 'minimal' | 'moderate' | 'rich';
    businessStage?: string;
    availableContent?: any;
  }
): SectionVariant | null {
  const variants = getVariantsForSection(sectionType);
  
  // Score each variant based on how well it matches the criteria
  const scoredVariants = variants.map(variant => {
    let score = 0;
    
    // Check personality match
    if (criteria.personality && variant.suitableFor.personalities?.includes(criteria.personality)) {
      score += 3;
    }
    
    // Check industry match
    if (criteria.industry && variant.suitableFor.industries?.includes(criteria.industry)) {
      score += 2;
    }
    
    // Check content density match
    if (criteria.contentDensity && variant.suitableFor.contentDensity?.includes(criteria.contentDensity)) {
      score += 2;
    }
    
    // Check business stage match
    if (criteria.businessStage && variant.suitableFor.businessStage?.includes(criteria.businessStage)) {
      score += 1;
    }
    
    return { variant, score };
  });
  
  // Return the highest scoring variant
  const best = scoredVariants.sort((a, b) => b.score - a.score)[0];
  return best?.score > 0 ? best.variant : variants[0] || null;
}