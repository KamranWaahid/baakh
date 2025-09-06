-- Check if poetry tables exist and create sample data
-- This script will help diagnose and fix poetry table issues

-- Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM information_schema.tables 
WHERE table_name IN ('poetry_main', 'poets', 'categories')
ORDER BY table_name;

-- Check poetry_main table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'poetry_main' 
ORDER BY ordinal_position;

-- Check if there's any data in poetry_main
SELECT COUNT(*) as poetry_count FROM poetry_main;

-- Check if there's any data in poets
SELECT COUNT(*) as poets_count FROM poets;

-- Check if there's any data in categories
SELECT COUNT(*) as categories_count FROM categories;

-- If poetry_main is empty, insert some sample data
DO $$
DECLARE
    poet_id UUID;
    category_id INTEGER;
BEGIN
    -- Get a poet ID
    SELECT id INTO poet_id FROM poets LIMIT 1;
    
    -- Get a category ID
    SELECT id INTO category_id FROM categories WHERE slug = 'ghazal' LIMIT 1;
    
    -- Only insert if we have both poet and category
    IF poet_id IS NOT NULL AND category_id IS NOT NULL THEN
        -- Insert sample poetry if table is empty
        IF NOT EXISTS (SELECT 1 FROM poetry_main LIMIT 1) THEN
            INSERT INTO poetry_main (
                poet_id,
                category_id,
                poetry_slug,
                content_style,
                poetry_tags,
                lang,
                visibility,
                is_featured
            ) VALUES 
            (
                poet_id,
                category_id,
                'sample-ghazal-1',
                'justified',
                ARRAY['صوفي', 'عشق', 'محبت'],
                'sd',
                'public',
                true
            ),
            (
                poet_id,
                category_id,
                'sample-ghazal-2',
                'justified',
                ARRAY['روحاني', 'دانش'],
                'sd',
                'public',
                false
            );
            
            RAISE NOTICE 'Inserted 2 sample poetry entries';
        ELSE
            RAISE NOTICE 'Poetry table already has data, skipping sample insert';
        END IF;
    ELSE
        RAISE NOTICE 'Cannot insert sample poetry: poet_id=%, category_id=%', poet_id, category_id;
    END IF;
END $$;

-- Show final counts
SELECT 
    'poetry_main' as table_name,
    COUNT(*) as record_count
FROM poetry_main
UNION ALL
SELECT 
    'poets' as table_name,
    COUNT(*) as record_count
FROM poets
UNION ALL
SELECT 
    'categories' as table_name,
    COUNT(*) as record_count
FROM categories;
