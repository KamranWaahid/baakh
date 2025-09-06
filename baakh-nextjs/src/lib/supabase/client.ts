'use client';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'baakh_supabase_auth',
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development',
    },
    global: {
      headers: {
        'X-Client-Info': 'baakh-admin',
      },
    },
  }
);


