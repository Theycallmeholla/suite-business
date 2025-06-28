# Enhanced Site Generation Test Suite

**Created**: December 28, 2024, 5:15 PM CST  
**Last Updated**: December 28, 2024, 5:15 PM CST

## 🎯 Overview

Comprehensive test suite for the Enhanced Site Generation system that validates the question reduction from 50+ to 6-9 questions while maintaining high-quality site output.

## 📁 Test Structure

```
tests/
├── integration/          # API integration tests
│   └── enhanced-generation/
│       └── api.test.ts
├── data-quality/        # Data scoring and evaluation tests
│   └── scoring.test.ts
├── performance/         # Performance benchmark tests
│   └── benchmarks.test.ts
├── e2e/                # End-to-end user journey tests
│   └── enhanced-generation/
│       └── user-journey.spec.ts
├── visual/             # Visual regression tests
│   └── question-components.spec.ts
├── utils/              # Test utilities and helpers
│   ├── test-data-factory.ts
│   ├── api-mocks.ts
│   ├── custom-matchers.ts
│   └── test-reporter.ts
└── run-enhanced-tests.ts  # Test orchestration script
```

## 🚀 Running Tests

### Run All Tests
```bash
npm run test:enhanced
# or
npx tsx tests/run-enhanced-tests.ts
```

### Run Specific Test Suites
```bash
# Integration tests only
npm run test:enhanced:integration

# Performance tests only
npm run test:enhanced:performance

# E2E tests only
npm run test:enhanced:e2e

# Visual regression tests
npm run test:enhanced:visual
```

### Watch Mode (Development)
```bash
npm run test:enhanced:watch
```

### CI/CD Mode
```bash
# Run all tests in CI mode
npm run test:enhanced:ci

# Run specific suite in CI
npm run test:enhanced:ci integration
```

## 📊 Test Coverage Goals

| Test Type | Current | Target | Description |
|-----------|---------|--------|-------------|
| Unit | 85% | 90% | Component logic and utilities |
| Integration | 92% | 95% | API endpoints and data flow |
| E2E | 78% | 85% | Complete user journeys |
| Visual | N/A | 100% | UI component consistency |

## 🧪 Test Categories

### 1. Integration Tests (`/integration/`)
- API endpoint contract testing
- Data flow validation
- Error handling scenarios
- Caching behavior verification

### 2. Data Quality Tests (`/data-quality/`)
- Data scoring algorithm accuracy
- Question generation logic
- Missing data identification
- Industry-specific validation

### 3. Performance Tests (`/performance/`)
- Response time benchmarks
- Concurrent request handling
- Memory usage monitoring
- Load testing scenarios

### 4. E2E Tests (`/e2e/`)
- Complete user journey from search to site creation
- Question flow interactions
- Progress saving and resuming
- Error recovery flows

### 5. Visual Tests (`/visual/`)
- Component screenshot comparisons
- Responsive design verification
- Theme variation testing
- Accessibility visual indicators

## 📈 Key Metrics Tracked

### Performance Thresholds
- Question Generation: < 500ms
- Site Creation: < 2s
- API Response: < 1s
- Cache Retrieval: < 50ms

### Quality Metrics
- Questions per site: 6-9
- Data quality score: > 70%
- Completion rate: > 85%
- User satisfaction: > 4.5/5

## 🛠️ Test Utilities

### Test Data Factory
```typescript
import { TestDataFactory } from './utils/test-data-factory';

// Generate realistic business profiles
const highQualityBusiness = TestDataFactory.generateBusinessProfile('landscaping', 'high');
const minimalDataBusiness = TestDataFactory.generateBusinessProfile('hvac', 'low');
```

### API Mocks
```typescript
import { APIMocks } from './utils/api-mocks';

// Mock external API responses
const placesResponse = APIMocks.mockPlacesAPIResponse(placeId, 'success');
const serpResponse = APIMocks.mockDataForSEOResponse(businessName, location, industry);
```

### Custom Matchers
```typescript
// Jest extended with custom matchers
expect(businessData).toBeValidBusinessData();
expect(insights).toHaveDataQualityBetween(0.7, 0.9);
expect(questions).toHaveOptimalQuestionCount();
expect(template).toMatchTemplateStrategy('premium');
```

## 📝 Test Reports

Reports are generated automatically after each test run:

```
test-results/
├── report-2024-12-28.md    # Human-readable report
├── report-2024-12-28.json  # Machine-readable data
├── integration.json         # Raw integration test results
├── performance.json         # Raw performance test results
└── coverage/               # Code coverage reports
```

### Sample Report Output
```markdown
# Enhanced Site Generation Test Report

**Date**: 12/28/2024 5:15 PM
**Duration**: 45.23s

## Test Summary
| Metric | Value |
|--------|-------|
| Total Tests | 156 |
| Passed | 150 ✅ |
| Failed | 2 ❌ |
| Pass Rate | 96.2% |

## Performance Metrics
| Operation | Average Time | Status |
|-----------|-------------|---------|
| Question Generation | 287ms | ✅ |
| Site Creation | 1.2s | ✅ |
| API Response | 450ms | ✅ |
```

## 🐛 Common Test Issues

### Issue: Tests timing out
**Solution**: Increase timeout in jest.config.ts or use `test.timeout(10000)`

### Issue: Visual tests failing on CI
**Solution**: Update snapshots with `npm run test:visual -- --update-snapshots`

### Issue: Mock data not matching API
**Solution**: Update test-data-factory.ts with latest API response format

## 🔧 Configuration

### Jest Configuration
- See `jest.config.ts` for unit/integration test settings
- Custom matchers loaded automatically
- Coverage thresholds enforced

### Playwright Configuration
- See `playwright.config.ts` for E2E/visual test settings
- Headless mode in CI, headed in development
- Screenshot comparisons use 5% threshold

## 🚦 CI/CD Integration

### GitHub Actions
```yaml
- name: Run Enhanced Tests
  run: npm run test:enhanced:ci
  
- name: Upload Test Report
  uses: actions/upload-artifact@v3
  with:
    name: test-report
    path: test-results/report-*.md
```

### Pre-commit Hook
```bash
# .husky/pre-commit
npm run test:enhanced:integration
```

## 📚 Best Practices

1. **Keep tests focused** - One concern per test
2. **Use realistic data** - TestDataFactory for consistency
3. **Mock external APIs** - Never hit real APIs in tests
4. **Assert business value** - Test outcomes, not implementation
5. **Maintain test data** - Update mocks when APIs change

## 🤝 Contributing

When adding new tests:
1. Place in appropriate category folder
2. Use existing utilities and patterns
3. Add to relevant test suite in run-enhanced-tests.ts
4. Update coverage goals if needed
5. Document any new test patterns

---

**Note**: This test suite is designed specifically for the Enhanced Site Generation system and should not interfere with development work by Agents A and B.