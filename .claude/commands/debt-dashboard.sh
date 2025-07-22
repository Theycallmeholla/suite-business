#!/bin/bash
# Slash command: /debt-dashboard
# Description: Real-time technical debt metrics and resolution dashboard
# Created: January 1, 2025
# Last Updated: January 1, 2025

clear
echo "═══════════════════════════════════════════════════════"
echo "          📊 TECHNICAL DEBT DASHBOARD         "
echo "═══════════════════════════════════════════════════════"
echo ""

# Calculate metrics with proper file type handling
echo "⏳ Calculating metrics..."

# Console statements (all variations)
CONSOLE_COUNT=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec grep -E "console\.(log|error|warn|debug|info|trace|dir|table)" {} \; 2>/dev/null | wc -l | tr -d ' ')

# TypeScript 'any' usage
ANY_COUNT=$(find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec grep -E ":\s*any\b" {} \; 2>/dev/null | wc -l | tr -d ' ')

# TODO/FIXME comments
TODO_COUNT=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec grep -E "(TODO|FIXME)" {} \; 2>/dev/null | wc -l | tr -d ' ')

# Empty catch blocks
EMPTY_CATCH=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec grep -E "catch\s*\([^)]*\)\s*{\s*}" {} \; 2>/dev/null | wc -l | tr -d ' ')

# Stale documentation
OLD_DOCS=$(find . -name "*.md" -type f -mtime +30 -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')

echo "📈 Current Status:"
echo "├── 📝 TODOs/FIXMEs: $TODO_COUNT"
echo "├── 🖥️  Console statements: $CONSOLE_COUNT" 
echo "├── 🚫 Untyped code: $ANY_COUNT"
echo "└── 📚 Stale docs (>30 days): $OLD_DOCS"
echo ""

# Recent activity
if [ -f ~/.claude/sitebango-tech-debt.json ]; then
    RECENT_ISSUES=$(jq -r '.debts | length' ~/.claude/sitebango-tech-debt.json 2>/dev/null || echo "0")
    echo "📊 Recent Activity:"
    echo "└── Issues tracked: $RECENT_ISSUES"
    echo ""
fi

# Quick actions menu
echo "🚀 Quick Actions:"
echo "┌─────────────────────────────────────────────────────┐"
echo "│ 1. /resolve-tech-debt    - Scan and fix debt       │"
echo "│ 2. /auto-fix-console     - Replace console.* calls │"
echo "│ 3. /update-stale-docs    - Update old docs         │"
echo "│ 4. /consolidate-docs     - Merge duplicate docs    │"
echo "│ 5. /add-types           - Fix any/unknown types    │"
echo "│ 6. /create-todo-tasks    - Convert TODOs to tasks  │"
echo "└─────────────────────────────────────────────────────┘"
echo ""

# Priority recommendations
echo "🎯 Priority Recommendations:"
if [ "$CONSOLE_COUNT" -gt 0 ]; then
    echo "├── High: Fix $CONSOLE_COUNT console statements (/auto-fix-console)"
fi
if [ "$OLD_DOCS" -gt 5 ]; then
    echo "├── High: Update $OLD_DOCS stale documentation files"
fi
if [ "$ANY_COUNT" -gt 10 ]; then
    echo "├── Medium: Add types to $ANY_COUNT untyped declarations"
fi
if [ "$TODO_COUNT" -gt 20 ]; then
    echo "├── Low: Address $TODO_COUNT TODO comments"
fi
echo ""

# Generate report option
echo "📄 Generate full report: /debt-report"
echo "═══════════════════════════════════════════════════════"