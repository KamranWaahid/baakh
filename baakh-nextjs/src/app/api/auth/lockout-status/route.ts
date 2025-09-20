import { NextRequest, NextResponse } from 'next/server';
import { checkLockoutStatus, getClientIP } from '@/lib/security/lockout';
import { withSecurityHeaders } from '@/lib/security/middleware';

async function handler(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const lockoutStatus = await checkLockoutStatus(clientIP);
    
    return NextResponse.json(lockoutStatus);
  } catch (error) {
    console.error('Error checking lockout status:', error);
    return NextResponse.json(
      { error: 'Failed to check lockout status' },
      { status: 500 }
    );
  }
}

export const GET = withSecurityHeaders(handler);
