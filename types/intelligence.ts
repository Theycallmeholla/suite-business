import { IndustryType } from './site-builder';

/**
 * Comprehensive business intelligence data from all sources
 */
export interface BusinessIntelligenceData {
  // Google Business Profile data
  gbp?: {
    businessName: string;
    description?: string;
    categories: string[];
    phone?: string;
    address?: {
      streetAddress: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    hours?: {
      [day: string]: {
        open: string;
        close: string;
      };
    };
    attributes?: Record<string, any>;
    photos?: Array<{
      url: string;
      category?: string;
      caption?: string;
    }>;
    logo?: string;
    reviews?: {
      rating: number;
      count: number;
    };
    services?: string[];
    serviceAreas?: string[];
  };
  
  // Enhanced Google Places data
  places?: {
    placeId: string;
    reviews: {
      rating: number;
      total: number;
      highlights: string[];
      sentiment: {
        positive: string[];
        negative: string[];
      };
      recentReviews?: Array<{
        rating: number;
        text: string;
        time: string;
      }>;
    };
    photos?: Array<{
      url: string;
      htmlAttribution: string;
    }>;
    popularTimes?: Array<{
      dayOfWeek: number;
      hours: Array<{
        hour: number;
        popularity: number;
      }>;
    }>;
    priceLevel?: number; // 0-4
    competitors?: Array<{
      name: string;
      rating: number;
      reviewCount: number;
      distance: number;
    }>;
  };
  
  // SERP API results
  serp?: {
    localResults: Array<{
      position: number;
      title: string;
      rating?: number;
      reviews?: number;
      type?: string;
    }>;
    organicResults: Array<{
      position: number;
      title: string;
      link: string;
      snippet: string;
    }>;
    relatedSearches: string[];
    peopleAlsoAsk: Array<{
      question: string;
      snippet?: string;
    }>;
  };
  
  // Manual user input
  manual?: {
    yearsInBusiness?: number;
    certifications?: string[];
    awards?: string[];
    specializations?: string[];
    teamSize?: number;
    services?: string[];
    serviceAreas?: string[];
    differentiators?: string[];
  };
  
  // Existing website data (if scraped)
  existingWebsite?: {
    url: string;
    hasWebsite: boolean;
    meta?: {
      title: string;
      description: string;
      keywords: string[];
    };
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      twitter?: string;
    };
  };
}

/**
 * Data scoring result
 */
export interface DataScore {
  total: number; // 0-100
  breakdown: {
    basicInfo: number;      // 20 points max
    content: number;        // 20 points max
    visuals: number;        // 20 points max
    trust: number;          // 20 points max
    differentiation: number; // 20 points max
  };
  missingCritical: string[];
  contentTier: 'minimal' | 'standard' | 'premium';
}

/**
 * Industry-specific intelligence profile
 */
export interface IndustryIntelligence {
  industry: IndustryType;
  patterns: {
    preferredContact: 'form' | 'phone' | 'appointment';
    urgencyFactors: string[];
    criticalSections: string[];
    optionalSections: string[];
    maxServicesDisplay: number;
    serviceCategories: string[];
  };
  seo: {
    primaryKeywords: string[];
    localKeywords: string[];
    commercialIntent: string[];
    informationalQueries: string[];
  };
  conversion: {
    primaryCTA: string;
    secondaryCTA: string;
    urgencyTriggers: string[];
    trustElements: string[];
  };
  commonCertifications: string[];
}

/**
 * Smart question types for engaging forms
 */
export type QuestionType = 'tinder-swipe' | 'service-grid' | 'quick-select' | 'yes-no-visual' | 'multi-select';

/**
 * Smart question definition
 */
export interface SmartQuestion {
  id: string;
  type: QuestionType;
  priority: 1 | 2 | 3;
  category: 'critical' | 'enhancement' | 'personalization';
  question: string;
  description?: string;
  options: QuestionOption[];
  skipCondition?: (data: BusinessIntelligenceData) => boolean;
  multiSelect?: boolean;
  maxSelections?: number;
}

/**
 * Question option
 */
export interface QuestionOption {
  value: string;
  label: string;
  icon?: string;
  popular?: boolean;
  description?: string;
  image?: string;
}

/**
 * Section recommendation
 */
export interface SectionRecommendation {
  type: string;
  priority: 'required' | 'recommended' | 'enhancement';
  dataAvailable: boolean;
  reason: string;
  missingData?: string[];
}

/**
 * Progressive enhancement upgrade options
 */
export interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  trigger: string;
  value: string;
  pitch: string;
  features: string[];
  icon?: string;
}

/**
 * Generated content for a section
 */
export interface GeneratedContent {
  headline: string;
  subheadline?: string;
  description?: string;
  bulletPoints?: string[];
  cta?: {
    primary: string;
    secondary?: string;
  };
  seoKeywords?: string[];
  tone?: 'professional' | 'friendly' | 'urgent' | 'luxurious';
}

/**
 * Complete site generation context
 */
export interface SiteGenerationContext {
  businessData: BusinessIntelligenceData;
  dataScore: DataScore;
  industry: IndustryIntelligence;
  userAnswers: Record<string, any>;
  selectedTemplate?: string;
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

/**
 * Analytics event for tracking
 */
export interface IntelligenceEvent {
  type: 'question_answered' | 'section_generated' | 'site_published' | 'upgrade_shown';
  timestamp: Date;
  data: {
    questionId?: string;
    sectionType?: string;
    dataScore?: number;
    industry?: string;
    upgradeId?: string;
  };
}

/**
 * Popular times data structure
 */
export interface PopularTimes {
  dayOfWeek: number;
  hours: Array<{
    hour: number;
    popularity: number;
  }>;
}

/**
 * Local search result
 */
export interface LocalResult {
  position: number;
  title: string;
  rating?: number;
  reviews?: number;
  type?: string;
  address?: string;
  phone?: string;
}

/**
 * Organic search result
 */
export interface OrganicResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

/**
 * Service areas configuration
 */
export interface ServiceAreaConfig {
  primary: string[];
  secondary?: string[];
  radius?: number;
  unit?: 'miles' | 'kilometers';
}