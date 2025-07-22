/**
 * Enhanced Template Variant Selector
 * 
 * Selects optimal templates using insights from ALL data sources:
 * - Google Business Profile
 * - Places API
 * - DataForSEO SERP (competitor analysis, market position)
 * - User answers
 */

import { MultiSourceData, DataInsights, multiSourceEvaluator } from './multi-source-data-evaluator';
import { IndustryType } from '@/types/site-builder';
import { findBestVariant, SectionVariant } from '@/lib/template-engine/section-variants';
import { logger } from '@/lib/logger';

export interface EnhancedTemplateSelection {
  selectedTemplate: string;
  sectionVariants: Record<string, string>;
  sectionOrder: string[];
  reasoning: {
    template: string;
    sections: Record<string, string>;
  };
  dataInsights: DataInsights;
  competitiveStrategy: {
    positioning: string;
    emphasis: string[];
    differentiators: string[];
  };
}

export class EnhancedTemplateVariantSelector {
  /**
   * Select optimal template using multi-source insights
   */
  async selectOptimalTemplate(
    multiSourceData: MultiSourceData,
    industry: IndustryType
  ): Promise<EnhancedTemplateSelection> {
    // Step 1: Analyze all data sources
    const dataInsights = multiSourceEvaluator.evaluateAllSources(multiSourceData);
    
    logger.info('Multi-source data analysis', {
      quality: dataInsights.sourceQuality,
      confirmedServices: dataInsights.confirmed.services.length,
      photos: dataInsights.confirmed.photos.length,
      reviews: dataInsights.confirmed.reviews.count,
      competitors: dataInsights.confirmed.competitors.length,
    });

    // Step 2: Determine competitive strategy based on SERP data
    const competitiveStrategy = this.determineCompetitiveStrategy(
      dataInsights,
      industry,
      multiSourceData.serp
    );
    
    // Step 3: Determine business personality from all sources
    const personality = this.determinePersonalityFromAllSources(
      dataInsights,
      multiSourceData.userAnswers
    );
    
    // Step 4: Select base template
    const selectedTemplate = this.selectBaseTemplate(
      industry,
      personality,
      dataInsights,
      competitiveStrategy
    );
    
    // Step 5: Select section variants based on all insights
    const sectionVariants = this.selectSectionVariants(
      dataInsights,
      personality,
      industry,
      competitiveStrategy
    );
    
    // Step 6: Determine optimal section order
    const sectionOrder = this.determineSectionOrder(
      sectionVariants,
      personality,
      competitiveStrategy,
      dataInsights
    );
    
    // Step 7: Generate reasoning
    const reasoning = this.generateReasoning(
      selectedTemplate,
      sectionVariants,
      dataInsights,
      competitiveStrategy
    );

    return {
      selectedTemplate,
      sectionVariants,
      sectionOrder,
      reasoning,
      dataInsights,
      competitiveStrategy,
    };
  }

  /**
   * Determine competitive strategy from SERP analysis
   */
  private determineCompetitiveStrategy(
    insights: DataInsights,
    industry: string,
    serpData: any
  ): any {
    // Analyze competitor landscape
    const topCompetitors = insights.confirmed.competitors.slice(0, 5);
    const marketPosition = insights.confirmed.marketPosition;
    
    // Determine positioning strategy
    let positioning = 'balanced';
    let emphasis: string[] = [];
    let differentiators: string[] = [];
    
    // If competitors emphasize price, we might emphasize quality
    if (this.competitorsEmphasizePrice(serpData)) {
      if (insights.confirmed.certifications.length > 2) {
        positioning = 'premium-quality';
        emphasis = ['certifications', 'experience', 'guarantees'];
      } else {
        positioning = 'value-focused';
        emphasis = ['fair-pricing', 'quality-service', 'local-trust'];
      }
    }
    
    // If market is saturated, emphasize specialization
    if (topCompetitors.length > 10) {
      positioning = 'specialist';
      emphasis.push('unique-services', 'expertise');
      
      // Find underserved niches from SERP
      const underservedNiches = this.findUnderservedNiches(serpData, insights);
      differentiators.push(...underservedNiches);
    }
    
    // If few reviews compared to competitors, emphasize other trust signals
    if (this.isLowReviewCount(insights, serpData)) {
      emphasis.push('credentials', 'portfolio', 'guarantees');
    }
    
    // Local market insights
    if (serpData?.localInsights) {
      if (serpData.localInsights.seasonalTrends) {
        emphasis.push('seasonal-readiness');
      }
      if (serpData.localInsights.emergencyDemand) {
        emphasis.push('emergency-availability');
      }
    }
    
    return {
      positioning,
      emphasis,
      differentiators: [
        ...insights.confirmed.certifications,
        ...insights.confirmed.attributes.filter(attr => this.isDifferentiator(attr)),
        ...differentiators,
      ],
    };
  }

  /**
   * Determine personality from all data sources
   */
  private determinePersonalityFromAllSources(
    insights: DataInsights,
    userAnswers: any
  ): string {
    // User preference takes precedence
    if (userAnswers?.brandPersonality) {
      return userAnswers.brandPersonality;
    }
    
    // Analyze description and reviews for personality indicators
    const description = insights.confirmed.description || '';
    const reviewHighlights = insights.confirmed.reviews.highlights || [];
    
    // Premium indicators
    if (this.hasPremiumIndicators(description, reviewHighlights, insights)) {
      return 'premium';
    }
    
    // Urgent/Emergency indicators
    if (this.hasUrgencyIndicators(description, insights)) {
      return 'urgent';
    }
    
    // Traditional/Established indicators
    if (insights.confirmed.yearsInBusiness && insights.confirmed.yearsInBusiness > 20) {
      return 'traditional';
    }
    
    // Family/Personal indicators
    if (description.match(/family.owned|locally.owned/i)) {
      return 'personal';
    }
    
    return 'professional'; // Default
  }

  /**
   * Select base template considering all factors
   */
  private selectBaseTemplate(
    industry: IndustryType,
    personality: string,
    insights: DataInsights,
    strategy: any
  ): string {
    // For premium positioning with rich media
    if (strategy.positioning === 'premium-quality' && 
        insights.confirmed.photos.length >= 10) {
      if (industry === 'landscaping') return 'emerald-elegance';
      if (industry === 'cleaning') return 'serene-minimal';
      return 'nature-premium';
    }
    
    // For specialist positioning
    if (strategy.positioning === 'specialist') {
      return 'modern-tech'; // Clean, focused design
    }
    
    // For urgent/emergency services
    if (personality === 'urgent') {
      return 'momentum-bold'; // High-contrast, action-oriented
    }
    
    // Industry-specific defaults with photo consideration
    if (industry === 'landscaping') {
      if (insights.confirmed.photos.length >= 8) return 'dream-garden';
      return 'emerald-elegance';
    }
    
    // Data quality based selection
    if (insights.sourceQuality.overall === 'minimal') {
      return 'classic-business'; // Works well with limited data
    }
    
    return 'nature-premium'; // Versatile default
  }

  /**
   * Select section variants based on all insights
   */
  private selectSectionVariants(
    insights: DataInsights,
    personality: string,
    industry: string,
    strategy: any
  ): Record<string, string> {
    const variants: Record<string, string> = {};
    
    // Hero variant based on competitive strategy
    variants.hero = this.selectHeroVariant(insights, personality, strategy);
    
    // Services - emphasize if that's our competitive advantage
    if (strategy.emphasis.includes('unique-services')) {
      variants.services = insights.confirmed.services.length > 6 ? 
        'services-tabs' : 'services-featured';
    } else {
      variants.services = this.selectServicesVariant(insights, personality);
    }
    
    // About - emphasize credentials if low reviews
    if (strategy.emphasis.includes('credentials')) {
      variants.about = 'about-team'; // Shows certifications
    } else {
      variants.about = this.selectAboutVariant(insights, personality);
    }
    
    // Gallery - critical if emphasizing portfolio
    if (insights.confirmed.photos.length >= 6) {
      variants.gallery = strategy.emphasis.includes('portfolio') ?
        'gallery-masonry' : this.selectGalleryVariant(insights);
    }
    
    // Testimonials - even with few reviews, show them well
    if (insights.confirmed.reviews.count >= 1) {
      variants.testimonials = this.selectTestimonialsVariant(
        insights.confirmed.reviews.count,
        strategy
      );
    }
    
    // Trust/Features section if emphasizing credentials
    if (strategy.emphasis.includes('credentials') || 
        insights.confirmed.certifications.length >= 2) {
      variants.trust = 'trust-grid';
    }
    
    // FAQ - important for SEO and addressing concerns
    variants.faq = 'faq-accordion';
    
    // Service areas if local focus
    if (insights.confirmed.serviceArea.length > 0) {
      variants.serviceAreas = 'areas-map';
    }
    
    // CTA based on personality and strategy
    variants.cta = this.selectCTAVariant(personality, strategy);
    
    // Contact
    variants.contact = this.selectContactVariant(personality, industry);
    
    return variants;
  }

  /**
   * Hero variant selection with competitive insights
   */
  private selectHeroVariant(
    insights: DataInsights,
    personality: string,
    strategy: any
  ): string {
    // Emergency services always get urgent variant
    if (personality === 'urgent') return 'hero-urgent';
    
    // Premium positioning with good photos
    if (strategy.positioning === 'premium-quality' && 
        insights.confirmed.photos.length >= 5) {
      return 'hero-elegant';
    }
    
    // Specialist positioning needs clear messaging
    if (strategy.positioning === 'specialist') {
      return 'hero-modern'; // Clean, focused messaging
    }
    
    // Rich content businesses
    if (insights.sourceQuality.overall === 'rich') {
      return 'hero-detailed';
    }
    
    // Traditional businesses
    if (personality === 'traditional') return 'hero-classic';
    
    return 'hero-modern';
  }

  /**
   * Determine section order based on competitive strategy
   */
  private determineSectionOrder(
    variants: Record<string, string>,
    personality: string,
    strategy: any,
    insights: DataInsights
  ): string[] {
    const sections = Object.keys(variants);
    const order: string[] = ['hero']; // Always start with hero
    
    // Strategy-based ordering
    if (strategy.positioning === 'specialist') {
      // Services first to show expertise
      order.push('services');
      if (sections.includes('trust')) order.push('trust');
      order.push('about');
    } else if (strategy.emphasis.includes('emergency-availability')) {
      // Quick contact for emergency
      order.push('services', 'contact', 'cta');
    } else if (strategy.emphasis.includes('portfolio')) {
      // Visual proof early
      order.push('gallery', 'services', 'about');
    } else {
      // Standard conversion-optimized order
      order.push('services');
      if (sections.includes('trust')) order.push('trust');
      order.push('about');
    }
    
    // Add remaining sections in optimal order
    const remaining = [
      'gallery',
      'testimonials',
      'serviceAreas',
      'faq',
      'cta',
      'contact'
    ];
    
    remaining.forEach(section => {
      if (sections.includes(section) && !order.includes(section)) {
        order.push(section);
      }
    });
    
    return order;
  }

  /**
   * Helper methods for analysis
   */
  private competitorsEmphasizePrice(serpData: any): boolean {
    if (!serpData?.competitors) return false;
    
    const priceKeywords = ['cheap', 'affordable', 'lowest price', 'budget'];
    const competitorContent = serpData.competitors
      .map((c: any) => c.snippet || '')
      .join(' ')
      .toLowerCase();
    
    return priceKeywords.some(keyword => competitorContent.includes(keyword));
  }

  private findUnderservedNiches(serpData: any, insights: DataInsights): string[] {
    const niches: string[] = [];
    
    // Analyze what competitors aren't offering
    if (serpData?.competitorServices) {
      const commonServices = new Set(serpData.competitorServices);
      const ourUniqueServices = insights.confirmed.services.filter(
        service => !commonServices.has(service)
      );
      niches.push(...ourUniqueServices);
    }
    
    // Check for underserved keywords
    if (serpData?.keywordGaps) {
      niches.push(...serpData.keywordGaps.slice(0, 3));
    }
    
    return niches;
  }

  private isLowReviewCount(insights: DataInsights, serpData: any): boolean {
    const ourReviews = insights.confirmed.reviews.count;
    const avgCompetitorReviews = serpData?.avgCompetitorReviews || 50;
    
    return ourReviews < avgCompetitorReviews * 0.5;
  }

  private hasPremiumIndicators(
    description: string,
    reviewHighlights: string[],
    insights: DataInsights
  ): boolean {
    const premiumKeywords = [
      'luxury', 'premium', 'high-end', 'exclusive',
      'award-winning', 'best', 'finest'
    ];
    
    const textToCheck = [
      description,
      ...reviewHighlights,
      ...insights.confirmed.certifications,
    ].join(' ').toLowerCase();
    
    return premiumKeywords.some(keyword => textToCheck.includes(keyword));
  }

  private hasUrgencyIndicators(description: string, insights: DataInsights): boolean {
    const urgencyKeywords = ['24/7', 'emergency', 'same day', 'immediate'];
    const textToCheck = [
      description,
      ...insights.confirmed.attributes,
    ].join(' ').toLowerCase();
    
    return urgencyKeywords.some(keyword => textToCheck.includes(keyword));
  }

  private isDifferentiator(attribute: string): boolean {
    const differentiators = [
      'woman-owned', 'veteran-owned', 'family-owned',
      'eco-friendly', 'green certified', 'organic'
    ];
    
    return differentiators.some(diff => 
      attribute.toLowerCase().includes(diff)
    );
  }

  private selectServicesVariant(insights: DataInsights, personality: string): string {
    const serviceCount = insights.confirmed.services.length;
    
    if (serviceCount >= 8) return 'services-tabs';
    if (serviceCount <= 3) return 'services-featured';
    if (personality === 'premium') return 'services-elegant';
    return 'services-grid';
  }

  private selectAboutVariant(insights: DataInsights, personality: string): string {
    if (insights.confirmed.certifications.length >= 2) return 'about-team';
    if (insights.confirmed.yearsInBusiness && insights.confirmed.yearsInBusiness > 10) {
      return 'about-story';
    }
    return 'about-values';
  }

  private selectGalleryVariant(insights: DataInsights): string {
    const photoCount = insights.confirmed.photos.length;
    
    if (photoCount >= 15) return 'gallery-masonry';
    if (photoCount >= 8) return 'gallery-grid';
    return 'gallery-carousel';
  }

  private selectTestimonialsVariant(reviewCount: number, strategy: any): string {
    // Even with few reviews, display them prominently
    if (reviewCount === 1) return 'testimonials-featured';
    if (reviewCount <= 5) return 'testimonials-carousel';
    if (strategy.emphasis.includes('social-proof')) {
      return 'testimonials-grid'; // Show many at once
    }
    return 'testimonials-carousel';
  }

  private selectCTAVariant(personality: string, strategy: any): string {
    if (personality === 'urgent') return 'cta-urgent';
    if (strategy.positioning === 'specialist') return 'cta-split';
    return 'cta-centered';
  }

  private selectContactVariant(personality: string, industry: string): string {
    if (personality === 'urgent') return 'contact-emergency';
    if (['landscaping', 'cleaning'].includes(industry)) return 'contact-map';
    return 'contact-split';
  }

  private generateReasoning(
    template: string,
    variants: Record<string, string>,
    insights: DataInsights,
    strategy: any
  ): any {
    return {
      template: `Selected ${template} based on ${strategy.positioning} positioning and ${insights.sourceQuality.overall} data quality`,
      sections: Object.entries(variants).reduce((acc, [section, variant]) => {
        acc[section] = this.getVariantReasoning(section, variant, insights, strategy);
        return acc;
      }, {} as Record<string, string>),
    };
  }

  private getVariantReasoning(
    section: string,
    variant: string,
    insights: DataInsights,
    strategy: any
  ): string {
    // Provide specific reasoning based on data
    const reasoningMap: Record<string, string> = {
      'hero-elegant': `Premium hero with ${insights.confirmed.photos.length} photos for ${strategy.positioning} positioning`,
      'services-tabs': `Tabbed layout for ${insights.confirmed.services.length} services with categorization`,
      'gallery-masonry': `Masonry layout to showcase ${insights.confirmed.photos.length} portfolio images`,
      'testimonials-featured': `Featured layout to maximize impact of ${insights.confirmed.reviews.count} reviews`,
      // Add more specific reasoning...
    };
    
    return reasoningMap[variant] || 
      `${variant} selected based on ${insights.sourceQuality.overall} data and ${strategy.positioning} strategy`;
  }
}

export const enhancedTemplateSelector = new EnhancedTemplateVariantSelector();
