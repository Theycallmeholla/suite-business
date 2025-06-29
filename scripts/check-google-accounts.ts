const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAccounts() {
  try {
    console.log('🔍 Checking Google OAuth accounts in database...\n');
    
    // Get all Google accounts
    const googleAccounts = await prisma.account.findMany({
      where: {
        provider: 'google'
      },
      include: {
        user: true
      }
    });
    
    console.log(`Found ${googleAccounts.length} Google OAuth accounts:\n`);
    
    googleAccounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.user.email}`);
      console.log(`   - Has Access Token: ${!!account.access_token ? '✅' : '❌'}`);
      console.log(`   - Has Refresh Token: ${!!account.refresh_token ? '✅' : '❌'}`);
      console.log(`   - Provider Account ID: ${account.providerAccountId}`);
      console.log('');
    });
    
    if (googleAccounts.length === 0) {
      console.log('❌ No Google OAuth accounts found in the database.');
      console.log('\nThis means users need to connect their Google accounts first.');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccounts();
