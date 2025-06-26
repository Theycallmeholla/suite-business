/**
 * Smart Inference Engine - Multi-Dimensional Data Capture
 * 
 * **Created**: December 23, 2024, 10:45 AM CST
 * **Last Updated**: December 23, 2024, 10:45 AM CST
 * 
 * Extracts maximum information from minimal user input through
 * intelligent inference, pattern matching, and industry knowledge.
 */

import { IndustryType } from '@/types/site-builder'
import { BusinessIntelligenceData } from './scoring'
import { getIndustryProfile } from './industry-profiles'

export interface InferenceRule {
  id: string
  name: string
  description: string
  confidence: number
  triggers: InferenceTrigger[]
  outputs: InferenceOutput[]
}

export interface InferenceTrigger {
  field: string
  operator: 'equals' | 'includes' | 'contains' | 'matches' | 'greater_than' | 'less_than'
  value: any
  weight: number
}

export interface InferenceOutput {
  field: string
  value: any
  confidence: number
  reasoning: string
}

export interface InferenceResult {
  field: string
  value: any
  confidence: number
  reasoning: string
  sources: string[]
  alternatives?: Array<{ value: any; confidence: number }>
}

export class InferenceEngine {
  private rules: InferenceRule[] = []
  private industryProfile: any
  
  constructor(industry: IndustryType) {
    this.industryProfile = getIndustryProfile(industry)
    this.initializeRules(industry)
  }

  /**
   * Process user input and generate comprehensive inferences
   */
  processInput(
    questionId: string, 
    answer: any, 
    context: BusinessIntelligenceData
  ): InferenceResult[] {
    const results: InferenceResult[] = []
    
    // Apply question-specific inference rules
    const questionRules = this.rules.filter(rule => 
      rule.triggers.some(trigger => trigger.field === questionId)
    )
    
    for (const rule of questionRules) {
      const inference = this.applyRule(rule, { [questionId]: answer }, context)
      if (inference) {
        results.push(...inference)
      }
    }
    
    // Apply cross-field inference rules
    const crossFieldRules = this.rules.filter(rule =>
      rule.triggers.every(trigger => 
        context[trigger.field] !== undefined || trigger.field === questionId
      )
    )
    
    for (const rule of crossFieldRules) {
      const allData = { ...context, [questionId]: answer }
      const inference = this.applyRule(rule, allData, context)
      if (inference) {
        results.push(...inference)
      }
    }
    
    return results
  }

  /**
   * Generate smart defaults based on industry and existing data
   */
  generateSmartDefaults(context: BusinessIntelligenceData): Record<string, any> {
    const defaults: Record<string, any> = {}
    
    // Industry-based defaults
    const industryDefaults = this.getIndustryDefaults()
    Object.assign(defaults, industryDefaults)
    
    // Context-aware defaults
    if (context.services) {
      const serviceDefaults = this.getServiceBasedDefaults(context.services)
      Object.assign(defaults, serviceDefaults)
    }
    
    if (context.location) {
      const locationDefaults = this.getLocationBasedDefaults(context.location)
      Object.assign(defaults, locationDefaults)
    }
    
    return defaults
  }

  /**
   * Analyze answer patterns to infer additional information
   */
  analyzePatterns(answers: Record<string, any>): InferenceResult[] {
    const results: InferenceResult[] = []
    
    // Service selection patterns
    if (answers.services) {
      results.push(...this.analyzeServicePatterns(answers.services))
    }
    
    // Differentiation patterns
    if (answers.differentiation) {
      results.push(...this.analyzeDifferentiationPatterns(answers.differentiation))
    }
    
    // Style preference patterns
    if (answers.color_scheme || answers.typography) {
      results.push(...this.analyzeStylePatterns(answers))
    }
    
    // Cross-answer patterns
    results.push(...this.analyzeCrossPatterns(answers))
    
    return results
  }

  /**
   * Initialize inference rules for the industry
   */
  private initializeRules(industry: IndustryType): void {
    this.rules = [
      // Service-based positioning inference
      {
        id: 'emergency_positioning',
        name: 'Emergency Service Positioning',
        description: 'Infer business positioning from emergency service selection',
        confidence: 0.9,
        triggers: [
          { field: 'services', operator: 'includes', value: 'emergency', weight: 1.0 }
        ],
        outputs: [
          { field: 'positioning', value: 'emergency-focused', confidence: 0.9, reasoning: 'Selected emergency services' },
          { field: 'availability', value: '24/7', confidence: 0.8, reasoning: 'Emergency services typically require 24/7 availability' },
          { field: 'pricing_tier', value: 'premium', confidence: 0.7, reasoning: 'Emergency services command premium pricing' },
          { field: 'target_urgency', value: 'high', confidence: 0.9, reasoning: 'Emergency services target urgent needs' }
        ]
      },

      // Family business inference
      {
        id: 'family_business_traits',
        name: 'Family Business Characteristics',
        description: 'Infer business traits from family-owned selection',
        confidence: 0.8,
        triggers: [
          { field: 'differentiation', operator: 'includes', value: 'family-owned', weight: 1.0 }
        ],
        outputs: [
          { field: 'brand_personality', value: 'family-friendly', confidence: 0.8, reasoning: 'Family-owned businesses emphasize personal relationships' },
          { field: 'messaging_tone', value: 'warm', confidence: 0.7, reasoning: 'Family businesses use warmer, more personal messaging' },
          { field: 'trust_approach', value: 'personal', confidence: 0.8, reasoning: 'Family businesses build trust through personal connections' },
          { field: 'business_size', value: 'small-medium', confidence: 0.6, reasoning: 'Family businesses are typically smaller operations' }
        ]
      },

      // Premium positioning inference
      {
        id: 'premium_positioning',
        name: 'Premium Business Positioning',
        description: 'Infer premium positioning from quality indicators',
        confidence: 0.8,
        triggers: [
          { field: 'business_positioning', operator: 'equals', value: 'quality', weight: 0.8 },
          { field: 'differentiation', operator: 'includes', value: 'award-winning', weight: 0.6 }
        ],
        outputs: [
          { field: 'pricing_tier', value: 'premium', confidence: 0.8, reasoning: 'Quality focus indicates premium positioning' },
          { field: 'target_demographic', value: 'quality-conscious', confidence: 0.7, reasoning: 'Premium businesses target quality-conscious customers' },
          { field: 'messaging_tone', value: 'professional', confidence: 0.7, reasoning: 'Premium businesses use professional messaging' },
          { field: 'service_approach', value: 'consultative', confidence: 0.6, reasoning: 'Premium businesses take consultative approach' }
        ]
      },

      // Speed-focused inference
      {
        id: 'speed_positioning',
        name: 'Speed-Focused Positioning',
        description: 'Infer business traits from speed preference',
        confidence: 0.8,
        triggers: [
          { field: 'business_positioning', operator: 'equals', value: 'speed', weight: 1.0 }
        ],
        outputs: [
          { field: 'messaging_tone', value: 'urgent', confidence: 0.8, reasoning: 'Speed-focused businesses use urgent messaging' },
          { field: 'target_demographic', value: 'busy-professionals', confidence: 0.7, reasoning: 'Speed appeals to busy customers' },
          { field: 'service_approach', value: 'efficient', confidence: 0.8, reasoning: 'Speed-focused businesses emphasize efficiency' },
          { field: 'booking_preference', value: 'instant', confidence: 0.6, reasoning: 'Speed-focused businesses prefer instant booking' }
        ]
      },

      // Eco-friendly inference
      {
        id: 'eco_friendly_traits',
        name: 'Eco-Friendly Business Traits',
        description: 'Infer business characteristics from eco-friendly selection',
        confidence: 0.8,
        triggers: [
          { field: 'differentiation', operator: 'includes', value: 'eco-friendly', weight: 1.0 }
        ],
        outputs: [
          { field: 'brand_personality', value: 'environmentally-conscious', confidence: 0.9, reasoning: 'Selected eco-friendly differentiator' },
          { field: 'target_demographic', value: 'environmentally-aware', confidence: 0.8, reasoning: 'Eco-friendly businesses target environmentally conscious customers' },
          { field: 'messaging_themes', value: ['sustainability', 'green', 'responsible'], confidence: 0.8, reasoning: 'Eco-friendly businesses emphasize environmental themes' },
          { field: 'certifications_likely', value: ['green-certified', 'eco-friendly'], confidence: 0.6, reasoning: 'Eco-friendly businesses often have environmental certifications' }
        ]
      },

      // Service volume inference
      {
        id: 'service_volume_analysis',
        name: 'Service Volume Analysis',
        description: 'Infer business scale from service selection count',
        confidence: 0.7,
        triggers: [
          { field: 'services', operator: 'greater_than', value: 5, weight: 1.0 }
        ],
        outputs: [
          { field: 'business_scale', value: 'full-service', confidence: 0.7, reasoning: 'Large number of services indicates full-service operation' },
          { field: 'team_size', value: 'medium-large', confidence: 0.6, reasoning: 'Multiple services require larger teams' },
          { field: 'specialization_level', value: 'generalist', confidence: 0.6, reasoning: 'Many services suggests generalist approach' }
        ]
      },

      // Specialized service inference
      {
        id: 'specialized_service_analysis',
        name: 'Specialized Service Analysis',
        description: 'Infer specialization from focused service selection',
        confidence: 0.8,
        triggers: [
          { field: 'services', operator: 'less_than', value: 3, weight: 1.0 }
        ],
        outputs: [
          { field: 'specialization_level', value: 'specialist', confidence: 0.8, reasoning: 'Few services indicates specialization' },
          { field: 'expertise_level', value: 'expert', confidence: 0.7, reasoning: 'Specialists typically have deep expertise' },
          { field: 'pricing_tier', value: 'premium', confidence: 0.6, reasoning: 'Specialists can command premium pricing' }
        ]
      }
    ]

    // Add industry-specific rules
    this.addIndustrySpecificRules(industry)
  }

  /**
   * Add rules specific to the industry
   */
  private addIndustrySpecificRules(industry: IndustryType): void {
    switch (industry) {
      case 'plumbing':
        this.rules.push({
          id: 'plumbing_emergency_inference',
          name: 'Plumbing Emergency Service Inference',
          description: 'Infer plumbing business traits from emergency availability',
          confidence: 0.9,
          triggers: [
            { field: 'emergency_availability', operator: 'equals', value: '24-7', weight: 1.0 }
          ],
          outputs: [
            { field: 'phone_prominence', value: 'high', confidence: 0.9, reasoning: 'Emergency plumbers need prominent phone display' },
            { field: 'response_time_messaging', value: true, confidence: 0.8, reasoning: 'Emergency services emphasize quick response' },
            { field: 'service_area_radius', value: 'large', confidence: 0.7, reasoning: 'Emergency services typically cover larger areas' }
          ]
        })
        break

      case 'landscaping':
        this.rules.push({
          id: 'landscaping_seasonal_inference',
          name: 'Landscaping Seasonal Business Inference',
          description: 'Infer seasonal characteristics for landscaping',
          confidence: 0.8,
          triggers: [
            { field: 'services', operator: 'includes', value: 'lawn-mowing', weight: 0.7 },
            { field: 'services', operator: 'includes', value: 'leaf-removal', weight: 0.3 }
          ],
          outputs: [
            { field: 'seasonal_business', value: true, confidence: 0.8, reasoning: 'Lawn care services are seasonal' },
            { field: 'booking_patterns', value: 'seasonal-peaks', confidence: 0.7, reasoning: 'Landscaping has seasonal demand patterns' },
            { field: 'content_themes', value: ['seasonal', 'outdoor', 'curb-appeal'], confidence: 0.8, reasoning: 'Landscaping businesses use seasonal themes' }
          ]
        })
        break

      case 'hvac':
        this.rules.push({
          id: 'hvac_seasonal_emergency',
          name: 'HVAC Seasonal Emergency Patterns',
          description: 'Infer HVAC business patterns from service mix',
          confidence: 0.8,
          triggers: [
            { field: 'services', operator: 'includes', value: 'ac-repair', weight: 0.5 },
            { field: 'services', operator: 'includes', value: 'heating-repair', weight: 0.5 }
          ],
          outputs: [
            { field: 'seasonal_peaks', value: ['summer', 'winter'], confidence: 0.9, reasoning: 'HVAC has summer cooling and winter heating peaks' },
            { field: 'emergency_likelihood', value: 'high', confidence: 0.8, reasoning: 'HVAC failures are often emergencies' },
            { field: 'maintenance_messaging', value: true, confidence: 0.7, reasoning: 'HVAC businesses emphasize preventive maintenance' }
          ]
        })
        break
    }
  }

  /**
   * Apply a specific inference rule
   */
  private applyRule(
    rule: InferenceRule, 
    data: Record<string, any>, 
    context: BusinessIntelligenceData
  ): InferenceResult[] | null {
    // Check if all triggers are satisfied
    let totalWeight = 0
    let satisfiedWeight = 0
    
    for (const trigger of rule.triggers) {
      totalWeight += trigger.weight
      
      if (this.evaluateTrigger(trigger, data)) {
        satisfiedWeight += trigger.weight
      }
    }
    
    // Rule fires if at least 70% of weighted triggers are satisfied
    const satisfaction = satisfiedWeight / totalWeight
    if (satisfaction < 0.7) {
      return null
    }
    
    // Generate inference results
    const results: InferenceResult[] = []
    
    for (const output of rule.outputs) {
      results.push({
        field: output.field,
        value: output.value,
        confidence: output.confidence * satisfaction * rule.confidence,
        reasoning: `${rule.name}: ${output.reasoning}`,
        sources: [rule.id]
      })
    }
    
    return results
  }

  /**
   * Evaluate if a trigger condition is met
   */
  private evaluateTrigger(trigger: InferenceTrigger, data: Record<string, any>): boolean {
    const value = data[trigger.field]
    
    if (value === undefined) return false
    
    switch (trigger.operator) {
      case 'equals':
        return value === trigger.value
      
      case 'includes':
        return Array.isArray(value) && value.includes(trigger.value)
      
      case 'contains':
        return typeof value === 'string' && value.includes(trigger.value)
      
      case 'matches':
        return new RegExp(trigger.value).test(String(value))
      
      case 'greater_than':
        return Array.isArray(value) ? value.length > trigger.value : Number(value) > trigger.value
      
      case 'less_than':
        return Array.isArray(value) ? value.length < trigger.value : Number(value) < trigger.value
      
      default:
        return false
    }
  }

  /**
   * Get industry-based smart defaults
   */
  private getIndustryDefaults(): Record<string, any> {
    const defaults: Record<string, any> = {}
    
    // Use industry profile for defaults
    defaults.preferred_contact = this.industryProfile.patterns.preferredContact
    defaults.urgency_factors = this.industryProfile.patterns.urgencyFactors
    defaults.primary_cta = this.industryProfile.conversion.primaryCTA
    defaults.secondary_cta = this.industryProfile.conversion.secondaryCTA
    defaults.trust_elements = this.industryProfile.conversion.trustElements
    
    return defaults
  }

  /**
   * Get defaults based on selected services
   */
  private getServiceBasedDefaults(services: string[]): Record<string, any> {
    const defaults: Record<string, any> = {}
    
    // Emergency service defaults
    if (services.some(s => s.includes('emergency'))) {
      defaults.phone_prominence = 'high'
      defaults.response_time_messaging = true
      defaults.availability_messaging = '24/7'
    }
    
    // Installation service defaults
    if (services.some(s => s.includes('installation'))) {
      defaults.consultation_offering = true
      defaults.estimate_process = 'detailed'
      defaults.project_timeline_messaging = true
    }
    
    // Maintenance service defaults
    if (services.some(s => s.includes('maintenance'))) {
      defaults.recurring_service_messaging = true
      defaults.preventive_care_emphasis = true
      defaults.seasonal_reminders = true
    }
    
    return defaults
  }

  /**
   * Get defaults based on business location
   */
  private getLocationBasedDefaults(location: any): Record<string, any> {
    const defaults: Record<string, any> = {}
    
    // Urban vs suburban vs rural defaults
    if (location.area_type === 'urban') {
      defaults.service_radius = 'small'
      defaults.competition_level = 'high'
      defaults.pricing_strategy = 'competitive'
    } else if (location.area_type === 'rural') {
      defaults.service_radius = 'large'
      defaults.competition_level = 'low'
      defaults.pricing_strategy = 'premium'
    }
    
    return defaults
  }

  /**
   * Analyze service selection patterns
   */
  private analyzeServicePatterns(services: string[]): InferenceResult[] {
    const results: InferenceResult[] = []
    
    // Service breadth analysis
    if (services.length >= 6) {
      results.push({
        field: 'service_strategy',
        value: 'full-service',
        confidence: 0.8,
        reasoning: 'Wide range of services indicates full-service strategy',
        sources: ['service_pattern_analysis']
      })
    } else if (services.length <= 2) {
      results.push({
        field: 'service_strategy',
        value: 'specialist',
        confidence: 0.8,
        reasoning: 'Limited services indicates specialization strategy',
        sources: ['service_pattern_analysis']
      })
    }
    
    // Emergency focus analysis
    const emergencyServices = services.filter(s => s.includes('emergency')).length
    if (emergencyServices > 0) {
      results.push({
        field: 'emergency_focus',
        value: emergencyServices / services.length,
        confidence: 0.9,
        reasoning: 'Proportion of emergency services indicates emergency focus level',
        sources: ['service_pattern_analysis']
      })
    }
    
    return results
  }

  /**
   * Analyze differentiation selection patterns
   */
  private analyzeDifferentiationPatterns(differentiators: string[]): InferenceResult[] {
    const results: InferenceResult[] = []
    
    // Trust signal analysis
    const trustSignals = differentiators.filter(d => 
      ['licensed', 'guaranteed', 'award-winning', 'best-rated'].includes(d)
    )
    
    if (trustSignals.length >= 2) {
      results.push({
        field: 'trust_strategy',
        value: 'credentials-focused',
        confidence: 0.8,
        reasoning: 'Multiple trust signals indicate credentials-focused strategy',
        sources: ['differentiation_pattern_analysis']
      })
    }
    
    // Personal connection analysis
    const personalSignals = differentiators.filter(d => 
      ['family-owned', 'veteran-owned', 'women-owned'].includes(d)
    )
    
    if (personalSignals.length > 0) {
      results.push({
        field: 'connection_strategy',
        value: 'personal',
        confidence: 0.8,
        reasoning: 'Personal differentiators indicate relationship-focused strategy',
        sources: ['differentiation_pattern_analysis']
      })
    }
    
    return results
  }

  /**
   * Analyze style preference patterns
   */
  private analyzeStylePatterns(answers: Record<string, any>): InferenceResult[] {
    const results: InferenceResult[] = []
    
    // Color scheme analysis
    if (answers.color_scheme) {
      const scheme = answers.color_scheme
      if (scheme.includes('blue')) {
        results.push({
          field: 'brand_personality_inferred',
          value: 'trustworthy',
          confidence: 0.7,
          reasoning: 'Blue color schemes suggest trustworthy brand personality',
          sources: ['style_pattern_analysis']
        })
      } else if (scheme.includes('green')) {
        results.push({
          field: 'brand_personality_inferred',
          value: 'natural',
          confidence: 0.7,
          reasoning: 'Green color schemes suggest natural/eco-friendly personality',
          sources: ['style_pattern_analysis']
        })
      }
    }
    
    // Typography analysis
    if (answers.typography) {
      const typography = answers.typography
      if (typography === 'professional') {
        results.push({
          field: 'target_demographic_inferred',
          value: 'business-focused',
          confidence: 0.6,
          reasoning: 'Professional typography suggests business-focused target market',
          sources: ['style_pattern_analysis']
        })
      } else if (typography === 'friendly') {
        results.push({
          field: 'target_demographic_inferred',
          value: 'family-focused',
          confidence: 0.6,
          reasoning: 'Friendly typography suggests family-focused target market',
          sources: ['style_pattern_analysis']
        })
      }
    }
    
    return results
  }

  /**
   * Analyze patterns across multiple answers
   */
  private analyzeCrossPatterns(answers: Record<string, any>): InferenceResult[] {
    const results: InferenceResult[] = []
    
    // Consistency analysis
    if (answers.business_positioning === 'quality' && 
        answers.differentiation?.includes('award-winning')) {
      results.push({
        field: 'positioning_consistency',
        value: 'high',
        confidence: 0.9,
        reasoning: 'Quality positioning aligns with award-winning differentiator',
        sources: ['cross_pattern_analysis']
      })
    }
    
    if (answers.business_positioning === 'speed' && 
        answers.services?.some((s: string) => s.includes('emergency'))) {
      results.push({
        field: 'positioning_consistency',
        value: 'high',
        confidence: 0.9,
        reasoning: 'Speed positioning aligns with emergency services',
        sources: ['cross_pattern_analysis']
      })
    }
    
    // Target market coherence
    if (answers.differentiation?.includes('family-owned') && 
        answers.typography === 'friendly') {
      results.push({
        field: 'brand_coherence',
        value: 'family-friendly',
        confidence: 0.8,
        reasoning: 'Family-owned differentiator aligns with friendly typography',
        sources: ['cross_pattern_analysis']
      })
    }
    
    return results
  }
}