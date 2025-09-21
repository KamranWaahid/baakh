import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export async function supabaseServer() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Check if Supabase is properly configured
  const isConfigured = supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_project_url_here' && 
    supabaseAnonKey !== 'your_supabase_anon_key_here' &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co');
  
  if (!isConfigured) {
    console.warn('⚠️ Server client: Supabase not properly configured, using fallback');
    // Return a mock client that won't crash during build
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Supabase not configured' } }),
        signIn: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            range: () => Promise.resolve({ data: [], error: null }),
            order: () => ({
              or: () => ({
                range: () => Promise.resolve({ data: [], error: null })
              }),
              range: () => Promise.resolve({ data: [], error: null })
            })
          }),
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
            })
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
              })
            })
          }),
          delete: () => ({
            eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          })
        }),
        count: () => Promise.resolve({ count: 0, error: null })
      })
    } as any;
  }
  
  return createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // In RSC, cookies may be read-only; ignore
          }
        },
      },
    }
  );
}

export async function createClient() {
  return supabaseServer();
}

// Export supabase for backward compatibility - removed module-level call
// Use createClient() or supabaseServer() within request handlers instead


