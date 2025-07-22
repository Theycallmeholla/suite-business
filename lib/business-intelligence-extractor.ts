import { DataForSEO } from '@/lib/dataforseo';
import { logger } from '@/lib/logger';
import OpenAI from 'openai';

interface ExtractorInput {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  gbpData?: any;
  placesData?: any;
  placeId?: string;
}

interface BusinessInfo {
  name: string;
  categories?: string[];
  primaryType?: string;
  phone?: string;
  website?: string;
  address?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  regularOpeningHours?: any;
}

interface ExtractorResult {
  businessInfo: BusinessInfo;
  media?: {
    photos: string[];
  };
  reviews?: Array<{
    reviewer: string;
    rating: number;
    text?: string;
  }>;
  serpData?: any;
  enhancedData?: any;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  dataforseoReviews?: any[];
  aiGenerated?: {
    suggestedColors?: any;
    suggestedContent?: any;
    questionsForUser?: string[];
  };
}

export class BusinessIntelligenceExtractor {
  private openai: OpenAI | null = null;

  constructor() {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async extractBusinessIntelligence(input: ExtractorInput): Promise<ExtractorResult> {
    try {
      // Start with basic business info
      const result: ExtractorResult = {
        businessInfo: {
          name: input.name,
          address: input.address,
          phone: input.phone,
          website: input.website,
        },
      };

      // Extract from GBP data if available (takes priority)
      if (input.gbpData) {
        result.businessInfo = {
          ...result.businessInfo,
          name: input.gbpData.name,
          categories: input.gbpData.categories,
          phone: input.gbpData.primaryPhone || input.phone,
          website: input.gbpData.website || input.website,
          address: this.formatGBPAddress(input.gbpData.address),
        };

        // Extract media
        if (input.gbpData.photos && input.gbpData.photos.length > 0) {
          result.media = {
            photos: input.gbpData.photos.map((photo: any) => photo.photoUri),
          };
        }

        // Extract reviews
        if (input.gbpData.reviews && input.gbpData.reviews.length > 0) {
          result.reviews = input.gbpData.reviews.map((review: any) => ({
            reviewer: review.reviewer?.displayName || 'Anonymous',
            rating: this.convertStarRating(review.starRating),
            text: review.comment,
          }));
        }
      }
      // Extract from Places API data if available and no GBP data
      else if (input.placesData) {
        result.businessInfo = {
          ...result.businessInfo,
          name: input.placesData.displayName?.text || input.name,
          primaryType: input.placesData.primaryType,
          phone: input.placesData.nationalPhoneNumber || input.phone,
          website: input.placesData.websiteUri || input.website,
          address: input.placesData.formattedAddress || input.address,
          location: input.placesData.location,
          regularOpeningHours: input.placesData.regularOpeningHours,
        };

        // Extract reviews from Places data
        if (input.placesData.reviews && input.placesData.reviews.length > 0) {
          result.reviews = input.placesData.reviews.map((review: any) => ({
            reviewer: review.authorAttribution?.displayName || 'Anonymous',
            rating: review.rating,
            text: review.text?.text,
          }));
        }
      }

      // Collect SERP data from DataForSEO
      try {
        const searchQuery = `${input.name} ${this.extractCity(input.address)}`;
        const serpData = await DataForSEO.searchBusiness(searchQuery);
        if (serpData) {
          result.serpData = serpData;
          
          // Extract social media links from SERP data
          result.socialMedia = this.extractSocialMediaFromSERP(serpData);
        }
      } catch (error) {
        logger.error('Failed to collect SERP data:', error);
      }

      // Collect enhanced business data from DataForSEO
      try {
        const enhancedData = await DataForSEO.getBusinessDataFromGoogle();
        if (enhancedData) {
          result.enhancedData = enhancedData;
        }
      } catch (error) {
        logger.error('Failed to collect enhanced business data:', error);
      }

      // Collect Google reviews from DataForSEO if place ID is available
      if (input.placeId) {
        try {
          const reviews = await DataForSEO.getGoogleReviews(input.placeId);
          result.dataforseoReviews = reviews || [];
        } catch (error) {
          logger.error('Failed to collect Google reviews:', error);
        }
      }

      // Generate AI content if OpenAI is configured
      if (this.openai) {
        try {
          const aiContent = await this.generateAIContent(result);
          if (aiContent) {
            result.aiGenerated = aiContent;
          }
        } catch (error) {
          logger.error('Failed to generate AI content:', error);
        }
      }

      return result;
    } catch (error) {
      logger.error('Business intelligence extraction failed:', error);
      throw error;
    }
  }

  private formatGBPAddress(address: any): string {
    if (!address) return '';
    const parts = [];
    if (address.addressLines) parts.push(...address.addressLines);
    if (address.locality) parts.push(address.locality);
    if (address.administrativeArea) parts.push(address.administrativeArea);
    if (address.postalCode) parts.push(address.postalCode);
    return parts.join(', ');
  }

  private convertStarRating(rating: string): number {
    const ratingMap: { [key: string]: number } = {
      'ONE': 1,
      'TWO': 2,
      'THREE': 3,
      'FOUR': 4,
      'FIVE': 5,
    };
    return ratingMap[rating] || 0;
  }

  private extractCity(address: string): string {
    if (!address) return '';
    // Extract city and state from address
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      // Format: "street, city, state zip"
      const city = parts[1];
      const stateAndZip = parts[2].split(' ');
      const state = stateAndZip[0];
      return `${city} ${state}`;
    } else if (parts.length === 2) {
      // Format: "city, state" or "street, city"
      return parts.join(' ');
    }
    return address;
  }

  private extractSocialMediaFromSERP(serpData: any): any {
    const socialMedia: any = {};
    
    if (serpData?.items?.[0]?.links?.deeplinks) {
      serpData.items[0].links.deeplinks.forEach((link: any) => {
        const url = link.href || '';
        if (url.includes('facebook.com')) {
          socialMedia.facebook = url;
        } else if (url.includes('instagram.com')) {
          socialMedia.instagram = url;
        } else if (url.includes('twitter.com') || url.includes('x.com')) {
          socialMedia.twitter = url;
        } else if (url.includes('linkedin.com')) {
          socialMedia.linkedin = url;
        }
      });
    }
    
    return socialMedia;
  }

  private async generateAIContent(data: ExtractorResult): Promise<any> {
    if (!this.openai) return null;

    try {
      const prompt = `Based on the following business data, generate:
1. Suggested brand colors (primary and secondary hex codes)
2. Suggested content (tagline, description)
3. Questions to ask the user for better customization

Business Data:
${JSON.stringify(data, null, 2)}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a business branding expert. Respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    } catch (error) {
      logger.error('AI content generation failed:', error);
    }

    return null;
  }
}
