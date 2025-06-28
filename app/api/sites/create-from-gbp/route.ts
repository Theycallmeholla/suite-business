import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { createGHLProClient } from '@/lib/ghl';
import { BusinessIntelligenceExtractor } from '@/lib/business-intelligence';
import { calculateDataScore } from '@/lib/intelligence/scoring';
import { generateSubdomain } from '@/lib/utils';
import { generateDataDrivenSections } from '@/lib/content-generation/data-driven-content';
import { IndustryType } from '@/types/site-builder';
import { BusinessIntelligenceData } from '@/types/intelligence';
import { validateSubdomain } from '@/lib/constants';

/**
 * Select the best premium template based on industry and business data
 */
function selectPremiumTemplate(industry: IndustryType, businessData?: BusinessIntelligenceData | null): string {
  // For landscaping and related industries
  if (['landscaping', 'gardening', 'lawn-care', 'tree-service'].includes(industry)) {
    // Use emerald-elegance for established/premium businesses
    if (businessData?.basicInfo?.years_in_business && businessData.basicInfo.years_in_business > 5) {
      return 'emerald-elegance';
    }
    // Use dream-garden for others
    return 'dream-garden';
  }
  
  // For HVAC, plumbing, electrical - more technical industries
  if (['hvac', 'plumbing', 'electrical'].includes(industry)) {
    return 'nature-premium'; // Clean, professional look
  }
  
  // For cleaning, roofing, and general services
  if (['cleaning', 'roofing', 'general'].includes(industry)) {
    return 'artistry-minimal'; // Minimal, modern aesthetic
  }
  
  // Default to emerald-elegance for unmatched industries
  return 'emerald-elegance';
}

const createFromGBPSchema = z.object({
  locationId: z.string(), // Can be either GBP location ID or Place ID
  accountId: z.string().optional(),
  industry: z.string().optional(),
  isPlaceId: z.boolean().optional(), // Flag to indicate if locationId is a Place ID
  placeData: z.object({ // Place data when user doesn't have GBP access
    name: z.string(),
    address: z.string(),
    phone: z.string().optional(),
    website: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }).optional(),
});

// Helper function to detect industry from GBP category
function detectIndustryFromCategory(category: any): string {
  if (!category?.displayName) return 'general';
  const categoryName = category.displayName.toLowerCase();
  
  if (categoryName.includes('landscap') || categoryName.includes('lawn')) return 'landscaping';
  if (categoryName.includes('hvac') || categoryName.includes('heating') || categoryName.includes('cooling')) return 'hvac';
  if (categoryName.includes('plumb')) return 'plumbing';
  if (categoryName.includes('clean')) return 'cleaning';
  if (categoryName.includes('roof')) return 'roofing';
  if (categoryName.includes('electric')) return 'electrical';
  
  return 'general';
}

export async function POST(request: NextRequest) {
  try {
    // Check for enhanced generation feature flag
    if (process.env.USE_ENHANCED_GENERATION === 'true') {
      // Check rollout percentage if configured
      const rolloutPercentage = parseInt(process.env.ENHANCED_ROLLOUT_PERCENTAGE || '100', 10);
      const randomValue = Math.random() * 100;
      
      if (randomValue <= rolloutPercentage) {
        logger.info('Redirecting to enhanced site generation', {
          metadata: {
            rolloutPercentage,
            randomValue,
          }
        });
        
        // Track analytics event
        try {
          const { trackEnhancedGeneration } = await import('@/lib/analytics/enhanced-generation-tracker');
          await trackEnhancedGeneration('feature_flag_redirect', {
            rolloutPercentage,
            randomValue,
          });
        } catch (e) {
          // Analytics tracking is optional
        }
        
        // Clone the request and redirect to enhanced endpoint
        const url = new URL(request.url);
        url.pathname = '/api/sites/create-from-gbp-enhanced';
        
        return fetch(url.toString(), {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify(await request.json()),
        });
      }
    }
    
    // Check if user explicitly requested enhanced generation
    const body = await request.json();
    if (body.enhanced === true) {
      logger.info('User requested enhanced generation explicitly');
      
      // Track analytics event
      try {
        const { trackEnhancedGeneration } = await import('@/lib/analytics/enhanced-generation-tracker');
        await trackEnhancedGeneration('explicit_user_request', {
          source: 'api_parameter',
        });
      } catch (e) {
        // Analytics tracking is optional
      }
      
      const url = new URL(request.url);
      url.pathname = '/api/sites/create-from-gbp-enhanced';
      
      return fetch(url.toString(), {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(body),
      });
    }

    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { locationId, accountId, industry: providedIndustry, isPlaceId, placeData } = createFromGBPSchema.parse(body);

    logger.info('Creating site from GBP', {
      metadata: { 
      userId: session.user.id, 
      locationId,
      accountId,
      isPlaceId,
      hasPlaceData: !!placeData
    }
    });

    let business: any;
    let isFromGBP = false;

    // Check if this is a Place ID (when user doesn't have GBP access)
    if (isPlaceId || locationId.startsWith('ChIJ')) {
      // Use Place data if provided, otherwise fetch from Places API
      if (placeData) {
        business = {
          name: placeData.name,
          title: placeData.name,
          address: placeData.address,
          primaryPhone: placeData.phone,
          website: placeData.website,
          coordinates: placeData.coordinates,
          // Minimal data structure similar to GBP response
          fullAddress: {
            addressLines: [placeData.address],
          },
        };
      } else {
        // Fetch from Places API if we don't have the data
        const placeResponse = await fetch(
          `${process.env.NEXTAUTH_URL}/api/gbp/place-details`,
          {
            method: 'POST',
            headers: {
              'Cookie': request.headers.get('cookie') || '',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ placeId: locationId }),
          }
        );

        if (!placeResponse.ok) {
          throw new Error('Failed to fetch place details');
        }

        const placeResult = await placeResponse.json();
        business = {
          name: placeResult.name,
          title: placeResult.name,
          address: placeResult.formatted_address,
          primaryPhone: placeResult.formatted_phone_number,
          website: placeResult.website,
          coordinates: placeResult.location,
          fullAddress: {
            addressLines: [placeResult.formatted_address],
          },
          openingHours: placeResult.opening_hours,
          photos: placeResult.photos,
          rating: placeResult.rating,
          user_ratings_total: placeResult.user_ratings_total,
        };
      }
    } else {
      // This is a GBP location ID - fetch from GBP API
      isFromGBP = true;
      
      const encodedLocationId = encodeURIComponent(locationId);
      const gbpUrl = `${process.env.NEXTAUTH_URL}/api/gbp/location/${encodedLocationId}${accountId ? `?accountId=${accountId}` : ''}`;
      
      logger.info('Fetching GBP location details', {
      metadata: { 
        url: gbpUrl,
        originalLocationId: locationId,
        encodedLocationId 
      }
    });

      const gbpResponse = await fetch(gbpUrl, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
          'Content-Type': 'application/json',
        },
      });

      if (!gbpResponse.ok) {
        const errorText = await gbpResponse.text();
        logger.error('Failed to fetch GBP location', {
      metadata: { 
          status: gbpResponse.status,
          error: errorText,
          locationId,
        }
    });
        
        return NextResponse.json(
          { 
            error: 'Failed to fetch business details from Google',
            details: process.env.NODE_ENV === 'development' ? errorText : undefined,
          },
          { status: gbpResponse.status }
        );
      }

      business = await gbpResponse.json();
    }
    
    // Generate subdomain
    const baseSubdomain = generateSubdomain(business.name || business.title);
    let subdomain = baseSubdomain;
    let counter = 1;
    
    // Check if subdomain is already taken or reserved
    let subdomainValid = false;
    while (!subdomainValid) {
      const validation = validateSubdomain(subdomain);
      if (!validation.valid) {
        // If the base subdomain is reserved, add a suffix
        subdomain = `${baseSubdomain}-${counter}`;
        counter++;
        continue;
      }
      
      // Check if it's already taken in the database
      const existing = await prisma.site.findUnique({ where: { subdomain: subdomain.toLowerCase() } });
      if (existing) {
        subdomain = `${baseSubdomain}-${counter}`;
        counter++;
        continue;
      }
      
      subdomainValid = true;
    }

    // Create full address string early so it can be used in business intelligence
    const fullAddress = business.fullAddress?.addressLines?.join(', ') || business.address;

    // Extract business intelligence
    let businessIntelligence = null;
    let extractedColors = null;
    let aiContent = null;
    
    try {
      logger.info('Extracting business intelligence...');
      const extractor = new BusinessIntelligenceExtractor();
      
      businessIntelligence = await extractor.extractBusinessIntelligence({
        name: business.name || business.title,
        address: fullAddress || '',
        phone: business.primaryPhone,
        website: business.website,
        placeId: isPlaceId ? locationId : undefined,
        gbpData: isFromGBP ? business : undefined,
        placesData: !isFromGBP ? business : undefined,
      });
      
      extractedColors = businessIntelligence.colors;
      aiContent = businessIntelligence.aiContent;
      
      logger.info('Business intelligence extracted', {
      metadata: {
        hasLogo: !!businessIntelligence.logo,
        photosCount: businessIntelligence.photos.length,
        colorsExtracted: businessIntelligence.colors.extracted,
        questionsGenerated: businessIntelligence.questionsForUser.length,
      }
    });
      
      // Calculate data score
      const dataScore = calculateDataScore({
        gbp: {
          businessName: business.name || business.title,
          description: business.description,
          categories: [
            business.primaryCategory?.displayName,
            ...(business.additionalCategories?.map((cat: any) => cat.displayName) || [])
          ].filter(Boolean),
          photos: businessIntelligence.photos.map((p: any) => ({ url: p.url })),
          attributes: business.attributes || {},
          reviews: business.rating ? {
            rating: business.rating,
            count: business.userRatingCount || 0
          } : undefined,
          hours: business.regularHours?.periods ? 
            Object.fromEntries(
              business.regularHours.periods.map((p: any) => [
                p.openDay?.toLowerCase() || 'monday',
                { open: p.openTime || '9:00', close: p.closeTime || '17:00' }
              ])
            ) : undefined,
          services: business.services || []
        },
        places: !isFromGBP ? {
          placeId: locationId,
          reviews: business.rating ? {
            rating: business.rating,
            total: business.user_ratings_total || 0,
            highlights: [],
            sentiment: { positive: [], negative: [] }
          } : undefined,
          priceLevel: business.price_level,
          photos: business.photos?.map((p: any) => ({ 
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
            reference: p.photo_reference 
          })) || []
        } : undefined,
        manual: businessIntelligence.questionsForUser.length > 0 ? {
          yearsInBusiness: undefined,
          certifications: [],
          awards: [],
          specializations: [],
          teamSize: undefined
        } : undefined
      });

      logger.info('Data score calculated', {
        metadata: {
          score: dataScore.total,
          breakdown: dataScore.breakdown,
          contentTier: dataScore.contentTier
        }
      });
      
      // Store the intelligence data for later use
      // Note: BusinessIntelligence model uses specific JSON fields
      await prisma.businessIntelligence.create({
        data: {
          businessName: business.name || business.title,
          placeId: isPlaceId ? locationId : undefined,
          dataScore: dataScore as any, // Store the complete score object
          gbpData: isFromGBP ? business : null,
          placesData: !isFromGBP ? business : null,
          extractedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Business intelligence extraction failed', {}, error as Error);
      // Continue without it - use defaults
    }

    // Detect industry if not provided
    const industry = (providedIndustry || detectIndustryFromCategory(business.primaryCategory) || 'general') as IndustryType;

    // Extract services from categories (if from GBP)
    const services = isFromGBP ? [
      ...(business.primaryCategory?.serviceTypes?.map((s: any) => s.displayName) || []),
      ...(business.additionalCategories?.flatMap((cat: any) => 
        cat.serviceTypes?.map((s: any) => s.displayName) || []
      ) || [])
    ].filter(Boolean) : [];

    // Extract service area places (if from GBP)
    const serviceAreaPlaces = isFromGBP ? 
      business.serviceArea?.places?.placeInfos?.map((place: any) => ({
        name: place.placeName,
        placeId: place.placeId
      })) || [] : [];

    // Create GoHighLevel sub-account if enabled
    let ghlLocationId = null;
    let ghlApiKey = null;
    let ghlEnabled = false;
    let ghlLocation = null;

    try {
      if (process.env.GHL_API_KEY && process.env.GHL_AGENCY_ID) {
        logger.info('Creating GHL sub-account for site');
        
        const ghlClient = createGHLProClient();

        ghlLocation = await ghlClient.createSaasSubAccount({
          businessName: business.name || business.title,
          email: session.user.email!,
          phone: business.primaryPhone || '',
          address: fullAddress || '',
          website: business.website || '',
          industry,
        });

        ghlLocationId = ghlLocation.id;
        ghlApiKey = ghlLocation.apiKey || null;
        ghlEnabled = !ghlLocation.requiresManualApiKeySetup;

        logger.info('GHL sub-account created successfully', {
      metadata: {
          locationId: ghlLocationId,
          hasApiKey: !!ghlApiKey,
          requiresManualSetup: ghlLocation.requiresManualApiKeySetup,
        }
    });

        if (ghlLocation.requiresManualApiKeySetup) {
          await prisma.notification.create({
            data: {
              userId: session.user.id,
              type: 'GHL_SETUP_REQUIRED',
              title: 'GoHighLevel Setup Required',
              message: `Your GoHighLevel integration for ${business.name || business.title} requires manual API key generation. Please check your email for instructions.`,
              metadata: {
                ghlLocationId,
              },
            },
          });
        }
      }
    } catch (error) {
      logger.error('Failed to create GHL sub-account', {}, error as Error);
      // Continue without GHL
    }

    // Create a team for this business
    const { createClientTeam } = await import('@/lib/teams');
    const team = await createClientTeam(
      business.name || business.title,
      session.user.id,
      ghlLocation?.id
    );

    // Generate data-driven sections before creating the site
    let sections = [];
    try {
      sections = generateDataDrivenSections({
        businessData: businessIntelligence || {
          basicInfo: {
            name: business.name || business.title,
            description: business.profile?.description,
            address: fullAddress,
            service_area: serviceAreaPlaces.join(', '),
            primary_phone: business.primaryPhone,
            email: session.user.email,
            coordinates: business.coordinates,
            hours: business.regularHours || business.openingHours,
          },
          services: {
            services: services,
            primary_service: services[0],
            service_details: {},
            pricing_type: 'custom',
            emergency_service: false,
          },
          reputation: business.rating ? {
            average_rating: business.rating,
            total_reviews: business.userRatingCount || 0,
            google_reviews: [],
          } : undefined,
          visuals: {
            photos: businessIntelligence?.photos || [],
            hero_image: businessIntelligence?.photos?.[0]?.url,
          },
          differentiation: {
            unique_selling_points: [],
            certifications: [],
            guarantees: [],
          },
        },
        industry,
        gbpData: business,
        userAnswers: {},
      });
      
      logger.info('Generated data-driven sections', {
        metadata: {
          sectionsCount: sections.length,
          sectionTypes: sections.map(s => s.type),
        }
      });
    } catch (error) {
      logger.error('Failed to generate data-driven sections', {}, error as Error);
    }

    // Create the site
    const site = await prisma.site.create({
      data: {
        userId: session.user.id,
        teamId: team.id,
        businessName: business.name || business.title,
        subdomain,
        
        // Contact info
        phone: business.primaryPhone || null,
        email: session.user.email,
        address: fullAddress,
        city: business.fullAddress?.locality || null,
        state: business.fullAddress?.administrativeArea || null,
        zip: business.fullAddress?.postalCode || null,
        
        // Extended info
        coordinates: business.coordinates || null,
        serviceAreas: serviceAreaPlaces.length > 0 ? serviceAreaPlaces : null,
        businessHours: business.regularHours || business.openingHours || null,
        specialHours: business.specialHours || null,
        attributes: business.attributes || null,
        
        // Business details
        metaDescription: business.profile?.description || null,
        
        // Industry
        industry,
        industryConfirmed: true,
        gbpLocationId: isFromGBP ? locationId : null,
        gbpPlaceId: isPlaceId ? locationId : null,
        
        // GoHighLevel Integration
        ghlLocationId,
        ghlApiKey,
        ghlEnabled,
        
        // Configuration - use premium template based on industry
        template: selectPremiumTemplate(industry, businessIntelligence),
        primaryColor: extractedColors?.primary || '#22C55E',
        secondaryColor: extractedColors?.secondary,
        accentColor: extractedColors?.accent,
        logo: businessIntelligence?.logo?.url,
        photoData: businessIntelligence?.photos || [],
        published: false,
      },
    });

    // Create default pages
    const defaultPages = [
      {
        siteId: site.id,
        slug: 'home',
        title: 'Home',
        type: 'home',
        content: {
          sections: sections, // Use our data-driven sections
          // Keep legacy data for backwards compatibility
          hero: {
            title: sections.find(s => s.type === 'hero')?.data?.headline || `Welcome to ${business.name || business.title}`,
            subtitle: sections.find(s => s.type === 'hero')?.data?.subheadline || business.profile?.description || `Professional ${industry} services you can trust`,
            backgroundImage: businessIntelligence?.photos?.[0]?.url,
          },
          services: services.slice(0, 6),
          hours: business.regularHours || business.openingHours,
          serviceArea: isFromGBP ? {
            type: business.serviceArea?.businessType,
            places: serviceAreaPlaces.slice(0, 10),
          } : null,
          categories: isFromGBP ? [
            business.primaryCategory?.displayName,
            ...(business.additionalCategories?.map((cat: any) => cat.displayName) || [])
          ].filter(Boolean) : [],
          coordinates: business.coordinates,
          website: business.website,
        },
      },
      {
        siteId: site.id,
        slug: 'services',
        title: 'Services',
        type: 'services',
        content: {
          services: services.map((name: string) => ({
            name,
            description: '',
            category: business.primaryCategory?.displayName || industry,
          })),
          categories: isFromGBP ? [
            business.primaryCategory?.displayName,
            ...(business.additionalCategories?.map((cat: any) => cat.displayName) || [])
          ].filter(Boolean) : [],
        },
      },
      {
        siteId: site.id,
        slug: 'about',
        title: 'About Us',
        type: 'about',
        content: {
          description: aiContent?.aboutUs || business.profile?.description,
          businessName: business.name || business.title,
          serviceAreas: serviceAreaPlaces,
          whyChooseUs: aiContent?.whyChooseUs || [],
          missionStatement: businessIntelligence?.businessInfo?.missionStatement,
          yearsInBusiness: businessIntelligence?.businessInfo?.yearsInBusiness,
          certifications: businessIntelligence?.businessInfo?.certifications,
        },
      },
      {
        siteId: site.id,
        slug: 'contact',
        title: 'Contact',
        type: 'contact',
        content: {
          phone: business.primaryPhone,
          additionalPhones: business.additionalPhones,
          address: fullAddress,
          city: business.fullAddress?.locality,
          state: business.fullAddress?.administrativeArea,
          zip: business.fullAddress?.postalCode,
          hours: business.regularHours || business.openingHours,
          coordinates: business.coordinates,
          website: business.website,
        },
      },
    ];

    await prisma.page.createMany({
      data: defaultPages,
    });

    // Create services if we found any
    if (services.length > 0) {
      await prisma.service.createMany({
        data: services.slice(0, 20).map((name: string, index: number) => ({
          siteId: site.id,
          name,
          description: `Professional ${name.toLowerCase()} services`,
          featured: index < 3,
          order: index,
        })),
      });
    }

    logger.info('Site created successfully from GBP', {
      metadata: {
      siteId: site.id,
      subdomain: site.subdomain,
      servicesCount: services.length,
      industry,
      isFromGBP,
    }
    });

    return NextResponse.json({
      id: site.id,
      subdomain: site.subdomain,
      businessName: site.businessName,
      url: `${subdomain}.${new URL(process.env.NEXTAUTH_URL!).hostname}`,
    });

  } catch (error) {
    logger.error('Create site from GBP error', {
      metadata: { error }
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}
