#!/usr/bin/env node

// Script to check if poets have tags in the database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPoetsTags() {
  console.log('🔍 Checking poets tags in database...\n');

  try {
    const { data: poets, error } = await supabase
      .from('poets')
      .select('id, english_name, tags')
      .not('tags', 'is', null)
      .limit(5);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log(`📊 Found ${poets?.length || 0} poets with tags:`);
    poets?.forEach(poet => {
      console.log(`- ${poet.english_name}: [${poet.tags?.join(', ') || 'no tags'}]`);
    });

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkPoetsTags();
