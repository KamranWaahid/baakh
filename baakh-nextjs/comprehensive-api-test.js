#!/usr/bin/env node

/**
 * Comprehensive API Testing Script
 * Tests ALL API endpoints in the Baakh project to ensure they work in production
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.PRODUCTION_URL || process.argv[2] || 'http://localhost:3000';
const TIMEOUT = 20000; // 20 seconds for comprehensive testing

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
  categories: {
    critical: { passed: 0, failed: 0, total: 0 },
    admin: { passed: 0, failed: 0, total: 0 },
    content: { passed: 0, failed: 0, total: 0 },
    auth: { passed: 0, failed: 0, total: 0 },
    search: { passed: 0, failed: 0, total: 0 },
    user: { passed: 0, failed: 0, total: 0 },
    test: { passed: 0, failed: 0, total: 0 }
  }
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

// Enhanced test function with category tracking
async function testEndpoint(name, url, expectedStatus = 200, description = '', category = 'test') {
  results.total++;
  results.categories[category].total++;
  
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  console.log(`   Expected Status: ${expectedStatus}`);
  console.log(`   Category: ${category}`);
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(url);
    const duration = Date.now() - startTime;
    
    const success = response.status === expectedStatus;
    
    if (success) {
      results.passed++;
      results.categories[category].passed++;
      console.log(`   ✅ PASSED (${response.status}) - ${duration}ms`);
      
      // Log key response data for successful requests
      if (response.data && typeof response.data === 'object') {
        if (response.data.success !== undefined) {
          console.log(`   📊 Success: ${response.data.success}`);
        }
        if (response.data.total !== undefined) {
          console.log(`   📈 Total Records: ${response.data.total}`);
        }
        if (response.data.count !== undefined) {
          console.log(`   📈 Count: ${response.data.count}`);
        }
        if (response.data.error) {
          console.log(`   ⚠️  Error in Response: ${response.data.error}`);
        }
      }
    } else {
      results.failed++;
      results.categories[category].failed++;
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
      category,
      response: response.data
    });
    
  } catch (error) {
    results.failed++;
    results.categories[category].failed++;
    console.log(`   ❌ ERROR - ${error.message}`);
    
    results.details.push({
      name,
      url,
      expectedStatus,
      actualStatus: 'ERROR',
      duration: 0,
      success: false,
      description,
      category,
      error: error.message
    });
  }
}

// Main testing function
async function runTests() {
  console.log('🚀 Starting Comprehensive API Endpoints Testing');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  
  if (!BASE_URL || BASE_URL.includes('your-domain')) {
    console.log('\n❌ Please provide a valid production URL:');
    console.log('   node comprehensive-api-test.js https://your-app.example.com');
    console.log('   or set PRODUCTION_URL environment variable');
    process.exit(1);
  }
  
  // ===== CRITICAL APIs - Core functionality =====
  console.log('\n🔥 CRITICAL APIs - Core Functionality');
  console.log('=====================================');
  
  await testEndpoint(
    'Admin Stats API',
    `${BASE_URL}/api/admin/stats`,
    200,
    'Critical: Admin dashboard statistics',
    'critical'
  );
  
  await testEndpoint(
    'Poets List API',
    `${BASE_URL}/api/poets?limit=5`,
    200,
    'Critical: Main poets listing',
    'critical'
  );
  
  await testEndpoint(
    'Categories API',
    `${BASE_URL}/api/categories?limit=5`,
    200,
    'Critical: Categories for navigation',
    'critical'
  );
  
  await testEndpoint(
    'Couplets API',
    `${BASE_URL}/api/couplets?limit=5`,
    200,
    'Critical: Main content API',
    'critical'
  );
  
  await testEndpoint(
    'Poetry API',
    `${BASE_URL}/api/poetry?limit=5`,
    200,
    'Critical: Poetry content API',
    'critical'
  );
  
  // ===== ADMIN APIs - Administrative functions =====
  console.log('\n👑 ADMIN APIs - Administrative Functions');
  console.log('========================================');
  
  await testEndpoint(
    'Admin Tags API',
    `${BASE_URL}/api/admin/tags`,
    200,
    'Admin: Tags management',
    'admin'
  );
  
  await testEndpoint(
    'System Status API',
    `${BASE_URL}/api/admin/system-status`,
    200,
    'Admin: System health check',
    'admin'
  );
  
  await testEndpoint(
    'Admin Categories API',
    `${BASE_URL}/api/admin/categories`,
    200,
    'Admin: Categories management',
    'admin'
  );
  
  await testEndpoint(
    'Admin Poets API',
    `${BASE_URL}/api/admin/poets`,
    200,
    'Admin: Poets management',
    'admin'
  );
  
  await testEndpoint(
    'Admin Poetry API',
    `${BASE_URL}/api/admin/poetry`,
    200,
    'Admin: Poetry management',
    'admin'
  );
  
  await testEndpoint(
    'Admin Romanizer API',
    `${BASE_URL}/api/admin/romanizer`,
    200,
    'Admin: Romanizer functionality',
    'admin'
  );
  
  await testEndpoint(
    'Admin Settings API',
    `${BASE_URL}/api/admin/settings`,
    200,
    'Admin: Settings management',
    'admin'
  );
  
  await testEndpoint(
    'Admin Settings Status',
    `${BASE_URL}/api/admin/settings/status`,
    200,
    'Admin: Settings status check',
    'admin'
  );
  
  // ===== CONTENT APIs - Content delivery =====
  console.log('\n📚 CONTENT APIs - Content Delivery');
  console.log('==================================');
  
  await testEndpoint(
    'Simple Couplets API',
    `${BASE_URL}/api/simple-couplets?limit=5`,
    200,
    'Content: Simple couplets',
    'content'
  );
  
  await testEndpoint(
    'Couplets Simple API',
    `${BASE_URL}/api/couplets-simple?limit=5`,
    200,
    'Content: Couplets simple',
    'content'
  );
  
  await testEndpoint(
    'Poetry Categories API',
    `${BASE_URL}/api/poetry/categories`,
    200,
    'Content: Poetry categories',
    'content'
  );
  
  await testEndpoint(
    'Poetry Detail API',
    `${BASE_URL}/api/poetry/detail?id=1`,
    200,
    'Content: Poetry detail',
    'content'
  );
  
  await testEndpoint(
    'Poetry by Poet API',
    `${BASE_URL}/api/poetry/by-poet?poetId=1&limit=5`,
    200,
    'Content: Poetry by poet',
    'content'
  );
  
  await testEndpoint(
    'Timeline Periods API',
    `${BASE_URL}/api/timeline/periods?limit=5`,
    200,
    'Content: Timeline periods',
    'content'
  );
  
  await testEndpoint(
    'Timeline Events API',
    `${BASE_URL}/api/timeline/events?limit=5`,
    200,
    'Content: Timeline events',
    'content'
  );
  
  await testEndpoint(
    'Topics API',
    `${BASE_URL}/api/topics/count`,
    200,
    'Content: Topics count',
    'content'
  );
  
  await testEndpoint(
    'Tags API',
    `${BASE_URL}/api/tags`,
    200,
    'Content: Tags listing',
    'content'
  );
  
  // ===== AUTH APIs - Authentication =====
  console.log('\n🔐 AUTH APIs - Authentication');
  console.log('=============================');
  
  await testEndpoint(
    'Auth Me API',
    `${BASE_URL}/api/auth/me`,
    200,
    'Auth: User info',
    'auth'
  );
  
  await testEndpoint(
    'Auth Me Simple API',
    `${BASE_URL}/api/auth/me-simple`,
    200,
    'Auth: Simple user info',
    'auth'
  );
  
  await testEndpoint(
    'Auth Test DB API',
    `${BASE_URL}/api/auth/test-db`,
    200,
    'Auth: Database test',
    'auth'
  );
  
  await testEndpoint(
    'CSRF Token API',
    `${BASE_URL}/api/csrf`,
    200,
    'Auth: CSRF token',
    'auth'
  );
  
  // ===== SEARCH APIs - Search functionality =====
  console.log('\n🔍 SEARCH APIs - Search Functionality');
  console.log('=====================================');
  
  await testEndpoint(
    'Search API',
    `${BASE_URL}/api/search?q=test&limit=5`,
    200,
    'Search: General search',
    'search'
  );
  
  await testEndpoint(
    'Search Simple API',
    `${BASE_URL}/api/search-simple?q=test&limit=5`,
    200,
    'Search: Simple search',
    'search'
  );
  
  await testEndpoint(
    'Admin Search API',
    `${BASE_URL}/api/admin/search?q=test&limit=5`,
    200,
    'Search: Admin search',
    'search'
  );
  
  // ===== USER APIs - User interactions =====
  console.log('\n👤 USER APIs - User Interactions');
  console.log('=================================');
  
  await testEndpoint(
    'User Likes API',
    `${BASE_URL}/api/user/likes`,
    200,
    'User: User likes',
    'user'
  );
  
  await testEndpoint(
    'User Bookmarks API',
    `${BASE_URL}/api/user/bookmarks`,
    200,
    'User: User bookmarks',
    'user'
  );
  
  await testEndpoint(
    'User Settings API',
    `${BASE_URL}/api/user/settings`,
    200,
    'User: User settings',
    'user'
  );
  
  await testEndpoint(
    'Couplets Like API',
    `${BASE_URL}/api/couplets/like`,
    200,
    'User: Like couplet',
    'user'
  );
  
  await testEndpoint(
    'Couplets Bookmark API',
    `${BASE_URL}/api/couplets/bookmark`,
    200,
    'User: Bookmark couplet',
    'user'
  );
  
  // ===== TEST APIs - Testing and debugging =====
  console.log('\n🧪 TEST APIs - Testing and Debugging');
  console.log('====================================');
  
  await testEndpoint(
    'Poetry Test API',
    `${BASE_URL}/api/poetry/test`,
    200,
    'Test: Database connectivity',
    'test'
  );
  
  await testEndpoint(
    'Test Connection API',
    `${BASE_URL}/api/test-connection`,
    200,
    'Test: Connection test',
    'test'
  );
  
  await testEndpoint(
    'Test DB API',
    `${BASE_URL}/api/test-db`,
    200,
    'Test: Database test',
    'test'
  );
  
  await testEndpoint(
    'Test Couplets API',
    `${BASE_URL}/api/test-couplets`,
    200,
    'Test: Couplets test',
    'test'
  );
  
  await testEndpoint(
    'Test Couplets Simple API',
    `${BASE_URL}/api/test-couplets-simple`,
    200,
    'Test: Simple couplets test',
    'test'
  );
  
  await testEndpoint(
    'Debug Auth API',
    `${BASE_URL}/api/debug-auth`,
    200,
    'Test: Auth debug',
    'test'
  );
  
  await testEndpoint(
    'Debug Couplets API',
    `${BASE_URL}/api/debug-couplets`,
    200,
    'Test: Couplets debug',
    'test'
  );
  
  await testEndpoint(
    'Debug Poets API',
    `${BASE_URL}/api/debug-poets`,
    200,
    'Test: Poets debug',
    'test'
  );
  
  // ===== ERROR HANDLING TESTS =====
  console.log('\n❌ ERROR HANDLING TESTS');
  console.log('=======================');
  
  await testEndpoint(
    'Non-existent Poet API',
    `${BASE_URL}/api/poets/non-existent-poet-12345`,
    404,
    'Error Handling: 404 for missing poet',
    'test'
  );
  
  await testEndpoint(
    'Invalid Category API',
    `${BASE_URL}/api/categories/invalid-category-12345`,
    404,
    'Error Handling: 404 for missing category',
    'test'
  );
  
  await testEndpoint(
    'Invalid Poetry ID API',
    `${BASE_URL}/api/poetry/999999999`,
    404,
    'Error Handling: 404 for missing poetry',
    'test'
  );
  
  // Print comprehensive results
  console.log('\n📊 Comprehensive Test Results Summary');
  console.log('=====================================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total:  ${results.total}`);
  console.log(`🎯 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  // Category breakdown
  console.log('\n📋 Results by Category:');
  console.log('======================');
  Object.entries(results.categories).forEach(([category, stats]) => {
    if (stats.total > 0) {
      const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`${category.toUpperCase()}: ${stats.passed}/${stats.total} (${successRate}%)`);
    }
  });
  
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
    
    // Flag very slow endpoints
    const verySlowTests = successfulTests.filter(test => test.duration > 10000);
    if (verySlowTests.length > 0) {
      console.log(`\n🚨 Very Slow Endpoints (>10s):`);
      verySlowTests.forEach(test => {
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
        console.log(`\n• ${test.name} (${test.category})`);
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
    test.category === 'critical' && test.success
  );
  
  console.log(`\n🎯 Production Readiness:`);
  console.log(`   Critical APIs Working: ${criticalTests.length}/5`);
  
  if (criticalTests.length === 5) {
    console.log(`   ✅ Production Ready - All critical APIs working`);
  } else if (criticalTests.length >= 3) {
    console.log(`   ⚠️  Partially Ready - Some critical APIs failing`);
  } else {
    console.log(`   ❌ Not Ready - Most critical APIs failing`);
  }
  
  // Recommendations
  console.log(`\n💡 Recommendations:`);
  if (results.categories.critical.failed > 0) {
    console.log(`   • Fix ${results.categories.critical.failed} critical API failures immediately`);
  }
  if (results.categories.admin.failed > 0) {
    console.log(`   • Address ${results.categories.admin.failed} admin API issues`);
  }
  const slowCount = successfulTests.filter(test => test.duration > 5000).length;
  if (slowCount > 0) {
    console.log(`   • Optimize ${slowCount} slow endpoints for better performance`);
  }
  if (results.categories.auth.failed > 0) {
    console.log(`   • Review ${results.categories.auth.failed} authentication API issues`);
  }
  
  // Exit with appropriate code
  const criticalFailures = results.details.filter(test => 
    test.category === 'critical' && !test.success
  ).length;
  
  process.exit(criticalFailures > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
