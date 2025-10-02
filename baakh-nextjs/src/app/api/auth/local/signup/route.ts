export const runtime = 'edge'
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Local signup not supported on Edge runtime' }, { status: 501 });
}



