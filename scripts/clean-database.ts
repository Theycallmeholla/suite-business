import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Cleaning database...');
  
  try {
    // Delete in correct order to respect foreign keys
    await prisma.billingWebhook.deleteMany();
    console.log('✓ Deleted BillingWebhooks');
    
    await prisma.payment.deleteMany();
    console.log('✓ Deleted Payments');
    
    await prisma.subscription.deleteMany();
    console.log('✓ Deleted Subscriptions');
    
    await prisma.customer.deleteMany();
    console.log('✓ Deleted Customers');
    
    await prisma.formSubmission.deleteMany();
    console.log('✓ Deleted FormSubmissions');
    
    await prisma.form.deleteMany();
    console.log('✓ Deleted Forms');
    
    await prisma.seoTask.deleteMany();
    console.log('✓ Deleted SeoTasks');
    
    await prisma.blogPost.deleteMany();
    console.log('✓ Deleted BlogPosts');
    
    await prisma.service.deleteMany();
    console.log('✓ Deleted Services');
    
    await prisma.photo.deleteMany();
    console.log('✓ Deleted Photos');
    
    await prisma.page.deleteMany();
    console.log('✓ Deleted Pages');
    
    await prisma.site.deleteMany();
    console.log('✓ Deleted Sites');
    
    await prisma.notification.deleteMany();
    console.log('✓ Deleted Notifications');
    
    await prisma.businessIntelligence.deleteMany();
    console.log('✓ Deleted BusinessIntelligence');
    
    await prisma.teamMember.deleteMany();
    console.log('✓ Deleted TeamMembers');
    
    await prisma.team.deleteMany();
    console.log('✓ Deleted Teams');
    
    await prisma.session.deleteMany();
    console.log('✓ Deleted Sessions');
    
    await prisma.account.deleteMany();
    console.log('✓ Deleted Accounts');
    
    await prisma.user.deleteMany();
    console.log('✓ Deleted Users');
    
    console.log('\n✅ Database cleaned successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });