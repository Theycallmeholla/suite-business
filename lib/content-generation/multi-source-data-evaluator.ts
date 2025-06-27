/**
 * Multi-Source Data Evaluator
 * 
 * Evaluates data quality from ALL sources:
 * 1. Google Business Profile API
 * 2. Google Places API  
 * 3. DataForSEO SERP data
 * 4. User form responses
 * 
 * Intelligently combines insights to determine what we know
 * and what we still need to ask.
 */

import { BusinessIntelligenceData } from '@/types/intelligence';

export interface MultiSourceData {
  gbp: any;           // Google Business Profile data
  places: any;        // Places API data
  serp: any;          // DataForSEO SERP data
  userAnswers: any;   // User form responses
}

export interface DataInsights {
  // What we definitively know
  confirmed: {
    businessName: string;
    description?: string;
    services: string[];
    photos: Array<{ id?: string; url: string; context?: string }>;
    reviews: { count: number; rating: number; highlights: string[] };
    hours: any;
    attributes: string[];
    certifications: string[];
    yearsInBusiness?: number;
    serviceArea: string[];
    competitors: string[];
    marketPosition: string;
    primaryPhone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    website?: string;
    coordinates?: { lat: number; lng: number };
    logo?: { url: string };
    emergency24_7?: boolean;
    serviceRadius?: string;
  };
  
  // What we found but need confirmation
  needsConfirmation: {
    claims: string[];           // Claims found in description
    services: string[];         // Services mentioned but not confirmed
    specializations: string[];  // Potential specializations found
  };
  
  // What we don't know
  missingData: string[];  // List of missing data points
  
  // Quality scores by source
  sourceQuality: {
    gbp: number;
    places: number;
    serp: number;
    user: number;
  };
  
  // Overall quality assessment
  overallQuality: number;  // 0-1 score
}

export class MultiSourceDataEvaluator {
  /**
   * Evaluate data from all sources
   */
  evaluateAllSources(data: MultiSourceData): DataInsights {
    // Extract insights from each source
    const gbpInsights = this.extractGBPInsights(data.gbp);
    const placesInsights = this.extractPlacesInsights(data.places);
    const serpInsights = this.extractSERPInsights(data.serp);
    const userInsights = this.extractUserInsights(data.userAnswers);
    
    // Merge and deduplicate data
    const merged = this.mergeInsights(gbpInsights, placesInsights, serpInsights, userInsights);
    
    // Extract certifications from description if available
    if (merged.description && !merged.certifications.length) {
      const certMatches = merged.description.match(/\b(EPA certified|licensed|insured|bonded)\b/gi);
      if (certMatches) {
        merged.certifications.push(...certMatches);
      }
    }
    
    // Identify what needs confirmation
    const needsConfirmation = this.identifyUnconfirmedClaims(merged);
    
    // Identify what's missing
    const missing = this.identifyMissingData(merged);
    
    // Calculate quality scores
    const sourceQuality = this.calculateSourceQuality(data);
    
    return {
      confirmed: merged,
      needsConfirmation,
      missingData: missing,
      sourceQuality,
      overallQuality: (sourceQuality.gbp + sourceQuality.places + sourceQuality.serp + sourceQuality.user) / 400,
    };
  }

  /**
   * Extract insights from Google Business Profile
   */
  private extractGBPInsights(gbp: any) {
    if (!gbp) return null;
    
    return {
      businessName: gbp.title || gbp.name,
      description: gbp.profile?.description || gbp.description,
      primaryPhone: gbp.primaryPhone,
      fullAddress: gbp.fullAddress,
      services: [
        ...(gbp.primaryCategory?.serviceTypes?.map((s: any) => s.displayName) || []),
        ...(gbp.additionalCategories?.flatMap((cat: any) => 
          cat.serviceTypes?.map((s: any) => s.displayName) || []
        ) || [])
      ],
      photos: gbp.photos?.map((p: any) => ({
        id: p.name?.split('/').pop() || undefined,
        url: p.photoUrl || p.url,
        category: p.category, // EXTERIOR, INTERIOR, PRODUCT, etc.
      })) || [],
      reviews: {
        count: gbp.userRatingCount || 0,
        rating: gbp.rating || 0,
      },
      hours: gbp.regularHours,
      attributes: Object.entries(gbp.attributes || {})
        .filter(([_, value]) => value === true)
        .map(([key, _]) => this.humanizeAttribute(key)),
      serviceArea: gbp.serviceArea?.places?.placeInfos?.map((p: any) => p.placeName) || [],
      website: gbp.website,
    };
  }

  /**
   * Extract insights from Places API
   */
  private extractPlacesInsights(places: any) {
    if (!places) return null;
    
    return {
      photos: places.photos?.map((p: any) => ({
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
        attribution: p.html_attributions,
      })) || [],
      reviews: {
        highlights: this.extractReviewHighlights(places.reviews),
        sentiment: this.analyzeSentiment(places.reviews),
      },
      popularTimes: places.popular_times,
      priceLevel: places.price_level,
      types: places.types, // Can indicate service types
    };
  }

  /**
   * Extract insights from SERP data
   */
  private extractSERPInsights(serp: any) {
    if (!serp) return null;
    
    return {
      competitors: this.extractCompetitors(serp),
      marketPosition: this.analyzeMarketPosition(serp),
      commonServices: this.extractCommonServices(serp),
      pricingInsights: this.extractPricingInsights(serp),
      localKeywords: this.extractLocalKeywords(serp),
    };
  }

  /**
   * Extract insights from user answers
   */
  private extractUserInsights(userAnswers: any) {
    if (!userAnswers) return null;
    
    return {
      confirmedServices: userAnswers.services || [],
      awards: userAnswers.awards || [],
      teamSize: userAnswers.teamSize,
      specializations: userAnswers.specializations || [],
      differentiators: userAnswers.differentiators || [],
      photoContexts: userAnswers.photoContexts || {}, // Photo ID -> description
      projectExamples: userAnswers.projectExamples || [],
      priceRange: userAnswers.priceRange,
    };
  }

  /**
   * Identify missing data points
   */
  private identifyMissingData(merged: any): string[] {
    const missing = [];
    
    // Check for missing critical data
    if (!merged.awards || merged.awards.length === 0) {
      missing.push('awards');
    }
    
    if (!merged.teamSize) {
      missing.push('team_size');
    }
    
    if (!merged.photoContexts || Object.keys(merged.photoContexts).length === 0) {
      missing.push('photo_context');
    }
    
    if (!merged.differentiators || merged.differentiators.length === 0) {
      missing.push('differentiators');
    }
    
    if (!merged.specializations || merged.specializations.length === 0) {
      missing.push('specializations');
    }
    
    if (!merged.priceRange) {
      missing.push('price_range');
    }
    
    if (!merged.yearsInBusiness) {
      missing.push('years_in_business');
    }
    
    return missing;
  }

  /**
   * Merge insights from all sources
   */
  private mergeInsights(gbpInsights: any, placesInsights: any, serpInsights: any, userInsights: any) {
    const merged: any = {
      businessName: '',
      description: '',
      services: [],
      photos: [],
      reviews: { count: 0, rating: 0, highlights: [] },
      hours: null,
      attributes: [],
      certifications: [],
      yearsInBusiness: undefined,
      serviceArea: [],
      competitors: [],
      marketPosition: 'competitive',
      primaryPhone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      website: '',
      coordinates: undefined,
      logo: undefined,
      emergency24_7: false,
      serviceRadius: '',
    };
    
    // Merge GBP data (highest priority)
    if (gbpInsights) {
      merged.businessName = gbpInsights.businessName || merged.businessName;
      merged.description = gbpInsights.description || merged.description;
      merged.services = [...new Set([...merged.services, ...(gbpInsights.services || [])])];
      merged.photos = gbpInsights.photos || merged.photos;
      merged.reviews.count = gbpInsights.reviews?.count || 0;
      merged.reviews.rating = gbpInsights.reviews?.rating || 0;
      merged.hours = gbpInsights.hours;
      merged.attributes = gbpInsights.attributes || [];
      merged.serviceArea = gbpInsights.serviceArea || [];
      merged.website = gbpInsights.website || '';
      
      // Extract phone from GBP
      if (gbpInsights.primaryPhone) {
        merged.primaryPhone = gbpInsights.primaryPhone;
      }
      
      // Extract address components
      if (gbpInsights.fullAddress) {
        merged.address = gbpInsights.fullAddress.addressLines?.join(', ') || '';
        merged.city = gbpInsights.fullAddress.locality || '';
        merged.state = gbpInsights.fullAddress.administrativeArea || '';
        merged.zip = gbpInsights.fullAddress.postalCode || '';
      }
      
      // Extract certifications from attributes
      merged.attributes.forEach((attr: string) => {
        if (this.isCertification(attr)) {
          merged.certifications.push(attr);
        }
      });
    }
    
    // Merge Places data
    if (placesInsights) {
      // Add Places photos if we don't have enough from GBP
      if (merged.photos.length < 10 && placesInsights.photos) {
        merged.photos = [...merged.photos, ...placesInsights.photos];
      }
      
      // Merge review highlights
      if (placesInsights.reviews?.highlights) {
        merged.reviews.highlights = placesInsights.reviews.highlights;
      }
    }
    
    // Merge SERP data
    if (serpInsights) {
      merged.competitors = serpInsights.competitors || [];
      merged.marketPosition = serpInsights.marketPosition || 'competitive';
      
      // Add services found in SERP but not in GBP
      if (serpInsights.commonServices) {
        serpInsights.commonServices.forEach((service: string) => {
          if (!merged.services.includes(service)) {
            merged.services.push(service);
          }
        });
      }
    }
    
    // Merge user data (highest priority for certain fields)
    if (userInsights) {
      // User confirmed data overrides everything
      if (userInsights.confirmedServices?.length > 0) {
        merged.services = [...new Set([...merged.services, ...userInsights.confirmedServices])];
      }
      
      if (userInsights.awards?.length > 0) {
        merged.awards = userInsights.awards;
      }
      
      if (userInsights.teamSize) {
        merged.teamSize = userInsights.teamSize;
      }
      
      if (userInsights.specializations?.length > 0) {
        merged.specializations = userInsights.specializations;
      }
      
      if (userInsights.differentiators?.length > 0) {
        merged.differentiators = userInsights.differentiators;
      }
      
      if (userInsights.photoContexts) {
        merged.photoContexts = userInsights.photoContexts;
        // Apply contexts to photos
        merged.photos = merged.photos.map((photo: any, index: number) => {
          const photoId = photo.id || `photo-${index}`;
          if (merged.photoContexts[photoId]) {
            return {
              ...photo,
              id: photoId,
              context: merged.photoContexts[photoId],
            };
          }
          return { ...photo, id: photoId };
        });
      }
      
      if (userInsights.priceRange) {
        merged.priceRange = userInsights.priceRange;
      }
      
      // Extract years in business from user data
      if (userInsights.yearsInBusiness) {
        merged.yearsInBusiness = userInsights.yearsInBusiness;
      }
    }
    
    // Try to extract years in business from description if not provided
    if (!merged.yearsInBusiness && merged.description) {
      const yearsMatch = merged.description.match(/(\d+)\+?\s*years?/i);
      if (yearsMatch) {
        merged.yearsInBusiness = parseInt(yearsMatch[1]);
      }
    }
    
    return merged;
  }

  /**
   * Identify claims that need user confirmation
   */
  private identifyUnconfirmedClaims(data: any): any {
    const needsConfirmation = {
      claims: [],
      services: [],
      specializations: [],
    };
    
    // Extract claims from description
    if (data.description) {
      const claims = this.extractClaimsFromText(data.description);
      needsConfirmation.claims = claims.filter(claim => 
        !this.isVerifiedByData(claim, data)
      );
    }
    
    // Services mentioned in reviews but not in official services
    const reviewMentionedServices = this.extractServicesFromReviews(data.reviews);
    needsConfirmation.services = reviewMentionedServices.filter(service =>
      !data.services.includes(service)
    );
    
    return needsConfirmation;
  }

  /**
   * Extract claims from description text
   */
  private extractClaimsFromText(text: string): string[] {
    const claims = [];
    
    // Years in business
    const yearsMatch = text.match(/(\d+)\+?\s*years?/i);
    if (yearsMatch) {
      claims.push(`${yearsMatch[1]} years in business`);
    }
    
    // Award claims
    const awardPatterns = [
      /award.winning/i,
      /best of \w+/i,
      /top.rated/i,
      /#1 \w+/i,
    ];
    awardPatterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match) claims.push(match[0]);
    });
    
    // Certification claims
    const certPatterns = [
      /certified \w+/i,
      /licensed \w+/i,
      /accredited/i,
    ];
    certPatterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match) claims.push(match[0]);
    });
    
    return claims;
  }

  /**
   * Generate intelligent questions based on data analysis
   */
  generateIntelligentQuestions(insights: DataInsights): any[] {
    const questions = [];
    
    // 1. Confirm claims found in description
    if (insights.needsConfirmation.claims.length > 0) {
      questions.push({
        id: 'confirm-claims',
        type: 'multi-select',
        question: 'We found these claims about your business. Please confirm which are accurate:',
        options: insights.needsConfirmation.claims,
        required: false,
      });
    }
    
    // 2. Ask about awards if not found
    if (insights.missing.awards) {
      questions.push({
        id: 'awards',
        type: 'text-list',
        question: 'Have you received any awards or recognition? (Optional)',
        placeholder: 'e.g., Best of Houston 2023, BBB A+ Rating',
        required: false,
      });
    }
    
    // 3. Photo context - show their photos and ask for context
    if (insights.confirmed.photos.length > 0 && insights.missing.photoContext) {
      questions.push({
        id: 'photo-context',
        type: 'photo-labeling',
        question: 'Help us showcase your best work. What do these photos show?',
        photos: insights.confirmed.photos.slice(0, 6).map((p, i) => ({
          id: `photo-${i}`,
          url: p.url,
          currentLabel: p.context,
        })),
        options: [
          'Completed project',
          'Before/After',
          'Team at work',
          'Equipment/Tools',
          'Award/Recognition',
          'Happy customer',
          'Other',
        ],
        allowCustomLabel: true,
      });
    }
    
    // 4. Specific expertise within confirmed services
    if (insights.confirmed.services.length > 0) {
      questions.push({
        id: 'specializations',
        type: 'multi-select',
        question: `Within your ${insights.confirmed.services[0]} services, what are your specialties?`,
        options: this.getSpecializationOptions(insights.confirmed.services[0]),
        allowCustom: true,
        required: false,
      });
    }
    
    // 5. Price range (if not found in SERP data)
    if (insights.missing.priceRange && !insights.confirmed.marketPosition.includes('budget')) {
      questions.push({
        id: 'price-position',
        type: 'single-select',
        question: 'How would you describe your pricing compared to competitors?',
        options: [
          'Budget-friendly',
          'Competitive/Fair',
          'Premium quality at premium price',
          'Prefer not to say',
        ],
        required: false,
      });
    }
    
    // 6. Team size (affects trust)
    if (insights.missing.teamSize) {
      questions.push({
        id: 'team-size',
        type: 'single-select',
        question: 'How large is your team?',
        options: [
          'Just me',
          '2-5 people',
          '6-10 people',
          '11-20 people',
          '20+ people',
        ],
        required: false,
      });
    }
    
    // 7. Differentiators not found in data
    const foundDifferentiators = [
      ...insights.confirmed.attributes,
      ...insights.confirmed.certifications,
    ];
    
    questions.push({
      id: 'unique-differentiators',
      type: 'multi-select',
      question: 'What makes your business special? (Select all that apply)',
      options: this.getDifferentiatorOptions(foundDifferentiators),
      required: false,
    });
    
    return questions;
  }

  /**
   * Helper: Get specialization options based on service
   */
  private getSpecializationOptions(service: string): string[] {
    const specializationMap: Record<string, string[]> = {
      'landscaping': [
        'Residential landscaping',
        'Commercial landscaping', 
        'Xeriscaping/Drought-resistant',
        'Native plants specialist',
        'Luxury/High-end properties',
        'Small spaces/Urban gardens',
        'Large estate management',
      ],
      'lawn care': [
        'Organic lawn care',
        'Sports turf management',
        'HOA properties',
        'Fertilization programs',
        'Weed control specialist',
        'Disease treatment',
      ],
      // Add more service specializations...
    };
    
    return specializationMap[service.toLowerCase()] || [];
  }

  /**
   * Helper: Humanize attribute keys
   */
  private humanizeAttribute(key: string): string {
    const map: Record<string, string> = {
      'has_wheelchair_accessible_entrance': 'Wheelchair Accessible',
      'has_wheelchair_accessible_parking': 'Accessible Parking',
      'serves_beer': 'Serves Beer',
      'serves_wine': 'Serves Wine',
      // Add more mappings...
    };
    
    return map[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Calculate quality scores for each data source
   */
  private calculateSourceQuality(data: MultiSourceData): any {
    const scores = {
      gbp: this.scoreGBPData(data.gbp) / 100, // Convert to 0-1 scale
      places: this.scorePlacesData(data.places) / 100,
      serp: this.scoreSERPData(data.serp) / 100,
      user: this.scoreUserData(data.userAnswers) / 100,
    };
    
    return scores;
  }

  // Additional helper methods...
  private isCertification(attr: string): boolean {
    const certKeywords = ['certified', 'licensed', 'accredited', 'insured', 'bonded'];
    return certKeywords.some(keyword => attr.toLowerCase().includes(keyword));
  }

  private isVerifiedByData(claim: string, data: any): boolean {
    // Check if claim is verified by other data sources
    // Implementation...
    return false;
  }

  private extractServicesFromReviews(reviews: any): string[] {
    // Extract service mentions from review text
    // Implementation...
    return [];
  }

  private extractReviewHighlights(reviews: any[]): string[] {
    // Extract positive highlights from reviews
    // Implementation...
    return [];
  }

  private analyzeSentiment(reviews: any[]): any {
    // Analyze review sentiment
    // Implementation...
    return { positive: [], negative: [] };
  }

  private extractCompetitors(serp: any): string[] {
    // Extract competitor names from SERP
    // Implementation...
    return [];
  }

  private analyzeMarketPosition(serp: any): string {
    // Analyze market position from SERP
    // Implementation...
    return 'competitive';
  }

  private extractCommonServices(serp: any): string[] {
    // Extract commonly offered services from SERP
    // Implementation...
    return [];
  }

  private extractPricingInsights(serp: any): any {
    // Extract pricing insights from SERP
    // Implementation...
    return {};
  }

  private extractLocalKeywords(serp: any): string[] {
    // Extract local keywords from SERP
    // Implementation...
    return [];
  }

  private scoreGBPData(gbp: any): number {
    if (!gbp) return 0;
    let score = 0;
    
    if (gbp.title) score += 10;
    if (gbp.profile?.description) score += 15;
    if (gbp.photos?.length >= 10) score += 20;
    else if (gbp.photos?.length >= 5) score += 15;
    else if (gbp.photos?.length >= 1) score += 10;
    if (gbp.rating >= 4) score += 15;
    if (gbp.userRatingCount >= 50) score += 20;
    else if (gbp.userRatingCount >= 10) score += 10;
    if (gbp.regularHours) score += 10;
    if (gbp.attributes && Object.keys(gbp.attributes).length > 5) score += 10;
    
    return Math.min(score, 100);
  }

  private scorePlacesData(places: any): number {
    if (!places) return 0;
    let score = 0;
    
    if (places.photos?.length > 0) score += 20;
    if (places.reviews?.length >= 10) score += 30;
    else if (places.reviews?.length >= 5) score += 20;
    if (places.opening_hours) score += 15;
    if (places.website) score += 10;
    if (places.price_level !== undefined) score += 10;
    if (places.rating >= 4) score += 15;
    
    return Math.min(score, 100);
  }

  private scoreSERPData(serp: any): number {
    if (!serp) return 0;
    // Scoring logic for SERP data
    return 50; // Placeholder
  }

  private scoreUserData(userAnswers: any): number {
    if (!userAnswers) return 0;
    let score = 0;
    
    if (userAnswers.services?.length > 0) score += 20;
    if (userAnswers.awards?.length > 0) score += 25;
    if (userAnswers.photoContexts && Object.keys(userAnswers.photoContexts).length > 0) score += 20;
    if (userAnswers.differentiators?.length > 0) score += 20;
    if (userAnswers.specializations?.length > 0) score += 15;
    
    return Math.min(score, 100);
  }

  private getDifferentiatorOptions(foundDifferentiators: string[]): string[] {
    const allOptions = [
      'Family owned & operated',
      'Woman-owned business',
      'Veteran-owned business',
      'Eco-friendly practices',
      'Same-day service',
      '24/7 emergency service',
      'No contracts required',
      'Satisfaction guarantee',
      'Price match guarantee',
      'Bilingual service',
      'Senior discounts',
      'Military discounts',
      'Financing available',
      'Free consultations',
      'Locally sourced materials',
      'Award-winning service',
    ];
    
    // Return options not already found
    return allOptions.filter(opt => 
      !foundDifferentiators.some(found => 
        found.toLowerCase().includes(opt.toLowerCase())
      )
    );
  }
}

export const multiSourceEvaluator = new MultiSourceDataEvaluator();
