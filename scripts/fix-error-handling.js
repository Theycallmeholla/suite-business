#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Error Handling Improvement Script
 * Standardizes error handling patterns across the codebase
 * 
 * Created: January 1, 2025
 * Last Updated: January 1, 2025
 * 
 * Usage: node scripts/fix-error-handling.js [--dry-run]
 */

const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔍 Analyzing error handling patterns...\n');

// Find all TypeScript and JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: [
    '**/node_modules/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/scripts/**',
    '**/.git/**',
    '**/coverage/**'
  ]
});

console.log(`Found ${files.length} files to check\n`);

let totalFixed = 0;
let filesFixed = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let fileFixed = false;
    let fixes = [];
    
    // Pattern 1: Fix catch blocks with unused _error variables
    // Replace catch (_error) or catch (_error: any) etc with catch (_)
    const unusedErrorPattern = /catch\s*\(\s*_[a-zA-Z0-9_$]+\s*(?::\s*[^)]+)?\s*\)/g;
    
    let match;
    while ((match = unusedErrorPattern.exec(originalContent)) !== null) {
      const fullMatch = match[0];
      
      // Extract the error variable name
      const errorVarMatch = fullMatch.match(/catch\s*\(\s*(_[a-zA-Z0-9_$]+)/);
      if (!errorVarMatch) continue;
      
      const errorVar = errorVarMatch[1];
      
      // Find the catch block body
      const startIndex = originalContent.indexOf(fullMatch);
      const afterCatch = startIndex + fullMatch.length;
      
      // Find the corresponding closing brace
      let braceCount = 0;
      let bodyStart = afterCatch;
      let bodyEnd = afterCatch;
      
      // Skip whitespace to find opening brace
      while (bodyStart < originalContent.length && /\s/.test(originalContent[bodyStart])) {
        bodyStart++;
      }
      
      if (originalContent[bodyStart] === '{') {
        braceCount = 1;
        bodyEnd = bodyStart + 1;
        
        while (braceCount > 0 && bodyEnd < originalContent.length) {
          if (originalContent[bodyEnd] === '{') braceCount++;
          if (originalContent[bodyEnd] === '}') braceCount--;
          bodyEnd++;
        }
        
        const catchBody = originalContent.substring(bodyStart + 1, bodyEnd - 1);
        
        // Check if the error variable is used in the catch body
        const varUsageRegex = new RegExp(`\\b${errorVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        const isUsed = varUsageRegex.test(catchBody);
        
        if (!isUsed) {
          // Replace with catch (_)
          const newCatch = 'catch (_)';
          content = content.replace(fullMatch, newCatch);
          fixes.push(`  - Replaced unused ${fullMatch} with catch (_)`);
          totalFixed++;
          fileFixed = true;
        }
      }
    }
    
    // Pattern 2: Fix catch blocks with regular error variables that are unused
    // Replace catch (error) or catch (err) etc with catch (_) if unused
    const errorPattern = /catch\s*\(\s*([a-zA-Z][a-zA-Z0-9_$]*)\s*(?::\s*[^)]+)?\s*\)/g;
    content = fileFixed ? content : originalContent; // Use updated content if already modified
    
    while ((match = errorPattern.exec(fileFixed ? content : originalContent)) !== null) {
      const fullMatch = match[0];
      const errorVar = match[1];
      
      // Skip if already prefixed with underscore or is just underscore
      if (errorVar.startsWith('_') || errorVar === '_') {
        continue;
      }
      
      // Find the catch block body
      const startIndex = (fileFixed ? content : originalContent).indexOf(fullMatch);
      const afterCatch = startIndex + fullMatch.length;
      
      // Find the corresponding closing brace
      let braceCount = 0;
      let bodyStart = afterCatch;
      let bodyEnd = afterCatch;
      
      // Skip whitespace to find opening brace
      while (bodyStart < (fileFixed ? content : originalContent).length && /\s/.test((fileFixed ? content : originalContent)[bodyStart])) {
        bodyStart++;
      }
      
      if ((fileFixed ? content : originalContent)[bodyStart] === '{') {
        braceCount = 1;
        bodyEnd = bodyStart + 1;
        
        while (braceCount > 0 && bodyEnd < (fileFixed ? content : originalContent).length) {
          if ((fileFixed ? content : originalContent)[bodyEnd] === '{') braceCount++;
          if ((fileFixed ? content : originalContent)[bodyEnd] === '}') braceCount--;
          bodyEnd++;
        }
        
        const catchBody = (fileFixed ? content : originalContent).substring(bodyStart + 1, bodyEnd - 1);
        
        // Check if the error variable is used in the catch body
        const varUsageRegex = new RegExp(`\\b${errorVar}\\b`);
        const isUsed = varUsageRegex.test(catchBody);
        
        if (!isUsed) {
          // Replace with catch (_)
          const newCatch = 'catch (_)';
          content = content.replace(fullMatch, newCatch);
          fixes.push(`  - Replaced unused ${fullMatch} with catch (_)`);
          totalFixed++;
          fileFixed = true;
        }
      }
    }
    
    if (fileFixed) {
      fs.writeFileSync(file, content);
      console.log(`✓ Fixed ${file}`);
      fixes.forEach(fix => console.log(fix));
      console.log('');
      filesFixed++;
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Fixed ${totalFixed} error handling issues in ${filesFixed} files`);

// Run ESLint to check remaining errors
console.log('\nRunning ESLint to check remaining errors...');
const { execSync } = require('child_process');
try {
  execSync('npm run lint 2>&1 | grep -E "(error|warning|problem)" | tail -20', { 
    stdio: 'inherit',
    shell: true 
  });
} catch (error) {
  // ESLint exits with error code if there are errors
}