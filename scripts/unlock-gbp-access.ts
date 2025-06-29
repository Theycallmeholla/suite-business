import { PrismaClient } from '@prisma/client';
import { getAllGoogleAccounts, testGBPAccess } from '../utils/gbp-auth';

const prisma = new PrismaClient();

// Test locations for each account
const TEST_LOCATIONS = [
  { 
    email: 'adrian.grindmastersinc@gmail.com', 
    locationId: 'locations/2315391108903134470',
    accountName: 'GrindMasters (Known Working)'
  },
  { 
    email: 'theycallmeholla@gmail.com', 
    locationId: 'locations/6848695004722343500',
    accountName: 'Account 1'
  },
  { 
    email: 'holliday@cursivemedia.com', 
    locationId: 'locations/14834752219176972003',
    accountName: 'Account 2'
  }
];

interface GoogleAccount {
  id: string;
  email: string;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  expiresAt: Date | null;
  isExpired: boolean;
  canRefresh: boolean;
}

async function unlockGBPAccess() {
  console.log('🔓 Unlocking GBP Access for All Accounts\n');
  console.log('=' .repeat(60));
  
  // Step 1: Get all Google OAuth accounts
  console.log('\n📋 STEP 1: Querying all Google OAuth accounts...\n');
  const allAccounts = await getAllGoogleAccounts() as GoogleAccount[];
  
  console.log(`Found ${allAccounts.length} Google OAuth accounts:\n`);
  
  allAccounts.forEach((account: GoogleAccount) => {
    console.log(`  Email: ${account.email}`);
    console.log(`  ├─ Has Access Token: ${account.hasAccessToken ? '✅' : '❌'}`);
    console.log(`  ├─ Has Refresh Token: ${account.hasRefreshToken ? '✅' : '❌'}`);
    console.log(`  ├─ Token Expired: ${account.isExpired ? '⏰ Yes' : '✅ No'}`);
    console.log(`  └─ Can Refresh: ${account.canRefresh ? '✅' : '❌'}\n`);
  });
  
  console.log('=' .repeat(60));
  
  // Step 2: Test specific GBP locations
  console.log('\n🧪 STEP 2: Testing GBP Access for Known Locations...\n');
  
  interface TestResult {
    email: string;
    locationId: string;
    accountName: string;
    businessName?: string;
    status?: string;
    error?: string | null;
    reason?: string;
  }

  const results = {
    working: [] as TestResult[],
    refreshed: [] as TestResult[],
    failed: [] as TestResult[],
    missing: [] as TestResult[]
  };
  
  for (const test of TEST_LOCATIONS) {
    console.log(`\nTesting: ${test.accountName}`);
    console.log(`  Email: ${test.email}`);
    console.log(`  Location: ${test.locationId}`);
    
    // Check if account exists
    const accountExists = allAccounts.find((a: GoogleAccount) => a.email === test.email);
    
    if (!accountExists) {
      console.log(`  ❌ Result: NO GOOGLE OAUTH ACCOUNT FOUND`);
      results.missing.push(test);
      continue;
    }
    
    if (!accountExists.hasRefreshToken) {
      console.log(`  ❌ Result: NO REFRESH TOKEN - REQUIRES RE-AUTH`);
      results.failed.push({ ...test, reason: 'No refresh token' });
      continue;
    }
    
    // Record if token needed refresh
    const needsRefresh = accountExists.isExpired || !accountExists.hasAccessToken;
    
    // Test the actual GBP access
    const testResult = await testGBPAccess(test.email, test.locationId);
    
    if (testResult.status === 'SUCCESS') {
      console.log(`  ✅ Result: SUCCESS`);
      if (testResult.businessName) {
        console.log(`  📍 Business: ${testResult.businessName}`);
      }
      
      if (needsRefresh) {
        results.refreshed.push({ ...test, ...testResult });
      } else {
        results.working.push({ ...test, ...testResult });
      }
    } else {
      console.log(`  ❌ Result: ${testResult.status}`);
      console.log(`  └─ Error: ${testResult.error}`);
      results.failed.push({ ...test, ...testResult });
    }
  }
  
  // Step 3: Summary Report
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 SUMMARY REPORT\n');
  
  console.log('✅ ACCOUNTS WITH WORKING TOKENS:');
  if (results.working.length > 0) {
    results.working.forEach(r => {
      console.log(`  • ${r.email} - ${r.accountName}`);
    });
  } else {
    console.log('  None');
  }
  
  console.log('\n🔄 TOKENS THAT REQUIRED REFRESH:');
  if (results.refreshed.length > 0) {
    results.refreshed.forEach(r => {
      console.log(`  • ${r.email} - ${r.accountName} (refreshed successfully)`);
    });
  } else {
    console.log('  None');
  }
  
  console.log('\n❌ ACCOUNTS MISSING OR FAILING:');
  if (results.failed.length > 0) {
    results.failed.forEach(r => {
      console.log(`  • ${r.email} - ${r.accountName}`);
      console.log(`    └─ ${r.error || r.reason}`);
    });
  } else {
    console.log('  None');
  }
  
  if (results.missing.length > 0) {
    console.log('\n⚠️  ACCOUNTS NEEDING OAUTH SETUP:');
    results.missing.forEach(r => {
      console.log(`  • ${r.email} - ${r.accountName}`);
    });
  }
  
  // Step 4: Additional accounts not in test list
  const testedEmails = TEST_LOCATIONS.map(t => t.email);
  const otherAccounts = allAccounts.filter((a: GoogleAccount) => !testedEmails.includes(a.email));
  
  if (otherAccounts.length > 0) {
    console.log('\n📌 OTHER GOOGLE ACCOUNTS FOUND:');
    otherAccounts.forEach((a: GoogleAccount) => {
      console.log(`  • ${a.email} (not tested)`);
    });
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n✅ NEXT STEPS:');
  console.log('1. For working accounts: Ready to sync all GBP data');
  console.log('2. For failed refreshes: User needs to re-authenticate');
  console.log('3. For missing accounts: User needs to connect Google account');
  console.log('\nRun automated refresh + full GBP sync when ready!');
  
  await prisma.$disconnect();
}

// Run the unlock process
unlockGBPAccess().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});