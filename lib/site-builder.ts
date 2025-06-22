import { 
  Section, 
  ContentDensity, 
  IndustryType,
  HeroSection,
  AboutSection,
  ServicesSection,
  FeaturesSection,
  CTASection,
  ContactSection
} from '@/types/site-builder';
import { SiteWithPages } from '@/lib/site-data';

/**
 * Determine content density based on available data
 */
export function getContentDensity(site: SiteWithPages): ContentDensity {
  const hasServices = site.services.length > 0;
  const hasDescription = site.metaDescription && site.metaDescription.length > 100;
  const hasCompleteAddress = site.address && site.city && site.state;
  
  const dataPoints = [
    hasServices,
    hasDescription,
    hasCompleteAddress,
    site.phone !== null,
    site.email !== null,
    site.logo !== null
  ].filter(Boolean).length;

  if (dataPoints >= 5) return 'rich';
  if (dataPoints >= 3) return 'moderate';
  return 'minimal';
}

/**
 * Determine industry type from business name or services
 */
export function detectIndustry(site: SiteWithPages): IndustryType {
  const businessNameLower = site.businessName.toLowerCase();
  const serviceNames = site.services.map(s => s.name.toLowerCase()).join(' ');
  const combined = `${businessNameLower} ${serviceNames}`;

  if (combined.includes('landscap') || combined.includes('lawn') || combined.includes('garden')) {
    return 'landscaping';
  }
  if (combined.includes('hvac') || combined.includes('heating') || combined.includes('cooling') || combined.includes('air condition')) {
    return 'hvac';
  }
  if (combined.includes('plumb') || combined.includes('pipe') || combined.includes('drain')) {
    return 'plumbing';
  }
  if (combined.includes('clean') || combined.includes('maid') || combined.includes('janitor')) {
    return 'cleaning';
  }
  if (combined.includes('roof') || combined.includes('shingle') || combined.includes('gutter')) {
    return 'roofing';
  }
  if (combined.includes('electric') || combined.includes('wiring') || combined.includes('circuit')) {
    return 'electrical';
  }
  
  return 'general';
}

/**
 * Generate default sections based on site data and content density
 */
export function generateDefaultSections(site: SiteWithPages & { photos?: any[] }): Section[] {
  const contentDensity = getContentDensity(site);
  const industry = detectIndustry(site);
  const sections: Section[] = [];
  
  // Get hero photo if available
  const heroPhoto = site.photos?.find(p => p.category === 'hero') || site.photos?.[0];

  // Hero section - always included
  const heroSection: HeroSection = {
    id: 'hero-1',
    type: 'hero',
    order: 1,
    visible: true,
    data: {
      headline: site.metaTitle || `Welcome to ${site.businessName}`,
      subheadline: getIndustryTagline(industry),
      description: contentDensity !== 'minimal' ? site.metaDescription || undefined : undefined,
      primaryButton: {
        text: 'Get Free Quote',
        href: '#contact'
      },
      secondaryButton: contentDensity === 'rich' ? {
        text: 'View Services',
        href: '#services'
      } : undefined,
      backgroundImage: heroPhoto?.url,
      variant: contentDensity === 'minimal' ? 'centered' : 'left-aligned'
    }
  };
  sections.push(heroSection);

  // About section - included for moderate and rich content
  if (contentDensity !== 'minimal' && site.metaDescription) {
    const aboutSection: AboutSection = {
      id: 'about-1',
      type: 'about',
      order: 2,
      visible: true,
      data: {
        title: `About ${site.businessName}`,
        content: site.metaDescription,
        variant: contentDensity === 'rich' ? 'with-stats' : 'simple',
        stats: contentDensity === 'rich' ? getIndustryStats(industry) : undefined
      }
    };
    sections.push(aboutSection);
  }

  // Services section - if services exist
  if (site.services.length > 0) {
    const servicesSection: ServicesSection = {
      id: 'services-1',
      type: 'services',
      order: 3,
      visible: true,
      data: {
        title: 'Our Services',
        subtitle: contentDensity !== 'minimal' ? getServicesSubtitle(industry) : undefined,
        services: site.services.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description || '',
          price: service.price || undefined,
          image: service.image || undefined,
          features: contentDensity === 'rich' ? getServiceFeatures(service.name, industry) : undefined
        })),
        variant: site.services.length <= 3 ? 'cards' : 'grid'
      }
    };
    sections.push(servicesSection);
  }

  // Features section - for moderate and rich content
  if (contentDensity !== 'minimal') {
    const featuresSection: FeaturesSection = {
      id: 'features-1',
      type: 'features',
      order: 4,
      visible: true,
      data: {
        title: 'Why Choose Us',
        subtitle: contentDensity === 'rich' ? getWhyChooseUsSubtitle(industry) : undefined,
        features: getIndustryFeatures(industry, contentDensity),
        variant: contentDensity === 'rich' ? 'alternating' : 'grid'
      }
    };
    sections.push(featuresSection);
  }

  // Gallery section - if photos are available
  if (site.photos && site.photos.length > 1) {
    const galleryPhotos = site.photos.filter(p => p.category !== 'hero' || site.photos!.length === 1);
    if (galleryPhotos.length > 0) {
      sections.push({
        id: 'gallery-1',
        type: 'gallery',
        order: 5,
        visible: true,
        data: {
          title: 'Our Work',
          subtitle: 'See what we can do for you',
          images: galleryPhotos.slice(0, 12).map(photo => ({
            url: photo.url,
            thumbnailUrl: photo.thumbnailUrl || photo.url,
            caption: photo.caption || photo.altText,
            altText: photo.altText || `${site.businessName} work`
          })),
          variant: 'grid'
        }
      } as any); // We'll define GallerySection type later
    }
  }

  // CTA section - always included
  const ctaSection: CTASection = {
    id: 'cta-1',
    type: 'cta',
    order: site.photos && site.photos.length > 1 ? 6 : 5,
    visible: true,
    data: {
      headline: getCTAHeadline(industry),
      description: contentDensity !== 'minimal' ? getCTADescription(industry) : undefined,
      buttonText: 'Get Started Today',
      buttonHref: '#contact',
      variant: contentDensity === 'rich' ? 'gradient' : 'simple'
    }
  };
  sections.push(ctaSection);

  // Contact section - always included
  const contactSection: ContactSection = {
    id: 'contact-1',
    type: 'contact',
    order: site.photos && site.photos.length > 1 ? 7 : 6,
    visible: true,
    data: {
      title: 'Contact Us',
      subtitle: contentDensity !== 'minimal' ? 'Get in touch for a free consultation' : undefined,
      showForm: contentDensity !== 'minimal',
      showMap: false, // Will implement later
      showInfo: true,
      variant: contentDensity === 'minimal' ? 'minimal' : 'split'
    }
  };
  sections.push(contactSection);

  return sections;
}

// Helper functions for industry-specific content
function getIndustryTagline(industry: IndustryType): string {
  const taglines = {
    landscaping: 'Professional Landscaping Services',
    hvac: 'Heating, Cooling & Air Quality Experts',
    plumbing: 'Reliable Plumbing Solutions',
    cleaning: 'Professional Cleaning Services',
    roofing: 'Quality Roofing & Repairs',
    electrical: 'Licensed Electrical Services',
    general: 'Quality Service You Can Trust'
  };
  return taglines[industry];
}

function getServicesSubtitle(industry: IndustryType): string {
  const subtitles = {
    landscaping: 'From lawn care to complete landscape design',
    hvac: 'Complete heating and cooling solutions for your comfort',
    plumbing: 'Expert solutions for all your plumbing needs',
    cleaning: 'Comprehensive cleaning for homes and businesses',
    roofing: 'Professional roofing services for lasting protection',
    electrical: 'Safe and reliable electrical work',
    general: 'Professional services tailored to your needs'
  };
  return subtitles[industry];
}

function getIndustryStats(industry: IndustryType) {
  const stats = {
    landscaping: [
      { label: 'Years of Experience', value: '15+' },
      { label: 'Projects Completed', value: '500+' },
      { label: 'Happy Customers', value: '300+' }
    ],
    hvac: [
      { label: 'Years in Business', value: '20+' },
      { label: 'Systems Installed', value: '1000+' },
      { label: 'Service Calls', value: '5000+' }
    ],
    plumbing: [
      { label: 'Licensed Plumbers', value: '10+' },
      { label: 'Emergency Calls', value: '24/7' },
      { label: 'Jobs Completed', value: '3000+' }
    ],
    cleaning: [
      { label: 'Homes Cleaned', value: '2000+' },
      { label: 'Regular Clients', value: '150+' },
      { label: 'Satisfaction Rate', value: '98%' }
    ],
    roofing: [
      { label: 'Roofs Installed', value: '800+' },
      { label: 'Years Experience', value: '25+' },
      { label: 'Warranty', value: '10 Years' }
    ],
    electrical: [
      { label: 'Licensed Electricians', value: '8+' },
      { label: 'Projects Done', value: '2500+' },
      { label: 'Response Time', value: '<2 Hours' }
    ],
    general: [
      { label: 'Years of Service', value: '10+' },
      { label: 'Satisfied Clients', value: '500+' },
      { label: 'Success Rate', value: '99%' }
    ]
  };
  return stats[industry];
}

function getIndustryFeatures(industry: IndustryType, density: ContentDensity) {
  const baseFeatures = [
    {
      icon: '✓',
      title: 'Licensed & Insured',
      description: 'Fully licensed and insured for your peace of mind'
    },
    {
      icon: '⚡',
      title: 'Fast Response',
      description: 'Quick response times and reliable service'
    },
    {
      icon: '⭐',
      title: 'Quality Guaranteed',
      description: 'We stand behind our work with a satisfaction guarantee'
    }
  ];

  if (density === 'rich') {
    // Add industry-specific features
    const industryFeatures = {
      landscaping: [
        {
          icon: '🌱',
          title: 'Eco-Friendly',
          description: 'Sustainable landscaping practices'
        }
      ],
      hvac: [
        {
          icon: '🌡️',
          title: 'Energy Efficient',
          description: 'Save money with efficient systems'
        }
      ],
      plumbing: [
        {
          icon: '💧',
          title: '24/7 Emergency',
          description: 'Available for urgent repairs'
        }
      ],
      cleaning: [
        {
          icon: '🧹',
          title: 'Green Products',
          description: 'Safe, eco-friendly cleaning'
        }
      ],
      roofing: [
        {
          icon: '🏠',
          title: 'Storm Damage',
          description: 'Emergency storm repairs'
        }
      ],
      electrical: [
        {
          icon: '⚡',
          title: 'Code Compliant',
          description: 'All work meets local codes'
        }
      ],
      general: []
    };
    
    return [...baseFeatures, ...(industryFeatures[industry] || [])];
  }

  return baseFeatures;
}

function getServiceFeatures(serviceName: string, industry: IndustryType): string[] {
  // Generic features that can be customized per service
  const serviceNameLower = serviceName.toLowerCase();
  
  if (serviceNameLower.includes('maintenance') || serviceNameLower.includes('regular')) {
    return ['Scheduled service', 'Priority support', 'Discounted rates'];
  }
  
  if (serviceNameLower.includes('emergency') || serviceNameLower.includes('24/7')) {
    return ['24/7 availability', 'Fast response', 'No overtime charges'];
  }
  
  if (serviceNameLower.includes('installation') || serviceNameLower.includes('new')) {
    return ['Professional installation', 'Warranty included', 'Free consultation'];
  }
  
  return ['Quality service', 'Competitive pricing', 'Satisfaction guaranteed'];
}

function getCTAHeadline(industry: IndustryType): string {
  const headlines = {
    landscaping: 'Ready to Transform Your Outdoor Space?',
    hvac: 'Need Heating or Cooling Service?',
    plumbing: 'Have a Plumbing Emergency?',
    cleaning: 'Ready for a Spotless Space?',
    roofing: 'Need Roofing Services?',
    electrical: 'Need Electrical Work Done Right?',
    general: 'Ready to Get Started?'
  };
  return headlines[industry];
}

function getCTADescription(industry: IndustryType): string {
  const descriptions = {
    landscaping: 'Get a free consultation and quote for your landscaping project',
    hvac: 'Our expert technicians are ready to help with all your HVAC needs',
    plumbing: 'Fast, reliable plumbing services when you need them most',
    cleaning: 'Experience the difference professional cleaning makes',
    roofing: 'Protect your home with quality roofing services',
    electrical: 'Safe, reliable electrical services from licensed professionals',
    general: 'Contact us today for a free consultation and quote'
  };
  return descriptions[industry];
}

function getWhyChooseUsSubtitle(industry: IndustryType): string {
  const subtitles = {
    landscaping: 'Experience the difference of working with landscaping professionals',
    hvac: 'Your comfort is our priority with reliable HVAC services',
    plumbing: 'Trust your plumbing to experienced, licensed professionals',
    cleaning: 'Professional cleaning that exceeds your expectations',
    roofing: 'Quality roofing services that protect what matters most',
    electrical: 'Safe, code-compliant electrical work you can trust',
    general: 'Quality service and customer satisfaction guaranteed'
  };
  return subtitles[industry];
}
