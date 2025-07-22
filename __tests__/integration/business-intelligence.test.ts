/**
 * Business Intelligence Pipeline Integration Test
 * Tests the integration of GBP, Places API, and DataForSEO data collection
 */

// Mock dependencies before imports
jest.mock('@/lib/dataforseo');
jest.mock('@/lib/logger');
jest.mock('openai');

import { DataForSEO } from '@/lib/dataforseo';
import { logger } from '@/lib/logger';
import { BusinessIntelligenceExtractor } from '@/lib/business-intelligence-extractor';
import OpenAI from 'openai';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Business Intelligence Pipeline - DataForSEO Integration', () => {
  let extractor: BusinessIntelligenceExtractor;
  
  // Mock data
  const mockGBPData = {
    name: 'Sunset Landscaping',
    categories: ['Landscaping contractor', 'Lawn care service'],
    primaryPhone: '+1-555-0123',
    website: 'https://sunsetlandscaping.com',
    address: {
      locality: 'Austin',
      administrativeArea: 'TX',
      postalCode: '78701',
      addressLines: ['123 Main St']
    },
    regularHours: {
      periods: [
        { openDay: 'MONDAY', openTime: '08:00', closeDay: 'MONDAY', closeTime: '17:00' }
      ]
    },
    photos: [
      { name: 'photos/123', photoUri: 'https://example.com/photo1.jpg' }
    ],
    reviews: [
      { reviewer: { displayName: 'John Doe' }, comment: 'Great service!', starRating: 'FIVE' }
    ]
  };

  const mockPlacesData = {
    id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    displayName: { text: 'Sunset Landscaping' },
    primaryType: 'landscaping_service',
    nationalPhoneNumber: '+1 555-0123',
    websiteUri: 'https://sunsetlandscaping.com',
    formattedAddress: '123 Main St, Austin, TX 78701',
    location: {
      latitude: 30.2672,
      longitude: -97.7431
    },
    regularOpeningHours: {
      periods: [
        { 
          open: { day: 1, hour: 8, minute: 0 },
          close: { day: 1, hour: 17, minute: 0 }
        }
      ]
    },
    photos: [
      { name: 'places/123/photos/456' }
    ],
    reviews: [
      {
        name: 'places/123/reviews/456',
        text: { text: 'Excellent landscaping work!' },
        rating: 5,
        authorAttribution: { displayName: 'Jane Smith' }
      }
    ]
  };

  const mockSERPData = {
    items: [
      {
        url: 'https://sunsetlandscaping.com',
        title: 'Sunset Landscaping - Professional Lawn Care',
        description: 'Leading landscaping services in Austin',
        breadcrumb: 'sunsetlandscaping.com',
        links: {
          deeplinks: [
            { href: 'https://facebook.com/sunsetlandscaping' },
            { href: 'https://instagram.com/sunsetlandscaping' }
          ]
        }
      }
    ]
  };

  const mockEnhancedData = {
    title: 'Sunset Landscaping',
    description: 'Professional landscaping and lawn care services',
    category: 'Landscaping Service',
    address: '123 Main St, Austin, TX 78701',
    phone: '+1 555-0123',
    work_hours: {
      monday: { open: '08:00', close: '17:00' }
    },
    rating: { rating_max: 5, value: 4.8, votes_count: 127 },
    social_media: {
      facebook: 'https://facebook.com/sunsetlandscaping',
      instagram: 'https://instagram.com/sunsetlandscaping'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock OpenAI
    const mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  suggestedColors: { primary: '#2C5530', secondary: '#8FBC8F' },
                  suggestedContent: { tagline: 'Professional Landscaping Services' },
                  questionsForUser: ['What services are most important to highlight?']
                })
              }
            }]
          })
        }
      }
    };
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAI as any);
    
    // Set up environment variable for OpenAI
    process.env.OPENAI_API_KEY = 'test-api-key';
    
    extractor = new BusinessIntelligenceExtractor();
    
    // Setup default mocks
    (DataForSEO.searchBusiness as jest.Mock).mockResolvedValue(mockSERPData);
    (DataForSEO.getBusinessDataFromGoogle as jest.Mock).mockResolvedValue(mockEnhancedData);
    (DataForSEO.getGoogleReviews as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.OPENAI_API_KEY;
  });

  describe('GBP Data Collection', () => {
    it('should extract business intelligence from GBP data', async () => {
      const result = await extractor.extractBusinessIntelligence({
        name: mockGBPData.name,
        address: '123 Main St, Austin, TX 78701',
        phone: mockGBPData.primaryPhone,
        website: mockGBPData.website,
        gbpData: mockGBPData
      });

      expect(result).toBeDefined();
      expect(result.businessInfo.name).toBe('Sunset Landscaping');
      expect(result.businessInfo.categories).toContain('Landscaping contractor');
      expect(result.businessInfo.phone).toBe('+1-555-0123');
      expect(result.businessInfo.website).toBe('https://sunsetlandscaping.com');
      
      // Verify DataForSEO was called for additional data
      expect(DataForSEO.searchBusiness).toHaveBeenCalledWith('Sunset Landscaping Austin TX');
      expect(DataForSEO.getBusinessDataFromGoogle).toHaveBeenCalled();
    });

    it('should handle GBP data with photos and reviews', async () => {
      const result = await extractor.extractBusinessIntelligence({
        name: mockGBPData.name,
        address: '123 Main St, Austin, TX 78701',
        gbpData: mockGBPData
      });

      expect(result.media.photos).toHaveLength(1);
      expect(result.media.photos[0]).toBe('https://example.com/photo1.jpg');
      expect(result.reviews).toHaveLength(1);
      expect(result.reviews[0].reviewer).toBe('John Doe');
      expect(result.reviews[0].rating).toBe(5);
    });
  });

  describe('Places API Data Collection', () => {
    it('should extract business intelligence from Places API data', async () => {
      const result = await extractor.extractBusinessIntelligence({
        name: mockPlacesData.displayName.text,
        address: mockPlacesData.formattedAddress,
        phone: mockPlacesData.nationalPhoneNumber,
        website: mockPlacesData.websiteUri,
        placeId: mockPlacesData.id,
        placesData: mockPlacesData
      });

      expect(result).toBeDefined();
      expect(result.businessInfo.name).toBe('Sunset Landscaping');
      expect(result.businessInfo.primaryType).toBe('landscaping_service');
      expect(result.businessInfo.phone).toBe('+1 555-0123');
      expect(result.businessInfo.website).toBe('https://sunsetlandscaping.com');
      expect(result.businessInfo.location).toEqual({
        latitude: 30.2672,
        longitude: -97.7431
      });
      
      // Verify DataForSEO was called with place ID
      expect(DataForSEO.getGoogleReviews).toHaveBeenCalledWith('ChIJN1t_tDeuEmsRUsoyG83frY4');
    });

    it('should handle Places API hours and reviews', async () => {
      const result = await extractor.extractBusinessIntelligence({
        name: mockPlacesData.displayName.text,
        address: mockPlacesData.formattedAddress,
        placeId: mockPlacesData.id,
        placesData: mockPlacesData
      });

      expect(result.businessInfo.regularOpeningHours).toBeDefined();
      expect(result.businessInfo.regularOpeningHours.periods).toHaveLength(1);
      expect(result.reviews).toHaveLength(1);
      expect(result.reviews[0].reviewer).toBe('Jane Smith');
      expect(result.reviews[0].rating).toBe(5);
      expect(result.reviews[0].text).toBe('Excellent landscaping work!');
    });
  });

  describe('DataForSEO Integration', () => {
    it('should collect SERP data for business', async () => {
      const result = await extractor.extractBusinessIntelligence({
        name: 'Sunset Landscaping',
        address: 'Austin, TX'
      });

      expect(DataForSEO.searchBusiness).toHaveBeenCalledWith('Sunset Landscaping Austin TX');
      expect(result.serpData).toBeDefined();
      expect(result.serpData.items).toHaveLength(1);
      expect(result.serpData.items[0].url).toBe('https://sunsetlandscaping.com');
      expect(result.serpData.items[0].title).toContain('Sunset Landscaping');
    });

    it('should extract social media links from SERP data', async () => {
      const result = await extractor.extractBusinessIntelligence({
        name: 'Sunset Landscaping',
        address: 'Austin, TX'
      });

      expect(result.socialMedia).toBeDefined();
      expect(result.socialMedia.facebook).toBe('https://facebook.com/sunsetlandscaping');
      expect(result.socialMedia.instagram).toBe('https://instagram.com/sunsetlandscaping');
    });

    it('should collect enhanced business data from Google', async () => {
      const result = await extractor.extractBusinessIntelligence({
        name: 'Sunset Landscaping',
        address: 'Austin, TX'
      });

      expect(DataForSEO.getBusinessDataFromGoogle).toHaveBeenCalled();
      expect(result.enhancedData).toBeDefined();
      expect(result.enhancedData.rating.value).toBe(4.8);
      expect(result.enhancedData.rating.votes_count).toBe(127);
      expect(result.enhancedData.work_hours.monday).toEqual({
        open: '08:00',
        close: '17:00'
      });
    });

    it('should handle Google reviews from DataForSEO', async () => {
      const mockReviews = [
        {
          author_title: 'Mike Johnson',
          text: 'Professional service, highly recommend!',
          rating: { rating_max: 5, value: 5 },
          timestamp: '2024-01-15'
        }
      ];
      
      (DataForSEO.getGoogleReviews as jest.Mock).mockResolvedValueOnce(mockReviews);
      
      const result = await extractor.extractBusinessIntelligence({
        name: 'Sunset Landscaping',
        address: 'Austin, TX',
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
      });

      expect(DataForSEO.getGoogleReviews).toHaveBeenCalledWith('ChIJN1t_tDeuEmsRUsoyG83frY4');
      expect(result.dataforseoReviews).toBeDefined();
      expect(result.dataforseoReviews).toHaveLength(1);
      expect(result.dataforseoReviews[0].author_title).toBe('Mike Johnson');
    });
  });

  describe('Combined Data Collection', () => {
    it('should combine GBP data with SERP and enhanced data', async () => {
      const result = await extractor.extractBusinessIntelligence({
        name: mockGBPData.name,
        address: '123 Main St, Austin, TX 78701',
        phone: mockGBPData.primaryPhone,
        website: mockGBPData.website,
        gbpData: mockGBPData
      });

      // Should have data from all sources
      expect(result.businessInfo).toBeDefined(); // GBP data
      expect(result.serpData).toBeDefined(); // SERP data
      expect(result.enhancedData).toBeDefined(); // Enhanced Google data
      expect(result.socialMedia).toBeDefined(); // Social media from SERP
      
      // Verify all APIs were called
      expect(DataForSEO.searchBusiness).toHaveBeenCalled();
      expect(DataForSEO.getBusinessDataFromGoogle).toHaveBeenCalled();
    });

    it('should combine Places API data with SERP and enhanced data', async () => {
      const result = await extractor.extractBusinessIntelligence({
        name: mockPlacesData.displayName.text,
        address: mockPlacesData.formattedAddress,
        placeId: mockPlacesData.id,
        placesData: mockPlacesData
      });

      // Should have data from all sources
      expect(result.businessInfo).toBeDefined(); // Places data
      expect(result.serpData).toBeDefined(); // SERP data
      expect(result.enhancedData).toBeDefined(); // Enhanced Google data
      expect(result.dataforseoReviews).toBeDefined(); // Reviews from DataForSEO
      
      // Verify all APIs were called including reviews
      expect(DataForSEO.searchBusiness).toHaveBeenCalled();
      expect(DataForSEO.getBusinessDataFromGoogle).toHaveBeenCalled();
      expect(DataForSEO.getGoogleReviews).toHaveBeenCalledWith(mockPlacesData.id);
    });

    it('should prioritize GBP data over Places data when both are available', async () => {
      const result = await extractor.extractBusinessIntelligence({
        name: 'Test Business',
        address: 'Test Address',
        gbpData: mockGBPData,
        placesData: mockPlacesData
      });

      // Should use GBP data as primary source
      expect(result.businessInfo.name).toBe(mockGBPData.name);
      expect(result.businessInfo.categories).toBeDefined(); // GBP has categories
      expect(result.businessInfo.primaryType).toBeUndefined(); // Places has primaryType
    });
  });

  describe('Error Handling', () => {
    it('should handle DataForSEO API failures gracefully', async () => {
      // Mock API failures
      (DataForSEO.searchBusiness as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      (DataForSEO.getBusinessDataFromGoogle as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      const result = await extractor.extractBusinessIntelligence({
        name: 'Test Business',
        address: 'Test Address'
      });

      // Should still return result without SERP data
      expect(result).toBeDefined();
      expect(result.businessInfo.name).toBe('Test Business');
      expect(result.serpData).toBeUndefined();
      expect(result.enhancedData).toBeUndefined();
    });

    it('should handle missing GBP and Places data', async () => {
      const result = await extractor.extractBusinessIntelligence({
        name: 'Manual Business',
        address: '456 Oak St, Dallas, TX'
      });

      // Should still collect SERP and enhanced data
      expect(result).toBeDefined();
      expect(result.businessInfo.name).toBe('Manual Business');
      expect(result.businessInfo.address).toBe('456 Oak St, Dallas, TX');
      expect(DataForSEO.searchBusiness).toHaveBeenCalledWith('Manual Business Dallas TX');
      expect(DataForSEO.getBusinessDataFromGoogle).toHaveBeenCalled();
    });

    it('should handle partial data availability', async () => {
      // Mock partial failures
      (DataForSEO.getGoogleReviews as jest.Mock).mockRejectedValueOnce(new Error('No reviews'));
      
      const result = await extractor.extractBusinessIntelligence({
        name: mockPlacesData.displayName.text,
        address: mockPlacesData.formattedAddress,
        placeId: mockPlacesData.id,
        placesData: mockPlacesData
      });

      // Should still return other data
      expect(result).toBeDefined();
      expect(result.businessInfo).toBeDefined();
      expect(result.serpData).toBeDefined();
      expect(result.enhancedData).toBeDefined();
      expect(result.dataforseoReviews).toBeUndefined();
    });
  });

  describe('AI Content Generation', () => {
    it('should generate AI content based on collected data', async () => {
      const result = await extractor.extractBusinessIntelligence({
        name: mockGBPData.name,
        address: '123 Main St, Austin, TX 78701',
        gbpData: mockGBPData
      });

      expect(result.aiGenerated).toBeDefined();
      expect(result.aiGenerated.suggestedColors).toBeDefined();
      expect(result.aiGenerated.suggestedContent).toBeDefined();
      expect(result.aiGenerated.questionsForUser).toBeDefined();
    });
  });
});