import '@testing-library/jest-dom';

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

global.NextResponse = {
  json: (data: any, init?: ResponseInit) => {
    return {
      json: async () => data,
      status: init?.status || 200,
      headers: new Headers(init?.headers),
    };
  },
} as any;

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
    getLocations: jest.fn(),
    getLocation: jest.fn(),
    searchLocations: jest.fn(),
    getAuthUrl: jest.fn(),
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
jest.mock('@/lib/orchestration/website-generation-orchestrator', () => ({
  websiteGenerationOrchestrator: {
    generateWebsite: jest.fn(() => Promise.resolve({
      id: 'site_123',
      subdomain: 'test-site',
      businessName: 'Test Business',
      content: {
        hero: { title: 'Welcome' },
      },
    })),
    generateWebsiteVariations: jest.fn(() => Promise.resolve([
      { id: 'site_1' },
      { id: 'site_2' },
      { id: 'site_3' },
    ])),
  },
}));

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
