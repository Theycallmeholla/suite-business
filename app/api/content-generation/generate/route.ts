/**
 * Content Generation API
 * 
 * Generates unique, AI-powered website content based on business data
 * and user answers from the question system.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { aiContentEngine } from '@/lib/content-generation/ai-content-engine';
import { IndustryType } from '@/types/site-builder';

const generateContentSchema = z.object({
  businessIntelligenceId: z.string(),
  industry: z.string(),
  answers: z.object({
    services: z.array(z.string()).optional(),
    differentiators: z.array(z.string()).optional(),
    emergencyService: z.boolean().optional(),
    businessStage: z.string().optional(),
    serviceRadius: z.string().optional(),
    brandPersonality: z.string().optional(),
    targetAudience: z.string().optional(),
    primaryGoal: z.string().optional(),
  }),
  contentType: z.enum(['complete-website', 'single-section', 'specific-content']).default('complete-website'),
  sectionType: z.enum(['hero', 'about', 'services', 'cta', 'contact']).optional(),
  specificContentType: z.enum(['headline', 'subheadline', 'description', 'cta-text', 'service-description']).optional(),
  options: z.object({
    tone: z.enum(['professional', 'friendly', 'urgent', 'premium', 'traditional']).optional(),
    length: z.enum(['short', 'medium', 'long']).optional(),
    includeAlternatives: z.boolean().default(true),
    optimizeForSEO: z.boolean().default(true),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      businessIntelligenceId, 
      industry, 
      answers, 
      contentType,
      sectionType,
      specificContentType,
      options = {} as any 
    } = generateContentSchema.parse(body);

    logger.info('Generating AI content', {
      metadata: {
      userId: session.user.id,
      businessIntelligenceId,
      industry,
      contentType,
      sectionType,
    }
    });

    // Get business intelligence data
    const businessIntelligence = await prisma.businessIntelligence.findUnique({
      where: { id: businessIntelligenceId },
    });

    if (!businessIntelligence) {
      return NextResponse.json(
        { error: 'Business intelligence data not found' },
        { status: 404 }
      );
    }

    let generatedContent;

    // Reconstruct the intelligence data from stored fields
    const intelligenceData = {
      gbpData: businessIntelligence.gbpData,
      placesData: businessIntelligence.placesData,
      serpData: businessIntelligence.serpData,
      dataScore: businessIntelligence.dataScore,
      userAnswers: businessIntelligence.userAnswers,
    };

    switch (contentType) {
      case 'complete-website':
        generatedContent = await aiContentEngine.generateWebsiteCopy(
          intelligenceData as any,
          industry as IndustryType,
          answers
        );
        break;

      case 'single-section':
        if (!sectionType) {
          return NextResponse.json(
            { error: 'Section type required for single-section generation' },
            { status: 400 }
          );
        }
        generatedContent = await generateSectionContent(
          intelligenceData as any,
          industry as IndustryType,
          answers,
          sectionType,
          options
        );
        break;

      case 'specific-content':
        if (!sectionType || !specificContentType) {
          return NextResponse.json(
            { error: 'Section type and content type required for specific content generation' },
            { status: 400 }
          );
        }
        generatedContent = await aiContentEngine.generateContent({
          businessData: intelligenceData as any,
          industry: industry as IndustryType,
          answers,
          sectionType,
          contentType: specificContentType,
          tone: (options as any)?.tone,
          length: (options as any)?.length,
          includeLocation: true,
          includeDifferentiators: true,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    // Store generated content for future reference and improvement
    await prisma.generatedContent.create({
      data: {
        userId: session.user.id,
        businessIntelligenceId,
        contentType,
        sectionType,
        specificContentType,
        industry,
        answers: answers as any,
        generatedContent: generatedContent as any,
        options: options as any,
        generatedAt: new Date(),
      },
    });

    logger.info('Successfully generated AI content', {
      metadata: {
      userId: session.user.id,
      businessIntelligenceId,
      contentType,
      contentLength: JSON.stringify(generatedContent).length,
    }
    });

    return NextResponse.json({
      success: true,
      content: generatedContent,
      metadata: {
        generatedAt: new Date(),
        contentType,
        industry,
        basedOnAnswers: Object.keys(answers),
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid content generation request', {
      metadata: {
        errors: error.errors,
      }
    });
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Content generation failed', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

/**
 * Generate content for a specific section
 */
async function generateSectionContent(
  businessData: any,
  industry: IndustryType,
  answers: any,
  sectionType: string,
  options: any
) {
  const baseRequest = {
    businessData,
    industry,
    answers,
    tone: options.tone || determineTone(answers),
    includeLocation: true,
    includeDifferentiators: true,
  };

  switch (sectionType) {
    case 'hero':
      return await generateHeroSection(baseRequest, options);
    case 'about':
      return await generateAboutSection(baseRequest, options);
    case 'services':
      return await generateServicesSection(baseRequest, options);
    case 'cta':
      return await generateCTASection(baseRequest, options);
    case 'contact':
      return await generateContactSection(baseRequest, options);
    default:
      throw new Error(`Unknown section type: ${sectionType}`);
  }
}

async function generateHeroSection(baseRequest: any, options: any) {
  const [headline, subheadline, ctaText] = await Promise.all([
    aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'hero',
      contentType: 'headline',
      length: 'short',
    }),
    aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'hero',
      contentType: 'subheadline',
      length: 'medium',
    }),
    aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'hero',
      contentType: 'cta-text',
      length: 'short',
    }),
  ]);

  return {
    headline: {
      content: headline.content,
      alternatives: options.includeAlternatives ? headline.alternatives : [],
      seoScore: headline.seoScore,
    },
    subheadline: {
      content: subheadline.content,
      alternatives: options.includeAlternatives ? subheadline.alternatives : [],
      seoScore: subheadline.seoScore,
    },
    ctaText: {
      content: ctaText.content,
      alternatives: options.includeAlternatives ? ctaText.alternatives : [],
    },
  };
}

async function generateAboutSection(baseRequest: any, options: any) {
  const [headline, description] = await Promise.all([
    aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'about',
      contentType: 'headline',
      length: 'short',
    }),
    aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'about',
      contentType: 'description',
      length: 'long',
    }),
  ]);

  return {
    headline: {
      content: headline.content,
      alternatives: options.includeAlternatives ? headline.alternatives : [],
    },
    description: {
      content: description.content,
      alternatives: options.includeAlternatives ? description.alternatives : [],
      seoScore: description.seoScore,
    },
  };
}

async function generateServicesSection(baseRequest: any, options: any) {
  const [headline, description] = await Promise.all([
    aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'services',
      contentType: 'headline',
      length: 'short',
    }),
    aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'services',
      contentType: 'description',
      length: 'medium',
    }),
  ]);

  // Generate descriptions for each service
  const services = baseRequest.answers.services || [];
  const serviceDescriptions: Record<string, any> = {};
  
  for (const service of services) {
    const serviceDesc = await aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'services',
      contentType: 'service-description',
      length: 'medium',
      serviceName: service,
    });
    
    serviceDescriptions[service] = {
      content: serviceDesc.content,
      alternatives: options.includeAlternatives ? serviceDesc.alternatives : [],
      seoScore: serviceDesc.seoScore,
    };
  }

  return {
    headline: {
      content: headline.content,
      alternatives: options.includeAlternatives ? headline.alternatives : [],
    },
    description: {
      content: description.content,
      alternatives: options.includeAlternatives ? description.alternatives : [],
    },
    serviceDescriptions,
  };
}

async function generateCTASection(baseRequest: any, options: any) {
  const [headline, description, ctaText] = await Promise.all([
    aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'cta',
      contentType: 'headline',
      length: 'short',
    }),
    aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'cta',
      contentType: 'description',
      length: 'medium',
    }),
    aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'cta',
      contentType: 'cta-text',
      length: 'short',
    }),
  ]);

  return {
    headline: {
      content: headline.content,
      alternatives: options.includeAlternatives ? headline.alternatives : [],
    },
    description: {
      content: description.content,
      alternatives: options.includeAlternatives ? description.alternatives : [],
    },
    ctaText: {
      content: ctaText.content,
      alternatives: options.includeAlternatives ? ctaText.alternatives : [],
    },
  };
}

async function generateContactSection(baseRequest: any, options: any) {
  const [headline, description] = await Promise.all([
    aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'contact',
      contentType: 'headline',
      length: 'short',
    }),
    aiContentEngine.generateContent({
      ...baseRequest,
      sectionType: 'contact',
      contentType: 'description',
      length: 'medium',
    }),
  ]);

  return {
    headline: {
      content: headline.content,
      alternatives: options.includeAlternatives ? headline.alternatives : [],
    },
    description: {
      content: description.content,
      alternatives: options.includeAlternatives ? description.alternatives : [],
    },
  };
}

function determineTone(answers: any): string {
  if (answers.emergencyService) return 'urgent';
  if (answers.differentiators?.includes('premium')) return 'premium';
  if (answers.differentiators?.includes('family-owned')) return 'friendly';
  if (answers.businessStage === '10+') return 'traditional';
  return 'professional';
}