/**
 * Enhanced Content Populator for Plumbing
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

export class EnhancedPlumbingPopulator {
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
      case 'emergency':
        return this.populateEmergencySection(variant, insights, strategy);
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
          text: 'View Our Services',
          action: 'scroll-to-services',
          style: 'secondary',
        },
        backgroundImage: heroImage.url,
        imageAlt: heroImage.alt,
        overlay: variant === 'hero-elegant' ? 'gradient' : 'dark',
        trustSignals,
        phoneNumber: insights.confirmed.primaryPhone,
        emergencyBadge: insights.confirmed.emergency24_7 || strategy.emphasis.includes('emergency-availability'),
        waterDropAnimation: true, // Plumbing-specific visual element
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
        emergencyCallout: insights.confirmed.emergency24_7,
        preventionTip: 'Regular maintenance prevents costly repairs',
      },
      metadata: {
        dataSource: ['gbp', 'places', 'serp', 'user'],
        seoKeywords: enrichedServices.flatMap(s => s.keywords),
        competitiveAdvantage: 'comprehensive-services',
      },
    };
  }

  /**
   * Populate Emergency Section (Plumbing-specific)
   */
  private populateEmergencySection(
    variant: string,
    insights: DataInsights,
    strategy: any
  ): PopulatedSection {
    const hasEmergency = insights.confirmed.emergency24_7 || 
                        strategy.emphasis.includes('emergency-availability');
    
    if (!hasEmergency) {
      return this.populateGenericSection('emergency', variant, insights);
    }
    
    return {
      variant: 'emergency-banner',
      content: {
        headline: '24/7 Emergency Plumbing Service',
        subheadline: 'Burst pipe? Overflowing toilet? We\'re here when disaster strikes.',
        phoneNumber: insights.confirmed.primaryPhone,
        features: [
          'Rapid response time',
          'Available 24/7/365',
          'No extra charges for nights/weekends',
          'Fully stocked service trucks',
        ],
        emergencyTypes: [
          'Burst pipes',
          'Severe leaks',
          'Sewer backups',
          'No hot water',
          'Overflowing toilets',
          'Gas leaks',
        ],
        backgroundColor: 'blue',
        icon: 'alert-triangle',
      },
      metadata: {
        dataSource: ['gbp', 'user'],
        seoKeywords: ['emergency plumber', '24 hour plumber', 'emergency plumbing service'],
        competitiveAdvantage: 'emergency-availability',
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
      // Plumbing-specific certifications
      ...this.extractPlumbingCertifications(insights, userAnswers),
      
      // Years in business
      insights.confirmed.yearsInBusiness && {
        type: 'experience',
        title: `${insights.confirmed.yearsInBusiness} Years Experience`,
        subtitle: 'Family-owned & operated',
        icon: '👨‍👩‍👧‍👦',
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
      
      // Warranties offered
      (userAnswers.warranties || insights.confirmed.description?.includes('warranty')) && {
        type: 'warranty',
        title: 'Warranty on All Work',
        subtitle: 'Peace of mind guaranteed',
        icon: '🛡️',
        verified: true,
      },
      
      // Upfront pricing
      (userAnswers.upfrontPricing !== false) && {
        type: 'pricing',
        title: 'Upfront Pricing',
        subtitle: 'No hidden fees',
        icon: '💰',
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
        seoKeywords: ['licensed plumber', 'insured plumber', 'certified plumber', ...this.extractCertKeywords(insights)],
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
    const industryFAQs = this.generatePlumbingFAQs(insights);
    
    // Add location-specific questions
    const localFAQs = this.generateLocalPlumbingFAQs(insights);
    
    // Combine and deduplicate
    const allFAQs = this.combineFAQs(paaQuestions, industryFAQs, localFAQs);
    
    return {
      variant,
      content: {
        headline: 'Frequently Asked Questions',
        subheadline: 'Get answers to common plumbing questions',
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
        'Master Plumbers You Can Trust',
        'Excellence in Every Pipe',
        'Premium Plumbing Solutions',
      ],
      'specialist': [
        `${city}'s ${strategy.differentiators[0]} Experts`,
        'Specialized Plumbing Solutions',
        'Expert {specialty} Services',
      ],
      'value-focused': [
        'Quality Plumbing at Fair Prices',
        'Honest Plumbers, Honest Pricing',
        'Your Neighborhood Plumbing Experts',
      ],
      'emergency-focused': [
        '24/7 Emergency Plumbers',
        'When You Need Us Most',
        'Fast Response Plumbing Service',
      ],
      'balanced': [
        'Professional Plumbing Services',
        'Reliable Plumbing Solutions',
        'Your Trusted Local Plumbers',
      ],
    };
    
    const options = templates[strategy.positioning] || templates.balanced;
    return options[0].replace('{specialty}', strategy.differentiators[0] || 'Plumbing');
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
    
    // Upfront pricing
    if (userAnswers.upfrontPricing) {
      elements.push('upfront pricing');
    }
    
    if (elements.length === 0) {
      return 'Professional plumbing services for residential and commercial properties. Licensed, insured, and available 24/7.';
    }
    
    return `Expert plumbing services ${elements.join(', ')}. From repairs to installations, we do it all.`;
  }

  /**
   * Helper: Extract plumbing certifications
   */
  private extractPlumbingCertifications(insights: DataInsights, userAnswers: any): any[] {
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
    
    // Plumbing-specific certifications
    const plumbingCerts = [
      'Master Plumber',
      'Journeyman Plumber',
      'Backflow Certified',
      'Gas Line Certified',
      'Green Plumber Certified',
    ];
    
    plumbingCerts.forEach(cert => {
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
    
    // Add plumbing-specific services
    const plumbingServices = [
      'Drain Cleaning',
      'Leak Repair',
      'Water Heater Repair',
      'Pipe Repair',
      'Toilet Repair',
      'Faucet Installation',
      'Sewer Line Repair',
      'Emergency Plumbing',
      'Repiping',
      'Fixture Installation',
      'Water Line Repair',
      'Gas Line Services',
    ];
    
    plumbingServices.forEach(service => {
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
      
      // Emergency services always high priority
      if (service.name.toLowerCase().includes('emergency')) score += 40;
      
      // Common urgent issues
      const urgentKeywords = ['leak', 'drain', 'clog', 'burst', 'overflow'];
      if (urgentKeywords.some(kw => service.name.toLowerCase().includes(kw))) {
        score += 30;
      }
      
      // High-value services
      if (service.name.toLowerCase().includes('water heater') || 
          service.name.toLowerCase().includes('repipe')) {
        score += 25;
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
    enriched.pricing = this.getServicePricing(service, insights);
    
    // Add urgency for certain services
    if (service.name.toLowerCase().includes('emergency') || 
        service.name.toLowerCase().includes('leak')) {
      enriched.urgent = true;
      enriched.badge = 'Fast Response';
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
    
    // Plumbing-specific descriptions
    const descriptions: Record<string, string> = {
      'drain cleaning': 'Professional drain cleaning to clear clogs and prevent backups. We use advanced equipment to restore proper flow.',
      'leak repair': 'Fast, reliable leak detection and repair services. We fix all types of leaks to prevent water damage and save you money.',
      'water heater repair': 'Expert water heater repair and maintenance for all makes and models. Get your hot water back fast.',
      'pipe repair': 'Professional pipe repair services for burst, frozen, or damaged pipes. We fix it right the first time.',
      'toilet repair': 'Complete toilet repair services from running toilets to complete replacements. Same-day service available.',
      'faucet installation': 'Quality faucet installation and repair services. Update your fixtures with our professional installation.',
      'sewer line repair': 'Advanced sewer line repair using camera inspection and trenchless technology when possible.',
      'emergency plumbing': '24/7 emergency plumbing services for urgent repairs. We\'re here when you need us most.',
      'repiping': 'Complete home repiping services to replace old, corroded pipes with modern, reliable materials.',
      'fixture installation': 'Professional installation of all plumbing fixtures including sinks, toilets, showers, and more.',
    };
    
    return descriptions[service.name.toLowerCase()] || 
      `Professional ${service.name.toLowerCase()} services by licensed master plumbers.`;
  }

  /**
   * Helper: Generate plumbing-specific FAQs
   */
  private generatePlumbingFAQs(insights: DataInsights): any[] {
    const city = this.extractCity(insights);
    
    return [
      {
        question: 'How do I know if I have a water leak?',
        answer: 'Signs of a water leak include unexpectedly high water bills, the sound of running water when fixtures are off, wet spots on floors or walls, mold or mildew growth, and low water pressure. If you suspect a leak, call us for professional leak detection.',
      },
      {
        question: 'Should I use chemical drain cleaners?',
        answer: 'We recommend avoiding chemical drain cleaners as they can damage pipes and are harmful to the environment. Professional drain cleaning is safer and more effective. For minor clogs, try a plunger or call us for safe, thorough cleaning.',
      },
      {
        question: 'How often should I have my drains cleaned?',
        answer: 'For preventive maintenance, we recommend professional drain cleaning annually. Homes with frequent clogs, older plumbing, or large families may benefit from bi-annual cleaning.',
      },
      {
        question: 'Do you offer emergency plumbing services?',
        answer: insights.confirmed.emergency24_7 ? 
          'Yes! We offer 24/7 emergency plumbing services with rapid response times. Call us anytime for burst pipes, severe leaks, or other plumbing emergencies.' :
          'We offer priority service for urgent issues during business hours and can often accommodate same-day appointments.',
      },
      {
        question: 'What should I do if my toilet won\'t stop running?',
        answer: 'A running toilet usually indicates a faulty flapper, fill valve, or float. While you can try adjusting the float or replacing the flapper yourself, persistent issues require professional repair to prevent water waste.',
      },
    ];
  }

  /**
   * Helper: Generate local plumbing FAQs
   */
  private generateLocalPlumbingFAQs(insights: DataInsights): any[] {
    const city = this.extractCity(insights);
    
    return [
      {
        question: `What are common plumbing issues in ${city}?`,
        answer: `In ${city}, common issues include hard water buildup, pipe corrosion from mineral content, and seasonal temperature-related problems. Regular maintenance helps prevent these issues.`,
      },
      {
        question: `Do I need a permit for plumbing work in ${city}?`,
        answer: `Most major plumbing work in ${city} requires permits, including water heater replacement, repiping, and sewer line work. As licensed plumbers, we handle all permit requirements for you.`,
      },
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
    
    // Prefer professional or equipment photos
    const heroCandidate = photos.find((photo: any) => {
      const context = photoContexts[photo.id] || photo.context;
      return context?.includes('Professional') || context?.includes('Work');
    }) || photos[0];
    
    return {
      url: heroCandidate?.url || '/images/plumbing-hero-default.jpg',
      alt: heroCandidate?.alt || 'Professional plumbing services',
    };
  }

  private selectCompetitiveTrustSignals(
    insights: DataInsights,
    serpData: any,
    userAnswers: any
  ): string[] {
    const signals = [];
    
    // Plumbing-specific trust signals
    if (insights.confirmed.emergency24_7) {
      signals.push('24/7 Emergency Service');
    }
    
    if (insights.confirmed.certifications.some(c => c.includes('Master'))) {
      signals.push('Master Plumbers');
    }
    
    if (userAnswers.upfrontPricing !== false) {
      signals.push('Upfront Pricing');
    }
    
    // Add defaults if needed
    const defaults = ['Free Estimates', 'Licensed & Insured', 'Satisfaction Guaranteed'];
    while (signals.length < 3 && defaults.length > 0) {
      signals.push(defaults.shift()!);
    }
    
    return signals.slice(0, 3);
  }

  private extractHeroKeywords(insights: DataInsights, serpData: any): string[] {
    const keywords = new Set<string>();
    
    // Industry + location
    keywords.add('plumber');
    keywords.add('plumbing');
    keywords.add(this.extractCity(insights).toLowerCase());
    
    // Service-specific keywords
    keywords.add('plumbing repair');
    keywords.add('emergency plumber');
    
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
      'master': '🎓',
      'journeyman': '👷',
      'backflow': '🔧',
      'gas': '🔥',
      'green': '🌱',
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
    const hasEmergency = insights.confirmed.emergency24_7;
    
    if (hasEmergency) {
      return 'Complete Plumbing Services - 24/7';
    }
    
    return 'Professional Plumbing Services';
  }

  private generateServicesSubheadline(insights: DataInsights, services: any[]): string {
    const city = this.extractCity(insights);
    const hasCommercial = services.some(s => s.name.toLowerCase().includes('commercial'));
    
    if (hasCommercial) {
      return `Residential and commercial plumbing solutions for ${city}`;
    }
    
    return `Expert plumbing repairs and installations for ${city} homes`;
  }

  private shouldShowPricing(insights: DataInsights, serpData: any): boolean {
    // Show pricing if competitors hide it (transparency advantage)
    if (serpData?.competitorPricingTransparency === 'hidden') {
      return true;
    }
    
    // Show if we have pricing info
    return insights.confirmed.description?.includes('$') || false;
  }

  private getServiceFeatures(service: any, insights: DataInsights, userAnswers: any): string[] {
    const userFeatures = userAnswers.serviceFeatures?.[service.name];
    if (userFeatures) return userFeatures;
    
    const featureMap: Record<string, string[]> = {
      'drain cleaning': [
        'Video camera inspection',
        'Hydro jetting available',
        'Safe on all pipes',
        'Preventive maintenance',
      ],
      'leak repair': [
        'Leak detection',
        'Non-invasive methods',
        'All pipe types',
        'Warranty included',
      ],
      'water heater repair': [
        'All brands serviced',
        'Same-day service',
        'Tank & tankless',
        'Energy efficiency tips',
      ],
      'emergency plumbing': [
        '24/7 availability',
        'Fast response time',
        'Fully stocked trucks',
        'No extra charges',
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
      'drain': 'git-pull-request',
      'leak': 'droplet',
      'water heater': 'thermometer',
      'pipe': 'git-commit',
      'toilet': 'home',
      'faucet': 'droplets',
      'sewer': 'alert-triangle',
      'emergency': 'alert-circle',
      'repipe': 'git-branch',
      'fixture': 'wrench',
      'gas': 'flame',
    };
    
    const normalized = serviceName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (normalized.includes(key)) return icon;
    }
    
    return 'tool';
  }

  private getServicePricing(service: any, insights: DataInsights): string | undefined {
    const pricingMap: Record<string, string> = {
      'drain cleaning': 'Starting at $125',
      'leak repair': 'Free leak detection',
      'water heater repair': 'Diagnostic fee waived with repair',
      'emergency plumbing': 'No extra charge nights/weekends',
      'faucet installation': 'Starting at $200 + fixtures',
    };
    
    return pricingMap[service.name.toLowerCase()];
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
    
    // Extract plumbing-related keywords
    const plumbingKeywords = ['plumber', 'plumbing', 'pipe', 'drain', 'leak', 'water', 'toilet', 'faucet'];
    plumbingKeywords.forEach(keyword => {
      if (text.includes(keyword)) keywords.push(keyword);
    });
    
    return keywords;
  }

  private generateStrategicCTA(insights: DataInsights, serpData: any, strategy: any): any {
    let text = 'Get Free Estimate';
    let urgency = false;
    
    // If emergency service is a differentiator
    if (insights.confirmed.emergency24_7 || strategy.emphasis.includes('emergency-availability')) {
      text = 'Call Now - 24/7 Service';
      urgency = true;
    }
    
    // If upfront pricing is emphasized
    if (strategy.emphasis.includes('transparent-pricing')) {
      text = 'Get Upfront Quote';
    }
    
    return {
      text,
      action: urgency && insights.confirmed.primaryPhone ? 'phone' : 'quote-form',
      style: urgency ? 'urgent' : 'primary',
      icon: urgency ? '📞' : '📋',
    };
  }

  // Additional section populators
  private populateAboutSection(variant: string, insights: DataInsights, userAnswers: any): PopulatedSection {
    return {
      variant,
      content: {
        headline: `About ${insights.confirmed.businessName}`,
        story: userAnswers.aboutStory || this.generateAboutStory(insights),
        values: ['Quality Workmanship', 'Honest Pricing', 'Customer First'],
        teamPhoto: this.selectTeamPhoto(insights, userAnswers),
        familyOwned: userAnswers.familyOwned || insights.confirmed.description?.includes('family'),
      },
      metadata: {
        dataSource: ['gbp', 'user'],
        seoKeywords: ['about', 'plumbing company', insights.confirmed.businessName.toLowerCase()],
      },
    };
  }

  private populateGallerySection(variant: string, insights: DataInsights, userAnswers: any): PopulatedSection {
    const labeledPhotos = this.getLabeledPhotos(insights, userAnswers);
    const organizedPhotos = this.organizePhotosByType(labeledPhotos);
    
    return {
      variant,
      content: {
        headline: 'Our Recent Work',
        subheadline: 'Quality plumbing installations and repairs',
        items: organizedPhotos,
        categories: ['Bathroom', 'Kitchen', 'Water Heaters', 'Commercial'],
        layout: variant,
        showBeforeAfter: true,
      },
      metadata: {
        dataSource: ['gbp', 'user'],
        seoKeywords: ['plumbing gallery', 'plumbing work', 'plumber portfolio'],
      },
    };
  }

  private populateTestimonialsSection(variant: string, insights: DataInsights): PopulatedSection {
    return {
      variant,
      content: {
        headline: 'What Our Customers Say',
        testimonials: insights.confirmed.reviews.highlights.slice(0, 3).map((review: string) => ({
          text: review,
          rating: 5,
          source: 'Google',
        })),
        averageRating: insights.confirmed.reviews.rating,
        totalReviews: insights.confirmed.reviews.count,
        ctaText: 'Read More Reviews',
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: ['plumber reviews', 'testimonials', 'customer reviews'],
      },
    };
  }

  private populateServiceAreasSection(variant: string, insights: DataInsights): PopulatedSection {
    return {
      variant,
      content: {
        headline: 'Areas We Serve',
        subheadline: 'Fast response times throughout the area',
        areas: insights.confirmed.serviceArea,
        mapCenter: insights.confirmed.coordinates,
        radius: insights.confirmed.serviceRadius || '25 miles',
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: insights.confirmed.serviceArea.map(area => `plumber ${area.toLowerCase()}`),
      },
    };
  }

  private populateCTASection(variant: string, insights: DataInsights, strategy: any): PopulatedSection {
    const isUrgent = strategy.emphasis.includes('emergency-availability');
    
    return {
      variant,
      content: {
        headline: isUrgent ? 'Plumbing Emergency?' : 'Need a Reliable Plumber?',
        subheadline: isUrgent ? 'We\'re available 24/7 for emergencies' : 'Get your free estimate today',
        primaryCTA: {
          text: isUrgent ? 'Call Now' : 'Get Free Quote',
          action: isUrgent ? 'phone' : 'quote-form',
        },
        phoneNumber: insights.confirmed.primaryPhone,
        features: ['Free Estimates', 'Licensed & Insured', 'Satisfaction Guaranteed'],
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: ['plumber quote', 'free plumbing estimate', 'plumber near me'],
      },
    };
  }

  private populateContactSection(variant: string, insights: DataInsights): PopulatedSection {
    return {
      variant,
      content: {
        headline: 'Contact Us',
        phoneNumber: insights.confirmed.primaryPhone,
        email: insights.confirmed.email,
        address: insights.confirmed.address,
        hours: insights.confirmed.hours,
        emergencyAvailable: insights.confirmed.emergency24_7,
        preferredContact: 'Call for fastest response',
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: ['contact plumber', 'plumber ' + this.extractCity(insights).toLowerCase()],
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
    
    return `For ${years ? `over ${years} years` : 'years'}, ${insights.confirmed.businessName} has been ${city}'s trusted plumbing experts. We're committed to providing honest, reliable service at fair prices. Our licensed plumbers treat your home with respect and get the job done right the first time.`;
  }

  private selectTeamPhoto(insights: DataInsights, userAnswers: any): any {
    const photos = this.getLabeledPhotos(insights, userAnswers);
    const teamPhoto = photos.find(p => p.category === 'team');
    
    return {
      url: teamPhoto?.url || '/images/plumbing-team-default.jpg',
      alt: teamPhoto?.alt || `${insights.confirmed.businessName} team`,
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
    if (!context) return `${businessName} plumbing work`;
    
    const contextStr = typeof context === 'string' ? context : context.label || '';
    return `${contextStr} - ${businessName}`;
  }

  private categorizePhoto(context: any): string {
    if (!context) return 'general';
    
    const contextStr = typeof context === 'string' ? context : context.label || '';
    
    if (contextStr.includes('Bathroom')) return 'bathroom';
    if (contextStr.includes('Kitchen')) return 'kitchen';
    if (contextStr.includes('Water Heater')) return 'waterheater';
    if (contextStr.includes('Commercial')) return 'commercial';
    if (contextStr.includes('Team')) return 'team';
    
    return 'general';
  }

  private organizePhotosByType(photos: any[]): any[] {
    const categoryOrder = ['bathroom', 'kitchen', 'waterheater', 'commercial', 'team', 'general'];
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

export const enhancedPlumbingPopulator = new EnhancedPlumbingPopulator();
