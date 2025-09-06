-- Check the structure of tags_translations table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tags_translations' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data if any exists
SELECT * FROM public.tags_translations LIMIT 5;
