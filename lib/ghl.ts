// GoHighLevel Pro Plan Client with SaaS Mode Support - CONSOLIDATED
import { logger } from '@/lib/logger';

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

interface GHLConfig {
  apiKey: string;
  locationId: string;
  saasKey?: string;
}

interface GHLBusinessData {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  website?: string;
}

interface GHLLocation {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  companyId: string;
  apiKey?: string; // API key for sub-account
  requiresManualApiKeySetup?: boolean; // Flag to indicate manual setup needed
}

interface GHLUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: string;
}

// CRM Interfaces
export interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string[];
  customFields: Record<string, any>;
  dateAdded: string;
  lastActivity: string;
}

export interface GHLOpportunity {
  id: string;
  name: string;
  contactId: string;
  pipelineId: string;
  pipelineStageId: string;
  monetaryValue: number;
  status: string;
  assignedTo: string;
}

export interface GHLAppointment {
  id: string;
  title: string;
  contactId: string;
  calendarId: string;
  startTime: string;
  endTime: string;
  status: string;
}

export class GHLProClient {
  private apiKey: string;
  private locationId: string;
  private saasKey?: string;

  constructor(config: GHLConfig) {
    this.apiKey = config.apiKey;
    this.locationId = config.locationId;
    this.saasKey = config.saasKey;
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };
  }

  // Helper method for API calls (replaces axios with fetch)
  private async apiCall(method: string, endpoint: string, options?: {
    params?: Record<string, any>;
    data?: any;
  }) {
    let url = `${GHL_API_BASE}${endpoint}`;
    
    // Add query parameters
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers: this.headers,
    };

    if (options?.data) {
      fetchOptions.body = JSON.stringify(options.data);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GHL API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return { data };
  }

  // SaaS Mode: Auto-create sub-account for new client
  async createSaasSubAccount(businessData: GHLBusinessData): Promise<GHLLocation> {
    try {
      // Get company ID from environment
      const companyId = process.env.GHL_AGENCY_ID;
      
      if (!companyId) {
        throw new Error('GHL_AGENCY_ID not configured in environment variables');
      }
      
      // Step 1: Create location using SaaS mode
      const locationData = {
        companyId: companyId,
        name: businessData.businessName,
        email: businessData.email,
        phone: businessData.phone,
        address: businessData.address,
        website: businessData.website,
        // Auto-apply agency snapshot if available
        snapshotId: this.getIndustrySnapshot(businessData.industry),
      };
      
      // Remove undefined fields
      Object.keys(locationData).forEach(key => {
        if (locationData[key as keyof typeof locationData] === undefined || 
            locationData[key as keyof typeof locationData] === '') {
          delete locationData[key as keyof typeof locationData];
        }
      });
      
      logger.debug('Creating GHL location with data:', locationData);
      
      const locationResponse = await fetch(`${GHL_API_BASE}/locations/`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(locationData),
      });

      if (!locationResponse.ok) {
        const errorData = await locationResponse.text();
        throw new Error(`Failed to create GHL location: ${locationResponse.status} ${errorData}`);
      }

      const newLocation: GHLLocation = await locationResponse.json();
      
      logger.info('GHL location created successfully', {
        locationId: newLocation.id,
        name: newLocation.name
      });

      // Step 2: Set up rebilling for this location
      try {
        await this.setupRebilling(newLocation.id);
      } catch (rebillingError) {
        logger.warn('Failed to set up rebilling, continuing...', rebillingError);
      }

      // Step 3: Create admin user for the client
      try {
        await this.createLocationUser(newLocation.id, {
          email: businessData.email,
          firstName: businessData.businessName.split(' ')[0], // Use first word as firstName
          role: 'admin',
        });
      } catch (userError) {
        logger.warn('Failed to create admin user, continuing...', userError);
      }

      // Step 4: Create API key for the sub-account
      let apiKey = '';
      try {
        const apiKeyResponse = await this.createLocationApiKey(newLocation.id, businessData.businessName);
        apiKey = apiKeyResponse.key;
      } catch (apiKeyError) {
        logger.warn('Failed to create API key for sub-account, continuing...', apiKeyError);
      }

      // Trigger webhook for manual API key setup if needed
      if (!apiKey || apiKey === this.apiKey) {
        try {
          await this.triggerApiKeySetupNotification(newLocation.id, businessData.email);
        } catch (notificationError) {
          logger.warn('Failed to send API key setup notification', notificationError);
        }
      }

      return {
        ...newLocation,
        apiKey, // Include the API key in the response
        requiresManualApiKeySetup: !apiKey || apiKey === this.apiKey,
      };
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'create_saas_subaccount',
        metadata: { businessName: businessData.businessName }
      });
      throw error;
    }
  }

  // Set up rebilling with markup
  async setupRebilling(locationId: string): Promise<void> {
    try {
      const response = await fetch(`${GHL_API_BASE}/locations/${locationId}/rebilling`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          sms: {
            enabled: true,
            markup: 50, // 50% markup on SMS
          },
          email: {
            enabled: true,
            markup: 30, // 30% markup on email
          },
          phone: {
            enabled: true,
            markup: 40, // 40% markup on voice
          },
          ai: {
            enabled: true,
            markup: 60, // 60% markup on AI features
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to setup rebilling: ${response.status} ${errorData}`);
      }
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'setup_rebilling',
        metadata: { locationId }
      });
    }
  }

  // Create user for location
  async createLocationUser(locationId: string, userData: {
    email: string;
    firstName: string;
    role: string;
  }): Promise<GHLUser> {
    try {
      const response = await fetch(`${GHL_API_BASE}/locations/${locationId}/users`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create location user: ${response.status} ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'create_location_user',
        metadata: { locationId, email: userData.email }
      });
      throw error;
    }
  }

  // Create API key for location
  async createLocationApiKey(locationId: string, name: string): Promise<{ key: string; id: string; type: string }> {
    try {
      // GoHighLevel v2 API doesn't support programmatic API key creation for sub-accounts
      // Best practice is to use Agency-level Private Integration tokens with locationId
      logger.info('Using agency-level authentication for sub-account operations');
      
      // Return agency key with location context
      // All API calls should include locationId in the request to scope operations
      return {
        key: this.apiKey, // Agency Private Integration key
        id: locationId,
        type: 'agency_private_integration'
      };
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'create_api_key',
        metadata: { locationId }
      });
      throw error;
    }
  }

  // Delete a location/sub-account
  async deleteLocation(locationId: string): Promise<void> {
    try {
      logger.info('Deleting GoHighLevel location', { locationId });
      
      const response = await fetch(`${GHL_API_BASE}/locations/${locationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete location: ${response.status} ${errorData}`);
      }

      logger.info('Successfully deleted GoHighLevel location', { locationId });
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'delete_location',
        metadata: { locationId }
      });
      throw error;
    }
  }

  // Trigger notification for manual API key setup
  private async triggerApiKeySetupNotification(locationId: string, email: string): Promise<void> {
    try {
      // Option 1: Send internal notification via webhook
      if (process.env.GHL_WEBHOOK_URL) {
        await fetch(process.env.GHL_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': process.env.GHL_WEBHOOK_SECRET || '',
          },
          body: JSON.stringify({
            event: 'location.requires_api_key',
            locationId,
            email,
            timestamp: new Date().toISOString(),
            message: `New location ${locationId} requires manual API key generation`,
          }),
        });
      }

      // Option 2: Create a task in GHL for follow-up
      await this.createTask({
        title: 'Generate API Key for Sub-Account',
        body: `Please generate an API key for location ${locationId} (${email}) via the GHL UI`,
        assignedTo: process.env.GHL_DEFAULT_USER_ID,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Due in 24 hours
      });
    } catch (error) {
      logger.error('Failed to trigger API key setup notification', error);
    }
  }

  // Get industry-specific snapshot
  private getIndustrySnapshot(industry: string): string {
    const snapshots: Record<string, string> = {
      landscaping: process.env.GHL_SNAPSHOT_ID_LANDSCAPING || '',
      hvac: process.env.GHL_SNAPSHOT_ID_HVAC || '',
      plumbing: process.env.GHL_SNAPSHOT_ID_PLUMBING || '',
      cleaning: process.env.GHL_SNAPSHOT_ID_CLEANING || '',
      roofing: process.env.GHL_SNAPSHOT_ID_ROOFING || '',
      electrical: process.env.GHL_SNAPSHOT_ID_ELECTRICAL || '',
    };
    return snapshots[industry] || process.env.GHL_SNAPSHOT_ID_DEFAULT || '';
  }

  // Create a contact (lead) in GHL
  async createContact(locationId: string, contactData: {
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    source?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  }): Promise<any> {
    try {
      const response = await fetch(`${GHL_API_BASE}/contacts/`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          locationId,
          ...contactData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create contact: ${response.status} ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'create_contact',
        metadata: { locationId, email: contactData.email }
      });
      throw error;
    }
  }

  // Get location details
  async getLocation(locationId: string): Promise<GHLLocation> {
    try {
      const response = await fetch(`${GHL_API_BASE}/locations/${locationId}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to get location: ${response.status} ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'get_location',
        metadata: { locationId }
      });
      throw error;
    }
  }

  // Update location settings
  async updateLocation(locationId: string, updateData: Partial<GHLLocation>): Promise<GHLLocation> {
    try {
      const response = await fetch(`${GHL_API_BASE}/locations/${locationId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update location: ${response.status} ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'update_location',
        metadata: { locationId }
      });
      throw error;
    }
  }

  // Webhook handling
  async handleWebhook(payload: any) {
    const { type, data } = payload;

    switch (type) {
      case 'ContactCreate':
        // New lead came in
        logger.info('New GHL contact created', { contactId: data.id });
        break;
      case 'AppointmentScheduled':
        // Appointment booked
        logger.info('GHL appointment scheduled', { appointmentId: data.id });
        break;
      case 'SMSSent':
        // Track for rebilling
        logger.info('GHL SMS sent', { messageId: data.id });
        break;
      default:
        logger.debug('Unhandled GHL webhook type', { type });
    }
  }

  // Get location analytics
  async getLocationAnalytics(locationId: string): Promise<any> {
    try {
      const response = await fetch(`${GHL_API_BASE}/locations/${locationId}/analytics`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to get location analytics: ${response.status} ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'get_location_analytics',
        metadata: { locationId }
      });
      throw error;
    }
  }

  // Create workflow/automation
  async createWorkflow(locationId: string, workflowData: {
    name: string;
    industry: string;
    triggers: any[];
    actions: any[];
  }): Promise<any> {
    try {
      const response = await fetch(`${GHL_API_BASE}/locations/${locationId}/workflows`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create workflow: ${response.status} ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'create_workflow',
        metadata: { locationId, workflowName: workflowData.name }
      });
      throw error;
    }
  }

  // Get custom fields for a location
  async getCustomFields(locationId: string): Promise<any[]> {
    try {
      const response = await fetch(`${GHL_API_BASE}/locations/${locationId}/customFields`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to get custom fields: ${response.status} ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'get_custom_fields',
        metadata: { locationId }
      });
      throw error;
    }
  }

  // Create custom field
  async createCustomField(locationId: string, fieldData: {
    name: string;
    dataType: 'TEXT' | 'LARGE_TEXT' | 'NUMERICAL' | 'PHONE' | 'DATE' | 'DROPDOWN' | 'CHECKBOX' | 'RADIO' | 'MONETARY';
    placeholder?: string;
    position?: number;
    options?: string[]; // For DROPDOWN, CHECKBOX, RADIO
  }): Promise<any> {
    try {
      const response = await fetch(`${GHL_API_BASE}/locations/${locationId}/customFields`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(fieldData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create custom field: ${response.status} ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'create_custom_field',
        metadata: { locationId, fieldName: fieldData.name }
      });
      throw error;
    }
  }

  // ================= CRM FUNCTIONALITY (from ghl-crm.ts) =================

  // Contact Management
  async getContacts(filters?: {
    search?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }) {
    try {
      const params: any = {
        locationId: this.locationId,
        limit: filters?.limit || 20,
        skip: filters?.offset || 0,
      };

      if (filters?.search) {
        params.query = filters.search;
      }

      if (filters?.tags?.length) {
        params.query = `tag:${filters.tags.join(',')}`;
      }

      const response = await this.apiCall('GET', '/contacts', { params });
      return response.data.contacts as GHLContact[];
    } catch (error) {
      logger.error('Failed to fetch contacts', error);
      throw error;
    }
  }

  async getContactById(contactId: string) {
    try {
      const response = await this.apiCall('GET', `/contacts/${contactId}`);
      return response.data.contact as GHLContact;
    } catch (error) {
      logger.error('Failed to fetch contact', error);
      throw error;
    }
  }

  async updateContact(contactId: string, updates: Partial<GHLContact>) {
    try {
      const response = await this.apiCall('PUT', `/contacts/${contactId}`, {
        data: updates,
      });
      return response.data.contact as GHLContact;
    } catch (error) {
      logger.error('Failed to update contact', error);
      throw error;
    }
  }

  // Pipeline Management
  async getPipelines() {
    try {
      const response = await this.apiCall('GET', '/pipelines', {
        params: { locationId: this.locationId },
      });
      return response.data.pipelines;
    } catch (error) {
      logger.error('Failed to fetch pipelines', error);
      throw error;
    }
  }

  async getOpportunities(filters?: {
    pipelineId?: string;
    stageId?: string;
    contactId?: string;
    assignedTo?: string;
  }) {
    try {
      const params: any = {
        location_id: this.locationId,
      };

      if (filters?.pipelineId) params.pipeline_id = filters.pipelineId;
      if (filters?.stageId) params.pipeline_stage_id = filters.stageId;
      if (filters?.contactId) params.contact_id = filters.contactId;
      if (filters?.assignedTo) params.assigned_to = filters.assignedTo;

      const response = await this.apiCall('GET', '/opportunities', { params });
      return response.data.opportunities as GHLOpportunity[];
    } catch (error) {
      logger.error('Failed to fetch opportunities', error);
      throw error;
    }
  }

  async createOpportunity(opportunityData: {
    name: string;
    contactId: string;
    pipelineId: string;
    pipelineStageId: string;
    monetaryValue?: number;
  }) {
    try {
      const response = await this.apiCall('POST', '/opportunities', {
        data: {
          ...opportunityData,
          location_id: this.locationId,
        },
      });
      return response.data.opportunity as GHLOpportunity;
    } catch (error) {
      logger.error('Failed to create opportunity', error);
      throw error;
    }
  }

  async moveOpportunity(opportunityId: string, newStageId: string) {
    try {
      const response = await this.apiCall('PUT', `/opportunities/${opportunityId}`, {
        data: {
          pipeline_stage_id: newStageId,
        },
      });
      return response.data.opportunity as GHLOpportunity;
    } catch (error) {
      logger.error('Failed to move opportunity', error);
      throw error;
    }
  }

  // Communication
  async getConversations(contactId?: string) {
    try {
      const params: any = {
        locationId: this.locationId,
      };
      
      if (contactId) {
        params.contactId = contactId;
      }

      const response = await this.apiCall('GET', '/conversations', { params });
      return response.data.conversations;
    } catch (error) {
      logger.error('Failed to fetch conversations', error);
      throw error;
    }
  }

  async sendSMS(contactId: string, message: string) {
    try {
      const response = await this.apiCall('POST', '/conversations/messages', {
        data: {
          type: 'SMS',
          contactId,
          message,
          locationId: this.locationId,
        },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to send SMS', error);
      throw error;
    }
  }

  async sendEmail(contactId: string, subject: string, body: string, html?: string) {
    try {
      const response = await this.apiCall('POST', '/emails', {
        data: {
          contactId,
          subject,
          body,
          html: html || body,
          locationId: this.locationId,
        },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to send email', error);
      throw error;
    }
  }

  // Calendar & Appointments
  async getAppointments(filters?: {
    contactId?: string;
    calendarId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const params: any = {
        locationId: this.locationId,
      };

      if (filters?.contactId) params.contactId = filters.contactId;
      if (filters?.calendarId) params.calendarId = filters.calendarId;
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;

      const response = await this.apiCall('GET', '/appointments', { params });
      return response.data.appointments as GHLAppointment[];
    } catch (error) {
      logger.error('Failed to fetch appointments', error);
      throw error;
    }
  }

  async createAppointment(appointmentData: {
    title: string;
    contactId: string;
    calendarId: string;
    startTime: string;
    endTime: string;
    appointmentStatus?: string;
  }) {
    try {
      const response = await this.apiCall('POST', '/appointments', {
        data: {
          ...appointmentData,
          locationId: this.locationId,
        },
      });
      return response.data.appointment as GHLAppointment;
    } catch (error) {
      logger.error('Failed to create appointment', error);
      throw error;
    }
  }

  // Tasks
  async getTasks(filters?: {
    contactId?: string;
    assignedTo?: string;
    completed?: boolean;
  }) {
    try {
      const params: any = {
        locationId: this.locationId,
      };

      if (filters?.contactId) params.contactId = filters.contactId;
      if (filters?.assignedTo) params.assignedTo = filters.assignedTo;
      if (filters?.completed !== undefined) params.completed = filters.completed;

      const response = await this.apiCall('GET', '/tasks', { params });
      return response.data.tasks;
    } catch (error) {
      logger.error('Failed to fetch tasks', error);
      throw error;
    }
  }

  async createTask(taskData: {
    title: string;
    body?: string;
    contactId?: string;
    assignedTo?: string;
    dueDate?: string;
  }) {
    try {
      const response = await this.apiCall('POST', '/tasks', {
        data: {
          ...taskData,
          locationId: this.locationId,
        },
      });
      return response.data.task;
    } catch (error) {
      logger.error('Failed to create task', error);
      throw error;
    }
  }

  // Analytics
  async getContactStats() {
    try {
      const response = await this.apiCall('GET', `/locations/${this.locationId}/analytics`, {
        params: {
          type: 'contacts',
          period: 'last30days',
        },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch contact stats', error);
      throw error;
    }
  }

  // ================= WEBHOOK HANDLERS =================

  async handleContactWebhook(event: string, data: any) {
    switch (event) {
      case 'contact.create':
        logger.info('New contact created via webhook', { contactId: data.id });
        // Trigger welcome automation
        break;
      case 'contact.update':
        logger.info('Contact updated via webhook', { contactId: data.id });
        break;
      case 'contact.delete':
        logger.info('Contact deleted via webhook', { contactId: data.id });
        break;
    }
  }

  async handleOpportunityWebhook(event: string, data: any) {
    switch (event) {
      case 'opportunity.create':
        logger.info('New opportunity created', { opportunityId: data.id });
        break;
      case 'opportunity.stage_change':
        logger.info('Opportunity stage changed', { 
          opportunityId: data.id,
          newStage: data.pipelineStageId 
        });
        break;
      case 'opportunity.status_change':
        logger.info('Opportunity status changed', { 
          opportunityId: data.id,
          status: data.status 
        });
        break;
    }
  }

  async handleAppointmentWebhook(event: string, data: any) {
    switch (event) {
      case 'appointment.create':
        logger.info('Appointment created', { appointmentId: data.id });
        break;
      case 'appointment.update':
        logger.info('Appointment updated', { appointmentId: data.id });
        break;
      case 'appointment.delete':
        logger.info('Appointment cancelled', { appointmentId: data.id });
        break;
    }
  }

  // ================= CALENDAR INTEGRATION =================

  async getCalendars(locationId?: string) {
    try {
      const response = await this.apiCall('GET', '/calendars', {
        params: { locationId: locationId || this.locationId }
      });
      return response.data.calendars;
    } catch (error) {
      logger.error('Failed to fetch calendars', error);
      throw error;
    }
  }

  async getCalendarSlots(calendarId: string, startDate: string, endDate: string) {
    try {
      const response = await this.apiCall('GET', `/calendars/${calendarId}/free-slots`, {
        params: { startDate, endDate }
      });
      return response.data.slots;
    } catch (error) {
      logger.error('Failed to fetch calendar slots', error);
      throw error;
    }
  }

  // ================= FORMS INTEGRATION =================

  async submitFormToGHL(formData: {
    locationId: string;
    formId?: string;
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    message?: string;
    source?: string;
    customFields?: Record<string, any>;
  }) {
    try {
      // Create contact from form submission
      const contact = await this.createContact(formData.locationId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        source: formData.source || 'Website Form',
        tags: ['website-lead', formData.formId || 'contact-form'],
        customFields: formData.customFields
      });

      // Create a note if message provided
      if (formData.message) {
        await this.apiCall('POST', `/contacts/${contact.id}/notes`, {
          data: {
            body: formData.message,
            userId: 'system'
          }
        });
      }

      // Trigger form submission webhook
      if (formData.formId) {
        await this.apiCall('POST', '/webhooks/trigger', {
          data: {
            type: 'form.submit',
            formId: formData.formId,
            contactId: contact.id,
            locationId: formData.locationId
          }
        });
      }

      return contact;
    } catch (error) {
      logger.error('Failed to submit form to GHL', error);
      throw error;
    }
  }
}

// Factory function with environment config
export function createGHLProClient() {
  // Use Private Integration key for API v2
  const apiKey = process.env.GHL_PRIVATE_INTEGRATIONS_KEY || process.env.GHL_API_KEY;
  
  const config = {
    apiKey: apiKey!,
    locationId: process.env.GHL_LOCATION_ID!,
    saasKey: process.env.GHL_SAAS_MODE_KEY,
  };

  if (!config.apiKey || !config.locationId) {
    throw new Error('GHL Pro API credentials not configured');
  }

  return new GHLProClient(config);
}

// Industry-specific automation templates
export const industryAutomations = {
  landscaping: {
    workflows: [
      'new-lead-nurture',
      'quote-followup',
      'seasonal-reminder',
      'review-request',
    ],
    customFields: [
      { name: 'property_size', dataType: 'TEXT' as const, placeholder: 'e.g., 1/4 acre' },
      { name: 'service_frequency', dataType: 'DROPDOWN' as const, options: ['Weekly', 'Bi-weekly', 'Monthly', 'One-time'] },
      { name: 'irrigation_system', dataType: 'CHECKBOX' as const, options: ['Yes', 'No'] },
      { name: 'preferred_service_day', dataType: 'DROPDOWN' as const, options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    ],
  },
  hvac: {
    workflows: [
      'maintenance-reminder',
      'emergency-response',
      'warranty-followup',
      'seasonal-checkup',
    ],
    customFields: [
      { name: 'system_type', dataType: 'DROPDOWN' as const, options: ['Central AC', 'Heat Pump', 'Furnace', 'Boiler', 'Ductless Mini-Split'] },
      { name: 'install_date', dataType: 'DATE' as const },
      { name: 'warranty_status', dataType: 'DROPDOWN' as const, options: ['Under Warranty', 'Extended Warranty', 'Expired'] },
      { name: 'last_service_date', dataType: 'DATE' as const },
    ],
  },
  plumbing: {
    workflows: [
      'emergency-response',
      'appointment-reminder',
      'maintenance-followup',
      'review-request',
    ],
    customFields: [
      { name: 'property_type', dataType: 'DROPDOWN' as const, options: ['Residential', 'Commercial', 'Industrial'] },
      { name: 'water_heater_age', dataType: 'NUMERICAL' as const, placeholder: 'Years' },
      { name: 'has_sump_pump', dataType: 'CHECKBOX' as const, options: ['Yes', 'No'] },
      { name: 'pipe_material', dataType: 'DROPDOWN' as const, options: ['Copper', 'PVC', 'PEX', 'Galvanized', 'Unknown'] },
    ],
  },
  cleaning: {
    workflows: [
      'new-client-onboarding',
      'recurring-service-reminder',
      'quality-check-followup',
      'referral-request',
    ],
    customFields: [
      { name: 'property_size', dataType: 'DROPDOWN' as const, options: ['< 1000 sq ft', '1000-2000 sq ft', '2000-3000 sq ft', '> 3000 sq ft'] },
      { name: 'service_frequency', dataType: 'DROPDOWN' as const, options: ['Weekly', 'Bi-weekly', 'Monthly', 'One-time'] },
      { name: 'pets', dataType: 'CHECKBOX' as const, options: ['Dogs', 'Cats', 'Other', 'None'] },
      { name: 'preferred_products', dataType: 'DROPDOWN' as const, options: ['Standard', 'Eco-friendly', 'Hypoallergenic'] },
    ],
  },
  roofing: {
    workflows: [
      'inspection-followup',
      'quote-nurture',
      'warranty-registration',
      'storm-damage-outreach',
    ],
    customFields: [
      { name: 'roof_age', dataType: 'NUMERICAL' as const, placeholder: 'Years' },
      { name: 'roof_type', dataType: 'DROPDOWN' as const, options: ['Asphalt Shingle', 'Metal', 'Tile', 'Slate', 'Flat/Rubber'] },
      { name: 'last_inspection_date', dataType: 'DATE' as const },
      { name: 'insurance_claim', dataType: 'CHECKBOX' as const, options: ['Yes', 'No'] },
    ],
  },
  electrical: {
    workflows: [
      'safety-inspection-reminder',
      'emergency-response',
      'permit-followup',
      'maintenance-schedule',
    ],
    customFields: [
      { name: 'panel_type', dataType: 'DROPDOWN' as const, options: ['100 Amp', '150 Amp', '200 Amp', '400 Amp', 'Unknown'] },
      { name: 'property_age', dataType: 'NUMERICAL' as const, placeholder: 'Years' },
      { name: 'has_generator', dataType: 'CHECKBOX' as const, options: ['Yes', 'No'] },
      { name: 'last_inspection_date', dataType: 'DATE' as const },
    ],
  },
};

// Webhook event types for reference
export const GHL_WEBHOOK_EVENTS = {
  CONTACT: [
    'contact.create',
    'contact.update', 
    'contact.delete',
    'contact.tag.create',
    'contact.tag.delete'
  ],
  OPPORTUNITY: [
    'opportunity.create',
    'opportunity.update',
    'opportunity.delete',
    'opportunity.stage_change',
    'opportunity.status_change'
  ],
  APPOINTMENT: [
    'appointment.create',
    'appointment.update',
    'appointment.delete',
    'appointment.confirmed',
    'appointment.cancelled'
  ],
  FORM: [
    'form.submit'
  ],
  CONVERSATION: [
    'conversation.message.inbound',
    'conversation.message.outbound',
    'conversation.unread'
  ]
};


