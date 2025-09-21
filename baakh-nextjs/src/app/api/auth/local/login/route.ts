import { NextResponse } from 'next/server';
import { scryptSync, timingSafeEqual, randomBytes } from 'crypto';
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

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'missing-fields' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'supabase-not-configured' }, { status: 500 });
    }

    const getSupabaseClient() = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: user, error } = await getSupabaseClient()
      .from('users')
      .select('id,name,email,password,remember_token')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'invalid-credentials' }, { status: 401 });
    }

    if (!verifyPassword(password, user.password as string)) {
      return NextResponse.json({ error: 'invalid-credentials' }, { status: 401 });
    }

    let token = user.remember_token || '';
    if (!token) {
      token = randomBytes(24).toString('base64url');
      await getSupabaseClient().from('users').update({ remember_token: token }).eq('id', user.id);
    }
    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
    if (token) {
      res.cookies.set('baakh_local_auth', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: 'unexpected', details: e?.message || String(e) }, { status: 500 });
  }
}


