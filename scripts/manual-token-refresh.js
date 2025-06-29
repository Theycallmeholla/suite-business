import { PrismaClient } from '@prisma/client';
import { getGBPAccessToken } from '../utils/gbp-auth.js';

const prisma = new PrismaClient();

/**
 * Manually refresh token for a specific email
 * Usage: node scripts/manual-token-refresh.js email@example.com
 */
async function manualRefresh() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node scripts/manual-token-refresh.js email@example.com');
    process.exit(1);
  }

  console.log(`🔄 Attempting to refresh token for: ${email}\n`);

  try {
    // Get current account state
    const account = await prisma.account.findFirst({
      where: {
        provider: 'google',
        user: { email }
      },
      include: { user: true }
    });

    if (!account) {
      console.error(`❌ No Google OAuth account found for ${email}`);
      process.exit(1);
    }

    console.log('📋 Current Account State:');
    console.log(`  Has Access Token: ${!!account.access_token}`);
    console.log(`  Has Refresh Token: ${!!account.refresh_token}`);
    
    if (account.expires_at) {
      const expiryDate = new Date(account.expires_at * 1000);
      const isExpired = Date.now() > account.expires_at * 1000;
      console.log(`  Token Expires: ${expiryDate.toLocaleString()}`);
      console.log(`  Is Expired: ${isExpired}`);
    }

    if (!account.refresh_token) {
      console.error('\n❌ No refresh token available - user needs to re-authenticate');
      process.exit(1);
    }

    // Force refresh
    console.log('\n🔄 Forcing token refresh...');
    const newToken = await getGBPAccessToken(email);
    
    // Verify it worked
    const updatedAccount = await prisma.account.findFirst({
      where: { id: account.id }
    });

    console.log('\n✅ Token refreshed successfully!');
    console.log('📋 New Token State:');
    console.log(`  Has Access Token: ${!!updatedAccount.access_token}`);
    
    if (updatedAccount.expires_at) {
      const newExpiryDate = new Date(updatedAccount.expires_at * 1000);
      console.log(`  New Expiry: ${newExpiryDate.toLocaleString()}`);
    }

    // Test the token
    console.log('\n🧪 Testing token with GBP API...');
    const testResponse = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      {
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log(`✅ Token is valid! Found ${data.accounts?.length || 0} GBP accounts`);
    } else {
      console.log(`❌ Token test failed: HTTP ${testResponse.status}`);
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

manualRefresh();
