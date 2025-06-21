// Pricing and Plans Configuration for Multi-Industry SaaS

export const pricingPlans = {
  starter: {
    name: 'Starter',
    price: 297,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      'Professional Website',
      'Google Business Profile Management',
      'Basic SEO Setup',
      'Monthly Blog Post',
      'Review Monitoring',
      'Mobile Responsive',
      'SSL Certificate',
      'Basic Analytics',
    ],
    limits: {
      locations: 1,
      users: 2,
      monthlyBlogPosts: 1,
      gbpPosts: 4,
    },
  },
  professional: {
    name: 'Professional',
    price: 597,
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    popular: true,
    features: [
      'Everything in Starter',
      'Advanced SEO Optimization',
      'Weekly Blog Posts',
      'Review Response Automation',
      'Google Ads Integration',
      'Social Media Integration',
      'Advanced Analytics',
      'Priority Support',
      'Custom Forms',
      'Email Marketing (1000/mo)',
    ],
    limits: {
      locations: 3,
      users: 5,
      monthlyBlogPosts: 4,
      gbpPosts: 12,
      emailCredits: 1000,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 997,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Everything in Professional',
      'Unlimited Locations',
      'White-label Options',
      'Custom Integrations',
      'Dedicated Account Manager',
      'Daily Blog Posts',
      'AI Chat Widget',
      'Voice Calling Features',
      'Custom Reporting',
      'API Access',
    ],
    limits: {
      locations: -1, // unlimited
      users: -1,
      monthlyBlogPosts: 30,
      gbpPosts: -1,
      emailCredits: 10000,
      smsCredits: 1000,
    },
  },
};

// Industry-specific configurations
export const industries = {
  landscaping: {
    name: 'Landscaping & Lawn Care',
    slug: 'landscaping',
    icon: '?',
    services: [
      'Lawn Maintenance',
      'Landscape Design',
      'Tree Services',
      'Irrigation',
      'Hardscaping',
      'Snow Removal',
    ],
    automations: [
      'seasonal-reminders',
      'quote-follow-up',
      'service-complete-review',
      'weather-based-offers',
    ],
    seoKeywords: [
      'landscaping near me',
      'lawn care service',
      'landscape design',
      'tree trimming',
    ],
    gbpCategories: ['Landscaper', 'Lawn care service', 'Tree service'],
  },
  hvac: {
    name: 'HVAC Services',
    slug: 'hvac',
    icon: '??',
    services: [
      'AC Repair',
      'Heating Repair',
      'Installation',
      'Maintenance Plans',
      'Emergency Service',
      'Duct Cleaning',
    ],
    automations: [
      'maintenance-reminders',
      'emergency-response',
      'seasonal-checkups',
      'warranty-reminders',
    ],
    seoKeywords: [
      'ac repair near me',
      'heating repair',
      'hvac service',
      'emergency hvac',
    ],
    gbpCategories: ['HVAC contractor', 'Air conditioning repair service'],
  },
  plumbing: {
    name: 'Plumbing Services',
    slug: 'plumbing',
    icon: '?',
    services: [
      'Emergency Plumbing',
      'Drain Cleaning',
      'Water Heater Repair',
      'Leak Detection',
      'Pipe Repair',
      'Bathroom Remodeling',
    ],
    automations: [
      'emergency-dispatch',
      'appointment-reminders',
      'service-follow-up',
      'maintenance-offers',
    ],
    seoKeywords: [
      'plumber near me',
      'emergency plumber',
      'drain cleaning',
      'water heater repair',
    ],
    gbpCategories: ['Plumber', 'Emergency plumber', 'Drainage service'],
  },
  cleaning: {
    name: 'Cleaning Services',
    slug: 'cleaning',
    icon: '?',
    services: [
      'House Cleaning',
      'Office Cleaning',
      'Deep Cleaning',
      'Move-in/out Cleaning',
      'Carpet Cleaning',
      'Window Cleaning',
    ],
    automations: [
      'booking-confirmation',
      'service-reminders',
      'recurring-scheduling',
      'satisfaction-survey',
    ],
    seoKeywords: [
      'house cleaning service',
      'office cleaning',
      'maid service near me',
      'deep cleaning service',
    ],
    gbpCategories: ['House cleaning service', 'Commercial cleaning service'],
  },
  roofing: {
    name: 'Roofing Services',
    slug: 'roofing',
    icon: '?',
    services: [
      'Roof Repair',
      'Roof Replacement',
      'Emergency Tarping',
      'Gutter Installation',
      'Roof Inspection',
      'Storm Damage Repair',
    ],
    automations: [
      'storm-alerts',
      'inspection-follow-up',
      'warranty-tracking',
      'seasonal-maintenance',
    ],
    seoKeywords: [
      'roofing contractor near me',
      'roof repair',
      'emergency roof repair',
      'roof replacement',
    ],
    gbpCategories: ['Roofing contractor', 'Roof repair service'],
  },
  electrical: {
    name: 'Electrical Services',
    slug: 'electrical',
    icon: '?',
    services: [
      'Electrical Repair',
      'Panel Upgrades',
      'Wiring Installation',
      'Emergency Service',
      'Safety Inspections',
      'Smart Home Setup',
    ],
    automations: [
      'safety-reminders',
      'emergency-dispatch',
      'permit-tracking',
      'inspection-scheduling',
    ],
    seoKeywords: [
      'electrician near me',
      'emergency electrician',
      'electrical repair',
      'panel upgrade',
    ],
    gbpCategories: ['Electrician', 'Electrical repair service'],
  },
};

// GHL rebilling markups by feature
export const rebillingConfig = {
  sms: {
    markup: 50, // 50% markup
    basePrice: 0.015, // per SMS
  },
  email: {
    markup: 30, // 30% markup
    basePrice: 0.001, // per email
  },
  voice: {
    markup: 40, // 40% markup
    basePrice: 0.02, // per minute
  },
  ai: {
    conversations: {
      markup: 60, // 60% markup
      basePrice: 0.10, // per conversation
    },
    appointments: {
      markup: 50,
      basePrice: 0.25, // per booking
    },
  },
};

// Features available by plan
export const planFeatures = {
  starter: {
    website: true,
    gbp: true,
    seo: 'basic',
    blog: true,
    reviews: 'monitor',
    analytics: 'basic',
    support: 'email',
    customDomain: true,
  },
  professional: {
    website: true,
    gbp: true,
    seo: 'advanced',
    blog: true,
    reviews: 'auto-respond',
    analytics: 'advanced',
    support: 'priority',
    customDomain: true,
    emailMarketing: true,
    socialMedia: true,
    googleAds: true,
  },
  enterprise: {
    website: true,
    gbp: true,
    seo: 'enterprise',
    blog: true,
    reviews: 'ai-powered',
    analytics: 'custom',
    support: 'dedicated',
    customDomain: true,
    emailMarketing: true,
    socialMedia: true,
    googleAds: true,
    voiceCalling: true,
    aiChat: true,
    apiAccess: true,
    whiteLabel: true,
  },
};
