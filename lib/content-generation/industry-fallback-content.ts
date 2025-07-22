/**
 * Industry-Specific Fallback Content
 * 
 * Rich, high-quality content templates for when AI generation is unavailable
 * Uses actual industry data and best practices
 */

import { IndustryType } from '@/types/site-builder';

interface IndustryContent {
  hero: {
    headlines: string[];
    subheadlines: string[];
    ctaTexts: string[];
  };
  about: {
    headlines: string[];
    descriptions: string[];
  };
  services: {
    headlines: string[];
    descriptions: string[];
    serviceDescriptions: Record<string, string>;
  };
  features: string[];
  trustSignals: string[];
  faqs: Array<{ q: string; a: string }>;
}

export const industryContent: Record<IndustryType, IndustryContent> = {
  landscaping: {
    hero: {
      headlines: [
        'Transform Your Outdoor Space',
        'Love Your Lawn Again',
        'Your Dream Yard Awaits',
        'Beautiful Landscapes, Lasting Results',
        'Expert Landscaping Services in {city}'
      ],
      subheadlines: [
        'From lawn care to complete landscape design, we create and maintain beautiful outdoor spaces that increase your property value.',
        'Let our expert team handle all your landscaping needs while you enjoy your weekends. Satisfaction guaranteed.',
        'Professional landscaping services tailored to {city}\'s climate. Licensed, insured, and dedicated to excellence.',
        'Creating stunning outdoor environments for homeowners and businesses throughout {city} and surrounding areas.'
      ],
      ctaTexts: [
        'Get Free Estimate',
        'Request Quote',
        'Schedule Consultation',
        'Call Now for Free Quote',
        'Book Your Service'
      ]
    },
    about: {
      headlines: [
        'Your Local Landscaping Experts',
        'Beautifying {city} Since {year}',
        'Dedicated to Outdoor Excellence',
        'About {businessName}'
      ],
      descriptions: [
        'With over {yearsInBusiness} years of experience serving {city} and surrounding areas, we\'ve built our reputation on quality workmanship, attention to detail, and exceptional customer service. Our team of certified professionals is passionate about creating and maintaining beautiful outdoor spaces that enhance your property and lifestyle.',
        'At {businessName}, we believe every property deserves a beautiful landscape. Our comprehensive services range from routine lawn maintenance to complete landscape transformations. We use industry-leading techniques and eco-friendly practices to ensure your outdoor space thrives year-round.',
        'What sets us apart is our commitment to understanding each client\'s unique vision and bringing it to life. Whether you need weekly lawn care, seasonal cleanups, or a complete landscape redesign, our experienced team delivers results that exceed expectations.'
      ]
    },
    services: {
      headlines: [
        'Comprehensive Landscaping Services',
        'Our Professional Services',
        'What We Offer',
        'Full-Service Landscaping Solutions'
      ],
      descriptions: [
        'From routine maintenance to complete landscape transformations, we offer a full range of services to keep your property looking its best year-round.',
        'Our expert team provides professional landscaping services tailored to your needs and budget. Every project is backed by our satisfaction guarantee.'
      ],
      serviceDescriptions: {
        'Lawn Care & Maintenance': 'Keep your lawn looking its best with our comprehensive maintenance services including mowing, edging, fertilization, and weed control. We customize our approach based on your grass type and local conditions.',
        'Landscape Design & Installation': 'Transform your outdoor space with professional landscape design. From initial consultation to final installation, we work with you to create a beautiful, functional landscape that complements your home.',
        'Hardscaping': 'Extend your living space outdoors with expert hardscaping services. We design and install patios, walkways, retaining walls, and more using quality materials that stand the test of time.',
        'Irrigation & Drainage': 'Protect your landscape investment with efficient irrigation systems and proper drainage solutions. We install, repair, and maintain systems that conserve water while keeping your landscape healthy.',
        'Tree & Shrub Care': 'Professional pruning, trimming, and health care for all your trees and shrubs. Our certified arborists ensure your plants thrive while maintaining safety and aesthetics.',
        'Seasonal Services': 'Year-round property care including spring and fall cleanups, leaf removal, mulching, and snow removal. We keep your property beautiful through every season.'
      }
    },
    features: [
      'Licensed & Insured Professionals',
      'Free Estimates & Consultations',
      '{yearsInBusiness}+ Years of Experience',
      'Satisfaction Guaranteed',
      'Eco-Friendly Practices',
      'Local, Family-Owned Business',
      'Same-Week Service Available',
      'Custom Maintenance Plans'
    ],
    trustSignals: [
      'Licensed & Insured',
      'Free Estimates',
      '{yearsInBusiness} Years Experience',
      'Locally Owned',
      'Satisfaction Guaranteed',
      'Same-Day Quotes',
      'No Contracts Required',
      'Eco-Friendly Options'
    ],
    faqs: [
      {
        q: 'How often should I have my lawn mowed?',
        a: 'Most lawns in {city} need weekly mowing during growing season (spring/summer) and bi-weekly in fall. We\'ll recommend a schedule based on your grass type and growth rate.'
      },
      {
        q: 'Do you offer organic lawn care options?',
        a: 'Yes! We offer eco-friendly fertilization and pest control options that are safe for children, pets, and the environment.'
      },
      {
        q: 'How much does landscaping cost?',
        a: 'Every project is unique. Basic lawn care starts at $35 per visit, while design projects vary based on size and scope. We provide free, detailed estimates for all work.'
      },
      {
        q: 'Are you licensed and insured?',
        a: 'Absolutely. We\'re fully licensed, bonded, and insured for your protection. Our team is trained in safety and best practices.'
      },
      {
        q: 'Do you require contracts?',
        a: 'No contracts required for most services. We offer flexible scheduling and seasonal packages for those who want them.'
      },
      {
        q: 'What areas do you service?',
        a: 'We proudly serve {city} and surrounding communities within a {serviceRadius} radius. Contact us to confirm we service your area.'
      }
    ]
  },
  // Add other industries here...
  hvac: {
    // HVAC-specific content...
  },
  plumbing: {
    // Plumbing-specific content...
  },
  cleaning: {
    // Cleaning-specific content...
  }
};

/**
 * Get fallback content for a specific industry and section
 */
export function getIndustryFallbackContent(
  industry: IndustryType,
  section: string,
  contentType: string,
  variables: Record<string, string> = {}
): string {
  const content = industryContent[industry] || industryContent.landscaping;
  const sectionContent = content[section as keyof IndustryContent];
  
  if (!sectionContent) return 'Professional service you can trust';
  
  let result = '';
  
  // Get appropriate content based on section and type
  if (section === 'hero' && contentType === 'headline') {
    result = sectionContent.headlines[Math.floor(Math.random() * sectionContent.headlines.length)];
  } else if (section === 'hero' && contentType === 'subheadline') {
    result = sectionContent.subheadlines[Math.floor(Math.random() * sectionContent.subheadlines.length)];
  } else if (section === 'hero' && contentType === 'cta-text') {
    result = sectionContent.ctaTexts[Math.floor(Math.random() * sectionContent.ctaTexts.length)];
  }
  // Add more section/type combinations...
  
  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  return result;
}

/**
 * Generate complete fallback website content
 */
export function generateCompleteFallbackContent(
  industry: IndustryType,
  businessData: any
): any {
  const variables = {
    businessName: businessData.name || 'Our Business',
    city: businessData.city || 'your area',
    year: businessData.yearFounded || '2010',
    yearsInBusiness: businessData.yearsInBusiness || '10',
    serviceRadius: businessData.serviceRadius || '25-mile',
  };
  
  const content = industryContent[industry] || industryContent.landscaping;
  
  return {
    hero: {
      headline: getIndustryFallbackContent(industry, 'hero', 'headline', variables),
      subheadline: getIndustryFallbackContent(industry, 'hero', 'subheadline', variables),
      ctaText: getIndustryFallbackContent(industry, 'hero', 'cta-text', variables),
    },
    about: {
      headline: content.about.headlines[0].replace(/{(\w+)}/g, (match, key) => variables[key] || match),
      description: content.about.descriptions[0].replace(/{(\w+)}/g, (match, key) => variables[key] || match),
    },
    services: {
      headline: content.services.headlines[0],
      description: content.services.descriptions[0],
      serviceDescriptions: content.services.serviceDescriptions,
    },
    features: content.features.map(f => f.replace(/{(\w+)}/g, (match, key) => variables[key] || match)),
    trustSignals: content.trustSignals.map(t => t.replace(/{(\w+)}/g, (match, key) => variables[key] || match)),
    faqs: content.faqs.map(faq => ({
      q: faq.q.replace(/{(\w+)}/g, (match, key) => variables[key] || match),
      a: faq.a.replace(/{(\w+)}/g, (match, key) => variables[key] || match),
    })),
  };
}
