/**
 * Intelligence System - Analyze Endpoint
 * 
 * **Created**: December 23, 2024, 2:21 AM CST
 * **Last Updated**: June 29, 2025, 6:10 PM CST
 * 
 * Analyzes business data from multiple sources and calculates
 * a comprehensive data richness score. Enhanced with bulk GBP field mapping.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateDataScore, detectIndustryFromData } from '@/lib/intelligence/scoring'
import type { BusinessIntelligenceData } from '@/lib/intelligence/scoring'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { businessName, placeId, gbpData, placesData, serpData, siteId } = body

    if (!businessName || !gbpData) {
      return NextResponse.json(
        { error: 'Business name and GBP data are required' },
        { status: 400 }
      )
    }

    // Construct intelligence data
    const intelligenceData: BusinessIntelligenceData = {
      businessName: gbpData.name || gbpData.businessName || businessName,
      industry: 'general' as any, // Will be detected
      gbp: {
        businessName: gbpData.name || gbpData.businessName || businessName,
        description: gbpData.description || gbpData.profile?.description,
        categories: [
          ...(gbpData.primaryCategory ? [gbpData.primaryCategory.displayName || gbpData.primaryCategory.name] : []),
          ...(gbpData.additionalCategories || []).map((cat: any) => cat.displayName || cat.name || cat)
        ].filter(Boolean),
        photos: gbpData.photos || [],
        attributes: gbpData.attributes || {},
        reviews: gbpData.reviews,
        hours: gbpData.hours || gbpData.regularHours
      },
      places: placesData,
      serp: serpData,
      manual: {},
      // Add other fields from GBP data
      phone: gbpData.primaryPhone || gbpData.phone,
      website: gbpData.website || gbpData.websiteUri,
      coordinates: gbpData.coordinates || gbpData.latlng,
      businessHours: gbpData.regularHours || gbpData.hours,
      metaDescription: gbpData.profile?.description || gbpData.description
    }

    // Calculate base data score
    const baseDataScore = calculateDataScore(intelligenceData)
    
    // Extract years from description if available
    const extractedYears = extractYearsFromDescription(gbpData.profile?.description || gbpData.description)
    
    // Check if business is 24/7
    const is24Hours = check24HoursFromRegularHours(gbpData.regularHours || gbpData.hours)
    
    // Check for delivery hours
    const hasDelivery = gbpData.moreHours?.some((h: any) => h.hoursTypeId === 'DELIVERY') || false
    
    // Calculate service radius from city list
    const serviceRadiusFromCities = calculateServiceRadiusFromCities(gbpData.serviceArea)
    
    // Enhanced data score with ALL mapped GBP fields
    const dataScore = {
      ...baseDataScore,
      // Direct mappings from GBP field mapping document
      phone: gbpData.phoneNumbers?.primaryPhone || gbpData.primaryPhone || gbpData.phone,
      secondaryPhone: gbpData.adWordsLocationExtensions?.phoneNumber,
      streetAddress: gbpData.storefrontAddress || gbpData.fullAddress || gbpData.address,
      businessHours: gbpData.regularHours || gbpData.hours,
      specialHours: gbpData.specialHours,
      moreHours: gbpData.moreHours,
      website: gbpData.websiteUri || gbpData.website,
      businessDescription: gbpData.profile?.description || gbpData.description,
      menuUrl: gbpData.menuUrl,
      serviceAreaCities: gbpData.serviceArea?.places?.placeInfos,
      businessImages: gbpData.photos || [],
      businessFeatures: gbpData.attributes || {},
      socialLinks: gbpData.url,
      industry: gbpData.primaryCategory?.displayName || gbpData.primaryCategory?.name,
      additionalCategories: gbpData.additionalCategories || [],
      metadata: gbpData.metadata || {},
      labels: gbpData.labels || [],
      serviceItems: gbpData.serviceItems || [],
      // Extracted/calculated fields
      yearsInBusiness: extractedYears,
      serviceRadius: serviceRadiusFromCities,
      is24Hours,
      hasDelivery,
      businessType: gbpData.serviceArea?.businessType,
      // Additional useful fields
      openInfo: gbpData.openInfo,
      relationshipData: gbpData.relationshipData,
      adWordsLocationExtensions: gbpData.adWordsLocationExtensions,
      coordinates: gbpData.coordinates || gbpData.latlng,
      languageCode: gbpData.languageCode,
      storeCode: gbpData.storeCode
    }
    
    // Detect industry
    const detectedIndustry = detectIndustryFromData(intelligenceData)

    // Store or update intelligence record
    const intelligence = await prisma.businessIntelligence.upsert({
      where: {
        ...(siteId ? { siteId } : { id: 'new' })
      },
      update: {
        businessName,
        placeId,
        dataScore: dataScore as any,
        gbpData: gbpData || {},
        placesData: placesData || null,
        serpData: serpData || null,
        updatedAt: new Date()
      },
      create: {
        businessName,
        placeId,
        siteId,
        dataScore: dataScore as any,
        gbpData: gbpData || {},
        placesData: placesData || null,
        serpData: serpData || null
      }
    })

    return NextResponse.json({
      success: true,
      intelligenceId: intelligence.id,
      dataScore,
      detectedIndustry,
      suggestions: getDataEnhancementSuggestions(dataScore)
    })
  } catch (error) {
    console.error('Intelligence analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze business data' },
      { status: 500 }
    )
  }
}

function getDataEnhancementSuggestions(score: any): string[] {
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

/**
 * Extract years in business from description text
 */
function extractYearsFromDescription(description: string | undefined): number | null {
  if (!description) return null
  
  // Match patterns like "40 years", "since 1985", "established 2010"
  const yearPatterns = [
    /(\d+)\s*(?:year|yr)s?\s*(?:of\s*)?(?:experience|service|business)/i,
    /(?:since|established|founded)\s*(\d{4})/i,
    /(?:over|more than)\s*(\d+)\s*years/i
  ]
  
  for (const pattern of yearPatterns) {
    const match = description.match(pattern)
    if (match) {
      const value = parseInt(match[1])
      // If it's a year, calculate years from now
      if (value > 1900 && value <= new Date().getFullYear()) {
        return new Date().getFullYear() - value
      }
      // Otherwise it's already years
      return value
    }
  }
  
  return null
}

/**
 * Check if business operates 24/7
 */
function check24HoursFromRegularHours(regularHours: any): boolean {
  if (!regularHours?.periods) return false
  
  // Check if all days have 24 hour coverage
  const periods = regularHours.periods
  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  
  return daysOfWeek.every(day => {
    const dayPeriods = periods.filter((p: any) => p.openDay === day)
    return dayPeriods.some((p: any) => {
      // Check for 24 hour notation
      return (p.openTime?.hours === 0 || !p.openTime) && 
             (p.closeTime?.hours === 24 || !p.closeTime)
    })
  })
}

/**
 * Calculate service radius from city list
 */
function calculateServiceRadiusFromCities(serviceArea: any): number | null {
  if (!serviceArea?.places?.placeInfos) return null
  
  const cityCount = serviceArea.places.placeInfos.length
  
  // Estimate based on number of cities
  if (cityCount === 1) return 10
  if (cityCount <= 3) return 20
  if (cityCount <= 6) return 30
  if (cityCount <= 10) return 40
  return 50 // 10+ cities = wide area
}