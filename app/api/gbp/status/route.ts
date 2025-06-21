import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { gbpQuotaTracker } from '@/lib/monitoring/gbp-quota-tracker';

export async function GET() {
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
      return NextResponse.json({
        hasAccess: false,
        status: 'NO_GOOGLE_ACCOUNT',
        message: 'No Google account connected',
        quotaStatus: gbpQuotaTracker.getQuotaStatus()
      });
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    // Try a simple API call to check access
    try {
      const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
        version: 'v1',
        auth: oauth2Client,
      });

      // This is the lightest possible API call
      const response = await mybusinessaccountmanagement.accounts.list({
        pageSize: 1 // Minimal request
      });

      // Record successful call
      gbpQuotaTracker.recordCall('accounts.list', session.user.id, true);

      return NextResponse.json({
        hasAccess: true,
        status: 'ACTIVE',
        message: 'Google Business Profile API is working correctly',
        accountsFound: response.data.accounts?.length || 0,
        quotaStatus: gbpQuotaTracker.getQuotaStatus(),
        recentErrors: gbpQuotaTracker.getRecentErrors()
      });

    } catch (apiError: any) {
      // Record failed call
      gbpQuotaTracker.recordCall('accounts.list', session.user.id, false, apiError.message);

      // Analyze the error
      if (apiError?.code === 403) {
        if (apiError.message?.includes('has not been used in project')) {
          return NextResponse.json({
            hasAccess: false,
            status: 'API_NOT_ENABLED',
            message: 'Google Business Profile APIs are not enabled',
            requiredApis: [
              'mybusinessaccountmanagement.googleapis.com',
              'mybusinessbusinessinformation.googleapis.com'
            ],
            enableUrl: `https://console.cloud.google.com/apis/library?project=${process.env.GOOGLE_CLIENT_ID?.split('-')[0]}`,
            quotaStatus: gbpQuotaTracker.getQuotaStatus()
          });
        }
        
        if (apiError.message?.includes('Request had insufficient authentication scopes')) {
          return NextResponse.json({
            hasAccess: false,
            status: 'INSUFFICIENT_SCOPES',
            message: 'Missing required OAuth scopes',
            requiredScopes: [
              'https://www.googleapis.com/auth/business.manage'
            ],
            quotaStatus: gbpQuotaTracker.getQuotaStatus()
          });
        }

        return NextResponse.json({
          hasAccess: false,
          status: 'ACCESS_DENIED',
          message: 'Access denied to Google Business Profile API',
          details: apiError.message,
          quotaStatus: gbpQuotaTracker.getQuotaStatus()
        });
      }

      if (apiError?.code === 429 || apiError.message?.includes('Quota exceeded')) {
        return NextResponse.json({
          hasAccess: true,
          status: 'QUOTA_EXCEEDED',
          message: 'API access is working but quota limit reached',
          quotaStatus: gbpQuotaTracker.getQuotaStatus(),
          details: 'You have access to the API but have exceeded the rate limits',
          suggestions: [
            'Wait for quota reset (usually daily)',
            'Request a quota increase in Google Cloud Console',
            'Implement better caching to reduce API calls'
          ]
        });
      }

      // Other errors
      return NextResponse.json({
        hasAccess: 'unknown',
        status: 'ERROR',
        message: 'Unable to determine API access status',
        error: apiError.message,
        quotaStatus: gbpQuotaTracker.getQuotaStatus()
      });
    }

  } catch (error: any) {
    console.error('GBP Status Check Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check API status',
        details: error.message
      },
      { status: 500 }
    );
  }
}
