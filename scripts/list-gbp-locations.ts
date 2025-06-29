const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TEST_EMAIL = 'holliday@cursivemedia.com';

async function refreshGoogleToken(account: any) {
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

  const data = await response.json();
  
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

async function getGBPAccessToken(email: string) {
  const account = await prisma.account.findFirst({
    where: {
      provider: 'google',
      user: { email }
    },
    include: { user: true }
  });

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

async function listGBPLocations() {
  console.log('🔍 Finding GBP Locations for ' + TEST_EMAIL + '\n');
  console.log('=' .repeat(60));
  
  try {
    // Get access token
    const accessToken = await getGBPAccessToken(TEST_EMAIL);
    
    // First, get accounts
    console.log('\n📋 Fetching Google Business accounts...\n');
    const accountsResponse = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!accountsResponse.ok) {
      throw new Error(`HTTP ${accountsResponse.status}: ${await accountsResponse.text()}`);
    }

    const accountsData = await accountsResponse.json();
    const accounts = accountsData.accounts || [];
    
    console.log(`Found ${accounts.length} business account(s)\n`);
    
    let allLocations: any[] = [];
    
    // For each account, get locations
    for (const account of accounts) {
      console.log(`\n📍 Checking account: ${account.accountName || account.name}`);
      
      const locationsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        const locations = locationsData.locations || [];
        
        console.log(`   Found ${locations.length} location(s)`);
        
        locations.forEach((loc: any) => {
          console.log(`   - ${loc.title}`);
          console.log(`     ID: ${loc.name}`);
          if (loc.storefrontAddress) {
            console.log(`     Address: ${loc.storefrontAddress.locality}, ${loc.storefrontAddress.administrativeArea}`);
          }
          allLocations.push(loc);
        });
      }
    }
    
    if (allLocations.length > 0) {
      console.log(`\n✅ Total locations found: ${allLocations.length}`);
      console.log('\n🎯 Use one of these location IDs in the debug script:');
      console.log(allLocations[0].name);
    } else {
      console.log('\n❌ No locations found for this account');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
listGBPLocations();
