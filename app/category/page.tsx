"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const GENDER_SECTIONS = [
  {
    id: "men",
    title: "For Him",
    titleAr: "للرجال",
    sub: "Bold, intense & commanding.",
    subAr: "جريء، قوي، لا يُنسى.",
    img: "/perfume_1.png",
    accent: "#6ab0f5",
    bg: "linear-gradient(135deg, #06091a 0%, #0d1b35 60%, #0a1428 100%)",
    glow: "rgba(106,176,245,0.18)",
    num: "01",
  },
  {
    id: "women",
    title: "For Her",
    titleAr: "للنساء",
    sub: "Elegant, floral & captivating.",
    subAr: "أنيق، زهري، ساحر.",
    img: "/perfume_2.png",
    accent: "#f5a0c8",
    bg: "linear-gradient(135deg, #1a050e 0%, #35091e 60%, #200710 100%)",
    glow: "rgba(245,160,200,0.18)",
    num: "02",
  },
  {
    id: "unisex",
    title: "Unisex",
    titleAr: "للجنسين",
    sub: "Balanced, fresh & harmonious.",
    subAr: "متوازن، عصري، للجميع.",
    img: "/perfume_3.png",
    accent: "#dbcabb",
    bg: "linear-gradient(135deg, #0a0f1a 0%, #161c2e 60%, #0d1120 100%)",
    glow: "rgba(220,202,187,0.15)",
    num: "03",
  },
  {
    id: "oriental",
    title: "Oriental",
    titleAr: "شرقي",
    sub: "Rich oud, amber & Eastern spice.",
    subAr: "عود فاخر، عنبر، وتوابل شرقية.",
    img: "/perfume_4.png",
    accent: "#e8b86d",
    bg: "linear-gradient(135deg, #130a02 0%, #2a1505 60%, #1a0d03 100%)",
    glow: "rgba(232,184,109,0.18)",
    num: "04",
  },
];

function CategoryContent() {
  const { products, loading } = useProducts();
  const { addToCart, isInCart } = useCart();
  const { isRTL } = useLanguage();
  const pageRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  function handleAdd(e: React.MouseEvent, product: any) {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, category: product.category });
    setToast(product.name);
    setTimeout(() => setToast(null), 2500);
  }

  // ─── Hero entrance ───
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".cg-hero-tag",
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)", delay: 0.1 }
      );
      gsap.fromTo(".cg-hero-title",
        { opacity: 0, y: 70 },
        { opacity: 1, y: 0, duration: 1.4, ease: "expo.out", delay: 0.3 }
      );
      gsap.fromTo(".cg-hero-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: "power3.out", delay: 0.8 }
      );
      gsap.fromTo(".cg-num",
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, stagger: 0.15, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: ".cg-sections", start: "top 80%" } }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  // ─── Section scroll reveals ───
  useEffect(() => {
    const ctx = gsap.context(() => {
      GENDER_SECTIONS.forEach((sec) => {
        const el = document.querySelector(`.cg-section-${sec.id}`);
        if (!el) return;
        gsap.fromTo(`.cg-section-${sec.id} .cg-sec-text`,
          { opacity: 0, x: isRTL ? 60 : -60 },
          { opacity: 1, x: 0, duration: 1.1, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 70%" } }
        );
        gsap.fromTo(`.cg-section-${sec.id} .cg-sec-img`,
          { opacity: 0, x: isRTL ? -60 : 60, scale: 0.92 },
          { opacity: 1, x: 0, scale: 1, duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 70%" } }
        );
        gsap.fromTo(`.cg-section-${sec.id} .cg-prod-card`,
          { opacity: 0, y: 50, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: `.cg-section-${sec.id} .cg-products-row`, start: "top 82%" } }
        );
      });
    }, pageRef);
    return () => ctx.revert();
  }, [isRTL, loading]);

  return (
    <div ref={pageRef} style={{ background: "var(--black)", color: "var(--white)", minHeight: "100vh", overflowX: "hidden" }}>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span className="toast-icon">✦</span>
          <span className="toast-msg">{toast} added to cart!</span>
        </div>
      )}

      {/* ══ HERO ══ */}
      <section style={{
        minHeight: "55vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg, #06091a 0%, #0f1635 50%, #06091a 100%)",
        position: "relative", overflow: "hidden", paddingTop: "100px",
      }}>
        {/* Grid bg */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(220,202,187,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(220,202,187,0.03) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Glow orbs */}
        {GENDER_SECTIONS.map((s, i) => (
          <div key={s.id} style={{
            position: "absolute", borderRadius: "50%", pointerEvents: "none",
            width: "300px", height: "300px",
            background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,
            left: `${15 + i * 20}%`, top: `${30 + (i % 2) * 20}%`,
            filter: "blur(40px)", opacity: 0.6,
          }} />
        ))}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px", maxWidth: "900px" }}>
          <span className="cg-hero-tag" style={{
            display: "inline-block", border: "1px solid rgba(220,202,187,0.35)",
            borderRadius: "40px", padding: "6px 22px", fontSize: "0.7rem",
            letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)",
            marginBottom: "28px", background: "rgba(220,202,187,0.05)",
          }}>✦ Nubia Collection</span>
          <h1 className="cg-hero-title" style={{
            fontFamily: "var(--font-serif)", fontSize: "clamp(3rem,7vw,6rem)",
            fontWeight: 700, textTransform: "uppercase", lineHeight: 1.05, marginBottom: "28px",
          }}>
            Find Your<br /><span className="gold-text">Signature</span>
          </h1>
          <div className="cg-hero-line" style={{
            width: "80px", height: "1px", background: "var(--gold)",
            margin: "0 auto", transformOrigin: "left",
          }} />
          {/* Gender nav pills */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "40px" }}>
            {GENDER_SECTIONS.map((s) => (
              <a key={s.id} href={`#section-${s.id}`}
                onClick={() => setActiveSection(s.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "11px 26px", borderRadius: "50px",
                  border: `1px solid ${activeSection === s.id ? s.accent : "rgba(220,202,187,0.18)"}`,
                  background: activeSection === s.id ? `${s.accent}18` : "transparent",
                  color: activeSection === s.id ? s.accent : "var(--white-muted)",
                  fontSize: "0.8rem", fontWeight: activeSection === s.id ? 700 : 400,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  textDecoration: "none", transition: "all 0.3s ease",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <span>{s.num}</span>
                {isRTL ? s.titleAr : s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GENDER SECTIONS ══ */}
      <div className="cg-sections">
        {GENDER_SECTIONS.map((sec, secIdx) => {
          const secProducts = loading ? [] : products.filter(p =>
            sec.id === "oriental"
              ? p.category?.toLowerCase().includes("oriental") || p.category?.toLowerCase().includes("oud")
              : (p.gender || "unisex") === sec.id
          ).slice(0, 4);
          const isEven = secIdx % 2 === 0;

          return (
            <section
              id={`section-${sec.id}`}
              key={sec.id}
              className={`cg-section-${sec.id}`}
              style={{
                padding: "120px 60px", position: "relative", overflow: "hidden",
                background: sec.bg,
                borderTop: `1px solid ${sec.accent}22`,
              }}
            >
              {/* Ambient glow */}
              <div style={{
                position: "absolute", pointerEvents: "none",
                width: "600px", height: "600px", borderRadius: "50%",
                background: `radial-gradient(circle, ${sec.glow} 0%, transparent 70%)`,
                [isEven ? "right" : "left"]: "-100px", top: "50%",
                transform: "translateY(-50%)", filter: "blur(60px)",
              }} />

              <div style={{ maxWidth: "1300px", margin: "0 auto", position: "relative", zIndex: 2 }}>

                {/* ── Watermark number — clipped to section ── */}
                <div style={{
                  position: "absolute",
                  top: "0px",
                  [isEven ? "right" : "left"]: "0px",
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(6rem, 12vw, 14rem)",
                  fontWeight: 800,
                  color: `${sec.accent}0e`,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  pointerEvents: "none", userSelect: "none",
                  lineHeight: 1, zIndex: 0,
                  overflow: "hidden",
                }} className="cg-num">{sec.num}</div>

                {/* ── Section header row ── */}
                <div className={`cg-sec-text`} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                  marginBottom: "70px", flexWrap: "wrap", gap: "24px",
                  flexDirection: isRTL ? "row-reverse" : "row",
                  position: "relative", zIndex: 3,
                }}>
                  <div>
                    <span style={{ fontSize: "0.68rem", color: sec.accent, letterSpacing: "0.3em", textTransform: "uppercase", display: "block", marginBottom: "14px" }}>
                      ✦ {isRTL ? sec.subAr : sec.sub}
                    </span>
                    <h2 style={{
                      fontFamily: "var(--font-serif)", fontWeight: 700, textTransform: "uppercase",
                      fontSize: "clamp(2.8rem,5vw,5rem)", lineHeight: 1.05, color: "#fff",
                    }}>
                      {isRTL ? sec.titleAr : sec.title}
                    </h2>
                  </div>
                  <Link href={`/products?gender=${sec.id}`} style={{
                    display: "inline-flex", alignItems: "center", gap: "10px",
                    border: `1px solid ${sec.accent}55`, borderRadius: "50px",
                    padding: "13px 30px", color: sec.accent,
                    fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.1em",
                    textTransform: "uppercase", textDecoration: "none",
                    transition: "all 0.3s ease", background: `${sec.accent}0d`,
                    fontFamily: "var(--font-sans)",
                  }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = `${sec.accent}22`;
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = `${sec.accent}0d`;
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    {isRTL ? "تسوق الآن" : "Shop All"} →
                  </Link>
                </div>

                {/* ── Feature image + product cards ── */}
                <div className="cg-grid-container" style={{
                  display: "grid",
                  gridTemplateColumns: "340px 1fr",
                  gap: "28px", alignItems: "start",
                  direction: isEven ? (isRTL ? "rtl" : "ltr") : (isRTL ? "ltr" : "rtl"),
                }}>

                  {/* Feature image */}
                  <div className="cg-sec-img" style={{
                    borderRadius: "24px", overflow: "hidden",
                    border: `1px solid ${sec.accent}30`,
                    height: "460px", position: "relative",
                    boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 60px ${sec.glow}`,
                    direction: isRTL ? "rtl" : "ltr",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sec.img} alt={sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease" }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = "scale(1)")}
                    />
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${sec.bg.split(",")[0].replace("linear-gradient(135deg, ", "")} 0%, transparent 50%)` }} />
                    <div style={{
                      position: "absolute", bottom: "24px", left: "24px",
                      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
                      border: `1px solid ${sec.accent}40`, borderRadius: "14px",
                      padding: "14px 20px",
                    }}>
                      <div style={{ fontSize: "0.6rem", color: sec.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>Collection</div>
                      <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#fff", fontWeight: 700, textTransform: "uppercase" }}>
                        {isRTL ? sec.titleAr : sec.title}
                      </div>
                    </div>
                  </div>

                  {/* Products grid */}
                  <div className="cg-products-row" style={{
                    display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "20px", direction: isRTL ? "rtl" : "ltr",
                  }}>
                    {loading
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="cg-prod-card" style={{
                            background: "rgba(255,255,255,0.04)", borderRadius: "16px",
                            height: "280px", animation: "pulse 1.8s infinite",
                          }} />
                        ))
                      : secProducts.length === 0
                      ? (
                          <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "280px", gap: "16px" }}>
                            <div style={{ fontSize: "3rem", opacity: 0.2 }}>🌿</div>
                            <p style={{ color: "var(--white-muted)", fontSize: "0.9rem" }}>No fragrances yet in this collection.</p>
                            <Link href="/dashboard" style={{ fontSize: "0.75rem", color: sec.accent, textDecoration: "none", border: `1px solid ${sec.accent}44`, padding: "8px 20px", borderRadius: "30px" }}>
                              Add Products →
                            </Link>
                          </div>
                        )
                      : secProducts.map((product, i) => (
                          <CatGenderCard key={product.id} product={product} index={i} accent={sec.accent} inCart={isInCart(product.id)} onAdd={(e) => handleAdd(e, product)} />
                        ))
                    }
                  </div>
                </div>

              </div>
            </section>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--black)" }} />}>
      <CategoryContent />
    </Suspense>
  );
}

/* ─── Gender Product Card ─── */
function CatGenderCard({
  product, index, accent, inCart, onAdd,
}: {
  product: any; index: number; accent: string; inCart: boolean;
  onAdd: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const hoverImg = product.images?.[0] ?? null;
  const hasHover = !!hoverImg && hoverImg !== product.image_url;

  return (
    <Link
      href={`/product/${product.id}`}
      className="cg-prod-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block", textDecoration: "none", color: "inherit",
        background: "rgba(10,15,36,0.7)",
        border: hovered ? `1px solid ${accent}66` : "1px solid rgba(220,202,187,0.08)",
        borderRadius: "18px", overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hovered ? `0 24px 60px rgba(0,0,0,0.5), 0 0 30px ${accent}22` : "0 4px 16px rgba(0,0,0,0.3)",
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: "220px", overflow: "hidden", background: "var(--dark-2)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image_url} alt={product.name} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          transition: "opacity 0.5s ease, transform 0.7s ease",
          opacity: hovered && hasHover ? 0 : 1,
          transform: hovered ? "scale(1.08)" : "scale(1)", zIndex: 1,
        }} />
        {hasHover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hoverImg} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            transition: "opacity 0.5s ease, transform 0.7s ease",
            opacity: hovered ? 1 : 0, transform: hovered ? "scale(1.04)" : "scale(1.1)", zIndex: 2,
          }} />
        )}
        {product.badge && (
          <span style={{
            position: "absolute", top: "12px", left: "12px", zIndex: 5,
            background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
            color: "#000", fontSize: "0.58rem", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "4px 10px", borderRadius: "20px",
          }}>{product.badge}</span>
        )}
        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)",
          opacity: hovered ? 1 : 0, transition: "opacity 0.35s ease",
        }} />
        <button onClick={onAdd} style={{
          position: "absolute", bottom: "14px", left: "50%", zIndex: 6,
          transform: hovered ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(14px)",
          opacity: hovered ? 1 : 0, transition: "all 0.35s ease",
          background: inCart ? "rgba(76,175,80,0.9)" : `${accent}ee`,
          color: "#000", border: "none", padding: "9px 22px",
          borderRadius: "30px", fontSize: "0.7rem", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
          whiteSpace: "nowrap",
        }}>
          {inCart ? "✓ In Cart" : "+ Add to Cart"}
        </button>
      </div>
      {/* Body */}
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: "0.62rem", color: accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "5px" }}>
          {product.category || "Luxury"}
        </div>
        <h3 style={{ fontFamily: "var(--font-title)", fontSize: "0.95rem", color: "#fff", marginBottom: "6px", lineHeight: 1.3 }}>
          {product.name}
        </h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontFamily: "var(--font-serif)", color: accent, fontSize: "1.05rem", fontWeight: 700 }}>
            {product.price.toLocaleString()} <span style={{ fontSize: "0.7rem", fontWeight: 400 }}>EGP</span>
          </span>
          <span style={{ fontSize: "0.62rem", color: "var(--gold)", letterSpacing: "1px" }}>★★★★★</span>
        </div>
      </div>
    </Link>
  );
}
