// Test the login API response data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://uhbqcaxwfossrjwusclc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('=== Testing Login API Response ===');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLoginResponse() {
  try {
    // Get user data similar to the login API
    const { data: users, error } = await supabase
      .from('e2ee_users')
      .select('*')
      .limit(1);
    
    if (error || !users || users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const user = users[0];
    console.log('✅ Found user:', user.username);
    
    // Simulate the convertToBase64 function from the login route
    const convertToBase64 = (data, fieldName) => {
      try {
        if (data && typeof data === 'object' && data.type === 'Buffer' && Array.isArray(data.data)) {
          const buffer = Buffer.from(data.data);
          return buffer.toString('base64');
        }
        
        if (Buffer.isBuffer(data)) {
          return data.toString('base64');
        }
        
        if (data instanceof Uint8Array) {
          const buffer = Buffer.from(data);
          return buffer.toString('base64');
        }
        
        if (typeof data === 'string' && data.startsWith('\\x')) {
          const cleanHex = data.replace(/\\x/g, '');
          const buffer = Buffer.from(cleanHex, 'hex');
          return buffer.toString('base64');
        }
        
        if (typeof data === 'string' && /^[0-9a-fA-F]+$/.test(data)) {
          const buffer = Buffer.from(data, 'hex');
          return buffer.toString('base64');
        }
        
        if (typeof data === 'string' && /^[A-Za-z0-9+/]*={0,2}$/.test(data)) {
          return data;
        }
        
        if (Array.isArray(data)) {
          const buffer = Buffer.from(data);
          return buffer.toString('base64');
        }
        
        console.error(`Unknown data format for ${fieldName}:`, typeof data, data);
        return null;
      } catch (error) {
        console.error(`Error converting ${fieldName}:`, error.message);
        return null;
      }
    };
    
    // Convert all the data
    const responseData = {
      userId: user.user_id,
      username: user.username,
      profileCipher: convertToBase64(user.profile_cipher, 'profileCipher'),
      profileNonce: convertToBase64(user.profile_nonce, 'profileNonce'),
      profileAad: user.profile_aad,
      masterKeyCipher: convertToBase64(user.master_key_cipher, 'masterKeyCipher'),
      masterKeyNonce: convertToBase64(user.master_key_nonce, 'masterKeyNonce'),
      kdfParams: user.kdf_params,
      passwordSalt: convertToBase64(user.password_salt, 'passwordSalt'),
      passwordVerifier: convertToBase64(user.password_verifier, 'passwordVerifier'),
      passwordVerifierNonce: convertToBase64(user.password_verifier_nonce || user.profile_nonce, 'passwordVerifierNonce')
    };
    
    console.log('\n✅ Converted data:');
    for (const [field, value] of Object.entries(responseData)) {
      if (value === null) {
        console.log(`  ${field}: ❌ NULL`);
      } else {
        console.log(`  ${field}: ${value.length} chars`);
      }
    }
    
    // Simulate what the client receives
    console.log('\n📤 Simulating client response...');
    const clientResponse = {
      success: true,
      userData: responseData,
      token: 'test-token'
    };
    
    console.log('Response structure:', Object.keys(clientResponse));
    console.log('User data keys:', Object.keys(clientResponse.userData));
    
    // Test the client-side decoding
    console.log('\n🔍 Testing client-side decoding...');
    
    // Simulate the client fromBase64 method
    const fromBase64 = (base64) => {
      if (!base64 || typeof base64 !== 'string') {
        console.error('❌ Invalid input:', { value: base64, type: typeof base64 });
        throw new Error(`Invalid input: expected string, got ${typeof base64}`);
      }
      
      try {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      } catch (error) {
        throw new Error(`Base64 decode failed: ${error.message}`);
      }
    };
    
    // Test decoding each field
    for (const [field, value] of Object.entries(responseData)) {
      if (value === null) continue;
      
      console.log(`\nTesting ${field}:`);
      try {
        const decoded = fromBase64(value);
        console.log(`  ✅ Success, decoded length: ${decoded.length}`);
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginResponse().catch(console.error);
