import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken, createSignedCSRFToken } from '@/lib/security/csrf';
import { withSecurityHeaders } from '@/lib/security/middleware';

async function handler(req: NextRequest) {
  try {
    // Generate new CSRF token
    const { token, expires } = generateCSRFToken();
    const signedToken = createSignedCSRFToken(token);
    
    // Store token in response headers for client to read
    const response = NextResponse.json({ 
      csrfToken: signedToken,
      expires 
    });
    
    // Set CSRF token in cookie for additional security
    response.cookies.set('csrf-token', signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });
    
    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

export const GET = withSecurityHeaders(handler);
