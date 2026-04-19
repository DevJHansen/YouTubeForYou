"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "../AuthShell";

export function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push(next);
      router.refresh();
    } else {
      setMessage("Check your email to confirm your account.");
    }
  }

  async function onGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <AuthShell title="Create account" subtitle="Free forever. Pro whenever.">
      <button className="btn-ghost auth-oauth" onClick={onGoogle} type="button">
        Continue with Google
      </button>
      <div className="auth-divider"><span>or</span></div>
      <form className="auth-form" onSubmit={onSubmit}>
        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-note">{message}</div>}
        <button className="btn-primary auth-submit" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="auth-alt">
        Already have an account?{" "}
        <Link href={`/auth/signin?next=${encodeURIComponent(next)}`}>Sign in</Link>
      </p>
    </AuthShell>
  );
}
