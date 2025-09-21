import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 /api/auth/me: Request received');
  }
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Check if Supabase is properly configured
  const isConfigured = url && 
    anon && 
    serviceKey && 
    url !== 'your_supabase_project_url_here' && 
    anon !== 'your_supabase_anon_key_here' &&
    serviceKey !== 'your_supabase_service_role_key_here' &&
    url.startsWith('https://') &&
    url.includes('.supabase.co');
  
  if (!isConfigured) {
    console.warn('⚠️ /api/auth/me: Supabase not properly configured, returning fallback response');
    return NextResponse.json({ 
      error: 'not-configured',
      message: 'Supabase not configured. Please complete setup at /admin/setup',
      allowed: false 
    }, { status: 503 });
  }

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  if (process.env.NODE_ENV !== 'production') {
    console.log('🍪 /api/auth/me: Cookies present:', allCookies.map(c => c.name));
  }
  
  // Look for the Supabase session cookie
  const sessionCookie = allCookies.find(c => c.name === 'baakh_supabase_auth');
  // Also support local auth cookie
  const localTokenCookie = allCookies.find(c => c.name === 'baakh_local_auth');
  
  if (!sessionCookie && !localTokenCookie) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('❌ /api/auth/me: No session cookie found');
    }
    return NextResponse.json({ error: 'not-authenticated' }, { status: 401 });
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔐 /api/auth/me: Session cookie found');
  }
  
  try {
    // If local cookie exists but no supabase cookie, resolve minimal user from users table
    if (!sessionCookie && localTokenCookie) {
      const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
      const { data: localUser, error: localErr } = await getSupabaseClient()
        .from('users')
        .select('id,email,name,role,avatar')
        .eq('remember_token', localTokenCookie.value)
        .maybeSingle();
      if (!localErr && localUser) {
        return NextResponse.json({ user: { id: localUser.id, email: localUser.email, name: localUser.name }, profile: null, allowed: false });
      }
    }
    // Parse the session cookie value - handle base64 encoded cookies
    let sessionData;
    try {
      // Check if the cookie is base64 encoded
      if (sessionCookie?.value.startsWith('base64-')) {
        // Extract the base64 part after "base64-"
        const base64Data = sessionCookie.value.substring(7);
        // Decode base64 to string
        const decodedString = Buffer.from(base64Data, 'base64').toString('utf-8');
        // Parse the decoded JSON
        sessionData = JSON.parse(decodedString);
        if (process.env.NODE_ENV !== 'production') {
          console.log('✅ /api/auth/me: Base64 session cookie decoded and parsed successfully');
        }
      } else {
        // Try to parse as regular JSON (fallback)
        sessionData = JSON.parse(sessionCookie?.value || '{}');
        if (process.env.NODE_ENV !== 'production') {
          console.log('✅ /api/auth/me: Regular JSON session cookie parsed successfully');
        }
      }
    } catch (parseError) {
      console.error('❌ /api/auth/me: Failed to parse session cookie');
      return NextResponse.json({ error: 'Invalid session format' }, { status: 401 });
    }
    
    // Extract user information from session
    const user = sessionData?.user || sessionData?.currentSession?.user;
    if (!user || !user.id) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('❌ /api/auth/me: No user found in session data');
      }
      return NextResponse.json({ error: 'not-authenticated' }, { status: 401 });
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ /api/auth/me: User found');
    }

    // Use service role client to access profiles table
    const admin = createClient(url, serviceKey, { 
      auth: { autoRefreshToken: false, persistSession: false } 
    });
    
    let { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('is_admin,is_editor,display_name,avatar_url')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ /api/auth/me: Error getting profile');
      // Don't fail here, just log the error
    }
    
    let allowed = !!profile && (profile.is_admin || profile.is_editor);
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔐 /api/auth/me: Initial allowed status:', allowed);
    }

    // Bootstrap: optionally auto-elevate users in allowlist (development only)
    const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
    const auto = String(process.env.AUTO_ELEVATE_ADMINS || '').toLowerCase() === 'true';
    const isLocalhost = process.env.NODE_ENV !== 'production';
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚙️ /api/auth/me: Auto-elevation config:', { allowlist, auto, isLocalhost });
    }
    
    if (!allowed && auto && isLocalhost && user.email && allowlist.includes(user.email.toLowerCase())) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🚀 /api/auth/me: Auto-elevating user to admin');
      }
      await admin.from('profiles').upsert({ id: user.id, is_admin: true, is_editor: true }, { onConflict: 'id' });
      const { data: refreshed } = await admin.from('profiles').select('is_admin,is_editor,display_name,avatar_url').eq('id', user.id).single();
      profile = refreshed || profile;
      allowed = !!profile && (profile.is_admin || profile.is_editor);
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ /api/auth/me: Auto-elevation completed, new allowed status:', allowed);
      }
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('🎯 /api/auth/me: Final response - allowed:', allowed);
    }
    
    return NextResponse.json({
      user: { id: user.id, email: user.email },
      profile: profile || null,
      allowed,
    });
    
  } catch (error) {
    console.error('❌ /api/auth/me: Unexpected error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


