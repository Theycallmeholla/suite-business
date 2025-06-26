/**
 * Intelligence System - Data Scoring Algorithm
 * 
 * **Created**: December 23, 2024, 2:15 AM CST
 * **Last Updated**: December 23, 2024, 2:15 AM CST
 * 
 * This module calculates a comprehensive data richness score (0-100) based on
 * available business information from multiple sources.
 */

import { IndustryType } from '@/types/site-builder'

export interface BusinessIntelligenceData {
  // Google Business Profile (Existing)
  gbp: {
    businessName: string
    description?: string
    categories: string[]
    photos: Array<{ url: string; caption?: string }>
    attributes: Record<string, any>
    reviews?: {
      rating: number
      count: number
    }
    hours?: Record<string, { open: string; close: string }>
  }
  
  // Google Places Enhanced (New)
  places?: {
    placeId: string
    reviews: {
      rating: number
      total: number
      highlights: string[] // AI-extracted themes
      sentiment: {
        positive: string[]
        negative: string[]
      }
    }
    popularTimes?: Array<{ day: string; hours: number[] }>
    priceLevel?: number // 1-4
    photos: Array<{ url: string; reference: string }>
  }
  
  // SerpAPI Results (New)
  serp?: {
    localResults: Array<{ title: string; link: string }>
    organicResults: Array<{ title: string; link: string; snippet: string }>
    relatedSearches: string[]
    peopleAlsoAsk: Array<{ question: string; answer: string }>
  }
  
  // Manual Input
  manual?: {
    yearsInBusiness?: number
    certifications?: string[]
    awards?: string[]
    specializations?: string[]
    teamSize?: number
  }
}

export interface DataScore {
  total: number // 0-100
  breakdown: {
    basicInfo: number      // 20 points max
    content: number        // 20 points max
    visuals: number        // 20 points max
    trust: number          // 20 points max
    differentiation: number // 20 points max
  }
  missingCritical: string[]
  contentTier: 'minimal' | 'standard' | 'premium'
}

export function calculateDataScore(data: BusinessIntelligenceData): DataScore {
  const scores = {
    basicInfo: 0,
    content: 0,
    visuals: 0,
    trust: 0,
    differentiation: 0
  }
  
  const missingCritical: string[] = []
  
  // Basic Info (20 points)
  if (data.gbp.businessName) {
    scores.basicInfo += 5
  } else {
    missingCritical.push('business_name')
  }
  
  if (data.gbp.categories.length > 0) {
    scores.basicInfo += 5
  } else {
    missingCritical.push('business_category')
  }
  
  if (data.gbp.hours && Object.keys(data.gbp.hours).length > 0) {
    scores.basicInfo += 5
  }
  
  if (data.gbp.attributes?.phone || data.gbp.attributes?.website) {
    scores.basicInfo += 5
  } else {
    missingCritical.push('contact_info')
  }
  
  // Content (20 points)
  if (data.gbp.description && data.gbp.description.length > 100) {
    scores.content += 10
  } else if (data.gbp.description && data.gbp.description.length > 50) {
    scores.content += 5
  }
  
  if (data.manual?.specializations && data.manual.specializations.length > 0) {
    scores.content += 5
  }
  
  if (data.serp?.peopleAlsoAsk && data.serp.peopleAlsoAsk.length > 0) {
    scores.content += 5
  }
  
  // Visuals (20 points)
  const photoCount = (data.gbp.photos?.length || 0) + (data.places?.photos?.length || 0)
  if (photoCount >= 1) scores.visuals += 5
  if (photoCount >= 4) scores.visuals += 10
  if (photoCount >= 10) scores.visuals += 5
  
  if (photoCount === 0) {
    missingCritical.push('photos')
  }
  
  // Trust (20 points)
  if (data.gbp.reviews && data.gbp.reviews.rating >= 4.0) {
    scores.trust += 10
  }
  
  if (data.gbp.reviews && data.gbp.reviews.count >= 10) {
    scores.trust += 5
  }
  
  if (data.manual?.certifications && data.manual.certifications.length > 0) {
    scores.trust += 5
  }
  
  // Differentiation (20 points)
  if (data.manual?.awards && data.manual.awards.length > 0) {
    scores.differentiation += 10
  }
  
  if (data.manual?.yearsInBusiness && data.manual.yearsInBusiness > 5) {
    scores.differentiation += 5
  }
  
  if (data.places?.reviews?.highlights && data.places.reviews.highlights.length > 3) {
    scores.differentiation += 5
  }
  
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  
  return {
    total,
    breakdown: scores,
    missingCritical,
    contentTier: total >= 70 ? 'premium' : total >= 40 ? 'standard' : 'minimal'
  }
}

export function determineMissingCritical(
  data: BusinessIntelligenceData,
  scores: DataScore['breakdown']
): string[] {
  const missing: string[] = []
  
  if (!data.gbp.businessName) missing.push('business_name')
  if (data.gbp.categories.length === 0) missing.push('business_category')
  if (!data.gbp.attributes?.phone && !data.gbp.attributes?.website) missing.push('contact_info')
  
  const photoCount = (data.gbp.photos?.length || 0) + (data.places?.photos?.length || 0)
  if (photoCount === 0) missing.push('photos')
  
  if (!data.manual?.specializations || data.manual.specializations.length === 0) {
    missing.push('services')
  }
  
  return missing
}

export function getDataEnhancementSuggestions(score: DataScore): string[] {
  const suggestions: string[] = []
  
  if (score.breakdown.basicInfo < 15) {
    suggestions.push('Add business hours and complete contact information')
  }
  
  if (score.breakdown.content < 15) {
    suggestions.push('Add a detailed business description and list your key services')
  }
  
  if (score.breakdown.visuals < 15) {
    suggestions.push('Upload at least 4-6 high-quality photos of your work')
  }
  
  if (score.breakdown.trust < 15) {
    suggestions.push('Encourage customer reviews and add professional certifications')
  }
  
  if (score.breakdown.differentiation < 10) {
    suggestions.push('Highlight what makes your business unique - awards, years of experience, or specialties')
  }
  
  return suggestions
}

export function detectIndustryFromData(data: BusinessIntelligenceData): IndustryType {
  const businessName = data.gbp.businessName.toLowerCase()
  const categories = data.gbp.categories.map(c => c.toLowerCase()).join(' ')
  const description = (data.gbp.description || '').toLowerCase()
  const combined = `${businessName} ${categories} ${description}`
  
  // Industry detection keywords
  const industryKeywords: Record<IndustryType, string[]> = {
    landscaping: ['landscap', 'lawn', 'garden', 'yard', 'mowing', 'tree', 'irrigation'],
    plumbing: ['plumb', 'pipe', 'drain', 'water heater', 'leak', 'faucet'],
    hvac: ['hvac', 'heating', 'cooling', 'air condition', 'furnace', 'ac repair'],
    electrical: ['electric', 'wiring', 'outlet', 'circuit', 'lighting'],
    roofing: ['roof', 'shingle', 'gutter', 'siding'],
    cleaning: ['clean', 'maid', 'janitor', 'housekeep'],
    general: []
  }
  
  // Count matches for each industry
  let bestMatch: IndustryType = 'general'
  let highestScore = 0
  
  Object.entries(industryKeywords).forEach(([industry, keywords]) => {
    if (industry === 'general') return
    
    const score = keywords.reduce((acc, keyword) => {
      return acc + (combined.includes(keyword) ? 1 : 0)
    }, 0)
    
    if (score > highestScore) {
      highestScore = score
      bestMatch = industry as IndustryType
    }
  })
  
  return bestMatch
}