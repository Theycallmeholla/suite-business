// Business Intelligence Extractor
// Gathers comprehensive data about a business from multiple sources
// Uses AI to analyze and extract branding, copy, and business insights

import { logger } from '@/lib/logger';
import OpenAI from 'openai';
import { Color } from '@/lib/utils/color-extractor';

interface BusinessIntelligence {
  // Visual Branding
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    extracted: boolean;
    source: 'logo' | 'photos' | 'website' | 'industry';
  };
  
  // Logo and Images
  logo?: {
    url: string;
    colors: string[];
    hasText: boolean;
    backgroundColor: string;
  };
  
  photos: Array<{
    url: string;
    caption?: string;
    category: 'exterior' | 'interior' | 'product' | 'team' | 'other';
    dominantColors: string[];
  }>;
  
  // Business Details
  businessInfo: {
    tagline?: string;
    missionStatement?: string;
    yearsInBusiness?: number;
    employees?: string;
    certifications?: string[];
    awards?: string[];
    specialties?: string[];
  };
  
  // Online Presence
  onlinePresence: {
    website?: {
      url: string;
      hasBlog: boolean;
      hasTestimonials: boolean;
      hasPortfolio: boolean;
      extractedContent?: {
        about?: string;
        services?: string[];
        testimonials?: Array<{
          text: string;
          author: string;
          rating?: number;
        }>;
      };
    };
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
  };
  
  // AI-Generated Content
  aiContent: {
    heroTitle: string;
    heroSubtitle: string;
    aboutUs: string;
    whyChooseUs: string[];
    serviceDescriptions: Record<string, string>;
    callToAction: string;
    seoDescription: string;
  };
  
  // Questions for User
  questionsForUser: Array<{
    question: string;
    type: 'text' | 'select' | 'multiselect' | 'boolean';
    options?: string[];
    reason: string;
    category: 'branding' | 'services' | 'target' | 'goals';
  }>;
}

export class BusinessIntelligenceExtractor {
  private openai: OpenAI;
  private searchApiKey?: string;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.searchApiKey = process.env.SERP_API_KEY || process.env.SEARCH_API_KEY;
  }
  
  async extractBusinessIntelligence(
    businessData: {
      name: string;
      address: string;
      phone?: string;
      website?: string;
      placeId?: string;
      gbpData?: any;
      placesData?: any;
    }
  ): Promise<BusinessIntelligence> {
    logger.info('Starting business intelligence extraction', {
      businessName: businessData.name,
      hasWebsite: !!businessData.website,
      hasGBP: !!businessData.gbpData,
    });
    
    // Step 1: Extract visual branding from photos
    const visualBranding = await this.extractVisualBranding(businessData);
    
    // Step 2: Scrape website if available
    const websiteData = businessData.website 
      ? await this.scrapeWebsite(businessData.website)
      : null;
    
    // Step 3: Search for online presence
    const onlinePresence = await this.searchOnlinePresence(businessData.name, businessData.address);
    
    // Step 4: Analyze with AI
    const aiAnalysis = await this.analyzeWithAI({
      businessData,
      visualBranding,
      websiteData,
      onlinePresence,
    });
    
    // Step 5: Generate questions for user
    const questions = await this.generateUserQuestions({
      businessData,
      aiAnalysis,
      websiteData,
    });
    
    return {
      colors: visualBranding.colors,
      logo: visualBranding.logo,
      photos: visualBranding.photos,
      businessInfo: aiAnalysis.businessInfo,
      onlinePresence: {
        website: websiteData,
        socialMedia: onlinePresence.socialMedia,
      },
      aiContent: aiAnalysis.content,
      questionsForUser: questions,
    };
  }
  
  private async extractVisualBranding(businessData: any) {
    const photos: any[] = [];
    let logoUrl: string | undefined;
    let primaryColors: string[] = [];
    
    // Extract photos from Places API
    if (businessData.placesData?.photos) {
      for (const photo of businessData.placesData.photos.slice(0, 10)) {
        const photoUrl = this.getPhotoUrl(photo.photo_reference);
        const analysis = await this.analyzeImage(photoUrl);
        photos.push({
          url: photoUrl,
          category: analysis.category,
          dominantColors: analysis.colors,
        });
        primaryColors.push(...analysis.colors);
      }
    }
    
    // Extract photos from GBP
    if (businessData.gbpData?.photos) {
      // Add GBP photo extraction logic
    }
    
    // Try to find logo
    if (businessData.website) {
      logoUrl = await this.extractLogoFromWebsite(businessData.website);
    }
    
    // Determine brand colors
    const brandColors = await this.determineBrandColors(
      primaryColors,
      logoUrl,
      businessData.gbpData?.primaryCategory?.displayName
    );
    
    return {
      colors: brandColors,
      logo: logoUrl ? {
        url: logoUrl,
        colors: await this.extractColorsFromImage(logoUrl),
        hasText: true, // Would need actual analysis
        backgroundColor: '#FFFFFF',
      } : undefined,
      photos,
    };
  }
  
  private async scrapeWebsite(url: string) {
    try {
      // Use a web scraping service or API
      const response = await fetch(`https://api.scraperapi.com/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.SCRAPER_API_KEY,
          url,
          render: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to scrape website');
      }
      
      const html = await response.text();
      
      // Extract key information
      const extracted = await this.extractFromHTML(html, url);
      
      return {
        url,
        hasBlog: extracted.hasBlog,
        hasTestimonials: extracted.hasTestimonials,
        hasPortfolio: extracted.hasPortfolio,
        extractedContent: extracted.content,
      };
    } catch (error) {
      logger.error('Website scraping failed', { url, error });
      return null;
    }
  }
  
  private async searchOnlinePresence(businessName: string, address: string) {
    if (!this.searchApiKey) {
      return { socialMedia: {} };
    }
    
    try {
      // Search for social media profiles
      const searchQuery = `"${businessName}" "${address}" site:facebook.com OR site:instagram.com OR site:linkedin.com`;
      
      const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&api_key=${this.searchApiKey}`);
      const results = await response.json();
      
      const socialMedia: any = {};
      
      // Parse results for social media URLs
      results.organic_results?.forEach((result: any) => {
        if (result.link.includes('facebook.com')) {
          socialMedia.facebook = result.link;
        } else if (result.link.includes('instagram.com')) {
          socialMedia.instagram = result.link;
        } else if (result.link.includes('linkedin.com')) {
          socialMedia.linkedin = result.link;
        }
      });
      
      return { socialMedia };
    } catch (error) {
      logger.error('Online presence search failed', { error });
      return { socialMedia: {} };
    }
  }
  
  private async analyzeWithAI(data: any) {
    const prompt = `
      Analyze this business and generate high-quality content for their website:
      
      Business Name: ${data.businessData.name}
      Industry: ${data.businessData.gbpData?.primaryCategory?.displayName || 'Unknown'}
      Services: ${JSON.stringify(data.businessData.gbpData?.serviceItems || [])}
      
      Website Content: ${JSON.stringify(data.websiteData?.extractedContent || {})}
      
      Generate:
      1. A compelling hero title (max 10 words)
      2. A hero subtitle (max 20 words)
      3. An engaging "About Us" section (150-200 words)
      4. 5 reasons "Why Choose Us"
      5. SEO-optimized meta description (150-160 characters)
      6. Business insights (years in business, certifications, specialties if detectable)
      
      Make it professional, engaging, and specific to their industry.
      Return as JSON.
    `;
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a professional copywriter specializing in local business websites. Generate compelling, SEO-friendly content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
      
      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        content: {
          heroTitle: result.heroTitle || `Welcome to ${data.businessData.name}`,
          heroSubtitle: result.heroSubtitle || 'Quality service you can trust',
          aboutUs: result.aboutUs || '',
          whyChooseUs: result.whyChooseUs || [],
          serviceDescriptions: result.serviceDescriptions || {},
          callToAction: result.callToAction || 'Contact Us Today',
          seoDescription: result.seoDescription || '',
        },
        businessInfo: {
          tagline: result.tagline,
          missionStatement: result.missionStatement,
          yearsInBusiness: result.yearsInBusiness,
          employees: result.employees,
          certifications: result.certifications || [],
          awards: result.awards || [],
          specialties: result.specialties || [],
        }
      };
    } catch (error) {
      logger.error('AI analysis failed', { error });
      return this.getDefaultContent(data.businessData.name);
    }
  }
  
  private async generateUserQuestions(data: any): Promise<any[]> {
    const questions = [];
    
    // Always ask about target audience
    questions.push({
      question: "Who is your ideal customer?",
      type: "text",
      reason: "To tailor the website messaging to your target audience",
      category: "target",
    });
    
    // Ask about unique selling points if not found
    if (!data.websiteData?.extractedContent?.about) {
      questions.push({
        question: "What makes your business unique compared to competitors?",
        type: "text",
        reason: "To highlight your competitive advantages",
        category: "branding",
      });
    }
    
    // Ask about service area if not clear
    if (!data.businessData.gbpData?.serviceArea) {
      questions.push({
        question: "What areas do you serve?",
        type: "text",
        reason: "To help local customers find you",
        category: "services",
      });
    }
    
    // Ask about preferred style
    questions.push({
      question: "What style best represents your brand?",
      type: "select",
      options: ["Professional", "Friendly", "Modern", "Traditional", "Bold"],
      reason: "To match the website design to your brand personality",
      category: "branding",
    });
    
    // Ask about goals
    questions.push({
      question: "What's your primary goal for the website?",
      type: "select",
      options: [
        "Generate more leads",
        "Showcase our work",
        "Build credibility",
        "Provide information",
        "Sell products/services online"
      ],
      reason: "To optimize the website layout for your goals",
      category: "goals",
    });
    
    return questions;
  }
  
  private getPhotoUrl(photoReference: string): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  }
  
  private async analyzeImage(imageUrl: string) {
    // Use OpenAI Vision or another image analysis service
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this business image. Identify: 1) Category (exterior/interior/product/team/other), 2) Top 3 dominant colors in hex format. Return as JSON."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                }
              }
            ],
          },
        ],
        max_tokens: 300,
      });
      
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        category: result.category || 'other',
        colors: result.colors || ['#000000'],
      };
    } catch (error) {
      logger.error('Image analysis failed', { error });
      return {
        category: 'other',
        colors: ['#000000'],
      };
    }
  }
  
  private async extractColorsFromImage(imageUrl: string): Promise<string[]> {
    // This would use a color extraction library or service
    // For now, return placeholder
    return ['#000000', '#FFFFFF'];
  }
  
  private async extractLogoFromWebsite(websiteUrl: string): Promise<string | undefined> {
    // This would scrape the website for logo
    // Look for common patterns: img with logo in filename, og:image, etc.
    return undefined;
  }
  
  private async extractFromHTML(html: string, url: string) {
    // Parse HTML and extract relevant content
    // This is a simplified version - you'd use a proper HTML parser
    return {
      hasBlog: html.includes('blog') || html.includes('Blog'),
      hasTestimonials: html.includes('testimonial') || html.includes('review'),
      hasPortfolio: html.includes('portfolio') || html.includes('gallery'),
      content: {
        about: '', // Extract about section
        services: [], // Extract services
        testimonials: [], // Extract testimonials
      }
    };
  }
  
  private async determineBrandColors(
    extractedColors: string[], 
    logoUrl?: string,
    industry?: string
  ) {
    // Use AI to determine the best brand colors based on:
    // 1. Colors extracted from photos
    // 2. Logo colors
    // 3. Industry standards
    
    const industryColors: Record<string, any> = {
      landscaping: { primary: '#22C55E', secondary: '#84CC16', accent: '#A78BFA' },
      hvac: { primary: '#3B82F6', secondary: '#60A5FA', accent: '#F59E0B' },
      plumbing: { primary: '#1E40AF', secondary: '#60A5FA', accent: '#10B981' },
      cleaning: { primary: '#06B6D4', secondary: '#67E8F9', accent: '#A78BFA' },
      roofing: { primary: '#DC2626', secondary: '#F87171', accent: '#1F2937' },
      electrical: { primary: '#F59E0B', secondary: '#FCD34D', accent: '#3B82F6' },
    };
    
    // If we have extracted colors, use color theory to pick complementary ones
    if (extractedColors.length > 0) {
      // This would use a color theory library
      return {
        primary: extractedColors[0],
        secondary: extractedColors[1] || this.getComplementaryColor(extractedColors[0]),
        accent: extractedColors[2] || this.getAccentColor(extractedColors[0]),
        extracted: true,
        source: 'photos' as const,
      };
    }
    
    // Fall back to industry colors
    const industryKey = industry?.toLowerCase().split(' ')[0];
    const colors = industryColors[industryKey || ''] || industryColors.landscaping;
    
    return {
      ...colors,
      extracted: false,
      source: 'industry' as const,
    };
  }
  
  private getComplementaryColor(hexColor: string): string {
    // Simple complementary color calculation
    // In reality, use a proper color library
    return '#60A5FA';
  }
  
  private getAccentColor(hexColor: string): string {
    // Generate an accent color
    return '#F59E0B';
  }
  
  private getDefaultContent(businessName: string) {
    return {
      content: {
        heroTitle: `Welcome to ${businessName}`,
        heroSubtitle: 'Professional service you can trust',
        aboutUs: `${businessName} is dedicated to providing exceptional service to our community.`,
        whyChooseUs: [
          'Experienced professionals',
          'Quality service guaranteed',
          'Competitive pricing',
          'Customer satisfaction',
          'Licensed and insured',
        ],
        serviceDescriptions: {},
        callToAction: 'Contact Us Today',
        seoDescription: `${businessName} - Professional services in your area. Contact us today for a free quote.`,
      },
      businessInfo: {}
    };
  }
}

// Helper function to extract colors from CSS/images
export class ColorExtractor {
  static async extractFromCSS(css: string): Promise<string[]> {
    const colorRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
    const colors = css.match(colorRegex) || [];
    return [...new Set(colors)];
  }
  
  static async extractFromImage(imageUrl: string): Promise<string[]> {
    // This would use a library like node-vibrant or color-thief
    return ['#000000'];
  }
}
