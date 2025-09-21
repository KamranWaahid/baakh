'use client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Debug environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Client Debug:', {
  supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
  supabaseAnonKey: supabaseAnonKey ? 'Set' : 'Missing',
  nodeEnv: process.env.NODE_ENV
});

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_project_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co');

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase credentials not properly configured. Using fallback mode.');
  console.warn('📋 To fix this:');
  console.warn('1. Go to https://app.supabase.com');
  console.warn('2. Create a new project or select existing one');
  console.warn('3. Go to Settings → API');
  console.warn('4. Copy Project URL and anon key');
  console.warn('5. Update .env.local with your credentials');
  console.warn('6. Restart the development server');
}

// Create a fallback client with dummy credentials if needed
let supabase: SupabaseClient;

if (hasValidCredentials) {
  try {
    supabase = createClient(
      supabaseUrl!,
      supabaseAnonKey!,
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
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    // Fallback to mock client that doesn't make network requests
    supabase = {
      auth: {
        signIn: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Supabase not configured' } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            range: () => Promise.resolve({ data: [], error: null })
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
        })
      })
    } as any;
  }
  } else {
    // Create a mock client that doesn't make network requests
    supabase = {
      auth: {
        signIn: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Supabase not configured' } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            range: () => Promise.resolve({ data: [], error: null })
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
        })
      })
    } as any;
  }

// Add fallback properties for compatibility
if (!hasValidCredentials) {
  (supabase as any).supabaseUrl = 'dummy.supabase.co';
  (supabase as any).supabaseKey = 'dummy-key';
}

export { supabase };


