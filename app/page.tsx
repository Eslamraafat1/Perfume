"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProducts } from "./context/ProductContext";
import { useCart } from "./context/CartContext";
import { useSiteContent } from "./context/SiteContentContext";
import { useLanguage } from "./context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import CategorySection from "@/components/CategorySection";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── static icon data (text comes from translations) ─── */
const NOTE_KEYS = [
  { icon: "🪵", nameKey: "note1_name", originKey: "note1_origin", descKey: "note1_desc" },
  { icon: "🌹", nameKey: "note2_name", originKey: "note2_origin", descKey: "note2_desc" },
  { icon: "🍦", nameKey: "note3_name", originKey: "note3_origin", descKey: "note3_desc" },
  { icon: "🍊", nameKey: "note4_name", originKey: "note4_origin", descKey: "note4_desc" },
  { icon: "🌿", nameKey: "note5_name", originKey: "note5_origin", descKey: "note5_desc" },
  { icon: "🌸", nameKey: "note6_name", originKey: "note6_origin", descKey: "note6_desc" },
];

const PROCESS_STEP_ICONS = ["🌿", "⏳", "🔬", "✦"];
const PROCESS_NUMS = ["01", "02", "03", "04"];
const PROCESS_TITLE_KEYS = ["proc_step1_title", "proc_step2_title", "proc_step3_title", "proc_step4_title"];
const PROCESS_DESC_KEYS = ["proc_step1_desc", "proc_step2_desc", "proc_step3_desc", "proc_step4_desc"];

const TESTIMONIAL_KEYS = [
  { stars: 5, textKey: "test1_text", nameKey: "test1_name", roleKey: "test_role", productKey: "test1_product" },
  { stars: 5, textKey: "test2_text", nameKey: "test2_name", roleKey: "test_role", productKey: "test2_product" },
  { stars: 5, textKey: "test3_text", nameKey: "test3_name", roleKey: "test_role", productKey: "test3_product" },
];

// Categories are now dynamic — built inside the component from SiteContentContext

export default function HomePage() {
  const { products, loading } = useProducts();
  const { get: sc } = useSiteContent();
  const { t, isRTL } = useLanguage();
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const featuredProducts = products.slice(0, 4);

  // Build categories dynamically from Supabase site_content
  const CATEGORIES_DATA = [
    { slug: sc("cat1_slug"), label: sc("cat1_name"), sub: sc("cat1_sub"), img: sc("cat1_image"), color: "#5c3a1e" },
    { slug: sc("cat2_slug"), label: sc("cat2_name"), sub: sc("cat2_sub"), img: sc("cat2_image"), color: "#7b2d52" },
    { slug: sc("cat3_slug"), label: sc("cat3_name"), sub: sc("cat3_sub"), img: sc("cat3_image"), color: "#1a4a5c" },
    { slug: sc("cat4_slug"), label: sc("cat4_name"), sub: sc("cat4_sub"), img: sc("cat4_image"), color: "#6b3a1f" },
  ];

  /* ── Auto-rotate testimonials ── */
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  /* ── GSAP scroll reveals ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.batch(".fade-up", {
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: "power3.out" }),
        start: "top 88%",
      });
    }, pageRef);
    return () => ctx.revert();
  }, [products.length]);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  }

  /* ── Build translated data arrays ── */
  const NOTES = NOTE_KEYS.map((n) => ({ icon: n.icon, name: t(n.nameKey), origin: t(n.originKey), desc: t(n.descKey) }));
  const PROCESS_STEPS = PROCESS_STEP_ICONS.map((icon, i) => ({ num: PROCESS_NUMS[i], title: t(PROCESS_TITLE_KEYS[i]), desc: t(PROCESS_DESC_KEYS[i]), icon }));
  const TESTIMONIALS = TESTIMONIAL_KEYS.map((tk) => ({ stars: tk.stars, text: t(tk.textKey), name: t(tk.nameKey), role: t(tk.roleKey), product: t(tk.productKey) }));

  return (
    <div ref={pageRef} style={{ background: "var(--black)", color: "var(--white)", overflowX: "hidden", direction: isRTL ? "rtl" : "ltr" }}>
      <Navbar />

      {/* ══════════════════════════════════════════════
          SECTION 1 — HERO CAROUSEL
      ══════════════════════════════════════════════ */}
      <HeroCarousel />

      {/* ══════════════════════════════════════════════
          NEW SECTION — CATEGORY SECTION
      ══════════════════════════════════════════════ */}
      <CategorySection />


      {/* ══════════════════════════════════════════════
          NEW SECTION — CURATED LOOKBOOK
      ══════════════════════════════════════════════ */}
     

      {/* ══════════════════════════════════════════════
          SECTION 4 — FEATURED PRODUCTS
      ══════════════════════════════════════════════ */}
      <section className="responsive-pad" style={{ padding: "0 60px 120px", background: "var(--dark)" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "50px" }}>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--gold)", letterSpacing: "0.35em", textTransform: "uppercase" }}>{t("prod_eyebrow")}</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", marginTop: "12px", textTransform: "uppercase", fontWeight: 700 }}>
                {t("prod_title")}
              </h2>
            </div>
            <Link href="/products" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              border: "1px solid rgba(220,202,187,0.3)", borderRadius: "50px",
              padding: "12px 28px", fontSize: "0.78rem", color: "var(--gold)",
              textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase",
              transition: "all 0.3s ease", fontFamily: "var(--font-sans)",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(220,202,187,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.3)"; }}
            >
              {t("prod_view_all")}
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "28px" }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ background: "var(--dark-2)", borderRadius: "20px", overflow: "hidden", opacity: 0.4, animation: "pulse 1.8s infinite" }}>
                    <div style={{ height: "340px", background: "var(--dark-3)" }} />
                    <div style={{ padding: "24px" }}>
                      <div style={{ height: "18px", background: "var(--dark-3)", borderRadius: "4px", marginBottom: "10px" }} />
                      <div style={{ height: "14px", background: "var(--dark-3)", borderRadius: "4px", width: "60%" }} />
                    </div>
                  </div>
                ))
              : featuredProducts.length === 0
              ? (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 20px" }}>
                  <div style={{ fontSize: "4rem", opacity: 0.3, marginBottom: "20px" }}>🌹</div>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.5rem", marginBottom: "12px" }}>{t("prod_no_fragrances")}</h3>
                  <p style={{ color: "var(--white-muted)", marginBottom: "28px" }}>{t("prod_no_fragrances_desc")}</p>
                  <Link href="/dashboard" style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
                    color: "var(--black)", padding: "14px 32px", borderRadius: "50px",
                    fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.1em",
                    textDecoration: "none", textTransform: "uppercase",
                    fontFamily: "var(--font-sans)",
                  }}>
                    {t("prod_go_dashboard")}
                  </Link>
                </div>
              )
              : featuredProducts.map((product, i) => (
                  <HomeProductCard key={product.id} product={product} index={i} />
                ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — THE FRAGRANCE PROCESS
      ══════════════════════════════════════════════ */}
     

      {/* ══════════════════════════════════════════════
          NEW SECTION — THE ART OF GIFTING
      ══════════════════════════════════════════════ */}
    

      {/* ══════════════════════════════════════════════
          SECTION 6 — RARE INGREDIENTS
      ══════════════════════════════════════════════ */}
   

      {/* ══════════════════════════════════════════════
          NEW SECTION — EDITORIAL SPOTLIGHT
      ══════════════════════════════════════════════ */}
    

      {/* ══════════════════════════════════════════════
          SECTION 7 — BRAND STORY SPLIT
      ══════════════════════════════════════════════ */}
   

     


      <Footer />
    </div>
  );
}

/* ─── Home Product Card ─── */
function HomeProductCard({ product, index }: { product: any; index: number }) {
  const { addToCart, isInCart } = useCart();
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const hoverImage = product.images?.[0] ?? null;
  const hasHoverImage = !!hoverImage && hoverImage !== product.image_url;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, category: product.category });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="fade-up"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        background: "rgba(10,15,36,0.7)",
        border: hovered ? "1px solid rgba(220,202,187,0.4)" : "1px solid rgba(220,202,187,0.1)",
        borderRadius: "20px",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "all 0.45s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-10px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: hovered ? "0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(220,202,187,0.12)" : "0 4px 20px rgba(0,0,0,0.3)",
        animationDelay: `${index * 0.06}s`,
      }}
    >
      {/* ── Image zone ── */}
      <div style={{ position: "relative", height: "340px", overflow: "hidden", background: "var(--dark-2)" }}>

        {/* Primary image */}
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="home-prod-img-primary"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%", objectFit: "cover",
            transition: "opacity 0.55s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            opacity: hovered && hasHoverImage ? 0 : 1,
            zIndex: 1,
          }}
        />

        {/* Hover image */}
        {hasHoverImage && (
          <Image
            src={hoverImage}
            alt={`${product.name} alternate`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="home-prod-img-hover"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%", objectFit: "cover",
              transition: "opacity 0.55s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
              transform: hovered ? "scale(1.04)" : "scale(1.12)",
              opacity: hovered ? 1 : 0,
              zIndex: 2,
            }}
          />
        )}

        {/* Shimmer sweep */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          backgroundPositionX: hovered ? "0%" : "200%",
          transition: "background-position 0.65s ease",
        }} />

        {/* "Alt View" pill — drops in from top */}
        {hasHoverImage && (
          <div style={{
            position: "absolute", top: "12px", left: "50%",
            transform: `translateX(-50%) translateY(${hovered ? "0px" : "-34px"})`,
            opacity: hovered ? 1 : 0,
            transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            zIndex: 5,
            background: "rgba(10,15,36,0.88)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(220,202,187,0.3)",
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "0.59rem",
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
            position: "absolute", top: "14px", left: "14px", zIndex: 5,
            background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
            color: "var(--black)", fontSize: "0.62rem", fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "5px 12px", borderRadius: "20px",
          }}>{product.badge}</span>
        )}

        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)",
          opacity: hovered ? 1 : 0, transition: "opacity 0.4s ease",
        }} />

        {/* Hover actions */}
        <div style={{
          position: "absolute", bottom: "18px", left: "50%", zIndex: 6,
          transform: hovered ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(16px)",
          display: "flex", gap: "10px", opacity: hovered ? 1 : 0,
          transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)", whiteSpace: "nowrap",
        }}>
          <button
            onClick={handleAdd}
            style={{
              background: added ? "rgba(76,175,80,0.92)" : "rgba(220,202,187,0.96)",
              color: "var(--black)", border: "none",
              padding: "11px 22px", borderRadius: "30px",
              fontSize: "0.73rem", fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {added ? t("prod_added") : isInCart(product.id) ? t("prod_in_cart") : t("prod_add")}
          </button>
          <div style={{
            background: "rgba(10,15,36,0.88)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(220,202,187,0.32)", color: "var(--gold)",
            padding: "11px 18px", borderRadius: "30px",
            fontSize: "0.73rem", fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            {t("prod_details")}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "0.65rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {product.category || t("prod_luxury")}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {product.gender && (
              <span style={{
                fontSize: "0.58rem", fontWeight: 700,
                padding: "2px 8px", borderRadius: "20px",
                background: product.gender === "men" ? "rgba(106,176,245,0.12)" : product.gender === "women" ? "rgba(245,160,200,0.12)" : "rgba(220,202,187,0.08)",
                color: product.gender === "men" ? "#6ab0f5" : product.gender === "women" ? "#f5a0c8" : "var(--gold)",
                border: `1px solid ${product.gender === "men" ? "rgba(106,176,245,0.28)" : product.gender === "women" ? "rgba(245,160,200,0.28)" : "rgba(220,202,187,0.18)"}`,
              }}>
                {product.gender === "men" ? "♂" : product.gender === "women" ? "♀" : "⚧"}
              </span>
            )}
            <div style={{ color: "var(--gold)", fontSize: "0.65rem", letterSpacing: "1px" }}>★★★★★</div>
          </div>
        </div>

        <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", color: "var(--white)", marginBottom: "8px", lineHeight: 1.3 }}>{product.name}</h3>
        <p style={{ color: "var(--white-muted)", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "18px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.description}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
          <span style={{ fontFamily: "var(--font-serif)", color: "var(--gold)", fontSize: "1.3rem", fontWeight: 700 }}>
            {product.price.toLocaleString()} <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>EGP</span>
          </span>

          {/* Image dots */}
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {[product.image_url, ...(product.images || [])].slice(0, 4).map((_: string, i: number) => (
              <div key={i} style={{
                width: i === (hovered && hasHoverImage ? 1 : 0) ? "16px" : "5px",
                height: "5px", borderRadius: "3px",
                background: i === (hovered && hasHoverImage ? 1 : 0) ? "var(--gold)" : "rgba(220,202,187,0.22)",
                transition: "all 0.35s ease",
              }} />
            ))}
          </div>

          <div style={{
            width: "34px", height: "34px",
            border: "1px solid rgba(220,202,187,0.2)", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--gold)", fontSize: "0.9rem",
            background: hovered ? "rgba(220,202,187,0.1)" : "transparent",
            transition: "background 0.3s",
          }}>→</div>
        </div>
      </div>
    </Link>
  );
}
