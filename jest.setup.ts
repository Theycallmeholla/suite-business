import '@testing-library/jest-dom';

// Polyfill for ReadableStream
// This is needed because NextRequest uses ReadableStream, which is a Web API not available in Node.js by default.
global.ReadableStream = global.ReadableStream || class ReadableStream {
  constructor(options: any) {
    this.options = options;
    this._chunk = undefined;
    this._done = false;
  }

  getReader() {
    return {
      read: async () => {
        if (this.options.start) {
          const controller = {
            enqueue: (chunk: any) => { this._chunk = chunk; },
            close: () => { this._done = true; },
          };
          await this.options.start(controller);
        }
        if (this._done) {
          return { value: undefined, done: true };
        }
        return { value: this._chunk, done: false };
      },
      releaseLock: () => {},
    };
  }
} as any;

// Mock environment variables for tests
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.DATABASE_URL = 'sqlite::memory:';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/test',
  redirect: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth utility
jest.mock('@/lib/auth', () => ({
  getAuthSession: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    },
  })),
}));

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    site: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    form: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    formSubmission: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    team: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    teamMember: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    contact: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    siteAnalytics: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    businessIntelligence: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    intelligenceAnswer: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    siteContent: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    templateConfig: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    generatedContent: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    service: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    photo: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    apiError: jest.fn(),
    authError: jest.fn(),
    integrationError: jest.fn(),
  },
}));

// Mock email service
jest.mock('@/lib/email', () => ({
  emailService: {
    sendEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
    sendLeadNotification: jest.fn(),
    sendAppointmentConfirmation: jest.fn(),
  },
}));

// Mock fetch for API tests
global.fetch = jest.fn();

// Mock Request and Response
global.Request = global.Request || class Request {
  constructor(public url: string, public init?: RequestInit) {}
} as any;

global.Response = global.Response || class Response {
  constructor(public body: any, public init?: ResponseInit) {}
} as any;

// Mock NextRequest and NextResponse
global.NextRequest = class NextRequest {
  url: string;
  method: string;
  headers: Headers;
  body: ReadableStream | null;
  private _body: string;

  constructor(input: string | URL, init?: RequestInit) {
    this.url = input.toString();
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this._body = init?.body as string || '';
    this.body = this._body ? new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(init?.body as string));
        controller.close();
      }
    }) : null;
  }

  async text() {
    return this._body;
  }

  async json() {
    return JSON.parse(this._body);
  }
} as any;

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => {
      return {
        json: () => Promise.resolve(data),
        status: init?.status || 200,
        headers: new Headers(init?.headers),
      };
    }),
  },
  NextRequest: jest.fn().mockImplementation((input, init) => {
    const url = new URL(input);
    return {
      url: url.toString(),
      method: init?.method || 'GET',
      headers: new Headers(init?.headers),
      json: () => Promise.resolve(JSON.parse(init?.body || '{}')),
      text: () => Promise.resolve(init?.body || ''),
    };
  }),
}));

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Mock subdomain utilities
jest.mock('@/lib/subdomains', () => ({
  getSubdomainFromHeaders: jest.fn((headers) => {
    const host = headers.get('host') || '';
    if (host.includes('tenant1.')) return 'tenant1';
    if (host.includes('customdomain.com')) return 'customdomain.com';
    return null;
  }),
}));

// Mock Google Business Profile
jest.mock('@/lib/google-business-profile', () => ({
  GoogleBusinessProfile: jest.fn().mockImplementation(() => ({
    getAccounts: jest.fn(() => Promise.resolve([
      { name: 'accounts/123', type: 'PERSONAL' },
      { name: 'accounts/456', type: 'BUSINESS' },
    ])),
    getLocations: jest.fn((accountName) => {
      if (accountName === 'accounts/123') {
        return Promise.resolve([
          {
            name: 'locations/123',
            title: 'Test Location',
            storefrontAddress: { addressLines: ['123 Main St'], locality: 'Anytown', administrativeArea: 'TX', postalCode: '12345' },
          },
        ]);
      }
      return Promise.resolve([]);
    }),
    getLocation: jest.fn((locationName) => {
      if (locationName === 'locations/123') {
        return Promise.resolve({
          name: 'locations/123',
          title: 'Test Business',
          websiteUri: 'https://testbusiness.com',
          phoneNumbers: { primaryPhone: '555-1234' },
          regularHours: {
            periods: [
              { openDay: 'MONDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'MONDAY', closeTime: { hours: 17, minutes: 0 } },
              { openDay: 'TUESDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'TUESDAY', closeTime: { hours: 17, minutes: 0 } },
            ],
          },
        });
      }
      return Promise.resolve(null);
    }),
    getLocationPhotos: jest.fn(() => Promise.resolve({ mediaItems: [{ name: 'photos/1', googleUrl: 'http://example.com/photo1.jpg' }] })),
    searchGoogleLocations: jest.fn(() => Promise.resolve({ googleLocations: [{ name: 'locations/google/1', title: 'Google Test Location' }] })),
    getAuthUrl: jest.fn(() => Promise.resolve('http://auth.url')),
  })),
}));

// Mock GoHighLevel
jest.mock('@/lib/ghl', () => ({
  createSaasSubAccount: jest.fn(),
  deleteSaasSubAccount: jest.fn(),
  handleWebhook: jest.fn(),
  createGHLProClient: jest.fn(() => ({
    contacts: {
      create: jest.fn(),
      update: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
    },
    opportunities: {
      create: jest.fn(),
      update: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
    },
    calendars: {
      getCalendars: jest.fn(),
      getCalendarSlots: jest.fn(),
    },
    webhooks: {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    },
    createContact: jest.fn(),
    createSaasSubAccount: jest.fn(),
    submitFormToGHL: jest.fn(),
    handleContactWebhook: jest.fn(),
    handleOpportunityWebhook: jest.fn(),
    handleAppointmentWebhook: jest.fn(),
    getCalendars: jest.fn(),
    getCalendarSlots: jest.fn(),
    createCustomField: jest.fn(),
    handleWebhook: jest.fn(),
  })),
  GHL_WEBHOOK_EVENTS: {
    CONTACT_CREATE: 'contact.create',
    CONTACT_UPDATE: 'contact.update',
    OPPORTUNITY_CREATE: 'opportunity.create',
    APPOINTMENT_CREATE: 'appointment.create',
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock intelligence modules (only mock if they're imported in tests)
jest.mock('@/lib/intelligence/scoring', () => ({
  calculateDataScore: jest.fn(),
  scoreBusinessData: jest.fn(),
}));

jest.mock('@/lib/intelligence/question-orchestrator', () => ({
  orchestrateQuestions: jest.fn(),
  getNextQuestions: jest.fn(),
}));

jest.mock('@/lib/intelligence/inference-engine', () => ({
  InferenceEngine: jest.fn().mockImplementation(() => ({
    infer: jest.fn(),
    generateInsights: jest.fn(),
  })),
}));

// Mock orchestration modules
jest.mock('@/lib/orchestration/website-generation-orchestrator', () => {
  const { prisma } = require('@/lib/prisma'); // Import prisma here
  return {
    websiteGenerationOrchestrator: {
      generateWebsite: jest.fn(async (request) => {
        // Simulate fetching business intelligence data
        const businessIntelligence = await prisma.businessIntelligence.findUnique({
          where: { id: request.businessIntelligenceId },
        });

        if (!businessIntelligence) {
          throw new Error('Business intelligence data not found');
        }

        const businessName = businessIntelligence?.data?.gbp?.businessName || businessIntelligence?.data?.manual?.businessName;
        if (!businessName) {
          throw new Error('Business name is required');
        }

        let subdomain = businessName.toLowerCase().replace(/\s/g, '-');
        let subdomainExists = await prisma.site.findUnique({ where: { subdomain } });
        let counter = 1;
        while (subdomainExists) {
          subdomain = `${businessName.toLowerCase().replace(/\s/g, '-')}-${counter}`;
          subdomainExists = await prisma.site.findUnique({ where: { subdomain } });
          counter++;
        }

        const publishedUrl = `https://${subdomain}.example.com`;
        const siteId = 'site_123';

        // Simulate prisma.site.create calls
        prisma.site.create({
          data: {
            id: siteId,
            subdomain: subdomain,
            businessName: businessName,
            userId: request.userId,
            template: request.template || 'default-template',
            content: request.content || { hero: { title: 'Welcome' } },
            publishedUrl: publishedUrl,
            metadata: {
              conversionOptimized: request.options?.optimizeForConversion || false,
              generationTime: 1000,
              seoScore: 90,
              uniquenessScore: 85,
            },
            industry: request.industry,
            published: request.options?.publishImmediately || false,
          },
        });

        // Simulate prisma.service.createMany call
        if (request.answers?.services && request.answers.services.length > 0) {
          prisma.service.createMany({
            data: request.answers.services.map((service: string) => ({
              siteId: siteId,
              name: service,
            })),
          });
        }

        // Simulate progress callback calls
        if (request.progressCallback) {
          request.progressCallback({ step: '1', progress: 10, message: 'Starting generation' });
          request.progressCallback({ step: '2', progress: 30, message: 'Analyzing business data' });
          request.progressCallback({ step: '3', progress: 50, message: 'Generating content' });
          request.progressCallback({ step: '4', progress: 70, message: 'Designing layout' });
          request.progressCallback({ step: '5', progress: 90, message: 'Optimizing SEO' });
          request.progressCallback({ step: '6', progress: 95, message: 'Publishing site' });
          request.progressCallback({ step: '7', progress: 98, message: 'Finalizing' });
          request.progressCallback({ step: 'completion', progress: 100, message: 'Website generation complete!' });
        }

        return Promise.resolve({
          id: siteId,
          subdomain: subdomain,
          businessName: businessName,
          content: request.content || { hero: { title: 'Welcome' } },
          metadata: {
            conversionOptimized: request.options?.optimizeForConversion || false,
            generationTime: 1000,
            seoScore: 90,
            uniquenessScore: 85,
          },
          publishedUrl: publishedUrl,
          industry: request.industry,
          published: request.options?.publishImmediately || false,
        });
      }),
      generateWebsiteVariations: jest.fn(async (request) => {
        const variations = [];
        const businessIntelligence = await prisma.businessIntelligence.findUnique({
          where: { id: request.businessIntelligenceId },
        });
        const businessName = businessIntelligence?.data?.gbp?.businessName || 'Test Business';

        for (let i = 0; i < 3; i++) {
          const subdomain = `${businessName.toLowerCase().replace(/\s/g, '-')}-${i + 1}`;
          const siteId = `site_${i + 1}`;
          prisma.site.create({
            data: {
              id: siteId,
              subdomain: subdomain,
              businessName: businessName,
              userId: request.userId,
              template: request.template || 'default-template',
              content: request.content || { hero: { title: 'Welcome' } },
              publishedUrl: `https://${subdomain}.example.com`,
              metadata: {
                conversionOptimized: true,
                generationTime: 1000,
                seoScore: 90,
                uniquenessScore: 85,
              },
              industry: request.industry,
              published: false,
            },
          });
          variations.push({
            id: siteId,
            subdomain: subdomain,
            businessName: businessName,
            content: request.content || { hero: { title: 'Welcome' } },
            metadata: {
              conversionOptimized: true,
              generationTime: 1000,
              seoScore: 90,
              uniquenessScore: 85,
            },
            publishedUrl: `https://${subdomain}.example.com`,
            industry: request.industry,
            published: false,
          });
        }
        return Promise.resolve(variations);
      }),
    },
  };
});

// Mock content generation modules
jest.mock('@/lib/content-generation/ai-content-engine', () => ({
  aiContentEngine: {
    generateWebsiteCopy: jest.fn(),
    generateSectionContent: jest.fn(),
  },
}));

// Mock template engine modules  
jest.mock('@/lib/template-engine/adaptive-template-engine', () => ({
  AdaptiveTemplateEngine: jest.fn().mockImplementation(() => ({
    generateTemplate: jest.fn(),
    selectTemplate: jest.fn(),
  })),
}));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
