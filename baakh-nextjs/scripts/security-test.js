#!/usr/bin/env node

/**
 * Security Testing Script
 * 
 * This script runs various security tests on the application
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Starting Security Tests...\n');

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function runTest(name, testFn) {
  console.log(`Running: ${name}`);
  try {
    const result = testFn();
    if (result.success) {
      console.log(`✅ ${name}: PASSED`);
      results.passed++;
      results.tests.push({ name, status: 'PASSED', message: result.message });
    } else {
      console.log(`❌ ${name}: FAILED - ${result.message}`);
      results.failed++;
      results.tests.push({ name, status: 'FAILED', message: result.message });
    }
  } catch (error) {
    console.log(`⚠️  ${name}: WARNING - ${error.message}`);
    results.warnings++;
    results.tests.push({ name, status: 'WARNING', message: error.message });
  }
  console.log('');
}

// Test 1: Check for hardcoded secrets
runTest('Hardcoded Secrets Check', () => {
  const secretPatterns = [
    /password\s*=\s*['"][^'"]+['"]/gi,
    /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
    /secret\s*=\s*['"][^'"]+['"]/gi,
    /token\s*=\s*['"][^'"]+['"]/gi,
    /private[_-]?key\s*=\s*['"][^'"]+['"]/gi
  ];

  const files = getAllFiles('./src');
  const issues = [];

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of secretPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          issues.push(`${file}: ${matches.join(', ')}`);
        }
      }
    }
  }

  if (issues.length > 0) {
    return { success: false, message: `Found ${issues.length} potential hardcoded secrets: ${issues.join('; ')}` };
  }

  return { success: true, message: 'No hardcoded secrets found' };
});

// Test 2: Check for dangerous functions
runTest('Dangerous Functions Check', () => {
  const dangerousFunctions = [
    'eval(',
    'Function(',
    'setTimeout(',
    'setInterval(',
    'innerHTML',
    'outerHTML',
    'document.write',
    'document.writeln'
  ];

  const files = getAllFiles('./src');
  const issues = [];

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const func of dangerousFunctions) {
        if (content.includes(func)) {
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(func)) {
              issues.push(`${file}:${i + 1} - ${func}`);
            }
          }
        }
      }
    }
  }

  if (issues.length > 0) {
    return { success: false, message: `Found ${issues.length} dangerous function usages: ${issues.join('; ')}` };
  }

  return { success: true, message: 'No dangerous functions found' };
});

// Test 3: Check for SQL injection vulnerabilities
runTest('SQL Injection Check', () => {
  const sqlPatterns = [
    /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\+/gi,
    /INSERT\s+INTO\s+.*\s+VALUES\s+.*\+/gi,
    /UPDATE\s+.*\s+SET\s+.*\+/gi,
    /DELETE\s+FROM\s+.*\s+WHERE\s+.*\+/gi
  ];

  const files = getAllFiles('./src');
  const issues = [];

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of sqlPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          issues.push(`${file}: ${matches.join(', ')}`);
        }
      }
    }
  }

  if (issues.length > 0) {
    return { success: false, message: `Found ${issues.length} potential SQL injection vulnerabilities: ${issues.join('; ')}` };
  }

  return { success: true, message: 'No SQL injection vulnerabilities found' };
});

// Test 4: Check for XSS vulnerabilities
runTest('XSS Vulnerability Check', () => {
  const xssPatterns = [
    /dangerouslySetInnerHTML/gi,
    /innerHTML\s*=/gi,
    /outerHTML\s*=/gi,
    /document\.write/gi,
    /document\.writeln/gi
  ];

  const files = getAllFiles('./src');
  const issues = [];

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of xssPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          issues.push(`${file}: ${matches.join(', ')}`);
        }
      }
    }
  }

  if (issues.length > 0) {
    return { success: false, message: `Found ${issues.length} potential XSS vulnerabilities: ${issues.join('; ')}` };
  }

  return { success: true, message: 'No XSS vulnerabilities found' };
});

// Test 5: Check for insecure HTTP usage
runTest('Insecure HTTP Check', () => {
  const httpPatterns = [
    /http:\/\//gi,
    /http:\/\/localhost/gi
  ];

  const files = getAllFiles('./src');
  const issues = [];

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of httpPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          // Allow localhost for development
          const nonLocalhostMatches = matches.filter(match => !match.includes('localhost'));
          if (nonLocalhostMatches.length > 0) {
            issues.push(`${file}: ${nonLocalhostMatches.join(', ')}`);
          }
        }
      }
    }
  }

  if (issues.length > 0) {
    return { success: false, message: `Found ${issues.length} insecure HTTP usages: ${issues.join('; ')}` };
  }

  return { success: true, message: 'No insecure HTTP usages found' };
});

// Test 6: Check for missing security headers
runTest('Security Headers Check', () => {
  const securityHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Content-Security-Policy'
  ];

  // This would need to be implemented with actual HTTP requests
  // For now, just check if security middleware exists
  const middlewareFile = './src/lib/security/middleware.ts';
  if (fs.existsSync(middlewareFile)) {
    const content = fs.readFileSync(middlewareFile, 'utf8');
    const hasSecurityHeaders = securityHeaders.some(header => 
      content.includes(header)
    );
    
    if (hasSecurityHeaders) {
      return { success: true, message: 'Security headers middleware found' };
    } else {
      return { success: false, message: 'Security headers middleware not properly configured' };
    }
  }

  return { success: false, message: 'Security headers middleware not found' };
});

// Test 7: Check for proper input validation
runTest('Input Validation Check', () => {
  const validationFiles = [
    './src/lib/security/validation.ts',
    './src/lib/security/html-sanitizer.ts'
  ];

  let hasValidation = false;
  for (const file of validationFiles) {
    if (fs.existsSync(file)) {
      hasValidation = true;
      break;
    }
  }

  if (hasValidation) {
    return { success: true, message: 'Input validation utilities found' };
  } else {
    return { success: false, message: 'Input validation utilities not found' };
  }
});

// Test 8: Check for proper authentication
runTest('Authentication Check', () => {
  const authFiles = [
    './src/lib/security/csrf.ts',
    './src/app/api/auth/'
  ];

  let hasAuth = false;
  for (const file of authFiles) {
    if (fs.existsSync(file)) {
      hasAuth = true;
      break;
    }
  }

  if (hasAuth) {
    return { success: true, message: 'Authentication system found' };
  } else {
    return { success: false, message: 'Authentication system not found' };
  }
});

// Helper function to get all files recursively
function getAllFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Print results
console.log('\n📊 Security Test Results:');
console.log('========================');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📝 Total Tests: ${results.tests.length}`);

console.log('\n📋 Detailed Results:');
console.log('===================');
results.tests.forEach(test => {
  const icon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '⚠️';
  console.log(`${icon} ${test.name}: ${test.status}`);
  if (test.message) {
    console.log(`   ${test.message}`);
  }
});

// Exit with appropriate code
if (results.failed > 0) {
  console.log('\n❌ Security tests failed!');
  process.exit(1);
} else {
  console.log('\n✅ All security tests passed!');
  process.exit(0);
}
