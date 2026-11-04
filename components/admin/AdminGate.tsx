"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireSupabase } from "@/lib/supabase";

type GateState = { status: "checking" } | { status: "admin"; email: string } | { status: "forbidden"; email: string };

/**
 * Client-side admin check for the dashboard UI. proxy.ts already redirects
 * visitors without a session; this additionally confirms the signed-in user is an
 * admin (public.is_admin()) before showing any editing UI. The real enforcement
 * is Row Level Security in Postgres — this only avoids showing forms that would fail.
 */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GateState>({ status: "checking" });

  useEffect(() => {
    const supabase = requireSupabase();
    let active = true;

    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user) {
        router.replace("/dashboard/login");
        return;
      }
      const email = data.user.email ?? "";
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (!active) return;
      setState(isAdmin === true ? { status: "admin", email } : { status: "forbidden", email });
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/dashboard/login");
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    await requireSupabase().auth.signOut();
    router.replace("/dashboard/login");
    router.refresh();
  };

  if (state.status === "checking") {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--black)", color: "var(--white-muted)" }}>
        <p role="status">Checking your access…</p>
      </main>
    );
  }

  if (state.status === "forbidden") {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px 16px", background: "var(--black)", color: "var(--white)" }}>
        <div className="dashboard-card" style={{ maxWidth: "460px", margin: 0 }}>
          <h1 className="dashboard-card-title">Not authorised</h1>
          <p className="dashboard-card-subtitle" style={{ lineHeight: 1.6 }}>
            {state.email || "This account"} is signed in but is not an admin of this store.
          </p>
          <button type="button" className="btn-reset" onClick={signOut}>Sign out</button>
        </div>
      </main>
    );
  }

  return (
    <>
      {children}
      <button
        type="button"
        onClick={signOut}
        className="btn-reset"
        title={`Signed in as ${state.email}`}
        style={{ position: "fixed", right: "16px", bottom: "16px", zIndex: 1000, padding: "8px 16px", fontSize: "0.75rem" }}
      >
        Sign out
      </button>
    </>
  );
}
