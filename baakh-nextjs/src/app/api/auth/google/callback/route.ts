import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('User info fetch failed:', userData);
      return NextResponse.redirect(new URL('/login?error=user_info_failed', request.url));
    }

    // Create or update user in your database
    // For now, we'll redirect to a success page with user data
    // In a real implementation, you would:
    // 1. Check if user exists in your database
    // 2. Create user if they don't exist
    // 3. Create a session/token for your app
    // 4. Redirect to the main app

    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('google_auth', 'success');
    redirectUrl.searchParams.set('email', userData.email);
    redirectUrl.searchParams.set('name', userData.name);

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url));
  }
}
