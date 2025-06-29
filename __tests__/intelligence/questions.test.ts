/**
 * Unit tests for Smart Intake Questions API
 * 
 * **Created**: June 29, 2025, 5:40 PM CST
 * **Last Updated**: June 29, 2025, 5:40 PM CST
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/intelligence/questions/route'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn()
}))

// Mock environment variable
process.env.SMART_INTAKE_ENABLED = 'true'

describe('/api/intelligence/questions', () => {
  const mockAuth = auth as jest.MockedFunction<typeof auth>
  
  beforeEach(() => {
    mockAuth.mockResolvedValue({
      user: { id: 'test-user', email: 'test@example.com' },
      expires: '2025-12-31'
    })
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.businessIntelligence.deleteMany({
      where: { businessName: { startsWith: 'Test' } }
    })
  })

  it('should return ≤ 3 questions when all key fields are present', async () => {
    // Create intelligence record with rich data
    const intelligence = await prisma.businessIntelligence.create({
      data: {
        businessName: 'Test Phoenix Landscaping',
        placeId: 'test-rich-data',
        gbpData: {
          name: 'locations/123456789',
          title: 'Test Phoenix Landscaping',
          phoneNumbers: {
            primaryPhone: '+1 602-555-0123'
          },
          regularHours: {
            periods: [
              { openDay: 'MONDAY', openTime: '08:00', closeDay: 'MONDAY', closeTime: '17:00' },
              { openDay: 'TUESDAY', openTime: '08:00', closeDay: 'TUESDAY', closeTime: '17:00' },
              { openDay: 'WEDNESDAY', openTime: '08:00', closeDay: 'WEDNESDAY', closeTime: '17:00' },
              { openDay: 'THURSDAY', openTime: '08:00', closeDay: 'THURSDAY', closeTime: '17:00' },
              { openDay: 'FRIDAY', openTime: '08:00', closeDay: 'FRIDAY', closeTime: '17:00' }
            ]
          },
          latlng: {
            latitude: 33.4484,
            longitude: -112.0740
          },
          serviceArea: {
            businessType: 'CUSTOMER_AND_BUSINESS_LOCATION',
            places: {
              placeInfos: [
                { placeName: 'Phoenix', placeType: 'LOCALITY' },
                { placeName: 'Scottsdale', placeType: 'LOCALITY' },
                { placeName: 'Tempe', placeType: 'LOCALITY' }
              ]
            }
          },
          websiteUri: 'https://testphoenixlandscaping.com',
          metadata: {
            establishedDate: { year: 2010 }
          },
          storefrontAddress: {
            addressLines: ['123 Main St'],
            locality: 'Phoenix',
            administrativeArea: 'AZ',
            postalCode: '85001'
          },
          profile: {
            description: 'Test Phoenix Landscaping has been serving the Valley since 2010 with professional lawn care and landscaping services.'
          }
        },
        dataScore: {
          total: 85,
          breakdown: {
            basic: 25,
            content: 20,
            visuals: 10,
            trust: 20,
            differentiation: 10
          }
        }
      }
    })

    // Create request
    const request = new NextRequest('http://localhost:3000/api/intelligence/questions', {
      method: 'POST',
      body: JSON.stringify({
        intelligenceId: intelligence.id,
        industry: 'landscaping',
        dataScore: intelligence.dataScore,
        missingData: ['services']
      })
    })

    // Call API
    const response = await POST(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.questions).toBeDefined()
    expect(data.questions.length).toBeLessThanOrEqual(3)
    expect(data.totalQuestions).toBeLessThanOrEqual(3)
    
    // Verify specific questions are suppressed
    const questionIds = data.questions.map((q: any) => q.id)
    expect(questionIds).not.toContain('service-radius') // Should be calculated from serviceArea
    expect(questionIds).not.toContain('business-stage') // Should be extracted from establishedDate
  })

  it('should return more questions when data is sparse', async () => {
    // Create intelligence record with minimal data
    const intelligence = await prisma.businessIntelligence.create({
      data: {
        businessName: 'Test Basic Business',
        placeId: 'test-sparse-data',
        gbpData: {
          name: 'locations/987654321',
          title: 'Test Basic Business'
        },
        dataScore: {
          total: 20,
          breakdown: {
            basic: 10,
            content: 5,
            visuals: 0,
            trust: 5,
            differentiation: 0
          }
        }
      }
    })

    // Create request
    const request = new NextRequest('http://localhost:3000/api/intelligence/questions', {
      method: 'POST',
      body: JSON.stringify({
        intelligenceId: intelligence.id,
        industry: 'general',
        dataScore: intelligence.dataScore,
        missingData: ['services', 'differentiators']
      })
    })

    // Call API
    const response = await POST(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.questions).toBeDefined()
    expect(data.questions.length).toBeGreaterThan(3)
    expect(data.questions.length).toBeLessThanOrEqual(5) // Max 5 questions
  })
})
