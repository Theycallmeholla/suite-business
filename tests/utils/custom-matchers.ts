/**
 * Custom Jest Matchers for Enhanced Site Generation Testing
 */

import { expect } from '@jest/globals';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidBusinessData(): R;
      toHaveDataQualityBetween(min: number, max: number): R;
      toContainQuestionTypes(types: string[]): R;
      toHaveOptimalQuestionCount(): R;
      toMatchTemplateStrategy(strategy: string): R;
      toIncludeSEOKeywords(keywords: string[]): R;
      toHaveCompleteSections(sections: string[]): R;
    }
  }
}

export const customMatchers = {
  /**
   * Check if business data structure is valid
   */
  toBeValidBusinessData(received: any) {
    const requiredFields = ['name', 'primaryCategory', 'fullAddress'];
    const missingFields = requiredFields.filter(field => !received[field]);
    
    const pass = missingFields.length === 0 && 
                 received.name?.length > 0 &&
                 received.primaryCategory?.displayName &&
                 received.fullAddress?.locality;

    return {
      pass,
      message: () => pass 
        ? `Expected business data to be invalid`
        : `Expected valid business data. Missing fields: ${missingFields.join(', ')}`
    };
  },

  /**
   * Check if data quality score is within expected range
   */
  toHaveDataQualityBetween(received: any, min: number, max: number) {
    const quality = received.overallQuality || received;
    const pass = quality >= min && quality <= max;
    
    return {
      pass,
      message: () => pass
        ? `Expected data quality ${quality} to not be between ${min} and ${max}`
        : `Expected data quality ${quality} to be between ${min} and ${max}`
    };
  },

  /**
   * Check if questions contain expected types
   */
  toContainQuestionTypes(received: any[], expectedTypes: string[]) {
    const questionTypes = received.map(q => q.type);
    const missingTypes = expectedTypes.filter(type => !questionTypes.includes(type));
    const pass = missingTypes.length === 0;

    return {
      pass,
      message: () => pass
        ? `Expected questions to not contain types: ${expectedTypes.join(', ')}`
        : `Expected questions to contain types: ${missingTypes.join(', ')}. Found: ${questionTypes.join(', ')}`
    };
  },

  /**
   * Check if question count is optimal (6-9)
   */
  toHaveOptimalQuestionCount(received: any[]) {
    const count = received.length;
    const pass = count >= 6 && count <= 9;

    return {
      pass,
      message: () => pass
        ? `Expected question count ${count} to not be optimal (6-9)`
        : `Expected optimal question count (6-9), but got ${count}`
    };
  },

  /**
   * Check if template selection matches expected strategy
   */
  toMatchTemplateStrategy(received: any, expectedStrategy: string) {
    const strategy = received.competitiveStrategy?.positioning || received.positioning;
    const pass = strategy === expectedStrategy;

    return {
      pass,
      message: () => pass
        ? `Expected template strategy to not be ${expectedStrategy}`
        : `Expected template strategy ${expectedStrategy}, but got ${strategy}`
    };
  },

  /**
   * Check if content includes SEO keywords
   */
  toIncludeSEOKeywords(received: any, keywords: string[]) {
    const content = JSON.stringify(received).toLowerCase();
    const missingKeywords = keywords.filter(kw => !content.includes(kw.toLowerCase()));
    const pass = missingKeywords.length === 0;

    return {
      pass,
      message: () => pass
        ? `Expected content to not include keywords: ${keywords.join(', ')}`
        : `Expected content to include keywords: ${missingKeywords.join(', ')}`
    };
  },

  /**
   * Check if all required sections are present and populated
   */
  toHaveCompleteSections(received: any, requiredSections: string[]) {
    const missingSections = requiredSections.filter(section => 
      !received[section] || !received[section].content
    );
    const pass = missingSections.length === 0;

    return {
      pass,
      message: () => pass
        ? `Expected to not have complete sections: ${requiredSections.join(', ')}`
        : `Expected complete sections: ${missingSections.join(', ')}`
    };
  }
};

// Extend Jest matchers
expect.extend(customMatchers);

/**
 * Helper functions for common assertions
 */
export class TestAssertions {
  /**
   * Assert question generation results
   */
  static assertQuestionGeneration(questions: any[], businessQuality: 'high' | 'medium' | 'low') {
    // Basic structure
    expect(questions).toBeInstanceOf(Array);
    expect(questions).toHaveOptimalQuestionCount();
    
    // All questions should have required fields
    questions.forEach(q => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('question');
      expect(q).toHaveProperty('type');
      expect(q).toHaveProperty('category');
    });

    // Quality-specific assertions
    if (businessQuality === 'high') {
      // High quality = fewer questions, more specific
      expect(questions.length).toBeLessThanOrEqual(7);
      expect(questions).toContainQuestionTypes(['photoLabeler', 'differentiatorSelector']);
    } else if (businessQuality === 'low') {
      // Low quality = more questions, more basic
      expect(questions.length).toBeGreaterThanOrEqual(8);
      expect(questions).toContainQuestionTypes(['basicInfo', 'services']);
    }
  }

  /**
   * Assert data evaluation results
   */
  static assertDataEvaluation(insights: any, expectedQuality: number, tolerance: number = 0.1) {
    expect(insights).toHaveProperty('overallQuality');
    expect(insights).toHaveProperty('sourceQuality');
    expect(insights).toHaveProperty('confirmed');
    expect(insights).toHaveProperty('missingData');
    
    expect(insights).toHaveDataQualityBetween(
      expectedQuality - tolerance,
      expectedQuality + tolerance
    );
    
    // Source quality breakdown
    expect(insights.sourceQuality).toHaveProperty('gbp');
    expect(insights.sourceQuality).toHaveProperty('places');
    expect(insights.sourceQuality).toHaveProperty('serp');
    expect(insights.sourceQuality).toHaveProperty('user');
  }

  /**
   * Assert template selection results
   */
  static assertTemplateSelection(selection: any, expectedStrategy: string) {
    expect(selection).toHaveProperty('selectedTemplate');
    expect(selection).toHaveProperty('competitiveStrategy');
    expect(selection).toHaveProperty('sectionVariants');
    
    expect(selection).toMatchTemplateStrategy(expectedStrategy);
    
    // Strategy should have required fields
    expect(selection.competitiveStrategy).toHaveProperty('positioning');
    expect(selection.competitiveStrategy).toHaveProperty('differentiators');
    expect(selection.competitiveStrategy).toHaveProperty('emphasis');
  }

  /**
   * Assert populated content quality
   */
  static assertPopulatedContent(sections: any, industry: string, dataQuality: 'high' | 'medium' | 'low') {
    const requiredSections = ['hero', 'services'];
    
    if (dataQuality === 'high') {
      requiredSections.push('gallery', 'trust', 'about');
    }
    
    expect(sections).toHaveCompleteSections(requiredSections);
    
    // Industry-specific keywords should be present
    const industryKeywords = {
      landscaping: ['lawn', 'garden', 'landscape'],
      hvac: ['heating', 'cooling', 'air conditioning'],
      plumbing: ['plumber', 'pipe', 'drain'],
      cleaning: ['clean', 'maid', 'service']
    };
    
    expect(sections).toIncludeSEOKeywords(industryKeywords[industry] || []);
  }

  /**
   * Assert API response times
   */
  static assertResponseTime(startTime: number, maxDuration: number) {
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(maxDuration);
  }

  /**
   * Assert error handling
   */
  static assertErrorResponse(error: any, expectedCode: string) {
    expect(error).toHaveProperty('code', expectedCode);
    expect(error).toHaveProperty('message');
    expect(error.message).toBeTruthy();
  }
}

/**
 * Test data validators
 */
export class DataValidators {
  /**
   * Validate question structure
   */
  static isValidQuestion(question: any): boolean {
    return !!(
      question.id &&
      question.question &&
      question.type &&
      question.category &&
      ['text', 'select', 'multiselect', 'photoLabeler', 'differentiatorSelector'].includes(question.type)
    );
  }

  /**
   * Validate business data completeness
   */
  static calculateCompleteness(businessData: any): number {
    const fields = [
      'name',
      'description',
      'primaryCategory',
      'primaryPhone',
      'fullAddress',
      'regularHours',
      'photos',
      'rating',
      'userRatingCount',
      'website'
    ];
    
    const presentFields = fields.filter(field => {
      const value = businessData[field];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return !!value;
    });
    
    return presentFields.length / fields.length;
  }

  /**
   * Validate SEO content
   */
  static hasSEOContent(content: any, minKeywords: number = 3): boolean {
    const text = JSON.stringify(content).toLowerCase();
    const commonKeywords = ['service', 'professional', 'quality', 'best', 'local', 'near me'];
    const foundKeywords = commonKeywords.filter(kw => text.includes(kw));
    
    return foundKeywords.length >= minKeywords;
  }
}