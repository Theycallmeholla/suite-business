/**
 * Website Generation Orchestration API
 * 
 * Master endpoint that coordinates all systems to generate complete websites
 * from user answers to final published site.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { websiteGenerationOrchestrator } from '@/lib/orchestration/website-generation-orchestrator';
import { IndustryType } from '@/types/site-builder';

const generateWebsiteSchema = z.object({
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
    designPreference: z.string().optional(),
    colorPreference: z.string().optional(),
  }),
  options: z.object({
    generateVariations: z.boolean().default(false),
    variationCount: z.number().min(1).max(5).default(3),
    optimizeForConversion: z.boolean().default(true),
    includeAdvancedSEO: z.boolean().default(true),
    optimizeImages: z.boolean().default(true),
    publishImmediately: z.boolean().default(false),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = generateWebsiteSchema.parse(body);
    const { 
      businessIntelligenceId, 
      industry, 
      answers, 
      options = {} 
    } = validatedData;

    logger.info('Starting orchestrated website generation', {
      metadata: {
      userId: session.user.id,
      businessIntelligenceId,
      industry,
      answersProvided: Object.keys(answers).length,
      options,
    }
    });

    const generationRequest = {
      userId: session.user.id,
      businessIntelligenceId,
      industry: industry as IndustryType,
      answers,
      options,
    };

    // Generate website(s)
    let websites;
    if (validatedData.options?.generateVariations) {
      websites = await websiteGenerationOrchestrator.generateWebsiteVariations(
        generationRequest,
        validatedData.options?.variationCount || 3
      );
    } else {
      const website = await websiteGenerationOrchestrator.generateWebsite(generationRequest);
      websites = [website];
    }

    logger.info('Orchestrated website generation completed', {
      metadata: {
      userId: session.user.id,
      websitesGenerated: websites.length,
      averageUniquenessScore: websites.reduce((sum, w) => sum + w.metadata.uniquenessScore, 0) / websites.length,
      totalGenerationTime: websites.reduce((sum, w) => sum + w.metadata.generationTime, 0),
    }
    });

    return NextResponse.json({
      success: true,
      websites,
      metadata: {
        generatedAt: new Date(),
        totalWebsites: websites.length,
        industry,
        basedOnAnswers: Object.keys(answers),
        averageScores: {
          uniqueness: websites.reduce((sum, w) => sum + w.metadata.uniquenessScore, 0) / websites.length,
          seo: websites.reduce((sum, w) => sum + w.metadata.seoScore, 0) / websites.length,
        },
        totalGenerationTime: websites.reduce((sum, w) => sum + w.metadata.generationTime, 0),
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid website generation request', {
      metadata: {
        errors: error.errors,
      }
    });
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Orchestrated website generation failed', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to generate website' },
      { status: 500 }
    );
  }
}

/**
 * Get generation status for real-time updates
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get('generationId');

    if (!generationId) {
      return NextResponse.json({ error: 'Generation ID required' }, { status: 400 });
    }

    // In a real implementation, you'd track generation progress in Redis or database
    // For now, return a simple status
    return NextResponse.json({
      generationId,
      status: 'completed',
      progress: 100,
      message: 'Website generation complete',
    });

  } catch (error) {
    logger.error('Failed to get generation status', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}