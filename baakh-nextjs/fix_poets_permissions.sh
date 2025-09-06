#!/bin/bash

# Fix Poets Table Permissions Script
# This script fixes the permissions for the poets table to allow public read access

echo "🔧 Fixing Poets Table Permissions for Public Access"
echo "=================================================="

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL environment variable is not set"
    echo "Please set it in your .env.local file or export it in your shell"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
    echo "Please set it in your .env.local file or export it in your shell"
    exit 1
fi

echo "✅ Environment variables are set"
echo "📡 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"

# Extract database connection details from Supabase URL
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co||')

echo "🔍 Project ID: $PROJECT_ID"

echo ""
echo "📋 Manual Setup Instructions:"
echo "============================="
echo ""
echo "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
echo "2. Select your project: $PROJECT_ID"
echo "3. Go to SQL Editor in the left sidebar"
echo "4. Copy and paste the contents of 'fix_poets_permissions.sql'"
echo "5. Click 'Run' to execute the SQL"
echo ""
echo "This will:"
echo "  - Enable RLS on the poets table"
echo "  - Grant public read access to non-hidden poets"
echo "  - Create proper security policies"
echo "  - Allow the /api/poets endpoint to work"
echo ""

echo "🧪 Testing current API connection..."
if curl -s "http://localhost:3000/api/poets" | grep -q "permission denied"; then
    echo "❌ Current status: Permission denied (needs fix)"
    echo "   Run the SQL script above to fix this"
else
    echo "✅ Current status: Working correctly"
fi

echo ""
echo "✨ Instructions complete! Run the SQL script in Supabase to fix the permissions."
