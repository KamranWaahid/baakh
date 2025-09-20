-- Setup tags and tags_translations tables with proper structure
-- This script creates the tables and inserts common poet tags with translations

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS public.tags_translations CASCADE;
-- DROP TABLE IF EXISTS public.tags CASCADE;

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id BIGSERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    tag_type TEXT DEFAULT 'Poet',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags_translations table with the exact structure you specified
CREATE TABLE IF NOT EXISTS public.tags_translations (
    tag_id BIGINT NOT NULL,
    lang_code CHARACTER VARYING(20) NOT NULL,
    title CHARACTER VARYING(255) NOT NULL,
    detail TEXT NOT NULL,
    CONSTRAINT tags_translations_pkey PRIMARY KEY (tag_id, lang_code),
    CONSTRAINT tags_translations_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tags (id) ON UPDATE CASCADE ON DELETE CASCADE
) TABLESPACE pg_default;

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

-- Insert common poet tags
INSERT INTO public.tags (slug, label, tag_type, created_at, updated_at) 
VALUES 
    ('women-poet', 'عورت شاعر', 'Poet', NOW(), NOW()),
    ('young-poets', 'نوجوان شاعر', 'Poet', NOW(), NOW()),
    ('classical-poet', 'ڪلاسيڪل شاعر', 'Poet', NOW(), NOW()),
    ('sufi-poet', 'صوفي شاعر', 'Poet', NOW(), NOW()),
    ('modern-poet', 'جديد شاعر', 'Poet', NOW(), NOW()),
    ('contemporary-poet', 'عصري شاعر', 'Poet', NOW(), NOW()),
    ('post-partition-poets', 'تقسيم کانپوءِ جا شاعر', 'Poet', NOW(), NOW()),
    ('progressive-poets', 'ترقي پسند شاعر', 'Poet', NOW(), NOW()),
    ('revolutionary-poet', 'انقلابي شاعر', 'Poet', NOW(), NOW()),
    ('nationalist-poet', 'قومي شاعر', 'Poet', NOW(), NOW()),
    ('freedom-fighter-poet', 'آزادي جي جنگجو شاعر', 'Poet', NOW(), NOW()),
    ('featured', 'چونڊ', 'Poet', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert Sindhi translations
INSERT INTO public.tags_translations (tag_id, lang_code, title, detail) 
SELECT 
    t.id,
    'sd',
    t.label,
    'سنڌي تفصيل: ' || t.label
FROM public.tags t
WHERE t.slug IN (
    'women-poet', 'young-poets', 'classical-poet', 'sufi-poet', 
    'modern-poet', 'contemporary-poet', 'post-partition-poets', 
    'progressive-poets', 'revolutionary-poet', 'nationalist-poet', 
    'freedom-fighter-poet', 'featured'
)
ON CONFLICT (tag_id, lang_code) DO NOTHING;

-- Insert English translations
INSERT INTO public.tags_translations (tag_id, lang_code, title, detail) 
SELECT 
    t.id,
    'en',
    CASE 
        WHEN t.slug = 'women-poet' THEN 'Women Poet'
        WHEN t.slug = 'young-poets' THEN 'Young Poets'
        WHEN t.slug = 'classical-poet' THEN 'Classical Poet'
        WHEN t.slug = 'sufi-poet' THEN 'Sufi Poet'
        WHEN t.slug = 'modern-poet' THEN 'Modern Poet'
        WHEN t.slug = 'contemporary-poet' THEN 'Contemporary Poet'
        WHEN t.slug = 'post-partition-poets' THEN 'Post-Partition Poets'
        WHEN t.slug = 'progressive-poets' THEN 'Progressive Poets'
        WHEN t.slug = 'revolutionary-poet' THEN 'Revolutionary Poet'
        WHEN t.slug = 'nationalist-poet' THEN 'Nationalist Poet'
        WHEN t.slug = 'freedom-fighter-poet' THEN 'Freedom Fighter Poet'
        WHEN t.slug = 'featured' THEN 'Featured'
        ELSE t.label
    END,
    'English description for ' || t.label
FROM public.tags t
WHERE t.slug IN (
    'women-poet', 'young-poets', 'classical-poet', 'sufi-poet', 
    'modern-poet', 'contemporary-poet', 'post-partition-poets', 
    'progressive-poets', 'revolutionary-poet', 'nationalist-poet', 
    'freedom-fighter-poet', 'featured'
)
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

SELECT 'Sample data with translations:' as info;
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
