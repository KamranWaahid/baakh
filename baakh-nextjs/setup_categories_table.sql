-- Setup categories table with proper structure and translations
-- This script creates the categories table with all necessary columns and constraints

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS public.category_details CASCADE;
-- DROP TABLE IF EXISTS public.categories CASCADE;

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    content_style TEXT DEFAULT 'justified' CHECK (content_style IN ('justified', 'centered', 'left-aligned', 'right-aligned')),
    gender TEXT DEFAULT 'masculine' CHECK (gender IN ('masculine', 'feminine')),
    is_featured BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create category_details table for translations
CREATE TABLE IF NOT EXISTS public.category_details (
    id SERIAL PRIMARY KEY,
    cat_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    cat_name TEXT NOT NULL,
    cat_name_plural TEXT,
    cat_detail TEXT,
    lang TEXT NOT NULL CHECK (lang IN ('en', 'sd')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cat_id, lang)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_content_style ON public.categories(content_style);
CREATE INDEX IF NOT EXISTS idx_categories_gender ON public.categories(gender);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON public.categories(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON public.categories(deleted_at);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON public.categories(created_at);

CREATE INDEX IF NOT EXISTS idx_category_details_cat_id ON public.category_details(cat_id);
CREATE INDEX IF NOT EXISTS idx_category_details_lang ON public.category_details(lang);

-- Grant permissions to service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.category_details TO service_role;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Create a trigger to update the updated_at timestamp for categories
CREATE OR REPLACE FUNCTION update_categories_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON public.categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_categories_updated_at_column();

-- Create a trigger to update the updated_at timestamp for category_details
CREATE OR REPLACE FUNCTION update_category_details_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_category_details_updated_at 
    BEFORE UPDATE ON public.category_details 
    FOR EACH ROW 
    EXECUTE FUNCTION update_category_details_updated_at_column();

-- Insert some sample categories for testing
INSERT INTO public.categories (slug, content_style, gender, is_featured) VALUES
    ('ghazal', 'justified', 'masculine', true),
    ('nazm', 'justified', 'feminine', true),
    ('rubai', 'centered', 'masculine', false),
    ('masnavi', 'justified', 'feminine', false),
    ('qasida', 'justified', 'masculine', false),
    ('marsiya', 'justified', 'feminine', false),
    ('naat', 'centered', 'masculine', true),
    ('hamd', 'centered', 'masculine', false),
    ('manqabat', 'justified', 'feminine', false),
    ('qawwali', 'justified', 'masculine', false)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample category details (translations)
INSERT INTO public.category_details (cat_id, cat_name, cat_name_plural, cat_detail, lang) VALUES
    ((SELECT id FROM public.categories WHERE slug = 'ghazal'), 'Ghazal', 'Ghazals', 'A poetic form consisting of rhyming couplets and a refrain, with each line sharing the same meter.', 'en'),
    ((SELECT id FROM public.categories WHERE slug = 'ghazal'), 'غزل', 'غزليون', 'هڪ شاعري جو روپ جيڪو رڻين جي جوڙي ۽ هڪ ٻيهر ٻولڻ واري لڪير تي مشتمل آهي، هر لڪير ساڳئي ميٽر سان ورهائجي ٿي.', 'sd'),
    
    ((SELECT id FROM public.categories WHERE slug = 'nazm'), 'Nazm', 'Nazms', 'A form of poetry that is written in verse and has a specific rhyme scheme or meter.', 'en'),
    ((SELECT id FROM public.categories WHERE slug = 'nazm'), 'نظم', 'نظمون', 'شاعري جو هڪ روپ جيڪو شعر ۾ لکيو ويندو آهي ۽ ان جي هڪ مخصوص رڻ اسڪيم يا ميٽر هوندو آهي.', 'sd'),
    
    ((SELECT id FROM public.categories WHERE slug = 'rubai'), 'Rubai', 'Rubais', 'A quatrain, a poem or verse of four lines.', 'en'),
    ((SELECT id FROM public.categories WHERE slug = 'rubai'), 'رباعي', 'رباعيون', 'چار لڪيرن جو هڪ شعر يا بيت.', 'sd'),
    
    ((SELECT id FROM public.categories WHERE slug = 'masnavi'), 'Masnavi', 'Masnavis', 'A long narrative poem written in rhyming couplets.', 'en'),
    ((SELECT id FROM public.categories WHERE slug = 'masnavi'), 'مثنوي', 'مثنويون', 'رڻين جي جوڙي ۾ لکيل هڪ ڊگهو بيانيائي شعر.', 'sd'),
    
    ((SELECT id FROM public.categories WHERE slug = 'qasida'), 'Qasida', 'Qasidas', 'An ode, a type of poem that is typically longer than a ghazal.', 'en'),
    ((SELECT id FROM public.categories WHERE slug = 'qasida'), 'قصيدو', 'قصيدا', 'هڪ قصيدو، هڪ قسم جو شعر جيڪو عام طور تي غزل کان ڊگهو هوندو آهي.', 'sd')
ON CONFLICT (cat_id, lang) DO NOTHING;

-- Verify the table structure
SELECT 
    'categories' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position

UNION ALL

SELECT 
    'category_details' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'category_details' 
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
    AND tc.table_name IN ('categories', 'category_details');
