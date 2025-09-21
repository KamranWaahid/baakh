import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
const isConfigured = supabaseUrl && 
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_project_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co');

let supabase: any;

if (isConfigured) {
  try {
    supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!);
  } catch (error) {
    console.warn('Failed to create Supabase client:', error);
    supabase = null;
  }
} else {
  console.warn('Supabase not configured, using null client');
  supabase = null;
}

export { supabase };