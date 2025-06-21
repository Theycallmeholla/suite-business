// Google API Utilities for handling quotas and rate limits

import { NextResponse } from 'next/server';

export interface RateLimitInfo {
  count: number;
  resetTime: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Google API Quota Information
 * Source: https://developers.google.com/my-business/reference/quota
 */
export const GOOGLE_API_QUOTAS = {
  // Requests per minute
  ACCOUNT_MANAGEMENT: 10,
  BUSINESS_INFORMATION: 10,
  // Daily quotas
  DAILY_REQUESTS: 10000,
};

/**
 * Create a rate limiter for Google APIs
 */
export class GoogleApiRateLimiter {
  private rateLimits = new Map<string, RateLimitInfo>();
  private cache = new Map<string, CacheEntry<any>>();
  
  constructor(
    private maxRequests: number = GOOGLE_API_QUOTAS.ACCOUNT_MANAGEMENT,
    private windowMs: number = 60 * 1000, // 1 minute
    private cacheTtlMs: number = 5 * 60 * 1000 // 5 minutes
  ) {}

  /**
   * Check if request is allowed under rate limit
   */
  isAllowed(key: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const limit = this.rateLimits.get(key);
    
    if (!limit || now >= limit.resetTime) {
      // New window or expired window
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return { allowed: true };
    }
    
    if (limit.count >= this.maxRequests) {
      const retryAfter = Math.ceil((limit.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }
    
    limit.count++;
    return { allowed: true };
  }

  /**
   * Get cached data if available
   */
  getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached || Date.now() - cached.timestamp > this.cacheTtlMs) {
      return null;
    }
    return cached.data;
  }

  /**
   * Set cache data
   */
  setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear expired cache entries
   */
  cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheTtlMs) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Handle Google API errors consistently
 */
export function handleGoogleApiError(error: any, userId?: string, rateLimiter?: GoogleApiRateLimiter) {
  console.error('Google API Error:', error);
  
  const errorMessage = error?.message || String(error);
  const errorCode = error?.code || error?.response?.status;

  // API not enabled
  if (errorCode === 403 && errorMessage.includes('has not been used in project')) {
    return NextResponse.json(
      {
        error: 'Google Business Profile API is not enabled',
        details: 'Please enable the required APIs in Google Cloud Console.',
        enableUrl: 'https://console.cloud.google.com/apis/library',
      },
      { status: 403 }
    );
  }

  // Quota exceeded
  if (errorCode === 429 || errorMessage.includes('Quota exceeded')) {
    // Try to return cached data if available
    if (userId && rateLimiter) {
      const cached = rateLimiter.getCached(userId);
      if (cached) {
        return NextResponse.json({
          ...cached,
          warning: 'API quota exceeded. Showing cached data.',
          cachedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json(
      {
        error: 'API quota exceeded',
        details: 'Google API quota limit reached. Please try again later.',
        retryAfter: 60,
      },
      { status: 429 }
    );
  }

  // Authentication errors
  if (errorMessage.includes('invalid_grant') || errorMessage.includes('Token has been expired')) {
    return NextResponse.json(
      { error: 'Google authentication expired. Please sign in again.' },
      { status: 401 }
    );
  }

  // Access denied
  if (errorCode === 403) {
    return NextResponse.json(
      { error: 'Access denied to Google Business Profile' },
      { status: 403 }
    );
  }

  // Generic error
  return NextResponse.json(
    {
      error: 'Failed to access Google API',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    },
    { status: 500 }
  );
}

/**
 * Exponential backoff for retrying requests
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (
        error?.code === 403 ||
        error?.code === 401 ||
        error?.message?.includes('invalid_grant')
      ) {
        throw error;
      }
      
      // Exponential backoff
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}