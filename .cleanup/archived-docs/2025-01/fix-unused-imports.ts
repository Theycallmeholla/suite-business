#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { logger } from '@/lib/logger';

// Find all TypeScript files
const files = globSync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', '.next/**', 'dist/**'],
});

let totalFixed = 0;

files.forEach((file) => {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  // Track which imports are actually used
  const importRegex = /import\s+(?:{([^}]+)}|([^{}\s]+))\s+from\s+['"]([^'"]+)['"]/;
  const usedImports = new Set<string>();
  
  // First pass: find all used identifiers
  lines.forEach((line, index) => {
    if (!line.includes('import') || !line.includes('from')) {
      // Extract all identifiers from non-import lines
      const identifiers = line.match(/\b[A-Z][a-zA-Z0-9]*\b/g) || [];
      identifiers.forEach(id => usedImports.add(id));
    }
  });
  
  // Second pass: filter imports
  let modified = false;
  const newLines = lines.map((line) => {
    const match = line.match(importRegex);
    if (match) {
      const namedImports = match[1];
      const defaultImport = match[2];
      const modulePath = match[3];
      
      if (namedImports) {
        // Handle named imports
        const imports = namedImports.split(',').map(s => s.trim());
        const usedNamedImports = imports.filter(imp => {
          const name = imp.split(' as ')[0].trim();
          return usedImports.has(name);
        });
        
        if (usedNamedImports.length === 0) {
          modified = true;
          return ''; // Remove entire import
        } else if (usedNamedImports.length < imports.length) {
          modified = true;
          return `import { ${usedNamedImports.join(', ')} } from '${modulePath}';`;
        }
      } else if (defaultImport && !usedImports.has(defaultImport)) {
        modified = true;
        return ''; // Remove unused default import
      }
    }
    return line;
  }).filter(line => line !== ''); // Remove empty lines from deleted imports
  
  if (modified) {
    writeFileSync(file, newLines.join('\n'));
    totalFixed++;
    logger.info(`Fixed imports in: ${file}`);
  }
});

logger.info(`\nTotal files fixed: ${totalFixed}`);