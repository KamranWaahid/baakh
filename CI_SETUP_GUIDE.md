# CI/CD Setup Guide

## Problem Solved
The original error was:
```
Error: Dependencies lock file is not found in /home/runner/work/Baakh/Baakh. Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

## Solution Implemented

### 1. Created GitHub Actions Workflow
- **File**: `.github/workflows/ci.yml`
- **Features**:
  - Uses Node.js 18.20.8 (specified in `.nvmrc`)
  - Supports both npm and pnpm
  - Handles dependency installation with `--legacy-peer-deps`
  - Includes security scanning
  - Builds and tests the application
  - Uploads build artifacts

### 2. Fixed Dependency Management
- **Root package-lock.json**: Created for CI compatibility
- **pnpm-lock.yaml**: Already exists for local development
- **.npmrc**: Added configuration for legacy peer deps
- **.nvmrc**: Specified Node.js version

### 3. Project Structure
```
Baakh-NextJs/
├── .github/workflows/ci.yml    # GitHub Actions workflow
├── .nvmrc                      # Node.js version
├── .npmrc                      # npm configuration
├── package.json                # Root package.json
├── package-lock.json           # npm lock file (for CI)
├── pnpm-lock.yaml             # pnpm lock file (for local dev)
├── baakh-nextjs/              # Frontend application
│   ├── package.json
│   ├── package-lock.json      # Generated for CI
│   └── pnpm-lock.yaml
└── backend/                    # Backend application
    ├── package.json
    └── package-lock.json
```

## How It Works

### Local Development
```bash
# Use pnpm for frontend (recommended)
cd baakh-nextjs
pnpm install
pnpm run dev

# Or use npm
cd baakh-nextjs
npm install --legacy-peer-deps
npm run dev
```

### CI/CD Pipeline
1. **Checkout**: Gets the latest code
2. **Setup Node.js**: Uses version from `.nvmrc`
3. **Install Dependencies**: 
   - Root: `npm install --legacy-peer-deps`
   - Frontend: `pnpm install --frozen-lockfile`
4. **Run Tests**: Linting and security tests
5. **Build**: Creates production build
6. **Upload Artifacts**: Saves build files

## Environment Variables Required

Make sure these are set in your GitHub repository secrets:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Security
CSRF_SECRET=your_strong_csrf_secret_here
SUPABASE_JWT_SECRET=your_strong_jwt_secret_here

# Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="https://accurate-eagle-7290.upstash.io"
UPSTASH_REDIS_REST_TOKEN="ARx6AAImcDJlYjhkZmVlMGRjNDM0OTQ5OGM1Y2ZlMTIyNjQ1ZDA0ZXAyNzI5MA"

# Test Credentials
TEST_USERNAME=testuser
TEST_PASSWORD=testpass
```

## Troubleshooting

### If CI Still Fails
1. Check that all environment variables are set
2. Verify the Node.js version matches `.nvmrc`
3. Ensure all required files are committed to git
4. Check the GitHub Actions logs for specific errors

### Local Development Issues
1. Use `pnpm` for the frontend (recommended)
2. Use `npm` with `--legacy-peer-deps` if needed
3. Clear node_modules and reinstall if dependencies are corrupted

## Security Features
- Rate limiting on API endpoints
- Input validation with Zod schemas
- CSRF protection
- Admin authorization middleware
- SQL injection prevention
- Error handling with sanitized responses
- Security scanning in CI pipeline

Your CI/CD pipeline is now ready! 🚀
