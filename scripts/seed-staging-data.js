// Seed staging database with test scenarios for Phoenix, Boston, and Houston
// Created: December 29, 2024

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedStagingData() {
  console.log('🌱 Starting to seed staging data...');

  try {
    // Clean up existing test data
    await prisma.site.deleteMany({
      where: {
        subdomain: {
          in: ['phoenix-lawn-test', 'boston-snow-test', 'houston-hurricane-test']
        }
      }
    });

    // Create test user if doesn't exist
    let testUser = await prisma.user.findUnique({
      where: { email: 'test@sitebango.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@sitebango.com',
          name: 'Test User',
          subdomain: 'test-user',
        }
      });
    }

    // Create agency team if doesn't exist
    let agencyTeam = await prisma.team.findFirst({
      where: { type: 'agency' }
    });

    if (!agencyTeam) {
      agencyTeam = await prisma.team.create({
        data: {
          name: 'Sitebango Agency',
          type: 'agency',
          members: {
            create: {
              userId: testUser.id,
              role: 'owner'
            }
          }
        }
      });
    }

    // Create Phoenix Lawn Care test site
    const phoenixSite = await prisma.site.create({
      data: {
        name: 'Phoenix Premier Lawn Care',
        subdomain: 'phoenix-lawn-test',
        industry: 'landscaping',
        teamId: agencyTeam.id,
        userId: testUser.id,
        placeId: 'ChIJy3mhUO0SK4cRrBtKNfjHaYw', // Example Phoenix place ID
        city: 'Phoenix',
        state: 'AZ',
        content: {
          businessName: 'Phoenix Premier Lawn Care',
          tagline: 'Your Desert Landscaping Experts',
          description: 'Professional lawn care and landscaping services in Phoenix, AZ. Specializing in desert-friendly landscaping and xeriscaping.',
          phone: '(602) 555-0100',
          email: 'info@phoenixlawncare.test',
          address: '123 Desert View Dr, Phoenix, AZ 85001',
          hours: {
            monday: { open: '7:00 AM', close: '6:00 PM' },
            tuesday: { open: '7:00 AM', close: '6:00 PM' },
            wednesday: { open: '7:00 AM', close: '6:00 PM' },
            thursday: { open: '7:00 AM', close: '6:00 PM' },
            friday: { open: '7:00 AM', close: '6:00 PM' },
            saturday: { open: '8:00 AM', close: '4:00 PM' },
            sunday: { open: 'Closed', close: 'Closed' }
          },
          about: {
            headline: 'Phoenix\'s Leading Desert Landscaping Experts',
            description: 'With over 15 years of experience in desert landscaping, we understand the unique challenges of maintaining beautiful outdoor spaces in Arizona\'s climate.',
            whyChooseUs: [
              'Water-efficient irrigation systems',
              'Native plant specialists',
              'Heat-resistant turf installation',
              'Expert xeriscaping design'
            ]
          },
          services: [
            {
              name: 'Desert Landscaping',
              description: 'Custom desert landscape design with native plants',
              features: ['Drought-resistant plants', 'Rock gardens', 'Cactus arrangements']
            },
            {
              name: 'Xeriscaping',
              description: 'Water-efficient landscaping solutions',
              features: ['Drip irrigation', 'Mulching', 'Native ground covers']
            },
            {
              name: 'Artificial Turf Installation',
              description: 'High-quality synthetic grass for year-round green',
              features: ['Pet-friendly options', 'UV-resistant', 'Natural appearance']
            }
          ]
        },
        status: 'published'
      }
    });

    // Create Boston Snow Removal test site
    const bostonSite = await prisma.site.create({
      data: {
        name: 'Boston Snow Masters',
        subdomain: 'boston-snow-test',
        industry: 'landscaping',
        teamId: agencyTeam.id,
        userId: testUser.id,
        placeId: 'ChIJGzE9DS1l44kRoOhiASS_fHg', // Example Boston place ID
        city: 'Boston',
        state: 'MA',
        content: {
          businessName: 'Boston Snow Masters',
          tagline: 'Reliable Snow Removal & Winter Landscaping',
          description: 'Professional snow removal and winter landscaping services throughout Greater Boston. Available 24/7 during winter storms.',
          phone: '(617) 555-0200',
          email: 'info@bostonsnowmasters.test',
          address: '456 Winter St, Boston, MA 02108',
          hours: {
            monday: { open: '24/7 During Winter', close: '24/7 During Winter' },
            tuesday: { open: '24/7 During Winter', close: '24/7 During Winter' },
            wednesday: { open: '24/7 During Winter', close: '24/7 During Winter' },
            thursday: { open: '24/7 During Winter', close: '24/7 During Winter' },
            friday: { open: '24/7 During Winter', close: '24/7 During Winter' },
            saturday: { open: '24/7 During Winter', close: '24/7 During Winter' },
            sunday: { open: '24/7 During Winter', close: '24/7 During Winter' }
          },
          about: {
            headline: 'Boston\'s Most Trusted Snow Removal Service',
            description: 'When winter hits Boston hard, you need a reliable partner. We\'ve been keeping Boston properties safe and accessible for over 20 years.',
            whyChooseUs: [
              '24/7 emergency response',
              'Commercial & residential service',
              'Ice management specialists',
              'Season-long contracts available'
            ]
          },
          services: [
            {
              name: 'Snow Plowing',
              description: 'Commercial and residential snow plowing services',
              features: ['Parking lots', 'Driveways', 'Private roads', 'Emergency service']
            },
            {
              name: 'Ice Management',
              description: 'Professional de-icing and ice prevention',
              features: ['Rock salt application', 'Liquid de-icers', 'Sand spreading']
            },
            {
              name: 'Snow Removal & Hauling',
              description: 'Complete snow removal from your property',
              features: ['Loader service', 'Snow hauling', 'Roof snow removal']
            }
          ]
        },
        status: 'published'
      }
    });

    // Create Houston Hurricane Prep test site
    const houstonSite = await prisma.site.create({
      data: {
        name: 'Houston Storm Ready Landscaping',
        subdomain: 'houston-hurricane-test',
        industry: 'landscaping',
        teamId: agencyTeam.id,
        userId: testUser.id,
        placeId: 'ChIJAYWNSLS4QIYROwVl894CDco', // Example Houston place ID
        city: 'Houston',
        state: 'TX',
        content: {
          businessName: 'Houston Storm Ready Landscaping',
          tagline: 'Hurricane-Resistant Landscaping & Storm Cleanup',
          description: 'Specializing in storm-resistant landscaping design and emergency cleanup services for Houston homes and businesses.',
          phone: '(713) 555-0300',
          email: 'info@houstonstormready.test',
          address: '789 Gulf Breeze Blvd, Houston, TX 77001',
          hours: {
            monday: { open: '7:00 AM', close: '7:00 PM' },
            tuesday: { open: '7:00 AM', close: '7:00 PM' },
            wednesday: { open: '7:00 AM', close: '7:00 PM' },
            thursday: { open: '7:00 AM', close: '7:00 PM' },
            friday: { open: '7:00 AM', close: '7:00 PM' },
            saturday: { open: '8:00 AM', close: '5:00 PM' },
            sunday: { open: 'Emergency Only', close: 'Emergency Only' }
          },
          about: {
            headline: 'Protecting Houston Properties from Nature\'s Fury',
            description: 'Living in Houston means preparing for severe weather. Our landscaping solutions are designed to withstand hurricanes and tropical storms while maintaining beauty.',
            whyChooseUs: [
              'Wind-resistant tree pruning',
              'Flood-resistant landscaping',
              'Emergency storm cleanup',
              'Insurance claim assistance'
            ]
          },
          services: [
            {
              name: 'Hurricane-Resistant Landscaping',
              description: 'Landscape design that withstands severe weather',
              features: ['Wind-resistant plants', 'Proper drainage systems', 'Tree bracing']
            },
            {
              name: 'Storm Cleanup',
              description: '24/7 emergency storm damage cleanup',
              features: ['Debris removal', 'Tree removal', 'Property restoration']
            },
            {
              name: 'Flood Mitigation',
              description: 'Landscaping solutions to reduce flood risk',
              features: ['French drains', 'Rain gardens', 'Permeable surfaces']
            }
          ]
        },
        status: 'published'
      }
    });

    console.log('✅ Successfully seeded test data:');
    console.log(`   - Phoenix Lawn Care: https://phoenix-lawn-test.staging.sitebango.com`);
    console.log(`   - Boston Snow Masters: https://boston-snow-test.staging.sitebango.com`);
    console.log(`   - Houston Storm Ready: https://houston-hurricane-test.staging.sitebango.com`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedStagingData()
  .then(() => {
    console.log('🎉 Staging data seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed staging data:', error);
    process.exit(1);
  });