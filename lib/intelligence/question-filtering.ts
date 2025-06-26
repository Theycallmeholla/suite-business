/**
 * Intelligence System - Question Filtering
 * 
 * **Created**: December 23, 2024, 2:57 AM CST
 * **Last Updated**: December 23, 2024, 2:57 AM CST
 * 
 * Filters questions based on already known business data
 */

import type { BusinessIntelligenceData } from './scoring'
import type { SwipeOption } from '@/components/SmartQuestionComponents/TinderSwipe'

export function filterQuestionsBasedOnKnownData(
  questions: SwipeOption[],
  businessData: BusinessIntelligenceData
): SwipeOption[] {
  
  return questions.filter(question => {
    // Skip questions marked as skipIfKnown if we have the data
    if (question.skipIfKnown) {
      switch (question.value) {
        case 'reviews':
          // Skip if we already know they have enough reviews
          if (businessData.gbp.reviews) {
            const hasEnoughReviews = businessData.gbp.reviews.count >= 50 && 
                                   businessData.gbp.reviews.rating >= 4.5
            if (hasEnoughReviews) {
              // We know they have 50+ 5-star reviews, no need to ask
              return false
            }
          }
          break
          
        case 'hours':
          // Skip if we already have their hours
          if (businessData.gbp.hours && Object.keys(businessData.gbp.hours).length > 0) {
            return false
          }
          break
          
        case 'licensed':
          // Check if license info is in attributes
          if (businessData.gbp.attributes?.licensed === true) {
            return false
          }
          break
      }
    }
    
    return true
  })
}

export function handleUnsureResponses(
  unsureQuestions: string[],
  businessData: BusinessIntelligenceData
): string[] {
  // For "I don't know" responses, we can:
  // 1. Try to find the answer from other sources
  // 2. Mark it for follow-up later
  // 3. Use conservative defaults
  
  const followUpNeeded: string[] = []
  
  unsureQuestions.forEach(questionValue => {
    switch (questionValue) {
      case 'licensed':
        // Critical for trust - mark for follow-up
        followUpNeeded.push('Please verify your license and insurance status')
        break
        
      case 'award-winning':
        // Not critical - we can check industry databases later
        break
        
      case 'eco-friendly':
        // Could check for certifications in public databases
        break
    }
  })
  
  return followUpNeeded
}