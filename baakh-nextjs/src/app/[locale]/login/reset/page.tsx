"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    // Ensure session established from recovery link hash
    supabase.auth.getSession().finally(() => setReady(true));
  }, []);

  const strong = (pw: string) => {
    return pw.length >= 12 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setOk(null);
    if (pw1 !== pw2) { setError("Passwords do not match"); return; }
    if (!strong(pw1)) { setError("Password must be 12+ chars with upper, lower, number, symbol"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      setOk("Password updated. Redirecting to login…");
      setTimeout(()=> router.replace("/admin/login"), 1200);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || "Failed to update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl ring-1 ring-border/60 bg-card/60">
        <CardHeader>
          <div className="flex items-center gap-2"><Badge variant="secondary" className="rounded-full">Security</Badge></div>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Set a strong password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <div className="text-sm text-muted-foreground">Preparing…</div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm">New password</label>
                <Input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="mt-2" placeholder="••••••••••" />
                <div className="text-xs text-muted-foreground mt-1">12+ chars, upper/lowercase, number, symbol</div>
              </div>
              <div>
                <label className="text-sm">Confirm password</label>
                <Input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="mt-2" placeholder="••••••••••" />
              </div>
              {error && <div className="text-xs text-destructive">{error}</div>}
              {ok && <div className="text-xs text-emerald-600">{ok}</div>}
              <div className="flex items-center justify-end gap-2">
                <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


