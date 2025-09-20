#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testSimple() {
  console.log('🧪 Simple feedback test...');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Test direct insert with service role (bypasses RLS)
    console.log('Testing direct insert...');
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        rating: 5,
        comment: 'Direct test',
        ip_hash: 'test-hash'
      })
      .select('id')
      .single();

    if (error) {
      console.log('❌ Error:', error.message);
      console.log('Code:', error.code);
      console.log('Details:', error.details);
      console.log('Hint:', error.hint);
    } else {
      console.log('✅ Success! ID:', data.id);
      
      // Clean up
      await supabase.from('feedback').delete().eq('id', data.id);
      console.log('✅ Cleaned up');
    }

  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

testSimple();
