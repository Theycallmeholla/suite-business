#!/usr/bin/env node

console.log(`
🔓 GBP Access Unlock - Quick Test Runner
========================================

This will test your GBP access setup. Make sure you have:
✓ DATABASE_URL configured
✓ GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
✓ Node.js with ES modules support

`);

console.log('📋 Available Commands:\n');
console.log('1. Test all accounts:');
console.log('   node scripts/unlock-gbp-access.js\n');

console.log('2. Get comprehensive report:');
console.log('   node scripts/gbp-comprehensive-report.js\n');

console.log('3. Test API endpoints:');
console.log('   # List accounts');
console.log('   curl http://localhost:3000/api/gbp/test-access?action=list\n');
console.log('   # Test specific location');
console.log('   curl "http://localhost:3000/api/gbp/test-access?action=test&email=adrian.grindmastersinc@gmail.com&locationId=locations/2315391108903134470"\n');

console.log('🚀 Running initial test now...\n');

// Import and run the unlock script
import('./scripts/unlock-gbp-access.js').catch(error => {
  console.error('❌ Failed to run unlock script:', error.message);
  console.log('\nMake sure you have:');
  console.log('- Proper database connection');
  console.log('- Google OAuth credentials in .env');
  console.log('- Prisma client generated (npx prisma generate)');
});
