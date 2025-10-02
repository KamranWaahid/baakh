export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signJwt } from '@/lib/security/edge-jwt';
import { convertToBase64 as edgeConvertToBase64, ensureNonceLength, type ConversionLogger } from '@/lib/security/edge-bytes';
import { withErrorHandling, ValidationError, AuthenticationError, SecurityError } from '@/lib/security/error-handler';
import { withAuthRateLimit } from '@/lib/security/rate-limiter';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}
async function loginHandler(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔐 Login API called at:', new Date().toISOString());
    console.log('🔐 Request URL:', request.url);
    console.log('🔐 Request method:', request.method);
  }
  
  const supabase = getSupabaseClient();
  let body;
  try {
    body = await request.json();
    if (process.env.NODE_ENV !== 'production') {
      console.log('📝 Request body parsed');
    }
  } catch (parseError) {
    console.error('❌ Failed to parse request body:', parseError);
    console.error('❌ Request body raw:', await request.text());
    throw new ValidationError('Invalid JSON in request body', {
      parseError: parseError instanceof Error ? parseError.message : String(parseError)
    });
  }
  
  const { username, password } = body;

  if (!username || !password) {
    throw new ValidationError('Username and password are required', {
      providedFields: { username: !!username, password: !!password }
    });
  }

    console.log('🔐 Attempting login for username:', username);

    // Get user data for verification
    const { data: user, error } = await supabase
      .from('e2ee_users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('❌ User not found or error');
      }
      throw new AuthenticationError('Invalid credentials', {
        username: username,
        error: error?.message
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ User found');
    }

    const logger: ConversionLogger | undefined = process.env.NODE_ENV !== 'production'
      ? (message, details) => console.log(message, details)
      : undefined;

    const convertToBase64 = (data: unknown, fieldName: string) =>
      edgeConvertToBase64(data, fieldName, logger);

    const fixNonceLength = (base64String: string, fieldName: string) =>
      ensureNonceLength(base64String, fieldName, logger);

    // Log the raw user data to understand the format (development only)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Raw user data from database:', {
        userId: user.user_id,
        username: user.username,
        passwordSaltType: typeof user.password_salt,
        passwordSaltConstructor: user.password_salt?.constructor?.name,
        passwordSaltValue: user.password_salt,
        passwordVerifierType: typeof user.password_verifier,
        passwordVerifierValue: user.password_verifier,
        profileCipherType: typeof user.profile_cipher,
        profileCipherValue: user.profile_cipher,
        masterKeyCipherType: typeof user.master_key_cipher,
        masterKeyCipherValue: user.master_key_cipher,
        masterKeyNonceType: typeof user.master_key_nonce,
        masterKeyNonceValue: user.master_key_nonce,
        kdfParams: user.kdf_params
      });
    }

    // Return encrypted data for client-side verification
    // The client will verify the password and decrypt the master key
    const responseData: Record<string, any> = {
      userId: user.user_id,
      username: user.username,
      sindhi_name: user.sindhi_name, // Add sindhi_name field
      profileCipher: convertToBase64(user.profile_cipher, 'profileCipher'),
      profileNonce: fixNonceLength(convertToBase64(user.profile_nonce, 'profileNonce'), 'profileNonce'),
      profileAad: user.profile_aad,
      masterKeyCipher: convertToBase64(user.master_key_cipher, 'masterKeyCipher'),
      masterKeyNonce: fixNonceLength(convertToBase64(user.master_key_nonce, 'masterKeyNonce'), 'masterKeyNonce'),
      kdfParams: user.kdf_params,
      passwordSalt: convertToBase64(user.password_salt, 'passwordSalt'),
      passwordVerifier: convertToBase64(user.password_verifier, 'passwordVerifier'),
      passwordVerifierNonce: convertToBase64(user.password_verifier_nonce || user.profile_nonce, 'passwordVerifierNonce')
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Successfully converted all data to base64');
    }
    
    // Validate that all required fields are present and not empty
    const requiredFields = [
      'profileCipher', 'profileNonce', 'profileAad', 
      'masterKeyCipher', 'masterKeyNonce', 'passwordSalt', 
      'passwordVerifier', 'passwordVerifierNonce'
    ];
    
    for (const field of requiredFields) {
      if (!responseData[field] || responseData[field].trim() === '') {
        console.error(`❌ Missing or empty required field: ${field}`);
        return NextResponse.json(
          { error: `Server data error: missing ${field}` },
          { status: 500 }
        );
      }
    }
    
    console.log('✅ All required fields validated successfully');

    // Validate JWT secret
    if (!process.env.SUPABASE_JWT_SECRET) {
      console.error('❌ SUPABASE_JWT_SECRET environment variable is not set');
      throw new SecurityError('Server configuration error', {
        missingEnvVar: 'SUPABASE_JWT_SECRET'
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔑 JWT secret is set');
    }

    // Generate a JWT token for Supabase RLS
    let token: string;
    try {
      const jwtSecret = process.env.SUPABASE_JWT_SECRET!;
      token = await signJwt(
        {
          sub: user.user_id,
          username: user.username,
          role: 'e2ee_user',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
        },
        jwtSecret
      );
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ JWT token generated successfully');
      }
    } catch (jwtError: any) {
      console.error('❌ JWT token generation failed:', jwtError);
      return NextResponse.json(
        { error: 'Authentication token generation failed' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      userData: responseData,
      token
    });

    // Add cache-busting headers to prevent any caching issues
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔐 Login successful');
    }
    return response;

}

export const POST = withAuthRateLimit(withErrorHandling(async (request: NextRequest) => {
  try {
    return await loginHandler(request);
  } catch (error) {
    console.error('❌ Unhandled error in login handler:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Return a proper error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'LOGIN_ERROR',
        message: error instanceof Error ? error.message : 'Login failed'
      },
      { status: 500 }
    );
  }
}));
