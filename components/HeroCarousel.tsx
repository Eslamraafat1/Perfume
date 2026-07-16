"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useLanguage } from "@/app/context/LanguageContext";
import { useHeroSlides } from "@/app/context/HeroSlidesContext";

const LETTERS = ["N", "U", "B", "I", "A"];
const DURATION = 6000;

export default function HeroCarousel() {
  const { isRTL } = useLanguage();
  const { slides } = useHeroSlides();
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dotKey, setDotKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nubiaWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  // letterRefs[slideIndex][letterIndex]
  const letterRefs = useRef<(HTMLSpanElement | null)[][]>([]);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  /* ─── Init letter ref arrays when slides load ─── */
  useEffect(() => {
    letterRefs.current = slides.map((_, si) =>
      letterRefs.current[si] ?? Array(LETTERS.length).fill(null)
    );
  }, [slides.length]); // eslint-disable-line

  /* ─── Bound guard ─── */
  useEffect(() => {
    if (slides.length > 0 && current >= slides.length) setCurrent(0);
  }, [slides.length, current]);

  /* ─── Letters IN: staggered fall-down with blur ─── */
  const animIn = useCallback((si: number, delay = 0) => {
    const els = letterRefs.current[si]?.filter(Boolean) as HTMLSpanElement[];
    if (!els || els.length === 0) return;

    gsap.killTweensOf(els);
    gsap.set(els, { y: 100, opacity: 0, rotateX: -80, scale: 0.6, filter: "blur(18px)", transformOrigin: "50% 100%" });
    gsap.to(els, {
      y: 0,
      opacity: 1,
      rotateX: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 1.1,
      ease: "expo.out",
      stagger: { each: 0.09, from: "start" },
      delay,
    });

    // Shimmer after enter
    const wrap = nubiaWrapRefs.current[si];
    if (wrap) {
      setTimeout(() => {
        wrap.classList.add("hc-shimmer-active");
        setTimeout(() => wrap.classList.remove("hc-shimmer-active"), 1800);
      }, (delay + 0.55) * 1000);
    }
  }, []);

  /* ─── Letters OUT: scatter / glitch ─── */
  const animOut = useCallback((si: number) => {
    const els = letterRefs.current[si]?.filter(Boolean) as HTMLSpanElement[];
    if (!els || els.length === 0) return;

    gsap.killTweensOf(els);
    const yVals   = [-90, 70, -60, 80, -100];
    const rxVals  = [50, -40, 35, -50, 60];
    const scVals  = [0.4, 0.5, 0.45, 0.4, 0.35];

    els.forEach((el, li) => {
      gsap.to(el, {
        y: yVals[li] ?? -70,
        opacity: 0,
        rotateX: rxVals[li] ?? 45,
        scale: scVals[li] ?? 0.4,
        filter: "blur(14px)",
        duration: 0.6,
        ease: "power3.in",
        delay: li * 0.05,
      });
    });
  }, []);

  /* ─── Go-to slide ─── */
  const goTo = useCallback(
    (next: number) => {
      if (isAnimating || next === current) return;
      setIsAnimating(true);
      setDotKey((k) => k + 1);

      const outSlide = slideRefs.current[current];
      const inSlide  = slideRefs.current[next];
      if (!outSlide || !inSlide) { setIsAnimating(false); return; }

      animOut(current);

      gsap.set(inSlide, { zIndex: 2, clipPath: "inset(0 100% 0 0)" });

      gsap.timeline({
        onComplete: () => {
          gsap.set(outSlide, { zIndex: 0, clipPath: "inset(0 0% 0 0)" });
          setCurrent(next);
          setIsAnimating(false);
        },
      })
        .to(outSlide, { clipPath: "inset(0 100% 0 0)", duration: 0, ease: "none" }, 0.65) // hide after letters gone
        .to(inSlide, { clipPath: "inset(0 0% 0 0)", duration: 0.85, ease: "expo.inOut" }, 0.55)
        .call(() => animIn(next, 0.05), [], 0.6);
    },
    [current, isAnimating, animIn, animOut]
  );

  /* ─── Auto-advance ─── */
  useEffect(() => {
    if (slides.length < 2) return;
    progressRef.current = setTimeout(() => {
      goTo((current + 1) % slides.length);
    }, DURATION);
    return () => { if (progressRef.current) clearTimeout(progressRef.current); };
  }, [current, slides.length, goTo]);

  /* ─── Initial mount ─── */
  const slideIds = slides.map((s) => s.id).join(",");
  useEffect(() => {
    if (slides.length === 0) return;
    setCurrent(0);
    setIsAnimating(false);

    const raf = requestAnimationFrame(() => {
      slideRefs.current.forEach((sl, i) => {
        if (!sl) return;
        gsap.set(sl, { zIndex: i === 0 ? 1 : 0, clipPath: i === 0 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" });
      });
      animIn(0, 0.35);
    });
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIds]);

  /* ─── 3D per-letter parallax on mouse ─── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const { width, height } = container.getBoundingClientRect();
      const xP = (e.clientX / width  - 0.5) * 2;
      const yP = (e.clientY / height - 0.5) * 2;

      const els = letterRefs.current[current]?.filter(Boolean) as HTMLSpanElement[];
      if (!els) return;
      els.forEach((el, li) => {
        const sign  = li % 2 === 0 ? 1 : -1;
        const depth = sign * (li * 0.4 + 0.8);
        gsap.to(el, {
          x: xP * -14 * depth * 0.25,
          y: yP * -8  * depth * 0.25,
          rotateY: xP * 5,
          rotateX: yP * -3,
          duration: 1.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    };

    container.addEventListener("mousemove", onMove);
    return () => container.removeEventListener("mousemove", onMove);
  }, [current]);

  /* ─── Keyboard nav ─── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  goTo((current - 1 + slides.length) % slides.length);
      if (e.key === "ArrowRight") goTo((current + 1) % slides.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo, slides.length]);

  /* ─── Touch / Click ripple on letters ─── */
  const spawnRipple = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const x = "touches" in e
      ? e.touches[0]?.clientX ?? 0
      : (e as React.MouseEvent).clientX;
    const y = "touches" in e
      ? e.touches[0]?.clientY ?? 0
      : (e as React.MouseEvent).clientY;

    const ripple = document.createElement("div");
    ripple.className = "hc-letter-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top  = `${y}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 750);

    // Letter bounce via GSAP
    const target = e.currentTarget as HTMLElement;
    gsap.killTweensOf(target);
    gsap.timeline()
      .to(target, { y: -14, scale: 1.15, duration: 0.22, ease: "power3.out" })
      .to(target, { y: 0,   scale: 1.0,  duration: 0.55, ease: "elastic.out(1, 0.4)" });
  }, []);

  /* ─── Loading state ─── */
  if (slides.length === 0) {
    return (
      <div style={{ width: "100%", height: "100vh", background: "#06091a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(219,202,187,0.3)", fontSize: "1rem", fontFamily: "var(--font-serif)", letterSpacing: "0.1em" }}>Loading…</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ══════════════════════════════════════
           ROOT
        ══════════════════════════════════════ */
        .hc-root {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 600px;
          overflow: hidden;
          background: #06091a;
        }

        /* ══════════════════════════════════════
           GLOBAL BG
        ══════════════════════════════════════ */
        .hc-global-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hc-global-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          animation: bg-pan 30s infinite alternate ease-in-out;
        }
        @keyframes bg-pan {
          0%   { transform: scale(1.05) translate(0,    0); }
          100% { transform: scale(1.1)  translate(-2%, 1%); }
        }
        .hc-global-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(6,9,26,0.92) 0%,
            rgba(6,9,26,0.38) 50%,
            rgba(6,9,26,0.68) 100%
          );
        }

        /* ══════════════════════════════════════
           SLIDES
        ══════════════════════════════════════ */
        .hc-slide {
          position: absolute;
          inset: 0;
          z-index: 0;
          will-change: clip-path;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ══════════════════════════════════════
           NUBIA WRAP (holds all letters)
        ══════════════════════════════════════ */
        .hc-nubia-wrap {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(1px, 0.4vw, 8px);
          user-select: none;
          perspective: 900px;
          transform-style: preserve-3d;
        }

        /* ══════════════════════════════════════
           INDIVIDUAL LETTER
        ══════════════════════════════════════ */
        .hc-letter {
          display: inline-block;
          position: relative;
          font-family: var(--font-serif);
          font-size: clamp(3.5rem, 11vw, 11rem);
          font-weight: 900;
          text-transform: uppercase;
          line-height: 1;
          letter-spacing: -0.01em;
          transform-style: preserve-3d;
          will-change: transform, opacity, filter;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: filter 0.25s ease;

          /* ── Strong visible gold ── */
          background: linear-gradient(
            165deg,
            #fff9e6  0%,
            #eed599 25%,
            #dcb570 50%,
            #b68c4a 75%,
            #8a5d2e 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;

          /* Strong glow */
          filter:
            drop-shadow(0 0   50px rgba(220,185,100, 0.55))
            drop-shadow(0 0   20px rgba(201,169,110, 0.45))
            drop-shadow(0 8px 22px rgba(0,0,0, 0.75));
        }

        /* ── Rim highlight layer ── */
        .hc-letter::before {
          content: attr(data-l);
          position: absolute;
          inset: 0;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          line-height: inherit;
          background: linear-gradient(
            120deg,
            rgba(255,255,220,0.55) 0%,
            rgba(255,240,160,0.20) 40%,
            transparent 70%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          pointer-events: none;
        }

        /* ── Shimmer pseudo ── */
        .hc-letter::after {
          content: attr(data-l);
          position: absolute;
          inset: 0;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          line-height: inherit;
          background: linear-gradient(
            105deg,
            transparent   25%,
            rgba(255,248,195,0.70) 50%,
            transparent   75%
          );
          background-size: 250% 100%;
          background-position: 200% 0;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          pointer-events: none;
          opacity: 0;
        }

        /* ── Shimmer sweep layer ── */
        .hc-letter::after {
          content: attr(data-l);
          position: absolute;
          inset: 0;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          line-height: inherit;
          background: linear-gradient(
            105deg,
            transparent   20%,
            rgba(255,252,210,0.85) 50%,
            transparent   80%
          );
          background-size: 260% 100%;
          background-position: 200% 0;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          pointer-events: none;
          opacity: 0;
        }

        /* Shimmer trigger */
        .hc-shimmer-active .hc-letter::after {
          opacity: 1;
          animation: hc-shimmer 1.6s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .hc-shimmer-active .hc-letter:nth-child(1)::after { animation-delay: 0.00s; }
        .hc-shimmer-active .hc-letter:nth-child(2)::after { animation-delay: 0.08s; }
        .hc-shimmer-active .hc-letter:nth-child(3)::after { animation-delay: 0.16s; }
        .hc-shimmer-active .hc-letter:nth-child(4)::after { animation-delay: 0.24s; }
        .hc-shimmer-active .hc-letter:nth-child(5)::after { animation-delay: 0.32s; }

        @keyframes hc-shimmer {
          0%   { background-position:  220% 0; opacity: 1; }
          100% { background-position: -100% 0; opacity: 0; }
        }

        /* ── Hover/Touch lift ── */
        .hc-letter:hover,
        .hc-letter:active {
          filter:
            drop-shadow(0 0   80px rgba(255,220,100, 0.90))
            drop-shadow(0 0   35px rgba(220,185,80,  0.75))
            drop-shadow(0 10px 28px rgba(0,0,0, 0.80));
          transform: translateY(-8px) scale(1.08) !important;
          transition: filter 0.2s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          z-index: 10;
        }

        /* ── Touch ripple ring ── */
        .hc-letter-ripple {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          width: 10px;
          height: 10px;
          margin: -5px 0 0 -5px;
          border: 2px solid rgba(220,185,100,0.8);
          background: rgba(220,185,100,0.15);
          animation: hc-ripple 0.7s cubic-bezier(0,0.5,0.5,1) forwards;
        }
        @keyframes hc-ripple {
          0%   { transform: scale(0);   opacity: 1; }
          100% { transform: scale(8);   opacity: 0; }
        }

        /* ── Idle breathe glow ── */
        @keyframes hc-glow-pulse {
          0%,100% {
            filter:
              drop-shadow(0 0   50px rgba(220,185,100, 0.50))
              drop-shadow(0 0   20px rgba(201,169,110, 0.40))
              drop-shadow(0 8px 22px rgba(0,0,0, 0.75));
          }
          50% {
            filter:
              drop-shadow(0 0   90px rgba(255,210,80,  0.75))
              drop-shadow(0 0   40px rgba(220,185,100, 0.65))
              drop-shadow(0 8px 30px rgba(0,0,0, 0.75));
          }
        }
        .hc-letter { animation: hc-glow-pulse 4s ease-in-out infinite; }
        .hc-letter:nth-child(1) { animation-delay: 0.0s; }
        .hc-letter:nth-child(2) { animation-delay: 0.4s; }
        .hc-letter:nth-child(3) { animation-delay: 0.8s; }
        .hc-letter:nth-child(4) { animation-delay: 1.2s; }
        .hc-letter:nth-child(5) { animation-delay: 1.6s; }

        /* ══════════════════════════════════════
           PROGRESS DOTS
        ══════════════════════════════════════ */
        .hc-dots {
          position: absolute;
          bottom: 38px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .hc-dot-wrap {
          cursor: pointer;
          padding: 6px;
        }
        .hc-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(220,202,187,0.28);
          transition: all 0.45s ease;
          position: relative;
          overflow: hidden;
        }
        .hc-dot.active {
          width: 42px;
          border-radius: 4px;
          background: rgba(220,202,187,0.18);
        }
        .hc-dot-fill {
          position: absolute;
          inset: 0;
          background: var(--gold);
          border-radius: 4px;
          transform-origin: ${isRTL ? "right" : "left"};
        }
        @keyframes hc-dot-prog {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .hc-dot-fill-anim {
          animation: hc-dot-prog ${DURATION}ms linear forwards;
          transform-origin: ${isRTL ? "right" : "left"};
        }

        /* ══════════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════════ */
        @media (max-width: 1024px) {
          .hc-letter { font-size: clamp(3.5rem, 14vw, 9rem); }
        }
        @media (max-width: 768px) {
          .hc-letter { font-size: clamp(3rem, 17vw, 6.5rem); }
          .hc-dots   { bottom: 22px; }
        }
        @media (max-width: 480px) {
          .hc-letter { font-size: clamp(2.4rem, 20vw, 5rem); gap: 0; }
          .hc-nubia-wrap { gap: 0; }
        }

        /* ══════════════════════════════════════
           SLIDE CONTENT COLUMN
        ══════════════════════════════════════ */
        .hc-slide {
          flex-direction: column;
          justify-content: center;
          padding-bottom: 80px;
        }
        .hc-slide-content {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        /* ══════════════════════════════════════
           EYEBROW
        ══════════════════════════════════════ */
        .hc-eyebrow {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
          opacity: 0;
          animation: hc-fade-up 1s ease 0.8s forwards;
        }
        .hc-eyebrow-line {
          display: block;
          width: 48px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(220,185,100,0.7), transparent);
        }
        .hc-eyebrow-text {
          font-family: var(--font-sans, sans-serif);
          font-size: 0.68rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(220,185,100,0.85);
          white-space: nowrap;
        }

        /* ══════════════════════════════════════
           SUBTITLE
        ══════════════════════════════════════ */
        .hc-subtitle {
          font-family: var(--font-sans, sans-serif);
          font-size: clamp(0.85rem, 1.8vw, 1.05rem);
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(220,202,187,0.75);
          text-align: center;
          max-width: 480px;
          margin: 12px 0 36px;
          line-height: 1.7;
          opacity: 0;
          animation: hc-fade-up 1s ease 1.2s forwards;
        }

        /* ══════════════════════════════════════
           CTA BUTTONS
        ══════════════════════════════════════ */
        .hc-cta-row {
          display: flex;
          gap: 16px;
          align-items: center;
          opacity: 0;
          animation: hc-fade-up 1s ease 1.5s forwards;
        }
        .hc-btn-primary {
          display: inline-block;
          padding: 13px 34px;
          font-size: 0.75rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-family: var(--font-sans, sans-serif);
          font-weight: 600;
          color: #0a0d1a;
          background: linear-gradient(135deg, #e8ca80, #c9a96e, #dbb878);
          border: none;
          border-radius: 2px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 24px rgba(220,185,100,0.35);
        }
        .hc-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 36px rgba(220,185,100,0.55);
          background: linear-gradient(135deg, #f2d890, #d4b57a, #e8ca80);
        }
        .hc-btn-ghost {
          display: inline-block;
          padding: 12px 32px;
          font-size: 0.75rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-family: var(--font-sans, sans-serif);
          font-weight: 500;
          color: rgba(220,185,100,0.90);
          background: transparent;
          border: 1px solid rgba(220,185,100,0.40);
          border-radius: 2px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .hc-btn-ghost:hover {
          border-color: rgba(220,185,100,0.85);
          color: #e8ca80;
          background: rgba(220,185,100,0.08);
          transform: translateY(-2px);
        }

        /* ══════════════════════════════════════
           SCROLL INDICATOR
        ══════════════════════════════════════ */
        .hc-scroll-hint {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0;
          animation: hc-fade-up 1s ease 2s forwards;
        }
        .hc-scroll-mouse {
          width: 22px;
          height: 36px;
          border: 1.5px solid rgba(220,185,100,0.5);
          border-radius: 12px;
          display: flex;
          justify-content: center;
          padding-top: 6px;
        }
        .hc-scroll-wheel {
          width: 3px;
          height: 7px;
          background: rgba(220,185,100,0.85);
          border-radius: 2px;
          animation: hc-scroll-bounce 1.8s ease-in-out infinite;
        }
        @keyframes hc-scroll-bounce {
          0%,100% { transform: translateY(0); opacity: 1; }
          50%      { transform: translateY(7px); opacity: 0.3; }
        }
        .hc-scroll-label {
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(220,185,100,0.5);
          font-family: var(--font-sans, sans-serif);
        }

        @keyframes hc-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .hc-subtitle { font-size: 0.82rem; max-width: 320px; }
          .hc-cta-row { flex-direction: column; gap: 12px; }
          .hc-btn-primary, .hc-btn-ghost { width: 220px; text-align: center; }
          .hc-scroll-hint { display: none; }
          .hc-eyebrow-text { font-size: 0.6rem; }
          .hc-eyebrow-line { width: 28px; }
        }
      `}</style>

      <div className="hc-root" ref={containerRef} role="region" aria-label="Hero Carousel">

        {/* Global background image */}
        <div className="hc-global-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/abu_simbel_bg.png" alt="Abu Simbel background" className="hc-global-bg-img" />
          <div className="hc-global-overlay" />
        </div>

        {/* Slides */}
        {slides.map((slide, si) => (
          <div
            key={slide.id}
            className="hc-slide"
            ref={(el) => { slideRefs.current[si] = el; }}
            aria-hidden={si !== current}
          >
            {/* NUBIA letter-by-letter */}
            <div
              className="hc-nubia-wrap"
              dir="ltr"
              ref={(el) => { nubiaWrapRefs.current[si] = el; }}
            >
              {LETTERS.map((letter, li) => (
                <span
                  key={li}
                  className="hc-letter"
                  data-l={letter}
                  ref={(el) => {
                    if (!letterRefs.current[si]) letterRefs.current[si] = Array(LETTERS.length).fill(null);
                    letterRefs.current[si][li] = el;
                  }}
                  style={{ opacity: 0, position: "relative" }}
                  onClick={spawnRipple}
                  onTouchStart={spawnRipple}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Progress dots */}
        <div className="hc-dots" role="tablist" aria-label="Slide navigation">
          {slides.map((_, i) => (
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
                  <div key={dotKey} className="hc-dot-fill hc-dot-fill-anim" />
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
