const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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

async function setupTimelineTables() {
  try {
    console.log('🔍 Reading timeline setup SQL...');
    
    const sqlContent = fs.readFileSync('setup_timeline_tables.sql', 'utf8');
    console.log('✅ SQL file read successfully');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
        console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.log(`❌ Statement ${i + 1} failed:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    // Test if timeline_periods table now exists
    console.log('\n🔍 Testing if timeline_periods table was created...');
    const { data, error } = await supabase
      .from('timeline_periods')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ timeline_periods table still not accessible:', error.message);
    } else {
      console.log('✅ timeline_periods table is now accessible!');
      console.log('📊 Sample data:', data);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

setupTimelineTables();
