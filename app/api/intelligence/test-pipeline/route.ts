import { NextResponse } from 'next/server';
import { BusinessIntelligenceExtractor } from '@/lib/business-intelligence';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessName = searchParams.get('name') || 'Green Valley Landscaping';
    const address = searchParams.get('address') || '123 Main St, San Francisco, CA';
    const placeId = searchParams.get('placeId');
    
    logger.info('Testing enhanced business intelligence pipeline', {
      businessName,
      address,
      placeId
    });
    
    const extractor = new BusinessIntelligenceExtractor();
    
    // Test with sample data
    const result = await extractor.extractBusinessIntelligence({
      name: businessName,
      address: address,
      phone: '(555) 123-4567',
      website: 'https://example.com',
      placeId: placeId || undefined,
      gbpData: null,
      placesData: {
        name: businessName,
        formatted_address: address,
        rating: 4.5,
        user_ratings_total: 150,
        types: ['landscaper', 'lawn_care'],
        photos: []
      }
    });
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Business intelligence pipeline test failed', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}