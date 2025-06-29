const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GBP Account Summary - Shows OAuth status for all Google accounts
 * 
 * This script displays:
 * - All Google OAuth accounts in the system
 * - Which user they belong to
 * - Token status
 * - Associated Google account email (if determinable)
 */

async function gbpAccountSummary() {
  console.log('📊 GBP OAuth Account Summary\n');
  console.log('=' .repeat(60));
  
  try {
    // Get all Google OAuth accounts
    const googleAccounts = await prisma.account.findMany({
      where: {
        provider: 'google'
      },
      include: {
        user: true
      }
    });
    
    console.log(`\n📋 Found ${googleAccounts.length} Google OAuth account(s)\n`);
    
    // Known email mappings (based on your system)
    const knownMappings = {
      '100120117539137717651': 'adrian.grindmastersinc@gmail.com',
      '109342761094568216754': 'theycallmeholla@gmail.com',
      '110870091561846554370': 'holliday@cursivemedia.com'
    };
    
    for (const account of googleAccounts) {
      const mappedEmail = knownMappings[account.providerAccountId] || 'Unknown';
      const now = Math.floor(Date.now() / 1000);
      const isExpired = account.expires_at && now >= account.expires_at;
      
      console.log(`🔐 OAuth Account #${googleAccounts.indexOf(account) + 1}`);
      console.log(`   App User: ${account.user.email} (${account.user.name || 'No name'})`);
      console.log(`   Google Account: ${mappedEmail}`);
      console.log(`   Provider Account ID: ${account.providerAccountId}`);
      console.log(`   Has Access Token: ${account.access_token ? '✅' : '❌'}`);
      console.log(`   Has Refresh Token: ${account.refresh_token ? '✅' : '❌'}`);
      console.log(`   Token Status: ${isExpired ? '⏰ Expired (will auto-refresh)' : '✅ Valid'}`);
      
      if (account.expires_at) {
        const expiryDate = new Date(account.expires_at * 1000);
        console.log(`   Expires: ${expiryDate.toLocaleString()}`);
      }
      
      console.log('');
    }
    
    console.log('📌 Key Points:');
    console.log('   • All tokens are stored under Holliday\'s user account');
    console.log('   • These are service accounts, not app users');
    console.log('   • Tokens auto-refresh when needed');
    console.log('   • Use the Google account email (not app user email) in API calls');
    
    console.log('\n🧪 Test Commands:');
    console.log('   npm run unlock-gbp                    # Test all accounts');
    console.log('   npm run unlock-gbp adrian.grindmastersinc@gmail.com  # Test specific');
    
    console.log('\n📍 Known Location IDs:');
    console.log('   adrian.grindmastersinc@gmail.com → locations/2315391108903134470');
    console.log('   theycallmeholla@gmail.com → locations/6848695004722343500');
    console.log('   holliday@cursivemedia.com → Multiple (run list-gbp-locations.ts)');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the summary
gbpAccountSummary();
