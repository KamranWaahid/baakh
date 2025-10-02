export const runtime = 'edge'
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  console.log('=== SIMPLE AUTH ME API ROUTE STARTED ===');
  
  try {
    // Check if Supabase is configured
    const supabase = createAdminClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: 'not-configured',
        message: 'Supabase not configured',
        allowed: false 
      }, { status: 503 });
    }
    
    // Get cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    console.log('Cookies found:', allCookies.map(c => c.name));
    
    // Look for auth cookies
    const sessionCookie = allCookies.find(c => c.name === 'baakh_supabase_auth');
    const localTokenCookie = allCookies.find(c => c.name === 'baakh_local_auth');
    
    if (!sessionCookie && !localTokenCookie) {
      console.log('No auth cookies found');
      return NextResponse.json({ 
        error: 'not-authenticated',
        message: 'No authentication cookies found',
        allowed: false,
        cookies: allCookies.map(c => c.name)
      }, { status: 401 });
    }
    
    // If we have a local token, try to authenticate with it
    if (localTokenCookie && !sessionCookie) {
      console.log('Using local token for authentication');
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('remember_token', localTokenCookie.value)
        .maybeSingle();
      
      if (error || !user) {
        console.log('Local token authentication failed:', error?.message);
        return NextResponse.json({ 
          error: 'invalid-token',
          message: 'Invalid or expired token',
          allowed: false 
        }, { status: 401 });
      }
      
      // Check if user has admin/editor role
      const isAdmin = user.role === 'admin' || user.role === 'editor';
      
      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name },
        profile: { is_admin: isAdmin, is_editor: isAdmin },
        allowed: isAdmin,
        authType: 'local'
      });
    }
    
    // If we have a session cookie, try to parse it
    if (sessionCookie) {
      console.log('Using session cookie for authentication');
      
      try {
        let sessionData;
        
        // Try to parse the session cookie
        if (sessionCookie.value.startsWith('base64-')) {
          const base64Data = sessionCookie.value.substring(7);
          const decodedString = Buffer.from(base64Data, 'base64').toString('utf-8');
          sessionData = JSON.parse(decodedString);
        } else {
          sessionData = JSON.parse(sessionCookie.value);
        }
        
        const user = sessionData?.user || sessionData?.currentSession?.user;
        
        if (!user || !user.id) {
          console.log('No user found in session data');
          return NextResponse.json({ 
            error: 'invalid-session',
            message: 'Invalid session data',
            allowed: false 
          }, { status: 401 });
        }
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin, is_editor, display_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.log('Profile error:', profileError.message);
        }
        
        const allowed = !!profile && (profile.is_admin || profile.is_editor);
        
        return NextResponse.json({
          user: { id: user.id, email: user.email },
          profile: profile || null,
          allowed,
          authType: 'session'
        });
        
      } catch (parseError) {
        console.log('Session cookie parse error:', parseError);
        return NextResponse.json({ 
          error: 'invalid-session',
          message: 'Invalid session format',
          allowed: false 
        }, { status: 401 });
      }
    }
    
    return NextResponse.json({ 
      error: 'unknown-error',
      message: 'Unknown authentication error',
      allowed: false 
    }, { status: 401 });
    
  } catch (error) {
    console.error('Unexpected error in simple auth me API:', error);
    return NextResponse.json({ 
      error: 'internal-error',
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      allowed: false 
    }, { status: 500 });
  }
}
