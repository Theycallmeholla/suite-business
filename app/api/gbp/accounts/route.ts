import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all Google accounts for this user
    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        provider: 'google',
        access_token: { not: null }, // Only get accounts with valid tokens
      },
      orderBy: {
        id: 'asc', // Show oldest (primary) account first
      },
      select: {
        id: true,
        providerAccountId: true,
        access_token: true,
        refresh_token: true,
        // We need to fetch the email from Google
      },
    });

    // Fetch email for each account
    const accountsWithEmails = await Promise.all(
      accounts.map(async (account, index) => {
        let email = 'Unknown';
        
        // For the first account (primary), use the session email
        if (index === 0) {
          email = session.user.email || 'Primary Account';
        } else {
          // For additional accounts, fetch from Google
          try {
            const oauth2Client = new google.auth.OAuth2(
              process.env.GOOGLE_CLIENT_ID,
              process.env.GOOGLE_CLIENT_SECRET
            );
            
            oauth2Client.setCredentials({
              access_token: account.access_token,
              refresh_token: account.refresh_token,
            });
            
            const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
            const userInfo = await oauth2.userinfo.get();
            email = userInfo.data.email || `Account ${account.providerAccountId.slice(-6)}`;
          } catch (error) {
            console.log('Could not fetch email for account:', account.id);
            email = `Google Account ${account.providerAccountId.slice(-6)}`;
          }
        }
        
        return {
          id: account.id,
          googleAccountId: account.providerAccountId,
          email,
          isPrimary: index === 0,
        };
      })
    );

    return NextResponse.json({
      accounts: accountsWithEmails,
      count: accounts.length,
      primaryEmail: session.user.email,
    });

  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}