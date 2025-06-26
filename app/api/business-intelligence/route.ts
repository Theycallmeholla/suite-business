import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { DataForSEOService, formatBusinessIntelligenceData } from '@/lib/dataforseo';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { businessName, placeId, gbpData, placesData } = await request.json();
    
    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    logger.info('Starting business intelligence collection', {
      metadata: {
      businessName,
      placeId,
      hasGBP: !!gbpData,
      hasPlaces: !!placesData,
    }
    });

    // Initialize DataForSEO service
    const dataforseo = new DataForSEOService();
    
    // Extract key business info
    const address = gbpData?.storefrontAddress?.addressLines?.join(', ') || 
                   placesData?.formatted_address || '';
    const phone = gbpData?.phoneNumbers?.primaryPhone || 
                  placesData?.formatted_phone_number || '';
    const industry = gbpData?.primaryCategory?.displayName || 
                    placesData?.types?.[0] || 'general';
    
    // Search for business information across the web
    const searchResults = await dataforseo.searchBusiness(
      businessName,
      address,
      phone
    );
    
    // Analyze with OpenAI if available
    const aiAnalysis = await dataforseo.analyzeBusinessData(
      businessName,
      industry,
      searchResults,
      gbpData,
      placesData
    );
    
    // Format all collected data
    const intelligenceData = formatBusinessIntelligenceData(
      gbpData,
      placesData,
      searchResults,
      aiAnalysis
    );
    
    // Store in database
    const businessIntelligence = await prisma.businessIntelligence.create({
      data: {
        businessName,
        placeId,
        gbpData: gbpData || undefined,
        placesData: placesData || undefined,
        serpData: searchResults ? JSON.parse(JSON.stringify(searchResults)) : undefined,
        dataScore: intelligenceData.dataScore ? JSON.parse(JSON.stringify(intelligenceData.dataScore)) : {},
        extractedAt: new Date(),
      },
    });
    
    // Return summary of what was found
    const summary = {
      id: businessIntelligence.id,
      businessName,
      dataCollected: {
        searchResultsCount: searchResults?.searchResults?.length || 0,
        mentionsCount: searchResults?.businessMentions?.length || 0,
        socialMediaFound: searchResults?.socialLinks ? Object.keys(searchResults.socialLinks).length : 0,
        additionalEmails: searchResults?.additionalData?.emails?.length || 0,
        additionalPhones: searchResults?.additionalData?.phones?.length || 0,
        photosCount: (intelligenceData?.photos?.googlePlaces?.length || 0) + 
                     (intelligenceData?.photos?.googleBusiness?.length || 0),
      },
      socialLinks: searchResults?.socialLinks || {},
      topMentions: searchResults?.businessMentions?.slice(0, 3) || [],
    };
    
    logger.info('Business intelligence collection complete', {
      metadata: {
      businessName,
      intelligenceId: businessIntelligence.id,
      ...summary.dataCollected,
    }
    });
    
    return NextResponse.json({
      success: true,
      intelligenceId: businessIntelligence.id,
      summary,
    });
    
  } catch (error) {
    logger.error('Business intelligence collection failed', {
      metadata: { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
    });
    
    return NextResponse.json(
      { error: 'Failed to collect business intelligence' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve collected intelligence
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const intelligenceId = searchParams.get('id');
    const businessName = searchParams.get('businessName');
    
    let intelligence;
    
    if (intelligenceId) {
      intelligence = await prisma.businessIntelligence.findUnique({
        where: { id: intelligenceId },
      });
    } else if (businessName) {
      intelligence = await prisma.businessIntelligence.findFirst({
        where: { businessName },
        orderBy: { extractedAt: 'desc' },
      });
    } else {
      return NextResponse.json(
        { error: 'Either id or businessName is required' },
        { status: 400 }
      );
    }
    
    if (!intelligence) {
      return NextResponse.json(
        { error: 'Business intelligence not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      intelligence,
    });
    
  } catch (error) {
    logger.error('Failed to retrieve business intelligence', {
      metadata: { error }
    });
    
    return NextResponse.json(
      { error: 'Failed to retrieve business intelligence' },
      { status: 500 }
    );
  }
}
