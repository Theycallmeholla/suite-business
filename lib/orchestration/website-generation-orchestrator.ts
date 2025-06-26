/**
 * Website Generation Orchestrator
 * 
 * Master system that coordinates all components to generate complete,
 * unique websites from user answers to final published site.
 * 
 * Flow: Questions → Content → Templates → SEO → Images → Publishing
 */

import { BusinessIntelligenceData } from '@/types/intelligence';
import { IndustryType } from '@/types/site-builder';
import { QuestionAnswers } from '@/lib/template-engine/dynamic-layout-generator';
import { AdaptiveTemplateEngine } from '@/lib/template-engine/adaptive-template-engine';
import { aiContentEngine } from '@/lib/content-generation/ai-content-engine';
import { imageOptimizer } from '@/lib/image-optimization';
import { seoGenerator } from '@/lib/seo-generator';
import { emailTemplateGenerator } from '@/lib/email-templates';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export interface WebsiteGenerationRequest {
  userId: string;
  businessIntelligenceId: string;
  industry: IndustryType;
  answers: QuestionAnswers;
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
  };
}

export interface GenerationProgress {
  step: string;
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

/**
 * Master Website Generation Orchestrator
 */
export class WebsiteGenerationOrchestrator {
  private templateEngine: AdaptiveTemplateEngine;
  private progressCallbacks: Map<string, (progress: GenerationProgress) => void>;

  constructor() {
    this.templateEngine = new AdaptiveTemplateEngine();
    this.progressCallbacks = new Map();
  }

  /**
   * Generate complete website from user answers
   */
  async generateWebsite(
    request: WebsiteGenerationRequest,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GeneratedWebsite> {
    const startTime = Date.now();
    const progressId = `gen_${Date.now()}`;
    
    if (onProgress) {
      this.progressCallbacks.set(progressId, onProgress);
    }

    try {
      logger.info('Starting website generation', {
        userId: request.userId,
        businessIntelligenceId: request.businessIntelligenceId,
        industry: request.industry,
      });

      // Step 1: Validate and prepare data
      this.updateProgress(progressId, {
        step: 'validation',
        progress: 5,
        message: 'Validating business data...',
        estimatedTimeRemaining: 120,
      });

      const businessData = await this.validateAndPrepareData(request);

      // Step 2: Generate AI content
      this.updateProgress(progressId, {
        step: 'content-generation',
        progress: 15,
        message: 'Generating unique website content...',
        estimatedTimeRemaining: 100,
      });

      const generatedContent = await this.generateWebsiteContent(request, businessData);

      // Step 3: Create adaptive template
      this.updateProgress(progressId, {
        step: 'template-generation',
        progress: 35,
        message: 'Creating your unique website design...',
        estimatedTimeRemaining: 80,
      });

      const adaptiveTemplate = await this.generateAdaptiveTemplate(request, businessData, generatedContent);

      // Step 4: Generate SEO optimization
      this.updateProgress(progressId, {
        step: 'seo-optimization',
        progress: 50,
        message: 'Optimizing for search engines...',
        estimatedTimeRemaining: 60,
      });

      const seoData = await this.generateSEOOptimization(request, businessData, generatedContent);

      // Step 5: Optimize images
      this.updateProgress(progressId, {
        step: 'image-optimization',
        progress: 65,
        message: 'Optimizing images for fast loading...',
        estimatedTimeRemaining: 40,
      });

      const optimizedImages = await this.optimizeWebsiteImages(businessData, adaptiveTemplate);

      // Step 6: Create website in database
      this.updateProgress(progressId, {
        step: 'website-creation',
        progress: 80,
        message: 'Creating your website...',
        estimatedTimeRemaining: 20,
      });

      const website = await this.createWebsiteInDatabase(
        request,
        businessData,
        adaptiveTemplate,
        generatedContent,
        seoData,
        optimizedImages
      );

      // Step 7: Publish website (if requested)
      if (request.options?.publishImmediately) {
        this.updateProgress(progressId, {
          step: 'publishing',
          progress: 90,
          message: 'Publishing your website...',
          estimatedTimeRemaining: 10,
        });

        await this.publishWebsite(website.id);
      }

      // Step 8: Send completion notification
      this.updateProgress(progressId, {
        step: 'completion',
        progress: 100,
        message: 'Website generation complete!',
        estimatedTimeRemaining: 0,
      });

      await this.sendCompletionNotification(request.userId, website);

      const generationTime = Date.now() - startTime;

      logger.info('Website generation completed', {
        userId: request.userId,
        websiteId: website.id,
        generationTime,
        uniquenessScore: adaptiveTemplate.metadata.uniquenessScore,
      });

      return {
        id: website.id,
        subdomain: website.subdomain,
        businessName: website.businessName,
        template: adaptiveTemplate,
        content: generatedContent,
        seoData,
        optimizedImages,
        publishedUrl: `https://${website.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
        metadata: {
          generatedAt: new Date(),
          uniquenessScore: adaptiveTemplate.metadata.uniquenessScore,
          seoScore: this.calculateOverallSEOScore(seoData, generatedContent),
          conversionOptimized: request.options?.optimizeForConversion || false,
          generationTime,
        },
      };

    } catch (error) {
      logger.error('Website generation failed', {
        userId: request.userId,
        businessIntelligenceId: request.businessIntelligenceId,
      }, error as Error);

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
   * Generate multiple website variations for A/B testing
   */
  async generateWebsiteVariations(
    request: WebsiteGenerationRequest,
    variationCount: number = 3,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GeneratedWebsite[]> {
    const variations: GeneratedWebsite[] = [];
    
    for (let i = 0; i < variationCount; i++) {
      const variationRequest = {
        ...request,
        options: {
          ...request.options,
          optimizeForConversion: i === 0,
          generateVariations: true,
        },
      };

      const variation = await this.generateWebsite(
        variationRequest,
        onProgress ? (progress) => {
          onProgress({
            ...progress,
            message: `Generating variation ${i + 1}/${variationCount}: ${progress.message}`,
            progress: (progress.progress / variationCount) + (i * (100 / variationCount)),
          });
        } : undefined
      );

      variations.push(variation);
    }

    return variations;
  }

  /**
   * Validate and prepare business data
   */
  private async validateAndPrepareData(request: WebsiteGenerationRequest): Promise<BusinessIntelligenceData> {
    const businessIntelligence = await prisma.businessIntelligence.findUnique({
      where: { id: request.businessIntelligenceId },
    });

    if (!businessIntelligence) {
      throw new Error('Business intelligence data not found');
    }

    const businessData = businessIntelligence.data as BusinessIntelligenceData;

    // Validate required data
    if (!businessData.gbp?.businessName && !businessData.manual?.businessName) {
      throw new Error('Business name is required');
    }

    // Enrich data with question answers
    businessData.manual = {
      ...businessData.manual,
      services: request.answers.services || businessData.manual?.services || [],
      differentiators: request.answers.differentiators || businessData.manual?.differentiators || [],
      emergencyService: request.answers.emergencyService || businessData.manual?.emergencyService || false,
      yearsInBusiness: request.answers.businessStage || businessData.manual?.yearsInBusiness,
      serviceRadius: request.answers.serviceRadius || businessData.manual?.serviceRadius,
    };

    return businessData;
  }

  /**
   * Generate website content using AI
   */
  private async generateWebsiteContent(
    request: WebsiteGenerationRequest,
    businessData: BusinessIntelligenceData
  ) {
    try {
      const content = await aiContentEngine.generateWebsiteCopy(
        businessData,
        request.industry,
        request.answers
      );

      // Store generated content
      await prisma.generatedContent.create({
        data: {
          userId: request.userId,
          businessIntelligenceId: request.businessIntelligenceId,
          contentType: 'complete-website',
          industry: request.industry,
          answers: request.answers as any,
          generatedContent: content as any,
          options: request.options as any,
          generatedAt: new Date(),
        },
      });

      return content;
    } catch (error) {
      logger.warn('AI content generation failed, using fallback', {}, error as Error);
      
      // Fallback to template-based content
      return this.generateFallbackContent(request, businessData);
    }
  }

  /**
   * Generate adaptive template
   */
  private async generateAdaptiveTemplate(
    request: WebsiteGenerationRequest,
    businessData: BusinessIntelligenceData,
    content: any
  ) {
    const template = await this.templateEngine.generateTemplate(
      request.answers,
      businessData,
      request.industry,
      {
        prioritizeConversion: request.options?.optimizeForConversion,
        emphasizeUniqueness: true,
        mobileFirst: true,
        performanceOptimized: true,
      }
    );

    // Integrate generated content into template
    template.layout.sections.forEach(section => {
      const sectionContent = content[section.type];
      if (sectionContent) {
        section.props = {
          ...section.props,
          ...this.mapContentToSectionProps(section.type, sectionContent),
        };
      }
    });

    return template;
  }

  /**
   * Generate SEO optimization
   */
  private async generateSEOOptimization(
    request: WebsiteGenerationRequest,
    businessData: BusinessIntelligenceData,
    content: any
  ) {
    const businessName = businessData.gbp?.businessName || businessData.manual?.businessName || 'Business';
    const subdomain = this.generateSubdomain(businessName);

    const seoData = seoGenerator.generateMetaTags(
      businessData,
      request.industry,
      'home',
      subdomain
    );

    // Enhance with content-specific SEO
    if (content.hero?.headline) {
      seoData.title = content.hero.headline;
    }

    if (content.hero?.subheadline) {
      seoData.description = content.hero.subheadline;
    }

    return seoData;
  }

  /**
   * Optimize website images
   */
  private async optimizeWebsiteImages(
    businessData: BusinessIntelligenceData,
    template: any
  ) {
    const images = this.extractImagesFromBusinessData(businessData);
    
    if (images.length === 0) {
      return [];
    }

    try {
      const optimizedImages = await imageOptimizer.batchOptimize(
        images.map(img => ({
          url: img.url,
          sectionType: img.category || 'gallery',
        }))
      );

      return optimizedImages;
    } catch (error) {
      logger.warn('Image optimization failed', {}, error as Error);
      return images; // Return original images as fallback
    }
  }

  /**
   * Create website in database
   */
  private async createWebsiteInDatabase(
    request: WebsiteGenerationRequest,
    businessData: BusinessIntelligenceData,
    template: any,
    content: any,
    seoData: any,
    optimizedImages: any[]
  ) {
    const businessName = businessData.gbp?.businessName || businessData.manual?.businessName || 'Business';
    const subdomain = await this.generateUniqueSubdomain(businessName);

    // Create site
    const site = await prisma.site.create({
      data: {
        userId: request.userId,
        businessName,
        subdomain,
        
        // Business information
        phone: businessData.gbp?.primaryPhone || businessData.manual?.phone,
        email: businessData.gbp?.website || businessData.manual?.email,
        address: businessData.gbp?.fullAddress?.addressLines?.join(', ') || businessData.manual?.address,
        city: businessData.gbp?.fullAddress?.locality || businessData.manual?.city,
        state: businessData.gbp?.fullAddress?.administrativeArea || businessData.manual?.state,
        zipCode: businessData.gbp?.fullAddress?.postalCode || businessData.manual?.zipCode,
        
        // Template and content
        template: template.id,
        templateData: template as any,
        generatedContent: content as any,
        
        // SEO
        metaTitle: seoData.title,
        metaDescription: seoData.description,
        metaKeywords: seoData.keywords.join(', '),
        
        // Industry and answers
        industry: request.industry,
        questionAnswers: request.answers as any,
        
        // Status
        published: request.options?.publishImmediately || false,
        publishedAt: request.options?.publishImmediately ? new Date() : null,
        
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create services
    if (request.answers.services && request.answers.services.length > 0) {
      await prisma.service.createMany({
        data: request.answers.services.map((serviceName, index) => ({
          siteId: site.id,
          name: serviceName,
          description: content.services?.serviceDescriptions?.[serviceName]?.content || 
                      `Professional ${serviceName.replace('-', ' ')} services`,
          featured: index < 3,
          order: index,
        })),
      });
    }

    // Store optimized images
    if (optimizedImages.length > 0) {
      await prisma.photo.createMany({
        data: optimizedImages.map((img, index) => ({
          siteId: site.id,
          url: img.optimized.url,
          thumbnailUrl: img.optimized.url, // Could generate actual thumbnails
          category: 'gallery',
          order: index,
          createdAt: new Date(),
        })),
      });
    }

    return site;
  }

  /**
   * Publish website
   */
  private async publishWebsite(siteId: string) {
    await prisma.site.update({
      where: { id: siteId },
      data: {
        published: true,
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Send completion notification
   */
  private async sendCompletionNotification(userId: string, website: any) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.email) {
        await emailTemplateGenerator.generateTemplate('site-published', {
          userName: user.name,
          businessName: website.businessName,
          siteUrl: `https://${website.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
        });
      }
    } catch (error) {
      logger.warn('Failed to send completion notification', {}, error as Error);
    }
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

  private generateSubdomain(businessName: string): string {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 30);
  }

  private async generateUniqueSubdomain(businessName: string): Promise<string> {
    let baseSubdomain = this.generateSubdomain(businessName);
    let subdomain = baseSubdomain;
    let counter = 1;

    while (true) {
      const existing = await prisma.site.findUnique({
        where: { subdomain },
      });

      if (!existing) {
        return subdomain;
      }

      subdomain = `${baseSubdomain}-${counter}`;
      counter++;
    }
  }

  private mapContentToSectionProps(sectionType: string, sectionContent: any): any {
    switch (sectionType) {
      case 'hero':
        return {
          headline: sectionContent.headline?.content,
          subheadline: sectionContent.subheadline?.content,
          ctaText: sectionContent.ctaText?.content,
        };
      case 'about':
        return {
          headline: sectionContent.headline?.content,
          description: sectionContent.description?.content,
        };
      case 'services':
        return {
          headline: sectionContent.headline?.content,
          description: sectionContent.description?.content,
          serviceDescriptions: sectionContent.serviceDescriptions,
        };
      case 'cta':
        return {
          headline: sectionContent.headline?.content,
          description: sectionContent.description?.content,
          ctaText: sectionContent.ctaText?.content,
        };
      case 'contact':
        return {
          headline: sectionContent.headline?.content,
          description: sectionContent.description?.content,
        };
      default:
        return {};
    }
  }

  private extractImagesFromBusinessData(businessData: BusinessIntelligenceData): any[] {
    const images = [];
    
    // GBP photos
    if (businessData.gbp?.photos) {
      images.push(...businessData.gbp.photos.map(photo => ({
        url: photo.url,
        category: photo.category || 'gallery',
      })));
    }

    // Places photos
    if (businessData.places?.photos) {
      images.push(...businessData.places.photos.map(photo => ({
        url: photo.url,
        category: 'gallery',
      })));
    }

    return images;
  }

  private calculateOverallSEOScore(seoData: any, content: any): number {
    let score = 0;
    
    // Title optimization
    if (seoData.title && seoData.title.length >= 30 && seoData.title.length <= 60) {
      score += 25;
    }
    
    // Description optimization
    if (seoData.description && seoData.description.length >= 120 && seoData.description.length <= 160) {
      score += 25;
    }
    
    // Keywords
    if (seoData.keywords && seoData.keywords.length >= 5) {
      score += 25;
    }
    
    // Content quality
    if (content.hero?.headline && content.about?.description) {
      score += 25;
    }
    
    return score;
  }

  private generateFallbackContent(request: WebsiteGenerationRequest, businessData: BusinessIntelligenceData) {
    const businessName = businessData.gbp?.businessName || businessData.manual?.businessName || 'Your Business';
    const city = businessData.gbp?.fullAddress?.locality || 'Your Area';
    
    return {
      hero: {
        headline: { content: `Professional ${request.industry} Services` },
        subheadline: { content: `Serving ${city} with quality ${request.industry} solutions` },
        ctaText: { content: 'Get Free Quote' },
      },
      about: {
        headline: { content: `About ${businessName}` },
        description: { content: `${businessName} provides professional ${request.industry} services in ${city}.` },
      },
      services: {
        headline: { content: 'Our Services' },
        description: { content: `We offer comprehensive ${request.industry} solutions.` },
        serviceDescriptions: {},
      },
      cta: {
        headline: { content: 'Ready to Get Started?' },
        description: { content: 'Contact us today for a free consultation.' },
        ctaText: { content: 'Contact Us' },
      },
      contact: {
        headline: { content: 'Get In Touch' },
        description: { content: 'Contact us to discuss your project.' },
      },
    };
  }
}

/**
 * Export singleton instance
 */
export const websiteGenerationOrchestrator = new WebsiteGenerationOrchestrator();