#!/usr/bin/env node

/**
 * Comprehensive Performance Test Runner
 * Runs all performance tests: speed, load, and memory testing
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const BASE_URL = process.env.PRODUCTION_URL || process.argv[2] || 'http://localhost:3000';
const TEST_TIMEOUT = 300000; // 5 minutes total timeout

// Test configuration
const TESTS = [
  {
    name: 'Performance Test',
    script: 'performance-test.js',
    description: 'Speed and efficiency testing',
    timeout: 120000 // 2 minutes
  },
  {
    name: 'Load Test',
    script: 'load-test.js',
    description: 'High traffic simulation',
    timeout: 180000 // 3 minutes
  },
  {
    name: 'Memory Test',
    script: 'memory-test.js',
    description: 'Memory and resource monitoring',
    timeout: 120000 // 2 minutes
  }
];

// Test results
const testResults = {
  startTime: Date.now(),
  tests: [],
  overall: {
    passed: 0,
    failed: 0,
    total: 0
  }
};

// Run a single test
function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n🚀 Starting ${test.name}`);
    console.log(`   Description: ${test.description}`);
    console.log(`   Script: ${test.script}`);
    console.log(`   Timeout: ${test.timeout}ms`);
    console.log('   ' + '='.repeat(50));
    
    const startTime = Date.now();
    const testProcess = spawn('node', [test.script, BASE_URL], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    const timeout = setTimeout(() => {
      console.log(`\n⏰ ${test.name} timed out after ${test.timeout}ms`);
      testProcess.kill('SIGTERM');
      resolve({
        name: test.name,
        success: false,
        duration: test.timeout,
        error: 'Test timeout'
      });
    }, test.timeout);
    
    testProcess.on('close', (code) => {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      const success = code === 0;
      
      console.log(`\n${success ? '✅' : '❌'} ${test.name} ${success ? 'completed' : 'failed'}`);
      console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
      console.log(`   Exit Code: ${code}`);
      
      resolve({
        name: test.name,
        success,
        duration,
        exitCode: code
      });
    });
    
    testProcess.on('error', (error) => {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      console.log(`\n❌ ${test.name} failed to start: ${error.message}`);
      
      resolve({
        name: test.name,
        success: false,
        duration,
        error: error.message
      });
    });
  });
}

// Run all tests sequentially
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Performance Testing Suite');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Total Timeout: ${TEST_TIMEOUT}ms`);
  console.log(`📊 Tests to run: ${TESTS.length}`);
  
  if (!BASE_URL || BASE_URL.includes('your-domain')) {
    console.log('\n❌ Please provide a valid production URL:');
    console.log('   node run-all-performance-tests.js https://your-app.example.com');
    console.log('   or set PRODUCTION_URL environment variable');
    process.exit(1);
  }
  
  const overallStartTime = Date.now();
  
  // Run each test
  for (const test of TESTS) {
    const result = await runTest(test);
    testResults.tests.push(result);
    
    if (result.success) {
      testResults.overall.passed++;
    } else {
      testResults.overall.failed++;
    }
    testResults.overall.total++;
    
    // Wait between tests
    if (test !== TESTS[TESTS.length - 1]) {
      console.log('\n⏳ Waiting 10 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  const totalDuration = Date.now() - overallStartTime;
  
  // Generate comprehensive report
  generateComprehensiveReport(totalDuration);
}

// Generate comprehensive test report
function generateComprehensiveReport(totalDuration) {
  console.log('\n📊 COMPREHENSIVE PERFORMANCE TEST REPORT');
  console.log('=========================================');
  
  console.log(`\n📈 Overall Test Results:`);
  console.log(`   Total Tests: ${testResults.overall.total}`);
  console.log(`   Passed: ${testResults.overall.passed}`);
  console.log(`   Failed: ${testResults.overall.failed}`);
  console.log(`   Success Rate: ${((testResults.overall.passed / testResults.overall.total) * 100).toFixed(1)}%`);
  console.log(`   Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);
  
  console.log(`\n📋 Individual Test Results:`);
  console.log('===========================');
  testResults.tests.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.name}:`);
    console.log(`   Status: ${test.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Duration: ${(test.duration / 1000).toFixed(1)}s`);
    if (test.exitCode !== undefined) {
      console.log(`   Exit Code: ${test.exitCode}`);
    }
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  // Performance assessment
  console.log(`\n🎯 Performance Assessment:`);
  console.log('==========================');
  
  const passedTests = testResults.tests.filter(t => t.success);
  const failedTests = testResults.tests.filter(t => !t.success);
  
  if (failedTests.length === 0) {
    console.log(`   ✅ All performance tests passed - System is performing well`);
  } else if (failedTests.length === 1) {
    console.log(`   ⚠️  One test failed - Minor performance issues detected`);
  } else {
    console.log(`   ❌ ${failedTests.length} tests failed - Significant performance issues detected`);
  }
  
  // Recommendations
  console.log(`\n💡 Recommendations:`);
  console.log('==================');
  
  if (failedTests.length > 0) {
    console.log(`   • Review failed tests and address performance issues`);
    failedTests.forEach(test => {
      console.log(`     - ${test.name}: ${test.error || 'Check test output for details'}`);
    });
  }
  
  if (testResults.overall.passed === testResults.overall.total) {
    console.log(`   • All tests passed - System is ready for production`);
    console.log(`   • Consider running these tests regularly for monitoring`);
    console.log(`   • Set up automated performance monitoring in production`);
  } else {
    console.log(`   • Fix performance issues before deploying to production`);
    console.log(`   • Consider implementing caching and optimization strategies`);
    console.log(`   • Monitor system resources and database performance`);
  }
  
  // Production readiness
  console.log(`\n🚀 Production Readiness:`);
  console.log('=======================');
  
  const criticalTests = testResults.tests.filter(t => 
    t.name === 'Performance Test' || t.name === 'Load Test'
  );
  const criticalPassed = criticalTests.filter(t => t.success).length;
  
  if (criticalPassed === criticalTests.length && testResults.overall.passed === testResults.overall.total) {
    console.log(`   ✅ Production Ready - All critical tests passed`);
  } else if (criticalPassed >= criticalTests.length * 0.5) {
    console.log(`   ⚠️  Partially Ready - Some critical tests failed`);
  } else {
    console.log(`   ❌ Not Ready - Critical performance issues detected`);
  }
  
  // Next steps
  console.log(`\n📋 Next Steps:`);
  console.log('==============');
  
  if (testResults.overall.failed > 0) {
    console.log(`   1. Review individual test outputs above`);
    console.log(`   2. Address performance issues identified`);
    console.log(`   3. Re-run tests to verify fixes`);
    console.log(`   4. Consider implementing monitoring and alerting`);
  } else {
    console.log(`   1. Deploy to production with confidence`);
    console.log(`   2. Set up continuous performance monitoring`);
    console.log(`   3. Schedule regular performance testing`);
    console.log(`   4. Monitor production metrics and user experience`);
  }
  
  // Exit with appropriate code
  const exitCode = testResults.overall.failed > 0 ? 1 : 0;
  console.log(`\n🏁 Test suite completed with exit code: ${exitCode}`);
  process.exit(exitCode);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test suite interrupted by user');
  console.log('📊 Partial results:');
  console.log(`   Tests completed: ${testResults.tests.length}/${TESTS.length}`);
  console.log(`   Passed: ${testResults.overall.passed}`);
  console.log(`   Failed: ${testResults.overall.failed}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Test suite terminated');
  process.exit(1);
});

// Run all tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
