"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import { useLanguage } from "@/app/context/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { t, lang, isRTL, toggleLang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const links = [
    { name: t("nav_home"), href: "/" },
    { name: t("nav_products"), href: "/products" },
    { name: t("nav_collection"), href: "/category" },
    { name: t("nav_about"), href: "/about" },
    { name: t("nav_blog"), href: "/blog" },
    { name: t("nav_contact"), href: "/contact" },
  ];

  return (
    <>
      <header className="header-container">
        {/* ─── ANNOUNCEMENT BAR ─── */}
        <div className="announcement-bar">
          <div className="announcement-track" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            <div className="announcement-item">{t("ann_1")}</div>
            <div className="announcement-item">{t("ann_2")}</div>
            <div className="announcement-item">{t("ann_3")}</div>
            <div className="announcement-item">{t("ann_1")}</div>
            <div className="announcement-item">{t("ann_2")}</div>
            <div className="announcement-item">{t("ann_3")}</div>
          </div>
        </div>

        {/* ─── NAVBAR ─── */}
        <nav className={`navbar${scrolled ? " navbar-scrolled" : ""}`} style={{ direction: isRTL ? "rtl" : "ltr" }}>
          <Link href="/" className="navbar-brand">
            Maison<span> Luxe</span>
          </Link>

          {/* Desktop links */}
          <ul className="navbar-links">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link href={link.href} style={isActive ? { color: "var(--gold)" } : {}}>
                    {link.name}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/dashboard" className="navbar-cta">{t("nav_dashboard")}</Link>
            </li>
          </ul>

          {/* Right side: Lang Toggle + Cart + Hamburger */}
          <div className="navbar-right">

            {/* Language Toggle Button */}
            <button
              onClick={toggleLang}
              className="lang-toggle-btn"
              aria-label="Toggle language"
              title={lang === "en" ? "Switch to Arabic" : "Switch to English"}
            >
              <span className="lang-toggle-icon">{lang === "en" ? "🌐" : "🌐"}</span>
              <span className="lang-toggle-text">{t("lang_btn")}</span>
            </button>

            <Link href="/cart" className="cart-icon-btn" aria-label="Cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>

            {/* Hamburger */}
            <button
              className={`hamburger${mobileOpen ? " open" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>
      </header>

      {/* ─── MOBILE DRAWER ─── */}
      <div className={`mobile-drawer${mobileOpen ? " mobile-drawer-open" : ""}`} style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <div className="mobile-drawer-inner">
          <div className="mobile-drawer-brand">Maison Luxe</div>
          <ul className="mobile-nav-links">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`mobile-nav-link${pathname === link.href ? " active" : ""}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mobile-drawer-actions">
            {/* Mobile Language Toggle */}
            <button
              onClick={() => { toggleLang(); setMobileOpen(false); }}
              className="lang-toggle-btn-mobile"
              aria-label="Toggle language"
            >
              🌐 {t("lang_btn")}
            </button>
            <Link href="/cart" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
              🛍 {t("nav_cart")} {totalItems > 0 && `(${totalItems})`}
            </Link>
            <Link href="/dashboard" className="btn-gold-outline" style={{ textAlign: "center", marginTop: "12px" }}>
              {t("nav_dashboard")}
            </Link>
          </div>
        </div>
      </div>
      {/* Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
