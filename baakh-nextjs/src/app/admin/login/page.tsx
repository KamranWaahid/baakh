"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Shield, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle2,
  Building2,
  Users,
  Settings,
  Database,
  Key,
  Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Check for URL parameters on mount
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError('You do not have permission to access the admin area. Please contact an administrator.');
    }
  }, [searchParams]);

  // Simple local lockout after repeated failures
  const LOCK_KEY = "admin_login_lock_until";
  const ATTEMPTS_KEY = "admin_login_attempts";
  const MAX_ATTEMPTS = 5;
  const LOCK_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  const [isLocked, setIsLocked] = useState(false);
  
  // Check lockout status on mount and periodically (client-side only)
  useEffect(() => {
    const checkLockStatus = () => {
      const lockedUntil = localStorage.getItem(LOCK_KEY);
      if (lockedUntil) {
        const isCurrentlyLocked = Date.now() < Number(lockedUntil);
        setIsLocked(isCurrentlyLocked);
        
        // If still locked, check again in 1 minute
        if (isCurrentlyLocked) {
          setTimeout(checkLockStatus, 60000);
        }
      }
    };
    
    checkLockStatus();
  }, []);

  useEffect(() => {
    if (isLocked) {
      const lockedUntil = localStorage.getItem(LOCK_KEY);
      if (lockedUntil) {
        const remaining = Math.max(0, Number(lockedUntil) - Date.now());
        setInfo(`Too many attempts. Try again in ${Math.ceil(remaining/60000)} min.`);
      }
    }
  }, [isLocked]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if user has admin access
          const response = await fetch('/api/auth/me');
          if (response.ok) {
            const profileData = await response.json();
            if (profileData.allowed) {
              router.replace('/admin');
            }
          }
        }
      } catch (error) {
        // Ignore errors during auth check
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    setLoading(true);
    setError(null);
    setInfo(null);
    
    try {
      console.log('🔐 Attempting sign in with email:', email);
      
      const { data, error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) {
        console.error('❌ Sign in error:', signErr);
        throw signErr;
      }
      
      const user = data.user;
      if (!user) {
        console.error('❌ No user returned from sign in');
        throw new Error("Authentication failed");
      }

      console.log('✅ User signed in successfully:', user.id);
      console.log('🔍 Verifying admin access...');

      // Use service-backed API to verify admin access
      const resp = await fetch('/api/auth/me', { 
        cache: 'no-store',
        credentials: 'include' // Ensure cookies are sent
      });
      
      console.log('📡 API response status:', resp.status);
      
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('❌ API error response:', errorText);
        throw new Error(errorText || 'Failed to verify access');
      }
      
      const api = await resp.json();
      console.log('📋 API response data:', api);
      
      const allowed = Boolean(api?.allowed);
      console.log('🔐 Access allowed:', allowed);
      
      if (!allowed) {
        console.error('❌ Access denied for user');
        await supabase.auth.signOut();
        throw new Error("You do not have permission to access the admin area. Please contact an administrator.");
      }
      
      console.log('✅ Admin access verified, redirecting...');
      
      // Clear any stored error messages
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCK_KEY);
      setIsLocked(false);
      
      router.replace('/admin');
    } catch (err: any) {
      console.error('❌ Login error:', err);
      const errorMessage = err?.message || 'Sign in failed';
      setError(errorMessage);
      
      try {
        const raw = localStorage.getItem(ATTEMPTS_KEY);
        const attempts = raw ? Number(raw) + 1 : 1;
        localStorage.setItem(ATTEMPTS_KEY, String(attempts));
        
        if (attempts >= MAX_ATTEMPTS) {
          const lockUntil = Date.now() + LOCK_WINDOW_MS;
          localStorage.setItem(LOCK_KEY, String(lockUntil));
          setIsLocked(true);
          setInfo('Too many failed attempts. Account locked for 15 minutes.');
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setInfo('Please enter your email address first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setInfo(null);
      
      await supabase.auth.resetPasswordForEmail(email, { 
        redirectTo: `${window.location.origin}/login/reset` 
      });
      
      setInfo('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Login Form */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gray-100 border border-gray-300">
                <Shield className="h-7 w-7 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-black">
                  Admin Access
                </h1>
                <p className="text-base text-gray-600">
                  Sign in to your admin dashboard
                </p>
              </div>
            </div>
          </div>

          <Card className="border border-gray-200 bg-white rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-col space-y-2 pb-6 px-8 pt-8">
              <CardTitle className="text-2xl font-semibold tracking-tight text-black">
                Welcome back
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Enter your credentials to access the admin panel
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 pt-0 space-y-6 px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Field */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 h-12 rounded-2xl border border-gray-300 bg-white focus:bg-white focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all duration-200 text-base placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-sm text-black hover:text-gray-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pl-12 pr-12 h-12 rounded-2xl border border-gray-300 bg-white focus:bg-white focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all duration-200 text-base placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || isLocked}
                  className="w-full h-12 rounded-2xl bg-black hover:bg-gray-800 text-white font-semibold text-base transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5" />
                      Sign in
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Error/Info Messages */}
              {error && (
                <Alert className="rounded-2xl border border-gray-200 bg-gray-50 text-gray-700">
                  <AlertCircle className="h-5 w-5 text-black" />
                  <AlertDescription className="text-sm font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {info && (
                <Alert className="rounded-2xl border border-gray-200 bg-gray-50 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-black" />
                  <AlertDescription className="text-sm font-medium">
                    {info}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Back to Site Link */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to site
            </Link>
          </div>
        </div>

        {/* Right Side - Admin Panel Preview */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-black">
              Admin Dashboard
            </h2>
            <p className="text-base text-gray-600">
              Access powerful tools for managing your platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* User Management */}
            <Card className="border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 rounded-2xl overflow-hidden group hover:scale-[1.02]">
              <CardContent className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-300">
                    <Users className="h-5 w-5 text-black" />
                  </div>
                  <h3 className="tracking-tight text-sm font-semibold text-black">User Management</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Manage user accounts, roles, and permissions
                </p>
              </CardContent>
            </Card>

            {/* Content Control */}
            <Card className="border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 rounded-2xl overflow-hidden group hover:scale-[1.02]">
              <CardContent className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-300">
                    <Database className="h-5 w-5 text-black" />
                  </div>
                  <h3 className="tracking-tight text-sm font-semibold text-black">Content Control</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Manage poetry, categories, and editorial content
                </p>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card className="border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 rounded-2xl overflow-hidden group hover:scale-[1.02]">
              <CardContent className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-300">
                    <Settings className="h-5 w-5 text-black" />
                  </div>
                  <h3 className="tracking-tight text-sm font-semibold text-black">System Settings</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Configure platform settings and integrations
                </p>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 rounded-2xl overflow-hidden group hover:scale-[1.02]">
              <CardContent className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-300">
                    <Sparkles className="h-5 w-5 text-black" />
                  </div>
                  <h3 className="tracking-tight text-sm font-semibold text-black">Analytics</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  View platform insights and user analytics
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator className="bg-gray-200 h-px" />

          {/* Security Badges */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="rounded-full text-xs px-3 py-1.5 bg-gray-100 border border-gray-300 text-black font-medium">
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Secure Access
              </Badge>
              <Badge className="rounded-full text-xs px-3 py-1.5 border-gray-200 bg-white text-gray-600 font-medium">
                Role-based
              </Badge>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              The admin panel provides secure, role-based access to platform management tools. 
              All actions are logged and audited for security compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


