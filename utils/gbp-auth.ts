import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TypeScript interfaces
interface AccountWithUser {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  user: {
    id: string;
    email: string | null;
    emailVerified: Date | null;
    name: string | null;
    image: string | null;
  };
}

interface TokenRefreshResponse {
  access_token: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
}

interface GBPTestResult {
  email: string;
  locationId: string;
  status: 'SUCCESS' | 'FAILED' | 'ERROR';
  statusCode?: number;
  hasValidToken: boolean;
  businessName?: string;
  error: string | null;
}

/**
 * Refresh an expired Google OAuth token
 */
async function refreshGoogleToken(account: AccountWithUser): Promise<string> {
  console.log(`🔄 Refreshing token for ${account.user.email}...`);
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: account.refresh_token,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token refresh failed for ${account.user.email}: ${error.error_description || error.error}`);
  }

  const data: TokenRefreshResponse = await response.json();
  
  // Update the account with new tokens
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in
    }
  });

  console.log(`✅ Token refreshed for ${account.user.email}`);
  return data.access_token;
}

/**
 * Get a valid GBP access token for a given email
 */
export async function getGBPAccessToken(email: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: {
      provider: 'google',
      user: { email }
    },
    include: { user: true }
  }) as AccountWithUser | null;

  if (!account) {
    throw new Error(`No Google OAuth account found for ${email}`);
  }

  if (!account.refresh_token) {
    throw new Error(`No refresh token found for ${email} - requires re-authentication`);
  }

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  const isExpired = !account.expires_at || now >= account.expires_at;
  
  if (!account.access_token || isExpired) {
    console.log(`⏰ Token expired or missing for ${email}, refreshing...`);
    return await refreshGoogleToken(account);
  }

  console.log(`✅ Using existing valid token for ${email}`);
  return account.access_token;
}

/**
 * Get all Google OAuth accounts with their token status
 */
export async function getAllGoogleAccounts() {
  const accounts = await prisma.account.findMany({
    where: {
      provider: 'google'
    },
    include: {
      user: true
    }
  });

  return accounts.map((account: AccountWithUser) => {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = account.expires_at ? new Date(account.expires_at * 1000) : null;
    const isExpired = !account.expires_at || now >= account.expires_at;

    return {
      id: account.id,
      email: account.user?.email || 'Unknown',
      hasAccessToken: !!account.access_token,
      hasRefreshToken: !!account.refresh_token,
      expiresAt,
      isExpired,
      canRefresh: !!account.refresh_token
    };
  });
}

/**
 * Test GBP API access for a specific location
 */
export async function testGBPAccess(email: string, locationId: string): Promise<GBPTestResult> {
  try {
    // Get a valid access token
    const accessToken = await getGBPAccessToken(email);
    
    // Test the GBP API directly
    const gbpResponse = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseData = gbpResponse.ok ? await gbpResponse.json() : null;
    
    return {
      email,
      locationId,
      status: gbpResponse.ok ? 'SUCCESS' : 'FAILED',
      statusCode: gbpResponse.status,
      hasValidToken: true,
      businessName: responseData?.title,
      error: gbpResponse.ok ? null : `HTTP ${gbpResponse.status}`
    };
  } catch (error: any) {
    return {
      email,
      locationId,
      status: 'ERROR',
      hasValidToken: false,
      businessName: undefined,
      error: error.message
    };
  }
}