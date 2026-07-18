"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useCart } from "@/app/context/CartContext";
import { useLanguage } from "@/app/context/LanguageContext";

function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { t, lang, isRTL, toggleLang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Optimize scroll listener with requestAnimationFrame for performance
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Memoize links to prevent unnecessary recalculation
  const links = useMemo(() => [
    { name: t("nav_home"), href: "/" },
    { name: t("nav_products"), href: "/products" },
    { name: t("nav_collection"), href: "/category" },
    { name: t("nav_finder"), href: "/fragrance-finder" },
    { name: t("nav_about"), href: "/about" },
    { name: t("nav_blog"), href: "/blog" },
    { name: t("nav_contact"), href: "/contact" },
  ], [t]);

  // Memoize handlers
  const handleToggleMobile = useCallback(() => setMobileOpen(prev => !prev), []);
  const handleCloseMobile = useCallback(() => setMobileOpen(false), []);
  const handleToggleLang = useCallback(() => { toggleLang(); }, [toggleLang]);
  const handleToggleLangMobile = useCallback(() => { toggleLang(); setMobileOpen(false); }, [toggleLang]);

  return (
    <>
      <header className="header-container">
        {/* ─── ANNOUNCEMENT BAR ─── */}
        <div className="announcement-bar">
          {/* Track always scrolls LTR - text inside renders naturally in its own direction */}
          <div className="announcement-track">
            {/* Group 1 */}
            <div className="announcement-group">
              <span className="announcement-item">{t("ann_1")}</span>
              <span className="announcement-item">{t("ann_2")}</span>
              <span className="announcement-item">{t("ann_3")}</span>
            </div>
            {/* Group 2 — exact clone for seamless loop */}
            <div className="announcement-group">
              <span className="announcement-item">{t("ann_1")}</span>
              <span className="announcement-item">{t("ann_2")}</span>
              <span className="announcement-item">{t("ann_3")}</span>
            </div>
          </div>
        </div>

        {/* ─── NAVBAR ─── */}
        <nav className={`navbar${scrolled ? " navbar-scrolled" : ""}`}>
          <Link href="/" className="navbar-brand">
            <span className="navbar-brand-icon" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/camel-icon.png" 
                alt="" 
                className="camel-icon"
                loading="lazy"
                width={48}
                height={48}
              />
            </span>
            <span className="navbar-brand-text">Nubia</span>
          </Link>

          {/* Desktop links */}
          <ul className="navbar-links">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    style={isActive ? { color: "var(--gold)" } : {}}
                  >
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
              onClick={handleToggleLang}
              className="lang-toggle-btn"
              aria-label="Toggle language"
              title={lang === "en" ? "Switch to Arabic" : "Switch to English"}
            >
              <span className="lang-toggle-icon">🌐</span>
              <span className="lang-toggle-text">{t("lang_btn")}</span>
            </button>

            <Link href="/cart" className="cart-icon-btn" aria-label="Cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>

            {/* Hamburger */}
            <button
              className={`hamburger${mobileOpen ? " open" : ""}`}
              onClick={handleToggleMobile}
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
      <div className={`mobile-drawer${mobileOpen ? " mobile-drawer-open" : ""}`}>
        <div className="mobile-drawer-inner">

          {/* Header row: brand + close button */}
          <div className="mobile-drawer-header">
            <div className="mobile-drawer-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/camel-icon.png" 
                alt="" 
                className="camel-icon-mobile"
                loading="lazy"
                width={42}
                height={42}
              />
              Nubia
            </div>
            <button
              className="mobile-drawer-close"
              onClick={handleCloseMobile}
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <ul className="mobile-nav-links">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`mobile-nav-link${pathname === link.href ? " active" : ""}`}
                  onClick={handleCloseMobile}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="mobile-drawer-actions">
            <button
              onClick={handleToggleLangMobile}
              className="lang-toggle-btn-mobile"
              aria-label="Toggle language"
            >
              🌐 {t("lang_btn")}
            </button>
            <Link 
              href="/cart" 
              className="btn-primary" 
              style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}
              onClick={handleCloseMobile}
            >
              🛍 {t("nav_cart")} {totalItems > 0 && `(${totalItems})`}
            </Link>
            <Link 
              href="/dashboard" 
              className="btn-gold-outline" 
              style={{ textAlign: "center" }}
              onClick={handleCloseMobile}
            >
              {t("nav_dashboard")}
            </Link>
          </div>

        </div>
      </div>
      {/* Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={handleCloseMobile} />
      )}
    </>
  );
}

export default memo(Navbar);
