#!/bin/bash

# Test Authentication System
# This script helps verify that the authentication system is properly configured

echo "🔐 Testing Authentication System"
echo "================================"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found"
    echo "   Please create .env.local with your Supabase configuration"
    exit 1
fi

echo "✅ .env.local file found"

# Check required environment variables
source .env.local

REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    exit 1
fi

echo "✅ All required environment variables are set"

# Check if Supabase URL is valid
if [[ ! "$NEXT_PUBLIC_SUPABASE_URL" =~ ^https://[a-zA-Z0-9.-]+\.supabase\.co$ ]]; then
    echo "⚠️  Supabase URL format looks unusual: $NEXT_PUBLIC_SUPABASE_URL"
    echo "   Expected format: https://[project-id].supabase.co"
fi

# Check if keys look valid (basic format check)
if [[ ! "$NEXT_PUBLIC_SUPABASE_ANON_KEY" =~ ^eyJ[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$ ]]; then
    echo "⚠️  Anon key format looks unusual"
fi

if [[ ! "$SUPABASE_SERVICE_ROLE_KEY" =~ ^eyJ[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$ ]]; then
    echo "⚠️  Service role key format looks unusual"
fi

echo "✅ Environment configuration looks good"

# Check if database setup script exists
if [ ! -f "setup_profiles_table.sql" ]; then
    echo "❌ setup_profiles_table.sql not found"
    echo "   Please ensure the database setup script is in place"
    exit 1
fi

echo "✅ Database setup script found"

# Check if required components exist
REQUIRED_FILES=(
    "src/lib/hooks/useAuth.ts"
    "src/components/auth/ProtectedRoute.tsx"
    "src/components/layouts/AdminLayout.tsx"
    "src/app/api/auth/me/route.ts"
    "middleware.ts"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "❌ Missing required files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

echo "✅ All required components are present"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found"
    echo "   Run: npm install"
else
    echo "✅ Dependencies are installed"
fi

echo ""
echo "🎉 Authentication system appears to be properly configured!"
echo ""
echo "Next steps:"
echo "1. Run the database setup script in your Supabase SQL editor"
echo "2. Create your first admin user"
echo "3. Test the login flow at /admin/login"
echo "4. Verify route protection works correctly"
echo ""
echo "For detailed setup instructions, see: AUTHENTICATION_SETUP.md"
