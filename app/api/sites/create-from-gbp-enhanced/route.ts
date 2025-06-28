import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { createGHLProClient } from '@/lib/ghl';
import { BusinessIntelligenceExtractor } from '@/lib/business-intelligence';
import { calculateDataScore } from '@/lib/intelligence/scoring';
import { generateSubdomain } from '@/lib/utils';
import { IndustryType } from '@/types/site-builder';
import { validateSubdomain } from '@/lib/constants';
import { BusinessIntelligenceData } from '@/types/intelligence';

// Import caching utilities
const placeDataCache = new Map<string, { data: any; timestamp: number }>();
const PLACE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Import the new multi-source system
import { multiSourceEvaluator } from '@/lib/content-generation/multi-source-data-evaluator';
import { questionGenerator } from '@/lib/content-generation/intelligent-question-generator';
import { enhancedTemplateSelector } from '@/lib/content-generation/enhanced-template-selector';
import { enhancedLandscapingPopulator } from '@/lib/content-generation/industry-populators/enhanced-landscaping-populator';
import { enhancedHVACPopulator } from '@/lib/content-generation/industry-populators/enhanced-hvac-populator';
import { enhancedPlumbingPopulator } from '@/lib/content-generation/industry-populators/enhanced-plumbing-populator';
import { enhancedCleaningPopulator } from '@/lib/content-generation/industry-populators/enhanced-cleaning-populator';

const createFromGBPSchema = z.object({
  locationId: z.string(), // Can be either GBP location ID or Place ID
  accountId: z.string().optional(),
  industry: z.string().optional(),
  isPlaceId: z.boolean().optional(),
  placeData: z.object({
    name: z.string(),
    address: z.string(),
    phone: z.string().optional(),
    website: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }).optional(),
  // For returning users who have already answered questions
  userAnswers: z.record(z.any()).optional(),
  // For initial question generation only
  generateQuestionsOnly: z.boolean().optional(),
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

// Get the appropriate industry populator
function getIndustryPopulator(industry: IndustryType) {
  switch (industry) {
    case 'landscaping':
      return enhancedLandscapingPopulator;
    case 'hvac':
      return enhancedHVACPopulator;
    case 'plumbing':
      return enhancedPlumbingPopulator;
    case 'cleaning':
      return enhancedCleaningPopulator;
    default:
      // Fallback to landscaping populator for now
      logger.warn(`No enhanced populator for industry: ${industry}, using landscaping`);
      return enhancedLandscapingPopulator;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const TIMEOUT_MS = 30000; // 30 second timeout
  
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      logger.error('Failed to parse request body', {}, error as Error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    let parsedData;
    try {
      parsedData = createFromGBPSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid data', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
    
    const { 
      locationId, 
      accountId, 
      industry: providedIndustry, 
      isPlaceId, 
      placeData,
      userAnswers,
      generateQuestionsOnly
    } = parsedData;

    logger.info('Enhanced site creation from GBP', {
      metadata: { 
        userId: session.user.id, 
        locationId,
        accountId,
        isPlaceId,
        hasPlaceData: !!placeData,
        hasUserAnswers: !!userAnswers,
        generateQuestionsOnly,
      }
    });
    
    // Track generation start
    if (!generateQuestionsOnly) {
      try {
        const { trackEnhancedGeneration } = await import('@/lib/analytics/enhanced-generation-tracker');
        await trackEnhancedGeneration('generation_started', {
          industry: providedIndustry,
          source: 'api',
        }).catch(() => {});
      } catch (e) {
        // Analytics is optional
      }
    }

    // Step 1: Fetch GBP/Place data
    let gbpData: any = null;
    let placesData: any = null;
    let business: any;
    let isFromGBP = false;

    // Check if this is a Place ID (when user doesn't have GBP access)
    if (isPlaceId || locationId.startsWith('ChIJ')) {
      // Fetch from Places API
      if (placeData) {
        placesData = {
          name: placeData.name,
          formatted_address: placeData.address,
          formatted_phone_number: placeData.phone,
          website: placeData.website,
          location: placeData.coordinates,
        };
        business = placeData;
      } else {
        // Check timeout
        if (Date.now() - startTime > TIMEOUT_MS) {
          throw new Error('Request timeout');
        }
        // Check cache first
        const cacheKey = `place_${locationId}`;
        const cached = placeDataCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < PLACE_CACHE_TTL) {
          logger.info('Using cached place data', {
            metadata: { placeId: locationId, cacheAge: Date.now() - cached.timestamp }
          });
          placesData = cached.data;
        } else {
          // Fetch from Places API
          const placeResponse = await fetch(
            `${process.env.NEXTAUTH_URL}/api/gbp/place-details`,
            {
              method: 'POST',
              headers: {
                'Cookie': request.headers.get('cookie') || '',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ placeId: locationId }),
              signal: AbortSignal.timeout(10000), // 10 second timeout for place fetch
            }
          );

          if (!placeResponse.ok) {
            const errorText = await placeResponse.text();
            logger.error('Failed to fetch place details', {
              metadata: { 
                status: placeResponse.status,
                error: errorText,
                placeId: locationId,
              }
            });
            throw new Error(`Failed to fetch place details: ${placeResponse.status}`);
          }

          placesData = await placeResponse.json();
          
          // Cache the result
          placeDataCache.set(cacheKey, {
            data: placesData,
            timestamp: Date.now(),
          });
          
          logger.info('Cached place data', {
            metadata: { placeId: locationId }
          });
        }
        
        business = {
          name: placesData.name,
          title: placesData.name,
          address: placesData.formatted_address,
          primaryPhone: placesData.formatted_phone_number,
          website: placesData.website,
          coordinates: placesData.location,
          openingHours: placesData.opening_hours,
          photos: placesData.photos,
          rating: placesData.rating,
          user_ratings_total: placesData.user_ratings_total,
        };
      }
    } else {
      // This is a GBP location ID - fetch from GBP API
      isFromGBP = true;
      
      const encodedLocationId = encodeURIComponent(locationId);
      const gbpUrl = `${process.env.NEXTAUTH_URL}/api/gbp/location/${encodedLocationId}${accountId ? `?accountId=${accountId}` : ''}`;
      
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

      gbpData = await gbpResponse.json();
      business = gbpData;
    }

    // Detect industry if not provided
    const industry = (providedIndustry || detectIndustryFromCategory(business.primaryCategory) || 'general') as IndustryType;

    // Check timeout before expensive operations
    if (Date.now() - startTime > TIMEOUT_MS) {
      throw new Error('Request timeout');
    }
    
    // Step 2: Fetch SERP data from DataForSEO
    let serpData: any = null;
    try {
      // Get the business location for SERP analysis
      const city = business.fullAddress?.locality || 
                  business.address?.split(',')[1]?.trim() || 
                  'local';
      
      // Import and use the DataForSEO client
      const { dataForSEOClient } = await import('@/lib/integrations/dataforseo-client');
      
      // Get competitive analysis with timeout
      const serpPromise = dataForSEOClient.getCompetitiveAnalysis(
        business.name || business.title,
        city,
        industry
      );
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SERP fetch timeout')), 5000)
      );
      
      serpData = await Promise.race([serpPromise, timeoutPromise]);
      
      logger.info('SERP data fetched', {
        metadata: {
          location: city,
          keywordsFound: serpData.topKeywords.length,
          competitorsFound: serpData.competitors.length,
          servicesFound: serpData.competitorServices.length,
        }
      });
    } catch (error) {
      logger.warn('Failed to fetch SERP data, continuing without it', {}, error as Error);
      // Continue without SERP data - not critical
    }

    // Step 3: Prepare multi-source data
    const multiSourceData = {
      gbp: gbpData,
      places: placesData,
      serp: serpData,
      userAnswers: userAnswers || {},
    };

    // Step 4: Evaluate data sources
    const insights = multiSourceEvaluator.evaluateAllSources(multiSourceData);
    
    logger.info('Multi-source evaluation complete', {
      metadata: {
        overallQuality: insights.overallQuality,
        sourceQuality: insights.sourceQuality,
        missingDataCount: insights.missingData.length,
        confirmedDataCount: Object.keys(insights.confirmed).length,
      }
    });

    // Step 5: Generate intelligent questions if needed
    if (generateQuestionsOnly || !userAnswers) {
      const questions = questionGenerator.generateQuestions(insights, industry);
      
      logger.info('Generated intelligent questions', {
        metadata: {
          questionsCount: questions.length,
          categories: [...new Set(questions.map(q => q.category))],
        }
      });

      // Return questions for the user to answer
      if (generateQuestionsOnly) {
        // Track analytics
        try {
          const { trackEnhancedGeneration } = await import('@/lib/analytics/enhanced-generation-tracker');
          
          // Add timeout for analytics
          const analyticsPromise = trackEnhancedGeneration('questions_generated', {
            industry,
            questionsCount: questions.length,
            dataQuality: insights.overallQuality,
            businessName: insights.confirmed.businessName,
          });
          
          const analyticsTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Analytics timeout')), 2000)
          );
          
          await Promise.race([analyticsPromise, analyticsTimeout]);
        } catch (e) {
          logger.debug('Analytics tracking failed', {}, e as Error);
          // Analytics is optional - don't break the flow
        }

        return NextResponse.json({
          questions,
          insights: {
            businessName: insights.confirmed.businessName,
            dataQuality: insights.overallQuality,
            sourceQuality: insights.sourceQuality,
          },
          businessData: {
            name: business.name || business.title,
            address: business.address || business.fullAddress?.addressLines?.join(', '),
            phone: business.primaryPhone,
            website: business.website,
            coordinates: business.coordinates,
            industry,
          },
          requiresAnswers: questions.length > 0,
        });
      }

      // If no user answers provided and questions exist, return error
      if (questions.length > 0) {
        return NextResponse.json({
          error: 'User input required',
          questions,
          requiresAnswers: true,
        }, { status: 400 });
      }
    }

    // Step 6: Select optimal template with competitive strategy
    const templateSelection = await enhancedTemplateSelector.selectOptimalTemplate(
      multiSourceData,
      industry
    );

    logger.info('Template selected with competitive strategy', {
      metadata: {
        template: templateSelection.selectedTemplate,
        positioning: templateSelection.competitiveStrategy.positioning,
        differentiators: templateSelection.competitiveStrategy.differentiators,
        sectionCount: templateSelection.sectionOrder.length,
      }
    });

    // Step 7: Populate sections with multi-source data
    const industryPopulator = getIndustryPopulator(industry);
    const populatedSections = industryPopulator.populateAllSections(
      templateSelection,
      insights,
      multiSourceData.serp,
      multiSourceData.userAnswers
    );

    logger.info('Sections populated with rich content', {
      metadata: {
        sectionsPopulated: Object.keys(populatedSections).length,
        dataSources: [...new Set(Object.values(populatedSections).flatMap(s => s.metadata.dataSource))],
      }
    });

    // Generate subdomain
    const baseSubdomain = generateSubdomain(insights.confirmed.businessName);
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

    // Check timeout before database operations
    if (Date.now() - startTime > TIMEOUT_MS) {
      throw new Error('Request timeout');
    }
    
    // Create GoHighLevel sub-account if enabled
    let ghlLocationId = null;
    let ghlApiKey = null;
    let ghlEnabled = false;
    let ghlLocation = null;

    try {
      if (process.env.GHL_API_KEY && process.env.GHL_AGENCY_ID) {
        logger.info('Creating GHL sub-account for site');
        
        const ghlClient = createGHLProClient();

        // Add timeout for GHL operations
        const ghlPromise = ghlClient.createSaasSubAccount({
          businessName: insights.confirmed.businessName,
          email: session.user.email!,
          phone: insights.confirmed.primaryPhone || '',
          address: insights.confirmed.address || '',
          website: insights.confirmed.website || '',
          industry,
        });
        
        const ghlTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('GHL sub-account creation timeout')), 10000)
        );
        
        ghlLocation = await Promise.race([ghlPromise, ghlTimeoutPromise]) as any;

        ghlLocationId = ghlLocation.id;
        ghlApiKey = ghlLocation.apiKey || null;
        ghlEnabled = !ghlLocation.requiresManualApiKeySetup;
      }
    } catch (error) {
      logger.warn('Failed to create GHL sub-account, continuing without it', {}, error as Error);
      // Continue without GHL - not critical
    }

    // Create a team for this business
    let team;
    try {
      const { createClientTeam } = await import('@/lib/teams');
      team = await createClientTeam(
        insights.confirmed.businessName,
        session.user.id,
        ghlLocation?.id
      );
      
      if (!team?.id) {
        throw new Error('Team creation returned invalid data');
      }
    } catch (error) {
      logger.error('Failed to create team', {
        metadata: { 
          businessName: insights.confirmed.businessName,
          userId: session.user.id,
        }
      }, error as Error);
      throw new Error('Failed to create business team');
    }

    // Extract colors from the populated sections or use defaults
    const extractedColors = {
      primary: templateSelection.colorScheme?.primary || '#22C55E',
      secondary: templateSelection.colorScheme?.secondary || '#16A34A',
      accent: templateSelection.colorScheme?.accent || '#FFA500',
    };

    // Check timeout before final database operations
    if (Date.now() - startTime > TIMEOUT_MS) {
      throw new Error('Request timeout');
    }
    
    // Create the site with enhanced data
    const site = await prisma.site.create({
      data: {
        userId: session.user.id,
        teamId: team.id,
        businessName: insights.confirmed.businessName,
        subdomain,
        
        // Contact info
        phone: insights.confirmed.primaryPhone || null,
        email: insights.confirmed.email || session.user.email,
        address: insights.confirmed.address,
        city: insights.confirmed.city || null,
        state: insights.confirmed.state || null,
        zip: insights.confirmed.zip || null,
        
        // Extended info
        coordinates: insights.confirmed.coordinates || null,
        serviceAreas: insights.confirmed.serviceArea || null,
        businessHours: insights.confirmed.hours || null,
        specialHours: business.specialHours || null,
        attributes: business.attributes || null,
        
        // Business details
        metaDescription: insights.confirmed.description || null,
        
        // Industry
        industry,
        industryConfirmed: true,
        gbpLocationId: isFromGBP ? locationId : null,
        gbpPlaceId: isPlaceId ? locationId : null,
        
        // GoHighLevel Integration
        ghlLocationId,
        ghlApiKey,
        ghlEnabled,
        
        // Configuration - use enhanced template selection
        template: templateSelection.selectedTemplate,
        primaryColor: extractedColors.primary,
        secondaryColor: extractedColors.secondary,
        accentColor: extractedColors.accent,
        logo: insights.confirmed.logo?.url,
        photoData: insights.confirmed.photos || [],
        published: false,
        
        // Store competitive strategy for reference
        metadata: {
          competitiveStrategy: templateSelection.competitiveStrategy,
          dataQuality: insights.sourceQuality,
          generatedWith: 'enhanced-multi-source',
        } as any,
      },
    });

    // Create pages with populated sections
    const homeSections = templateSelection.sectionOrder.map(sectionType => {
      const populatedSection = populatedSections[sectionType];
      return {
        type: sectionType,
        variant: populatedSection.variant,
        data: populatedSection.content,
        metadata: populatedSection.metadata,
      };
    });

    const defaultPages = [
      {
        siteId: site.id,
        slug: 'home',
        title: 'Home',
        type: 'home',
        content: {
          sections: homeSections,
          // Keep some legacy data for backwards compatibility
          hero: populatedSections.hero?.content,
          services: insights.confirmed.services.slice(0, 6),
          hours: insights.confirmed.hours,
          serviceArea: insights.confirmed.serviceArea,
          coordinates: insights.confirmed.coordinates,
        },
      },
      {
        siteId: site.id,
        slug: 'services',
        title: 'Services',
        type: 'services',
        content: populatedSections.services?.content || {
          services: insights.confirmed.services.map((name: string) => ({
            name,
            description: '',
            category: industry,
          })),
        },
      },
      {
        siteId: site.id,
        slug: 'about',
        title: 'About Us',
        type: 'about',
        content: populatedSections.about?.content || {
          businessName: insights.confirmed.businessName,
          description: insights.confirmed.description,
          serviceAreas: insights.confirmed.serviceArea,
          yearsInBusiness: insights.confirmed.yearsInBusiness,
          certifications: insights.confirmed.certifications,
        },
      },
      {
        siteId: site.id,
        slug: 'contact',
        title: 'Contact',
        type: 'contact',
        content: populatedSections.contact?.content || {
          phone: insights.confirmed.primaryPhone,
          email: insights.confirmed.email,
          address: insights.confirmed.address,
          city: insights.confirmed.city,
          state: insights.confirmed.state,
          zip: insights.confirmed.zip,
          hours: insights.confirmed.hours,
          coordinates: insights.confirmed.coordinates,
        },
      },
    ];

    await prisma.page.createMany({
      data: defaultPages,
    });

    // Create services with enriched data
    if (insights.confirmed.services.length > 0) {
      const servicesData = insights.confirmed.services.slice(0, 20).map((name: string, index: number) => {
        // Find enriched service data from populated sections
        const enrichedService = populatedSections.services?.content?.services?.find(
          (s: any) => s.name.toLowerCase() === name.toLowerCase()
        );
        
        return {
          siteId: site.id,
          name,
          description: enrichedService?.description || `Professional ${name.toLowerCase()} services`,
          features: enrichedService?.features || [],
          pricing: enrichedService?.pricing,
          featured: index < 3 || enrichedService?.urgent,
          order: index,
        };
      });

      await prisma.service.createMany({
        data: servicesData,
      });
    }

    // Store business intelligence with enhanced data
    await prisma.businessIntelligence.create({
      data: {
        businessName: insights.confirmed.businessName,
        placeId: isPlaceId ? locationId : undefined,
        dataScore: {
          total: insights.overallQuality,
          breakdown: insights.sourceQuality,
          contentTier: insights.overallQuality > 0.8 ? 'premium' : 
                      insights.overallQuality > 0.6 ? 'standard' : 'basic',
        } as any,
        gbpData: gbpData,
        placesData: placesData,
        serpData: serpData,
        userAnswers: userAnswers,
        extractedAt: new Date(),
      },
    });

    const duration = Date.now() - startTime;
    
    logger.info('Enhanced site created successfully', {
      metadata: {
        siteId: site.id,
        subdomain: site.subdomain,
        servicesCount: insights.confirmed.services.length,
        industry,
        template: templateSelection.selectedTemplate,
        competitivePositioning: templateSelection.competitiveStrategy.positioning,
        dataQuality: insights.overallQuality,
        duration,
      }
    });

    // Track success analytics
    try {
      const { trackEnhancedGeneration } = await import('@/lib/analytics/enhanced-generation-tracker');
      await trackEnhancedGeneration('generation_completed', {
        industry,
        template: templateSelection.selectedTemplate,
        dataQuality: insights.overallQuality,
        generationTime: duration,
        hasUserAnswers: !!userAnswers,
        hasGbpData: !!gbpData,
        hasPlacesData: !!placesData,
        hasSerpData: !!serpData,
      }).catch(() => {}); // Fire and forget
    } catch (e) {
      // Analytics is optional
    }

    return NextResponse.json({
      id: site.id,
      subdomain: site.subdomain,
      businessName: site.businessName,
      url: `${subdomain}.${new URL(process.env.NEXTAUTH_URL!).hostname}`,
      template: templateSelection.selectedTemplate,
      competitiveStrategy: templateSelection.competitiveStrategy,
      dataQuality: insights.overallQuality,
      duration,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('timeout');
    
    logger.error('Enhanced create site error', {
      metadata: { 
        error: errorMessage,
        isTimeout,
        duration: Date.now() - startTime,
      }
    });
    
    // Track error analytics
    try {
      const { trackEnhancedGeneration } = await import('@/lib/analytics/enhanced-generation-tracker');
      await trackEnhancedGeneration('generation_failed', {
        errorMessage,
        errorStep: isTimeout ? 'timeout' : 'unknown',
        generationTime: Date.now() - startTime,
      }).catch(() => {});
    } catch (e) {
      // Analytics is optional
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    
    if (isTimeout) {
      return NextResponse.json(
        { 
          error: 'Request timeout', 
          message: 'The operation took too long. Please try again with a smaller request or check your connection.',
          duration: Date.now() - startTime,
        },
        { status: 504 }
      );
    }
    
    if (errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to continue.' },
        { status: 401 }
      );
    }
    
    if (errorMessage.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'External API error', 
          message: 'Failed to fetch data from external services. Please try again.',
        },
        { status: 502 }
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { 
        error: 'Failed to create site',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
