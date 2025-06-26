import { 
  BusinessIntelligenceData, 
  DataScore, 
  IndustryIntelligence,
  SmartQuestion,
  SectionRecommendation 
} from '@/types/intelligence';
import { SiteWithPages } from '@/lib/site-data';
import { IndustryType } from '@/types/site-builder';

/**
 * Core Data Scoring Algorithm
 * Evaluates available data to determine content richness and what questions to ask
 */
export function calculateDataScore(data: BusinessIntelligenceData): DataScore {
  const scores = {
    basicInfo: 0,
    content: 0,
    visuals: 0,
    trust: 0,
    differentiation: 0
  };
  
  const missingCritical: string[] = [];
  
  // Basic Info Scoring (20 points max)
  if (data.gbp?.businessName) {
    scores.basicInfo += 5;
  } else {
    missingCritical.push('businessName');
  }
  
  if (data.gbp?.categories?.length > 0) {
    scores.basicInfo += 5;
  } else {
    missingCritical.push('businessCategory');
  }
  
  if (data.gbp?.hours) {
    scores.basicInfo += 5;
  }
  
  if (data.gbp?.phone || data.gbp?.attributes?.phone) {
    scores.basicInfo += 5;
  } else {
    missingCritical.push('phoneNumber');
  }
  
  // Content Scoring (20 points max)
  const descriptionLength = data.gbp?.description?.length || 0;
  if (descriptionLength > 200) {
    scores.content += 10;
  } else if (descriptionLength > 100) {
    scores.content += 5;
  }
  
  if (data.manual?.specializations?.length > 0) {
    scores.content += 5;
  }
  
  if (data.serp?.peopleAlsoAsk?.length > 0) {
    scores.content += 5;
  }
  
  // Visual Scoring (20 points max)
  const gbpPhotos = data.gbp?.photos?.length || 0;
  const placesPhotos = data.places?.photos?.length || 0;
  const totalPhotos = gbpPhotos + placesPhotos;
  
  if (totalPhotos >= 1) scores.visuals += 5;
  if (totalPhotos >= 4) scores.visuals += 10;
  if (totalPhotos >= 10) scores.visuals += 5;
  
  if (!data.gbp?.photos?.length) {
    missingCritical.push('photos');
  }
  
  // Trust Scoring (20 points max)
  const rating = data.gbp?.reviews?.rating || data.places?.reviews?.rating || 0;
  const reviewCount = data.gbp?.reviews?.count || data.places?.reviews?.total || 0;
  
  if (rating >= 4.5 && reviewCount >= 20) {
    scores.trust += 15;
  } else if (rating >= 4.0 && reviewCount >= 10) {
    scores.trust += 10;
  } else if (rating >= 3.5 && reviewCount >= 5) {
    scores.trust += 5;
  }
  
  if (data.manual?.certifications?.length > 0) {
    scores.trust += 5;
  }
  
  // Differentiation Scoring (20 points max)
  if (data.manual?.awards?.length > 0) {
    scores.differentiation += 10;
  }
  
  const yearsInBusiness = data.manual?.yearsInBusiness || 0;
  if (yearsInBusiness >= 10) {
    scores.differentiation += 5;
  } else if (yearsInBusiness >= 5) {
    scores.differentiation += 3;
  }
  
  if (data.places?.reviews?.highlights?.length > 3) {
    scores.differentiation += 5;
  }
  
  // Calculate total and determine tier
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const contentTier = total >= 70 ? 'premium' : total >= 40 ? 'standard' : 'minimal';
  
  return {
    total,
    breakdown: scores,
    missingCritical,
    contentTier
  };
}

/**
 * Industry-Specific Intelligence Profiles
 */
export const industryProfiles: Record<IndustryType, IndustryIntelligence> = {
  landscaping: {
    industry: 'landscaping',
    patterns: {
      preferredContact: 'form',
      urgencyFactors: ['storm damage', 'event preparation', 'seasonal'],
      criticalSections: ['hero', 'services', 'gallery', 'contact'],
      optionalSections: ['about', 'testimonials', 'service-areas', 'faq'],
      maxServicesDisplay: 6,
      serviceCategories: ['Lawn Care', 'Design', 'Maintenance', 'Hardscaping', 'Tree Service', 'Irrigation']
    },
    seo: {
      primaryKeywords: ['landscaping', 'lawn care', 'landscape design', 'yard maintenance'],
      localKeywords: ['landscaping near me', 'local landscapers', 'lawn service near me'],
      commercialIntent: ['landscaping quote', 'landscaping cost', 'free landscape estimate'],
      informationalQueries: ['lawn care tips', 'best plants for', 'landscape ideas', 'how to maintain lawn']
    },
    conversion: {
      primaryCTA: 'Get Free Estimate',
      secondaryCTA: 'View Our Work',
      urgencyTriggers: ['Spring booking fast', 'Schedule before season', 'Limited availability'],
      trustElements: ['Licensed & Insured', 'Award Winning', 'Eco-Friendly', 'Local & Trusted']
    },
    commonCertifications: [
      'Licensed Landscaper',
      'Certified Arborist',
      'EPA WaterSense Partner',
      'PLANET Certified',
      'BBB Accredited'
    ]
  },
  
  plumbing: {
    industry: 'plumbing',
    patterns: {
      preferredContact: 'phone',
      urgencyFactors: ['emergency', 'leak', 'no water', 'flooding', 'burst pipe'],
      criticalSections: ['hero', 'services', 'contact', 'service-areas'],
      optionalSections: ['about', 'testimonials', 'faq', 'trust-bar'],
      maxServicesDisplay: 4,
      serviceCategories: ['Emergency', 'Repair', 'Installation', 'Maintenance']
    },
    seo: {
      primaryKeywords: ['plumber', 'plumbing', 'emergency plumber', 'plumbing repair'],
      localKeywords: ['plumber near me', '24 hour plumber', 'emergency plumber near me'],
      commercialIntent: ['plumbing repair cost', 'emergency plumber', 'plumbing service'],
      informationalQueries: ['fix leaky faucet', 'unclog drain', 'water heater repair']
    },
    conversion: {
      primaryCTA: 'Call Now: 24/7 Emergency',
      secondaryCTA: 'Schedule Service',
      urgencyTriggers: ['24/7 Emergency Service', 'Same Day Service', 'Fast Response'],
      trustElements: ['Licensed Master Plumber', 'BBB Accredited', 'Insured & Bonded', 'Upfront Pricing']
    },
    commonCertifications: [
      'Licensed Master Plumber',
      'State License #',
      'BBB A+ Rating',
      'Angie\'s List Award',
      'HomeAdvisor Elite'
    ]
  },
  
  hvac: {
    industry: 'hvac',
    patterns: {
      preferredContact: 'appointment',
      urgencyFactors: ['no heat', 'no AC', 'emergency', 'breakdown'],
      criticalSections: ['hero', 'services', 'contact', 'trust-bar'],
      optionalSections: ['about', 'testimonials', 'service-areas', 'maintenance-plans'],
      maxServicesDisplay: 5,
      serviceCategories: ['Heating', 'Cooling', 'Installation', 'Maintenance', 'Indoor Air Quality']
    },
    seo: {
      primaryKeywords: ['HVAC', 'heating and cooling', 'AC repair', 'furnace repair'],
      localKeywords: ['HVAC near me', 'AC repair near me', 'heating repair near me'],
      commercialIntent: ['HVAC service', 'AC installation cost', 'furnace replacement'],
      informationalQueries: ['AC not cooling', 'furnace not working', 'HVAC maintenance']
    },
    conversion: {
      primaryCTA: 'Schedule Service',
      secondaryCTA: 'Get Free Quote',
      urgencyTriggers: ['24/7 Emergency', 'Same Day Service', 'Seasonal Special'],
      trustElements: ['EPA Certified', 'NATE Certified', 'Energy Star Partner', 'Factory Authorized']
    },
    commonCertifications: [
      'EPA Certified',
      'NATE Certified',
      'Energy Star Partner',
      'Factory Authorized Dealer',
      'BBB Accredited'
    ]
  },
  
  cleaning: {
    industry: 'cleaning',
    patterns: {
      preferredContact: 'form',
      urgencyFactors: ['move-out', 'event', 'emergency cleanup'],
      criticalSections: ['hero', 'services', 'pricing', 'contact'],
      optionalSections: ['about', 'testimonials', 'service-areas', 'faq'],
      maxServicesDisplay: 6,
      serviceCategories: ['Residential', 'Commercial', 'Deep Clean', 'Regular Service', 'Move In/Out', 'Special']
    },
    seo: {
      primaryKeywords: ['cleaning service', 'house cleaning', 'maid service', 'commercial cleaning'],
      localKeywords: ['cleaning service near me', 'house cleaners near me', 'maid service near me'],
      commercialIntent: ['house cleaning cost', 'cleaning service prices', 'maid service rates'],
      informationalQueries: ['how often house cleaning', 'cleaning service checklist', 'eco-friendly cleaning']
    },
    conversion: {
      primaryCTA: 'Get Free Quote',
      secondaryCTA: 'Book Online',
      urgencyTriggers: ['First Clean 50% Off', 'Book This Week', 'Limited Spots'],
      trustElements: ['Bonded & Insured', 'Background Checked', 'Eco-Friendly', 'Satisfaction Guarantee']
    },
    commonCertifications: [
      'Bonded & Insured',
      'ISSA Certified',
      'Green Seal Certified',
      'BBB Accredited',
      'CIMS Certified'
    ]
  },
  
  roofing: {
    industry: 'roofing',
    patterns: {
      preferredContact: 'form',
      urgencyFactors: ['leak', 'storm damage', 'emergency'],
      criticalSections: ['hero', 'services', 'gallery', 'contact'],
      optionalSections: ['about', 'testimonials', 'warranty', 'financing'],
      maxServicesDisplay: 5,
      serviceCategories: ['Repair', 'Replacement', 'Installation', 'Inspection', 'Emergency']
    },
    seo: {
      primaryKeywords: ['roofing', 'roof repair', 'roof replacement', 'roofing contractor'],
      localKeywords: ['roofer near me', 'roofing company near me', 'roof repair near me'],
      commercialIntent: ['roof replacement cost', 'roofing estimate', 'roof repair quote'],
      informationalQueries: ['roof leak repair', 'when replace roof', 'roofing materials']
    },
    conversion: {
      primaryCTA: 'Get Free Inspection',
      secondaryCTA: 'View Our Work',
      urgencyTriggers: ['Storm Damage Specialist', 'Insurance Claims Help', 'Emergency Service'],
      trustElements: ['Licensed & Insured', 'GAF Certified', 'Warranty Available', 'Insurance Approved']
    },
    commonCertifications: [
      'State License #',
      'GAF Master Elite',
      'Owens Corning Preferred',
      'BBB A+ Rating',
      'Angie\'s List Award'
    ]
  },
  
  electrical: {
    industry: 'electrical',
    patterns: {
      preferredContact: 'phone',
      urgencyFactors: ['power outage', 'electrical emergency', 'sparks', 'burning smell'],
      criticalSections: ['hero', 'services', 'contact', 'trust-bar'],
      optionalSections: ['about', 'testimonials', 'service-areas', 'safety-tips'],
      maxServicesDisplay: 5,
      serviceCategories: ['Residential', 'Commercial', 'Emergency', 'Installation', 'Inspection']
    },
    seo: {
      primaryKeywords: ['electrician', 'electrical repair', 'electrical service', 'licensed electrician'],
      localKeywords: ['electrician near me', 'emergency electrician near me', 'electrical repair near me'],
      commercialIntent: ['electrician cost', 'electrical work quote', 'electrical inspection'],
      informationalQueries: ['electrical safety', 'circuit breaker problems', 'electrical code']
    },
    conversion: {
      primaryCTA: 'Call Licensed Electrician',
      secondaryCTA: 'Schedule Inspection',
      urgencyTriggers: ['24/7 Emergency', 'Code Violations Fixed', 'Safety First'],
      trustElements: ['Master Electrician', 'Licensed & Insured', 'Code Compliant', 'Safety Certified']
    },
    commonCertifications: [
      'Master Electrician License',
      'State License #',
      'OSHA Certified',
      'BBB Accredited',
      'NECA Member'
    ]
  },
  
  general: {
    industry: 'general',
    patterns: {
      preferredContact: 'form',
      urgencyFactors: [],
      criticalSections: ['hero', 'services', 'about', 'contact'],
      optionalSections: ['testimonials', 'gallery', 'faq'],
      maxServicesDisplay: 6,
      serviceCategories: []
    },
    seo: {
      primaryKeywords: ['service', 'professional', 'local business'],
      localKeywords: ['near me', 'local', 'nearby'],
      commercialIntent: ['quote', 'estimate', 'cost'],
      informationalQueries: ['how to', 'tips', 'guide']
    },
    conversion: {
      primaryCTA: 'Get Quote',
      secondaryCTA: 'Learn More',
      urgencyTriggers: ['Free Consultation', 'Limited Time Offer'],
      trustElements: ['Licensed & Insured', 'Experienced', 'Local Business']
    },
    commonCertifications: [
      'Licensed & Insured',
      'BBB Member',
      'Chamber of Commerce',
      'Trade Association'
    ]
  }
};

/**
 * Generate smart questions based on missing data
 */
export function generateSmartQuestions(
  dataScore: DataScore,
  industry: IndustryIntelligence,
  existingData: BusinessIntelligenceData
): SmartQuestion[] {
  const questions: SmartQuestion[] = [];
  
  // Priority 1: Services (if missing)
  if (!existingData.gbp?.services || existingData.gbp.services.length === 0) {
    questions.push({
      id: 'services',
      type: 'service-grid',
      priority: 1,
      category: 'critical',
      question: `Select your top ${industry.patterns.maxServicesDisplay} services`,
      options: generateServiceOptions(industry),
      skipCondition: (data) => data.gbp?.services?.length > 0
    });
  }
  
  // Priority 2: Differentiators (if low differentiation score)
  if (dataScore.breakdown.differentiation < 10) {
    questions.push({
      id: 'differentiators',
      type: 'tinder-swipe',
      priority: 2,
      category: 'enhancement',
      question: 'What makes your business special?',
      options: [
        { value: 'family-owned', label: 'Family Owned', icon: '👨‍👩‍👧‍👦' },
        { value: 'eco-friendly', label: 'Eco-Friendly', icon: '🌱' },
        { value: 'award-winning', label: 'Award Winning', icon: '🏆' },
        { value: 'woman-owned', label: 'Woman Owned', icon: '👩‍💼' },
        { value: 'veteran-owned', label: 'Veteran Owned', icon: '🎖️' },
        { value: 'locally-owned', label: 'Locally Owned', icon: '🏘️' },
        { value: 'certified-pro', label: 'Certified Professional', icon: '✅' },
        { value: 'price-match', label: 'Price Match Guarantee', icon: '💰' },
        { value: 'free-estimates', label: 'Free Estimates', icon: '📋' },
        { value: 'emergency-service', label: '24/7 Emergency', icon: '🚨' }
      ]
    });
  }
  
  // Priority 3: Business Stage (if no years in business)
  if (!existingData.manual?.yearsInBusiness) {
    questions.push({
      id: 'business-stage',
      type: 'quick-select',
      priority: 3,
      category: 'personalization',
      question: 'How long have you been in business?',
      options: [
        { value: '0-1', label: 'Just Started', description: 'Less than 1 year' },
        { value: '1-5', label: '1-5 Years', description: 'Building reputation' },
        { value: '5-10', label: '5-10 Years', description: 'Established business' },
        { value: '10+', label: '10+ Years', description: 'Industry veteran', popular: true }
      ]
    });
  }
  
  // Priority 4: Service Style (for engagement)
  if (dataScore.total < 60) {
    questions.push({
      id: 'service-style',
      type: 'yes-no-visual',
      priority: 3,
      category: 'personalization',
      question: getServiceStyleQuestion(industry),
      options: getServiceStyleOptions(industry)
    });
  }
  
  // Priority 5: Certifications (if none listed)
  if (!existingData.manual?.certifications || existingData.manual.certifications.length === 0) {
    questions.push({
      id: 'certifications',
      type: 'quick-select',
      priority: 3,
      category: 'enhancement',
      question: 'Select your certifications & memberships',
      options: industry.commonCertifications.map(cert => ({
        value: cert.toLowerCase().replace(/\s+/g, '-'),
        label: cert
      }))
    });
  }
  
  // Return top 5 questions max
  return questions.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

/**
 * Helper function to generate service options based on industry
 */
function generateServiceOptions(industry: IndustryIntelligence): any[] {
  const commonServices = {
    landscaping: [
      { value: 'lawn-mowing', label: 'Lawn Mowing', popular: true },
      { value: 'landscape-design', label: 'Landscape Design', popular: true },
      { value: 'tree-trimming', label: 'Tree Trimming' },
      { value: 'mulching', label: 'Mulching & Bed Maintenance' },
      { value: 'irrigation', label: 'Irrigation & Sprinklers' },
      { value: 'hardscaping', label: 'Hardscaping & Patios' },
      { value: 'sod-installation', label: 'Sod Installation' },
      { value: 'seasonal-cleanup', label: 'Seasonal Cleanup' },
      { value: 'fertilization', label: 'Fertilization & Weed Control' },
      { value: 'snow-removal', label: 'Snow Removal' }
    ],
    plumbing: [
      { value: 'emergency-repair', label: 'Emergency Repair', popular: true },
      { value: 'drain-cleaning', label: 'Drain Cleaning', popular: true },
      { value: 'water-heater', label: 'Water Heater Service' },
      { value: 'leak-repair', label: 'Leak Detection & Repair' },
      { value: 'toilet-repair', label: 'Toilet Repair' },
      { value: 'faucet-install', label: 'Faucet Installation' },
      { value: 'pipe-repair', label: 'Pipe Repair' },
      { value: 'sewer-service', label: 'Sewer Line Service' },
      { value: 'water-treatment', label: 'Water Treatment' },
      { value: 'bathroom-remodel', label: 'Bathroom Remodeling' }
    ],
    hvac: [
      { value: 'ac-repair', label: 'AC Repair', popular: true },
      { value: 'heating-repair', label: 'Heating Repair', popular: true },
      { value: 'maintenance', label: 'Preventive Maintenance' },
      { value: 'installation', label: 'System Installation' },
      { value: 'duct-cleaning', label: 'Duct Cleaning' },
      { value: 'indoor-air', label: 'Indoor Air Quality' },
      { value: 'thermostat', label: 'Thermostat Service' },
      { value: 'emergency-service', label: '24/7 Emergency Service' },
      { value: 'energy-audit', label: 'Energy Efficiency Audit' }
    ]
  };
  
  return commonServices[industry.industry] || [];
}

/**
 * Get service style question based on industry
 */
function getServiceStyleQuestion(industry: IndustryIntelligence): string {
  const questions = {
    landscaping: 'Do you offer year-round maintenance plans?',
    plumbing: 'Do you offer 24/7 emergency service?',
    hvac: 'Do you offer maintenance agreements?',
    cleaning: 'Do you offer recurring cleaning plans?',
    roofing: 'Do you work with insurance claims?',
    electrical: 'Do you offer emergency electrical service?',
    general: 'Do you offer emergency services?'
  };
  
  return questions[industry.industry] || questions.general;
}

/**
 * Get service style options based on industry
 */
function getServiceStyleOptions(industry: IndustryIntelligence): any[] {
  const options = {
    landscaping: [
      { value: 'yes-plans', label: 'Yes, Annual Plans', icon: '📅' },
      { value: 'no-onetime', label: 'One-Time Services', icon: '✂️' }
    ],
    plumbing: [
      { value: 'yes-247', label: 'Yes, 24/7 Available', icon: '🚨' },
      { value: 'business-hours', label: 'Business Hours Only', icon: '🕐' }
    ],
    hvac: [
      { value: 'yes-maintenance', label: 'Yes, Service Plans', icon: '🔧' },
      { value: 'repair-only', label: 'Repair Only', icon: '🛠️' }
    ],
    default: [
      { value: 'yes', label: 'Yes', icon: '✅' },
      { value: 'no', label: 'No', icon: '❌' }
    ]
  };
  
  return options[industry.industry] || options.default;
}

/**
 * Determine which sections to include based on score and data
 */
export function recommendSections(
  dataScore: DataScore,
  industry: IndustryIntelligence,
  availableData: BusinessIntelligenceData
): SectionRecommendation[] {
  const recommendations: SectionRecommendation[] = [];
  
  // Always include critical sections
  industry.patterns.criticalSections.forEach(section => {
    recommendations.push({
      type: section,
      priority: 'required',
      dataAvailable: checkDataAvailability(section, availableData),
      reason: `Critical for ${industry.industry} businesses`
    });
  });
  
  // Add optional sections based on data score
  if (dataScore.total >= 40) {
    // About section if we have description or story
    if (availableData.gbp?.description || availableData.manual?.yearsInBusiness) {
      recommendations.push({
        type: 'about',
        priority: 'recommended',
        dataAvailable: true,
        reason: 'Builds trust and connection'
      });
    }
    
    // Testimonials if we have good reviews
    if (dataScore.breakdown.trust >= 10) {
      recommendations.push({
        type: 'testimonials',
        priority: 'recommended',
        dataAvailable: true,
        reason: 'Social proof increases conversions'
      });
    }
  }
  
  // Premium sections for high-scoring businesses
  if (dataScore.total >= 70) {
    recommendations.push({
      type: 'trust-bar',
      priority: 'enhancement',
      dataAvailable: true,
      reason: 'Showcases credentials and builds trust'
    });
    
    if (availableData.manual?.awards?.length > 0) {
      recommendations.push({
        type: 'awards',
        priority: 'enhancement',
        dataAvailable: true,
        reason: 'Highlights achievements and expertise'
      });
    }
    
    recommendations.push({
      type: 'faq',
      priority: 'enhancement',
      dataAvailable: false,
      reason: 'Addresses common questions and improves SEO'
    });
  }
  
  return recommendations;
}

/**
 * Check if we have data for a specific section
 */
function checkDataAvailability(section: string, data: BusinessIntelligenceData): boolean {
  switch (section) {
    case 'hero':
      return true; // Always have enough for hero
    
    case 'services':
      return (data.gbp?.services?.length || 0) > 0 || (data.manual?.services?.length || 0) > 0;
    
    case 'gallery':
      const totalPhotos = (data.gbp?.photos?.length || 0) + (data.places?.photos?.length || 0);
      return totalPhotos >= 4;
    
    case 'about':
      return !!(data.gbp?.description || data.manual?.yearsInBusiness);
    
    case 'testimonials':
      return (data.gbp?.reviews?.count || 0) >= 5 || (data.places?.reviews?.total || 0) >= 5;
    
    case 'contact':
      return true; // Always have contact info
    
    case 'service-areas':
      return !!(data.gbp?.serviceAreas || data.manual?.serviceAreas);
    
    default:
      return false;
  }
}

/**
 * Extract color scheme from logo or suggest based on industry
 */
export async function extractDesignSystem(data: BusinessIntelligenceData): Promise<any> {
  let extractedColors = null;
  
  // If they have a logo, extract colors from it
  if (data.gbp?.logo) {
    try {
      extractedColors = await extractColorsFromLogo(data.gbp.logo);
    } catch (error) {
      console.error('Failed to extract colors from logo:', error);
      // Fall back to industry defaults
    }
  }
  
  // Industry-based color suggestions
  const industryColors = {
    landscaping: {
      primary: '#22C55E',    // Green
      secondary: '#84CC16',  // Lime
      accent: '#F59E0B'      // Amber
    },
    plumbing: {
      primary: '#3B82F6',    // Blue
      secondary: '#0EA5E9',  // Sky
      accent: '#F97316'      // Orange
    },
    hvac: {
      primary: '#06B6D4',    // Cyan
      secondary: '#3B82F6',  // Blue
      accent: '#EF4444'      // Red
    },
    cleaning: {
      primary: '#14B8A6',    // Teal
      secondary: '#10B981',  // Emerald
      accent: '#8B5CF6'      // Violet
    },
    roofing: {
      primary: '#DC2626',    // Red
      secondary: '#7C3AED',  // Violet
      accent: '#F59E0B'      // Amber
    },
    electrical: {
      primary: '#F59E0B',    // Amber
      secondary: '#EF4444',  // Red
      accent: '#3B82F6'      // Blue
    },
    general: {
      primary: '#3B82F6',    // Blue
      secondary: '#10B981',  // Green
      accent: '#F59E0B'      // Amber
    }
  };
  
  const industry = detectIndustryFromData(data);
  const defaultColors = industryColors[industry] || industryColors.general;
  
  // If we extracted colors from logo, merge with defaults
  if (extractedColors) {
    return {
      ...defaultColors,
      ...extractedColors,
      extracted: true
    };
  }
  
  return defaultColors;
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
 * Extract dominant colors from a logo image URL
 * Uses sharp to process the image and extract color palette
 */
async function extractColorsFromLogo(logoUrl: string): Promise<{ primary: string; secondary: string; accent: string } | null> {
  try {
    // For now, implement a simple placeholder that returns null
    // In production, you would:
    // 1. Fetch the image from the URL
    // 2. Use sharp to resize and process it
    // 3. Extract dominant colors using quantization
    // 4. Convert to hex colors
    // 5. Return primary, secondary, and accent colors
    
    // Example implementation outline:
    // const response = await fetch(logoUrl);
    // const buffer = await response.arrayBuffer();
    // const image = sharp(Buffer.from(buffer));
    // const { dominant } = await image.stats();
    // ... color processing logic ...
    
    // For now, return null to use industry defaults
    return null;
  } catch (error) {
    console.error('Error extracting colors from logo:', error);
    return null;
  }
}