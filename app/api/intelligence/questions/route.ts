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
    const questions = generateSmartQuestions({
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

    return NextResponse.json({
      success: true,
      questions,
      totalQuestions: questions.length
    })
  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}

function generateSmartQuestions({
  dataScore,
  industry,
  missingData,
  industryProfile
}: {
  dataScore: any
  industry: IndustryType
  missingData: string[]
  industryProfile: any
}): SmartQuestion[] {
  const questions: SmartQuestion[] = []

  // Priority 1: Critical Missing Data
  if (missingData.includes('services') || !dataScore.manual?.specializations) {
    questions.push({
      id: 'services',
      type: 'service-grid',
      priority: 1,
      category: 'critical',
      question: `Select your top ${industryProfile.patterns.maxServicesDisplay} services`,
      options: generateServiceOptions(industry)
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

  // Priority 3: Business Stage
  if (dataScore.total < 60 && !dataScore.manual?.yearsInBusiness) {
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
  }

  // Priority 3: Service Areas
  if (!dataScore.serviceAreas) {
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
  }

  // Only return top 5 questions, sorted by priority
  return questions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
}