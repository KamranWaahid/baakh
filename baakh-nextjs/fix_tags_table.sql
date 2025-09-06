-- Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tags' AND table_schema = 'public';

-- If the table is missing columns, add them
-- Add slug column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tags' AND column_name = 'slug') THEN
        ALTER TABLE public.tags ADD COLUMN slug TEXT;
    END IF;
END $$;

-- Add tag_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tags' AND column_name = 'tag_type') THEN
        ALTER TABLE public.tags ADD COLUMN tag_type TEXT DEFAULT 'Topic';
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tags' AND column_name = 'created_at') THEN
        ALTER TABLE public.tags ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Check final table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tags' AND table_schema = 'public'
ORDER BY ordinal_position;
