#!/usr/bin/env node

/**
 * API Endpoints Testing Script
 * Tests all critical API endpoints to ensure they work in production
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
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
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

// Test function
async function testEndpoint(name, url, expectedStatus = 200, description = '') {
  results.total++;
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  console.log(`   Expected Status: ${expectedStatus}`);
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(url);
    const duration = Date.now() - startTime;
    
    const success = response.status === expectedStatus;
    
    if (success) {
      results.passed++;
      console.log(`   ✅ PASSED (${response.status}) - ${duration}ms`);
    } else {
      results.failed++;
      console.log(`   ❌ FAILED (${response.status}) - Expected ${expectedStatus} - ${duration}ms`);
    }
    
    results.details.push({
      name,
      url,
      expectedStatus,
      actualStatus: response.status,
      duration,
      success,
      description,
      response: response.data
    });
    
  } catch (error) {
    results.failed++;
    console.log(`   ❌ ERROR - ${error.message}`);
    
    results.details.push({
      name,
      url,
      expectedStatus,
      actualStatus: 'ERROR',
      duration: 0,
      success: false,
      description,
      error: error.message
    });
  }
}

// Main testing function
async function runTests() {
  console.log('🚀 Starting API Endpoints Testing');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  
  // Core API Endpoints
  await testEndpoint(
    'Admin Stats API',
    `${BASE_URL}/api/admin/stats`,
    200,
    'Should return admin statistics or fallback data'
  );
  
  await testEndpoint(
    'Poets List API',
    `${BASE_URL}/api/poets?limit=5`,
    200,
    'Should return list of poets'
  );
  
  await testEndpoint(
    'Categories API',
    `${BASE_URL}/api/categories?limit=5`,
    200,
    'Should return list of categories'
  );
  
  await testEndpoint(
    'Couplets API',
    `${BASE_URL}/api/couplets?limit=5`,
    200,
    'Should return list of couplets'
  );
  
  await testEndpoint(
    'Simple Couplets API',
    `${BASE_URL}/api/simple-couplets?limit=5`,
    200,
    'Should return simple couplets'
  );
  
  // Test specific poet (if available)
  await testEndpoint(
    'Poet by ID API (Direct)',
    `${BASE_URL}/api/poets/test-poet/direct`,
    200,
    'Should handle poet lookup with direct database connection'
  );
  
  await testEndpoint(
    'Poet by ID API (Backend)',
    `${BASE_URL}/api/poets/test-poet`,
    200,
    'Should handle poet lookup with backend API'
  );
  
  // Admin endpoints
  await testEndpoint(
    'Admin Tags API',
    `${BASE_URL}/api/admin/tags`,
    200,
    'Should return admin tags data'
  );
  
  await testEndpoint(
    'Admin Romanizer API',
    `${BASE_URL}/api/admin/romanizer`,
    200,
    'Should return romanizer API info'
  );
  
  // Timeline endpoints
  await testEndpoint(
    'Timeline Periods API',
    `${BASE_URL}/api/timeline/periods?limit=5`,
    200,
    'Should return timeline periods'
  );
  
  await testEndpoint(
    'Timeline Events API',
    `${BASE_URL}/api/timeline/events?limit=5`,
    200,
    'Should return timeline events'
  );
  
  // Test endpoints
  await testEndpoint(
    'Poetry Test API',
    `${BASE_URL}/api/poetry/test`,
    200,
    'Should test database connections'
  );
  
  await testEndpoint(
    'Test Couplets API',
    `${BASE_URL}/api/test-couplets?limit=5`,
    200,
    'Should return test couplets data'
  );
  
  // Health check endpoints
  await testEndpoint(
    'System Status API',
    `${BASE_URL}/api/admin/system-status`,
    200,
    'Should return system health status'
  );
  
  // Error handling tests
  await testEndpoint(
    'Non-existent Poet API',
    `${BASE_URL}/api/poets/non-existent-poet-12345`,
    404,
    'Should return 404 for non-existent poet'
  );
  
  await testEndpoint(
    'Invalid Category API',
    `${BASE_URL}/api/categories/invalid-category-12345`,
    404,
    'Should return 404 for non-existent category'
  );
  
  // Print results
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total:  ${results.total}`);
  console.log(`🎯 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  // Detailed results
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests Details:');
    console.log('========================');
    results.details
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`\n• ${test.name}`);
        console.log(`  URL: ${test.url}`);
        console.log(`  Expected: ${test.expectedStatus}, Got: ${test.actualStatus}`);
        if (test.error) {
          console.log(`  Error: ${test.error}`);
        }
        if (test.response && typeof test.response === 'object') {
          console.log(`  Response: ${JSON.stringify(test.response, null, 2).substring(0, 200)}...`);
        }
      });
  }
  
  // Performance summary
  const avgDuration = results.details
    .filter(test => test.duration > 0)
    .reduce((sum, test) => sum + test.duration, 0) / results.details.length;
  
  console.log(`\n⚡ Average Response Time: ${avgDuration.toFixed(0)}ms`);
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
