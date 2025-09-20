const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSimpleQuery() {
  try {
    console.log('🔍 Testing simple query...');
    
    // Test a simple query that should work
    console.log('\n📋 Testing poets table (should work)...');
    const { data: poets, error: poetsError } = await supabase
      .from('poets')
      .select('id, sindhi_name, english_name')
      .limit(1);
    
    if (poetsError) {
      console.log('❌ poets:', poetsError.message, `(${poetsError.code})`);
    } else {
      console.log('✅ poets: Success!');
      console.log(`   Found ${poets.length} poets`);
    }
    
    // Test timeline_periods with service role
    console.log('\n📋 Testing timeline_periods with service role...');
    const { data: periods, error: periodsError } = await supabase
      .from('timeline_periods')
      .select('id, period_slug, english_name')
      .limit(1);
    
    if (periodsError) {
      console.log('❌ timeline_periods:', periodsError.message, `(${periodsError.code})`);
    } else {
      console.log('✅ timeline_periods: Success!');
      console.log(`   Found ${periods.length} periods`);
    }
    
    // Test insert with service role
    console.log('\n🔍 Testing insert with service role...');
    const testData = {
      period_slug: 'test-period-' + Date.now(),
      start_year: 2024,
      end_year: 2025,
      is_ongoing: false,
      sindhi_name: 'تست دور',
      english_name: 'Test Period',
      color_code: '#3B82F6',
      is_featured: false,
      sort_order: 999
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('timeline_periods')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message, `(${insertError.code})`);
    } else {
      console.log('✅ Insert successful!');
      console.log('   Inserted period:', insertData.period_slug);
      
      // Clean up test data
      await supabase
        .from('timeline_periods')
        .delete()
        .eq('id', insertData.id);
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testSimpleQuery();
