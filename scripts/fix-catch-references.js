#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Fixing catch block error references...\n');

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
    
    // Pattern to find catch (_) blocks that reference 'error' in the body
    const catchBlockPattern = /catch\s*\(\s*_\s*\)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
    
    let match;
    while ((match = catchBlockPattern.exec(originalContent)) !== null) {
      const catchBody = match[1];
      const fullMatch = match[0];
      
      // Check if 'error' is referenced in the catch body
      if (/\berror\b/.test(catchBody)) {
        // Replace catch (_) with catch (error)
        const newCatch = fullMatch.replace(/catch\s*\(\s*_\s*\)/, 'catch (error)');
        content = content.replace(fullMatch, newCatch);
        fixes.push(`  - Fixed catch block that references 'error'`);
        totalFixed++;
        fileFixed = true;
      }
    }
    
    // Also check for specific patterns like "error as Error" or "error instanceof Error"
    // in catch blocks with underscore parameter
    const patterns = [
      {
        // catch (_) { ... error as Error ... }
        regex: /catch\s*\(\s*_\s*\)\s*\{[^}]*\berror\s+as\s+Error[^}]*\}/g,
        desc: 'catch with "error as Error"'
      },
      {
        // catch (_) { ... error instanceof Error ... }
        regex: /catch\s*\(\s*_\s*\)\s*\{[^}]*\berror\s+instanceof\s+Error[^}]*\}/g,
        desc: 'catch with "error instanceof Error"'
      },
      {
        // catch (_) { ... error.message ... }
        regex: /catch\s*\(\s*_\s*\)\s*\{[^}]*\berror\.message[^}]*\}/g,
        desc: 'catch with "error.message"'
      }
    ];
    
    for (const pattern of patterns) {
      if (pattern.regex.test(content)) {
        content = content.replace(/catch\s*\(\s*_\s*\)(?=\s*\{[^}]*\berror\b)/g, 'catch (error)');
        if (!fixes.some(f => f.includes(pattern.desc))) {
          fixes.push(`  - Fixed ${pattern.desc}`);
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

console.log(`\n✅ Fixed ${totalFixed} catch block references in ${filesFixed} files`);

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