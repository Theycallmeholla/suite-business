# Enhanced Site Generation - Critical Action Items

## P0 - Must Fix Before Production (Day 1)

### 1. Environment Variables
Add to `.env.local`:
```bash
# Feature flags
USE_ENHANCED_GENERATION=true
ENHANCED_ROLLOUT_PERCENTAGE=10
NEXT_PUBLIC_USE_ENHANCED_GENERATION=true

# DataForSEO (optional - will use mock data if not set)
DATAFORSEO_LOGIN=your_login_here
DATAFORSEO_PASSWORD=your_password_here

# Google Maps (required for testing with real place data)
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 2. Add Error Boundaries to Components
Create `/components/enhanced/ErrorBoundary.tsx`:
```typescript
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export class QuestionErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Something went wrong. Please refresh and try again.
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

### 3. Add Input Validation
In `/app/api/sites/create-from-gbp-enhanced/route.ts`, add:
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user answers
const sanitizedAnswers = Object.entries(userAnswers || {}).reduce((acc, [key, value]) => {
  if (typeof value === 'string') {
    acc[key] = DOMPurify.sanitize(value);
  } else {
    acc[key] = value;
  }
  return acc;
}, {} as Record<string, any>);
```

### 4. Add Rate Limiting
Create `/lib/middleware/rate-limit.ts`:
```typescript
import { RateLimiter } from 'limiter';

const limiters = new Map();

export function getRateLimiter(key: string, tokensPerInterval = 100, interval = 'minute') {
  if (!limiters.has(key)) {
    limiters.set(key, new RateLimiter({ tokensPerInterval, interval }));
  }
  return limiters.get(key);
}

export async function checkRateLimit(userId: string): Promise<boolean> {
  const limiter = getRateLimiter(`api:${userId}`);
  return await limiter.tryRemoveTokens(1);
}
```

### 5. Fix Type Safety Issues
Replace all `any` types in:
- `/components/enhanced/*.tsx` - Define proper interfaces
- `/app/(app)/dashboard/sites/create-enhanced/page.tsx` - Use question type unions
- API responses - Create DTOs

## P1 - Complete Within 48 Hours

### 1. Add Unit Tests
Create test files:
- `/lib/content-generation/__tests__/multi-source-data-evaluator.test.ts`
- `/lib/content-generation/__tests__/intelligent-question-generator.test.ts`
- `/components/enhanced/__tests__/*.test.tsx`

### 2. Complete Industry Support
Create missing populators:
- `/lib/content-generation/industry-populators/enhanced-roofing-populator.ts`
- `/lib/content-generation/industry-populators/enhanced-electrical-populator.ts`

### 3. Add Monitoring
Install and configure:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 4. Implement Caching
Add to `/lib/integrations/dataforseo-client.ts`:
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Add cache invalidation
async invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

## P2 - Nice to Have (Week 2)

### 1. A/B Testing Framework
- Implement feature flag service (LaunchDarkly/Unleash)
- Track conversion metrics
- Create experiment dashboard

### 2. Performance Optimization
- Implement API response caching
- Add CDN for static assets
- Optimize image loading with next/image

### 3. Advanced Analytics
- User journey tracking
- Conversion funnel analysis
- Satisfaction surveys

## Testing Checklist

### Manual Testing
- [ ] Create site with standard flow
- [ ] Create site with enhanced flow
- [ ] Test all 4 question component types
- [ ] Test error states
- [ ] Test mobile responsiveness
- [ ] Test with slow network

### Automated Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests cover enhanced flow
- [ ] Performance benchmarks met

## Rollout Strategy

### Phase 1 (Day 1-3)
- Fix P0 issues
- Internal testing with team
- Monitor error rates

### Phase 2 (Day 4-7)
- 10% rollout to beta users
- Collect feedback
- Fix any issues

### Phase 3 (Week 2)
- 50% rollout
- A/B test metrics
- Iterate based on data

### Phase 4 (Week 3)
- 100% rollout
- Deprecate old flow
- Celebrate! 🎉

---
Remember: The goal is 85%+ completion rate with <3 minute average time!