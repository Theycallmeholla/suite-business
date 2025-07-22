#!/bin/bash
# Slash command: /resolve-tech-debt
# Description: Find and fix technical debt in the codebase

echo "🔍 Analyzing technical debt in Sitebango..."

# Find TODOs and FIXMEs
echo -e "\n📝 TODO/FIXME Comments:"
rg -n "TODO|FIXME|HACK|XXX" --type-add 'code:*.{js,jsx,ts,tsx}' -t code || echo "✅ No TODOs found!"

# Find console statements
echo -e "\n🖥️  Console Statements (should use logger.ts):"
rg -n "console\.(log|error|warn|debug)" --type-add 'code:*.{js,jsx,ts,tsx}' -t code | grep -v "logger" || echo "✅ No console statements found!"

# Find any/unknown types
echo -e "\n🚫 Untyped Code (any/unknown):"
rg -n ": any|: unknown" --type ts --type tsx || echo "✅ No untyped code found!"

# Find duplicated strings (potential constants)
echo -e "\n🔄 Duplicated Strings (>3 occurrences):"
rg -o '"[^"]{10,}"' --type-add 'code:*.{js,jsx,ts,tsx}' -t code | sort | uniq -c | awk '$1 > 3 {print $0}' || echo "✅ No duplicated strings found!"

# Offer to fix automatically
echo -e "\n🛠️  Would you like me to:"
echo "1. Replace all console.* with logger.*"
echo "2. Create constants for duplicated strings"
echo "3. Add type definitions for any/unknown"
echo "4. Create tasks for remaining TODOs"
echo ""
echo "Run with specific fixes: /resolve-tech-debt console | /resolve-tech-debt types | /resolve-tech-debt todos"