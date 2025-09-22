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
    // Return a mock client that mimics the subset of Supabase API used by admin routes
    // so API routes respond quickly with safe placeholders instead of hanging the UI.
    const makeChain = () => {
      const chain = {
        eq: () => chain,
        in: () => chain,
        gte: () => chain,
        lt: () => chain,
        or: () => chain,
        order: () => chain,
        limit: () => Promise.resolve({ data: [], error: null }),
        range: () => Promise.resolve({ data: [], error: null })
      };
      return chain;
    };

    const mockClient = {
      from: () => ({
        // If select is used with head/count (for counts), return a resolved promise with count
        select: (_cols?: any, opts?: { head?: boolean; count?: 'exact' | 'planned' | 'estimated' }) => {
          if (opts?.head) {
            return Promise.resolve({ data: null, count: 0, error: null });
          }
          // Otherwise, return a chainable builder; terminal ops resolve to empty arrays
          return makeChain();
        },
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
      // Provide minimal storage API used by system-status route
      storage: {
        listBuckets: () => Promise.resolve({ data: [], error: null })
      }
    } as any;

    return mockClient;
  }
  
  return createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
