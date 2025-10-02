export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Poetry detail test endpoint working',
    timestamp: new Date().toISOString(),
    params: Object.fromEntries(new URL(request.url).searchParams)
  });
}
