"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProducts, Product } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CATEGORIES = [
  { id: "All", label: "All Fragrances", icon: "✦" },
  { id: "Oud & Woody", label: "Oud & Woody", icon: "🪵" },
  { id: "Sweet & Floral", label: "Sweet & Floral", icon: "🌹" },
  { id: "Fresh & Citrus", label: "Fresh & Citrus", icon: "🍋" },
  { id: "Oriental Spice", label: "Oriental Spice", icon: "🌶" },
];

const GENDER_FILTERS = [
  { id: "all",    label: "All",    labelAr: "الكل",    icon: "✦" },
  { id: "men",    label: "Men",    labelAr: "رجالي",   icon: "♂" },
  { id: "women",  label: "Women",  labelAr: "نسائي",   icon: "♀" },
  { id: "unisex", label: "Unisex", labelAr: "مشترك",  icon: "⚧" },
];

const SORT_OPTIONS = [
  { id: "default", label: "Featured" },
  { id: "price-low", label: "Price: Low → High" },
  { id: "price-high", label: "Price: High → Low" },
  { id: "newest", label: "Newest First" },
];

export default function ProductsPage() {
  const { products, loading } = useProducts();
  const { addToCart, isInCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [genderFilter, setGenderFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [toast, setToast] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);

  // Custom cursor
  useEffect(() => {
    const cursor = cursorRef.current;
    const glow = cursorGlowRef.current;
    if (!cursor || !glow) return;

    const move = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.4 });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero title split char animation
      gsap.fromTo(
        ".prod-hero-tag",
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)", delay: 0.1 }
      );
      gsap.fromTo(
        ".prod-hero-title",
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.3, ease: "expo.out", delay: 0.3 }
      );
      gsap.fromTo(
        ".prod-hero-sub",
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out", delay: 0.6 }
      );
      gsap.fromTo(
        ".prod-hero-stats",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.8 }
      );
      gsap.fromTo(
        ".prod-cat-pill",
        { opacity: 0, y: 20, scale: 0.85 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.6, ease: "back.out(1.4)", delay: 0.5 }
      );
      gsap.fromTo(
        ".prod-filter-bar",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.7 }
      );

      // Floating particles
      gsap.to(".hero-particle", {
        y: "-=20",
        duration: 2.5,
        ease: "sine.inOut",
        stagger: { each: 0.3, repeat: -1, yoyo: true },
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  // Animate cards on filter
  useEffect(() => {
    if (!gridRef.current || loading) return;
    const cards = gridRef.current.querySelectorAll(".prod-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.6, ease: "power3.out" }
    );
  }, [loading, selectedCategory, searchQuery, sortBy, view]);

  // Scroll-triggered animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.batch(".prod-card", {
        onEnter: (els) =>
          gsap.fromTo(els,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }
          ),
        start: "top 90%",
      });
    });
    return () => ctx.revert();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (genderFilter !== "all") {
      result = result.filter((p) => (p.gender || "unisex") === genderFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    }
    return result;
  }, [products, selectedCategory, searchQuery, sortBy, genderFilter]);

  function handleQuickAdd(e: React.MouseEvent, product: Product) {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
    });
    setToast(product.name);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div ref={pageRef} style={{ background: "var(--black)", color: "var(--white)", minHeight: "100vh", overflowX: "hidden" }}>
      {/* Custom cursor */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed", width: "12px", height: "12px",
          background: "var(--gold)", borderRadius: "50%",
          pointerEvents: "none", zIndex: 9999,
          transform: "translate(-50%,-50%)",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={cursorGlowRef}
        style={{
          position: "fixed", width: "40px", height: "40px",
          border: "1px solid rgba(220,202,187,0.4)", borderRadius: "50%",
          pointerEvents: "none", zIndex: 9998,
          transform: "translate(-50%,-50%)",
        }}
      />

      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span className="toast-icon">✦</span>
          <span className="toast-msg">{toast} added to cart!</span>
        </div>
      )}

      {/* ─── CINEMATIC HERO ─── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background: "linear-gradient(135deg, var(--black) 0%, var(--dark-3) 50%, var(--dark) 100%)",
        }}
      >
        {/* Animated background grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(220,202,187,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(220,202,187,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="hero-particle" style={{
            position: "absolute",
            width: `${4 + i * 2}px`,
            height: `${4 + i * 2}px`,
            background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)",
            borderRadius: "50%",
            left: `${10 + i * 11}%`,
            top: `${20 + (i % 3) * 25}%`,
            opacity: 0.3 + i * 0.04,
          }} />
        ))}

        {/* Gold glow */}
        <div style={{
          position: "absolute",
          right: "-10%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(220,202,187,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="responsive-pad" style={{ maxWidth: "1300px", margin: "0 auto", padding: "140px 60px 80px", width: "100%", position: "relative", zIndex: 2 }}>
          <div className="products-hero-grid">
            <div>
              <span className="prod-hero-tag" style={{
                display: "inline-block",
                border: "1px solid rgba(220,202,187,0.4)",
                borderRadius: "40px",
                padding: "6px 20px",
                fontSize: "0.7rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: "24px",
              }}>
                ✦ Our Full Collection
              </span>
              <h1 className="prod-hero-title" style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(3rem, 6vw, 5.5rem)",
                fontWeight: 700,
                lineHeight: 1.05,
                marginBottom: "20px",
                textTransform: "uppercase",
              }}>
                Every <span className="gold-text">Fragrance</span>,<br />
                One Place
              </h1>
              <p className="prod-hero-sub" style={{
                color: "var(--white-muted)",
                fontSize: "1rem",
                maxWidth: "520px",
                lineHeight: 1.8,
                marginBottom: "40px",
              }}>
                Explore our complete luxury collection — from smoky Oud to luminous Citrus. Each bottle is a story waiting to be worn.
              </p>
              <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
                {[
                  { num: products.length.toString(), label: "Fragrances" },
                  { num: "4", label: "Collections" },
                  { num: "12hr", label: "Longevity" },
                ].map((s) => (
                  <div key={s.label} className="prod-hero-stats">
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--gold)", fontWeight: 700, lineHeight: 1 }}>{s.num}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--white-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: "4px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative bottle preview */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              opacity: 0.7,
            }}>
              {["/perfume_1.png", "/perfume_2.png", "/perfume_3.png"].map((src, i) => (
                <div key={i} style={{
                  width: "70px",
                  height: "90px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(220,202,187,0.2)",
                  transform: `rotate(${i % 2 === 0 ? 3 : -3}deg)`,
                  transition: "transform 0.3s ease",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORY FILTER ─── */}
      <section style={{
        background: "var(--dark)",
        borderBottom: "1px solid rgba(220,202,187,0.1)",
        position: "sticky",
        top: "80px",
        zIndex: 50,
        backdropFilter: "blur(20px)",
      }}>
        <div className="responsive-pad" style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", overflowX: "auto", padding: "16px 0", scrollbarWidth: "none" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`prod-cat-pill${selectedCategory === cat.id ? " prod-cat-pill-active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 22px",
                  borderRadius: "40px",
                  border: selectedCategory === cat.id
                    ? "1px solid var(--gold)"
                    : "1px solid rgba(220,202,187,0.15)",
                  background: selectedCategory === cat.id
                    ? "linear-gradient(135deg, var(--gold), var(--gold-dark))"
                    : "transparent",
                  color: selectedCategory === cat.id ? "var(--black)" : "var(--white-muted)",
                  fontSize: "0.8rem",
                  fontWeight: selectedCategory === cat.id ? 600 : 400,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Gender filter row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "14px" }}>
            <span style={{ fontSize: "0.68rem", color: "var(--white-muted)", textTransform: "uppercase", letterSpacing: "0.15em", whiteSpace: "nowrap", marginRight: "4px" }}>For:</span>
            {GENDER_FILTERS.map((g) => {
              const colorMap: Record<string, string> = { men: "#6ab0f5", women: "#f5a0c8", unisex: "var(--gold)", all: "var(--gold)" };
              const active = genderFilter === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGenderFilter(g.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "7px 18px", borderRadius: "40px",
                    border: active ? `1px solid ${colorMap[g.id]}` : "1px solid rgba(220,202,187,0.12)",
                    background: active ? `${colorMap[g.id]}18` : "transparent",
                    color: active ? colorMap[g.id] : "var(--white-muted)",
                    fontSize: "0.78rem", fontWeight: active ? 700 : 400,
                    cursor: "pointer", whiteSpace: "nowrap",
                    fontFamily: "var(--font-sans)",
                    transition: "all 0.25s ease",
                  }}
                >
                  <span>{g.icon}</span>
                  {g.label} <span style={{ opacity: 0.6, fontSize: "0.7rem" }}>· {g.labelAr}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FILTER BAR ─── */}
      <section style={{ padding: "28px 0", background: "var(--dark-3)" }}>
        <div className="responsive-pad prod-filter-bar" style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 60px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
            <svg style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fragrances, notes..."
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(220,202,187,0.15)",
                borderRadius: "40px",
                padding: "11px 20px 11px 44px",
                color: "var(--white)",
                fontSize: "0.85rem",
                outline: "none",
                fontFamily: "var(--font-sans)",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(220,202,187,0.15)")}
            />
          </div>

          {/* Sort */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(220,202,187,0.15)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--white)",
                fontSize: "0.8rem",
                outline: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id} style={{ background: "var(--dark-2)" }}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div style={{ display: "flex", border: "1px solid rgba(220,202,187,0.15)", borderRadius: "8px", overflow: "hidden" }}>
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "10px 14px",
                  background: view === v ? "rgba(220,202,187,0.12)" : "transparent",
                  border: "none",
                  color: view === v ? "var(--gold)" : "var(--white-muted)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: "0.9rem",
                }}
              >
                {v === "grid" ? "⊞" : "☰"}
              </button>
            ))}
          </div>

          {/* Count */}
          <div style={{ fontSize: "0.8rem", color: "var(--white-muted)", marginLeft: "auto" }}>
            {loading ? "Loading..." : (
              <span>
                <span style={{ color: "var(--gold)", fontWeight: 600 }}>{filteredProducts.length}</span>
                {" "}fragrance{filteredProducts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS GRID / LIST ─── */}
      <section style={{ padding: "60px 0 120px", background: "var(--black)" }}>
        <div className="responsive-pad" style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 60px" }}>
          <div
            ref={gridRef}
            style={
              view === "grid"
                ? {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "32px",
                  }
                : {
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }
            }
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} view={view} />
                ))
              : filteredProducts.length === 0
              ? (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "120px 20px" }}>
                  <div style={{ fontSize: "5rem", opacity: 0.2, marginBottom: "24px" }}>🌿</div>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.8rem", marginBottom: "14px" }}>No Fragrances Found</h3>
                  <p style={{ color: "var(--white-muted)", marginBottom: "36px", fontSize: "0.95rem" }}>
                    Try adjusting your filters or explore a different collection.
                  </p>
                  <button
                    className="btn-gold-outline"
                    onClick={() => { setSelectedCategory("All"); setSearchQuery(""); setSortBy("default"); }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )
              : filteredProducts.map((product, index) =>
                  view === "grid" ? (
                    <ProductGridCard
                      key={product.id}
                      product={product}
                      index={index}
                      inCart={isInCart(product.id)}
                      onQuickAdd={(e) => handleQuickAdd(e, product)}
                      hovered={hoveredId === product.id}
                      onHover={() => setHoveredId(product.id)}
                      onLeave={() => setHoveredId(null)}
                    />
                  ) : (
                    <ProductListCard
                      key={product.id}
                      product={product}
                      index={index}
                      inCart={isInCart(product.id)}
                      onQuickAdd={(e) => handleQuickAdd(e, product)}
                    />
                  )
                )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─── Grid Card ─── */
function ProductGridCard({
  product,
  index,
  inCart,
  onQuickAdd,
  hovered,
  onHover,
  onLeave,
}: {
  product: Product;
  index: number;
  inCart: boolean;
  onQuickAdd: (e: React.MouseEvent) => void;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  // Pick hover image: first gallery image if exists, otherwise same (no swap)
  const hoverImage = product.images?.[0] ?? null;
  const hasHoverImage = !!hoverImage && hoverImage !== product.image_url;

  return (
    <Link
      href={`/product/${product.id}`}
      className="prod-card"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        display: "block",
        background: "rgba(10,15,36,0.6)",
        border: hovered ? "1px solid rgba(220,202,187,0.4)" : "1px solid rgba(220,202,187,0.1)",
        borderRadius: "20px",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        transition: "all 0.45s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-10px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? "0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(220,202,187,0.12)"
          : "0 4px 20px rgba(0,0,0,0.3)",
        animationDelay: `${index * 0.05}s`,
      }}
    >
      {/* Image container */}
      <div style={{ position: "relative", height: "360px", overflow: "hidden", background: "var(--dark-2)" }}>

        {/* PRIMARY image — always visible, fades out on hover if hover image exists */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.name}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "opacity 0.55s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            opacity: hovered && hasHoverImage ? 0 : 1,
            zIndex: 1,
          }}
        />

        {/* HOVER image — slides up + fades in on hover */}
        {hasHoverImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={hoverImage}
            alt={`${product.name} alternate view`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "opacity 0.55s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
              transform: hovered ? "scale(1.05)" : "scale(1.12)",
              opacity: hovered ? 1 : 0,
              zIndex: 2,
            }}
          />
        )}

        {/* Shimmer line that sweeps across on hover */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          backgroundPositionX: hovered ? "0%" : "200%",
          transition: "background-position 0.7s ease",
          pointerEvents: "none",
        }} />

        {/* Corner indicator — only shows when hover image is available */}
        {hasHoverImage && (
          <div style={{
            position: "absolute",
            top: "12px",
            left: "50%",
            transform: `translateX(-50%) translateY(${hovered ? "0px" : "-30px"})`,
            opacity: hovered ? 1 : 0,
            transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            zIndex: 4,
            background: "rgba(10,15,36,0.85)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(220,202,187,0.3)",
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "0.6rem",
            color: "var(--gold)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            ✦ Alternative View
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <span style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
            color: "var(--black)",
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "5px 12px",
            borderRadius: "20px",
            zIndex: 5,
          }}>
            {product.badge}
          </span>
        )}

        {/* Category chip */}
        <span style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "rgba(10,15,36,0.85)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(220,202,187,0.2)",
          color: "var(--gold)",
          fontSize: "0.62rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "5px 10px",
          borderRadius: "20px",
          zIndex: 5,
        }}>
          {product.category || "Luxury"}
        </span>

        {/* Overlay gradient */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.4s ease",
          zIndex: 3,
        }} />

        {/* Hover actions */}
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: hovered ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(20px)",
          display: "flex",
          gap: "10px",
          opacity: hovered ? 1 : 0,
          transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
          whiteSpace: "nowrap",
          zIndex: 6,
        }}>
          <button
            onClick={onQuickAdd}
            style={{
              background: inCart ? "rgba(76,175,80,0.9)" : "rgba(220,202,187,0.95)",
              color: "var(--black)",
              border: "none",
              padding: "11px 22px",
              borderRadius: "40px",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s",
            }}
          >
            {inCart ? "✓ In Cart" : "+ Add to Cart"}
          </button>
          <div style={{
            background: "rgba(10,15,36,0.85)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(220,202,187,0.3)",
            color: "var(--gold)",
            padding: "11px 18px",
            borderRadius: "40px",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            Details →
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <div style={{ color: "var(--gold)", fontSize: "0.72rem", letterSpacing: "1px" }}>★★★★★</div>
          <span style={{ fontSize: "0.68rem", color: "var(--white-muted)" }}>4.9</span>
          {product.gender && (
            <span style={{
              marginLeft: "auto",
              fontSize: "0.62rem", fontWeight: 600,
              padding: "2px 9px", borderRadius: "20px",
              background: product.gender === "men" ? "rgba(106,176,245,0.12)" : product.gender === "women" ? "rgba(245,160,200,0.12)" : "rgba(220,202,187,0.08)",
              color: product.gender === "men" ? "#6ab0f5" : product.gender === "women" ? "#f5a0c8" : "var(--gold)",
              border: `1px solid ${product.gender === "men" ? "rgba(106,176,245,0.3)" : product.gender === "women" ? "rgba(245,160,200,0.3)" : "rgba(220,202,187,0.2)"}`,
            }}>
              {product.gender === "men" ? "♂ رجالي" : product.gender === "women" ? "♀ نسائي" : "⚧ مشترك"}
            </span>
          )}
        </div>
        <h3 style={{
          fontFamily: "var(--font-title)",
          fontSize: "1.2rem",
          color: "var(--white)",
          marginBottom: "8px",
          lineHeight: 1.3,
        }}>
          {product.name}
        </h3>
        <p style={{
          color: "var(--white-muted)",
          fontSize: "0.82rem",
          lineHeight: 1.6,
          marginBottom: "20px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {product.description}
        </p>

        {/* Notes preview */}
        {product.top_notes && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
            {product.top_notes.split(",").slice(0, 3).map((note) => (
              <span key={note} style={{
                fontSize: "0.65rem",
                background: "rgba(220,202,187,0.08)",
                border: "1px solid rgba(220,202,187,0.15)",
                borderRadius: "20px",
                padding: "3px 10px",
                color: "var(--gold-dark)",
                letterSpacing: "0.05em",
              }}>
                {note.trim()}
              </span>
            ))}
          </div>
        )}

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "16px",
        }}>
          <span style={{
            fontFamily: "var(--font-serif)",
            color: "var(--gold)",
            fontSize: "1.4rem",
            fontWeight: 700,
          }}>
            {product.price.toLocaleString()} <span style={{ fontSize: "0.8rem", fontWeight: 400 }}>EGP</span>
          </span>

          {/* Dot indicators — shows how many images exist */}
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            {[product.image_url, ...(product.images || [])].slice(0, 4).map((_, i) => (
              <div key={i} style={{
                width: i === (hovered && hasHoverImage ? 1 : 0) ? "18px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: i === (hovered && hasHoverImage ? 1 : 0) ? "var(--gold)" : "rgba(220,202,187,0.25)",
                transition: "all 0.35s ease",
              }} />
            ))}
          </div>

          <div style={{
            width: "36px",
            height: "36px",
            border: "1px solid rgba(220,202,187,0.2)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--gold)",
            fontSize: "1rem",
            transition: "all 0.3s",
            background: hovered ? "rgba(220,202,187,0.1)" : "transparent",
          }}>
            →
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── List Card ─── */
function ProductListCard({
  product,
  index,
  inCart,
  onQuickAdd,
}: {
  product: Product;
  index: number;
  inCart: boolean;
  onQuickAdd: (e: React.MouseEvent) => void;
}) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="prod-card prod-list-card"
      style={{
        background: "rgba(10,15,36,0.6)",
        border: "1px solid rgba(220,202,187,0.1)",
        borderRadius: "16px",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "all 0.35s ease",
        animationDelay: `${index * 0.04}s`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.35)";
        (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.1)";
        (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden", height: "180px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = "scale(1.06)")}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = "scale(1)")}
        />
        {product.badge && (
          <span style={{
            position: "absolute", top: "12px", left: "12px",
            background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
            color: "var(--black)", fontSize: "0.6rem", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "4px 10px", borderRadius: "20px",
          }}>{product.badge}</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.65rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {product.category || "Luxury"}
          </span>
          <span style={{ color: "var(--gold)", fontSize: "0.65rem" }}>★★★★★</span>
        </div>
        <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.25rem", color: "var(--white)", lineHeight: 1.3 }}>{product.name}</h3>
        <p style={{ color: "var(--white-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
          {product.description.slice(0, 120)}{product.description.length > 120 ? "..." : ""}
        </p>
        {product.top_notes && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
            {product.top_notes.split(",").slice(0, 3).map((n) => (
              <span key={n} style={{
                fontSize: "0.62rem", background: "rgba(220,202,187,0.07)",
                border: "1px solid rgba(220,202,187,0.12)", borderRadius: "20px",
                padding: "2px 8px", color: "var(--gold-dark)",
              }}>{n.trim()}</span>
            ))}
          </div>
        )}
      </div>

      {/* Price + CTA */}
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: "14px", borderLeft: "1px solid rgba(220,202,187,0.08)", minWidth: "160px" }}>
        <span style={{ fontFamily: "var(--font-serif)", color: "var(--gold)", fontSize: "1.5rem", fontWeight: 700 }}>
          {product.price.toLocaleString()} <span style={{ fontSize: "0.8rem", fontWeight: 400 }}>EGP</span>
        </span>
        <button
          onClick={onQuickAdd}
          className="btn-primary"
          style={{ padding: "11px 22px", fontSize: "0.75rem", whiteSpace: "nowrap" }}
        >
          {inCart ? "✓ In Cart" : "+ Cart"}
        </button>
        <div style={{ color: "var(--gold)", fontSize: "0.75rem", letterSpacing: "0.05em", opacity: 0.7 }}>
          View Details →
        </div>
      </div>
    </Link>
  );
}

/* ─── Skeleton Card ─── */
function SkeletonCard({ view }: { view: "grid" | "list" }) {
  return view === "grid" ? (
    <div style={{
      background: "rgba(10,15,36,0.6)",
      border: "1px solid rgba(220,202,187,0.06)",
      borderRadius: "20px",
      overflow: "hidden",
      animation: "pulse 1.8s ease-in-out infinite",
    }}>
      <div style={{ height: "360px", background: "var(--dark-2)" }} />
      <div style={{ padding: "24px" }}>
        <div style={{ height: "12px", background: "var(--dark-2)", borderRadius: "6px", width: "40%", marginBottom: "12px" }} />
        <div style={{ height: "20px", background: "var(--dark-2)", borderRadius: "6px", marginBottom: "8px" }} />
        <div style={{ height: "14px", background: "var(--dark-2)", borderRadius: "6px", width: "80%" }} />
      </div>
    </div>
  ) : (
    <div style={{
      height: "180px",
      background: "rgba(10,15,36,0.6)",
      border: "1px solid rgba(220,202,187,0.06)",
      borderRadius: "16px",
      animation: "pulse 1.8s ease-in-out infinite",
    }} />
  );
}
