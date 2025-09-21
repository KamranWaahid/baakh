import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Check if Supabase is properly configured
  const isConfigured = supabaseUrl && 
    supabaseServiceKey && 
    supabaseUrl !== 'your_supabase_project_url_here' && 
    supabaseServiceKey !== 'your_supabase_service_role_key_here' &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co');
  
  if (!isConfigured) {
    console.warn('⚠️ Admin client: Supabase not properly configured, using fallback');
    // Return a mock client that won't crash during build
    return {
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
  
  return createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
