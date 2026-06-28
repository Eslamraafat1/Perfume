"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: "linear-gradient(to bottom, var(--dark-2), var(--dark))",
      borderTop: "1px solid rgba(220,202,187,0.1)",
      padding: "80px 60px 0",
    }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>

        {/* Top bar */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "50px", marginBottom: "70px", flexWrap: "wrap" }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
              Maison Luxe
            </div>
            <p style={{ color: "var(--white-muted)", fontSize: "0.88rem", lineHeight: 1.85, marginBottom: "28px", maxWidth: "280px" }}>
              Fine fragrances crafted for those who appreciate the extraordinary. Every bottle tells an olfactory story of passion, luxury, and invisible beauty.
            </p>
            {/* Social */}
            <div style={{ display: "flex", gap: "12px" }}>
              {[
                { label: "Instagram", icon: "📸" },
                { label: "TikTok", icon: "🎵" },
                { label: "WhatsApp", icon: "💬" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  style={{
                    width: "38px", height: "38px",
                    border: "1px solid rgba(220,202,187,0.2)",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(220,202,187,0.08)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.2)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Collection */}
          <div>
            <h4 style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "22px", fontWeight: 500 }}>Collection</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "All Fragrances", href: "/products" },
                { label: "Oud & Woody", href: "/category?cat=Oud%20%26%20Woody" },
                { label: "Sweet & Floral", href: "/category?cat=Sweet%20%26%20Floral" },
                { label: "Fresh & Citrus", href: "/category?cat=Fresh%20%26%20Citrus" },
                { label: "Oriental Spice", href: "/category?cat=Oriental%20Spice" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} style={{ color: "var(--white-muted)", textDecoration: "none", fontSize: "0.88rem", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white-muted)")}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "22px", fontWeight: 500 }}>Company</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Our Story", href: "/about" },
                { label: "Perfume Blog", href: "/blog" },
                { label: "Contact Us", href: "/contact" },
                { label: "Admin Dashboard", href: "/dashboard" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} style={{ color: "var(--white-muted)", textDecoration: "none", fontSize: "0.88rem", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white-muted)")}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shopping */}
          <div>
            <h4 style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "22px", fontWeight: 500 }}>Shopping</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "My Cart", href: "/cart" },
                { label: "New Arrivals", href: "/products" },
                { label: "Gift Ideas", href: "/category" },
                { label: "VIP Consultation", href: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} style={{ color: "var(--white-muted)", textDecoration: "none", fontSize: "0.88rem", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white-muted)")}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "22px", fontWeight: 500 }}>Support</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Shipping Policy", href: "/contact#faq" },
                { label: "Returns & Refunds", href: "/contact#faq" },
                { label: "Fragrance Guide", href: "/blog" },
                { label: "FAQ", href: "/contact#faq" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} style={{ color: "var(--white-muted)", textDecoration: "none", fontSize: "0.88rem", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white-muted)")}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(220,202,187,0.15), transparent)", marginBottom: "28px" }} />

        {/* Bottom bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", flexWrap: "wrap", gap: "16px" }}>
          <span style={{ fontSize: "0.78rem", color: "rgba(220,202,187,0.4)" }}>
            © {year} Maison Luxe. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
              <Link key={t} href="#" style={{ fontSize: "0.75rem", color: "rgba(220,202,187,0.4)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(220,202,187,0.4)")}
              >{t}</Link>
            ))}
          </div>
          <span style={{ fontSize: "0.75rem", color: "rgba(220,202,187,0.3)" }}>
            Crafted with ♥ for fragrance lovers · Egypt
          </span>
        </div>
      </div>
    </footer>
  );
}
