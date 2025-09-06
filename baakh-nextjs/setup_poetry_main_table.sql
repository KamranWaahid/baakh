-- Setup poetry_main table with proper structure and foreign key relationships
-- This script creates the poetry_main table with all necessary columns and constraints

-- Drop existing table if it exists (be careful in production!)
-- DROP TABLE IF EXISTS public.poetry_main CASCADE;

-- Create poetry_main table
CREATE TABLE IF NOT EXISTS public.poetry_main (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Foreign key relationships
    poet_id UUID REFERENCES public.poets(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Basic poetry information
    poetry_slug TEXT UNIQUE NOT NULL,
    content_style TEXT DEFAULT 'justified' CHECK (content_style IN ('justified', 'centered', 'left-aligned', 'right-aligned')),
    poetry_tags TEXT[] DEFAULT '{}',
    lang TEXT NOT NULL DEFAULT 'sd' CHECK (lang IN ('sd', 'en')),
    
    -- Visibility and status
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'draft')),
    is_featured BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_poetry_main_slug ON public.poetry_main(poetry_slug);
CREATE INDEX IF NOT EXISTS idx_poetry_main_poet_id ON public.poetry_main(poet_id);
CREATE INDEX IF NOT EXISTS idx_poetry_main_category_id ON public.poetry_main(category_id);
CREATE INDEX IF NOT EXISTS idx_poetry_main_user_id ON public.poetry_main(user_id);
CREATE INDEX IF NOT EXISTS idx_poetry_main_visibility ON public.poetry_main(visibility);
CREATE INDEX IF NOT EXISTS idx_poetry_main_featured ON public.poetry_main(is_featured);
CREATE INDEX IF NOT EXISTS idx_poetry_main_created_at ON public.poetry_main(created_at);
CREATE INDEX IF NOT EXISTS idx_poetry_main_lang ON public.poetry_main(lang);
CREATE INDEX IF NOT EXISTS idx_poetry_main_deleted_at ON public.poetry_main(deleted_at);

-- Create full-text search indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_poetry_main_tags_search ON public.poetry_main USING gin(poetry_tags);

-- Create the foreign key constraints explicitly (in case they weren't created above)
DO $$
BEGIN
    -- Add foreign key constraint for poets if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'poetry_main_poet_id_fkey' 
        AND table_name = 'poetry_main'
    ) THEN
        ALTER TABLE public.poetry_main 
        ADD CONSTRAINT poetry_main_poet_id_fkey 
        FOREIGN KEY (poet_id) REFERENCES public.poets(id) ON DELETE SET NULL;
    END IF;

    -- Add foreign key constraint for categories if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'poetry_main_category_id_fkey' 
        AND table_name = 'poetry_main'
    ) THEN
        ALTER TABLE public.poetry_main 
        ADD CONSTRAINT poetry_main_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Grant permissions to service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.poetry_main TO service_role;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_poetry_main_updated_at 
    BEFORE UPDATE ON public.poetry_main 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample poetry entries for testing (optional)
-- Uncomment and modify as needed
/*
INSERT INTO public.poetry_main (
    poet_id,
    category_id,
    poetry_slug,
    content_style,
    poetry_tags,
    lang,
    visibility,
    is_featured
) VALUES (
    (SELECT id FROM public.poets WHERE poet_slug = 'shah-abdul-latif' LIMIT 1),
    (SELECT id FROM public.categories WHERE slug = 'ghazal' LIMIT 1),
    'shah-latif-ghazal-1',
    'justified',
    ARRAY['صوفي', 'عشق', 'محبت'],
    'sd',
    'public',
    true
);
*/

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'poetry_main' 
ORDER BY ordinal_position;

-- Verify foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'poetry_main';
