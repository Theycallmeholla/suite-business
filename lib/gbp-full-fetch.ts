import { logger } from '@/lib/logger';
/**
 * Google Business Profile Full Data Fetcher
 * 
 * This module provides a comprehensive approach to fetching
 * all available data from Google Business Profile in one go.
 */

export interface FullGBPData {
  // Core business information (from readMask)
  id: string;
  name: string;
  languageCode?: string;
  storeCode?: string;
  
  // Contact
  primaryPhone?: string;
  additionalPhones?: string[];
  website?: string;
  
  // Location
  address: string;
  fullAddress?: { formattedAddress?: string; postalAddress?: { regionCode?: string; postalCode?: string; administrativeArea?: string; locality?: string; addressLines?: string[]; }; };
  coordinates?: { latitude: number; longitude: number };
  serviceArea?: { businessType?: string; radius?: { radiusKm?: number; }; places?: Array<{ name?: string; }>; };
  
  // Categories
  primaryCategory?: { displayName?: string; categoryId?: string; };
  additionalCategories?: unknown[];
  
  // Hours
  regularHours?: { periods?: Array<{ openDay: string; openTime: string; closeDay: string; closeTime: string; }>; };
  specialHours?: any;
  moreHours?: unknown[];
  openInfo?: any;
  
  // Business info
  profile?: {
    description?: string;
    openingDate?: string;
  };
  labels?: string[];
  metadata?: any;
  relationshipData?: any;
  serviceItems?: unknown[];
  adWordsLocationExtensions?: any;
  
  // Enriched data (from separate API calls)
  photos?: unknown[];
  reviews?: unknown[];
  totalReviewCount?: number;
  averageRating?: number;
  
  // Dynamic attributes
  availableAttributes?: unknown[];
  businessAttributes?: Record<string, unknown>;
  
  // Metadata about the fetch
  fetchMetadata?: {
    fetchedAt: string;
    dataCompleteness: number; // 0-100 score
    missingData: string[];
  };
}

/**
 * Fetch all available data for a GBP location
 */
export async function fetchFullGBPData(
  locationId: string,
  options: {
    includePhotos?: boolean;
    includeReviews?: boolean;
    includeAttributes?: boolean;
    photoLimit?: number;
    reviewLimit?: number;
  } = {}
): Promise<FullGBPData> {
  const {
    includePhotos = true,
    includeReviews = true,
    includeAttributes = true,
    photoLimit = 20,
    reviewLimit = 50,
  } = options;

  try {
    logger.info('Starting full GBP data fetch', {
      metadata: { locationId, options }
    });

    // Step 1: Fetch core location data
    const locationResponse = await fetch(`/api/gbp/location/${encodeURIComponent(locationId)}`);
    if (!locationResponse.ok) {
      throw new Error('Failed to fetch location data');
    }
    const locationData = await locationResponse.json();

    // Initialize full data object
    const fullData: FullGBPData = {
      ...locationData,
      fetchMetadata: {
        fetchedAt: new Date().toISOString(),
        dataCompleteness: 0,
        missingData: [],
      },
    };

    // Step 2: Fetch enriched data in parallel
    const enrichmentPromises: Promise<void>[] = [];

    // Fetch photos and reviews
    if (includePhotos || includeReviews) {
      // Extract place ID if available
      let placeId: string | undefined;
      const placeIdMatch = locationId.match(/ChIJ[\w-]+/);
      if (placeIdMatch) {
        placeId = placeIdMatch[0];
      } else if (fullData.placeId) {
        placeId = fullData.placeId;
      }
      
      enrichmentPromises.push(
        enrichGBPLocation(locationId, {
          includePhotos,
          includeReviews,
          photoLimit,
          reviewLimit,
          placeId, // Pass place ID for fallback to Places API
        }).then(enrichedData => {
          fullData.photos = enrichedData.photos;
          fullData.reviews = enrichedData.reviews;
          fullData.totalReviewCount = enrichedData.totalReviewCount;
          fullData.averageRating = enrichedData.averageRating;
        })
      );
    }

    // Fetch category-specific attributes
    if (includeAttributes && fullData.primaryCategory) {
      const categoryId = getCategoryId(fullData.primaryCategory);
      if (categoryId) {
        enrichmentPromises.push(
          fetchCategoryAttributes(categoryId).then(attributes => {
            fullData.availableAttributes = attributes;
          })
        );
      }
    }

    // Wait for all enrichment to complete
    await Promise.all(enrichmentPromises);

    // Step 3: Calculate data completeness score
    fullData.fetchMetadata!.dataCompleteness = calculateDataCompleteness(fullData);
    fullData.fetchMetadata!.missingData = identifyMissingData(fullData);

    logger.info('Completed full GBP data fetch', {
      metadata: {
        locationId,
        dataCompleteness: fullData.fetchMetadata!.dataCompleteness,
        photosCount: fullData.photos?.length || 0,
        reviewsCount: fullData.reviews?.length || 0,
        attributesCount: fullData.availableAttributes?.length || 0,
      }
    });

    return fullData;

  } catch (error) {
    logger.error('Error fetching full GBP data', {}, error as Error);
    throw error;
  }
}

/**
 * Calculate how complete the business data is (0-100)
 */
function calculateDataCompleteness(data: FullGBPData): number {
  let score = 0;
  let maxScore = 0;

  // Core fields (40 points)
  const coreFields = [
    { field: 'name', points: 5 },
    { field: 'primaryPhone', points: 5 },
    { field: 'website', points: 5 },
    { field: 'address', points: 5 },
    { field: 'regularHours', points: 5 },
    { field: 'primaryCategory', points: 5 },
    { field: 'profile.description', points: 10 },
  ];

  coreFields.forEach(({ field, points }) => {
    maxScore += points;
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if ((data as any)[parent]?.[child]) score += points;
    } else {
      if ((data as any)[field]) score += points;
    }
  });

  // Rich content (30 points)
  maxScore += 30;
  if (data.photos && data.photos.length > 0) {
    score += Math.min(15, data.photos.length * 3); // Up to 15 points for photos
  }
  if (data.reviews && data.reviews.length > 0) {
    score += Math.min(15, data.reviews.length); // Up to 15 points for reviews
  }

  // Additional data (30 points)
  if (data.serviceItems && data.serviceItems.length > 0) score += 10;
  if (data.additionalCategories && data.additionalCategories.length > 0) score += 5;
  if (data.serviceArea) score += 5;
  if (data.labels && data.labels.length > 0) score += 5;
  if (data.availableAttributes && data.availableAttributes.length > 0) score += 5;
  maxScore += 30;

  return Math.round((score / maxScore) * 100);
}

/**
 * Identify what data is missing
 */
function identifyMissingData(data: FullGBPData): string[] {
  const missing: string[] = [];

  if (!data.name) missing.push('Business name');
  if (!data.primaryPhone) missing.push('Phone number');
  if (!data.website) missing.push('Website');
  if (!data.address || data.address === 'Address not available') missing.push('Physical address');
  if (!data.regularHours) missing.push('Business hours');
  if (!data.profile?.description) missing.push('Business description');
  if (!data.photos || data.photos.length === 0) missing.push('Business photos');
  if (!data.reviews || data.reviews.length === 0) missing.push('Customer reviews');
  if (!data.serviceItems || data.serviceItems.length === 0) missing.push('Services list');

  return missing;
}

/**
 * Batch fetch multiple locations
 */
export async function batchFetchGBPData(
  locationIds: string[],
  options: Parameters<typeof fetchFullGBPData>[1] = {}
): Promise<Record<string, FullGBPData>> {
  const results: Record<string, FullGBPData> = {};
  
  // Process in batches to avoid rate limits
  const batchSize = 3;
  for (let i = 0; i < locationIds.length; i += batchSize) {
    const batch = locationIds.slice(i, i + batchSize);
    const batchPromises = batch.map(async (locationId) => {
      try {
        const data = await fetchFullGBPData(locationId, options);
        results[locationId] = data;
      } catch (error) {
        logger.error(`Failed to fetch data for location ${locationId}`, {}, error as Error);
      }
    });
    
    await Promise.all(batchPromises);
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < locationIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}