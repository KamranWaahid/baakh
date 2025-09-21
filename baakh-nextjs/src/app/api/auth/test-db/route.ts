import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    console.log('🧪 Testing database connection and data format...');
    
    // Test basic connection
    const { data: users, error } = await supabase
      .from('e2ee_users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('✅ Database connection successful');
    
    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found in database',
        userCount: 0
      });
    }
    
    const user = users[0];
    console.log('📋 Sample user data:', {
      userId: user.user_id,
      username: user.username,
      passwordSaltType: typeof user.password_salt,
      passwordSaltConstructor: user.password_salt?.constructor?.name,
      passwordSaltValue: user.password_salt,
      passwordVerifierType: typeof user.password_verifier,
      profileCipherType: typeof user.profile_cipher,
      masterKeyCipherType: typeof user.master_key_cipher
    });
    
    // Test the convertToBase64 function with enhanced Buffer object detection
    const convertToBase64 = (data: any, fieldName: string) => {
      try {
        console.log(`[${fieldName}] Testing conversion:`, { 
          type: typeof data, 
          constructor: data?.constructor?.name,
          isNull: data === null,
          isUndefined: data === undefined,
          data: data
        });
        
        if (data === null || data === undefined) {
          return { success: false, error: 'Data is null or undefined' };
        }
        
        // If it's already a Buffer object (from Supabase)
        if (data && typeof data === 'object' && data.type === 'Buffer' && Array.isArray(data.data)) {
          const buffer = Buffer.from(data.data);
          const base64 = buffer.toString('base64');
          return { success: true, result: base64, method: 'Buffer.from(data.data)' };
        }
        
        // If it's a Buffer instance
        if (Buffer.isBuffer(data)) {
          return { success: true, result: data.toString('base64'), method: 'Buffer.toString()' };
        }
        
        // If it's a Uint8Array
        if (data instanceof Uint8Array) {
          const buffer = Buffer.from(data);
          return { success: true, result: buffer.toString('base64'), method: 'Buffer.from(Uint8Array)' };
        }
        
        // If it's a hex string with \x prefix
        if (typeof data === 'string' && data.startsWith('\\x')) {
          // Check if this hex string represents a JSON Buffer object
          try {
            const cleanHex = data.replace(/\\x/g, '');
            const hexBytes = new Uint8Array(cleanHex.length / 2);
            for (let i = 0; i < cleanHex.length; i += 2) {
              hexBytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
            }
            const jsonString = new TextDecoder().decode(hexBytes);
            
            // Try to parse as JSON to see if it's a Buffer object
            const parsed = JSON.parse(jsonString);
            if (parsed && typeof parsed === 'object' && parsed.type === 'Buffer' && Array.isArray(parsed.data)) {
              console.log(`[${fieldName}] Found Buffer object in hex, extracting data array`);
              // This is a Buffer object stored as hex, extract the actual data
              const actualBytes = new Uint8Array(parsed.data);
              const base64 = Buffer.from(actualBytes).toString('base64');
              return { success: true, result: base64, method: 'extracted Buffer data from hex' };
            }
          } catch (jsonError) {
            // Not a JSON Buffer object, treat as regular hex
            console.log(`[${fieldName}] Not a JSON Buffer object, treating as regular hex`);
          }
          
          const cleanHex = data.replace(/\\x/g, '');
          const buffer = Buffer.from(cleanHex, 'hex');
          return { success: true, result: buffer.toString('base64'), method: 'hex string with \\x prefix' };
        }
        
        // If it's a regular hex string
        if (typeof data === 'string' && /^[0-9a-fA-F]+$/.test(data)) {
          // Check if this hex string represents a JSON Buffer object
          try {
            const hexBytes = new Uint8Array(data.length / 2);
            for (let i = 0; i < data.length; i += 2) {
              hexBytes[i / 2] = parseInt(data.substr(i, 2), 16);
            }
            const jsonString = new TextDecoder().decode(hexBytes);
            
            // Try to parse as JSON to see if it's a Buffer object
            const parsed = JSON.parse(jsonString);
            if (parsed && typeof parsed === 'object' && parsed.type === 'Buffer' && Array.isArray(parsed.data)) {
              console.log(`[${fieldName}] Found Buffer object in hex, extracting data array`);
              // This is a Buffer object stored as hex, extract the actual data
              const actualBytes = new Uint8Array(parsed.data);
              const base64 = Buffer.from(actualBytes).toString('base64');
              return { success: true, result: base64, method: 'extracted Buffer data from hex' };
            }
          } catch (jsonError) {
            // Not a JSON Buffer object, treat as regular hex
            console.log(`[${fieldName}] Not a JSON Buffer object, treating as regular hex`);
          }
          
          const buffer = Buffer.from(data, 'hex');
          return { success: true, result: buffer.toString('base64'), method: 'hex string' };
        }
        
        // If it's already a base64 string
        if (typeof data === 'string') {
          if (/^[A-Za-z0-9+/]*={0,2}$/.test(data)) {
            return { success: true, result: data, method: 'already base64' };
          } else {
            const buffer = Buffer.from(data, 'utf8');
            return { success: true, result: buffer.toString('base64'), method: 'string as utf8 bytes' };
          }
        }
        
        // If it's an array of numbers
        if (Array.isArray(data)) {
          const buffer = Buffer.from(data);
          return { success: true, result: buffer.toString('base64'), method: 'array of numbers' };
        }
        
        return { success: false, error: `Unknown format: ${typeof data}` };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    };
    
    // Test conversion for each field
    const conversionTests = {
      passwordSalt: convertToBase64(user.password_salt, 'passwordSalt'),
      passwordVerifier: convertToBase64(user.password_verifier, 'passwordVerifier'),
      profileCipher: convertToBase64(user.profile_cipher, 'profileCipher'),
      profileNonce: convertToBase64(user.profile_nonce, 'profileNonce'),
      masterKeyCipher: convertToBase64(user.master_key_cipher, 'masterKeyCipher'),
      masterKeyNonce: convertToBase64(user.master_key_nonce, 'masterKeyNonce')
    };
    
    console.log('🧪 Conversion test results:', conversionTests);
    
    return NextResponse.json({
      success: true,
      message: 'Database test completed',
      userCount: users.length,
      sampleUser: {
        userId: user.user_id,
        username: user.username,
        dataTypes: {
          passwordSalt: typeof user.password_salt,
          passwordVerifier: typeof user.password_verifier,
          profileCipher: typeof user.profile_cipher,
          profileNonce: typeof user.profile_nonce,
          masterKeyCipher: typeof user.master_key_cipher,
          masterKeyNonce: typeof user.master_key_nonce
        },
        conversionTests
      }
    });
    
  } catch (error: any) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}
