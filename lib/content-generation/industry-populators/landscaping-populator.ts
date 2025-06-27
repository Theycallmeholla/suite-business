/**
 * Content Populator for Landscaping Industry
 * 
 * Populates selected template variants with:
 * 1. Actual business data (when available)
 * 2. Industry-specific fallback content (when data is missing)
 * 3. SEO-optimized keywords and phrases
 */

import { BusinessIntelligenceData } from '@/types/intelligence';
import { QuestionAnswers } from '@/lib/template-engine/dynamic-layout-generator';

interface PopulatedSection {
  variant: string;
  content: any;
  metadata: {
    dataSource: 'business' | 'industry' | 'generated';
    seoKeywords: string[];
  };
}

export class LandscapingContentPopulator {
  // Industry-specific content library
  private readonly industryContent = {
    headlines: {
      professional: [
        'Transform Your Outdoor Space',
        'Professional Landscaping Services in {city}',
        'Your Local Landscaping Experts',
      ],
      premium: [
        'Elevate Your Property\'s Natural Beauty',
        'Award-Winning Landscape Design',
        'Luxury Outdoor Living Starts Here',
      ],
      urgent: [
        'Fast, Reliable Landscaping Services',
        'Same-Week Service Available',
        'Emergency Storm Cleanup',
      ],
    },
    
    services: {
      'Lawn Care & Maintenance': {
        description: 'Keep your lawn looking its best year-round with our comprehensive maintenance services including mowing, edging, fertilization, and weed control.',
        features: ['Weekly/Bi-weekly mowing', 'Professional edging', 'Fertilization programs', 'Weed control'],
        keywords: ['lawn care', 'grass cutting', 'lawn maintenance', 'mowing service'],
      },
      'Landscape Design & Installation': {
        description: 'Transform your outdoor space with professional landscape design. From concept to installation, we create beautiful, functional landscapes.',
        features: ['Custom design plans', 'Plant selection', 'Professional installation', '3D design visualization'],
        keywords: ['landscape design', 'landscaping', 'garden design', 'yard transformation'],
      },
      'Hardscaping': {
        description: 'Enhance your outdoor living with beautiful hardscape features including patios, walkways, retaining walls, and outdoor kitchens.',
        features: ['Paver patios', 'Stone walkways', 'Retaining walls', 'Fire features'],
        keywords: ['hardscaping', 'patio installation', 'pavers', 'outdoor living'],
      },
      'Irrigation & Drainage': {
        description: 'Protect your landscape investment with efficient irrigation systems and proper drainage solutions.',
        features: ['Sprinkler installation', 'Smart irrigation', 'French drains', 'Drainage solutions'],
        keywords: ['irrigation', 'sprinkler system', 'drainage', 'water management'],
      },
      'Tree & Shrub Care': {
        description: 'Professional care for all your trees and shrubs including pruning, trimming, disease treatment, and removal.',
        features: ['Expert pruning', 'Disease diagnosis', 'Fertilization', 'Safe removal'],
        keywords: ['tree service', 'tree trimming', 'shrub care', 'arborist'],
      },
      'Seasonal Services': {
        description: 'Year-round property care including spring/fall cleanups, mulching, leaf removal, and snow removal.',
        features: ['Spring cleanup', 'Fall cleanup', 'Mulch installation', 'Leaf removal'],
        keywords: ['seasonal cleanup', 'spring cleanup', 'fall cleanup', 'mulching'],
      },
    },
    
    trustSignals: [
      'Licensed & Insured',
      'Free Estimates',
      '{years} Years Experience',
      'Locally Owned & Operated',
      'Satisfaction Guaranteed',
      'BBB Accredited',
      'Same-Day Quotes',
      'No Contracts Required',
    ],
    
    ctaButtons: {
      primary: ['Get Free Estimate', 'Request Quote', 'Schedule Consultation'],
      secondary: ['View Our Work', 'See Pricing', 'Call Now'],
      urgent: ['Call Now - {phone}', 'Emergency Service', 'Get Immediate Help'],
    },
  };

  /**
   * Populate all sections with content
   */
  populateAllSections(
    selectedVariants: Record<string, string>,
    businessData: BusinessIntelligenceData,
    userAnswers: QuestionAnswers,
    dataQuality: any
  ): Record<string, PopulatedSection> {
    const populatedSections: Record<string, PopulatedSection> = {};
    
    Object.entries(selectedVariants).forEach(([sectionType, variant]) => {
      populatedSections[sectionType] = this.populateSection(
        sectionType,
        variant,
        businessData,
        userAnswers,
        dataQuality
      );
    });
    
    return populatedSections;
  }

  /**
   * Populate a specific section based on its type and variant
   */
  private populateSection(
    sectionType: string,
    variant: string,
    businessData: BusinessIntelligenceData,
    userAnswers: QuestionAnswers,
    dataQuality: any
  ): PopulatedSection {
    switch (sectionType) {
      case 'hero':
        return this.populateHeroSection(variant, businessData, userAnswers);
      case 'services':
        return this.populateServicesSection(variant, businessData, userAnswers);
      case 'about':
        return this.populateAboutSection(variant, businessData, userAnswers);
      case 'gallery':
        return this.populateGallerySection(variant, businessData);
      case 'testimonials':
        return this.populateTestimonialsSection(variant, businessData);
      case 'cta':
        return this.populateCTASection(variant, businessData, userAnswers);
      case 'contact':
        return this.populateContactSection(variant, businessData);
      default:
        return this.populateGenericSection(sectionType, variant, businessData);
    }
  }

  /**
   * Populate Hero Section
   */
  private populateHeroSection(
    variant: string,
    businessData: BusinessIntelligenceData,
    userAnswers: QuestionAnswers
  ): PopulatedSection {
    const personality = userAnswers.brandPersonality || 'professional';
    const city = businessData.basicInfo?.city || 'your area';
    
    // Select appropriate headline
    let headline = businessData.content?.tagline;
    if (!headline) {
      const headlines = this.industryContent.headlines[personality] || 
                       this.industryContent.headlines.professional;
      headline = headlines[0].replace('{city}', city);
    }
    
    // Create subheadline
    let subheadline = businessData.basicInfo?.description;
    if (!subheadline || subheadline.length < 50) {
      subheadline = this.generateSubheadline(businessData, userAnswers);
    }
    
    // Select CTA
    const ctaType = userAnswers.emergencyService ? 'urgent' : 'primary';
    const ctaOptions = this.industryContent.ctaButtons[ctaType];
    const primaryCTA = {
      text: ctaOptions[0].replace('{phone}', businessData.basicInfo?.primary_phone || ''),
      action: businessData.basicInfo?.primary_phone ? 'phone' : 'quote-form',
      style: 'primary',
    };
    
    // Select image
    const backgroundImage = this.selectHeroImage(businessData, variant);
    
    return {
      variant,
      content: {
        headline,
        subheadline,
        primaryCTA,
        secondaryCTA: {
          text: 'View Our Work',
          action: 'scroll-to-gallery',
          style: 'secondary',
        },
        backgroundImage,
        overlay: variant === 'hero-elegant' ? 'gradient' : 'dark',
        trustBadges: this.selectTrustBadges(businessData, 3),
      },
      metadata: {
        dataSource: headline === businessData.content?.tagline ? 'business' : 'industry',
        seoKeywords: ['landscaping', city, 'lawn care', 'landscape design'],
      },
    };
  }

  /**
   * Populate Services Section
   */
  private populateServicesSection(
    variant: string,
    businessData: BusinessIntelligenceData,
    userAnswers: QuestionAnswers
  ): PopulatedSection {
    // Get actual services or use industry defaults
    const businessServices = businessData.services?.services || [];
    const services = businessServices.length > 0 ? 
      this.enrichBusinessServices(businessServices, businessData) :
      this.getDefaultServices(userAnswers);
    
    return {
      variant,
      content: {
        headline: 'Our Professional Services',
        subheadline: `Comprehensive landscaping solutions for ${businessData.basicInfo?.city || 'your area'}`,
        services: services.slice(0, variant === 'services-featured' ? 3 : 9),
        layout: variant === 'services-grid' ? 'grid' : 'cards',
        showPricing: businessData.services?.pricing_type !== 'hidden',
      },
      metadata: {
        dataSource: businessServices.length > 0 ? 'business' : 'industry',
        seoKeywords: services.flatMap(s => s.keywords),
      },
    };
  }

  /**
   * Helper: Generate subheadline from available data
   */
  private generateSubheadline(
    businessData: BusinessIntelligenceData,
    userAnswers: QuestionAnswers
  ): string {
    const elements = [];
    
    // Years in business
    if (businessData.basicInfo?.years_in_business) {
      elements.push(`${businessData.basicInfo.years_in_business} years of experience`);
    }
    
    // Service area
    if (businessData.basicInfo?.service_area) {
      elements.push(`serving ${businessData.basicInfo.service_area}`);
    }
    
    // Differentiators
    if (userAnswers.differentiators?.length) {
      elements.push(userAnswers.differentiators[0].toLowerCase());
    }
    
    // Default if nothing available
    if (elements.length === 0) {
      return 'Professional landscaping services you can trust. Licensed, insured, and dedicated to transforming your outdoor space.';
    }
    
    return `Professional landscaping ${elements.join(', ')}. Transform your outdoor space with our expert team.`;
  }

  /**
   * Helper: Enrich business services with industry data
   */
  private enrichBusinessServices(
    businessServices: string[],
    businessData: BusinessIntelligenceData
  ): any[] {
    return businessServices.map(serviceName => {
      const industryData = this.findMatchingIndustryService(serviceName);
      const businessDetails = businessData.services?.service_details?.[serviceName];
      
      return {
        name: serviceName,
        description: businessDetails?.description || industryData?.description || 
                    `Professional ${serviceName.toLowerCase()} services`,
        features: businessDetails?.features || industryData?.features || [],
        icon: this.getServiceIcon(serviceName),
        keywords: industryData?.keywords || [serviceName.toLowerCase()],
        image: this.findServiceImage(serviceName, businessData),
      };
    });
  }

  /**
   * Helper: Find matching industry service data
   */
  private findMatchingIndustryService(serviceName: string): any {
    const normalizedName = serviceName.toLowerCase();
    
    // Try exact match first
    for (const [key, data] of Object.entries(this.industryContent.services)) {
      if (key.toLowerCase() === normalizedName) return data;
    }
    
    // Try partial match
    for (const [key, data] of Object.entries(this.industryContent.services)) {
      if (normalizedName.includes(key.toLowerCase()) || 
          key.toLowerCase().includes(normalizedName)) {
        return data;
      }
    }
    
    return null;
  }

  /**
   * Helper: Get default services based on user answers
   */
  private getDefaultServices(userAnswers: QuestionAnswers): any[] {
    const defaults = [
      'Lawn Care & Maintenance',
      'Landscape Design & Installation',
      'Hardscaping',
    ];
    
    // Add seasonal if mentioned
    if (userAnswers.services?.some(s => s.toLowerCase().includes('seasonal'))) {
      defaults.push('Seasonal Services');
    }
    
    // Add irrigation if mentioned
    if (userAnswers.services?.some(s => s.toLowerCase().includes('irrigation'))) {
      defaults.push('Irrigation & Drainage');
    }
    
    return defaults.map(serviceName => ({
      name: serviceName,
      ...this.industryContent.services[serviceName],
      icon: this.getServiceIcon(serviceName),
    }));
  }

  /**
   * Helper: Select appropriate images
   */
  private selectHeroImage(businessData: BusinessIntelligenceData, variant: string): string {
    // Use business photos if available
    if (businessData.visuals?.photos?.length) {
      // For elegant variant, prefer wide landscape shots
      if (variant === 'hero-elegant') {
        return businessData.visuals.photos.find(p => 
          p.width > p.height && p.width > 1200
        )?.url || businessData.visuals.photos[0].url;
      }
      
      return businessData.visuals.photos[0].url;
    }
    
    // Use stock photo based on variant
    return `/images/landscaping/hero-${variant}.jpg`;
  }

  /**
   * Helper: Get service icon
   */
  private getServiceIcon(serviceName: string): string {
    const iconMap: Record<string, string> = {
      'lawn': 'grass',
      'design': 'palette',
      'hardscap': 'layers',
      'irrigation': 'droplets',
      'tree': 'tree-pine',
      'seasonal': 'calendar',
    };
    
    const normalized = serviceName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (normalized.includes(key)) return icon;
    }
    
    return 'shovel'; // Default landscaping icon
  }

  /**
   * Helper: Select trust badges
   */
  private selectTrustBadges(businessData: BusinessIntelligenceData, count: number): string[] {
    const badges = [];
    
    // Add actual certifications first
    if (businessData.differentiation?.certifications?.length) {
      badges.push(...businessData.differentiation.certifications.slice(0, 2));
    }
    
    // Add years if available
    if (businessData.basicInfo?.years_in_business) {
      badges.push(`${businessData.basicInfo.years_in_business} Years Experience`);
    }
    
    // Fill with industry defaults
    const defaults = this.industryContent.trustSignals.filter(signal => 
      !signal.includes('{years}')
    );
    
    while (badges.length < count && defaults.length > badges.length) {
      badges.push(defaults[badges.length]);
    }
    
    return badges.slice(0, count);
  }

  // Additional section populators would follow the same pattern...
  private populateAboutSection(variant: string, businessData: BusinessIntelligenceData, userAnswers: QuestionAnswers): PopulatedSection {
    // Implementation...
    return {} as PopulatedSection;
  }

  private populateGallerySection(variant: string, businessData: BusinessIntelligenceData): PopulatedSection {
    // Implementation...
    return {} as PopulatedSection;
  }

  private populateTestimonialsSection(variant: string, businessData: BusinessIntelligenceData): PopulatedSection {
    // Implementation...
    return {} as PopulatedSection;
  }

  private populateCTASection(variant: string, businessData: BusinessIntelligenceData, userAnswers: QuestionAnswers): PopulatedSection {
    // Implementation...
    return {} as PopulatedSection;
  }

  private populateContactSection(variant: string, businessData: BusinessIntelligenceData): PopulatedSection {
    // Implementation...
    return {} as PopulatedSection;
  }

  private populateGenericSection(sectionType: string, variant: string, businessData: BusinessIntelligenceData): PopulatedSection {
    // Implementation...
    return {} as PopulatedSection;
  }

  private findServiceImage(serviceName: string, businessData: BusinessIntelligenceData): string | undefined {
    // Try to find relevant image from business photos
    // Implementation...
    return undefined;
  }
}

export const landscapingPopulator = new LandscapingContentPopulator();
