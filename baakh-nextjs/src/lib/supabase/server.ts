import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function supabaseServer(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const headersList = await headers();
  
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
    // Return a dummy client that won't crash
    return createServerClient(
      'https://dummy.supabase.co',
      'dummy-anon-key',
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
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
  
  return createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
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

export async function createClient(): Promise<SupabaseClient> {
  return supabaseServer();
}

// Export supabase for backward compatibility
export const supabase = createClient();


