"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
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
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Collection", href: "/category" },
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="header-container">
        {/* ─── ANNOUNCEMENT BAR ─── */}
        <div className="announcement-bar">
          <div className="announcement-track">
            <div className="announcement-item">✦ 10% OFF YOUR FIRST ORDER | USE CODE: LUXE10 ✦</div>
            <div className="announcement-item">✦ FREE SHIPPING ON ALL EGYPTIAN ORDERS ABOVE 1500 EGP ✦</div>
            <div className="announcement-item">✦ EXPERIENCE THE ART OF INVISIBLE BEAUTY ✦</div>
            <div className="announcement-item">✦ 10% OFF YOUR FIRST ORDER | USE CODE: LUXE10 ✦</div>
            <div className="announcement-item">✦ FREE SHIPPING ON ALL EGYPTIAN ORDERS ABOVE 1500 EGP ✦</div>
            <div className="announcement-item">✦ EXPERIENCE THE ART OF INVISIBLE BEAUTY ✦</div>
          </div>
        </div>

        {/* ─── NAVBAR ─── */}
        <nav className={`navbar${scrolled ? " navbar-scrolled" : ""}`}>
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
              <Link href="/dashboard" className="navbar-cta">Dashboard</Link>
            </li>
          </ul>

          {/* Right side: Cart + Hamburger */}
          <div className="navbar-right">
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
      <div className={`mobile-drawer${mobileOpen ? " mobile-drawer-open" : ""}`}>
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
            <Link href="/cart" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
              🛍 View Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
            <Link href="/dashboard" className="btn-gold-outline" style={{ textAlign: "center", marginTop: "12px" }}>
              Dashboard
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
