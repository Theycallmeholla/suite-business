const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing final TypeScript/ESLint issues...\n');

let stats = {
  filesFixed: 0,
  unusedVarsFixed: 0,
  hookDepsFixed: 0,
  asyncReturnTypesAdded: 0,
  typeMismatchesFixed: 0
};

// Find all TypeScript/TSX files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', '.next/**', 'scripts/**', '*.d.ts', '__tests__/**']
});

// Common unused imports to remove
const unusedImports = [
  'redirect', 'User', 'Trash2', 'Square', 'Shield', 'Mail', 
  'EyeOff', 'Eye', 'CreditCard', 'CheckSquare', 'Bell'
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileFixed = false;
    
    // 1. Fix unused variables in catch blocks
    content = content.replace(/catch\s*\(\s*([a-zA-Z_]\w*)\s*\)\s*{/g, (match, varName) => {
      // Check if the error variable is used in the catch block
      const catchBlockMatch = content.match(new RegExp(`catch\\s*\\(\\s*${varName}\\s*\\)\\s*{([^}]+)}`));
      if (catchBlockMatch && !catchBlockMatch[1].includes(varName)) {
        stats.unusedVarsFixed++;
        return `catch {`;
      }
      return match;
    });
    
    // 2. Remove unused imports from lucide-react and ui components
    unusedImports.forEach(importName => {
      const importRegex = new RegExp(`\\b${importName}\\b,?\\s*`, 'g');
      const usageRegex = new RegExp(`<${importName}[\\s>]|${importName}\\.|${importName}\\(`, 'g');
      
      if (content.includes(importName) && !usageRegex.test(content)) {
        // Remove from import statements
        content = content.replace(importRegex, '');
        
        // Clean up empty imports and trailing commas
        content = content.replace(/,\s*}/g, ' }');
        content = content.replace(/{\s*,/g, '{ ');
        content = content.replace(/,\s*,/g, ',');
        content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?\n/g, '');
        
        fileFixed = true;
        stats.unusedVarsFixed++;
      }
    });
    
    // 3. Fix missing React Hook dependencies (common patterns)
    const hookPatterns = [
      {
        pattern: /useEffect\(\(\)\s*=>\s*{([^}]+)},\s*\[\]\)/g,
        fix: (match, effectBody) => {
          // Extract variables used in effect
          const deps = [];
          const varPattern = /\b(props\.\w+|[a-zA-Z_]\w*)\b/g;
          let varMatch;
          while ((varMatch = varPattern.exec(effectBody)) !== null) {
            const varName = varMatch[1];
            // Filter out common non-dependencies
            if (!['console', 'window', 'document', 'fetch', 'setTimeout', 'setInterval'].includes(varName) &&
                !varName.startsWith('use') && !varName.includes('set')) {
              if (!deps.includes(varName)) {
                deps.push(varName);
              }
            }
          }
          
          if (deps.length > 0) {
            stats.hookDepsFixed++;
            return `useEffect(() => {${effectBody}}, [${deps.join(', ')}])`;
          }
          return match;
        }
      }
    ];
    
    hookPatterns.forEach(({ pattern, fix }) => {
      if (content.match(pattern)) {
        content = content.replace(pattern, fix);
        fileFixed = true;
      }
    });
    
    // 4. Add return types to async functions
    // Server components (files containing getAuthSession)
    if (content.includes('getAuthSession()') && filePath.endsWith('.tsx')) {
      content = content.replace(
        /export\s+default\s+async\s+function\s+(\w+)\s*\(/g,
        'export default async function $1('
      );
      
      // Add JSX.Element return type if not present
      content = content.replace(
        /export\s+default\s+async\s+function\s+(\w+)\s*\([^)]*\)\s*{/g,
        (match, funcName) => {
          if (!match.includes(':')) {
            stats.asyncReturnTypesAdded++;
            return match.replace(')', '): Promise<JSX.Element>');
          }
          return match;
        }
      );
      fileFixed = true;
    }
    
    // API routes
    if (filePath.includes('/api/') && filePath.endsWith('.ts')) {
      // Add NextResponse return type
      if (!content.includes('import { NextResponse }') && content.includes('NextResponse.json')) {
        const lastImport = content.match(/^import[^;]+;$/gm);
        if (lastImport) {
          const position = content.lastIndexOf(lastImport[lastImport.length - 1]) + lastImport[lastImport.length - 1].length;
          content = content.slice(0, position) + "\nimport { NextResponse } from 'next/server';" + content.slice(position);
          fileFixed = true;
        }
      }
    }
    
    // 5. Fix common type mismatches
    const typeFixes = [
      // Fix CardContent from button import
      {
        pattern: /from ['"]@\/components\/ui\/button['"]/g,
        fix: (match) => {
          if (content.includes('CardContent') || content.includes('CardHeader')) {
            stats.typeMismatchesFixed++;
            return `from '@/components/ui/card'`;
          }
          return match;
        }
      },
      // Fix any[] to unknown[]
      {
        pattern: /:\s*any\[\]/g,
        fix: () => {
          stats.typeMismatchesFixed++;
          return ': unknown[]';
        }
      }
    ];
    
    typeFixes.forEach(({ pattern, fix }) => {
      if (content.match(pattern)) {
        content = content.replace(pattern, fix);
        fileFixed = true;
      }
    });
    
    // 6. Clean up duplicate imports on same line
    content = content.replace(/import\s*{\s*([^}]+)\s*}\s*from\s*(['"][^'"]+['"]);\s*import\s*{\s*([^}]+)\s*}\s*from\s*\2;/g, 
      (match, imports1, module, imports2) => {
        const allImports = [...new Set([...imports1.split(','), ...imports2.split(',')])]
          .map(i => i.trim())
          .filter(Boolean)
          .join(', ');
        return `import { ${allImports} } from ${module};`;
      }
    );
    
    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      stats.filesFixed++;
      console.log(`✓ Fixed ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

// Process all files
console.log(`Processing ${files.length} files...\n`);
files.forEach(processFile);

// Summary
console.log('\n📊 Summary:');
console.log(`Files fixed: ${stats.filesFixed}`);
console.log(`Unused variables fixed: ${stats.unusedVarsFixed}`);
console.log(`React Hook dependencies added: ${stats.hookDepsFixed}`);
console.log(`Async function return types added: ${stats.asyncReturnTypesAdded}`);
console.log(`Type mismatches fixed: ${stats.typeMismatchesFixed}`);

console.log('\n✅ Final cleanup complete!');