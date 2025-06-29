/**
 * Seed Test Scenarios for Smart Intake
 * 
 * **Created**: June 29, 2025, 12:45 PM CST
 * **Last Updated**: June 29, 2025, 12:50 PM CST
 * 
 * Seeds Phoenix, Boston, and Houston test businesses for testing smart intake
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedTestScenarios() {
  console.log('🌱 Seeding test scenarios for smart intake...')

  try {
    // Use existing user or find first user
    const testUserEmail = 'holliday@cursivemedia.com' // Use the super admin email from env
    let testUser = await prisma.user.findUnique({
      where: { email: testUserEmail }
    })

    if (!testUser) {
      // Find any existing user
      testUser = await prisma.user.findFirst()
      if (!testUser) {
        console.error('❌ No users found. Please create a user first by logging in.')
        process.exit(1)
      }
    }

    // Get or create agency team
    let agencyTeam = await prisma.team.findFirst({
      where: { type: 'agency' }
    })

    if (!agencyTeam) {
      agencyTeam = await prisma.team.create({
        data: {
          name: 'Test Agency',
          type: 'agency'
        }
      })
    }

    // Add test user to agency team if not already a member
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        teamId: agencyTeam.id,
        userId: testUser.id
      }
    })

    if (!existingMembership) {
      await prisma.teamMember.create({
        data: {
          teamId: agencyTeam.id,
          userId: testUser.id,
          role: 'admin'
        }
      })
    }

    // Test scenarios data
    const scenarios = [
      {
        subdomain: 'phoenix-landscaper',
        businessName: 'Desert Gardens LLC',
        industry: 'landscaping',
        intelligenceData: {
          placeId: 'test-phoenix-full',
          businessName: 'Desert Gardens LLC',
          gbpData: {
            name: 'Desert Gardens LLC',
            coordinates: { lat: 33.4484, lng: -112.0740 },
            primaryCategory: {
              serviceTypes: [
                { displayName: 'Lawn Care' },
                { displayName: 'Tree Trimming' }
              ]
            },
            serviceArea: {
              polygon: {
                coordinates: [
                  { latitude: 33.5484, longitude: -112.1740 },
                  { latitude: 33.5484, longitude: -111.9740 },
                  { latitude: 33.3484, longitude: -111.9740 },
                  { latitude: 33.3484, longitude: -112.1740 }
                ]
              }
            },
            metadata: {
              establishedDate: '2010'
            },
            phoneNumbers: {
              primaryPhone: '+1 (602) 555-0123'
            },
            websiteUri: 'https://desertgardens.com',
            regularHours: {
              periods: [
                { openDay: 'MONDAY', openTime: '08:00', closeDay: 'MONDAY', closeTime: '17:00' }
              ]
            }
          },
          dataScore: {
            total: 80,
            breakdown: {
              basic: 20,
              content: 15,
              visuals: 10,
              trust: 20,
              differentiation: 15
            }
          }
        }
      },
      {
        subdomain: 'boston-hvac',
        businessName: 'New England Heating & Cooling',
        industry: 'hvac',
        intelligenceData: {
          placeId: 'test-boston-partial',
          businessName: 'New England Heating & Cooling',
          gbpData: {
            name: 'New England Heating & Cooling',
            coordinates: { lat: 42.3601, lng: -71.0589 },
            primaryCategory: {
              serviceTypes: [
                { displayName: 'Heating Installation' },
                { displayName: 'AC Repair' }
              ]
            },
            phoneNumbers: {
              primaryPhone: '+1 (617) 555-0456'
            },
            description: 'Family-owned HVAC company serving Boston since 1985. We specialize in energy-efficient heating and cooling solutions.'
          },
          dataScore: {
            total: 60,
            breakdown: {
              basic: 15,
              content: 10,
              visuals: 5,
              trust: 15,
              differentiation: 15
            }
          }
        }
      },
      {
        subdomain: 'houston-plumber',
        businessName: 'Gulf Coast Plumbing',
        industry: 'plumbing',
        intelligenceData: {
          placeId: 'test-houston-minimal',
          businessName: 'Gulf Coast Plumbing',
          gbpData: {
            name: 'Gulf Coast Plumbing',
            coordinates: { lat: 29.7604, lng: -95.3698 },
            primaryCategory: {
              serviceTypes: [
                { displayName: 'Emergency Plumbing' }
              ]
            }
          },
          dataScore: {
            total: 30,
            breakdown: {
              basic: 10,
              content: 5,
              visuals: 0,
              trust: 10,
              differentiation: 5
            }
          }
        }
      }
    ]

    // Create sites and intelligence records
    for (const scenario of scenarios) {
      console.log(`\n📍 Processing ${scenario.businessName}...`)

      // Check if site exists
      let site = await prisma.site.findUnique({
        where: { subdomain: scenario.subdomain }
      })

      if (!site) {
        // Create site
        site = await prisma.site.create({
          data: {
            subdomain: scenario.subdomain,
            customDomain: null,
            businessName: scenario.businessName,
            address: '123 Test Street',
            phone: scenario.intelligenceData.gbpData.phoneNumbers?.primaryPhone || '555-0000',
            email: `info@${scenario.subdomain}.com`,
            industry: scenario.industry,
            template: 'modern',
            coordinates: scenario.intelligenceData.gbpData.coordinates,
            latitude: scenario.intelligenceData.gbpData.coordinates?.lat,
            longitude: scenario.intelligenceData.gbpData.coordinates?.lng,
            user: {
              connect: { id: testUser.id }
            },
            team: {
              connect: { id: agencyTeam.id }
            }
          }
        })
        console.log(`✅ Created site: ${scenario.subdomain}`)
      } else {
        console.log(`✓ Site already exists: ${scenario.subdomain}`)
      }

      // Check if intelligence record exists
      const existingIntelligence = await prisma.businessIntelligence.findUnique({
        where: { id: scenario.intelligenceData.placeId }
      })

      if (!existingIntelligence) {
        // Create intelligence record
        await prisma.businessIntelligence.create({
          data: {
            id: scenario.intelligenceData.placeId,
            placeId: scenario.intelligenceData.placeId,
            businessName: scenario.intelligenceData.businessName,
            gbpData: scenario.intelligenceData.gbpData,
            dataScore: scenario.intelligenceData.dataScore,
            userAnswers: {},
            generatedContent: {}
          }
        })
        console.log(`✅ Created intelligence record: ${scenario.intelligenceData.placeId}`)
      } else {
        // Update existing record
        await prisma.businessIntelligence.update({
          where: { id: scenario.intelligenceData.placeId },
          data: {
            gbpData: scenario.intelligenceData.gbpData,
            dataScore: scenario.intelligenceData.dataScore
          }
        })
        console.log(`✓ Updated intelligence record: ${scenario.intelligenceData.placeId}`)
      }
    }

    console.log('\n✨ Test scenarios seeded successfully!')
    console.log('\n🔗 Test URLs:')
    console.log('   Smart Intake Test Page: http://localhost:3001/dev/test-smart-wins')
    console.log('   Enhanced Onboarding Flow: http://localhost:3001/onboarding/enhance')
    console.log('\n📍 Test Scenarios Available:')
    console.log('   1. Phoenix Landscaper (Full Data) - Most questions suppressed')
    console.log('   2. Boston HVAC (Partial Data) - Some questions suppressed')
    console.log('   3. Houston Plumber (Minimal Data) - Few questions suppressed')
    console.log('\n   Select each scenario from the dropdown on the test page')

  } catch (error) {
    console.error('❌ Error seeding test scenarios:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed script
seedTestScenarios()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })