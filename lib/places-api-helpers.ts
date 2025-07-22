import { logger } from '@/lib/logger';
import { useState } from 'react';
// Helper functions to handle Place ID refresh in your components

interface PlaceSearchResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  types?: string[];
  priceLevel?: number;
  websiteUri?: string;
  regularOpeningHours?: any;
  nationalPhoneNumber?: string;
  primaryType?: string;
}

interface NearbySearchOptions {
  location: { lat: number; lng: number };
  radius: number;
  types?: string[];
  keyword?: string;
  maxResultCount?: number;
}

interface CategorySearchOptions {
  location: { lat: number; lng: number };
  radius: number;
  primaryType: string;
  minRating?: number;
  priceLevels?: number[];
  maxResultCount?: number;
}

/**
 * Search for a place and get a fresh Place ID
 */
export async function refreshPlaceId(
  businessName: string,
  businessAddress?: string,
  location?: { lat: number; lng: number }
): Promise<PlaceSearchResult | null> {
  try {
    const searchQuery = businessAddress 
      ? `${businessName} ${businessAddress}`
      : businessName;

    const searchBody: any = {
      textQuery: searchQuery,
      maxResultCount: 1,
    };

    // Add location bias if available
    if (location) {
      searchBody.locationBias = {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng
          },
          radius: 10000 // 10km radius
        }
      };
    }

    const response = await fetch('/api/places/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchBody)
    });

    if (!response.ok) {
      logger.error('Failed to search for place');
      return null;
    }

    const data = await response.json() as unknown;
    if (data.places && data.places.length > 0) {
      return data.places[0];
    }

    return null;
  } catch (error) {
    logger.error('Error refreshing Place ID:', error);
    return null;
  }
}

/**
 * Fetch place details with automatic Place ID refresh on failure
 */
export async function fetchPlaceDetailsWithRefresh(
  placeId: string,
  businessName: string,
  businessAddress?: string,
  fields?: string
): Promise<unknown> {
  try {
    // First, try with the existing Place ID
    const response = await fetch('/api/places/details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeId,
        fields: fields || 'displayName,rating,userRatingCount,photos,reviews,formattedAddress'
      })
    });

    const data = await response.json() as unknown;

    // If Place ID is invalid, try to refresh it
    if (response.status === 404 && data.code === 'INVALID_PLACE_ID') {
      logger.info('Place ID is invalid, searching for updated ID...');
      
      const newPlace = await refreshPlaceId(businessName, businessAddress);
      
      if (newPlace) {
        logger.info('Found new Place ID:', newPlace.placeId);
        
        // Retry with the new Place ID
        const retryResponse = await fetch('/api/places/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placeId: newPlace.placeId,
            fields: fields || 'displayName,rating,userRatingCount,photos,reviews,formattedAddress'
          })
        });

        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          // Include the new Place ID in the response
          return {
            ...retryData,
            refreshedPlaceId: newPlace.placeId,
            placeIdWasRefreshed: true
          };
        }
      }
      
      throw new Error('Unable to find valid Place ID for this business');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch place details');
    }

    return data;
  } catch (error) {
    logger.error('Error fetching place details:', error);
    throw error;
  }
}

/**
 * Example usage in a React component
 */
/*
const MyComponent = () => {
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPlaceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchPlaceDetailsWithRefresh(
        savedPlaceId, // Your stored Place ID
        businessName,
        businessAddress
      );
      
      setPlaceData(data);
      
      // If Place ID was refreshed, update your stored ID
      if (data.placeIdWasRefreshed) {
        // Update your database/state with data.refreshedPlaceId
        await updateStoredPlaceId(data.refreshedPlaceId);
      }
    } catch {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Loading place data...</p>}
      {error && <p>Error: {error}</p>}
      {placeData && (
        <div>
          <h2>{placeData.name}</h2>
          <p>Rating: {placeData.rating} ({placeData.userRatingCount} reviews)</p>
          {placeData.placeIdWasRefreshed && (
            <p className="text-yellow-600">
              ⚠️ Place ID was updated
            </p>
          )}
        </div>
      )}
    </div>
  );
};
*/

/**
 * Search for nearby businesses by type/category
 * Useful for competitor analysis and market research
 */
export async function searchNearbyBusinesses(
  options: NearbySearchOptions
): Promise<PlaceSearchResult[]> {
  try {
    const searchBody: any = {
      locationRestriction: {
        circle: {
          center: {
            latitude: options.location.lat,
            longitude: options.location.lng
          },
          radius: options.radius
        }
      },
      maxResultCount: options.maxResultCount || 20,
      rankPreference: 'DISTANCE',
    };

    // Add type filters if specified
    if (options.types && options.types.length > 0) {
      searchBody.includedTypes = options.types;
    }

    // Add keyword search if specified
    if (options.keyword) {
      searchBody.textQuery = options.keyword;
    }

    const response = await fetch('/api/places/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchBody)
    });

    if (!response.ok) {
      logger.error('Failed to search nearby businesses');
      return [];
    }

    const data = await response.json();
    return data.places || [];
  } catch (error) {
    logger.error('Error searching nearby businesses:', error);
    return [];
  }
}

/**
 * Search for competitors in a specific category
 * Returns businesses sorted by rating and review count
 */
export async function searchCompetitors(
  options: CategorySearchOptions
): Promise<PlaceSearchResult[]> {
  try {
    const searchBody: any = {
      locationRestriction: {
        circle: {
          center: {
            latitude: options.location.lat,
            longitude: options.location.lng
          },
          radius: options.radius
        }
      },
      includedTypes: [options.primaryType],
      maxResultCount: options.maxResultCount || 20,
      rankPreference: 'RELEVANCE',
    };

    // Add rating filter if specified
    if (options.minRating) {
      searchBody.minRating = options.minRating;
    }

    // Add price level filter if specified
    if (options.priceLevels && options.priceLevels.length > 0) {
      searchBody.priceLevels = options.priceLevels;
    }

    const response = await fetch('/api/places/search', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchBody)
    });

    if (!response.ok) {
      logger.error('Failed to search competitors');
      return [];
    }

    const data = await response.json();
    const places = data.places || [];

    // Sort by rating and review count for better competitor analysis
    return places.sort((a: PlaceSearchResult, b: PlaceSearchResult) => {
      const scoreA = (a.rating || 0) * Math.log((a.userRatingCount || 0) + 1);
      const scoreB = (b.rating || 0) * Math.log((b.userRatingCount || 0) + 1);
      return scoreB - scoreA;
    });
  } catch (error) {
    logger.error('Error searching competitors:', error);
    return [];
  }
}

/**
 * Get detailed information about multiple places in one request
 * Useful for analyzing competitors or collecting market data
 */
export async function getBulkPlaceDetails(
  placeIds: string[],
  fields?: string
): Promise<Map<string, any>> {
  const results = new Map<string, any>();
  
  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < placeIds.length; i += batchSize) {
    const batch = placeIds.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (placeId) => {
        try {
          const response = await fetch('/api/places/details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              placeId,
              fields: fields || 'displayName,rating,userRatingCount,websiteUri,nationalPhoneNumber,regularOpeningHours,reviews,photos,priceLevel,types,primaryType'
            })
          });

          if (response.ok) {
            const data = await response.json();
            results.set(placeId, data);
          }
        } catch (error) {
          logger.error(`Failed to get details for place ${placeId}:`, error);
        }
      })
    );
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < placeIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Analyze market saturation for a business type in an area
 */
export async function analyzeMarketSaturation(
  location: { lat: number; lng: number },
  businessType: string,
  radius: number = 5000
): Promise<{
  totalBusinesses: number;
  averageRating: number;
  topCompetitors: PlaceSearchResult[];
  saturationScore: number; // 0-100, higher means more saturated
}> {
  try {
    const competitors = await searchCompetitors({
      location,
      radius,
      primaryType: businessType,
      maxResultCount: 50
    });

    if (competitors.length === 0) {
      return {
        totalBusinesses: 0,
        averageRating: 0,
        topCompetitors: [],
        saturationScore: 0
      };
    }

    // Calculate average rating
    const totalRating = competitors.reduce((sum, c) => sum + (c.rating || 0), 0);
    const averageRating = totalRating / competitors.filter(c => c.rating).length;

    // Calculate saturation score (0-100)
    // Based on number of businesses and average rating
    const densityScore = Math.min(competitors.length / 20, 1) * 50; // 50 points for density
    const qualityScore = (averageRating / 5) * 50; // 50 points for quality
    const saturationScore = Math.round(densityScore + qualityScore);

    return {
      totalBusinesses: competitors.length,
      averageRating: Math.round(averageRating * 10) / 10,
      topCompetitors: competitors.slice(0, 5),
      saturationScore
    };
  } catch (error) {
    logger.error('Error analyzing market saturation:', error);
    throw error;
  }
}

/**
 * Find businesses without websites (potential leads)
 */
export async function findBusinessesWithoutWebsites(
  location: { lat: number; lng: number },
  businessType: string,
  radius: number = 5000
): Promise<PlaceSearchResult[]> {
  try {
    const businesses = await searchCompetitors({
      location,
      radius,
      primaryType: businessType,
      maxResultCount: 50
    });

    // Get detailed info for all businesses
    const placeIds = businesses.map(b => b.placeId);
    const detailedInfo = await getBulkPlaceDetails(placeIds);

    // Filter businesses without websites
    return businesses.filter(business => {
      const details = detailedInfo.get(business.placeId);
      return details && !details.websiteUri;
    });
  } catch (error) {
    logger.error('Error finding businesses without websites:', error);
    return [];
  }
}
