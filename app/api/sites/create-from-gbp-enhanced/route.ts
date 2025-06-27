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
import { BusinessIntelligenceData } from '@/types/intelligence';

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
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      locationId, 
      accountId, 
      industry: providedIndustry, 
      isPlaceId, 
      placeData,
      userAnswers,
      generateQuestionsOnly
    } = createFromGBPSchema.parse(body);

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

        placesData = await placeResponse.json();
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

    // Step 2: Fetch SERP data from DataForSEO
    let serpData: any = null;
    try {
      if (process.env.DATAFORSEO_API_KEY) {
        // Get the business location for SERP analysis
        const city = business.fullAddress?.locality || 
                    business.address?.split(',')[1]?.trim() || 
                    'local';
        
        // Search for competitive insights
        const serpQuery = `${industry} services ${city}`;
        
        // This is a mock - you'd integrate with DataForSEO API here
        serpData = {
          topKeywords: [`${industry} ${city}`, `${industry} near me`, `best ${industry}`],
          competitorServices: ['installation', 'repair', 'maintenance'],
          commonTrustSignals: ['Licensed', 'Insured'],
          competitorPricingTransparency: 'hidden',
          location: city,
          peopleAlsoAsk: [
            {
              question: `How much does ${industry} service cost?`,
              answer: 'Prices vary based on the specific service...'
            }
          ]
        };
        
        logger.info('SERP data fetched', {
          metadata: {
            query: serpQuery,
            keywordsFound: serpData.topKeywords.length,
          }
        });
      }
    } catch (error) {
      logger.error('Failed to fetch SERP data', {}, error as Error);
      // Continue without SERP data
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
        return NextResponse.json({
          questions,
          insights: {
            businessName: insights.confirmed.businessName,
            dataQuality: insights.overallQuality,
            sourceQuality: insights.sourceQuality,
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
    
    // Check if subdomain is already taken
    while (await prisma.site.findUnique({ where: { subdomain } })) {
      subdomain = `${baseSubdomain}-${counter}`;
      counter++;
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

        ghlLocation = await ghlClient.createSaasSubAccount({
          businessName: insights.confirmed.businessName,
          email: session.user.email!,
          phone: insights.confirmed.primaryPhone || '',
          address: insights.confirmed.address || '',
          website: insights.confirmed.website || '',
          industry,
        });

        ghlLocationId = ghlLocation.id;
        ghlApiKey = ghlLocation.apiKey || null;
        ghlEnabled = !ghlLocation.requiresManualApiKeySetup;
      }
    } catch (error) {
      logger.error('Failed to create GHL sub-account', {}, error as Error);
      // Continue without GHL
    }

    // Create a team for this business
    const { createClientTeam } = await import('@/lib/teams');
    const team = await createClientTeam(
      insights.confirmed.businessName,
      session.user.id,
      ghlLocation?.id
    );

    // Extract colors from the populated sections or use defaults
    const extractedColors = {
      primary: templateSelection.colorScheme?.primary || '#22C55E',
      secondary: templateSelection.colorScheme?.secondary || '#16A34A',
      accent: templateSelection.colorScheme?.accent || '#FFA500',
    };

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

    logger.info('Enhanced site created successfully', {
      metadata: {
        siteId: site.id,
        subdomain: site.subdomain,
        servicesCount: insights.confirmed.services.length,
        industry,
        template: templateSelection.selectedTemplate,
        competitivePositioning: templateSelection.competitiveStrategy.positioning,
        dataQuality: insights.overallQuality,
      }
    });

    return NextResponse.json({
      id: site.id,
      subdomain: site.subdomain,
      businessName: site.businessName,
      url: `${subdomain}.${new URL(process.env.NEXTAUTH_URL!).hostname}`,
      template: templateSelection.selectedTemplate,
      competitiveStrategy: templateSelection.competitiveStrategy,
      dataQuality: insights.overallQuality,
    });

  } catch (error) {
    logger.error('Enhanced create site error', {
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
