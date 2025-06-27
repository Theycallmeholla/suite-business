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
  type: 'text' | 'text-list' | 'single' | 'multiple' | 'boolean' | 'photo-label' | 'confirm' | 'number';
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
    const options = this.getTeamSizeOptions(industry);
    
    return {
      id: 'team-info',
      type: 'single',
      question: 'Tell us about your team',
      category: 'about',
      context: 'Customers trust businesses that share team information',
      options,
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
    return {
      id: 'pricing-approach',
      type: 'single',
      question: 'How would you like to handle pricing on your website?',
      category: 'pricing',
      context: '67% of customers want to see pricing information',
      options: [
        {
          value: 'transparent',
          label: 'Show starting prices',
          description: 'Builds trust and pre-qualifies leads',
        },
        {
          value: 'ranges',
          label: 'Show price ranges',
          description: 'Gives customers an idea without specifics',
        },
        {
          value: 'contact',
          label: 'Contact for pricing',
          description: 'Better for complex or custom projects',
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
}

export const questionGenerator = new IntelligentQuestionGenerator();
