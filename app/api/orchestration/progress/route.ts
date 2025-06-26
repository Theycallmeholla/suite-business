/**
 * Real-time Progress Tracking API
 * 
 * Provides Server-Sent Events for real-time website generation progress updates
 */

import { NextRequest } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getGenerationProgress, deleteGenerationProgress } from '@/lib/orchestration/progress-store';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get('generationId');

    if (!generationId) {
      return new Response('Generation ID required', { status: 400 });
    }

    // Set up Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'connected', generationId })}\n\n`)
        );

        // Set up progress monitoring
        const interval = setInterval(() => {
          const progress = getGenerationProgress(generationId);
          
          if (progress) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'progress', ...progress })}\n\n`)
            );

            // Clean up when complete
            if (progress.progress >= 100) {
              clearInterval(interval);
              deleteGenerationProgress(generationId);
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`)
              );
              controller.close();
            }
          }
        }, 1000);

        // Clean up on client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    logger.error('Progress tracking failed', {}, error as Error);
    return new Response('Internal Server Error', { status: 500 });
  }
}