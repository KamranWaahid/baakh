"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function TestAuthPage() {
  const [authState, setAuthState] = useState<string>("Loading...");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const testAuth = async () => {
      try {
        setAuthState("Testing authentication...");
        
        // Test 1: Check if Supabase client is working
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          setAuthState(`User error: ${userError.message}`);
          return;
        }
        
        if (!currentUser) {
          setAuthState("No user found - not authenticated");
          return;
        }
        
        setUser(currentUser);
        setAuthState(`User found: ${currentUser.email}`);
        
        // Test 2: Try to call the auth API
        try {
          const response = await fetch('/api/auth/me', { 
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            setAuthState(`API error: ${response.status} - ${errorText}`);
            return;
          }
          
          const data = await response.json();
          setProfile(data);
          setAuthState(`API success: allowed=${data.allowed}`);
          
        } catch (apiError: any) {
          setAuthState(`API call failed: ${apiError.message}`);
        }
        
      } catch (error: any) {
        setAuthState(`General error: ${error.message}`);
      }
    };

    testAuth();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Authentication Test</h1>
        
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <p className="text-muted-foreground">{authState}</p>
        </div>

        {user && (
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">User Info</h2>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        {profile && (
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Profile Info</h2>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/admin/login'}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Go to Login Page
            </button>
            <br />
            <button 
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
