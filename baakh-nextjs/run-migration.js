const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uhbqcaxwfossrjwusclc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoYnFjYXh3Zm9zc3Jqd3VzY2xjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5MTg2MiwiZXhwIjoyMDcwMTY3ODYyfQ.krWIEF9IcNPP-do2ULZmlEzvIdGdSzczgrK-NJM8GSw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Running database migration...')
  
  try {
    // Add sindhi_name column to e2ee_users table
    console.log('1. Adding sindhi_name column to e2ee_users table...')
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.e2ee_users 
        ADD COLUMN IF NOT EXISTS sindhi_name text,
        ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
      `
    })
    
    if (alterError) {
      console.error('❌ Alter table error:', alterError.message)
      // Try alternative approach
      console.log('Trying alternative approach...')
      const { error: alterError2 } = await supabase
        .from('e2ee_users')
        .select('sindhi_name')
        .limit(1)
      
      if (alterError2 && alterError2.message.includes('column "sindhi_name" does not exist')) {
        console.log('Column does not exist, will need to be added manually')
      }
    } else {
      console.log('✅ Column added successfully')
    }
    
    // Add index for sindhi_name lookups
    console.log('2. Adding index for sindhi_name...')
    try {
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_e2ee_users_sindhi_name 
          ON public.e2ee_users(sindhi_name);
        `
      })
      
      if (indexError) {
        console.log('⚠️ Index creation warning:', indexError.message)
      } else {
        console.log('✅ Index created successfully')
      }
    } catch (indexErr) {
      console.log('⚠️ Index creation failed (may already exist):', indexErr.message)
    }
    
    // Test the new structure
    console.log('3. Testing new structure...')
    const { data: testData, error: testError } = await supabase
      .from('e2ee_users')
      .select('user_id, username, sindhi_name, updated_at')
      .limit(1)
    
    if (testError) {
      console.error('❌ Test query error:', testError.message)
    } else {
      console.log('✅ New structure test successful')
      if (testData && testData.length > 0) {
        console.log('   Sample record keys:', Object.keys(testData[0]))
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  }
}

runMigration()
