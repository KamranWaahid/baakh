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
    // Return a dummy client that won't crash
    return createClient(
      'https://dummy.supabase.co',
      'dummy-service-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  
  return createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
