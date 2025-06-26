import { prisma } from '../lib/prisma';
import { addToAgencyTeam } from '../lib/teams';

async function addUserToAgencyTeam() {
  const email = process.argv[2];
  const role = process.argv[3] as 'admin' | 'member';
  
  if (!email || !role) {
    console.error('Usage: npm run add-to-agency <email> <role>');
    console.error('Roles: admin, member');
    process.exit(1);
  }
  
  if (role !== 'admin' && role !== 'member') {
    console.error('Role must be either "admin" or "member"');
    process.exit(1);
  }
  
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.error(`❌ User with email ${email} not found.`);
      console.error('They need to sign in to the app first.');
      process.exit(1);
    }
    
    // Check if already in team
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        team: { type: 'agency' }
      }
    });
    
    if (existingMembership) {
      console.log(`⚠️  ${email} is already in the agency team with role: ${existingMembership.role}`);
      process.exit(0);
    }
    
    // Add to agency team
    await addToAgencyTeam(user.id, role);
    
    console.log(`✅ Successfully added ${user.name || email} to agency team as ${role}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addUserToAgencyTeam();