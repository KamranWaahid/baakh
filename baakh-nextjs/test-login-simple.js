const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Testing login with credentials...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  try {
    console.log('\n🔐 Attempting login...');
    console.log('Email: jamalikamran460@gmail.com');
    console.log('Password: Baakh!@#123');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'jamalikamran460@gmail.com',
      password: 'Baakh!@#123'
    });
    
    if (error) {
      console.error('❌ Login failed:', error.message);
      console.error('Error details:', error);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('User ID:', data.user?.id);
    console.log('User Email:', data.user?.email);
    console.log('Session:', data.session ? 'Present' : 'Missing');
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testLogin();
