-- Test script to understand the actual data types and relationships
-- Run this in Supabase SQL Editor to see what we're working with

-- Check poetry_main table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'poetry_main' 
AND column_name = 'id';

-- Check poetry_reports table structure  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'poetry_reports' 
AND column_name = 'poetry_id';

-- Check if there's any data in poetry_main
SELECT COUNT(*) as poetry_count FROM poetry_main;

-- Check if there's any data in poetry_reports
SELECT COUNT(*) as reports_count FROM poetry_reports;

-- Check a sample poetry_main record
SELECT id, poetry_slug FROM poetry_main LIMIT 1;

-- Check a sample poetry_reports record (if any)
SELECT poetry_id, category, reason FROM poetry_reports LIMIT 1;
