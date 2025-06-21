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

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      projectId: process.env.GOOGLE_CLIENT_ID?.split('-')[0],
      tests: []
    };

    // Test 1: Check if Account Management API is accessible
    try {
      console.log('Testing Account Management API...');
      const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
        version: 'v1',
        auth: oauth2Client,
      });
      
      // Try to list accounts with minimal data
      const accountsResponse = await mybusinessaccountmanagement.accounts.list({
        pageSize: 1,
      });
      
      diagnostics.tests.push({
        api: 'Account Management API',
        status: 'success',
        accountsFound: accountsResponse.data.accounts?.length || 0,
      });
    } catch (error: any) {
      diagnostics.tests.push({
        api: 'Account Management API',
        status: 'failed',
        error: error?.message || 'Unknown error',
        errorCode: error?.code,
        details: error?.response?.data,
      });
    }

    // Test 2: Check if Business Information API is accessible
    if (diagnostics.tests[0]?.accountsFound > 0) {
      try {
        console.log('Testing Business Information API...');
        const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
          version: 'v1',
          auth: oauth2Client,
        });
        
        // Get the first account from previous test
        const accountsResponse = await google.mybusinessaccountmanagement({
          version: 'v1',
          auth: oauth2Client,
        }).accounts.list({ pageSize: 1 });
        
        const firstAccount = accountsResponse.data.accounts?.[0];
        if (firstAccount?.name) {
          const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
            parent: firstAccount.name,
            pageSize: 1,
          });
          
          diagnostics.tests.push({
            api: 'Business Information API',
            status: 'success',
            locationsFound: locationsResponse.data.locations?.length || 0,
          });
        }
      } catch (error: any) {
        diagnostics.tests.push({
          api: 'Business Information API',
          status: 'failed',
          error: error?.message || 'Unknown error',
          errorCode: error?.code,
          details: error?.response?.data,
        });
      }
    }

    // Analyze results
    const hasQuotaIssue = diagnostics.tests.some((test: any) => 
      test.error?.includes('quota') || test.error?.includes('Quota')
    );
    
    const hasPermissionIssue = diagnostics.tests.some((test: any) => 
      test.error?.includes('PERMISSION_DENIED') || test.error?.includes('insufficient')
    );
    
    const allTestsPassed = diagnostics.tests.every((test: any) => test.status === 'success');

    // Provide recommendations
    diagnostics.summary = {
      hasAccess: allTestsPassed,
      hasQuotaIssue,
      hasPermissionIssue,
      recommendation: allTestsPassed 
        ? 'API access is working correctly' 
        : hasQuotaIssue 
          ? 'You need to request GBP API access. Visit https://developers.google.com/my-business/content/prereqs'
          : hasPermissionIssue
            ? 'Check that the authenticated user has access to a Google Business Profile'
            : 'Enable the required APIs in Google Cloud Console',
    };

    return NextResponse.json(diagnostics);

  } catch (error: any) {
    console.error('Check access error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check API access',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}