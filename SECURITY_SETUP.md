# Security Workflow Setup Guide

This guide explains how to configure the required secrets for the security scanning workflow to work properly.

## 🔐 Required GitHub Secrets

To enable all security features, you need to configure the following secrets in your GitHub repository:

### 1. SNYK_TOKEN (Optional but Recommended)
- **Purpose**: Enables Snyk vulnerability scanning
- **How to get**: 
  1. Sign up at [snyk.io](https://snyk.io)
  2. Go to Account Settings → API Token
  3. Copy your API token
- **How to set**: 
  1. Go to your GitHub repository
  2. Settings → Secrets and variables → Actions
  3. Click "New repository secret"
  4. Name: `SNYK_TOKEN`
  5. Value: Your Snyk API token

### 2. GITLEAKS_LICENSE (Optional)
- **Purpose**: Enables GitLeaks for secret detection
- **How to get**: 
  1. Visit [gitleaks.io](https://gitleaks.io)
  2. Get a free license or use the open-source version
- **How to set**: 
  1. Go to your GitHub repository
  2. Settings → Secrets and variables → Actions
  3. Click "New repository secret"
  4. Name: `GITLEAKS_LICENSE`
  5. Value: Your GitLeaks license key

### 3. SLACK_WEBHOOK_URL (Optional)
- **Purpose**: Sends security scan notifications to Slack
- **How to get**: 
  1. Go to your Slack workspace
  2. Apps → Incoming Webhooks
  3. Create a new webhook for the #security channel
  4. Copy the webhook URL
- **How to set**: 
  1. Go to your GitHub repository
  2. Settings → Secrets and variables → Actions
  3. Click "New repository secret"
  4. Name: `SLACK_WEBHOOK_URL`
  5. Value: Your Slack webhook URL

## 🛡️ Security Workflow Features

The security workflow includes the following scans:

### 1. Dependency Vulnerability Scan
- **Tools**: npm audit, Snyk
- **Frequency**: Every push, PR, and daily at 2 AM UTC
- **What it checks**: Known vulnerabilities in npm packages

### 2. Code Quality and Security Scan
- **Tools**: ESLint, TypeScript
- **What it checks**: 
  - Code quality issues
  - Security anti-patterns
  - Type safety issues

### 3. Secrets Detection
- **Tools**: TruffleHog, GitLeaks
- **What it checks**: 
  - Hardcoded secrets in code
  - API keys, passwords, tokens
  - Database credentials

### 4. Container Security Scan
- **Tools**: Trivy
- **What it checks**: 
  - Docker image vulnerabilities
  - Container misconfigurations
  - Base image issues

### 5. Security Testing
- **Tools**: OWASP ZAP
- **What it checks**: 
  - Web application vulnerabilities
  - OWASP Top 10 issues

## 🔧 Workflow Configuration

The workflow is configured to:
- ✅ Continue on error for optional tools (won't fail if secrets are missing)
- ✅ Run on all pushes and pull requests to main/develop branches
- ✅ Run daily at 2 AM UTC for continuous monitoring
- ✅ Upload results to GitHub Security tab
- ✅ Send notifications to Slack (if configured)

## 📊 Viewing Results

1. **GitHub Security Tab**: Go to your repository → Security tab
2. **Actions Tab**: Go to your repository → Actions tab to see workflow runs
3. **Slack Notifications**: If configured, you'll get notifications in your #security channel

## 🚨 What Happens Without Secrets

If you don't configure the optional secrets:
- ✅ The workflow will still run successfully
- ✅ Basic security scans (npm audit, ESLint, TruffleHog) will work
- ❌ Snyk scanning will be skipped
- ❌ GitLeaks will use the open-source version (limited features)
- ❌ Slack notifications will be skipped

## 🔍 Manual Security Checks

You can also run security checks manually:

```bash
# Check for vulnerabilities
cd baakh-nextjs
npm audit

# Run ESLint security rules
npx eslint . --ext .ts,.tsx

# Check TypeScript
npm run tsc --silent --workspaces=false --if-present -- --noEmit --strict

# Run security tests
npm run test:security
```

## 📝 Best Practices

1. **Regular Updates**: Keep dependencies updated
2. **Secret Management**: Never commit secrets to code
3. **Code Reviews**: Review all security-related changes
4. **Monitoring**: Check security scan results regularly
5. **Documentation**: Keep security policies up to date

## 🆘 Troubleshooting

### Common Issues:
1. **Workflow fails**: Check if all required secrets are set
2. **Snyk errors**: Verify your SNYK_TOKEN is valid
3. **Slack notifications not working**: Check webhook URL and channel permissions
4. **False positives**: Review and adjust scan configurations

### Getting Help:
- Check the Actions tab for detailed error logs
- Review the Security tab for vulnerability details
- Consult the tool documentation for specific issues
