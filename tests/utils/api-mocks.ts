/**
 * API Mock Utilities for Testing
 * 
 * Provides mock responses for external APIs (Google Places, DataForSEO, etc.)
 */

import { TestDataFactory } from './test-data-factory';

export class APIMocks {
  /**
   * Mock Google Places API response
   */
  static mockPlacesAPIResponse(placeId: string, scenario: 'success' | 'not_found' | 'error' = 'success') {
    if (scenario === 'not_found') {
      return {
        status: 'NOT_FOUND',
        error_message: 'Place not found'
      };
    }
    
    if (scenario === 'error') {
      return {
        status: 'REQUEST_DENIED',
        error_message: 'API key invalid'
      };
    }

    // Generate data based on place ID pattern (for consistent testing)
    const quality = placeId.includes('high') ? 'high' : 
                   placeId.includes('medium') ? 'medium' : 'low';
    const industry = placeId.includes('hvac') ? 'hvac' :
                    placeId.includes('plumb') ? 'plumbing' :
                    placeId.includes('clean') ? 'cleaning' : 'landscaping';
    
    const testData = TestDataFactory.generateBusinessProfile(industry as any, quality);
    
    return {
      status: 'OK',
      result: {
        place_id: placeId,
        name: testData.gbpData.name,
        formatted_address: `${testData.gbpData.fullAddress.addressLines[0]}, ${testData.gbpData.fullAddress.locality}, ${testData.gbpData.fullAddress.administrativeArea} ${testData.gbpData.fullAddress.postalCode}`,
        formatted_phone_number: testData.gbpData.primaryPhone,
        website: testData.gbpData.website,
        rating: testData.gbpData.rating,
        user_ratings_total: testData.gbpData.userRatingCount,
        reviews: testData.placesData.reviews.recentReviews,
        photos: testData.gbpData.photos.map(p => ({
          photo_reference: p.name,
          height: 1080,
          width: 1920,
          html_attributions: []
        })),
        opening_hours: testData.placesData.opening_hours,
        types: ['point_of_interest', 'establishment'],
        editorial_summary: testData.placesData.editorial_summary
      }
    };
  }

  /**
   * Mock DataForSEO API response
   */
  static mockDataForSEOResponse(businessName: string, location: string, industry: string) {
    const testData = TestDataFactory.generateBusinessProfile(industry as any, 'high');
    
    return {
      tasks: [{
        result: [{
          keyword: `${industry} ${location}`,
          location_code: 2840,
          language_code: 'en',
          check_url: `https://www.google.com/search?q=${encodeURIComponent(`${industry} ${location}`)}`,
          datetime: new Date().toISOString(),
          spell: null,
          refinement_chips: null,
          item_types: ['organic', 'paid', 'local_pack', 'featured_snippet', 'people_also_ask'],
          se_results_count: 58400000,
          items_count: 104,
          items: [
            // Local pack results (competitors)
            ...testData.serpData.competitors.map((competitor, index) => ({
              type: 'local_pack',
              rank_group: 1,
              rank_absolute: index + 1,
              position: 'left',
              title: competitor,
              description: `${testData.serpData.competitorServices.slice(0, 3).join(', ')}. ${testData.serpData.commonTrustSignals.slice(0, 2).join(', ')}.`,
              url: `https://${competitor.toLowerCase().replace(/\s+/g, '')}.com`,
              domain: `${competitor.toLowerCase().replace(/\s+/g, '')}.com`,
              rating: {
                rating_type: 'google',
                value: 4.5 + (index * 0.1),
                votes_count: 150 - (index * 20),
                rating_max: 5
              }
            })),
            // People also ask
            ...testData.serpData.peopleAlsoAsk.map((paa, index) => ({
              type: 'people_also_ask',
              rank_group: index + 4,
              rank_absolute: index + 10,
              position: 'left',
              title: paa.question,
              items: [{
                type: 'people_also_ask_element',
                title: paa.question,
                seed_question: null,
                paragraphs: [{
                  text: paa.answer,
                  links: []
                }]
              }]
            })),
            // Related searches
            {
              type: 'related_searches',
              rank_group: 20,
              rank_absolute: 100,
              position: 'left',
              title: 'Related searches',
              items: testData.serpData.localKeywords.map(kw => ({
                type: 'related_searches_element',
                title: kw,
                url: `https://www.google.com/search?q=${encodeURIComponent(kw)}`
              }))
            }
          ]
        }]
      }]
    };
  }

  /**
   * Mock GHL API responses
   */
  static mockGHLResponse(endpoint: string, method: string = 'GET') {
    const responses = {
      '/locations': {
        locations: [{
          id: 'test-location-id',
          name: 'Test Business',
          address: '123 Test St',
          city: 'Houston',
          state: 'TX',
          country: 'US',
          postalCode: '77001'
        }]
      },
      '/contacts': {
        contacts: [{
          id: 'test-contact-id',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+17135551234'
        }]
      },
      '/snapshots': {
        snapshots: [{
          id: 'test-snapshot-id',
          name: 'Industry Template',
          type: 'funnel'
        }]
      }
    };

    return responses[endpoint] || { success: true };
  }

  /**
   * Mock authentication responses
   */
  static mockAuthResponse(scenario: 'success' | 'invalid' | 'expired' = 'success') {
    if (scenario === 'invalid') {
      return {
        error: 'Invalid credentials',
        code: 'AUTH_INVALID'
      };
    }
    
    if (scenario === 'expired') {
      return {
        error: 'Session expired',
        code: 'AUTH_EXPIRED'
      };
    }

    return {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin'
      },
      token: 'mock-jwt-token',
      expiresIn: 3600
    };
  }

  /**
   * Create a mock API server for testing
   */
  static createMockServer() {
    const handlers = new Map();

    return {
      // Register a mock handler
      register(method: string, path: string, handler: Function) {
        const key = `${method}:${path}`;
        handlers.set(key, handler);
      },

      // Handle a request
      async handle(method: string, path: string, body?: any) {
        const key = `${method}:${path}`;
        const handler = handlers.get(key);
        
        if (!handler) {
          return {
            status: 404,
            body: { error: 'Not found' }
          };
        }

        try {
          const result = await handler(body);
          return {
            status: 200,
            body: result
          };
        } catch (error) {
          return {
            status: 500,
            body: { error: error.message }
          };
        }
      },

      // Reset all handlers
      reset() {
        handlers.clear();
      }
    };
  }

  /**
   * Mock delay to simulate network latency
   */
  static async mockDelay(ms: number = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate mock analytics data
   */
  static mockAnalyticsData(days: number = 7) {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        metrics: {
          questionsShown: Math.floor(Math.random() * 4) + 6, // 6-9 questions
          questionsAnswered: Math.floor(Math.random() * 4) + 5, // 5-8 answered
          completionTime: Math.floor(Math.random() * 120) + 120, // 2-4 minutes
          dataQuality: Math.floor(Math.random() * 20) + 65, // 65-85%
          sitesCreated: Math.floor(Math.random() * 5) + 1
        }
      });
    }
    
    return data.reverse();
  }

  /**
   * Mock error scenarios
   */
  static mockError(type: 'network' | 'timeout' | 'rateLimit' | 'validation') {
    const errors = {
      network: {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        details: 'Could not connect to server'
      },
      timeout: {
        code: 'TIMEOUT_ERROR',
        message: 'Request timed out',
        details: 'The request took too long to complete'
      },
      rateLimit: {
        code: 'RATE_LIMIT_ERROR',
        message: 'Rate limit exceeded',
        details: 'Too many requests. Please try again later.',
        retryAfter: 60
      },
      validation: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: 'The provided data does not meet requirements',
        fields: {
          placeId: 'Invalid Place ID format',
          industry: 'Industry not supported'
        }
      }
    };

    throw new Error(JSON.stringify(errors[type]));
  }
}

// Export mock data for easy access in tests
export const MOCK_PLACE_IDS = {
  valid: {
    high: 'ChIJN1t_tDeuEmsRUsoyG83frY4_high_landscaping',
    medium: 'ChIJQWqibS5uEmsRm_gDAzLEEYU_medium_hvac',
    low: 'ChIJYeH7WCxuEmsRkMIDaDqEEYU_low_plumbing'
  },
  invalid: 'ChIJINVALID',
  notFound: 'ChIJNOTFOUND'
};

export const MOCK_API_KEYS = {
  valid: 'mock-valid-api-key',
  invalid: 'mock-invalid-api-key',
  expired: 'mock-expired-api-key'
};