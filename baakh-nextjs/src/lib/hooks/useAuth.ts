import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  is_admin: boolean;
  is_editor: boolean;
  is_reviewer: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('🔍 useAuth: Checking authentication...');
        setAuthState(prev => ({ ...prev, loading: true, error: null }));

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.log('❌ useAuth: No user or auth error:', authError?.message || 'No user');
          if (mounted) {
            setAuthState({ user: null, loading: false, error: null });
          }
          return;
        }

        console.log('✅ useAuth: User found:', user.id);
        console.log('🔍 useAuth: Getting user profile...');

        // Get user profile
        const response = await fetch('/api/auth/me', { 
          credentials: 'include' // Ensure cookies are sent
        });
        
        console.log('📡 useAuth: Profile API response status:', response.status);
        
        if (!response.ok) {
          console.error('❌ useAuth: Profile API failed:', response.status);
          await supabase.auth.signOut();
          if (mounted) {
            setAuthState({ user: null, loading: false, error: 'Failed to verify access' });
          }
          return;
        }

        const profileData = await response.json();
        console.log('📋 useAuth: Profile data:', profileData);
        
        if (!profileData.allowed) {
          console.error('❌ useAuth: Access denied for user');
          await supabase.auth.signOut();
          if (mounted) {
            setAuthState({ user: null, loading: false, error: 'Access denied' });
          }
          return;
        }

        console.log('✅ useAuth: Access verified, setting user state');
        if (mounted) {
          setAuthState({
            user: profileData.profile,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('❌ useAuth: Auth check failed:', error);
        if (mounted) {
          setAuthState({
            user: null,
            loading: false,
            error: 'Authentication failed',
          });
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          if (mounted) {
            setAuthState({ user: null, loading: false, error: null });
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          checkAuth();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshAuth = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      // First try to refresh the session
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError) {
        console.error('Session refresh failed:', sessionError);
        // If refresh fails, try to get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const response = await fetch('/api/auth/me');
          if (response.ok) {
            const profileData = await response.json();
            if (profileData.allowed) {
              setAuthState({
                user: profileData.profile,
                loading: false,
                error: null,
              });
              return;
            }
          }
        }
        setAuthState({ user: null, loading: false, error: null });
        return;
      }

      // If session refresh succeeded, get user profile
      if (session?.user) {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const profileData = await response.json();
          if (profileData.allowed) {
            setAuthState({
              user: profileData.profile,
              loading: false,
              error: null,
            });
            return;
          }
        }
      }
      
      setAuthState({ user: null, loading: false, error: null });
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setAuthState({ user: null, loading: false, error: 'Failed to refresh' });
    }
  };

  return {
    ...authState,
    signOut,
    refreshAuth,
  };
}
