# Documentation Consolidation Plan

**Created**: January 1, 2025, 2:02 AM CST  
**Last Updated**: January 1, 2025, 2:02 AM CST

## 🎯 Consolidation Priorities

### 1. Duplicate Training Manuals
- **Files**: `USER_TRAINING_MANUAL.md` vs `SITEBANGO_USER_TRAINING_MANUAL.md`
- **Action**: Merge into single `docs/USER_TRAINING_MANUAL.md`
- **Reason**: SITEBANGO version is newer (June 2025) with more sections

### 2. Testing Documentation
- **Files**: `TESTING.md`, `TESTING_COVERAGE_REPORT.md`
- **Action**: Merge into `docs/TESTING_GUIDE.md`
- **Reason**: Combine overview with coverage report

### 3. Onboarding Documentation Migration
Move from `/app/onboarding/` to `/docs/`:
- `SETUP_GUIDE.md` → `docs/ONBOARDING_SETUP.md`
- `RAYOBYTE_SETUP.md` → `docs/DATA_COLLECTION_SETUP.md`
- `services/README.md` → `docs/DATA_COLLECTION_SERVICES.md`
- `services/CPANEL_SETUP_GUIDE.md` → `docs/CPANEL_DEPLOYMENT.md`

### 4. Setup Command Consolidation
Merge similar setup docs:
- `.claude/commands/setup-*.md` → `docs/INDUSTRY_SETUP_GUIDE.md`
- Combine landscaping, HVAC, plumbing setup guides

### 5. Remove Obsolete Files
- `WORK_COMPLETED.md` - Outdated progress tracking
- `PRODUCT_COMPLETION_ANALYSIS.md` - Old analysis
- `DOCUMENTATION_GAPS_ANALYSIS.md` - Gaps now filled
- Various temporary JS files in `/app/onboarding/`

## 📋 Execution Steps

### Step 1: Merge Training Manuals
```bash
# Keep newer SITEBANGO version as base
# Add any unique content from older version
# Update dates and fix version references
```

### Step 2: Consolidate Testing Docs
```bash
# Combine testing overview with coverage report
# Add actual test examples
# Update with current testing approach
```

### Step 3: Migrate Onboarding Docs
```bash
# Move relevant docs to main /docs
# Update paths in CLAUDE.md
# Remove development artifacts
```

### Step 4: Update Cross-References
```bash
# Fix all internal links
# Update CLAUDE.md references
# Update README.md
```

## 🚫 Do NOT Consolidate

These should remain separate:
- `CLAUDE.md` - Project instructions
- `README.md` - Public documentation
- API docs - Endpoint-specific
- Industry-specific guides - Different audiences

## ✅ Success Criteria

- No duplicate information across docs
- Clear hierarchy: README → docs/ → specific guides
- All docs have proper dates
- Version numbers are current
- Internal links work