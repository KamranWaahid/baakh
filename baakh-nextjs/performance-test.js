#!/usr/bin/env node

/**
 * Performance Testing Script for Baakh API Endpoints
 * Tests speed, efficiency, and scalability of production endpoints
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = process.env.PRODUCTION_URL || process.argv[2] || 'http://localhost:3000';
const TIMEOUT = 30000; // 30 seconds for performance testing
const CONCURRENT_REQUESTS = 10; // Number of concurrent requests for load testing
const PERFORMANCE_THRESHOLDS = {
  excellent: 500,    // < 500ms
  good: 1000,        // < 1s
  acceptable: 2000,  // < 2s
  slow: 5000,        // < 5s
  critical: 10000    // > 10s
};

// Performance test results storage
const perfResults = {
  totalTests: 0,
  passed: 0,
  failed: 0,
  categories: {
    critical: { tests: [], avgTime: 0, maxTime: 0, minTime: Infinity },
    admin: { tests: [], avgTime: 0, maxTime: 0, minTime: Infinity },
    content: { tests: [], avgTime: 0, maxTime: 0, minTime: Infinity },
    search: { tests: [], avgTime: 0, maxTime: 0, minTime: Infinity },
    user: { tests: [], avgTime: 0, maxTime: 0, minTime: Infinity }
  },
  loadTests: [],
  recommendations: []
};

// Helper function to make HTTP requests with detailed timing
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: TIMEOUT,
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      const responseStart = performance.now();
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const responseTime = endTime - responseStart;
        
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            timing: {
              total: totalTime,
              response: responseTime,
              dns: 0, // Not easily measurable in Node.js
              connection: responseStart - startTime
            }
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            timing: {
              total: totalTime,
              response: responseTime,
              dns: 0,
              connection: responseStart - startTime
            }
          });
        }
      });
    });

    req.on('error', (error) => {
      const endTime = performance.now();
      reject({
        error,
        timing: {
          total: endTime - startTime,
          response: 0,
          dns: 0,
          connection: 0
        }
      });
    });
    
    req.on('timeout', () => {
      const endTime = performance.now();
      reject({
        error: new Error('Request timeout'),
        timing: {
          total: endTime - startTime,
          response: 0,
          dns: 0,
          connection: 0
        }
      });
    });
    
    req.end();
  });
}

// Performance test function with detailed metrics
async function testEndpointPerformance(name, url, expectedStatus = 200, category = 'test', iterations = 1) {
  console.log(`\n🚀 Performance Testing: ${name}`);
  console.log(`   URL: ${url}`);
  console.log(`   Category: ${category}`);
  console.log(`   Iterations: ${iterations}`);
  
  const testResults = [];
  let successCount = 0;
  let totalTime = 0;
  let minTime = Infinity;
  let maxTime = 0;
  
  for (let i = 0; i < iterations; i++) {
    try {
      const result = await makeRequest(url);
      const duration = result.timing.total;
      
      const success = result.status === expectedStatus;
      if (success) {
        successCount++;
        totalTime += duration;
        minTime = Math.min(minTime, duration);
        maxTime = Math.max(maxTime, duration);
      }
      
      testResults.push({
        iteration: i + 1,
        success,
        status: result.status,
        duration,
        timing: result.timing,
        dataSize: JSON.stringify(result.data).length,
        error: success ? null : result.data?.error || 'Unknown error'
      });
      
      // Small delay between requests to avoid overwhelming the server
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      testResults.push({
        iteration: i + 1,
        success: false,
        status: 'ERROR',
        duration: error.timing?.total || 0,
        timing: error.timing || { total: 0, response: 0, dns: 0, connection: 0 },
        dataSize: 0,
        error: error.error?.message || error.message || 'Unknown error'
      });
    }
  }
  
  const avgTime = successCount > 0 ? totalTime / successCount : 0;
  const successRate = (successCount / iterations) * 100;
  
  // Performance rating
  let rating = 'critical';
  if (avgTime < PERFORMANCE_THRESHOLDS.excellent) rating = 'excellent';
  else if (avgTime < PERFORMANCE_THRESHOLDS.good) rating = 'good';
  else if (avgTime < PERFORMANCE_THRESHOLDS.acceptable) rating = 'acceptable';
  else if (avgTime < PERFORMANCE_THRESHOLDS.slow) rating = 'slow';
  
  const testResult = {
    name,
    url,
    category,
    iterations,
    successCount,
    successRate,
    avgTime,
    minTime: minTime === Infinity ? 0 : minTime,
    maxTime,
    rating,
    results: testResults
  };
  
  // Update category stats
  if (perfResults.categories[category]) {
    perfResults.categories[category].tests.push(testResult);
    const categoryTests = perfResults.categories[category].tests;
    perfResults.categories[category].avgTime = categoryTests.reduce((sum, t) => sum + t.avgTime, 0) / categoryTests.length;
    perfResults.categories[category].maxTime = Math.max(...categoryTests.map(t => t.maxTime));
    perfResults.categories[category].minTime = Math.min(...categoryTests.map(t => t.minTime));
  }
  
  perfResults.totalTests++;
  if (successRate >= 95) {
    perfResults.passed++;
  } else {
    perfResults.failed++;
  }
  
  // Console output
  console.log(`   📊 Results: ${successCount}/${iterations} successful (${successRate.toFixed(1)}%)`);
  console.log(`   ⏱️  Average Time: ${avgTime.toFixed(0)}ms`);
  console.log(`   🏃 Min Time: ${testResult.minTime.toFixed(0)}ms`);
  console.log(`   🐌 Max Time: ${testResult.maxTime.toFixed(0)}ms`);
  console.log(`   🎯 Rating: ${rating.toUpperCase()}`);
  
  if (rating === 'slow' || rating === 'critical') {
    console.log(`   ⚠️  Performance Issue: ${avgTime.toFixed(0)}ms exceeds threshold`);
  }
  
  return testResult;
}

// Load testing function
async function loadTestEndpoint(name, url, concurrentRequests = CONCURRENT_REQUESTS, duration = 10000) {
  console.log(`\n🔥 Load Testing: ${name}`);
  console.log(`   URL: ${url}`);
  console.log(`   Concurrent Requests: ${concurrentRequests}`);
  console.log(`   Duration: ${duration}ms`);
  
  const startTime = Date.now();
  const results = [];
  let requestCount = 0;
  let successCount = 0;
  let totalResponseTime = 0;
  
  const makeConcurrentRequest = async () => {
    while (Date.now() - startTime < duration) {
      try {
        const result = await makeRequest(url);
        requestCount++;
        if (result.status === 200) successCount++;
        totalResponseTime += result.timing.total;
        results.push({
          timestamp: Date.now() - startTime,
          success: result.status === 200,
          responseTime: result.timing.total,
          status: result.status
        });
      } catch (error) {
        requestCount++;
        results.push({
          timestamp: Date.now() - startTime,
          success: false,
          responseTime: error.timing?.total || 0,
          status: 'ERROR',
          error: error.error?.message || error.message
        });
      }
    }
  };
  
  // Start concurrent requests
  const promises = Array(concurrentRequests).fill().map(() => makeConcurrentRequest());
  await Promise.all(promises);
  
  const actualDuration = Date.now() - startTime;
  const avgResponseTime = requestCount > 0 ? totalResponseTime / requestCount : 0;
  const requestsPerSecond = (requestCount / actualDuration) * 1000;
  const successRate = requestCount > 0 ? (successCount / requestCount) * 100 : 0;
  
  const loadTestResult = {
    name,
    url,
    concurrentRequests,
    duration: actualDuration,
    totalRequests: requestCount,
    successfulRequests: successCount,
    successRate,
    avgResponseTime,
    requestsPerSecond,
    results
  };
  
  perfResults.loadTests.push(loadTestResult);
  
  console.log(`   📊 Total Requests: ${requestCount}`);
  console.log(`   ✅ Successful: ${successCount} (${successRate.toFixed(1)}%)`);
  console.log(`   ⏱️  Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`   🚀 Requests/Second: ${requestsPerSecond.toFixed(1)}`);
  
  return loadTestResult;
}

// Main performance testing function
async function runPerformanceTests() {
  console.log('🚀 Starting Performance Testing for Baakh API Endpoints');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  console.log(`🔥 Concurrent Requests: ${CONCURRENT_REQUESTS}`);
  
  if (!BASE_URL || BASE_URL.includes('your-domain')) {
    console.log('\n❌ Please provide a valid production URL:');
    console.log('   node performance-test.js https://your-app.vercel.app');
    console.log('   or set PRODUCTION_URL environment variable');
    process.exit(1);
  }
  
  // ===== CRITICAL ENDPOINTS - Performance Testing =====
  console.log('\n🔥 CRITICAL ENDPOINTS - Performance Testing');
  console.log('==========================================');
  
  await testEndpointPerformance(
    'Admin Stats API',
    `${BASE_URL}/api/admin/stats`,
    200,
    'critical',
    3
  );
  
  await testEndpointPerformance(
    'Poets List API',
    `${BASE_URL}/api/poets?limit=10`,
    200,
    'critical',
    3
  );
  
  await testEndpointPerformance(
    'Categories API',
    `${BASE_URL}/api/categories?limit=10`,
    200,
    'critical',
    3
  );
  
  await testEndpointPerformance(
    'Couplets API',
    `${BASE_URL}/api/couplets?limit=10`,
    200,
    'critical',
    3
  );
  
  await testEndpointPerformance(
    'Poetry API',
    `${BASE_URL}/api/poetry?limit=10`,
    200,
    'critical',
    3
  );
  
  // ===== ADMIN ENDPOINTS - Performance Testing =====
  console.log('\n👑 ADMIN ENDPOINTS - Performance Testing');
  console.log('=======================================');
  
  await testEndpointPerformance(
    'Admin Tags API',
    `${BASE_URL}/api/admin/tags`,
    200,
    'admin',
    2
  );
  
  await testEndpointPerformance(
    'System Status API',
    `${BASE_URL}/api/admin/system-status`,
    200,
    'admin',
    2
  );
  
  await testEndpointPerformance(
    'Admin Categories API',
    `${BASE_URL}/api/admin/categories`,
    200,
    'admin',
    2
  );
  
  // ===== CONTENT ENDPOINTS - Performance Testing =====
  console.log('\n📚 CONTENT ENDPOINTS - Performance Testing');
  console.log('==========================================');
  
  await testEndpointPerformance(
    'Poetry Categories API',
    `${BASE_URL}/api/poetry/categories`,
    200,
    'content',
    2
  );
  
  await testEndpointPerformance(
    'Poetry Detail API',
    `${BASE_URL}/api/poetry/detail?id=1`,
    200,
    'content',
    2
  );
  
  await testEndpointPerformance(
    'Poetry by Poet API',
    `${BASE_URL}/api/poetry/by-poet?poetId=1&limit=5`,
    200,
    'content',
    2
  );
  
  await testEndpointPerformance(
    'Timeline Periods API',
    `${BASE_URL}/api/timeline/periods?limit=5`,
    200,
    'content',
    2
  );
  
  // ===== SEARCH ENDPOINTS - Performance Testing =====
  console.log('\n🔍 SEARCH ENDPOINTS - Performance Testing');
  console.log('=========================================');
  
  await testEndpointPerformance(
    'Search API',
    `${BASE_URL}/api/search?q=test&limit=5`,
    200,
    'search',
    2
  );
  
  await testEndpointPerformance(
    'Search Simple API',
    `${BASE_URL}/api/search-simple?q=test&limit=5`,
    200,
    'search',
    2
  );
  
  // ===== LOAD TESTING - Critical Endpoints =====
  console.log('\n🔥 LOAD TESTING - Critical Endpoints');
  console.log('====================================');
  
  await loadTestEndpoint(
    'Poets List Load Test',
    `${BASE_URL}/api/poets?limit=5`,
    5,
    5000
  );
  
  await loadTestEndpoint(
    'Couplets Load Test',
    `${BASE_URL}/api/couplets?limit=5`,
    5,
    5000
  );
  
  await loadTestEndpoint(
    'Search Load Test',
    `${BASE_URL}/api/search?q=test&limit=5`,
    3,
    3000
  );
  
  // Generate comprehensive performance report
  generatePerformanceReport();
}

// Generate comprehensive performance report
function generatePerformanceReport() {
  console.log('\n📊 COMPREHENSIVE PERFORMANCE REPORT');
  console.log('====================================');
  
  // Overall statistics
  console.log(`\n📈 Overall Statistics:`);
  console.log(`   Total Tests: ${perfResults.totalTests}`);
  console.log(`   Passed: ${perfResults.passed}`);
  console.log(`   Failed: ${perfResults.failed}`);
  console.log(`   Success Rate: ${((perfResults.passed / perfResults.totalTests) * 100).toFixed(1)}%`);
  
  // Category performance analysis
  console.log(`\n📋 Performance by Category:`);
  console.log('==========================');
  Object.entries(perfResults.categories).forEach(([category, stats]) => {
    if (stats.tests.length > 0) {
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`   Tests: ${stats.tests.length}`);
      console.log(`   Avg Response Time: ${stats.avgTime.toFixed(0)}ms`);
      console.log(`   Fastest: ${stats.minTime.toFixed(0)}ms`);
      console.log(`   Slowest: ${stats.maxTime.toFixed(0)}ms`);
      
      // Performance issues in this category
      const slowTests = stats.tests.filter(test => test.rating === 'slow' || test.rating === 'critical');
      if (slowTests.length > 0) {
        console.log(`   ⚠️  Performance Issues: ${slowTests.length} endpoints`);
        slowTests.forEach(test => {
          console.log(`      • ${test.name}: ${test.avgTime.toFixed(0)}ms (${test.rating})`);
        });
      }
    }
  });
  
  // Load testing results
  if (perfResults.loadTests.length > 0) {
    console.log(`\n🔥 Load Testing Results:`);
    console.log('=======================');
    perfResults.loadTests.forEach(test => {
      console.log(`\n${test.name}:`);
      console.log(`   Total Requests: ${test.totalRequests}`);
      console.log(`   Success Rate: ${test.successRate.toFixed(1)}%`);
      console.log(`   Avg Response Time: ${test.avgResponseTime.toFixed(0)}ms`);
      console.log(`   Requests/Second: ${test.requestsPerSecond.toFixed(1)}`);
      
      if (test.successRate < 95) {
        console.log(`   ⚠️  Low Success Rate: ${test.successRate.toFixed(1)}%`);
      }
      if (test.avgResponseTime > 2000) {
        console.log(`   ⚠️  Slow Response Time: ${test.avgResponseTime.toFixed(0)}ms`);
      }
    });
  }
  
  // Performance recommendations
  console.log(`\n💡 Performance Recommendations:`);
  console.log('===============================');
  
  const allTests = Object.values(perfResults.categories).flatMap(cat => cat.tests);
  const slowEndpoints = allTests.filter(test => test.rating === 'slow' || test.rating === 'critical');
  
  if (slowEndpoints.length > 0) {
    console.log(`   🐌 Optimize ${slowEndpoints.length} slow endpoints:`);
    slowEndpoints.forEach(test => {
      console.log(`      • ${test.name}: ${test.avgTime.toFixed(0)}ms → Target: <${PERFORMANCE_THRESHOLDS.acceptable}ms`);
    });
  }
  
  const criticalTests = perfResults.categories.critical.tests;
  if (criticalTests.length > 0) {
    const avgCriticalTime = criticalTests.reduce((sum, test) => sum + test.avgTime, 0) / criticalTests.length;
    if (avgCriticalTime > PERFORMANCE_THRESHOLDS.good) {
      console.log(`   ⚡ Critical endpoints need optimization: ${avgCriticalTime.toFixed(0)}ms average`);
    }
  }
  
  const loadTestIssues = perfResults.loadTests.filter(test => test.successRate < 95 || test.avgResponseTime > 2000);
  if (loadTestIssues.length > 0) {
    console.log(`   🔥 Load testing revealed ${loadTestIssues.length} scalability issues`);
  }
  
  // Performance score
  const performanceScore = calculatePerformanceScore();
  console.log(`\n🎯 Performance Score: ${performanceScore}/100`);
  
  if (performanceScore >= 90) {
    console.log(`   ✅ Excellent performance - Production ready`);
  } else if (performanceScore >= 75) {
    console.log(`   ⚠️  Good performance - Minor optimizations needed`);
  } else if (performanceScore >= 60) {
    console.log(`   ⚠️  Acceptable performance - Optimization recommended`);
  } else {
    console.log(`   ❌ Poor performance - Major optimization required`);
  }
  
  // Production readiness assessment
  console.log(`\n🚀 Production Readiness Assessment:`);
  console.log('==================================');
  
  const criticalIssues = slowEndpoints.filter(test => test.category === 'critical').length;
  const loadTestFailures = perfResults.loadTests.filter(test => test.successRate < 90).length;
  
  if (criticalIssues === 0 && loadTestFailures === 0) {
    console.log(`   ✅ Production Ready - All critical endpoints performing well`);
  } else if (criticalIssues <= 1 && loadTestFailures <= 1) {
    console.log(`   ⚠️  Mostly Ready - ${criticalIssues} critical issues, ${loadTestFailures} load test failures`);
  } else {
    console.log(`   ❌ Not Ready - ${criticalIssues} critical issues, ${loadTestFailures} load test failures`);
  }
}

// Calculate overall performance score
function calculatePerformanceScore() {
  const allTests = Object.values(perfResults.categories).flatMap(cat => cat.tests);
  if (allTests.length === 0) return 0;
  
  let score = 100;
  
  // Deduct points for slow endpoints
  allTests.forEach(test => {
    if (test.rating === 'critical') score -= 20;
    else if (test.rating === 'slow') score -= 10;
    else if (test.rating === 'acceptable') score -= 5;
  });
  
  // Deduct points for load test failures
  perfResults.loadTests.forEach(test => {
    if (test.successRate < 90) score -= 15;
    else if (test.successRate < 95) score -= 10;
    else if (test.avgResponseTime > 5000) score -= 10;
    else if (test.avgResponseTime > 2000) score -= 5;
  });
  
  return Math.max(0, score);
}

// Run the performance tests
runPerformanceTests().catch(error => {
  console.error('❌ Performance test runner failed:', error);
  process.exit(1);
});
