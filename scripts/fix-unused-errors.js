#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Fixing unused error variables in catch blocks...\n');

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
    
    // Pattern to match catch blocks
    // This regex finds catch blocks with named error parameters
    const catchPattern = /catch\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?::\s*[^)]+)?\s*\)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
    
    let match;
    while ((match = catchPattern.exec(originalContent)) !== null) {
      const errorVar = match[1];
      const catchBody = match[2];
      const fullMatch = match[0];
      
      // Skip if already prefixed with underscore
      if (errorVar.startsWith('_')) {
        continue;
      }
      
      // Check if the error variable is used in the catch body
      // Create a regex that matches the variable as a whole word
      const varUsageRegex = new RegExp(`\\b${errorVar}\\b`, 'g');
      const isUsed = varUsageRegex.test(catchBody);
      
      if (!isUsed) {
        // Replace the error variable with underscore-prefixed version
        const newCatch = fullMatch.replace(
          new RegExp(`catch\\s*\\(\\s*${errorVar}\\s*`, 'g'),
          `catch (_${errorVar}`
        );
        
        content = content.replace(fullMatch, newCatch);
        fixes.push(`  - Prefixed unused error variable: ${errorVar} → _${errorVar}`);
        totalFixed++;
        fileFixed = true;
      }
    }
    
    // Also handle the simplified pattern catch (error) without type annotation
    const simpleCatchPattern = /catch\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)\s*\{/g;
    content = originalContent;
    
    while ((match = simpleCatchPattern.exec(originalContent)) !== null) {
      const errorVar = match[1];
      const startIndex = match.index + match[0].length;
      
      // Skip if already prefixed with underscore
      if (errorVar.startsWith('_')) {
        continue;
      }
      
      // Find the corresponding closing brace
      let braceCount = 1;
      let endIndex = startIndex;
      while (braceCount > 0 && endIndex < originalContent.length) {
        if (originalContent[endIndex] === '{') braceCount++;
        if (originalContent[endIndex] === '}') braceCount--;
        endIndex++;
      }
      
      const catchBody = originalContent.substring(startIndex, endIndex - 1);
      
      // Check if the error variable is used in the catch body
      const varUsageRegex = new RegExp(`\\b${errorVar}\\b`, 'g');
      const isUsed = varUsageRegex.test(catchBody);
      
      if (!isUsed) {
        // Replace the error variable with underscore-prefixed version
        const regex = new RegExp(`catch\\s*\\(\\s*${errorVar}\\s*\\)`, 'g');
        content = content.replace(regex, `catch (_${errorVar})`);
        
        if (!fixes.some(fix => fix.includes(`${errorVar} → _${errorVar}`))) {
          fixes.push(`  - Prefixed unused error variable: ${errorVar} → _${errorVar}`);
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

console.log(`\n✅ Fixed ${totalFixed} unused error variables in ${filesFixed} files`);

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