/**
 * Question Suppression Logic
 * 
 * **Created**: June 28, 2025, 9:30 PM CST
 * **Last Updated**: June 28, 2025, 9:30 PM CST
 * 
 * Determines whether to ask specific questions based on available data
 * and confidence levels, making the onboarding flow truly intelligent.
 */

interface SuppressionContext {
  dataScore: any
  gbpData: any
  userAnswers?: Record<string, any>
  confidence: Record<string, number>
}

interface SuppressionRule {
  questionId: string
  condition: (context: SuppressionContext) => boolean
  reason?: string
}

/**
 * Core suppression rules for common questions
 */
const suppressionRules: SuppressionRule[] = [
  {
    questionId: 'service-radius',
    condition: (ctx) => {
      // Suppress if we have high confidence calculated radius
      return ctx.confidence.service_radius >= 0.7
    },
    reason: 'Service radius calculated from service area data'
  },
  {
    questionId: 'years-in-business',
    condition: (ctx) => {
      // Suppress if we extracted years with any confidence
      return ctx.confidence.years_in_business > 0
    },
    reason: 'Years in business extracted from profile data'
  },
  {
    questionId: 'business-hours',
    condition: (ctx) => {
      // Suppress if we have regular hours from GBP
      return !!ctx.gbpData?.regularHours?.periods?.length
    },
    reason: 'Business hours available from Google Business Profile'
  },
  {
    questionId: 'business-description',
    condition: (ctx) => {
      // Suppress if we have a good description from GBP
      const description = ctx.gbpData?.profile?.description || ctx.gbpData?.description
      return description && description.length > 100
    },
    reason: 'Business description available from profile'
  },
  {
    questionId: 'primary-phone',
    condition: (ctx) => {
      // Suppress if we have phone from GBP
      return !!ctx.gbpData?.phoneNumbers?.primaryPhone
    },
    reason: 'Phone number available from Google Business Profile'
  },
  {
    questionId: 'website',
    condition: (ctx) => {
      // Suppress if we have website from GBP
      return !!ctx.gbpData?.websiteUri
    },
    reason: 'Website available from Google Business Profile'
  },
  {
    questionId: 'business-email',
    condition: (ctx) => {
      // Suppress if we can infer from website domain
      const website = ctx.gbpData?.websiteUri
      if (website) {
        try {
          const domain = new URL(website).hostname
          return !domain.includes('facebook') && !domain.includes('google')
        } catch {
          return false
        }
      }
      return false
    },
    reason: 'Email can be inferred from website domain'
  }
]

/**
 * Check if a question should be suppressed
 */
export function shouldSuppressQuestion(
  questionId: string,
  context: SuppressionContext
): { suppress: boolean; reason?: string } {
  const rule = suppressionRules.find(r => r.questionId === questionId)
  
  if (!rule) {
    return { suppress: false }
  }
  
  const suppress = rule.condition(context)
  return {
    suppress,
    reason: suppress ? rule.reason : undefined
  }
}

/**
 * Filter questions based on suppression rules
 */
export function applyQuestionSuppression(
  questions: any[],
  context: SuppressionContext
): { questions: any[]; suppressedCount: number; suppressionReasons: Record<string, string> } {
  const suppressionReasons: Record<string, string> = {}
  let suppressedCount = 0
  
  const filteredQuestions = questions.filter(question => {
    const { suppress, reason } = shouldSuppressQuestion(question.id, context)
    
    if (suppress) {
      suppressedCount++
      if (reason) {
        suppressionReasons[question.id] = reason
      }
      return false
    }
    
    return true
  })
  
  return {
    questions: filteredQuestions,
    suppressedCount,
    suppressionReasons
  }
}

/**
 * Calculate confidence scores from various data sources
 */
export function calculateConfidenceScores(
  dataScore: any,
  gbpData: any
): Record<string, number> {
  return {
    service_radius: dataScore.radius_confidence || 0,
    years_in_business: dataScore.years_confidence || 0,
    services: dataScore.services_confidence || 0,
    business_hours: gbpData?.regularHours ? 1 : 0,
    contact_info: gbpData?.phoneNumbers?.primaryPhone ? 0.9 : 0,
    location: gbpData?.storefrontAddress ? 1 : 0,
    description: (gbpData?.profile?.description?.length || 0) > 100 ? 0.8 : 0
  }
}

/**
 * Get suppression summary for analytics
 */
export function getSuppressionSummary(
  originalCount: number,
  finalCount: number,
  suppressionReasons: Record<string, string>
): {
  reductionPercentage: number
  suppressedQuestions: string[]
  efficiency: 'high' | 'medium' | 'low'
} {
  const reductionPercentage = Math.round(((originalCount - finalCount) / originalCount) * 100)
  const suppressedQuestions = Object.keys(suppressionReasons)
  
  let efficiency: 'high' | 'medium' | 'low'
  if (reductionPercentage >= 60) {
    efficiency = 'high'
  } else if (reductionPercentage >= 30) {
    efficiency = 'medium'
  } else {
    efficiency = 'low'
  }
  
  return {
    reductionPercentage,
    suppressedQuestions,
    efficiency
  }
}