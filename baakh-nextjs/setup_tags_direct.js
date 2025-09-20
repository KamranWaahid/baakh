#!/usr/bin/env node

// Direct setup script using Supabase client instead of psql
// This script creates the tags and tags_translations tables using the Supabase API

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTagsTables() {
  console.log('🚀 Setting up tags and tags_translations tables using Supabase API...\n');

  try {
    // Step 1: Create tags table
    console.log('📋 Step 1: Creating tags table...');
    const { error: tagsTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.tags (
          id BIGSERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          label TEXT NOT NULL,
          tag_type TEXT DEFAULT 'Poet',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (tagsTableError) {
      console.log('⚠️  Tags table creation:', tagsTableError.message);
    } else {
      console.log('✅ Tags table created successfully');
    }

    // Step 2: Create tags_translations table
    console.log('📋 Step 2: Creating tags_translations table...');
    const { error: translationsTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.tags_translations (
          tag_id BIGINT NOT NULL,
          lang_code CHARACTER VARYING(20) NOT NULL,
          title CHARACTER VARYING(255) NOT NULL,
          detail TEXT NOT NULL,
          CONSTRAINT tags_translations_pkey PRIMARY KEY (tag_id, lang_code),
          CONSTRAINT tags_translations_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tags (id) ON UPDATE CASCADE ON DELETE CASCADE
        ) TABLESPACE pg_default;
      `
    });

    if (translationsTableError) {
      console.log('⚠️  Tags translations table creation:', translationsTableError.message);
    } else {
      console.log('✅ Tags translations table created successfully');
    }

    // Step 3: Create indexes
    console.log('📋 Step 3: Creating indexes...');
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
        CREATE INDEX IF NOT EXISTS idx_tags_type ON public.tags(tag_type);
        CREATE INDEX IF NOT EXISTS idx_tags_translations_tag_id ON public.tags_translations(tag_id);
        CREATE INDEX IF NOT EXISTS idx_tags_translations_lang ON public.tags_translations(lang_code);
      `
    });

    if (indexesError) {
      console.log('⚠️  Indexes creation:', indexesError.message);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Step 4: Insert sample tags
    console.log('📋 Step 4: Inserting sample tags...');
    const { data: tagsData, error: tagsInsertError } = await supabase
      .from('tags')
      .upsert([
        { slug: 'women-poet', label: 'عورت شاعر', tag_type: 'Poet' },
        { slug: 'young-poets', label: 'نوجوان شاعر', tag_type: 'Poet' },
        { slug: 'classical-poet', label: 'ڪلاسيڪل شاعر', tag_type: 'Poet' },
        { slug: 'sufi-poet', label: 'صوفي شاعر', tag_type: 'Poet' },
        { slug: 'modern-poet', label: 'جديد شاعر', tag_type: 'Poet' },
        { slug: 'contemporary-poet', label: 'عصري شاعر', tag_type: 'Poet' },
        { slug: 'post-partition-poets', label: 'تقسيم کانپوءِ جا شاعر', tag_type: 'Poet' },
        { slug: 'progressive-poets', label: 'ترقي پسند شاعر', tag_type: 'Poet' },
        { slug: 'revolutionary-poet', label: 'انقلابي شاعر', tag_type: 'Poet' },
        { slug: 'nationalist-poet', label: 'قومي شاعر', tag_type: 'Poet' },
        { slug: 'freedom-fighter-poet', label: 'آزادي جي جنگجو شاعر', tag_type: 'Poet' },
        { slug: 'featured', label: 'چونڊ', tag_type: 'Poet' }
      ], { onConflict: 'slug' })
      .select('id, slug');

    if (tagsInsertError) {
      console.log('⚠️  Tags insertion:', tagsInsertError.message);
    } else {
      console.log('✅ Sample tags inserted successfully');
      console.log(`📊 Inserted ${tagsData?.length || 0} tags`);
    }

    // Step 5: Insert translations
    console.log('📋 Step 5: Inserting translations...');
    
    // Get the inserted tags to get their IDs
    const { data: allTags, error: fetchTagsError } = await supabase
      .from('tags')
      .select('id, slug');

    if (fetchTagsError) {
      console.log('⚠️  Error fetching tags for translations:', fetchTagsError.message);
    } else {
      const translations = [];
      
      allTags?.forEach(tag => {
        // Add Sindhi translations
        translations.push({
          tag_id: tag.id,
          lang_code: 'sd',
          title: tag.slug === 'women-poet' ? 'عورت شاعر' :
                 tag.slug === 'young-poets' ? 'نوجوان شاعر' :
                 tag.slug === 'classical-poet' ? 'ڪلاسيڪل شاعر' :
                 tag.slug === 'sufi-poet' ? 'صوفي شاعر' :
                 tag.slug === 'modern-poet' ? 'جديد شاعر' :
                 tag.slug === 'contemporary-poet' ? 'عصري شاعر' :
                 tag.slug === 'post-partition-poets' ? 'تقسيم کانپوءِ جا شاعر' :
                 tag.slug === 'progressive-poets' ? 'ترقي پسند شاعر' :
                 tag.slug === 'revolutionary-poet' ? 'انقلابي شاعر' :
                 tag.slug === 'nationalist-poet' ? 'قومي شاعر' :
                 tag.slug === 'freedom-fighter-poet' ? 'آزادي جي جنگجو شاعر' :
                 tag.slug === 'featured' ? 'چونڊ' : tag.slug,
          detail: `سنڌي تفصيل: ${tag.slug}`
        });

        // Add English translations
        translations.push({
          tag_id: tag.id,
          lang_code: 'en',
          title: tag.slug === 'women-poet' ? 'Women Poet' :
                 tag.slug === 'young-poets' ? 'Young Poets' :
                 tag.slug === 'classical-poet' ? 'Classical Poet' :
                 tag.slug === 'sufi-poet' ? 'Sufi Poet' :
                 tag.slug === 'modern-poet' ? 'Modern Poet' :
                 tag.slug === 'contemporary-poet' ? 'Contemporary Poet' :
                 tag.slug === 'post-partition-poets' ? 'Post-Partition Poets' :
                 tag.slug === 'progressive-poets' ? 'Progressive Poets' :
                 tag.slug === 'revolutionary-poet' ? 'Revolutionary Poet' :
                 tag.slug === 'nationalist-poet' ? 'Nationalist Poet' :
                 tag.slug === 'freedom-fighter-poet' ? 'Freedom Fighter Poet' :
                 tag.slug === 'featured' ? 'Featured' : tag.slug,
          detail: `English description for ${tag.slug}`
        });
      });

      const { error: translationsInsertError } = await supabase
        .from('tags_translations')
        .upsert(translations, { onConflict: 'tag_id,lang_code' });

      if (translationsInsertError) {
        console.log('⚠️  Translations insertion:', translationsInsertError.message);
      } else {
        console.log('✅ Translations inserted successfully');
        console.log(`📊 Inserted ${translations.length} translations`);
      }
    }

    console.log('\n🎉 Tags setup completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Visit /sd/poets to see Sindhi tag translations');
    console.log('2. Visit /en/poets to see English tag translations');
    console.log('3. Use the /api/tags endpoint to manage tags programmatically');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupTagsTables();
