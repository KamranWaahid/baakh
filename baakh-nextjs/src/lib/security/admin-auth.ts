import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { withErrorHandling, AuthenticationError, AuthorizationError } from './error-handler';

/**
 * Admin authorization middleware
 * Verifies that the user is authenticated and has admin privileges
 */
export async function requireAdminAuth(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const supabase = createAdminClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new AuthenticationError('Invalid or expired token');
    }

    // Check if user has admin privileges
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, is_editor')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new AuthorizationError('User profile not found');
    }

    if (!profile.is_admin && !profile.is_editor) {
      throw new AuthorizationError('Insufficient privileges - admin access required');
    }

    return { user, profile };
  } catch (error) {
    console.error('Admin auth error:', error);
    throw error;
  }
}

/**
 * Higher-order function to wrap admin API routes with authorization
 */
export function withAdminAuth<T extends any[], R>(
  handler: (request: NextRequest, context: { user: any; profile: any }, ...args: T) => Promise<NextResponse>
) {
  return withErrorHandling(async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const { user, profile } = await requireAdminAuth(request);
    return handler(request, { user, profile }, ...args);
  });
}

/**
 * Editor authorization middleware (less restrictive than admin)
 */
export async function requireEditorAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const supabase = createAdminClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new AuthenticationError('Invalid or expired token');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, is_editor')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new AuthorizationError('User profile not found');
    }

    if (!profile.is_admin && !profile.is_editor) {
      throw new AuthorizationError('Insufficient privileges - editor access required');
    }

    return { user, profile };
  } catch (error) {
    console.error('Editor auth error:', error);
    throw error;
  }
}

/**
 * Higher-order function to wrap editor API routes with authorization
 */
export function withEditorAuth<T extends any[], R>(
  handler: (request: NextRequest, context: { user: any; profile: any }, ...args: T) => Promise<NextResponse>
) {
  return withErrorHandling(async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const { user, profile } = await requireEditorAuth(request);
    return handler(request, { user, profile }, ...args);
  });
}
