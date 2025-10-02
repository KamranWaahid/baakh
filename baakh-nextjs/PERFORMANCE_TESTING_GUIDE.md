# Performance Testing Guide for Baakh API

This guide explains how to run comprehensive performance tests to ensure your Baakh API endpoints work efficiently in production.

## Overview

The performance testing suite includes three main components:

1. **Performance Test** (`performance-test.js`) - Speed and efficiency testing
2. **Load Test** (`load-test.js`) - High traffic simulation and stress testing
3. **Memory Test** (`memory-test.js`) - Memory usage and resource monitoring

## Quick Start

### Run All Performance Tests
```bash
# Test against production URL
npm run test:all-performance https://your-app.example.com

# Or set environment variable
PRODUCTION_URL=https://your-app.example.com npm run test:all-performance
```

### Run Individual Tests
```bash
# Performance test only
npm run test:performance https://your-app.example.com

# Load test only
npm run test:load https://your-app.example.com

# Memory test only
npm run test:memory https://your-app.example.com
```

## Test Details

### 1. Performance Test (`performance-test.js`)

**Purpose**: Tests response times and efficiency of individual endpoints.

**Features**:
- Tests all critical, admin, content, and search endpoints
- Measures response times with performance thresholds
- Categorizes endpoints by performance rating (excellent, good, acceptable, slow, critical)
- Provides detailed timing analysis
- Includes load testing for critical endpoints

**Performance Thresholds**:
- Excellent: < 500ms
- Good: < 1s
- Acceptable: < 2s
- Slow: < 5s
- Critical: > 10s

**Sample Output**:
```
🚀 Performance Testing: Poets List API
   URL: https://your-app.example.com/api/poets?limit=10
   Category: critical
   Iterations: 3
   📊 Results: 3/3 successful (100.0%)
   ⏱️  Average Time: 245ms
   🏃 Min Time: 198ms
   🐌 Max Time: 312ms
   🎯 Rating: EXCELLENT
```

### 2. Load Test (`load-test.js`)

**Purpose**: Simulates high traffic scenarios to test scalability.

**Features**:
- Multiple load scenarios (light, medium, heavy, stress)
- Concurrent request simulation
- Requests per second (RPS) measurement
- Error rate analysis
- Critical endpoint monitoring
- Realistic traffic patterns using weighted endpoint selection

**Load Scenarios**:
- **Light Load**: 5 concurrent users, 30 seconds
- **Medium Load**: 15 concurrent users, 45 seconds
- **Heavy Load**: 30 concurrent users, 60 seconds
- **Stress Test**: 50 concurrent users, 90 seconds

**Sample Output**:
```
🔥 Running medium: Medium Load
   Concurrent Workers: 15
   Duration: 45000ms
   Target RPS: ~150 (estimated)

📊 medium Results:
   Duration: 45.2s
   Total Requests: 1,247
   Successful: 1,198 (96.1%)
   Failed: 49
   Requests/Second: 27.6
   Avg Response Time: 1,234ms
   Critical Endpoints Success: 95.8%
```

### 3. Memory Test (`memory-test.js`)

**Purpose**: Monitors memory usage and resource efficiency.

**Features**:
- Memory growth tracking
- Response size analysis
- Memory per request calculation
- Memory efficiency ratings
- Resource optimization recommendations

**Sample Output**:
```
🧠 Memory Testing: Poets List API
   URL: https://your-app.example.com/api/poets?limit=10
   Iterations: 20
   📊 Results: 20/20 successful (100.0%)
   📦 Data Size: 2,456 bytes avg (2,100-2,800)
   ⏱️  Response Time: 245ms avg
   🧠 Memory Growth: 1,024 bytes
   📈 Memory Growth Rate: 0.15%
   💾 Bytes per Request: 2,456
   🔧 Memory per Request: 51 bytes
```

## Understanding Results

### Performance Ratings

- **✅ Excellent**: < 500ms response time
- **✅ Good**: < 1s response time
- **⚠️ Acceptable**: < 2s response time
- **⚠️ Slow**: < 5s response time
- **❌ Critical**: > 10s response time

### Success Rate Thresholds

- **95%+**: Excellent
- **90-94%**: Good
- **85-89%**: Acceptable
- **< 85%**: Poor

### Memory Efficiency

- **Excellent**: < 20% memory growth
- **Good**: 20-50% memory growth
- **Fair**: 50-100% memory growth
- **Poor**: > 100% memory growth

## Production Readiness Assessment

The test suite provides a comprehensive production readiness assessment:

### ✅ Production Ready
- All critical tests passed
- Response times < 2s average
- Success rate > 95%
- Memory growth < 50%

### ⚠️ Mostly Ready
- Most tests passed
- Some performance issues
- Minor optimizations needed

### ❌ Not Ready
- Critical tests failed
- Performance issues detected
- Major optimization required

## Troubleshooting

### Common Issues

1. **Timeout Errors**
   - Check network connectivity
   - Verify production URL is accessible
   - Increase timeout values if needed

2. **High Response Times**
   - Check database performance
   - Review query optimization
   - Consider implementing caching

3. **Memory Issues**
   - Review data processing logic
   - Implement proper cleanup
   - Consider pagination for large datasets

4. **Load Test Failures**
   - Check server capacity
   - Review rate limiting
   - Optimize database queries

### Performance Optimization Tips

1. **Database Optimization**
   - Add proper indexes
   - Optimize queries
   - Implement connection pooling

2. **Caching Strategies**
   - Implement response caching
   - Use CDN for static content
   - Cache database queries

3. **Code Optimization**
   - Minimize data processing
   - Implement pagination
   - Use streaming for large responses

4. **Infrastructure**
   - Scale server resources
   - Implement load balancing
   - Use database read replicas

## Continuous Monitoring

### Regular Testing Schedule

- **Daily**: Run performance tests
- **Weekly**: Run load tests
- **Monthly**: Run memory tests
- **Before Deployments**: Run all tests

### Monitoring Integration

Consider integrating these tests with your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Performance Tests
on: [push, pull_request]
jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Performance Tests
        run: npm run test:all-performance ${{ secrets.PRODUCTION_URL }}
```

## Environment Variables

- `PRODUCTION_URL`: The production URL to test against
- `TEST_TIMEOUT`: Override default timeout (optional)
- `CONCURRENT_REQUESTS`: Override concurrent request limit (optional)

## File Structure

```
baakh-nextjs/
├── performance-test.js          # Speed and efficiency testing
├── load-test.js                # Load and stress testing
├── memory-test.js              # Memory and resource monitoring
├── run-all-performance-tests.js # Comprehensive test runner
└── PERFORMANCE_TESTING_GUIDE.md # This guide
```

## Support

For issues or questions about performance testing:

1. Check the test output for specific error messages
2. Review the troubleshooting section above
3. Verify your production environment is accessible
4. Check server logs for additional context

## Best Practices

1. **Test Regularly**: Run performance tests before each deployment
2. **Monitor Trends**: Track performance metrics over time
3. **Set Alerts**: Configure alerts for performance degradation
4. **Optimize Continuously**: Address performance issues promptly
5. **Document Changes**: Keep track of performance optimizations

Remember: Performance testing is an ongoing process, not a one-time activity. Regular testing helps ensure your API maintains optimal performance as your application grows and evolves.
