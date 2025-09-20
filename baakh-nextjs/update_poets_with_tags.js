#!/usr/bin/env node

// Script to update poets with sample tags for testing
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updatePoetsWithTags() {
  console.log('🏷️  Updating poets with sample tags...\n');

  try {
    // Get a few poets to update
    const { data: poets, error: fetchError } = await supabase
      .from('poets')
      .select('id, poet_slug, english_name, sindhi_name')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching poets:', fetchError.message);
      return;
    }

    console.log(`📊 Found ${poets?.length || 0} poets to update`);

    // Sample tags to assign
    const sampleTags = [
      'Women Poet',
      'Young Poets', 
      'Post-Partition Poets',
      'Progressive Poets',
      'Revolutionary Poet',
      'Classical Poet',
      'Sufi Poet',
      'Modern Poet',
      'Contemporary Poet',
      'Featured'
    ];

    // Update each poet with random tags
    for (let i = 0; i < poets.length; i++) {
      const poet = poets[i];
      const randomTags = sampleTags
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 random tags

      const { error: updateError } = await supabase
        .from('poets')
        .update({ tags: randomTags })
        .eq('id', poet.id);

      if (updateError) {
        console.log(`⚠️  Error updating ${poet.english_name}:`, updateError.message);
      } else {
        console.log(`✅ Updated ${poet.english_name} with tags: ${randomTags.join(', ')}`);
      }
    }

    console.log('\n🎉 Poets updated with sample tags!');
    console.log('\nYou can now test the tag translations by visiting:');
    console.log('- http://localhost:3001/sd/poets (Sindhi tags)');
    console.log('- http://localhost:3001/en/poets (English tags)');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}

updatePoetsWithTags();
