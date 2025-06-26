import { prisma } from '../lib/prisma';
import { addToAgencyTeam } from '../lib/teams';
import { ensureUserInGHL } from '../lib/ghl-user-sync';

async function addAgencyMember() {
  const email = process.argv[2];
  const name = process.argv[3];
  const role = process.argv[4] as 'admin' | 'member';
  
  if (!email || !name || !role) {
    console.error('Usage: npm run add-agency-member <email> "<name>" <role>');
    console.error('Roles: admin or member');
    console.error('Example: npm run add-agency-member john@gmail.com "John Smith" admin');
    process.exit(1);
  }
  
  if (role !== 'admin' && role !== 'member') {
    console.error('Role must be either "admin" or "member"');
    process.exit(1);
  }
  
  try {
    console.log('🔍 Checking if user exists...');
    
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // Create user if they don't exist
      console.log('📝 Creating new user...');
      user = await prisma.user.create({
        data: {
          email,
          name,
          // No password needed - they'll use Google Sign-In
        }
      });
      console.log('✅ User created');
    } else {
      console.log('✅ User already exists');
      
      // Update name if it's different
      if (user.name !== name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name }
        });
        console.log('📝 Updated user name');
      }
    }
    
    // Check if already in agency team
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        team: { type: 'agency' }
      }
    });
    
    if (existingMembership) {
      console.log(`ℹ️  Already in agency team as ${existingMembership.role}`);
      
      // Update role if different
      if (existingMembership.role !== role && existingMembership.role !== 'owner') {
        await prisma.teamMember.update({
          where: { id: existingMembership.id },
          data: { role }
        });
        console.log(`✅ Updated role to ${role}`);
      }
    } else {
      // Add to agency team
      console.log('👥 Adding to agency team...');
      await addToAgencyTeam(user.id, role);
      console.log(`✅ Added to agency team as ${role}`);
    }
    
    // Ensure user exists in GHL
    console.log('🔄 Syncing with GoHighLevel...');
    try {
      await ensureUserInGHL(user.id);
      console.log('✅ User synced with GoHighLevel');
    } catch (error) {
      console.warn('⚠️  Failed to sync with GHL:', error);
      console.log('   They can still use the app, but may need manual GHL setup');
    }
    
    console.log('\n✨ Done! Next steps:');
    console.log(`1. ${name} can now sign in with Google using: ${email}`);
    console.log(`2. They have ${role} access to the agency`);
    console.log('3. They can manage businesses based on their role');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addAgencyMember();
