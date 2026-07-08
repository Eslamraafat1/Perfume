"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useProducts } from "../context/ProductContext";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FragranceFinderPage() {
  const { products, loading } = useProducts();
  const { t, isRTL } = useLanguage();
  const { addToCart, items } = useCart();
  
  const [query, setQuery] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".ff-hero-tag",
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)", delay: 0.1 }
      );
      gsap.fromTo(
        ".ff-hero-title",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", delay: 0.3 }
      );
      gsap.fromTo(
        ".ff-hero-sub",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.5 }
      );
      gsap.fromTo(
        ".ff-search-box",
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out", delay: 0.7 }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  // Filter products by ingredients (notes) or description
  const matchedProducts = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(/[, ]+/).filter(Boolean);
    
    return products.filter((p) => {
      const searchString = `
        ${p.name} 
        ${p.top_notes || ""} 
        ${p.heart_notes || ""} 
        ${p.base_notes || ""} 
        ${p.description || ""}
      `.toLowerCase();

      // Check if ALL terms match (better for specific searches like "Oud Rose").
      return searchTerms.every(term => searchString.includes(term));
    });
  }, [products, query]);

  // Animate grid updates
  useEffect(() => {
    if (!gridRef.current || matchedProducts.length === 0) return;
    const cards = gridRef.current.querySelectorAll(".ff-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: "power3.out" }
    );
  }, [matchedProducts]);

  return (
    <div ref={pageRef} style={{ background: "var(--black)", minHeight: "100vh", color: "var(--white)", direction: isRTL ? "rtl" : "ltr" }}>
      <Navbar />

      <style>{`
        .ff-card:hover .card-img { transform: scale(1.05); }
      `}</style>

      {/* ─── HERO SECTION ─── */}
      <section style={{ 
        padding: "180px 24px 80px", 
        textAlign: "center", 
        position: "relative",
        background: "linear-gradient(to bottom, #06091a 0%, var(--black) 100%)"
      }}>
        {/* Glow behind the search */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw", height: "40vw",
          background: "radial-gradient(circle, rgba(220,202,187,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>
          <div className="ff-hero-tag" style={{ 
            display: "inline-block", padding: "6px 16px", borderRadius: "30px", 
            border: "1px solid rgba(220,202,187,0.3)", color: "var(--gold)", 
            fontSize: "0.75rem", letterSpacing: "normal", textTransform: "uppercase", 
            marginBottom: "24px", fontFamily: "var(--font-sans)"
          }}>
            {t("finder_eyebrow")}
          </div>
          
          <h1 className="ff-hero-title" style={{ 
            fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", 
            lineHeight: isRTL ? 1.35 : 1.1, marginBottom: "24px", color: "var(--white)",
            letterSpacing: isRTL ? "normal" : "-0.01em"
          }}>
            {t("finder_title")}
          </h1>
          
          <p className="ff-hero-sub" style={{ 
            color: "var(--white-muted)", fontSize: "1.1rem", lineHeight: 1.6, 
            maxWidth: "600px", margin: "0 auto 48px", fontFamily: "var(--font-sans)"
          }}>
            {t("finder_desc")}
          </p>

          <div className="ff-search-box" style={{ 
            position: "relative", maxWidth: "600px", margin: "0 auto",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("finder_placeholder")}
              style={{
                width: "100%", padding: "24px 32px", paddingRight: isRTL ? "32px" : "64px", paddingLeft: isRTL ? "64px" : "32px",
                borderRadius: "50px", background: "rgba(20, 25, 45, 0.6)",
                border: "1px solid rgba(220,202,187,0.2)", color: "var(--white)",
                fontSize: "1.1rem", outline: "none", backdropFilter: "blur(12px)",
                transition: "all 0.3s ease",
                fontFamily: "var(--font-sans)"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(220,202,187,0.2)"}
            />
            <div style={{ 
              position: "absolute", top: "50%", transform: "translateY(-50%)", 
              [isRTL ? "left" : "right"]: "24px", color: "var(--gold)"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RESULTS GRID ─── */}
      <section style={{ padding: "40px 24px 120px" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          
          {query.trim() !== "" && (
            <div style={{ marginBottom: "40px", textAlign: "center" }}>
              <span style={{ color: "var(--gold)", fontSize: "0.9rem", letterSpacing: "normal", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>
                {matchedProducts.length} {t("finder_results")}
              </span>
            </div>
          )}

          {!loading && query.trim() !== "" && matchedProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--white-muted)", fontSize: "1.2rem", fontFamily: "var(--font-sans)" }}>
              {t("finder_empty")}
            </div>
          )}

          <div ref={gridRef} style={{ 
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "32px" 
          }}>
            {matchedProducts.map((product) => {
              const inCart = items.some((i) => i.id === product.id);
              
              return (
                <div key={product.id} className="ff-card" style={{ 
                  background: "var(--dark-2)", borderRadius: "24px", overflow: "hidden", 
                  border: "1px solid rgba(255,255,255,0.05)", position: "relative",
                  transition: "all 0.4s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.borderColor = "rgba(220,202,187,0.3)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.boxShadow = "none";
                }}>
                  {product.badge && (
                    <div style={{ 
                      position: "absolute", top: "20px", [isRTL ? "right" : "left"]: "20px", zIndex: 10,
                      background: "rgba(10,15,36,0.8)", backdropFilter: "blur(8px)",
                      color: "var(--gold)", padding: "6px 12px", borderRadius: "30px",
                      fontSize: "0.7rem", letterSpacing: "normal", textTransform: "uppercase",
                      fontFamily: "var(--font-sans)"
                    }}>
                      {product.badge}
                    </div>
                  )}
                  
                  <Link href={`/product/${product.id}`} style={{ display: "block", position: "relative", height: "350px", overflow: "hidden" }}>
                    <Image
                      src={product.image_url || "/placeholder.jpg"}
                      alt={product.name || "Product"}
                      fill
                      style={{ objectFit: "cover", transition: "transform 0.6s ease" }}
                      className="card-img"
                    />
                  </Link>

                  <div style={{ padding: "30px 24px" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--gold)", letterSpacing: "normal", textTransform: "uppercase", marginBottom: "8px", fontFamily: "var(--font-sans)" }}>
                      {product.category || "Luxury Collection"}
                    </div>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", marginBottom: "12px", color: "var(--white)", lineHeight: isRTL ? 1.4 : 1.1 }}>
                      <Link href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {product.name}
                      </Link>
                    </h3>
                    
                    {/* Show matching notes if any */}
                    <div style={{ 
                      display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" 
                    }}>
                      {[product.top_notes, product.heart_notes, product.base_notes].filter(Boolean).map((noteStr, idx) => {
                        const notes = typeof noteStr === "string" ? noteStr.split(",").map(n => n.trim()) : [];
                        return notes.slice(0, 2).map((note, nIdx) => (
                          <span key={`${idx}-${nIdx}`} style={{ 
                            fontSize: "0.75rem", padding: "6px 12px", borderRadius: "4px",
                            background: "rgba(255,255,255,0.05)", color: "var(--white-muted)",
                            fontFamily: "var(--font-sans)"
                          }}>
                            {note}
                          </span>
                        ));
                      })}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "1.2rem", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
                        {(Number(product.price) || 0).toLocaleString()} EGP
                      </span>
                      <button
                        onClick={() => !inCart && addToCart(product)}
                        disabled={inCart}
                        style={{
                          background: inCart ? "transparent" : "var(--gold)",
                          color: inCart ? "var(--gold)" : "var(--black)",
                          border: `1px solid ${inCart ? "var(--gold)" : "transparent"}`,
                          padding: "10px 20px", borderRadius: "50px",
                          fontSize: "0.8rem", fontWeight: 600, letterSpacing: "normal",
                          textTransform: "uppercase", cursor: inCart ? "default" : "pointer",
                          transition: "all 0.3s ease",
                          fontFamily: "var(--font-sans)"
                        }}
                      >
                        {inCart ? t("prod_in_cart") : t("prod_add")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
