-- Insert Jahangeer Dahri poet data for testing
INSERT INTO public.poets (
    poet_slug,
    birth_date,
    death_date,
    birth_place,
    death_place,
    tags,
    sindhi_name,
    sindhi_laqab,
    sindhi_takhalus,
    sindhi_tagline,
    sindhi_details,
    english_name,
    english_laqab,
    english_takhalus,
    english_tagline,
    english_details,
    is_featured,
    file_url
) VALUES (
    'jahangeer-dahri',
    '1950',
    '2020',
    'Dahri, Sindh',
    'Karachi, Sindh',
    ARRAY['عصري شاعر', 'نئين نسل', 'شاعر'],
    'جهانگير ڏاهري',
    'ڏاهري',
    'جهانگير',
    'عصري سنڌي شاعر',
    'جهانگير ڏاهري هڪ مشهور عصري سنڌي شاعر هو. هن پنهنجي شاعري ذريعي نئين نسل کي متاثر ڪيو ۽ سنڌي ادب ۾ نئين رجحان پيدا ڪيا. هن جي شاعري ۾ عصري موضوعات، سماجي مسائل ۽ انسانيت جي خدمت جو درس ملي ٿو.',
    'Jahangeer Dahri',
    'Dahri',
    'Jahangeer',
    'Modern Sindhi Poet',
    'Jahangeer Dahri was a renowned modern Sindhi poet who influenced the new generation and created new trends in Sindhi literature. His poetry explores contemporary themes, social issues, and the service of humanity. He was known for his innovative style and deep understanding of human emotions.',
    true,
    '/default-avatar.png'
) ON CONFLICT (poet_slug) DO UPDATE SET
    sindhi_name = EXCLUDED.sindhi_name,
    english_name = EXCLUDED.english_name,
    sindhi_details = EXCLUDED.sindhi_details,
    english_details = EXCLUDED.english_details,
    updated_at = NOW();

-- Insert some sample couplets for this poet
INSERT INTO public.poetry_couplets (
    poet_id,
    couplet_text,
    couplet_slug,
    couplet_tags,
    lang,
    poetry_id
) VALUES 
(
    (SELECT id FROM public.poets WHERE poet_slug = 'jahangeer-dahri'),
    'سنڌ جي مٽي ۾ ڪيترا راز پيا\nان رازن کي ڳولي ڪيترا ڏينهن لڳا',
    'jahangeer-dahri-couplet-1',
    ARRAY['سنڌ', 'مٽي', 'راز'],
    'sd',
    0
),
(
    (SELECT id FROM public.poets WHERE poet_slug = 'jahangeer-dahri'),
    'محبت جي ڳالهه ڪرڻ آسان آهي\nپر محبت ڪرڻ ڏکيو آهي',
    'jahangeer-dahri-couplet-2',
    ARRAY['محبت', 'عشق', 'زندگي'],
    'sd',
    0
),
(
    (SELECT id FROM public.poets WHERE poet_slug = 'jahangeer-dahri'),
    'ڪتاب پڙهڻ سان علم ملندو آهي\nپر زندگي جي ڪتاب پڙهڻ سان دانش ملندي آهي',
    'jahangeer-dahri-couplet-3',
    ARRAY['ڪتاب', 'علم', 'دانش', 'زندگي'],
    'sd',
    0
);

-- Insert some sample poetry for this poet
DO $$
DECLARE
    poet_id UUID;
    category_id BIGINT;
BEGIN
    -- Get poet ID
    SELECT id INTO poet_id FROM public.poets WHERE poet_slug = 'jahangeer-dahri';
    
    -- Get a category ID (assuming ghazal exists)
    SELECT id INTO category_id FROM public.categories WHERE slug = 'ghazal' LIMIT 1;
    
    IF poet_id IS NOT NULL AND category_id IS NOT NULL THEN
        -- Insert sample poetry
        INSERT INTO public.poetry_main (
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
            'jahangeer-dahri-ghazal-1',
            'justified',
            'عصري,شاعر,سنڌي',
            'sd',
            'public',
            true
        ),
        (
            poet_id,
            category_id,
            'jahangeer-dahri-ghazal-2',
            'justified',
            'محبت,عشق,زندگي',
            'sd',
            'public',
            false
        ) ON CONFLICT (poetry_slug) DO NOTHING;
        
        RAISE NOTICE 'Inserted sample poetry for Jahangeer Dahri';
    ELSE
        RAISE NOTICE 'Could not insert poetry: poet_id=%, category_id=%', poet_id, category_id;
    END IF;
END $$;

