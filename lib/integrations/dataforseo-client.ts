import { logger } from '@/lib/logger';
import { IndustryType } from '@/types/site-builder';

export interface CompetitorAnalysis {
  topKeywords: string[];
  competitorServices: string[];
  commonTrustSignals: string[];
  competitorPricingTransparency: 'visible' | 'hidden' | 'partial';
  location: string;
  peopleAlsoAsk: Array<{
    question: string;
    answer: string;
  }>;
  competitors: Array<{
    name: string;
    url: string;
    services: string[];
    trustSignals: string[];
  }>;
}

interface DataForSEOConfig {
  login?: string;
  password?: string;
  apiUrl?: string;
}

// Cache for competitive analysis (24 hours)
const competitiveAnalysisCache = new Map<string, { data: CompetitorAnalysis; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export class DataForSEOClient {
  private config: DataForSEOConfig;
  private apiUrl: string;

  constructor(config?: DataForSEOConfig) {
    this.config = {
      login: config?.login || process.env.DATAFORSEO_LOGIN,
      password: config?.password || process.env.DATAFORSEO_PASSWORD,
      apiUrl: config?.apiUrl || 'https://api.dataforseo.com/v3',
    };
    this.apiUrl = this.config.apiUrl!;
  }

  /**
   * Get competitive analysis for a business in a specific location
   */
  async getCompetitiveAnalysis(
    businessName: string,
    location: string,
    industry: IndustryType
  ): Promise<CompetitorAnalysis> {
    const cacheKey = `${businessName}-${location}-${industry}`;
    
    // Check cache first
    const cached = competitiveAnalysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      logger.info('Returning cached competitive analysis', {
        metadata: { cacheKey }
      });
      return cached.data;
    }

    try {
      // If credentials are not available, return mock data
      if (!this.config.login || !this.config.password) {
        logger.info('DataForSEO credentials not available, using mock data');
        return this.getMockCompetitiveAnalysis(businessName, location, industry);
      }

      // Prepare the search query
      const query = `${industry} services ${location}`;
      
      // Create task for SERP analysis
      const taskResponse = await this.createSerpTask(query, location);
      if (!taskResponse.id) {
        throw new Error('Failed to create SERP task');
      }

      // Wait for task completion and get results
      const results = await this.getSerpResults(taskResponse.id);
      
      // Extract competitive insights
      const analysis = this.extractCompetitiveInsights(results, industry, location);
      
      // Cache the results
      competitiveAnalysisCache.set(cacheKey, {
        data: analysis,
        timestamp: Date.now(),
      });

      logger.info('Competitive analysis completed', {
        metadata: {
          businessName,
          location,
          industry,
          competitorsFound: analysis.competitors.length,
          keywordsFound: analysis.topKeywords.length,
        }
      });

      return analysis;
    } catch (error) {
      logger.error('DataForSEO API error, falling back to mock data', {}, error as Error);
      return this.getMockCompetitiveAnalysis(businessName, location, industry);
    }
  }

  /**
   * Create a SERP task
   */
  private async createSerpTask(query: string, location: string): Promise<{ id: string }> {
    const auth = Buffer.from(`${this.config.login}:${this.config.password}`).toString('base64');
    
    const response = await fetch(`${this.apiUrl}/serp/google/organic/task_post`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        keyword: query,
        location_name: location,
        language_name: 'English',
        device: 'desktop',
        os: 'windows',
        depth: 20,
      }]),
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();
    return { id: data.tasks?.[0]?.id };
  }

  /**
   * Get SERP results
   */
  private async getSerpResults(taskId: string): Promise<any> {
    const auth = Buffer.from(`${this.config.login}:${this.config.password}`).toString('base64');
    
    // Poll for results (DataForSEO tasks complete quickly)
    let attempts = 0;
    while (attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const response = await fetch(`${this.apiUrl}/serp/google/organic/task_get/regular/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });

      if (!response.ok) {
        throw new Error(`DataForSEO API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.tasks?.[0]?.status_code === 20000) {
        return data.tasks[0].result;
      }

      attempts++;
    }

    throw new Error('SERP task timeout');
  }

  /**
   * Extract competitive insights from SERP results
   */
  private extractCompetitiveInsights(results: any, industry: IndustryType, location: string): CompetitorAnalysis {
    const items = results?.[0]?.items || [];
    
    // Extract competitors (top organic results)
    const competitors = items.slice(0, 5).map((item: any) => ({
      name: item.title || '',
      url: item.url || '',
      services: this.extractServicesFromSnippet(item.description, industry),
      trustSignals: this.extractTrustSignals(item.description),
    }));

    // Extract common keywords from titles and descriptions
    const allText = items.map((item: any) => `${item.title} ${item.description}`).join(' ');
    const topKeywords = this.extractTopKeywords(allText, industry, location);

    // Extract services mentioned across all results
    const competitorServices = this.extractCommonServices(items, industry);

    // Extract trust signals
    const commonTrustSignals = this.extractCommonTrustSignals(items);

    // Extract People Also Ask questions
    const peopleAlsoAsk = results?.[0]?.people_also_ask || [];

    // Determine pricing transparency
    const pricingMentions = items.filter((item: any) => 
      item.description?.toLowerCase().includes('price') || 
      item.description?.toLowerCase().includes('cost') ||
      item.description?.toLowerCase().includes('$')
    ).length;
    
    const competitorPricingTransparency = pricingMentions > 3 ? 'visible' : 
                                         pricingMentions > 0 ? 'partial' : 'hidden';

    return {
      topKeywords,
      competitorServices,
      commonTrustSignals,
      competitorPricingTransparency,
      location,
      peopleAlsoAsk: peopleAlsoAsk.slice(0, 5).map((q: any) => ({
        question: q.question,
        answer: q.answer || 'Answer varies by provider',
      })),
      competitors,
    };
  }

  /**
   * Extract services from snippet text
   */
  private extractServicesFromSnippet(snippet: string, industry: IndustryType): string[] {
    if (!snippet) return [];
    
    const industryServices: Record<IndustryType, string[]> = {
      landscaping: ['lawn care', 'tree service', 'garden design', 'hardscaping', 'irrigation', 'maintenance'],
      hvac: ['air conditioning', 'heating', 'installation', 'repair', 'maintenance', 'duct cleaning'],
      plumbing: ['drain cleaning', 'water heater', 'leak repair', 'pipe installation', 'emergency service'],
      cleaning: ['house cleaning', 'deep cleaning', 'move out', 'commercial', 'carpet cleaning'],
      roofing: ['roof repair', 'replacement', 'inspection', 'gutter cleaning', 'emergency repair'],
      electrical: ['wiring', 'panel upgrade', 'outlet installation', 'lighting', 'emergency service'],
      general: [],
    };

    const services = industryServices[industry] || [];
    return services.filter(service => 
      snippet.toLowerCase().includes(service.toLowerCase())
    );
  }

  /**
   * Extract trust signals from text
   */
  private extractTrustSignals(text: string): string[] {
    if (!text) return [];
    
    const trustPatterns = [
      'licensed', 'insured', 'certified', 'bonded', 'years experience',
      'family owned', 'locally owned', 'bbb', 'award', 'guarantee',
      'warranty', 'free estimate', '24/7', 'emergency'
    ];

    return trustPatterns.filter(pattern => 
      text.toLowerCase().includes(pattern)
    );
  }

  /**
   * Extract top keywords
   */
  private extractTopKeywords(text: string, industry: IndustryType, location: string): string[] {
    const baseKeywords = [
      `${industry} ${location}`,
      `${industry} near me`,
      `best ${industry} ${location}`,
      `${industry} services`,
      `professional ${industry}`,
    ];

    // Add location variations
    const locationParts = location.split(',')[0].trim();
    if (locationParts !== location) {
      baseKeywords.push(`${industry} ${locationParts}`);
    }

    return baseKeywords.slice(0, 5);
  }

  /**
   * Extract common services across competitors
   */
  private extractCommonServices(items: any[], industry: IndustryType): string[] {
    const serviceFrequency = new Map<string, number>();
    
    items.forEach(item => {
      const services = this.extractServicesFromSnippet(item.description, industry);
      services.forEach(service => {
        serviceFrequency.set(service, (serviceFrequency.get(service) || 0) + 1);
      });
    });

    // Return services mentioned by at least 2 competitors
    return Array.from(serviceFrequency.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([service]) => service)
      .slice(0, 6);
  }

  /**
   * Extract common trust signals
   */
  private extractCommonTrustSignals(items: any[]): string[] {
    const signalFrequency = new Map<string, number>();
    
    items.forEach(item => {
      const signals = this.extractTrustSignals(item.description);
      signals.forEach(signal => {
        signalFrequency.set(signal, (signalFrequency.get(signal) || 0) + 1);
      });
    });

    // Return signals mentioned by at least 2 competitors
    return Array.from(signalFrequency.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([signal]) => signal)
      .slice(0, 5);
  }

  /**
   * Get mock competitive analysis when API is not available
   */
  private getMockCompetitiveAnalysis(
    businessName: string,
    location: string,
    industry: IndustryType
  ): CompetitorAnalysis {
    const industryData: Record<IndustryType, Partial<CompetitorAnalysis>> = {
      landscaping: {
        competitorServices: ['Lawn Care', 'Tree Service', 'Garden Design', 'Hardscaping', 'Irrigation', 'Seasonal Cleanup'],
        commonTrustSignals: ['Licensed & Insured', '10+ Years Experience', 'Free Estimates', 'Satisfaction Guarantee'],
        peopleAlsoAsk: [
          {
            question: 'How much does landscaping cost?',
            answer: 'Landscaping costs vary widely based on project scope, typically ranging from $500 for basic maintenance to $10,000+ for complete yard redesigns.',
          },
          {
            question: 'When is the best time to landscape?',
            answer: 'Spring and fall are ideal for most landscaping projects, with spring being best for planting and fall for hardscaping.',
          },
        ],
      },
      hvac: {
        competitorServices: ['AC Repair', 'Heating Installation', 'Duct Cleaning', 'Maintenance Plans', 'Emergency Service', 'Energy Audits'],
        commonTrustSignals: ['NATE Certified', '24/7 Emergency Service', 'Licensed & Bonded', 'Warranty Included'],
        peopleAlsoAsk: [
          {
            question: 'How often should HVAC be serviced?',
            answer: 'HVAC systems should be serviced twice yearly - AC in spring and heating in fall for optimal performance and longevity.',
          },
          {
            question: 'What size AC unit do I need?',
            answer: 'AC sizing depends on square footage, insulation, and climate. A professional load calculation is recommended for accurate sizing.',
          },
        ],
      },
      plumbing: {
        competitorServices: ['Drain Cleaning', 'Water Heater Repair', 'Leak Detection', 'Pipe Installation', 'Emergency Plumbing', 'Fixture Installation'],
        commonTrustSignals: ['Licensed Master Plumber', '24/7 Availability', 'Upfront Pricing', 'Fully Insured'],
        peopleAlsoAsk: [
          {
            question: 'How do I know if I have a water leak?',
            answer: 'Signs include unexplained high water bills, damp spots, mold growth, or the sound of running water when fixtures are off.',
          },
          {
            question: 'When should I replace my water heater?',
            answer: 'Water heaters typically last 8-12 years. Replace if it\'s leaking, making noise, or not heating water properly.',
          },
        ],
      },
      cleaning: {
        competitorServices: ['Regular Cleaning', 'Deep Cleaning', 'Move In/Out', 'Commercial Cleaning', 'Carpet Cleaning', 'Window Washing'],
        commonTrustSignals: ['Bonded & Insured', 'Background Checked', 'Eco-Friendly Products', 'Satisfaction Guarantee'],
        peopleAlsoAsk: [
          {
            question: 'How much does house cleaning cost?',
            answer: 'House cleaning typically costs $100-$300 per visit, depending on home size, frequency, and level of service.',
          },
          {
            question: 'What\'s included in a deep clean?',
            answer: 'Deep cleaning includes baseboards, light fixtures, inside appliances, window sills, and other areas not covered in regular cleaning.',
          },
        ],
      },
      roofing: {
        competitorServices: ['Roof Repair', 'Full Replacement', 'Inspection', 'Gutter Service', 'Storm Damage', 'Preventive Maintenance'],
        commonTrustSignals: ['Licensed Contractor', 'Insurance Claims Help', 'Warranty Protection', 'Free Inspection'],
        peopleAlsoAsk: [
          {
            question: 'How long does a roof last?',
            answer: 'Asphalt shingle roofs last 15-30 years, while metal, tile, and slate can last 50+ years with proper maintenance.',
          },
          {
            question: 'Will insurance cover my roof?',
            answer: 'Insurance typically covers sudden damage from storms, but not wear and tear. An inspection can determine coverage eligibility.',
          },
        ],
      },
      electrical: {
        competitorServices: ['Panel Upgrades', 'Outlet Installation', 'Lighting', 'EV Chargers', 'Safety Inspections', 'Emergency Repairs'],
        commonTrustSignals: ['Master Electrician', 'Code Compliant', 'Licensed & Insured', '24/7 Emergency'],
        peopleAlsoAsk: [
          {
            question: 'When should I upgrade my electrical panel?',
            answer: 'Upgrade if your panel is over 25 years old, uses fuses, trips frequently, or can\'t support modern electrical needs.',
          },
          {
            question: 'How much does an electrician cost?',
            answer: 'Electricians typically charge $50-$150 per hour, with most jobs ranging from $200-$1,000 depending on complexity.',
          },
        ],
      },
      general: {
        competitorServices: ['General Maintenance', 'Repairs', 'Installation', 'Consultation', 'Emergency Service'],
        commonTrustSignals: ['Licensed & Insured', 'Experienced Team', 'Quality Guarantee', 'Free Estimates'],
        peopleAlsoAsk: [
          {
            question: 'How do I choose a service provider?',
            answer: 'Look for licensed, insured providers with good reviews, clear pricing, and relevant experience in your specific needs.',
          },
        ],
      },
    };

    const data = industryData[industry] || industryData.general;
    
    return {
      topKeywords: [
        `${industry} ${location}`,
        `${industry} near me`,
        `best ${industry} ${location}`,
        `professional ${industry} services`,
        `${industry} contractors ${location}`,
      ],
      competitorServices: data.competitorServices || [],
      commonTrustSignals: data.commonTrustSignals || [],
      competitorPricingTransparency: 'hidden',
      location,
      peopleAlsoAsk: data.peopleAlsoAsk || [],
      competitors: [
        {
          name: `Premium ${industry.charAt(0).toUpperCase() + industry.slice(1)} Services`,
          url: `https://example.com`,
          services: (data.competitorServices || []).slice(0, 3),
          trustSignals: (data.commonTrustSignals || []).slice(0, 2),
        },
        {
          name: `${location} ${industry.charAt(0).toUpperCase() + industry.slice(1)} Pros`,
          url: `https://example.com`,
          services: (data.competitorServices || []).slice(2, 5),
          trustSignals: (data.commonTrustSignals || []).slice(1, 3),
        },
      ],
    };
  }
}

// Export singleton instance
export const dataForSEOClient = new DataForSEOClient();