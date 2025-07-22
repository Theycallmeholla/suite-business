const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🧹 Starting Technical Debt Cleanup...\n');

// Statistics
let stats = {
  consoleLogs: 0,
  anyTypes: 0,
  commentedCode: 0,
  duplicateImports: 0,
  totalFiles: 0,
  filesFixed: 0
};

// Find all TypeScript/TSX files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', '.next/**', 'scripts/**', '*.d.ts']
});

console.log(`Found ${files.length} files to analyze\n`);

// Process each file
files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let fileStats = {
      consoleLogs: 0,
      anyTypes: 0,
      commentedCode: 0
    };

    // 1. Replace console.* with logger
    const consoleRegex = /console\.(log|error|warn|info|debug)\(/g;
    const consoleMatches = content.match(consoleRegex);
    if (consoleMatches) {
      fileStats.consoleLogs = consoleMatches.length;
      
      // Add logger import if not present
      if (!content.includes("import { logger }") && !content.includes("from '@/lib/logger'")) {
        // Find the last import statement
        const lastImportMatch = content.match(/^import[^;]+;$/gm);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          const position = content.lastIndexOf(lastImport) + lastImport.length;
          content = content.slice(0, position) + "\nimport { logger } from '@/lib/logger';" + content.slice(position);
        } else {
          // No imports, add at the beginning after 'use client' if present
          const useClientMatch = content.match(/^['"]use client['"];?\s*$/m);
          if (useClientMatch) {
            const position = content.indexOf(useClientMatch[0]) + useClientMatch[0].length;
            content = content.slice(0, position) + "\nimport { logger } from '@/lib/logger';\n" + content.slice(position);
          } else {
            content = "import { logger } from '@/lib/logger';\n\n" + content;
          }
        }
      }
      
      // Replace console statements
      content = content.replace(/console\.log\(/g, 'logger.info(');
      content = content.replace(/console\.error\(/g, 'logger.error(');
      content = content.replace(/console\.warn\(/g, 'logger.warn(');
      content = content.replace(/console\.info\(/g, 'logger.info(');
      content = content.replace(/console\.debug\(/g, 'logger.debug(');
    }

    // 2. Fix specific 'any' types with better alternatives
    const anyTypePatterns = [
      { pattern: /: any\[\]/g, replacement: ': unknown[]' },
      { pattern: /: Record<string, any>/g, replacement: ': Record<string, unknown>' },
      { pattern: /fullAddress\?: any;/g, replacement: 'fullAddress?: { formattedAddress?: string; postalAddress?: { regionCode?: string; postalCode?: string; administrativeArea?: string; locality?: string; addressLines?: string[]; }; };' },
      { pattern: /coordinates\?: any;/g, replacement: 'coordinates?: { latitude?: number; longitude?: number; };' },
      { pattern: /regularHours\?: any;/g, replacement: 'regularHours?: { periods?: Array<{ openDay: string; openTime: string; closeDay: string; closeTime: string; }>; };' },
      { pattern: /primaryCategory\?: any;/g, replacement: 'primaryCategory?: { displayName?: string; categoryId?: string; };' },
      { pattern: /serviceArea\?: any;/g, replacement: 'serviceArea?: { businessType?: string; radius?: { radiusKm?: number; }; places?: Array<{ name?: string; }>; };' }
    ];

    anyTypePatterns.forEach(({ pattern, replacement }) => {
      if (content.match(pattern)) {
        fileStats.anyTypes++;
        content = content.replace(pattern, replacement);
      }
    });

    // 3. Remove obvious commented-out code (be conservative)
    const commentedCodeRegex = /^\s*\/\/\s*(import|export|const|let|var|function|class|interface|type)\s+/gm;
    const commentedMatches = content.match(commentedCodeRegex);
    if (commentedMatches) {
      fileStats.commentedCode = commentedMatches.length;
      content = content.replace(commentedCodeRegex, '');
    }

    // 4. Clean up empty lines (max 2 consecutive)
    content = content.replace(/\n{3,}/g, '\n\n');

    // 5. Fix duplicate imports (simple version)
    const importLines = content.match(/^import[^;]+;$/gm) || [];
    const uniqueImports = [...new Set(importLines)];
    if (importLines.length !== uniqueImports.length) {
      fileStats.duplicateImports = importLines.length - uniqueImports.length;
      // Replace all imports with unique ones
      const firstImportIndex = content.indexOf(importLines[0]);
      const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]) + importLines[importLines.length - 1].length;
      const beforeImports = content.slice(0, firstImportIndex);
      const afterImports = content.slice(lastImportIndex);
      content = beforeImports + uniqueImports.join('\n') + afterImports;
    }

    // Update stats
    stats.consoleLogs += fileStats.consoleLogs;
    stats.anyTypes += fileStats.anyTypes;
    stats.commentedCode += fileStats.commentedCode;
    stats.totalFiles++;

    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      stats.filesFixed++;
      console.log(`✓ Fixed ${file}`);
      if (fileStats.consoleLogs) console.log(`  - Replaced ${fileStats.consoleLogs} console statements`);
      if (fileStats.anyTypes) console.log(`  - Fixed ${fileStats.anyTypes} 'any' types`);
      if (fileStats.commentedCode) console.log(`  - Removed ${fileStats.commentedCode} commented code blocks`);
      if (fileStats.duplicateImports) console.log(`  - Removed ${fileStats.duplicateImports} duplicate imports`);
      console.log('');
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

// Summary
console.log('\n📊 Cleanup Summary:');
console.log(`Total files analyzed: ${stats.totalFiles}`);
console.log(`Files fixed: ${stats.filesFixed}`);
console.log(`Console statements replaced: ${stats.consoleLogs}`);
console.log(`'any' types fixed: ${stats.anyTypes}`);
console.log(`Commented code removed: ${stats.commentedCode}`);

console.log('\n✅ Technical debt cleanup complete!');
console.log('\nNext steps:');
console.log('1. Run: npm run typecheck');
console.log('2. Run: npm run lint');
console.log('3. Review changes and test functionality');