"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/app/context/CartContext";
import gsap from "gsap";

export default function CartPage() {
  const { items, totalItems, totalPrice, removeFromCart, updateQty, clearCart } = useCart();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".cart-page-title",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
      gsap.fromTo(".cart-item",
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.7, stagger: 0.1, ease: "power2.out", delay: 0.3 }
      );
      gsap.fromTo(".cart-summary-panel",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", delay: 0.5 }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [items]);

  return (
    <div ref={pageRef} style={{ background: "var(--black)", color: "var(--white)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero strip */}
      <section style={{
        background: "linear-gradient(135deg, var(--dark-3) 0%, var(--dark) 100%)",
        padding: "140px 60px 60px",
        borderBottom: "1px solid rgba(220,202,187,0.12)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <span className="section-tag" style={{ color: "var(--gold)", letterSpacing: "0.3em" }}>✦ Your Selection</span>
          <h1 className="cart-page-title" style={{
            fontFamily: "var(--font-title)",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            textTransform: "uppercase",
            marginTop: "12px",
            lineHeight: 1.1
          }}>
            Shopping Cart
          </h1>
          <p style={{ color: "var(--white-muted)", marginTop: "16px", fontSize: "0.95rem" }}>
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems > 1 ? "s" : ""} selected`}
          </p>
        </div>
      </section>

      <section className="responsive-pad" style={{ padding: "60px 60px 120px", maxWidth: "1200px", margin: "0 auto" }}>
        {items.length === 0 ? (
          /* ─── EMPTY STATE ─── */
          <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <div style={{ fontSize: "5rem", marginBottom: "24px", opacity: 0.3 }}>🛍</div>
            <h2 style={{ fontFamily: "var(--font-title)", fontSize: "2rem", marginBottom: "16px" }}>
              No Fragrances Selected
            </h2>
            <p style={{ color: "var(--white-muted)", marginBottom: "40px", fontSize: "0.95rem" }}>
              Discover our luxury collection and add your perfect scent.
            </p>
            <Link href="/category" className="btn-primary">
              Explore Collection
            </Link>
          </div>
        ) : (
          /* ─── CART GRID ─── */
          <div className="cart-layout">
            {/* LEFT: Items */}
            <div className="cart-items-col">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", paddingBottom: "20px", borderBottom: "1px solid rgba(220,202,187,0.1)" }}>
                <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.4rem" }}>Your Items</h2>
                <button
                  onClick={clearCart}
                  style={{ background: "none", border: "1px solid rgba(220,50,50,0.3)", color: "#e05252", padding: "8px 20px", borderRadius: "40px", cursor: "pointer", fontSize: "0.78rem", letterSpacing: "0.1em", transition: "var(--transition)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,50,50,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  Clear All
                </button>
              </div>

              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="cart-item">
                  <div className="cart-item-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt={item.name} />
                  </div>
                  <div className="cart-item-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                          {item.category || "Luxury Fragrance"}
                        </span>
                        <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", margin: "4px 0 6px" }}>
                          {item.name}
                        </h3>
                        <span style={{ fontSize: "0.8rem", color: "var(--white-muted)", background: "rgba(220,202,187,0.08)", border: "1px solid rgba(220,202,187,0.15)", padding: "3px 12px", borderRadius: "20px" }}>
                          {item.size}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="cart-remove-btn"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="cart-item-footer">
                      {/* Quantity control */}
                      <div className="qty-control">
                        <button onClick={() => updateQty(item.id, item.quantity - 1, item.size)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1, item.size)}>+</button>
                      </div>
                      <span style={{ fontFamily: "var(--font-serif)", color: "var(--gold)", fontSize: "1.2rem", fontWeight: 600 }}>
                        {(item.price * item.quantity).toLocaleString()} EGP
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Summary */}
            <div className="cart-summary-panel">
              <div className="glass-panel" style={{ padding: "36px" }}>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.3rem", marginBottom: "28px", borderBottom: "1px solid rgba(220,202,187,0.1)", paddingBottom: "16px" }}>
                  Order Summary
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--white-muted)" }}>
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{totalPrice.toLocaleString()} EGP</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--white-muted)" }}>
                    <span>Shipping</span>
                    <span style={{ color: totalPrice >= 1500 ? "#4caf50" : "inherit" }}>
                      {totalPrice >= 1500 ? "Free ✓" : "80 EGP"}
                    </span>
                  </div>
                  {totalPrice < 1500 && (
                    <div style={{ background: "rgba(220,202,187,0.06)", border: "1px solid rgba(220,202,187,0.1)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.8rem", color: "var(--gold)" }}>
                      Add {(1500 - totalPrice).toLocaleString()} EGP more for free shipping!
                    </div>
                  )}
                  <div style={{ borderTop: "1px solid rgba(220,202,187,0.12)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-title)", fontSize: "1rem" }}>Total</span>
                    <span style={{ fontFamily: "var(--font-serif)", color: "var(--gold)", fontSize: "1.5rem", fontWeight: 700 }}>
                      {(totalPrice + (totalPrice >= 1500 ? 0 : 80)).toLocaleString()} EGP
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="btn-primary"
                  style={{ display: "flex", width: "100%", justifyContent: "center", padding: "18px", fontSize: "0.9rem", marginBottom: "12px", textDecoration: "none", textAlign: "center" }}
                >
                  Proceed to Checkout →
                </Link>
                <Link
                  href="/category"
                  className="btn-gold-outline"
                  style={{ display: "block", textAlign: "center", width: "100%", padding: "14px" }}
                >
                  Continue Shopping
                </Link>

                {/* Trust badges */}
                <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid rgba(220,202,187,0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { icon: "🔒", text: "Secure 256-bit SSL Checkout" },
                    { icon: "📦", text: "Luxury Gift Packaging Included" },
                    { icon: "↩️", text: "14-Day Easy Returns" },
                  ].map((b) => (
                    <div key={b.text} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.8rem", color: "var(--white-muted)" }}>
                      <span style={{ fontSize: "1rem" }}>{b.icon}</span>
                      {b.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo code */}
              <div style={{ marginTop: "20px", padding: "24px", background: "rgba(220,202,187,0.03)", border: "1px solid rgba(220,202,187,0.1)", borderRadius: "var(--radius-lg)" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Promo Code</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="Enter code (e.g. LUXE10)"
                    className="form-input"
                    style={{ flex: 1, padding: "10px 16px", borderRadius: "40px", fontSize: "0.85rem" }}
                  />
                  <button className="btn-gold-outline" style={{ padding: "10px 20px", whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
