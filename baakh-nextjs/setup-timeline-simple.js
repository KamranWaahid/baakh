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

async function createTimelineTables() {
  try {
    console.log('🔍 Creating timeline_periods table...');
    
    // Create the timeline_periods table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.timeline_periods (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        period_slug TEXT UNIQUE NOT NULL,
        start_year INTEGER NOT NULL,
        end_year INTEGER,
        is_ongoing BOOLEAN DEFAULT false,
        sindhi_name TEXT NOT NULL,
        sindhi_description TEXT,
        sindhi_characteristics TEXT[] DEFAULT '{}',
        english_name TEXT NOT NULL,
        english_description TEXT,
        english_characteristics TEXT[] DEFAULT '{}',
        color_code TEXT DEFAULT '#3B82F6',
        icon_name TEXT,
        is_featured BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE
      );
    `;
    
    const { data, error } = await supabase.rpc('exec', { sql: createTableSQL });
    
    if (error) {
      console.log('❌ Failed to create table:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Table creation command sent');
    }
    
    // Test if table exists now
    console.log('\n🔍 Testing if timeline_periods table was created...');
    const { data: testData, error: testError } = await supabase
      .from('timeline_periods')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('❌ timeline_periods table still not accessible:', testError.message);
      console.log('Error code:', testError.code);
    } else {
      console.log('✅ timeline_periods table is now accessible!');
      console.log('📊 Sample data:', testData);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

createTimelineTables();
