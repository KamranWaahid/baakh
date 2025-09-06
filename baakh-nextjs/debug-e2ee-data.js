const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://uhbqcaxwfossrjwusclc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('=== Debug E2EE Data Structure ===');
console.log('URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugE2EEData() {
  try {
    console.log('\n1. Fetching user data from e2ee_users table...');
    
    // Get a sample user to see the data structure
    const { data: users, error } = await supabase
      .from('e2ee_users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error fetching users:', error.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No users found in table');
      return;
    }
    
    const user = users[0];
    console.log('✅ Found user:', user.username);
    
    console.log('\n2. Analyzing data types and content:');
    console.log('User ID:', user.user_id);
    console.log('Username:', user.username);
    
    // Analyze each field
    const fields = [
      'password_salt', 'password_verifier', 'password_verifier_nonce',
      'profile_cipher', 'profile_nonce', 'profile_aad',
      'master_key_cipher', 'master_key_nonce', 'kdf_params'
    ];
    
    for (const field of fields) {
      const value = user[field];
      console.log(`\n${field}:`);
      console.log('  Type:', typeof value);
      console.log('  Constructor:', value?.constructor?.name);
      console.log('  Is null:', value === null);
      console.log('  Is undefined:', value === undefined);
      
      if (value && typeof value === 'object') {
        if (value.type === 'Buffer' && Array.isArray(value.data)) {
          console.log('  Is Buffer object:', true);
          console.log('  Buffer data length:', value.data.length);
          console.log('  Buffer data sample:', value.data.slice(0, 10));
          
          // Convert to base64 to see if it's valid
          try {
            const buffer = Buffer.from(value.data);
            const base64 = buffer.toString('base64');
            console.log('  Base64 conversion successful, length:', base64.length);
            console.log('  Base64 sample:', base64.substring(0, 50));
          } catch (e) {
            console.log('  Base64 conversion failed:', e.message);
          }
        } else {
          console.log('  Object keys:', Object.keys(value));
          console.log('  Object sample:', JSON.stringify(value).substring(0, 200));
        }
      } else if (typeof value === 'string') {
        console.log('  String length:', value.length);
        console.log('  String sample:', value.substring(0, 100));
        
        // Check if it looks like hex
        if (value.startsWith('\\x')) {
          console.log('  Looks like hex with \\x prefix');
        } else if (/^[0-9a-fA-F]+$/.test(value)) {
          console.log('  Looks like hex string');
        } else if (/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
          console.log('  Looks like base64');
        } else {
          console.log('  Looks like regular string');
        }
      }
    }
    
    console.log('\n3. Testing data conversion...');
    
    // Test the conversion logic similar to the login route
    const convertToBase64 = (data, fieldName) => {
      try {
        console.log(`\nConverting ${fieldName}:`);
        
        if (data && typeof data === 'object' && data.type === 'Buffer' && Array.isArray(data.data)) {
          console.log('  Found Buffer object, converting...');
          const buffer = Buffer.from(data.data);
          const base64 = buffer.toString('base64');
          console.log('  ✅ Success, base64 length:', base64.length);
          return base64;
        }
        
        if (Buffer.isBuffer(data)) {
          console.log('  Found Buffer instance, converting...');
          const base64 = data.toString('base64');
          console.log('  ✅ Success, base64 length:', base64.length);
          return base64;
        }
        
        if (data instanceof Uint8Array) {
          console.log('  Found Uint8Array, converting...');
          const buffer = Buffer.from(data);
          const base64 = buffer.toString('base64');
          console.log('  ✅ Success, base64 length:', base64.length);
          return base64;
        }
        
        if (typeof data === 'string' && data.startsWith('\\x')) {
          console.log('  Found hex string with \\x prefix, converting...');
          const cleanHex = data.replace(/\\x/g, '');
          const buffer = Buffer.from(cleanHex, 'hex');
          const base64 = buffer.toString('base64');
          console.log('  ✅ Success, base64 length:', base64.length);
          return base64;
        }
        
        if (typeof data === 'string' && /^[0-9a-fA-F]+$/.test(data)) {
          console.log('  Found hex string, converting...');
          const buffer = Buffer.from(data, 'hex');
          const base64 = buffer.toString('base64');
          console.log('  ✅ Success, base64 length:', base64.length);
          return base64;
        }
        
        if (typeof data === 'string' && /^[A-Za-z0-9+/]*={0,2}$/.test(data)) {
          console.log('  Data is already base64');
          return data;
        }
        
        console.log('  ❌ Unknown format, cannot convert');
        return null;
      } catch (error) {
        console.log(`  ❌ Error converting ${fieldName}:`, error.message);
        return null;
      }
    };
    
    // Test conversion for each field
    const convertedData = {};
    for (const field of fields) {
      const converted = convertToBase64(user[field], field);
      if (converted) {
        convertedData[field] = converted;
      }
    }
    
    console.log('\n4. Conversion results:');
    console.log('Successfully converted fields:', Object.keys(convertedData).length);
    for (const [field, value] of Object.entries(convertedData)) {
      console.log(`  ${field}: ${value.length} chars`);
    }
    
    // Decode one of the hex strings to see what's inside
    console.log('\n5. Decoding hex data to see Buffer contents...');
    const sampleField = 'password_salt';
    const sampleHex = user[sampleField];
    
    if (sampleHex && sampleHex.startsWith('\\x')) {
      console.log(`\nDecoding ${sampleField}:`);
      const cleanHex = sampleHex.replace(/\\x/g, '');
      console.log('Clean hex length:', cleanHex.length);
      
      try {
        // Convert hex to bytes
        const hexBytes = new Uint8Array(cleanHex.length / 2);
        for (let i = 0; i < cleanHex.length; i += 2) {
          hexBytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
        }
        
        // Try to decode as text to see if it's JSON
        const jsonString = new TextDecoder().decode(hexBytes);
        console.log('Decoded as text:', jsonString.substring(0, 200));
        
        // Try to parse as JSON
        try {
          const parsed = JSON.parse(jsonString);
          console.log('Parsed JSON:', parsed);
          
          if (parsed.type === 'Buffer' && Array.isArray(parsed.data)) {
            console.log('Buffer data length:', parsed.data.length);
            console.log('Buffer data sample:', parsed.data.slice(0, 20));
            
            // Convert the actual data to base64
            const actualBytes = new Uint8Array(parsed.data);
            const actualBase64 = Buffer.from(actualBytes).toString('base64');
            console.log('Actual data as base64:', actualBase64.substring(0, 100));
          }
        } catch (jsonError) {
          console.log('Not valid JSON:', jsonError.message);
        }
      } catch (error) {
        console.log('Error decoding hex:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugE2EEData().catch(console.error);
