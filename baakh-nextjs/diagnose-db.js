#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function diagnose() {
  console.log('🔍 Diagnosing database issues...');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if we can access any tables
    console.log('\n1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('poets')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Basic connection failed:', testError.message);
      return;
    }
    console.log('✅ Basic connection works');

    // Check feedback table specifically
    console.log('\n2. Checking feedback table...');
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .limit(1);

    if (feedbackError) {
      console.log('❌ Feedback table error:', feedbackError.message);
      console.log('Code:', feedbackError.code);
      
      if (feedbackError.code === 'PGRST116') {
        console.log('💡 Table does not exist');
      } else if (feedbackError.code === '42501') {
        console.log('💡 Permission denied - RLS or grants issue');
      }
    } else {
      console.log('✅ Feedback table accessible');
      console.log('Data:', feedbackData);
    }

    // Try to check table structure
    console.log('\n3. Checking table structure...');
    const { data: structureData, error: structureError } = await supabase
      .rpc('get_table_columns', { table_name: 'feedback' })
      .catch(() => {
        // Fallback: try direct query
        return supabase
          .from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_name', 'feedback')
          .eq('table_schema', 'public');
      });

    if (structureError) {
      console.log('⚠️  Could not check structure:', structureError.message);
    } else {
      console.log('✅ Table structure:', structureData);
    }

  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

diagnose();
