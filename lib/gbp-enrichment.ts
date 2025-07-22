import { logger } from '@/lib/logger';
/**
 * Google Business Profile Data Enrichment
 * 
 * This module provides functions to fetch additional data
 * that requires separate API calls (photos, reviews, etc.)
 */

export interface GBPPhoto {
  name: string;
  mediaFormat: string;
  googleUrl: string;
  thumbnailUrl: string;
  description?: string;
  locationAssociation?: any;
  createTime?: string;
  dimensions?: {
    widthPixels: number;
    heightPixels: number;
  };
}

export interface GBPReview {
  reviewId: string;
  reviewer: {
    displayName?: string;
    profilePhotoUrl?: string;
    isAnonymous?: boolean;
  };
  starRating: string;
  comment?: string;
  createTime: string;
  updateTime?: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export interface EnrichedGBPData {
  photos: GBPPhoto[];
  reviews: GBPReview[];
  totalReviewCount: number;
  averageRating: number;
  hasMorePhotos: boolean;
  hasMoreReviews: boolean;
}

/**
 * Fetch photos for a GBP location
 */
export async function fetchLocationPhotos(
  locationId: string,
  limit: number = 10
): Promise<{ photos: GBPPhoto[], hasMore: boolean }> {
  try {
    const response = await fetch(`/api/gbp/location/${encodeURIComponent(locationId)}/photos?pageSize=${limit}`);
    
    if (!response.ok) {
      const error = await response.json();
      logger.error('Failed to fetch location photos', { metadata: error });
      return { photos: [], hasMore: false };
    }
    
    const data = await response.json() as unknown;
    return {
      photos: data.photos || [],
      hasMore: !!data.nextPageToken
    };
  } catch (error) {
    logger.error('Error fetching location photos', {}, error as Error);
    return { photos: [], hasMore: false };
  }
}

/**
 * Fetch reviews for a GBP location
 */
export async function fetchLocationReviews(
  locationId: string,
  limit: number = 20
): Promise<{ 
  reviews: GBPReview[], 
  totalCount: number, 
  averageRating: number,
  hasMore: boolean 
}> {
  try {
    const response = await fetch(`/api/gbp/location/${encodeURIComponent(locationId)}/reviews?pageSize=${limit}`);
    
    if (!response.ok) {
      const error = await response.json();
      logger.error('Failed to fetch location reviews', { metadata: error });
      return { reviews: [], totalCount: 0, averageRating: 0, hasMore: false };
    }
    
    const data = await response.json() as unknown;
    return {
      reviews: data.reviews || [],
      totalCount: data.totalReviewCount || 0,
      averageRating: data.averageRating || 0,
      hasMore: !!data.nextPageToken
    };
  } catch (error) {
    logger.error('Error fetching location reviews', {}, error as Error);
    return { reviews: [], totalCount: 0, averageRating: 0, hasMore: false };
  }
}

/**
 * Enrich a GBP location with additional data
 */
export async function enrichGBPLocation(
  locationId: string,
  options: {
    includePhotos?: boolean;
    includeReviews?: boolean;
    photoLimit?: number;
    reviewLimit?: number;
    placeId?: string; // Optional place ID for fallback
  } = {}
): Promise<EnrichedGBPData> {
  const {
    includePhotos = true,
    includeReviews = true,
    photoLimit = 10,
    reviewLimit = 20,
    placeId,
  } = options;

  const enrichedData: EnrichedGBPData = {
    photos: [],
    reviews: [],
    totalReviewCount: 0,
    averageRating: 0,
    hasMorePhotos: false,
    hasMoreReviews: false,
  };

  // Fetch data in parallel for better performance
  const promises: Promise<void>[] = [];

  if (includePhotos) {
    promises.push(
      fetchLocationPhotos(locationId, photoLimit).then(async ({ photos, hasMore }) => {
        enrichedData.photos = photos;
        enrichedData.hasMorePhotos = hasMore;
        
        // If no photos from GBP and we have a place ID, try Places API
        if (photos.length === 0 && placeId) {
          logger.info('No photos from GBP, trying Places API', { metadata: { placeId } });
          const placesPhotos = await fetchPlacesPhotos(placeId, photoLimit);
          enrichedData.photos = placesPhotos;
        }
      })
    );
  }

  if (includeReviews) {
    promises.push(
      fetchLocationReviews(locationId, reviewLimit).then(async ({ reviews, totalCount, averageRating, hasMore }) => {
        enrichedData.reviews = reviews;
        enrichedData.totalReviewCount = totalCount;
        enrichedData.averageRating = averageRating;
        enrichedData.hasMoreReviews = hasMore;
        
        // If no reviews from GBP and we have a place ID, try Places API
        if (reviews.length === 0 && placeId) {
          logger.info('No reviews from GBP, trying Places API', { metadata: { placeId } });
          const placesData = await fetchPlacesReviews(placeId, reviewLimit);
          enrichedData.reviews = placesData.reviews;
          enrichedData.totalReviewCount = placesData.totalCount;
          enrichedData.averageRating = placesData.averageRating;
        }
      })
    );
  }

  await Promise.all(promises);

  logger.info('Enriched GBP location data', {
    metadata: {
      locationId,
      photosFound: enrichedData.photos.length,
      reviewsFound: enrichedData.reviews.length,
      averageRating: enrichedData.averageRating,
      usedPlacesAPI: placeId && (enrichedData.photos.length > 0 || enrichedData.reviews.length > 0),
    }
  });

  return enrichedData;
}

/**
 * Fetch photos from Google Places API
 */
async function fetchPlacesPhotos(placeId: string, limit: number): Promise<GBPPhoto[]> {
  try {
    const response = await fetch('/api/places/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        placeId,
        fields: 'photos,displayName',
      }),
    });

    if (!response.ok) {
      logger.error('Failed to fetch photos from Places API', { 
        metadata: { placeId, status: response.status } 
      });
      return [];
    }

    const data = await response.json() as unknown;
    // Transform Places API photos to GBP photo format
    return (data.photos || []).slice(0, limit).map((photo: any) => ({
      name: photo.name,
      mediaFormat: 'PHOTO',
      googleUrl: photo.mediaUrl,
      thumbnailUrl: photo.thumbnailUrl,
      description: photo.description,
      dimensions: photo.widthPx && photo.heightPx ? {
        widthPixels: photo.widthPx,
        heightPixels: photo.heightPx,
      } : undefined,
    }));
  } catch (error) {
    logger.error('Error fetching photos from Places API', {}, error as Error);
    return [];
  }
}

/**
 * Fetch reviews from Google Places API
 */
async function fetchPlacesReviews(placeId: string, limit: number): Promise<{
  reviews: GBPReview[];
  totalCount: number;
  averageRating: number;
}> {
  try {
    const response = await fetch('/api/places/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        placeId,
        fields: 'reviews,rating,user_ratings_total',
      }),
    });

    if (!response.ok) {
      logger.error('Failed to fetch reviews from Places API', { 
        metadata: { placeId, status: response.status } 
      });
      return { reviews: [], totalCount: 0, averageRating: 0 };
    }

    const data = await response.json() as unknown;
    // Transform Places API reviews to GBP review format
    const reviews = (data.reviews || []).slice(0, limit).map((review: any) => ({
      reviewId: review.reviewId,
      reviewer: review.reviewer,
      starRating: review.starRating,
      comment: review.comment,
      createTime: review.createTime,
      updateTime: review.updateTime,
    }));

    return {
      reviews,
      totalCount: data.userRatingsTotal || 0,
      averageRating: data.rating || 0,
    };
  } catch (error) {
    logger.error('Error fetching reviews from Places API', {}, error as Error);
    return { reviews: [], totalCount: 0, averageRating: 0 };
  }
}

/**
 * Extract key insights from reviews
 */
export function extractReviewInsights(reviews: GBPReview[]): {
  strengths: string[];
  weaknesses: string[];
  commonThemes: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
} {
  // This is a simplified version - in production, you'd use NLP
  const ratingMap: Record<string, number> = {
    'FIVE': 5,
    'FOUR': 4,
    'THREE': 3,
    'TWO': 2,
    'ONE': 1,
  };

  const totalRating = reviews.reduce((sum, review) => {
    return sum + (ratingMap[review.starRating] || 0);
  }, 0);

  const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  // Determine overall sentiment
  const sentiment = avgRating >= 4 ? 'positive' : 
                   avgRating >= 3 ? 'neutral' : 'negative';

  // Extract themes from comments (simplified)
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const commonThemes: string[] = [];

  reviews.forEach(review => {
    if (!review.comment) return;
    
    const rating = ratingMap[review.starRating] || 0;
    const comment = review.comment.toLowerCase();
    
    // Positive indicators
    if (rating >= 4) {
      if (comment.includes('professional')) strengths.push('Professional service');
      if (comment.includes('quality')) strengths.push('High quality work');
      if (comment.includes('friendly')) strengths.push('Friendly staff');
      if (comment.includes('recommend')) strengths.push('Highly recommended');
      if (comment.includes('time')) strengths.push('Punctual and reliable');
    }
    
    // Negative indicators
    if (rating <= 2) {
      if (comment.includes('late') || comment.includes('delay')) weaknesses.push('Punctuality issues');
      if (comment.includes('expensive') || comment.includes('price')) weaknesses.push('Pricing concerns');
      if (comment.includes('communication')) weaknesses.push('Communication problems');
    }
  });

  // Remove duplicates
  return {
    strengths: [...new Set(strengths)],
    weaknesses: [...new Set(weaknesses)],
    commonThemes: [...new Set(commonThemes)],
    sentiment,
  };
}