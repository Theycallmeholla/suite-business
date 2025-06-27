/**
 * AI-Powered Template Selection Engine
 * 
 * Instead of generating content from scratch, this engine:
 * 1. Evaluates business data quality/quantity
 * 2. Selects optimal template variants
 * 3. Populates with real data + industry fallbacks
 * 4. Uses AI only for intelligent selection decisions
 */

import { BusinessIntelligenceData } from '@/types/intelligence';
import { IndustryType } from '@/types/site-builder';
import { QuestionAnswers } from '@/lib/template-engine/dynamic-layout-generator';
import { dataEvaluator } from './data-evaluator';
import { templateSelector } from './template-variant-selector';
import { landscapingPopulator } from './industry-populators/landscaping-populator';
import { logger } from '@/lib/logger';

export interface AIContentEngineResult {
  selectedTemplate: string;
  populatedSections: Record<string, any>;
  sectionOrder: string[];
  metadata: {
    dataQuality: any;
    reasoning: Record<string, string>;
    seoKeywords: string[];
    generationMethod: 'ai-selected' | 'fallback';
  };
}

/**
 * Refactored AI Content Engine - Now a Template Selector
 */
export class AITemplateSelectionEngine {
  private openai: any;
  private industryPopulators: Record<string, any>;

  constructor() {
    this.initializeOpenAI();
    this.initializePopulators();
  }

  /**
   * Main method - Select and populate optimal template
   */
  async generateWebsiteCopy(
    businessData: BusinessIntelligenceData,
    industry: IndustryType,
    answers: QuestionAnswers
  ): Promise<AIContentEngineResult> {
    try {
      // If OpenAI is available, use AI-enhanced selection
      if (this.openai) {
        return await this.aiEnhancedSelection(businessData, industry, answers);
      }
      
      // Otherwise, use rule-based selection
      return await this.ruleBasedSelection(businessData, industry, answers);
    } catch (error) {
      logger.error('Template selection failed', { industry }, error as Error);
      
      // Fallback to basic selection
      return this.fallbackSelection(businessData, industry, answers);
    }
  }

  /**
   * AI-Enhanced Template Selection
   * Uses OpenAI to make smarter decisions about variant selection
   */
  private async aiEnhancedSelection(
    businessData: BusinessIntelligenceData,
    industry: IndustryType,
    answers: QuestionAnswers
  ): Promise<AIContentEngineResult> {
    // Step 1: Evaluate data
    const dataQuality = dataEvaluator.evaluateBusinessData(businessData);
    
    // Step 2: Get base recommendations
    const baseRecommendations = await templateSelector.selectOptimalTemplate(
      businessData,
      industry,
      answers
    );
    
    // Step 3: Use AI to refine selections
    const aiRefinements = await this.getAIRefinements(
      businessData,
      dataQuality,
      baseRecommendations,
      industry,
      answers
    );
    
    // Step 4: Apply AI suggestions
    const finalSelections = this.applyAIRefinements(
      baseRecommendations,
      aiRefinements
    );
    
    // Step 5: Populate with content
    const populator = this.getIndustryPopulator(industry);
    const populatedSections = populator.populateAllSections(
      finalSelections.sectionVariants,
      businessData,
      answers,
      dataQuality
    );
    
    // Step 6: Extract SEO keywords
    const seoKeywords = this.extractSeoKeywords(populatedSections);

    return {
      selectedTemplate: finalSelections.selectedTemplate,
      populatedSections,
      sectionOrder: finalSelections.sectionOrder,
      metadata: {
        dataQuality,
        reasoning: finalSelections.reasoning,
        seoKeywords,
        generationMethod: 'ai-selected',
      },
    };
  }

  /**
   * Get AI refinements for template selection
   */
  private async getAIRefinements(
    businessData: BusinessIntelligenceData,
    dataQuality: any,
    baseRecommendations: any,
    industry: IndustryType,
    answers: QuestionAnswers
  ): Promise<any> {
    const prompt = `
You are a website template selection expert. Based on the following business data and initial recommendations, provide refinements for optimal template selection.

Business Data Quality:
${JSON.stringify(dataQuality, null, 2)}

Initial Recommendations:
${JSON.stringify(baseRecommendations, null, 2)}

Industry: ${industry}
User Preferences: ${JSON.stringify(answers, null, 2)}

Analyze the data and provide:
1. Should any section variants be changed based on the specific business data?
2. Is the section order optimal for conversion?
3. Are there any sections that should be added or removed?
4. Any specific content emphasis recommendations?

Respond in JSON format:
{
  "variantChanges": {
    "sectionName": "new-variant-id"
  },
  "orderChanges": ["new", "section", "order"],
  "addSections": ["section-type"],
  "removeSections": ["section-type"],
  "contentEmphasis": {
    "sectionName": "emphasis notes"
  }
}
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Low temperature for consistent decisions
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      logger.warn('AI refinement failed', {}, error as Error);
      return {}; // Return empty refinements
    }
  }

  /**
   * Rule-Based Selection (No AI)
   */
  private async ruleBasedSelection(
    businessData: BusinessIntelligenceData,
    industry: IndustryType,
    answers: QuestionAnswers
  ): Promise<AIContentEngineResult> {
    // Use the template selector without AI
    const selections = await templateSelector.selectOptimalTemplate(
      businessData,
      industry,
      answers
    );
    
    // Populate sections
    const populator = this.getIndustryPopulator(industry);
    const populatedSections = populator.populateAllSections(
      selections.sectionVariants,
      businessData,
      answers,
      selections.dataQuality
    );
    
    // Extract SEO keywords
    const seoKeywords = this.extractSeoKeywords(populatedSections);

    return {
      selectedTemplate: selections.selectedTemplate,
      populatedSections,
      sectionOrder: selections.sectionOrder,
      metadata: {
        dataQuality: selections.dataQuality,
        reasoning: selections.reasoning,
        seoKeywords,
        generationMethod: 'fallback',
      },
    };
  }

  /**
   * Basic fallback selection
   */
  private fallbackSelection(
    businessData: BusinessIntelligenceData,
    industry: IndustryType,
    answers: QuestionAnswers
  ): AIContentEngineResult {
    // Use minimal template with basic sections
    const template = industry === 'landscaping' ? 'dream-garden' : 'classic-business';
    
    const basicSections = {
      hero: 'hero-classic',
      services: 'services-grid',
      about: 'about-story',
      contact: 'contact-split',
    };
    
    const populator = this.getIndustryPopulator(industry);
    const populatedSections = populator.populateAllSections(
      basicSections,
      businessData,
      answers,
      { overall: 'minimal' }
    );

    return {
      selectedTemplate: template,
      populatedSections,
      sectionOrder: ['hero', 'services', 'about', 'contact'],
      metadata: {
        dataQuality: { overall: 'minimal' },
        reasoning: { fallback: 'Using basic template due to processing error' },
        seoKeywords: [industry, businessData.basicInfo?.city || 'local'].filter(Boolean),
        generationMethod: 'fallback',
      },
    };
  }

  /**
   * Apply AI refinements to base selections
   */
  private applyAIRefinements(baseRecommendations: any, aiRefinements: any): any {
    const refined = { ...baseRecommendations };
    
    // Apply variant changes
    if (aiRefinements.variantChanges) {
      Object.entries(aiRefinements.variantChanges).forEach(([section, variant]) => {
        if (refined.sectionVariants[section]) {
          refined.sectionVariants[section] = variant as string;
          refined.reasoning[section] += ' (AI refined)';
        }
      });
    }
    
    // Apply order changes
    if (aiRefinements.orderChanges?.length) {
      refined.sectionOrder = aiRefinements.orderChanges;
    }
    
    // Add sections
    if (aiRefinements.addSections?.length) {
      // Implementation would add recommended sections
    }
    
    // Remove sections
    if (aiRefinements.removeSections?.length) {
      aiRefinements.removeSections.forEach((section: string) => {
        delete refined.sectionVariants[section];
      });
    }
    
    return refined;
  }

  /**
   * Get industry-specific content populator
   */
  private getIndustryPopulator(industry: IndustryType): any {
    return this.industryPopulators[industry] || this.industryPopulators.landscaping;
  }

  /**
   * Extract SEO keywords from populated content
   */
  private extractSeoKeywords(populatedSections: Record<string, any>): string[] {
    const keywords = new Set<string>();
    
    Object.values(populatedSections).forEach(section => {
      if (section.metadata?.seoKeywords) {
        section.metadata.seoKeywords.forEach((kw: string) => keywords.add(kw));
      }
    });
    
    return Array.from(keywords);
  }

  /**
   * Initialize OpenAI (optional)
   */
  private initializeOpenAI() {
    if (process.env.OPENAI_API_KEY) {
      const { OpenAI } = require('openai');
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      logger.info('AI-enhanced template selection enabled');
    } else {
      logger.info('Using rule-based template selection (no OpenAI key)');
    }
  }

  /**
   * Initialize industry populators
   */
  private initializePopulators() {
    this.industryPopulators = {
      landscaping: landscapingPopulator,
      // Add other industries as they're implemented
    };
  }

  /**
   * Generate specific content section (backwards compatibility)
   */
  async generateContent(request: any): Promise<any> {
    // This method exists for backwards compatibility
    // It now uses the new selection system
    const result = await this.generateWebsiteCopy(
      request.businessData,
      request.industry,
      request.answers
    );
    
    const sectionContent = result.populatedSections[request.sectionType];
    
    return {
      content: sectionContent?.content?.[request.contentType] || 'Professional service you can trust',
      alternatives: [], // Could generate alternatives if needed
      seoScore: 80,
      uniquenessScore: 90,
      metadata: result.metadata,
    };
  }
}

// Export instance for backwards compatibility
export const aiContentEngine = new AITemplateSelectionEngine();
