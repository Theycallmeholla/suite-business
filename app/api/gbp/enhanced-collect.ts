import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
/**
 * API endpoint for enhanced GBP data collection
 * Integrates the cost-optimized collection strategy into the onboarding flow
 */

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { placeId, gbpLocationId, priority, forceRefresh } = await request.json();

    if (!placeId) {
      return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
    }

    // Initialize orchestrator with user's proxy settings
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    });

    const orchestrator = new GBPDataOrchestrator({
      cacheFile: `./cache/${session.user.id}-gbp-cache.json`,
      placesApiKey: process.env.GOOGLE_PLACES_API_KEY,
      useProxy: userSettings?.useProxy ?? true,
      proxyProvider: userSettings?.proxyProvider as any || 'webshare'
    });

    await orchestrator.initialize();

    // Get user's Google access token if they have GBP access
    let accessToken: string | undefined;
    if (gbpLocationId) {
      const account = await prisma.account.findFirst({
        where: {
          userId: session.user.id,
          provider: 'google'
        }
      });
      accessToken = account?.access_token || undefined;
    }

    // Collect data with appropriate strategy
    const result = await orchestrator.collectBusinessData(
      [{ placeId, gbpLocationId, priority: priority || 'medium' }],
      { accessToken, forceRefresh }
    );

    if (result.failed > 0) {
      return NextResponse.json({
        error: 'Failed to collect business data',
        details: result.errors[0]
      }, { status: 500 });
    }

    const businessData = result.data[0];

    // Log collection for analytics
    await prisma.dataCollection.create({
      data: {
        userId: session.user.id,
        placeId,
        dataSource: businessData.dataSource,
        completeness: businessData.dataCompleteness,
        cost: result.totalCost,
        cached: result.fromCache > 0
      }
    });

    // Update user's usage stats
    await prisma.userSettings.update({
      where: { userId: session.user.id },
      data: {
        totalDataCost: { increment: result.totalCost },
        totalListingsCollected: { increment: 1 }
      }
    });

    await orchestrator.cleanup();

    return NextResponse.json({
      success: true,
      data: businessData,
      cost: result.totalCost,
      source: businessData.dataSource,
      completeness: businessData.dataCompleteness,
      cached: result.fromCache > 0
    });

  } catch {
    logger.error('Enhanced data collection error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's collection statistics
    const stats = await prisma.dataCollection.aggregate({
      where: { userId: session.user.id },
      _sum: { cost: true },
      _count: true,
      _avg: { completeness: true }
    });

    const recentCollections = await prisma.dataCollection.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    });

    return NextResponse.json({
      stats: {
        totalCollections: stats._count,
        totalCost: stats._sum.cost || 0,
        averageCompleteness: stats._avg.completeness || 0,
        proxyProvider: userSettings?.proxyProvider || 'webshare',
        monthlyBudget: userSettings?.monthlyDataBudget || 10
      },
      recentCollections
    });

  } catch {
    logger.error('Error fetching collection stats:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
