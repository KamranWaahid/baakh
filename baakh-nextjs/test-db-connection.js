const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('poetry_main')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Error accessing poetry_main table:', error.message);
      
      // Check if table exists
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'poetry_main');
      
      if (tablesError) {
        console.log('❌ Error checking tables:', tablesError.message);
      } else if (tables.length === 0) {
        console.log('❌ poetry_main table does not exist');
        console.log('💡 You need to run the database setup scripts');
      } else {
        console.log('✅ poetry_main table exists');
      }
    } else {
      console.log('✅ Successfully connected to poetry_main table');
      console.log('📊 Row count:', data);
    }
    
    // Check poets table
    const { data: poetsData, error: poetsError } = await supabase
      .from('poets')
      .select('count(*)', { count: 'exact', head: true });
    
    if (poetsError) {
      console.log('❌ Error accessing poets table:', poetsError.message);
    } else {
      console.log('✅ Successfully connected to poets table');
      console.log('📊 Poets count:', poetsData);
    }
    
    // Check categories table
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('count(*)', { count: 'exact', head: true });
    
    if (categoriesError) {
      console.log('❌ Error accessing categories table:', categoriesError.message);
    } else {
      console.log('✅ Successfully connected to categories table');
      console.log('📊 Categories count:', categoriesData);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabaseConnection();
