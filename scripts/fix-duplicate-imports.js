const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Parse imports from a file and merge duplicates
 */
function fixDuplicateImports(content) {
  const lines = content.split('\n');
  const imports = new Map();
  const otherLines = [];
  let inImport = false;
  let currentImport = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Detect start of import
    if (trimmed.startsWith('import ')) {
      inImport = true;
      currentImport = line;
      
      // Single line import
      if (line.includes(' from ') && line.includes(';')) {
        processImport(currentImport, imports);
        currentImport = '';
        inImport = false;
      }
    } else if (inImport) {
      currentImport += '\n' + line;
      
      // Check if import ends
      if (line.includes(' from ') && line.includes(';')) {
        processImport(currentImport, imports);
        currentImport = '';
        inImport = false;
      }
    } else {
      otherLines.push({ line, index: i });
    }
  }
  
  // Reconstruct file with merged imports
  const importLines = [];
  for (const [source, data] of imports) {
    if (data.type === 'named') {
      const items = Array.from(data.items).sort();
      if (items.length === 1) {
        importLines.push(`import { ${items[0]} } from '${source}';`);
      } else {
        importLines.push(`import {`);
        items.forEach((item, index) => {
          const comma = index < items.length - 1 ? ',' : '';
          importLines.push(`  ${item}${comma}`);
        });
        importLines.push(`} from '${source}';`);
      }
    } else if (data.type === 'default') {
      importLines.push(`import ${data.default} from '${source}';`);
    } else if (data.type === 'namespace') {
      importLines.push(`import * as ${data.namespace} from '${source}';`);
    } else if (data.type === 'side-effect') {
      importLines.push(`import '${source}';`);
    }
  }
  
  // Combine imports and other lines
  const result = [];
  let lastImportIndex = -1;
  
  // Find where imports should go
  for (const { line, index } of otherLines) {
    if (index > lastImportIndex + 1 && result.length === 0) {
      result.push(...importLines);
      if (importLines.length > 0) {
        result.push(''); // Add blank line after imports
      }
    }
    result.push(line);
  }
  
  // If no other lines, just return imports
  if (result.length === 0) {
    result.push(...importLines);
  }
  
  return result.join('\n');
}

function processImport(importStr, imports) {
  const cleanStr = importStr.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Parse the import
  const fromMatch = cleanStr.match(/from\s+['"]([^'"]+)['"]/);
  if (!fromMatch) return;
  
  const source = fromMatch[1];
  
  // Side effect import
  if (cleanStr.startsWith('import \'') || cleanStr.startsWith('import "')) {
    if (!imports.has(source)) {
      imports.set(source, { type: 'side-effect' });
    }
    return;
  }
  
  // Default import
  const defaultMatch = cleanStr.match(/import\s+(\w+)\s+from/);
  if (defaultMatch && !cleanStr.includes('{')) {
    imports.set(source, { type: 'default', default: defaultMatch[1] });
    return;
  }
  
  // Namespace import
  const namespaceMatch = cleanStr.match(/import\s+\*\s+as\s+(\w+)\s+from/);
  if (namespaceMatch) {
    imports.set(source, { type: 'namespace', namespace: namespaceMatch[1] });
    return;
  }
  
  // Named imports
  const namedMatch = cleanStr.match(/import\s+(?:(\w+),\s*)?{([^}]+)}/);
  if (namedMatch) {
    const defaultName = namedMatch[1];
    const namedImports = namedMatch[2]
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    
    if (!imports.has(source)) {
      imports.set(source, { 
        type: 'named', 
        items: new Set(),
        default: defaultName 
      });
    }
    
    const existing = imports.get(source);
    if (existing.type === 'named') {
      namedImports.forEach(item => existing.items.add(item));
      if (defaultName && !existing.default) {
        existing.default = defaultName;
      }
    }
  }
}

// Process all TypeScript and TypeScript React files
const files = [
  ...glob.sync('**/*.ts', { 
    ignore: ['node_modules/**', 'dist/**', '.next/**', 'scripts/**'] 
  }),
  ...glob.sync('**/*.tsx', { 
    ignore: ['node_modules/**', 'dist/**', '.next/**', 'scripts/**'] 
  })
];

console.log(`Processing ${files.length} files...`);

let fixedCount = 0;
files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const fixed = fixDuplicateImports(content);
    
    if (content !== fixed) {
      fs.writeFileSync(file, fixed);
      console.log(`Fixed duplicate imports in ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nFixed duplicate imports in ${fixedCount} files`);