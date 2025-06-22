import { createGHLProClient } from '@/lib/ghl';
import { logger } from '@/lib/logger';

// Mock fetch globally
global.fetch = jest.fn();

describe('GoHighLevel Integration', () => {
  let ghlClient: ReturnType<typeof createGHLProClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GHL_PRIVATE_INTEGRATIONS_KEY = 'test-key';
    process.env.GHL_LOCATION_ID = 'test-location';
    process.env.GHL_AGENCY_ID = 'test-agency';
    
    ghlClient = createGHLProClient();
  });

  describe('Client Initialization', () => {
    it('should initialize with proper credentials', () => {
      expect(() => createGHLProClient()).not.toThrow();
    });

    it('should throw error if credentials missing', () => {
      delete process.env.GHL_PRIVATE_INTEGRATIONS_KEY;
      expect(() => createGHLProClient()).toThrow('GHL Pro API credentials not configured');
    });
  });

  describe('Contact Management', () => {
    it('should create a contact successfully', async () => {
      const mockResponse = {
        id: 'contact-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ghlClient.createContact('location-123', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        source: 'Website',
        tags: ['new-lead'],
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/contacts/'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('john@example.com'),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle contact creation errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Invalid contact data',
      });

      await expect(
        ghlClient.createContact('location-123', {
          firstName: 'John',
          email: 'invalid-email',
        })
      ).rejects.toThrow('Failed to create contact: 400 Invalid contact data');

      expect(logger.integrationError).toHaveBeenCalled();
    });
  });

  describe('SaaS Sub-Account Creation', () => {
    it('should create sub-account with industry snapshot', async () => {
      process.env.GHL_SNAPSHOT_ID_LANDSCAPING = 'landscaping-snapshot-123';
      
      const mockLocation = {
        id: 'new-location-123',
        name: 'Test Landscaping',
        email: 'test@landscaping.com',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocation,
      });

      const result = await ghlClient.createSaasSubAccount({
        businessName: 'Test Landscaping',
        email: 'test@landscaping.com',
        phone: '555-1234',
        address: '123 Main St',
        industry: 'landscaping',
        website: 'https://testlandscaping.com',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/locations/'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('landscaping-snapshot-123'),
        })
      );

      expect(result).toEqual(mockLocation);
    });

    it('should handle missing industry snapshot gracefully', async () => {
      const mockLocation = {
        id: 'new-location-123',
        name: 'Test Business',
        email: 'test@business.com',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocation,
      });

      const result = await ghlClient.createSaasSubAccount({
        businessName: 'Test Business',
        email: 'test@business.com',
        phone: '555-1234',
        address: '123 Main St',
        industry: 'unknown-industry',
      });

      expect(result).toEqual(mockLocation);
    });
  });

  describe('Form Submission to GHL', () => {
    it('should submit form data to GHL correctly', async () => {
      const mockContact = {
        id: 'contact-456',
        firstName: 'Jane',
        email: 'jane@example.com',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockContact,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const result = await ghlClient.submitFormToGHL({
        locationId: 'location-123',
        formId: 'form-123',
        firstName: 'Jane',
        email: 'jane@example.com',
        message: 'I need a quote',
        source: 'Contact Form',
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockContact);
    });
  });

  describe('Webhook Handling', () => {
    it('should process contact webhooks', async () => {
      const contactData = {
        id: 'contact-789',
        firstName: 'Test',
        email: 'test@example.com',
      };

      await ghlClient.handleContactWebhook('contact.create', contactData);
      
      expect(logger.info).toHaveBeenCalledWith(
        'New contact created via webhook',
        expect.objectContaining({ contactId: 'contact-789' })
      );
    });

    it('should process opportunity webhooks', async () => {
      const opportunityData = {
        id: 'opp-123',
        name: 'New Deal',
        monetaryValue: 5000,
        pipelineStageId: 'stage-1',
      };

      await ghlClient.handleOpportunityWebhook('opportunity.create', opportunityData);
      
      expect(logger.info).toHaveBeenCalledWith(
        'New opportunity created',
        expect.objectContaining({ opportunityId: 'opp-123' })
      );
    });

    it('should process appointment webhooks', async () => {
      const appointmentData = {
        id: 'apt-123',
        startTime: '2024-01-01T10:00:00Z',
        contactId: 'contact-123',
      };

      await ghlClient.handleAppointmentWebhook('appointment.create', appointmentData);
      
      expect(logger.info).toHaveBeenCalledWith(
        'Appointment created',
        expect.objectContaining({ appointmentId: 'apt-123' })
      );
    });
  });

  describe('Calendar Integration', () => {
    it('should fetch calendars', async () => {
      const mockCalendars = [
        { id: 'cal-1', name: 'Primary Calendar' },
        { id: 'cal-2', name: 'Secondary Calendar' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { calendars: mockCalendars } }),
      });

      const calendars = await ghlClient.getCalendars();
      
      expect(calendars).toEqual(mockCalendars);
    });

    it('should fetch calendar slots', async () => {
      const mockSlots = [
        { start: '2024-01-01T10:00:00Z', end: '2024-01-01T11:00:00Z' },
        { start: '2024-01-01T14:00:00Z', end: '2024-01-01T15:00:00Z' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { slots: mockSlots } }),
      });

      const slots = await ghlClient.getCalendarSlots(
        'cal-1',
        '2024-01-01',
        '2024-01-02'
      );
      
      expect(slots).toEqual(mockSlots);
    });
  });

  describe('Custom Fields', () => {
    it('should create custom fields for industry', async () => {
      const mockField = {
        id: 'field-123',
        name: 'property_size',
        dataType: 'TEXT',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockField,
      });

      const result = await ghlClient.createCustomField('location-123', {
        name: 'property_size',
        dataType: 'TEXT',
        placeholder: 'e.g., 1/4 acre',
      });

      expect(result).toEqual(mockField);
    });
  });
});
