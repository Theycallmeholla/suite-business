/**
 * Enhanced Website Generation Orchestrator
 * 
 * Uses multi-source data (GBP, Places, SERP, User) to generate
 * comprehensive websites with competitive positioning
 */

import { BusinessIntelligenceData } from '@/types/intelligence';
import { IndustryType } from '@/types/site-builder';
import { QuestionAnswers } from '@/lib/template-engine/dynamic-layout-generator';
import { AdaptiveTemplateEngine } from '@/lib/template-engine/adaptive-template-engine';
import { multiSourceEvaluator } from '@/lib/content-generation/multi-source-data-evaluator';
import { questionGenerator } from '@/lib/content-generation/intelligent-question-generator';
import { enhancedTemplateSelector } from '@/lib/content-generation/enhanced-template-selector';
import { enhancedLandscapingPopulator } from '@/lib/content-generation/industry-populators/enhanced-landscaping-populator';
import { imageOptimizer } from '@/lib/image-optimization';
import { seoGenerator } from '@/lib/seo-generator';
import { emailTemplateGenerator } from '@/lib/email-templates';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { enhancedHVACPopulator } from '@/lib/content-generation/industry-populators/enhanced-hvac-populator';
import { enhancedPlumbingPopulator } from '@/lib/content-generation/industry-populators/enhanced-plumbing-populator';
import { enhancedCleaningPopulator } from '@/lib/content-generation/industry-populators/enhanced-cleaning-populator';

export interface EnhancedWebsiteGenerationRequest {
  userId: string;
  businessIntelligenceId: string;
  industry: IndustryType;
  multiSourceData: {
    gbp: any;        // Google Business Profile data
    places: any;     // Google Places API data
    serp: any;       // DataForSEO SERP data
    userAnswers: QuestionAnswers;  // Previous + new answers
  };
  options?: {
    generateVariations?: boolean;
    optimizeForConversion?: boolean;
    includeAdvancedSEO?: boolean;
    optimizeImages?: boolean;
    publishImmediately?: boolean;
  };
}

export interface GeneratedWebsite {
  id: string;
  subdomain: string;
  businessName: string;
  template: any;
  content: any;
  seoData: any;
  optimizedImages: any[];
  publishedUrl: string;
  metadata: {
    generatedAt: Date;
    uniquenessScore: number;
    seoScore: number;
    conversionOptimized: boolean;
    generationTime: number;
    competitiveStrategy?: any;
    dataQuality?: any;
  };
}

export interface GenerationProgress {
  step: string;
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

/**
 * Enhanced Website Generation Orchestrator with Multi-Source Intelligence
 */
export class EnhancedWebsiteGenerationOrchestrator {
  private templateEngine: AdaptiveTemplateEngine;
  private progressCallbacks: Map<string, (progress: GenerationProgress) => void>;

  constructor() {
    this.templateEngine = new AdaptiveTemplateEngine();
    this.progressCallbacks = new Map();
  }

  /**
   * Generate questions only (for two-step process)
   */
  async generateQuestions(
    businessData: any,
    placesData: any,
    serpData: any,
    industry: IndustryType
  ): Promise<{
    questions: any[];
    insights: any;
  }> {
    try {
      logger.info('Generating intelligent questions', {
        metadata: {
          industry,
          hasBusinessData: !!businessData,
          hasPlacesData: !!placesData,
          hasSerpData: !!serpData,
        }
      });

      // Prepare multi-source data
      const multiSourceData = {
        gbp: businessData,
        places: placesData,
        serp: serpData,
        userAnswers: {},
      };

      // Evaluate data sources
      const insights = multiSourceEvaluator.evaluateAllSources(multiSourceData);
      
      // Generate questions based on gaps
      const questions = questionGenerator.generateQuestions(insights, industry);

      // Track analytics
      try {
        const { trackEnhancedGeneration } = await import('@/lib/analytics/enhanced-generation-tracker');
        await trackEnhancedGeneration('questions_generated', {
          industry,
          questionsCount: questions.length,
          dataQuality: insights.overallQuality,
          sourceQuality: insights.sourceQuality,
        });
      } catch (e) {
        // Analytics is optional
      }

      logger.info('Questions generated successfully', {
        metadata: {
          questionsCount: questions.length,
          categories: [...new Set(questions.map(q => q.category))],
          overallQuality: insights.overallQuality,
        }
      });

      return {
        questions,
        insights: {
          businessName: insights.confirmed.businessName,
          dataQuality: insights.overallQuality,
          sourceQuality: insights.sourceQuality,
          confirmed: insights.confirmed,
          missingData: insights.missingData,
        },
      };
    } catch (error) {
      logger.error('Failed to generate questions', {}, error as Error);
      throw error;
    }
  }

  /**
   * Get the appropriate industry populator
   */
  private getIndustryPopulator(industry: IndustryType) {
    switch (industry) {
      case 'landscaping':
        return enhancedLandscapingPopulator;
      case 'hvac':
        return enhancedHVACPopulator;
      case 'plumbing':
        return enhancedPlumbingPopulator;
      case 'cleaning':
        return enhancedCleaningPopulator;
      case 'roofing':
      case 'electrical':
      case 'general':
      default:
        // Fallback to landscaping populator for industries without specific populators
        logger.warn(`No specific enhanced populator for industry: ${industry}, using landscaping as fallback`);
        return enhancedLandscapingPopulator;
    }
  }

  /**
   * Generate complete website from multi-source data
   */
  async generateWebsite(
    request: EnhancedWebsiteGenerationRequest,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GeneratedWebsite> {
    const startTime = Date.now();
    const progressId = `gen_${Date.now()}`;
    const MAX_GENERATION_TIME = 5 * 60 * 1000; // 5 minutes timeout
    
    if (onProgress) {
      this.progressCallbacks.set(progressId, onProgress);
    }

    // Track analytics
    try {
      const { trackEnhancedGeneration } = await import('@/lib/analytics/enhanced-generation-tracker');
      await trackEnhancedGeneration('generation_started', {
        industry: request.industry,
        hasGbpData: !!request.multiSourceData.gbp,
        hasPlacesData: !!request.multiSourceData.places,
        hasSerpData: !!request.multiSourceData.serp,
        hasUserAnswers: Object.keys(request.multiSourceData.userAnswers).length > 0,
      });
    } catch (e) {
      // Analytics is optional
    }

    try {
      logger.info('Starting enhanced website generation', {
        metadata: {
          userId: request.userId,
          businessIntelligenceId: request.businessIntelligenceId,
          industry: request.industry,
          options: request.options,
        }
      });

      // Step 1: Evaluate multi-source data
      this.updateProgress(progressId, {
        step: 'data-evaluation',
        progress: 10,
        message: 'Analyzing business data from multiple sources...',
        estimatedTimeRemaining: 90,
      });

      const insights = multiSourceEvaluator.evaluateAllSources(request.multiSourceData);

      // Step 2: Generate intelligent questions (if needed)
      this.updateProgress(progressId, {
        step: 'question-generation',
        progress: 20,
        message: 'Identifying information gaps...',
        estimatedTimeRemaining: 80,
      });

      const questions = questionGenerator.generateQuestions(insights, request.industry);
      
      // If there are unanswered questions, we should return them
      // In a real implementation, this would pause and wait for answers
      if (questions.length > 0 && !request.multiSourceData.userAnswers.questionsAnswered) {
        logger.info('Questions need to be answered', { questionCount: questions.length });
        // Return questions to frontend for user to answer
        // This is where you'd integrate with your UI
      }

      // Step 3: Select optimal template with competitive strategy
      this.updateProgress(progressId, {
        step: 'template-selection',
        progress: 30,
        message: 'Selecting optimal template based on competitive analysis...',
        estimatedTimeRemaining: 70,
      });

      const templateSelection = await enhancedTemplateSelector.selectOptimalTemplate(
        request.multiSourceData,
        request.industry
      );

      // Step 4: Populate sections with multi-source data
      this.updateProgress(progressId, {
        step: 'content-population',
        progress: 50,
        message: 'Populating website with rich content...',
        estimatedTimeRemaining: 50,
      });

      const industryPopulator = this.getIndustryPopulator(request.industry);
      const populatedSections = industryPopulator.populateAllSections(
        templateSelection,
        insights,
        request.multiSourceData.serp,
        request.multiSourceData.userAnswers
      );

      // Step 5: Generate SEO optimization
      this.updateProgress(progressId, {
        step: 'seo-optimization',
        progress: 65,
        message: 'Optimizing for search engines with competitive insights...',
        estimatedTimeRemaining: 35,
      });

      const seoData = await this.generateEnhancedSEO(
        populatedSections,
        insights,
        templateSelection.competitiveStrategy
      );

      // Step 6: Optimize images
      this.updateProgress(progressId, {
        step: 'image-optimization',
        progress: 75,
        message: 'Optimizing images with context...',
        estimatedTimeRemaining: 25,
      });

      const optimizedImages = await this.optimizeContextualImages(
        insights,
        populatedSections,
        request.multiSourceData.userAnswers
      );

      // Step 7: Create website in database
      this.updateProgress(progressId, {
        step: 'website-creation',
        progress: 85,
        message: 'Creating your competitive website...',
        estimatedTimeRemaining: 15,
      });

      const website = await this.createEnhancedWebsite(
        request,
        templateSelection,
        populatedSections,
        seoData,
        optimizedImages,
        insights
      );

      // Step 8: Publish website (if requested)
      if (request.options?.publishImmediately) {
        this.updateProgress(progressId, {
          step: 'publishing',
          progress: 95,
          message: 'Publishing your website...',
          estimatedTimeRemaining: 5,
        });

        await this.publishWebsite(website.id);
      }

      // Step 9: Send completion notification
      this.updateProgress(progressId, {
        step: 'completion',
        progress: 100,
        message: 'Website generation complete!',
        estimatedTimeRemaining: 0,
      });

      await this.sendCompletionNotification(request.userId, website);

      const generationTime = Date.now() - startTime;

      logger.info('Enhanced website generation completed', {
        metadata: {
          userId: request.userId,
          websiteId: website.id,
          generationTime,
          competitiveStrategy: templateSelection.competitiveStrategy.positioning,
          dataQuality: insights.overallQuality,
        }
      });

      // Track successful completion
      try {
        const { trackEnhancedGeneration } = await import('@/lib/analytics/enhanced-generation-tracker');
        await trackEnhancedGeneration('generation_completed', {
          industry: request.industry,
          generationTime,
          questionsAnswered: Object.keys(request.multiSourceData.userAnswers).length,
          dataQuality: insights.overallQuality,
          template: templateSelection.selectedTemplate,
          competitivePositioning: templateSelection.competitiveStrategy.positioning,
        });
      } catch (e) {
        // Analytics is optional
      }

      return {
        id: website.id,
        subdomain: website.subdomain,
        businessName: website.businessName,
        template: templateSelection,
        content: populatedSections,
        seoData,
        optimizedImages,
        publishedUrl: `https://${website.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
        metadata: {
          generatedAt: new Date(),
          uniquenessScore: templateSelection.uniquenessScore || 0.9,
          seoScore: this.calculateEnhancedSEOScore(seoData),
          conversionOptimized: request.options?.optimizeForConversion || false,
          generationTime,
          competitiveStrategy: templateSelection.competitiveStrategy,
          dataQuality: insights.sourceQuality,
        },
      };

    } catch (error) {
      const errorTime = Date.now() - startTime;
      
      logger.error('Enhanced website generation failed', {
        metadata: {
          userId: request.userId,
          businessIntelligenceId: request.businessIntelligenceId,
          errorTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }, error as Error);

      // Track error
      try {
        const { trackEnhancedGeneration } = await import('@/lib/analytics/enhanced-generation-tracker');
        await trackEnhancedGeneration('generation_failed', {
          industry: request.industry,
          errorTime,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStep: this.progressCallbacks.get(progressId) ? 'in_progress' : 'initialization',
        });
      } catch (e) {
        // Analytics is optional
      }

      this.updateProgress(progressId, {
        step: 'error',
        progress: 0,
        message: 'Generation failed. Please try again.',
      });

      throw error;
    } finally {
      this.progressCallbacks.delete(progressId);
    }
  }

  /**
   * Generate enhanced SEO with competitive insights
   */
  private async generateEnhancedSEO(
    populatedSections: any,
    insights: any,
    competitiveStrategy: any
  ) {
    const seoKeywords = new Set<string>();
    
    // Extract keywords from all sections
    Object.values(populatedSections).forEach((section: any) => {
      if (section.metadata?.seoKeywords) {
        section.metadata.seoKeywords.forEach((kw: string) => seoKeywords.add(kw));
      }
    });

    // Add competitive keywords
    if (competitiveStrategy.keywords) {
      competitiveStrategy.keywords.forEach((kw: string) => seoKeywords.add(kw));
    }

    // Generate SEO metadata
    const seoData = await seoGenerator.generate({
      businessName: insights.confirmed.businessName,
      description: insights.confirmed.description,
      keywords: Array.from(seoKeywords),
      services: insights.confirmed.services,
      location: insights.confirmed.serviceArea[0],
      competitiveAdvantages: competitiveStrategy.differentiators,
    });

    return seoData;
  }

  /**
   * Optimize images with contextual information
   */
  private async optimizeContextualImages(
    insights: any,
    populatedSections: any,
    userAnswers: any
  ) {
    const imagesToOptimize = [];

    // Collect all images from sections
    Object.values(populatedSections).forEach((section: any) => {
      if (section.content?.backgroundImage) {
        imagesToOptimize.push({
          url: section.content.backgroundImage,
          alt: section.content.imageAlt,
          context: 'hero',
        });
      }
      
      if (section.content?.items) {
        section.content.items.forEach((item: any) => {
          if (item.url) {
            imagesToOptimize.push({
              url: item.url,
              alt: item.alt,
              context: item.category || 'gallery',
            });
          }
        });
      }
    });

    // Optimize with context
    const optimizedImages = await Promise.all(
      imagesToOptimize.map(img => 
        imageOptimizer.optimize(img.url, {
          alt: img.alt,
          context: img.context,
          businessName: insights.confirmed.businessName,
        })
      )
    );

    return optimizedImages;
  }

  /**
   * Create enhanced website in database
   */
  private async createEnhancedWebsite(
    request: EnhancedWebsiteGenerationRequest,
    templateSelection: any,
    populatedSections: any,
    seoData: any,
    optimizedImages: any[],
    insights: any
  ) {
    const subdomain = await this.generateUniqueSubdomain(insights.confirmed.businessName);

    const website = await prisma.website.create({
      data: {
        userId: request.userId,
        businessIntelligenceId: request.businessIntelligenceId,
        subdomain,
        businessName: insights.confirmed.businessName,
        industry: request.industry,
        template: templateSelection.selectedTemplate,
        content: {
          sections: populatedSections,
          seoData,
          images: optimizedImages,
        } as any,
        metadata: {
          competitiveStrategy: templateSelection.competitiveStrategy,
          dataQuality: insights.sourceQuality,
          generatedWith: 'enhanced-multi-source',
        } as any,
        status: 'draft',
      },
    });

    return website;
  }

  /**
   * Helper methods
   */
  private updateProgress(progressId: string, progress: GenerationProgress) {
    const callback = this.progressCallbacks.get(progressId);
    if (callback) {
      callback(progress);
    }
  }

  private async generateUniqueSubdomain(businessName: string): Promise<string> {
    // Implementation to generate unique subdomain
    const base = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let subdomain = base;
    let counter = 1;

    while (await this.subdomainExists(subdomain)) {
      subdomain = `${base}-${counter}`;
      counter++;
    }

    return subdomain;
  }

  private async subdomainExists(subdomain: string): Promise<boolean> {
    const existing = await prisma.website.findFirst({
      where: { subdomain },
    });
    return !!existing;
  }

  private async publishWebsite(websiteId: string) {
    // Implementation for publishing
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'published' },
    });
  }

  private async sendCompletionNotification(userId: string, website: any) {
    // Send email notification
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      await emailTemplateGenerator.sendWebsiteReady(user.email, {
        businessName: website.businessName,
        url: `https://${website.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
      });
    }
  }

  private calculateEnhancedSEOScore(seoData: any): number {
    // Calculate SEO score based on various factors
    let score = 0.5; // Base score

    if (seoData.title?.length > 30 && seoData.title?.length < 60) score += 0.1;
    if (seoData.description?.length > 120 && seoData.description?.length < 160) score += 0.1;
    if (seoData.keywords?.length > 5) score += 0.1;
    if (seoData.structuredData) score += 0.2;

    return Math.min(score, 1);
  }
}

export const enhancedWebsiteOrchestrator = new EnhancedWebsiteGenerationOrchestrator();
