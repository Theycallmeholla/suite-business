import { NextRequest } from 'googleapis';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params before using
    const { locationId: paramLocationId } = await params;
    const locationId = decodeURIComponent(paramLocationId);
    const pageSize = request.nextUrl.searchParams.get('pageSize') || '20';
    const pageToken = request.nextUrl.searchParams.get('pageToken');

    logger.info('Fetching GBP location reviews', {
      metadata: { 
        userId: session.user.id, 
        locationId,
        pageSize 
      }
    });

    // Get the Google account
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

    // Initialize Google Business Account Management API
    const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: oauth2Client,
    });

    try {
      // First, we need to find which account owns this location
      const accountsResponse = await mybusinessaccountmanagement.accounts.list();
      const accounts = accountsResponse.data.accounts || [];
      
      let resourceName = locationId;
      let accountName = null;

      // If locationId doesn't start with 'locations/', we need to find the full resource name
      if (!locationId.startsWith('locations/')) {
        // Try to find the location across all accounts
        const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
          version: 'v1',
          auth: oauth2Client,
        });

        for (const businessAccount of accounts) {
          if (!businessAccount.name) continue;

          try {
            const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
              parent: businessAccount.name,
              readMask: 'name',
              pageSize: 100,
            });

            const locations = locationsResponse.data.locations || [];
            const targetLocation = locations.find((loc: any) => {
              return loc.name.endsWith(`/${locationId}`) || loc.name === locationId;
            });

            if (targetLocation && targetLocation.name) {
              resourceName = targetLocation.name;
              accountName = businessAccount.name;
              break;
            }
          } catch {
            // Continue searching in other accounts
          }
        }
      } else {
        // Extract account from the resource name
        // Format: locations/{locationId} - we need to find which account it belongs to
        for (const businessAccount of accounts) {
          accountName = businessAccount.name;
          break; // Use the first account for now
        }
      }

      if (!accountName) {
        return NextResponse.json(
          { error: 'Could not find account for this location' },
          { status: 404 }
        );
      }

      // Now fetch reviews using the Account Management API
      // Note: Reviews are accessed through the account, not the location directly
      const reviewsUrl = `https://mybusiness.googleapis.com/v4/${accountName}/${resourceName}/reviews`;
      
      const response = await oauth2Client.request({
        url: reviewsUrl,
        method: 'GET',
        params: {
          pageSize,
          ...(pageToken && { pageToken }),
        },
      });

      const reviews = response.data.reviews || [];
      
      // Transform reviews to include all available data
      const transformedReviews = reviews.map((review: any) => ({
        reviewId: review.reviewId,
        reviewer: {
          displayName: review.reviewer?.displayName,
          profilePhotoUrl: review.reviewer?.profilePhotoUrl,
          isAnonymous: review.reviewer?.isAnonymous,
        },
        starRating: review.starRating,
        comment: review.comment,
        createTime: review.createTime,
        updateTime: review.updateTime,
        reviewReply: review.reviewReply ? {
          comment: review.reviewReply.comment,
          updateTime: review.reviewReply.updateTime,
        } : null,
      }));

      // Calculate average rating
      const totalRating = transformedReviews.reduce((sum: number, review: any) => {
        const rating = review.starRating === 'FIVE' ? 5 :
                      review.starRating === 'FOUR' ? 4 :
                      review.starRating === 'THREE' ? 3 :
                      review.starRating === 'TWO' ? 2 :
                      review.starRating === 'ONE' ? 1 : 0;
        return sum + rating;
      }, 0);

      const averageRating = transformedReviews.length > 0 
        ? (totalRating / transformedReviews.length).toFixed(1)
        : 0;

      logger.info('Successfully fetched GBP reviews', {
        metadata: { 
          locationId,
          reviewsCount: transformedReviews.length,
          averageRating,
          hasNextPage: !!response.data.nextPageToken
        }
      });

      return NextResponse.json({
        reviews: transformedReviews,
        nextPageToken: response.data.nextPageToken,
        totalReviewCount: response.data.totalReviewCount || transformedReviews.length,
        averageRating: parseFloat(averageRating as string),
      });

    } catch (apiError: any) {
      logger.error('Google API Error:', {
        metadata: { 
          error: apiError.message,
          locationId,
          code: apiError.code,
          details: apiError.response?.data
        }
      });

      if (apiError.code === 404 || apiError.message?.includes('not found')) {
        return NextResponse.json(
          { error: 'Location not found or reviews not available' },
          { status: 404 }
        );
      }

      if (apiError.code === 403) {
        return NextResponse.json(
          { error: 'Permission denied. Reviews API access may not be enabled.' },
          { status: 403 }
        );
      }

      throw apiError;
    }

  } catch {
    const { locationId: paramLocationId } = await params;
    logger.error('Error fetching GBP reviews', {
      metadata: { 
        error: error.message,
        locationId: paramLocationId 
      }
    });

    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}