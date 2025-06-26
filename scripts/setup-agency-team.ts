import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger';

const prisma = new PrismaClient();

async function setupAgencyTeam() {
  try {
    logger.info('Setting up agency team structure...');
    
    // Create or update agency team
    const agencyTeam = await prisma.team.upsert({
      where: { 
        ghlCompanyId: process.env.GHL_AGENCY_ID 
      },
      update: {
        name: 'Agency Team',
      },
      create: {
        name: 'Agency Team',
        type: 'agency',
        ghlCompanyId: process.env.GHL_AGENCY_ID,
      }
    });
    
    logger.info('Agency team created/updated', { teamId: agencyTeam.id });
    
    // Get the super admin email from env
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    
    if (superAdminEmail) {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email: superAdminEmail }
      });
      
      if (user) {
        // Add as owner of agency team
        await prisma.teamMember.upsert({
          where: {
            userId_teamId: {
              userId: user.id,
              teamId: agencyTeam.id
            }
          },
          update: {
            role: 'owner'
          },
          create: {
            userId: user.id,
            teamId: agencyTeam.id,
            role: 'owner'
          }
        });
        
        logger.info('Super admin added to agency team', { 
          email: superAdminEmail,
          userId: user.id 
        });
      } else {
        logger.warn('Super admin user not found. They will be added on first login.', {
          email: superAdminEmail
        });
      }
    }
    
    logger.info('Agency team setup complete!');
    
    // Show current team structure
    const teamMembers = await prisma.teamMember.findMany({
      where: { teamId: agencyTeam.id },
      include: { user: true }
    });
    
    console.log('\nCurrent Agency Team:');
    console.log('===================');
    teamMembers.forEach(member => {
      console.log(`- ${member.user.email} (${member.role})`);
    });
    
  } catch (error) {
    logger.error('Failed to setup agency team', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupAgencyTeam()
  .then(() => {
    console.log('\n✅ Agency team setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });