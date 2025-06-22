import { logger } from '@/lib/logger';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags?: string[];
  customFields?: Record<string, any>;
  dateAdded: string;
  dateUpdated: string;
}

interface ContactsFilter {
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

interface CreateContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

interface Opportunity {
  id: string;
  name: string;
  contactId: string;
  status: string;
  stage: string;
  monetaryValue?: number;
  pipelineId: string;
  pipelineStageId: string;
  assignedTo?: string;
  dateCreated: string;
  dateUpdated: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  contactId?: string;
  assignedTo?: string;
  completed: boolean;
  dateCreated: string;
  dateUpdated: string;
}

class GHLCRMClient {
  private apiKey: string;
  private locationId: string;
  private baseUrl: string;

  constructor(apiKey: string, locationId: string) {
    this.apiKey = apiKey;
    this.locationId = locationId;
    this.baseUrl = 'https://rest.gohighlevel.com/v1';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('GHL CRM API request failed', { endpoint, error: error as Error });
      throw error;
    }
  }

  // Contact Methods
  async getContacts(filters: ContactsFilter = {}): Promise<Contact[]> {
    const params = new URLSearchParams({
      locationId: this.locationId,
      ...(filters.search && { query: filters.search }),
      ...(filters.limit && { limit: filters.limit.toString() }),
      ...(filters.offset && { skip: filters.offset.toString() }),
    });

    if (filters.tags?.length) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    const data = await this.makeRequest(`/contacts?${params}`);
    return data.contacts || [];
  }

  async getContact(contactId: string): Promise<Contact> {
    const data = await this.makeRequest(`/contacts/${contactId}`);
    return data.contact;
  }

  async createContact(contactData: CreateContactData): Promise<Contact> {
    const data = await this.makeRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        ...contactData,
        locationId: this.locationId,
      }),
    });
    return data.contact;
  }

  async updateContact(contactId: string, updates: Partial<CreateContactData>): Promise<Contact> {
    const data = await this.makeRequest(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.contact;
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.makeRequest(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // Opportunity Methods
  async getOpportunities(contactId?: string): Promise<Opportunity[]> {
    const params = new URLSearchParams({
      locationId: this.locationId,
      ...(contactId && { contact_id: contactId }),
    });

    const data = await this.makeRequest(`/opportunities?${params}`);
    return data.opportunities || [];
  }

  async createOpportunity(opportunityData: {
    name: string;
    contactId: string;
    pipelineId: string;
    pipelineStageId: string;
    monetaryValue?: number;
    assignedTo?: string;
  }): Promise<Opportunity> {
    const data = await this.makeRequest('/opportunities', {
      method: 'POST',
      body: JSON.stringify({
        ...opportunityData,
        locationId: this.locationId,
      }),
    });
    return data.opportunity;
  }

  // Task Methods
  async getTasks(contactId?: string): Promise<Task[]> {
    const params = new URLSearchParams({
      locationId: this.locationId,
      ...(contactId && { contactId }),
    });

    const data = await this.makeRequest(`/tasks?${params}`);
    return data.tasks || [];
  }

  async createTask(taskData: {
    title: string;
    description?: string;
    dueDate: string;
    contactId?: string;
    assignedTo?: string;
  }): Promise<Task> {
    const data = await this.makeRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        ...taskData,
        locationId: this.locationId,
      }),
    });
    return data.task;
  }

  async updateTask(taskId: string, updates: {
    completed?: boolean;
    title?: string;
    description?: string;
    dueDate?: string;
  }): Promise<Task> {
    const data = await this.makeRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.task;
  }
}

// Factory function to create CRM client for a specific site
export function createGHLCRMClient(site: { ghlApiKey: string | null; ghlLocationId: string | null }) {
  if (!site.ghlApiKey || !site.ghlLocationId) {
    logger.error('Site does not have GHL API credentials configured', {
      hasApiKey: !!site.ghlApiKey,
      hasLocationId: !!site.ghlLocationId,
    });
    throw new Error('This site does not have GoHighLevel integration configured. Please complete the onboarding process.');
  }

  return new GHLCRMClient(site.ghlApiKey, site.ghlLocationId);
}

// Legacy factory for agency-level operations (creating sub-accounts)
export function createAgencyGHLClient() {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_AGENCY_ID;

  if (!apiKey || !locationId) {
    logger.error('Agency GHL API credentials not configured');
    throw new Error('Agency GHL_API_KEY and GHL_AGENCY_ID must be set in environment variables.');
  }

  return new GHLCRMClient(apiKey, locationId);
}

// Export types for use in other files
export type { 
  Contact, 
  ContactsFilter, 
  CreateContactData, 
  Opportunity, 
  Task 
};