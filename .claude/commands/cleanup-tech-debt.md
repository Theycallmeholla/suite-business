---
description: Find and eliminate technical debt in the codebase
arguments:
  - name: SCOPE
    description: Area to focus on (all, auth, ghl, gbp, ui, api)
---

# Technical Debt Cleanup: $SCOPE

## Pre-Cleanup Analysis

### 1. Code Smell Detection
Look for these patterns:
- [ ] Duplicate code blocks
- [ ] TODO/FIXME comments
- [ ] Console.log statements
- [ ] Commented-out code
- [ ] Magic numbers/strings
- [ ] Overly complex functions
- [ ] Missing error handling
- [ ] Type 'any' usage

### 2. File Organization Issues
Check for:
- [ ] Multiple concepts in single file
- [ ] Inconsistent naming conventions
- [ ] Files that should be consolidated
- [ ] Missing or incorrect imports
- [ ] Circular dependencies

### 3. Performance Problems
Identify:
- [ ] N+1 query problems
- [ ] Missing database indexes
- [ ] Unnecessary re-renders
- [ ] Large bundle imports
- [ ] Missing memoization
- [ ] Inefficient algorithms

### 4. Security Concerns
Scan for:
- [ ] Hardcoded credentials
- [ ] Missing input validation
- [ ] SQL injection risks
- [ ] XSS vulnerabilities
- [ ] Missing auth checks
- [ ] Exposed sensitive data

## Cleanup Actions

### Step 1: Remove Dead Code
```bash
# Find TODO comments
grep -r "TODO\|FIXME\|HACK" --include="*.ts" --include="*.tsx" .

# Find console.logs
grep -r "console\." --include="*.ts" --include="*.tsx" .

# Find commented code blocks
grep -r "^[[:space:]]*//.*" --include="*.ts" --include="*.tsx" . | grep -v "^.*://.*"
```

### Step 2: Consolidate Duplicates
- Identify repeated patterns
- Extract to shared utilities
- Update all references
- Remove duplicated code

### Step 3: Improve Type Safety
- Replace 'any' with proper types
- Add missing type definitions
- Use strict TypeScript settings
- Create shared type definitions

### Step 4: Refactor Complex Functions
- Break down large functions
- Extract business logic
- Improve naming clarity
- Add proper error handling

### Step 5: Update Dependencies
```bash
# Check for outdated packages
npm outdated

# Update dependencies safely
npm update --save
```

## Area-Specific Cleanup

### Authentication (`/lib/auth.ts`, `/app/api/auth`)
- [ ] Consolidate auth logic
- [ ] Improve session handling
- [ ] Add proper type definitions
- [ ] Remove duplicate checks

### GoHighLevel (`/lib/ghl.ts`)
- [ ] Consolidate API methods
- [ ] Improve error handling
- [ ] Add retry logic
- [ ] Type webhook payloads

### Google Business Profile (`/lib/google-business-profile.ts`)
- [ ] Simplify authentication
- [ ] Add method documentation
- [ ] Improve error messages
- [ ] Cache responses

### UI Components (`/components/ui`)
- [ ] Remove unused props
- [ ] Add proper TypeScript
- [ ] Improve accessibility
- [ ] Optimize re-renders

### API Routes (`/app/api`)
- [ ] Standardize responses
- [ ] Add input validation
- [ ] Improve error handling
- [ ] Add rate limiting

## Post-Cleanup Checklist
- [ ] All tests pass (when available)
- [ ] No console.logs remain
- [ ] No commented code
- [ ] All TODOs addressed
- [ ] Type checking passes
- [ ] Linting passes
- [ ] No temporary files
- [ ] Documentation updated

## Verification Commands
```bash
# Type checking
npm run typecheck

# Linting (when available)
npm run lint

# Search for issues
grep -r "console\." src/ lib/ app/
grep -r "any" --include="*.ts" --include="*.tsx" .
grep -r "TODO" --include="*.ts" --include="*.tsx" .
```

## Important Reminders
- Always update existing files vs creating new ones
- Test thoroughly after refactoring
- Commit incrementally with clear messages
- Document non-obvious changes
- Keep functions focused and small