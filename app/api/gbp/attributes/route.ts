import { NextRequest } from 'googleapis';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('categoryName');
    const regionCode = searchParams.get('regionCode') || 'US';
    const languageCode = searchParams.get('languageCode') || 'EN';

    if (!categoryName) {
      return NextResponse.json(
        { error: 'categoryName is required' },
        { status: 400 }
      );
    }

    // Get the most recent Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (!account || !account.access_token) {
      return NextResponse.json(
        { error: 'Google account not found or not authenticated' },
        { status: 404 }
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

    // Check if token needs refresh
    if (account.expires_at && new Date(account.expires_at * 1000) < new Date()) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        await prisma.account.update({
          where: { id: account.id },
          data: {
            access_token: credentials.access_token,
            expires_at: Math.floor((credentials.expiry_date || 0) / 1000),
            refresh_token: credentials.refresh_token || account.refresh_token,
          },
        });
        oauth2Client.setCredentials(credentials);
      } catch (refreshError: unknown) {
        logger.error('Token refresh failed', {}, refreshError as Error);
        return NextResponse.json(
          { error: 'Google authentication expired. Please sign in again.' },
          { status: 401 }
        );
      }
    }

    // Initialize Google Business Information API
    const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: oauth2Client,
    });

    try {
      logger.info('Fetching attributes for category', {
        metadata: { categoryName, regionCode, languageCode }
      });

      // Fetch attributes for the specified category
      const response = await mybusinessbusinessinformation.attributes.list({
        categoryName,
        regionCode,
        languageCode,
        pageSize: 100,
      });

      const attributes = response.data.attributes || [];

      logger.info('Successfully fetched attributes', {
        metadata: { 
          categoryName,
          attributeCount: attributes.length,
          attributeIds: attributes.map((attr: any) => attr.attributeId)
        }
      });

      return NextResponse.json({
        attributes,
        category: categoryName,
        regionCode,
        languageCode,
        totalCount: attributes.length,
      });

    } catch (apiError: any) {
      logger.error('Google API Error:', {
        metadata: { 
          error: apiError.message,
          categoryName,
          code: apiError.code,
          details: apiError.response?.data
        }
      });

      if (apiError.code === 404) {
        return NextResponse.json(
          { error: 'Category not found or no attributes available' },
          { status: 404 }
        );
      }

      if (apiError.code === 403) {
        return NextResponse.json(
          { error: 'Permission denied. The API may not be enabled or you lack access.' },
          { status: 403 }
        );
      }

      throw apiError;
    }

  } catch {
    logger.error('Error fetching attributes', {
      metadata: { error: error.message }
    });

    return NextResponse.json(
      { error: 'Failed to fetch attributes' },
      { status: 500 }
    );
  }
}