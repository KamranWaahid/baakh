const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
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
    
    // Test table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('timeline_periods')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table query failed:', tableError);
    } else {
      console.log('✅ Table structure looks good');
      console.log('📋 Columns:', Object.keys(tableInfo[0] || {}));
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();