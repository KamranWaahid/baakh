#!/bin/bash

# Setup script for tags and tags_translations tables
# This script will create the tables and insert sample data

echo "🚀 Setting up tags and tags_translations tables..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "Please set it to your database connection string:"
    echo "export DATABASE_URL='postgresql://username:password@host:port/database'"
    exit 1
fi

# Run the SQL script
echo "📋 Running SQL setup script..."
psql "$DATABASE_URL" -f setup_tags_with_translations.sql

if [ $? -eq 0 ]; then
    echo "✅ Tags setup completed successfully!"
    echo ""
    echo "You can now:"
    echo "1. Visit /sd/poets to see Sindhi tag translations"
    echo "2. Visit /en/poets to see English tag translations"
    echo "3. Use the /api/tags endpoint to manage tags programmatically"
else
    echo "❌ Tags setup failed. Please check your database connection and try again."
    exit 1
fi
