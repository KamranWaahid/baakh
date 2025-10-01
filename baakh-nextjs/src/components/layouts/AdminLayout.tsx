"use client";

import { ReactNode, useEffect, useCallback, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCSRF } from "@/hooks/useCSRF";
import MinimalSidebar from "@/components/ui/MinimalSidebar";
import { Toaster } from "sonner";
import "../../app/admin/admin.css";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { LogOut, User, Shield, Edit, Eye, Settings, Bell, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, error, signOut } = useAuth();
  const { csrfToken, loading: csrfLoading } = useCSRF();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recentlyVisibleRef = useRef<number>(Date.now());
  const firstLoadRef = useRef<boolean>(true);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

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

  // Page transition handling: keep sidebar/header static, animate and skeleton the content only
  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    setIsTransitioning(true);
    const timeout = setTimeout(() => setIsTransitioning(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname]);

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
    <div className="admin-minimal flex h-screen bg-gray-50">
      {/* CSRF Token Meta Tag */}
      {csrfToken && (
        <meta name="csrf-token" content={csrfToken} />
      )}
      
      <MinimalSidebar />
      <div className="flex flex-col flex-1 md:ml-[240px]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex h-14 items-center px-6 justify-between">
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <Logo size="md" className="text-gray-900" />
                <div>
                  <span className="text-base font-semibold text-gray-900 leading-tight">Baakh</span>
                  <p className="text-sm text-gray-500 leading-tight -mt-1">Poetry Archive</p>
                </div>
              </div>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-2">
            
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-gray-50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.avatar_url} alt={currentUser.display_name} />
                      <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
                        {currentUser.display_name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border-gray-200 shadow-lg" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-gray-900">{currentUser.display_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem 
                    className="text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 relative">
          {/* Animated page content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* Lightweight skeleton overlay during route transitions (after first load only) */}
          {isTransitioning && (
            <div className="absolute inset-0 bg-transparent pointer-events-none z-0">
              <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
} 