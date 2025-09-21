import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'AUTH_ERROR', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]

    // Verify the JWT token
    const { data: { user }, error: authError } = await getSupabaseClient().auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'AUTH_ERROR', message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get user data from e2ee_users table
    const { data: userData, error: userError } = await getSupabaseClient()
      .from('e2ee_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'USER_ERROR', message: 'User data not found' },
        { status: 404 }
      )
    }

    // Return all the requested encrypted data fields
    return NextResponse.json({
      success: true,
      data: {
        user_id: userData.user_id,
        username: userData.username,
        sindhi_name: userData.sindhi_name || null,
        english_name: userData.english_name || null,
        password_salt: userData.password_salt,
        password_verifier: userData.password_verifier,
        profile_cipher: userData.profile_cipher,
        profile_nonce: userData.profile_nonce || null,
        master_key_cipher: userData.master_key_cipher,
        master_key_nonce: userData.master_key_nonce,
        kdf_params: userData.kdf_params,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      }
    })

  } catch (error) {
    console.error('User data fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
