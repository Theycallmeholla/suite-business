import { createGHLProClient } from '../lib/ghl';
import { prisma } from '../lib/prisma';

/**
 * Try different approaches to get GHL users
 */
async function findGHLUsers() {
  console.log('🔍 Attempting to fetch users from GoHighLevel...\n');
  
  const ghlClient = createGHLProClient();
  const baseUrl = 'https://services.leadconnectorhq.com';
  const headers = {
    'Authorization': `Bearer ${process.env.GHL_PRIVATE_INTEGRATIONS_KEY || process.env.GHL_API_KEY}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json'
  };

  console.log('Using API Key:', process.env.GHL_PRIVATE_INTEGRATIONS_KEY ? 'Private Integration Key' : 'Regular API Key');
  console.log('Location ID:', process.env.GHL_LOCATION_ID);
  console.log('Agency ID:', process.env.GHL_AGENCY_ID);
  console.log('\n' + '═'.repeat(80) + '\n');

  // Try different endpoints
  const endpoints = [
    {
      name: 'Location Users',
      url: `${baseUrl}/locations/${process.env.GHL_LOCATION_ID}/users`,
      method: 'GET'
    },
    {
      name: 'Users',
      url: `${baseUrl}/users`,
      method: 'GET',
      params: '?locationId=' + process.env.GHL_LOCATION_ID
    },
    {
      name: 'Contacts (to see data structure)',
      url: `${baseUrl}/contacts`,
      method: 'GET',
      params: '?locationId=' + process.env.GHL_LOCATION_ID + '&limit=1'
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔸 Trying: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}${endpoint.params || ''}`);
    
    try {
      const response = await fetch(`${endpoint.url}${endpoint.params || ''}`, {
        method: endpoint.method,
        headers
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success! Response structure:`);
        
        // Show the structure of the response
        if (Array.isArray(data)) {
          console.log(`   - Array with ${data.length} items`);
          if (data.length > 0) {
            console.log(`   - First item keys:`, Object.keys(data[0]));
            console.log(`   - Sample:`, JSON.stringify(data[0], null, 2));
          }
        } else if (typeof data === 'object') {
          console.log(`   - Object with keys:`, Object.keys(data));
          
          // If it has nested arrays, show them
          Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) {
              console.log(`   - ${key}: Array with ${data[key].length} items`);
              if (data[key].length > 0) {
                console.log(`     Sample ${key}:`, JSON.stringify(data[key][0], null, 2));
              }
            }
          });
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Network error:`, error);
    }
  }

  console.log('\n' + '═'.repeat(80) + '\n');
  
  // Check current app state
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

  console.log('📊 Current Agency Team in App:');
  if (agencyTeam && agencyTeam.members.length > 0) {
    agencyTeam.members.forEach((member, index) => {
      console.log(`${index + 1}. ${member.user.name || member.user.email}`);
      console.log(`   Email: ${member.user.email}`);
      console.log(`   Role: ${member.role}`);
      console.log(`   GHL User ID: ${member.ghlUserId || 'Not linked'}`);
    });
  } else {
    console.log('No team members found.');
  }

  console.log('\n📝 Manual Process:');
  console.log('1. Log into GoHighLevel at https://app.gohighlevel.com');
  console.log('2. Go to Settings > My Staff (or Team)');
  console.log('3. List the team members you want to add');
  console.log('4. Have them sign in to the app with their Google account');
  console.log('5. Add them using: npm run add-to-agency <email> <role>');
  console.log('\nRoles: admin (can manage businesses) or member (view only)');
}

// Run the script
findGHLUsers()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });