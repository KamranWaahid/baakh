import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, profile, encryptedData } = body;

    if (!username || !password || !profile || !encryptedData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('e2ee_users')
      .select('user_id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Convert base64 strings to proper binary format for Supabase
    const convertToBinary = (base64String: string) => {
      try {
        // Remove any padding and convert to binary
        const binary = Buffer.from(base64String, 'base64');
        return binary;
      } catch (error) {
        console.error('Error converting base64 to binary:', error);
        throw new Error('Invalid base64 data');
      }
    };

    // Store the encrypted user data
    const { data: user, error } = await supabase
      .from('e2ee_users')
      .insert({
        username,
        password_salt: convertToBinary(encryptedData.passwordSalt),
        password_verifier: convertToBinary(encryptedData.passwordVerifier),
        password_verifier_nonce: convertToBinary(encryptedData.passwordVerifierNonce),
        profile_cipher: convertToBinary(encryptedData.profileCipher),
        profile_nonce: convertToBinary(encryptedData.profileNonce),
        profile_aad: encryptedData.profileAad,
        master_key_cipher: convertToBinary(encryptedData.masterKeyCipher),
        master_key_nonce: convertToBinary(encryptedData.masterKeyNonce),
        kdf_params: encryptedData.kdfParams
      })
      .select('user_id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user.user_id,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
