const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Create both clients
const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function testAuthFlow() {
  console.log('🔍 Testing authentication flow...');
  
  try {
    // Step 1: Check if there are any existing sessions
    console.log('\n📋 Step 1: Checking existing sessions...');
    const { data: { session }, error: sessionError } = await anonClient.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session check failed:', sessionError.message);
    } else if (session) {
      console.log('✅ Found existing session for user:', session.user.email);
      console.log('👤 User ID:', session.user.id);
    } else {
      console.log('ℹ️  No existing session found');
    }

    // Step 2: Check if we can sign in with your email
    console.log('\n📋 Step 2: Testing sign in...');
    console.log('📧 Email:', 'jamalikamran460@gmail.com');
    console.log('⚠️  Note: This will require your password');
    
    // We can't actually sign in without a password, but let's check if the user exists
    const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Could not list users:', usersError.message);
    } else {
      const user = users.find(u => u.email === 'jamalikamran460@gmail.com');
      if (user) {
        console.log('✅ User exists in auth system');
        console.log('👤 User ID:', user.id);
        console.log('📅 Created:', user.created_at);
        console.log('🔐 Email confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
      } else {
        console.log('❌ User not found in auth system');
        console.log('📊 Total users found:', users.length);
      }
    }

    // Step 3: Check if the profile exists for the user
    console.log('\n📋 Step 3: Checking profile...');
    if (session?.user?.id) {
      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Profile lookup failed:', profileError.message);
      } else {
        console.log('✅ Profile found:', {
          id: profile.id,
          email: profile.email,
          is_admin: profile.is_admin,
          is_editor: profile.is_editor,
          display_name: profile.display_name
        });
      }
    } else {
      console.log('ℹ️  No user session to check profile for');
    }

    // Step 4: Test the auto-elevation logic
    console.log('\n📋 Step 4: Testing auto-elevation logic...');
    const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
    const auto = String(process.env.AUTO_ELEVATE_ADMINS || '').toLowerCase() === 'true';
    const isLocalhost = process.env.NODE_ENV !== 'production';
    
    console.log('📋 Environment check:');
    console.log('  - ADMIN_EMAIL_ALLOWLIST:', allowlist);
    console.log('  - AUTO_ELEVATE_ADMINS:', auto);
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - Is localhost:', isLocalhost);
    console.log('  - Email in allowlist:', allowlist.includes('jamalikamran460@gmail.com'));
    
    if (auto && isLocalhost && allowlist.includes('jamalikamran460@gmail.com')) {
      console.log('✅ Auto-elevation should work');
    } else {
      console.log('❌ Auto-elevation conditions not met');
    }

    console.log('\n🎯 Next steps:');
    console.log('1. Go to http://localhost:3001/admin/login');
    console.log('2. Sign in with your email and password');
    console.log('3. Check the browser console for any errors');
    console.log('4. If still failing, check the Network tab for the /api/auth/me request');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuthFlow();
