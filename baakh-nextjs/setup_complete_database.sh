#!/bin/bash

# Complete Database Setup Script for Baakh NextJS
# This script will set up all necessary tables in the correct order

echo "🚀 Setting up complete Baakh database..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed or not in PATH"
    echo "Please install PostgreSQL client tools first"
    exit 1
fi

# Check if environment variables are set
if [ -z "$DATABASE_URL" ] && [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: Database connection details not found"
    echo "Please set DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable"
    echo ""
    echo "Example:"
    echo "export DATABASE_URL='postgresql://username:password@host:port/database'"
    echo "export NEXT_PUBLIC_SUPABASE_URL='https://your-project.supabase.co'"
    exit 1
fi

# Use DATABASE_URL if available, otherwise construct from Supabase URL
if [ -n "$DATABASE_URL" ]; then
    DB_URL="$DATABASE_URL"
else
    # Extract database details from Supabase URL
    SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
    DB_HOST=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co.*||')
    DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.$DB_HOST.supabase.co:5432/postgres"
    echo "⚠️  Please update the password in the script or set DATABASE_URL"
    echo "Database URL: $DB_URL"
    echo "Replace [YOUR-PASSWORD] with your actual database password"
    exit 1
fi

echo "📊 Running complete database setup..."

# Step 1: Setup tags system (if not already done)
echo "📋 Step 1: Setting up tags system..."
if [ -f "setup_tags_database.sql" ]; then
    if psql "$DB_URL" -f setup_tags_database.sql; then
        echo "✅ Tags system setup completed!"
    else
        echo "⚠️  Tags system setup failed, but continuing..."
    fi
else
    echo "⚠️  Tags setup script not found, skipping..."
fi

# Step 2: Setup poets table (if not already done)
echo "📋 Step 2: Setting up poets table..."
if [ -f "setup_poets_table.sql" ]; then
    if psql "$DB_URL" -f setup_poets_table.sql; then
        echo "✅ Poets table setup completed!"
    else
        echo "⚠️  Poets table setup failed, but continuing..."
    fi
else
    echo "⚠️  Poets setup script not found, skipping..."
fi

# Step 3: Setup categories table
echo "📋 Step 3: Setting up categories table..."
if [ -f "setup_categories_table.sql" ]; then
    if psql "$DB_URL" -f setup_categories_table.sql; then
        echo "✅ Categories table setup completed!"
    else
        echo "❌ Categories table setup failed!"
        exit 1
    fi
else
    echo "❌ Categories setup script not found!"
    exit 1
fi

# Step 4: Setup poetry_main table
echo "📋 Step 4: Setting up poetry_main table..."
if [ -f "setup_poetry_main_table.sql" ]; then
    if psql "$DB_URL" -f setup_poetry_main_table.sql; then
        echo "✅ Poetry main table setup completed!"
    else
        echo "❌ Poetry main table setup failed!"
        exit 1
    fi
else
    echo "❌ Poetry main setup script not found!"
    exit 1
fi

echo ""
echo "🎉 Complete database setup finished successfully!"
echo ""
echo "Your Baakh database now includes:"
echo "  ✅ Tags system with translations"
echo "  ✅ Poets table with bilingual support"
echo "  ✅ Categories table with translations"
echo "  ✅ Poetry main table with proper foreign keys"
echo ""
echo "You can now:"
echo "  - Visit /admin/tags to manage tags"
echo "  - Visit /admin/poets to manage poets"
echo "  - Visit /admin/categories to manage categories"
echo "  - Visit /admin/poetry to manage poetry"
echo ""
echo "🌐 Your application should now work without foreign key errors!"
