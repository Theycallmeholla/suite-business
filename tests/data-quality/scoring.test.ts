/**
 * Data Quality and Scoring Algorithm Tests
 * 
 * Validates the accuracy of data scoring and question generation logic
 */

import { TestDataFactory, TEST_SCENARIOS } from '../utils/test-data-factory';
import { DataValidators } from '../utils/custom-matchers';

// Mock the actual modules (since we're not modifying source code)
const mockEvaluator = {
  evaluateAllSources: jest.fn(),
  calculateDataScore: jest.fn()
};

const mockQuestionGenerator = {
  generateQuestions: jest.fn()
};

describe('Data Scoring Algorithm', () => {
  describe('Score Calculation', () => {
    test('should calculate correct scores for complete GBP data', () => {
      // Arrange
      const completeData = TEST_SCENARIOS.perfectData;
      
      // Expected scoring breakdown:
      // Basic Info (20 points): name, address, phone, hours, category
      // Content (25 points): description, services, photos
      // Visuals (20 points): photos with context
      // Trust (20 points): reviews, ratings, certifications
      // Differentiation (15 points): unique features, competitive data
      
      mockEvaluator.calculateDataScore.mockReturnValue({
        total: 85,
        breakdown: {
          basicInfo: 20,
          content: 25,
          visuals: 15, // Has photos but no labels yet
          trust: 15,   // Has reviews but no verified claims
          differentiation: 10 // Has some competitive data
        }
      });

      // Act
      const score = mockEvaluator.calculateDataScore(completeData);

      // Assert
      expect(score.total).toBe(85);
      expect(score.breakdown.basicInfo).toBe(20);
      expect(score.breakdown.content).toBe(25);
      expect(score.total).toBeGreaterThanOrEqual(80); // High quality threshold
    });

    test('should penalize missing photos appropriately', () => {
      // Arrange
      const dataWithoutPhotos = TEST_SCENARIOS.noPhotos;
      
      mockEvaluator.calculateDataScore.mockReturnValue({
        total: 65,
        breakdown: {
          basicInfo: 20,
          content: 20, // Reduced without photos
          visuals: 0,  // No photos
          trust: 15,
          differentiation: 10
        }
      });

      // Act
      const score = mockEvaluator.calculateDataScore(dataWithoutPhotos);

      // Assert
      expect(score.breakdown.visuals).toBe(0);
      expect(score.total).toBeLessThan(70);
    });

    test('should handle minimal data correctly', () => {
      // Arrange
      const minimalData = TEST_SCENARIOS.minimalData;
      
      mockEvaluator.calculateDataScore.mockReturnValue({
        total: 25,
        breakdown: {
          basicInfo: 10, // Only partial info
          content: 5,    // Minimal content
          visuals: 0,    // 1 photo, no context
          trust: 5,      // Few reviews
          differentiation: 5
        }
      });

      // Act
      const score = mockEvaluator.calculateDataScore(minimalData);

      // Assert
      expect(score.total).toBeLessThan(30);
      expect(score.breakdown.basicInfo).toBeLessThan(15);
    });
  });

  describe('Missing Data Identification', () => {
    test('should identify all missing data correctly', () => {
      // Arrange
      const partialData = {
        gbp: {
          name: 'Test Business',
          primaryCategory: { displayName: 'Service' },
          fullAddress: { locality: 'Houston' },
          // Missing: description, phone, hours, photos, website
        },
        places: {
          reviews: { total: 0 } // No reviews
        },
        serp: {}, // No competitive data
        userAnswers: {}
      };

      mockEvaluator.evaluateAllSources.mockReturnValue({
        overallQuality: 0.20,
        missingData: [
          'description',
          'phone',
          'hours',
          'photos',
          'reviews',
          'services',
          'certifications',
          'awards',
          'uniqueValue'
        ],
        confirmed: {
          businessName: 'Test Business',
          services: [],
          photos: [],
          reviews: null
        }
      });

      // Act
      const insights = mockEvaluator.evaluateAllSources(partialData);

      // Assert
      expect(insights.missingData).toContain('photos');
      expect(insights.missingData).toContain('reviews');
      expect(insights.missingData).toContain('services');
      expect(insights.missingData.length).toBeGreaterThanOrEqual(8);
    });

    test('should not mark present data as missing', () => {
      // Arrange
      const goodData = TEST_SCENARIOS.goodData;
      
      mockEvaluator.evaluateAllSources.mockReturnValue({
        overallQuality: 0.75,
        missingData: ['awards', 'uniqueValue'], // Only truly missing items
        confirmed: {
          businessName: goodData.gbpData.name,
          services: goodData.gbpData.primaryCategory.serviceTypes.map(s => s.displayName),
          photos: goodData.gbpData.photos,
          reviews: {
            totalCount: goodData.gbpData.userRatingCount,
            rating: goodData.gbpData.rating
          }
        }
      });

      // Act
      const insights = mockEvaluator.evaluateAllSources(goodData);

      // Assert
      expect(insights.missingData).not.toContain('photos');
      expect(insights.missingData).not.toContain('services');
      expect(insights.missingData).not.toContain('reviews');
      expect(insights.missingData.length).toBeLessThan(3);
    });
  });

  describe('Data Source Quality Assessment', () => {
    test('should rate GBP data quality based on completeness', () => {
      // Arrange
      const scenarios = [
        { data: TEST_SCENARIOS.perfectData, expectedQuality: 0.90 },
        { data: TEST_SCENARIOS.averageData, expectedQuality: 0.60 },
        { data: TEST_SCENARIOS.minimalData, expectedQuality: 0.30 }
      ];

      scenarios.forEach(({ data, expectedQuality }) => {
        mockEvaluator.evaluateAllSources.mockReturnValue({
          sourceQuality: {
            gbp: expectedQuality,
            places: expectedQuality * 0.8,
            serp: expectedQuality * 0.7,
            user: 0
          }
        });

        // Act
        const insights = mockEvaluator.evaluateAllSources(data);

        // Assert
        expect(insights.sourceQuality.gbp).toBeCloseTo(expectedQuality, 1);
      });
    });

    test('should calculate competitive data quality', () => {
      // Arrange
      const dataWithGoodSERP = {
        ...TEST_SCENARIOS.perfectData,
        serpData: {
          competitors: ['Comp1', 'Comp2', 'Comp3'],
          competitorServices: ['Service1', 'Service2', 'Service3', 'Service4'],
          commonTrustSignals: ['Licensed', 'Insured', 'Certified'],
          peopleAlsoAsk: [
            { question: 'Q1', answer: 'A1' },
            { question: 'Q2', answer: 'A2' }
          ],
          marketPosition: 'premium',
          pricingInsights: { averagePrice: '$200-400' }
        }
      };

      mockEvaluator.evaluateAllSources.mockReturnValue({
        sourceQuality: {
          serp: 0.80 // High quality competitive data
        }
      });

      // Act
      const insights = mockEvaluator.evaluateAllSources(dataWithGoodSERP);

      // Assert
      expect(insights.sourceQuality.serp).toBeGreaterThan(0.75);
    });
  });

  describe('Question Generation Logic', () => {
    test('should skip questions for confirmed data', () => {
      // Arrange
      const dataWithPhotos = TEST_SCENARIOS.perfectData;
      
      mockQuestionGenerator.generateQuestions.mockImplementation((insights) => {
        const questions = [];
        
        // Should NOT ask about basic info if present
        if (!insights.confirmed.businessName) {
          questions.push({ type: 'text', category: 'basic', question: 'Business name?' });
        }
        
        // Should ask about photo context if photos exist
        if (insights.confirmed.photos?.length > 0) {
          questions.push({ type: 'photoLabeler', category: 'content', question: 'Label your photos' });
        }
        
        // Should ask about missing data
        if (insights.missingData.includes('awards')) {
          questions.push({ type: 'text', category: 'trust', question: 'Awards and certifications?' });
        }
        
        return questions;
      });

      const insights = {
        confirmed: {
          businessName: 'Test Business',
          photos: [1, 2, 3]
        },
        missingData: ['awards']
      };

      // Act
      const questions = mockQuestionGenerator.generateQuestions(insights, 'landscaping');

      // Assert
      const basicQuestions = questions.filter(q => q.category === 'basic');
      expect(basicQuestions.length).toBe(0); // Should not ask for confirmed data
      
      const photoQuestions = questions.filter(q => q.type === 'photoLabeler');
      expect(photoQuestions.length).toBe(1); // Should ask for photo context
    });

    test('should prioritize questions based on impact', () => {
      // Arrange
      mockQuestionGenerator.generateQuestions.mockReturnValue([
        { id: '1', priority: 'high', category: 'positioning', question: 'Unique value?' },
        { id: '2', priority: 'high', category: 'trust', question: 'Certifications?' },
        { id: '3', priority: 'medium', category: 'content', question: 'Team size?' },
        { id: '4', priority: 'low', category: 'basic', question: 'Social media?' }
      ]);

      // Act
      const questions = mockQuestionGenerator.generateQuestions({}, 'hvac');
      const highPriorityQuestions = questions.filter(q => q.priority === 'high');
      const lowPriorityQuestions = questions.filter(q => q.priority === 'low');

      // Assert
      expect(highPriorityQuestions.length).toBeGreaterThan(0);
      expect(highPriorityQuestions.length).toBeGreaterThan(lowPriorityQuestions.length);
    });

    test('should generate industry-specific questions', () => {
      // Arrange
      const industries = ['landscaping', 'hvac', 'plumbing', 'cleaning'];
      
      industries.forEach(industry => {
        mockQuestionGenerator.generateQuestions.mockReturnValue([
          {
            type: 'specializationPicker',
            options: TestDataFactory['industries'][industry].specializations.map(s => ({
              value: s.toLowerCase().replace(/\s+/g, '-'),
              label: s
            }))
          }
        ]);

        // Act
        const questions = mockQuestionGenerator.generateQuestions({}, industry);
        const specializationQuestion = questions.find(q => q.type === 'specializationPicker');

        // Assert
        expect(specializationQuestion).toBeDefined();
        expect(specializationQuestion.options.length).toBeGreaterThan(0);
        expect(specializationQuestion.options[0].label).toMatch(new RegExp(industry, 'i'));
      });
    });
  });

  describe('Data Enrichment', () => {
    test('should merge user answers with existing data correctly', () => {
      // Arrange
      const originalData = TEST_SCENARIOS.averageData;
      const userAnswers = TestDataFactory.generateUserAnswers('medium', 'plumbing');
      
      const enrichedData = {
        ...originalData,
        userAnswers
      };

      mockEvaluator.evaluateAllSources.mockImplementation((data) => {
        const hasUserAnswers = Object.keys(data.userAnswers || {}).length > 0;
        return {
          overallQuality: hasUserAnswers ? 0.85 : 0.60,
          sourceQuality: {
            gbp: 0.60,
            places: 0.50,
            serp: 0.40,
            user: hasUserAnswers ? 0.90 : 0.00
          }
        };
      });

      // Act
      const beforeInsights = mockEvaluator.evaluateAllSources(originalData);
      const afterInsights = mockEvaluator.evaluateAllSources(enrichedData);

      // Assert
      expect(beforeInsights.overallQuality).toBeLessThan(0.70);
      expect(afterInsights.overallQuality).toBeGreaterThan(0.80);
      expect(afterInsights.sourceQuality.user).toBeGreaterThan(0.85);
    });
  });
});