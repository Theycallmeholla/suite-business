import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    // Find duplicate users by email
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group users by email
    const usersByEmail = users.reduce((acc, user) => {
      if (!acc[user.email]) {
        acc[user.email] = [];
      }
      acc[user.email].push(user);
      return acc;
    }, {} as Record<string, typeof users>);

    // Find duplicates
    const duplicates = Object.entries(usersByEmail)
      .filter(([email, users]) => users.length > 1)
      .map(([email, users]) => ({
        email,
        count: users.length,
        users: users.map(u => ({
          id: u.id,
          createdAt: u.createdAt,
          hasAccounts: u.accounts.length > 0,
          hasSessions: u.sessions.length > 0,
        }))
      }));

    return NextResponse.json({
      totalUsers: users.length,
      uniqueEmails: Object.keys(usersByEmail).length,
      duplicates,
    });

  } catch (error) {
    console.error('Cleanup users error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    const { action } = await request.json();

    if (action === 'merge-duplicates') {
      // Find duplicate users by email
      const users = await prisma.user.findMany({
        include: {
          accounts: true,
          sessions: true,
          sites: true,
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      const usersByEmail = users.reduce((acc, user) => {
        if (!acc[user.email]) {
          acc[user.email] = [];
        }
        acc[user.email].push(user);
        return acc;
      }, {} as Record<string, typeof users>);

      let mergedCount = 0;
      let deletedCount = 0;

      // Merge duplicates
      for (const [email, emailUsers] of Object.entries(usersByEmail)) {
        if (emailUsers.length > 1) {
          // Keep the first user (oldest)
          const primaryUser = emailUsers[0];
          const duplicateUsers = emailUsers.slice(1);

          for (const duplicate of duplicateUsers) {
            // Move all accounts to primary user
            await prisma.account.updateMany({
              where: { userId: duplicate.id },
              data: { userId: primaryUser.id }
            });

            // Move all sites to primary user
            await prisma.site.updateMany({
              where: { userId: duplicate.id },
              data: { userId: primaryUser.id }
            });

            // Delete sessions for duplicate user
            await prisma.session.deleteMany({
              where: { userId: duplicate.id }
            });

            // Delete duplicate user
            await prisma.user.delete({
              where: { id: duplicate.id }
            });

            deletedCount++;
          }
          mergedCount++;
        }
      }

      return NextResponse.json({
        message: 'Duplicates merged successfully',
        mergedEmails: mergedCount,
        deletedUsers: deletedCount,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Merge users error:', error);
    return NextResponse.json(
      { error: 'Failed to merge users' },
      { status: 500 }
    );
  }
}