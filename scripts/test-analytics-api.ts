import { prisma } from '../lib/prisma';
import { startOfDay, subDays, format, eachDayOfInterval } from 'date-fns';

async function generateMockAnalytics() {
  console.log('Generating mock analytics data...');
  
  // Get a test site
  const site = await prisma.site.findFirst({
    select: { id: true, businessName: true },
  });

  if (!site) {
    console.error('No sites found. Please create a site first.');
    return;
  }

  console.log(`Generating analytics for site: ${site.businessName}`);

  // Generate data for the last 90 days
  const endDate = new Date();
  const startDate = subDays(endDate, 90);
  const dates = eachDayOfInterval({ start: startDate, end: endDate });

  // Clear existing analytics for this site
  await prisma.siteAnalytics.deleteMany({
    where: { siteId: site.id },
  });

  // Generate analytics for each day
  for (const date of dates) {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Generate realistic traffic patterns
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Base traffic with some randomization
    const baseViews = isWeekend ? 800 : 1200;
    const views = Math.floor(baseViews + (Math.random() - 0.5) * 400);
    const leads = Math.floor(views * 0.03 + Math.random() * 5); // ~3% conversion to leads
    const conversions = Math.floor(leads * 0.2 + Math.random() * 2); // ~20% lead to conversion
    
    const bounceRate = 35 + Math.random() * 20; // 35-55% bounce rate
    const avgSession = 180 + Math.floor(Math.random() * 120); // 3-5 minutes
    
    const topPages = [
      { page: 'Home', views: Math.floor(views * 0.4) },
      { page: 'Services', views: Math.floor(views * 0.25) },
      { page: 'Contact', views: Math.floor(views * 0.15) },
      { page: 'About', views: Math.floor(views * 0.12) },
      { page: 'Blog', views: Math.floor(views * 0.08) },
    ];
    
    const sources = {
      'Google': Math.floor(views * 0.65),
      'Direct': Math.floor(views * 0.18),
      'Facebook': Math.floor(views * 0.09),
      'Twitter': Math.floor(views * 0.05),
      'LinkedIn': Math.floor(views * 0.03),
    };

    await prisma.siteAnalytics.create({
      data: {
        siteId: site.id,
        date: dateStr,
        views,
        leads,
        conversions,
        bounceRate,
        avgSession,
        topPages,
        sources,
      },
    });
  }

  console.log(`Generated analytics data for ${dates.length} days`);
}

async function testAnalyticsAPI() {
  try {
    // First generate some mock data
    await generateMockAnalytics();

    // Get a user to test with
    const user = await prisma.user.findFirst({
      select: { id: true, email: true },
    });

    if (!user) {
      console.error('No users found. Please create a user first.');
      return;
    }

    console.log(`\nTesting API endpoints for user: ${user.email}`);

    // Test different date ranges
    const dateRanges = ['7d', '30d', '90d'];
    
    for (const dateRange of dateRanges) {
      console.log(`\nTesting ${dateRange} date range...`);
      
      // This is just to show what the API would return
      const site = await prisma.site.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { team: { members: { some: { userId: user.id } } } },
          ],
        },
      });

      if (site) {
        const analytics = await prisma.siteAnalytics.findMany({
          where: {
            siteId: site.id,
            date: {
              gte: format(subDays(new Date(), dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90), 'yyyy-MM-dd'),
            },
          },
          orderBy: { date: 'desc' },
          take: 5,
        });

        console.log(`Found ${analytics.length} analytics records`);
        if (analytics.length > 0) {
          const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
          const totalLeads = analytics.reduce((sum, a) => sum + a.leads, 0);
          console.log(`Total views: ${totalViews}, Total leads: ${totalLeads}`);
        }
      }
    }

    console.log('\n✅ Analytics data generated successfully!');
    console.log('\nYou can now test the API endpoint at:');
    console.log('GET /api/analytics/detailed?dateRange=30d');
    console.log('GET /api/analytics/detailed?dateRange=7d&siteId={siteId}');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAnalyticsAPI();