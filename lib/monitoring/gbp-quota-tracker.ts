// Simple quota tracking for Google Business Profile API
interface ApiCall {
  timestamp: number;
  endpoint: string;
  userId: string;
  success: boolean;
  error?: string;
}

class GBPQuotaTracker {
  private static instance: GBPQuotaTracker;
  private calls: ApiCall[] = [];
  private readonly MAX_HISTORY = 1000;

  private constructor() {}

  static getInstance(): GBPQuotaTracker {
    if (!GBPQuotaTracker.instance) {
      GBPQuotaTracker.instance = new GBPQuotaTracker();
    }
    return GBPQuotaTracker.instance;
  }

  recordCall(endpoint: string, userId: string, success: boolean, error?: string) {
    const call: ApiCall = {
      timestamp: Date.now(),
      endpoint,
      userId,
      success,
      error
    };

    this.calls.push(call);
    
    // Keep only recent calls
    if (this.calls.length > this.MAX_HISTORY) {
      this.calls = this.calls.slice(-this.MAX_HISTORY);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[GBP API Call]', {
        endpoint,
        userId,
        success,
        error,
        dailyCount: this.getDailyCount(),
        minuteCount: this.getMinuteCount()
      });
    }
  }

  getDailyCount(): number {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return this.calls.filter(call => call.timestamp > oneDayAgo && call.success).length;
  }

  getMinuteCount(): number {
    const oneMinuteAgo = Date.now() - (60 * 1000);
    return this.calls.filter(call => call.timestamp > oneMinuteAgo && call.success).length;
  }

  getQuotaStatus() {
    const dailyCount = this.getDailyCount();
    const minuteCount = this.getMinuteCount();
    
    return {
      daily: {
        used: dailyCount,
        limit: 1000, // Default GBP quota
        percentage: (dailyCount / 1000) * 100,
        remaining: Math.max(0, 1000 - dailyCount)
      },
      perMinute: {
        used: minuteCount,
        limit: 10, // Default GBP per-minute quota
        percentage: (minuteCount / 10) * 100,
        remaining: Math.max(0, 10 - minuteCount)
      }
    };
  }

  getRecentErrors(): ApiCall[] {
    return this.calls
      .filter(call => !call.success && call.error)
      .slice(-10); // Last 10 errors
  }
}

export const gbpQuotaTracker = GBPQuotaTracker.getInstance();
