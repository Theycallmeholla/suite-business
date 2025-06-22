// DataForSEO Integration for Business Intelligence
import { logger } from '@/lib/logger';
import OpenAI from 'openai';

interface DataForSEOConfig {
  login: string;
  password: string;
}

interface BusinessSearchResult {
  searchQuery: string;
  searchResults: Array<{
    url: string;
    title: string;
    description: string;
    type: string;
    structuredData?: any;
  }>;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  businessMentions: Array<{
    source: string;
    snippet: string;
    url: string;
  }>;
  additionalData: {
    emails?: string[];
    phones?: string[];
    addresses?: string[];
  };
}

export class DataForSEOService {
  private config: DataForSEOConfig;
  private baseUrl = 'https://api.dataforseo.com/v3';
  private openai: OpenAI | null = null;
  
  constructor() {
    this.config = {
      login: process.env.DATAFORSEO_LOGIN || '',
      password: process.env.DATAFORSEO_PASSWORD || '',
    };
    
    if (!this.config.login || !this.config.password) {
      logger.warn('DataForSEO credentials not configured');
    }
    
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }
  
  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${this.config.login}:${this.config.password}`).toString('base64');
  }
  
  async searchBusiness(
    businessName: string,
    address: string,
    phone?: string
  ): Promise<BusinessSearchResult> {
    logger.info('Starting DataForSEO business search', {
      businessName,
      address,
      hasPhone: !!phone,
    });
    
    // Build search query using NAP citation format
    const searchQuery = this.buildSearchQuery(businessName, address, phone);
    
    try {
      // Perform SERP search
      const serpResults = await this.serpSearch(searchQuery);
      
      // Extract social media links
      const socialLinks = this.extractSocialLinks(serpResults);
      
      // Extract business mentions
      const businessMentions = this.extractBusinessMentions(serpResults, businessName);
      
      // Extract additional contact info
      const additionalData = this.extractAdditionalData(serpResults);
      
      return {
        searchQuery,
        searchResults: serpResults,
        socialLinks,
        businessMentions,
        additionalData,
      };
    } catch (error) {
      logger.error('DataForSEO search failed', { error });
      throw error;
    }
  }
  
  private buildSearchQuery(businessName: string, address: string, phone?: string): string {
    // NAP citation format for best results
    const parts = [
      `"${businessName}"`,
      `"${address}"`,
    ];
    
    if (phone) {
      parts.push(`"${phone}"`);
    }
    
    return parts.join(' ');
  }
  
  private async serpSearch(query: string): Promise<any[]> {
    const taskData = [{
      language_code: "en",
      location_code: 2840, // United States
      keyword: query,
      calculate_rectangles: true,
      depth: 10, // First 10 results
      device: "desktop",
      os: "windows",
    }];
    
    try {
      // Post the task
      const taskResponse = await fetch(`${this.baseUrl}/serp/google/organic/task_post`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      const taskResult = await taskResponse.json();
      
      if (taskResult.status_code !== 20000) {
        throw new Error(`DataForSEO API error: ${taskResult.status_message}`);
      }
      
      const taskId = taskResult.tasks[0].id;
      
      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the results
      const resultsResponse = await fetch(`${this.baseUrl}/serp/google/organic/task_get/regular/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });
      
      const results = await resultsResponse.json();
      
      if (results.status_code !== 20000) {
        throw new Error(`Failed to get results: ${results.status_message}`);
      }
      
      // Extract organic results
      const items = results.tasks[0].result[0].items || [];
      
      return items.map((item: any) => ({
        url: item.url,
        title: item.title,
        description: item.description,
        type: item.type,
        breadcrumb: item.breadcrumb,
        isAmp: item.is_amp,
        structuredData: this.extractStructuredDataFromItem(item),
      }));
      
    } catch (error) {
      logger.error('SERP search failed', { error });
      return [];
    }
  }
  
  private extractStructuredDataFromItem(item: any): any {
    // DataForSEO sometimes includes structured data in results
    if (item.rich_snippet) {
      return item.rich_snippet;
    }
    
    if (item.extended_snippet) {
      return item.extended_snippet;
    }
    
    return null;
  }
  
  private extractSocialLinks(results: any[]): any {
    const socialLinks: any = {};
    const socialPatterns = {
      facebook: /facebook\.com\/(?:pages\/)?([^\/\?]+)/i,
      instagram: /instagram\.com\/([^\/\?]+)/i,
      linkedin: /linkedin\.com\/company\/([^\/\?]+)/i,
      twitter: /twitter\.com\/([^\/\?]+)/i,
      youtube: /youtube\.com\/(?:c\/|channel\/|user\/)?([^\/\?]+)/i,
      tiktok: /tiktok\.com\/@([^\/\?]+)/i,
    };
    
    for (const result of results) {
      const url = result.url;
      
      for (const [platform, pattern] of Object.entries(socialPatterns)) {
        if (pattern.test(url) && !socialLinks[platform]) {
          socialLinks[platform] = url;
        }
      }
    }
    
    return socialLinks;
  }
  
  private extractBusinessMentions(results: any[], businessName: string): any[] {
    const mentions = [];
    const businessNameLower = businessName.toLowerCase();
    
    for (const result of results) {
      const titleLower = (result.title || '').toLowerCase();
      const descriptionLower = (result.description || '').toLowerCase();
      
      // Check if the business name is mentioned
      if (titleLower.includes(businessNameLower) || descriptionLower.includes(businessNameLower)) {
        // Skip if it's their own website (they're coming to us for a website)
        if (result.url && result.url.includes(businessNameLower.replace(/\s+/g, ''))) {
          continue;
        }
        
        mentions.push({
          source: new URL(result.url).hostname,
          snippet: result.description,
          url: result.url,
          title: result.title,
        });
      }
    }
    
    return mentions;
  }
  
  private extractAdditionalData(results: any[]): any {
    const data: any = {
      emails: [],
      phones: [],
      addresses: [],
    };
    
    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    
    // Phone pattern (US format)
    const phonePattern = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    
    for (const result of results) {
      const text = `${result.title} ${result.description}`;
      
      // Extract emails
      const emails = text.match(emailPattern);
      if (emails) {
        data.emails.push(...emails);
      }
      
      // Extract phones
      const phones = text.match(phonePattern);
      if (phones) {
        data.phones.push(...phones);
      }
    }
    
    // Deduplicate
    data.emails = [...new Set(data.emails)];
    data.phones = [...new Set(data.phones)];
    
    return data;
  }
  
  // Use OpenAI to analyze the collected business data
  async analyzeBusinessData(
    businessName: string,
    industry: string,
    searchResults: BusinessSearchResult,
    gbpData?: any,
    placesData?: any
  ): Promise<any> {
    if (!this.openai) {
      logger.warn('OpenAI not configured, skipping analysis');
      return null;
    }
    
    try {
      const prompt = `
        Analyze this business information and extract key insights:
        
        Business: ${businessName}
        Industry: ${industry}
        
        Search Results Found:
        - ${searchResults.searchResults.length} web results
        - ${searchResults.businessMentions.length} business mentions
        - Social Media: ${Object.keys(searchResults.socialLinks).join(', ') || 'None found'}
        
        Business Mentions:
        ${searchResults.businessMentions.map(m => `- ${m.title}: ${m.snippet}`).join('\n')}
        
        Additional Data:
        - Emails found: ${searchResults.additionalData.emails?.join(', ') || 'None'}
        - Phone numbers: ${searchResults.additionalData.phones?.join(', ') || 'None'}
        
        Based on this information, provide:
        1. Key themes/words that describe this business (from the mentions)
        2. Potential services they offer (inferred from context)
        3. Their likely target market
        4. Any certifications, awards, or credentials mentioned
        5. Years in business (if mentioned)
        6. Service area (if mentioned)
        
        Return as JSON with these keys: themes, services, targetMarket, credentials, yearsInBusiness, serviceArea
      `;
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a business analyst extracting insights from web search results. Be concise and factual."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000,
      });
      
      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      
      return analysis;
    } catch (error) {
      logger.error('OpenAI analysis failed', { error });
      return null;
    }
  }
}

// Helper function to format collected data for storage
export function formatBusinessIntelligenceData(
  gbpData: any,
  placesData: any,
  searchResults: BusinessSearchResult,
  aiAnalysis?: any
): any {
  return {
    source: 'dataforseo',
    collectedAt: new Date().toISOString(),
    business: {
      name: gbpData?.title || placesData?.name,
      address: gbpData?.storefrontAddress || placesData?.formatted_address,
      phone: gbpData?.phoneNumbers?.primaryPhone || placesData?.formatted_phone_number,
      website: gbpData?.websiteUri || placesData?.website,
    },
    searchData: {
      query: searchResults.searchQuery,
      resultsCount: searchResults.searchResults.length,
      results: searchResults.searchResults,
    },
    socialMedia: searchResults.socialLinks,
    mentions: searchResults.businessMentions,
    additionalContacts: searchResults.additionalData,
    photos: {
      googlePlaces: placesData?.photos || [],
      googleBusiness: gbpData?.media || [],
    },
    reviews: {
      googleRating: placesData?.rating,
      googleReviewCount: placesData?.user_ratings_total,
      topReviews: placesData?.reviews || [],
    },
    aiAnalysis: aiAnalysis || null,
  };
}
