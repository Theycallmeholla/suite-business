/**
 * Intelligence System - Industry-Specific Profiles
 * 
 * **Created**: December 23, 2024, 2:17 AM CST
 * **Last Updated**: December 23, 2024, 2:17 AM CST
 * 
 * Industry-specific patterns, preferences, and optimization strategies
 * for intelligent content generation and site assembly.
 */

import { IndustryType } from '@/types/site-builder'

export interface IndustryIntelligence {
  industry: IndustryType
  patterns: {
    // Contact Preferences
    preferredContact: 'form' | 'phone' | 'appointment'
    urgencyFactors: string[]
    
    // Content Patterns
    criticalSections: string[]
    optionalSections: string[]
    
    // Service Patterns
    maxServicesDisplay: number
    serviceCategories: string[]
    
    // Trust Signals
    importantCertifications: string[]
    industryAssociations: string[]
  }
  
  // SEO Intelligence
  seo: {
    primaryKeywords: string[]
    localKeywords: string[]
    commercialIntent: string[]
    informationalQueries: string[]
  }
  
  // Conversion Optimization
  conversion: {
    primaryCTA: string
    secondaryCTA: string
    urgencyTriggers: string[]
    trustElements: string[]
  }
}

export const industryProfiles: Record<IndustryType, IndustryIntelligence> = {
  landscaping: {
    industry: 'landscaping',
    patterns: {
      preferredContact: 'form',
      urgencyFactors: ['storm damage', 'event preparation', 'seasonal deadline'],
      criticalSections: ['hero', 'services', 'gallery', 'service-areas', 'contact'],
      optionalSections: ['about', 'testimonials', 'blog', 'faq'],
      maxServicesDisplay: 6,
      serviceCategories: ['Lawn Care', 'Design & Installation', 'Maintenance', 'Hardscaping']
    },
    seo: {
      primaryKeywords: ['landscaping', 'lawn care', 'landscape design', 'landscaper'],
      localKeywords: ['landscaping near me', 'local landscapers', 'landscaping services'],
      commercialIntent: ['landscaping quote', 'landscaping cost', 'hire landscaper'],
      informationalQueries: ['lawn care tips', 'best plants for', 'how to landscape']
    },
    conversion: {
      primaryCTA: 'Get Free Estimate',
      secondaryCTA: 'View Our Work',
      urgencyTriggers: ['Spring booking fast', 'Schedule before season', 'Limited availability'],
      trustElements: ['Licensed & Insured', 'Award Winning', 'Eco-Friendly', '5-Star Rated']
    }
  },
  
  plumbing: {
    industry: 'plumbing',
    patterns: {
      preferredContact: 'phone',
      urgencyFactors: ['emergency', 'leak', 'no water', 'flooding', 'burst pipe'],
      criticalSections: ['hero', 'services', 'contact', 'service-areas'],
      optionalSections: ['about', 'testimonials', 'faq', 'blog'],
      maxServicesDisplay: 4,
      serviceCategories: ['Emergency', 'Repair', 'Installation', 'Maintenance']
    },
    seo: {
      primaryKeywords: ['plumber', 'plumbing', 'emergency plumber', 'plumbing services'],
      localKeywords: ['plumber near me', '24 hour plumber', 'emergency plumber near me'],
      commercialIntent: ['plumbing repair cost', 'emergency plumber', 'hire plumber'],
      informationalQueries: ['fix leaky faucet', 'unclog drain', 'water heater repair']
    },
    conversion: {
      primaryCTA: 'Call Now: 24/7 Emergency',
      secondaryCTA: 'Schedule Service',
      urgencyTriggers: ['24/7 Emergency Service', 'Same Day Service', 'Available Now'],
      trustElements: ['Licensed Master Plumber', 'BBB Accredited', 'Insured & Bonded', 'Upfront Pricing']
    }
  },
  
  hvac: {
    industry: 'hvac',
    patterns: {
      preferredContact: 'phone',
      urgencyFactors: ['no heat', 'no cooling', 'emergency', 'extreme weather'],
      criticalSections: ['hero', 'services', 'contact', 'service-areas', 'financing'],
      optionalSections: ['about', 'testimonials', 'maintenance-plans', 'blog'],
      maxServicesDisplay: 6,
      serviceCategories: ['Heating', 'Cooling', 'Installation', 'Maintenance', 'Emergency']
    },
    seo: {
      primaryKeywords: ['hvac', 'heating and cooling', 'ac repair', 'furnace repair'],
      localKeywords: ['hvac near me', 'ac repair near me', 'heating repair near me'],
      commercialIntent: ['hvac installation cost', 'ac replacement', 'furnace replacement'],
      informationalQueries: ['ac not cooling', 'furnace not heating', 'hvac maintenance']
    },
    conversion: {
      primaryCTA: '24/7 Emergency Service',
      secondaryCTA: 'Get Free Quote',
      urgencyTriggers: ['Emergency Service Available', 'Same Day Service', 'Financing Available'],
      trustElements: ['NATE Certified', 'Licensed & Insured', 'Energy Star Partner', 'Factory Authorized']
    }
  },
  
  electrical: {
    industry: 'electrical',
    patterns: {
      preferredContact: 'phone',
      urgencyFactors: ['power outage', 'sparks', 'electrical emergency', 'safety hazard'],
      criticalSections: ['hero', 'services', 'contact', 'service-areas', 'safety'],
      optionalSections: ['about', 'testimonials', 'blog', 'faq'],
      maxServicesDisplay: 6,
      serviceCategories: ['Residential', 'Commercial', 'Emergency', 'Installation', 'Inspection']
    },
    seo: {
      primaryKeywords: ['electrician', 'electrical', 'electrical contractor', 'electrical services'],
      localKeywords: ['electrician near me', 'emergency electrician', 'local electrician'],
      commercialIntent: ['electrical repair cost', 'hire electrician', 'electrical installation'],
      informationalQueries: ['electrical safety', 'circuit breaker', 'outlet not working']
    },
    conversion: {
      primaryCTA: 'Call for Emergency Service',
      secondaryCTA: 'Schedule Inspection',
      urgencyTriggers: ['24/7 Emergency', 'Licensed Master Electrician', 'Safety First'],
      trustElements: ['Master Electrician', 'Licensed & Insured', 'Code Compliant', 'Safety Certified']
    }
  },
  
  roofing: {
    industry: 'roofing',
    patterns: {
      preferredContact: 'form',
      urgencyFactors: ['storm damage', 'leak', 'emergency repair', 'insurance claim'],
      criticalSections: ['hero', 'services', 'gallery', 'contact', 'financing'],
      optionalSections: ['about', 'testimonials', 'warranty', 'blog'],
      maxServicesDisplay: 6,
      serviceCategories: ['Repair', 'Replacement', 'Inspection', 'Storm Damage', 'Maintenance']
    },
    seo: {
      primaryKeywords: ['roofing', 'roof repair', 'roof replacement', 'roofing contractor'],
      localKeywords: ['roofing near me', 'roof repair near me', 'local roofing contractor'],
      commercialIntent: ['roof replacement cost', 'roof repair estimate', 'hire roofer'],
      informationalQueries: ['roof leak repair', 'shingle replacement', 'storm damage']
    },
    conversion: {
      primaryCTA: 'Get Free Inspection',
      secondaryCTA: 'View Our Work',
      urgencyTriggers: ['Storm Damage Specialist', 'Insurance Claims Help', 'Free Inspection'],
      trustElements: ['Licensed & Insured', 'Manufacturer Certified', 'Warranty Available', 'A+ BBB Rating']
    }
  },
  
  cleaning: {
    industry: 'cleaning',
    patterns: {
      preferredContact: 'form',
      urgencyFactors: ['move out', 'event', 'deep clean', 'same day'],
      criticalSections: ['hero', 'services', 'pricing', 'contact', 'booking'],
      optionalSections: ['about', 'testimonials', 'faq', 'service-areas'],
      maxServicesDisplay: 6,
      serviceCategories: ['Residential', 'Commercial', 'Deep Clean', 'Move In/Out', 'Recurring']
    },
    seo: {
      primaryKeywords: ['cleaning service', 'house cleaning', 'maid service', 'cleaners'],
      localKeywords: ['cleaning service near me', 'house cleaners near me', 'maid service near me'],
      commercialIntent: ['cleaning service cost', 'hire cleaners', 'book cleaning'],
      informationalQueries: ['cleaning checklist', 'deep cleaning', 'move out cleaning']
    },
    conversion: {
      primaryCTA: 'Book Online Now',
      secondaryCTA: 'Get Instant Quote',
      urgencyTriggers: ['Same Day Available', 'Book in 60 Seconds', 'Satisfaction Guaranteed'],
      trustElements: ['Bonded & Insured', 'Background Checked', 'Eco-Friendly', '100% Guarantee']
    }
  },
  
  general: {
    industry: 'general',
    patterns: {
      preferredContact: 'form',
      urgencyFactors: [],
      criticalSections: ['hero', 'services', 'about', 'contact'],
      optionalSections: ['gallery', 'testimonials', 'faq', 'blog'],
      maxServicesDisplay: 6,
      serviceCategories: ['Services']
    },
    seo: {
      primaryKeywords: ['service', 'professional', 'local business'],
      localKeywords: ['near me', 'local', 'service provider'],
      commercialIntent: ['quote', 'estimate', 'hire'],
      informationalQueries: ['how to', 'tips', 'guide']
    },
    conversion: {
      primaryCTA: 'Contact Us',
      secondaryCTA: 'Learn More',
      urgencyTriggers: ['Free Consultation', 'Get Started Today'],
      trustElements: ['Professional Service', 'Licensed & Insured', 'Trusted Provider']
    }
  }
}

export function getIndustryProfile(industry: IndustryType): IndustryIntelligence {
  return industryProfiles[industry] || industryProfiles.general
}

export function generateServiceOptions(industry: IndustryType): Array<{ value: string; label: string; popular?: boolean }> {
  const profile = getIndustryProfile(industry)
  
  const serviceMap: Record<IndustryType, Array<{ value: string; label: string; popular?: boolean }>> = {
    landscaping: [
      { value: 'lawn-mowing', label: 'Lawn Mowing', popular: true },
      { value: 'landscape-design', label: 'Landscape Design', popular: true },
      { value: 'tree-trimming', label: 'Tree Trimming' },
      { value: 'irrigation', label: 'Irrigation Systems' },
      { value: 'hardscaping', label: 'Hardscaping' },
      { value: 'garden-maintenance', label: 'Garden Maintenance' },
      { value: 'sod-installation', label: 'Sod Installation' },
      { value: 'mulching', label: 'Mulching' },
      { value: 'leaf-removal', label: 'Leaf Removal' },
      { value: 'fertilization', label: 'Fertilization' }
    ],
    plumbing: [
      { value: 'emergency-plumbing', label: '24/7 Emergency Service', popular: true },
      { value: 'drain-cleaning', label: 'Drain Cleaning', popular: true },
      { value: 'water-heater', label: 'Water Heater Repair' },
      { value: 'leak-repair', label: 'Leak Detection & Repair' },
      { value: 'toilet-repair', label: 'Toilet Repair' },
      { value: 'pipe-repair', label: 'Pipe Repair' },
      { value: 'fixture-installation', label: 'Fixture Installation' },
      { value: 'sewer-line', label: 'Sewer Line Service' }
    ],
    hvac: [
      { value: 'ac-repair', label: 'AC Repair', popular: true },
      { value: 'heating-repair', label: 'Heating Repair', popular: true },
      { value: 'installation', label: 'System Installation' },
      { value: 'maintenance', label: 'Preventive Maintenance' },
      { value: 'emergency-service', label: '24/7 Emergency' },
      { value: 'duct-cleaning', label: 'Duct Cleaning' },
      { value: 'thermostat', label: 'Thermostat Service' },
      { value: 'air-quality', label: 'Indoor Air Quality' }
    ],
    electrical: [
      { value: 'emergency-electrical', label: 'Emergency Service', popular: true },
      { value: 'panel-upgrade', label: 'Panel Upgrades', popular: true },
      { value: 'outlet-installation', label: 'Outlet Installation' },
      { value: 'lighting', label: 'Lighting Installation' },
      { value: 'wiring', label: 'Electrical Wiring' },
      { value: 'inspection', label: 'Safety Inspection' },
      { value: 'generator', label: 'Generator Installation' },
      { value: 'ev-charger', label: 'EV Charger Installation' }
    ],
    roofing: [
      { value: 'roof-repair', label: 'Roof Repair', popular: true },
      { value: 'roof-replacement', label: 'Roof Replacement', popular: true },
      { value: 'storm-damage', label: 'Storm Damage Repair' },
      { value: 'inspection', label: 'Roof Inspection' },
      { value: 'gutter-service', label: 'Gutter Service' },
      { value: 'shingle-repair', label: 'Shingle Repair' },
      { value: 'flat-roof', label: 'Flat Roof Service' },
      { value: 'emergency-tarp', label: 'Emergency Tarping' }
    ],
    cleaning: [
      { value: 'house-cleaning', label: 'House Cleaning', popular: true },
      { value: 'deep-cleaning', label: 'Deep Cleaning', popular: true },
      { value: 'move-cleaning', label: 'Move In/Out Cleaning' },
      { value: 'office-cleaning', label: 'Office Cleaning' },
      { value: 'recurring-service', label: 'Weekly/Monthly Service' },
      { value: 'post-construction', label: 'Post Construction' },
      { value: 'window-cleaning', label: 'Window Cleaning' },
      { value: 'carpet-cleaning', label: 'Carpet Cleaning' }
    ],
    general: [
      { value: 'consultation', label: 'Consultation' },
      { value: 'service-1', label: 'Service Option 1' },
      { value: 'service-2', label: 'Service Option 2' },
      { value: 'service-3', label: 'Service Option 3' }
    ]
  }
  
  return serviceMap[industry] || serviceMap.general
}