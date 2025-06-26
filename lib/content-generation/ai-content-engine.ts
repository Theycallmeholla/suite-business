/**
 * AI Content Generation Engine
 * 
 * Creates unique, compelling website content using AI based on:
 * - Business data and industry
 * - Question answers and personality
 * - Local market and competition
 * - SEO optimization requirements
 * 
 * This ensures no two websites have the same content, even in the same industry.
 */

import { BusinessIntelligenceData } from '@/types/intelligence';
import { IndustryType } from '@/types/site-builder';
import { QuestionAnswers } from '@/lib/template-engine/dynamic-layout-generator';
import { logger } from '@/lib/logger';

export interface ContentGenerationRequest {
  businessData: BusinessIntelligenceData;
  industry: IndustryType;
  answers: QuestionAnswers;
  sectionType: 'hero' | 'about' | 'services' | 'cta' | 'testimonials' | 'contact';
  contentType: 'headline' | 'subheadline' | 'description' | 'cta-text' | 'service-description';
  tone?: 'professional' | 'friendly' | 'urgent' | 'premium' | 'traditional';
  length?: 'short' | 'medium' | 'long';
  includeLocation?: boolean;
  includeDifferentiators?: boolean;
}

export interface GeneratedContent {
  content: string;
  alternatives: string[];
  seoScore: number;
  uniquenessScore: number;
  metadata: {
    wordsUsed: string[];
    tone: string;
    localReferences: string[];
    differentiators: string[];
  };
}

/**
 * AI Content Engine using OpenAI GPT
 */
export class AIContentEngine {
  private openai: any;
  private industryVocabulary: Record<IndustryType, string[]>;
  private toneModifiers: Record<string, string>;
  private localModifiers: string[];

  constructor() {
    this.initializeOpenAI();
    this.industryVocabulary = this.loadIndustryVocabulary();
    this.toneModifiers = this.loadToneModifiers();
    this.localModifiers = this.loadLocalModifiers();
  }

  /**
   * Generate content for a specific section and type
   */
  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    try {
      const prompt = this.buildPrompt(request);
      const response = await this.callOpenAI(prompt, request);
      
      const content = this.parseResponse(response);
      const alternatives = await this.generateAlternatives(request, content);
      
      const seoScore = this.calculateSEOScore(content, request);
      const uniquenessScore = this.calculateUniquenessScore(content, request);
      
      const metadata = this.extractMetadata(content, request);

      return {
        content,
        alternatives,
        seoScore,
        uniquenessScore,
        metadata,
      };
    } catch (error) {
      logger.error('Content generation failed', { request }, error as Error);
      
      // Fallback to template-based content
      return this.generateFallbackContent(request);
    }
  }

  /**
   * Generate complete website copy
   */
  async generateWebsiteCopy(
    businessData: BusinessIntelligenceData,
    industry: IndustryType,
    answers: QuestionAnswers
  ): Promise<{
    hero: {
      headline: string;
      subheadline: string;
      ctaText: string;
    };
    about: {
      headline: string;
      description: string;
    };
    services: {
      headline: string;
      description: string;
      serviceDescriptions: Record<string, string>;
    };
    cta: {
      headline: string;
      description: string;
      ctaText: string;
    };
    contact: {
      headline: string;
      description: string;
    };
  }> {
    const baseRequest = {
      businessData,
      industry,
      answers,
      tone: this.determineTone(answers),
      includeLocation: true,
      includeDifferentiators: true,
    };

    // Generate all content sections in parallel
    const [heroContent, aboutContent, servicesContent, ctaContent, contactContent] = await Promise.all([
      this.generateHeroContent(baseRequest),
      this.generateAboutContent(baseRequest),
      this.generateServicesContent(baseRequest),
      this.generateCTAContent(baseRequest),
      this.generateContactContent(baseRequest),
    ]);

    return {
      hero: heroContent,
      about: aboutContent,
      services: servicesContent,
      cta: ctaContent,
      contact: contactContent,
    };
  }

  /**
   * Generate hero section content
   */
  private async generateHeroContent(baseRequest: any) {
    const [headline, subheadline, ctaText] = await Promise.all([
      this.generateContent({
        ...baseRequest,
        sectionType: 'hero',
        contentType: 'headline',
        length: 'short',
      }),
      this.generateContent({
        ...baseRequest,
        sectionType: 'hero',
        contentType: 'subheadline',
        length: 'medium',
      }),
      this.generateContent({
        ...baseRequest,
        sectionType: 'hero',
        contentType: 'cta-text',
        length: 'short',
      }),
    ]);

    return {
      headline: headline.content,
      subheadline: subheadline.content,
      ctaText: ctaText.content,
    };
  }

  /**
   * Generate about section content
   */
  private async generateAboutContent(baseRequest: any) {
    const [headline, description] = await Promise.all([
      this.generateContent({
        ...baseRequest,
        sectionType: 'about',
        contentType: 'headline',
        length: 'short',
      }),
      this.generateContent({
        ...baseRequest,
        sectionType: 'about',
        contentType: 'description',
        length: 'long',
      }),
    ]);

    return {
      headline: headline.content,
      description: description.content,
    };
  }

  /**
   * Generate services section content
   */
  private async generateServicesContent(baseRequest: any) {
    const [headline, description] = await Promise.all([
      this.generateContent({
        ...baseRequest,
        sectionType: 'services',
        contentType: 'headline',
        length: 'short',
      }),
      this.generateContent({
        ...baseRequest,
        sectionType: 'services',
        contentType: 'description',
        length: 'medium',
      }),
    ]);

    // Generate descriptions for each service
    const services = baseRequest.answers.services || [];
    const serviceDescriptions: Record<string, string> = {};
    
    for (const service of services) {
      const serviceDesc = await this.generateContent({
        ...baseRequest,
        sectionType: 'services',
        contentType: 'service-description',
        length: 'medium',
        serviceName: service,
      });
      serviceDescriptions[service] = serviceDesc.content;
    }

    return {
      headline: headline.content,
      description: description.content,
      serviceDescriptions,
    };
  }

  /**
   * Generate CTA section content
   */
  private async generateCTAContent(baseRequest: any) {
    const [headline, description, ctaText] = await Promise.all([
      this.generateContent({
        ...baseRequest,
        sectionType: 'cta',
        contentType: 'headline',
        length: 'short',
      }),
      this.generateContent({
        ...baseRequest,
        sectionType: 'cta',
        contentType: 'description',
        length: 'medium',
      }),
      this.generateContent({
        ...baseRequest,
        sectionType: 'cta',
        contentType: 'cta-text',
        length: 'short',
      }),
    ]);

    return {
      headline: headline.content,
      description: description.content,
      ctaText: ctaText.content,
    };
  }

  /**
   * Generate contact section content
   */
  private async generateContactContent(baseRequest: any) {
    const [headline, description] = await Promise.all([
      this.generateContent({
        ...baseRequest,
        sectionType: 'contact',
        contentType: 'headline',
        length: 'short',
      }),
      this.generateContent({
        ...baseRequest,
        sectionType: 'contact',
        contentType: 'description',
        length: 'medium',
      }),
    ]);

    return {
      headline: headline.content,
      description: description.content,
    };
  }

  /**
   * Build AI prompt based on request
   */
  private buildPrompt(request: ContentGenerationRequest): string {
    const businessName = request.businessData.gbp?.businessName || 'the business';
    const city = request.businessData.gbp?.fullAddress?.locality || 'the local area';
    const description = request.businessData.gbp?.description || '';
    const reviews = request.businessData.gbp?.reviews;
    const yearsInBusiness = request.answers.businessStage;
    const differentiators = request.answers.differentiators || [];
    const emergencyService = request.answers.emergencyService;

    let prompt = `You are a professional copywriter specializing in ${request.industry} businesses. 

BUSINESS CONTEXT:
- Business Name: ${businessName}
- Industry: ${request.industry}
- Location: ${city}
- Years in Business: ${yearsInBusiness}
- Emergency Services: ${emergencyService ? 'Yes' : 'No'}
- Differentiators: ${differentiators.join(', ')}
- Current Description: ${description}
- Reviews: ${reviews ? `${reviews.rating}/5 stars (${reviews.count} reviews)` : 'No reviews yet'}

CONTENT REQUEST:
- Section: ${request.sectionType}
- Content Type: ${request.contentType}
- Tone: ${request.tone || 'professional'}
- Length: ${request.length || 'medium'}

REQUIREMENTS:
1. Write compelling, unique content that stands out from competitors
2. Include local references to ${city} when appropriate
3. Highlight the business's unique differentiators
4. Use industry-specific terminology naturally
5. Optimize for SEO without keyword stuffing
6. Match the ${request.tone} tone consistently
7. Create urgency and trust where appropriate
8. Avoid generic phrases like "quality service" or "professional team"

`;

    // Add section-specific instructions
    switch (request.sectionType) {
      case 'hero':
        prompt += this.getHeroInstructions(request);
        break;
      case 'about':
        prompt += this.getAboutInstructions(request);
        break;
      case 'services':
        prompt += this.getServicesInstructions(request);
        break;
      case 'cta':
        prompt += this.getCTAInstructions(request);
        break;
      case 'contact':
        prompt += this.getContactInstructions(request);
        break;
    }

    prompt += `\n\nGenerate ${request.length} ${request.contentType} that is unique, compelling, and converts visitors into customers. Return only the content, no explanations.`;

    return prompt;
  }

  /**
   * Section-specific instruction methods
   */
  private getHeroInstructions(request: ContentGenerationRequest): string {
    if (request.contentType === 'headline') {
      return `
HERO HEADLINE INSTRUCTIONS:
- Create a powerful, attention-grabbing headline (6-10 words)
- Focus on the main benefit or transformation
- Include emotional appeal
- Avoid generic phrases
- Make it specific to ${request.industry}
Examples of GOOD headlines: "Transform Your Backyard Into Paradise", "Emergency Plumbing When You Need It Most"
Examples of BAD headlines: "Professional Landscaping Services", "Quality Plumbing Solutions"
`;
    } else if (request.contentType === 'subheadline') {
      return `
HERO SUBHEADLINE INSTRUCTIONS:
- Expand on the headline with specific benefits (15-25 words)
- Include social proof or credibility indicators
- Mention location and service area
- Create urgency or scarcity if appropriate
`;
    } else if (request.contentType === 'cta-text') {
      return `
HERO CTA INSTRUCTIONS:
- Create action-oriented button text (2-4 words)
- Match the urgency level of the business
- Be specific about what happens next
- Use power words that convert
Examples: "Get Free Quote", "Call Now", "Schedule Today", "Start Your Project"
`;
    }
    return '';
  }

  private getAboutInstructions(request: ContentGenerationRequest): string {
    return `
ABOUT SECTION INSTRUCTIONS:
- Tell the business's story in a compelling way
- Highlight experience, expertise, and credentials
- Include personal touches that build trust
- Mention awards, certifications, or achievements
- Connect with the local community
- Show passion for the work
- Address common customer concerns
`;
  }

  private getServicesInstructions(request: ContentGenerationRequest): string {
    if (request.contentType === 'service-description') {
      return `
SERVICE DESCRIPTION INSTRUCTIONS:
- Describe the specific service: ${(request as any).serviceName}
- Focus on benefits, not just features
- Include what's included in the service
- Mention typical timeline or process
- Address common pain points
- Use industry-specific terminology
- Keep it scannable with key points
`;
    }
    return `
SERVICES SECTION INSTRUCTIONS:
- Introduce the range of services offered
- Highlight the most popular or profitable services
- Explain the process or approach
- Mention guarantees or warranties
- Create confidence in expertise
`;
  }

  private getCTAInstructions(request: ContentGenerationRequest): string {
    return `
CTA SECTION INSTRUCTIONS:
- Create urgency and motivation to act now
- Overcome final objections
- Highlight risk-free offers (free quotes, consultations)
- Include social proof or guarantees
- Make the next step crystal clear
- Address timing (availability, seasonal factors)
`;
  }

  private getContactInstructions(request: ContentGenerationRequest): string {
    return `
CONTACT SECTION INSTRUCTIONS:
- Make it easy and inviting to get in touch
- Mention response times and availability
- Include multiple contact methods
- Address common questions about the process
- Reassure about consultations or quotes
- Mention service areas clearly
`;
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string, request: ContentGenerationRequest): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional copywriter who creates compelling, unique website content that converts visitors into customers. You avoid generic phrases and create content that stands out from competitors.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: this.getMaxTokens(request.length),
      temperature: 0.8, // Creative but not too random
    });

    return completion.choices[0]?.message?.content || '';
  }

  /**
   * Generate alternative versions
   */
  private async generateAlternatives(
    request: ContentGenerationRequest,
    originalContent: string
  ): Promise<string[]> {
    const alternativePrompt = `
Create 2 alternative versions of this ${request.contentType}:
"${originalContent}"

Requirements:
- Same tone and style
- Different wording and approach
- Equally compelling
- Same length approximately

Return only the alternatives, separated by "|||"
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: alternativePrompt,
          },
        ],
        max_tokens: this.getMaxTokens(request.length) * 2,
        temperature: 0.9,
      });

      const alternatives = response.choices[0]?.message?.content?.split('|||') || [];
      return alternatives.map(alt => alt.trim()).filter(alt => alt.length > 0);
    } catch (error) {
      logger.warn('Failed to generate alternatives', {}, error as Error);
      return [];
    }
  }

  /**
   * Initialize OpenAI
   */
  private initializeOpenAI() {
    if (process.env.OPENAI_API_KEY) {
      const { OpenAI } = require('openai');
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      logger.warn('OpenAI API key not configured');
    }
  }

  /**
   * Helper methods
   */
  private parseResponse(response: string): string {
    return response.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
  }

  private getMaxTokens(length?: string): number {
    switch (length) {
      case 'short': return 50;
      case 'medium': return 150;
      case 'long': return 300;
      default: return 150;
    }
  }

  private determineTone(answers: QuestionAnswers): string {
    if (answers.emergencyService) return 'urgent';
    if (answers.differentiators?.includes('premium')) return 'premium';
    if (answers.differentiators?.includes('family-owned')) return 'friendly';
    if (answers.businessStage === '10+') return 'traditional';
    return 'professional';
  }

  private calculateSEOScore(content: string, request: ContentGenerationRequest): number {
    // Simple SEO scoring based on content quality
    let score = 0;
    
    // Length check
    if (content.length > 20) score += 20;
    if (content.length > 50) score += 20;
    
    // Industry keywords
    const industryKeywords = this.industryVocabulary[request.industry] || [];
    const keywordMatches = industryKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    score += Math.min(keywordMatches * 10, 30);
    
    // Local references
    const city = request.businessData.gbp?.fullAddress?.locality;
    if (city && content.toLowerCase().includes(city.toLowerCase())) {
      score += 15;
    }
    
    // Uniqueness (avoid generic phrases)
    const genericPhrases = ['quality service', 'professional team', 'best in class', 'we provide'];
    const genericMatches = genericPhrases.filter(phrase => 
      content.toLowerCase().includes(phrase)
    ).length;
    score -= genericMatches * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateUniquenessScore(content: string, request: ContentGenerationRequest): number {
    // This would ideally check against a database of existing content
    // For now, we'll use a simple heuristic
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = content.toLowerCase().split(/\s+/).filter(word => 
      word.length > 3 && !commonWords.includes(word)
    );
    
    const uniqueWords = new Set(words);
    const uniquenessRatio = uniqueWords.size / words.length;
    
    return Math.round(uniquenessRatio * 100);
  }

  private extractMetadata(content: string, request: ContentGenerationRequest) {
    const words = content.toLowerCase().split(/\s+/);
    const industryWords = this.industryVocabulary[request.industry] || [];
    const city = request.businessData.gbp?.fullAddress?.locality?.toLowerCase();
    
    return {
      wordsUsed: words.filter(word => word.length > 3),
      tone: request.tone || 'professional',
      localReferences: city && content.toLowerCase().includes(city) ? [city] : [],
      differentiators: request.answers.differentiators || [],
    };
  }

  private generateFallbackContent(request: ContentGenerationRequest): GeneratedContent {
    // Template-based fallback when AI fails
    const templates = this.getFallbackTemplates(request);
    const content = templates[0] || 'Professional service you can trust';
    
    return {
      content,
      alternatives: templates.slice(1, 3),
      seoScore: 60,
      uniquenessScore: 40,
      metadata: {
        wordsUsed: content.split(' '),
        tone: request.tone || 'professional',
        localReferences: [],
        differentiators: [],
      },
    };
  }

  private getFallbackTemplates(request: ContentGenerationRequest): string[] {
    // Industry and section-specific fallback templates
    const businessName = request.businessData.gbp?.businessName || 'Our Business';
    const city = request.businessData.gbp?.fullAddress?.locality || 'Your Area';
    
    const templates = {
      landscaping: {
        hero: {
          headline: [`Transform Your Outdoor Space`, `Beautiful Landscapes, Lasting Results`, `Your Dream Yard Awaits`],
          subheadline: [`Professional landscaping services in ${city}`, `Creating beautiful outdoor spaces for homeowners`, `Expert design and installation you can trust`],
        },
      },
      // Add more fallback templates...
    };
    
    return templates[request.industry]?.[request.sectionType]?.[request.contentType] || ['Professional service you can trust'];
  }

  private loadIndustryVocabulary(): Record<IndustryType, string[]> {
    return {
      landscaping: ['landscape', 'garden', 'lawn', 'outdoor', 'design', 'irrigation', 'hardscape', 'plants', 'trees', 'maintenance'],
      plumbing: ['plumbing', 'pipes', 'water', 'drain', 'leak', 'repair', 'installation', 'emergency', 'licensed', 'certified'],
      hvac: ['heating', 'cooling', 'air conditioning', 'furnace', 'ductwork', 'maintenance', 'repair', 'installation', 'energy efficient'],
      cleaning: ['cleaning', 'maid', 'housekeeping', 'sanitize', 'deep clean', 'residential', 'commercial', 'eco-friendly'],
      roofing: ['roofing', 'roof', 'shingles', 'gutters', 'repair', 'replacement', 'installation', 'storm damage', 'warranty'],
      electrical: ['electrical', 'electrician', 'wiring', 'installation', 'repair', 'safety', 'licensed', 'certified', 'emergency'],
      general: ['professional', 'service', 'quality', 'reliable', 'experienced', 'licensed', 'insured', 'local'],
    };
  }

  private loadToneModifiers(): Record<string, string> {
    return {
      professional: 'formal, trustworthy, competent',
      friendly: 'warm, approachable, personal',
      urgent: 'immediate, action-oriented, time-sensitive',
      premium: 'sophisticated, high-end, exclusive',
      traditional: 'established, reliable, time-tested',
    };
  }

  private loadLocalModifiers(): string[] {
    return ['local', 'nearby', 'in your area', 'community', 'neighborhood', 'regional'];
  }
}

/**
 * Export singleton instance
 */
export const aiContentEngine = new AIContentEngine();