/**
 * Intelligence System - Questions Endpoint
 * 
 * **Created**: December 23, 2024, 2:23 AM CST
 * **Last Updated**: December 23, 2024, 2:23 AM CST
 * 
 * Generates smart questions based on data score and missing information.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getIndustryProfile, generateServiceOptions } from '@/lib/intelligence/industry-profiles'
import { filterQuestionsBasedOnKnownData } from '@/lib/intelligence/question-filtering'
import { loadExpectations } from '@/lib/data/cache'
import { getClimateZone } from '@/lib/utils/region-detector'
import { normalizeServiceName } from '@/lib/utils/service-normalizer'
import { EXPECTED_PREVALENCE_THRESHOLD, MAX_MISSING_EXPECTED_SERVICES } from '@/lib/constants/intake'
import { calculateServiceRadius, shouldAskServiceRadiusQuestion } from '@/lib/utils/service-radius-calculator'
import { extractBusinessAge, shouldAskYearsInBusinessQuestion } from '@/lib/utils/business-age-extractor'
import { applyQuestionSuppression, calculateConfidenceScores, getSuppressionSummary } from '@/lib/intelligence/question-suppression'
import type { IndustryType } from '@/types/site-builder'
import type { BusinessIntelligenceData } from '@/lib/intelligence/scoring'

interface SmartQuestion {
  id: string
  type: 'tinder-swipe' | 'service-grid' | 'quick-select' | 'yes-no-visual'
  priority: 1 | 2 | 3
  category: 'critical' | 'enhancement' | 'personalization'
  question: string
  options: Array<{
    value: string
    label: string
    icon?: string
    popular?: boolean
    description?: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { intelligenceId, industry, dataScore, missingData } = body

    if (!intelligenceId || !industry) {
      return NextResponse.json(
        { error: 'Intelligence ID and industry are required' },
        { status: 400 }
      )
    }

    // Get industry profile
    const industryProfile = getIndustryProfile(industry as IndustryType)
    
    // Generate questions based on missing data and score
    const questions = await generateSmartQuestions({
      intelligenceId,
      dataScore,
      industry: industry as IndustryType,
      missingData: missingData || [],
      industryProfile
    })

    // Store questions in database for tracking
    await prisma.businessIntelligence.update({
      where: { id: intelligenceId },
      data: {
        userAnswers: {
          questionsGenerated: questions.map(q => q.id),
          generatedAt: new Date()
        }
      }
    })

    // Get suppression info if available
    const suppressionInfo = await prisma.businessIntelligence.findUnique({
      where: { id: intelligenceId },
      select: { 
        dataScore: true 
      }
    })
    
    const dataScoreObj = suppressionInfo?.dataScore as any || {}
    
    return NextResponse.json({
      success: true,
      questions,
      totalQuestions: questions.length,
      suppressionInfo: dataScoreObj.suppression_info || null
    })
  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}

async function generateSmartQuestions({
  intelligenceId,
  dataScore,
  industry,
  missingData,
  industryProfile
}: {
  intelligenceId: string
  dataScore: any
  industry: IndustryType
  missingData: string[]
  industryProfile: any
}): Promise<SmartQuestion[]> {
  const questions: SmartQuestion[] = []
  
  // Smart intake enhancements when enabled
  let enhancedServiceOptions: any[] | null = null
  let gbpData: any = null
  let existingDataScore: any = {}
  let coords: any = null
  
  if (process.env.SMART_INTAKE_ENABLED === 'true') {
    // Get business intelligence data for coordinates
    const intelligence = await prisma.businessIntelligence.findUnique({
      where: { id: intelligenceId },
      select: { gbpData: true, dataScore: true }
    })
    
    gbpData = intelligence?.gbpData as any
    existingDataScore = intelligence?.dataScore as any || {}
    coords = gbpData?.coordinates || gbpData?.latlng
    
    // Detect climate zone
    const zone = coords ? getClimateZone(coords.lat || coords.latitude, coords.lng || coords.longitude) : 'national'
    
    // Load expectations
    const expectations = loadExpectations()
    const industryExpectations = {
      ...expectations[industry]?.national?.services,
      ...expectations[industry]?.[zone]?.services
    }
    
    // Extract known services (de-duplicated)
    const knownServices = new Set<string>()
    
    // Extract from primary category
    if (gbpData?.primaryCategory?.serviceTypes) {
      gbpData.primaryCategory.serviceTypes.forEach((s: any) => {
        if (s.displayName) {
          knownServices.add(normalizeServiceName(s.displayName))
        }
      })
    }
    
    // Extract from additional categories
    if (gbpData?.additionalCategories) {
      gbpData.additionalCategories.forEach((cat: any) => {
        if (cat.serviceTypes) {
          cat.serviceTypes.forEach((s: any) => {
            if (s.displayName) {
              knownServices.add(normalizeServiceName(s.displayName))
            }
          })
        }
      })
    }
    
    // Find missing expected services (cap at MAX_MISSING_EXPECTED_SERVICES)
    const missingExpected = Object.entries(industryExpectations)
      .filter(([key, prevalence]) => 
        (prevalence as number) >= EXPECTED_PREVALENCE_THRESHOLD && !knownServices.has(key)
      )
      .map(([key]) => key)
      .slice(0, MAX_MISSING_EXPECTED_SERVICES)
    
    // Update dataScore with smart intake data
    await prisma.businessIntelligence.update({
      where: { id: intelligenceId },
      data: {
        dataScore: {
          ...existingDataScore,
          climate_zone: zone,
          confirmed_services: Array.from(knownServices),
          missing_expected: missingExpected
        }
      }
    })
    
    // Log analytics event
    await prisma.analyticsEvent.create({
      data: {
        event: 'smart_intake_question_rendered',
        properties: {
          industry,
          climate_zone: zone,
          missing_count: missingExpected.length,
          known_count: knownServices.size,
          expectations_version: expectations.__version || 'unknown'
        }
      }
    })
    
    // Prepare enhanced service options with confidence and tooltips
    if (missingExpected.length > 0) {
      const serviceOptions = generateServiceOptions(industry)
      enhancedServiceOptions = serviceOptions.map(opt => {
        const normalizedName = normalizeServiceName(opt.label)
        const isExpected = missingExpected.includes(normalizedName)
        const prevalence = industryExpectations[normalizedName] as number || 0
        
        return {
          ...opt,
          checked: isExpected,
          confidence: isExpected ? prevalence : undefined,
          tooltip: isExpected ? `${Math.round(prevalence * 100)}% of ${industry} businesses in ${zone.replace('CLIMATE_', '').toLowerCase()} climates offer this` : undefined
        }
      })
    }
  }

  // Priority 1: Critical Missing Data
  if (missingData.includes('services') || !dataScore.manual?.specializations) {
    questions.push({
      id: 'services',
      type: 'service-grid',
      priority: 1,
      category: 'critical',
      question: `Select your top ${industryProfile.patterns.maxServicesDisplay} services`,
      options: enhancedServiceOptions || generateServiceOptions(industry)
    })
  }

  // Priority 2: Differentiation (if low score)
  if (dataScore.breakdown.differentiation < 10) {
    questions.push({
      id: 'differentiators',
      type: 'tinder-swipe',
      priority: 2,
      category: 'enhancement',
      question: 'What makes your business special?',
      options: [
        { value: 'family-owned', label: 'Family Owned', icon: '👨‍👩‍👧', description: 'Multi-generation expertise' },
        { value: 'eco-friendly', label: 'Eco-Friendly', icon: '🌱', description: 'Sustainable practices' },
        { value: 'award-winning', label: 'Award Winning', icon: '🏆', description: 'Industry recognition' },
        { value: 'best-rated', label: 'Best in Town', icon: '⭐', description: 'Top-rated service' },
        { value: 'guaranteed', label: 'Satisfaction Guaranteed', icon: '💯', description: '100% guarantee' },
        { value: 'free-estimates', label: 'Free Estimates', icon: '🎯', description: 'No obligation quotes' },
        { value: 'veteran-owned', label: 'Veteran Owned', icon: '🇺🇸', description: 'Military values' },
        { value: 'women-owned', label: 'Women Owned', icon: '💪', description: 'Female leadership' }
      ]
    })
  }

  // Priority 2: Emergency Services (for relevant industries)
  if (['plumbing', 'hvac', 'electrical'].includes(industry)) {
    questions.push({
      id: 'emergency-service',
      type: 'yes-no-visual',
      priority: 2,
      category: 'critical',
      question: 'Do you offer emergency services?',
      options: [
        { value: 'emergency-24-7', label: 'Yes, 24/7', icon: '🚨' },
        { value: 'business-hours', label: 'Business Hours Only', icon: '🕐' }
      ]
    })
  }

  // Priority 3: Business Stage - Only ask if we can't extract it
  const businessAge = extractBusinessAge(gbpData)
  if (shouldAskYearsInBusinessQuestion(businessAge) && dataScore.total < 60 && !dataScore.manual?.yearsInBusiness) {
    questions.push({
      id: 'business-stage',
      type: 'quick-select',
      priority: 3,
      category: 'personalization',
      question: 'How long have you been in business?',
      options: [
        { value: '0-1', label: 'Just Started' },
        { value: '1-5', label: '1-5 Years' },
        { value: '5-10', label: '5-10 Years' },
        { value: '10+', label: '10+ Years', popular: true }
      ]
    })
  } else if (businessAge.yearsInBusiness) {
    // Store the extracted years in dataScore
    await prisma.businessIntelligence.update({
      where: { id: intelligenceId },
      data: {
        dataScore: {
          ...existingDataScore,
          extracted_years_in_business: businessAge.yearsInBusiness,
          years_confidence: businessAge.confidence
        }
      }
    })
  }

  // Priority 3: Service Areas - Only ask if we can't calculate from polygons
  const serviceRadius = calculateServiceRadius(gbpData?.serviceArea, coords)
  if (shouldAskServiceRadiusQuestion(serviceRadius) && !dataScore.serviceAreas) {
    questions.push({
      id: 'service-radius',
      type: 'quick-select',
      priority: 3,
      category: 'enhancement',
      question: 'What\'s your typical service radius?',
      options: [
        { value: '5-miles', label: '5 miles' },
        { value: '10-miles', label: '10 miles' },
        { value: '25-miles', label: '25 miles', popular: true },
        { value: '50-miles', label: '50+ miles' }
      ]
    })
  } else if (serviceRadius.confidence > 0.5) {
    // Store the calculated radius in dataScore
    await prisma.businessIntelligence.update({
      where: { id: intelligenceId },
      data: {
        dataScore: {
          ...existingDataScore,
          calculated_service_radius: serviceRadius.radius,
          radius_confidence: serviceRadius.confidence,
          radius_method: serviceRadius.method
        }
      }
    })
  }

  // Apply question suppression based on available data
  const confidence = calculateConfidenceScores(existingDataScore, gbpData)
  const suppressionContext = {
    dataScore: existingDataScore,
    gbpData,
    confidence
  }
  
  const originalQuestionCount = questions.length
  const { questions: filteredQuestions, suppressedCount, suppressionReasons } = 
    applyQuestionSuppression(questions, suppressionContext)
  
  // Store suppression info in dataScore for retrieval
  if (suppressedCount > 0) {
    await prisma.businessIntelligence.update({
      where: { id: intelligenceId },
      data: {
        dataScore: {
          ...existingDataScore,
          suppression_info: {
            count: suppressedCount,
            reasons: suppressionReasons
          }
        }
      }
    })
  }
  
  // Log suppression analytics
  if (suppressedCount > 0) {
    const summary = getSuppressionSummary(originalQuestionCount, filteredQuestions.length, suppressionReasons)
    
    await prisma.analyticsEvent.create({
      data: {
        event: 'smart_intake_questions_suppressed',
        properties: {
          industry,
          original_count: originalQuestionCount,
          final_count: filteredQuestions.length,
          suppressed_count: suppressedCount,
          reduction_percentage: summary.reductionPercentage,
          suppressed_questions: summary.suppressedQuestions,
          efficiency: summary.efficiency
        }
      }
    })
  }

  // Only return top 5 questions, sorted by priority
  return filteredQuestions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
}