/**
 * Test Data Factory for Enhanced Site Generation
 * 
 * Generates realistic business data for testing without hitting real APIs
 */

// Mock faker functions for testing without external dependencies
const faker = {
  number: {
    int: (options: { min: number, max: number }) => 
      Math.floor(Math.random() * (options.max - options.min + 1)) + options.min,
    float: (options: { min: number, max: number, multipleOf: number }) => {
      const range = options.max - options.min;
      const steps = Math.floor(range / options.multipleOf);
      const randomStep = Math.floor(Math.random() * (steps + 1));
      return options.min + (randomStep * options.multipleOf);
    }
  },
  string: {
    alphanumeric: (length: number) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
  },
  helpers: {
    arrayElement: <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)]
  },
  phone: {
    number: (format: string) => format.replace(/#/g, () => Math.floor(Math.random() * 10).toString())
  },
  location: {
    streetAddress: () => `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Elm', 'Cedar'][Math.floor(Math.random() * 5)]} Street`,
    zipCode: (format: string) => format.replace(/#/g, () => Math.floor(Math.random() * 10).toString())
  },
  lorem: {
    paragraph: () => 'Professional service with years of experience. We pride ourselves on quality work and customer satisfaction. Our team is dedicated to providing the best service possible.'
  },
  person: {
    fullName: () => {
      const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis'];
      return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }
  },
  date: {
    recent: (options: { days: number }) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * options.days));
      return date;
    }
  }
};

export interface TestBusinessProfile {
  quality: 'high' | 'medium' | 'low';
  industry: string;
  placeId: string;
  gbpData: any;
  placesData: any;
  serpData: any;
}

export class TestDataFactory {
  private static industries = {
    landscaping: {
      services: ['Lawn Care', 'Landscape Design', 'Tree Service', 'Irrigation', 'Hardscaping'],
      keywords: ['landscaping', 'lawn care', 'landscape design', 'garden maintenance'],
      competitors: ['GreenThumb Landscaping', 'Premier Lawn Care', 'Elite Gardens'],
      certifications: ['EPA Certified', 'Licensed', 'Insured', 'BBB Accredited'],
      specializations: ['Native Plants', 'Water Conservation', 'Organic Lawn Care', 'Xeriscaping']
    },
    hvac: {
      services: ['AC Repair', 'Heating Installation', 'Duct Cleaning', 'Maintenance Plans', 'Emergency Service'],
      keywords: ['hvac', 'ac repair', 'heating and cooling', 'air conditioning'],
      competitors: ['Cool Comfort HVAC', 'AirTech Solutions', 'Climate Masters'],
      certifications: ['NATE Certified', 'Licensed', 'Insured', 'Energy Star Partner'],
      specializations: ['Commercial HVAC', 'Smart Thermostats', 'Energy Efficiency', 'Indoor Air Quality']
    },
    plumbing: {
      services: ['Drain Cleaning', 'Water Heater Repair', 'Leak Detection', 'Pipe Repair', 'Emergency Plumbing'],
      keywords: ['plumber', 'plumbing repair', 'drain cleaning', 'water heater'],
      competitors: ['Quick Flow Plumbing', 'Reliable Plumbers', 'ProPipe Solutions'],
      certifications: ['Licensed Master Plumber', 'Insured', 'BBB Member', 'Green Plumber Certified'],
      specializations: ['Tankless Water Heaters', 'Hydro Jetting', 'Trenchless Repair', 'Gas Line Services']
    },
    cleaning: {
      services: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Move-in/out Cleaning', 'Window Cleaning'],
      keywords: ['cleaning service', 'house cleaning', 'maid service', 'office cleaning'],
      competitors: ['Sparkle Clean', 'Pro Cleaners', 'Fresh Home Services'],
      certifications: ['Bonded', 'Insured', 'Green Certified', 'ISSA Member'],
      specializations: ['Eco-Friendly Cleaning', 'Post-Construction', 'Medical Facilities', 'Airbnb Cleaning']
    }
  };

  /**
   * Generate a complete business profile with specified quality level
   */
  static generateBusinessProfile(
    industry: keyof typeof TestDataFactory.industries = 'landscaping',
    quality: 'high' | 'medium' | 'low' = 'high'
  ): TestBusinessProfile {
    const industryData = this.industries[industry] || this.industries.landscaping;
    const businessName = this.generateBusinessName(industry);
    const location = 'Houston, TX';
    
    // Base data that scales with quality
    const photoCount = quality === 'high' ? 8 : quality === 'medium' ? 3 : 1;
    const reviewCount = quality === 'high' ? faker.number.int({ min: 100, max: 500 }) : 
                       quality === 'medium' ? faker.number.int({ min: 20, max: 99 }) : 
                       faker.number.int({ min: 1, max: 19 });
    const rating = quality === 'high' ? faker.number.float({ min: 4.5, max: 5.0, multipleOf: 0.1 }) :
                   quality === 'medium' ? faker.number.float({ min: 4.0, max: 4.4, multipleOf: 0.1 }) :
                   faker.number.float({ min: 3.5, max: 3.9, multipleOf: 0.1 });

    return {
      quality,
      industry,
      placeId: this.generatePlaceId(),
      gbpData: this.generateGBPData(businessName, location, industryData, quality, photoCount, reviewCount, rating),
      placesData: this.generatePlacesData(businessName, reviewCount, rating, quality),
      serpData: this.generateSERPData(businessName, location, industryData, quality)
    };
  }

  /**
   * Generate realistic business name
   */
  private static generateBusinessName(industry: string): string {
    const prefixes = ['Premier', 'Pro', 'Elite', 'Quality', 'Expert', 'Master', 'Reliable'];
    const suffixes = {
      landscaping: ['Landscaping', 'Lawn Care', 'Gardens', 'Outdoor Services'],
      hvac: ['HVAC', 'Heating & Cooling', 'Climate Control', 'Air Services'],
      plumbing: ['Plumbing', 'Pipe Services', 'Plumbing Solutions', 'Drain Experts'],
      cleaning: ['Cleaning', 'Cleaning Services', 'Maid Service', 'Clean Team']
    };
    
    const prefix = faker.helpers.arrayElement(prefixes);
    const suffix = faker.helpers.arrayElement(suffixes[industry] || suffixes.landscaping);
    return `${prefix} ${suffix}`;
  }

  /**
   * Generate mock Place ID
   */
  private static generatePlaceId(): string {
    return `ChIJ${faker.string.alphanumeric(22)}`;
  }

  /**
   * Generate GBP data based on quality level
   */
  private static generateGBPData(
    businessName: string,
    location: string,
    industryData: any,
    quality: string,
    photoCount: number,
    reviewCount: number,
    rating: number
  ) {
    const description = quality === 'high' 
      ? `Award-winning ${industryData.services[0].toLowerCase()} company serving ${location} for over ${faker.number.int({ min: 10, max: 25 })} years. We specialize in ${industryData.specializations.slice(0, 3).join(', ').toLowerCase()}. ${industryData.certifications.slice(0, 3).join(', ')}.`
      : quality === 'medium'
      ? `Reliable ${industryData.services[0].toLowerCase()} service in ${location}. ${industryData.certifications[0]} and ${industryData.certifications[1]}.`
      : `${industryData.services[0]} service in ${location}.`;

    const serviceTypes = quality === 'high' 
      ? industryData.services.map(s => ({ displayName: s }))
      : industryData.services.slice(0, quality === 'medium' ? 3 : 2).map(s => ({ displayName: s }));

    return {
      name: businessName,
      description,
      primaryCategory: {
        displayName: `${industryData.services[0]} Service`,
        serviceTypes
      },
      primaryPhone: faker.phone.number('(###) ###-####'),
      fullAddress: {
        addressLines: [faker.location.streetAddress()],
        locality: location.split(',')[0],
        administrativeArea: 'TX',
        postalCode: faker.location.zipCode('#####')
      },
      regularHours: {
        periods: this.generateBusinessHours(quality)
      },
      photos: Array(photoCount).fill(null).map((_, i) => ({
        name: `photos/photo${i}`,
        photoUrl: `https://example.com/${businessName.toLowerCase().replace(/\s+/g, '-')}/photo${i}.jpg`
      })),
      rating,
      userRatingCount: reviewCount,
      website: quality === 'high' ? `https://${businessName.toLowerCase().replace(/\s+/g, '')}.com` : undefined
    };
  }

  /**
   * Generate Places API data
   */
  private static generatePlacesData(businessName: string, reviewCount: number, rating: number, quality: string) {
    const reviews = {
      rating,
      total: reviewCount,
      highlights: quality === 'high' 
        ? [
            `Excellent service and ${faker.helpers.arrayElement(['attention to detail', 'professionalism', 'quality work'])}`,
            `${faker.helpers.arrayElement(['Transformed', 'Completely renovated', 'Did amazing work on'])} our ${faker.helpers.arrayElement(['property', 'home', 'office'])}`,
            `${faker.helpers.arrayElement(['Very knowledgeable', 'Experts in their field', 'True professionals'])}`
          ]
        : quality === 'medium'
        ? [
            'Good service',
            'Fair prices',
            'Would recommend'
          ]
        : ['Okay service'],
      recentReviews: this.generateReviews(quality === 'high' ? 5 : quality === 'medium' ? 3 : 1, rating)
    };

    return {
      reviews,
      opening_hours: {
        weekday_text: this.generateHoursText(quality)
      },
      editorial_summary: quality === 'high' 
        ? { overview: `${businessName} is a trusted name in the community, known for exceptional service and quality workmanship.` }
        : undefined
    };
  }

  /**
   * Generate SERP/competitive data
   */
  private static generateSERPData(businessName: string, location: string, industryData: any, quality: string) {
    return {
      topKeywords: industryData.keywords.map(k => `${k} ${location.toLowerCase()}`),
      competitorServices: industryData.services,
      commonTrustSignals: industryData.certifications,
      competitorPricingTransparency: faker.helpers.arrayElement(['hidden', 'partial', 'transparent']),
      location,
      peopleAlsoAsk: this.generatePeopleAlsoAsk(industryData.keywords[0], location),
      competitors: industryData.competitors,
      marketPosition: quality === 'high' ? 'premium' : quality === 'medium' ? 'standard' : 'budget',
      commonServices: industryData.services.slice(0, 5),
      pricingInsights: {
        averagePrice: quality === 'high' ? '$200-500/service' : quality === 'medium' ? '$100-250/service' : '$50-150/service',
        marketRange: 'budget to premium'
      },
      localKeywords: industryData.keywords.slice(0, 3).map(k => `${k} ${location.toLowerCase()}`)
    };
  }

  /**
   * Generate business hours based on quality
   */
  private static generateBusinessHours(quality: string) {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    if (quality === 'high') {
      days.push('SATURDAY');
    }
    
    return days.map(day => ({
      openDay: day,
      openTime: day === 'SATURDAY' ? '08:00' : '07:00',
      closeTime: day === 'FRIDAY' ? '17:00' : day === 'SATURDAY' ? '15:00' : '18:00'
    }));
  }

  /**
   * Generate hours text array
   */
  private static generateHoursText(quality: string): string[] {
    const hours = [
      'Monday: 7:00 AM – 6:00 PM',
      'Tuesday: 7:00 AM – 6:00 PM',
      'Wednesday: 7:00 AM – 6:00 PM',
      'Thursday: 7:00 AM – 6:00 PM',
      'Friday: 7:00 AM – 5:00 PM'
    ];
    
    if (quality === 'high') {
      hours.push('Saturday: 8:00 AM – 3:00 PM');
    }
    hours.push(quality === 'high' ? 'Sunday: Closed' : 'Saturday: Closed', 'Sunday: Closed');
    
    return hours;
  }

  /**
   * Generate realistic reviews
   */
  private static generateReviews(count: number, avgRating: number) {
    return Array(count).fill(null).map(() => ({
      text: faker.lorem.paragraph(),
      rating: faker.helpers.arrayElement([Math.floor(avgRating), Math.ceil(avgRating), 5]),
      author_name: faker.person.fullName(),
      time: faker.date.recent({ days: 90 }).toISOString()
    }));
  }

  /**
   * Generate People Also Ask questions
   */
  private static generatePeopleAlsoAsk(service: string, location: string) {
    return [
      {
        question: `How much does ${service} cost in ${location}?`,
        answer: faker.lorem.paragraph()
      },
      {
        question: `What is the best ${service} company in ${location}?`,
        answer: faker.lorem.paragraph()
      }
    ];
  }

  /**
   * Generate user answers based on business quality
   */
  static generateUserAnswers(quality: 'high' | 'medium' | 'low', industry: string) {
    const industryData = this.industries[industry] || this.industries.landscaping;
    
    if (quality === 'high') {
      return {
        confirmedClaims: ['licensed', 'insured', 'certified', 'award_winning'],
        photoContexts: {
          'photo-0': { label: 'Before & After', customLabel: 'Complete transformation project' },
          'photo-1': { label: 'Completed Project', customLabel: 'Award-winning design' },
          'photo-2': { label: 'Team at work', customLabel: 'Our certified professionals' }
        },
        awards: ['Best of City 2023', 'Industry Excellence Award', 'Customer Choice Award'],
        specializations: industryData.specializations.slice(0, 3).map((s, i) => ({
          value: s.toLowerCase().replace(/\s+/g, '-'),
          label: s
        })),
        uniqueValue: `The only ${industry} company in the area with ${industryData.certifications[0]} and ${faker.number.int({ min: 15, max: 30 })} years of experience`,
        differentiators: [
          { label: '100% Satisfaction Guarantee', icon: '✅' },
          { label: industryData.specializations[0], icon: '🌟' },
          { label: '24/7 Emergency Service', icon: '🚨' }
        ],
        teamSize: '10-20',
        yearsInBusiness: faker.number.int({ min: 10, max: 25 })
      };
    } else if (quality === 'medium') {
      return {
        confirmedClaims: ['licensed', 'insured'],
        uniqueValue: `Reliable ${industry} service at fair prices`,
        differentiators: [
          { label: 'Free Estimates', icon: '💰' },
          { label: 'Local & Trusted', icon: '🏠' }
        ],
        teamSize: '5-10',
        yearsInBusiness: faker.number.int({ min: 3, max: 10 })
      };
    } else {
      return {
        confirmedClaims: ['licensed'],
        uniqueValue: `Affordable ${industry} service`
      };
    }
  }

  /**
   * Generate a list of test Place IDs for different scenarios
   */
  static getTestPlaceIds() {
    return {
      // High-quality businesses
      highQuality: {
        landscaping: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        hvac: 'ChIJnepQB1XGQIYRy455cw3qD-Q',
        plumbing: 'ChIJP3Sa8ziYEmsRUKgyFmh9AQM',
        cleaning: 'ChIJrTLr-GyuEmsRBfy61i59si0'
      },
      // Medium-quality businesses
      mediumQuality: {
        landscaping: 'ChIJQWqibS5uEmsRm_gDAzLEEYU',
        hvac: 'ChIJS5ydNXmYEmsR0IKgMLiEEYU',
        plumbing: 'ChIJl7w2tyxuEmsRqEZpTe8nJYU',
        cleaning: 'ChIJ3TYOqyxuEmsRvmIDaDqEEYU'
      },
      // Low-quality businesses (minimal data)
      lowQuality: {
        landscaping: 'ChIJYeH7WCxuEmsRkMIDaDqEEYU',
        hvac: 'ChIJTaBaWCxuEmsRQMIDaDqEEYU',
        plumbing: 'ChIJBWqSWCxuEmsRcMIDaDqEEYU',
        cleaning: 'ChIJQYqMWCxuEmsRgMIDaDqEEYU'
      }
    };
  }
}

// Export common test data scenarios
export const TEST_SCENARIOS = {
  perfectData: TestDataFactory.generateBusinessProfile('landscaping', 'high'),
  goodData: TestDataFactory.generateBusinessProfile('hvac', 'high'),
  averageData: TestDataFactory.generateBusinessProfile('plumbing', 'medium'),
  minimalData: TestDataFactory.generateBusinessProfile('cleaning', 'low'),
  
  // Edge cases
  noPhotos: (() => {
    const profile = TestDataFactory.generateBusinessProfile('landscaping', 'medium');
    profile.gbpData.photos = [];
    return profile;
  })(),
  
  noReviews: (() => {
    const profile = TestDataFactory.generateBusinessProfile('hvac', 'medium');
    profile.gbpData.userRatingCount = 0;
    profile.placesData.reviews.total = 0;
    profile.placesData.reviews.highlights = [];
    return profile;
  })(),
  
  noDescription: (() => {
    const profile = TestDataFactory.generateBusinessProfile('plumbing', 'low');
    profile.gbpData.description = '';
    return profile;
  })()
};