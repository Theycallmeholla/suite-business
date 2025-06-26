/**
 * Intelligence System - Analyze Endpoint
 * 
 * **Created**: December 23, 2024, 2:21 AM CST
 * **Last Updated**: December 23, 2024, 2:21 AM CST
 * 
 * Analyzes business data from multiple sources and calculates
 * a comprehensive data richness score.
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
      gbp: {
        businessName: gbpData.businessName || businessName,
        description: gbpData.description,
        categories: gbpData.categories || [],
        photos: gbpData.photos || [],
        attributes: gbpData.attributes || {},
        reviews: gbpData.reviews,
        hours: gbpData.hours
      },
      places: placesData,
      serp: serpData,
      manual: {}
    }

    // Calculate data score
    const dataScore = calculateDataScore(intelligenceData)
    
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