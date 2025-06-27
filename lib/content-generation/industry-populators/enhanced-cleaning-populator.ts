/**
 * Enhanced Content Populator for Cleaning Services
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

export class EnhancedCleaningPopulator {
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
      case 'process':
        return this.populateProcessSection(variant, insights, userAnswers);
      case 'pricing':
        return this.populatePricingSection(variant, insights, userAnswers, serpData);
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
          text: 'View Pricing',
          action: 'scroll-to-pricing',
          style: 'secondary',
        },
        backgroundImage: heroImage.url,
        imageAlt: heroImage.alt,
        overlay: variant === 'hero-elegant' ? 'gradient' : 'light',
        trustSignals,
        phoneNumber: insights.confirmed.primaryPhone,
        instantQuote: userAnswers.instantQuote || strategy.emphasis.includes('transparent-pricing'),
        sparkleAnimation: true, // Cleaning-specific visual element
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
        ctaText: 'Get Instant Quote',
        greenCleaning: userAnswers.greenCleaning || insights.confirmed.description?.includes('eco'),
        satisfactionGuarantee: true,
      },
      metadata: {
        dataSource: ['gbp', 'places', 'serp', 'user'],
        seoKeywords: enrichedServices.flatMap(s => s.keywords),
        competitiveAdvantage: 'comprehensive-services',
      },
    };
  }

  /**
   * Populate Process Section (Cleaning-specific)
   */
  private populateProcessSection(
    variant: string,
    insights: DataInsights,
    userAnswers: any
  ): PopulatedSection {
    const process = userAnswers.cleaningProcess || this.getDefaultCleaningProcess();
    
    return {
      variant: 'process-timeline',
      content: {
        headline: 'Our Cleaning Process',
        subheadline: 'Professional cleaning made simple',
        steps: process.map((step: any, index: number) => ({
          number: index + 1,
          title: step.title,
          description: step.description,
          icon: step.icon || this.getProcessIcon(step.title),
          duration: step.duration,
        })),
        totalTime: this.calculateTotalTime(process),
        satisfactionNote: '100% satisfaction guaranteed',
      },
      metadata: {
        dataSource: ['user', 'generated'],
        seoKeywords: ['cleaning process', 'professional cleaning', 'how we clean'],
        competitiveAdvantage: 'transparent-process',
      },
    };
  }

  /**
   * Populate Pricing Section (Cleaning-specific)
   */
  private populatePricingSection(
    variant: string,
    insights: DataInsights,
    userAnswers: any,
    serpData: any
  ): PopulatedSection {
    const showPricing = userAnswers.showPricing !== false && 
                       (serpData?.competitorPricingTransparency === 'hidden' || 
                        insights.confirmed.description?.includes('$'));
    
    if (!showPricing) {
      return this.populateGenericSection('pricing', variant, insights);
    }
    
    return {
      variant: 'pricing-tiers',
      content: {
        headline: 'Transparent Pricing',
        subheadline: 'No hidden fees - ever',
        tiers: this.generatePricingTiers(insights, userAnswers),
        features: this.getIncludedFeatures(),
        customQuote: {
          text: 'Need a custom quote?',
          action: 'quote-form',
        },
        discounts: userAnswers.discounts || [
          'First-time customer: 20% off',
          'Weekly service: 15% off',
          'Referral bonus: $25 credit',
        ],
      },
      metadata: {
        dataSource: ['user', 'serp'],
        seoKeywords: ['cleaning prices', 'cleaning cost', 'house cleaning rates'],
        competitiveAdvantage: 'transparent-pricing',
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
      // Cleaning-specific certifications
      ...this.extractCleaningCertifications(insights, userAnswers),
      
      // Years in business
      insights.confirmed.yearsInBusiness && {
        type: 'experience',
        title: `${insights.confirmed.yearsInBusiness} Years Experience`,
        subtitle: 'Trusted by thousands',
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
      
      // Eco-friendly
      (userAnswers.greenCleaning || insights.confirmed.description?.includes('eco')) && {
        type: 'eco',
        title: 'Eco-Friendly Products',
        subtitle: 'Safe for kids & pets',
        icon: '🌱',
        verified: true,
      },
      
      // Background checks
      (userAnswers.backgroundChecks !== false) && {
        type: 'safety',
        title: 'Background Checked',
        subtitle: 'All cleaners verified',
        icon: '✅',
        verified: true,
      },
      
      // Satisfaction guarantee
      {
        type: 'guarantee',
        title: 'Satisfaction Guaranteed',
        subtitle: 'Or we\'ll re-clean for free',
        icon: '💯',
        verified: true,
      },
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
        seoKeywords: ['licensed cleaning', 'insured cleaners', 'eco cleaning', ...this.extractCertKeywords(insights)],
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
    const industryFAQs = this.generateCleaningFAQs(insights);
    
    // Add location-specific questions
    const localFAQs = this.generateLocalCleaningFAQs(insights);
    
    // Combine and deduplicate
    const allFAQs = this.combineFAQs(paaQuestions, industryFAQs, localFAQs);
    
    return {
      variant,
      content: {
        headline: 'Frequently Asked Questions',
        subheadline: 'Everything you need to know about our cleaning services',
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
        'Premium Cleaning Services You Can Trust',
        'Exceptional Cleaning, Every Time',
        'Luxury Cleaning Services',
      ],
      'eco-focused': [
        'Eco-Friendly Cleaning Services',
        'Green Cleaning for Healthier Homes',
        'Natural Cleaning Solutions',
      ],
      'value-focused': [
        'Affordable Cleaning Services',
        'Quality Cleaning at Fair Prices',
        'Professional Cleaning, Budget-Friendly',
      ],
      'commercial-focused': [
        'Commercial & Residential Cleaning',
        'Professional Cleaning for Every Space',
        'Complete Cleaning Solutions',
      ],
      'balanced': [
        'Professional Cleaning Services',
        'Your Trusted Cleaning Partner',
        'Making Homes Sparkle Since ' + (insights.confirmed.yearsInBusiness ? new Date().getFullYear() - insights.confirmed.yearsInBusiness : '2010'),
      ],
    };
    
    const options = templates[strategy.positioning] || templates.balanced;
    return options[0];
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
    
    // Service types
    const serviceTypes = [];
    if (insights.confirmed.services.some(s => s.toLowerCase().includes('house'))) {
      serviceTypes.push('house');
    }
    if (insights.confirmed.services.some(s => s.toLowerCase().includes('office'))) {
      serviceTypes.push('office');
    }
    if (insights.confirmed.services.some(s => s.toLowerCase().includes('commercial'))) {
      serviceTypes.push('commercial');
    }
    
    if (serviceTypes.length > 0) {
      elements.push(`${serviceTypes.join(' & ')} cleaning`);
    }
    
    // Service area
    if (insights.confirmed.serviceArea.length > 0) {
      elements.push(`serving ${insights.confirmed.serviceArea[0]}`);
    }
    
    // Key differentiator
    if (userAnswers.greenCleaning) {
      elements.push('eco-friendly products');
    } else if (strategy.differentiators.length > 0) {
      elements.push(strategy.differentiators[0].toLowerCase());
    }
    
    if (elements.length === 0) {
      return 'Professional cleaning services for homes and offices. Licensed, insured, and satisfaction guaranteed.';
    }
    
    return `Professional ${elements.join(', ')}. Book online in 60 seconds.`;
  }

  /**
   * Helper: Extract cleaning certifications
   */
  private extractCleaningCertifications(insights: DataInsights, userAnswers: any): any[] {
    const certs = [];
    
    // Standard certifications
    insights.confirmed.certifications.forEach(cert => {
      certs.push({
        type: 'certification',
        title: cert,
        icon: this.getCertificationIcon(cert),
        verified: true,
      });
    });
    
    // Cleaning-specific certifications
    const cleaningCerts = [
      'ISSA Certified',
      'Green Seal Certified',
      'IICRC Certified',
      'BBB Accredited',
    ];
    
    cleaningCerts.forEach(cert => {
      if (insights.confirmed.description?.includes(cert) || 
          userAnswers.certifications?.includes(cert)) {
        certs.push({
          type: 'certification',
          title: cert,
          icon: this.getCertificationIcon(cert),
          verified: true,
        });
      }
    });
    
    return certs;
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
    
    // Add cleaning-specific services
    const cleaningServices = [
      'House Cleaning',
      'Deep Cleaning',
      'Move In/Out Cleaning',
      'Office Cleaning',
      'Commercial Cleaning',
      'Post-Construction Cleaning',
      'Carpet Cleaning',
      'Window Cleaning',
      'Green Cleaning',
      'One-Time Cleaning',
      'Recurring Cleaning',
      'Apartment Cleaning',
    ];
    
    cleaningServices.forEach(service => {
      const key = service.toLowerCase();
      if (insights.confirmed.description?.toLowerCase().includes(key) ||
          userAnswers.confirmedServices?.includes(service)) {
        serviceMap.set(key, {
          name: service,
          source: 'extracted',
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
      
      // Core services get priority
      const coreServices = ['house cleaning', 'deep cleaning', 'office cleaning'];
      if (coreServices.some(core => service.name.toLowerCase().includes(core))) {
        score += 30;
      }
      
      // Move in/out high demand
      if (service.name.toLowerCase().includes('move')) {
        score += 25;
      }
      
      // Green cleaning trending
      if (service.name.toLowerCase().includes('green') || 
          service.name.toLowerCase().includes('eco')) {
        score += 20;
      }
      
      // Check search demand from SERP
      if (serpData?.serviceKeywordVolume?.[service.name.toLowerCase()]) {
        score += serpData.serviceKeywordVolume[service.name.toLowerCase()];
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
    
    // Add pricing if available
    enriched.pricing = this.getServicePricing(service, insights, userAnswers);
    
    // Add frequency options
    enriched.frequency = this.getServiceFrequency(service);
    
    // Add eco badge if applicable
    if (service.name.toLowerCase().includes('green') || userAnswers.greenCleaning) {
      enriched.badge = 'Eco-Friendly';
    }
    
    return enriched;
  }

  /**
   * Helper: Get service description
   */
  private getServiceDescription(service: any, insights: DataInsights, userAnswers: any): string {
    // Check for user-provided description
    const userDesc = userAnswers.serviceDescriptions?.[service.name];
    if (userDesc) return userDesc;
    
    // Cleaning-specific descriptions
    const descriptions: Record<string, string> = {
      'house cleaning': 'Regular home cleaning to keep your space fresh and tidy. Customized to your needs and schedule.',
      'deep cleaning': 'Thorough top-to-bottom cleaning that reaches every corner. Perfect for spring cleaning or first-time service.',
      'move in/out cleaning': 'Complete cleaning for moving transitions. We make sure your old home is spotless or your new home is move-in ready.',
      'office cleaning': 'Professional office cleaning to maintain a healthy, productive workspace. Flexible scheduling available.',
      'commercial cleaning': 'Comprehensive cleaning solutions for businesses of all sizes. Customized plans to fit your needs.',
      'post-construction cleaning': 'Specialized cleaning to remove construction dust and debris. We make your newly renovated space shine.',
      'carpet cleaning': 'Professional carpet cleaning to remove stains, odors, and allergens. Safe for all carpet types.',
      'window cleaning': 'Crystal-clear window cleaning inside and out. Includes screens and sills.',
      'green cleaning': 'Eco-friendly cleaning using non-toxic, sustainable products. Safe for your family and the environment.',
      'one-time cleaning': 'Single-session cleaning for special occasions or when you need extra help.',
      'recurring cleaning': 'Regular cleaning services weekly, bi-weekly, or monthly. Consistent clean you can count on.',
    };
    
    return descriptions[service.name.toLowerCase()] || 
      `Professional ${service.name.toLowerCase()} services by trained and insured cleaners.`;
  }

  /**
   * Helper: Generate cleaning-specific FAQs
   */
  private generateCleaningFAQs(insights: DataInsights): any[] {
    const city = this.extractCity(insights);
    
    return [
      {
        question: 'What\'s included in a standard house cleaning?',
        answer: 'Our standard cleaning includes dusting all surfaces, vacuuming carpets and rugs, mopping hard floors, cleaning bathrooms (toilets, sinks, showers/tubs), kitchen cleaning (counters, stovetop, microwave exterior), emptying trash, and making beds. We customize based on your specific needs.',
      },
      {
        question: 'Do I need to provide cleaning supplies?',
        answer: 'No! We bring all necessary cleaning supplies and equipment. If you prefer us to use your specific products or have allergies/sensitivities, we\'re happy to use your supplies.',
      },
      {
        question: 'Are your cleaners insured and bonded?',
        answer: 'Yes, all our cleaners are fully insured, bonded, and have passed thorough background checks. Your home and belongings are protected, and you can have peace of mind.',
      },
      {
        question: 'What\'s the difference between regular cleaning and deep cleaning?',
        answer: 'Regular cleaning maintains your home\'s cleanliness with routine tasks. Deep cleaning is more thorough, including baseboards, light fixtures, inside appliances, under furniture, and detailed grout cleaning. We recommend deep cleaning for first-time customers or quarterly.',
      },
      {
        question: 'How do I prepare for a cleaning service?',
        answer: 'Please pick up personal items, secure valuables, and provide access instructions. Let us know about any special requests or areas to avoid. If you have pets, please let us know how you\'d like us to handle them.',
      },
    ];
  }

  /**
   * Helper: Generate local cleaning FAQs
   */
  private generateLocalCleaningFAQs(insights: DataInsights): any[] {
    const city = this.extractCity(insights);
    
    return [
      {
        question: `How much does house cleaning cost in ${city}?`,
        answer: `House cleaning in ${city} typically ranges from $100-$300 depending on home size, cleaning type, and frequency. We offer free quotes and transparent pricing with no hidden fees.`,
      },
      {
        question: `Do you offer same-day cleaning service in ${city}?`,
        answer: `We offer same-day and next-day service based on availability. Book early for the best selection of times. Emergency cleaning may be available with priority pricing.`,
      },
    ];
  }

  /**
   * Helper: Get default cleaning process
   */
  private getDefaultCleaningProcess(): any[] {
    return [
      {
        title: 'Book Online',
        description: 'Easy online booking in 60 seconds',
        duration: '2 min',
        icon: 'calendar',
      },
      {
        title: 'Get Matched',
        description: 'We assign your dedicated cleaning team',
        duration: 'Same day',
        icon: 'users',
      },
      {
        title: 'We Clean',
        description: 'Professional cleaning to your specifications',
        duration: '2-4 hours',
        icon: 'sparkles',
      },
      {
        title: 'You Relax',
        description: 'Enjoy your spotless space',
        duration: 'Ongoing',
        icon: 'smile',
      },
    ];
  }

  /**
   * Helper: Generate pricing tiers
   */
  private generatePricingTiers(insights: DataInsights, userAnswers: any): any[] {
    const basePricing = userAnswers.pricing || {
      studio: { regular: 80, deep: 120 },
      oneBed: { regular: 100, deep: 150 },
      twoBed: { regular: 120, deep: 180 },
      threeBed: { regular: 150, deep: 220 },
    };
    
    return [
      {
        name: 'Studio/1 Bedroom',
        regularPrice: `$${basePricing.studio.regular}+`,
        deepPrice: `$${basePricing.studio.deep}+`,
        features: ['Up to 700 sq ft', '1-2 hours', 'All supplies included'],
      },
      {
        name: '2 Bedroom',
        regularPrice: `$${basePricing.twoBed.regular}+`,
        deepPrice: `$${basePricing.twoBed.deep}+`,
        features: ['Up to 1200 sq ft', '2-3 hours', 'All supplies included'],
        popular: true,
      },
      {
        name: '3+ Bedroom',
        regularPrice: `$${basePricing.threeBed.regular}+`,
        deepPrice: `$${basePricing.threeBed.deep}+`,
        features: ['1200+ sq ft', '3-4 hours', 'All supplies included'],
      },
    ];
  }

  /**
   * Helper: Get included features
   */
  private getIncludedFeatures(): string[] {
    return [
      'All cleaning supplies & equipment',
      'Insured & bonded cleaners',
      'Satisfaction guarantee',
      'Easy online booking',
      'Flexible scheduling',
      'Background-checked staff',
    ];
  }

  // Reusable helper methods
  private extractCity(insights: DataInsights): string {
    const serviceArea = insights.confirmed.serviceArea[0] || '';
    const addressMatch = serviceArea.match(/([A-Za-z\s]+),?\s*[A-Z]{2}/);
    return addressMatch?.[1] || 'your area';
  }

  private selectHeroImage(insights: DataInsights, userAnswers: any): any {
    const photos = insights.confirmed.photos || [];
    const photoContexts = userAnswers.photoContexts || {};
    
    // Prefer clean, bright interior photos
    const heroCandidate = photos.find((photo: any) => {
      const context = photoContexts[photo.id] || photo.context;
      return context?.includes('Clean') || context?.includes('After');
    }) || photos[0];
    
    return {
      url: heroCandidate?.url || '/images/cleaning-hero-default.jpg',
      alt: heroCandidate?.alt || 'Professional cleaning services',
    };
  }

  private selectCompetitiveTrustSignals(
    insights: DataInsights,
    serpData: any,
    userAnswers: any
  ): string[] {
    const signals = [];
    
    // Cleaning-specific trust signals
    if (userAnswers.greenCleaning || insights.confirmed.description?.includes('eco')) {
      signals.push('Eco-Friendly Products');
    }
    
    if (userAnswers.backgroundChecks !== false) {
      signals.push('Background Checked');
    }
    
    if (insights.confirmed.certifications.length > 0) {
      signals.push('Licensed & Insured');
    }
    
    // Add defaults if needed
    const defaults = ['Satisfaction Guaranteed', 'Free Estimates', 'Same-Day Service'];
    while (signals.length < 3 && defaults.length > 0) {
      signals.push(defaults.shift()!);
    }
    
    return signals.slice(0, 3);
  }

  private extractHeroKeywords(insights: DataInsights, serpData: any): string[] {
    const keywords = new Set<string>();
    
    // Industry + location
    keywords.add('cleaning service');
    keywords.add('house cleaning');
    keywords.add(this.extractCity(insights).toLowerCase());
    
    // Service-specific keywords
    keywords.add('maid service');
    keywords.add('professional cleaners');
    
    // High-volume keywords from SERP
    if (serpData?.topKeywords) {
      serpData.topKeywords.slice(0, 3).forEach((kw: string) => keywords.add(kw));
    }
    
    return Array.from(keywords);
  }

  private getCertificationIcon(cert: string): string {
    const iconMap: Record<string, string> = {
      'licensed': '📜',
      'insured': '🛡️',
      'certified': '✓',
      'issa': '🏆',
      'green seal': '🌱',
      'iicrc': '🎓',
      'bbb': '⭐',
      'bonded': '🔒',
    };
    
    const certLower = cert.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (certLower.includes(key)) return icon;
    }
    
    return '✓';
  }

  private extractCertKeywords(insights: DataInsights): string[] {
    return insights.confirmed.certifications.map(cert => 
      cert.toLowerCase().replace(/[^a-z0-9]/g, ' ')
    );
  }

  private generateServicesHeadline(insights: DataInsights, serpData: any): string {
    const hasGreen = insights.confirmed.services.some(s => 
      s.toLowerCase().includes('green') || s.toLowerCase().includes('eco')
    );
    
    if (hasGreen) {
      return 'Eco-Friendly Cleaning Services';
    }
    
    return 'Professional Cleaning Services';
  }

  private generateServicesSubheadline(insights: DataInsights, services: any[]): string {
    const city = this.extractCity(insights);
    const hasCommercial = services.some(s => s.name.toLowerCase().includes('commercial'));
    const hasGreen = services.some(s => s.name.toLowerCase().includes('green'));
    
    if (hasCommercial) {
      return `Residential and commercial cleaning solutions for ${city}`;
    }
    
    if (hasGreen) {
      return `Eco-friendly cleaning services for healthier ${city} homes`;
    }
    
    return `Reliable house cleaning services throughout ${city}`;
  }

  private shouldShowPricing(insights: DataInsights, serpData: any): boolean {
    // Show pricing if competitors hide it (transparency advantage)
    if (serpData?.competitorPricingTransparency === 'hidden') {
      return true;
    }
    
    // Show if we have pricing info
    return insights.confirmed.description?.includes('$') || true; // Default to showing for cleaning
  }

  private getServiceFeatures(service: any, insights: DataInsights, userAnswers: any): string[] {
    const userFeatures = userAnswers.serviceFeatures?.[service.name];
    if (userFeatures) return userFeatures;
    
    const featureMap: Record<string, string[]> = {
      'house cleaning': [
        'Kitchen & bathrooms',
        'Dusting & vacuuming',
        'Floor cleaning',
        'Trash removal',
      ],
      'deep cleaning': [
        'Baseboards & moldings',
        'Inside appliances',
        'Light fixtures',
        'Detailed grout cleaning',
      ],
      'move in/out cleaning': [
        'Inside cabinets & drawers',
        'Appliance cleaning',
        'Window cleaning',
        'Garage cleaning',
      ],
      'office cleaning': [
        'Desk sanitization',
        'Common area cleaning',
        'Restroom maintenance',
        'Trash & recycling',
      ],
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
      'house': 'home',
      'deep': 'sparkles',
      'move': 'truck',
      'office': 'briefcase',
      'commercial': 'building',
      'construction': 'hard-hat',
      'carpet': 'square',
      'window': 'maximize',
      'green': 'leaf',
      'eco': 'leaf',
      'one-time': 'calendar-check',
      'recurring': 'repeat',
    };
    
    const normalized = serviceName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (normalized.includes(key)) return icon;
    }
    
    return 'sparkles';
  }

  private getServicePricing(service: any, insights: DataInsights, userAnswers: any): string | undefined {
    const pricingMap: Record<string, string> = {
      'house cleaning': 'From $80',
      'deep cleaning': 'From $150',
      'move in/out cleaning': 'From $200',
      'office cleaning': 'Custom quote',
      'commercial cleaning': 'Custom quote',
    };
    
    return userAnswers.servicePricing?.[service.name] || pricingMap[service.name.toLowerCase()];
  }

  private getServiceFrequency(service: any): string[] {
    const frequencyMap: Record<string, string[]> = {
      'house cleaning': ['Weekly', 'Bi-weekly', 'Monthly', 'One-time'],
      'office cleaning': ['Daily', 'Weekly', 'Bi-weekly'],
      'deep cleaning': ['Quarterly', 'Bi-annual', 'Annual'],
    };
    
    const key = Object.keys(frequencyMap).find(k => 
      service.name.toLowerCase().includes(k)
    );
    
    return frequencyMap[key || 'house cleaning'] || ['Flexible scheduling'];
  }

  private getProcessIcon(title: string): string {
    const iconMap: Record<string, string> = {
      'book': 'calendar',
      'match': 'users',
      'clean': 'sparkles',
      'relax': 'smile',
      'inspect': 'search',
      'approve': 'check-circle',
    };
    
    const titleLower = title.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (titleLower.includes(key)) return icon;
    }
    
    return 'circle';
  }

  private calculateTotalTime(process: any[]): string {
    const totalMinutes = process.reduce((total, step) => {
      const duration = step.duration || '';
      const match = duration.match(/(\d+)\s*(min|hour)/i);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        return total + (unit.includes('hour') ? value * 60 : value);
      }
      return total;
    }, 0);
    
    if (totalMinutes < 60) return `${totalMinutes} minutes`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours} hours ${minutes} minutes` : `${hours} hours`;
  }

  private combineFAQs(...faqSets: any[][]): any[] {
    const combined = new Map();
    
    faqSets.forEach(faqs => {
      faqs.forEach(faq => {
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
    
    // Extract cleaning-related keywords
    const cleaningKeywords = ['clean', 'cleaning', 'maid', 'house', 'service', 'cost', 'price'];
    cleaningKeywords.forEach(keyword => {
      if (text.includes(keyword)) keywords.push(keyword);
    });
    
    return keywords;
  }

  private generateStrategicCTA(insights: DataInsights, serpData: any, strategy: any): any {
    let text = 'Get Free Quote';
    let urgency = false;
    
    // If instant booking is available
    if (strategy.emphasis.includes('instant-booking')) {
      text = 'Book Now - 60 Seconds';
    }
    
    // If transparent pricing is emphasized
    if (strategy.emphasis.includes('transparent-pricing')) {
      text = 'See Pricing & Book';
    }
    
    // If eco is the focus
    if (strategy.positioning === 'eco-focused') {
      text = 'Book Eco-Friendly Clean';
    }
    
    return {
      text,
      action: 'booking-form',
      style: 'primary',
      icon: '✨',
    };
  }

  // Additional section populators
  private populateAboutSection(variant: string, insights: DataInsights, userAnswers: any): PopulatedSection {
    return {
      variant,
      content: {
        headline: `About ${insights.confirmed.businessName}`,
        story: userAnswers.aboutStory || this.generateAboutStory(insights),
        values: ['Quality Service', 'Trust & Reliability', 'Customer Satisfaction'],
        teamPhoto: this.selectTeamPhoto(insights, userAnswers),
        employeeHighlight: userAnswers.employeeOwned || insights.confirmed.description?.includes('employee'),
      },
      metadata: {
        dataSource: ['gbp', 'user'],
        seoKeywords: ['about', 'cleaning company', insights.confirmed.businessName.toLowerCase()],
      },
    };
  }

  private populateGallerySection(variant: string, insights: DataInsights, userAnswers: any): PopulatedSection {
    const labeledPhotos = this.getLabeledPhotos(insights, userAnswers);
    const organizedPhotos = this.organizePhotosByType(labeledPhotos);
    
    return {
      variant,
      content: {
        headline: 'See the Difference We Make',
        subheadline: 'Real results from real homes',
        items: organizedPhotos,
        categories: ['Before & After', 'Homes', 'Offices', 'Deep Clean'],
        layout: variant,
        showBeforeAfter: true,
      },
      metadata: {
        dataSource: ['gbp', 'user'],
        seoKeywords: ['cleaning results', 'before after cleaning', 'cleaning gallery'],
      },
    };
  }

  private populateTestimonialsSection(variant: string, insights: DataInsights): PopulatedSection {
    return {
      variant,
      content: {
        headline: 'Our Customers Love Us',
        testimonials: insights.confirmed.reviews.highlights.slice(0, 3).map((review: string) => ({
          text: review,
          rating: 5,
          source: 'Google',
        })),
        averageRating: insights.confirmed.reviews.rating,
        totalReviews: insights.confirmed.reviews.count,
        ctaText: 'Book Your First Clean',
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: ['cleaning reviews', 'customer testimonials', 'cleaning service reviews'],
      },
    };
  }

  private populateServiceAreasSection(variant: string, insights: DataInsights): PopulatedSection {
    return {
      variant,
      content: {
        headline: 'Areas We Serve',
        subheadline: 'Professional cleaning throughout the area',
        areas: insights.confirmed.serviceArea,
        mapCenter: insights.confirmed.coordinates,
        radius: insights.confirmed.serviceRadius || '20 miles',
        responseTime: 'Same-day service available',
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: insights.confirmed.serviceArea.map(area => `cleaning service ${area.toLowerCase()}`),
      },
    };
  }

  private populateCTASection(variant: string, insights: DataInsights, strategy: any): PopulatedSection {
    const isBookingFocused = strategy.emphasis.includes('instant-booking');
    
    return {
      variant,
      content: {
        headline: isBookingFocused ? 'Ready for a Spotless Space?' : 'Get Your Free Cleaning Quote',
        subheadline: isBookingFocused ? 'Book in 60 seconds, clean today!' : 'No obligations, transparent pricing',
        primaryCTA: {
          text: isBookingFocused ? 'Book Now' : 'Get Quote',
          action: isBookingFocused ? 'booking-form' : 'quote-form',
        },
        features: ['100% Satisfaction', 'Insured Cleaners', 'Easy Booking'],
        discount: 'First-time customers save 20%',
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: ['book cleaning', 'cleaning quote', 'schedule cleaning'],
      },
    };
  }

  private populateContactSection(variant: string, insights: DataInsights): PopulatedSection {
    return {
      variant,
      content: {
        headline: 'Get in Touch',
        phoneNumber: insights.confirmed.primaryPhone,
        email: insights.confirmed.email,
        address: insights.confirmed.address,
        hours: insights.confirmed.hours,
        responseTime: 'We respond within 1 hour',
        bookingOptions: ['Online Booking', 'Phone', 'Email'],
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: ['contact cleaning service', 'cleaning company ' + this.extractCity(insights).toLowerCase()],
      },
    };
  }

  private populateGenericSection(sectionType: string, variant: string, insights: DataInsights): PopulatedSection {
    return {
      variant,
      content: {},
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: [sectionType],
      },
    };
  }

  // Helper methods
  private generateAboutStory(insights: DataInsights): string {
    const years = insights.confirmed.yearsInBusiness;
    const city = this.extractCity(insights);
    
    return `${insights.confirmed.businessName} has been making ${city} homes sparkle for ${years ? `over ${years} years` : 'years'}. We started with a simple mission: provide reliable, thorough cleaning services that give our customers their time back. Today, we're proud to be ${city}'s trusted cleaning partner, known for our attention to detail and commitment to customer satisfaction.`;
  }

  private selectTeamPhoto(insights: DataInsights, userAnswers: any): any {
    const photos = this.getLabeledPhotos(insights, userAnswers);
    const teamPhoto = photos.find(p => p.category === 'team');
    
    return {
      url: teamPhoto?.url || '/images/cleaning-team-default.jpg',
      alt: teamPhoto?.alt || `${insights.confirmed.businessName} cleaning team`,
    };
  }

  private getLabeledPhotos(insights: DataInsights, userAnswers: any): any[] {
    const photos = insights.confirmed.photos || [];
    const photoContexts = userAnswers.photoContexts || {};
    
    return photos.map((photo: any, index: number) => {
      const photoId = photo.id || `photo-${index}`;
      const context = photoContexts[photoId] || photo.context;
      
      return {
        ...photo,
        id: photoId,
        alt: this.generatePhotoAlt(context, insights.confirmed.businessName),
        title: context?.label || context || 'Our Work',
        category: this.categorizePhoto(context),
      };
    });
  }

  private generatePhotoAlt(context: any, businessName: string): string {
    if (!context) return `${businessName} cleaning service`;
    
    const contextStr = typeof context === 'string' ? context : context.label || '';
    return `${contextStr} - ${businessName}`;
  }

  private categorizePhoto(context: any): string {
    if (!context) return 'general';
    
    const contextStr = typeof context === 'string' ? context : context.label || '';
    
    if (contextStr.includes('Before') || contextStr.includes('After')) return 'before-after';
    if (contextStr.includes('Home') || contextStr.includes('House')) return 'homes';
    if (contextStr.includes('Office')) return 'offices';
    if (contextStr.includes('Deep')) return 'deep-clean';
    if (contextStr.includes('Team')) return 'team';
    
    return 'general';
  }

  private organizePhotosByType(photos: any[]): any[] {
    const categoryOrder = ['before-after', 'homes', 'offices', 'deep-clean', 'team', 'general'];
    const grouped = photos.reduce((acc, photo) => {
      const category = photo.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(photo);
      return acc;
    }, {} as Record<string, any[]>);
    
    const organized: any[] = [];
    categoryOrder.forEach(category => {
      if (grouped[category]) {
        organized.push(...grouped[category]);
      }
    });
    
    return organized;
  }
}

export const enhancedCleaningPopulator = new EnhancedCleaningPopulator();
