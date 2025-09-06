-- Test database connection and check table existence
-- This script will help diagnose database issues

-- Test basic connection
SELECT 'Database connection successful' as status;

-- Check if we can access the public schema
SELECT 'Public schema accessible' as status;

-- Check if tags table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tags') 
        THEN 'Tags table exists' 
        ELSE 'Tags table does not exist' 
    END as table_status;

-- Check if tags_translations table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tags_translations') 
        THEN 'Tags translations table exists' 
        ELSE 'Tags translations table does not exist' 
    END as table_status;

-- Check table structure if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tags') THEN
        RAISE NOTICE 'Tags table structure:';
        PERFORM column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'tags' 
        ORDER BY ordinal_position;
    ELSE
        RAISE NOTICE 'Tags table does not exist';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tags_translations') THEN
        RAISE NOTICE 'Tags translations table structure:';
        PERFORM column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'tags_translations' 
        ORDER BY ordinal_position;
    ELSE
        RAISE NOTICE 'Tags translations table does not exist';
    END IF;
END $$;

-- Check permissions
SELECT 
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name IN ('tags', 'tags_translations')
AND grantee = current_user;

-- Check if we can insert/select from tables
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tags') THEN
        BEGIN
            INSERT INTO tags (slug, label, tag_type) VALUES ('test-connection', 'Test Tag', 'Topic');
            RAISE NOTICE 'Successfully inserted test tag';
            DELETE FROM tags WHERE slug = 'test-connection';
            RAISE NOTICE 'Successfully deleted test tag';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error testing tags table: %', SQLERRM;
        END;
    END IF;
END $$;
