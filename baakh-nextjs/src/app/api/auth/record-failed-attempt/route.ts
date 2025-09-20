import { NextRequest, NextResponse } from 'next/server';
import { recordFailedAttempt, getClientIP } from '@/lib/security/lockout';
import { withSecurityHeaders } from '@/lib/security/middleware';

async function handler(req: NextRequest) {
  try {
    const { email } = await req.json();
    const clientIP = getClientIP(req);
    
    // Use email as identifier for more precise tracking
    const identifier = email || clientIP;
    const lockoutStatus = await recordFailedAttempt(identifier, clientIP);
    
    return NextResponse.json(lockoutStatus);
  } catch (error) {
    console.error('Error recording failed attempt:', error);
    return NextResponse.json(
      { error: 'Failed to record failed attempt' },
      { status: 500 }
    );
  }
}

export const POST = withSecurityHeaders(handler);
