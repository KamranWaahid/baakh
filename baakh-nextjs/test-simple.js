const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://uhbqcaxwfossrjwusclc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('=== Simple Database Test ===');
console.log('URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);
console.log('Service Key length:', supabaseServiceKey ? supabaseServiceKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBasicConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    
    // Test with a simple query to see what tables exist
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'e2ee%');
    
    if (error) {
      console.log('❌ Error querying information_schema:', error.message);
      return false;
    }
    
    console.log('✅ Found tables:', data.map(t => t.table_name));
    return data.length > 0;
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    return false;
  }
}

async function testTableAccess() {
  try {
    console.log('\n2. Testing table access...');
    
    // Try to access the e2ee_users table directly
    const { data, error } = await supabase
      .from('e2ee_users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing e2ee_users:', error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', error.details);
      return false;
    }
    
    console.log('✅ Successfully accessed e2ee_users table');
    console.log('Data:', data);
    return true;
  } catch (err) {
    console.log('❌ Table access failed:', err.message);
    return false;
  }
}

async function testInsert() {
  try {
    console.log('\n3. Testing insert capability...');
    
    // Try to insert a test record
    const testData = {
      username: 'test_user',
      password_salt: Buffer.from('test_salt'),
      password_verifier: Buffer.from('test_verifier'),
      profile_cipher: Buffer.from('test_cipher'),
      profile_nonce: Buffer.from('test_nonce'),
      profile_aad: 'test_aad',
      master_key_cipher: Buffer.from('test_master_cipher'),
      master_key_nonce: Buffer.from('test_master_nonce'),
      kdf_params: { iterations: 100000, hash: 'SHA-256' }
    };
    
    const { data, error } = await supabase
      .from('e2ee_users')
      .insert(testData)
      .select();
    
    if (error) {
      console.log('❌ Error inserting test data:', error.message);
      console.log('Error code:', error.code);
      return false;
    }
    
    console.log('✅ Successfully inserted test data');
    console.log('Inserted ID:', data[0]?.user_id);
    
    // Clean up - delete the test record
    if (data[0]?.user_id) {
      const { error: deleteError } = await supabase
        .from('e2ee_users')
        .delete()
        .eq('user_id', data[0].user_id);
      
      if (deleteError) {
        console.log('⚠️ Warning: Could not delete test record:', deleteError.message);
      } else {
        console.log('✅ Cleaned up test record');
      }
    }
    
    return true;
  } catch (err) {
    console.log('❌ Insert test failed:', err.message);
    return false;
  }
}

async function main() {
  console.log('Starting database tests...\n');
  
  const hasTables = await testBasicConnection();
  const canAccess = await testTableAccess();
  const canInsert = await testInsert();
  
  console.log('\n=== Test Results ===');
  console.log('Tables exist:', hasTables ? '✅' : '❌');
  console.log('Can access:', canAccess ? '✅' : '❌');
  console.log('Can insert:', canInsert ? '✅' : '❌');
  
  if (canAccess && canInsert) {
    console.log('\n🎉 Database is working correctly!');
    console.log('The signup functionality should work now.');
  } else {
    console.log('\n❌ There are still issues with the database setup.');
    console.log('Check the error messages above for details.');
  }
}

main().catch(console.error);
