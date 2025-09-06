-- Setup poets table with proper structure for bilingual poet data
-- This script creates the poets table with all necessary columns

-- Drop existing table if it exists (be careful in production!)
-- DROP TABLE IF EXISTS public.poets CASCADE;

-- Create poets table
CREATE TABLE IF NOT EXISTS public.poets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poet_slug TEXT UNIQUE NOT NULL,
    
    -- Basic information
    birth_date TEXT,
    death_date TEXT,
    birth_place TEXT,
    death_place TEXT,
    tags TEXT[] DEFAULT '{}',
    file_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    
    -- Sindhi language fields
    sindhi_name TEXT NOT NULL,
    sindhi_laqab TEXT,
    sindhi_takhalus TEXT,
    sindhi_tagline TEXT,
    sindhi_details TEXT NOT NULL,
    
    -- English language fields
    english_name TEXT NOT NULL,
    english_laqab TEXT,
    english_takhalus TEXT,
    english_tagline TEXT,
    english_details TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_poets_slug ON public.poets(poet_slug);
CREATE INDEX IF NOT EXISTS idx_poets_featured ON public.poets(is_featured);
CREATE INDEX IF NOT EXISTS idx_poets_hidden ON public.poets(is_hidden);
CREATE INDEX IF NOT EXISTS idx_poets_created_at ON public.poets(created_at);
CREATE INDEX IF NOT EXISTS idx_poets_sindhi_name ON public.poets(sindhi_name);
CREATE INDEX IF NOT EXISTS idx_poets_english_name ON public.poets(english_name);

-- Create full-text search indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_poets_sindhi_search ON public.poets USING gin(to_tsvector('sindhi', sindhi_name || ' ' || COALESCE(sindhi_details, '')));
CREATE INDEX IF NOT EXISTS idx_poets_english_search ON public.poets USING gin(to_tsvector('english', english_name || ' ' || COALESCE(english_details, '')));

-- Grant permissions to service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.poets TO service_role;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Insert some sample poets for testing
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
    is_featured
) VALUES (
    'shah-abdul-latif',
    '1689',
    '1752',
    'Bhit Shah, Sindh',
    'Bhit Shah, Sindh',
    ARRAY['صوفي شاعر', 'ڪلاسيڪل شاعر'],
    'شاه عبداللطيف ڀٽائي',
    'ڀٽائي',
    'لطيف',
    'سنڌ جو عظيم شاعر',
    'شاه عبداللطيف ڀٽائي سنڌ جي عظيم صوفي شاعر ۽ عارف هو. هن جي شاعري ۾ صوفي فلسفو، عشق الٰهي ۽ انسانيت جي خدمت جو درس ملي ٿو. هن پنهنجي شاعري ذريعي سنڌي ادب کي نئون جيون بخشي ۽ اڄ تائين هن جي شاعري سنڌي قوم جي روحاني ۽ ثقافتي ورثي جو اهم حصو آهي.',
    'Shah Abdul Latif Bhittai',
    'The Saint of Bhit',
    'Latif',
    'Revolutionary Sufi poet of Sindh',
    'Shah Abdul Latif Bhittai was a Sindhi Sufi scholar, mystic, saint, poet, and musician. He is widely considered to be one of the greatest poets of the Sindhi language. His poetry explores themes of divine love, mysticism, and the human soul''s journey towards enlightenment. Through his poetry, he gave new life to Sindhi literature and his work remains an important part of the spiritual and cultural heritage of the Sindhi people.',
    true
), (
    'sachal-sarmast',
    '1739',
    '1829',
    'Daraza, Sindh',
    'Daraza, Sindh',
    ARRAY['مڌي شاعر', 'صوفي شاعر'],
    'سچل سرمست',
    'سرمست',
    'سچل',
    'مڌي صوفي شاعر',
    'سچل سرمست سنڌ جي عظيم مڌي صوفي شاعر هو. هن پنهنجي شاعري ذريعي عشق الٰهي، صوفي فلسفو ۽ انسانيت جي خدمت جو درس ڏنو. هن جي شاعري ۾ سنڌي، فارسي ۽ اردو ٻولين جو استعمال ملي ٿو، جيڪو هن جي وسيع علم ۽ ثقافتي گڏيل کي ظاهر ڪري ٿو.',
    'Sachal Sarmast',
    'The Truthful Mystic',
    'Sachal',
    'Mystic Sufi poet',
    'Sachal Sarmast was a great mystic Sufi poet of Sindh. Through his poetry, he taught lessons of divine love, Sufi philosophy, and service to humanity. His poetry uses Sindhi, Persian, and Urdu languages, which demonstrates his vast knowledge and cultural synthesis.',
    true
);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_poets_updated_at 
    BEFORE UPDATE ON public.poets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO service_role;
