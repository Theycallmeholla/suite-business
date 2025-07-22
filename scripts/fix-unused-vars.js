const fs = require('fs');
const path = require('path');

// Common patterns for fixing unused variables
const fixes = {
  // Remove unused imports
  removeUnusedImport: (line, varName) => {
    // Remove single named import
    const singleImportRegex = new RegExp(`\\b${varName}\\b,?\\s*`, 'g');
    let fixed = line.replace(singleImportRegex, '');
    
    // Clean up empty imports
    fixed = fixed.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?/, '');
    
    // Clean up trailing commas
    fixed = fixed.replace(/,\s*}/, ' }');
    fixed = fixed.replace(/{\s*,/, '{ ');
    
    return fixed;
  },
  
  // Prefix unused error variables with underscore
  prefixWithUnderscore: (line, varName) => {
    return line.replace(
      new RegExp(`\\b${varName}\\b`, 'g'), 
      `_${varName}`
    );
  }
};

// Files to process
const filesToFix = [
  'app/(app)/dashboard/crm/leads/LeadsTable.tsx',
  'app/(app)/dashboard/crm/leads/[id]/LeadActivities.tsx',
  'app/(app)/dashboard/forms/FormBuilder.tsx',
  'app/(app)/dashboard/sites/[id]/settings/AdvancedSettings.tsx',
  'components/SmartQuestionComponents/QuestionFlowOrchestrator.tsx',
  'components/SmartQuestionComponents/ConversationalFlow.tsx',
  'lib/intelligence-system.ts',
  'lib/orchestration/website-generation-orchestrator.ts'
];

function fixFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`Skipping ${filePath} - file not found`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Fix specific patterns
    const patterns = [
      // Remove unused imports
      { pattern: /import.*\bUser\b.*from.*lucide-react/, fix: (match) => {
        if (!content.includes('User>') && !content.includes('User ') && !content.includes('User,')) {
          modified = true;
          return match.replace(/,?\s*\bUser\b,?/, '').replace(/,\s*}/, ' }');
        }
        return match;
      }},
      
      // Prefix unused error variables
      { pattern: /catch\s*\(\s*(\w+)\s*\)/, fix: (match, varName) => {
        if (!content.includes(`${varName}.`) && !content.includes(`${varName})`)) {
          modified = true;
          return `catch (_${varName})`;
        }
        return match;
      }}
    ];
    
    patterns.forEach(({ pattern, fix }) => {
      content = content.replace(pattern, fix);
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Process files
console.log('Fixing unused variables...');
filesToFix.forEach(fixFile);
console.log('Done!');