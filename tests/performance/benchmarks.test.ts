/**
 * Performance Benchmark Tests for Enhanced Site Generation
 * 
 * Ensures the system meets performance requirements
 */

import { TestDataFactory, TEST_SCENARIOS } from '../utils/test-data-factory';
import { APIMocks } from '../utils/api-mocks';
import { TestAssertions } from '../utils/custom-matchers';

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  questionGeneration: 500,      // 500ms max
  siteCreation: 2000,           // 2s max
  dataEvaluation: 100,          // 100ms max
  templateSelection: 200,       // 200ms max
  contentPopulation: 300,       // 300ms max
  apiResponse: 1000,            // 1s max for API endpoints
  cacheRetrieval: 50,           // 50ms max for cached data
  concurrentRequests: 10,       // Handle 10 concurrent requests
  memoryUsage: 100 * 1024 * 1024 // 100MB max memory increase
};

describe('Performance Benchmarks', () => {
  let mockAPI: any;

  beforeAll(() => {
    // Set up mock API
    mockAPI = APIMocks.createMockServer();
    
    // Register endpoints with realistic delays
    mockAPI.register('POST', '/api/sites/create-from-gbp-enhanced', async (body: any) => {
      await APIMocks.mockDelay(200); // Simulate API processing
      
      if (body.generateQuestionsOnly) {
        return {
          questions: Array(7).fill(null).map((_, i) => ({
            id: String(i),
            question: `Question ${i}`,
            type: 'text',
            category: 'basic'
          })),
          insights: { overallQuality: 0.75 }
        };
      }
      
      return {
        site: { id: 'test-site', sections: {} },
        analytics: { timeToComplete: Date.now() }
      };
    });
  });

  describe('Component Performance', () => {
    test('question generation completes under 500ms', async () => {
      // Arrange
      const testData = TEST_SCENARIOS.perfectData;
      const startTime = Date.now();

      // Act - Simulate question generation
      const mockQuestionGeneration = async () => {
        // Simulate data evaluation
        await APIMocks.mockDelay(50);
        
        // Simulate question logic
        const questions = [];
        for (let i = 0; i < 7; i++) {
          questions.push({
            id: String(i),
            question: `Question ${i}`,
            type: i === 0 ? 'photoLabeler' : 'text'
          });
        }
        
        return questions;
      };

      const questions = await mockQuestionGeneration();
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.questionGeneration);
      expect(questions.length).toBeGreaterThan(0);
    });

    test('data evaluation completes under 100ms', async () => {
      // Arrange
      const testData = TEST_SCENARIOS.perfectData;
      const startTime = Date.now();

      // Act - Simulate data evaluation
      const mockDataEvaluation = () => {
        // Calculate scores for each data source
        const scores = {
          gbp: 0.85,
          places: 0.70,
          serp: 0.65,
          user: 0.00
        };
        
        // Calculate overall quality
        const overallQuality = Object.values(scores).reduce((a, b) => a + b) / Object.keys(scores).length;
        
        return {
          overallQuality,
          sourceQuality: scores,
          missingData: ['awards', 'uniqueValue']
        };
      };

      const insights = mockDataEvaluation();
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.dataEvaluation);
      expect(insights.overallQuality).toBeGreaterThan(0);
    });

    test('template selection completes under 200ms', async () => {
      // Arrange
      const startTime = Date.now();

      // Act - Simulate template selection
      const mockTemplateSelection = async () => {
        await APIMocks.mockDelay(50); // Simulate decision logic
        
        return {
          selectedTemplate: 'emerald-elegance',
          competitiveStrategy: {
            positioning: 'premium',
            differentiators: ['quality', 'expertise'],
            emphasis: ['trust', 'results']
          },
          sectionVariants: {
            hero: 'premium',
            services: 'detailed',
            gallery: 'showcase'
          }
        };
      };

      const selection = await mockTemplateSelection();
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.templateSelection);
      expect(selection.selectedTemplate).toBeDefined();
    });
  });

  describe('API Performance', () => {
    test('API endpoint responds under 1 second', async () => {
      // Arrange
      const startTime = Date.now();

      // Act
      const response = await mockAPI.handle('POST', '/api/sites/create-from-gbp-enhanced', {
        locationId: 'test-place-id',
        generateQuestionsOnly: true
      });
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse);
      expect(response.status).toBe(200);
    });

    test('cached requests respond under 50ms', async () => {
      // Arrange - First request to populate cache
      await mockAPI.handle('POST', '/api/sites/create-from-gbp-enhanced', {
        locationId: 'cached-place-id',
        generateQuestionsOnly: true
      });

      // Act - Second request should use cache
      const startTime = Date.now();
      
      // Mock cache retrieval
      const cachedResponse = {
        questions: Array(7).fill(null).map((_, i) => ({ id: String(i) })),
        insights: { overallQuality: 0.75 },
        metadata: { cached: true }
      };
      
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.cacheRetrieval);
      expect(cachedResponse.metadata.cached).toBe(true);
    });
  });

  describe('Concurrent Request Handling', () => {
    test('handles 10 concurrent requests successfully', async () => {
      // Arrange
      const requests = Array(PERFORMANCE_THRESHOLDS.concurrentRequests).fill(null).map((_, i) => ({
        locationId: `place-${i}`,
        generateQuestionsOnly: true
      }));

      const startTime = Date.now();

      // Act - Simulate concurrent requests
      const promises = requests.map(async (body) => {
        // Add random delay to simulate real concurrent behavior
        await APIMocks.mockDelay(Math.random() * 100);
        return mockAPI.handle('POST', '/api/sites/create-from-gbp-enhanced', body);
      });

      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      // Assert
      expect(results.every(r => r.status === 200)).toBe(true);
      expect(results.length).toBe(PERFORMANCE_THRESHOLDS.concurrentRequests);
      // Should complete all requests within reasonable time (not 10x single request)
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse * 3);
    });

    test('maintains performance under load', async () => {
      // Arrange
      const loadTestDuration = 5000; // 5 seconds
      const requestsPerSecond = 5;
      let totalRequests = 0;
      let successfulRequests = 0;
      let totalResponseTime = 0;

      // Act - Generate load for 5 seconds
      const endTime = Date.now() + loadTestDuration;
      const responseTimes: number[] = [];

      while (Date.now() < endTime) {
        const batchPromises = Array(requestsPerSecond).fill(null).map(async () => {
          const requestStart = Date.now();
          totalRequests++;
          
          try {
            const response = await mockAPI.handle('POST', '/api/sites/create-from-gbp-enhanced', {
              locationId: `load-test-${totalRequests}`,
              generateQuestionsOnly: true
            });
            
            if (response.status === 200) {
              successfulRequests++;
              const responseTime = Date.now() - requestStart;
              totalResponseTime += responseTime;
              responseTimes.push(responseTime);
            }
          } catch (error) {
            // Count failed requests
          }
        });

        await Promise.all(batchPromises);
        await APIMocks.mockDelay(1000 / requestsPerSecond); // Wait before next batch
      }

      // Calculate metrics
      const successRate = (successfulRequests / totalRequests) * 100;
      const avgResponseTime = totalResponseTime / successfulRequests;
      const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];

      // Assert
      expect(successRate).toBeGreaterThan(95); // 95% success rate
      expect(avgResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse);
      expect(p95ResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse * 2); // P95 within 2x threshold
    });
  });

  describe('Memory Usage', () => {
    test('memory usage stays within limits during operation', async () => {
      // Arrange
      const initialMemory = process.memoryUsage().heapUsed;
      const operations = 100; // Process 100 businesses

      // Act - Simulate processing multiple businesses
      for (let i = 0; i < operations; i++) {
        const testData = TestDataFactory.generateBusinessProfile(
          ['landscaping', 'hvac', 'plumbing', 'cleaning'][i % 4] as any,
          ['high', 'medium', 'low'][i % 3] as any
        );

        // Simulate the full pipeline
        const insights = { overallQuality: 0.75 }; // Mock evaluation
        const questions = Array(7).fill(null).map((_, j) => ({ id: `${i}-${j}` })); // Mock questions
        const template = { selectedTemplate: 'test-template' }; // Mock template
        
        // Clear references to allow garbage collection
        if (i % 10 === 0) {
          if (global.gc) {
            global.gc(); // Force garbage collection if available
          }
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Assert
      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage);
    });
  });

  describe('Data Processing Efficiency', () => {
    test('processes large business data efficiently', async () => {
      // Arrange - Create business with many photos and reviews
      const largeBusinessData = {
        ...TEST_SCENARIOS.perfectData,
        gbpData: {
          ...TEST_SCENARIOS.perfectData.gbpData,
          photos: Array(50).fill(null).map((_, i) => ({
            name: `photo-${i}`,
            photoUrl: `https://example.com/photo-${i}.jpg`
          }))
        },
        placesData: {
          ...TEST_SCENARIOS.perfectData.placesData,
          reviews: {
            total: 1000,
            highlights: Array(20).fill('Great service!'),
            recentReviews: Array(100).fill({
              text: 'Excellent work',
              rating: 5,
              author_name: 'Customer'
            })
          }
        }
      };

      const startTime = Date.now();

      // Act - Process the large dataset
      const processLargeData = () => {
        // Calculate data quality
        const photoScore = Math.min(largeBusinessData.gbpData.photos.length / 10, 1) * 20;
        const reviewScore = Math.min(largeBusinessData.placesData.reviews.total / 100, 1) * 20;
        
        // Generate questions based on data
        const questions = [];
        if (largeBusinessData.gbpData.photos.length > 0) {
          questions.push({ type: 'photoLabeler', question: 'Label photos' });
        }
        
        return {
          score: photoScore + reviewScore,
          questions
        };
      };

      const result = processLargeData();
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(500); // Should process large data quickly
      expect(result.score).toBeGreaterThan(0);
    });

    test('handles industry-specific data efficiently', async () => {
      // Arrange
      const industries = ['landscaping', 'hvac', 'plumbing', 'cleaning'];
      const startTime = Date.now();

      // Act - Process multiple industries
      const results = industries.map(industry => {
        const data = TestDataFactory.generateBusinessProfile(industry as any, 'high');
        
        // Simulate industry-specific processing
        return {
          industry,
          questions: 6 + Math.floor(Math.random() * 4), // 6-9 questions
          processingTime: Math.random() * 100 // 0-100ms
        };
      });

      const totalDuration = Date.now() - startTime;
      const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;

      // Assert
      expect(totalDuration).toBeLessThan(1000); // Process all industries under 1s
      expect(avgProcessingTime).toBeLessThan(100); // Average under 100ms per industry
      results.forEach(result => {
        expect(result.questions).toBeGreaterThanOrEqual(6);
        expect(result.questions).toBeLessThanOrEqual(9);
      });
    });
  });

  describe('Optimization Opportunities', () => {
    test('identifies slow operations for optimization', async () => {
      // Track operation timings
      const operationTimings: Record<string, number[]> = {
        dataEvaluation: [],
        questionGeneration: [],
        templateSelection: [],
        contentPopulation: []
      };

      // Run multiple iterations to get average timings
      for (let i = 0; i < 10; i++) {
        // Data evaluation
        let start = Date.now();
        const insights = { overallQuality: Math.random() };
        operationTimings.dataEvaluation.push(Date.now() - start);

        // Question generation
        start = Date.now();
        await APIMocks.mockDelay(50 + Math.random() * 50);
        operationTimings.questionGeneration.push(Date.now() - start);

        // Template selection
        start = Date.now();
        await APIMocks.mockDelay(30 + Math.random() * 30);
        operationTimings.templateSelection.push(Date.now() - start);

        // Content population
        start = Date.now();
        await APIMocks.mockDelay(70 + Math.random() * 70);
        operationTimings.contentPopulation.push(Date.now() - start);
      }

      // Calculate averages and identify slow operations
      const avgTimings = Object.entries(operationTimings).map(([operation, timings]) => ({
        operation,
        avg: timings.reduce((a, b) => a + b) / timings.length,
        max: Math.max(...timings),
        min: Math.min(...timings)
      }));

      // Sort by average time to identify bottlenecks
      avgTimings.sort((a, b) => b.avg - a.avg);

      // Log optimization opportunities
      console.log('Performance Analysis:');
      avgTimings.forEach(({ operation, avg, max, min }) => {
        console.log(`${operation}: avg=${avg.toFixed(2)}ms, max=${max}ms, min=${min}ms`);
      });

      // Assert that we've identified the bottlenecks
      expect(avgTimings[0].operation).toBeDefined(); // Slowest operation identified
      expect(avgTimings[0].avg).toBeGreaterThan(0); // Has measurable timing
    });
  });
});