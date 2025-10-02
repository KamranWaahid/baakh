export const runtime = 'edge'
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { convertToBase64 as edgeConvertToBase64, ConversionLogger } from '@/lib/security/edge-bytes';

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
    
    // Test the convertToBase64 function with enhanced binary data detection
    const conversionLogger: ConversionLogger = (message, details) => {
      console.log(message, details);
    };

    const convertToBase64 = (data: unknown, fieldName: string) => {
      try {
        const result = edgeConvertToBase64(data, fieldName, conversionLogger);
        return { success: true, result, method: 'edge-bytes' };
      } catch (error: any) {
        return { success: false, error: error?.message || 'Conversion failed' };
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
