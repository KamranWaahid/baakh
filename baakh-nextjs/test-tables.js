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

async function testTables() {
  try {
    console.log('🔍 Testing different tables...');
    
    // Test tables that might exist
    const tables = [
      'timeline_periods',
      'poets',
      'poetry_main',
      'categories',
      'tags',
      'profiles'
    ];
    
    for (const table of tables) {
      console.log(`\n📋 Testing table: ${table}`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message} (${error.code})`);
      } else {
        console.log(`✅ ${table}: Success - ${data.length} rows`);
        if (data.length > 0) {
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    }
    
    // Test if we can list all tables
    console.log('\n🔍 Testing table listing...');
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('❌ Cannot list tables:', tablesError.message);
    } else {
      console.log('✅ Available tables:', tablesData.map(t => t.table_name).join(', '));
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testTables();
