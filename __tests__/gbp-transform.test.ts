import { transformGbpData } from '@/lib/intelligence/gbp-transform';
import { calculateDataScore } from '@/lib/intelligence/scoring';
import grindmasters from './fixtures/grindmasters.json';

describe('GBP Data Transformation', () => {
  it('should correctly transform GBP data into our internal format', () => {
    const result = transformGbpData(grindmasters.locations[0]);

    // Test canonical keys
    expect(result.primaryPhone).toBe('(713) 933-4433');
    expect(result.website).toBe('https://grindmastersinc.com/');
    expect(result.fullAddress.addressLines[0]).toBe('11203 Jones Rd W');
    expect(result.name).toBe('Grindmasters Inc');
    expect(result.serviceArea).toBeDefined();
    expect(result.serviceArea.places.length).toBe(12);
    expect(result.primaryCategory.displayName).toBe('Machine shop');
    expect(result.regularHours).toBeDefined();
    expect(result.regularHours.periods.length).toBe(7);
    expect(result.profile.description).toContain('Houston\'s precision grinding experts');
    
    // Additional assertions
    expect(result.metadata.placeId).toBe('ChIJZzQUPoPRQIYR0ZGglYr92hQ');
    expect(result.languageCode).toBe('en');
  });
});

describe('Data Score Calculation', () => {
  it('should calculate data score breakdown correctly', () => {
    const transformedData = transformGbpData(grindmasters.locations[0]);
    
    // Create BusinessIntelligenceData object from transformed GBP data
    const businessData = {
      businessName: transformedData.name,
      industry: 'general' as const, // Machine shop doesn't match our industry types
      phone: transformedData.primaryPhone,
      website: transformedData.website,
      address: transformedData.fullAddress?.addressLines?.[0],
      city: transformedData.fullAddress?.locality,
      state: transformedData.fullAddress?.administrativeArea,
      zip: transformedData.fullAddress?.postalCode,
      businessHours: transformedData.regularHours,
      metaDescription: transformedData.profile?.description,
      gbp: {
        businessName: transformedData.name,
        description: transformedData.profile?.description,
        categories: [transformedData.primaryCategory?.displayName].filter(Boolean),
        photos: transformedData.photos || [],
        attributes: transformedData.attributes || {},
        hours: transformedData.regularHours
      }
    };
    
    const score = calculateDataScore(businessData);
    
    // Basic info should have full points (name, category, hours, contact)
    expect(score.breakdown.basicInfo).toBe(20);
    
    // Content should have points for description
    expect(score.breakdown.content).toBeGreaterThanOrEqual(10);
    
    // Visuals should be 0 (no photos in the data)
    expect(score.breakdown.visuals).toBe(0);
    
    // Trust should be 0 (no reviews in the data)
    expect(score.breakdown.trust).toBe(0);
    
    // Differentiation should be 0 (no manual data)
    expect(score.breakdown.differentiation).toBe(0);
    
    // Total should be sum of all breakdowns
    expect(score.total).toBe(
      score.breakdown.basicInfo +
      score.breakdown.content +
      score.breakdown.visuals +
      score.breakdown.trust +
      score.breakdown.differentiation
    );
    
    // Should have photos in missing critical
    expect(score.missingCritical).toContain('photos');
    
    // Content tier should be based on total score
    expect(score.contentTier).toBe(score.total >= 70 ? 'premium' : score.total >= 40 ? 'standard' : 'minimal');
  });
});