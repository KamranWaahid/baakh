export const runtime = 'edge'
import { NextResponse } from 'next/server';
// Edge runtime does not support Node 'crypto' APIs used below; this route will be disabled on Edge
import { createClient } from '@supabase/supabase-js';

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [alg, params, saltB64, hashB64] = stored.split('$').slice(0).filter(Boolean);
    if (alg !== 'scrypt') return false;
    const [Nstr, rstr, pstr] = params.split('.');
    const N = Number(Nstr), r = Number(rstr), p = Number(pstr);
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const dk = scryptSync(password, salt, expected.length, { N, r, p });
    return timingSafeEqual(dk, expected);
  } catch {
    return false;
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Local login not supported on Edge runtime' }, { status: 501 });
}


