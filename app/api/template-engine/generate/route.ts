/**
 * Adaptive Template Generation API
 * 
 * This endpoint integrates with the question system to generate unique templates
 * based on user answers from the conversational flow.
 * 
 * It works with the other agent's question orchestrator to create
 * truly personalized websites.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { AdaptiveTemplateEngine } from '@/lib/template-engine/adaptive-template-engine';
import { IndustryType } from '@/types/site-builder';

const generateTemplateSchema = z.object({
  // Question answers from the conversational flow
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
  
  // Business data
  businessIntelligenceId: z.string(),
  industry: z.string(),
  
  // Generation options
  options: z.object({
    prioritizeConversion: z.boolean().optional(),
    emphasizeUniqueness: z.boolean().optional(),
    generateVariations: z.boolean().optional(),
    variationCount: z.number().min(1).max(5).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { answers, businessIntelligenceId, industry, options = {} } = generateTemplateSchema.parse(body);

    logger.info('Generating adaptive template', {
      metadata: {
      userId: session.user.id,
      businessIntelligenceId,
      industry,
      answersProvided: Object.keys(answers).length,
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

    // Initialize the adaptive template engine
    const templateEngine = new AdaptiveTemplateEngine();

    // Generate template(s)
    let templates;
    if (options.generateVariations) {
      templates = await templateEngine.generateVariations(
        answers,
        businessIntelligence as any, // Pass the entire intelligence object
        industry as IndustryType,
        options.variationCount || 3
      );
    } else {
      const template = await templateEngine.generateTemplate(
        answers,
        businessIntelligence as any, // Pass the entire intelligence object
        industry as IndustryType,
        options
      );
      templates = [template];
    }

    // Store generated templates in database
    const storedTemplates = await Promise.all(
      templates.map(async (template) => {
        return await prisma.generatedTemplate.create({
          data: {
            userId: session.user.id,
            businessIntelligenceId,
            templateData: template as any,
            uniquenessScore: template.metadata.uniquenessScore,
            conversionOptimized: template.metadata.conversionOptimized,
            industry,
            answers: answers as any,
            generatedAt: new Date(),
          },
        });
      })
    );

    // Render templates for immediate use
    const renderedTemplates = templates.map(template => {
      const rendered = templateEngine.renderTemplate(template);
      return {
        id: template.id,
        name: template.name,
        uniquenessScore: template.metadata.uniquenessScore,
        conversionOptimized: template.metadata.conversionOptimized,
        css: rendered.css,
        structure: rendered.structure,
        components: rendered.components,
        preview: {
          sections: template.layout.sections.map(section => ({
            type: section.type,
            variant: section.variant,
            props: section.props,
          })),
          colors: {
            primary: template.designSystem.colors.primary,
            secondary: template.designSystem.colors.secondary,
            accent: template.designSystem.colors.accent,
          },
          typography: {
            heading: template.designSystem.typography.headingFont.family,
            body: template.designSystem.typography.bodyFont.family,
          },
        },
      };
    });

    logger.info('Successfully generated adaptive templates', {
      metadata: {
      userId: session.user.id,
      templatesGenerated: templates.length,
      averageUniquenessScore: templates.reduce((sum, t) => sum + t.metadata.uniquenessScore, 0) / templates.length,
    }
    });

    return NextResponse.json({
      success: true,
      templates: renderedTemplates,
      metadata: {
        generatedAt: new Date(),
        basedOnAnswers: Object.keys(answers),
        industry,
        uniquenessScores: templates.map(t => t.metadata.uniquenessScore),
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid template generation request', {
      metadata: {
        errors: error.errors,
      }
    });
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Template generation failed', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}

/**
 * Get previously generated templates for a user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessIntelligenceId = searchParams.get('businessIntelligenceId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const whereClause: any = {
      userId: session.user.id,
    };

    if (businessIntelligenceId) {
      whereClause.businessIntelligenceId = businessIntelligenceId;
    }

    const templates = await prisma.generatedTemplate.findMany({
      where: whereClause,
      orderBy: { generatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        templateData: true,
        uniquenessScore: true,
        conversionOptimized: true,
        industry: true,
        generatedAt: true,
      },
    });

    const templateEngine = new AdaptiveTemplateEngine();
    const renderedTemplates = templates.map(template => {
      const templateData = template.templateData as any;
      const rendered = templateEngine.renderTemplate(templateData);
      
      return {
        id: template.id,
        name: templateData.name,
        uniquenessScore: template.uniquenessScore,
        conversionOptimized: template.conversionOptimized,
        industry: template.industry,
        generatedAt: template.generatedAt,
        preview: {
          sections: templateData.layout.sections.map((section: any) => ({
            type: section.type,
            variant: section.variant,
          })),
          colors: {
            primary: templateData.designSystem.colors.primary,
            secondary: templateData.designSystem.colors.secondary,
          },
        },
      };
    });

    return NextResponse.json({
      success: true,
      templates: renderedTemplates,
    });

  } catch (error) {
    logger.error('Failed to fetch generated templates', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}