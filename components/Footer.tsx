"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

export default function Footer() {
  const year = new Date().getFullYear();
  const { t, isRTL } = useLanguage();

  return (
    <footer className="responsive-pad" style={{
      background: "linear-gradient(to bottom, var(--dark-2), var(--dark))",
      borderTop: "1px solid rgba(220,202,187,0.1)",
      padding: "80px 60px 0",
      direction: isRTL ? "rtl" : "ltr",
    }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>

        {/* Top bar */}
        <div className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
              Maison Luxe
            </div>
            <p style={{ color: "var(--white-muted)", fontSize: "0.88rem", lineHeight: 1.85, marginBottom: "28px", maxWidth: "280px" }}>
              {t("footer_desc")}
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
            <h4 style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "22px", fontWeight: 500 }}>{t("footer_collection")}</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { key: "footer_all_fragrances", href: "/products" },
                { key: "footer_oud", href: "/category?cat=Oud%20%26%20Woody" },
                { key: "footer_floral", href: "/category?cat=Sweet%20%26%20Floral" },
                { key: "footer_citrus", href: "/category?cat=Fresh%20%26%20Citrus" },
                { key: "footer_oriental", href: "/category?cat=Oriental%20Spice" },
              ].map((l) => (
                <li key={l.key}>
                  <Link href={l.href} style={{ color: "var(--white-muted)", textDecoration: "none", fontSize: "0.88rem", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white-muted)")}
                  >{t(l.key)}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "22px", fontWeight: 500 }}>{t("footer_company")}</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { key: "footer_story", href: "/about" },
                { key: "footer_blog", href: "/blog" },
                { key: "footer_contact", href: "/contact" },
                { key: "footer_admin", href: "/dashboard" },
              ].map((l) => (
                <li key={l.key}>
                  <Link href={l.href} style={{ color: "var(--white-muted)", textDecoration: "none", fontSize: "0.88rem", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white-muted)")}
                  >{t(l.key)}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shopping */}
          <div>
            <h4 style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "22px", fontWeight: 500 }}>{t("footer_shopping")}</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { key: "footer_cart", href: "/cart" },
                { key: "footer_new", href: "/products" },
                { key: "footer_gifts", href: "/category" },
                { key: "footer_vip", href: "/contact" },
              ].map((l) => (
                <li key={l.key}>
                  <Link href={l.href} style={{ color: "var(--white-muted)", textDecoration: "none", fontSize: "0.88rem", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white-muted)")}
                  >{t(l.key)}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "22px", fontWeight: 500 }}>{t("footer_support")}</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { key: "footer_shipping_policy", href: "/contact#faq" },
                { key: "footer_returns", href: "/contact#faq" },
                { key: "footer_guide", href: "/blog" },
                { key: "footer_faq", href: "/contact#faq" },
              ].map((l) => (
                <li key={l.key}>
                  <Link href={l.href} style={{ color: "var(--white-muted)", textDecoration: "none", fontSize: "0.88rem", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white-muted)")}
                  >{t(l.key)}</Link>
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
            © {year} Maison Luxe. {t("footer_copyright")}
          </span>
          <div style={{ display: "flex", gap: "24px" }}>
            {(["footer_privacy", "footer_terms", "footer_cookies"] as const).map((key) => (
              <Link key={key} href="#" style={{ fontSize: "0.75rem", color: "rgba(220,202,187,0.4)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(220,202,187,0.4)")}
              >{t(key)}</Link>
            ))}
          </div>
          <span style={{ fontSize: "0.75rem", color: "rgba(220,202,187,0.3)" }}>
            {t("footer_made")}
          </span>
        </div>
      </div>
    </footer>
  );
}
