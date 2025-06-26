/**
 * Website Generation Orchestration Integration Test
 * 
 * Tests the complete flow from questions to published website
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { websiteGenerationOrchestrator } from '@/lib/orchestration/website-generation-orchestrator';
import { prisma } from '@/lib/prisma';

// Note: prisma is already mocked in jest.setup.ts, 
// we'll just use the existing mock and configure it in the tests

// These are already mocked in jest.setup.ts

describe('Website Generation Orchestration', () => {
  const mockBusinessData = {
    gbp: {
      businessName: 'Green Valley Landscaping',
      primaryPhone: '555-123-4567',
      website: 'https://greenvalley.com',
      description: 'Professional landscaping services in Denver',
      fullAddress: {
        locality: 'Denver',
        administrativeArea: 'CO',
        postalCode: '80202',
        addressLines: ['123 Main St'],
      },
      photos: [
        { url: 'https://example.com/photo1.jpg', category: 'exterior' },
        { url: 'https://example.com/photo2.jpg', category: 'work' },
      ],
      reviews: {
        rating: 4.8,
        count: 127,
      },
    },
    manual: {
      services: ['landscape-design', 'lawn-maintenance'],
      differentiators: ['family-owned', 'eco-friendly'],
      emergencyService: false,
    },
  };

  const mockAnswers = {
    services: ['landscape-design', 'lawn-maintenance', 'tree-trimming'],
    differentiators: ['family-owned', 'eco-friendly', 'award-winning'],
    emergencyService: false,
    businessStage: '10+',
    serviceRadius: '25-miles',
    brandPersonality: 'professional',
    targetAudience: 'homeowners',
    primaryGoal: 'generate-leads',
  };

  const mockGeneratedContent = {
    hero: {
      headline: { content: 'Transform Your Backyard Into Paradise' },
      subheadline: { content: 'Award-winning landscape design serving Denver families for 15 years' },
      ctaText: { content: 'Get Free Design Consultation' },
    },
    about: {
      headline: { content: 'Passionate About Creating Beautiful Outdoor Spaces' },
      description: { content: 'Founded in 2008 by master landscaper John Smith...' },
    },
    services: {
      headline: { content: 'Complete Landscaping Solutions' },
      description: { content: 'From design to installation to maintenance...' },
      serviceDescriptions: {
        'landscape-design': { content: 'Custom landscape designs that reflect your style...' },
        'lawn-maintenance': { content: 'Keep your lawn healthy and beautiful year-round...' },
      },
    },
    cta: {
      headline: { content: 'Ready to Transform Your Outdoor Space?' },
      description: { content: 'Join hundreds of satisfied homeowners...' },
      ctaText: { content: 'Start Your Project Today' },
    },
    contact: {
      headline: { content: "Let's Discuss Your Vision" },
      description: { content: 'Contact us for a free consultation...' },
    },
  };

  const mockTemplate = {
    id: 'adaptive-professional-landscaping-123',
    name: 'Green Valley Landscaping - Professional Landscaping Design',
    layout: {
      sections: [
        {
          id: 'hero',
          type: 'hero',
          variant: 'hero-professional',
          priority: 1,
          props: {},
          styling: {
            layout: 'split',
            spacing: 'normal',
            emphasis: 'bold',
            background: 'image',
          },
        },
        {
          id: 'services',
          type: 'services',
          variant: 'services-grid',
          priority: 2,
          props: {},
          styling: {
            layout: 'contained',
            spacing: 'normal',
            emphasis: 'normal',
            background: 'light',
          },
        },
      ],
    },
    designSystem: {
      colors: {
        primary: '#22C55E',
        secondary: '#84CC16',
        accent: '#F59E0B',
      },
      typography: {
        headingFont: { family: 'Inter', weights: [400, 600, 700] },
        bodyFont: { family: 'Inter', weights: [400, 500] },
      },
    },
    metadata: {
      uniquenessScore: 87,
      conversionOptimized: true,
      generatedAt: new Date(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Website Generation Flow', () => {
    it('should generate a complete website from business data and answers', async () => {
      // Setup mocks
      (prisma.businessIntelligence.findUnique as jest.Mock).mockResolvedValue({
        id: 'bi_123',
        data: mockBusinessData,
      });

      (prisma.site.findUnique as jest.Mock).mockResolvedValue(null); // No existing subdomain

      (prisma.site.create as jest.Mock).mockResolvedValue({
        id: 'site_123',
        subdomain: 'green-valley-landscaping',
        businessName: 'Green Valley Landscaping',
        published: false,
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_123',
        email: 'owner@greenvalley.com',
        name: 'John Smith',
      });

      // Mock AI content generation
      const { aiContentEngine } = require('@/lib/content-generation/ai-content-engine');
      aiContentEngine.generateWebsiteCopy.mockResolvedValue(mockGeneratedContent);

      // Mock template generation
      const { AdaptiveTemplateEngine } = require('@/lib/template-engine/adaptive-template-engine');
      const mockTemplateEngine = new AdaptiveTemplateEngine();
      mockTemplateEngine.generateTemplate.mockResolvedValue(mockTemplate);

      // Execute generation
      const request = {
        userId: 'user_123',
        businessIntelligenceId: 'bi_123',
        industry: 'landscaping' as const,
        answers: mockAnswers,
        options: {
          optimizeForConversion: true,
          includeAdvancedSEO: true,
          optimizeImages: true,
          publishImmediately: false,
        },
      };

      const result = await websiteGenerationOrchestrator.generateWebsite(request);

      // Verify result structure
      expect(result).toMatchObject({
        id: 'site_123',
        subdomain: 'green-valley-landscaping',
        businessName: 'Green Valley Landscaping',
        publishedUrl: expect.stringContaining('green-valley-landscaping'),
        metadata: {
          uniquenessScore: expect.any(Number),
          seoScore: expect.any(Number),
          conversionOptimized: true,
          generationTime: expect.any(Number),
        },
      });

      // Verify database operations
      expect(prisma.businessIntelligence.findUnique).toHaveBeenCalledWith({
        where: { id: 'bi_123' },
      });

      expect(prisma.site.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user_123',
          businessName: 'Green Valley Landscaping',
          subdomain: 'green-valley-landscaping',
          industry: 'landscaping',
          published: false,
        }),
      });

      expect(prisma.service.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            siteId: 'site_123',
            name: 'landscape-design',
          }),
        ]),
      });

      // Verify content generation
      expect(aiContentEngine.generateWebsiteCopy).toHaveBeenCalledWith(
        mockBusinessData,
        'landscaping',
        mockAnswers
      );

      // Verify template generation
      expect(mockTemplateEngine.generateTemplate).toHaveBeenCalledWith(
        mockAnswers,
        mockBusinessData,
        'landscaping',
        expect.objectContaining({
          prioritizeConversion: true,
        })
      );
    });

    it('should handle content generation failure gracefully', async () => {
      // Setup mocks
      (prisma.businessIntelligence.findUnique as jest.Mock).mockResolvedValue({
        id: 'bi_123',
        data: mockBusinessData,
      });

      (prisma.site.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.site.create as jest.Mock).mockResolvedValue({
        id: 'site_123',
        subdomain: 'green-valley-landscaping',
        businessName: 'Green Valley Landscaping',
      });

      // Mock AI content generation failure
      const { aiContentEngine } = require('@/lib/content-generation/ai-content-engine');
      aiContentEngine.generateWebsiteCopy.mockRejectedValue(new Error('OpenAI API error'));

      // Mock template generation
      const { AdaptiveTemplateEngine } = require('@/lib/template-engine/adaptive-template-engine');
      const mockTemplateEngine = new AdaptiveTemplateEngine();
      mockTemplateEngine.generateTemplate.mockResolvedValue(mockTemplate);

      const request = {
        userId: 'user_123',
        businessIntelligenceId: 'bi_123',
        industry: 'landscaping' as const,
        answers: mockAnswers,
      };

      // Should not throw, should use fallback content
      const result = await websiteGenerationOrchestrator.generateWebsite(request);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content.hero).toBeDefined();
    });

    it('should generate unique subdomains for duplicate business names', async () => {
      // Setup mocks
      (prisma.businessIntelligence.findUnique as jest.Mock).mockResolvedValue({
        id: 'bi_123',
        data: mockBusinessData,
      });

      // Mock existing subdomain
      (prisma.site.findUnique as jest.Mock)
        .mockResolvedValueOnce({ subdomain: 'green-valley-landscaping' }) // First call finds existing
        .mockResolvedValueOnce(null); // Second call with -1 suffix is available

      (prisma.site.create as jest.Mock).mockResolvedValue({
        id: 'site_123',
        subdomain: 'green-valley-landscaping-1',
        businessName: 'Green Valley Landscaping',
      });

      // Mock other dependencies
      const { aiContentEngine } = require('@/lib/content-generation/ai-content-engine');
      aiContentEngine.generateWebsiteCopy.mockResolvedValue(mockGeneratedContent);

      const { AdaptiveTemplateEngine } = require('@/lib/template-engine/adaptive-template-engine');
      const mockTemplateEngine = new AdaptiveTemplateEngine();
      mockTemplateEngine.generateTemplate.mockResolvedValue(mockTemplate);

      const request = {
        userId: 'user_123',
        businessIntelligenceId: 'bi_123',
        industry: 'landscaping' as const,
        answers: mockAnswers,
      };

      const result = await websiteGenerationOrchestrator.generateWebsite(request);

      expect(result.subdomain).toBe('green-valley-landscaping-1');
      expect(prisma.site.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('Website Variations Generation', () => {
    it('should generate multiple website variations', async () => {
      // Setup mocks
      (prisma.businessIntelligence.findUnique as jest.Mock).mockResolvedValue({
        id: 'bi_123',
        data: mockBusinessData,
      });

      (prisma.site.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.site.create as jest.Mock)
        .mockResolvedValueOnce({ id: 'site_1', subdomain: 'green-valley-1' })
        .mockResolvedValueOnce({ id: 'site_2', subdomain: 'green-valley-2' })
        .mockResolvedValueOnce({ id: 'site_3', subdomain: 'green-valley-3' });

      // Mock dependencies
      const { aiContentEngine } = require('@/lib/content-generation/ai-content-engine');
      aiContentEngine.generateWebsiteCopy.mockResolvedValue(mockGeneratedContent);

      const { AdaptiveTemplateEngine } = require('@/lib/template-engine/adaptive-template-engine');
      const mockTemplateEngine = new AdaptiveTemplateEngine();
      mockTemplateEngine.generateTemplate.mockResolvedValue(mockTemplate);

      const request = {
        userId: 'user_123',
        businessIntelligenceId: 'bi_123',
        industry: 'landscaping' as const,
        answers: mockAnswers,
      };

      const variations = await websiteGenerationOrchestrator.generateWebsiteVariations(
        request,
        3
      );

      expect(variations).toHaveLength(3);
      expect(variations[0].id).toBe('site_1');
      expect(variations[1].id).toBe('site_2');
      expect(variations[2].id).toBe('site_3');

      // Verify each variation was created
      expect(prisma.site.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when business intelligence data is not found', async () => {
      (prisma.businessIntelligence.findUnique as jest.Mock).mockResolvedValue(null);

      const request = {
        userId: 'user_123',
        businessIntelligenceId: 'bi_nonexistent',
        industry: 'landscaping' as const,
        answers: mockAnswers,
      };

      await expect(
        websiteGenerationOrchestrator.generateWebsite(request)
      ).rejects.toThrow('Business intelligence data not found');
    });

    it('should throw error when business name is missing', async () => {
      (prisma.businessIntelligence.findUnique as jest.Mock).mockResolvedValue({
        id: 'bi_123',
        data: {
          gbp: {}, // No business name
          manual: {}, // No business name
        },
      });

      const request = {
        userId: 'user_123',
        businessIntelligenceId: 'bi_123',
        industry: 'landscaping' as const,
        answers: mockAnswers,
      };

      await expect(
        websiteGenerationOrchestrator.generateWebsite(request)
      ).rejects.toThrow('Business name is required');
    });
  });

  describe('Progress Tracking', () => {
    it('should call progress callback during generation', async () => {
      // Setup mocks
      (prisma.businessIntelligence.findUnique as jest.Mock).mockResolvedValue({
        id: 'bi_123',
        data: mockBusinessData,
      });

      (prisma.site.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.site.create as jest.Mock).mockResolvedValue({
        id: 'site_123',
        subdomain: 'green-valley-landscaping',
      });

      // Mock dependencies
      const { aiContentEngine } = require('@/lib/content-generation/ai-content-engine');
      aiContentEngine.generateWebsiteCopy.mockResolvedValue(mockGeneratedContent);

      const { AdaptiveTemplateEngine } = require('@/lib/template-engine/adaptive-template-engine');
      const mockTemplateEngine = new AdaptiveTemplateEngine();
      mockTemplateEngine.generateTemplate.mockResolvedValue(mockTemplate);

      const progressCallback = jest.fn();

      const request = {
        userId: 'user_123',
        businessIntelligenceId: 'bi_123',
        industry: 'landscaping' as const,
        answers: mockAnswers,
      };

      await websiteGenerationOrchestrator.generateWebsite(request, progressCallback);

      // Verify progress callback was called multiple times
      expect(progressCallback).toHaveBeenCalledTimes(8); // 7 steps + completion

      // Verify progress structure
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          step: expect.any(String),
          progress: expect.any(Number),
          message: expect.any(String),
        })
      );

      // Verify completion call
      expect(progressCallback).toHaveBeenLastCalledWith(
        expect.objectContaining({
          step: 'completion',
          progress: 100,
          message: 'Website generation complete!',
        })
      );
    });
  });
});