import { prisma } from '../lib/prisma';
import { addToAgencyTeam } from '../lib/teams';
import { ensureUserInGHL } from '../lib/ghl-user-sync';

interface TeamMember {
  email: string;
  name: string;
  role: 'admin' | 'member';
}

// ADD YOUR TEAM MEMBERS HERE
const teamMembers: TeamMember[] = [
  // Examples:
  // { email: 'john@gmail.com', name: 'John Smith', role: 'admin' },
  // { email: 'jane@gmail.com', name: 'Jane Doe', role: 'member' },
  // { email: 'bob@gmail.com', name: 'Bob Johnson', role: 'admin' },
];

async function addAllAgencyMembers() {
  console.log('🚀 Starting bulk agency member addition...\n');
  
  if (teamMembers.length === 0) {
    console.error('❌ No team members defined!');
    console.error('\nEdit this file and add your team members to the teamMembers array.');
    console.error('Example:');
    console.error(`  { email: 'john@gmail.com', name: 'John Smith', role: 'admin' },`);
    process.exit(1);
  }
  
  const results = {
    created: 0,
    updated: 0,
    added: 0,
    failed: 0,
  };
  
  for (const member of teamMembers) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${member.name} (${member.email})`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: member.email }
      });
      
      if (!user) {
        // Create user
        user = await prisma.user.create({
          data: {
            email: member.email,
            name: member.name,
          }
        });
        console.log('✅ User created');
        results.created++;
      } else {
        console.log('✅ User already exists');
        
        // Update name if different
        if (user.name !== member.name) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { name: member.name }
          });
          console.log('📝 Updated user name');
          results.updated++;
        }
      }
      
      // Check agency team membership
      const existingMembership = await prisma.teamMember.findFirst({
        where: {
          userId: user.id,
          team: { type: 'agency' }
        }
      });
      
      if (existingMembership) {
        console.log(`ℹ️  Already in agency team as ${existingMembership.role}`);
        
        // Update role if different and not owner
        if (existingMembership.role !== member.role && existingMembership.role !== 'owner') {
          await prisma.teamMember.update({
            where: { id: existingMembership.id },
            data: { role: member.role }
          });
          console.log(`✅ Updated role to ${member.role}`);
        }
      } else {
        // Add to agency team
        await addToAgencyTeam(user.id, member.role);
        console.log(`✅ Added to agency team as ${member.role}`);
        results.added++;
      }
      
      // Sync with GHL
      try {
        await ensureUserInGHL(user.id);
        console.log('✅ Synced with GoHighLevel');
      } catch (error) {
        console.warn('⚠️  Failed to sync with GHL:', error);
      }
      
    } catch (error) {
      console.error(`❌ Failed to process ${member.email}:`, error);
      results.failed++;
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total processed: ${teamMembers.length}`);
  console.log(`✅ Users created: ${results.created}`);
  console.log(`📝 Users updated: ${results.updated}`);
  console.log(`👥 Added to team: ${results.added}`);
  if (results.failed > 0) {
    console.log(`❌ Failed: ${results.failed}`);
  }
  
  console.log('\n✨ All done! Team members can now sign in with Google.');
}

// Run the script
addAllAgencyMembers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
