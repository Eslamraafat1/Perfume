"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useLanguage } from "@/app/context/LanguageContext";

/* ──────────────────────────────────────────────
   SLIDE DATA
────────────────────────────────────────────── */
const SLIDES = [
  {
    id: 0,
    img: "/perfume_1.png",
    accent: "rgba(165, 110, 60, 0.6)",
    gradient: "linear-gradient(135deg, #0a0519 0%, #1a0a2e 45%, #0f0820 100%)",
    glow: "rgba(200, 140, 80, 0.35)",
    href: "/products",
  },
  {
    id: 1,
    img: "/perfume_2.png",
    accent: "rgba(130, 30, 80, 0.6)",
    gradient: "linear-gradient(135deg, #190514 0%, #2a0a1e 45%, #100a15 100%)",
    glow: "rgba(200, 60, 120, 0.35)",
    href: "/products",
  },
  {
    id: 2,
    img: "/perfume_3.png",
    accent: "rgba(200, 180, 100, 0.5)",
    gradient: "linear-gradient(135deg, #0f0e08 0%, #1f1c0a 45%, #12100a 100%)",
    glow: "rgba(220, 190, 80, 0.35)",
    href: "/products",
  },
  {
    id: 3,
    img: "/perfume_4.png",
    accent: "rgba(30, 90, 180, 0.5)",
    gradient: "linear-gradient(135deg, #050d1a 0%, #0a1830 45%, #060e1a 100%)",
    glow: "rgba(60, 130, 220, 0.35)",
    href: "/products",
  },
];

/* ──────────────────────────────────────────────
   COMPONENT
────────────────────────────────────────────── */
export default function HeroCarousel() {
  const { t, isRTL } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimRef = useRef<NodeJS.Timeout | null>(null);
  const DURATION = 6000;

  /* ── animate slide transition ── */
  const goTo = useCallback(
    (next: number) => {
      if (isAnimating || next === current) return;
      setIsAnimating(true);
      setPrev(current);
      setCurrent(next);
      setProgress(0);

      const outSlide = slideRefs.current[current];
      const inSlide = slideRefs.current[next];
      const outText = textRefs.current[current];
      const inText = textRefs.current[next];
      const inImg = imgRefs.current[next];
      const outImg = imgRefs.current[current];

      if (!outSlide || !inSlide) { setIsAnimating(false); return; }

      // Prepare incoming slide
      gsap.set(inSlide, { zIndex: 2, clipPath: "inset(0 100% 0 0)" });
      gsap.set(inImg, { scale: 1.15, x: 60 });
      gsap.set(inText, { opacity: 0, y: 60 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(outSlide, { zIndex: 0, clipPath: "inset(0 0% 0 0)" });
          setPrev(null);
          setIsAnimating(false);
        },
      });

      // Out
      tl.to(outText, { opacity: 0, y: -40, duration: 0.4, ease: "power2.in" }, 0)
        .to(outImg, { scale: 1.05, x: -40, duration: 0.9, ease: "power2.in" }, 0)
        // In — curtain reveal
        .to(inSlide, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "expo.inOut" }, 0.1)
        .to(inImg, { scale: 1, x: 0, duration: 1.2, ease: "expo.out" }, 0.1)
        .to(inText, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.65);
    },
    [current, isAnimating]
  );

  /* ── auto-play progress ── */
  useEffect(() => {
    setProgress(0);
    let start: number;
    let rafId: number;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
      if (elapsed < DURATION) {
        rafId = requestAnimationFrame(animate);
      }
    };
    rafId = requestAnimationFrame(animate);
    progressRef.current = setTimeout(() => {
      goTo((current + 1) % SLIDES.length);
    }, DURATION);
    return () => {
      cancelAnimationFrame(rafId);
      if (progressRef.current) clearTimeout(progressRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  /* ── entrance animation ── */
  useEffect(() => {
    const slide = slideRefs.current[0];
    const text = textRefs.current[0];
    const img = imgRefs.current[0];
    if (!slide || !text || !img) return;

    gsap.set(slide, { zIndex: 1, clipPath: "inset(0 0% 0 0)" });
    gsap.set(img, { scale: 1.15 });
    gsap.set(text, { opacity: 0, y: 80 });

    gsap.to(img, { scale: 1, duration: 1.6, ease: "expo.out", delay: 0.2 });
    gsap.to(text, { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.5 });
  }, []);

  /* ── Parallax mouse effect ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { width, height } = container.getBoundingClientRect();
      const xPct = (clientX / width - 0.5) * 2;
      const yPct = (clientY / height - 0.5) * 2;
      imgRefs.current.forEach((img, i) => {
        if (i === current && img) {
          gsap.to(img, { x: xPct * 12, y: yPct * 8, duration: 1.2, ease: "power2.out", overwrite: "auto" });
        }
      });
    };
    container.addEventListener("mousemove", onMove);
    return () => container.removeEventListener("mousemove", onMove);
  }, [current]);

  /* ── keyboard navigation ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo((current - 1 + SLIDES.length) % SLIDES.length);
      if (e.key === "ArrowRight") goTo((current + 1) % SLIDES.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo]);

  return (
    <>
      <style>{`
        .hc-root {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 600px;
          overflow: hidden;
          background: #06091a;
        }

        /* ── Slides ── */
        .hc-slide {
          position: absolute;
          inset: 0;
          z-index: 0;
          will-change: clip-path;
        }
        .hc-slide:first-child { z-index: 1; }

        .hc-img-wrap {
          position: absolute;
          inset: 0;
          will-change: transform;
        }
        .hc-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          user-select: none;
          pointer-events: none;
        }
        .hc-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* ── Content ── */
        .hc-content {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          padding: 180px 80px 80px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          left: 50%;
          transform: translateX(-50%);
        }

        .hc-text-box {
          max-width: 650px;
          will-change: transform, opacity;
        }

        .hc-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.65rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          font-family: var(--font-sans);
          font-weight: 600;
          color: #0a0f24;
          background: var(--gold);
          border-radius: 40px;
          padding: 6px 18px;
          margin-bottom: 22px;
          box-shadow: 0 4px 20px rgba(220,202,187,0.4);
          animation: hc-tag-pulse 3s ease-in-out infinite;
        }

        @keyframes hc-tag-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(220,202,187,0.4); }
          50% { box-shadow: 0 6px 35px rgba(220,202,187,0.65); }
        }

        .hc-eyebrow {
          display: block;
          font-size: 0.75rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold);
          font-family: var(--font-sans);
          margin-bottom: 18px;
          opacity: 0.85;
        }

        .hc-title {
          font-family: var(--font-serif);
          font-weight: 700;
          line-height: 1.0;
          margin-bottom: 28px;
          text-transform: uppercase;
          letter-spacing: -0.01em;
        }
        .hc-title .line1 {
          display: block;
          font-size: clamp(3.2rem, 6vw, 7rem);
          color: #fff;
        }
        .hc-title .line2 {
          display: block;
          font-size: clamp(3.2rem, 6vw, 7rem);
          background: linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
        }
        .hc-title .line3 {
          display: block;
          font-size: clamp(3.2rem, 6vw, 7rem);
          color: rgba(255,255,255,0.55);
        }

        .hc-subtitle {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.72);
          line-height: 1.85;
          max-width: 520px;
          margin-bottom: 44px;
          font-weight: 300;
          ${isRTL ? "border-right: 2px solid rgba(220,202,187,0.35); padding-right: 20px;" : "border-left: 2px solid rgba(220,202,187,0.35); padding-left: 20px;"}
          font-family: var(--font-sans);
        }

        .hc-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
        }

        .hc-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, var(--gold), var(--gold-dark));
          color: #0a0f24;
          padding: 18px 40px;
          border-radius: 50px;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          font-family: var(--font-sans);
          box-shadow: 0 8px 35px rgba(220,202,187,0.35);
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
          white-space: nowrap;
        }
        .hc-btn-primary:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 18px 55px rgba(220,202,187,0.55);
        }

        .hc-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          color: var(--gold);
          padding: 18px 36px;
          border-radius: 50px;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          font-family: var(--font-sans);
          border: 1px solid rgba(220,202,187,0.3);
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .hc-btn-secondary:hover {
          background: rgba(220,202,187,0.08);
          border-color: var(--gold);
          transform: translateY(-2px);
        }

        /* ── Navigation arrows ── */
        .hc-arrows {
          position: absolute;
          bottom: 48px;
          ${isRTL ? "left: 80px;" : "right: 80px;"}
          z-index: 20;
          display: flex;
          gap: 12px;
          flex-direction: ${isRTL ? "row-reverse" : "row"};
        }

        .hc-arrow {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 1px solid rgba(220,202,187,0.25);
          background: rgba(10,15,36,0.5);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          color: var(--gold);
          font-size: 1.1rem;
          user-select: none;
        }
        .hc-arrow:hover {
          background: rgba(220,202,187,0.15);
          border-color: var(--gold);
          transform: scale(1.1);
        }
        .hc-arrow:active { transform: scale(0.95); }

        /* ── Slide counter ── */
        .hc-counter {
          position: absolute;
          bottom: 60px;
          ${isRTL ? "right: 80px;" : "left: 80px;"}
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 16px;
          font-family: var(--font-serif);
          flex-direction: ${isRTL ? "row-reverse" : "row"};
        }
        .hc-counter-current {
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--gold);
          line-height: 1;
        }
        .hc-counter-divider {
          width: 1px;
          height: 30px;
          background: rgba(220,202,187,0.3);
          transform: rotate(20deg);
        }
        .hc-counter-total {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.4);
        }

        /* ── Dots with progress ── */
        .hc-dots {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .hc-dot-wrap {
          cursor: pointer;
          padding: 4px;
        }

        .hc-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(220,202,187,0.3);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }
        .hc-dot.active {
          width: 36px;
          border-radius: 3px;
          background: rgba(220,202,187,0.2);
        }
        .hc-dot-fill {
          position: absolute;
          inset: 0;
          background: var(--gold);
          border-radius: 3px;
          transform-origin: ${isRTL ? "right" : "left"};
        }

        /* ── Decorative vertical line ── */
        .hc-vline {
          position: absolute;
          ${isRTL ? "left: 80px;" : "right: 80px;"}
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }
        .hc-vline-thumb {
          width: 56px;
          height: 75px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(220,202,187,0.2);
          cursor: pointer;
          transition: all 0.35s ease;
          opacity: 0.45;
          flex-shrink: 0;
        }
        .hc-vline-thumb.active {
          opacity: 1;
          border-color: var(--gold);
          box-shadow: 0 0 20px rgba(220,202,187,0.25);
          transform: scale(1.08);
        }
        .hc-vline-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }

        /* ── Floating particle dots ── */
        .hc-particles {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          overflow: hidden;
        }
        .hc-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: rgba(220,202,187,0.5);
          animation: hc-float var(--dur) ease-in-out infinite;
          animation-delay: var(--delay);
          left: var(--x);
          top: var(--y);
        }
        @keyframes hc-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-24px) scale(1.4); opacity: 1; }
        }

        /* ── Scroll indicator ── */
        .hc-scroll {
          position: absolute;
          bottom: 32px;
          right: 50%;
          transform: translateX(50%);
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.45);
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          font-family: var(--font-sans);
          display: none;
        }
        .hc-scroll-line {
          width: 1px;
          height: 44px;
          background: linear-gradient(to bottom, transparent, var(--gold));
          animation: hc-scroll-line 2s ease-in-out infinite;
        }
        @keyframes hc-scroll-line {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .hc-content { padding: 160px 48px 120px; }
          .hc-vline { display: none; }
          .hc-arrows { ${isRTL ? "left: 48px;" : "right: 48px;"} bottom: 40px; }
          .hc-counter { ${isRTL ? "right: 48px;" : "left: 48px;"} }
        }
        @media (max-width: 768px) {
          .hc-root { height: 100svh; min-height: 580px; }
          .hc-content {
            padding: 140px 24px 140px;
            align-items: flex-end;
          }
          .hc-text-box { max-width: 100%; }
          .hc-title .line1,
          .hc-title .line2,
          .hc-title .line3 { font-size: clamp(2.4rem, 10vw, 4rem); }
          .hc-subtitle { font-size: 0.9rem; margin-bottom: 28px; }
          .hc-arrows { ${isRTL ? "left: 24px;" : "right: 24px;"} bottom: 32px; }
          .hc-counter { ${isRTL ? "right: 24px;" : "left: 24px;"} bottom: 50px; }
          .hc-dots { bottom: 14px; }
          .hc-btn-primary, .hc-btn-secondary { padding: 14px 26px; font-size: 0.78rem; }
        }
        @media (max-width: 480px) {
          .hc-actions { gap: 10px; }
          .hc-btn-secondary { display: none; }
          .hc-arrows { gap: 8px; }
          .hc-arrow { width: 44px; height: 44px; }
        }

        /* ── RTL Adjustments ── */
        [dir="rtl"] .hc-title {
          line-height: 1.35;
          letter-spacing: 0;
        }
        [dir="rtl"] .hc-tag,
        [dir="rtl"] .hc-eyebrow,
        [dir="rtl"] .hc-btn-primary,
        [dir="rtl"] .hc-btn-secondary {
          letter-spacing: 0;
        }
        [dir="rtl"] .hc-title .line1,
        [dir="rtl"] .hc-title .line2,
        [dir="rtl"] .hc-title .line3 {
          padding-bottom: 0.15em;
          font-size: clamp(2.8rem, 5vw, 5.5rem);
        }
        @media (max-width: 768px) {
          [dir="rtl"] .hc-title .line1,
          [dir="rtl"] .hc-title .line2,
          [dir="rtl"] .hc-title .line3 {
             font-size: clamp(2rem, 8vw, 3.2rem);
          }
        }
      `}</style>

      <div className="hc-root" ref={containerRef} role="region" aria-label="Hero Carousel">

        {/* ── Floating particles ── */}
        <div className="hc-particles">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="hc-particle"
              style={{
                "--x": `${Math.random() * 100}%`,
                "--y": `${Math.random() * 100}%`,
                "--dur": `${3 + Math.random() * 4}s`,
                "--delay": `${Math.random() * 4}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* ── Slides ── */}
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className="hc-slide"
            ref={(el) => { slideRefs.current[i] = el; }}
            aria-hidden={i !== current}
          >
            {/* Background image with parallax wrapper */}
            <div
              className="hc-img-wrap"
              ref={(el) => { imgRefs.current[i] = el; }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.img} alt={t(`hc_s${i+1}_title1`)} />
            </div>

            {/* Gradient overlay — dynamic per slide */}
            <div
              className="hc-overlay"
              style={{
                background: `
                  linear-gradient(to right, rgba(6,9,26,0.92) 0%, rgba(6,9,26,0.7) 50%, rgba(6,9,26,0.3) 100%),
                  linear-gradient(to top, rgba(6,9,26,0.85) 0%, transparent 50%)
                `,
              }}
            />

            {/* Accent glow */}
            <div
              className="hc-overlay"
              style={{
                background: `radial-gradient(ellipse 70% 70% at 80% 50%, ${slide.glow} 0%, transparent 70%)`,
              }}
            />
          </div>
        ))}

        {/* ── Text content (per slide) ── */}
        {SLIDES.map((slide, i) => (
          <div
            key={`text-${slide.id}`}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: i === current ? 15 : (prev === i ? 12 : 5),
              display: "flex",
              alignItems: "center",
              padding: "0",
              pointerEvents: i === current ? "auto" : "none",
            }}
          >
            <div className="hc-content">
              <div
                className="hc-text-box"
                ref={(el) => { textRefs.current[i] = el; }}
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                {/* Tag badge */}
                <span className="hc-tag">
                  <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                    <circle cx="3" cy="3" r="3" fill="#0a0f24" />
                  </svg>
                  {t(`hc_s${i+1}_tag`)}
                </span>

                {/* Eyebrow */}
                <span className="hc-eyebrow">{t(`hc_s${i+1}_eyebrow`)}</span>

                {/* Title */}
                <h1 className="hc-title">
                  <span className="line1">{t(`hc_s${i+1}_title1`)}</span>
                  <span className="line2">{t(`hc_s${i+1}_title2`)}</span>
                  <span className="line3">{t(`hc_s${i+1}_title3`)}</span>
                </h1>

                {/* Subtitle */}
                <p className="hc-subtitle">{t(`hc_s${i+1}_subtitle`)}</p>

                {/* CTAs */}
                <div className="hc-actions">
                  <Link href={slide.href} className="hc-btn-primary">
                    {t(`hc_s${i+1}_btn`)}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }}>
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <Link href="/about" className="hc-btn-secondary">
                    {t("hc_story")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* ── Thumbnail sidebar ── */}
        <div className="hc-vline">
          {SLIDES.map((slide, i) => (
            <div
              key={`thumb-${i}`}
              className={`hc-vline-thumb ${i === current ? "active" : ""}`}
              onClick={() => goTo(i)}
              role="button"
              aria-label={`Go to slide ${i + 1}`}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") goTo(i); }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.img} alt={t(`hc_s${i+1}_title1`)} />
            </div>
          ))}
        </div>

        {/* ── Counter ── */}
        <div className="hc-counter">
          <span className="hc-counter-current">
            {String(current + 1).padStart(2, "0")}
          </span>
          <div className="hc-counter-divider" />
          <span className="hc-counter-total">
            {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>

        {/* ── Dots with progress bar ── */}
        <div className="hc-dots" role="tablist" aria-label="Slide navigation">
          {SLIDES.map((_, i) => (
            <div
              key={`dot-${i}`}
              className="hc-dot-wrap"
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Slide ${i + 1}`}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") goTo(i); }}
            >
              <div className={`hc-dot ${i === current ? "active" : ""}`}>
                {i === current && (
                  <div
                    className="hc-dot-fill"
                    style={{ transform: `scaleX(${progress / 100})` }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Arrow navigation ── */}
        <div className="hc-arrows">
          <button
            className="hc-arrow"
            onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
            aria-label="Previous slide"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }}>
              <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="hc-arrow"
            onClick={() => goTo((current + 1) % SLIDES.length)}
            aria-label="Next slide"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }}>
              <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
