export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { clearLockout, getClientIP } from '@/lib/security/lockout';
import { withSecurityHeaders } from '@/lib/security/middleware';

async function handler(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    await clearLockout(clientIP);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing lockout:', error);
    return NextResponse.json(
      { error: 'Failed to clear lockout' },
      { status: 500 }
    );
  }
}

export const POST = withSecurityHeaders(handler);
