-- Check current table structure to see what columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tags' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
-- Add slug column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tags' AND column_name = 'slug') THEN
        ALTER TABLE public.tags ADD COLUMN slug TEXT UNIQUE NOT NULL;
        RAISE NOTICE 'Added slug column';
    ELSE
        RAISE NOTICE 'slug column already exists';
    END IF;
END $$;

-- Add tag_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tags' AND column_name = 'tag_type') THEN
        ALTER TABLE public.tags ADD COLUMN tag_type TEXT DEFAULT 'Topic';
        RAISE NOTICE 'Added tag_type column';
    ELSE
        RAISE NOTICE 'tag_type column already exists';
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tags' AND column_name = 'created_at') THEN
        ALTER TABLE public.tags ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    ELSE
        RAISE NOTICE 'created_at column already exists';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tags' AND column_name = 'updated_at') THEN
        ALTER TABLE public.tags ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;
END $$;

-- Grant permissions to service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tags TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tags_translations TO service_role;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Create a test tag with the label column (since it's NOT NULL)
INSERT INTO public.tags (label, slug, tag_type, created_at, updated_at) 
VALUES ('Test Tag', 'test-tag', 'Topic', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Check if test tag was created
SELECT * FROM public.tags;

-- Show final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tags' AND table_schema = 'public'
ORDER BY ordinal_position;
