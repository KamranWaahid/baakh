export const runtime = 'edge'
import { NextResponse } from 'next/server';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
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

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'missing-fields' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'supabase-not-configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // Check if user exists
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (existingError) {
      return NextResponse.json({ error: 'db-error', details: existingError.message }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({ error: 'email-taken' }, { status: 409 });
    }

    const password_hash = hashPassword(password);
    const remember_token = randomBytes(24).toString('base64url');

    const { data: created, error: insertError } = await supabase
      .from('users')
      .insert({ name, email: email.toLowerCase(), password: password_hash, remember_token })
      .select('id,name,email')
      .single();
    if (insertError || !created) {
      return NextResponse.json({ error: 'insert-failed', details: insertError?.message }, { status: 500 });
    }

    const res = NextResponse.json({ user: created });
    res.cookies.set('baakh_local_auth', remember_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: 'unexpected', details: e?.message || String(e) }, { status: 500 });
  }
}




