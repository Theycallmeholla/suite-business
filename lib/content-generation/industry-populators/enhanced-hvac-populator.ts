/**
 * Enhanced Content Populator for HVAC
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

export class EnhancedHVACPopulator {
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
          text: 'Free Estimate',
          action: 'quote-form',
          style: 'secondary',
        },
        backgroundImage: heroImage.url,
        imageAlt: heroImage.alt,
        overlay: variant === 'hero-elegant' ? 'gradient' : 'dark',
        trustSignals,
        phoneNumber: insights.confirmed.primaryPhone,
        emergencyBadge: insights.confirmed.emergency24_7 || strategy.emphasis.includes('emergency-availability'),
        temperatureDisplay: true, // HVAC-specific feature
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
        ctaText: 'Schedule Service',
        emergencyCallout: insights.confirmed.emergency24_7,
      },
      metadata: {
        dataSource: ['gbp', 'places', 'serp', 'user'],
        seoKeywords: enrichedServices.flatMap(s => s.keywords),
        competitiveAdvantage: 'comprehensive-services',
      },
    };
  }

  /**
   * Populate Emergency Section (HVAC-specific)
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
        headline: '24/7 Emergency HVAC Service',
        subheadline: 'No heat? No AC? We\'re here when you need us most.',
        phoneNumber: insights.confirmed.primaryPhone,
        features: [
          'Same-day emergency repairs',
          'Available nights & weekends',
          'No overtime charges',
          'Priority response time',
        ],
        backgroundColor: 'red',
        icon: 'alert-circle',
      },
      metadata: {
        dataSource: ['gbp', 'user'],
        seoKeywords: ['emergency hvac', '24/7 hvac service', 'emergency repair'],
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
      // HVAC-specific certifications
      ...this.extractHVACCertifications(insights, userAnswers),
      
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
      
      // Brand partnerships
      ...(userAnswers.brandPartnerships || []).map((brand: string) => ({
        type: 'partnership',
        title: `${brand} Authorized Dealer`,
        icon: '🤝',
        verified: true,
      })),
      
      // Energy efficiency expertise
      (userAnswers.energyEfficiency || insights.confirmed.description?.includes('energy')) && {
        type: 'expertise',
        title: 'Energy Efficiency Expert',
        icon: '💚',
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
        seoKeywords: ['certified hvac', 'licensed hvac', 'insured', ...this.extractCertKeywords(insights)],
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
    const industryFAQs = this.generateHVACFAQs(insights);
    
    // Add location-specific questions
    const localFAQs = this.generateLocalHVACFAQs(insights);
    
    // Combine and deduplicate
    const allFAQs = this.combineFAQs(paaQuestions, industryFAQs, localFAQs);
    
    return {
      variant,
      content: {
        headline: 'Frequently Asked Questions',
        subheadline: 'Get answers to common HVAC questions',
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
        'Premium HVAC Solutions for Your Comfort',
        'Expert Heating & Cooling Excellence',
        'Professional Climate Control Services',
      ],
      'specialist': [
        `${city}'s ${strategy.differentiators[0]} Experts`,
        'Specialized HVAC Solutions',
        'Expert {specialty} Services',
      ],
      'value-focused': [
        'Reliable HVAC Service at Fair Prices',
        'Honest Pricing, Quality Service',
        'Your Trusted HVAC Professionals',
      ],
      'emergency-focused': [
        '24/7 Emergency HVAC Service',
        'Always Available When You Need Us',
        'Emergency Heating & Cooling Repair',
      ],
      'balanced': [
        'Complete Heating & Cooling Solutions',
        'Professional HVAC Services',
        'Your Comfort is Our Priority',
      ],
    };
    
    const options = templates[strategy.positioning] || templates.balanced;
    return options[0].replace('{specialty}', strategy.differentiators[0] || 'HVAC');
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
    
    // Energy efficiency focus
    if (userAnswers.energyEfficiency) {
      elements.push('energy-efficient solutions');
    }
    
    if (elements.length === 0) {
      return 'Professional heating & cooling services. Licensed, insured, and committed to your comfort.';
    }
    
    return `Expert HVAC services ${elements.join(', ')}. Keep your home comfortable year-round.`;
  }

  /**
   * Helper: Extract HVAC certifications
   */
  private extractHVACCertifications(insights: DataInsights, userAnswers: any): any[] {
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
    
    // HVAC-specific certifications
    const hvacCerts = [
      'EPA Certified',
      'NATE Certified',
      'Factory Authorized',
      'Energy Star Partner',
    ];
    
    hvacCerts.forEach(cert => {
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
    
    // Add HVAC-specific services
    const hvacServices = [
      'AC Repair',
      'Heating Repair',
      'HVAC Installation',
      'Preventive Maintenance',
      'Indoor Air Quality',
      'Duct Cleaning',
      'Thermostat Installation',
      'Emergency Service',
    ];
    
    hvacServices.forEach(service => {
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
      
      // Seasonal priority (adjust based on current season)
      const currentMonth = new Date().getMonth();
      const isSummer = currentMonth >= 5 && currentMonth <= 8;
      
      if (isSummer && service.name.toLowerCase().includes('ac')) score += 30;
      if (!isSummer && service.name.toLowerCase().includes('heat')) score += 30;
      
      // Emergency services always high priority
      if (service.name.toLowerCase().includes('emergency')) score += 40;
      
      // Check search demand from SERP
      if (serpData?.serviceKeywordVolume?.[service.name.toLowerCase()]) {
        score += serpData.serviceKeywordVolume[service.name.toLowerCase()];
      }
      
      // Installation services (high value)
      if (service.name.toLowerCase().includes('installation')) score += 25;
      
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
    if (service.name.toLowerCase().includes('emergency')) {
      enriched.urgent = true;
      enriched.badge = '24/7 Available';
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
    
    // HVAC-specific descriptions
    const descriptions: Record<string, string> = {
      'ac repair': 'Fast, reliable air conditioning repair services to keep you cool. We fix all makes and models with same-day service available.',
      'heating repair': 'Expert furnace and heating system repairs to keep your home warm. 24/7 emergency service for those cold nights.',
      'hvac installation': 'Professional installation of energy-efficient heating and cooling systems. We help you choose the right system for your home and budget.',
      'preventive maintenance': 'Regular maintenance plans to keep your HVAC system running efficiently, prevent breakdowns, and extend equipment life.',
      'indoor air quality': 'Improve your home\'s air quality with advanced filtration, UV lights, and humidity control solutions.',
      'duct cleaning': 'Professional duct cleaning services to remove dust, allergens, and improve your system\'s efficiency.',
      'thermostat installation': 'Smart thermostat installation and programming to maximize comfort and energy savings.',
      'emergency service': '24/7 emergency HVAC repairs when you need them most. No overtime charges for nights and weekends.',
    };
    
    return descriptions[service.name.toLowerCase()] || 
      `Professional ${service.name.toLowerCase()} services by certified HVAC technicians.`;
  }

  /**
   * Helper: Generate HVAC-specific FAQs
   */
  private generateHVACFAQs(insights: DataInsights): any[] {
    const city = this.extractCity(insights);
    
    return [
      {
        question: 'How often should I service my HVAC system?',
        answer: 'We recommend professional maintenance twice a year - once in spring for your AC and once in fall for your heating system. Regular maintenance prevents breakdowns, improves efficiency, and extends equipment life.',
      },
      {
        question: 'What size HVAC system do I need?',
        answer: 'The right size depends on your home\'s square footage, insulation, windows, and climate. Our technicians perform a detailed load calculation to recommend the perfect size system for optimal comfort and efficiency.',
      },
      {
        question: 'How long do HVAC systems typically last?',
        answer: 'With proper maintenance, air conditioners typically last 15-20 years and furnaces 20-30 years. Regular maintenance can significantly extend your system\'s lifespan.',
      },
      {
        question: 'Do you offer emergency HVAC service?',
        answer: insights.confirmed.emergency24_7 ? 
          'Yes! We offer 24/7 emergency service with no overtime charges. Call us anytime your heating or cooling fails.' :
          'We offer priority service during business hours and can schedule urgent repairs quickly.',
      },
      {
        question: 'What brands do you service?',
        answer: 'We service all major HVAC brands including Carrier, Trane, Lennox, Rheem, Goodman, and more. Our technicians are factory-trained and certified.',
      },
    ];
  }

  /**
   * Helper: Generate local HVAC FAQs
   */
  private generateLocalHVACFAQs(insights: DataInsights): any[] {
    const city = this.extractCity(insights);
    
    return [
      {
        question: `What's the best HVAC system for ${city}'s climate?`,
        answer: `In ${city}, we recommend high-efficiency systems with good humidity control. Heat pumps work well for our mild winters, while high-SEER air conditioners handle our hot summers efficiently.`,
      },
      {
        question: `How can I reduce my energy bills in ${city}?`,
        answer: `Start with regular maintenance, seal air leaks, upgrade to a programmable thermostat, and consider a high-efficiency system. We offer free energy assessments to identify savings opportunities.`,
      },
    ];
  }

  // Reusable helper methods from landscaping populator
  private extractCity(insights: DataInsights): string {
    const serviceArea = insights.confirmed.serviceArea[0] || '';
    const addressMatch = serviceArea.match(/([A-Za-z\s]+),?\s*[A-Z]{2}/);
    return addressMatch?.[1] || 'your area';
  }

  private selectHeroImage(insights: DataInsights, userAnswers: any): any {
    const photos = insights.confirmed.photos || [];
    const photoContexts = userAnswers.photoContexts || {};
    
    // Prefer installation or equipment photos
    const heroCandidate = photos.find((photo: any) => {
      const context = photoContexts[photo.id] || photo.context;
      return context?.includes('Installation') || context?.includes('Equipment');
    }) || photos[0];
    
    return {
      url: heroCandidate?.url || '/images/hvac-hero-default.jpg',
      alt: heroCandidate?.alt || 'Professional HVAC services',
    };
  }

  private selectCompetitiveTrustSignals(
    insights: DataInsights,
    serpData: any,
    userAnswers: any
  ): string[] {
    const signals = [];
    
    // HVAC-specific trust signals
    if (insights.confirmed.emergency24_7) {
      signals.push('24/7 Emergency Service');
    }
    
    if (insights.confirmed.certifications.some(c => c.includes('EPA'))) {
      signals.push('EPA Certified');
    }
    
    if (userAnswers.brandPartnerships?.length > 0) {
      signals.push(`${userAnswers.brandPartnerships[0]} Dealer`);
    }
    
    // Add defaults if needed
    const defaults = ['Free Estimates', 'Licensed & Insured', 'Same Day Service'];
    while (signals.length < 3 && defaults.length > 0) {
      signals.push(defaults.shift()!);
    }
    
    return signals.slice(0, 3);
  }

  private extractHeroKeywords(insights: DataInsights, serpData: any): string[] {
    const keywords = new Set<string>();
    
    // Industry + location
    keywords.add('hvac');
    keywords.add('heating and cooling');
    keywords.add(this.extractCity(insights).toLowerCase());
    
    // Service-specific keywords
    keywords.add('ac repair');
    keywords.add('furnace repair');
    
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
      'epa': '🌍',
      'nate': '🎓',
      'energy star': '⭐',
      'factory': '🏭',
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
    return 'Complete HVAC Services';
  }

  private generateServicesSubheadline(insights: DataInsights, services: any[]): string {
    const city = this.extractCity(insights);
    const hasEmergency = services.some(s => s.name.toLowerCase().includes('emergency'));
    
    if (hasEmergency) {
      return `Professional heating & cooling solutions for ${city} homes. 24/7 emergency service available.`;
    }
    
    return `Expert HVAC solutions for ${city} homes and businesses`;
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
      'ac repair': [
        'Same-day service',
        'All brands serviced',
        'Diagnostic included',
        'Warranty on repairs',
      ],
      'heating repair': [
        'Emergency service',
        'Gas & electric systems',
        'Safety inspection',
        'Guaranteed repairs',
      ],
      'hvac installation': [
        'Free in-home estimate',
        'Energy-efficient options',
        'Flexible financing',
        'Professional installation',
      ],
      'preventive maintenance': [
        'Bi-annual service',
        'Priority scheduling',
        'Discounted repairs',
        'Extended warranty',
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
      'ac': 'snowflake',
      'air conditioning': 'snowflake',
      'cooling': 'snowflake',
      'heating': 'flame',
      'furnace': 'flame',
      'heat': 'flame',
      'installation': 'wrench',
      'maintenance': 'clipboard-check',
      'emergency': 'alert-circle',
      'duct': 'wind',
      'air quality': 'wind',
      'thermostat': 'thermometer',
    };
    
    const normalized = serviceName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (normalized.includes(key)) return icon;
    }
    
    return 'settings';
  }

  private getServicePricing(service: any, insights: DataInsights): string | undefined {
    const pricingMap: Record<string, string> = {
      'ac repair': 'Starting at $89 diagnostic',
      'heating repair': 'Starting at $89 diagnostic',
      'hvac installation': 'Free in-home estimate',
      'preventive maintenance': 'Plans from $15/month',
      'emergency service': 'No overtime charges',
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
    
    // Extract HVAC-related keywords
    const hvacKeywords = ['hvac', 'heating', 'cooling', 'ac', 'furnace', 'air', 'temperature'];
    hvacKeywords.forEach(keyword => {
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
    
    // Seasonal urgency
    const currentMonth = new Date().getMonth();
    const isSummer = currentMonth >= 5 && currentMonth <= 8;
    const isWinter = currentMonth === 11 || currentMonth <= 1;
    
    if ((isSummer || isWinter) && !urgency) {
      text = isSummer ? 'Beat the Heat - Schedule Now' : 'Stay Warm - Schedule Service';
    }
    
    return {
      text,
      action: urgency && insights.confirmed.primaryPhone ? 'phone' : 'quote-form',
      style: urgency ? 'urgent' : 'primary',
      icon: urgency ? '📞' : '📋',
    };
  }

  // Additional section populators...
  private populateAboutSection(variant: string, insights: DataInsights, userAnswers: any): PopulatedSection {
    return {
      variant,
      content: {
        headline: `About ${insights.confirmed.businessName}`,
        story: userAnswers.aboutStory || this.generateAboutStory(insights),
        values: ['Quality Service', 'Fair Pricing', 'Customer Satisfaction'],
        teamPhoto: this.selectTeamPhoto(insights, userAnswers),
      },
      metadata: {
        dataSource: ['gbp', 'user'],
        seoKeywords: ['about', 'hvac company', insights.confirmed.businessName.toLowerCase()],
      },
    };
  }

  private populateGallerySection(variant: string, insights: DataInsights, userAnswers: any): PopulatedSection {
    const labeledPhotos = this.getLabeledPhotos(insights, userAnswers);
    const organizedPhotos = this.organizePhotosByType(labeledPhotos);
    
    return {
      variant,
      content: {
        headline: 'Our Recent Projects',
        subheadline: 'Quality HVAC installations and repairs',
        items: organizedPhotos,
        categories: ['Installations', 'Repairs', 'Equipment', 'Team'],
        layout: variant,
      },
      metadata: {
        dataSource: ['gbp', 'user'],
        seoKeywords: ['hvac gallery', 'hvac projects', 'installations'],
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
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: ['reviews', 'testimonials', 'customer feedback'],
      },
    };
  }

  private populateServiceAreasSection(variant: string, insights: DataInsights): PopulatedSection {
    return {
      variant,
      content: {
        headline: 'Areas We Serve',
        areas: insights.confirmed.serviceArea,
        mapCenter: insights.confirmed.coordinates,
        radius: insights.confirmed.serviceRadius || '30 miles',
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
        headline: isUrgent ? 'Need Emergency HVAC Service?' : 'Ready to Improve Your Comfort?',
        subheadline: isUrgent ? 'We\'re available 24/7 for emergencies' : 'Schedule your free consultation today',
        primaryCTA: {
          text: isUrgent ? 'Call Now' : 'Get Free Quote',
          action: isUrgent ? 'phone' : 'quote-form',
        },
        phoneNumber: insights.confirmed.primaryPhone,
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: ['hvac quote', 'free estimate', 'hvac consultation'],
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
      },
      metadata: {
        dataSource: ['gbp'],
        seoKeywords: ['contact', 'hvac near me', 'hvac ' + this.extractCity(insights).toLowerCase()],
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
    
    return `For ${years ? `over ${years} years` : 'years'}, ${insights.confirmed.businessName} has been keeping ${city} homes comfortable. We're a locally-owned HVAC company committed to providing reliable, professional service at fair prices. Our certified technicians are experts in all heating and cooling systems.`;
  }

  private selectTeamPhoto(insights: DataInsights, userAnswers: any): any {
    const photos = this.getLabeledPhotos(insights, userAnswers);
    const teamPhoto = photos.find(p => p.category === 'team');
    
    return {
      url: teamPhoto?.url || '/images/hvac-team-default.jpg',
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
    if (!context) return `${businessName} HVAC work`;
    
    const contextStr = typeof context === 'string' ? context : context.label || '';
    return `${contextStr} - ${businessName}`;
  }

  private categorizePhoto(context: any): string {
    if (!context) return 'general';
    
    const contextStr = typeof context === 'string' ? context : context.label || '';
    
    if (contextStr.includes('Install')) return 'installations';
    if (contextStr.includes('Repair')) return 'repairs';
    if (contextStr.includes('Equipment')) return 'equipment';
    if (contextStr.includes('Team')) return 'team';
    
    return 'general';
  }

  private organizePhotosByType(photos: any[]): any[] {
    const categoryOrder = ['installations', 'equipment', 'repairs', 'team', 'general'];
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

export const enhancedHVACPopulator = new EnhancedHVACPopulator();
