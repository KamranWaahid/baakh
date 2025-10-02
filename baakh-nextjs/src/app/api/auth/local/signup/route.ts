export const runtime = 'edge'
import { NextResponse } from 'next/server';
// Edge runtime does not support Node 'crypto' APIs used below; this route will be disabled on Edge
import { createClient } from '@supabase/supabase-js';

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const N = 16384; // scrypt cost
  const r = 8;
  const p = 1;
  const keyLen = 64;
  const dk = scryptSync(password, salt, keyLen, { N, r, p });
  return `scrypt$${N}.${r}.${p}$${salt.toString('base64')}$${Buffer.from(dk).toString('base64')}`;
}

export async function POST() {
  return NextResponse.json({ error: 'Local signup not supported on Edge runtime' }, { status: 501 });
}




