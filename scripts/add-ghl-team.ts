import { PrismaClient } from '@prisma/client';
import { addToAgencyTeam } from '../lib/teams';

const prisma = new PrismaClient();

// Add your existing GHL team members here
const GHL_TEAM_MEMBERS = [
  { email: 'member1@example.com', name: 'Team Member 1', role: 'admin' },
  { email: 'member2@example.com', name: 'Team Member 2', role: 'member' },
  // Add more as needed
];

async function addExistingGHLTeam() {
  console.log('Adding existing GHL team members...\n');

  for (const member of GHL_TEAM_MEMBERS) {
    try {
      console.log(`Processing ${member.email}...`);
      
      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: member.email }
      });

      if (!user) {
        // Create placeholder user
        user = await prisma.user.create({
          data: {
            email: member.email,
            name: member.name,
          }
        });
        console.log(`  ✓ Created user account`);
      } else {
        console.log(`  - User already exists`);
      }

      // Add to agency team
      try {
        await addToAgencyTeam(user.id, member.role as 'admin' | 'member');
        console.log(`  ✓ Added to agency team as ${member.role}`);
      } catch (error: any) {
        if (error.message?.includes('already')) {
          console.log(`  - Already in agency team`);
        } else {
          throw error;
        }
      }

      console.log(`✅ ${member.email} ready to sign in\n`);
    } catch (error) {
      console.error(`❌ Failed to process ${member.email}:`, error);
    }
  }

  console.log('\nDone! Team members can now sign in with Google using their email addresses.');
  await prisma.$disconnect();
}

// Run the script
addExistingGHLTeam().catch(console.error);