-- Check the exact structure of the tags table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tags' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if the table has any data
SELECT COUNT(*) as total_rows FROM public.tags;

-- Show a sample row if any exists
SELECT * FROM public.tags LIMIT 1;
