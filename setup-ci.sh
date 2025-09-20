#!/bin/bash

# CI/CD Setup Script for Baakh Next.js
echo "🚀 Setting up CI/CD for Baakh Next.js..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --legacy-peer-deps

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd baakh-nextjs
pnpm install --frozen-lockfile

# Go back to root
cd ..

# Check if all required files exist
echo "🔍 Checking required files..."

required_files=(
    ".github/workflows/ci.yml"
    ".nvmrc"
    ".npmrc"
    "package-lock.json"
    "baakh-nextjs/package-lock.json"
    "baakh-nextjs/pnpm-lock.yaml"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
    fi
done

echo ""
echo "🎉 CI/CD setup complete!"
echo ""
echo "Next steps:"
echo "1. Commit all changes to git"
echo "2. Push to your repository"
echo "3. Set up environment variables in GitHub repository secrets"
echo "4. Check the Actions tab in GitHub to see the pipeline run"
echo ""
echo "For more details, see CI_SETUP_GUIDE.md"
