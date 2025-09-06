-- Insert sample poetry data for testing categories API
-- This script matches the actual database schema structure

-- First, let's check if we have the necessary tables and data
DO $$
BEGIN
    -- Check if categories exist
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'nazm') THEN
        INSERT INTO public.categories (slug, content_style, gender, is_featured) VALUES
            ('nazm', 'justified', 'feminine', true),
            ('ghazal', 'justified', 'masculine', true),
            ('tairru', 'centered', 'masculine', false),
            ('chhasitta', 'centered', 'feminine', false)
        ON CONFLICT (slug) DO NOTHING;
    END IF;

    -- Check if category details exist
    IF NOT EXISTS (SELECT 1 FROM public.category_details WHERE cat_id = (SELECT id FROM public.categories WHERE slug = 'nazm')) THEN
        INSERT INTO public.category_details (cat_id, cat_name, cat_name_plural, cat_detail, lang) VALUES
            ((SELECT id FROM public.categories WHERE slug = 'nazm'), 'Nazm', 'Nazms', 'A form of poetry that is written in verse and has a specific rhyme scheme or meter.', 'en'),
            ((SELECT id FROM public.categories WHERE slug = 'nazm'), 'نظم', 'نظمون', 'شاعري جو هڪ روپ جيڪو شعر ۾ لکيو ويندو آهي ۽ ان جي هڪ مخصوص رڻ اسڪيم يا ميٽر هوندو آهي.', 'sd'),
            
            ((SELECT id FROM public.categories WHERE slug = 'ghazal'), 'Ghazal', 'Ghazals', 'A poetic form consisting of rhyming couplets and a refrain, with each line sharing the same meter.', 'en'),
            ((SELECT id FROM public.categories WHERE slug = 'ghazal'), 'غزل', 'غزليون', 'هڪ شاعري جو روپ جيڪو رڻين جي جوڙي ۽ هڪ ٻيهر ٻولڻ واري لڪير تي مشتمل آهي، هر لڪير ساڳئي ميٽر سان ورهائجي ٿي.', 'sd'),
            
            ((SELECT id FROM public.categories WHERE slug = 'tairru'), 'Tairru', 'Tairrus', 'A three-line poetic form with specific meter and rhyme.', 'en'),
            ((SELECT id FROM public.categories WHERE slug = 'tairru'), 'تيرڙو', 'تيرڙا', 'ٽن لڪيرن جو هڪ شاعري جو روپ جيڪو مخصوص ميٽر ۽ رڻ سان آهي.', 'sd'),
            
            ((SELECT id FROM public.categories WHERE slug = 'chhasitta'), 'Chhasitta', 'Chhasittas', 'A four-line poetic form with specific meter and rhyme.', 'en'),
            ((SELECT id FROM public.categories WHERE slug = 'chhasitta'), 'چهاستا', 'چهاستا', 'چار لڪيرن جو هڪ شاعري جو روپ جيڪو مخصوص ميٽر ۽ رڻ سان آهي.', 'sd')
        ON CONFLICT (cat_id, lang) DO NOTHING;
    END IF;
END $$;

-- Insert sample poetry entries if they don't exist
DO $$
DECLARE
    nazm_cat_id BIGINT;
    ghazal_cat_id BIGINT;
    tairru_cat_id BIGINT;
    chhasitta_cat_id BIGINT;
    sample_poet_id BIGINT;
BEGIN
    -- Get category IDs
    SELECT id INTO nazm_cat_id FROM public.categories WHERE slug = 'nazm';
    SELECT id INTO ghazal_cat_id FROM public.categories WHERE slug = 'ghazal';
    SELECT id INTO tairru_cat_id FROM public.categories WHERE slug = 'tairru';
    SELECT id INTO chhasitta_cat_id FROM public.categories WHERE slug = 'chhasitta';
    
    -- Get a sample poet ID (create one if none exists)
    SELECT poet_id INTO sample_poet_id FROM public.poets LIMIT 1;
    IF sample_poet_id IS NULL THEN
        INSERT INTO public.poets (poet_slug, sindhi_name, english_name) VALUES
            ('sample-poet', 'نموني شاعر', 'Sample Poet')
        RETURNING poet_id INTO sample_poet_id;
    END IF;

    -- Insert sample nazm poetry
    IF NOT EXISTS (SELECT 1 FROM public.poetry_main WHERE poetry_slug = 'sample-nazm-1') THEN
        INSERT INTO public.poetry_main (
            poet_id, category_id, poetry_slug, content_style, poetry_tags, lang, visibility, is_featured
        ) VALUES (
            sample_poet_id, nazm_cat_id, 'sample-nazm-1', 'justified', 
            'نظم,صبح,طبيعت', 'sd', true, true
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.poetry_main WHERE poetry_slug = 'sample-nazm-2') THEN
        INSERT INTO public.poetry_main (
            poet_id, category_id, poetry_slug, content_style, poetry_tags, lang, visibility, is_featured
        ) VALUES (
            sample_poet_id, nazm_cat_id, 'sample-nazm-2', 'justified', 
            'نظم,رات,خواب', 'sd', true, false
        );
    END IF;

    -- Insert sample ghazal poetry
    IF NOT EXISTS (SELECT 1 FROM public.poetry_main WHERE poetry_slug = 'sample-ghazal-1') THEN
        INSERT INTO public.poetry_main (
            poet_id, category_id, poetry_slug, content_style, poetry_tags, lang, visibility, is_featured
        ) VALUES (
            sample_poet_id, ghazal_cat_id, 'sample-ghazal-1', 'justified', 
            'غزل,محبت,دل', 'sd', true, true
        );
    END IF;

    -- Insert sample tairru poetry
    IF NOT EXISTS (SELECT 1 FROM public.poetry_main WHERE poetry_slug = 'sample-tairru-1') THEN
        INSERT INTO public.poetry_main (
            poet_id, category_id, poetry_slug, content_style, poetry_tags, lang, visibility, is_featured
        ) VALUES (
            sample_poet_id, tairru_cat_id, 'sample-tairru-1', 'centered', 
            'تيرڙو,طبيعت,هوائي', 'sd', true, false
        );
    END IF;

    -- Insert sample chhasitta poetry
    IF NOT EXISTS (SELECT 1 FROM public.poetry_main WHERE poetry_slug = 'sample-chhasitta-1') THEN
        INSERT INTO public.poetry_main (
            poet_id, category_id, poetry_slug, content_style, poetry_tags, lang, visibility, is_featured
        ) VALUES (
            sample_poet_id, chhasitta_cat_id, 'sample-chhasitta-1', 'centered', 
            'چهاستا,ڳوٺ,لوڪ', 'sd', true, false
        );
    END IF;
END $$;

-- Insert poetry translations
DO $$
DECLARE
    nazm_poem_id BIGINT;
    ghazal_poem_id BIGINT;
    tairru_poem_id BIGINT;
    chhasitta_poem_id BIGINT;
BEGIN
    -- Get poetry IDs
    SELECT id INTO nazm_poem_id FROM public.poetry_main WHERE poetry_slug = 'sample-nazm-1';
    SELECT id INTO ghazal_poem_id FROM public.poetry_main WHERE poetry_slug = 'sample-ghazal-1';
    SELECT id INTO tairru_poem_id FROM public.poetry_main WHERE poetry_slug = 'sample-tairru-1';
    SELECT id INTO chhasitta_poem_id FROM public.poetry_main WHERE poetry_slug = 'sample-chhasitta-1';

    -- Insert nazm translations
    IF nazm_poem_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.poetry_translations WHERE poetry_id = nazm_poem_id) THEN
        INSERT INTO public.poetry_translations (poetry_id, title, info, lang) VALUES
            (nazm_poem_id, 'صبح جي نظم', 'صبح جي خوبصورتي ۽ طبيعت جي تازگي کي بيان ڪندي هڪ نظم', 'sd'),
            (nazm_poem_id, 'Morning Poem', 'A poem describing the beauty of morning and freshness of nature', 'en');
    END IF;

    -- Insert ghazal translations
    IF ghazal_poem_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.poetry_translations WHERE poetry_id = ghazal_poem_id) THEN
        INSERT INTO public.poetry_translations (poetry_id, title, info, lang) VALUES
            (ghazal_poem_id, 'دل جي غزل', 'دل جي تڙپ ۽ محبت جي احساس کي بيان ڪندي هڪ غزل', 'sd'),
            (ghazal_poem_id, 'Heart Ghazal', 'A ghazal describing the longing and feeling of love in the heart', 'en');
    END IF;

    -- Insert tairru translations
    IF tairru_poem_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.poetry_translations WHERE poetry_id = tairru_poem_id) THEN
        INSERT INTO public.poetry_translations (poetry_id, title, info, lang) VALUES
            (tairru_poem_id, 'هوائي جو تيرڙو', 'هوائي جي خوبصورتي ۽ طبيعت جي تازگي کي بيان ڪندي هڪ تيرڙو', 'sd'),
            (tairru_poem_id, 'Wind Tairru', 'A tairru describing the beauty of wind and freshness of nature', 'en');
    END IF;

    -- Insert chhasitta translations
    IF chhasitta_poem_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.poetry_translations WHERE poetry_id = chhasitta_poem_id) THEN
        INSERT INTO public.poetry_translations (poetry_id, title, info, lang) VALUES
            (chhasitta_poem_id, 'ڳوٺ جو چهاستا', 'ڳوٺ جي خوبصورتي ۽ لوڪ جي زندگي کي بيان ڪندي هڪ چهاستا', 'sd'),
            (chhasitta_poem_id, 'Village Chhasitta', 'A chhasitta describing the beauty of village and rural life', 'en');
    END IF;
END $$;

-- Verify the data
SELECT 
    'Categories' as table_name,
    COUNT(*) as count
FROM public.categories
WHERE slug IN ('nazm', 'ghazal', 'tairru', 'chhasitta')

UNION ALL

SELECT 
    'Poetry Main' as table_name,
    COUNT(*) as count
FROM public.poetry_main
WHERE poetry_slug LIKE 'sample-%'

UNION ALL

SELECT 
    'Poetry Translations' as table_name,
    COUNT(*) as count
FROM public.poetry_translations pt
JOIN public.poetry_main pm ON pt.poetry_id = pm.id
WHERE pm.poetry_slug LIKE 'sample-%';

-- Show sample poetry with translations
SELECT 
    pm.poetry_slug,
    pm.lang,
    pm.poetry_tags,
    pt.title,
    pt.info,
    c.slug as category
FROM public.poetry_main pm
LEFT JOIN public.poetry_translations pt ON pm.id = pt.poetry_id
LEFT JOIN public.categories c ON pm.category_id = c.id
WHERE pm.poetry_slug LIKE 'sample-%'
ORDER BY pm.poetry_slug, pt.lang;
