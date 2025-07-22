#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Automated script to replace console.* statements with logger
 * Created: January 1, 2025
 * Last Updated: January 1, 2025
 * 
 * Usage: node scripts/fix-console-logs.js [--dry-run]
 */

const LOGGER_IMPORT = "import { logger } from '@/lib/logger'";
const DRY_RUN = process.argv.includes('--dry-run');

// Mapping of console methods to logger methods with context
const methodMap = {
  'console.log': 'logger.info',
  'console.error': 'logger.error',
  'console.warn': 'logger.warn',
  'console.debug': 'logger.debug',
  'console.info': 'logger.info',
  'console.trace': 'logger.debug',
  'console.dir': 'logger.debug',
  'console.table': 'logger.debug',
  'console.time': 'logger.debug',
  'console.timeEnd': 'logger.debug',
  'console.group': '// logger.group', // Comment out
  'console.groupEnd': '', // Remove
  'console.assert': 'logger.error',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let hasLoggerImport = content.includes("from '@/lib/logger'") || content.includes('from "@/lib/logger"');
  
  // Replace console statements
  Object.entries(methodMap).forEach(([consoleMethod, loggerMethod]) => {
    const regex = new RegExp(`\\b${consoleMethod.replace('.', '\\.')}\\b`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, loggerMethod);
      modified = true;
    }
  });
  
  // Add logger import if needed and file was modified
  if (modified && !hasLoggerImport && !filePath.includes('/lib/logger.ts')) {
    // Find the right place to insert import
    const firstImportMatch = content.match(/^import .* from ['"].*/m);
    if (firstImportMatch) {
      const firstImportIndex = content.indexOf(firstImportMatch[0]);
      content = content.slice(0, firstImportIndex) + 
                LOGGER_IMPORT + '\n' + 
                content.slice(firstImportIndex);
    } else {
      // No imports found, add at the beginning
      content = LOGGER_IMPORT + '\n\n' + content;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔧 Starting console.log cleanup...\n');
  
  const patterns = [
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
  ];
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { ignore: ['**/node_modules/**', '**/logger.ts'] });
    
    files.forEach(file => {
      totalFiles++;
      if (processFile(file)) {
        modifiedFiles++;
        console.log(`✅ Fixed: ${file}`);
      }
    });
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   Files modified: ${modifiedFiles}`);
  console.log(`\n✨ Console.log cleanup complete!`);
  
  if (modifiedFiles > 0) {
    console.log('\n⚠️  Please review the changes and run tests before committing.');
  }
}

// Run the script
main();