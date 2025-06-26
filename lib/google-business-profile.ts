// Google Business Profile API Integration
// Note: Google My Business API v4 has been deprecated
// This is a mock implementation for development
// In production, use the newer Business Profile Performance API

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export class GoogleBusinessProfileClient {
  private auth: any;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Mock initialization for development
      logger.info('Initializing Google Business Profile client (mock mode)', {
        action: 'gbp_init'
      });
      this.auth = { mock: true };
    } catch (error) {
      logger.integrationError('gbp', error as Error, {
        action: 'initialize_auth'
      });
      throw error;
    }
  }

  // Search for existing business listings
  async searchBusinessListings(query: {
    businessName: string;
    address: string;
    phoneNumber?: string;
  }) {
    try {
      // Mock implementation - replace with actual API call
      logger.debug('Searching for business', {
        action: 'search_business_listings',
        metadata: query
      });
      return [];
    } catch (error) {
      logger.integrationError('gbp', error as Error, {
        action: 'search_business_listings'
      });
      return [];
    }
  }

  // Get business details including reviews, hours, etc
  async getBusinessDetails(accountId: string, locationId: string) {
    try {
      // Mock implementation
      return {
        profile: {
          name: `accounts/${accountId}/locations/${locationId}`,
          title: 'Mock Business',
          phoneNumbers: { primary: '+1234567890' },
        },
        reviews: [],
        insights: null,
      };
    } catch (error) {
      logger.integrationError('gbp', error as Error, {
        action: 'get_business_details',
        metadata: { accountId, locationId }
      });
      throw error;
    }
  }

  // Update business information
  async updateBusinessInfo(accountId: string, locationId: string, updates: any) {
    try {
      // Mock implementation
      logger.debug('Updating business info', {
        action: 'update_business_info',
        metadata: { accountId, locationId, updateCount: Object.keys(updates).length }
      });
      return { success: true };
    } catch (error) {
      logger.integrationError('gbp', error as Error, {
        action: 'update_business_info',
        metadata: { accountId, locationId }
      });
      throw error;
    }
  }

  // Post updates to GBP
  async createPost(accountId: string, locationId: string, post: {
    summary: string;
    callToAction?: {
      actionType: string;
      url?: string;
    };
    media?: Array<{
      mediaFormat: 'PHOTO' | 'VIDEO';
      sourceUrl: string;
    }>;
  }) {
    try {
      // Mock implementation
      logger.debug('Creating GBP post', {
        action: 'create_post',
        metadata: { accountId, locationId, hasMedia: !!post.media }
      });
      return {
        name: `accounts/${accountId}/locations/${locationId}/localPosts/mock-post-id`,
        state: 'LIVE',
      };
    } catch (error) {
      logger.integrationError('gbp', error as Error, {
        action: 'create_post',
        metadata: { accountId, locationId }
      });
      throw error;
    }
  }

  // Manage reviews
  async replyToReview(accountId: string, locationId: string, reviewId: string, reply: string) {
    try {
      // Mock implementation
      logger.debug('Replying to review', {
        action: 'reply_to_review',
        metadata: { accountId, locationId, reviewId, replyLength: reply.length }
      });
      return { success: true };
    } catch (error) {
      logger.integrationError('gbp', error as Error, {
        action: 'reply_to_review',
        metadata: { accountId, locationId, reviewId }
      });
      throw error;
    }
  }

  // Get location insights
  async getLocationInsights(accountId: string, locationId: string) {
    try {
      // Mock implementation
      return {
        locationMetrics: [
          { metric: 'QUERIES_DIRECT', values: [{ value: 100 }] },
          { metric: 'VIEWS_SEARCH', values: [{ value: 250 }] },
        ],
      };
    } catch (error) {
      logger.integrationError('gbp', error as Error, {
        action: 'get_location_insights',
        metadata: { accountId, locationId }
      });
      return null;
    }
  }

  // Verify business (for new listings)
  async verifyBusiness(accountId: string, locationId: string, method: 'POSTCARD' | 'PHONE' | 'EMAIL') {
    try {
      // Mock implementation
      logger.info('Initiating business verification', {
        action: 'verify_business',
        metadata: { accountId, locationId, method }
      });
      return { verificationState: 'PENDING' };
    } catch (error) {
      logger.integrationError('gbp', error as Error, {
        action: 'verify_business',
        metadata: { accountId, locationId, method }
      });
      throw error;
    }
  }

  // Batch update multiple locations (for chains)
  async batchUpdateLocations(accountId: string, updates: Array<{
    locationId: string;
    updates: any;
  }>) {
    try {
      // Mock implementation
      logger.debug('Batch updating locations', {
        action: 'batch_update_locations',
        metadata: { accountId, locationCount: updates.length }
      });
      return { success: true };
    } catch (error) {
      logger.integrationError('gbp', error as Error, {
        action: 'batch_update_locations',
        metadata: { accountId, locationCount: updates.length }
      });
      throw error;
    }
  }
}

// Singleton instance
let gbpClient: GoogleBusinessProfileClient;

export function getGoogleBusinessProfileClient() {
  if (!gbpClient) {
    gbpClient = new GoogleBusinessProfileClient();
  }
  return gbpClient;
}

// Helper function to refresh Google access token
async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string; expires_at: number } | null> {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const { access_token, expires_in } = response.data;
    const expires_at = Math.floor(Date.now() / 1000) + expires_in;

    return { access_token, expires_at };
  } catch (error) {
    logger.error('Failed to refresh Google token', { error });
    return null;
  }
}

// Get user's Google Business Profile access
export async function getUserGoogleBusinessAccess(userId: string): Promise<{
  success: boolean;
  client?: any;
  error?: string;
  requiresAuth?: boolean;
}> {
  try {
    // Get all Google accounts for this user
    const googleAccounts = await prisma.account.findMany({
      where: {
        userId,
        provider: 'google',
      },
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
    });

    if (googleAccounts.length === 0) {
      return {
        success: false,
        error: 'No Google accounts connected',
        requiresAuth: true,
      };
    }

    // Try each Google account to find one with GBP access
    for (const account of googleAccounts) {
      try {
        let accessToken = account.access_token;
        let expiresAt = account.expires_at;

        // Check if token is expired and refresh if needed
        if (!accessToken || (expiresAt && expiresAt * 1000 < Date.now())) {
          if (!account.refresh_token) {
            logger.debug('Account has no refresh token, skipping', {
              accountId: account.id,
              providerAccountId: account.providerAccountId,
            });
            continue;
          }

          const refreshed = await refreshGoogleToken(account.refresh_token);
          if (!refreshed) {
            logger.debug('Failed to refresh token for account, skipping', {
              accountId: account.id,
              providerAccountId: account.providerAccountId,
            });
            continue;
          }

          accessToken = refreshed.access_token;
          expiresAt = refreshed.expires_at;

          // Update the account with new token
          await prisma.account.update({
            where: { id: account.id },
            data: {
              access_token: accessToken,
              expires_at: expiresAt,
            },
          });
        }

        // Check if this account has GBP scope
        if (!account.scope?.includes('https://www.googleapis.com/auth/business.manage')) {
          logger.debug('Account does not have GBP scope, skipping', {
            accountId: account.id,
            providerAccountId: account.providerAccountId,
            scope: account.scope,
          });
          continue;
        }

        // Create authenticated axios client
        const client = axios.create({
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        // Test the client by trying to list accounts
        try {
          await client.get('https://mybusinessaccountmanagement.googleapis.com/v1/accounts');
          
          logger.info('Successfully created GBP client', {
            userId,
            accountId: account.id,
            providerAccountId: account.providerAccountId,
          });

          return {
            success: true,
            client,
          };
        } catch (testError: any) {
          logger.debug('GBP test call failed for account, trying next', {
            accountId: account.id,
            providerAccountId: account.providerAccountId,
            error: testError.message,
            status: testError.response?.status,
          });
          continue;
        }
      } catch (accountError: any) {
        logger.debug('Error processing account, trying next', {
          accountId: account.id,
          providerAccountId: account.providerAccountId,
          error: accountError.message,
        });
        continue;
      }
    }

    // If we get here, none of the accounts worked
    return {
      success: false,
      error: 'No Google accounts with valid GBP access found. Please connect a Google account with Business Profile permissions.',
      requiresAuth: true,
    };

  } catch (error: any) {
    logger.error('Error getting user Google Business access', {
      userId,
      error: error.message,
    });

    return {
      success: false,
      error: 'Failed to check Google Business Profile access',
      requiresAuth: false,
    };
  }
}

// Helper functions for common operations
export const gbpHelpers = {
  // Format phone for GBP
  formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    // Format as E.164
    return `+1${digits}`;
  },

  // Convert business hours to GBP format
  formatBusinessHours(hours: Record<string, string>) {
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const periods = [];

    for (const day of daysOfWeek) {
      const dayHours = hours[day.toLowerCase()];
      if (dayHours && dayHours !== 'CLOSED') {
        const [open, close] = dayHours.split('-').map(t => t.trim());
        periods.push({
          openDay: day,
          closeDay: day,
          openTime: open,
          closeTime: close,
        });
      }
    }

    return { periods };
  },

  // Industry-specific attributes
  getIndustryAttributes(industry: string) {
    const attributes: Record<string, any> = {
      landscaping: {
        'has_lawn_care': true,
        'has_tree_service': true,
        'has_irrigation': true,
        'accepts_credit_cards': true,
        'requires_appointments': false,
      },
      hvac: {
        'has_heating_repair': true,
        'has_cooling_repair': true,
        'has_emergency_service': true,
        'accepts_credit_cards': true,
        'requires_appointments': true,
      },
      // Add more industries
    };

    return attributes[industry] || {};
  },
};