#!/usr/bin/env node

/**
 * Advanced Load Testing Script for Baakh API Endpoints
 * Simulates high traffic scenarios and stress tests the production environment
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = process.env.PRODUCTION_URL || process.argv[2] || 'http://localhost:3000';
const TIMEOUT = 30000;
const MAX_CONCURRENT = 50; // Maximum concurrent requests
const TEST_DURATION = 60000; // 1 minute default test duration

// Load test scenarios
const LOAD_SCENARIOS = {
  light: { concurrent: 5, duration: 30000, name: 'Light Load' },
  medium: { concurrent: 15, duration: 45000, name: 'Medium Load' },
  heavy: { concurrent: 30, duration: 60000, name: 'Heavy Load' },
  stress: { concurrent: 50, duration: 90000, name: 'Stress Test' }
};

// Test endpoints with different characteristics
const TEST_ENDPOINTS = [
  { name: 'Poets List', url: '/api/poets?limit=10', weight: 30, critical: true },
  { name: 'Couplets List', url: '/api/couplets?limit=10', weight: 25, critical: true },
  { name: 'Categories', url: '/api/categories?limit=10', weight: 15, critical: true },
  { name: 'Poetry List', url: '/api/poetry?limit=10', weight: 20, critical: true },
  { name: 'Search', url: '/api/search?q=test&limit=5', weight: 10, critical: false },
  { name: 'Admin Stats', url: '/api/admin/stats', weight: 5, critical: false },
  { name: 'Timeline Periods', url: '/api/timeline/periods?limit=5', weight: 5, critical: false }
];

// Load test results
const loadTestResults = {
  scenarios: {},
  overall: {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    errors: {}
  }
};

// Helper function to make HTTP requests
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
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            responseTime,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        }
      });
    });

    req.on('error', (error) => {
      const endTime = performance.now();
      reject({
        error: error.message,
        responseTime: endTime - startTime,
        success: false
      });
    });
    
    req.on('timeout', () => {
      const endTime = performance.now();
      reject({
        error: 'Request timeout',
        responseTime: endTime - startTime,
        success: false
      });
    });
    
    req.end();
  });
}

// Select endpoint based on weight distribution
function selectEndpoint() {
  const totalWeight = TEST_ENDPOINTS.reduce((sum, endpoint) => sum + endpoint.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const endpoint of TEST_ENDPOINTS) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  
  return TEST_ENDPOINTS[0]; // Fallback
}

// Worker function for concurrent requests
async function loadTestWorker(workerId, scenario, results) {
  const startTime = Date.now();
  const endTime = startTime + scenario.duration;
  let requestCount = 0;
  let successCount = 0;
  let totalResponseTime = 0;
  let minResponseTime = Infinity;
  let maxResponseTime = 0;
  const errors = {};
  
  console.log(`   Worker ${workerId} started`);
  
  while (Date.now() < endTime) {
    const endpoint = selectEndpoint();
    const fullUrl = `${BASE_URL}${endpoint.url}`;
    
    try {
      const result = await makeRequest(fullUrl);
      requestCount++;
      totalResponseTime += result.responseTime;
      minResponseTime = Math.min(minResponseTime, result.responseTime);
      maxResponseTime = Math.max(maxResponseTime, result.responseTime);
      
      if (result.success) {
        successCount++;
      } else {
        const errorKey = `status_${result.status}`;
        errors[errorKey] = (errors[errorKey] || 0) + 1;
      }
      
      results.push({
        workerId,
        endpoint: endpoint.name,
        url: fullUrl,
        timestamp: Date.now() - startTime,
        success: result.success,
        status: result.status,
        responseTime: result.responseTime,
        critical: endpoint.critical
      });
      
    } catch (error) {
      requestCount++;
      const errorKey = error.error || 'unknown_error';
      errors[errorKey] = (errors[errorKey] || 0) + 1;
      
      results.push({
        workerId,
        endpoint: endpoint.name,
        url: fullUrl,
        timestamp: Date.now() - startTime,
        success: false,
        status: 'ERROR',
        responseTime: error.responseTime || 0,
        error: error.error,
        critical: endpoint.critical
      });
    }
    
    // Small delay to prevent overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  const workerStats = {
    workerId,
    duration: Date.now() - startTime,
    totalRequests: requestCount,
    successfulRequests: successCount,
    successRate: requestCount > 0 ? (successCount / requestCount) * 100 : 0,
    avgResponseTime: requestCount > 0 ? totalResponseTime / requestCount : 0,
    minResponseTime: minResponseTime === Infinity ? 0 : minResponseTime,
    maxResponseTime,
    errors
  };
  
  console.log(`   Worker ${workerId} completed: ${successCount}/${requestCount} requests (${workerStats.successRate.toFixed(1)}%)`);
  
  return workerStats;
}

// Run load test scenario
async function runLoadTestScenario(scenarioName, scenario) {
  console.log(`\n🔥 Running ${scenarioName}: ${scenario.name}`);
  console.log(`   Concurrent Workers: ${scenario.concurrent}`);
  console.log(`   Duration: ${scenario.duration}ms`);
  console.log(`   Target RPS: ~${(scenario.concurrent * 10).toFixed(0)} (estimated)`);
  
  const startTime = Date.now();
  const results = [];
  
  // Start concurrent workers
  const workers = [];
  for (let i = 0; i < scenario.concurrent; i++) {
    workers.push(loadTestWorker(i + 1, scenario, results));
  }
  
  // Wait for all workers to complete
  const workerStats = await Promise.all(workers);
  const actualDuration = Date.now() - startTime;
  
  // Calculate scenario statistics
  const totalRequests = results.length;
  const successfulRequests = results.filter(r => r.success).length;
  const failedRequests = totalRequests - successfulRequests;
  const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
  
  const responseTimes = results.map(r => r.responseTime).filter(rt => rt > 0);
  const avgResponseTime = responseTimes.length > 0 ? 
    responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length : 0;
  const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
  const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
  
  const requestsPerSecond = (totalRequests / actualDuration) * 1000;
  
  // Error analysis
  const errors = {};
  results.filter(r => !r.success).forEach(r => {
    const errorKey = r.status || 'unknown_error';
    errors[errorKey] = (errors[errorKey] || 0) + 1;
  });
  
  // Critical endpoint analysis
  const criticalResults = results.filter(r => r.critical);
  const criticalSuccessRate = criticalResults.length > 0 ? 
    (criticalResults.filter(r => r.success).length / criticalResults.length) * 100 : 100;
  
  const scenarioResult = {
    name: scenarioName,
    scenario,
    duration: actualDuration,
    totalRequests,
    successfulRequests,
    failedRequests,
    successRate,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
    requestsPerSecond,
    errors,
    criticalSuccessRate,
    workerStats,
    results
  };
  
  loadTestResults.scenarios[scenarioName] = scenarioResult;
  
  // Update overall statistics
  loadTestResults.overall.totalRequests += totalRequests;
  loadTestResults.overall.successfulRequests += successfulRequests;
  loadTestResults.overall.failedRequests += failedRequests;
  loadTestResults.overall.totalResponseTime += responseTimes.reduce((sum, rt) => sum + rt, 0);
  loadTestResults.overall.minResponseTime = Math.min(loadTestResults.overall.minResponseTime, minResponseTime);
  loadTestResults.overall.maxResponseTime = Math.max(loadTestResults.overall.maxResponseTime, maxResponseTime);
  
  Object.entries(errors).forEach(([error, count]) => {
    loadTestResults.overall.errors[error] = (loadTestResults.overall.errors[error] || 0) + count;
  });
  
  // Console output
  console.log(`\n📊 ${scenarioName} Results:`);
  console.log(`   Duration: ${(actualDuration / 1000).toFixed(1)}s`);
  console.log(`   Total Requests: ${totalRequests}`);
  console.log(`   Successful: ${successfulRequests} (${successRate.toFixed(1)}%)`);
  console.log(`   Failed: ${failedRequests}`);
  console.log(`   Requests/Second: ${requestsPerSecond.toFixed(1)}`);
  console.log(`   Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`   Min Response Time: ${minResponseTime.toFixed(0)}ms`);
  console.log(`   Max Response Time: ${maxResponseTime.toFixed(0)}ms`);
  console.log(`   Critical Endpoints Success: ${criticalSuccessRate.toFixed(1)}%`);
  
  if (Object.keys(errors).length > 0) {
    console.log(`   Errors:`);
    Object.entries(errors).forEach(([error, count]) => {
      console.log(`      ${error}: ${count}`);
    });
  }
  
  // Performance assessment
  if (successRate < 95) {
    console.log(`   ⚠️  Low Success Rate: ${successRate.toFixed(1)}%`);
  }
  if (avgResponseTime > 2000) {
    console.log(`   ⚠️  Slow Response Time: ${avgResponseTime.toFixed(0)}ms`);
  }
  if (criticalSuccessRate < 90) {
    console.log(`   🚨 Critical Endpoints Failing: ${criticalSuccessRate.toFixed(1)}%`);
  }
  
  return scenarioResult;
}

// Generate comprehensive load test report
function generateLoadTestReport() {
  console.log('\n📊 COMPREHENSIVE LOAD TEST REPORT');
  console.log('==================================');
  
  // Overall statistics
  const overall = loadTestResults.overall;
  const overallSuccessRate = overall.totalRequests > 0 ? 
    (overall.successfulRequests / overall.totalRequests) * 100 : 0;
  const overallAvgResponseTime = overall.totalRequests > 0 ? 
    overall.totalResponseTime / overall.totalRequests : 0;
  
  console.log(`\n📈 Overall Statistics:`);
  console.log(`   Total Requests: ${overall.totalRequests}`);
  console.log(`   Successful: ${overall.successfulRequests} (${overallSuccessRate.toFixed(1)}%)`);
  console.log(`   Failed: ${overall.failedRequests}`);
  console.log(`   Avg Response Time: ${overallAvgResponseTime.toFixed(0)}ms`);
  console.log(`   Min Response Time: ${overall.minResponseTime.toFixed(0)}ms`);
  console.log(`   Max Response Time: ${overall.maxResponseTime.toFixed(0)}ms`);
  
  if (Object.keys(overall.errors).length > 0) {
    console.log(`\n❌ Overall Error Summary:`);
    Object.entries(overall.errors).forEach(([error, count]) => {
      console.log(`   ${error}: ${count}`);
    });
  }
  
  // Scenario comparison
  console.log(`\n📋 Scenario Comparison:`);
  console.log('======================');
  Object.entries(loadTestResults.scenarios).forEach(([name, scenario]) => {
    console.log(`\n${name}:`);
    console.log(`   Requests: ${scenario.totalRequests}`);
    console.log(`   Success Rate: ${scenario.successRate.toFixed(1)}%`);
    console.log(`   RPS: ${scenario.requestsPerSecond.toFixed(1)}`);
    console.log(`   Avg Response: ${scenario.avgResponseTime.toFixed(0)}ms`);
    console.log(`   Critical Success: ${scenario.criticalSuccessRate.toFixed(1)}%`);
  });
  
  // Performance recommendations
  console.log(`\n💡 Performance Recommendations:`);
  console.log('===============================');
  
  const scenarios = Object.values(loadTestResults.scenarios);
  const problematicScenarios = scenarios.filter(s => s.successRate < 95 || s.avgResponseTime > 2000);
  
  if (problematicScenarios.length > 0) {
    console.log(`   🚨 ${problematicScenarios.length} scenarios showed performance issues:`);
    problematicScenarios.forEach(scenario => {
      console.log(`      • ${scenario.name}: ${scenario.successRate.toFixed(1)}% success, ${scenario.avgResponseTime.toFixed(0)}ms avg`);
    });
  }
  
  const criticalIssues = scenarios.filter(s => s.criticalSuccessRate < 90);
  if (criticalIssues.length > 0) {
    console.log(`   🔥 ${criticalIssues.length} scenarios had critical endpoint failures`);
  }
  
  const highRPS = scenarios.filter(s => s.requestsPerSecond > 20);
  if (highRPS.length > 0) {
    console.log(`   ⚡ ${highRPS.length} scenarios achieved high RPS (>20) - good scalability`);
  }
  
  // Production readiness assessment
  console.log(`\n🚀 Production Readiness Assessment:`);
  console.log('==================================');
  
  const allScenariosPassed = scenarios.every(s => s.successRate >= 95 && s.criticalSuccessRate >= 90);
  const avgResponseTime = scenarios.reduce((sum, s) => sum + s.avgResponseTime, 0) / scenarios.length;
  
  if (allScenariosPassed && avgResponseTime < 2000) {
    console.log(`   ✅ Production Ready - All scenarios passed with good performance`);
  } else if (allScenariosPassed && avgResponseTime < 5000) {
    console.log(`   ⚠️  Mostly Ready - All scenarios passed but response times could be improved`);
  } else {
    console.log(`   ❌ Not Ready - Performance issues detected in ${problematicScenarios.length} scenarios`);
  }
  
  // Capacity planning
  console.log(`\n📊 Capacity Planning:`);
  console.log('===================');
  
  const maxRPS = Math.max(...scenarios.map(s => s.requestsPerSecond));
  const recommendedCapacity = Math.ceil(maxRPS * 1.5); // 50% headroom
  
  console.log(`   Peak RPS Achieved: ${maxRPS.toFixed(1)}`);
  console.log(`   Recommended Capacity: ${recommendedCapacity} RPS`);
  console.log(`   Concurrent Users Supported: ~${Math.ceil(recommendedCapacity / 2)} (assuming 2 RPS per user)`);
}

// Main load testing function
async function runLoadTests() {
  console.log('🚀 Starting Advanced Load Testing for Baakh API');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  console.log(`🔥 Max Concurrent: ${MAX_CONCURRENT}`);
  
  if (!BASE_URL || BASE_URL.includes('your-domain')) {
    console.log('\n❌ Please provide a valid production URL:');
    console.log('   node load-test.js https://your-app.example.com');
    console.log('   or set PRODUCTION_URL environment variable');
    process.exit(1);
  }
  
  // Run all load test scenarios
  for (const [scenarioName, scenario] of Object.entries(LOAD_SCENARIOS)) {
    await runLoadTestScenario(scenarioName, scenario);
    
    // Wait between scenarios to let the server recover
    console.log(`\n⏳ Waiting 10 seconds before next scenario...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  // Generate comprehensive report
  generateLoadTestReport();
}

// Run the load tests
runLoadTests().catch(error => {
  console.error('❌ Load test runner failed:', error);
  process.exit(1);
});
