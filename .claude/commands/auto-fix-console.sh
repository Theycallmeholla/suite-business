#!/bin/bash
# Slash command: /auto-fix-console
# Description: Automatically replace console.* with logger.*

echo "🔄 Replacing console statements with logger..."

# Find all files with console statements
FILES=$(rg -l "console\.(log|error|warn|debug)" --type-add 'code:*.{js,jsx,ts,tsx}' -t code | grep -v "logger.ts")

if [ -z "$FILES" ]; then
    echo "✅ No console statements found!"
    exit 0
fi

echo "Found console statements in:"
echo "$FILES"
echo ""

# Process each file
echo "$FILES" | while read -r file; do
    if [ -f "$file" ]; then
        echo "📝 Processing: $file"
        
        # Check if logger is already imported
        if ! grep -q "import.*logger" "$file"; then
            # Add logger import at the top
            sed -i '' '1s/^/import { logger } from "@\/lib\/logger";\n/' "$file"
        fi
        
        # Replace console statements
        sed -i '' 's/console\.log(/logger.info(/g' "$file"
        sed -i '' 's/console\.error(/logger.error(/g' "$file"
        sed -i '' 's/console\.warn(/logger.warn(/g' "$file"
        sed -i '' 's/console\.debug(/logger.debug(/g' "$file"
        
        echo "   ✅ Fixed!"
    fi
done

echo -e "\n✨ Console statements replaced with logger!"
echo "Remember to review the changes before committing."