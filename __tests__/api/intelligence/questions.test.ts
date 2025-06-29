import { POST } from '@/app/api/intelligence/questions/route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import grindmasters from '../../fixtures/grindmasters.json';
import { transformGbpData } from '@/lib/intelligence/gbp-transform';
import { NextRequest } from 'next/server';

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn()
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    businessIntelligence: {
      update: jest.fn(),
      findUnique: jest.fn()
    },
    analyticsEvent: {
      create: jest.fn()
    }
  }
}));

describe('POST /api/intelligence/questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SMART_INTAKE_ENABLED = 'true';
  });

  it('should return suppression reasons for questions', async () => {
    // Mock auth to return a user
    (auth as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' }
    });

    // Transform GBP data
    const transformedData = transformGbpData(grindmasters.locations[0]);

    // Mock business intelligence data with GBP data
    const mockIntelligenceData = {
      id: 'test-intelligence-id',
      gbpData: transformedData,
      dataScore: {
        total: 30,
        breakdown: {
          basicInfo: 20,
          content: 10,
          visuals: 0,
          trust: 0,
          differentiation: 0
        },
        suppression_info: {
          count: 2,
          reasons: {
            phone: 'Already have phone number from GBP',
            website: 'Already have website from GBP'
          }
        }
      }
    };

    (prisma.businessIntelligence.findUnique as jest.Mock).mockResolvedValue(mockIntelligenceData);
    (prisma.businessIntelligence.update as jest.Mock).mockResolvedValue(mockIntelligenceData);
    (prisma.analyticsEvent.create as jest.Mock).mockResolvedValue({});

    // Create request body
    const requestBody = {
      intelligenceId: 'test-intelligence-id',
      industry: 'general',
      dataScore: mockIntelligenceData.dataScore,
      missingData: ['services']
    };

    // Create mock NextRequest
    const mockRequest = new NextRequest('http://localhost:3000/api/intelligence/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.suppressionInfo).toBeDefined();
    expect(data.suppressionInfo.reasons).toBeDefined();
    expect(data.suppressionInfo.reasons.phone).toBe('Already have phone number from GBP');
    expect(data.suppressionInfo.reasons.website).toBe('Already have website from GBP');
    expect(data.suppressionInfo.count).toBe(2);
  });

  it('should generate questions when data is missing', async () => {
    // Mock auth to return a user
    (auth as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' }
    });

    // Mock business intelligence data with minimal data
    const mockIntelligenceData = {
      id: 'test-intelligence-id',
      gbpData: {},
      dataScore: {
        total: 10,
        breakdown: {
          basicInfo: 5,
          content: 5,
          visuals: 0,
          trust: 0,
          differentiation: 0
        },
        manual: {}
      }
    };

    (prisma.businessIntelligence.findUnique as jest.Mock).mockResolvedValue(mockIntelligenceData);
    (prisma.businessIntelligence.update as jest.Mock).mockResolvedValue(mockIntelligenceData);
    (prisma.analyticsEvent.create as jest.Mock).mockResolvedValue({});

    // Create request body
    const requestBody = {
      intelligenceId: 'test-intelligence-id',
      industry: 'landscaping',
      dataScore: mockIntelligenceData.dataScore,
      missingData: ['services', 'photos']
    };

    // Create mock NextRequest
    const mockRequest = new NextRequest('http://localhost:3000/api/intelligence/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.questions).toBeDefined();
    expect(data.questions.length).toBeGreaterThan(0);
    expect(data.totalQuestions).toBe(data.questions.length);
    
    // Should have services question
    const servicesQuestion = data.questions.find((q: any) => q.id === 'services');
    expect(servicesQuestion).toBeDefined();
    expect(servicesQuestion?.type).toBe('service-grid');
    expect(servicesQuestion?.priority).toBe(1);
  });
});