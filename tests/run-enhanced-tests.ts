#!/usr/bin/env node
/**
 * Test Runner for Enhanced Site Generation
 * 
 * Orchestrates all test suites and generates comprehensive report
 */

import { spawn } from 'child_process';
import * as path from 'path';
import { generateTestReport } from './utils/test-reporter';

interface TestSuite {
  name: string;
  command: string;
  args: string[];
  type: 'jest' | 'playwright';
}

const TEST_SUITES: TestSuite[] = [
  {
    name: 'Integration Tests',
    command: 'jest',
    args: ['--testPathPattern=integration/enhanced-generation', '--json', '--outputFile=test-results/integration.json'],
    type: 'jest'
  },
  {
    name: 'Data Quality Tests',
    command: 'jest',
    args: ['--testPathPattern=data-quality', '--json', '--outputFile=test-results/data-quality.json'],
    type: 'jest'
  },
  {
    name: 'Performance Tests',
    command: 'jest',
    args: ['--testPathPattern=performance', '--json', '--outputFile=test-results/performance.json'],
    type: 'jest'
  },
  {
    name: 'E2E Tests',
    command: 'playwright',
    args: ['test', 'tests/e2e/enhanced-generation', '--reporter=json', '--output=test-results/e2e.json'],
    type: 'playwright'
  },
  {
    name: 'Visual Tests',
    command: 'playwright',
    args: ['test', 'tests/visual', '--reporter=json', '--output=test-results/visual.json'],
    type: 'playwright'
  }
];

/**
 * Run a test suite
 */
async function runTestSuite(suite: TestSuite): Promise<boolean> {
  console.log(`\n🧪 Running ${suite.name}...`);
  
  return new Promise((resolve) => {
    const command = suite.type === 'playwright' ? 'npx' : 'npx';
    const args = suite.type === 'playwright' ? ['playwright', ...suite.args] : [suite.command, ...suite.args];
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${suite.name} passed`);
        resolve(true);
      } else {
        console.log(`❌ ${suite.name} failed with code ${code}`);
        resolve(false);
      }
    });

    child.on('error', (error) => {
      console.error(`❌ Error running ${suite.name}:`, error);
      resolve(false);
    });
  });
}

/**
 * Main test orchestration
 */
async function runAllTests() {
  console.log('🚀 Enhanced Site Generation Test Suite');
  console.log('=====================================\n');
  
  const startTime = Date.now();
  const results: Record<string, boolean> = {};
  
  // Run tests sequentially to avoid conflicts
  for (const suite of TEST_SUITES) {
    results[suite.name] = await runTestSuite(suite);
  }
  
  const duration = Date.now() - startTime;
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  Object.entries(results).forEach(([name, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${name}`);
    if (passed) totalPassed++;
    else totalFailed++;
  });
  
  console.log(`\nTotal: ${totalPassed} passed, ${totalFailed} failed`);
  console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
  
  // Generate comprehensive report
  console.log('\n📝 Generating test report...');
  
  try {
    const reportPath = path.join(__dirname, '..', 'test-results', `report-${new Date().toISOString().split('T')[0]}.md`);
    await generateTestReport('test-results', reportPath);
    console.log(`✅ Report generated: ${reportPath}`);
  } catch (error) {
    console.error('❌ Failed to generate report:', error);
  }
  
  // Exit with appropriate code
  process.exit(totalFailed > 0 ? 1 : 0);
}

/**
 * CI/CD Mode - Run specific test types
 */
async function runCITests(testType?: string) {
  if (!testType) {
    return runAllTests();
  }
  
  const suites = TEST_SUITES.filter(s => 
    testType === 'unit' ? s.name.includes('Unit') :
    testType === 'integration' ? s.name.includes('Integration') :
    testType === 'e2e' ? s.name.includes('E2E') :
    testType === 'performance' ? s.name.includes('Performance') :
    testType === 'visual' ? s.name.includes('Visual') :
    true
  );
  
  if (suites.length === 0) {
    console.error(`❌ No tests found for type: ${testType}`);
    process.exit(1);
  }
  
  for (const suite of suites) {
    const passed = await runTestSuite(suite);
    if (!passed && process.env.CI) {
      // Fail fast in CI
      process.exit(1);
    }
  }
}

/**
 * Watch Mode - For development
 */
function runWatchMode() {
  console.log('👀 Running tests in watch mode...\n');
  
  const jestWatch = spawn('npx', ['jest', '--watch', '--testPathPattern=enhanced'], {
    stdio: 'inherit',
    shell: true
  });
  
  jestWatch.on('close', (code) => {
    process.exit(code || 0);
  });
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'watch':
    runWatchMode();
    break;
  case 'ci':
    runCITests(args[1]);
    break;
  case 'integration':
  case 'e2e':
  case 'performance':
  case 'visual':
    runCITests(command);
    break;
  default:
    runAllTests();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Test run interrupted');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error);
  process.exit(1);
});