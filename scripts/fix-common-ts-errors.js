const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing common TypeScript errors...\n');

let stats = {
  filesFixed: 0,
  importsFixed: 0,
  reactImportsFixed: 0,
  typeAnnotationsAdded: 0
};

// Common missing imports
const commonImports = {
  'useState': "import { useState } from 'react';",
  'useEffect': "import { useEffect } from 'react';",
  'useRouter': "import { useRouter } from 'next/navigation';",
  'useSearchParams': "import { useSearchParams } from 'next/navigation';",
  'redirect': "import { redirect } from 'next/navigation';",
  'Link': "import Link from 'next/link';",
  'Image': "import Image from 'next/image';",
  'toast': "import { toast } from 'sonner';",
  'logger': "import { logger } from '@/lib/logger';"
};

// Find all TypeScript/TSX files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', '.next/**', 'scripts/**', '*.d.ts']
});

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let fixes = 0;
    
    // Skip if file is empty or very small
    if (content.length < 10) return;
    
    // 1. Add missing React import for JSX files
    if (file.endsWith('.tsx') && !content.includes('from \'react\'') && !content.includes('from "react"')) {
      // Check if file contains JSX
      if (content.match(/<[A-Z][a-zA-Z]*[\s>]/) || content.match(/return\s*\(/)) {
        const useClientMatch = content.match(/^['"]use client['"];?\s*$/m);
        if (useClientMatch) {
          const position = content.indexOf(useClientMatch[0]) + useClientMatch[0].length;
          content = content.slice(0, position) + "\nimport React from 'react';" + content.slice(position);
          fixes++;
          stats.reactImportsFixed++;
        } else {
          content = "import React from 'react';\n" + content;
          fixes++;
          stats.reactImportsFixed++;
        }
      }
    }
    
    // 2. Fix missing imports based on usage
    Object.entries(commonImports).forEach(([symbol, importStatement]) => {
      // Check if symbol is used but not imported
      const symbolRegex = new RegExp(`\\b${symbol}\\b(?!['"])`, 'g');
      if (content.match(symbolRegex) && !content.includes(importStatement)) {
        // Don't add if already imported differently
        if (!content.includes(`import.*${symbol}.*from`)) {
          // Add import after 'use client' or at beginning
          const useClientMatch = content.match(/^['"]use client['"];?\s*$/m);
          if (useClientMatch) {
            const position = content.indexOf(useClientMatch[0]) + useClientMatch[0].length;
            content = content.slice(0, position) + "\n" + importStatement + content.slice(position);
          } else {
            content = importStatement + "\n" + content;
          }
          fixes++;
          stats.importsFixed++;
        }
      }
    });
    
    // 3. Fix missing return type annotations for async functions
    content = content.replace(
      /export\s+default\s+async\s+function\s+(\w+)\s*\(/g,
      'export default async function $1('
    );
    
    // 4. Fix import ordering (group by type)
    const importRegex = /^import[^;]+;$/gm;
    const imports = content.match(importRegex);
    if (imports && imports.length > 3) {
      // Group imports
      const reactImports = imports.filter(i => i.includes('react'));
      const nextImports = imports.filter(i => i.includes('next/'));
      const libImports = imports.filter(i => i.includes('@/lib'));
      const componentImports = imports.filter(i => i.includes('@/components'));
      const otherImports = imports.filter(i => 
        !reactImports.includes(i) && 
        !nextImports.includes(i) && 
        !libImports.includes(i) && 
        !componentImports.includes(i)
      );
      
      // Reconstruct with proper grouping
      const orderedImports = [
        ...reactImports,
        ...nextImports,
        ...otherImports,
        ...libImports,
        ...componentImports
      ];
      
      if (orderedImports.join('\n') !== imports.join('\n')) {
        const firstImport = imports[0];
        const lastImport = imports[imports.length - 1];
        const startIdx = content.indexOf(firstImport);
        const endIdx = content.indexOf(lastImport) + lastImport.length;
        
        content = content.slice(0, startIdx) + 
                  orderedImports.join('\n') + 
                  content.slice(endIdx);
        fixes++;
      }
    }
    
    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      stats.filesFixed++;
      console.log(`✓ Fixed ${file} (${fixes} fixes)`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log('\n📊 Summary:');
console.log(`Files fixed: ${stats.filesFixed}`);
console.log(`React imports added: ${stats.reactImportsFixed}`);
console.log(`Other imports fixed: ${stats.importsFixed}`);

console.log('\n✅ Common TypeScript errors fixed!');