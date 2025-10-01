#!/usr/bin/env node

/**
 * Memory and Resource Monitoring Script for Baakh API Endpoints
 * Monitors memory usage, response sizes, and resource efficiency
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = process.env.PRODUCTION_URL || process.argv[2] || 'http://localhost:3000';
const TIMEOUT = 30000;
const MEMORY_TEST_ITERATIONS = 20;

// Memory monitoring results
const memoryResults = {
  endpoints: {},
  overall: {
    totalRequests: 0,
    totalDataTransferred: 0,
    avgResponseSize: 0,
    maxResponseSize: 0,
    minResponseSize: Infinity,
    memoryEfficiency: []
  }
};

// Helper function to make HTTP requests with memory monitoring
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
      let dataSize = 0;
      
      res.on('data', chunk => {
        data += chunk;
        dataSize += chunk.length;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        // Memory usage estimation
        const memoryUsage = process.memoryUsage();
        
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            responseTime,
            dataSize,
            memoryUsage,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime,
            dataSize,
            memoryUsage,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        }
      });
    });

    req.on('error', (error) => {
      const endTime = performance.now();
      const memoryUsage = process.memoryUsage();
      reject({
        error: error.message,
        responseTime: endTime - startTime,
        dataSize: 0,
        memoryUsage,
        success: false
      });
    });
    
    req.on('timeout', () => {
      const endTime = performance.now();
      const memoryUsage = process.memoryUsage();
      reject({
        error: 'Request timeout',
        responseTime: endTime - startTime,
        dataSize: 0,
        memoryUsage,
        success: false
      });
    });
    
    req.end();
  });
}

// Test endpoint memory efficiency
async function testEndpointMemory(name, url, iterations = MEMORY_TEST_ITERATIONS) {
  console.log(`\n🧠 Memory Testing: ${name}`);
  console.log(`   URL: ${url}`);
  console.log(`   Iterations: ${iterations}`);
  
  const results = [];
  let totalDataSize = 0;
  let totalResponseTime = 0;
  let successCount = 0;
  let minDataSize = Infinity;
  let maxDataSize = 0;
  const memorySnapshots = [];
  
  // Initial memory snapshot
  const initialMemory = process.memoryUsage();
  memorySnapshots.push({
    iteration: 0,
    memory: initialMemory,
    timestamp: Date.now()
  });
  
  for (let i = 0; i < iterations; i++) {
    try {
      const result = await makeRequest(url);
      
      totalDataSize += result.dataSize;
      totalResponseTime += result.responseTime;
      minDataSize = Math.min(minDataSize, result.dataSize);
      maxDataSize = Math.max(maxDataSize, result.dataSize);
      
      if (result.success) {
        successCount++;
      }
      
      results.push({
        iteration: i + 1,
        success: result.success,
        status: result.status,
        responseTime: result.responseTime,
        dataSize: result.dataSize,
        memoryUsage: result.memoryUsage,
        error: result.success ? null : result.data?.error || 'Unknown error'
      });
      
      // Memory snapshot every 5 iterations
      if ((i + 1) % 5 === 0) {
        memorySnapshots.push({
          iteration: i + 1,
          memory: process.memoryUsage(),
          timestamp: Date.now()
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      results.push({
        iteration: i + 1,
        success: false,
        status: 'ERROR',
        responseTime: error.responseTime || 0,
        dataSize: error.dataSize || 0,
        memoryUsage: error.memoryUsage || process.memoryUsage(),
        error: error.error || 'Unknown error'
      });
    }
  }
  
  // Final memory snapshot
  const finalMemory = process.memoryUsage();
  memorySnapshots.push({
    iteration: iterations,
    memory: finalMemory,
    timestamp: Date.now()
  });
  
  const avgDataSize = totalDataSize / iterations;
  const avgResponseTime = totalResponseTime / iterations;
  const successRate = (successCount / iterations) * 100;
  
  // Memory efficiency analysis
  const memoryGrowth = {
    rss: finalMemory.rss - initialMemory.rss,
    heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
    heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
    external: finalMemory.external - initialMemory.external
  };
  
  const memoryEfficiency = {
    bytesPerRequest: totalDataSize / iterations,
    memoryPerRequest: memoryGrowth.heapUsed / iterations,
    memoryGrowthRate: (memoryGrowth.heapUsed / initialMemory.heapUsed) * 100
  };
  
  const endpointResult = {
    name,
    url,
    iterations,
    successCount,
    successRate,
    avgDataSize,
    minDataSize,
    maxDataSize,
    avgResponseTime,
    memoryGrowth,
    memoryEfficiency,
    memorySnapshots,
    results
  };
  
  memoryResults.endpoints[name] = endpointResult;
  
  // Update overall statistics
  memoryResults.overall.totalRequests += iterations;
  memoryResults.overall.totalDataTransferred += totalDataSize;
  memoryResults.overall.avgResponseSize = memoryResults.overall.totalDataTransferred / memoryResults.overall.totalRequests;
  memoryResults.overall.maxResponseSize = Math.max(memoryResults.overall.maxResponseSize, maxDataSize);
  memoryResults.overall.minResponseSize = Math.min(memoryResults.overall.minResponseSize, minDataSize);
  memoryResults.overall.memoryEfficiency.push(memoryEfficiency);
  
  // Console output
  console.log(`   📊 Results: ${successCount}/${iterations} successful (${successRate.toFixed(1)}%)`);
  console.log(`   📦 Data Size: ${avgDataSize.toFixed(0)} bytes avg (${minDataSize}-${maxDataSize})`);
  console.log(`   ⏱️  Response Time: ${avgResponseTime.toFixed(0)}ms avg`);
  console.log(`   🧠 Memory Growth: ${memoryGrowth.heapUsed.toFixed(0)} bytes`);
  console.log(`   📈 Memory Growth Rate: ${memoryEfficiency.memoryGrowthRate.toFixed(2)}%`);
  console.log(`   💾 Bytes per Request: ${memoryEfficiency.bytesPerRequest.toFixed(0)}`);
  console.log(`   🔧 Memory per Request: ${memoryEfficiency.memoryPerRequest.toFixed(0)} bytes`);
  
  // Memory efficiency warnings
  if (memoryEfficiency.memoryGrowthRate > 50) {
    console.log(`   ⚠️  High Memory Growth: ${memoryEfficiency.memoryGrowthRate.toFixed(2)}%`);
  }
  if (memoryEfficiency.bytesPerRequest > 100000) {
    console.log(`   ⚠️  Large Response Size: ${memoryEfficiency.bytesPerRequest.toFixed(0)} bytes per request`);
  }
  if (memoryEfficiency.memoryPerRequest > 10000) {
    console.log(`   ⚠️  High Memory Usage: ${memoryEfficiency.memoryPerRequest.toFixed(0)} bytes per request`);
  }
  
  return endpointResult;
}

// Generate memory efficiency report
function generateMemoryReport() {
  console.log('\n📊 MEMORY EFFICIENCY REPORT');
  console.log('============================');
  
  // Overall statistics
  const overall = memoryResults.overall;
  console.log(`\n📈 Overall Memory Statistics:`);
  console.log(`   Total Requests: ${overall.totalRequests}`);
  console.log(`   Total Data Transferred: ${(overall.totalDataTransferred / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Average Response Size: ${overall.avgResponseSize.toFixed(0)} bytes`);
  console.log(`   Largest Response: ${overall.maxResponseSize.toFixed(0)} bytes`);
  console.log(`   Smallest Response: ${overall.minResponseSize.toFixed(0)} bytes`);
  
  // Endpoint analysis
  console.log(`\n📋 Endpoint Memory Analysis:`);
  console.log('============================');
  Object.entries(memoryResults.endpoints).forEach(([name, endpoint]) => {
    console.log(`\n${name}:`);
    console.log(`   Success Rate: ${endpoint.successRate.toFixed(1)}%`);
    console.log(`   Avg Data Size: ${endpoint.avgDataSize.toFixed(0)} bytes`);
    console.log(`   Memory Growth: ${endpoint.memoryGrowth.heapUsed.toFixed(0)} bytes`);
    console.log(`   Memory Growth Rate: ${endpoint.memoryEfficiency.memoryGrowthRate.toFixed(2)}%`);
    console.log(`   Bytes per Request: ${endpoint.memoryEfficiency.bytesPerRequest.toFixed(0)}`);
    console.log(`   Memory per Request: ${endpoint.memoryEfficiency.memoryPerRequest.toFixed(0)} bytes`);
    
    // Efficiency rating
    let efficiency = 'excellent';
    if (endpoint.memoryEfficiency.memoryGrowthRate > 100) efficiency = 'poor';
    else if (endpoint.memoryEfficiency.memoryGrowthRate > 50) efficiency = 'fair';
    else if (endpoint.memoryEfficiency.memoryGrowthRate > 20) efficiency = 'good';
    
    console.log(`   Efficiency Rating: ${efficiency.toUpperCase()}`);
  });
  
  // Memory efficiency recommendations
  console.log(`\n💡 Memory Efficiency Recommendations:`);
  console.log('====================================');
  
  const endpoints = Object.values(memoryResults.endpoints);
  const highMemoryGrowth = endpoints.filter(e => e.memoryEfficiency.memoryGrowthRate > 50);
  const largeResponses = endpoints.filter(e => e.memoryEfficiency.bytesPerRequest > 100000);
  const highMemoryUsage = endpoints.filter(e => e.memoryEfficiency.memoryPerRequest > 10000);
  
  if (highMemoryGrowth.length > 0) {
    console.log(`   🧠 ${highMemoryGrowth.length} endpoints show high memory growth:`);
    highMemoryGrowth.forEach(endpoint => {
      console.log(`      • ${endpoint.name}: ${endpoint.memoryEfficiency.memoryGrowthRate.toFixed(2)}% growth`);
    });
  }
  
  if (largeResponses.length > 0) {
    console.log(`   📦 ${largeResponses.length} endpoints return large responses:`);
    largeResponses.forEach(endpoint => {
      console.log(`      • ${endpoint.name}: ${endpoint.memoryEfficiency.bytesPerRequest.toFixed(0)} bytes per request`);
    });
  }
  
  if (highMemoryUsage.length > 0) {
    console.log(`   💾 ${highMemoryUsage.length} endpoints use high memory per request:`);
    highMemoryUsage.forEach(endpoint => {
      console.log(`      • ${endpoint.name}: ${endpoint.memoryEfficiency.memoryPerRequest.toFixed(0)} bytes per request`);
    });
  }
  
  // Memory optimization suggestions
  console.log(`\n🔧 Memory Optimization Suggestions:`);
  console.log('===================================');
  
  if (highMemoryGrowth.length > 0) {
    console.log(`   • Implement response caching for frequently accessed endpoints`);
    console.log(`   • Add pagination to reduce response sizes`);
    console.log(`   • Consider implementing data compression`);
  }
  
  if (largeResponses.length > 0) {
    console.log(`   • Optimize database queries to return only necessary fields`);
    console.log(`   • Implement field selection in API responses`);
    console.log(`   • Consider streaming responses for large datasets`);
  }
  
  if (highMemoryUsage.length > 0) {
    console.log(`   • Review data processing logic for memory leaks`);
    console.log(`   • Implement proper cleanup of temporary objects`);
    console.log(`   • Consider using streaming for large data processing`);
  }
  
  // Production readiness assessment
  console.log(`\n🚀 Production Readiness Assessment:`);
  console.log('==================================');
  
  const criticalIssues = endpoints.filter(e => 
    e.memoryEfficiency.memoryGrowthRate > 100 || 
    e.memoryEfficiency.bytesPerRequest > 500000
  ).length;
  
  if (criticalIssues === 0) {
    console.log(`   ✅ Memory Efficient - All endpoints show good memory usage`);
  } else if (criticalIssues <= 2) {
    console.log(`   ⚠️  Mostly Efficient - ${criticalIssues} endpoints need memory optimization`);
  } else {
    console.log(`   ❌ Memory Issues - ${criticalIssues} endpoints have significant memory problems`);
  }
}

// Main memory testing function
async function runMemoryTests() {
  console.log('🧠 Starting Memory and Resource Monitoring for Baakh API');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  console.log(`🔄 Iterations per endpoint: ${MEMORY_TEST_ITERATIONS}`);
  
  if (!BASE_URL || BASE_URL.includes('your-domain')) {
    console.log('\n❌ Please provide a valid production URL:');
    console.log('   node memory-test.js https://your-app.vercel.app');
    console.log('   or set PRODUCTION_URL environment variable');
    process.exit(1);
  }
  
  // Test critical endpoints for memory efficiency
  const testEndpoints = [
    { name: 'Poets List', url: '/api/poets?limit=10' },
    { name: 'Couplets List', url: '/api/couplets?limit=10' },
    { name: 'Categories', url: '/api/categories?limit=10' },
    { name: 'Poetry List', url: '/api/poetry?limit=10' },
    { name: 'Search', url: '/api/search?q=test&limit=5' },
    { name: 'Admin Stats', url: '/api/admin/stats' },
    { name: 'Timeline Periods', url: '/api/timeline/periods?limit=5' },
    { name: 'Poetry Detail', url: '/api/poetry/detail?id=1' },
    { name: 'Poetry by Poet', url: '/api/poetry/by-poet?poetId=1&limit=5' },
    { name: 'Tags', url: '/api/tags' }
  ];
  
  for (const endpoint of testEndpoints) {
    await testEndpointMemory(endpoint.name, `${BASE_URL}${endpoint.url}`);
    
    // Wait between tests to let memory settle
    console.log(`\n⏳ Waiting 2 seconds before next test...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Generate comprehensive report
  generateMemoryReport();
}

// Run the memory tests
runMemoryTests().catch(error => {
  console.error('❌ Memory test runner failed:', error);
  process.exit(1);
});
