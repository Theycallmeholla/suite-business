/**
 * Enhanced Content Populator for Landscaping
 * 
 * Intelligently populates templates using:
 * - Google Business Profile data
 * - Places API insights
 * - DataForSEO SERP competitive analysis
 * - User-provided context and confirmations
 */

import { DataInsights } from '../multi-source-data-evaluator';
import { EnhancedTemplateSelection } from '../enhanced-template-selector';

interface PopulatedSection {
  variant: string;
  content: any;
  metadata: {
    dataSource: string[]; // Multiple sources
    seoKeywords: string[];
    competitiveAdvantage?: string;
  };
}

export class EnhancedLandscapingPopulator {
  /**
   * Populate all sections with multi-source data
   */
  populateAllSections(
    selection: EnhancedTemplateSelection,
    insights: DataInsights,
    serpData: any,
    userAnswers: any
  ): Record<string, PopulatedSection> {
    const sections: Record<string, PopulatedSection> = {};
    
    Object.entries(selection.sectionVariants).forEach(([sectionType, variant]) => {
      sections[sectionType] = this.populateSection(
        sectionType,
        variant,
        insights,
        serpData,
        userAnswers,
        selection.competitiveStrategy
      );
    });
    
    return sections;
  }

  /**
   * Populate specific section with rich data
   */
  private populateSection(
    sectionType: string,
    variant: string,
    insights: DataInsights,
    serpData: any,
    userAnswers: any,
    strategy: any
  ): PopulatedSection {
    switch (sectionType) {
      case 'hero':
        return this.populateHeroSection(variant, insights, serpData, userAnswers, strategy);
      case 'services':
        return this.populateServicesSection(variant, insights, serpData, userAnswers);
      case 'about':
        return this.populateAboutSection(variant, insights, userAnswers);
      case 'gallery':
        return this.populateGallerySection(variant, insights, userAnswers);
      case 'testimonials':
        return this.populateTestimonialsSection(variant, insights);
      case 'trust':
        return this.populateTrustSection(variant, insights, userAnswers);
      case 'faq':
        return this.populateFAQSection(variant, insights, serpData);
      case 'serviceAreas':
        return this.populateServiceAreasSection(variant, insights);
      case 'cta':
        return this.populateCTASection(variant, insights, strategy);
      case 'contact':
        return this.populateContactSection(variant, insights);
      default:
        return this.populateGenericSection(sectionType, variant, insights);
    }
  }

  /**
   * Populate Hero with competitive positioning
   */
  private populateHeroSection(
    variant: string,
    insights: DataInsights,
    serpData: any,
    userAnswers: any,
    strategy: any
  ): PopulatedSection {
    const businessName = insights.confirmed.businessName;
    const city = this.extractCity(insights);
    
    // Create headline based on competitive strategy
    let headline = insights.confirmed.description?.match(/^[^.!?]+/)?.[0];
    if (!headline) {
      headline = this.generateStrategicHeadline(strategy, businessName, city);
    }
    
    // Subheadline that addresses market gaps
    const subheadline = this.generateCompetitiveSubheadline(
      insights,
      serpData,
      strategy,
      userAnswers
    );
    
    // CTA based on what competitors aren't offering
    const primaryCTA = this.generateStrategicCTA(insights, serpData, strategy);
    
    // Select best hero image with context
    const heroImage = this.selectHeroImage(insights, userAnswers);
    
    // Trust signals that differentiate
    const trustSignals = this.selectCompetitiveTrustSignals(
      insights,
      serpData,
      userAnswers
    );
    
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
        backgroundImage: heroImage.url,
        imageAlt: heroImage.alt,
        overlay: variant === 'hero-elegant' ? 'gradient' : 'dark',
        trustSignals,
        phoneNumber: insights.confirmed.primaryPhone,
        emergencyBadge: strategy.emphasis.includes('emergency-availability'),
      },
      metadata: {
        dataSource: ['gbp', 'serp', 'user'],
        seoKeywords: this.extractHeroKeywords(insights, serpData),
        competitiveAdvantage: strategy.positioning,
      },
    };
  }

  /**
   * Populate Services with competitive insights
   */
  private populateServicesSection(
    variant: string,
    insights: DataInsights,
    serpData: any,
    userAnswers: any
  ): PopulatedSection {
    // Combine confirmed services from all sources
    const allServices = this.consolidateServices(insights, userAnswers);
    
    // Prioritize services based on market demand
    const prioritizedServices = this.prioritizeServicesByDemand(
      allServices,
      serpData,
      insights
    );
    
    // Enrich with competitive advantages
    const enrichedServices = prioritizedServices.map(service => 
      this.enrichServiceWithCompetitiveData(service, insights, serpData, userAnswers)
    );
    
    return {
      variant,
      content: {
        headline: this.generateServicesHeadline(insights, serpData),
        subheadline: this.generateServicesSubheadline(insights, enrichedServices),
        services: enrichedServices.slice(0, variant === 'services-featured' ? 3 : 9),
        layout: variant === 'services-grid' ? 'grid' : 'cards',
        showPricing: this.shouldShowPricing(insights, serpData),
        ctaText: 'Get Free Quote',
      },
      metadata: {
        dataSource: ['gbp', 'places', 'serp', 'user'],
        seoKeywords: enrichedServices.flatMap(s => s.keywords),
        competitiveAdvantage: 'comprehensive-services',
      },
    };
  }

  /**
   * Populate Gallery with labeled photos
   */
  private populateGallerySection(
    variant: string,
    insights: DataInsights,
    userAnswers: any
  ): PopulatedSection {
    // Get photos with user-provided context
    const labeledPhotos = this.getLabeledPhotos(insights, userAnswers);
    
    // Organize by project type
    const organizedPhotos = this.organizePhotosByType(labeledPhotos);
    
    // Create gallery items with rich metadata
    const galleryItems = organizedPhotos.map(photo => ({
      id: photo.id,
      url: photo.url,
      thumbnail: photo.thumbnail || photo.url,
      alt: photo.alt,
      title: photo.title,
      category: photo.category,
      tags: photo.tags,
      caption: photo.caption,
      beforeAfter: photo.beforeAfter,
    }));
    
    return {
      variant,
      content: {
        headline: 'Our Work Speaks for Itself',
        subheadline: `Browse our portfolio of ${insights.confirmed.businessName} projects`,
        items: galleryItems,
        categories: this.extractPhotoCategories(galleryItems),
        layout: variant,
        showCaptions: true,
        enableFiltering: galleryItems.length > 12,
      },
      metadata: {
        dataSource: ['gbp', 'user'],
        seoKeywords: ['portfolio', 'gallery', ...organizedPhotos.flatMap(p => p.tags)],
      },
    };
  }

  /**
   * Populate Trust Section with certifications and differentiators
   */
  private populateTrustSection(
    variant: string,
    insights: DataInsights,
    userAnswers: any
  ): PopulatedSection {
    const trustElements = [
      // Confirmed certifications
      ...insights.confirmed.certifications.map(cert => ({
        type: 'certification',
        title: cert,
        icon: this.getCertificationIcon(cert),
        verified: true,
      })),
      
      // Awards from user input
      ...(userAnswers.awards || []).map((award: string) => ({
        type: 'award',
        title: award,
        icon: '🏆',
        verified: true,
      })),
      
      // Years in business
      insights.confirmed.yearsInBusiness && {
        type: 'experience',
        title: `${insights.confirmed.yearsInBusiness} Years Experience`,
        icon: '📅',
        verified: true,
      },
      
      // Review rating
      insights.confirmed.reviews.rating >= 4 && {
        type: 'rating',
        title: `${insights.confirmed.reviews.rating} Star Rating`,
        subtitle: `${insights.confirmed.reviews.count} Reviews`,
        icon: '⭐',
        verified: true,
      },
      
      // Differentiators from user
      ...(userAnswers.differentiators || []).map((diff: any) => ({
        type: 'differentiator',
        title: diff.label || diff,
        icon: diff.icon || '✓',
        verified: false,
      })),
    ].filter(Boolean);
    
    return {
      variant,
      content: {
        headline: 'Why Choose ' + insights.confirmed.businessName,
        items: trustElements,
        layout: 'grid',
        showVerifiedBadge: true,
      },
      metadata: {
        dataSource: ['gbp', 'user'],
        seoKeywords: ['certified', 'licensed', 'insured', ...insights.confirmed.certifications],
      },
    };
  }

  /**
   * Populate FAQ with SEO-optimized questions
   */
  private populateFAQSection(
    variant: string,
    insights: DataInsights,
    serpData: any
  ): PopulatedSection {
    // Get People Also Ask questions from SERP
    const paaQuestions = serpData?.peopleAlsoAsk || [];
    
    // Generate industry-specific FAQs
    const industryFAQs = this.generateIndustryFAQs(insights);
    
    // Add location-specific questions
    const localFAQs = this.generateLocalFAQs(insights);
    
    // Combine and deduplicate
    const allFAQs = this.combineFAQs(paaQuestions, industryFAQs, localFAQs);
    
    return {
      variant,
      content: {
        headline: 'Frequently Asked Questions',
        subheadline: 'Get answers to common questions about our landscaping services',
        items: allFAQs.slice(0, 10),
        layout: 'accordion',
        schema: true, // Enable FAQ schema markup
      },
      metadata: {
        dataSource: ['serp', 'generated'],
        seoKeywords: allFAQs.flatMap(faq => this.extractFAQKeywords(faq)),
      },
    };
  }

  /**
   * Helper: Generate strategic headline
   */
  private generateStrategicHeadline(strategy: any, businessName: string, city: string): string {
    const templates = {
      'premium-quality': [
        'Premium Landscaping Excellence',
        'Award-Winning Landscape Design',
        'Luxury Outdoor Living Solutions',
      ],
      'specialist': [
        `${city}'s ${strategy.differentiators[0]} Experts`,
        'Specialized Landscaping Solutions',
        'Expert {specialty} Services',
      ],
      'value-focused': [
        'Quality Landscaping at Fair Prices',
        'Professional Service, Honest Pricing',
        'Your Trusted Local Landscapers',
      ],
      'balanced': [
        'Transform Your Outdoor Space',
        'Professional Landscaping Services',
        'Beautiful Landscapes, Guaranteed',
      ],
    };
    
    const options = templates[strategy.positioning] || templates.balanced;
    return options[0].replace('{specialty}', strategy.differentiators[0] || 'Landscaping');
  }

  /**
   * Helper: Generate competitive subheadline
   */
  private generateCompetitiveSubheadline(
    insights: DataInsights,
    serpData: any,
    strategy: any,
    userAnswers: any
  ): string {
    const elements = [];
    
    // Years in business (if significant)
    if (insights.confirmed.yearsInBusiness && insights.confirmed.yearsInBusiness > 10) {
      elements.push(`${insights.confirmed.yearsInBusiness} years of trusted service`);
    }
    
    // Service area
    if (insights.confirmed.serviceArea.length > 0) {
      elements.push(`serving ${insights.confirmed.serviceArea[0]}`);
    }
    
    // Key differentiator
    if (strategy.differentiators.length > 0) {
      elements.push(strategy.differentiators[0].toLowerCase());
    }
    
    // Unique value prop from user
    if (userAnswers.uniqueValue) {
      elements.push(userAnswers.uniqueValue);
    }
    
    if (elements.length === 0) {
      return 'Professional landscaping services tailored to your needs. Licensed, insured, and committed to excellence.';
    }
    
    return `Professional landscaping ${elements.join(', ')}. Transform your property with our expert team.`;
  }

  /**
   * Helper: Consolidate services from all sources
   */
  private consolidateServices(insights: DataInsights, userAnswers: any): any[] {
    const serviceMap = new Map();
    
    // Add confirmed services from GBP
    insights.confirmed.services.forEach(service => {
      serviceMap.set(service.toLowerCase(), {
        name: service,
        source: 'gbp',
        confirmed: true,
      });
    });
    
    // Add services confirmed by user
    (userAnswers.confirmedServices || []).forEach((service: string) => {
      const key = service.toLowerCase();
      if (!serviceMap.has(key)) {
        serviceMap.set(key, {
          name: service,
          source: 'user',
          confirmed: true,
        });
      }
    });
    
    // Add specializations as sub-services
    (userAnswers.specializations || []).forEach((spec: any) => {
      const key = spec.value || spec;
      if (!serviceMap.has(key.toLowerCase())) {
        serviceMap.set(key.toLowerCase(), {
          name: spec.label || spec,
          source: 'user',
          specialty: true,
          confirmed: true,
        });
      }
    });
    
    return Array.from(serviceMap.values());
  }

  /**
   * Helper: Prioritize services by market demand
   */
  private prioritizeServicesByDemand(
    services: any[],
    serpData: any,
    insights: DataInsights
  ): any[] {
    // Score each service
    const scoredServices = services.map(service => {
      let score = 0;
      
      // Check if mentioned in reviews
      const reviewMentions = this.countServiceMentionsInReviews(
        service.name,
        insights.confirmed.reviews
      );
      score += reviewMentions * 10;
      
      // Check search demand from SERP
      if (serpData?.serviceKeywordVolume?.[service.name.toLowerCase()]) {
        score += serpData.serviceKeywordVolume[service.name.toLowerCase()];
      }
      
      // Boost specialties
      if (service.specialty) score += 20;
      
      // Boost if competitors don't offer
      if (serpData?.competitorServices && 
          !serpData.competitorServices.includes(service.name)) {
        score += 30;
      }
      
      return { ...service, score };
    });
    
    // Sort by score
    return scoredServices.sort((a, b) => b.score - a.score);
  }

  /**
   * Helper: Enrich service with competitive data
   */
  private enrichServiceWithCompetitiveData(
    service: any,
    insights: DataInsights,
    serpData: any,
    userAnswers: any
  ): any {
    const enriched = { ...service };
    
    // Add description
    enriched.description = this.getServiceDescription(service, insights, userAnswers);
    
    // Add features
    enriched.features = this.getServiceFeatures(service, insights, userAnswers);
    
    // Add keywords for SEO
    enriched.keywords = this.getServiceKeywords(service, serpData);
    
    // Add icon
    enriched.icon = this.getServiceIcon(service.name);
    
    // Add competitive advantage if unique
    if (serpData?.competitorServices && 
        !serpData.competitorServices.includes(service.name)) {
      enriched.badge = 'Exclusive Service';
    }
    
    // Add pricing if available
    if (insights.confirmed.services.includes(service.name)) {
      enriched.pricing = this.getServicePricing(service, insights);
    }
    
    return enriched;
  }

  /**
   * Helper: Get labeled photos with context
   */
  private getLabeledPhotos(insights: DataInsights, userAnswers: any): any[] {
    const photos = insights.confirmed.photos || [];
    const photoContexts = userAnswers.photoContexts || {};
    
    return photos.map((photo, index) => {
      const photoId = photo.id || `photo-${index}`;
      const context = photoContexts[photoId] || photo.context;
      
      return {
        ...photo,
        id: photoId,
        alt: this.generatePhotoAlt(context, insights.confirmed.businessName),
        title: context?.label || context || 'Our Work',
        category: this.categorizePhoto(context),
        tags: this.extractPhotoTags(context),
        caption: context?.customLabel || '',
        beforeAfter: context?.includes('Before') || context?.includes('After'),
      };
    });
  }

  /**
   * Additional helper methods...
   */
  private extractCity(insights: DataInsights): string {
    // Extract from service area or address
    const serviceArea = insights.confirmed.serviceArea[0] || '';
    const addressMatch = serviceArea.match(/([A-Za-z\s]+),?\s*[A-Z]{2}/);
    return addressMatch?.[1] || 'your area';
  }

  private selectHeroImage(insights: DataInsights, userAnswers: any): any {
    const photos = this.getLabeledPhotos(insights, userAnswers);
    
    // Prefer completed project or after photos
    const heroCandidate = photos.find(p => 
      p.category === 'completed' || p.title?.includes('After')
    ) || photos[0];
    
    return {
      url: heroCandidate?.url || '/images/default-hero.jpg',
      alt: heroCandidate?.alt || 'Professional landscaping services',
    };
  }

  private selectCompetitiveTrustSignals(
    insights: DataInsights,
    serpData: any,
    userAnswers: any
  ): string[] {
    const signals = [];
    
    // Add what competitors don't have
    if (!serpData?.commonTrustSignals?.includes('Licensed') && 
        insights.confirmed.certifications.some(c => c.includes('License'))) {
      signals.push('Fully Licensed');
    }
    
    // Add confirmed differentiators
    signals.push(...insights.confirmed.certifications.slice(0, 2));
    
    // Add user-confirmed claims
    if (userAnswers.confirmedClaims) {
      signals.push(...userAnswers.confirmedClaims.slice(0, 2));
    }
    
    // Fill with defaults if needed
    const defaults = ['Free Estimates', 'Satisfaction Guaranteed'];
    while (signals.length < 3 && defaults.length > 0) {
      signals.push(defaults.shift()!);
    }
    
    return signals.slice(0, 3);
  }

  private extractHeroKeywords(insights: DataInsights, serpData: any): string[] {
    const keywords = new Set<string>();
    
    // Industry + location
    keywords.add('landscaping');
    keywords.add(this.extractCity(insights).toLowerCase());
    
    // High-volume keywords from SERP
    if (serpData?.topKeywords) {
      serpData.topKeywords.slice(0, 3).forEach((kw: string) => keywords.add(kw));
    }
    
    // Service keywords
    insights.confirmed.services.slice(0, 2).forEach(service => 
      keywords.add(service.toLowerCase())
    );
    
    return Array.from(keywords);
  }

  private getServiceDescription(service: any, insights: DataInsights, userAnswers: any): string {
    // Check for user-provided description
    const userDesc = userAnswers.serviceDescriptions?.[service.name];
    if (userDesc) return userDesc;
    
    // Industry-specific descriptions
    const descriptions: Record<string, string> = {
      'lawn care': 'Keep your lawn healthy and beautiful with our comprehensive maintenance programs including mowing, edging, fertilization, and weed control.',
      'landscape design': 'Transform your outdoor space with custom landscape designs that complement your home and lifestyle while maximizing your property value.',
      'irrigation systems': 'Efficient irrigation solutions that keep your landscape thriving while conserving water and reducing your utility costs.',
      // Add more...
    };
    
    return descriptions[service.name.toLowerCase()] || 
      `Professional ${service.name.toLowerCase()} services by certified experts.`;
  }

  private getServiceFeatures(service: any, insights: DataInsights, userAnswers: any): string[] {
    // Get from user answers if available
    const userFeatures = userAnswers.serviceFeatures?.[service.name];
    if (userFeatures) return userFeatures;
    
    // Default features by service type
    const featureMap: Record<string, string[]> = {
      'lawn care': [
        'Weekly/Bi-weekly mowing',
        'Professional edging',
        'Fertilization programs',
        'Weed & pest control',
      ],
      'landscape design': [
        'Custom design plans',
        '3D visualization',
        'Plant selection',
        'Professional installation',
      ],
      // Add more...
    };
    
    return featureMap[service.name.toLowerCase()] || ['Professional service', 'Quality guaranteed'];
  }

  private getServiceKeywords(service: any, serpData: any): string[] {
    const keywords = [service.name.toLowerCase()];
    
    // Add related keywords from SERP
    if (serpData?.relatedKeywords?.[service.name]) {
      keywords.push(...serpData.relatedKeywords[service.name]);
    }
    
    // Add location-based variants
    const city = serpData?.location || 'local';
    keywords.push(`${service.name.toLowerCase()} ${city}`);
    
    return keywords;
  }

  private getServiceIcon(serviceName: string): string {
    const iconMap: Record<string, string> = {
      'lawn care': 'grass',
      'landscape design': 'palette',
      'hardscaping': 'layers',
      'irrigation': 'droplets',
      'tree': 'tree-pine',
      'seasonal': 'calendar',
      'lighting': 'lightbulb',
      'maintenance': 'tools',
    };
    
    const normalized = serviceName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (normalized.includes(key)) return icon;
    }
    
    return 'shovel';
  }

  private getServicePricing(service: any, insights: DataInsights): string | undefined {
    // Look for pricing in description
    const priceMatch = insights.confirmed.description?.match(/\$[\d,]+/);
    if (priceMatch && insights.confirmed.description?.includes(service.name)) {
      return priceMatch[0];
    }
    
    // Default pricing guidance
    const pricingMap: Record<string, string> = {
      'lawn care': 'Starting at $35/visit',
      'landscape design': 'Free consultation',
      'tree trimming': 'Free estimates',
    };
    
    return pricingMap[service.name.toLowerCase()];
  }

  private categorizePhoto(context: any): string {
    if (!context) return 'general';
    
    const contextStr = typeof context === 'string' ? context : context.label || '';
    
    if (contextStr.includes('Before') || contextStr.includes('After')) return 'transformation';
    if (contextStr.includes('Completed')) return 'completed';
    if (contextStr.includes('Garden')) return 'garden';
    if (contextStr.includes('Patio') || contextStr.includes('Hardscap')) return 'hardscape';
    if (contextStr.includes('Team')) return 'team';
    
    return 'portfolio';
  }

  private extractPhotoTags(context: any): string[] {
    if (!context) return ['landscaping'];
    
    const tags = ['landscaping'];
    const contextStr = typeof context === 'string' ? context : context.label || '';
    
    // Extract service types
    if (contextStr.includes('Lawn')) tags.push('lawn-care');
    if (contextStr.includes('Garden')) tags.push('garden-design');
    if (contextStr.includes('Patio')) tags.push('patio');
    if (contextStr.includes('Tree')) tags.push('tree-service');
    
    return tags;
  }

  private generatePhotoAlt(context: any, businessName: string): string {
    if (!context) return `${businessName} landscaping work`;
    
    const contextStr = typeof context === 'string' ? context : context.label || '';
    return `${contextStr} - ${businessName}`;
  }

  private organizePhotosByType(photos: any[]): any[] {
    // Group by category
    const grouped = photos.reduce((acc, photo) => {
      const category = photo.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(photo);
      return acc;
    }, {} as Record<string, any[]>);
    
    // Order categories
    const categoryOrder = ['transformation', 'completed', 'garden', 'hardscape', 'team', 'general'];
    const organized: any[] = [];
    
    categoryOrder.forEach(category => {
      if (grouped[category]) {
        organized.push(...grouped[category]);
      }
    });
    
    return organized;
  }

  private extractPhotoCategories(items: any[]): string[] {
    const categories = new Set(items.map(item => item.category));
    return Array.from(categories);
  }

  private generateServicesHeadline(insights: DataInsights, serpData: any): string {
    // Check if competitors use generic headlines
    const competitorHeadlines = serpData?.competitorContent?.serviceHeadlines || [];
    
    if (competitorHeadlines.every((h: string) => h.includes('Our Services'))) {
      // Differentiate with specific approach
      return 'Complete Landscaping Solutions';
    }
    
    return 'Our Professional Services';
  }

  private generateServicesSubheadline(insights: DataInsights, services: any[]): string {
    const city = this.extractCity(insights);
    const specialties = services.filter(s => s.specialty).map(s => s.name);
    
    if (specialties.length > 0) {
      return `Comprehensive landscaping services with expertise in ${specialties[0].toLowerCase()}`;
    }
    
    return `Professional landscaping solutions for ${city} properties`;
  }

  private shouldShowPricing(insights: DataInsights, serpData: any): boolean {
    // Show pricing if competitors hide it (transparency advantage)
    if (serpData?.competitorPricingTransparency === 'hidden') {
      return true;
    }
    
    // Show if we have pricing info
    return insights.confirmed.description?.includes('$') || false;
  }

  private countServiceMentionsInReviews(serviceName: string, reviews: any): number {
    const reviewTexts = reviews.highlights || [];
    const serviceWords = serviceName.toLowerCase().split(' ');
    
    return reviewTexts.filter((text: string) => 
      serviceWords.some(word => text.toLowerCase().includes(word))
    ).length;
  }

  private getCertificationIcon(cert: string): string {
    const iconMap: Record<string, string> = {
      'licensed': '📜',
      'insured': '🛡️',
      'certified': '✓',
      'accredited': '🏆',
      'bonded': '🔒',
    };
    
    const certLower = cert.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (certLower.includes(key)) return icon;
    }
    
    return '✓';
  }

  private generateIndustryFAQs(insights: DataInsights): any[] {
    const city = this.extractCity(insights);
    
    return [
      {
        question: 'How often should I have my lawn mowed?',
        answer: `Most lawns in ${city} need weekly mowing during growing season (spring/summer) and bi-weekly in fall. We'll assess your specific grass type and growth rate to recommend the ideal schedule.`,
      },
      {
        question: 'Do you offer organic lawn care options?',
        answer: 'Yes! We offer eco-friendly fertilization and pest control options that are safe for children, pets, and the environment. Ask about our organic lawn care programs.',
      },
      {
        question: 'What areas do you service?',
        answer: `We proudly serve ${insights.confirmed.serviceArea.join(', ')}. Contact us to confirm we service your specific neighborhood.`,
      },
      // Add more industry-specific FAQs
    ];
  }

  private generateLocalFAQs(insights: DataInsights): any[] {
    const city = this.extractCity(insights);
    
    return [
      {
        question: `What types of grass grow best in ${city}?`,
        answer: `In ${city}'s climate, we recommend St. Augustine, Bermuda, or Zoysia grass depending on your property's sun exposure and usage. We'll help you choose the best option.`,
      },
      {
        question: `When is the best time to plant in ${city}?`,
        answer: `The best planting times in ${city} are early spring (March-April) and fall (September-October) when temperatures are moderate and rainfall is more consistent.`,
      },
    ];
  }

  private combineFAQs(...faqSets: any[][]): any[] {
    const combined = new Map();
    
    faqSets.forEach(faqs => {
      faqs.forEach(faq => {
        // Deduplicate by question
        const key = faq.question.toLowerCase();
        if (!combined.has(key)) {
          combined.set(key, faq);
        }
      });
    });
    
    return Array.from(combined.values());
  }

  private extractFAQKeywords(faq: any): string[] {
    const text = `${faq.question} ${faq.answer}`.toLowerCase();
    const keywords = [];
    
    // Extract service-related keywords
    const serviceKeywords = ['lawn', 'landscape', 'irrigation', 'tree', 'garden'];
    serviceKeywords.forEach(keyword => {
      if (text.includes(keyword)) keywords.push(keyword);
    });
    
    return keywords;
  }

  private generateStrategicCTA(insights: DataInsights, serpData: any, strategy: any): any {
    let text = 'Get Free Estimate';
    let urgency = false;
    
    // If competitors charge for estimates, emphasize free
    if (serpData?.competitorPractices?.chargeForEstimates) {
      text = 'Get Your FREE Estimate';
    }
    
    // If emergency service is a differentiator
    if (strategy.emphasis.includes('emergency-availability')) {
      text = 'Call Now - 24/7 Service';
      urgency = true;
    }
    
    // If phone number available, include it
    if (insights.confirmed.primaryPhone && urgency) {
      text = `Call ${insights.confirmed.primaryPhone}`;
    }
    
    return {
      text,
      action: insights.confirmed.primaryPhone && urgency ? 'phone' : 'quote-form',
      style: urgency ? 'urgent' : 'primary',
      icon: urgency ? '📞' : '📋',
    };
  }

  // Additional section populators...
  private populateAboutSection(variant: string, insights: DataInsights, userAnswers: any): PopulatedSection {
    const teamSize = userAnswers.teamSize || 'small';
    const yearsInBusiness = insights.confirmed.yearsInBusiness || 
      (userAnswers.confirmedClaims?.includes('20_years') ? 20 : null);
    
    return {
      variant,
      content: {
        headline: `About ${insights.confirmed.businessName}`,
        story: this.generateAboutStory(insights, userAnswers),
        values: [
          'Quality Craftsmanship',
          'Environmental Responsibility', 
          'Customer Satisfaction'
        ],
        teamInfo: {
          size: teamSize,
          yearsInBusiness,
          founder: userAnswers.founder,
        },
        certifications: insights.confirmed.certifications,
        awards: userAnswers.awards || [],
      },
      metadata: {
        dataSource: ['gbp', 'user'],
        seoKeywords: ['about', 'landscaping company', insights.confirmed.businessName.toLowerCase()],
      },
    };
  }

  private populateTestimonialsSection(variant: string, insights: DataInsights): PopulatedSection {
    return {
      variant,
      content: {
        headline: 'What Our Customers Say',
        subheadline: `Join ${insights.confirmed.reviews.count}+ satisfied customers`,
        testimonials: insights.confirmed.reviews.highlights.map((text: string, index: number) => ({
          id: `review-${index}`,
          text,
          rating: 5,
          author: `Verified Customer`,
          source: 'Google',
        })),
        averageRating: insights.confirmed.reviews.rating,
        totalReviews: insights.confirmed.reviews.count,
        ctaText: 'Read All Reviews',
        ctaLink: insights.confirmed.reviewsUrl,
      },
      metadata: {
        dataSource: ['gbp', 'places'],
        seoKeywords: ['reviews', 'testimonials', 'customer feedback'],
      },
    };
  }

  private populateServiceAreasSection(variant: string, insights: DataInsights): PopulatedSection {
    return {
      variant,
      content: {
        headline: 'Areas We Serve',
        subheadline: 'Professional landscaping throughout the region',
        areas: insights.confirmed.serviceArea,
        mapCenter: insights.confirmed.coordinates,
        radius: '30 miles',
        features: [
          'Free estimates',
          'Same-week service',
          'Licensed & insured',
        ],
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: insights.confirmed.serviceArea.map(area => area.toLowerCase()),
      },
    };
  }

  private populateCTASection(variant: string, insights: DataInsights, strategy: any): PopulatedSection {
    const isUrgent = strategy.emphasis.includes('emergency-availability');
    
    return {
      variant,
      content: {
        headline: isUrgent ? 'Need Emergency Service?' : 'Ready to Transform Your Landscape?',
        subheadline: isUrgent ? 
          'We\'re available 24/7 for storm damage and emergencies' : 
          'Get your free consultation and estimate today',
        primaryCTA: {
          text: isUrgent ? 'Call Now' : 'Get Free Estimate',
          action: isUrgent ? 'phone' : 'quote-form',
          style: 'primary',
        },
        secondaryCTA: {
          text: 'View Portfolio',
          action: 'scroll-to-gallery',
          style: 'secondary',
        },
        features: [
          'Free estimates',
          'Licensed & insured',
          'Satisfaction guaranteed',
        ],
        phoneNumber: insights.confirmed.primaryPhone,
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: ['free estimate', 'landscaping quote', 'consultation'],
      },
    };
  }

  private populateContactSection(variant: string, insights: DataInsights): PopulatedSection {
    return {
      variant,
      content: {
        headline: 'Get in Touch',
        subheadline: 'We\'re here to help with all your landscaping needs',
        phoneNumber: insights.confirmed.primaryPhone,
        email: insights.confirmed.email,
        address: insights.confirmed.address,
        hours: insights.confirmed.hours,
        mapCoordinates: insights.confirmed.coordinates,
        contactForm: {
          enabled: true,
          fields: ['name', 'email', 'phone', 'service', 'message'],
        },
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: ['contact', 'landscaping near me', this.extractCity(insights).toLowerCase()],
      },
    };
  }

  private populateGenericSection(sectionType: string, variant: string, insights: DataInsights): PopulatedSection {
    return {
      variant,
      content: {
        headline: sectionType.charAt(0).toUpperCase() + sectionType.slice(1),
        message: `This section (${sectionType}) is not yet implemented for landscaping.`,
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: [sectionType],
      },
    };
  }

  private generateAboutStory(insights: DataInsights, userAnswers: any): string {
    const yearsInBusiness = insights.confirmed.yearsInBusiness || 
      (userAnswers.confirmedClaims?.includes('20_years') ? 20 : null);
    const city = this.extractCity(insights);
    
    let story = `${insights.confirmed.businessName} has been transforming outdoor spaces in ${city}`;
    
    if (yearsInBusiness) {
      story += ` for over ${yearsInBusiness} years`;
    }
    
    story += '. ';
    
    if (userAnswers.uniqueValue) {
      story += userAnswers.uniqueValue + ' ';
    }
    
    if (insights.confirmed.certifications.includes('EPA certified')) {
      story += 'As an EPA certified company, we\'re committed to environmentally responsible practices. ';
    }
    
    story += 'Our team of experienced professionals takes pride in creating beautiful, sustainable landscapes that enhance your property and lifestyle.';
    
    return story;
  }
}

export const enhancedLandscapingPopulator = new EnhancedLandscapingPopulator();
