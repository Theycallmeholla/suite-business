import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export type EnhancedGenerationEvent = 
  | 'feature_flag_redirect'
  | 'explicit_user_request'
  | 'generation_started'
  | 'questions_generated'
  | 'questions_answered'
  | 'generation_completed'
  | 'generation_failed'
  | 'user_satisfaction';

export interface EnhancedGenerationMetrics {
  industry?: string;
  questionsCount?: number;
  questionsAnswered?: number;
  generationTime?: number;
  dataQuality?: number;
  sourceQuality?: Record<string, number>;
  template?: string;
  competitivePositioning?: string;
  errorMessage?: string;
  errorStep?: string;
  rolloutPercentage?: number;
  randomValue?: number;
  source?: string;
  hasGbpData?: boolean;
  hasPlacesData?: boolean;
  hasSerpData?: boolean;
  hasUserAnswers?: boolean;
  userRating?: number;
  userFeedback?: string;
}

// In-memory metrics for quick access (reset on server restart)
const metricsCache = {
  totalGenerations: 0,
  successfulGenerations: 0,
  failedGenerations: 0,
  averageQuestions: 0,
  averageGenerationTime: 0,
  industryBreakdown: new Map<string, number>(),
  templateUsage: new Map<string, number>(),
  lastUpdated: new Date(),
};

/**
 * Track enhanced generation events
 */
export async function trackEnhancedGeneration(
  event: EnhancedGenerationEvent,
  metrics: EnhancedGenerationMetrics
): Promise<void> {
  try {
    // Log the event
    logger.info(`Enhanced generation event: ${event}`, {
      metadata: {
        event,
        ...metrics,
      }
    });

    // Update in-memory metrics
    updateMetricsCache(event, metrics);

    // Store in database for persistence
    await storeEventInDatabase(event, metrics);

    // Send to external analytics if configured
    await sendToExternalAnalytics(event, metrics);

  } catch (error) {
    // Don't throw - analytics should never break the main flow
    logger.error('Failed to track enhanced generation event', {
      metadata: { event, metrics }
    }, error as Error);
  }
}

/**
 * Update in-memory metrics cache
 */
function updateMetricsCache(event: EnhancedGenerationEvent, metrics: EnhancedGenerationMetrics): void {
  switch (event) {
    case 'generation_started':
      metricsCache.totalGenerations++;
      if (metrics.industry) {
        const current = metricsCache.industryBreakdown.get(metrics.industry) || 0;
        metricsCache.industryBreakdown.set(metrics.industry, current + 1);
      }
      break;

    case 'generation_completed':
      metricsCache.successfulGenerations++;
      if (metrics.template) {
        const current = metricsCache.templateUsage.get(metrics.template) || 0;
        metricsCache.templateUsage.set(metrics.template, current + 1);
      }
      if (metrics.generationTime) {
        // Update rolling average
        const total = metricsCache.averageGenerationTime * (metricsCache.successfulGenerations - 1);
        metricsCache.averageGenerationTime = (total + metrics.generationTime) / metricsCache.successfulGenerations;
      }
      break;

    case 'generation_failed':
      metricsCache.failedGenerations++;
      break;

    case 'questions_generated':
      if (metrics.questionsCount) {
        // Update rolling average
        const total = metricsCache.averageQuestions * metricsCache.totalGenerations;
        metricsCache.averageQuestions = (total + metrics.questionsCount) / (metricsCache.totalGenerations + 1);
      }
      break;
  }

  metricsCache.lastUpdated = new Date();
}

/**
 * Store event in database for long-term analytics
 */
async function storeEventInDatabase(
  event: EnhancedGenerationEvent,
  metrics: EnhancedGenerationMetrics
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        event: `enhanced_generation_${event}`,
        properties: metrics as any,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    // If analytics table doesn't exist, just log
    logger.warn('Could not store analytics event in database', {
      metadata: { event, error: (error as Error).message }
    });
  }
}

/**
 * Send to external analytics service
 */
async function sendToExternalAnalytics(
  event: EnhancedGenerationEvent,
  metrics: EnhancedGenerationMetrics
): Promise<void> {
  // Check if external analytics is configured
  const analyticsEndpoint = typeof process !== 'undefined' ? process.env?.ANALYTICS_ENDPOINT : undefined;
  const analyticsApiKey = typeof process !== 'undefined' ? process.env?.ANALYTICS_API_KEY : undefined;
  
  if (!analyticsEndpoint) {
    return;
  }

  try {
    const response = await fetch(analyticsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${analyticsApiKey}`,
      },
      body: JSON.stringify({
        event: `enhanced_generation_${event}`,
        properties: metrics,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      logger.warn('External analytics request failed', {
        metadata: { status: response.status }
      });
    }
  } catch (error) {
    logger.warn('Could not send to external analytics', {
      metadata: { error: (error as Error).message }
    });
  }
}

/**
 * Get current metrics summary
 */
export function getEnhancedGenerationMetrics(): {
  totalGenerations: number;
  successRate: number;
  averageQuestions: number;
  averageGenerationTime: number;
  industryBreakdown: Record<string, number>;
  templateUsage: Record<string, number>;
  lastUpdated: Date;
} {
  const successRate = metricsCache.totalGenerations > 0
    ? (metricsCache.successfulGenerations / metricsCache.totalGenerations) * 100
    : 0;

  return {
    totalGenerations: metricsCache.totalGenerations,
    successRate,
    averageQuestions: Math.round(metricsCache.averageQuestions * 10) / 10,
    averageGenerationTime: Math.round(metricsCache.averageGenerationTime / 1000), // seconds
    industryBreakdown: Object.fromEntries(metricsCache.industryBreakdown),
    templateUsage: Object.fromEntries(metricsCache.templateUsage),
    lastUpdated: metricsCache.lastUpdated,
  };
}

/**
 * Track user satisfaction
 */
export async function trackUserSatisfaction(
  websiteId: string,
  rating: number,
  feedback?: string
): Promise<void> {
  await trackEnhancedGeneration('user_satisfaction', {
    userRating: rating,
    userFeedback: feedback,
  });

  // Update website record with satisfaction data
  try {
    await prisma.site.update({
      where: { id: websiteId },
      data: {
        metadata: {
          userSatisfaction: {
            rating,
            feedback,
            ratedAt: new Date(),
          },
        } as any,
      },
    });
  } catch (error) {
    logger.error('Failed to update user satisfaction', {
      metadata: { websiteId, rating }
    }, error as Error);
  }
}

/**
 * Get analytics report for a specific time period
 */
export async function getEnhancedGenerationReport(
  startDate: Date,
  endDate: Date
): Promise<{
  summary: any;
  dailyBreakdown: any[];
  topPerformingIndustries: any[];
  commonErrors: any[];
}> {
  try {
    // This would query the database for detailed analytics
    // For now, return current metrics
    const currentMetrics = getEnhancedGenerationMetrics();
    
    return {
      summary: {
        ...currentMetrics,
        period: {
          start: startDate,
          end: endDate,
        },
      },
      dailyBreakdown: [],
      topPerformingIndustries: Object.entries(currentMetrics.industryBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([industry, count]) => ({ industry, count })),
      commonErrors: [],
    };
  } catch (error) {
    logger.error('Failed to generate analytics report', {}, error as Error);
    throw error;
  }
}