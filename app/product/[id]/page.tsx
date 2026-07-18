"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/app/context/ProductContext";
import { useCart } from "@/app/context/CartContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, isInCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "ritual" | "story">("notes");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeScentBar, setActiveScentBar] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLSpanElement>(null);
  const magicCursorRef = useRef<HTMLDivElement>(null);
  const glowOrb1 = useRef<HTMLDivElement>(null);
  const glowOrb2 = useRef<HTMLDivElement>(null);

  // Fetch product
  useEffect(() => {
    async function fetchProductAndRelated() {
      if (!id) return;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      } else {
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0].size);
        }
        setSelectedImage(data.image_url);
        if (data.category) {
          const { data: relatedData } = await supabase
            .from("products")
            .select("*")
            .eq("category", data.category)
            .neq("id", data.id)
            .limit(4);
          setRelatedProducts(relatedData || []);
        }
        setLoading(false);
      }
    }
    fetchProductAndRelated();
  }, [id]);

  // Removed Parallax + magnetic cursor on image
  useEffect(() => {
    // 360 cursor effect removed per user request
  }, [loading, product]);

  // Animate glowing orbs
  useEffect(() => {
    if (glowOrb1.current) {
      gsap.to(glowOrb1.current, { x: 30, y: -20, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }
    if (glowOrb2.current) {
      gsap.to(glowOrb2.current, { x: -25, y: 15, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }
  }, []);

  // Main entrance animations
  useEffect(() => {
    if (loading || !product) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Floating glow
      gsap.to(".pd-glow", {
        scale: 1.4,
        opacity: 0.7,
        duration: 3.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // Product info stagger reveal
      gsap.fromTo(
        ".pd-stagger",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          stagger: 0.08,
          duration: 0.85,
          ease: "power3.out",
        }
      );

      // Scent cards reveal
      gsap.fromTo(
        ".note-card",
        { opacity: 0, y: 60, rotateX: 15 },
        {
          opacity: 1, y: 0, rotateX: 0,
          stagger: 0.18,
          duration: 0.9,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: ".notes-grid", start: "top 80%" },
        }
      );

      // Scroll reveal for all .reveal-el
      document.querySelectorAll(".reveal-el").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.85,
            scrollTrigger: { trigger: el, start: "top 85%" },
          }
        );
      });

      // Related cards
      gsap.fromTo(
        ".related-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: ".related-grid", start: "top 85%" },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading, product]);

  // Animate price when size changes
  useEffect(() => {
    if (!priceRef.current || !product) return;
    gsap.fromTo(priceRef.current,
      { scale: 1.2, color: "var(--gold-light)" },
      { scale: 1, color: "var(--gold)", duration: 0.4, ease: "power2.out" }
    );
  }, [selectedSize, product]);

  function getAdjustedPrice() {
    if (!product) return 0;
    if (product.sizes && product.sizes.length > 0) {
      const sizeObj = product.sizes.find(s => s.size === selectedSize);
      if (sizeObj) return sizeObj.price;
    }
    return product.price;
  }

  function handleAddToCart() {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addToCart(
        { id: product.id, name: product.name, price: getAdjustedPrice(), image_url: product.image_url, category: product.category },
        selectedSize
      );
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2800);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="loading-spinner" />
          <p style={{ color: "var(--gold)", marginTop: "20px", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Loading Fragrance...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🌿</div>
        <h1 style={{ fontFamily: "var(--font-title)", fontSize: "2rem", color: "var(--gold)", marginBottom: "16px" }}>Fragrance Not Found</h1>
        <button onClick={() => router.push("/products")} className="btn-primary">Browse Collection</button>
      </div>
    );
  }

  return (
    <main
      ref={containerRef}
      style={{ minHeight: "100vh", background: "var(--black)", color: "var(--white)", overflowX: "hidden" }}
    >
      <Navbar />


      {/* Toast */}
      {addedToast && (
        <div className="toast" style={{ zIndex: 9999 }}>
          <span className="toast-icon">✦</span>
          <span className="toast-msg">{product.name} added to cart!</span>
        </div>
      )}

      {/* ─── AMBIENT BACKGROUND ORBS ─── */}
      <div ref={glowOrb1} style={{
        position: "fixed", top: "20%", left: "-5%",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(220,202,187,0.06) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      }} />
      <div ref={glowOrb2} style={{
        position: "fixed", bottom: "20%", right: "-5%",
        width: "350px", height: "350px",
        background: "radial-gradient(circle, rgba(25,41,84,0.4) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      }} />

      {/* ─── BREADCRUMB ─── */}
      <div className="responsive-pad " style={{ padding: "110px 60px 0", maxWidth: "1300px", margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.78rem", color: "var(--white-muted)" }}>
          <Link href="/" style={{ color: "var(--white-muted)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white-muted)")}
          >Home</Link>
          <span style={{ color: "var(--gold)" }}>›</span>
          <Link href="/products" style={{ color: "var(--white-muted)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white-muted)")}
          >Products</Link>
          <span style={{ color: "var(--gold)" }}>›</span>
          {product.category && (
            <>
              <Link href={`/category?cat=${encodeURIComponent(product.category)}`}
                style={{ color: "var(--white-muted)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white-muted)")}
              >
                {product.category}
              </Link>
              <span style={{ color: "var(--gold)" }}>›</span>
            </>
          )}
          <span style={{ color: "var(--gold)" }}>{product.name}</span>
        </div>
      </div>

      {/* ─── SECTION 1: HERO DETAIL ─── */}
      <section className="responsive-pad" style={{ padding: "40px 60px 80px", maxWidth: "1300px", margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div className="pd-grid">
          {/* ── LEFT: Image Column ── */}
          <div style={{ position: "sticky", top: "120px" }}>
            {/* Main image with 3D effect */}
            <div
              ref={imageRef}
              className="pd-image-wrap"
              style={{
                position: "relative",
                borderRadius: "24px",
                overflow: "hidden",
                background: "linear-gradient(135deg, var(--dark-2) 0%, var(--dark-3) 100%)",
                border: "1px solid rgba(220,202,187,0.15)",
                aspectRatio: "3/4",
              }}
            >
              {product.badge && (
                <div style={{
                  position: "absolute", top: "20px", left: "20px", zIndex: 3,
                  background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
                  color: "var(--black)", fontSize: "0.65rem", fontWeight: 700,
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  padding: "7px 16px", borderRadius: "30px",
                  boxShadow: "0 4px 20px rgba(220,202,187,0.4)",
                }}>
                  {product.badge}
                </div>
              )}

              {/* Ambient glow */}
              <div className="pd-glow" style={{
                position: "absolute", inset: "-20%",
                background: "radial-gradient(circle at 50% 50%, rgba(220,202,187,0.2) 0%, transparent 70%)",
                pointerEvents: "none", zIndex: 1,
              }} />

              <Image
                src={selectedImage || product.image_url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                onLoadingComplete={() => setImageLoaded(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transformStyle: "preserve-3d",
                  opacity: imageLoaded ? 1 : 0,
                  transition: "opacity 0.5s ease",
                }}
              />

              {/* Corner decorations */}
              {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => (
                <div key={pos} style={{
                  position: "absolute",
                  [pos.includes("top") ? "top" : "bottom"]: "16px",
                  [pos.includes("left") ? "left" : "right"]: "16px",
                  width: "20px",
                  height: "20px",
                  borderTop: pos.includes("top") ? "2px solid rgba(220,202,187,0.4)" : "none",
                  borderBottom: pos.includes("bottom") ? "2px solid rgba(220,202,187,0.4)" : "none",
                  borderLeft: pos.includes("left") ? "2px solid rgba(220,202,187,0.4)" : "none",
                  borderRight: pos.includes("right") ? "2px solid rgba(220,202,187,0.4)" : "none",
                  zIndex: 2,
                }} />
              ))}
            </div>

            {/* ── Creative Image Gallery ── */}
            {((product.images && product.images.length > 0) || true) && (
              <div style={{
                marginTop: "16px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(65px, 1fr))",
                gap: "10px",
              }}>
                {[product.image_url, ...(product.images || [])].map((imgSrc, i) => (
                  <button
                    key={i}
                    onClick={() => { setImageLoaded(false); setTimeout(() => setSelectedImage(imgSrc), 50); }}
                    style={{
                      background: "var(--dark-2)",
                      border: selectedImage === imgSrc ? "1px solid var(--gold)" : "1px solid rgba(220,202,187,0.15)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      aspectRatio: "1/1",
                      cursor: "pointer",
                      padding: 0,
                      position: "relative",
                      transition: "all 0.3s ease",
                      opacity: selectedImage === imgSrc ? 1 : 0.6,
                      transform: selectedImage === imgSrc ? "scale(1.05)" : "scale(1)",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    onMouseLeave={(e) => { if(selectedImage !== imgSrc) (e.currentTarget as HTMLElement).style.opacity = "0.6"; }}
                  >
                    <Image
                      src={imgSrc}
                      alt=""
                      fill
                      sizes="80px"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {selectedImage === imgSrc && (
                      <div style={{ position: "absolute", inset: 0, border: "2px solid var(--gold)", borderRadius: "12px" }} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Scent Profile */}
            <div style={{
              marginTop: "24px",
              padding: "24px",
              background: "rgba(10,15,36,0.8)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(220,202,187,0.12)",
              borderRadius: "16px",
            }}>
              <h4 style={{ fontSize: "0.68rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: "18px" }}>
                ✦ Scent Profile
              </h4>
              {[
                { label: "Longevity", value: product.longevity || "8-12 Hours", pct: 90 },
                { label: "Sillage", value: product.sillage || "Moderate", pct: 65 },
                { label: "Intensity", value: "Rich", pct: 75 },
              ].map((bar, i) => (
                <div
                  key={bar.label}
                  style={{ marginBottom: "16px" }}
                  onMouseEnter={() => setActiveScentBar(i)}
                  onMouseLeave={() => setActiveScentBar(null)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "7px" }}>
                    <span style={{ color: activeScentBar === i ? "var(--white)" : "var(--white-muted)", transition: "color 0.2s" }}>{bar.label}</span>
                    <span style={{ color: "var(--gold)", fontWeight: 500 }}>{bar.value}</span>
                  </div>
                  <div style={{
                    height: "4px",
                    background: "rgba(220,202,187,0.1)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}>
                    <div
                      className="scent-bar-fill"
                      data-pct={bar.pct}
                      style={{
                        height: "100%",
                        width: `${bar.pct}%`,
                        background: activeScentBar === i
                          ? "linear-gradient(90deg, var(--gold), var(--gold-light))"
                          : "linear-gradient(90deg, var(--gold-dark), var(--gold))",
                        borderRadius: "4px",
                        transition: "background 0.3s",
                        boxShadow: activeScentBar === i ? "0 0 10px rgba(220,202,187,0.5)" : "none",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Info Column ── */}
          <div>
            {product.category && (
              <p className="pd-stagger" style={{
                fontSize: "0.7rem",
                color: "var(--gold)",
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span style={{ width: "20px", height: "1px", background: "var(--gold)", display: "inline-block" }} />
                {product.category}
              </p>
            )}

            {/* Gender Badge */}
            {product.gender && (
              <div className="pd-stagger" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                {(() => {
                  const gMap = {
                    men:    { label: "رجالي",   labelEn: "Men",    icon: "♂", bg: "rgba(106,176,245,0.12)", border: "rgba(106,176,245,0.35)", color: "#6ab0f5" },
                    women:  { label: "نسائي",   labelEn: "Women",  icon: "♀", bg: "rgba(245,160,200,0.12)", border: "rgba(245,160,200,0.35)", color: "#f5a0c8" },
                    unisex: { label: "مشترك",   labelEn: "Unisex", icon: "⚧", bg: "rgba(220,202,187,0.10)", border: "rgba(220,202,187,0.35)", color: "var(--gold)" },
                  };
                  const g = gMap[product.gender];
                  return (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      background: g.bg, border: `1px solid ${g.border}`,
                      color: g.color, borderRadius: "50px",
                      padding: "5px 14px", fontSize: "0.72rem",
                      fontWeight: 600, letterSpacing: "0.08em",
                    }}>
                      <span style={{ fontSize: "0.9rem" }}>{g.icon}</span>
                      {g.labelEn} · {g.label}
                    </span>
                  );
                })()}
              </div>
            )}

            <h1 className="pd-stagger" style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.5rem, 4vw, 3.8rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: "16px",
              textTransform: "uppercase",
            }}>
              {product.name}
            </h1>

            {/* Stars */}
            <div className="pd-stagger" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <div style={{ color: "var(--gold)", fontSize: "1rem", letterSpacing: "2px" }}>★★★★★</div>
              <span style={{ fontSize: "0.8rem", color: "var(--white-muted)" }}>4.9 · 128 Reviews</span>
              {isInCart(product.id) && (
                <span style={{
                  fontSize: "0.7rem", background: "rgba(76,175,80,0.15)",
                  border: "1px solid rgba(76,175,80,0.3)", color: "#4caf50",
                  padding: "3px 10px", borderRadius: "20px",
                }}>✓ In Cart</span>
              )}
            </div>

            {/* Price */}
            <div className="pd-stagger" style={{ marginBottom: "32px" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--white-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Price for {selectedSize}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "6px" }}>
                <span ref={priceRef} style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "3rem",
                  color: "var(--gold)",
                  fontWeight: 700,
                  lineHeight: 1,
                }}>
                  {getAdjustedPrice().toLocaleString()}
                </span>
                <span style={{ fontSize: "1rem", color: "var(--white-muted)" }}>EGP</span>
              </div>
            </div>

            <p className="pd-stagger" style={{
              color: "var(--white-muted)",
              fontSize: "0.95rem",
              lineHeight: 1.85,
              marginBottom: "36px",
              borderLeft: "2px solid rgba(220,202,187,0.3)",
              paddingLeft: "16px",
            }}>
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="pd-stagger" style={{ marginBottom: "28px" }}>
              <p style={{ fontSize: "0.72rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "14px" }}>
                Select Size
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {(product.sizes || []).map((s) => (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSize(s.size)}
                    className="size-btn"
                    style={{
                      padding: "12px 22px",
                      borderRadius: "12px",
                      border: selectedSize === s.size
                        ? "1px solid var(--gold)"
                        : "1px solid rgba(220,202,187,0.15)",
                      background: selectedSize === s.size
                        ? "linear-gradient(135deg, var(--gold), var(--gold-dark))"
                        : "rgba(255,255,255,0.03)",
                      color: selectedSize === s.size ? "var(--black)" : "var(--white-muted)",
                      fontSize: "0.8rem",
                      fontWeight: selectedSize === s.size ? 700 : 400,
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {s.size}
                    <span style={{
                      display: "block",
                      fontSize: "0.65rem",
                      opacity: 0.7,
                      marginTop: "2px",
                      fontWeight: 400,
                    }}>
                      {s.price.toLocaleString()} EGP
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="pd-stagger" style={{ marginBottom: "32px" }}>
              <p style={{ fontSize: "0.72rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "14px" }}>
                Quantity
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0", width: "fit-content" }}>
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{
                    width: "44px", height: "44px",
                    background: "rgba(220,202,187,0.06)",
                    border: "1px solid rgba(220,202,187,0.15)",
                    borderRadius: "12px 0 0 12px",
                    color: "var(--white)",
                    fontSize: "1.3rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(220,202,187,0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(220,202,187,0.06)")}
                >−</button>
                <div style={{
                  width: "60px", height: "44px",
                  background: "rgba(220,202,187,0.04)",
                  border: "1px solid rgba(220,202,187,0.15)",
                  borderLeft: "none", borderRight: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.2rem", color: "var(--gold)",
                }}>
                  {qty}
                </div>
                <button
                  onClick={() => setQty(qty + 1)}
                  style={{
                    width: "44px", height: "44px",
                    background: "rgba(220,202,187,0.06)",
                    border: "1px solid rgba(220,202,187,0.15)",
                    borderRadius: "0 12px 12px 0",
                    color: "var(--white)",
                    fontSize: "1.3rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(220,202,187,0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(220,202,187,0.06)")}
                >+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pd-stagger" style={{ display: "flex", gap: "14px", marginBottom: "36px", flexWrap: "wrap" }}>
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  minWidth: "200px",
                  padding: "18px 28px",
                  background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
                  color: "var(--black)",
                  border: "none",
                  borderRadius: "14px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: "0 8px 30px rgba(220,202,187,0.3)",
                  fontFamily: "var(--font-sans)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 50px rgba(220,202,187,0.45)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(220,202,187,0.3)";
                }}
              >
                Add to Cart ✦
              </button>
              <Link
                href="/cart"
                style={{
                  flex: 1,
                  minWidth: "140px",
                  padding: "18px 24px",
                  background: "transparent",
                  color: "var(--gold)",
                  border: "1px solid rgba(220,202,187,0.3)",
                  borderRadius: "14px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(220,202,187,0.08)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.3)";
                }}
              >
                View Cart →
              </Link>
            </div>

            {/* ── NEW: Cinematic Video Embed ── */}
            {product.video_url && (
              <div className="pd-stagger" style={{
                marginBottom: "36px",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid rgba(220,202,187,0.15)",
                background: "var(--dark-2)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(220,202,187,0.1)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "var(--gold)" }}>▶</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--white)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Campaign Film</span>
                </div>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                  <iframe
                    src={(() => {
                      const url = product.video_url;
                      if (!url) return "";
                      let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
                      if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}`;
                      let vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                      if (vimeoMatch && vimeoMatch[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                      let tiktokMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
                      if (tiktokMatch && tiktokMatch[1]) return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;
                      return url;
                    })()}
                    title={`${product.name} Video`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  />
                </div>
              </div>
            )}

            {/* Trust Meta */}
            <div className="pd-stagger" style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              padding: "24px",
              background: "rgba(220,202,187,0.03)",
              border: "1px solid rgba(220,202,187,0.08)",
              borderRadius: "16px",
            }}>
              {[
                { icon: "👑", label: "Premium Quality", sub: "Niche Concentration" },
                { icon: "📦", label: "Gift Ready", sub: "Luxury Packaging" },
                { icon: "⚡", label: "Fast Delivery", sub: "Cairo 24hr" },
              ].map((m) => (
                <div key={m.label} style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "8px" }}>{m.icon}</span>
                  <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--white)", marginBottom: "2px" }}>{m.label}</p>
                  <p style={{ fontSize: "0.68rem", color: "var(--white-muted)" }}>{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    

      {/* ─── SECTION 2: TABS ─── */}
      <section style={{
        borderTop: "1px solid rgba(220,202,187,0.1)",
        background: "linear-gradient(to bottom, var(--dark) 0%, var(--black) 100%)",
        position: "relative",
        zIndex: 2,
      }}>
        {/* Tab Nav */}
        <div className="responsive-pad" style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 60px", borderBottom: "1px solid rgba(220,202,187,0.08)" }}>
          <div style={{ display: "flex", gap: "0" }}>
            {(["notes", "ritual", "story"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "22px 36px",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab ? "2px solid var(--gold)" : "2px solid transparent",
                  color: activeTab === tab ? "var(--gold)" : "var(--white-muted)",
                  fontSize: "0.82rem",
                  fontWeight: activeTab === tab ? 600 : 400,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "var(--font-sans)",
                  marginBottom: "-1px",
                }}
              >
                {tab === "notes" ? "Olfactory Notes" : tab === "ritual" ? "Application Guide" : "Brand Story"}
              </button>
            ))}
          </div>
        </div>

        <div className="responsive-pad" style={{ maxWidth: "1300px", margin: "0 auto", padding: "70px 60px 90px" }}>
          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "60px" }}>
                <span className="section-tag" style={{ color: "var(--gold)" }}>✦ Olfactory Architecture</span>
                <h2 className="section-title" style={{ marginTop: "12px", fontSize: "2.4rem" }}>The Scent Pyramid</h2>
                <p style={{ color: "var(--white-muted)", maxWidth: "540px", margin: "14px auto 0", fontSize: "0.92rem", lineHeight: 1.8 }}>
                  This fragrance unfolds in three distinctive acts, each revealing new layers of olfactory complexity.
                </p>
              </div>
              <div className="notes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "28px" }}>
                {[
                  { num: "I", label: "Top Notes", sub: "The Awakening — First 30 mins", value: product.top_notes, icon: "✨", color: "#f6f0ea" },
                  { num: "II", label: "Heart Notes", sub: "The Essence — 2 to 6 hours", value: product.heart_notes, icon: "🌹", color: "#dbcabb" },
                  { num: "III", label: "Base Notes", sub: "The Legacy — 6+ hours", value: product.base_notes, icon: "🪵", color: "#bba998" },
                ].map((note) =>
                  note.value ? (
                    <div key={note.num} className="note-card" style={{
                      background: "rgba(10,15,36,0.8)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(220,202,187,0.1)",
                      borderTop: `3px solid ${note.color}`,
                      borderRadius: "20px",
                      padding: "36px 28px",
                      transition: "all 0.35s ease",
                    }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.5)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      <div style={{ fontSize: "2.2rem", marginBottom: "16px" }}>{note.icon}</div>
                      <div style={{ fontFamily: "var(--font-serif)", color: note.color, fontSize: "2rem", marginBottom: "8px", fontWeight: 700 }}>{note.num}.</div>
                      <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", color: "var(--white)", marginBottom: "6px" }}>{note.label}</h3>
                      <p style={{ fontSize: "0.7rem", color: "var(--gold-dark)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>{note.sub}</p>
                      <p style={{ color: "var(--white-muted)", fontSize: "0.88rem", lineHeight: 1.7 }}>{note.value}</p>
                    </div>
                  ) : null
                )}
                {!product.top_notes && !product.heart_notes && !product.base_notes && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--white-muted)", padding: "60px" }}>
                    <span style={{ fontSize: "3rem", opacity: 0.3 }}>🌿</span>
                    <p style={{ marginTop: "16px" }}>Olfactory notes not specified for this fragrance.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RITUAL TAB */}
          {activeTab === "ritual" && (
            <div className="reveal-el">
              <div style={{ textAlign: "center", marginBottom: "60px" }}>
                <span className="section-tag" style={{ color: "var(--gold)" }}>✦ Application Guide</span>
                <h2 className="section-title" style={{ marginTop: "12px", fontSize: "2.4rem" }}>The Application Ritual</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
                {[
                  { step: "01", title: "Pulse Points", desc: "Apply directly to inner wrists, sides of neck, and behind ears — where skin is warmest for maximum diffusion.", icon: "💫" },
                  { step: "02", title: "Never Rub", desc: "Do not rub wrists together after application. This breaks down the volatile top note molecules and ruins the opening.", icon: "🚫" },
                  { step: "03", title: "Layer Wisely", desc: "For longevity, apply after a shower to freshly moisturised skin. The oils help anchor fragrance molecules.", icon: "🧴" },
                  { step: "04", title: "Preserve", desc: "Store in its velvet box away from light, heat, and humidity. Extreme temperatures destroy fragrance integrity.", icon: "📦" },
                ].map((s) => (
                  <div key={s.step} style={{
                    background: "rgba(10,15,36,0.8)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(220,202,187,0.1)",
                    borderRadius: "20px",
                    padding: "32px",
                    transition: "all 0.3s ease",
                  }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.3)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.1)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ fontSize: "1.8rem", marginBottom: "16px" }}>{s.icon}</div>
                    <div style={{ fontFamily: "var(--font-serif)", color: "var(--gold)", fontSize: "0.75rem", letterSpacing: "0.2em", marginBottom: "10px" }}>STEP {s.step}</div>
                    <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", marginBottom: "12px" }}>{s.title}</h3>
                    <p style={{ color: "var(--white-muted)", fontSize: "0.87rem", lineHeight: 1.7 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STORY TAB */}
          {activeTab === "story" && (
            <div className="reveal-el about-grid" style={{ alignItems: "center" }}>
              <div>
                <span className="section-tag" style={{ color: "var(--gold)" }}>✦ Our Heritage</span>
                <h2 className="section-title" style={{ marginTop: "12px", fontSize: "2.4rem", marginBottom: "24px" }}>
                  Crafted in Egypt, <span className="gold-text">Inspired by the Stars</span>
                </h2>
                <p style={{ color: "var(--white-muted)", fontSize: "0.95rem", lineHeight: 1.85, marginBottom: "18px" }}>
                  Every bottle of {product.name} is a testament to our belief that fine fragrance is the most powerful form of self-expression. It was composed by a master perfumer with over 30 years of experience sourcing from the world&apos;s rarest olfactory gardens.
                </p>
                <p style={{ color: "var(--white-muted)", fontSize: "0.95rem", lineHeight: 1.85, marginBottom: "32px" }}>
                  The inspiration for this fragrance comes from the ancient spice routes that once connected Egypt to the Orient — a journey of discovery, luxury, and timeless allure.
                </p>
                <Link href="/about" className="btn-gold-outline">Discover Our Nubia →</Link>
              </div>
              <div style={{ position: "relative", height: "450px", borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(220,202,187,0.15)" }}>
                <Image
                  src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800"
                  alt="Perfume craftsmanship"
                  fill
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = "scale(1)")}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── SECTION 3: RELATED PRODUCTS ─── */}
      {relatedProducts.length > 0 && (
        <section className="responsive-pad" style={{ padding: "100px 60px 120px", background: "var(--dark-2)", position: "relative", zIndex: 2 }}>
          <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "50px", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <span className="section-tag" style={{ color: "var(--gold)" }}>✦ Same Olfactory Family</span>
                <h2 className="section-title" style={{ fontSize: "2.4rem", marginTop: "12px" }}>Perfect Pairings</h2>
              </div>
              <Link
                href={`/products`}
                className="btn-gold-outline"
                style={{ padding: "12px 28px" }}
              >
                View All Products
              </Link>
            </div>

            <div className="related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "28px" }}>
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/product/${rel.id}`}
                  className="related-card"
                  style={{
                    display: "block",
                    background: "rgba(10,15,36,0.8)",
                    border: "1px solid rgba(220,202,187,0.1)",
                    borderRadius: "20px",
                    overflow: "hidden",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.4s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.35)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.1)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <div style={{ position: "relative", height: "280px", overflow: "hidden" }}>
                    <Image
                      src={rel.image_url}
                      alt={rel.name}
                      fill
                      sizes="(max-width: 768px) 90vw, 280px"
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = "scale(1.08)")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = "scale(1)")}
                    />
                    {rel.badge && (
                      <span style={{
                        position: "absolute", top: "14px", left: "14px",
                        background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
                        color: "var(--black)", fontSize: "0.6rem", fontWeight: 700,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "4px 10px", borderRadius: "20px",
                      }}>{rel.badge}</span>
                    )}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                    }} />
                    <div style={{
                      position: "absolute", bottom: "16px", left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(220,202,187,0.9)",
                      color: "var(--black)", padding: "9px 20px", borderRadius: "30px",
                      fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em",
                      textTransform: "uppercase", whiteSpace: "nowrap", opacity: 0,
                      transition: "opacity 0.3s ease",
                    }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "1")}
                    >
                      View Details →
                    </div>
                  </div>
                  <div style={{ padding: "20px 22px" }}>
                    <span style={{ fontSize: "0.65rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{rel.category}</span>
                    <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", marginTop: "6px", marginBottom: "12px" }}>{rel.name}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-serif)", color: "var(--gold)", fontSize: "1.2rem", fontWeight: 700 }}>
                        {rel.price.toLocaleString()} EGP
                      </span>
                      <div style={{ color: "var(--gold)", fontSize: "0.7rem" }}>★★★★★</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
