#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Automated script to help identify and fix 'any' type usage
 * Created: January 1, 2025
 * Last Updated: January 1, 2025
 * 
 * Usage: node scripts/fix-any-types.js [--dry-run] [--auto-fix]
 */

const DRY_RUN = process.argv.includes('--dry-run');
const AUTO_FIX = process.argv.includes('--auto-fix');

// Enhanced type replacements with better context awareness
const commonReplacements = {
  // API and form data
  'data: any': 'data: unknown',
  'body: any': 'body: unknown',
  'params: any': 'params: Record<string, string>',
  'query: any': 'query: Record<string, string | string[]>',
  'response: any': 'response: unknown',
  'result: any': 'result: unknown',
  
  // Error handling - use unknown for safety
  'error: any': 'error: unknown',
  'catch (error: any)': 'catch (error: unknown)',
  'catch (e: any)': 'catch (e: unknown)',
  'catch (err: any)': 'catch (err: unknown)',
  
  // Events with proper types
  'event: any': 'event: Event',
  'e: any': 'e: React.MouseEvent | React.ChangeEvent',
  'onChange: (value: any)': 'onChange: (value: string | number | boolean)',
  'onClick: (e: any)': 'onClick: (e: React.MouseEvent)',
  'onSubmit: (data: any)': 'onSubmit: (data: Record<string, unknown>)',
  
  // React patterns
  'children: any': 'children: React.ReactNode',
  'style: any': 'style: React.CSSProperties',
  'ref: any': 'ref: React.RefObject<HTMLElement>',
  'props: any': 'props: Record<string, unknown>',
  
  // Arrays and objects
  ': any[]': ': unknown[]',
  'Array<any>': 'Array<unknown>',
  ': { [key: string]: any }': ': Record<string, unknown>',
  ': Record<string, any>': ': Record<string, unknown>',
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  lines.forEach((line, index) => {
    // Find 'any' usage
    const anyMatch = line.match(/:\s*any\b/);
    if (anyMatch) {
      const context = {
        file: filePath,
        line: index + 1,
        code: line.trim(),
        suggestion: suggestReplacement(line)
      };
      issues.push(context);
    }
  });
  
  return issues;
}

function suggestReplacement(line) {
  // Check common patterns
  for (const [pattern, replacement] of Object.entries(commonReplacements)) {
    if (line.includes(pattern)) {
      return line.replace(pattern, replacement);
    }
  }
  
  // Analyze context for better suggestions
  if (line.includes('useState')) {
    return 'Consider using generic: useState<Type>(initialValue)';
  }
  
  if (line.includes('async') || line.includes('Promise')) {
    return 'Consider using Promise<Type> or specific return type';
  }
  
  if (line.includes('[]')) {
    return 'Consider using Type[] or Array<Type>';
  }
  
  if (line.includes('{}')) {
    return 'Consider using Record<string, Type> or specific interface';
  }
  
  return 'Consider using unknown, specific type, or interface';
}

function generateReport(allIssues) {
  const report = [
    '# Any Type Usage Report',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    `Total issues found: ${allIssues.length}`,
    '',
    '## Issues by File',
    ''
  ];
  
  // Group by file
  const byFile = {};
  allIssues.forEach(issue => {
    if (!byFile[issue.file]) {
      byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue);
  });
  
  Object.entries(byFile).forEach(([file, issues]) => {
    report.push(`### ${file} (${issues.length} issues)`);
    report.push('');
    
    issues.forEach(issue => {
      report.push(`Line ${issue.line}: \`${issue.code}\``);
      report.push(`Suggestion: ${issue.suggestion}`);
      report.push('');
    });
  });
  
  // Add fix instructions
  report.push('## How to Fix');
  report.push('');
  report.push('1. Replace `any` with `unknown` for truly unknown types');
  report.push('2. Use specific types when data structure is known');
  report.push('3. Create interfaces for complex objects');
  report.push('4. Use generics for reusable components');
  report.push('5. Use union types for multiple possibilities');
  report.push('');
  report.push('## Common Patterns');
  report.push('');
  report.push('```typescript');
  report.push('// API responses');
  report.push('interface ApiResponse<T> {');
  report.push('  data: T;');
  report.push('  error?: string;');
  report.push('}');
  report.push('');
  report.push('// Form data');
  report.push('interface FormData {');
  report.push('  [key: string]: string | number | boolean;');
  report.push('}');
  report.push('');
  report.push('// Event handlers');
  report.push('type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;');
  report.push('type SubmitHandler = (e: React.FormEvent<HTMLFormElement>) => void;');
  report.push('```');
  
  return report.join('\n');
}

function main() {
  console.log('🔍 Analyzing any type usage...\n');
  
  const patterns = [
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'types/**/*.{ts,d.ts}',
  ];
  
  const allIssues = [];
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { ignore: ['**/node_modules/**'] });
    
    files.forEach(file => {
      const issues = analyzeFile(file);
      if (issues.length > 0) {
        allIssues.push(...issues);
        console.log(`Found ${issues.length} issues in ${file}`);
      }
    });
  });
  
  // Generate report
  const report = generateReport(allIssues);
  fs.writeFileSync('ANY_TYPE_REPORT.md', report);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total 'any' usage found: ${allIssues.length}`);
  console.log(`   Report saved to: ANY_TYPE_REPORT.md`);
  console.log(`\n✨ Analysis complete!`);
  
  if (allIssues.length > 0) {
    console.log('\n💡 Next steps:');
    console.log('   1. Review ANY_TYPE_REPORT.md');
    console.log('   2. Fix critical type safety issues');
    console.log('   3. Create shared type definitions');
    console.log('   4. Run TypeScript strict mode');
  }
}

// Run the script
main();