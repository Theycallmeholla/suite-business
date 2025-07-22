#!/bin/bash

# Replace console.log with logger.info
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -not -path "./lib/logger.ts" \
  -exec sed -i '' 's/console\.log(/logger.info(/g' {} \;

# Replace console.error with logger.error  
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -not -path "./lib/logger.ts" \
  -exec sed -i '' 's/console\.error(/logger.error(/g' {} \;

# Replace console.warn with logger.warn
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -not -path "./lib/logger.ts" \
  -exec sed -i '' 's/console\.warn(/logger.warn(/g' {} \;

# Replace console.debug with logger.debug
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -not -path "./lib/logger.ts" \
  -exec sed -i '' 's/console\.debug(/logger.debug(/g' {} \;

echo "Console statements replaced. Now adding logger imports where needed..."

# Add logger import to files that use logger but don't import it
for file in $(find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -not -path "./lib/logger.ts" \
  -exec grep -l "logger\." {} \; 2>/dev/null); do
  
  # Check if logger is already imported
  if ! grep -q "import.*logger.*from.*@/lib/logger" "$file"; then
    # Add import after the first import statement
    if grep -q "^import" "$file"; then
      # Find the line number of the last import
      last_import=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      # Insert logger import after the last import
      sed -i '' "${last_import}a\\
import { logger } from '@/lib/logger';
" "$file"
      echo "Added logger import to: $file"
    fi
  fi
done

echo "Done! Console statements have been replaced with logger calls."