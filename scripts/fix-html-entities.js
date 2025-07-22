#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Fixing HTML entities in TypeScript/JSX files...\n');

// Patterns to fix
const patterns = [
  // Arrow functions: =&gt; to =>
  { pattern: /=&gt;/g, replacement: '=>', description: 'Arrow functions' },
  
  // String literals and JSX text: &apos; to '
  { pattern: /&apos;/g, replacement: "'", description: 'Apostrophes' },
  
  // String literals: &quot; to "
  { pattern: /&quot;/g, replacement: '"', description: 'Quotes' },
  
  // Logical operators: &amp;&amp; to &&
  { pattern: /&amp;&amp;/g, replacement: '&&', description: 'Logical AND' },
  
  // Comparison: &gt; to > (in context like &gt;= or standalone)
  { pattern: /&gt;/g, replacement: '>', description: 'Greater than' },
  
  // Comparison: &lt; to <
  { pattern: /&lt;/g, replacement: '<', description: 'Less than' },
  
  // Escaped quotes in strings: \' to ' (only in certain contexts)
  { pattern: /\\'/g, replacement: "'", description: 'Escaped quotes' },
  
  // Special case for contractions in strings like "Angie\'s List"
  { pattern: /(Angie|Let|We|It|That|What|She|He|They|You|I|Don|Won|Can|Shouldn|Wouldn|Couldn)\\'/g, replacement: "$1'", description: 'Contractions' }
];

// Find all TypeScript and JSX files
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
    
    patterns.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fixes.push(`  - ${description}: ${matches.length} occurrences`);
        totalFixed += matches.length;
        fileFixed = true;
      }
    });
    
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

console.log(`\n✅ Fixed ${totalFixed} HTML entities in ${filesFixed} files`);

// Run ESLint to check remaining errors
console.log('\nRunning ESLint to check remaining errors...');
const { execSync } = require('child_process');
try {
  execSync('npm run lint:report', { stdio: 'inherit' });
} catch (error) {
  // ESLint exits with error code if there are errors, which is expected
}