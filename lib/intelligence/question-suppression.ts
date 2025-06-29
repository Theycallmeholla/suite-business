/**
 * Question Suppression Logic
 * 
 * **Created**: June 28, 2025, 9:30 PM CST
 * **Last Updated**: June 29, 2025, 6:15 PM CST
 * 
 * Determines whether to ask specific questions based on available data
 * and confidence levels, making the onboarding flow truly intelligent.
 * Enhanced with aggressive suppression rules for all GBP fields.
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
 * Core suppression rules based on GBP field mapping
 * Confidence threshold: 0.7 for most fields
 */
const suppressionRules: SuppressionRule[] = [
  // Service radius - calculated from serviceArea or places
  {
    questionId: 'service-radius',
    condition: (ctx) => {
      // Suppress if we have ANY confidence in calculated radius
      return ctx.confidence.service_radius >= 0.5 // Lowered from 0.7
    },
    reason: 'Service radius calculated from service area data'
  },
  
  // Years in business - from metadata.establishedDate or description
  {
    questionId: 'business-stage',
    condition: (ctx) => {
      // Suppress if we extracted years with ANY confidence
      return ctx.confidence.years_in_business > 0 // Changed from >= 0.7
    },
    reason: 'Years in business extracted from profile data'
  },
  
  // Business hours - from regularHours.periods
  {
    questionId: 'business-hours',
    condition: (ctx) => {
      // Suppress if we have any valid regular hours
      const hasHours = ctx.gbpData?.regularHours?.periods?.length > 0
      return hasHours && ctx.gbpData.regularHours.periods.some((p: any) => 
        p.openTime && p.closeTime && p.openDay && p.closeDay
      )
    },
    reason: 'Business hours available from Google Business Profile'
  },
  
  // Business description - from profile.description
  {
    questionId: 'business-description',
    condition: (ctx) => {
      // Suppress if we have a non-generic description > 100 chars
      const description = ctx.gbpData?.profile?.description || ctx.gbpData?.description
      if (!description || description.length <= 100) return false
      
      // Check for generic/low-value patterns
      const genericPatterns = [
        /^welcome to/i,
        /^we are a/i,
        /^call us today/i,
        /best prices in town/i
      ]
      
      return !genericPatterns.some(pattern => pattern.test(description))
    },
    reason: 'Business description available from profile'
  },
  
  // Phone number - from primaryPhone
  {
    questionId: 'primary-phone',
    condition: (ctx) => {
      // Suppress if we have valid phone format
      const phone = ctx.gbpData?.phoneNumbers?.primaryPhone
      if (!phone) return false
      
      // Basic phone validation
      const phoneRegex = /^\+?1?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
      return phoneRegex.test(phone.replace(/\s+/g, ''))
    },
    reason: 'Phone number available from Google Business Profile'
  },
  
  // Website - from websiteUri
  {
    questionId: 'website',
    condition: (ctx) => {
      // Suppress if we have valid URL that's not just social media
      const website = ctx.gbpData?.websiteUri
      if (!website) return false
      
      try {
        const url = new URL(website)
        // Don't suppress if it's only a social media page
        const socialDomains = ['facebook.com', 'instagram.com', 'twitter.com', 'yelp.com']
        return !socialDomains.some(domain => url.hostname.includes(domain))
      } catch {
        return false
      }
    },
    reason: 'Website available from Google Business Profile'
  },
  
  // Business email - inferred from website or other fields
  {
    questionId: 'business-email',
    condition: (ctx) => {
      // Suppress if we can confidently infer from website domain
      const website = ctx.gbpData?.websiteUri
      if (website) {
        try {
          const domain = new URL(website).hostname
          // Only suppress for actual business domains
          const genericDomains = ['facebook', 'google', 'yelp', 'instagram', 'twitter']
          return !genericDomains.some(d => domain.includes(d))
        } catch {
          return false
        }
      }
      return false
    },
    reason: 'Email can be inferred from website domain'
  },
  
  // Street address - from storefrontAddress (not for service-area-only)
  {
    questionId: 'street-address',
    condition: (ctx) => {
      // Suppress if we have valid address lines
      const address = ctx.gbpData?.storefrontAddress
      if (!address) return false
      
      // Check it's not service-area-only
      const hasValidAddress = address.addressLines?.length > 0 && 
                            address.addressLines[0]?.length > 0 &&
                            !ctx.gbpData?.serviceArea?.businessType?.includes('SERVICE_AREA')
      
      return hasValidAddress
    },
    reason: 'Street address available from Google Business Profile'
  },
  
  // Service area cities - from serviceArea.places
  {
    questionId: 'service-areas',
    condition: (ctx) => {
      // Suppress if we have city list or polygon
      const serviceArea = ctx.gbpData?.serviceArea
      if (!serviceArea) return false
      
      const hasCities = serviceArea.places?.placeInfos?.length > 0
      const hasPolygon = serviceArea.polygon?.coordinates?.length > 0
      const hasRadius = serviceArea.radius?.radiusKm > 0
      
      return hasCities || hasPolygon || hasRadius
    },
    reason: 'Service areas available from Google Business Profile'
  },
  
  // Emergency service - for 24/7 businesses
  {
    questionId: 'emergency-service',
    condition: (ctx) => {
      // Suppress if business is 24/7 (always available for emergencies)
      return ctx.dataScore?.is24Hours === true
    },
    reason: 'Business operates 24/7 - emergency service implied'
  },
  
  // Differentiators - from description analysis
  {
    questionId: 'differentiators',
    condition: (ctx) => {
      // Suppress if description mentions experience, years, expertise, etc.
      const description = ctx.gbpData?.profile?.description || ctx.gbpData?.description || ''
      const hasExperience = /\d+\s*(?:year|yr)s?|experience|expert|specializ|professional|certified|licensed|award/i.test(description)
      const hasYears = ctx.dataScore?.yearsInBusiness > 0
      
      return hasExperience || hasYears
    },
    reason: 'Business differentiators found in description or years of experience'
  },
  
  // Delivery service - from moreHours
  {
    questionId: 'delivery-service',
    condition: (ctx) => {
      // Suppress if delivery hours are specified
      return ctx.dataScore?.hasDelivery === true
    },
    reason: 'Delivery service hours found in business data'
  },
  
  // Service types - from categories
  {
    questionId: 'service-types',
    condition: (ctx) => {
      // Suppress if we have detailed additional categories
      const hasCategories = (ctx.gbpData?.additionalCategories?.length || 0) > 0
      const hasServiceItems = (ctx.gbpData?.serviceItems?.length || 0) > 0
      
      return hasCategories || hasServiceItems
    },
    reason: 'Service types inferred from business categories'
  },
  
  // Operating hours preferences - from special hours
  {
    questionId: 'special-hours',
    condition: (ctx) => {
      // Suppress if special hours are defined
      return ctx.gbpData?.specialHours?.specialHourPeriods?.length > 0
    },
    reason: 'Special hours already defined in business profile'
  },
  
  // Menu/pricing - from menuUrl
  {
    questionId: 'menu-pricing',
    condition: (ctx) => {
      // Suppress if menu URL exists (for applicable businesses)
      return !!ctx.gbpData?.menuUrl
    },
    reason: 'Menu/pricing information available via menu URL'
  },
  
  // Social media presence - from various fields
  {
    questionId: 'social-media',
    condition: (ctx) => {
      // Suppress if we have social links or can infer from website
      const hasSocialLinks = !!ctx.gbpData?.url || !!ctx.dataScore?.socialLinks
      const hasWebsite = !!ctx.gbpData?.websiteUri
      
      return hasSocialLinks || hasWebsite
    },
    reason: 'Social media presence available or inferable'
  },
  
  // Business features/amenities - from attributes
  {
    questionId: 'amenities',
    condition: (ctx) => {
      // Suppress if attributes are populated
      const attributes = ctx.gbpData?.attributes || ctx.dataScore?.businessFeatures
      return attributes && Object.keys(attributes).length > 0
    },
    reason: 'Business amenities/features already specified'
  },
  
  // Languages spoken - from languageCode
  {
    questionId: 'languages',
    condition: (ctx) => {
      // Suppress if language code is specified
      return !!ctx.gbpData?.languageCode
    },
    reason: 'Language preferences already specified'
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
 * Based on GBP field mapping document - AGGRESSIVE MODE
 */
export function calculateConfidenceScores(
  dataScore: any,
  gbpData: any
): Record<string, number> {
  const confidence: Record<string, number> = {}
  
  // Service radius confidence - MORE AGGRESSIVE
  if (dataScore.serviceRadius || dataScore.radius_confidence) {
    confidence.service_radius = 1.0 // Perfect confidence if we calculated it
  } else if (gbpData?.serviceArea) {
    // Any service area data = high confidence
    if (gbpData.serviceArea.polygon?.coordinates?.length > 0) {
      confidence.service_radius = 1.0
    } else if (gbpData.serviceArea.places?.placeInfos?.length > 0) {
      confidence.service_radius = 0.9 // Increased from 0.8
    } else if (gbpData.serviceArea.radius?.radiusKm > 0) {
      confidence.service_radius = 0.95 // Increased from 0.85
    }
  }
  
  // Years in business confidence - MORE AGGRESSIVE
  if (dataScore.yearsInBusiness) {
    confidence.years_in_business = 1.0 // Perfect if extracted
  } else if (dataScore.years_confidence) {
    confidence.years_in_business = dataScore.years_confidence
  } else if (gbpData?.metadata?.establishedDate?.year) {
    confidence.years_in_business = 1.0
  } else if (gbpData?.metadata?.openingDate?.year) {
    confidence.years_in_business = 1.0
  } else if (gbpData?.profile?.description?.match(/(\d+)\s*(?:year|yr)s?|since \d{4}/i)) {
    confidence.years_in_business = 0.9 // Increased from 0.8
  }
  
  // Other fields - ALL SET TO 1.0 IF ANY DATA EXISTS
  confidence.business_hours = gbpData?.regularHours?.periods?.length > 0 ? 1.0 : 0
  confidence.contact_info = (gbpData?.phoneNumbers?.primaryPhone || gbpData?.primaryPhone) ? 1.0 : 0
  confidence.location = (gbpData?.storefrontAddress || gbpData?.fullAddress) ? 1.0 : 0
  confidence.website = (gbpData?.websiteUri || gbpData?.website) ? 1.0 : 0
  
  // Emergency service - if 24/7
  confidence.emergency_service = dataScore.is24Hours ? 1.0 : 0
  
  // Differentiators - from description or years
  const description = gbpData?.profile?.description || gbpData?.description || ''
  const hasDifferentiators = /\d+\s*(?:year|yr)s?|experience|expert|specializ|professional/i.test(description)
  confidence.differentiators = hasDifferentiators || dataScore.yearsInBusiness > 0 ? 1.0 : 0
  
  // Service types - from categories
  confidence.service_types = (gbpData?.additionalCategories?.length > 0 || gbpData?.serviceItems?.length > 0) ? 1.0 : 0
  
  // Description confidence - MORE LENIENT
  if (description) {
    if (description.length > 50) { // Lowered from 100
      confidence.description = 1.0 // Any decent description = perfect
    } else {
      confidence.description = 0.7
    }
  } else {
    confidence.description = 0
  }
  
  // Additional confidence scores for new fields
  confidence.delivery_service = dataScore.hasDelivery ? 1.0 : 0
  confidence.special_hours = gbpData?.specialHours?.specialHourPeriods?.length > 0 ? 1.0 : 0
  confidence.menu_pricing = gbpData?.menuUrl ? 1.0 : 0
  confidence.social_media = (gbpData?.url || gbpData?.websiteUri) ? 0.9 : 0
  confidence.amenities = (gbpData?.attributes && Object.keys(gbpData.attributes).length > 0) ? 1.0 : 0
  confidence.languages = gbpData?.languageCode ? 1.0 : 0
  
  return confidence
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