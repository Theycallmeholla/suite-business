import { logger } from '@/lib/logger';
/**
 * Caching layer for GBP data collection
 * Implements the storage strategy from the document:
 * - Cache Place IDs / CIDs as primary keys
 * - Weekly SERP refresh for freshness
 * - Monthly Essentials refresh
 * - Quarterly Pro refresh
 */

export interface CacheEntry {
  data: BusinessData;
  timestamp: Date;
  refreshSchedule: {
    serp: Date;      // Weekly
    essentials: Date; // Monthly  
    pro: Date;       // Quarterly
  };
}

export interface CacheStats {
  totalEntries: number;
  bySouce: {
    gbp_api: number;
    scraping: number;
    places_essentials: number;
    places_pro: number;
  };
  avgCompleteness: number;
  estimatedValue: number; // Total $ saved by caching
}

export class GBPDataCache {
  private cache = new Map<string, CacheEntry>();
  
  constructor(private options: {
    maxAge?: number; // Default: 7 days
    autoCleanup?: boolean; // Default: true
  } = {}) {
    if (options.autoCleanup !== false) {
      // Run cleanup every hour
      setInterval(() => this.cleanup(), 3600000);
    }
  }
  
  /**
   * Get cached data if fresh enough
   */
  get(placeId: string, forceRefresh = false): BusinessData | null {
    const entry = this.cache.get(placeId);
    if (!entry) return null;
    
    if (forceRefresh) {
      this.cache.delete(placeId);
      return null;
    }
    
    // Check if data needs refresh based on source and schedule
    const now = new Date();
    const needsRefresh = this.needsRefresh(entry, now);
    
    if (needsRefresh) {
      // Return stale data but mark for refresh
      logger.info(`Cache hit but stale for ${placeId}, marking for refresh`);
      return { ...entry.data, dataCompleteness: entry.data.dataCompleteness * 0.8 };
    }
    
    return entry.data;
  }
  
  /**
   * Store data with intelligent refresh scheduling
   */
  set(placeId: string, data: BusinessData): void {
    const now = new Date();
    
    // Set refresh schedule based on data source and value
    const refreshSchedule = this.calculateRefreshSchedule(data, now);
    
    this.cache.set(placeId, {
      data,
      timestamp: now,
      refreshSchedule
    });
  }
  
  /**
   * Batch get with efficient loading
   */
  getMany(placeIds: string[]): Map<string, BusinessData | null> {
    const results = new Map<string, BusinessData | null>();
    
    for (const placeId of placeIds) {
      results.set(placeId, this.get(placeId));
    }
    
    return results;
  }
  
  /**
   * Get entries that need refresh
   */
  getStaleEntries(limit = 100): Array<{ placeId: string; data: BusinessData }> {
    const now = new Date();
    const stale: Array<{ placeId: string; data: BusinessData }> = [];
    
    for (const [placeId, entry] of this.cache) {
      if (this.needsRefresh(entry, now)) {
        stale.push({ placeId, data: entry.data });
        if (stale.length >= limit) break;
      }
    }
    
    return stale;
  }
  
  /**
   * Calculate intelligent refresh schedule based on business value
   */
  private calculateRefreshSchedule(data: BusinessData, baseTime: Date): CacheEntry['refreshSchedule'] {
    const isHighValue = (data.reviewCount || 0) > 50 || (data.rating || 0) > 4.3;
    const isTopTier = (data.reviewCount || 0) > 100 || (data.rating || 0) > 4.5;
    
    // More frequent updates for high-value businesses
    const serpInterval = isHighValue ? 3 : 7; // 3 or 7 days
    const essentialsInterval = isTopTier ? 14 : 30; // 2 weeks or monthly
    const proInterval = 90; // Always quarterly for Pro
    
    return {
      serp: new Date(baseTime.getTime() + serpInterval * 24 * 60 * 60 * 1000),
      essentials: new Date(baseTime.getTime() + essentialsInterval * 24 * 60 * 60 * 1000),
      pro: new Date(baseTime.getTime() + proInterval * 24 * 60 * 60 * 1000)
    };
  }
  
  /**
   * Check if entry needs refresh based on data source
   */
  private needsRefresh(entry: CacheEntry, now: Date): boolean {
    switch (entry.data.dataSource) {
      case 'gbp_api':
        // GBP API data is most current, refresh weekly
        return now > entry.refreshSchedule.serp;
        
      case 'scraping':
        // Scraped data gets stale faster
        return now > entry.refreshSchedule.serp;
        
      case 'places_essentials':
        // Essentials data is fairly stable
        return now > entry.refreshSchedule.essentials;
        
      case 'places_pro':
        // Pro data with reviews/photos can be cached longer
        return now > entry.refreshSchedule.pro;
        
      default:
        return true;
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const bySource = {
      gbp_api: 0,
      scraping: 0,
      places_essentials: 0,
      places_pro: 0
    };
    
    let totalCompleteness = 0;
    let estimatedValue = 0;
    
    for (const entry of this.cache.values()) {
      bySource[entry.data.dataSource]++;
      totalCompleteness += entry.data.dataCompleteness;
      
      // Calculate value saved by caching
      switch (entry.data.dataSource) {
        case 'scraping':
          estimatedValue += 0.01;
          break;
        case 'places_essentials':
          estimatedValue += 0.005;
          break;
        case 'places_pro':
          estimatedValue += 0.017;
          break;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      bySouce: bySource,
      avgCompleteness: this.cache.size > 0 ? totalCompleteness / this.cache.size : 0,
      estimatedValue
    };
  }
  
  /**
   * Export cache for persistence
   */
  export(): string {
    const entries: Array<[string, CacheEntry]> = Array.from(this.cache.entries());
    return JSON.stringify(entries, null, 2);
  }
  
  /**
   * Import cache from persistence
   */
  import(data: string): void {
    try {
      const entries: Array<[string, CacheEntry]> = JSON.parse(data);
      
      for (const [placeId, entry] of entries) {
        // Convert date strings back to Date objects
        entry.timestamp = new Date(entry.timestamp);
        entry.refreshSchedule = {
          serp: new Date(entry.refreshSchedule.serp),
          essentials: new Date(entry.refreshSchedule.essentials),
          pro: new Date(entry.refreshSchedule.pro)
        };
        entry.data.lastUpdated = new Date(entry.data.lastUpdated);
        
        this.cache.set(placeId, entry);
      }
    } catch (error) {
      logger.error('Failed to import cache:', error);
    }
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const maxAge = this.options.maxAge || 7 * 24 * 60 * 60 * 1000; // 7 days
    const now = new Date();
    const cutoff = new Date(now.getTime() - maxAge);
    
    let removed = 0;
    for (const [placeId, entry] of this.cache) {
      if (entry.timestamp < cutoff) {
        this.cache.delete(placeId);
        removed++;
      }
    }
    
    if (removed > 0) {
      logger.info(`Cache cleanup: removed ${removed} expired entries`);
    }
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
}

/**
 * Persistent cache using file system or database
 */
export class PersistentGBPCache extends GBPDataCache {
  constructor(
    private storageAdapter: {
      read: () => Promise<string | null>;
      write: (data: string) => Promise<void>;
    },
    options?: ConstructorParameters<typeof GBPDataCache>[0]
  ) {
    super(options);
    this.load();
  }
  
  private async load(): Promise<void> {
    try {
      const data = await this.storageAdapter.read();
      if (data) {
        this.import(data);
        const stats = this.getStats();
        logger.info(`Loaded cache with ${stats.totalEntries} entries, saved $${stats.estimatedValue.toFixed(2)}`);
      }
    } catch (error) {
      logger.error('Failed to load cache:', error);
    }
  }
  
  async save(): Promise<void> {
    try {
      const data = this.export();
      await this.storageAdapter.write(data);
    } catch (error) {
      logger.error('Failed to save cache:', error);
    }
  }
  
  // Override set to auto-save
  set(placeId: string, data: BusinessData): void {
    super.set(placeId, data);
    this.save(); // Debounce this in production
  }
}

/**
 * File system storage adapter
 */
export function createFileStorageAdapter(filePath: string) {
  return {
    read: async () => {
      try {
        const fs = await import('fs/promises');
        return await fs.readFile(filePath, 'utf-8');
      } catch (error) {
        if ((error as any).code === 'ENOENT') return null;
        throw error;
      }
    },
    write: async (data: string) => {
      const fs = await import('fs/promises');
      await fs.writeFile(filePath, data, 'utf-8');
    }
  };
}
