'use client';
import { createClient } from '@supabase/supabase-js';

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
let supabase;

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
    // Fallback to dummy client that doesn't make network requests
    supabase = createClient(
      'https://dummy.supabase.co',
      'dummy-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          flowType: 'implicit'
        },
        global: {
          fetch: () => {
            // Mock fetch that returns a rejected promise to prevent network requests
            return Promise.reject(new Error('Supabase not configured - authentication disabled'));
          }
        }
      }
    );
  }
  } else {
    // Create a dummy client for development that doesn't make network requests
    supabase = createClient(
      'https://dummy.supabase.co',
      'dummy-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          flowType: 'implicit'
        },
        global: {
          fetch: () => {
            // Mock fetch that returns a rejected promise to prevent network requests
            return Promise.reject(new Error('Supabase not configured - authentication disabled'));
          }
        }
      }
    );
  }

// Add fallback properties for compatibility
if (!hasValidCredentials) {
  (supabase as any).supabaseUrl = 'dummy.supabase.co';
  (supabase as any).supabaseKey = 'dummy-key';
}

export { supabase };


