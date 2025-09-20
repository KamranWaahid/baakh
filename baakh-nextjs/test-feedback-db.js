#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testFeedbackDatabase() {
  console.log('🧪 Testing feedback database connection...');
  console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('Service Key:', supabaseServiceKey ? 'Set' : 'Missing');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Test 1: Check if table exists
    console.log('\n1. Testing table existence...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('feedback')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log('❌ Table check failed:', tableError.message);
      return;
    }
    console.log('✅ Table exists');

    // Test 2: Try to insert a test record
    console.log('\n2. Testing insert permissions...');
    const { data: insertData, error: insertError } = await supabase
      .from('feedback')
      .insert({
        rating: 5,
        comment: 'Test feedback from script',
        ip_hash: 'test-hash'
      })
      .select('id')
      .single();

    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      console.log('Error code:', insertError.code);
      return;
    }
    console.log('✅ Insert successful, ID:', insertData.id);

    // Test 3: Try to read the record
    console.log('\n3. Testing read permissions...');
    const { data: readData, error: readError } = await supabase
      .from('feedback')
      .select('id, rating, comment, created_at')
      .eq('id', insertData.id)
      .single();

    if (readError) {
      console.log('❌ Read failed:', readError.message);
      return;
    }
    console.log('✅ Read successful:', readData);

    // Test 4: Clean up test record
    console.log('\n4. Cleaning up test record...');
    const { error: deleteError } = await supabase
      .from('feedback')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.log('⚠️  Cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Cleanup successful');
    }

    console.log('\n🎉 All tests passed! Feedback system is working correctly.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testFeedbackDatabase();
