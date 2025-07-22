#!/bin/bash
# Slash command: /cleanup-docs
# Description: Archive temporary documentation and one-off plans

echo "🧹 Cleaning up temporary documentation..."

# Create archive if it doesn't exist
mkdir -p .cleanup/archived-docs/$(date +%Y-%m)

# Move one-off files
TEMP_PATTERNS=(
    "*PLAN.md"
    "*SUMMARY.md"
    "*REPORT.md"
    "*ANALYSIS.md"
    "*_COMPLETE.md"
    "*_SUCCESS.md"
    "*_FIXES.md"
)

moved=0
for pattern in "${TEMP_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            mv "$file" .cleanup/archived-docs/$(date +%Y-%m)/
            echo "  📦 Archived: $file"
            ((moved++))
        fi
    done
done

# Clean up docs folder
if [ -d "docs/reports" ]; then
    mv docs/reports .cleanup/archived-docs/$(date +%Y-%m)/
    echo "  📦 Archived: docs/reports/"
    ((moved++))
fi

# Remove duplicates in docs
DUPLICATES=(
    "docs/ONBOARDING_SETUP.md"  # Duplicate of ONBOARDING.md
    "docs/LANDSCAPING_IMPLEMENTATION.md"  # Covered in INDUSTRY_SETUP_GUIDE.md
    "docs/IMPLEMENTATION_GUIDE.md"  # Too vague
    "docs/CURSIVE_VPS_DEPLOYMENT.md"  # Duplicate of DOCKER_VPS_CONFIGURATION.md
)

for dup in "${DUPLICATES[@]}"; do
    if [ -f "$dup" ]; then
        mv "$dup" .cleanup/archived-docs/$(date +%Y-%m)/
        echo "  📦 Archived duplicate: $dup"
        ((moved++))
    fi
done

echo ""
echo "✅ Cleanup complete! Moved $moved files to .cleanup/archived-docs/"
echo ""
echo "📁 Remaining essential docs:"
echo "  - README.md"
echo "  - CLAUDE.md"
echo "  - $(ls docs/*.md 2>/dev/null | wc -l) files in /docs"
echo ""
echo "💡 To restore archived files: mv .cleanup/archived-docs/FILE ."