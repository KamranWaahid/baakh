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

async function setupDatabase() {
  console.log('🚀 Setting up Baakh database tables...');
  
  try {
    // Step 1: Create poets table
    console.log('📋 Step 1: Creating poets table...');
    const { error: poetsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.poets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          poet_slug TEXT UNIQUE NOT NULL,
          birth_date TEXT,
          death_date TEXT,
          birth_place TEXT,
          death_place TEXT,
          tags TEXT[] DEFAULT '{}',
          file_url TEXT,
          is_featured BOOLEAN DEFAULT false,
          is_hidden BOOLEAN DEFAULT false,
          sindhi_name TEXT NOT NULL,
          sindhi_laqab TEXT,
          sindhi_takhalus TEXT,
          sindhi_tagline TEXT,
          sindhi_details TEXT NOT NULL,
          english_name TEXT NOT NULL,
          english_laqab TEXT,
          english_takhalus TEXT,
          english_tagline TEXT,
          english_details TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (poetsError) {
      console.log('⚠️  Poets table creation:', poetsError.message);
    } else {
      console.log('✅ Poets table created successfully');
    }
    
    // Step 2: Create categories table
    console.log('📋 Step 2: Creating categories table...');
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          sindhi_name TEXT NOT NULL,
          english_name TEXT NOT NULL,
          sindhi_description TEXT,
          english_description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (categoriesError) {
      console.log('⚠️  Categories table creation:', categoriesError.message);
    } else {
      console.log('✅ Categories table created successfully');
    }
    
    // Step 3: Create poetry_main table
    console.log('📋 Step 3: Creating poetry_main table...');
    const { error: poetryError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.poetry_main (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          poet_id UUID REFERENCES public.poets(id) ON DELETE SET NULL,
          category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          poetry_slug TEXT UNIQUE NOT NULL,
          content_style TEXT DEFAULT 'justified' CHECK (content_style IN ('justified', 'centered', 'left-aligned', 'right-aligned')),
          poetry_tags TEXT[] DEFAULT '{}',
          lang TEXT NOT NULL DEFAULT 'sd' CHECK (lang IN ('sd', 'en')),
          visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'draft')),
          is_featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          deleted_at TIMESTAMP WITH TIME ZONE
        );
      `
    });
    
    if (poetryError) {
      console.log('⚠️  Poetry main table creation:', poetryError.message);
    } else {
      console.log('✅ Poetry main table created successfully');
    }
    
    // Step 4: Create poetry_translations table
    console.log('📋 Step 4: Creating poetry_translations table...');
    const { error: translationsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.poetry_translations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          poetry_id UUID REFERENCES public.poetry_main(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          info TEXT,
          source TEXT,
          lang TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (translationsError) {
      console.log('⚠️  Poetry translations table creation:', translationsError.message);
    } else {
      console.log('✅ Poetry translations table created successfully');
    }
    
    // Step 5: Create poetry_couplets table
    console.log('📋 Step 5: Creating poetry_couplets table...');
    const { error: coupletsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.poetry_couplets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          poetry_id UUID REFERENCES public.poetry_main(id) ON DELETE CASCADE,
          poet_id UUID REFERENCES public.poets(id) ON DELETE SET NULL,
          couplet_slug TEXT NOT NULL,
          couplet_text TEXT NOT NULL,
          couplet_tags TEXT[] DEFAULT '{}',
          lang TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (coupletsError) {
      console.log('⚠️  Poetry couplets table creation:', coupletsError.message);
    } else {
      console.log('✅ Poetry couplets table created successfully');
    }
    
    // Step 6: Insert sample data
    console.log('📋 Step 6: Inserting sample data...');
    
    // Insert sample poets
    const { error: insertPoetsError } = await supabase
      .from('poets')
      .upsert([
        {
          poet_slug: 'shah-abdul-latif',
          birth_date: '1689',
          death_date: '1752',
          birth_place: 'Bhit Shah, Sindh',
          death_place: 'Bhit Shah, Sindh',
          tags: ['صوفي شاعر', 'ڪلاسيڪل شاعر'],
          sindhi_name: 'شاه عبداللطيف ڀٽائي',
          sindhi_laqab: 'ڀٽائي',
          sindhi_takhalus: 'لطيف',
          sindhi_tagline: 'سنڌ جو عظيم شاعر',
          sindhi_details: 'شاه عبداللطيف ڀٽائي سنڌ جي عظيم صوفي شاعر ۽ عارف هو.',
          english_name: 'Shah Abdul Latif Bhittai',
          english_laqab: 'The Saint of Bhit',
          english_takhalus: 'Latif',
          english_tagline: 'Revolutionary Sufi poet of Sindh',
          english_details: 'Shah Abdul Latif Bhittai was a Sindhi Sufi scholar, mystic, saint, poet, and musician.',
          is_featured: true
        }
      ], { onConflict: 'poet_slug' });
    
    if (insertPoetsError) {
      console.log('⚠️  Sample poets insertion:', insertPoetsError.message);
    } else {
      console.log('✅ Sample poets inserted successfully');
    }
    
    // Insert sample categories
    const { error: insertCategoriesError } = await supabase
      .from('categories')
      .upsert([
        {
          slug: 'ghazal',
          sindhi_name: 'غزل',
          english_name: 'Ghazal',
          sindhi_description: 'سنڌي غزل',
          english_description: 'Sindhi Ghazal poetry',
          is_active: true
        },
        {
          slug: 'nazm',
          sindhi_name: 'نظم',
          english_name: 'Nazm',
          sindhi_description: 'سنڌي نظم',
          english_description: 'Sindhi Nazm poetry',
          is_active: true
        }
      ], { onConflict: 'slug' });
    
    if (insertCategoriesError) {
      console.log('⚠️  Sample categories insertion:', insertCategoriesError.message);
    } else {
      console.log('✅ Sample categories inserted successfully');
    }
    
    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('Your Baakh database now includes:');
    console.log('  ✅ Poets table with bilingual support');
    console.log('  ✅ Categories table with translations');
    console.log('  ✅ Poetry main table with proper foreign keys');
    console.log('  ✅ Poetry translations table');
    console.log('  ✅ Poetry couplets table');
    console.log('');
    console.log('You can now:');
    console.log('  - Visit /admin/poets to manage poets');
    console.log('  - Visit /admin/categories to manage categories');
    console.log('  - Visit /admin/poetry to manage poetry');
    
  } catch (error) {
    console.error('❌ Error during database setup:', error);
  }
}

setupDatabase();
