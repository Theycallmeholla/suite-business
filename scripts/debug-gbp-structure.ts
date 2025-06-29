const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TEST_LOCATION = 'locations/6848695004722343500'; // Everlast Energy
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

async function debugGBPStructure() {
  console.log('🔍 GBP Field Structure Debug Tool\n');
  console.log('=' .repeat(60));
  
  try {
    // Get access token
    const accessToken = await getGBPAccessToken(TEST_EMAIL);
    
    // Fetch location data
    console.log(`\n📍 Fetching data for: ${TEST_LOCATION}\n`);
    const readMask = 'name,title,phoneNumbers,storefrontAddress,websiteUri,regularHours,specialHours,categories,languageCode,storeCode,profile,relationshipData,moreHours,serviceArea,labels,adWordsLocationExtensions,latlng,openInfo,metadata,serviceItems';
    
    const response = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${TEST_LOCATION}?readMask=${encodeURIComponent(readMask)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const locationData = await response.json();
    
    // Show what fields actually exist
    console.log('✅ ACTUAL FIELDS PRESENT IN RESPONSE:\n');
    
    // Check each field path
    const fieldChecks = [
      // Phone variations
      { path: 'phoneNumbers?.primaryPhone', value: locationData.phoneNumbers?.primaryPhone },
      { path: 'primaryPhone', value: locationData.primaryPhone },
      { path: 'phoneNumbers', value: locationData.phoneNumbers },
      
      // Website variations
      { path: 'websiteUri', value: locationData.websiteUri },
      { path: 'website', value: locationData.website },
      { path: 'websiteUrl', value: locationData.websiteUrl },
      
      // Address variations
      { path: 'storefrontAddress', value: locationData.storefrontAddress },
      { path: 'address', value: locationData.address },
      { path: 'fullAddress', value: locationData.fullAddress },
      { path: 'location?.address', value: locationData.location?.address },
      
      // Hours variations
      { path: 'regularHours?.periods', value: locationData.regularHours?.periods },
      { path: 'regularHours?.weekdayDescriptions', value: locationData.regularHours?.weekdayDescriptions },
      { path: 'businessHours', value: locationData.businessHours },
      
      // Service area variations
      { path: 'serviceArea', value: locationData.serviceArea },
      { path: 'serviceAreas', value: locationData.serviceAreas },
      { path: 'serviceArea?.places?.placeInfos', value: locationData.serviceArea?.places?.placeInfos },
      
      // Description variations
      { path: 'profile?.description', value: locationData.profile?.description },
      { path: 'locationDescription', value: locationData.locationDescription },
      { path: 'description', value: locationData.description },
      
      // Categories
      { path: 'categories', value: locationData.categories },
      { path: 'additionalCategories', value: locationData.additionalCategories },
      { path: 'primaryCategory', value: locationData.primaryCategory },
      
      // Metadata
      { path: 'metadata', value: locationData.metadata },
      { path: 'metadata?.establishedDate', value: locationData.metadata?.establishedDate },
      { path: 'openingDate', value: locationData.openingDate }
    ];

    // Show which paths have data
    console.log('Field Path Checks:');
    console.log('-'.repeat(60));
    
    fieldChecks.forEach(check => {
      const hasValue = check.value !== undefined && check.value !== null;
      const marker = hasValue ? '✅' : '❌';
      console.log(`${marker} ${check.path.padEnd(40)} ${hasValue ? '→ HAS DATA' : '→ undefined'}`);
      
      if (hasValue && typeof check.value !== 'object') {
        console.log(`   Value: "${check.value}"`);
      } else if (hasValue && Array.isArray(check.value)) {
        console.log(`   Array with ${check.value.length} items`);
      } else if (hasValue) {
        console.log(`   Object with keys: ${Object.keys(check.value).join(', ')}`);
      }
    });
    
    // Show full object structure (first level only)
    console.log('\n📋 TOP-LEVEL FIELDS IN RESPONSE:');
    console.log('-'.repeat(60));
    Object.keys(locationData).forEach(key => {
      const value = locationData[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      console.log(`• ${key} (${type})`);
    });
    
    // Calculate data richness with both methods
    console.log('\n📊 DATA RICHNESS CALCULATION:');
    console.log('-'.repeat(60));
    
    // Wrong method
    let wrongScore = 0;
    if (locationData.phoneNumbers?.primaryPhone) wrongScore += 15;
    if (locationData.websiteUri) wrongScore += 10;
    if (locationData.storefrontAddress) wrongScore += 15;
    console.log(`❌ Using WRONG paths: ${wrongScore}/100`);
    
    // Correct method
    let correctScore = 0;
    if (locationData.primaryPhone) correctScore += 15;
    if (locationData.website) correctScore += 10;
    if (locationData.address || locationData.fullAddress) correctScore += 15;
    if (locationData.regularHours?.periods?.length > 0) correctScore += 15;
    if (locationData.serviceArea?.places?.placeInfos?.length > 0) correctScore += 10;
    if (locationData.profile?.description?.length > 100) correctScore += 10;
    if (locationData.additionalCategories?.length > 0) correctScore += 10;
    
    // Check years in business
    const descriptionText = locationData.profile?.description || '';
    const hasYearsInBiz = !!locationData.metadata?.establishedDate || /since \d{4}/i.test(descriptionText);
    if (hasYearsInBiz) correctScore += 15;
    
    console.log(`✅ Using CORRECT paths: ${correctScore}/100`);
    
    // Save full response for inspection
    const debugFile = `gbp-debug-${Date.now()}.json`;
    console.log(`\n💾 Saving full response to: ${debugFile}`);
    
    const fs = require('fs');
    fs.writeFileSync(debugFile, JSON.stringify(locationData, null, 2));
    console.log('✅ Debug file saved - inspect it to see the exact structure');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugGBPStructure();
