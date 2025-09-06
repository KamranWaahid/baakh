const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uhbqcaxwfossrjwusclc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoYnFjYXh3Zm9zc3Jqd3VzY2xjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5MTg2MiwiZXhwIjoyMDcwMTY3ODYyfQ.krWIEF9IcNPP-do2ULZmlEzvIdGdSzczgrK-NJM8GSw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSindhiNameAPI() {
  console.log('🧪 Testing Sindhi name API endpoint...')
  
  try {
    // First, let's check if we have any existing users
    console.log('1. Checking for existing users...')
    const { data: users, error: usersError } = await supabase
      .from('e2ee_users')
      .select('user_id, username')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('⚠️ No users found in e2ee_users table')
      return
    }
    
    const testUserId = users[0].user_id
    const testUsername = users[0].username
    
    console.log(`✅ Found test user: ${testUsername} (${testUserId})`)
    
    // Test the API endpoint
    console.log('2. Testing API endpoint...')
    const response = await fetch('http://localhost:3000/api/auth/save-sindhi-name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
        sindhiName: 'شاھ عبداللطيف',
        language: 'sd'
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API request failed:', response.status, errorText)
      return
    }
    
    const result = await response.json()
    console.log('✅ API request successful:', result)
    
    // Verify the data was saved
    console.log('3. Verifying data was saved...')
    
    // Check poets table
    const { data: poetData, error: poetError } = await supabase
      .from('poets')
      .select('poet_id, sindhi_name, english_name')
      .eq('poet_id', testUserId)
      .single()
    
    if (poetError) {
      console.error('❌ Error checking poets table:', poetError.message)
    } else {
      console.log('✅ Poets table data:', poetData)
    }
    
    // Check profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', testUserId)
      .single()
    
    if (profileError) {
      console.log('⚠️ Profiles table check failed (expected):', profileError.message)
    } else {
      console.log('✅ Profiles table data:', profileData)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testSindhiNameAPI()
