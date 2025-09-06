"use client";

import { ReactNode, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import CustomSidebar from "@/components/ui/CustomSidebar";
import { Toaster } from "sonner";
import "../../app/admin/admin.css";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield, Edit, Eye, Settings, Bell } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, loading, error, signOut } = useAuth();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recentlyVisibleRef = useRef<number>(Date.now());

  // Memoize the logout handler to prevent unnecessary re-renders
  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [signOut]);

  // Track visibility to avoid disruptive redirects on tab switching
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        recentlyVisibleRef.current = Date.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Gentle redirect to login if unauthenticated; avoid triggering immediately after tab focus
  useEffect(() => {
    const shouldRedirect = !loading && !user;
    const msSinceVisible = Date.now() - (recentlyVisibleRef.current || 0);
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    if (shouldRedirect) {
      const delay = msSinceVisible < 1500 ? 1500 - msSinceVisible : 0;
      redirectTimeoutRef.current = setTimeout(() => {
        // re-check before redirect
        if (!loading && !user) {
          console.log('AdminLayout: Redirecting to login - no user');
          router.replace('/admin/login');
        }
      }, Math.max(500, delay));
    }
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [user, loading, router]);

  // Redirect to login if there's an auth error - only run once when error changes
  useEffect(() => {
    if (error) {
      console.log('AdminLayout: Redirecting to login - auth error:', error);
      router.replace('/admin/login');
    }
  }, [error, router]);

  // Debug logging
  useEffect(() => {
    console.log('AdminLayout: Auth state changed - user:', !!user, 'loading:', loading, 'error:', error);
  }, [user, loading, error]);

  // Memoize the loading state to prevent unnecessary re-renders
  const isLoading = useMemo(() => loading, [loading]);
  const hasUser = useMemo(() => !!user, [user]);
  const hasError = useMemo(() => !!error, [error]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9F9F9]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#E5E5E5] rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9F9F9]">
        <div className="text-center max-w-md mx-auto p-8 space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#1F1F1F]">Authentication Error</h1>
            <p className="text-base text-[#6B6B6B]">{error}</p>
          </div>
          <Button onClick={() => router.push('/admin/login')} className="bg-[#1F1F1F] hover:bg-[#404040] text-white px-6 py-2 rounded-lg">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!hasUser) {
    return null;
  }

  // At this point, user is guaranteed to be non-null
  const currentUser = user!;

  return (
    <div className="flex h-screen bg-[#F9F9F9]">
      <CustomSidebar />
      <div className="flex flex-col flex-1 md:ml-[272px]">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-30">
          <div className="flex h-16 items-center px-6 justify-between">
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#F4F4F5] rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[#1F1F1F]" />
                </div>
                <div>
                  <span className="text-base font-medium text-[#1F1F1F]">Admin Dashboard</span>
                  <p className="text-sm text-[#6B6B6B]">Poetry Archive Management</p>
                </div>
              </div>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative hover:bg-[#F4F4F5]">
                <Bell className="w-4 h-4 text-[#6B6B6B]" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-[#F4F4F5]">
                <Settings className="w-4 h-4 text-[#6B6B6B]" />
              </Button>
            
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-3 rounded-lg hover:bg-[#F4F4F5]">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={currentUser.avatar_url} alt={currentUser.display_name} />
                      <AvatarFallback className="bg-[#F4F4F5] text-[#1F1F1F] font-medium">
                        {currentUser.display_name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-[#1F1F1F]">{currentUser.display_name || 'User'}</p>
                      <p className="text-xs text-[#6B6B6B]">{currentUser.email}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-0 border border-[#E5E5E5] shadow-lg" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-4 border-b border-[#E5E5E5]">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-semibold leading-none text-[#1F1F1F]">{currentUser.display_name || 'User'}</p>
                      <p className="text-xs leading-none text-[#6B6B6B]">{currentUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  
                  {/* Role Badges */}
                  <div className="px-4 py-3 border-b border-[#E5E5E5]">
                    <div className="flex flex-wrap gap-2">
                      {currentUser.is_admin && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </span>
                      )}
                      {currentUser.is_editor && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <Edit className="w-3 h-3 mr-1" />
                          Editor
                        </span>
                      )}
                      {currentUser.is_reviewer && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <Eye className="w-3 h-3 mr-1" />
                          Reviewer
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <DropdownMenuItem className="px-4 py-3 cursor-pointer hover:bg-[#F4F4F5]">
                    <User className="mr-2 h-4 w-4 text-[#6B6B6B]" />
                    <span className="text-sm text-[#1F1F1F]">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-3 cursor-pointer hover:bg-[#F4F4F5]">
                    <Settings className="mr-2 h-4 w-4 text-[#6B6B6B]" />
                    <span className="text-sm text-[#1F1F1F]">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#E5E5E5]" />
                  <DropdownMenuItem onClick={handleLogout} className="px-4 py-3 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="text-sm">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
} 