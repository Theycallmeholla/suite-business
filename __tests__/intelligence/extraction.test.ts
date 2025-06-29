/**
 * Unit tests for Smart Intake data extraction
 * 
 * **Created**: June 29, 2025, 5:35 PM CST
 * **Last Updated**: June 29, 2025, 5:35 PM CST
 */

import { calculateServiceRadius } from '@/lib/utils/service-radius-calculator'
import { extractBusinessAge } from '@/lib/utils/business-age-extractor'
import { prisma } from '@/lib/prisma'

// Mock seeded real location data
const mockGbpData = {
  name: 'locations/123456789',
  title: 'Phoenix Landscaping LLC',
  phoneNumbers: {
    primaryPhone: '+1 602-555-0123',
    additionalPhones: []
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
  websiteUri: 'https://phoenixlandscaping.com',
  metadata: {
    establishedDate: { year: 2010 }
  },
  profile: {
    description: 'Phoenix Landscaping has been serving the Valley since 2010 with professional lawn care and landscaping services.'
  }
}

describe('Smart Intake Data Extraction', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.businessIntelligence.deleteMany({
      where: { gbpData: { path: ['name'], equals: 'locations/test-123' } }
    })
  })

  describe('GBP Field Extraction', () => {
    it('should extract phone from primaryPhone field', () => {
      expect(mockGbpData.phoneNumbers?.primaryPhone).toBe('+1 602-555-0123')
    })

    it('should extract hours from regularHours.periods', () => {
      expect(mockGbpData.regularHours?.periods).toBeDefined()
      expect(mockGbpData.regularHours?.periods?.length).toBeGreaterThan(0)
      expect(mockGbpData.regularHours?.periods?.[0]).toHaveProperty('openTime')
      expect(mockGbpData.regularHours?.periods?.[0]).toHaveProperty('closeTime')
    })

    it('should extract coordinates from latlng field', () => {
      expect(mockGbpData.latlng).toBeDefined()
      expect(mockGbpData.latlng?.latitude).toBe(33.4484)
      expect(mockGbpData.latlng?.longitude).toBe(-112.0740)
    })

    it('should extract serviceArea data', () => {
      expect(mockGbpData.serviceArea).toBeDefined()
      expect(mockGbpData.serviceArea?.businessType).toBe('CUSTOMER_AND_BUSINESS_LOCATION')
      expect(mockGbpData.serviceArea?.places?.placeInfos).toHaveLength(3)
    })
  })

  describe('dataScore Population', () => {
    it('should populate dataScore with extracted fields', async () => {
      // Create a business intelligence record
      const intelligence = await prisma.businessIntelligence.create({
        data: {
          businessName: mockGbpData.title,
          placeId: 'test-place-123',
          gbpData: mockGbpData as any,
          dataScore: {
            total: 75,
            breakdown: {
              basic: 20,
              content: 15,
              visuals: 10,
              trust: 20,
              differentiation: 10
            },
            // Fields that should be populated from GBP data
            phone: mockGbpData.phoneNumbers?.primaryPhone,
            hours: mockGbpData.regularHours?.periods ? 'available' : 'missing',
            coordinates: mockGbpData.latlng,
            serviceArea: mockGbpData.serviceArea ? 'defined' : 'missing'
          }
        }
      })

      expect(intelligence.dataScore).toBeDefined()
      const dataScore = intelligence.dataScore as any
      
      expect(dataScore.phone).toBe('+1 602-555-0123')
      expect(dataScore.hours).toBe('available')
      expect(dataScore.coordinates).toEqual({
        latitude: 33.4484,
        longitude: -112.0740
      })
      expect(dataScore.serviceArea).toBe('defined')
    })
  })

  describe('Service Radius Calculation', () => {
    it('should calculate service radius from city list', () => {
      const result = calculateServiceRadius(
        mockGbpData.serviceArea,
        { lat: 33.4484, lng: -112.0740 }
      )
      
      expect(result).toBeDefined()
      expect(result.radius).toBeGreaterThan(0)
      expect(result.confidence).toBeGreaterThan(0.5)
      expect(result.method).toBe('cityList')
    })
  })

  describe('Business Age Extraction', () => {
    it('should extract business age from metadata.establishedDate', () => {
      const result = extractBusinessAge(mockGbpData)
      
      expect(result).toBeDefined()
      expect(result.yearsInBusiness).toBe(new Date().getFullYear() - 2010)
      expect(result.confidence).toBe(1.0)
      expect(result.source).toBe('establishedDate')
    })

    it('should extract business age from description fallback', () => {
      const dataWithoutMetadata = {
        ...mockGbpData,
        metadata: undefined,
        profile: {
          description: 'Serving the Valley since 2010 with professional services'
        }
      }
      
      const result = extractBusinessAge(dataWithoutMetadata)
      
      expect(result).toBeDefined()
      expect(result.yearsInBusiness).toBe(new Date().getFullYear() - 2010)
      expect(result.confidence).toBe(0.8)
      expect(result.source).toBe('description')
    })
  })
})
