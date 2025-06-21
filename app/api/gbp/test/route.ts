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

    // Get the user's Google access token
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { error: 'No Google account connected' },
        { status: 400 }
      );
    }

    // Initialize Google OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    try {
      console.log('Testing Google Business Profile API access...');
      
      // Just list accounts - single API call
      const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
        version: 'v1',
        auth: oauth2Client,
      });

      console.log('Making API call to list accounts...');
      const startTime = Date.now();
      
      const accountsResponse = await mybusinessaccountmanagement.accounts.list();
      const accounts = accountsResponse.data.accounts || [];
      
      const responseTime = Date.now() - startTime;
      console.log(`API call completed in ${responseTime}ms`);
      console.log(`Found ${accounts.length} account(s)`);

      return NextResponse.json({
        success: true,
        message: 'Google Business Profile API is working!',
        accountsFound: accounts.length,
        accounts: accounts.map(acc => ({
          name: acc.name,
          accountName: acc.accountName,
          type: acc.type,
        })),
        apiResponseTime: responseTime,
        credentials: {
          clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          tokenExpiry: account.expires_at ? new Date(account.expires_at * 1000).toISOString() : null,
        },
      });

    } catch (apiError: any) {
      console.error('API Test Error:', apiError);
      
      return NextResponse.json({
        success: false,
        error: apiError?.message || 'Unknown error',
        code: apiError?.code,
        details: {
          statusCode: apiError?.response?.status,
          statusText: apiError?.response?.statusText,
          data: apiError?.response?.data,
        },
      });
    }

  } catch (error: any) {
    console.error('Test endpoint error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Test failed',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}