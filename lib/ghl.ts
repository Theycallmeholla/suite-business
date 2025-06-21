// GoHighLevel Pro Plan Client with SaaS Mode Support
import axios from 'axios';
import { logger } from '@/lib/logger';

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

interface GHLConfig {
  apiKey: string;
  locationId: string;
  saasKey?: string;
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

  // SaaS Mode: Auto-create sub-account for new client
  async createSaasSubAccount(businessData: {
    businessName: string;
    email: string;
    phone: string;
    address: string;
    industry: string;
    website?: string;
  }) {
    try {
      // Step 1: Create location using SaaS mode
      const locationResponse = await axios.post(
        `${GHL_API_BASE}/locations/`,
        {
          companyName: businessData.businessName,
          email: businessData.email,
          phone: businessData.phone,
          address: businessData.address,
          website: businessData.website,
          // SaaS mode settings
          settings: {
            enabled: true,
            saasMode: true,
            industry: businessData.industry,
          },
          // Auto-apply agency snapshot
          snapshotId: this.getIndustrySnapshot(businessData.industry),
        },
        { headers: this.headers }
      );

      const newLocation = locationResponse.data.location;

      // Step 2: Set up rebilling for this location
      await this.setupRebilling(newLocation.id);

      // Step 3: Create admin user for the client
      await this.createLocationUser(newLocation.id, {
        email: businessData.email,
        firstName: businessData.businessName,
        role: 'admin',
      });

      return newLocation;
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'create_saas_subaccount',
        metadata: { businessName: businessData.businessName }
      });
      throw error;
    }
  }

  // Set up rebilling with markup
  async setupRebilling(locationId: string) {
    try {
      await axios.post(
        `${GHL_API_BASE}/locations/${locationId}/rebilling`,
        {
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
        },
        { headers: this.headers }
      );
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'setup_rebilling',
        metadata: { locationId }
      });
    }
  }

  // Create user for location
  async createLocationUser(locationId: string, userData: any) {
    try {
      const response = await axios.post(
        `${GHL_API_BASE}/locations/${locationId}/users`,
        userData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'create_location_user',
        metadata: { locationId, email: userData.email }
      });
      throw error;
    }
  }

  // Get industry-specific snapshot
  private getIndustrySnapshot(industry: string): string {
    const snapshots: Record<string, string> = {
      landscaping: 'snapshot_landscaping_id',
      hvac: 'snapshot_hvac_id',
      plumbing: 'snapshot_plumbing_id',
      cleaning: 'snapshot_cleaning_id',
      dental: 'snapshot_dental_id',
      // Add more industries
    };
    return snapshots[industry] || 'snapshot_default_id';
  }

  // Webhook handling
  async handleWebhook(payload: any) {
    const { type, data } = payload;

    switch (type) {
      case 'ContactCreate':
        // New lead came in
        break;
      case 'AppointmentScheduled':
        // Appointment booked
        break;
      case 'SMSSent':
        // Track for rebilling
        break;
      // Add more webhook handlers
    }
  }

  // Get location analytics
  async getLocationAnalytics(locationId: string) {
    try {
      const response = await axios.get(
        `${GHL_API_BASE}/locations/${locationId}/analytics`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'get_location_analytics',
        metadata: { locationId }
      });
      throw error;
    }
  }

  // Workflow/automation management
  async createWorkflow(locationId: string, workflowData: {
    name: string;
    industry: string;
    triggers: any[];
    actions: any[];
  }) {
    try {
      const response = await axios.post(
        `${GHL_API_BASE}/locations/${locationId}/workflows`,
        workflowData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      logger.integrationError('ghl', error as Error, {
        action: 'create_workflow',
        metadata: { locationId, workflowName: workflowData.name }
      });
      throw error;
    }
  }
}

// Factory function with environment config
export function createGHLProClient() {
  const config = {
    apiKey: process.env.GHL_API_KEY!,
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
      'property_size',
      'service_frequency',
      'irrigation_system',
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
      'system_type',
      'install_date',
      'warranty_status',
    ],
  },
  // Add more industries
};
