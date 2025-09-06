-- Setup Locations Database Tables for Baakh
-- Run this script in your Supabase SQL Editor

-- Step 1: Create location_countries table
CREATE TABLE IF NOT EXISTS public.location_countries (
  id SERIAL PRIMARY KEY,
  countryname TEXT NOT NULL,
  abbreviation TEXT,
  countrydesc TEXT,
  continent TEXT,
  capital_city INTEGER,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'sd')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(countryname, lang)
);

-- Step 2: Create location_provinces table
CREATE TABLE IF NOT EXISTS public.location_provinces (
  id SERIAL PRIMARY KEY,
  province_name TEXT NOT NULL,
  country_id INTEGER NOT NULL REFERENCES public.location_countries(id) ON DELETE CASCADE,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'sd')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(province_name, country_id, lang)
);

-- Step 3: Create location_cities table
CREATE TABLE IF NOT EXISTS public.location_cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  province_id INTEGER NOT NULL REFERENCES public.location_provinces(id) ON DELETE CASCADE,
  geo_lat TEXT,
  geo_long TEXT,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'sd')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(city_name, province_id, lang)
);

-- Step 4: Add foreign key constraint for capital_city in countries table
-- Note: This needs to be added after cities table exists
ALTER TABLE public.location_countries 
ADD CONSTRAINT IF NOT EXISTS fk_capital_city 
FOREIGN KEY (capital_city) REFERENCES public.location_cities(id) ON DELETE SET NULL;

-- Step 5: Create indexes for performance
-- Countries indexes
CREATE INDEX IF NOT EXISTS idx_countries_lang ON public.location_countries(lang);
CREATE INDEX IF NOT EXISTS idx_countries_name ON public.location_countries(lower(countryname));
CREATE INDEX IF NOT EXISTS idx_countries_abbreviation ON public.location_countries(abbreviation);

-- Provinces indexes
CREATE INDEX IF NOT EXISTS idx_provinces_lang ON public.location_provinces(lang);
CREATE INDEX IF NOT EXISTS idx_provinces_name ON public.location_provinces(lower(province_name));
CREATE INDEX IF NOT EXISTS idx_provinces_country ON public.location_provinces(country_id, lang);

-- Cities indexes
CREATE INDEX IF NOT EXISTS idx_cities_lang ON public.location_cities(lang);
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.location_cities(lower(city_name));
CREATE INDEX IF NOT EXISTS idx_cities_province ON public.location_cities(province_id, lang);

-- Step 6: Insert sample data
-- Insert sample countries
INSERT INTO public.location_countries (countryname, abbreviation, countrydesc, continent, lang) 
VALUES 
  ('Pakistan', 'PK', 'Islamic Republic of Pakistan', 'Asia', 'en'),
  ('پاڪستان', 'PK', 'اسلامي جمهوريه پاڪستان', 'Asia', 'sd'),
  ('India', 'IN', 'Republic of India', 'Asia', 'en'),
  ('ڀارت', 'IN', 'جمهوريه ڀارت', 'Asia', 'sd')
ON CONFLICT (countryname, lang) DO NOTHING;

-- Insert sample provinces
INSERT INTO public.location_provinces (province_name, country_id, lang) 
SELECT 'Sindh', id, 'en' FROM public.location_countries WHERE countryname = 'Pakistan' AND lang = 'en'
UNION ALL
SELECT 'سنڌ', id, 'sd' FROM public.location_countries WHERE countryname = 'پاڪستان' AND lang = 'sd'
UNION ALL
SELECT 'Punjab', id, 'en' FROM public.location_countries WHERE countryname = 'Pakistan' AND lang = 'en'
UNION ALL
SELECT 'پنجاب', id, 'sd' FROM public.location_countries WHERE countryname = 'پاڪستان' AND lang = 'sd'
ON CONFLICT (province_name, country_id, lang) DO NOTHING;

-- Insert sample cities
INSERT INTO public.location_cities (city_name, province_id, geo_lat, geo_long, lang) 
SELECT 'Karachi', id, '24.8607', '67.0011', 'en' FROM public.location_provinces WHERE province_name = 'Sindh' AND lang = 'en'
UNION ALL
SELECT 'ڪراچي', id, '24.8607', '67.0011', 'sd' FROM public.location_provinces WHERE province_name = 'سنڌ' AND lang = 'sd'
UNION ALL
SELECT 'Lahore', id, '31.5204', '74.3587', 'en' FROM public.location_provinces WHERE province_name = 'Punjab' AND lang = 'en'
UNION ALL
SELECT 'لاھور', id, '31.5204', '74.3587', 'sd' FROM public.location_provinces WHERE province_name = 'پنجاب' AND lang = 'sd'
ON CONFLICT (city_name, province_id, lang) DO NOTHING;

-- Step 7: Update capital cities (run this after cities are inserted)
UPDATE public.location_countries 
SET capital_city = (
  SELECT id FROM public.location_cities 
  WHERE city_name = 'Karachi' AND lang = 'en'
)
WHERE countryname = 'Pakistan' AND lang = 'en';

UPDATE public.location_countries 
SET capital_city = (
  SELECT id FROM public.location_cities 
  WHERE city_name = 'ڪراچي' AND lang = 'sd'
)
WHERE countryname = 'پاڪستان' AND lang = 'sd';

-- Step 8: Enable Row Level Security (RLS) and create policies
ALTER TABLE public.location_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_cities ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to countries" ON public.location_countries
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Allow public read access to provinces" ON public.location_provinces
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Allow public read access to cities" ON public.location_cities
  FOR SELECT USING (deleted_at IS NULL);

-- Create policies for admin access (you may need to adjust these based on your auth setup)
CREATE POLICY "Allow admin full access to countries" ON public.location_countries
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to provinces" ON public.location_provinces
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to cities" ON public.location_cities
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON public.location_countries TO authenticated;
GRANT ALL ON public.location_provinces TO authenticated;
GRANT ALL ON public.location_cities TO authenticated;

GRANT SELECT ON public.location_countries TO anon;
GRANT SELECT ON public.location_provinces TO anon;
GRANT SELECT ON public.location_cities TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the setup
SELECT 'Countries count:' as info, COUNT(*) as count FROM public.location_countries WHERE deleted_at IS NULL
UNION ALL
SELECT 'Provinces count:', COUNT(*) FROM public.location_provinces WHERE deleted_at IS NULL
UNION ALL
SELECT 'Cities count:', COUNT(*) FROM public.location_cities WHERE deleted_at IS NULL;
