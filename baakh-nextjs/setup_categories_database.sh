#!/bin/bash

# Categories Table Setup Script for Baakh NextJS
# This script will help you set up the categories table with proper structure and translations

echo "🚀 Setting up Baakh categories table..."

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

echo "📊 Running categories table setup..."

# Run the SQL setup script
if psql "$DB_URL" -f setup_categories_table.sql; then
    echo "✅ Categories table setup completed successfully!"
    echo ""
    echo "🎉 Your categories system is now ready!"
    echo "You can now:"
    echo "  - Create new categories"
    echo "  - Add translations in Sindhi and English"
    echo "  - Manage category content styles and gender"
    echo ""
    echo "🌐 Visit /admin/categories to start managing your categories"
else
    echo "❌ Categories table setup failed!"
    echo "Please check the error messages above and ensure:"
    echo "  - Database connection is correct"
    echo "  - User has sufficient permissions"
    echo "  - PostgreSQL is running"
    exit 1
fi
