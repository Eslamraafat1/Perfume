"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useProducts } from "../context/ProductContext";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { FRAGRANCE_FAMILIES } from "../context/ProductContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GENDER_FILTERS = [
  { id: "men",      label: "For Him",  labelAr: "للرجال",    icon: "♂",  color: "#6ab0f5" },
  { id: "women",    label: "For Her",  labelAr: "للنساء",    icon: "♀",  color: "#f5a0c8" },
  { id: "unisex",   label: "Unisex",   labelAr: "للجنسين",   icon: "⚧",  color: "#dbcabb" },
  { id: "oriental", label: "Oriental", labelAr: "شرقي",      icon: "🌙", color: "#e8b86d" },
] as const;

export default function FragranceFinderPage() {
  const { products, loading } = useProducts();
  const { t, isRTL } = useLanguage();
  const { addToCart, items } = useCart();

  const [query, setQuery]                   = useState("");
  const [activeGender, setActiveGender]     = useState<string | null>(null);
  const [activeFamily, setActiveFamily]     = useState<string | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  /* ─── Entrance animations ─── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".ff-hero-tag",   { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 1,   ease: "back.out(1.7)", delay: 0.1 });
      gsap.fromTo(".ff-hero-title", { opacity: 0, y: 40 },             { opacity: 1, y: 0, duration: 1.2, ease: "expo.out",   delay: 0.3 });
      gsap.fromTo(".ff-hero-sub",   { opacity: 0, y: 20 },             { opacity: 1, y: 0, duration: 1,   ease: "power3.out", delay: 0.5 });
      gsap.fromTo(".ff-search-box", { opacity: 0, scale: 0.95 },       { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out", delay: 0.7 });
      gsap.fromTo(".ff-filters",    { opacity: 0, y: 20 },             { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.9 });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  /* ─── Filter logic ─── */
  const hasFilters = query.trim() !== "" || activeGender !== null || activeFamily !== null;

  const matchedProducts = useMemo(() => {
    if (!hasFilters) return [];

    return products.filter((p) => {
      // 1. Gender filter
      if (activeGender && (p.gender || "unisex") !== activeGender) return false;

      // 2. Fragrance family filter
      if (activeFamily && p.fragrance_family !== activeFamily) return false;

      // 3. Text search across notes + name + description
      if (query.trim()) {
        const terms = query.toLowerCase().split(/[, ]+/).filter(Boolean);
        const haystack = `
          ${p.name}
          ${p.top_notes    || ""}
          ${p.heart_notes  || ""}
          ${p.base_notes   || ""}
          ${p.description  || ""}
          ${p.category     || ""}
          ${p.fragrance_family || ""}
        `.toLowerCase();
        if (!terms.every((term) => haystack.includes(term))) return false;
      }

      return true;
    });
  }, [products, query, activeGender, activeFamily]);

  /* ─── Animate grid on filter change ─── */
  useEffect(() => {
    if (!gridRef.current || matchedProducts.length === 0) return;
    const cards = gridRef.current.querySelectorAll(".ff-card");
    gsap.fromTo(cards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.55, ease: "power3.out" });
  }, [matchedProducts]);

  const toggleGender  = (id: string) => setActiveGender((prev) => (prev === id ? null : id));
  const toggleFamily  = (fam: string) => setActiveFamily((prev) => (prev === fam ? null : fam));
  const clearAll      = () => { setQuery(""); setActiveGender(null); setActiveFamily(null); };

  return (
    <div ref={pageRef} style={{ background: "var(--black)", minHeight: "100vh", color: "var(--white)", direction: isRTL ? "rtl" : "ltr" }}>
      <Navbar />

      <style>{`
        .ff-card:hover .card-img { transform: scale(1.05); }
        .ff-chip { transition: all 0.22s ease; cursor: pointer; }
        .ff-chip:hover { transform: translateY(-2px); }
      `}</style>

      {/* ─── HERO ─── */}
      <section style={{
        padding: "180px 24px 60px",
        textAlign: "center",
        position: "relative",
        background: "linear-gradient(to bottom, #06091a 0%, var(--black) 100%)",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw", height: "40vw",
          background: "radial-gradient(circle, rgba(220,202,187,0.07) 0%, transparent 60%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>
          <div className="ff-hero-tag" style={{
            display: "inline-block", padding: "6px 16px", borderRadius: "30px",
            border: "1px solid rgba(220,202,187,0.3)", color: "var(--gold)",
            fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "normal",
            marginBottom: "24px", fontFamily: "var(--font-sans)",
          }}>
            {t("finder_eyebrow")}
          </div>

          <h1 className="ff-hero-title" style={{
            fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            lineHeight: isRTL ? 1.35 : 1.1, marginBottom: "24px", color: "var(--white)",
          }}>
            {t("finder_title")}
          </h1>

          <p className="ff-hero-sub" style={{
            color: "var(--white-muted)", fontSize: "1.1rem", lineHeight: 1.6,
            maxWidth: "600px", margin: "0 auto 40px", fontFamily: "var(--font-sans)",
          }}>
            {t("finder_desc")}
          </p>

          {/* Search box */}
          <div className="ff-search-box" style={{
            position: "relative", maxWidth: "600px", margin: "0 auto",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("finder_placeholder")}
              style={{
                width: "100%", padding: "22px 32px",
                paddingRight: isRTL ? "32px" : "64px",
                paddingLeft:  isRTL ? "64px" : "32px",
                borderRadius: "50px",
                background: "rgba(20,25,45,0.6)",
                border: "1px solid rgba(220,202,187,0.2)",
                color: "var(--white)", fontSize: "1.05rem",
                outline: "none", backdropFilter: "blur(12px)",
                transition: "border-color 0.3s ease",
                fontFamily: "var(--font-sans)",
                boxSizing: "border-box",
              }}
              onFocus={(e)  => (e.target.style.borderColor = "var(--gold)")}
              onBlur={(e)   => (e.target.style.borderColor = "rgba(220,202,187,0.2)")}
            />
            <div style={{
              position: "absolute", top: "50%", transform: "translateY(-50%)",
              [isRTL ? "left" : "right"]: "24px", color: "var(--gold)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SMART FILTERS ─── */}
      <section className="ff-filters" style={{ padding: "0 24px 56px" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>

          {/* Active filter summary + clear */}
          {hasFilters && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--white-muted)", fontFamily: "var(--font-sans)" }}>
                Active filters:
              </span>
              {activeGender && (
                <span style={{ background: "rgba(220,202,187,0.1)", border: "1px solid rgba(220,202,187,0.3)", color: "var(--gold)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.73rem", fontFamily: "var(--font-sans)" }}>
                  {GENDER_FILTERS.find(g => g.id === activeGender)?.label}
                </span>
              )}
              {activeFamily && (
                <span style={{ background: "rgba(220,202,187,0.1)", border: "1px solid rgba(220,202,187,0.3)", color: "var(--gold)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.73rem", fontFamily: "var(--font-sans)" }}>
                  {activeFamily}
                </span>
              )}
              {query.trim() && (
                <span style={{ background: "rgba(220,202,187,0.1)", border: "1px solid rgba(220,202,187,0.3)", color: "var(--gold)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.73rem", fontFamily: "var(--font-sans)" }}>
                  "{query}"
                </span>
              )}
              <button
                onClick={clearAll}
                style={{ background: "none", border: "none", color: "var(--white-muted)", fontSize: "0.73rem", cursor: "pointer", textDecoration: "underline", fontFamily: "var(--font-sans)", padding: 0 }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* ── Gender chips ── */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "0.68rem", color: "var(--white-muted)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "12px", textAlign: "center", fontFamily: "var(--font-sans)" }}>
              Gender
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              {GENDER_FILTERS.map((g) => {
                const active = activeGender === g.id;
                return (
                  <button
                    key={g.id}
                    className="ff-chip"
                    onClick={() => toggleGender(g.id)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "7px",
                      padding: "10px 22px", borderRadius: "50px",
                      border: active ? `1.5px solid ${g.color}` : "1px solid rgba(220,202,187,0.15)",
                      background: active ? `${g.color}18` : "rgba(255,255,255,0.03)",
                      color: active ? g.color : "var(--white-muted)",
                      fontSize: "0.82rem", fontWeight: active ? 700 : 400,
                      fontFamily: "var(--font-sans)",
                      boxShadow: active ? `0 4px 18px ${g.color}33` : "none",
                    }}
                  >
                    <span style={{ fontSize: "1rem" }}>{g.icon}</span>
                    {isRTL ? g.labelAr : g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Fragrance family chips ── */}
          <div>
            <p style={{ fontSize: "0.68rem", color: "var(--white-muted)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "12px", textAlign: "center", fontFamily: "var(--font-sans)" }}>
              Fragrance Family
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
              {FRAGRANCE_FAMILIES.map((fam) => {
                const active = activeFamily === fam;
                return (
                  <button
                    key={fam}
                    className="ff-chip"
                    onClick={() => toggleFamily(fam)}
                    style={{
                      padding: "8px 18px", borderRadius: "30px",
                      border: active ? "1.5px solid var(--gold)" : "1px solid rgba(220,202,187,0.12)",
                      background: active ? "rgba(220,202,187,0.12)" : "rgba(255,255,255,0.02)",
                      color: active ? "var(--gold)" : "var(--white-muted)",
                      fontSize: "0.78rem", fontWeight: active ? 700 : 400,
                      fontFamily: "var(--font-sans)",
                      boxShadow: active ? "0 3px 14px rgba(220,202,187,0.18)" : "none",
                    }}
                  >
                    {fam}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── RESULTS ─── */}
      <section style={{ padding: "0 24px 120px" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>

          {hasFilters && (
            <div style={{ marginBottom: "36px", textAlign: "center" }}>
              <span style={{ color: "var(--gold)", fontSize: "0.88rem", textTransform: "uppercase", letterSpacing: "normal", fontFamily: "var(--font-sans)" }}>
                {matchedProducts.length} {t("finder_results")}
              </span>
            </div>
          )}

          {!loading && hasFilters && matchedProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--white-muted)", fontFamily: "var(--font-sans)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.3 }}>🌿</div>
              <p style={{ fontSize: "1.1rem", marginBottom: "12px" }}>{t("finder_empty")}</p>
              <button onClick={clearAll} style={{ color: "var(--gold)", background: "none", border: "1px solid rgba(220,202,187,0.3)", padding: "10px 24px", borderRadius: "30px", cursor: "pointer", fontSize: "0.82rem", fontFamily: "var(--font-sans)" }}>
                Clear filters
              </button>
            </div>
          )}

          {!hasFilters && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--white-muted)", fontFamily: "var(--font-sans)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "14px", opacity: 0.25 }}>✦</div>
              <p style={{ fontSize: "1rem" }}>Select a filter or type a note above to discover fragrances.</p>
            </div>
          )}

          <div ref={gridRef} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "32px",
          }}>
            {matchedProducts.map((product) => {
              const inCart = items.some((i) => i.id === product.id);
              const genderMeta = GENDER_FILTERS.find((g) => g.id === product.gender);

              return (
                <div
                  key={product.id}
                  className="ff-card"
                  style={{
                    background: "var(--dark-2)", borderRadius: "24px", overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.05)", position: "relative",
                    transition: "all 0.4s ease",
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
                  }}
                >
                  {/* Badge */}
                  {product.badge && (
                    <div style={{
                      position: "absolute", top: "20px", [isRTL ? "right" : "left"]: "20px", zIndex: 10,
                      background: "rgba(10,15,36,0.8)", backdropFilter: "blur(8px)",
                      color: "var(--gold)", padding: "6px 12px", borderRadius: "30px",
                      fontSize: "0.7rem", textTransform: "uppercase", fontFamily: "var(--font-sans)",
                    }}>
                      {product.badge}
                    </div>
                  )}

                  {/* Gender badge */}
                  {genderMeta && (
                    <div style={{
                      position: "absolute", top: "20px", [isRTL ? "left" : "right"]: "20px", zIndex: 10,
                      background: `${genderMeta.color}22`,
                      border: `1px solid ${genderMeta.color}55`,
                      color: genderMeta.color,
                      padding: "4px 10px", borderRadius: "20px",
                      fontSize: "0.65rem", fontWeight: 700, fontFamily: "var(--font-sans)",
                      display: "flex", alignItems: "center", gap: "4px",
                    }}>
                      <span>{genderMeta.icon}</span> {genderMeta.label}
                    </div>
                  )}

                  {/* Image */}
                  <Link href={`/product/${product.id}`} style={{ display: "block", position: "relative", height: "340px", overflow: "hidden" }}>
                    <Image
                      src={product.image_url || "/placeholder.jpg"}
                      alt={product.name || "Product"}
                      fill
                      style={{ objectFit: "cover", transition: "transform 0.6s ease" }}
                      className="card-img"
                    />
                  </Link>

                  {/* Body */}
                  <div style={{ padding: "28px 24px" }}>
                    {/* Family + Category row */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                      {product.fragrance_family && (
                        <span style={{
                          fontSize: "0.68rem", color: "var(--gold)", background: "rgba(220,202,187,0.08)",
                          border: "1px solid rgba(220,202,187,0.2)", padding: "3px 10px",
                          borderRadius: "20px", fontFamily: "var(--font-sans)", fontWeight: 600,
                        }}>
                          {product.fragrance_family}
                        </span>
                      )}
                      {product.category && (
                        <span style={{ fontSize: "0.68rem", color: "var(--white-muted)", fontFamily: "var(--font-sans)" }}>
                          {product.category}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.7rem", marginBottom: "14px", color: "var(--white)", lineHeight: isRTL ? 1.4 : 1.1 }}>
                      <Link href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {product.name}
                      </Link>
                    </h3>

                    {/* Matching notes */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "22px" }}>
                      {[product.top_notes, product.heart_notes, product.base_notes]
                        .filter(Boolean)
                        .flatMap((str) => (str as string).split(",").map((n) => n.trim()))
                        .slice(0, 5)
                        .map((note, i) => (
                          <span key={i} style={{
                            fontSize: "0.72rem", padding: "5px 11px", borderRadius: "4px",
                            background: "rgba(255,255,255,0.05)", color: "var(--white-muted)",
                            fontFamily: "var(--font-sans)",
                          }}>
                            {note}
                          </span>
                        ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "1.15rem", fontWeight: 600, fontFamily: "var(--font-sans)", color: "var(--white)" }}>
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
                          fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase",
                          cursor: inCart ? "default" : "pointer",
                          transition: "all 0.3s ease", fontFamily: "var(--font-sans)",
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
