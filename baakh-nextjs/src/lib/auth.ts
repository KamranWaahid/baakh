import { supabaseServer } from './supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function requireEditor() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { allowed: false, reason: 'not-authenticated' } as const;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return { allowed: false, reason: 'server-misconfigured' } as const;
  const admin = createAdminClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: profile } = await admin.from('profiles').select('is_admin,is_editor').eq('id', user.id).single();
  const allowed = !!profile && (profile.is_admin || profile.is_editor);
  return { allowed, reason: allowed ? null : 'not-authorized' } as const;
}


