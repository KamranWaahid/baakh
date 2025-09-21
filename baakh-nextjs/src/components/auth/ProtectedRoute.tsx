"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'editor' | 'reviewer';
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'reviewer',
  fallback 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return fallback || (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Check role-based access
  const hasAccess = (() => {
    switch (requiredRole) {
      case 'admin':
        return user.is_admin;
      case 'editor':
        return user.is_admin || user.is_editor;
      case 'reviewer':
        return user.is_admin || user.is_editor || user.is_reviewer;
      default:
        return true;
    }
  })();

  if (!hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have the required permissions to access this page.
          </p>
          <p className="text-sm text-muted-foreground">
            Required role: <span className="font-medium">{requiredRole}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Your roles: {[
              user.is_admin && 'Admin',
              user.is_editor && 'Editor', 
              user.is_reviewer && 'Reviewer'
            ].filter(Boolean).join(', ')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
