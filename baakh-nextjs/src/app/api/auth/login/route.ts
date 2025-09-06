import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login API called at:', new Date().toISOString());
    console.log('🔐 Request headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Missing username or password' },
        { status: 400 }
      );
    }

    console.log('🔐 Attempting login for username:', username);

    // Get user data for verification
    const { data: user, error } = await supabase
      .from('e2ee_users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      console.log('❌ User not found or error:', error);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('✅ User found:', { userId: user.user_id, username: user.username });

    // Enhanced function to convert data from Supabase to base64 for client-side processing
    const convertToBase64 = (data: any, fieldName: string) => {
      try {
        console.log(`[${fieldName}] convertToBase64 input:`, { 
          type: typeof data, 
          isNull: data === null,
          isUndefined: data === undefined,
          constructor: data?.constructor?.name,
          data: data
        });
        
        // Handle null/undefined
        if (data === null || data === undefined) {
          console.error(`[${fieldName}] Data is null or undefined`);
          throw new Error(`${fieldName} data is missing`);
        }
        
        // If it's already a Buffer object (from Supabase) - this is what we're getting
        if (data && typeof data === 'object' && data.type === 'Buffer' && Array.isArray(data.data)) {
          console.log(`[${fieldName}] Converting Buffer object to base64:`, { 
            type: data.type, 
            dataLength: data.data.length,
            dataSample: data.data.slice(0, 10)
          });
          const buffer = Buffer.from(data.data);
          const base64 = buffer.toString('base64');
          console.log(`[${fieldName}] Converted to base64, length:`, base64.length);
          return base64;
        }
        
        // If it's a Buffer instance
        if (Buffer.isBuffer(data)) {
          console.log(`[${fieldName}] Converting Buffer instance to base64, length:`, data.length);
          return data.toString('base64');
        }
        
        // If it's a Uint8Array
        if (data instanceof Uint8Array) {
          console.log(`[${fieldName}] Converting Uint8Array to base64, length:`, data.length);
          const buffer = Buffer.from(data);
          return buffer.toString('base64');
        }
        
        // If it's a hex string with \x prefix (PostgreSQL bytea format)
        if (typeof data === 'string' && data.startsWith('\\x')) {
          console.log(`[${fieldName}] Converting hex string to base64:`, data.substring(0, 50));
          
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
              console.log(`[${fieldName}] Extracted Buffer data and converted to base64, length:`, base64.length);
              return base64;
            }
          } catch (jsonError) {
            // Not a JSON Buffer object, treat as regular hex
            console.log(`[${fieldName}] Not a JSON Buffer object, treating as regular hex`);
          }
          
          // Regular hex conversion
          const cleanHex = data.replace(/\\x/g, '');
          const buffer = Buffer.from(cleanHex, 'hex');
          const base64 = buffer.toString('base64');
          console.log(`[${fieldName}] Converted hex to base64, length:`, base64.length);
          return base64;
        }
        
        // If it's a regular hex string (without \x prefix)
        if (typeof data === 'string' && /^[0-9a-fA-F]+$/.test(data)) {
          console.log(`[${fieldName}] Converting hex string to base64:`, data.substring(0, 50));
          
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
              console.log(`[${fieldName}] Extracted Buffer data and converted to base64, length:`, base64.length);
              return base64;
            }
          } catch (jsonError) {
            // Not a JSON Buffer object, treat as regular hex
            console.log(`[${fieldName}] Not a JSON Buffer object, treating as regular hex`);
          }
          
          // Regular hex conversion
          const buffer = Buffer.from(data, 'hex');
          const base64 = buffer.toString('base64');
          console.log(`[${fieldName}] Converted hex to base64, length:`, base64.length);
          return base64;
        }
        
        // If it's already a base64 string or a JSON Buffer string
        if (typeof data === 'string') {
          // Handle JSON Buffer string (e.g., "{\"type\":\"Buffer\",\"data\":[...]}" )
          if (data.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(data);
              if (parsed && typeof parsed === 'object' && parsed.type === 'Buffer' && Array.isArray(parsed.data)) {
                console.log(`[${fieldName}] Parsing JSON Buffer string`);
                const buffer = Buffer.from(parsed.data);
                return buffer.toString('base64');
              }
            } catch (jsonErr) {
              // Not JSON; fall through
              console.log(`[${fieldName}] String is not valid JSON Buffer; continuing checks`);
            }
          }

          // Check if it looks like base64
          if (/^[A-Za-z0-9+/]*={0,2}$/.test(data)) {
            console.log(`[${fieldName}] Data is already base64 string, length:`, data.length);
            return data;
          } else {
            console.log(`[${fieldName}] Data is string but doesn't look like base64, treating as raw bytes`);
            const buffer = Buffer.from(data, 'utf8');
            return buffer.toString('base64');
          }
        }
        
        // If it's an array of numbers
        if (Array.isArray(data)) {
          console.log(`[${fieldName}] Converting array of numbers to base64, length:`, data.length);
          const buffer = Buffer.from(data);
          return buffer.toString('base64');
        }
        
        console.error(`[${fieldName}] Unknown data format:`, typeof data, data);
        throw new Error(`Unknown data format for ${fieldName}: ${typeof data}`);
      } catch (error: any) {
        console.error(`[${fieldName}] Error converting data to base64:`, error, data);
        throw new Error(`Failed to convert ${fieldName}: ${error.message}`);
      }
    };



    // Function to fix nonce lengths for AES-GCM compatibility
    const fixNonceLength = (base64String: string, fieldName: string) => {
      try {
        const decoded = Buffer.from(base64String, 'base64');
        console.log(`[${fieldName}] Original nonce length:`, decoded.length);
        
        if (decoded.length === 12) {
          console.log(`[${fieldName}] Nonce is already correct length (12 bytes)`);
          return base64String;
        } else if (decoded.length > 12) {
          console.log(`[${fieldName}] Nonce is too long (${decoded.length} bytes), truncating to 12 bytes`);
          const truncated = decoded.slice(0, 12);
          const fixedBase64 = truncated.toString('base64');
          console.log(`[${fieldName}] Fixed nonce length:`, truncated.length);
          return fixedBase64;
        } else {
          console.log(`[${fieldName}] Nonce is too short (${decoded.length} bytes), padding with zeros`);
          const padded = Buffer.alloc(12, 0);
          decoded.copy(padded);
          const fixedBase64 = padded.toString('base64');
          console.log(`[${fieldName}] Fixed nonce length:`, padded.length);
          return fixedBase64;
        }
      } catch (error: any) {
        console.error(`[${fieldName}] Error fixing nonce length:`, error);
        return base64String; // Return original if fixing fails
      }
    };

    // Log the raw user data to understand the format
    console.log('Raw user data from database:', {
      userId: user.user_id,
      username: user.username,
      passwordSaltType: typeof user.password_salt,
      passwordSaltConstructor: user.password_salt?.constructor?.name,
      passwordVerifierType: typeof user.password_verifier,
      profileCipherType: typeof user.profile_cipher,
      masterKeyCipherType: typeof user.master_key_cipher,
      kdfParams: user.kdf_params
    });

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

    console.log('✅ Successfully converted all data to base64');
    
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
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('🔑 JWT secret length:', process.env.SUPABASE_JWT_SECRET.length);

    // Generate a JWT token for Supabase RLS
    let token;
    try {
      token = jwt.sign(
        {
          sub: user.user_id,
          username: user.username,
          role: 'e2ee_user',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
        },
        process.env.SUPABASE_JWT_SECRET,
        { algorithm: 'HS256' }
      );
      console.log('✅ JWT token generated successfully');
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

    console.log('🔐 Login successful for user:', username);
    return response;

  } catch (error: any) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
