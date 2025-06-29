import { getGBPAccessToken } from '../utils/gbp-auth.js';

/**
 * List all GBP locations for a given Google account
 * @param {string} email - User email
 * @returns {Promise<Array>} - Array of locations
 */
async function listAllGBPLocations(email) {
  try {
    const accessToken = await getGBPAccessToken(email);
    
    // First, we need to get the account information to find all locations
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
      throw new Error(`Failed to fetch accounts: HTTP ${accountsResponse.status}`);
    }

    const accountsData = await accountsResponse.json();
    const locations = [];

    // For each account, get its locations
    for (const account of accountsData.accounts || []) {
      const locationsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        
        for (const location of locationsData.locations || []) {
          locations.push({
            accountName: account.accountName,
            accountId: account.name,
            locationId: location.name,
            businessName: location.title,
            address: location.storefrontAddress?.addressLines?.join(', '),
            city: location.storefrontAddress?.locality,
            state: location.storefrontAddress?.administrativeArea,
            phone: location.phoneNumbers?.primaryPhone,
            website: location.websiteUri,
            primaryCategory: location.categories?.primaryCategory?.displayName
          });
        }
      }
    }

    return locations;
  } catch (error) {
    console.error(`Error listing locations for ${email}:`, error.message);
    return [];
  }
}

/**
 * Get comprehensive GBP access report
 */
export async function getComprehensiveGBPReport() {
  const testEmails = [
    'adrian.grindmastersinc@gmail.com',
    'theycallmeholla@gmail.com', 
    'holliday@cursivemedia.com'
  ];

  const report = {
    timestamp: new Date().toISOString(),
    accounts: []
  };

  for (const email of testEmails) {
    console.log(`\n🔍 Scanning locations for ${email}...`);
    
    try {
      const locations = await listAllGBPLocations(email);
      
      report.accounts.push({
        email,
        status: 'SUCCESS',
        locationCount: locations.length,
        locations
      });

      console.log(`✅ Found ${locations.length} locations`);
      
      locations.forEach(loc => {
        console.log(`  📍 ${loc.businessName}`);
        console.log(`     ID: ${loc.locationId}`);
        console.log(`     ${loc.city}, ${loc.state}`);
      });
      
    } catch (error) {
      report.accounts.push({
        email,
        status: 'ERROR',
        error: error.message,
        locationCount: 0,
        locations: []
      });
      
      console.log(`❌ Error: ${error.message}`);
    }
  }

  return report;
}

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Running Comprehensive GBP Access Report\n');
  console.log('=' .repeat(60));
  
  getComprehensiveGBPReport().then(report => {
    console.log('\n' + '=' .repeat(60));
    console.log('\n📊 FINAL REPORT SUMMARY:');
    
    report.accounts.forEach(account => {
      console.log(`\n${account.email}:`);
      console.log(`  Status: ${account.status}`);
      console.log(`  Locations: ${account.locationCount}`);
      
      if (account.error) {
        console.log(`  Error: ${account.error}`);
      }
    });
    
    const totalLocations = report.accounts.reduce((sum, acc) => sum + acc.locationCount, 0);
    console.log(`\n📈 TOTAL ACCESSIBLE LOCATIONS: ${totalLocations}`);
    
    // Save report to file
    import('fs').then(fs => {
      const fileName = `gbp-access-report-${Date.now()}.json`;
      fs.default.writeFileSync(fileName, JSON.stringify(report, null, 2));
      console.log(`\n💾 Full report saved to: ${fileName}`);
    });
  });
}
