/**
 * Business Age Extractor
 * 
 * **Created**: June 28, 2025, 9:20 PM CST
 * **Last Updated**: June 29, 2025, 6:20 PM CST
 * 
 * Extracts years in business from various Google Business Profile data points
 * to avoid asking users for information we can infer.
 * Enhanced to better extract patterns like "over 40 years".
 */

interface BusinessAgeResult {
  yearsInBusiness?: number
  establishedYear?: number
  confidence: number // 0-1
  source?: 'metadata' | 'description' | 'default' | 'none'
}

/**
 * Extract years in business from GBP data
 */
export function extractBusinessAge(gbpData: any): BusinessAgeResult {
  const currentYear = new Date().getFullYear()
  
  // Check metadata for establishedDate
  if (gbpData?.metadata?.establishedDate) {
    const establishedYear = parseInt(gbpData.metadata.establishedDate)
    if (establishedYear && establishedYear > 1900 && establishedYear <= currentYear) {
      return {
        yearsInBusiness: currentYear - establishedYear,
        establishedYear,
        confidence: 0.95,
        source: 'metadata'
      }
    }
  }

  // Check for yearEstablished in various places
  const yearEstablishedPaths = [
    'yearEstablished',
    'profile.yearEstablished',
    'metadata.yearEstablished',
    'additionalInfo.yearEstablished'
  ]

  for (const path of yearEstablishedPaths) {
    const value = getNestedValue(gbpData, path)
    if (value) {
      const year = parseInt(value)
      if (year && year > 1900 && year <= currentYear) {
        return {
          yearsInBusiness: currentYear - year,
          establishedYear: year,
          confidence: 0.9,
          source: 'metadata'
        }
      }
    }
  }

  // Try to extract from description using regex patterns
  if (gbpData?.profile?.description || gbpData?.description) {
    const description = gbpData.profile?.description || gbpData.description
    const ageResult = extractFromDescription(description, currentYear)
    if (ageResult.yearsInBusiness) {
      return ageResult
    }
  }

  // Check regularHours for "established" info (some businesses put it there)
  if (gbpData?.regularHours?.moreHoursTypes) {
    for (const moreHours of gbpData.regularHours.moreHoursTypes) {
      if (moreHours.displayName?.toLowerCase().includes('established')) {
        const yearMatch = moreHours.displayName.match(/\b(19|20)\d{2}\b/)
        if (yearMatch) {
          const year = parseInt(yearMatch[0])
          if (year > 1900 && year <= currentYear) {
            return {
              yearsInBusiness: currentYear - year,
              establishedYear: year,
              confidence: 0.7,
              source: 'description'
            }
          }
        }
      }
    }
  }

  // No data found
  return {
    confidence: 0,
    source: 'none'
  }
}

/**
 * Extract years from description text
 */
function extractFromDescription(description: string, currentYear: number): BusinessAgeResult {
  const patterns = [
    // "Established in 1995"
    /established\s+(?:in\s+)?(\d{4})/i,
    // "Since 1995"
    /since\s+(\d{4})/i,
    // "Founded in 1995"
    /founded\s+(?:in\s+)?(\d{4})/i,
    // "Serving since 1995"
    /serving\s+(?:since\s+)?(\d{4})/i,
    // "25 years of experience" or "25+ years" - ENHANCED
    /(\d+)\+?\s+years?\s+(?:of\s+)?(?:experience|service|business|grinding)/i,
    // "Over 25 years" - ENHANCED to catch "over 40 years of grinding"
    /(?:over|more than)\s+(\d+)\s+years?\s+(?:of\s+)?(?:experience|service|business|grinding)?/i,
    // "has 40 years" pattern
    /has\s+(?:over\s+)?(\d+)\s+years?\s+(?:of\s+)?(?:experience|service|business)?/i,
    // "Est. 1995"
    /est\.?\s+(\d{4})/i
  ]

  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match) {
      const value = match[1]
      
      // If it's a year
      if (value.length === 4) {
        const year = parseInt(value)
        if (year > 1900 && year <= currentYear) {
          return {
            yearsInBusiness: currentYear - year,
            establishedYear: year,
            confidence: 0.7,
            source: 'description'
          }
        }
      }
      // If it's years of experience
      else {
        const years = parseInt(value)
        if (years > 0 && years < 100) {
          return {
            yearsInBusiness: years,
            establishedYear: currentYear - years,
            confidence: 0.6,
            source: 'description'
          }
        }
      }
    }
  }

  return {
    confidence: 0,
    source: 'none'
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Determine if we should ask the years in business question
 */
export function shouldAskYearsInBusinessQuestion(result: BusinessAgeResult): boolean {
  // Only ask if we have no data at all
  return result.confidence === 0
}

/**
 * Format years in business for display
 */
export function formatYearsInBusiness(years: number): string {
  if (years === 0) {
    return 'Just Started'
  } else if (years === 1) {
    return '1 Year'
  } else if (years <= 5) {
    return `${years} Years`
  } else if (years <= 10) {
    return '5-10 Years'
  } else if (years <= 25) {
    return '10+ Years'
  } else {
    return '25+ Years'
  }
}