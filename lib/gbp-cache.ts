// Shared cache for Google Business Profile data
export const gbpLocationsCache = new Map<string, { data: any; timestamp: number }>();
export const GBP_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function getCacheKey(userId: string, accountId: string) {
  return `locations_${userId}_${accountId}`;
}

export function getFromCache(key: string) {
  const cached = gbpLocationsCache.get(key);
  if (cached && Date.now() - cached.timestamp < GBP_CACHE_TTL) {
    return cached;
  }
  return null;
}

export function setInCache(key: string, data: any) {
  gbpLocationsCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}