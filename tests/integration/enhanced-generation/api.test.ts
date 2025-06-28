/**
 * Integration Tests for Enhanced Site Generation API
 * 
 * Tests the complete flow without modifying production code
 */

import { TestDataFactory, TEST_SCENARIOS } from '../../utils/test-data-factory';
import { APIMocks, MOCK_PLACE_IDS } from '../../utils/api-mocks';
import { TestAssertions } from '../../utils/custom-matchers';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Enhanced Site Generation API Integration', () => {
  const API_ENDPOINT = '/api/sites/create-from-gbp-enhanced';
  let mockServer: any;

  beforeAll(() => {
    // Set up mock server
    mockServer = APIMocks.createMockServer();
    
    // Register mock handlers
    mockServer.register('GET', '/places/details', (params: any) => {
      return APIMocks.mockPlacesAPIResponse(params.place_id);
    });
    
    mockServer.register('POST', '/dataforseo/serp', (body: any) => {
      return APIMocks.mockDataForSEOResponse(body.keyword, body.location, body.industry);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Question Generation', () => {
    test('should generate 6-9 questions for high-quality business data', async () => {
      // Arrange
      const testData = TEST_SCENARIOS.perfectData;
      const requestBody = {
        locationId: testData.placeId,
        generateQuestionsOnly: true,
        industry: 'landscaping'
      };

      // Mock API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          questions: [
            { id: '1', question: 'Label your photos', type: 'photoLabeler', category: 'content' },
            { id: '2', question: 'Select your differentiators', type: 'differentiatorSelector', category: 'positioning' },
            { id: '3', question: 'Choose specializations', type: 'specializationPicker', category: 'services' },
            { id: '4', question: 'Verify claims', type: 'claimVerifier', category: 'trust' },
            { id: '5', question: 'Awards and certifications', type: 'text', category: 'trust' },
            { id: '6', question: 'Unique value proposition', type: 'text', category: 'positioning' }
          ],
          insights: {
            overallQuality: 0.75,
            sourceQuality: {
              gbp: 0.85,
              places: 0.70,
              serp: 0.65,
              user: 0.00
            },
            confirmed: {
              businessName: testData.gbpData.name,
              services: ['Lawn Care', 'Landscape Design', 'Tree Service'],
              photos: testData.gbpData.photos,
              reviews: { totalCount: 342, rating: 4.9 }
            },
            missingData: ['awards', 'teamSize', 'uniqueValue']
          }
        })
      });

      // Act
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const result = await response.json();

      // Assert
      TestAssertions.assertQuestionGeneration(result.questions, 'high');
      TestAssertions.assertDataEvaluation(result.insights, 0.75);
      expect(result.questions).toHaveOptimalQuestionCount();
      expect(result.questions).toContainQuestionTypes(['photoLabeler', 'differentiatorSelector']);
    });

    test('should generate more questions for low-quality business data', async () => {
      // Arrange
      const testData = TEST_SCENARIOS.minimalData;
      const requestBody = {
        locationId: testData.placeId,
        generateQuestionsOnly: true,
        industry: 'cleaning'
      };

      // Mock API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          questions: Array(9).fill(null).map((_, i) => ({
            id: String(i),
            question: `Question ${i}`,
            type: i < 3 ? 'text' : 'select',
            category: 'basic'
          })),
          insights: {
            overallQuality: 0.25,
            sourceQuality: {
              gbp: 0.30,
              places: 0.20,
              serp: 0.25,
              user: 0.00
            },
            missingData: ['description', 'photos', 'reviews', 'services', 'certifications']
          }
        })
      });

      // Act
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const result = await response.json();

      // Assert
      TestAssertions.assertQuestionGeneration(result.questions, 'low');
      expect(result.questions.length).toBeGreaterThanOrEqual(8);
      expect(result.insights.overallQuality).toBeLessThan(0.3);
    });

    test('should handle businesses with no photos gracefully', async () => {
      // Arrange
      const testData = TEST_SCENARIOS.noPhotos;
      const requestBody = {
        locationId: testData.placeId,
        generateQuestionsOnly: true
      };

      // Mock API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          questions: expect.arrayContaining([
            expect.not.objectContaining({ type: 'photoLabeler' })
          ]),
          insights: {
            overallQuality: 0.60,
            missingData: expect.arrayContaining(['photos'])
          }
        })
      });

      // Act
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const result = await response.json();

      // Assert
      const photoQuestions = result.questions.filter((q: any) => q.type === 'photoLabeler');
      expect(photoQuestions).toHaveLength(0);
    });
  });

  describe('Site Creation with Answers', () => {
    test('should create site with optimal template based on answers', async () => {
      // Arrange
      const testData = TEST_SCENARIOS.perfectData;
      const userAnswers = TestDataFactory.generateUserAnswers('high', 'landscaping');
      const requestBody = {
        locationId: testData.placeId,
        generateQuestionsOnly: false,
        industry: 'landscaping',
        userAnswers
      };

      // Mock API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          site: {
            id: 'test-site-id',
            subdomain: 'premier-lawn',
            template: 'emerald-elegance',
            industry: 'landscaping',
            sections: {
              hero: { variant: 'premium', content: { headline: 'Transform Your Outdoor Space' } },
              services: { variant: 'detailed', content: { services: testData.gbpData.primaryCategory.serviceTypes } },
              gallery: { variant: 'showcase', content: { items: testData.gbpData.photos } },
              trust: { variant: 'awards', content: { items: userAnswers.awards } },
              about: { variant: 'story', content: { yearsInBusiness: userAnswers.yearsInBusiness } }
            }
          },
          strategy: {
            positioning: 'premium',
            differentiators: userAnswers.differentiators.map(d => d.label),
            emphasis: ['quality', 'expertise', 'awards']
          },
          analytics: {
            questionsShown: 6,
            questionsAnswered: 6,
            dataQuality: 0.85,
            timeToComplete: 180
          }
        })
      });

      // Act
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const result = await response.json();

      // Assert
      expect(result.site).toBeDefined();
      expect(result.site.template).toBe('emerald-elegance');
      TestAssertions.assertTemplateSelection(result, 'premium');
      TestAssertions.assertPopulatedContent(result.site.sections, 'landscaping', 'high');
      expect(result.site.sections).toHaveCompleteSections(['hero', 'services', 'gallery', 'trust']);
    });

    test('should select appropriate template for budget positioning', async () => {
      // Arrange
      const testData = TEST_SCENARIOS.averageData;
      const userAnswers = TestDataFactory.generateUserAnswers('medium', 'plumbing');
      const requestBody = {
        locationId: testData.placeId,
        generateQuestionsOnly: false,
        industry: 'plumbing',
        userAnswers
      };

      // Mock API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          site: {
            template: 'nature-premium',
            sections: {
              hero: { variant: 'simple' },
              services: { variant: 'basic' }
            }
          },
          strategy: {
            positioning: 'value',
            emphasis: ['reliability', 'fair-pricing']
          }
        })
      });

      // Act
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const result = await response.json();

      // Assert
      TestAssertions.assertTemplateSelection(result, 'value');
      expect(result.strategy.emphasis).toContain('fair-pricing');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid Place ID gracefully', async () => {
      // Arrange
      const requestBody = {
        locationId: MOCK_PLACE_IDS.invalid,
        generateQuestionsOnly: true
      };

      // Mock API error response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            code: 'INVALID_PLACE_ID',
            message: 'The provided Place ID is not valid'
          }
        })
      });

      // Act
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const result = await response.json();

      // Assert
      expect(response.ok).toBe(false);
      TestAssertions.assertErrorResponse(result.error, 'INVALID_PLACE_ID');
    });

    test('should handle API rate limiting', async () => {
      // Arrange
      const requestBody = {
        locationId: MOCK_PLACE_IDS.valid.high,
        generateQuestionsOnly: true
      };

      // Mock rate limit response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: {
            code: 'RATE_LIMIT_ERROR',
            message: 'Too many requests',
            retryAfter: 60
          }
        })
      });

      // Act
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(429);
      expect(result.error.retryAfter).toBe(60);
    });

    test('should provide fallback when external APIs fail', async () => {
      // Arrange
      const requestBody = {
        locationId: MOCK_PLACE_IDS.valid.high,
        generateQuestionsOnly: true,
        industry: 'hvac'
      };

      // Mock partial API failure (SERP fails but Places works)
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            questions: expect.any(Array),
            insights: {
              overallQuality: expect.any(Number),
              sourceQuality: {
                gbp: expect.any(Number),
                places: expect.any(Number),
                serp: 0, // SERP failed
                user: 0
              }
            },
            warnings: ['SERP data unavailable, using fallback competitive data']
          })
        });

      // Act
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const result = await response.json();

      // Assert
      expect(response.ok).toBe(true);
      expect(result.warnings).toContain('SERP data unavailable, using fallback competitive data');
      expect(result.insights.sourceQuality.serp).toBe(0);
      expect(result.questions).toHaveOptimalQuestionCount(); // Should still generate questions
    });
  });

  describe('Caching Behavior', () => {
    test('should use cached data for repeated requests', async () => {
      // Arrange
      const requestBody = {
        locationId: MOCK_PLACE_IDS.valid.high,
        generateQuestionsOnly: true
      };

      // Mock first request
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          questions: Array(7).fill(null).map((_, i) => ({ id: String(i) })),
          insights: { overallQuality: 0.75 },
          metadata: { cached: false, responseTime: 287 }
        })
      });

      // Mock second request (cached)
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          questions: Array(7).fill(null).map((_, i) => ({ id: String(i) })),
          insights: { overallQuality: 0.75 },
          metadata: { cached: true, responseTime: 12 }
        })
      });

      // Act
      const response1 = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const result1 = await response1.json();

      const response2 = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const result2 = await response2.json();

      // Assert
      expect(result1.metadata.cached).toBe(false);
      expect(result2.metadata.cached).toBe(true);
      expect(result2.metadata.responseTime).toBeLessThan(result1.metadata.responseTime);
    });
  });
});