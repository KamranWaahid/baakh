#!/usr/bin/env node

/**
 * OWASP ZAP Security Testing Script
 * 
 * This script runs OWASP ZAP security tests against the application
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Starting OWASP ZAP Security Tests...\n');

// Configuration
const ZAP_CONFIG = {
  target: process.env.ZAP_TARGET || 'http://localhost:3000',
  port: process.env.ZAP_PORT || '8080',
  apiKey: process.env.ZAP_API_KEY || 'zap-api-key',
  rulesFile: '.zap/rules.tsv',
  reportDir: 'security-reports',
  timeout: 300000 // 5 minutes
};

// Create reports directory
if (!fs.existsSync(ZAP_CONFIG.reportDir)) {
  fs.mkdirSync(ZAP_CONFIG.reportDir, { recursive: true });
}

async function runZAPTest() {
  try {
    console.log('🚀 Starting ZAP daemon...');
    
    // Start ZAP daemon
    const zapProcess = spawn('zap.sh', [
      '-daemon',
      '-port', ZAP_CONFIG.port,
      '-config', `api.key=${ZAP_CONFIG.apiKey}`,
      '-config', 'api.disablekey=true'
    ], {
      detached: true,
      stdio: 'ignore'
    });

    // Wait for ZAP to start
    await sleep(10000);

    console.log('🔍 Running ZAP baseline scan...');
    
    // Run baseline scan
    const scanCommand = [
      'zap-baseline.py',
      '-t', ZAP_CONFIG.target,
      '-J', path.join(ZAP_CONFIG.reportDir, 'zap-report.json'),
      '-r', path.join(ZAP_CONFIG.reportDir, 'zap-report.html'),
      '-x', path.join(ZAP_CONFIG.reportDir, 'zap-report.xml'),
      '-I', // Include info level alerts
      '-j', // JSON report
      '-T', '10', // Timeout in minutes
      '--hook', 'zap-hook.py' // Custom hook if available
    ];

    if (fs.existsSync(ZAP_CONFIG.rulesFile)) {
      scanCommand.push('-c', ZAP_CONFIG.rulesFile);
    }

    execSync(scanCommand.join(' '), { 
      stdio: 'inherit',
      timeout: ZAP_CONFIG.timeout 
    });

    console.log('✅ ZAP baseline scan completed');

    // Run full scan if baseline passes
    console.log('🔍 Running ZAP full scan...');
    
    const fullScanCommand = [
      'zap-full-scan.py',
      '-t', ZAP_CONFIG.target,
      '-J', path.join(ZAP_CONFIG.reportDir, 'zap-full-report.json'),
      '-r', path.join(ZAP_CONFIG.reportDir, 'zap-full-report.html'),
      '-x', path.join(ZAP_CONFIG.reportDir, 'zap-full-report.xml'),
      '-I', // Include info level alerts
      '-j', // JSON report
      '-T', '30' // Timeout in minutes
    ];

    if (fs.existsSync(ZAP_CONFIG.rulesFile)) {
      fullScanCommand.push('-c', ZAP_CONFIG.rulesFile);
    }

    execSync(fullScanCommand.join(' '), { 
      stdio: 'inherit',
      timeout: ZAP_CONFIG.timeout * 2 
    });

    console.log('✅ ZAP full scan completed');

    // Parse results
    const results = parseZAPResults();
    printResults(results);

    // Cleanup
    zapProcess.kill();

    return results;

  } catch (error) {
    console.error('❌ ZAP test failed:', error.message);
    process.exit(1);
  }
}

function parseZAPResults() {
  const results = {
    baseline: null,
    full: null,
    summary: {
      total: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    }
  };

  // Parse baseline results
  const baselineFile = path.join(ZAP_CONFIG.reportDir, 'zap-report.json');
  if (fs.existsSync(baselineFile)) {
    try {
      results.baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
    } catch (error) {
      console.warn('⚠️  Could not parse baseline results:', error.message);
    }
  }

  // Parse full scan results
  const fullFile = path.join(ZAP_CONFIG.reportDir, 'zap-full-report.json');
  if (fs.existsSync(fullFile)) {
    try {
      results.full = JSON.parse(fs.readFileSync(fullFile, 'utf8'));
    } catch (error) {
      console.warn('⚠️  Could not parse full scan results:', error.message);
    }
  }

  // Calculate summary
  const allResults = [results.baseline, results.full].filter(Boolean);
  
  for (const result of allResults) {
    if (result && result.site) {
      for (const site of result.site) {
        if (site.alerts) {
          for (const alert of site.alerts) {
            results.summary.total++;
            const risk = alert.riskcode || 'info';
            switch (risk) {
              case 'High':
                results.summary.high++;
                break;
              case 'Medium':
                results.summary.medium++;
                break;
              case 'Low':
                results.summary.low++;
                break;
              default:
                results.summary.info++;
            }
          }
        }
      }
    }
  }

  return results;
}

function printResults(results) {
  console.log('\n📊 ZAP Security Test Results:');
  console.log('=============================');
  console.log(`Total Issues: ${results.summary.total}`);
  console.log(`🔴 High Risk: ${results.summary.high}`);
  console.log(`🟡 Medium Risk: ${results.summary.medium}`);
  console.log(`🟢 Low Risk: ${results.summary.low}`);
  console.log(`ℹ️  Info: ${results.summary.info}`);

  // Print detailed results
  if (results.baseline && results.baseline.site) {
    console.log('\n📋 Baseline Scan Issues:');
    printDetailedResults(results.baseline);
  }

  if (results.full && results.full.site) {
    console.log('\n📋 Full Scan Issues:');
    printDetailedResults(results.full);
  }

  // Print report locations
  console.log('\n📄 Reports Generated:');
  console.log(`HTML Report: ${path.join(ZAP_CONFIG.reportDir, 'zap-report.html')}`);
  console.log(`JSON Report: ${path.join(ZAP_CONFIG.reportDir, 'zap-report.json')}`);
  console.log(`XML Report: ${path.join(ZAP_CONFIG.reportDir, 'zap-report.xml')}`);

  if (fs.existsSync(path.join(ZAP_CONFIG.reportDir, 'zap-full-report.html'))) {
    console.log(`Full HTML Report: ${path.join(ZAP_CONFIG.reportDir, 'zap-full-report.html')}`);
  }
}

function printDetailedResults(result) {
  for (const site of result.site) {
    if (site.alerts) {
      for (const alert of site.alerts) {
        const riskIcon = getRiskIcon(alert.riskcode);
        console.log(`${riskIcon} ${alert.name} (${alert.riskcode})`);
        console.log(`   Description: ${alert.desc}`);
        console.log(`   Solution: ${alert.solution}`);
        console.log(`   References: ${alert.reference}`);
        console.log('');
      }
    }
  }
}

function getRiskIcon(riskCode) {
  switch (riskCode) {
    case 'High':
      return '🔴';
    case 'Medium':
      return '🟡';
    case 'Low':
      return '🟢';
    default:
      return 'ℹ️';
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if ZAP is installed
function checkZAPInstallation() {
  try {
    execSync('zap.sh --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('❌ OWASP ZAP is not installed or not in PATH');
    console.error('Please install OWASP ZAP: https://www.zaproxy.org/download/');
    return false;
  }
}

// Main execution
async function main() {
  if (!checkZAPInstallation()) {
    process.exit(1);
  }

  const results = await runZAPTest();
  
  // Exit with appropriate code
  if (results.summary.high > 0) {
    console.log('\n❌ High-risk security issues found!');
    process.exit(1);
  } else if (results.summary.medium > 0) {
    console.log('\n⚠️  Medium-risk security issues found!');
    process.exit(1);
  } else {
    console.log('\n✅ No critical security issues found!');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { runZAPTest, parseZAPResults };
