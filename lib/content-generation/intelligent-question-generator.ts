/**
 * Intelligent Question Generator
 * 
 * Generates smart questions based on what we already know from:
 * - Google Business Profile
 * - Places API
 * - DataForSEO SERP
 * 
 * Only asks for information we don't have or need to confirm
 */

import { DataInsights } from './multi-source-data-evaluator';

export interface IntelligentQuestion {
  id: string;
  type: 'text' | 'text-list' | 'single' | 'multiple' | 'boolean' | 'yes-no' | 'this-or-that' | 'photo-label' | 'confirm' | 'number' | 'style-picker' | 'font-pairing';
  question: string;
  category?: string;
  context?: string; // Why we're asking
  options?: any[];
  placeholder?: string;
  required: boolean;
  validation?: any;
  dependsOn?: string; // ID of another question
  showIf?: any; // Condition to show question
}

export interface PhotoLabelingQuestion extends IntelligentQuestion {
  type: 'photo-label';
  photos: Array<{
    id: string;
    url: string;
    thumbnail?: string;
    currentLabel?: string;
  }>;
  labelOptions?: string[];
  allowCustomLabel?: boolean;
  multipleLabelsPerPhoto?: boolean;
}

export class IntelligentQuestionGenerator {
  /**
   * Generate questions based on data insights
   */
  generateQuestions(
    insights: DataInsights,
    industry: string
  ): IntelligentQuestion[] {
    const questions: IntelligentQuestion[] = [];
    
    // 1. Confirmation questions for claims found in descriptions
    if (insights.needsConfirmation.claims.length > 0) {
      questions.push(this.createClaimConfirmationQuestion(insights.needsConfirmation.claims));
    }
    
    // 2. Service confirmation if we found mentions in reviews/SERP
    if (insights.needsConfirmation.services.length > 0) {
      questions.push(this.createServiceConfirmationQuestion(
        insights.needsConfirmation.services,
        insights.confirmed.services
      ));
    }
    
    // 3. Photo context questions - ONLY if we have unlabeled photos
    const unlabeledPhotos = insights.confirmed.photos.filter(p => !p.context);
    if (unlabeledPhotos.length > 0) {
      questions.push(this.createPhotoLabelingQuestion(unlabeledPhotos, industry));
    }
    
    // 4. Awards - ONLY if not mentioned anywhere
    if (insights.missingData.includes('awards') && !this.hasAwardMentions(insights)) {
      questions.push(this.createAwardsQuestion());
    }
    
    // 5. Team details - if it affects trust for this industry
    if (insights.missingData.includes('team_size') && this.isTeamSizeRelevant(industry)) {
      questions.push(this.createTeamQuestion(industry));
    }
    
    // 6. Specializations within confirmed services
    if (insights.confirmed.services.length > 0 && insights.missingData.includes('specializations')) {
      questions.push(...this.createSpecializationQuestions(
        insights.confirmed.services,
        industry
      ));
    }
    
    // 7. Project examples with photos
    if (unlabeledPhotos.length >= 3) {
      questions.push(this.createProjectExamplesQuestion());
    }
    
    // 8. Unique differentiators not found in data
    const existingDifferentiators = [
      ...insights.confirmed.attributes,
      ...insights.confirmed.certifications,
    ];
    questions.push(this.createDifferentiatorsQuestion(existingDifferentiators, industry));
    
    // 9. Service area clarification if needed
    if (this.needsServiceAreaClarification(insights)) {
      questions.push(this.createServiceAreaQuestion(insights.confirmed.serviceArea));
    }
    
    // 10. Pricing transparency preference
    if (insights.missingData.includes('price_range') && !this.hasPricingInfo(insights)) {
      questions.push(this.createPricingQuestion());
    }
    
    // 11. Visual style preferences - always ask for brand consistency
    questions.push(this.createStyleQuestion(industry));
    
    // 12. Typography preferences - always ask for personality
    questions.push(this.createFontPairingQuestion(industry));
    
    // 13. Business personality - for conversational tone
    questions.push(this.createPersonalityQuestion());
    
    // 14. Emergency service availability - yes/no for trust building
    if (['plumbing', 'hvac', 'electrical'].includes(industry)) {
      questions.push(this.createEmergencyServiceQuestion());
    }
    
    return questions;
  }

  /**
   * Create claim confirmation question
   */
  private createClaimConfirmationQuestion(claims: string[]): IntelligentQuestion {
    return {
      id: 'confirm-claims',
      type: 'multiple',
      question: 'We noticed these statements about your business. Which are accurate?',
      category: 'verification',
      context: 'This helps us highlight your achievements accurately',
      options: claims.map(claim => ({
        value: claim,
        label: claim,
        example: this.getClaimExample(claim),
      })),
      required: false,
    };
  }

  /**
   * Create service confirmation question
   */
  private createServiceConfirmationQuestion(
    unconfirmedServices: string[],
    confirmedServices: string[]
  ): IntelligentQuestion {
    return {
      id: 'confirm-services',
      type: 'multiple',
      question: 'Customers mentioned these additional services. Do you offer any of them?',
      category: 'services',
      context: `You already offer: ${confirmedServices.slice(0, 3).join(', ')}${confirmedServices.length > 3 ? ', and more' : ''}`,
      options: unconfirmedServices.map(service => ({
        value: service,
        label: service,
      })),
      required: false,
    };
  }

  /**
   * Create photo labeling question
   */
  private createPhotoLabelingQuestion(
    photos: any[],
    industry: string
  ): PhotoLabelingQuestion {
    const labelOptions = this.getPhotoLabelOptions(industry);
    
    return {
      id: 'photo-labels',
      type: 'photo-label',
      question: 'Help visitors understand your work better. What do these photos show?',
      category: 'photos',
      context: 'Labeled photos convert 40% better than unlabeled ones',
      photos: photos.slice(0, 9).map((photo, index) => ({
        id: photo.id || `photo-${index}`,
        url: photo.url,
        thumbnail: photo.thumbnail || photo.url,
        currentLabel: photo.context,
      })),
      options: labelOptions.map(label => ({ value: label, label })),
      required: false,
    };
  }

  /**
   * Create awards question
   */
  private createAwardsQuestion(): IntelligentQuestion {
    return {
      id: 'awards',
      type: 'text',
      question: 'Have you won any awards or special recognition?',
      category: 'trust',
      context: 'Awards build trust and set you apart from competitors',
      placeholder: 'e.g., Best of [City] 2023, Angie\'s List Super Service Award',
      required: false,
      validation: {
        maxItems: 5,
        minLength: 3,
      },
    };
  }

  /**
   * Create team question
   */
  private createTeamQuestion(industry: string): IntelligentQuestion {
    // Use this-or-that for team size - simplified to 2 main options
    return {
      id: 'team-info',
      type: 'this-or-that',
      question: 'What\'s your team size?',
      category: 'about',
      context: 'Both approaches build trust in different ways',
      options: [
        {
          value: 'small',
          label: 'Small & Personal',
          description: 'Owner-operated or small team (1-5 people)',
          icon: '👤',
        },
        {
          value: 'established',
          label: 'Established Team',
          description: 'Larger crew ready for any project (6+ people)',
          icon: '👥',
        },
      ],
      required: false,
    };
  }

  /**
   * Create specialization questions
   */
  private createSpecializationQuestions(
    services: string[],
    industry: string
  ): IntelligentQuestion[] {
    const questions: IntelligentQuestion[] = [];
    
    // Get top 2 services to ask about
    const topServices = services.slice(0, 2);
    
    topServices.forEach((service, index) => {
      const specializations = this.getSpecializationsForService(service, industry);
      
      if (specializations.length > 0) {
        questions.push({
          id: `specialization-${index}`,
          type: 'multiple',
          question: `For ${service}, what are your specialties?`,
          category: 'services',
          context: 'Specific expertise helps match you with the right customers',
          options: specializations,
          required: false,
        });
      }
    });
    
    return questions;
  }

  /**
   * Create project examples question
   */
  private createProjectExamplesQuestion(): IntelligentQuestion {
    return {
      id: 'project-examples',
      type: 'text',
      question: 'Describe 2-3 of your best projects',
      category: 'portfolio',
      context: 'Specific examples help customers envision working with you',
      placeholder: 'e.g., Complete backyard transformation for family of 5 with pool area landscaping',
      required: false,
      validation: {
        maxItems: 3,
        minLength: 20,
        maxLength: 150,
      },
    };
  }

  /**
   * Create differentiators question
   */
  private createDifferentiatorsQuestion(
    existingDifferentiators: string[],
    industry: string
  ): IntelligentQuestion {
    const options = this.getDifferentiatorOptions(industry, existingDifferentiators);
    
    return {
      id: 'unique-value',
      type: 'multiple',
      question: 'What makes your business special?',
      category: 'differentiators',
      context: 'Help customers understand why they should choose you',
      options: options.filter(opt => 
        !existingDifferentiators.some(existing => 
          existing.toLowerCase().includes(opt.value.toLowerCase())
        )
      ),
      required: false,
    };
  }

  /**
   * Create service area question
   */
  private createServiceAreaQuestion(currentAreas: string[]): IntelligentQuestion {
    return {
      id: 'service-area-details',
      type: 'text',
      question: 'Any specific neighborhoods or areas you want to highlight?',
      category: 'location',
      context: currentAreas.length > 0 ? 
        `You currently serve: ${currentAreas.join(', ')}` : 
        'This helps with local search rankings',
      placeholder: 'e.g., Specializing in River Oaks and Memorial areas',
      required: false,
    };
  }

  /**
   * Create pricing question
   */
  private createPricingQuestion(): IntelligentQuestion {
    // Use this-or-that for pricing since it's essentially a binary choice
    return {
      id: 'pricing-approach',
      type: 'this-or-that',
      question: 'How would you like to handle pricing on your website?',
      category: 'pricing',
      context: '67% of customers want to see pricing information',
      options: [
        {
          value: 'transparent',
          label: 'Show Pricing',
          description: 'Display prices or ranges upfront',
          icon: '💰',
        },
        {
          value: 'contact',
          label: 'Quote Only',
          description: 'Customers contact for pricing',
          icon: '📞',
        },
      ],
      required: false,
    };
  }

  /**
   * Create style preference question
   */
  private createStyleQuestion(industry: string): IntelligentQuestion {
    return {
      id: 'visual-style',
      type: 'style-picker',
      question: 'Which visual style best represents your business?',
      category: 'design',
      context: 'This helps us create a website that matches your brand personality',
      options: this.getStyleOptions(industry),
      required: false,
    };
  }

  /**
   * Create font pairing question
   */
  private createFontPairingQuestion(industry: string): IntelligentQuestion {
    return {
      id: 'typography',
      type: 'font-pairing',
      question: 'Choose a font combination that reflects your brand',
      category: 'design',
      context: 'Typography sets the tone for your entire website',
      options: this.getFontPairingOptions(industry),
      required: false,
    };
  }

  /**
   * Create business personality question
   */
  private createPersonalityQuestion(): IntelligentQuestion {
    return {
      id: 'business-personality',
      type: 'this-or-that',
      question: 'How would you describe your business personality?',
      category: 'brand',
      context: 'This helps us write content that sounds like you',
      options: [
        {
          value: 'professional',
          label: 'Professional & Formal',
          description: 'Traditional, trustworthy, expert',
          icon: '👔',
        },
        {
          value: 'friendly',
          label: 'Friendly & Approachable',
          description: 'Warm, conversational, helpful',
          icon: '😊',
        },
      ],
      required: false,
    };
  }

  /**
   * Create emergency service question
   */
  private createEmergencyServiceQuestion(): IntelligentQuestion {
    return {
      id: 'emergency-service',
      type: 'yes-no',
      question: 'Do you offer 24/7 emergency services?',
      category: 'services',
      context: 'Emergency availability is a major selling point',
      options: [
        {
          value: 'yes',
          label: 'Yes',
          color: 'green',
        },
        {
          value: 'no',
          label: 'No',
          color: 'red',
        },
      ],
      required: false,
    };
  }

  /**
   * Helper: Get photo label options by industry
   */
  private getPhotoLabelOptions(industry: string): string[] {
    const baseOptions = [
      'Before photo',
      'After photo',
      'Before & After',
      'Work in progress',
      'Team at work',
      'Completed project',
      'Detail shot',
      'Equipment/Tools',
      'Happy customer',
    ];
    
    const industrySpecific: Record<string, string[]> = {
      landscaping: [
        'Garden design',
        'Lawn transformation',
        'Patio/Hardscaping',
        'Water feature',
        'Seasonal display',
        'Tree/Shrub work',
        'Lighting installation',
      ],
      hvac: [
        'System installation',
        'Ductwork',
        'Thermostat upgrade',
        'Maintenance work',
        'Energy efficient upgrade',
      ],
      plumbing: [
        'Bathroom remodel',
        'Kitchen plumbing',
        'Pipe repair',
        'Water heater installation',
        'Fixture upgrade',
      ],
      // Add more industries...
    };
    
    return [...baseOptions, ...(industrySpecific[industry] || [])];
  }

  /**
   * Helper: Get team size options by industry
   */
  private getTeamSizeOptions(industry: string): any[] {
    const trustBuilders: Record<string, string> = {
      'owner-operated': 'Customers love working directly with owners',
      'small-team': 'Perfect size for personalized service',
      'established-team': 'Experienced team ready for any project',
      'large-team': 'Resources to handle multiple projects',
    };
    
    return [
      {
        value: 'owner-operated',
        label: 'Owner-operated',
        description: trustBuilders['owner-operated'],
      },
      {
        value: '2-5',
        label: '2-5 person team',
        description: trustBuilders['small-team'],
      },
      {
        value: '6-15',
        label: '6-15 person team',
        description: trustBuilders['established-team'],
      },
      {
        value: '16+',
        label: 'Large team (16+)',
        description: trustBuilders['large-team'],
      },
    ];
  }

  /**
   * Helper: Get specializations for a service
   */
  private getSpecializationsForService(service: string, industry: string): any[] {
    // This would have detailed specialization options per service
    const specializationMap: Record<string, Record<string, any[]>> = {
      landscaping: {
        'lawn care': [
          { value: 'organic', label: 'Organic/Chemical-free' },
          { value: 'sports-turf', label: 'Sports turf management' },
          { value: 'hoa', label: 'HOA properties' },
          { value: 'commercial', label: 'Commercial properties' },
        ],
        'landscape design': [
          { value: 'native', label: 'Native plant specialist' },
          { value: 'xeriscape', label: 'Water-wise landscaping' },
          { value: 'modern', label: 'Modern/Contemporary design' },
          { value: 'traditional', label: 'Traditional gardens' },
        ],
        // More services...
      },
      // More industries...
    };
    
    const normalizedService = service.toLowerCase();
    return specializationMap[industry]?.[normalizedService] || [];
  }

  /**
   * Helper: Get differentiator options
   */
  private getDifferentiatorOptions(industry: string, existing: string[]): any[] {
    const universal = [
      { value: 'family-owned', label: 'Family owned & operated', icon: '👨‍👩‍👧‍👦' },
      { value: 'woman-owned', label: 'Woman-owned business', icon: '👩‍💼' },
      { value: 'veteran-owned', label: 'Veteran-owned', icon: '🎖️' },
      { value: 'eco-friendly', label: 'Eco-friendly practices', icon: '🌱' },
      { value: '24-7', label: '24/7 emergency service', icon: '🚨' },
      { value: 'same-day', label: 'Same-day service', icon: '⚡' },
      { value: 'guarantee', label: 'Satisfaction guarantee', icon: '✅' },
      { value: 'financing', label: 'Financing available', icon: '💳' },
      { value: 'senior-discount', label: 'Senior discounts', icon: '🏷️' },
      { value: 'bilingual', label: 'Bilingual service', icon: '🗣️' },
    ];
    
    const industrySpecific: Record<string, any[]> = {
      landscaping: [
        { value: 'organic-only', label: 'Organic products only', icon: '🌿' },
        { value: 'water-smart', label: 'Water conservation expert', icon: '💧' },
        { value: 'design-award', label: 'Award-winning designs', icon: '🏆' },
      ],
      // More industries...
    };
    
    return [
      ...universal,
      ...(industrySpecific[industry] || []),
    ];
  }

  /**
   * Helpers for checking existing data
   */
  private hasAwardMentions(insights: DataInsights): boolean {
    const description = insights.confirmed.description?.toLowerCase() || '';
    const awardKeywords = ['award', 'winner', 'best of', 'top rated', '#1'];
    return awardKeywords.some(keyword => description.includes(keyword));
  }

  private isTeamSizeRelevant(industry: string): boolean {
    // Team size matters more for some industries
    const teamRelevantIndustries = ['landscaping', 'construction', 'cleaning', 'moving'];
    return teamRelevantIndustries.includes(industry);
  }

  private needsServiceAreaClarification(insights: DataInsights): boolean {
    // Need clarification if service area is vague or very broad
    const serviceArea = insights.confirmed.serviceArea;
    return serviceArea.length === 0 || 
           serviceArea.some(area => area.includes('surrounding areas'));
  }

  private hasPricingInfo(insights: DataInsights): boolean {
    // Check if we found any pricing information
    return insights.confirmed.marketPosition.includes('budget') ||
           insights.confirmed.marketPosition.includes('premium') ||
           (insights.confirmed.description?.match(/\$\d+/g)?.length || 0) > 0;
  }

  private getClaimExample(claim: string): string {
    // Provide examples for common claims
    const examples: Record<string, string> = {
      'licensed': 'State License #12345',
      'insured': 'Fully insured up to $2M',
      'certified': 'NALP Certified Landscape Professional',
      // Add more examples...
    };
    
    for (const [key, example] of Object.entries(examples)) {
      if (claim.toLowerCase().includes(key)) {
        return example;
      }
    }
    
    return '';
  }

  /**
   * Get visual style options for the industry
   */
  private getStyleOptions(industry: string): any[] {
    const baseStyles = [
      {
        value: 'modern-clean',
        label: 'Modern & Clean',
        preview: {
          primaryColor: '#1a1a1a',
          secondaryColor: '#ffffff',
          accentColor: '#0066cc',
          layout: 'minimal',
          imagery: 'geometric',
        },
        description: 'Minimalist design with strong typography',
      },
      {
        value: 'warm-friendly',
        label: 'Warm & Friendly',
        preview: {
          primaryColor: '#2c5530',
          secondaryColor: '#f5f3f0',
          accentColor: '#e88d67',
          layout: 'organic',
          imagery: 'natural',
        },
        description: 'Approachable design with natural colors',
      },
      {
        value: 'bold-confident',
        label: 'Bold & Confident',
        preview: {
          primaryColor: '#0052cc',
          secondaryColor: '#ffffff',
          accentColor: '#ff5630',
          layout: 'dynamic',
          imagery: 'high-contrast',
        },
        description: 'Strong colors and dynamic layouts',
      },
      {
        value: 'classic-trust',
        label: 'Classic & Trustworthy',
        preview: {
          primaryColor: '#1e3a5f',
          secondaryColor: '#f8f8f8',
          accentColor: '#c9a961',
          layout: 'traditional',
          imagery: 'professional',
        },
        description: 'Traditional design that builds confidence',
      },
    ];

    // Industry-specific adjustments
    if (industry === 'landscaping') {
      baseStyles[1].preview.primaryColor = '#2d5016'; // Deeper green
      baseStyles[1].label = 'Natural & Organic';
    } else if (industry === 'hvac') {
      baseStyles[0].preview.accentColor = '#0088ff'; // Cool blue
      baseStyles[0].label = 'Technical & Modern';
    } else if (industry === 'plumbing') {
      baseStyles[3].preview.primaryColor = '#003d7a'; // Deep blue
      baseStyles[3].label = 'Professional & Reliable';
    }

    return baseStyles;
  }

  /**
   * Get font pairing options for the industry
   */
  private getFontPairingOptions(industry: string): any[] {
    return [
      {
        value: 'modern-sans',
        label: 'Modern Sans',
        heading: 'Inter',
        body: 'Inter',
        preview: {
          headingWeight: '700',
          bodyWeight: '400',
          headingSize: '2.5rem',
          bodySize: '1rem',
        },
        description: 'Clean and highly readable',
        recommended: ['tech', 'hvac', 'electrical'],
      },
      {
        value: 'classic-serif',
        label: 'Classic Elegance',
        heading: 'Playfair Display',
        body: 'Source Sans Pro',
        preview: {
          headingWeight: '700',
          bodyWeight: '400',
          headingSize: '2.5rem',
          bodySize: '1rem',
        },
        description: 'Sophisticated and professional',
        recommended: ['landscaping', 'high-end'],
      },
      {
        value: 'friendly-rounded',
        label: 'Friendly & Approachable',
        heading: 'Nunito',
        body: 'Open Sans',
        preview: {
          headingWeight: '800',
          bodyWeight: '400',
          headingSize: '2.5rem',
          bodySize: '1rem',
        },
        description: 'Warm and inviting',
        recommended: ['cleaning', 'residential'],
      },
      {
        value: 'bold-impact',
        label: 'Bold Impact',
        heading: 'Montserrat',
        body: 'Lato',
        preview: {
          headingWeight: '900',
          bodyWeight: '400',
          headingSize: '2.5rem',
          bodySize: '1rem',
        },
        description: 'Strong and confident',
        recommended: ['roofing', 'construction'],
      },
    ];
  }
}

export const questionGenerator = new IntelligentQuestionGenerator();
