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

async function setupDatabase() {
  console.log('🚀 Setting up Baakh database tables...');
  
  try {
    // Step 1: Try to create poets table using a simple insert to see if it exists
    console.log('📋 Step 1: Checking poets table...');
    
    try {
      const { data: poetsData, error: poetsError } = await supabase
        .from('poets')
        .select('count(*)', { count: 'exact', head: true });
      
      if (poetsError) {
        console.log('❌ Poets table does not exist or is not accessible');
        console.log('💡 You need to create the table manually in Supabase dashboard');
        console.log('   Or run the SQL scripts in the Supabase SQL editor');
      } else {
        console.log('✅ Poets table exists and is accessible');
        console.log('📊 Current poets count:', poetsData);
      }
    } catch (error) {
      console.log('❌ Error checking poets table:', error.message);
    }
    
    // Step 2: Check categories table
    console.log('📋 Step 2: Checking categories table...');
    
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('count(*)', { count: 'exact', head: true });
      
      if (categoriesError) {
        console.log('❌ Categories table does not exist or is not accessible');
      } else {
        console.log('✅ Categories table exists and is accessible');
        console.log('📊 Current categories count:', categoriesData);
      }
    } catch (error) {
      console.log('❌ Error checking categories table:', error.message);
    }
    
    // Step 3: Check poetry_main table
    console.log('📋 Step 3: Checking poetry_main table...');
    
    try {
      const { data: poetryData, error: poetryError } = await supabase
        .from('poetry_main')
        .select('count(*)', { count: 'exact', head: true });
      
      if (poetryError) {
        console.log('❌ Poetry main table does not exist or is not accessible');
      } else {
        console.log('✅ Poetry main table exists and is accessible');
        console.log('📊 Current poetry count:', poetryData);
      }
    } catch (error) {
      console.log('❌ Error checking poetry_main table:', error.message);
    }
    
    console.log('');
    console.log('🔧 To fix the database issues, you need to:');
    console.log('');
    console.log('Option 1: Use Supabase Dashboard (Recommended)');
    console.log('  1. Go to https://supabase.com/dashboard');
    console.log('  2. Select your project: uhbqcaxwfossrjwusclc');
    console.log('  3. Go to SQL Editor');
    console.log('  4. Run the SQL scripts from the setup_*.sql files');
    console.log('');
    console.log('Option 2: Run setup scripts in order:');
    console.log('  1. setup_poets_table.sql');
    console.log('  2. setup_categories_table.sql');
    console.log('  3. setup_poetry_main_table.sql');
    console.log('');
    console.log('Option 3: Use the complete setup script:');
    console.log('  setup_complete_database.sh (requires psql)');
    console.log('');
    console.log('💡 The foreign key error suggests the tables exist but');
    console.log('   the relationships are not properly established.');
    
  } catch (error) {
    console.error('❌ Error during database check:', error);
  }
}

setupDatabase();
