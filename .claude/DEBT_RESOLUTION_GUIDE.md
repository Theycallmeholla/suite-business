# Technical Debt Resolution Guide

**Created**: January 1, 2025, 1:56 AM CST  
**Last Updated**: January 1, 2025, 1:56 AM CST

## 🎯 Quick Resolution Workflow

### Step 1: Check Current Status
```bash
/debt-dashboard
```

### Step 2: Fix Issues by Priority

#### 🔴 High Priority (Fix Immediately)
1. **Console Statements** → `/auto-fix-console`
2. **Missing Logger Imports** → Auto-added by fix script
3. **Stale Documentation** → `/update-stale-docs add-dates`

#### 🟡 Medium Priority (Fix This Week)
1. **Untyped Code** → `/add-types`
2. **Duplicated Strings** → `/extract-constants`
3. **Outdated Versions in Docs** → `/update-stale-docs fix-versions`

#### 🟢 Low Priority (Ongoing)
1. **TODO Comments** → `/create-todo-tasks`
2. **Documentation Consolidation** → `/consolidate-docs`

## 📋 Manual Resolution Patterns

### Replace Console with Logger
```typescript
// Before
console.log('User logged in', userId);
console.error('Failed to save', error);

// After
import { logger } from '@/lib/logger';
logger.info('User logged in', { userId });
logger.error('Failed to save', { error });
```

### Add Types Instead of Any
```typescript
// Before
const processData = (data: any) => { ... }

// After
interface ProcessData {
  id: string;
  name: string;
  // ... specific fields
}
const processData = (data: ProcessData) => { ... }
```

### Update Documentation Dates
```markdown
<!-- Before -->
# API Documentation

<!-- After -->
# API Documentation

**Created**: December 15, 2024, 10:00 AM CST  
**Last Updated**: January 1, 2025, 2:00 AM CST
```

## 🔄 Continuous Monitoring

### Daily Checks
- Run `/debt-dashboard` at start of day
- Fix any new console statements immediately
- Update docs you're actively working on

### Weekly Reviews
```bash
# Generate weekly report
bash .claude/hooks/generate-debt-report.sh

# Review trends
cat ~/.claude/sitebango-reports/report-*.md
```

### Monthly Cleanup
- Consolidate related documentation
- Extract common strings to constants
- Convert old TODOs to tickets

## 🛠️ Automation Tips

### Git Pre-commit Hook
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Check for console statements
if rg -q "console\." --type-add 'code:*.{js,jsx,ts,tsx}' -t code; then
    echo "❌ Found console statements. Run /auto-fix-console"
    exit 1
fi
```

### VS Code Tasks
Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Fix Technical Debt",
      "type": "shell",
      "command": "claude-code",
      "args": ["/debt-dashboard"],
      "problemMatcher": []
    }
  ]
}
```

## 📊 Success Metrics

Track your progress:
- **Zero console statements** in production code
- **All docs updated** within 30 days
- **<5% untyped code** (any/unknown)
- **TODOs converted** to tracked tasks

## 🚀 Quick Wins

1. Run `/auto-fix-console` right now
2. Add dates to one doc file
3. Fix one `any` type
4. Convert one TODO to a task

Start small, build momentum!