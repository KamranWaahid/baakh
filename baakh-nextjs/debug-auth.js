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

async function debugAuth() {
  console.log('🔍 Debugging authentication setup...');
  
  try {
    // Test 1: Check if we can access the profiles table with service role
    console.log('\n📋 Test 1: Checking profiles table access...');
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
      
      if (error) {
        console.log('❌ Profiles table access failed:', error.message);
      } else {
        console.log('✅ Profiles table accessible with service role');
        console.log('📊 Found profiles:', profiles?.length || 0);
        if (profiles && profiles.length > 0) {
          console.log('👥 Sample profile:', profiles[0]);
        }
      }
    } catch (error) {
      console.log('❌ Profiles table access error:', error.message);
    }

    // Test 2: Check if we can access auth.users
    console.log('\n📋 Test 2: Checking auth.users access...');
    try {
      const { data: users, error } = await supabase.auth.admin.listUsers();
      if (error) {
        console.log('❌ Auth users access failed:', error.message);
      } else {
        console.log('✅ Auth users accessible with service role');
        console.log('📊 Found users:', users?.data?.length || 0);
        if (users?.data && users.data.length > 0) {
          console.log('👤 Sample user:', {
            id: users.data[0].id,
            email: users.data[0].email,
            created_at: users.data[0].created_at
          });
        }
      }
    } catch (error) {
      console.log('❌ Auth users access error:', error.message);
    }

    // Test 3: Check environment variables
    console.log('\n📋 Test 3: Checking environment variables...');
    console.log('ADMIN_EMAIL_ALLOWLIST:', process.env.ADMIN_EMAIL_ALLOWLIST);
    console.log('AUTO_ELEVATE_ADMINS:', process.env.AUTO_ELEVATE_ADMINS);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    // Test 4: Try to create a test profile
    console.log('\n📋 Test 4: Testing profile creation...');
    try {
      // First, let's see if we can insert a test record
      const testProfile = {
        id: '00000000-0000-0000-0000-000000000000', // dummy UUID
        email: 'test@example.com',
        display_name: 'Test User',
        is_admin: false,
        is_editor: false
      };
      
      const { data: insertResult, error: insertError } = await supabase
        .from('profiles')
        .insert(testProfile);
      
      if (insertError) {
        console.log('❌ Profile insertion test failed:', insertError.message);
        
        // Check if it's a constraint violation (table exists but has constraints)
        if (insertError.message.includes('duplicate key') || insertError.message.includes('violates')) {
          console.log('✅ Table exists but has constraints (this is good!)');
        }
      } else {
        console.log('✅ Profile insertion test successful');
        
        // Clean up the test record
        await supabase
          .from('profiles')
          .delete()
          .eq('email', 'test@example.com');
        console.log('🧹 Cleaned up test profile');
      }
    } catch (error) {
      console.log('❌ Profile insertion test error:', error.message);
    }

    console.log('\n🎯 Summary:');
    console.log('If you see permission errors, the table might not be properly set up');
    console.log('If you see constraint violations, the table exists but needs proper setup');
    console.log('If you see successful access, the issue is in the authentication flow');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugAuth();
