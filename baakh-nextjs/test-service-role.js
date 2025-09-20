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

async function testConnection() {
  try {
    console.log('🔍 Testing database connection with service role...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('timeline_periods')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log('✅ Database connection successful');
    console.log('📊 Sample data:', data);
    
    // Test insert operation
    console.log('🔍 Testing insert operation...');
    const { data: insertData, error: insertError } = await supabase
      .from('timeline_periods')
      .insert({
        period_slug: 'test-period-' + Date.now(),
        start_year: 2024,
        end_year: 2025,
        is_ongoing: false,
        sindhi_name: 'تست دور',
        english_name: 'Test Period',
        color_code: '#3B82F6',
        is_featured: false,
        sort_order: 999
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert operation failed:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✅ Insert operation successful');
      console.log('📊 Inserted data:', insertData);
      
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

testConnection();
