#!/bin/bash

# Setup Poets Database Script
# This script helps set up the poets table in your Supabase database

echo "🚀 Setting up Poets Database for Baakh NextJS"
echo "=============================================="

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
# The URL format is: https://[project-id].supabase.co
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co||')

echo "🔍 Project ID: $PROJECT_ID"

# Instructions for manual setup
echo ""
echo "📋 Manual Setup Instructions:"
echo "============================="
echo ""
echo "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
echo "2. Select your project: $PROJECT_ID"
echo "3. Go to SQL Editor in the left sidebar"
echo "4. Copy and paste the contents of 'setup_poets_table.sql'"
echo "5. Click 'Run' to execute the SQL"
echo ""
echo "Alternatively, you can use the Supabase CLI:"
echo "1. Install Supabase CLI: npm install -g supabase"
echo "2. Login: supabase login"
echo "3. Link your project: supabase link --project-ref $PROJECT_ID"
echo "4. Run the SQL: supabase db push --file setup_poets_table.sql"
echo ""
echo "📁 SQL file location: setup_poets_table.sql"
echo ""
echo "🎯 After running the SQL, your poets table will be ready!"
echo "   You can then use the /admin/poets/create page to add new poets."
echo ""
echo "🔗 Test the API endpoints:"
echo "   - GET /api/admin/poets (list all poets)"
echo "   - POST /api/admin/poets (create new poet)"
echo "   - GET /api/admin/poets/[id] (get single poet)"
echo "   - PUT /api/admin/poets/[id] (update poet)"
echo "   - DELETE /api/admin/poets/[id] (delete poet)"
echo ""

# Check if the poets table exists by testing the API
echo "🧪 Testing API connection..."
if curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/poets?select=count" > /dev/null 2>&1; then
    echo "✅ Poets table appears to exist and is accessible"
else
    echo "❌ Poets table not found or not accessible"
    echo "   Please run the SQL setup script first"
fi

echo ""
echo "✨ Setup complete! Follow the manual instructions above to create your poets table."
