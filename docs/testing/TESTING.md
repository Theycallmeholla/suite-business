# Testing Guide

**Created**: June 25, 2025, 1:45 AM CST

## Overview

This project uses Jest for unit/integration testing and Playwright for end-to-end testing.

## Running Tests

### Unit Tests (Jest)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:auth      # Authentication tests
npm run test:tenant    # Multi-tenant tests
npm run test:ghl       # GoHighLevel integration tests
npm run test:gbp       # Google Business Profile tests
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/auth-flow.spec.ts

# Run in debug mode
npx playwright test --debug
```

## Test Structure

### Unit Tests (`__tests__/`)
- `__tests__/api/` - API route tests
- `__tests__/auth/` - Authentication tests
- `__tests__/integration/` - Integration tests
- `__tests__/tenant/` - Multi-tenant isolation tests
- `__tests__/utils/` - Utility function tests

### E2E Tests (`e2e/`)
- `e2e/onboarding.spec.ts` - Onboarding flow tests
- `e2e/auth-flow.spec.ts` - Authentication flow tests

## Writing Tests

### Unit Test Example
```typescript
import { POST } from '@/app/api/ghl/webhook/route';

describe('GHL Webhook Handler', () => {
  it('should handle contact creation', async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('should display sign in page', async ({ page }) => {
  await page.goto('/signin');
  await expect(page).toHaveTitle(/Sign In/);
});
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Test environment: `jest-environment-jsdom`
- Module aliases: `@/` maps to root directory
- Coverage thresholds: Currently set to 0% (should be increased)

### Playwright Configuration (`playwright.config.ts`)
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, WebKit
- Parallel execution enabled
- Automatic dev server startup

## Mocking

### Common Mocks (in `jest.setup.js`)
- Next.js router and navigation
- Prisma client
- Logger
- Fetch API
- Window.matchMedia

### Creating New Mocks
```typescript
jest.mock('@/lib/email', () => ({
  emailService: {
    sendEmail: jest.fn(),
  },
}));
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External Services**: Don't make real API calls
3. **Use Data Builders**: Create test data factories
4. **Test User Journeys**: Focus on real user scenarios
5. **Keep Tests Fast**: Mock heavy operations
6. **Clear Test Names**: Describe what the test verifies

## Debugging Tests

### Jest
```bash
# Run specific test file
npx jest __tests__/api/ghl-webhook.test.ts

# Run tests matching pattern
npx jest --testNamePattern="should handle contact creation"

# Debug in VS Code
# Add breakpoint and use "Jest: Debug" command
```

### Playwright
```bash
# Debug mode with Playwright Inspector
npx playwright test --debug

# Headed mode (see browser)
npx playwright test --headed

# Slow down execution
npx playwright test --slow-mo=1000
```

## CI/CD Integration

Tests are configured to run in CI with:
- Retries on failure (2 attempts)
- Single worker to avoid flakiness
- HTML report generation

## Next Steps

1. **Increase Coverage**: Add tests for all critical paths
2. **Add Visual Testing**: Implement screenshot comparison
3. **Performance Testing**: Add Lighthouse integration
4. **API Contract Testing**: Validate API responses
5. **Accessibility Testing**: Add axe-core integration