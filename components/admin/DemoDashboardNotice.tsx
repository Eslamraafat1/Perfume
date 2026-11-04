"use client";

import Link from "next/link";
import Image from "next/image";
import { useProducts } from "@/app/context/ProductContext";

/** Read-only dashboard shown when Supabase is not configured (demo catalogue). */
export default function DemoDashboardNotice() {
  const { products } = useProducts();

  return (
    <main style={{ minHeight: "100vh", padding: "48px 16px", background: "var(--black)", color: "var(--white)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div className="dashboard-card" data-testid="demo-dashboard-notice">
          <h1 className="dashboard-card-title">Dashboard · Demo catalogue (read-only)</h1>
          <p className="dashboard-card-subtitle" style={{ lineHeight: 1.7 }}>
            Supabase is not configured for this deployment, so the store shows its bundled demo
            catalogue and editing is disabled. To manage real products, connect a Supabase project
            (set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,
            run <code>supabase-setup.sql</code> and create an admin user, as described in the README),
            then sign in at <code>/dashboard/login</code>.
          </p>
          <Link href="/" className="btn-reset" style={{ display: "inline-block", textDecoration: "none" }}>
            ← View store
          </Link>
        </div>

        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Demo products ({products.length})</h2>
          <ul style={{ listStyle: "none", display: "grid", gap: "12px", marginTop: "16px" }}>
            {products.map((p) => (
              <li key={p.id} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <Image src={p.image_url} alt={p.name} width={48} height={48} style={{ borderRadius: "8px", objectFit: "cover" }} />
                <Link href={`/product/${p.id}`} style={{ color: "var(--white)", flex: 1 }}>{p.name}</Link>
                <span style={{ color: "var(--white-muted)", fontSize: "0.85rem" }}>{p.category}</span>
                <span style={{ color: "var(--gold)" }}>{p.price.toLocaleString()} EGP</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
