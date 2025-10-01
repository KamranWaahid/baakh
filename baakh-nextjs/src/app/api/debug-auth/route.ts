import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  console.log('=== DEBUG AUTH API ROUTE STARTED ===');
  
  try {
    // Check environment variables
    const envCheck = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
      nodeEnv: process.env.NODE_ENV,
      adminEmailAllowlist: process.env.ADMIN_EMAIL_ALLOWLIST ? 'Set' : 'Missing',
      autoElevateAdmins: process.env.AUTO_ELEVATE_ADMINS ? 'Set' : 'Missing'
    };
    
    console.log('Environment check:', envCheck);
    
    // Check cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    console.log('All cookies present:', allCookies.map(c => ({
      name: c.name,
      value: c.value ? `${c.value.substring(0, 20)}...` : 'empty',
      hasValue: !!c.value
    })));
    
    // Look for specific auth cookies
    const sessionCookie = allCookies.find(c => c.name === 'baakh_supabase_auth');
    const localTokenCookie = allCookies.find(c => c.name === 'baakh_local_auth');
    
    // Check for other common auth cookies
    const supabaseAuthCookie = allCookies.find(c => c.name.includes('supabase'));
    const authCookie = allCookies.find(c => c.name.includes('auth'));
    
    // Check headers
    const authHeader = request.headers.get('authorization');
    const userAgent = request.headers.get('user-agent');
    const referer = request.headers.get('referer');
    
    return NextResponse.json({
      success: true,
      message: 'Auth debug information',
      environment: envCheck,
      cookies: {
        all: allCookies.map(c => c.name),
        sessionCookie: sessionCookie ? 'Found' : 'Not found',
        localTokenCookie: localTokenCookie ? 'Found' : 'Not found',
        supabaseAuthCookie: supabaseAuthCookie ? 'Found' : 'Not found',
        authCookie: authCookie ? 'Found' : 'Not found',
        totalCookies: allCookies.length
      },
      headers: {
        authorization: authHeader ? 'Present' : 'Not present',
        userAgent: userAgent ? 'Present' : 'Not present',
        referer: referer || 'Not present'
      },
      requestInfo: {
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Unexpected error in debug auth API:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
