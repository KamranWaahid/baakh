import { supabase } from './supabase/client';

export interface SessionStatus {
  isValid: boolean;
  needsRefresh: boolean;
  error?: string;
}

/**
 * Check if the current session is valid and refresh if needed
 */
export async function checkAndRefreshSession(): Promise<SessionStatus> {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return {
        isValid: false,
        needsRefresh: true,
        error: sessionError.message
      };
    }

    if (!session) {
      return {
        isValid: false,
        needsRefresh: true,
        error: 'No active session'
      };
    }

    // Check if session is expired or about to expire (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry <= 300) { // 5 minutes = 300 seconds
      // Session is expired or about to expire, try to refresh
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        return {
          isValid: false,
          needsRefresh: true,
          error: refreshError?.message || 'Failed to refresh session'
        };
      }
      
      return {
        isValid: true,
        needsRefresh: false
      };
    }

    return {
      isValid: true,
      needsRefresh: false
    };
  } catch (error) {
    console.error('Session check failed:', error);
    return {
      isValid: false,
      needsRefresh: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Force refresh the current session
 */
export async function forceRefreshSession(): Promise<SessionStatus> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      return {
        isValid: false,
        needsRefresh: true,
        error: error?.message || 'Failed to refresh session'
      };
    }

    return {
      isValid: true,
      needsRefresh: false
    };
  } catch (error) {
    console.error('Force session refresh failed:', error);
    return {
      isValid: false,
      needsRefresh: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get the current user with session validation
 */
export async function getCurrentUser() {
  const sessionStatus = await checkAndRefreshSession();
  
  if (!sessionStatus.isValid) {
    return { user: null, error: sessionStatus.error };
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, error: error?.message || 'No user found' };
  }

  return { user, error: null };
}

export function localeFromPath(pathname: string | null | undefined): 'sd' | 'en' {
  if (!pathname) return 'sd';
  return pathname.startsWith('/sd') ? 'sd' : 'en';
}

export function loginPath(pathname: string | null | undefined): string {
  return localeFromPath(pathname) === 'sd' ? '/sd/login' : '/en/login';
}

/**
 * Check if user has required permissions
 */
export async function checkUserPermissions(requiredPermissions: string[] = []) {
  const { user, error } = await getCurrentUser();
  
  if (error || !user) {
    return { allowed: false, reason: 'not-authenticated', error };
  }

  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      return { allowed: false, reason: 'profile-fetch-failed' };
    }

    const profileData = await response.json();
    if (!profileData.allowed) {
      return { allowed: false, reason: 'not-authorized' };
    }

    // Check specific permissions if required
    if (requiredPermissions.length > 0) {
      const userPermissions = [];
      if (profileData.profile?.is_admin) userPermissions.push('admin');
      if (profileData.profile?.is_editor) userPermissions.push('editor');
      if (profileData.profile?.is_reviewer) userPermissions.push('reviewer');

      const hasRequiredPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasRequiredPermission) {
        return { allowed: false, reason: 'insufficient-permissions' };
      }
    }

    return { 
      allowed: true, 
      profile: profileData.profile,
      permissions: {
        isAdmin: profileData.profile?.is_admin || false,
        isEditor: profileData.profile?.is_editor || false,
        isReviewer: profileData.profile?.is_reviewer || false
      }
    };
  } catch (error) {
    console.error('Permission check failed:', error);
    return { allowed: false, reason: 'permission-check-failed', error };
  }
}

