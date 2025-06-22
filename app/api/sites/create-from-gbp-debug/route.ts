import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getUserGoogleBusinessAccess } from '@/lib/google-business-profile';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'No session found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { locationId, accountId } = body;

    logger.info('Debug: Creating site from GBP', { 
      userId: session.user.id, 
      locationId,
      accountId,
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url
    });

    // First, let's test if we can access GBP directly
    const gbpAccess = await getUserGoogleBusinessAccess(session.user.id);
    
    if (!gbpAccess.success || !gbpAccess.client) {
      return NextResponse.json(
        { 
          error: 'GBP Access Failed',
          details: gbpAccess.error,
          requiresAuth: gbpAccess.requiresAuth 
        },
        { status: gbpAccess.requiresAuth ? 401 : 403 }
      );
    }

    const { client } = gbpAccess;

    // Try to fetch location directly
    try {
      const response = await client.get(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}`,
        {
          params: {
            readMask: 'name,title,phoneNumbers,storefrontAddress,categories'
          }
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Direct GBP API call successful',
        business: {
          name: response.data.title,
          primaryPhone: response.data.phoneNumbers?.primaryPhone,
          address: response.data.storefrontAddress,
          categories: response.data.categories
        }
      });

    } catch (apiError: any) {
      logger.error('Direct GBP API call failed', { 
        error: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status
      });

      // Now let's try the internal API call
      const internalUrl = `${process.env.NEXTAUTH_URL}/api/gbp/location/${locationId}${accountId ? `?accountId=${accountId}` : ''}`;
      logger.info('Trying internal API call', { url: internalUrl });

      const gbpResponse = await fetch(internalUrl, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
          'Content-Type': 'application/json',
        },
      });

      const responseText = await gbpResponse.text();

      return NextResponse.json({
        success: false,
        directApiError: {
          message: apiError.message,
          status: apiError.response?.status,
          data: apiError.response?.data
        },
        internalApiCall: {
          url: internalUrl,
          status: gbpResponse.status,
          statusText: gbpResponse.statusText,
          response: responseText,
          headers: Object.fromEntries(gbpResponse.headers.entries())
        }
      });
    }

  } catch (error: any) {
    logger.error('Debug endpoint error', { error: error.message });
    
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
