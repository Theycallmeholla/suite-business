import { createGHLProClient } from '../lib/ghl';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

/**
 * Script to list all users in GHL agency and help you decide who to add
 */
async function listGHLUsers() {
  console.log('🔍 Fetching users from GoHighLevel...\n');
  
  try {
    const ghlClient = createGHLProClient();
    
    // Try to get users from the agency location
    // Note: GHL API v2 doesn't have a direct "list all agency users" endpoint
    // We'll need to use the location users endpoint
    
    console.log('Fetching from location:', process.env.GHL_LOCATION_ID);
    
    // This is a placeholder - you'll need to check the exact endpoint
    // The API might be something like /locations/{locationId}/users
    const response = await fetch(
      `https://services.leadconnectorhq.com/locations/${process.env.GHL_LOCATION_ID}/users`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GHL_PRIVATE_INTEGRATIONS_KEY}`,
          'Version': '2021-07-28',
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL API Error:', response.status, errorText);
      
      // Try alternative approach - get location details which might include users
      console.log('\nTrying alternative approach...');
      const location = await ghlClient.getLocation(process.env.GHL_LOCATION_ID!);
      console.log('Location info:', JSON.stringify(location, null, 2));
      return;
    }

    const data = await response.json();
    const users = data.users || data || [];
    
    console.log(`Found ${users.length} users in GHL:\n`);
    console.log('═'.repeat(80));
    
    // Check which users already exist in our app
    const existingUsers = await prisma.user.findMany({
      select: { email: true }
    });
    const existingEmails = new Set(existingUsers.map(u => u.email));
    
    // Check which users are already in agency team
    const agencyTeam = await prisma.team.findFirst({
      where: { type: 'agency' },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });
    
    const teamEmails = new Set(agencyTeam?.members.map(m => m.user.email) || []);
    
    // Display users
    users.forEach((user: any, index: number) => {
      const email = user.email || 'No email';
      const name = user.name || user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || 'No name';
      const role = user.role || 'Unknown role';
      const status = user.status || 'Active';
      
      // Check status
      let appStatus = '❌ Not in app';
      if (teamEmails.has(email)) {
        appStatus = '✅ Already in agency team';
      } else if (existingEmails.has(email)) {
        appStatus = '⚠️  In app but not in agency team';
      }
      
      console.log(`${index + 1}. ${name}`);
      console.log(`   Email: ${email}`);
      console.log(`   GHL Role: ${role}`);
      console.log(`   Status: ${status}`);
      console.log(`   App Status: ${appStatus}`);
      console.log('─'.repeat(80));
    });
    
    console.log('\nNext Steps:');
    console.log('1. Have users sign in to the app with their Google account (using the email above)');
    console.log('2. Run: npm run add-to-agency <email> <role>');
    console.log('   Roles: admin, member');
    console.log('\nExample: npm run add-to-agency john@example.com admin');
    
  } catch (error) {
    console.error('❌ Error fetching GHL users:', error);
    
    // Show helpful information
    console.log('\n📋 Manual Steps:');
    console.log('1. Log into GoHighLevel');
    console.log('2. Go to Settings > Team');
    console.log('3. Note down the email addresses of team members');
    console.log('4. Have them sign in to the app');
    console.log('5. Add them to agency team in the app');
  }
}

// Run the script
listGHLUsers()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });