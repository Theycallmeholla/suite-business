import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    console.log('Starting complete credential reset...');

    // 1. Delete all accounts (OAuth connections)
    const deletedAccounts = await prisma.account.deleteMany({});
    console.log(`Deleted ${deletedAccounts.count} account connections`);

    // 2. Delete all sessions
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`Deleted ${deletedSessions.count} sessions`);

    // 3. Clear all auth cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    for (const cookie of allCookies) {
      if (cookie.name.includes('authjs') || 
          cookie.name.includes('next-auth') || 
          cookie.name.includes('__Secure') ||
          cookie.name.includes('__Host')) {
        cookieStore.delete(cookie.name);
      }
    }
    console.log(`Cleared ${allCookies.length} cookies`);

    // 4. Clear the in-memory cache from our API routes
    // This is done by restarting the dev server or waiting for it to expire

    return NextResponse.json({
      message: 'All credentials and sessions have been reset',
      details: {
        accountsDeleted: deletedAccounts.count,
        sessionsDeleted: deletedSessions.count,
        cookiesCleared: allCookies.length,
      },
      nextSteps: [
        '1. Clear your browser cookies and cache',
        '2. Sign in again with the Google account that has GBP API access',
        '3. Make sure the new GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are in .env.local',
        '4. Restart the development server to load new environment variables',
      ]
    });

  } catch (error) {
    console.error('Reset all error:', error);
    return NextResponse.json(
      { error: 'Failed to reset credentials' },
      { status: 500 }
    );
  }
}