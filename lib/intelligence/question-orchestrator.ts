/**
 * Question Orchestrator - Adaptive Question Flow Manager
 * 
 * **Created**: December 23, 2024, 10:30 AM CST
 * **Last Updated**: December 23, 2024, 10:30 AM CST
 * 
 * Central system that manages question flow, adapts based on responses,
 * and maintains context throughout the user journey.
 */

import { IndustryType } from '@/types/site-builder'
import { BusinessIntelligenceData } from './scoring'
import { getIndustryProfile, generateServiceOptions } from './industry-profiles'
import { filterQuestionsBasedOnKnownData } from './question-filtering'

export interface QuestionContext {
  businessData: BusinessIntelligenceData
  userResponses: Record<string, any>
  currentStep: number
  totalSteps: number
  confidence: Record<string, number>
  skipReasons: Record<string, string>
}

export interface AdaptiveQuestion {
  id: string
  type: 'tinder-swipe' | 'service-grid' | 'this-or-that' | 'style-picker' | 'multiple-choice'
  priority: 1 | 2 | 3 | 4 | 5
  category: 'critical' | 'enhancement' | 'personalization' | 'style'
  
  // Question content
  question: string
  subtext?: string
  personalizedQuestion?: string // Uses business name/context
  
  // Data capture
  captures: string[] // What data points this question provides
  infers: string[] // What additional data can be inferred
  
  // Adaptive logic
  showIf: (context: QuestionContext) => boolean
  skipIf: (context: QuestionContext) => boolean
  confidence: (context: QuestionContext) => number
  
  // Question-specific data
  options?: any[]
  maxSelections?: number
  allowUnsure?: boolean
  
  // Follow-up logic
  followUp?: (answer: any, context: QuestionContext) => AdaptiveQuestion | null
}

export class QuestionOrchestrator {
  private context: QuestionContext
  private questionPool: AdaptiveQuestion[]
  private selectedQuestions: AdaptiveQuestion[] = []
  private currentQuestionIndex = 0

  constructor(businessData: BusinessIntelligenceData) {
    this.context = {
      businessData,
      userResponses: {},
      currentStep: 0,
      totalSteps: 0,
      confidence: {},
      skipReasons: {}
    }
    
    this.questionPool = this.generateQuestionPool()
    this.selectedQuestions = this.selectOptimalQuestions()
    this.context.totalSteps = this.selectedQuestions.length
  }

  /**
   * Get the current question to display
   */
  getCurrentQuestion(): AdaptiveQuestion | null {
    if (this.currentQuestionIndex >= this.selectedQuestions.length) {
      return null // Flow complete
    }
    
    const question = this.selectedQuestions[this.currentQuestionIndex]
    
    // Personalize the question if possible
    if (question.personalizedQuestion && this.context.businessData.name) {
      question.question = question.personalizedQuestion.replace(
        '[Business Name]', 
        this.context.businessData.name
      )
    }
    
    return question
  }

  /**
   * Process user answer and advance to next question
   */
  async answerQuestion(questionId: string, answer: any): Promise<{
    nextQuestion: AdaptiveQuestion | null
    followUp: AdaptiveQuestion | null
    inferences: Record<string, any>
    isComplete: boolean
  }> {
    const currentQuestion = this.selectedQuestions[this.currentQuestionIndex]
    
    if (!currentQuestion || currentQuestion.id !== questionId) {
      throw new Error('Question ID mismatch')
    }

    // Store the answer
    this.context.userResponses[questionId] = answer
    
    // Generate inferences from this answer
    const inferences = this.generateInferences(currentQuestion, answer)
    
    // Update business data with inferences
    this.updateBusinessDataWithInferences(inferences)
    
    // Check for follow-up questions
    const followUp = currentQuestion.followUp?.(answer, this.context) || null
    
    // Advance to next question
    this.currentQuestionIndex++
    this.context.currentStep = this.currentQuestionIndex
    
    // Re-evaluate remaining questions based on new data
    this.reEvaluateQuestions()
    
    const nextQuestion = this.getCurrentQuestion()
    const isComplete = nextQuestion === null && followUp === null
    
    return {
      nextQuestion,
      followUp,
      inferences,
      isComplete
    }
  }

  /**
   * Get current progress information
   */
  getProgress(): {
    current: number
    total: number
    percentage: number
    dataCompleteness: number
    estimatedRemaining: number
  } {
    const dataCompleteness = this.calculateDataCompleteness()
    const estimatedRemaining = Math.max(0, Math.ceil((100 - dataCompleteness) / 20))
    
    return {
      current: this.currentQuestionIndex,
      total: this.selectedQuestions.length,
      percentage: (this.currentQuestionIndex / this.selectedQuestions.length) * 100,
      dataCompleteness,
      estimatedRemaining
    }
  }

  /**
   * Skip current question with reason
   */
  skipQuestion(reason: string = 'user_skip'): AdaptiveQuestion | null {
    const currentQuestion = this.selectedQuestions[this.currentQuestionIndex]
    
    if (currentQuestion) {
      this.context.skipReasons[currentQuestion.id] = reason
      this.currentQuestionIndex++
      this.context.currentStep = this.currentQuestionIndex
    }
    
    return this.getCurrentQuestion()
  }

  /**
   * Go back to previous question
   */
  goBack(): AdaptiveQuestion | null {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--
      this.context.currentStep = this.currentQuestionIndex
      return this.getCurrentQuestion()
    }
    return null
  }

  /**
   * Get all collected data including inferences
   */
  getCollectedData(): {
    responses: Record<string, any>
    inferences: Record<string, any>
    confidence: Record<string, number>
    skipped: Record<string, string>
  } {
    return {
      responses: this.context.userResponses,
      inferences: this.extractInferences(),
      confidence: this.context.confidence,
      skipped: this.context.skipReasons
    }
  }

  /**
   * Generate the pool of all possible questions
   */
  private generateQuestionPool(): AdaptiveQuestion[] {
    const industry = this.context.businessData.industry
    const profile = getIndustryProfile(industry)
    
    return [
      // Critical: Services (always show if missing)
      {
        id: 'services',
        type: 'service-grid',
        priority: 1,
        category: 'critical',
        question: `Select your top ${profile.patterns.maxServicesDisplay} services`,
        personalizedQuestion: `What are [Business Name]'s main services?`,
        captures: ['services', 'service_count', 'service_mix'],
        infers: ['positioning', 'target_market', 'pricing_tier'],
        showIf: (ctx) => !ctx.businessData.services || ctx.businessData.services.length === 0,
        skipIf: (ctx) => ctx.businessData.services && ctx.businessData.services.length >= 3,
        confidence: (ctx) => ctx.businessData.services ? 0.9 : 0.1,
        options: generateServiceOptions(industry),
        maxSelections: profile.patterns.maxServicesDisplay
      },

      // Enhancement: Differentiation
      {
        id: 'differentiation',
        type: 'tinder-swipe',
        priority: 2,
        category: 'enhancement',
        question: 'What makes your business special?',
        personalizedQuestion: 'What makes [Business Name] different from competitors?',
        captures: ['differentiators', 'unique_selling_points'],
        infers: ['brand_personality', 'target_messaging', 'trust_signals'],
        showIf: (ctx) => ctx.businessData.differentiationScore < 40,
        skipIf: (ctx) => ctx.businessData.differentiationScore >= 70,
        confidence: (ctx) => ctx.businessData.differentiationScore / 100,
        allowUnsure: true,
        options: this.getDifferentiatorOptions(industry)
      },

      // Critical for emergency industries: Availability
      {
        id: 'emergency_availability',
        type: 'this-or-that',
        priority: 1,
        category: 'critical',
        question: 'When do you provide service?',
        personalizedQuestion: 'When is [Business Name] available for service calls?',
        captures: ['availability', 'emergency_service'],
        infers: ['positioning', 'pricing_tier', 'target_urgency'],
        showIf: (ctx) => ['plumbing', 'hvac', 'electrical'].includes(ctx.businessData.industry),
        skipIf: (ctx) => ctx.businessData.hours && Object.keys(ctx.businessData.hours).length > 0,
        confidence: (ctx) => ctx.businessData.hours ? 0.8 : 0.2,
        options: [
          {
            value: '24-7',
            label: '24/7 Emergency',
            description: 'Available anytime for urgent needs',
            icon: 'zap'
          },
          {
            value: 'business-hours',
            label: 'Business Hours',
            description: 'Scheduled appointments during normal hours',
            icon: 'monitor'
          }
        ]
      },

      // Personalization: Business positioning
      {
        id: 'business_positioning',
        type: 'this-or-that',
        priority: 3,
        category: 'personalization',
        question: 'What matters more to your customers?',
        personalizedQuestion: 'What do [Business Name] customers value most?',
        captures: ['value_proposition', 'positioning'],
        infers: ['messaging_tone', 'pricing_strategy', 'target_demographic'],
        showIf: (ctx) => ctx.confidence.positioning < 0.6,
        skipIf: (ctx) => ctx.confidence.positioning >= 0.8,
        confidence: (ctx) => ctx.confidence.positioning || 0.3,
        options: [
          {
            value: 'speed',
            label: 'Speed & Convenience',
            description: 'Fast service, quick response',
            icon: 'zap'
          },
          {
            value: 'quality',
            label: 'Quality & Craftsmanship',
            description: 'Premium work, attention to detail',
            icon: 'sparkles'
          }
        ]
      },

      // Style: Visual preferences
      {
        id: 'color_scheme',
        type: 'style-picker',
        priority: 4,
        category: 'style',
        question: 'Choose your color scheme',
        personalizedQuestion: 'What colors represent [Business Name] best?',
        captures: ['color_preferences', 'brand_style'],
        infers: ['brand_personality', 'target_demographic', 'industry_positioning'],
        showIf: (ctx) => !ctx.businessData.brandColors || ctx.businessData.brandColors.length === 0,
        skipIf: (ctx) => ctx.businessData.brandColors && ctx.businessData.brandColors.length >= 2,
        confidence: (ctx) => ctx.businessData.brandColors ? 0.7 : 0.2,
        options: this.getColorSchemeOptions(industry)
      },

      // Style: Typography
      {
        id: 'typography',
        type: 'style-picker',
        priority: 5,
        category: 'style',
        question: 'Select your typography style',
        personalizedQuestion: 'What typography fits [Business Name]?',
        captures: ['font_preferences', 'typography_style'],
        infers: ['brand_personality', 'professionalism_level', 'target_age_group'],
        showIf: (ctx) => !ctx.businessData.typography,
        skipIf: (ctx) => ctx.businessData.typography !== undefined,
        confidence: (ctx) => ctx.businessData.typography ? 0.8 : 0.3,
        options: this.getTypographyOptions(industry)
      }
    ]
  }

  /**
   * Select optimal questions based on current data and confidence
   */
  private selectOptimalQuestions(): AdaptiveQuestion[] {
    const candidates = this.questionPool
      .filter(q => q.showIf(this.context) && !q.skipIf(this.context))
      .sort((a, b) => {
        // Sort by priority first, then by confidence (lower confidence = higher need)
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        return a.confidence(this.context) - b.confidence(this.context)
      })

    // Select top 3-5 questions for optimal UX
    const maxQuestions = this.context.businessData.dataScore?.total < 30 ? 5 : 3
    return candidates.slice(0, maxQuestions)
  }

  /**
   * Re-evaluate remaining questions based on new data
   */
  private reEvaluateQuestions(): void {
    // Remove questions that are no longer relevant
    const remainingQuestions = this.selectedQuestions.slice(this.currentQuestionIndex)
    const stillRelevant = remainingQuestions.filter(q => 
      q.showIf(this.context) && !q.skipIf(this.context)
    )
    
    // Update the selected questions array
    this.selectedQuestions = [
      ...this.selectedQuestions.slice(0, this.currentQuestionIndex),
      ...stillRelevant
    ]
  }

  /**
   * Generate inferences from user answer
   */
  private generateInferences(question: AdaptiveQuestion, answer: any): Record<string, any> {
    const inferences: Record<string, any> = {}
    
    // Service-specific inferences
    if (question.id === 'services' && Array.isArray(answer)) {
      inferences.service_count = answer.length
      inferences.service_mix = this.categorizeServices(answer)
      inferences.positioning = this.inferPositioningFromServices(answer)
      inferences.target_market = this.inferTargetMarketFromServices(answer)
    }
    
    // Differentiation inferences
    if (question.id === 'differentiation' && Array.isArray(answer)) {
      inferences.trust_signals = answer.filter(a => ['licensed', 'award-winning', 'guaranteed'].includes(a))
      inferences.brand_personality = this.inferBrandPersonality(answer)
      inferences.target_messaging = this.inferMessaging(answer)
    }
    
    // Emergency availability inferences
    if (question.id === 'emergency_availability') {
      inferences.positioning = answer === '24-7' ? 'emergency-focused' : 'appointment-based'
      inferences.pricing_tier = answer === '24-7' ? 'premium' : 'standard'
      inferences.target_urgency = answer === '24-7' ? 'high' : 'low'
    }
    
    // Business positioning inferences
    if (question.id === 'business_positioning') {
      inferences.messaging_tone = answer === 'speed' ? 'urgent' : 'quality-focused'
      inferences.pricing_strategy = answer === 'speed' ? 'competitive' : 'premium'
      inferences.target_demographic = answer === 'speed' ? 'busy-professionals' : 'quality-conscious'
    }
    
    return inferences
  }

  /**
   * Update business data with new inferences
   */
  private updateBusinessDataWithInferences(inferences: Record<string, any>): void {
    // Update confidence scores
    Object.keys(inferences).forEach(key => {
      this.context.confidence[key] = 0.8 // High confidence from user input
    })
    
    // Update business data
    Object.assign(this.context.businessData, inferences)
  }

  /**
   * Calculate overall data completeness percentage
   */
  private calculateDataCompleteness(): number {
    const requiredFields = [
      'services', 'differentiation', 'positioning', 'availability',
      'brand_style', 'target_market'
    ]
    
    const completedFields = requiredFields.filter(field => 
      this.context.businessData[field] || this.context.userResponses[field]
    )
    
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }

  /**
   * Extract all inferences made during the session
   */
  private extractInferences(): Record<string, any> {
    const inferences: Record<string, any> = {}
    
    // Collect all inferred data points
    Object.entries(this.context.userResponses).forEach(([questionId, answer]) => {
      const question = this.questionPool.find(q => q.id === questionId)
      if (question) {
        const questionInferences = this.generateInferences(question, answer)
        Object.assign(inferences, questionInferences)
      }
    })
    
    return inferences
  }

  // Helper methods for generating question options
  private getDifferentiatorOptions(industry: IndustryType) {
    const baseOptions = [
      { value: 'family-owned', label: 'Family Owned', icon: '👨‍👩‍👧', description: 'Owned and operated by a family' },
      { value: 'eco-friendly', label: 'Eco-Friendly', icon: '🌱', description: 'Sustainable practices' },
      { value: 'award-winning', label: 'Award Winning', icon: '🏆', description: 'Industry recognition' },
      { value: 'best-rated', label: 'Best in Town', icon: '⭐', description: 'Top-rated service' },
      { value: 'guaranteed', label: 'Satisfaction Guaranteed', icon: '💯', description: '100% guarantee' },
      { value: 'free-estimates', label: 'Free Estimates', icon: '🎯', description: 'No obligation quotes' },
      { value: 'veteran-owned', label: 'Veteran Owned', icon: '🇺🇸', description: 'Military values' },
      { value: 'women-owned', label: 'Women Owned', icon: '💪', description: 'Female leadership' },
      { value: 'licensed', label: 'Licensed & Insured', icon: '📋', description: 'Fully certified and protected', allowUnsure: true }
    ]
    
    // Add industry-specific options
    const industrySpecific: Record<string, any[]> = {
      plumbing: [
        { value: 'master-plumber', label: 'Master Plumber', icon: '🔧', description: 'Highest certification level' }
      ],
      hvac: [
        { value: 'nate-certified', label: 'NATE Certified', icon: '❄️', description: 'Industry standard certification' }
      ],
      electrical: [
        { value: 'master-electrician', label: 'Master Electrician', icon: '⚡', description: 'Highest license level' }
      ]
    }
    
    return [...baseOptions, ...(industrySpecific[industry] || [])]
  }

  private getColorSchemeOptions(industry: IndustryType) {
    // Industry-appropriate color schemes
    const schemes: Record<string, any[]> = {
      landscaping: [
        { 
          value: 'natural-green', 
          label: 'Natural Green', 
          preview: {
            colors: {
              primary: '#2D5016',
              secondary: '#4A7C59',
              accent: '#8FBC8F'
            }
          }
        },
        { 
          value: 'earth-tones', 
          label: 'Earth Tones', 
          preview: {
            colors: {
              primary: '#8B4513',
              secondary: '#CD853F',
              accent: '#DEB887'
            }
          }
        },
        { 
          value: 'fresh-modern', 
          label: 'Fresh & Modern', 
          preview: {
            colors: {
              primary: '#228B22',
              secondary: '#32CD32',
              accent: '#98FB98'
            }
          }
        }
      ],
      plumbing: [
        { 
          value: 'trust-blue', 
          label: 'Trustworthy Blue', 
          preview: {
            colors: {
              primary: '#1E3A8A',
              secondary: '#3B82F6',
              accent: '#93C5FD'
            }
          }
        },
        { 
          value: 'professional-navy', 
          label: 'Professional Navy', 
          preview: {
            colors: {
              primary: '#1E293B',
              secondary: '#475569',
              accent: '#94A3B8'
            }
          }
        },
        { 
          value: 'clean-aqua', 
          label: 'Clean Aqua', 
          preview: {
            colors: {
              primary: '#0891B2',
              secondary: '#06B6D4',
              accent: '#67E8F9'
            }
          }
        }
      ],
      general: [
        { 
          value: 'professional-blue', 
          label: 'Professional Blue', 
          preview: {
            colors: {
              primary: '#1E40AF',
              secondary: '#3B82F6',
              accent: '#93C5FD'
            }
          }
        },
        { 
          value: 'warm-gray', 
          label: 'Warm Gray', 
          preview: {
            colors: {
              primary: '#374151',
              secondary: '#6B7280',
              accent: '#D1D5DB'
            }
          }
        },
        { 
          value: 'modern-teal', 
          label: 'Modern Teal', 
          preview: {
            colors: {
              primary: '#0F766E',
              secondary: '#14B8A6',
              accent: '#5EEAD4'
            }
          }
        }
      ]
    }
    
    return schemes[industry] || schemes.general
  }

  private getTypographyOptions(industry: IndustryType) {
    return [
      { 
        value: 'professional', 
        label: 'Professional', 
        description: 'Clean and trustworthy',
        preview: {
          fontFamily: '"Inter", "Helvetica Neue", sans-serif',
          fontSize: '16px',
          fontWeight: 400,
          letterSpacing: '-0.01em',
          lineHeight: '1.5'
        }
      },
      { 
        value: 'modern', 
        label: 'Modern', 
        description: 'Contemporary and fresh',
        preview: {
          fontFamily: '"Poppins", "Montserrat", sans-serif',
          fontSize: '16px',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          lineHeight: '1.6'
        }
      },
      { 
        value: 'friendly', 
        label: 'Friendly', 
        description: 'Approachable and warm',
        preview: {
          fontFamily: '"Open Sans", "Lato", sans-serif',
          fontSize: '16px',
          fontWeight: 400,
          letterSpacing: '0',
          lineHeight: '1.7'
        }
      },
      { 
        value: 'bold', 
        label: 'Bold', 
        description: 'Strong and confident',
        preview: {
          fontFamily: '"Oswald", "Bebas Neue", sans-serif',
          fontSize: '18px',
          fontWeight: 600,
          letterSpacing: '0.02em',
          lineHeight: '1.4'
        }
      }
    ]
  }

  // Inference helper methods
  private categorizeServices(services: string[]): string {
    // Categorize service mix (e.g., 'emergency-focused', 'maintenance-focused', 'installation-focused')
    const emergencyServices = services.filter(s => s.includes('emergency')).length
    const maintenanceServices = services.filter(s => s.includes('maintenance') || s.includes('repair')).length
    const installationServices = services.filter(s => s.includes('installation') || s.includes('replacement')).length
    
    if (emergencyServices > 0) return 'emergency-focused'
    if (maintenanceServices > installationServices) return 'maintenance-focused'
    return 'installation-focused'
  }

  private inferPositioningFromServices(services: string[]): string {
    if (services.some(s => s.includes('emergency') || s.includes('24'))) return 'emergency-focused'
    if (services.some(s => s.includes('premium') || s.includes('luxury'))) return 'premium'
    if (services.some(s => s.includes('basic') || s.includes('standard'))) return 'value-focused'
    return 'full-service'
  }

  private inferTargetMarketFromServices(services: string[]): string {
    if (services.some(s => s.includes('commercial') || s.includes('business'))) return 'commercial'
    if (services.some(s => s.includes('residential') || s.includes('home'))) return 'residential'
    return 'mixed'
  }

  private inferBrandPersonality(differentiators: string[]): string {
    if (differentiators.includes('family-owned')) return 'family-friendly'
    if (differentiators.includes('eco-friendly')) return 'environmentally-conscious'
    if (differentiators.includes('award-winning')) return 'premium'
    if (differentiators.includes('veteran-owned')) return 'trustworthy'
    return 'professional'
  }

  private inferMessaging(differentiators: string[]): string {
    if (differentiators.includes('guaranteed')) return 'confidence-focused'
    if (differentiators.includes('free-estimates')) return 'value-focused'
    if (differentiators.includes('best-rated')) return 'quality-focused'
    return 'service-focused'
  }
}