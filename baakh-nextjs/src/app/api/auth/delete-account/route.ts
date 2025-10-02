export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyJwt, JWTPayload } from '@/lib/security/edge-jwt';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    
    console.log('Delete account - Token received:', token ? 'Token present' : 'No token')
    console.log('Delete account - JWT Secret available:', !!process.env.SUPABASE_JWT_SECRET)
    
    // Verify JWT token
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET is not configured');
    }

    let decoded: JWTPayload & { sub?: string; user_id?: string; username?: string };
    try {
      decoded = await verifyJwt(token, jwtSecret);
      console.log('Delete account - Token decoded successfully:', { 
        sub: decoded.sub, 
        user_id: decoded.user_id,
        username: decoded.username 
      })
    } catch (error) {
      console.error('JWT verification failed:', error)
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const userId = decoded.sub || decoded.user_id

    if (!userId) {
      console.error('No user ID found in token:', decoded)
      return NextResponse.json(
        { success: false, message: 'Invalid token payload' },
        { status: 401 }
      )
    }

    console.log('Deleting account for user:', userId)

    // Delete user from e2ee_users table
    const { error: deleteError } = await supabase
      .from('e2ee_users')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error deleting user from database:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Failed to delete account from database' },
        { status: 500 }
      )
    }

    console.log('Successfully deleted user account:', userId)

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
