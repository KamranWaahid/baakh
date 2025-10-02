export const runtime = 'edge'
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Local login not supported on Edge runtime' }, { status: 501 });
}

