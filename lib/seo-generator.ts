/**
 * SEO Meta Tags Generator
 * 
 * Automatically generates SEO-optimized meta tags, structured data,
 * and Open Graph tags based on business data and industry patterns.
 */

import { BusinessIntelligenceData } from '@/types/intelligence';
import { IndustryType } from '@/types/site-builder';

export interface SEOMetaTags {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: string;
    siteName: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
  structuredData: any;
}

export interface LocalSEOData {
  businessName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  hours: any;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * SEO Generator class
 */
export class SEOGenerator {
  private industryKeywords: Record<IndustryType, string[]>;
  private localModifiers: string[];

  constructor() {
    this.industryKeywords = this.loadIndustryKeywords();
    this.localModifiers = [
      'near me', 'local', 'in [city]', '[city] area', 'best in [city]',
      'top rated', 'professional', 'licensed', 'insured', 'affordable'
    ];
  }

  /**
   * Generate complete SEO meta tags for a business
   */
  generateMetaTags(
    businessData: BusinessIntelligenceData,
    industry: IndustryType,
    pageType: 'home' | 'services' | 'about' | 'contact' = 'home',
    subdomain: string
  ): SEOMetaTags {
    const businessName = businessData.gbp?.businessName || 'Local Business';
    const city = businessData.gbp?.fullAddress?.locality || 'Your Area';
    const state = businessData.gbp?.fullAddress?.administrativeArea || '';
    
    // Generate title based on page type
    const title = this.generateTitle(businessName, industry, city, pageType);
    
    // Generate description
    const description = this.generateDescription(businessData, industry, city, pageType);
    
    // Generate keywords
    const keywords = this.generateKeywords(industry, city, businessData);
    
    // Generate canonical URL
    const canonical = `https://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
    
    // Get primary image
    const primaryImage = businessData.gbp?.photos?.[0]?.url || 
                        `${canonical}/api/og-image?business=${encodeURIComponent(businessName)}`;

    return {
      title,
      description,
      keywords,
      canonical,
      openGraph: {
        title,
        description,
        image: primaryImage,
        url: canonical,
        type: 'website',
        siteName: businessName,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image: primaryImage,
      },
      structuredData: this.generateStructuredData(businessData, industry, canonical),
    };
  }

  /**
   * Generate page-specific titles
   */
  private generateTitle(
    businessName: string,
    industry: IndustryType,
    city: string,
    pageType: string
  ): string {
    const industryTerms = this.getIndustryTerms(industry);
    const primaryTerm = industryTerms[0];

    const titleTemplates = {
      home: [
        `${businessName} - Professional ${primaryTerm} in ${city}`,
        `${primaryTerm} Services in ${city} | ${businessName}`,
        `Top Rated ${primaryTerm} - ${businessName} | ${city}`,
        `${businessName} | Licensed ${primaryTerm} in ${city}`,
      ],
      services: [
        `${primaryTerm} Services - ${businessName} | ${city}`,
        `Professional ${primaryTerm} in ${city} | ${businessName}`,
        `${businessName} Services | ${primaryTerm} in ${city}`,
      ],
      about: [
        `About ${businessName} - ${primaryTerm} in ${city}`,
        `Meet the Team | ${businessName} ${primaryTerm}`,
        `${businessName} - Your Local ${primaryTerm} Experts`,
      ],
      contact: [
        `Contact ${businessName} - ${primaryTerm} in ${city}`,
        `Get a Quote | ${businessName} ${primaryTerm}`,
        `${businessName} Contact Info | ${city} ${primaryTerm}`,
      ],
    };

    const templates = titleTemplates[pageType as keyof typeof titleTemplates] || titleTemplates.home;
    return templates[0]; // Use first template for now, could randomize later
  }

  /**
   * Generate meta descriptions
   */
  private generateDescription(
    businessData: BusinessIntelligenceData,
    industry: IndustryType,
    city: string,
    pageType: string
  ): string {
    const businessName = businessData.gbp?.businessName || 'Local Business';
    const industryTerms = this.getIndustryTerms(industry);
    const primaryTerm = industryTerms[0];
    
    // Use existing description if available and good quality
    const existingDesc = businessData.gbp?.description;
    if (existingDesc && existingDesc.length > 120 && existingDesc.length < 160) {
      return existingDesc;
    }

    const descriptionTemplates = {
      home: [
        `Professional ${primaryTerm} services in ${city}. ${businessName} provides reliable, licensed ${primaryTerm} solutions. Get a free quote today!`,
        `Looking for ${primaryTerm} in ${city}? ${businessName} offers expert ${primaryTerm} services with guaranteed satisfaction. Call now!`,
        `${businessName} - your trusted ${primaryTerm} in ${city}. Licensed, insured, and locally owned. Contact us for a free estimate.`,
      ],
      services: [
        `Comprehensive ${primaryTerm} services from ${businessName} in ${city}. Licensed professionals, competitive pricing, satisfaction guaranteed.`,
        `${businessName} offers complete ${primaryTerm} solutions in ${city}. From repairs to installations, we've got you covered.`,
      ],
      about: [
        `Learn about ${businessName}, ${city}'s trusted ${primaryTerm} company. Our experienced team provides reliable, professional service.`,
        `${businessName} has been serving ${city} with quality ${primaryTerm} services. Meet our licensed, experienced team.`,
      ],
      contact: [
        `Contact ${businessName} for ${primaryTerm} services in ${city}. Get a free quote, schedule service, or ask questions. We're here to help!`,
        `Ready to hire a ${primaryTerm} in ${city}? Contact ${businessName} today for fast, reliable service and competitive pricing.`,
      ],
    };

    const templates = descriptionTemplates[pageType as keyof typeof descriptionTemplates] || descriptionTemplates.home;
    return templates[0];
  }

  /**
   * Generate SEO keywords
   */
  private generateKeywords(
    industry: IndustryType,
    city: string,
    businessData: BusinessIntelligenceData
  ): string[] {
    const industryKeywords = this.industryKeywords[industry] || [];
    const businessName = businessData.gbp?.businessName || '';
    
    // Base keywords
    const keywords = [...industryKeywords];
    
    // Add location-based keywords
    keywords.push(
      ...industryKeywords.map(keyword => `${keyword} ${city}`),
      ...industryKeywords.map(keyword => `${keyword} near me`),
      `${city} ${industryKeywords[0]}`,
      `best ${industryKeywords[0]} ${city}`,
      `local ${industryKeywords[0]}`,
      `licensed ${industryKeywords[0]}`,
      `professional ${industryKeywords[0]}`
    );
    
    // Add business-specific keywords
    if (businessName) {
      keywords.push(businessName, `${businessName} ${city}`);
    }
    
    // Add service-specific keywords
    const services = businessData.gbp?.services || [];
    services.forEach(service => {
      keywords.push(service, `${service} ${city}`);
    });

    // Remove duplicates and limit to 20 keywords
    return [...new Set(keywords)].slice(0, 20);
  }

  /**
   * Generate structured data (JSON-LD)
   */
  private generateStructuredData(
    businessData: BusinessIntelligenceData,
    industry: IndustryType,
    baseUrl: string
  ): any {
    const businessName = businessData.gbp?.businessName || 'Local Business';
    const address = businessData.gbp?.fullAddress;
    const phone = businessData.gbp?.primaryPhone;
    const website = businessData.gbp?.website || baseUrl;
    const description = businessData.gbp?.description;
    const hours = businessData.gbp?.regularHours;
    const reviews = businessData.gbp?.reviews;

    const structuredData: any = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: businessName,
      description,
      url: website,
      telephone: phone,
      priceRange: this.getPriceRange(industry),
    };

    // Add address if available
    if (address) {
      structuredData.address = {
        '@type': 'PostalAddress',
        streetAddress: address.addressLines?.join(', '),
        addressLocality: address.locality,
        addressRegion: address.administrativeArea,
        postalCode: address.postalCode,
        addressCountry: address.countryCode || 'US',
      };
    }

    // Add coordinates if available
    if (businessData.gbp?.coordinates) {
      structuredData.geo = {
        '@type': 'GeoCoordinates',
        latitude: businessData.gbp.coordinates.lat,
        longitude: businessData.gbp.coordinates.lng,
      };
    }

    // Add hours if available
    if (hours) {
      structuredData.openingHours = this.formatOpeningHours(hours);
    }

    // Add aggregate rating if available
    if (reviews && reviews.count > 0) {
      structuredData.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: reviews.rating,
        reviewCount: reviews.count,
        bestRating: 5,
        worstRating: 1,
      };
    }

    // Add industry-specific schema
    const industrySchema = this.getIndustrySchema(industry);
    if (industrySchema) {
      structuredData['@type'] = [structuredData['@type'], industrySchema];
    }

    return structuredData;
  }

  /**
   * Load industry-specific keywords
   */
  private loadIndustryKeywords(): Record<IndustryType, string[]> {
    return {
      landscaping: [
        'landscaping', 'lawn care', 'landscape design', 'tree trimming',
        'lawn mowing', 'garden design', 'irrigation', 'hardscaping',
        'mulching', 'sod installation', 'landscape maintenance'
      ],
      plumbing: [
        'plumbing', 'plumber', 'drain cleaning', 'water heater',
        'pipe repair', 'leak detection', 'toilet repair', 'faucet installation',
        'sewer line', 'emergency plumbing', 'bathroom remodel'
      ],
      hvac: [
        'hvac', 'air conditioning', 'heating', 'ac repair',
        'furnace repair', 'duct cleaning', 'hvac installation',
        'air conditioning repair', 'heating repair', 'hvac maintenance'
      ],
      cleaning: [
        'cleaning service', 'house cleaning', 'maid service',
        'commercial cleaning', 'office cleaning', 'deep cleaning',
        'move out cleaning', 'carpet cleaning', 'window cleaning'
      ],
      roofing: [
        'roofing', 'roof repair', 'roof replacement', 'roofer',
        'roof installation', 'roof inspection', 'gutter repair',
        'shingle repair', 'roof maintenance', 'storm damage repair'
      ],
      electrical: [
        'electrician', 'electrical repair', 'electrical installation',
        'wiring', 'electrical service', 'panel upgrade',
        'outlet installation', 'lighting installation', 'electrical inspection'
      ],
      general: [
        'contractor', 'home services', 'professional services',
        'local business', 'licensed contractor', 'home improvement'
      ],
    };
  }

  /**
   * Get industry-specific terms
   */
  private getIndustryTerms(industry: IndustryType): string[] {
    return this.industryKeywords[industry] || this.industryKeywords.general;
  }

  /**
   * Get price range for industry
   */
  private getPriceRange(industry: IndustryType): string {
    const priceRanges = {
      landscaping: '$$',
      plumbing: '$$$',
      hvac: '$$$',
      cleaning: '$$',
      roofing: '$$$',
      electrical: '$$$',
      general: '$$',
    };
    
    return priceRanges[industry] || '$$';
  }

  /**
   * Get industry-specific schema type
   */
  private getIndustrySchema(industry: IndustryType): string | null {
    const schemaTypes = {
      landscaping: 'LandscapingBusiness',
      plumbing: 'Plumber',
      hvac: 'HVACBusiness',
      cleaning: 'HousePainter', // Closest available
      roofing: 'RoofingContractor',
      electrical: 'Electrician',
      general: null,
    };
    
    return schemaTypes[industry];
  }

  /**
   * Format opening hours for schema
   */
  private formatOpeningHours(hours: any): string[] {
    // This would need to be implemented based on the GBP hours format
    // For now, return a default format
    return [
      'Mo-Fr 08:00-17:00',
      'Sa 09:00-15:00'
    ];
  }
}

/**
 * Generate meta tags for a page
 */
export async function generatePageMetaTags(
  businessIntelligenceId: string,
  pageType: 'home' | 'services' | 'about' | 'contact',
  subdomain: string
): Promise<SEOMetaTags | null> {
  try {
    const { prisma } = await import('@/lib/prisma');
    
    const businessIntelligence = await prisma.businessIntelligence.findUnique({
      where: { id: businessIntelligenceId },
    });

    if (!businessIntelligence) {
      return null;
    }

    const seoGenerator = new SEOGenerator();
    const industry = detectIndustryFromData(businessIntelligence.data as any);
    
    return seoGenerator.generateMetaTags(
      businessIntelligence.data as any,
      industry,
      pageType,
      subdomain
    );
  } catch (error) {
    console.error('Failed to generate meta tags:', error);
    return null;
  }
}

/**
 * Detect industry from business data
 */
function detectIndustryFromData(data: BusinessIntelligenceData): IndustryType {
  const name = data.gbp?.businessName?.toLowerCase() || '';
  const categories = data.gbp?.categories?.join(' ').toLowerCase() || '';
  const services = data.gbp?.services?.join(' ').toLowerCase() || '';
  const combined = `${name} ${categories} ${services}`;

  if (combined.includes('landscap') || combined.includes('lawn') || combined.includes('garden')) {
    return 'landscaping';
  }
  if (combined.includes('plumb') || combined.includes('pipe') || combined.includes('drain')) {
    return 'plumbing';
  }
  if (combined.includes('hvac') || combined.includes('heating') || combined.includes('cooling')) {
    return 'hvac';
  }
  if (combined.includes('clean') || combined.includes('maid') || combined.includes('janitor')) {
    return 'cleaning';
  }
  if (combined.includes('roof') || combined.includes('shingle') || combined.includes('gutter')) {
    return 'roofing';
  }
  if (combined.includes('electric') || combined.includes('wiring')) {
    return 'electrical';
  }

  return 'general';
}

/**
 * Export singleton instance
 */
export const seoGenerator = new SEOGenerator();