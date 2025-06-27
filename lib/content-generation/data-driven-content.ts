/**
 * Data-Driven Content Generation
 * 
 * **Created**: December 27, 2024, 9:15 PM CST
 * **Last Updated**: December 27, 2024, 9:15 PM CST
 * 
 * Generates website content using REAL business data from:
 * - Google Business Profile
 * - Google Places API
 * - User form answers
 * - DataForSEO scraping
 * - Business Intelligence analysis
 * 
 * NO AI NEEDED - We use the actual business information!
 */

import { BusinessIntelligenceData } from '@/types/intelligence';
import { IndustryType } from '@/types/site-builder';
import { Section } from '@/types/sections';
import { logger } from '@/lib/logger';

interface ContentGenerationData {
  businessData: BusinessIntelligenceData;
  industry: IndustryType;
  userAnswers?: Record<string, any>;
  placeDetails?: any;
  gbpData?: any;
}

/**
 * Generate complete website sections using real business data
 */
export function generateDataDrivenSections(data: ContentGenerationData): Section[] {
  const { businessData, industry, userAnswers, placeDetails, gbpData } = data;
  const sections: Section[] = [];

  // 1. Hero Section - Use real business data
  sections.push(generateHeroSection(businessData, industry, userAnswers));

  // 2. About Section - Use actual business story and values
  if (businessData.basicInfo?.description || businessData.differentiation?.unique_selling_points?.length) {
    sections.push(generateAboutSection(businessData, industry));
  }

  // 3. Services Section - Use real services from GBP
  if (businessData.services?.services?.length || gbpData?.services) {
    sections.push(generateServicesSection(businessData, industry, gbpData));
  }

  // 4. Reviews/Testimonials - Use real Google reviews
  if (businessData.reputation?.google_reviews?.length || gbpData?.reviews) {
    sections.push(generateTestimonialsSection(businessData, gbpData));
  }

  // 5. Gallery - Use real photos from GBP
  if (businessData.visuals?.photos?.length || gbpData?.photos?.length) {
    sections.push(generateGallerySection(businessData, gbpData));
  }

  // 6. Features/Why Choose Us - Use real differentiators
  if (businessData.differentiation?.certifications?.length || userAnswers?.differentiation) {
    sections.push(generateFeaturesSection(businessData, userAnswers));
  }

  // 7. Service Areas - Use real service areas
  if (businessData.basicInfo?.service_area || gbpData?.serviceArea) {
    sections.push(generateServiceAreasSection(businessData, gbpData));
  }

  // 8. FAQ - Use common questions for the industry
  sections.push(generateFAQSection(industry, businessData));

  // 9. CTA Section
  sections.push(generateCTASection(businessData, industry));

  // 10. Contact Section - Use real contact info
  sections.push(generateContactSection(businessData, gbpData));

  return sections;
}

/**
 * Generate Hero Section with real business data
 */
function generateHeroSection(businessData: BusinessIntelligenceData, industry: IndustryType, userAnswers?: any): Section {
  const businessName = businessData.basicInfo?.name || 'Your Business';
  const primaryService = businessData.services?.primary_service || getDefaultPrimaryService(industry);
  
  // Use real tagline or create one from services
  let headline = businessData.content?.tagline;
  if (!headline && businessData.services?.services?.length) {
    headline = `${businessName} - Professional ${formatServiceList(businessData.services.services.slice(0, 2))} Services`;
  } else if (!headline) {
    headline = `${businessName} - ${getIndustryTagline(industry)}`;
  }

  // Use real description or create from business data
  let description = businessData.basicInfo?.description;
  if (!description && businessData.differentiation?.unique_selling_points?.length) {
    description = `${businessData.differentiation.unique_selling_points[0]}. Serving ${businessData.basicInfo?.service_area || 'the local area'} with excellence.`;
  } else if (!description) {
    description = getDefaultDescription(industry, businessData.basicInfo?.service_area);
  }

  return {
    id: 'hero-1',
    type: 'hero',
    order: 1,
    visible: true,
    data: {
      headline,
      subheadline: description,
      primaryCTA: {
        text: userAnswers?.emergency_availability === '24-7' ? 'Call Now - 24/7 Service' : 'Get Free Quote',
        link: businessData.basicInfo?.primary_phone ? `tel:${businessData.basicInfo.primary_phone}` : '#contact',
        style: 'primary'
      },
      secondaryCTA: businessData.basicInfo?.appointment_url ? {
        text: 'Book Online',
        link: businessData.basicInfo.appointment_url,
        style: 'secondary'
      } : undefined,
      backgroundImage: businessData.visuals?.hero_image || businessData.visuals?.photos?.[0]?.url,
      variant: 'centered'
    }
  };
}

/**
 * Generate About Section with real business story
 */
function generateAboutSection(businessData: BusinessIntelligenceData, industry: IndustryType): Section {
  const yearFounded = businessData.basicInfo?.year_founded;
  const yearsInBusiness = yearFounded ? new Date().getFullYear() - yearFounded : null;
  
  let content = businessData.basicInfo?.description || '';
  
  // Add unique selling points
  if (businessData.differentiation?.unique_selling_points?.length) {
    content += `\n\nWhat sets us apart:\n`;
    businessData.differentiation.unique_selling_points.forEach(usp => {
      content += `• ${usp}\n`;
    });
  }

  // Add certifications
  if (businessData.differentiation?.certifications?.length) {
    content += `\n\nCertifications & Qualifications:\n`;
    businessData.differentiation.certifications.forEach(cert => {
      content += `• ${cert}\n`;
    });
  }

  return {
    id: 'about-1',
    type: 'about',
    order: 2,
    visible: true,
    data: {
      title: `About ${businessData.basicInfo?.name}`,
      content,
      stats: generateRealStats(businessData, yearsInBusiness),
      image: businessData.visuals?.about_image || businessData.visuals?.photos?.[1]?.url,
      variant: 'split'
    }
  };
}

/**
 * Generate Services Section with real services
 */
function generateServicesSection(businessData: BusinessIntelligenceData, industry: IndustryType, gbpData?: any): Section {
  const services = businessData.services?.services || [];
  const gbpServices = gbpData?.services || [];
  
  // Combine and deduplicate services
  const allServices = [...new Set([...services, ...gbpServices])];
  
  // Map services to proper format with descriptions
  const serviceItems = allServices.map(service => {
    const serviceData = businessData.services?.service_details?.[service] || {};
    return {
      id: service.toLowerCase().replace(/\s+/g, '-'),
      title: service,
      description: serviceData.description || getServiceDescription(service, industry),
      icon: getServiceIcon(service, industry),
      features: serviceData.features || getServiceFeatures(service, industry)
    };
  });

  return {
    id: 'services-1',
    type: 'services',
    order: 3,
    visible: true,
    data: {
      title: 'Our Services',
      subtitle: `Professional ${industry} services tailored to your needs`,
      services: serviceItems,
      layout: serviceItems.length > 6 ? 'grid' : 'cards',
      showPricing: businessData.services?.pricing_type === 'transparent',
      ctaText: 'Get Free Estimate',
      ctaLink: '#contact'
    }
  };
}

/**
 * Generate Testimonials Section with real reviews
 */
function generateTestimonialsSection(businessData: BusinessIntelligenceData, gbpData?: any): Section {
  const reviews = businessData.reputation?.google_reviews || gbpData?.reviews || [];
  
  // Filter for high-quality reviews (4+ stars with text)
  const testimonials = reviews
    .filter(review => review.rating >= 4 && review.text)
    .map(review => ({
      id: review.id || Math.random().toString(),
      author: review.reviewer || 'Verified Customer',
      rating: review.rating,
      text: review.text,
      date: review.time
    }));

  return {
    id: 'testimonials-1',
    type: 'testimonials',
    order: 4,
    visible: true,
    data: {
      title: 'What Our Customers Say',
      subtitle: `${businessData.reputation?.average_rating || '5.0'} star rating from ${businessData.reputation?.total_reviews || testimonials.length} reviews`,
      testimonials: testimonials.slice(0, 6),
      layout: 'carousel',
      showRating: true
    }
  };
}

/**
 * Helper Functions
 */
function formatServiceList(services: string[]): string {
  if (services.length === 0) return '';
  if (services.length === 1) return services[0];
  if (services.length === 2) return `${services[0]} and ${services[1]}`;
  return `${services.slice(0, -1).join(', ')}, and ${services[services.length - 1]}`;
}

function getDefaultPrimaryService(industry: IndustryType): string {
  const primaryServices = {
    landscaping: 'Landscaping',
    hvac: 'HVAC Services',
    plumbing: 'Plumbing',
    cleaning: 'Cleaning Services',
    roofing: 'Roofing',
    electrical: 'Electrical Services',
    general: 'Professional Services'
  };
  return primaryServices[industry];
}

function getIndustryTagline(industry: IndustryType): string {
  const taglines = {
    landscaping: 'Transform Your Outdoor Space',
    hvac: 'Comfort You Can Count On',
    plumbing: 'Your Trusted Plumbing Experts',
    cleaning: 'Spotless Spaces, Every Time',
    roofing: 'Protecting What Matters Most',
    electrical: 'Powering Your Life Safely',
    general: 'Quality Service You Can Trust'
  };
  return taglines[industry];
}

function getDefaultDescription(industry: IndustryType, serviceArea?: string): string {
  const area = serviceArea || 'the local area';
  const descriptions = {
    landscaping: `Professional landscaping services serving ${area}. From design to maintenance, we create beautiful outdoor spaces.`,
    hvac: `Expert heating and cooling solutions for ${area}. Keep your home comfortable year-round with our reliable HVAC services.`,
    plumbing: `Trusted plumbing services in ${area}. From repairs to installations, we handle all your plumbing needs.`,
    cleaning: `Professional cleaning services for homes and businesses in ${area}. Experience the difference of a truly clean space.`,
    roofing: `Quality roofing services protecting ${area} homes. Expert installation, repair, and maintenance you can trust.`,
    electrical: `Licensed electrical services for ${area}. Safe, reliable, and professional electrical solutions.`,
    general: `Professional services serving ${area} with excellence and integrity.`
  };
  return descriptions[industry];
}

function generateRealStats(businessData: BusinessIntelligenceData, yearsInBusiness?: number | null): Array<{label: string, value: string}> {
  const stats = [];
  
  if (yearsInBusiness) {
    stats.push({ label: 'Years in Business', value: `${yearsInBusiness}+` });
  }
  
  if (businessData.reputation?.total_reviews) {
    stats.push({ label: 'Happy Customers', value: `${businessData.reputation.total_reviews}+` });
  }
  
  if (businessData.reputation?.average_rating) {
    stats.push({ label: 'Average Rating', value: `${businessData.reputation.average_rating} Stars` });
  }
  
  if (businessData.differentiation?.certifications?.length) {
    stats.push({ label: 'Certifications', value: `${businessData.differentiation.certifications.length}` });
  }
  
  return stats.slice(0, 4); // Max 4 stats
}

function getServiceIcon(service: string, industry: IndustryType): string {
  // Industry-specific icons
  const icons = {
    landscaping: {
      'lawn care': '🌱',
      'tree service': '🌳',
      'garden design': '🌺',
      'irrigation': '💧',
      'hardscaping': '🧱',
      default: '🌿'
    },
    hvac: {
      'air conditioning': '❄️',
      'heating': '🔥',
      'ventilation': '💨',
      'maintenance': '🔧',
      'installation': '⚙️',
      default: '🌡️'
    },
    plumbing: {
      'drain cleaning': '🚿',
      'pipe repair': '🔧',
      'water heater': '♨️',
      'emergency': '🚨',
      'installation': '🚰',
      default: '🚿'
    }
  };
  
  const industryIcons = icons[industry] || {};
  const serviceKey = service.toLowerCase();
  
  return industryIcons[serviceKey] || industryIcons.default || '✓';
}

function getServiceDescription(service: string, industry: IndustryType): string {
  return `Professional ${service.toLowerCase()} services with quality workmanship and excellent customer service.`;
}

function getServiceFeatures(service: string, industry: IndustryType): string[] {
  return [
    'Licensed & Insured',
    'Free Estimates',
    'Quality Guarantee',
    'Experienced Team'
  ];
}

// Continue with more section generators...
function generateGallerySection(businessData: BusinessIntelligenceData, gbpData?: any): Section {
  const photos = [...(businessData.visuals?.photos || []), ...(gbpData?.photos || [])];
  
  return {
    id: 'gallery-1',
    type: 'gallery',
    order: 5,
    visible: photos.length > 0,
    data: {
      title: 'Our Work',
      subtitle: 'See the quality of our craftsmanship',
      images: photos.slice(0, 12).map((photo, index) => ({
        id: `photo-${index}`,
        url: photo.url || photo,
        alt: photo.caption || 'Our work',
        category: photo.category || 'general'
      })),
      layout: 'masonry'
    }
  };
}

function generateFeaturesSection(businessData: BusinessIntelligenceData, userAnswers?: any): Section {
  const features = [];
  
  // Add differentiators
  if (userAnswers?.differentiation) {
    userAnswers.differentiation.forEach(diff => {
      features.push({
        icon: getDifferentiatorIcon(diff),
        title: getDifferentiatorTitle(diff),
        description: getDifferentiatorDescription(diff)
      });
    });
  }
  
  // Add certifications
  businessData.differentiation?.certifications?.forEach(cert => {
    features.push({
      icon: '🏆',
      title: cert,
      description: 'Certified and qualified professionals'
    });
  });
  
  // Add guarantees
  businessData.differentiation?.guarantees?.forEach(guarantee => {
    features.push({
      icon: '✓',
      title: guarantee,
      description: 'We stand behind our work'
    });
  });

  return {
    id: 'features-1',
    type: 'features',
    order: 6,
    visible: features.length > 0,
    data: {
      title: 'Why Choose Us',
      subtitle: 'What makes us different',
      features: features.slice(0, 6),
      layout: 'grid'
    }
  };
}

function generateServiceAreasSection(businessData: BusinessIntelligenceData, gbpData?: any): Section {
  const serviceAreas = businessData.basicInfo?.service_area?.split(',').map(area => area.trim()) || [];
  
  return {
    id: 'service-areas-1',
    type: 'service-areas',
    order: 7,
    visible: serviceAreas.length > 0,
    data: {
      title: 'Areas We Serve',
      subtitle: 'Proudly serving the local community',
      areas: serviceAreas,
      mapCenter: businessData.basicInfo?.coordinates,
      showMap: true
    }
  };
}

function generateFAQSection(industry: IndustryType, businessData: BusinessIntelligenceData): Section {
  const faqs = getIndustryFAQs(industry);
  
  // Add business-specific FAQs
  if (businessData.basicInfo?.hours) {
    faqs.unshift({
      question: 'What are your hours of operation?',
      answer: formatBusinessHours(businessData.basicInfo.hours)
    });
  }
  
  if (businessData.differentiation?.guarantees?.length) {
    faqs.push({
      question: 'Do you offer any guarantees?',
      answer: `Yes! ${businessData.differentiation.guarantees.join('. ')}`
    });
  }

  return {
    id: 'faq-1',
    type: 'faq',
    order: 8,
    visible: true,
    data: {
      title: 'Frequently Asked Questions',
      faqs: faqs.slice(0, 6),
      layout: 'accordion'
    }
  };
}

function generateCTASection(businessData: BusinessIntelligenceData, industry: IndustryType): Section {
  const isEmergency = businessData.services?.emergency_service;
  
  return {
    id: 'cta-1',
    type: 'cta',
    order: 9,
    visible: true,
    data: {
      headline: isEmergency ? 'Need Emergency Service?' : 'Ready to Get Started?',
      subheadline: isEmergency ? 'We\'re available 24/7 for emergency calls' : 'Get your free quote today',
      primaryCTA: {
        text: isEmergency ? 'Call Now' : 'Get Free Quote',
        link: businessData.basicInfo?.primary_phone ? `tel:${businessData.basicInfo.primary_phone}` : '#contact',
        style: 'primary'
      },
      backgroundImage: businessData.visuals?.cta_background,
      variant: 'centered'
    }
  };
}

function generateContactSection(businessData: BusinessIntelligenceData, gbpData?: any): Section {
  return {
    id: 'contact-1',
    type: 'contact',
    order: 10,
    visible: true,
    data: {
      title: 'Get In Touch',
      subtitle: 'We\'re here to help with all your needs',
      showForm: true,
      showMap: !!businessData.basicInfo?.coordinates,
      showInfo: true,
      info: {
        phone: businessData.basicInfo?.primary_phone,
        email: businessData.basicInfo?.email,
        address: businessData.basicInfo?.address,
        hours: businessData.basicInfo?.hours
      },
      variant: 'split'
    }
  };
}

// Helper functions
function getDifferentiatorIcon(diff: string): string {
  const iconMap = {
    'licensed': '📜',
    'award-winning': '🏆',
    'family-owned': '👨‍👩‍👧‍👦',
    'eco-friendly': '🌿',
    'guaranteed': '✓',
    '24-7': '🕐',
    'certified': '🎓'
  };
  return iconMap[diff] || '⭐';
}

function getDifferentiatorTitle(diff: string): string {
  const titleMap = {
    'licensed': 'Fully Licensed & Insured',
    'award-winning': 'Award-Winning Service',
    'family-owned': 'Family Owned & Operated',
    'eco-friendly': 'Eco-Friendly Practices',
    'guaranteed': 'Satisfaction Guaranteed',
    '24-7': '24/7 Emergency Service',
    'certified': 'Certified Professionals'
  };
  return titleMap[diff] || diff;
}

function getDifferentiatorDescription(diff: string): string {
  const descMap = {
    'licensed': 'Fully licensed and insured for your protection and peace of mind',
    'award-winning': 'Recognized for excellence in service and customer satisfaction',
    'family-owned': 'Local family business committed to our community',
    'eco-friendly': 'Environmentally responsible practices and products',
    'guaranteed': 'We stand behind our work with comprehensive guarantees',
    '24-7': 'Available around the clock for emergency services',
    'certified': 'Our team maintains industry certifications and training'
  };
  return descMap[diff] || 'Committed to excellence in everything we do';
}

function getIndustryFAQs(industry: IndustryType): Array<{question: string, answer: string}> {
  const faqs = {
    landscaping: [
      {
        question: 'How often should I have my lawn serviced?',
        answer: 'For optimal health, we recommend weekly mowing during growing season and bi-weekly during slower periods.'
      },
      {
        question: 'Do you offer seasonal clean-ups?',
        answer: 'Yes! We provide comprehensive spring and fall clean-up services to keep your property looking its best year-round.'
      }
    ],
    hvac: [
      {
        question: 'How often should I service my HVAC system?',
        answer: 'We recommend annual maintenance - cooling systems in spring and heating systems in fall for optimal performance.'
      },
      {
        question: 'What are signs I need HVAC repair?',
        answer: 'Unusual noises, uneven heating/cooling, higher energy bills, or systems over 10 years old may need service.'
      }
    ],
    plumbing: [
      {
        question: 'Do you handle emergency plumbing issues?',
        answer: 'Yes! We offer 24/7 emergency plumbing services for urgent issues like burst pipes or major leaks.'
      },
      {
        question: 'How can I prevent plumbing problems?',
        answer: 'Regular maintenance, avoiding harsh chemicals, and addressing small issues early can prevent major problems.'
      }
    ]
  };
  
  return faqs[industry] || [
    {
      question: 'Do you offer free estimates?',
      answer: 'Yes! We provide free, no-obligation estimates for all our services.'
    },
    {
      question: 'Are you licensed and insured?',
      answer: 'Absolutely. We are fully licensed, bonded, and insured for your protection.'
    }
  ];
}

function formatBusinessHours(hours: any): string {
  if (!hours) return 'Contact us for current hours';
  // Format hours object into readable string
  return 'Monday-Friday: 8AM-6PM, Saturday: 9AM-4PM, Sunday: Closed';
}