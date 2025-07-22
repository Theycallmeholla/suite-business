/**
 * AI Content Generator for Website Builder
 * Uses business profile data to generate website content
 */

export interface ContentGenerationRequest {
  profile: WebsiteBuilderProfile;
  contentType: 'hero' | 'about' | 'services' | 'cta' | 'testimonial';
  tone?: string;
  keywords?: string[];
}

export interface GeneratedContent {
  headline?: string;
  subheadline?: string;
  body?: string;
  bulletPoints?: string[];
  cta?: string;
}

export class AIContentGenerator {
  /**
   * Generate hero section content based on business profile
   */
  generateHeroContent(profile: WebsiteBuilderProfile): GeneratedContent {
    const { businessInfo, content, reputation, industry } = profile;
    
    // Example content generation based on profile data
    const templates = {
      restaurant: {
        headline: `Authentic ${industry.subType} in ${profile.contact.address.city}`,
        subheadline: reputation.googleRating >= 4.5 
          ? `${reputation.googleRating}★ Rated • ${content.uniqueSellingPoints.join(' • ')}`
          : `Experience ${content.uniqueSellingPoints[0]} Since ${businessInfo.yearEstablished || '1985'}`,
        body: `Welcome to ${businessInfo.name}, where ${content.reviewHighlights.positive[0]} ` +
              `meets ${content.reviewHighlights.positive[1]}. Join our ${reputation.totalReviews}+ ` +
              `happy customers who love our ${content.uniqueSellingPoints.join(', ')}.`,
        cta: 'View Our Menu'
      },
      service: {
        headline: `${profile.contact.address.city}'s Trusted ${industry.primaryCategory}`,
        subheadline: `${content.uniqueSellingPoints.join(' • ')} • Licensed & Insured`,
        body: `${businessInfo.name} provides ${content.tone} ${industry.primaryCategory.toLowerCase()} ` +
              `services with a focus on ${content.uniqueSellingPoints[0]}. ` +
              `${reputation.totalReviews ? `Over ${reputation.totalReviews} satisfied customers` : 'Family owned and operated'}.`,
        cta: 'Get Free Quote'
      },
      professional: {
        headline: `Expert ${industry.primaryCategory} Services`,
        subheadline: `${content.uniqueSellingPoints[0]} • ${businessInfo.yearEstablished ? `Established ${businessInfo.yearEstablished}` : 'Experienced Team'}`,
        body: `${businessInfo.name} delivers professional ${industry.subType} services ` +
              `with ${content.reviewHighlights.themes[0]?.toLowerCase() || 'excellence'}. ` +
              `Our ${content.tone} approach ensures ${content.uniqueSellingPoints[1]?.toLowerCase() || 'results'}.`,
        cta: 'Schedule Consultation'
      },
      retail: {
        headline: `${businessInfo.name} - ${content.uniqueSellingPoints[0]}`,
        subheadline: `${industry.primaryCategory} • ${profile.contact.address.city}`,
        body: `Discover ${content.uniqueSellingPoints.join(', ')} at ${businessInfo.name}. ` +
              `${reputation.googleRating >= 4 ? `Rated ${reputation.googleRating}★ by our customers.` : ''}`,
        cta: 'Shop Now'
      },
      healthcare: {
        headline: `Compassionate ${industry.primaryCategory} Care`,
        subheadline: `${content.uniqueSellingPoints.join(' • ')}`,
        body: `${businessInfo.name} provides ${content.tone} healthcare services ` +
              `focused on ${content.uniqueSellingPoints[0]?.toLowerCase() || 'patient care'}. ` +
              `${reputation.totalReviews ? `Trusted by ${reputation.totalReviews}+ patients.` : ''}`,
        cta: 'Book Appointment'
      }
    };
    
    const template = templates[industry.industryType] || templates.service;
    
    // Add local SEO keywords
    if (profile.seo.localSearchTerms.length > 0) {
      template.body += ` Serving ${profile.seo.localSearchTerms[0]}.`;
    }
    
    return template;
  }
  
  /**
   * Generate about section content
   */
  generateAboutContent(profile: WebsiteBuilderProfile): GeneratedContent {
    const years = new Date().getFullYear() - (profile.businessInfo.yearEstablished || 2020);
    
    return {
      headline: `About ${profile.businessInfo.name}`,
      body: `For ${years > 0 ? `over ${years} years` : 'years'}, ${profile.businessInfo.name} has been ` +
            `${profile.contact.address.city}'s trusted choice for ${profile.industry.primaryCategory.toLowerCase()}. ` +
            `Our commitment to ${profile.content.uniqueSellingPoints.join(', ')} has earned us ` +
            `${profile.reputation.googleRating ? `a ${profile.reputation.googleRating}★ rating and ` : ''}` +
            `the trust of ${profile.reputation.totalReviews || 'countless'} satisfied customers.\n\n` +
            `What sets us apart:\n` +
            `${profile.content.reviewHighlights.themes.map(theme => `• ${theme}`).join('\n')}`,
      bulletPoints: profile.content.uniqueSellingPoints.map(point => 
        `${point.charAt(0).toUpperCase() + point.slice(1)} service`
      )
    };
  }
  
  /**
   * Generate service descriptions
   */
  generateServiceContent(profile: WebsiteBuilderProfile): GeneratedContent {
    const services = profile.content.servicesOffered.map(service => ({
      name: service,
      description: `Professional ${service.toLowerCase()} services with a focus on ` +
                  `${profile.content.uniqueSellingPoints[0]?.toLowerCase() || 'quality'}. ` +
                  `${profile.content.tone === 'professional' ? 'Contact us for details.' : 'Call today!'}`
    }));
    
    return {
      headline: 'Our Services',
      body: `${profile.businessInfo.name} offers comprehensive ${profile.industry.primaryCategory.toLowerCase()} services:`,
      bulletPoints: services.map(s => `**${s.name}**: ${s.description}`)
    };
  }
  
  /**
   * Generate call-to-action content
   */
  generateCTAContent(profile: WebsiteBuilderProfile): GeneratedContent {
    const urgency = profile.reputation.googleRating >= 4.5 ? 'Join hundreds of satisfied customers' : 'Experience the difference';
    
    return {
      headline: 'Ready to Get Started?',
      subheadline: urgency,
      body: `Contact ${profile.businessInfo.name} today and discover why we're ${profile.contact.address.city}'s ` +
            `preferred ${profile.industry.primaryCategory.toLowerCase()}.`,
      cta: profile.suggestedFeatures.bookingSystem ? 'Book Online' : 'Contact Us Today'
    };
  }
  
  /**
   * Generate testimonial section intro
   */
  generateTestimonialContent(profile: WebsiteBuilderProfile): GeneratedContent {
    return {
      headline: 'What Our Customers Say',
      subheadline: `${profile.reputation.googleRating}★ Average Rating • ${profile.reputation.totalReviews} Reviews`,
      body: `Don't just take our word for it. Here's what our customers love about ${profile.businessInfo.name}:`
    };
  }
  
  /**
   * Generate meta description for SEO
   */
  generateMetaDescription(profile: WebsiteBuilderProfile): string {
    return `${profile.businessInfo.name} - ${profile.reputation.googleRating}★ rated ${profile.industry.primaryCategory.toLowerCase()} ` +
           `in ${profile.contact.address.city}, ${profile.contact.address.state}. ` +
           `${profile.content.uniqueSellingPoints.join(', ')}. ` +
           `Call ${profile.contact.phone || 'today'}!`.substring(0, 160);
  }
  
  /**
   * Generate location-specific content
   */
  generateLocationContent(profile: WebsiteBuilderProfile): GeneratedContent {
    const areas = profile.contact.serviceArea || [profile.contact.address.city];
    
    return {
      headline: `Serving ${profile.contact.address.city} and Surrounding Areas`,
      body: `${profile.businessInfo.name} proudly serves ${areas.join(', ')} ` +
            `with ${profile.content.tone} ${profile.industry.primaryCategory.toLowerCase()} services.`,
      bulletPoints: areas.map(area => `${area}, ${profile.contact.address.state}`)
    };
  }
}

// Example of how ChatGPT could be integrated
export class ChatGPTContentGenerator extends AIContentGenerator {
  /**
   * Use ChatGPT to generate more creative content
   * (This would actually call ChatGPT API in production)
   */
  async generateWithChatGPT(request: ContentGenerationRequest): Promise<GeneratedContent> {
    // In production, this would call ChatGPT API
    // For now, using the parent class methods
    switch (request.contentType) {
      case 'hero':
        return this.generateHeroContent(request.profile);
      case 'about':
        return this.generateAboutContent(request.profile);
      case 'services':
        return this.generateServiceContent(request.profile);
      case 'cta':
        return this.generateCTAContent(request.profile);
      case 'testimonial':
        return this.generateTestimonialContent(request.profile);
      default:
        return this.generateHeroContent(request.profile);
    }
  }
}

// Export for use in website builder
export const contentGenerator = new AIContentGenerator();