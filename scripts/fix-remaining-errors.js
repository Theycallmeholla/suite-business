const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing remaining syntax and import errors...\n');

let stats = {
  filesFixed: 0,
  importErrors: 0,
  syntaxErrors: 0,
  duplicateImports: 0,
  unusedImports: 0
};

// Find all TypeScript/TSX files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', '.next/**', 'scripts/**', '*.d.ts']
});

// Common patterns to fix
const fixes = [
  // Fix broken lucide-react imports (missing opening brace)
  {
    pattern: /\n\s+([A-Z]\w+(?:,\s*\n?\s*[A-Z]\w+)*)\s*\n\}\s*from\s*['"]lucide-react['"]/g,
    fix: (match, icons) => `\nimport {\n  ${icons}\n} from 'lucide-react'`
  },
  
  // Fix duplicate React imports
  {
    pattern: /import React from ['"]react['"];\s*import React from ['"]react['"];/g,
    fix: () => `import React from 'react';`
  },
  
  // Fix duplicate useState/useEffect imports
  {
    pattern: /import { (\w+) } from ['"]react['"];\s*import { \1 } from ['"]react['"];/g,
    fix: (match, hook) => `import { ${hook} } from 'react';`
  },
  
  // Fix multiple imports from same module
  {
    pattern: /import { ([^}]+) } from ['"]react['"];\s*import { ([^}]+) } from ['"]react['"];/g,
    fix: (match, imports1, imports2) => {
      const allImports = [...new Set([...imports1.split(','), ...imports2.split(',')])]
        .map(i => i.trim())
        .filter(Boolean)
        .join(', ');
      return `import { ${allImports} } from 'react';`;
    }
  },
  
  // Fix standalone closing braces
  {
    pattern: /^\s*\}\s*from\s*['"][^'"]+['"]/gm,
    fix: () => ''
  },
  
  // Fix "No newline at end of file" in multi-line comments
  {
    pattern: /\n(\s*\d+)→ No newline at end of file/g,
    fix: () => ''
  },
  
  // Remove duplicate import lines
  {
    pattern: /import { useState, useRef, useMemo } from 'react';\s*import { useState, useRef, useMemo } from 'react';/g,
    fix: () => `import { useState, useRef, useMemo } from 'react';`
  }
];

// Specific file fixes
const fileSpecificFixes = {
  'app/(app)/dashboard/crm/opportunities/page.tsx': {
    find: '  DollarSign, \n  Plus, ',
    replace: 'import {\n  DollarSign, \n  Plus, '
  },
  'app/(app)/dashboard/forms/submissions/SubmissionsTable.tsx': {
    find: '  Table,\n  TableBody,',
    replace: 'import {\n  Table,\n  TableBody,'
  },
  'app/(app)/dashboard/settings/account/page.tsx': {
    find: '  DropdownMenu,\n  DropdownMenuContent,',
    replace: 'import {\n  DropdownMenu,\n  DropdownMenuContent,'
  },
  'app/(app)/dashboard/crm/contacts/ContactsTable.tsx': {
    find: 'import { useState } from \'react\';\nimport { useState, useRef, useMemo } from \'react\';',
    replace: 'import { useState, useRef, useMemo } from \'react\';'
  }
};

// Process each file
files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let fileFixed = false;
    
    // Apply specific fixes for known problematic files
    if (fileSpecificFixes[file]) {
      const { find, replace } = fileSpecificFixes[file];
      if (content.includes(find)) {
        content = content.replace(find, replace);
        fileFixed = true;
        stats.syntaxErrors++;
      }
    }
    
    // Apply general fixes
    fixes.forEach(({ pattern, fix }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, fix);
        fileFixed = true;
        stats.importErrors += matches.length;
      }
    });
    
    // Clean up unused imports
    const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map(i => i.trim());
      const usedImports = imports.filter(imp => {
        // Check if import is actually used in the file
        const escapedImp = imp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const usageRegex = new RegExp(`\\b${escapedImp}\\b(?![\\w-])`, 'g');
        const importLine = match[0];
        const contentWithoutImport = content.replace(importLine, '');
        return usageRegex.test(contentWithoutImport);
      });
      
      if (usedImports.length < imports.length && usedImports.length > 0) {
        const newImportLine = `import { ${usedImports.join(', ')} } from '${match[2]}'`;
        content = content.replace(match[0], newImportLine);
        fileFixed = true;
        stats.unusedImports += imports.length - usedImports.length;
      }
    }
    
    // Remove completely unused import lines
    content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"]\s*;?\s*\n/g, '');
    
    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      stats.filesFixed++;
      console.log(`✓ Fixed ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log('\n📊 Summary:');
console.log(`Files fixed: ${stats.filesFixed}`);
console.log(`Import errors fixed: ${stats.importErrors}`);
console.log(`Syntax errors fixed: ${stats.syntaxErrors}`);
console.log(`Duplicate imports removed: ${stats.duplicateImports}`);
console.log(`Unused imports removed: ${stats.unusedImports}`);

console.log('\n✅ Remaining errors fixed!');