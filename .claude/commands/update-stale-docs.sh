#!/bin/bash
# Slash command: /update-stale-docs
# Description: Find and update outdated documentation

echo "📚 Finding stale documentation..."

# Current date for comparison
CURRENT_DATE=$(date +%s)
STALE_DAYS=30
CST_DATE=$(TZ='America/Chicago' date +'%B %d, %Y, %I:%M %p CST')

# Find all markdown files
echo -e "\n📄 Documentation Files:"
find . -name "*.md" -type f | grep -v node_modules | grep -v .next | while read -r file; do
    # Get file modification time
    if [[ "$OSTYPE" == "darwin"* ]]; then
        FILE_DATE=$(stat -f %m "$file")
    else
        FILE_DATE=$(stat -c %Y "$file")
    fi
    
    DAYS_OLD=$(( (CURRENT_DATE - FILE_DATE) / 86400 ))
    
    # Check for Last Updated marker
    HAS_UPDATED=$(grep -c "**Last Updated**:" "$file" || echo "0")
    
    if [ $DAYS_OLD -gt $STALE_DAYS ] || [ "$HAS_UPDATED" -eq 0 ]; then
        echo ""
        echo "📝 $file"
        echo "   Age: $DAYS_OLD days"
        echo "   Has Last Updated: $([ "$HAS_UPDATED" -gt 0 ] && echo "Yes" || echo "No")"
        
        # Check for outdated versions
        OUTDATED=""
        grep -q "Next\.js 15\.1\.6" "$file" && OUTDATED="$OUTDATED Next.js->15.3.2"
        grep -q "Prisma 6\.1\.0" "$file" && OUTDATED="$OUTDATED Prisma->6.10.1"
        grep -q "TypeScript 5[^.]" "$file" && OUTDATED="$OUTDATED TypeScript->5.8.3"
        grep -q "NextAuth.*4\.24" "$file" && OUTDATED="$OUTDATED NextAuth->5.0.0-beta.28"
        
        [ -n "$OUTDATED" ] && echo "   ⚠️  Outdated versions:$OUTDATED"
    fi
done

echo -e "\n🔧 Actions Available:"
echo "1. /update-stale-docs add-dates - Add missing Last Updated dates"
echo "2. /update-stale-docs fix-versions - Update outdated version numbers"
echo "3. /update-stale-docs check-links - Verify internal links"
echo "4. /update-stale-docs consolidate - Find duplicate docs to merge"