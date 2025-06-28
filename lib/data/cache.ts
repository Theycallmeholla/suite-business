/**
 * Data Cache Utilities
 * 
 * **Created**: December 28, 2024, 4:15 PM CST
 * **Last Updated**: December 28, 2024, 4:15 PM CST
 * 
 * Caching utilities for static data files to optimize cold starts.
 */

// Declare global cache variable
declare global {
  var __expectationsCache: any;
}

/**
 * Load industry expectations data with memoization
 * 
 * This function loads the expectations JSON once per Lambda/Worker instance
 * and caches it in globalThis to avoid repeated file reads.
 * 
 * @returns Industry expectations data
 */
export function loadExpectations() {
  if (!globalThis.__expectationsCache) {
    // TODO: For Edge Functions, replace with:
    // const expectations = await import('@/lib/data/industryExpectations.json');
    globalThis.__expectationsCache = require('@/lib/data/industryExpectations.json');
  }
  return globalThis.__expectationsCache;
}

/**
 * Clear the expectations cache (mainly for testing)
 */
export function clearExpectationsCache() {
  delete globalThis.__expectationsCache;
}