import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getUsageLimits } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get plan limits
    const limits = await getUsageLimits(session.user.id);

    // Get current usage
    const [siteCount, userCount, blogPostCount, gbpPostCount] = await Promise.all([
      // Count sites (locations)
      prisma.site.count({
        where: { userId: session.user.id },
      }),
      // Count users (for now just 1, but this could be expanded for team features)
      Promise.resolve(1),
      // Count blog posts this month
      prisma.blogPost.count({
        where: {
          site: { userId: session.user.id },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      // Count GBP posts this month (placeholder - would need actual GBP integration)
      Promise.resolve(0),
    ]);

    const usage = {
      locations: {
        used: siteCount,
        limit: limits.locations,
      },
      users: {
        used: userCount,
        limit: limits.users,
      },
      monthlyBlogPosts: {
        used: blogPostCount,
        limit: limits.monthlyBlogPosts,
      },
      gbpPosts: {
        used: gbpPostCount,
        limit: limits.gbpPosts,
      },
    };

    // Add email and SMS credits if available in plan
    if ((limits as any).emailCredits !== undefined) {
      (usage as any).emailCredits = {
        used: 0, // Would track actual email usage
        limit: (limits as any).emailCredits,
      };
    }

    if ((limits as any).smsCredits !== undefined) {
      (usage as any).smsCredits = {
        used: 0, // Would track actual SMS usage
        limit: (limits as any).smsCredits,
      };
    }

    return NextResponse.json({ usage });
  } catch (error) {
    logger.error('Error fetching usage', {
      metadata: { error }
    });
    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}
