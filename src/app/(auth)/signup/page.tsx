"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCoach = searchParams.get("coach") === "1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${isCoach ? "/coach/onboarding" : "/app"}`,
        },
      });
      if (err) throw err;
      router.push(isCoach ? "/coach/onboarding" : "/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="font-heading font-extrabold text-2xl mb-2">Sign up</h1>
      <p className="text-text-dim text-sm mb-6">
        Create an account to save your plan and track progress.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input w-full"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input w-full"
            minLength={6}
            required
          />
        </div>
        {error && <div className="error-box">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="btn-form-next w-full py-3"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="text-text-dim text-sm mt-6 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-green hover:underline">
          Log in
        </Link>
      </p>
      <p className="text-text-dim text-sm mt-4 text-center">
        <Link href="/signup?coach=1" className="text-green hover:underline">
          I&apos;m a coach — sign up as coach
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-text-dim">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
