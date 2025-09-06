-- Comprehensive setup for tags system
-- This script creates the proper table structure for tags and translations

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS tags_translations CASCADE;
-- DROP TABLE IF EXISTS tags CASCADE;

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    tag_type TEXT DEFAULT 'Topic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags_translations table
CREATE TABLE IF NOT EXISTS public.tags_translations (
    id SERIAL PRIMARY KEY,
    tag_id INTEGER NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    lang_code TEXT NOT NULL CHECK (lang_code IN ('en', 'sd')),
    title TEXT NOT NULL,
    detail TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tag_id, lang_code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_type ON public.tags(tag_type);
CREATE INDEX IF NOT EXISTS idx_tags_translations_tag_id ON public.tags_translations(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_translations_lang ON public.tags_translations(lang_code);

-- Grant permissions to service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tags TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tags_translations TO service_role;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Insert some sample tags for testing
INSERT INTO public.tags (slug, label, tag_type, created_at, updated_at) 
VALUES 
    ('love', 'محبت', 'Emotion', NOW(), NOW()),
    ('nature', 'طبيعت', 'Theme', NOW(), NOW()),
    ('religion', 'مذهب', 'Topic', NOW(), NOW()),
    ('ghazal', 'غزل', 'Form', NOW(), NOW()),
    ('rubai', 'رباعي', 'Form', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert translations for the sample tags
INSERT INTO public.tags_translations (tag_id, lang_code, title, detail) 
SELECT 
    t.id,
    'sd',
    t.label,
    'Sindhi description for ' || t.label
FROM public.tags t
WHERE t.slug IN ('love', 'nature', 'religion', 'ghazal', 'rubai')
ON CONFLICT (tag_id, lang_code) DO NOTHING;

INSERT INTO public.tags_translations (tag_id, lang_code, title, detail) 
SELECT 
    t.id,
    'en',
    CASE 
        WHEN t.slug = 'love' THEN 'Love'
        WHEN t.slug = 'nature' THEN 'Nature'
        WHEN t.slug = 'religion' THEN 'Religion'
        WHEN t.slug = 'ghazal' THEN 'Ghazal'
        WHEN t.slug = 'rubai' THEN 'Rubai'
        ELSE t.label
    END,
    'English description for ' || t.label
FROM public.tags t
WHERE t.slug IN ('love', 'nature', 'religion', 'ghazal', 'rubai')
ON CONFLICT (tag_id, lang_code) DO NOTHING;

-- Verify the setup
SELECT 'Tags table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tags' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Tags translations table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tags_translations' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Sample data:' as info;
SELECT 
    t.id,
    t.slug,
    t.label,
    t.tag_type,
    sd.title as sindhi_title,
    en.title as english_title
FROM public.tags t
LEFT JOIN public.tags_translations sd ON t.id = sd.tag_id AND sd.lang_code = 'sd'
LEFT JOIN public.tags_translations en ON t.id = en.tag_id AND en.lang_code = 'en'
ORDER BY t.id;
