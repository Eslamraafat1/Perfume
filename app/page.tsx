"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProducts } from "./context/ProductContext";
import { useCart } from "./context/CartContext";
import { useSiteContent } from "./context/SiteContentContext";
import { useLanguage } from "./context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  const heroBottleRef = useRef<HTMLDivElement>(null);
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

  /* ── GSAP Master Timeline ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* 1. Hero */
      const heroTl = gsap.timeline({ delay: 0.2 });
      heroTl
        .fromTo(".h-eyebrow", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
        .fromTo(".h-title span", { opacity: 0, y: 60, clipPath: "inset(100% 0 0 0)" }, { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "expo.out", stagger: 0.12 }, "-=0.3")
        .fromTo(".h-subtitle", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }, "-=0.6")
        .fromTo(".h-actions a, .h-actions button", { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.6, ease: "back.out(1.4)" }, "-=0.5")
        .fromTo(".h-bottle", { opacity: 0, y: 60, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: "power3.out" }, "-=1.2")
        .fromTo(".h-stat", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" }, "-=0.8");

      /* Bottle floating */
      gsap.to(".h-bottle", { y: -18, duration: 3.5, ease: "sine.inOut", repeat: -1, yoyo: true });

      /* Orbiting ring */
      gsap.to(".h-ring", { rotation: 360, duration: 18, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      gsap.to(".h-ring-2", { rotation: -360, duration: 25, ease: "none", repeat: -1, transformOrigin: "50% 50%" });

      /* 2. Scroll reveals for everything */
      ScrollTrigger.batch(".fade-up", {
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: "power3.out" }),
        start: "top 88%",
      });

      /* 3. Category cards parallax */
      document.querySelectorAll(".cat-card-bg").forEach((el) => {
        gsap.to(el, {
          y: -30,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement, scrub: 1.5 },
        });
      });

      /* 4. Process timeline */
      gsap.fromTo(".process-line", { scaleY: 0 }, { scaleY: 1, duration: 1.8, ease: "power2.inOut", scrollTrigger: { trigger: ".process-section", start: "top 70%" } });

      /* 5. Counters */
      const counters = [
        { el: ".cnt-products", to: products.length || 24 },
        { el: ".cnt-hours", to: 12 },
        { el: ".cnt-years", to: 8 },
      ];
      counters.forEach(({ el, to }) => {
        const target = document.querySelector(el);
        if (!target) return;
        gsap.fromTo(target, { textContent: 0 }, {
          textContent: to,
          duration: 2,
          ease: "power2.out",
          snap: { textContent: 1 },
          scrollTrigger: { trigger: target, start: "top 85%" },
        });
      });

      /* 6. Note cards stagger */
      gsap.fromTo(".note-item", { opacity: 0, rotateY: 20, x: 30 }, {
        opacity: 1, rotateY: 0, x: 0, stagger: 0.1, duration: 0.7, ease: "back.out(1.2)",
        scrollTrigger: { trigger: ".notes-marquee-section", start: "top 80%" },
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
          SECTION 1 — HERO
      ══════════════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "linear-gradient(135deg, #06091a 0%, #0f1635 50%, #08122a 100%)",
      }}>
        {/* Grid bg */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(220,202,187,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(220,202,187,0.035) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />

        {/* Ambient glows */}
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(220,202,187,0.07) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(25,41,84,0.6) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div className="responsive-pad" style={{ maxWidth: "1300px", margin: "0 auto", padding: "120px 60px 80px", width: "100%", position: "relative", zIndex: 2 }}>
          <div className="hero-grid">

            {/* Left */}
            <div>
              <span className="h-eyebrow" style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                fontSize: "0.7rem", letterSpacing: "0.35em", textTransform: "uppercase",
                color: "var(--gold)", border: "1px solid rgba(220,202,187,0.3)",
                borderRadius: "40px", padding: "8px 20px", marginBottom: "32px",
              }}>
                <span style={{ width: "6px", height: "6px", background: "var(--gold)", borderRadius: "50%", animation: "pulse-dot 2s ease-in-out infinite" }} />
                {t("hero_eyebrow")}
              </span>

              <h1 className="h-title" style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(3.2rem, 5.5vw, 5.5rem)",
                fontWeight: 700,
                lineHeight: 1.05,
                marginBottom: "28px",
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
              }}>
                <span style={{ display: "block" }}>{t("hero_title_1")}</span>
                <span style={{ display: "block", background: "linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-dark))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontStyle: "italic" }}>
                  {t("hero_title_2")}
                </span>
                <span style={{ display: "block" }}>{t("hero_title_3")}</span>
              </h1>

              <p className="h-subtitle" style={{
                color: "var(--white-muted)",
                fontSize: "1rem",
                lineHeight: 1.9,
                maxWidth: "480px",
                marginBottom: "44px",
                borderLeft: "2px solid rgba(220,202,187,0.3)",
                paddingLeft: "20px",
              }}>
                {t("hero_subtitle")}
              </p>

              <div className="h-actions" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link href="/products" style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
                  color: "var(--black)", padding: "17px 36px", borderRadius: "50px",
                  fontSize: "0.83rem", fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", textDecoration: "none",
                  boxShadow: "0 8px 30px rgba(220,202,187,0.3)",
                  transition: "all 0.35s ease",
                  fontFamily: "var(--font-sans)",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 50px rgba(220,202,187,0.45)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(220,202,187,0.3)"; }}
                >
                  {t("hero_btn_primary")}
                </Link>
                <Link href="/about" style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "transparent", color: "var(--gold)",
                  padding: "17px 32px", borderRadius: "50px",
                  fontSize: "0.83rem", fontWeight: 500, letterSpacing: "0.1em",
                  textTransform: "uppercase", textDecoration: "none",
                  border: "1px solid rgba(220,202,187,0.3)",
                  transition: "all 0.3s ease",
                  fontFamily: "var(--font-sans)",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; (e.currentTarget as HTMLElement).style.background = "rgba(220,202,187,0.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.3)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {t("hero_btn_secondary")}
                </Link>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: "40px", marginTop: "56px", paddingTop: "40px", borderTop: "1px solid rgba(220,202,187,0.1)" }}>
                {[
                  { val: <><span className="cnt-products">0</span>+</>, labelKey: "hero_stat_fragrances" },
                  { val: <><span className="cnt-hours">0</span>hr</>, labelKey: "hero_stat_longevity" },
                  { val: <><span className="cnt-years">0</span>+</>, labelKey: "hero_stat_years" },
                ].map((s, i) => (
                  <div key={i} className="h-stat">
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--gold)", fontWeight: 700, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--white-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: "5px" }}>{t(s.labelKey)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Bottle */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
              {/* Decorative rings */}
              <div className="h-ring" style={{
                position: "absolute",
                width: "460px", height: "460px",
                border: "1px dashed rgba(220,202,187,0.15)",
                borderRadius: "50%",
              }} />
              <div className="h-ring-2" style={{
                position: "absolute",
                width: "320px", height: "320px",
                border: "1px solid rgba(220,202,187,0.08)",
                borderRadius: "50%",
              }} />

              {/* Glow */}
              <div style={{
                position: "absolute",
                width: "280px", height: "280px",
                background: "radial-gradient(circle, rgba(220,202,187,0.18) 0%, transparent 70%)",
                borderRadius: "50%",
                filter: "blur(40px)",
              }} />

              {/* Bottle image */}
              <div className="h-bottle" style={{
                width: "300px", height: "420px",
                position: "relative",
                borderRadius: "24px",
                overflow: "hidden",
                border: "1px solid rgba(220,202,187,0.2)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(220,202,187,0.1)",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sc("hero_image")} alt="Signature Perfume" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(6,9,26,0.8) 0%, rgba(6,9,26,0.1) 50%, transparent 100%)",
                }} />
                <div style={{
                  position: "absolute", bottom: "20px", left: "50%",
                  transform: "translateX(-50%)",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}>
                  <div style={{ fontFamily: "var(--font-serif)", color: "var(--gold)", fontSize: "1.1rem", fontWeight: 700 }}>Maison Luxe</div>
                  <div style={{ fontSize: "0.65rem", color: "rgba(220,202,187,0.6)", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: "2px" }}>Extrait de Parfum</div>
                </div>
              </div>

              {/* Floating badge */}
              <div style={{
                position: "absolute",
                top: "10%", right: "-5%",
                background: "rgba(10,15,36,0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(220,202,187,0.2)",
                borderRadius: "16px",
                padding: "14px 18px",
                animation: "float-badge 4s ease-in-out infinite",
              }}>
                <div style={{ fontSize: "0.65rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>{t("hero_longevity_label")}</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--white)", fontWeight: 700 }}>{t("hero_longevity_val")}</div>
              </div>

              <div style={{
                position: "absolute",
                bottom: "15%", left: "-8%",
                background: "rgba(10,15,36,0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(220,202,187,0.2)",
                borderRadius: "16px",
                padding: "14px 18px",
                animation: "float-badge 5s ease-in-out infinite reverse",
              }}>
                <div style={{ fontSize: "0.65rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>{t("hero_collection_label")}</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--white)", fontWeight: 700 }}>{t("hero_collection_val")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "var(--white-muted)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <div style={{ width: "1px", height: "50px", background: "linear-gradient(to bottom, transparent, var(--gold))", animation: "scroll-line 2s ease-in-out infinite" }} />
          {t("hero_scroll")}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — TRUST BAR
      ══════════════════════════════════════════════ */}
      <section className="responsive-pad" style={{ background: "rgba(220,202,187,0.04)", borderTop: "1px solid rgba(220,202,187,0.1)", borderBottom: "1px solid rgba(220,202,187,0.1)", padding: "30px 60px" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "24px" }}>
          {[
            { icon: "👑", labelKey: "trust_niche", subKey: "trust_niche_sub" },
            { icon: "🕐", labelKey: "trust_longevity", subKey: "trust_longevity_sub" },
            { icon: "📦", labelKey: "trust_box", subKey: "trust_box_sub" },
            { icon: "🚚", labelKey: "trust_shipping", subKey: "trust_shipping_sub" },
            { icon: "↩️", labelKey: "trust_returns", subKey: "trust_returns_sub" },
          ].map((b) => (
            <div key={b.labelKey} className="fade-up" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "1.4rem" }}>{b.icon}</span>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--white)", letterSpacing: "0.04em" }}>{t(b.labelKey)}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--white-muted)" }}>{t(b.subKey)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — CATEGORIES
      ══════════════════════════════════════════════ */}
      <section className="responsive-pad" style={{ padding: "120px 60px", background: "var(--dark)" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: "60px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--gold)", letterSpacing: "0.35em", textTransform: "uppercase" }}>{t("cat_eyebrow")}</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3.2rem)", marginTop: "14px", textTransform: "uppercase", fontWeight: 700 }}>
              {t("cat_title")}
            </h2>
            <p style={{ color: "var(--white-muted)", marginTop: "14px", fontSize: "0.95rem", maxWidth: "520px", margin: "14px auto 0", lineHeight: 1.8 }}>
              {t("cat_desc")}
            </p>
          </div>

          <div className="categories-grid">
            {CATEGORIES_DATA.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category?cat=${encodeURIComponent(cat.slug)}`}
                className="fade-up"
                style={{
                  display: "block",
                  position: "relative",
                  height: "480px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  textDecoration: "none",
                  border: "1px solid rgba(220,202,187,0.1)",
                  transition: "all 0.45s cubic-bezier(0.4,0,0.2,1)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-10px)";
                  el.style.boxShadow = "0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(220,202,187,0.1)";
                  el.style.borderColor = "rgba(220,202,187,0.35)";
                  const bg = el.querySelector(".cat-card-bg") as HTMLElement;
                  if (bg) bg.style.transform = "scale(1.08)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                  el.style.borderColor = "rgba(220,202,187,0.1)";
                  const bg = el.querySelector(".cat-card-bg") as HTMLElement;
                  if (bg) bg.style.transform = "scale(1)";
                }}
              >
                <div className="cat-card-bg" style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url(${cat.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1)",
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(to top, rgba(6,9,26,0.95) 0%, rgba(6,9,26,0.4) 50%, transparent 100%)`,
                }} />
                <div style={{
                  position: "absolute", bottom: "28px", left: "24px", right: "24px",
                }}>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "var(--white)", marginBottom: "6px", fontWeight: 700 }}>{cat.label}</h3>
                  <p style={{ fontSize: "0.72rem", color: "rgba(220,202,187,0.7)", letterSpacing: "0.1em" }}>{cat.sub}</p>
                  <div style={{
                    marginTop: "14px",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    fontSize: "0.7rem", color: "var(--gold)", fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    {t("cat_explore")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
      <section className="process-section responsive-pad" style={{ padding: "130px 60px", background: "linear-gradient(135deg, var(--black) 0%, var(--dark-3) 100%)", borderTop: "1px solid rgba(220,202,187,0.08)" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: "80px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--gold)", letterSpacing: "0.35em", textTransform: "uppercase" }}>{t("proc_eyebrow")}</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3.2rem)", marginTop: "14px", textTransform: "uppercase", fontWeight: 700 }}>
              {t("proc_title")}
            </h2>
            <p style={{ color: "var(--white-muted)", marginTop: "14px", fontSize: "0.95rem", maxWidth: "520px", margin: "14px auto 0", lineHeight: 1.8 }}>
              {t("proc_desc")}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0", position: "relative" }}>
            {/* Connecting line (desktop) */}
            <div className="process-line" style={{
              position: "absolute",
              top: "60px", left: "12.5%", right: "12.5%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, var(--gold), var(--gold), transparent)",
              opacity: 0.3,
              transformOrigin: "left",
            }} />

            {PROCESS_STEPS.map((step, i) => (
              <div key={step.num} className="fade-up" style={{ padding: "0 24px", textAlign: "center", position: "relative" }}>
                <div style={{
                  width: "80px", height: "80px",
                  border: "1px solid rgba(220,202,187,0.25)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 28px",
                  background: "rgba(10,15,36,0.9)",
                  position: "relative",
                  transition: "all 0.3s ease",
                  fontSize: "1.6rem",
                  cursor: "default",
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(220,202,187,0.06)";
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.25)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(10,15,36,0.9)";
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                  }}
                >
                  {step.icon}
                  <div style={{
                    position: "absolute", top: "-8px", right: "-8px",
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.6rem", color: "var(--black)", fontWeight: 700,
                  }}>
                    {i + 1}
                  </div>
                </div>
                <div style={{ fontSize: "0.62rem", color: "var(--gold)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "10px" }}>{t("proc_step")} {step.num}</div>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", marginBottom: "12px", color: "var(--white)" }}>{step.title}</h3>
                <p style={{ color: "var(--white-muted)", fontSize: "0.85rem", lineHeight: 1.75 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="fade-up" style={{ textAlign: "center", marginTop: "64px" }}>
            <Link href="/about" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              border: "1px solid rgba(220,202,187,0.3)", borderRadius: "50px",
              padding: "14px 32px", fontSize: "0.82rem", color: "var(--gold)",
              textDecoration: "none", letterSpacing: "0.12em", textTransform: "uppercase",
              transition: "all 0.3s ease", fontFamily: "var(--font-sans)",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(220,202,187,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.3)"; }}
            >
              {t("proc_read_story")}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — RARE INGREDIENTS
      ══════════════════════════════════════════════ */}
      <section className="notes-marquee-section responsive-pad" style={{ padding: "120px 60px", background: "var(--dark-2)", borderTop: "1px solid rgba(220,202,187,0.08)" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div className="fade-up about-grid" style={{ marginBottom: "80px" }}>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--gold)", letterSpacing: "0.35em", textTransform: "uppercase" }}>{t("notes_eyebrow")}</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", marginTop: "14px", textTransform: "uppercase", fontWeight: 700, lineHeight: 1.1 }}>
                {t("notes_title_1")}<br />
                <span style={{ fontStyle: "italic", background: "linear-gradient(135deg, var(--gold-light), var(--gold))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {t("notes_title_2")}
                </span>
              </h2>
              <p style={{ color: "var(--white-muted)", marginTop: "20px", fontSize: "0.95rem", lineHeight: 1.85 }}>
                {t("notes_desc")}
              </p>
              <Link href="/blog" style={{
                display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "32px",
                border: "1px solid rgba(220,202,187,0.3)", borderRadius: "50px",
                padding: "13px 28px", fontSize: "0.78rem", color: "var(--gold)",
                textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase",
                transition: "all 0.3s ease", fontFamily: "var(--font-sans)",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(220,202,187,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {t("notes_read_btn")}
              </Link>
            </div>
            <div style={{
              height: "420px", borderRadius: "24px", overflow: "hidden",
              border: "1px solid rgba(220,202,187,0.15)",
              position: "relative",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1619994403073-2cec844b8e63?q=80&w=800"
                alt="Oud ingredient"
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = "scale(1.05)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = "scale(1)")}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,9,26,0.6) 0%, transparent 60%)" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {NOTES.map((note) => (
              <div
                key={note.name}
                className="note-item fade-up"
                style={{
                  background: "rgba(10,15,36,0.7)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(220,202,187,0.1)",
                  borderRadius: "16px",
                  padding: "28px 24px",
                  transition: "all 0.35s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.35)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,202,187,0.1)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "14px" }}>{note.icon}</div>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1rem", color: "var(--white)", marginBottom: "4px" }}>{note.name}</h3>
                <p style={{ fontSize: "0.68rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>{note.origin}</p>
                <p style={{ color: "var(--white-muted)", fontSize: "0.83rem", lineHeight: 1.7 }}>{note.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 7 — BRAND STORY SPLIT
      ══════════════════════════════════════════════ */}
      <section className="responsive-pad" style={{ padding: "130px 60px", background: "var(--black)", borderTop: "1px solid rgba(220,202,187,0.08)" }}>
        <div className="about-grid" style={{ maxWidth: "1300px", margin: "0 auto" }}>
          {/* Image grid */}
          <div className="fade-up story-images-grid">
            <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(220,202,187,0.12)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/perfume_3.png" alt="Oud perfume" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = "scale(1.05)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = "scale(1)")}
              />
            </div>
            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: "16px" }}>
              <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(220,202,187,0.12)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/perfume_2.png" alt="Floral perfume" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = "scale(1)")}
                />
              </div>
              <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(220,202,187,0.12)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/perfume_5.png" alt="Fresh perfume" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = "scale(1)")}
                />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="fade-up">
            <span style={{ fontSize: "0.7rem", color: "var(--gold)", letterSpacing: "0.35em", textTransform: "uppercase" }}>{t("story_eyebrow")}</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 3.5vw, 3rem)", marginTop: "16px", textTransform: "uppercase", fontWeight: 700, lineHeight: 1.1, marginBottom: "24px" }}>
              {t("story_title_1")}<br />
              <span style={{ fontStyle: "italic", background: "linear-gradient(135deg, var(--gold-light), var(--gold))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {t("story_title_2")}
              </span>
            </h2>
            <p style={{ color: "var(--white-muted)", fontSize: "0.95rem", lineHeight: 1.85, marginBottom: "20px" }}>
              {t("story_p1")}
            </p>
            <p style={{ color: "var(--white-muted)", fontSize: "0.95rem", lineHeight: 1.85, marginBottom: "36px" }}>
              {t("story_p2")}
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/about" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
                color: "var(--black)", padding: "15px 30px", borderRadius: "50px",
                fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.1em",
                textDecoration: "none", textTransform: "uppercase", fontFamily: "var(--font-sans)",
              }}>
                {t("story_btn_about")}
              </Link>
              <Link href="/blog" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                border: "1px solid rgba(220,202,187,0.3)", borderRadius: "50px",
                padding: "15px 28px", fontSize: "0.82rem", color: "var(--gold)",
                textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase",
                transition: "all 0.3s ease", fontFamily: "var(--font-sans)",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(220,202,187,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {t("story_btn_blog")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 8 — TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section className="responsive-pad" style={{ padding: "120px 60px", background: "var(--dark-3)", borderTop: "1px solid rgba(220,202,187,0.08)" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: "60px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--gold)", letterSpacing: "0.35em", textTransform: "uppercase" }}>{t("test_eyebrow")}</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", marginTop: "14px", textTransform: "uppercase", fontWeight: 700 }}>
              {t("test_title")}
            </h2>
          </div>

          {/* Active testimonial */}
          <div style={{ maxWidth: "780px", margin: "0 auto", textAlign: "center" }}>
            <div style={{
              background: "rgba(10,15,36,0.8)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(220,202,187,0.15)",
              borderRadius: "24px",
              padding: "50px 48px",
              position: "relative",
              transition: "all 0.4s ease",
            }}>
              {/* Quote icon */}
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "6rem", color: "rgba(220,202,187,0.08)", position: "absolute", top: "10px", left: "30px", lineHeight: 1 }}>&ldquo;</div>
              <div style={{ color: "var(--gold)", fontSize: "1.1rem", letterSpacing: "4px", marginBottom: "24px" }}>
                {"★".repeat(TESTIMONIALS[activeTestimonial].stars)}
              </div>
              <p style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.15rem",
                fontStyle: "italic",
                color: "var(--white)",
                lineHeight: 1.8,
                marginBottom: "32px",
              }}>
                &ldquo;{TESTIMONIALS[activeTestimonial].text}&rdquo;
              </p>
              <div>
                <div style={{ fontWeight: 600, color: "var(--gold)", fontSize: "0.9rem" }}>{TESTIMONIALS[activeTestimonial].name}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--white-muted)", marginTop: "4px" }}>
                  {TESTIMONIALS[activeTestimonial].role} · {TESTIMONIALS[activeTestimonial].product}
                </div>
              </div>
            </div>

            {/* Dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "28px" }}>
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  style={{
                    width: i === activeTestimonial ? "28px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background: i === activeTestimonial ? "var(--gold)" : "rgba(220,202,187,0.25)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.4s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 9 — VIP BANNER
      ══════════════════════════════════════════════ */}
      <section className="responsive-pad" style={{
        padding: "100px 60px",
        background: "linear-gradient(135deg, rgba(10,15,36,0.98) 0%, rgba(25,41,84,0.95) 100%)",
        borderTop: "1px solid rgba(220,202,187,0.12)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(220,202,187,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(220,202,187,0.03) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }} />
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "40px", position: "relative", zIndex: 2 }}>
          <div className="fade-up" style={{ maxWidth: "560px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--gold)", letterSpacing: "0.35em", textTransform: "uppercase" }}>{t("vip_eyebrow")}</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", marginTop: "14px", textTransform: "uppercase", fontWeight: 700 }}>
              {t("vip_title")}
            </h2>
            <p style={{ color: "var(--white-muted)", fontSize: "0.95rem", lineHeight: 1.8, marginTop: "16px" }}>
              {t("vip_desc")}
            </p>
          </div>
          <div className="fade-up">
            <Link href="/contact" style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
              color: "var(--black)", padding: "18px 40px", borderRadius: "50px",
              fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.12em",
              textDecoration: "none", textTransform: "uppercase", fontFamily: "var(--font-sans)",
              boxShadow: "0 8px 30px rgba(220,202,187,0.3)",
              transition: "all 0.35s ease",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 50px rgba(220,202,187,0.45)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(220,202,187,0.3)"; }}
            >
              {t("vip_btn")}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 10 — NEWSLETTER
      ══════════════════════════════════════════════ */}
      <section className="responsive-pad" style={{ padding: "100px 60px", background: "var(--dark)", borderTop: "1px solid rgba(220,202,187,0.08)" }}>
        <div style={{ maxWidth: "650px", margin: "0 auto", textAlign: "center" }}>
          <div className="fade-up">
            <span style={{ fontSize: "0.7rem", color: "var(--gold)", letterSpacing: "0.35em", textTransform: "uppercase" }}>{t("news_eyebrow")}</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", marginTop: "14px", textTransform: "uppercase", fontWeight: 700 }}>
              {t("news_title")}
            </h2>
            <p style={{ color: "var(--white-muted)", marginTop: "16px", marginBottom: "40px", fontSize: "0.95rem", lineHeight: 1.8 }}>
              {t("news_desc")}
            </p>
            {subscribed ? (
              <div style={{
                background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)",
                borderRadius: "50px", padding: "18px 40px",
                color: "#4caf50", fontSize: "0.9rem", letterSpacing: "0.05em",
              }}>
                {t("news_success")}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("news_placeholder")}
                  required
                  style={{
                    flex: 1, minWidth: "260px", maxWidth: "340px",
                    height: "52px", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(220,202,187,0.2)", borderRadius: "50px",
                    padding: "0 24px", color: "var(--white)", fontSize: "0.88rem",
                    outline: "none", fontFamily: "var(--font-sans)",
                    transition: "border-color 0.3s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(220,202,187,0.2)")}
                />
                <button
                  type="submit"
                  style={{
                    height: "52px", padding: "0 36px",
                    background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
                    color: "var(--black)", border: "none", borderRadius: "50px",
                    fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.12em",
                    textTransform: "uppercase", cursor: "pointer", fontFamily: "var(--font-sans)",
                    transition: "all 0.3s ease",
                    boxShadow: "0 6px 20px rgba(220,202,187,0.25)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 35px rgba(220,202,187,0.4)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(220,202,187,0.25)"; }}
                >
                  {t("news_btn")}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

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
        transform: hovered ? "translateY(-10px)" : "translateY(0)",
        boxShadow: hovered ? "0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(220,202,187,0.1)" : "0 4px 20px rgba(0,0,0,0.3)",
        animationDelay: `${index * 0.06}s`,
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: "340px", overflow: "hidden", background: "var(--dark-2)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease", transform: hovered ? "scale(1.1)" : "scale(1)" }}
        />
        {product.badge && (
          <span style={{
            position: "absolute", top: "14px", left: "14px",
            background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
            color: "var(--black)", fontSize: "0.62rem", fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "5px 12px", borderRadius: "20px",
          }}>{product.badge}</span>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)",
          opacity: hovered ? 1 : 0, transition: "opacity 0.4s ease",
        }} />
        {/* Hover actions */}
        <div style={{
          position: "absolute", bottom: "18px", left: "50%",
          transform: hovered ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(16px)",
          display: "flex", gap: "10px", opacity: hovered ? 1 : 0,
          transition: "all 0.4s ease", whiteSpace: "nowrap",
        }}>
          <button
            onClick={handleAdd}
            style={{
              background: added ? "rgba(76,175,80,0.9)" : "rgba(220,202,187,0.95)",
              color: "var(--black)", border: "none",
              padding: "10px 20px", borderRadius: "30px",
              fontSize: "0.73rem", fontWeight: 700,
              letterSpacing: "0.07em", textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {added ? t("prod_added") : isInCart(product.id) ? t("prod_in_cart") : t("prod_add")}
          </button>
          <div style={{
            background: "rgba(10,15,36,0.85)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(220,202,187,0.3)", color: "var(--gold)",
            padding: "10px 16px", borderRadius: "30px",
            fontSize: "0.73rem", fontWeight: 600,
            letterSpacing: "0.07em", textTransform: "uppercase",
          }}>
            {t("prod_details")}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "0.65rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {product.category || t("prod_luxury")}
          </span>
          <div style={{ color: "var(--gold)", fontSize: "0.65rem", letterSpacing: "1px" }}>★★★★★</div>
        </div>
        <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", color: "var(--white)", marginBottom: "8px", lineHeight: 1.3 }}>{product.name}</h3>
        <p style={{ color: "var(--white-muted)", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "18px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.description}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
          <span style={{ fontFamily: "var(--font-serif)", color: "var(--gold)", fontSize: "1.3rem", fontWeight: 700 }}>
            {product.price.toLocaleString()} <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>EGP</span>
          </span>
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
