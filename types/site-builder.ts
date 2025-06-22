// Section template types
export interface SectionBase {
  id: string;
  type: SectionType;
  order: number;
  visible: boolean;
  settings?: Record<string, any>;
}

export type SectionType = 
  | 'hero'
  | 'about'
  | 'services'
  | 'features'
  | 'cta'
  | 'testimonials'
  | 'contact'
  | 'gallery'
  | 'faq'
  | 'stats';

// Industry types for future customization
export type IndustryType = 
  | 'landscaping'
  | 'hvac'
  | 'plumbing'
  | 'cleaning'
  | 'roofing'
  | 'electrical'
  | 'general';

// Content density levels
export type ContentDensity = 'minimal' | 'moderate' | 'rich';

// Hero section variants
export interface HeroSection extends SectionBase {
  type: 'hero';
  data: {
    headline: string;
    subheadline?: string;
    description?: string;
    primaryButton?: {
      text: string;
      href: string;
    };
    secondaryButton?: {
      text: string;
      href: string;
    };
    backgroundImage?: string;
    backgroundVideo?: string;
    variant: 'centered' | 'left-aligned' | 'right-aligned' | 'split';
  };
}

// About section variants
export interface AboutSection extends SectionBase {
  type: 'about';
  data: {
    title: string;
    content: string;
    image?: string;
    stats?: Array<{
      label: string;
      value: string;
    }>;
    variant: 'simple' | 'with-image' | 'with-stats';
  };
}

// Services section
export interface ServicesSection extends SectionBase {
  type: 'services';
  data: {
    title: string;
    subtitle?: string;
    services: Array<{
      id: string;
      name: string;
      description: string;
      price?: string;
      image?: string;
      features?: string[];
    }>;
    variant: 'grid' | 'cards' | 'list' | 'carousel';
  };
}

// Features section
export interface FeaturesSection extends SectionBase {
  type: 'features';
  data: {
    title: string;
    subtitle?: string;
    features: Array<{
      icon?: string;
      title: string;
      description: string;
    }>;
    variant: 'grid' | 'alternating' | 'centered';
  };
}

// CTA section
export interface CTASection extends SectionBase {
  type: 'cta';
  data: {
    headline: string;
    description?: string;
    buttonText: string;
    buttonHref: string;
    backgroundImage?: string;
    variant: 'simple' | 'gradient' | 'image-bg';
  };
}

// Contact section
export interface ContactSection extends SectionBase {
  type: 'contact';
  data: {
    title: string;
    subtitle?: string;
    showForm: boolean;
    showMap: boolean;
    showInfo: boolean;
    variant: 'split' | 'centered' | 'minimal';
  };
}

export type Section = 
  | HeroSection 
  | AboutSection 
  | ServicesSection 
  | FeaturesSection 
  | CTASection 
  | ContactSection;

// Page template structure
export interface PageTemplate {
  name: string;
  industry: IndustryType;
  contentDensity: ContentDensity;
  sections: Section[];
  settings: {
    font: string;
    colorScheme: string;
    spacing: 'compact' | 'normal' | 'spacious';
  };
}

// Default templates by industry
export const defaultTemplates: Record<IndustryType, Partial<PageTemplate>> = {
  landscaping: {
    name: 'Landscaping Pro',
    industry: 'landscaping',
    settings: {
      font: 'Inter',
      colorScheme: 'green',
      spacing: 'normal'
    }
  },
  hvac: {
    name: 'HVAC Expert',
    industry: 'hvac',
    settings: {
      font: 'Inter',
      colorScheme: 'blue',
      spacing: 'normal'
    }
  },
  plumbing: {
    name: 'Plumbing Pro',
    industry: 'plumbing',
    settings: {
      font: 'Inter',
      colorScheme: 'blue',
      spacing: 'normal'
    }
  },
  cleaning: {
    name: 'Cleaning Service',
    industry: 'cleaning',
    settings: {
      font: 'Inter',
      colorScheme: 'teal',
      spacing: 'spacious'
    }
  },
  roofing: {
    name: 'Roofing Expert',
    industry: 'roofing',
    settings: {
      font: 'Inter',
      colorScheme: 'red',
      spacing: 'normal'
    }
  },
  electrical: {
    name: 'Electrical Pro',
    industry: 'electrical',
    settings: {
      font: 'Inter',
      colorScheme: 'yellow',
      spacing: 'normal'
    }
  },
  general: {
    name: 'Service Business',
    industry: 'general',
    settings: {
      font: 'Inter',
      colorScheme: 'blue',
      spacing: 'normal'
    }
  }
};
