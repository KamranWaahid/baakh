const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.log('Please set:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDatabaseStructure() {
  console.log('🔍 Testing database structure...')
  
  try {
    // Test 1: Check if e2ee_users table exists
    console.log('\n1. Checking e2ee_users table...')
    const { data: e2eeUsers, error: e2eeError } = await supabase
      .from('e2ee_users')
      .select('*')
      .limit(1)
    
    if (e2eeError) {
      console.error('❌ e2ee_users table error:', e2eeError.message)
    } else {
      console.log('✅ e2ee_users table exists')
      if (e2eeUsers && e2eeUsers.length > 0) {
        console.log('   Sample record keys:', Object.keys(e2eeUsers[0]))
      }
    }
    
    // Test 2: Check if poets table exists
    console.log('\n2. Checking poets table...')
    const { data: poets, error: poetsError } = await supabase
      .from('poets')
      .select('*')
      .limit(1)
    
    if (poetsError) {
      console.error('❌ poets table error:', poetsError.message)
    } else {
      console.log('✅ poets table exists')
      if (poets && poets.length > 0) {
        console.log('   Sample record keys:', Object.keys(poets[0]))
      }
    }
    
    // Test 3: Check if profiles table exists
    console.log('\n3. Checking profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.error('❌ profiles table error:', profilesError.message)
    } else {
      console.log('✅ profiles table exists')
      if (profiles && profiles.length > 0) {
        console.log('   Sample record keys:', Object.keys(profiles[0]))
      }
    }
    
    // Test 4: Check table schemas
    console.log('\n4. Checking table schemas...')
    try {
      const { data: schema, error: schemaError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            table_name,
            column_name,
            data_type,
            is_nullable
          FROM information_schema.columns 
          WHERE table_name IN ('e2ee_users', 'poets', 'profiles')
          ORDER BY table_name, ordinal_position
        `
      })
      
      if (schemaError) {
        console.error('❌ Schema query error:', schemaError.message)
      } else {
        console.log('✅ Schema information:')
        schema.forEach(col => {
          console.log(`   ${col.table_name}.${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
        })
      }
    } catch (schemaErr) {
      console.error('❌ Schema query failed:', schemaErr.message)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testDatabaseStructure()
