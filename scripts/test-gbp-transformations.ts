/**
 * Test script to verify GBP field transformations are working correctly
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testGBPFieldTransformations() {
  console.log('🧪 Testing GBP Field Transformations\n');
  console.log('=' .repeat(60));
  
  try {
    // Test with Everlast Energy location
    const locationId = 'locations/6848695004722343500';
    const email = 'holliday@cursivemedia.com';
    
    console.log(`📍 Testing location: ${locationId}\n`);
    
    // Get access token
    const account = await prisma.account.findFirst({
      where: {
        provider: 'google',
        user: { email }
      },
      include: { user: true }
    });
    
    if (!account || !account.access_token) {
      throw new Error('No valid token found');
    }
    
    // Call the API endpoint (simulating what the frontend does)
    const apiUrl = `http://localhost:3000/api/gbp/location/${encodeURIComponent(locationId)}`;
    console.log(`🔗 Calling API: ${apiUrl}\n`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Cookie': `next-auth.session-token=${account.access_token}` // May need actual session token
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const transformedData = await response.json();
    
    console.log('✅ TRANSFORMED API RESPONSE FIELDS:\n');
    console.log('Field Mapping Verification:');
    console.log('-'.repeat(60));
    
    // Check transformed fields
    const fieldChecks = [
      { field: 'primaryPhone', value: transformedData.primaryPhone, expected: 'string' },
      { field: 'website', value: transformedData.website, expected: 'string' },
      { field: 'fullAddress', value: transformedData.fullAddress, expected: 'object' },
      { field: 'address', value: transformedData.address, expected: 'string' },
      { field: 'primaryCategory', value: transformedData.primaryCategory, expected: 'object' },
      { field: 'additionalCategories', value: transformedData.additionalCategories, expected: 'array' },
      { field: 'regularHours', value: transformedData.regularHours, expected: 'object' },
      { field: 'serviceArea', value: transformedData.serviceArea, expected: 'object' },
    ];
    
    fieldChecks.forEach(check => {
      const hasValue = check.value !== undefined && check.value !== null;
      const type = Array.isArray(check.value) ? 'array' : typeof check.value;
      const isCorrectType = type === check.expected || (check.expected === 'array' && Array.isArray(check.value));
      
      console.log(`${hasValue ? '✅' : '❌'} ${check.field.padEnd(25)} → ${hasValue ? type : 'undefined'} ${isCorrectType ? '✓' : '✗'}`);
      
      if (hasValue && typeof check.value === 'string') {
        console.log(`   Value: "${check.value.substring(0, 50)}${check.value.length > 50 ? '...' : ''}"`);
      }
    });
    
    // Calculate data richness using the fixed logic
    console.log('\n📊 DATA RICHNESS CALCULATION (Fixed Logic):\n');
    
    let score = 0;
    const scoreBreakdown = [];
    
    if (transformedData.primaryPhone) {
      score += 15;
      scoreBreakdown.push('Phone: +15');
    }
    if (transformedData.regularHours?.periods?.length > 0) {
      score += 15;
      scoreBreakdown.push('Hours: +15');
    }
    if (transformedData.website) {
      score += 10;
      scoreBreakdown.push('Website: +10');
    }
    if (transformedData.fullAddress || transformedData.address || transformedData.serviceArea) {
      score += 15;
      scoreBreakdown.push('Address/ServiceArea: +15');
    }
    if (transformedData.serviceArea?.polygon || transformedData.serviceArea?.places?.placeInfos?.length > 0) {
      score += 10;
      scoreBreakdown.push('ServiceArea Details: +10');
    }
    if (transformedData.metadata?.establishedDate || transformedData.profile?.description?.match(/since \d{4}/i)) {
      score += 15;
      scoreBreakdown.push('Years in Business: +15');
    }
    if (transformedData.profile?.description?.length > 100) {
      score += 10;
      scoreBreakdown.push('Description: +10');
    }
    if (transformedData.additionalCategories?.length > 0) {
      score += 10;
      scoreBreakdown.push('Categories: +10');
    }
    
    console.log('Score Breakdown:');
    scoreBreakdown.forEach(item => console.log(`  ${item}`));
    console.log(`\n✅ Total Score: ${score}/100`);
    
    const label = score >= 80 ? 'Rich Data' : score >= 50 ? 'Partial Data' : 'Minimal Data';
    console.log(`📊 Data Richness: ${label}`);
    
    console.log('\n✅ Frontend should now correctly show:');
    console.log(`  - Phone: ${transformedData.primaryPhone ? '✅ Available' : '❌ Missing'}`);
    console.log(`  - Website: ${transformedData.website ? '✅ Available' : '❌ Missing'}`);
    console.log(`  - Address: ${transformedData.fullAddress ? '✅ Physical' : '⚡ Service area only'}`);
    console.log(`  - Data Score: ${score}/100 (${label})`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testGBPFieldTransformations();
