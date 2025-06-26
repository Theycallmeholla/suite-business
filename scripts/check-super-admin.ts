import { PrismaClient } from '@prisma/client';
import { addToAgencyTeam } from '../lib/teams';

const prisma = new PrismaClient();

async function checkAndAddSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  
  if (!email) {
    console.log('No SUPER_ADMIN_EMAIL configured');
    return;
  }
  
  console.log(`Checking for user with email: ${email}`);
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      teamMembers: {
        include: {
          team: true
        }
      }
    }
  });
  
  if (!user) {
    console.log('User not found. They need to sign in first.');
    return;
  }
  
  console.log(`Found user: ${user.id} - ${user.name}`);
  console.log(`Current teams: ${user.teamMembers.length}`);
  
  const isInAgencyTeam = user.teamMembers.some(m => m.team.type === 'agency');
  
  if (isInAgencyTeam) {
    console.log('User is already in agency team');
    const agencyMembership = user.teamMembers.find(m => m.team.type === 'agency');
    console.log(`Role: ${agencyMembership?.role}`);
  } else {
    console.log('Adding user to agency team as owner...');
    await addToAgencyTeam(user.id, 'owner');
    console.log('✅ User added to agency team!');
  }
  
  await prisma.$disconnect();
}

checkAndAddSuperAdmin().catch(console.error);