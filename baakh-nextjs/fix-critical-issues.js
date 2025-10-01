#!/usr/bin/env node

/**
 * Critical Issues Fix Script
 * Focuses on fixing the most critical API issues identified in testing
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.PRODUCTION_URL || process.argv[2] || 'http://localhost:3000';
const TIMEOUT = 10000;

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
  console.log(`\n🔧 Testing Fix: ${name}`);
  console.log(`   URL: ${url}`);
  console.log(`   Expected Status: ${expectedStatus}`);
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(url);
    const duration = Date.now() - startTime;
    
    const success = response.status === expectedStatus;
    
    if (success) {
      results.passed++;
      console.log(`   ✅ FIXED (${response.status}) - ${duration}ms`);
      
      if (response.data && typeof response.data === 'object') {
        if (response.data.success !== undefined) {
          console.log(`   📊 Success: ${response.data.success}`);
        }
        if (response.data.error) {
          console.log(`   ⚠️  Error in Response: ${response.data.error}`);
        }
      }
    } else {
      results.failed++;
      console.log(`   ❌ STILL FAILING (${response.status}) - Expected ${expectedStatus} - ${duration}ms`);
      
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
  console.log('🔧 Critical Issues Fix Testing');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  
  // Test critical authentication issues
  console.log('\n🔐 AUTHENTICATION SYSTEM FIXES');
  console.log('================================');
  
  await testEndpoint(
    'Auth Me API (Fixed)',
    `${BASE_URL}/api/auth/me`,
    200,
    'Should work after authentication fixes'
  );
  
  await testEndpoint(
    'Auth Me Simple API (Fixed)',
    `${BASE_URL}/api/auth/me-simple`,
    200,
    'Should work after connection fixes'
  );
  
  await testEndpoint(
    'CSRF Token API (Fixed)',
    `${BASE_URL}/api/csrf`,
    200,
    'Should work after connection fixes'
  );
  
  // Test search functionality fixes
  console.log('\n🔍 SEARCH FUNCTIONALITY FIXES');
  console.log('=============================');
  
  await testEndpoint(
    'Search API (Fixed)',
    `${BASE_URL}/api/search?q=test&limit=5`,
    200,
    'Should work after search fixes'
  );
  
  await testEndpoint(
    'Search Simple API (Fixed)',
    `${BASE_URL}/api/search-simple?q=test&limit=5`,
    200,
    'Should work after search fixes'
  );
  
  // Test admin API fixes
  console.log('\n👑 ADMIN API FIXES');
  console.log('==================');
  
  await testEndpoint(
    'Admin Poets API (Fixed)',
    `${BASE_URL}/api/admin/poets`,
    200,
    'Should work after timeout fixes'
  );
  
  await testEndpoint(
    'Admin Poetry API (Fixed)',
    `${BASE_URL}/api/admin/poetry`,
    200,
    'Should work after auth fixes'
  );
  
  await testEndpoint(
    'Admin Settings API (Fixed)',
    `${BASE_URL}/api/admin/settings?userId=test-user`,
    200,
    'Should work with proper parameters'
  );
  
  // Test content API fixes
  console.log('\n📚 CONTENT API FIXES');
  console.log('====================');
  
  await testEndpoint(
    'Couplets Simple API (Fixed)',
    `${BASE_URL}/api/couplets-simple?limit=5`,
    200,
    'Should work after database query fixes'
  );
  
  await testEndpoint(
    'Poetry Detail API (Fixed)',
    `${BASE_URL}/api/poetry/detail?poetryId=1`,
    200,
    'Should work with correct parameters'
  );
  
  await testEndpoint(
    'Timeline Events API (Fixed)',
    `${BASE_URL}/api/timeline/events?limit=5`,
    200,
    'Should work after database fixes'
  );
  
  // Test user API fixes
  console.log('\n👤 USER API FIXES');
  console.log('==================');
  
  await testEndpoint(
    'User Likes API (Fixed)',
    `${BASE_URL}/api/user/likes`,
    200,
    'Should work after auth fixes'
  );
  
  await testEndpoint(
    'User Bookmarks API (Fixed)',
    `${BASE_URL}/api/user/bookmarks`,
    200,
    'Should work after auth fixes'
  );
  
  // Print results
  console.log('\n📊 Fix Results Summary');
  console.log('======================');
  console.log(`✅ Fixed: ${results.passed}`);
  console.log(`❌ Still Failing: ${results.failed}`);
  console.log(`📈 Total:  ${results.total}`);
  console.log(`🎯 Fix Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  // Detailed results for failed tests
  if (results.failed > 0) {
    console.log('\n❌ Still Failing Tests:');
    console.log('======================');
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
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Fix testing failed:', error);
  process.exit(1);
});
