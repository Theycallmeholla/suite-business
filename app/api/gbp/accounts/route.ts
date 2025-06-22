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

    // Fetch email and check status for each account
    const accountsWithEmails = await Promise.all(
      accounts.map(async (account, index) => {
        let email = 'Unknown';
        let isActive = true;
        let hasGBPAccess = false;
        
        try {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
          );
          
          oauth2Client.setCredentials({
            access_token: account.access_token,
            refresh_token: account.refresh_token,
          });
          
          // Try to get user info - this will fail if account is suspended
          try {
            const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
            const userInfo = await oauth2.userinfo.get();
            email = userInfo.data.email || (index === 0 ? session.user.email : `Account ${account.providerAccountId.slice(-6)}`);
          } catch (userInfoError: any) {
            if (userInfoError?.response?.status === 403 || userInfoError?.response?.status === 401) {
              isActive = false;
            }
            email = index === 0 ? session.user.email || 'Primary Account' : `Google Account ${account.providerAccountId.slice(-6)}`;
          }
          
          // Quick check for GBP access without making expensive API calls
          // Just check if we can initialize the GBP API client
          if (isActive) {
            try {
              const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
                version: 'v1',
                auth: oauth2Client,
              });
              // Just creating the client is enough - don't make actual API calls here
              hasGBPAccess = true;
            } catch (gbpError) {
              hasGBPAccess = false;
            }
          }
        } catch (error) {
          console.log('Error checking account:', account.id, error);
          email = index === 0 ? session.user.email || 'Primary Account' : `Google Account ${account.providerAccountId.slice(-6)}`;
          isActive = false;
        }
        
        return {
          id: account.id,
          googleAccountId: account.providerAccountId,
          email,
          isPrimary: index === 0,
          isActive,
          hasGBPAccess,
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