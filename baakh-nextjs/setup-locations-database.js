const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupLocationsDatabase() {
  console.log('🚀 Setting up Baakh locations database tables...');
  
  try {
    // Step 1: Create location_countries table
    console.log('📋 Step 1: Creating location_countries table...');
    const { error: countriesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (countriesError) {
      console.log('⚠️  Countries table creation:', countriesError.message);
    } else {
      console.log('✅ Countries table created successfully');
    }
    
    // Step 2: Create location_provinces table
    console.log('📋 Step 2: Creating location_provinces table...');
    const { error: provincesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (provincesError) {
      console.log('⚠️  Provinces table creation:', provincesError.message);
    } else {
      console.log('✅ Provinces table created successfully');
    }
    
    // Step 3: Create location_cities table
    console.log('📋 Step 3: Creating location_cities table...');
    const { error: citiesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (citiesError) {
      console.log('⚠️  Cities table creation:', citiesError.message);
    } else {
      console.log('✅ Cities table created successfully');
    }
    
    // Step 4: Add foreign key constraint for capital_city in countries table
    console.log('📋 Step 4: Adding foreign key constraint for capital_city...');
    const { error: fkError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.location_countries 
        ADD CONSTRAINT IF NOT EXISTS fk_capital_city 
        FOREIGN KEY (capital_city) REFERENCES public.location_cities(id) ON DELETE SET NULL;
      `
    });
    
    if (fkError) {
      console.log('⚠️  Foreign key constraint:', fkError.message);
    } else {
      console.log('✅ Foreign key constraint added successfully');
    }
    
    // Step 5: Create indexes for performance
    console.log('📋 Step 5: Creating indexes...');
    
    // Countries indexes
    const { error: countriesIndexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_countries_lang ON public.location_countries(lang);
        CREATE INDEX IF NOT EXISTS idx_countries_name ON public.location_countries(lower(countryname));
        CREATE INDEX IF NOT EXISTS idx_countries_abbreviation ON public.location_countries(abbreviation);
      `
    });
    
    if (countriesIndexError) {
      console.log('⚠️  Countries indexes:', countriesIndexError.message);
    } else {
      console.log('✅ Countries indexes created successfully');
    }
    
    // Provinces indexes
    const { error: provincesIndexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_provinces_lang ON public.location_provinces(lang);
        CREATE INDEX IF NOT EXISTS idx_provinces_name ON public.location_provinces(lower(province_name));
        CREATE INDEX IF NOT EXISTS idx_provinces_country ON public.location_provinces(country_id, lang);
      `
    });
    
    if (provincesIndexError) {
      console.log('⚠️  Provinces indexes:', provincesIndexError.message);
    } else {
      console.log('✅ Provinces indexes created successfully');
    }
    
    // Cities indexes
    const { error: citiesIndexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_cities_lang ON public.location_cities(lang);
        CREATE INDEX IF NOT EXISTS idx_cities_name ON public.location_cities(lower(city_name));
        CREATE INDEX IF NOT EXISTS idx_cities_province ON public.location_cities(province_id, lang);
      `
    });
    
    if (citiesIndexError) {
      console.log('⚠️  Cities indexes:', citiesIndexError.message);
    } else {
      console.log('✅ Cities indexes created successfully');
    }
    
    // Step 6: Insert some sample data
    console.log('📋 Step 6: Inserting sample data...');
    
    // Insert sample countries
    const { error: sampleCountriesError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO public.location_countries (countryname, abbreviation, countrydesc, continent, lang) 
        VALUES 
          ('Pakistan', 'PK', 'Islamic Republic of Pakistan', 'Asia', 'en'),
          ('پاڪستان', 'PK', 'اسلامي جمهوريه پاڪستان', 'Asia', 'sd'),
          ('India', 'IN', 'Republic of India', 'Asia', 'en'),
          ('ڀارت', 'IN', 'جمهوريه ڀارت', 'Asia', 'sd')
        ON CONFLICT (countryname, lang) DO NOTHING;
      `
    });
    
    if (sampleCountriesError) {
      console.log('⚠️  Sample countries:', sampleCountriesError.message);
    } else {
      console.log('✅ Sample countries inserted successfully');
    }
    
    // Insert sample provinces
    const { error: sampleProvincesError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO public.location_provinces (province_name, country_id, lang) 
        SELECT 'Sindh', id, 'en' FROM public.location_countries WHERE countryname = 'Pakistan' AND lang = 'en'
        UNION ALL
        SELECT 'سنڌ', id, 'sd' FROM public.location_countries WHERE countryname = 'پاڪستان' AND lang = 'sd'
        UNION ALL
        SELECT 'Punjab', id, 'en' FROM public.location_countries WHERE countryname = 'Pakistan' AND lang = 'en'
        UNION ALL
        SELECT 'پنجاب', id, 'sd' FROM public.location_countries WHERE countryname = 'پاڪستان' AND lang = 'sd'
        ON CONFLICT (province_name, country_id, lang) DO NOTHING;
      `
    });
    
    if (sampleProvincesError) {
      console.log('⚠️  Sample provinces:', sampleProvincesError.message);
    } else {
      console.log('✅ Sample provinces inserted successfully');
    }
    
    // Insert sample cities
    const { error: sampleCitiesError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO public.location_cities (city_name, province_id, geo_lat, geo_long, lang) 
        SELECT 'Karachi', id, '24.8607', '67.0011', 'en' FROM public.location_provinces WHERE province_name = 'Sindh' AND lang = 'en'
        UNION ALL
        SELECT 'ڪراچي', id, '24.8607', '67.0011', 'sd' FROM public.location_provinces WHERE province_name = 'سنڌ' AND lang = 'sd'
        UNION ALL
        SELECT 'Lahore', id, '31.5204', '74.3587', 'en' FROM public.location_provinces WHERE province_name = 'Punjab' AND lang = 'en'
        UNION ALL
        SELECT 'لاھور', id, '31.5204', '74.3587', 'sd' FROM public.location_provinces WHERE province_name = 'پنجاب' AND lang = 'sd'
        ON CONFLICT (city_name, province_id, lang) DO NOTHING;
      `
    });
    
    if (sampleCitiesError) {
      console.log('⚠️  Sample cities:', sampleCitiesError.message);
    } else {
      console.log('✅ Sample cities inserted successfully');
    }
    
    // Update capital cities
    const { error: updateCapitalError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (updateCapitalError) {
      console.log('⚠️  Capital city updates:', updateCapitalError.message);
    } else {
      console.log('✅ Capital cities updated successfully');
    }
    
    console.log('🎉 Locations database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up locations database:', error);
    process.exit(1);
  }
}

setupLocationsDatabase();
