# Test Consolidation Plan

**Created**: January 1, 2025, 2:31 AM CST  
**Last Updated**: January 1, 2025, 2:31 AM CST

## 🎯 Goal: Single Test Directory Structure

### Proposed Structure
```
/tests
├── unit/                    # Unit tests (from __tests__/)
│   ├── api/                 # API route tests
│   ├── components/          # Component tests
│   ├── lib/                 # Library function tests
│   └── hooks/               # Custom hook tests
├── integration/             # Integration tests
│   ├── ghl/                 # GoHighLevel integration
│   ├── gbp/                 # Google Business Profile
│   ├── stripe/              # Payment integration
│   └── auth/                # Authentication flows
├── e2e/                     # End-to-end tests (Playwright)
│   ├── onboarding/          # Onboarding flow
│   ├── dashboard/           # Dashboard functionality
│   └── sites/               # Site generation
├── scripts/                 # Test utilities & runners
│   ├── api-testers/         # API test scripts
│   ├── data-collection/     # Proxy/scraping tests
│   └── setup/               # Test setup scripts
├── fixtures/                # Test data & mocks
│   ├── data/                # Sample data
│   └── mocks/               # Mock implementations
└── config/                  # Test configurations
    ├── jest.config.ts
    ├── playwright.config.ts
    └── test-env.ts
```

## 📋 Migration Steps

### Step 1: Create Test Directory Structure
```bash
mkdir -p tests/{unit/{api,components,lib,hooks},integration/{ghl,gbp,stripe,auth},e2e/{onboarding,dashboard,sites},scripts/{api-testers,data-collection,setup},fixtures/{data,mocks},config}
```

### Step 2: Move Existing Tests
```bash
# Move unit/integration tests
mv __tests__/* tests/unit/
mv e2e/* tests/e2e/

# Move test scripts
mv scripts/test-*.ts tests/scripts/api-testers/
mv app/onboarding/scripts/test-*.js tests/scripts/data-collection/

# Move root test files
mv test-*.js tests/scripts/
```

### Step 3: Update Import Paths
- Update all test imports to use new paths
- Update jest.config.ts to point to /tests
- Update playwright.config.ts paths

### Step 4: Consolidate Test Utilities
- Create shared test utilities in /tests/utils
- Extract common mocks to /tests/fixtures/mocks
- Centralize test data in /tests/fixtures/data

## ✅ Benefits

1. **Single Source**: All tests in one place
2. **Clear Organization**: Easy to find test type
3. **Shared Resources**: Reusable fixtures & utilities
4. **Better Discovery**: New devs can find tests easily
5. **CI/CD Friendly**: Simple test paths for pipelines

## 🚫 What NOT to Include in /tests

- Development pages (`/app/dev/*`)
- Demo scripts (keep in docs or examples)
- Production code (no mixing)

## 📝 Test Naming Convention

### Files
- Unit tests: `*.test.ts`
- Integration: `*.integration.test.ts`
- E2E: `*.e2e.ts`
- Test utilities: `*.helper.ts`

### Directories
- Group by feature, not by file type
- Use descriptive names
- Keep nesting shallow (max 3 levels)

## 🔄 Migration Commands

```bash
# 1. Create new structure
npm run test:migrate-structure

# 2. Update all imports
npm run test:update-imports

# 3. Verify tests still run
npm test
npm run test:e2e
```

## 📊 Current State vs. Target State

### Before
- 6+ different test locations
- Mixed with source code
- No clear organization
- Hard to run all tests

### After
- Single /tests directory
- Clear separation by type
- Shared utilities
- Easy CI/CD integration