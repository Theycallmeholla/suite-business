import { getGBPAccessToken } from '../utils/gbp-auth.js';

/**
 * Debug script to show the ACTUAL GBP response structure
 * Run this to see what fields really exist in the API response
 */

const TEST_LOCATION = 'locations/2315391108903134470';
const TEST_EMAIL = 'adrian.grindmastersinc@gmail.com';

async function debugGBPStructure() {
  console.log('🔍 GBP Field Structure Debug Tool\n');
  console.log('=' .repeat(60));
  
  try {
    // Get access token
    const accessToken = await getGBPAccessToken(TEST_EMAIL);
    
    // Fetch location data
    console.log(`\n📍 Fetching data for: ${TEST_LOCATION}\n`);
    const response = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${TEST_LOCATION}?readMask=*`,
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
    
    import('fs').then(fs => {
      fs.default.writeFileSync(debugFile, JSON.stringify(locationData, null, 2));
      console.log('✅ Debug file saved - inspect it to see the exact structure');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the debug
debugGBPStructure();
