#!/usr/bin/env node

/**
 * Production API Testing Script
 * Tests critical API endpoints in production environment
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.PRODUCTION_URL || process.argv[2] || 'https://your-domain.example.com';
const TIMEOUT = 15000; // 15 seconds for production

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
      
      // Log key response data for successful requests
      if (response.data && typeof response.data === 'object') {
        if (response.data.success !== undefined) {
          console.log(`   📊 Success: ${response.data.success}`);
        }
        if (response.data.total !== undefined) {
          console.log(`   📈 Total Records: ${response.data.total}`);
        }
        if (response.data.error) {
          console.log(`   ⚠️  Error in Response: ${response.data.error}`);
        }
      }
    } else {
      results.failed++;
      console.log(`   ❌ FAILED (${response.status}) - Expected ${expectedStatus} - ${duration}ms`);
      
      // Log error details
      if (response.data && response.data.error) {
        console.log(`   🔍 Error: ${response.data.error}`);
      }
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
  console.log('🚀 Starting Production API Endpoints Testing');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  
  if (!BASE_URL || BASE_URL.includes('your-domain')) {
    console.log('\n❌ Please provide a valid production URL:');
    console.log('   node test-production-api.js https://your-app.example.com');
    console.log('   or set PRODUCTION_URL environment variable');
    process.exit(1);
  }
  
  // Core API Endpoints - Critical for app functionality
  await testEndpoint(
    'Admin Stats API',
    `${BASE_URL}/api/admin/stats`,
    200,
    'Critical: Admin dashboard statistics'
  );
  
  await testEndpoint(
    'Poets List API',
    `${BASE_URL}/api/poets?limit=5`,
    200,
    'Critical: Main poets listing'
  );
  
  await testEndpoint(
    'Categories API',
    `${BASE_URL}/api/categories?limit=5`,
    200,
    'Critical: Categories for navigation'
  );
  
  await testEndpoint(
    'Couplets API',
    `${BASE_URL}/api/couplets?limit=5`,
    200,
    'Critical: Main content API'
  );
  
  // Admin endpoints
  await testEndpoint(
    'Admin Tags API',
    `${BASE_URL}/api/admin/tags`,
    200,
    'Admin: Tags management'
  );
  
  await testEndpoint(
    'System Status API',
    `${BASE_URL}/api/admin/system-status`,
    200,
    'Admin: System health check'
  );
  
  // Timeline endpoints
  await testEndpoint(
    'Timeline Periods API',
    `${BASE_URL}/api/timeline/periods?limit=5`,
    200,
    'Timeline: Historical periods'
  );
  
  // Test endpoints
  await testEndpoint(
    'Poetry Test API',
    `${BASE_URL}/api/poetry/test`,
    200,
    'Test: Database connectivity'
  );
  
  // Error handling tests
  await testEndpoint(
    'Non-existent Poet API',
    `${BASE_URL}/api/poets/non-existent-poet-12345`,
    404,
    'Error Handling: 404 for missing poet'
  );
  
  await testEndpoint(
    'Invalid Category API',
    `${BASE_URL}/api/categories/invalid-category-12345`,
    404,
    'Error Handling: 404 for missing category'
  );
  
  // Test with a real poet slug if available
  await testEndpoint(
    'Poet by Slug API (Direct)',
    `${BASE_URL}/api/poets/shaikh-ayaz/direct`,
    200,
    'Poet: Direct database lookup'
  );
  
  // Print results
  console.log('\n📊 Production Test Results Summary');
  console.log('=====================================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total:  ${results.total}`);
  console.log(`🎯 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  // Performance analysis
  const successfulTests = results.details.filter(test => test.success && test.duration > 0);
  if (successfulTests.length > 0) {
    const avgDuration = successfulTests.reduce((sum, test) => sum + test.duration, 0) / successfulTests.length;
    const maxDuration = Math.max(...successfulTests.map(test => test.duration));
    const minDuration = Math.min(...successfulTests.map(test => test.duration));
    
    console.log(`\n⚡ Performance Analysis:`);
    console.log(`   Average Response Time: ${avgDuration.toFixed(0)}ms`);
    console.log(`   Fastest Response: ${minDuration}ms`);
    console.log(`   Slowest Response: ${maxDuration}ms`);
    
    // Flag slow endpoints
    const slowTests = successfulTests.filter(test => test.duration > 5000);
    if (slowTests.length > 0) {
      console.log(`\n🐌 Slow Endpoints (>5s):`);
      slowTests.forEach(test => {
        console.log(`   • ${test.name}: ${test.duration}ms`);
      });
    }
  }
  
  // Detailed results for failed tests
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
          const errorMsg = test.response.error || test.response.message || 'Unknown error';
          console.log(`  Response Error: ${errorMsg}`);
        }
      });
  }
  
  // Production readiness assessment
  const criticalTests = results.details.filter(test => 
    test.description.includes('Critical') && test.success
  );
  
  console.log(`\n🎯 Production Readiness:`);
  console.log(`   Critical APIs Working: ${criticalTests.length}/4`);
  
  if (criticalTests.length === 4) {
    console.log(`   ✅ Production Ready - All critical APIs working`);
  } else if (criticalTests.length >= 2) {
    console.log(`   ⚠️  Partially Ready - Some critical APIs failing`);
  } else {
    console.log(`   ❌ Not Ready - Most critical APIs failing`);
  }
  
  // Exit with appropriate code
  const criticalFailures = results.details.filter(test => 
    test.description.includes('Critical') && !test.success
  ).length;
  
  process.exit(criticalFailures > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
