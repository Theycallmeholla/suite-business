// GoHighLevel OAuth 2.0 Implementation
import { logger } from '@/lib/logger';

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface OAuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  userType: string;
  locationId?: string;
  companyId?: string;
}

export class GHLOAuthClient {
  private config: OAuthConfig;
  private authBaseUrl = 'https://marketplace.gohighlevel.com/oauth/authorize';
  private tokenUrl = 'https://services.leadconnectorhq.com/oauth/token';

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  // Step 1: Generate authorization URL for user to grant access
  getAuthorizationUrl(scopes: string[], state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      ...(state && { state })
    });

    return `${this.authBaseUrl}?${params.toString()}`;
  }

  // Step 2: Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<OAuthTokens> {
    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OAuth token exchange failed: ${error}`);
      }

      const tokens: OAuthTokens = await response.json();
      logger.info('OAuth tokens obtained successfully', {
        userType: tokens.userType,
        locationId: tokens.locationId,
        companyId: tokens.companyId,
      });

      return tokens;
    } catch (error) {
      logger.error('OAuth token exchange error', error);
      throw error;
    }
  }

  // Step 3: Refresh access token when it expires
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OAuth token refresh failed: ${error}`);
      }

      const tokens: OAuthTokens = await response.json();
      logger.info('OAuth tokens refreshed successfully');

      return tokens;
    } catch (error) {
      logger.error('OAuth token refresh error', error);
      throw error;
    }
  }

  // Helper to check if token is expired
  isTokenExpired(expiresAt: Date): boolean {
    return new Date() >= expiresAt;
  }

  // Calculate expiration date from expires_in
  calculateExpirationDate(expiresIn: number): Date {
    return new Date(Date.now() + (expiresIn * 1000));
  }
}

// OAuth scopes for sub-account access
export const GHL_OAUTH_SCOPES = {
  // Contacts
  CONTACTS_READONLY: 'contacts.readonly',
  CONTACTS_WRITE: 'contacts.write',
  
  // Opportunities
  OPPORTUNITIES_READONLY: 'opportunities.readonly',
  OPPORTUNITIES_WRITE: 'opportunities.write',
  
  // Calendars
  CALENDARS_READONLY: 'calendars.readonly',
  CALENDARS_WRITE: 'calendars.write',
  
  // Conversations
  CONVERSATIONS_READONLY: 'conversations.readonly',
  CONVERSATIONS_WRITE: 'conversations.write',
  CONVERSATIONS_MESSAGES_READONLY: 'conversations/message.readonly',
  CONVERSATIONS_MESSAGES_WRITE: 'conversations/message.write',
  
  // Forms
  FORMS_READONLY: 'forms.readonly',
  FORMS_WRITE: 'forms.write',
  
  // Locations (requires agency-level access)
  LOCATIONS_READONLY: 'locations.readonly',
  LOCATIONS_WRITE: 'locations.write',
  
  // Webhooks
  WEBHOOKS_READONLY: 'webhooks.readonly',
  WEBHOOKS_WRITE: 'webhooks.write',
  
  // Workflows
  WORKFLOWS_READONLY: 'workflows.readonly',
  
  // Companies (agency-level)
  COMPANIES_READONLY: 'companies.readonly',
};

// Factory function
export function createGHLOAuthClient(
  clientId?: string,
  clientSecret?: string,
  redirectUri?: string
) {
  const config = {
    clientId: clientId || process.env.GHL_OAUTH_CLIENT_ID!,
    clientSecret: clientSecret || process.env.GHL_OAUTH_CLIENT_SECRET!,
    redirectUri: redirectUri || process.env.GHL_OAUTH_REDIRECT_URI!,
  };

  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    throw new Error('GHL OAuth configuration missing');
  }

  return new GHLOAuthClient(config);
}
