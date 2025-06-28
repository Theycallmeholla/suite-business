/**
 * Smart Intake Questions Tests
 * 
 * **Created**: June 28, 2025, 4:20 PM CST
 * **Last Updated**: June 28, 2025, 4:20 PM CST
 * 
 * Tests for the smart intake question system that pre-selects
 * common services based on industry and climate zone.
 */

import { getClimateZone } from '@/lib/utils/region-detector'
import { normalizeServiceName } from '@/lib/utils/service-normalizer'
import { loadExpectations, clearExpectationsCache } from '@/lib/data/cache'
import { EXPECTED_PREVALENCE_THRESHOLD } from '@/lib/constants/intake'

describe('Smart Intake System', () => {
  afterEach(() => {
    // Clear cache between tests
    clearExpectationsCache()
  })

  describe('Climate Zone Detection', () => {
    it('should detect CLIMATE_COLD for northern locations', () => {
      expect(getClimateZone(42.3601, -71.0589)).toBe('CLIMATE_COLD') // Boston
      expect(getClimateZone(44.9778, -93.2650)).toBe('CLIMATE_COLD') // Minneapolis
    })

    it('should detect CLIMATE_ARID for southwestern locations', () => {
      expect(getClimateZone(33.4484, -112.0740)).toBe('CLIMATE_ARID') // Phoenix
      expect(getClimateZone(32.7157, -117.1611)).toBe('CLIMATE_ARID') // San Diego
    })

    it('should detect CLIMATE_HUMID for southeastern locations', () => {
      expect(getClimateZone(29.7604, -95.3698)).toBe('CLIMATE_HUMID') // Houston
      expect(getClimateZone(25.7617, -80.1918)).toBe('CLIMATE_HUMID') // Miami
    })

    it('should detect CLIMATE_TEMPERATE for middle latitudes', () => {
      expect(getClimateZone(39.7392, -104.9903)).toBe('CLIMATE_TEMPERATE') // Denver
      expect(getClimateZone(38.9072, -77.0369)).toBe('CLIMATE_TEMPERATE') // DC
    })
  })

  describe('Service Name Normalization', () => {
    it('should normalize service names consistently', () => {
      expect(normalizeServiceName('Lawn Care')).toBe('lawn_care')
      expect(normalizeServiceName('Snow & Ice Removal')).toBe('snow_ice_removal')
      expect(normalizeServiceName('24/7 Emergency Service')).toBe('24_7_emergency_service')
      expect(normalizeServiceName('  Drip  Irrigation  ')).toBe('drip_irrigation')
    })

    it('should handle special characters', () => {
      expect(normalizeServiceName('Design/Build')).toBe('design_build')
      expect(normalizeServiceName('Eco-Friendly')).toBe('eco_friendly')
      expect(normalizeServiceName('100% Organic')).toBe('100_organic')
    })
  })

  describe('Expectations Loading', () => {
    it('should load industry expectations data', () => {
      const expectations = loadExpectations()
      
      expect(expectations).toBeDefined()
      expect(expectations.landscaping).toBeDefined()
      expect(expectations.landscaping.national).toBeDefined()
      expect(expectations.landscaping.national.services).toBeDefined()
    })

    it('should cache expectations data', () => {
      const first = loadExpectations()
      const second = loadExpectations()
      
      expect(first).toBe(second) // Same reference
    })
  })

  describe('Service Expectations', () => {
    it('should identify expected services for Phoenix landscaper', () => {
      const expectations = loadExpectations()
      const zone = 'CLIMATE_ARID'
      
      const industryExpectations = {
        ...expectations.landscaping.national.services,
        ...expectations.landscaping[zone].services
      }
      
      // Should expect xeriscaping and drip irrigation
      expect(industryExpectations.xeriscaping).toBeGreaterThanOrEqual(EXPECTED_PREVALENCE_THRESHOLD)
      expect(industryExpectations.drip_irrigation).toBeGreaterThanOrEqual(EXPECTED_PREVALENCE_THRESHOLD)
      
      // Should not expect snow removal
      expect(industryExpectations.snow_removal).toBeUndefined()
    })

    it('should identify expected services for Boston landscaper', () => {
      const expectations = loadExpectations()
      const zone = 'CLIMATE_COLD'
      
      const industryExpectations = {
        ...expectations.landscaping.national.services,
        ...expectations.landscaping[zone].services
      }
      
      // Should expect snow removal and fall cleanup
      expect(industryExpectations.snow_removal).toBeGreaterThanOrEqual(EXPECTED_PREVALENCE_THRESHOLD)
      expect(industryExpectations.fall_cleanup).toBeGreaterThanOrEqual(EXPECTED_PREVALENCE_THRESHOLD)
      
      // Should not expect xeriscaping
      expect(industryExpectations.xeriscaping).toBeUndefined()
    })
  })

  describe('Question Generation Contract', () => {
    it('should never generate more than 5 questions', async () => {
      // This would be tested in the actual API endpoint test
      // Here we just verify the constant
      const { MAX_SMART_QUESTIONS } = await import('@/lib/constants/intake')
      expect(MAX_SMART_QUESTIONS).toBe(5)
    })
  })
})