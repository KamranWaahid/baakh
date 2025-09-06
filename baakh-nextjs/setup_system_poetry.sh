#!/bin/bash

# Setup system poetry record for standalone couplets
# This script creates a system poetry record with ID 0 that allows standalone couplets

echo "Setting up system poetry record for standalone couplets..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql is not installed or not in PATH"
    echo "Please install PostgreSQL client tools first"
    exit 1
fi

# Database connection parameters (update these as needed)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"

echo "Connecting to database: $DB_HOST:$DB_PORT/$DB_NAME as $DB_USER"

# SQL to create system poetry record
SQL="
-- Create system poetry record for standalone couplets
INSERT INTO public.poetry_main (
    id,
    poetry_slug,
    poetry_tags,
    visibility,
    is_featured,
    category_id,
    created_at,
    updated_at
) VALUES (
    0, -- Use ID 0 for system couplets
    'system-standalone-couplets',
    'system,standalone,couplets',
    false, -- Not visible to users
    false, -- Not featured
    NULL, -- No category
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the record was created
SELECT 
    id, 
    poetry_slug, 
    poetry_tags, 
    visibility, 
    is_featured, 
    category_id,
    created_at
FROM public.poetry_main 
WHERE id = 0;

-- Show current poetry_couplets constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'poetry_couplets' 
    AND tc.constraint_type = 'FOREIGN KEY';
"

# Execute the SQL
echo "Executing SQL..."
echo "$SQL" | psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER"

if [ $? -eq 0 ]; then
    echo "✅ System poetry record setup completed successfully!"
    echo "You can now create standalone couplets with poetry_id = 0"
else
    echo "❌ Failed to setup system poetry record"
    echo "Please check your database connection and permissions"
    exit 1
fi
