// Template System Type Definitions

export interface TemplateConfig {
  id: string;
  name: string;
  description?: string;
  
  // Compatibility rules for when to show/hide this template
  compatibility: {
    industries: {
      include?: string[];  // Only show for these industries
      exclude?: string[];  // Never show for these industries
    };
    keywords: {
      positive?: string[]; // Show when these terms match (modern, innovative, etc)
      negative?: string[]; // Hide when these terms match (traditional, vintage, etc)
    };
    businessTypes?: {
      include?: string[]; // b2b, b2c, local, online, etc
      exclude?: string[];
    };
  };
  
  // What this template requires to work properly
  requirements: {
    colors: {
      primary: boolean;
      secondary?: boolean;
      accent?: boolean;
      minimumCount: number;
    };
    content: {
      businessName: boolean;
      tagline?: boolean;
      description?: {
        minLength?: number;
        required?: boolean;
      };
      services: {
        min: number;
        max?: number;
      };
      testimonials?: {
        min: number;
      };
    };
    media: {
      logo?: boolean;
      heroImage?: boolean;
      heroVideo?: boolean;
      galleryImages?: {
        min: number;
      };
      teamPhotos?: boolean;
    };
    fonts?: {
      heading: string;
      body: string;
      accent?: string;
    };
  };
  
  // Style characteristics
  style: {
    colorScheme: 'light' | 'dark' | 'colorful' | 'monochrome';
    density: 'spacious' | 'balanced' | 'compact';
    mood: 'professional' | 'playful' | 'elegant' | 'bold' | 'minimal';
    animations: 'none' | 'subtle' | 'moderate' | 'rich';
  };
  
  // Available sections and their variants
  sections: {
    [sectionType: string]: SectionVariantConfig[];
  };
}

export interface SectionVariantConfig {
  id: string;
  name: string;
  
  // What this section variant requires to display properly
  requires: {
    // Content requirements
    content?: {
      title?: boolean;
      subtitle?: boolean;
      description?: {
        minLength?: number;
        maxLength?: number;
        richText?: boolean;
      };
    };
    
    // Media requirements
    media?: {
      image?: boolean | { 
        min?: number; 
        aspectRatio?: '16:9' | '4:3' | '1:1' | 'any';
      };
      video?: boolean;
      icon?: boolean;
      backgroundImage?: boolean;
    };
    
    // Data requirements
    data?: {
      services?: { min: number; max?: number };
      stats?: { min: number; max?: number };
      testimonials?: { min: number; max?: number };
      teamMembers?: { min: number; max?: number };
      features?: { min: number; max?: number };
      faqs?: { min: number; max?: number };
    };
    
    // Feature requirements
    features?: {
      hasMultipleServices?: boolean;
      hasContactInfo?: boolean;
      hasPricing?: boolean;
      hasLocation?: boolean;
      hasSocialMedia?: boolean;
    };
  };
  
  // When this variant works best
  characteristics: {
    contentDensity: 'minimal' | 'moderate' | 'rich';
    bestFor?: string[]; // ['b2b', 'local-service', 'online-only', etc]
    layout: string; // 'centered', 'split', 'grid', 'carousel', etc
  };
}

// Template selection scoring
export interface TemplateScore {
  template: TemplateConfig;
  score: number;
  reasons: {
    industryMatch: boolean;
    keywordScore: number;
    requirementsMet: boolean;
    missingRequirements?: string[];
  };
}

// Business data used for template selection
export interface BusinessData {
  // Basic info
  businessName: string;
  industry: string;
  businessType?: 'b2b' | 'b2c' | 'both';
  targetAudience?: string[];
  
  // Content
  tagline?: string;
  description?: string;
  services: Array<{
    name: string;
    description?: string;
    price?: string;
  }>;
  
  // Media
  logo?: boolean;
  images: {
    hero?: boolean;
    gallery?: string[];
    team?: string[];
  };
  
  // Additional data
  testimonials?: any[];
  stats?: any[];
  teamMembers?: any[];
  
  // Style preferences (from user or inferred)
  styleKeywords?: string[];
  colorScheme?: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
}

// Helper type for template requirements checking
export type RequirementCheckResult = {
  meets: boolean;
  missing: string[];
  warnings?: string[];
};