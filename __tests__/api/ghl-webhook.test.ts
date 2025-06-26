// Mock Request before importing anything else
global.Request = global.Request || class Request {
  constructor(public url: string, public init?: RequestInit) {}
};

import { POST } from '@/app/api/ghl/webhook/route';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email';
import crypto from 'crypto';

// Mock dependencies
jest.mock('@/lib/prisma');
jest.mock('@/lib/email');
jest.mock('@/lib/ghl', () => ({
  createGHLProClient: jest.fn(() => ({
    handleWebhook: jest.fn(),
  })),
  GHL_WEBHOOK_EVENTS: {
    CONTACT_CREATE: 'contact.create',
    CONTACT_UPDATE: 'contact.update',
    APPOINTMENT_CREATE: 'appointment.create',
  },
}));

// Mock NextRequest
const NextRequest = global.NextRequest;

describe('GHL Webhook Handler', () => {
  const mockSite = {
    id: 'site-123',
    businessName: 'Test Business',
    email: 'business@test.com',
    phone: '555-1234',
    subdomain: 'test',
    ghlLocationId: 'loc-123',
    user: { id: 'user-123' },
    team: { id: 'team-123' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GHL_WEBHOOK_SECRET = 'test-secret';
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'example.com';
  });

  describe('POST handler', () => {
    it('should reject requests with invalid signature', async () => {
      const body = JSON.stringify({
        type: 'contact.create',
        locationId: 'loc-123',
        data: {},
      });

      const request = new NextRequest('http://localhost/api/ghl/webhook', {
        method: 'POST',
        body,
        headers: {
          'x-ghl-signature': 'invalid-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid signature');
    });

    it('should accept requests with valid signature', async () => {
      const body = JSON.stringify({
        type: 'contact.create',
        locationId: 'loc-123',
        data: {
          id: 'contact-456',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-5678',
        },
      });

      const signature = 'sha256=' + crypto
        .createHmac('sha256', 'test-secret')
        .update(body)
        .digest('hex');

      const request = new NextRequest('http://localhost/api/ghl/webhook', {
        method: 'POST',
        body,
        headers: {
          'x-ghl-signature': signature,
        },
      });

      (prisma.site.findFirst as jest.Mock).mockResolvedValue(mockSite);
      (prisma.contact.upsert as jest.Mock).mockResolvedValue({});
      (prisma.siteAnalytics.upsert as jest.Mock).mockResolvedValue({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true, processed: true });
    });

    it('should handle contact creation event', async () => {
      const contactData = {
        id: 'contact-456',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-5678',
        source: 'Website',
      };

      const body = JSON.stringify({
        type: 'contact.create',
        locationId: 'loc-123',
        data: contactData,
      });

      const signature = 'sha256=' + crypto
        .createHmac('sha256', 'test-secret')
        .update(body)
        .digest('hex');

      const request = new NextRequest('http://localhost/api/ghl/webhook', {
        method: 'POST',
        body,
        headers: {
          'x-ghl-signature': signature,
        },
      });

      (prisma.site.findFirst as jest.Mock).mockResolvedValue(mockSite);
      (prisma.contact.upsert as jest.Mock).mockResolvedValue({});
      (prisma.siteAnalytics.upsert as jest.Mock).mockResolvedValue({});
      (emailService.sendEmail as jest.Mock).mockResolvedValue({});

      const response = await POST(request);

      expect(response.status).toBe(200);
      
      // Verify contact was created/updated
      expect(prisma.contact.upsert).toHaveBeenCalledWith({
        where: { ghlContactId: 'contact-456' },
        update: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-5678',
        }),
        create: expect.objectContaining({
          ghlContactId: 'contact-456',
          siteId: 'site-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-5678',
        }),
      });

      // Verify analytics were updated
      expect(prisma.siteAnalytics.upsert).toHaveBeenCalled();

      // Verify email was sent
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'business@test.com',
          subject: expect.stringContaining('New Lead: John Doe'),
        })
      );
    });

    it('should handle appointment scheduling event', async () => {
      const appointmentData = {
        id: 'apt-789',
        startTime: '2024-06-25T10:00:00Z',
        contactEmail: 'john@example.com',
        contactName: 'John Doe',
        location: '123 Main St',
        notes: 'First consultation',
      };

      const body = JSON.stringify({
        type: 'appointment.create',
        locationId: 'loc-123',
        data: appointmentData,
      });

      const signature = 'sha256=' + crypto
        .createHmac('sha256', 'test-secret')
        .update(body)
        .digest('hex');

      const request = new NextRequest('http://localhost/api/ghl/webhook', {
        method: 'POST',
        body,
        headers: {
          'x-ghl-signature': signature,
        },
      });

      (prisma.site.findFirst as jest.Mock).mockResolvedValue(mockSite);
      (prisma.siteAnalytics.upsert as jest.Mock).mockResolvedValue({});
      (emailService.sendEmail as jest.Mock).mockResolvedValue({});

      const response = await POST(request);

      expect(response.status).toBe(200);

      // Verify analytics were updated for conversion
      expect(prisma.siteAnalytics.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            conversions: { increment: 1 },
          }),
        })
      );

      // Verify confirmation email was sent
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: 'Appointment Confirmation - Test Business',
        })
      );
    });

    it('should return 200 for unknown site to prevent retries', async () => {
      const body = JSON.stringify({
        type: 'contact.create',
        locationId: 'unknown-location',
        data: {},
      });

      const signature = 'sha256=' + crypto
        .createHmac('sha256', 'test-secret')
        .update(body)
        .digest('hex');

      const request = new NextRequest('http://localhost/api/ghl/webhook', {
        method: 'POST',
        body,
        headers: {
          'x-ghl-signature': signature,
        },
      });

      (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ 
        received: true, 
        message: 'No associated site found' 
      });
    });

    it('should handle invalid payload gracefully', async () => {
      const body = JSON.stringify({
        // Missing required fields
        data: {},
      });

      const signature = 'sha256=' + crypto
        .createHmac('sha256', 'test-secret')
        .update(body)
        .digest('hex');

      const request = new NextRequest('http://localhost/api/ghl/webhook', {
        method: 'POST',
        body,
        headers: {
          'x-ghl-signature': signature,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid payload format');
    });
  });
});