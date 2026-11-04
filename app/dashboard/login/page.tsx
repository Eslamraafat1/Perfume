"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Admin sign-in (Supabase Auth, email + password).
 * Accounts are created in the Supabase dashboard (Authentication → Users) and
 * promoted to admin by adding them to public.admin_users — see the README.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Invalid email or password.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the authentication server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px 16px",
        background: "var(--black)",
        color: "var(--white)",
      }}
    >
      <div className="dashboard-card" style={{ width: "100%", maxWidth: "420px", margin: 0 }}>
        <h1 className="dashboard-card-title">Admin sign in</h1>
        <p className="dashboard-card-subtitle">Nubia store administration</p>

        {!supabase ? (
          <p style={{ color: "var(--white-muted)", lineHeight: 1.6 }}>
            Sign-in is unavailable because Supabase is not configured. The store is running on its
            demo catalogue. <Link href="/dashboard" style={{ color: "var(--gold)" }}>Open the read-only dashboard</Link>.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label" htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                className="form-input"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label" htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                className="form-input"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "16px" }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn-submit" disabled={submitting} style={{ width: "100%" }}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        <p style={{ marginTop: "24px", fontSize: "0.8rem" }}>
          <Link href="/" style={{ color: "var(--white-muted)" }}>← Back to the store</Link>
        </p>
      </div>
    </main>
  );
}
