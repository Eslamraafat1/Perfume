"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useLanguage } from "@/app/context/LanguageContext";
import { useHeroSlides } from "@/app/context/HeroSlidesContext";

export default function HeroCarousel() {
  const { isRTL } = useLanguage();
  const { slides } = useHeroSlides();
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dotKey, setDotKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nubiaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const DURATION = 6000;

  useEffect(() => {
    if (slides.length > 0 && current >= slides.length) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  const goTo = useCallback(
    (next: number) => {
      if (isAnimating || next === current) return;
      setIsAnimating(true);
      setPrev(current);
      setCurrent(next);
      setDotKey((k) => k + 1);

      const outSlide = slideRefs.current[current];
      const inSlide = slideRefs.current[next];
      const outNubia = nubiaRefs.current[current];
      const inNubia = nubiaRefs.current[next];
      const inImg = imgRefs.current[next];
      const outImg = imgRefs.current[current];

      if (!outSlide || !inSlide) { setIsAnimating(false); return; }

      gsap.set(inSlide, { zIndex: 2, clipPath: "inset(0 100% 0 0)" });
      gsap.set(inImg, { scale: 1.15, x: 60, opacity: 0 });
      gsap.set(inNubia, { scale: 0.8, opacity: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(outSlide, { zIndex: 0, clipPath: "inset(0 0% 0 0)" });
          setPrev(null);
          setIsAnimating(false);
        },
      });

      tl.to(outNubia, { scale: 1.1, opacity: 0, duration: 0.8, ease: "power2.in" }, 0)
        .to(outImg, { scale: 1.05, x: -40, opacity: 0, duration: 0.9, ease: "power2.in" }, 0)
        .to(inSlide, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "expo.inOut" }, 0.1)
        .to(inNubia, { scale: 1, opacity: 1, duration: 1.4, ease: "expo.out" }, 0.4)
        .to(inImg, { scale: 1, x: 0, opacity: 1, duration: 1.2, ease: "expo.out" }, 0.3);
    },
    [current, isAnimating]
  );

  useEffect(() => {
    if (slides.length < 2) return;
    progressRef.current = setTimeout(() => {
      goTo((current + 1) % slides.length);
    }, DURATION);
    return () => {
      if (progressRef.current) clearTimeout(progressRef.current);
    };
  }, [current, slides.length, goTo]);

  const slideIds = slides.map((s) => s.id).join(",");
  useEffect(() => {
    if (slides.length === 0) return;

    setCurrent(0);
    setPrev(null);
    setIsAnimating(false);

    const raf = requestAnimationFrame(() => {
      slideRefs.current.forEach((slide, i) => {
        if (!slide) return;
        gsap.set(slide, {
          zIndex: i === 0 ? 1 : 0,
          clipPath: i === 0 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
        });
      });

      imgRefs.current.forEach((img, i) => {
        if (img) gsap.set(img, { scale: i === 0 ? 1 : 1.15, x: 0, y: 0, opacity: i === 0 ? 1 : 0 });
      });

      nubiaRefs.current.forEach((nubia, i) => {
        if (nubia) gsap.set(nubia, { scale: i === 0 ? 1 : 0.8, opacity: i === 0 ? 1 : 0 });
      });

      const img0 = imgRefs.current[0];
      const nubia0 = nubiaRefs.current[0];
      if (!img0 || !nubia0) return;

      gsap.fromTo(nubia0, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: "expo.out", delay: 0.2 });
      gsap.fromTo(img0, { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: "expo.out", delay: 0.4 });
    });

    return () => cancelAnimationFrame(raf);
  }, [slideIds]);

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
          gsap.to(img, { x: xPct * 15, y: yPct * 10, duration: 1.2, ease: "power2.out", overwrite: "auto" });
        }
      });
      nubiaRefs.current.forEach((nubia, i) => {
        if (i === current && nubia) {
          gsap.to(nubia, { x: xPct * -10, y: yPct * -5, duration: 1.5, ease: "power2.out", overwrite: "auto" });
        }
      });
    };
    container.addEventListener("mousemove", onMove);
    return () => container.removeEventListener("mousemove", onMove);
  }, [current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo((current - 1 + slides.length) % slides.length);
      if (e.key === "ArrowRight") goTo((current + 1) % slides.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo, slides.length]);

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
        .hc-root {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 600px;
          overflow: hidden;
          background: #06091a;
        }

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
          0% { transform: scale(1.05) translate(0, 0); }
          100% { transform: scale(1.1) translate(-2%, 1%); }
        }

        .hc-global-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(6,9,26,0.9) 0%, rgba(6,9,26,0.4) 50%, rgba(6,9,26,0.7) 100%);
        }

        .hc-slide {
          position: absolute;
          inset: 0;
          z-index: 0;
          will-change: clip-path;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hc-nubia-text {
          position: absolute;
          z-index: 1;
          font-family: var(--font-serif);
          font-size: clamp(3rem, 12vw, 10rem);
          font-weight: 800;
          text-transform: uppercase;
          color: rgba(220, 202, 187, 0.15);
          letter-spacing: 0.05em;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          background: linear-gradient(180deg, rgba(220, 202, 187, 0.25) 0%, rgba(220, 202, 187, 0.04) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0px 10px 30px rgba(0,0,0,0.5));
          will-change: transform, opacity;
          /* Prevent bleed outside carousel bounds */
          max-width: 100%;
          overflow: hidden;
        }

        .hc-img-wrap {
          position: relative;
          z-index: 2;
          width: auto;
          height: 80vh;
          max-height: 800px;
          will-change: transform, opacity;
          display: flex;
          align-items: center;
          justify-content: center;
          
        }

        .hc-img-wrap img {
          width: auto;
          height: 100%;
          object-fit: contain;
          display: block;
          user-select: none;
          pointer-events: none;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.6));
        }

        .hc-arrows {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          z-index: 20;
          display: flex;
          justify-content: space-between;
          padding: 0 40px;
          pointer-events: none;
        }

        .hc-arrow {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 1px solid rgba(220,202,187,0.25);
          background: rgba(10,15,36,0.3);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          color: var(--gold);
          font-size: 1.1rem;
          user-select: none;
          pointer-events: auto;
        }

        .hc-arrow:hover {
          background: rgba(220,202,187,0.15);
          border-color: var(--gold);
          transform: scale(1.1);
        }

        .hc-arrow:active { transform: scale(0.95); }

        .hc-dots {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: 12px;
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
          background: rgba(220,202,187,0.3);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .hc-dot.active {
          width: 40px;
          border-radius: 4px;
          background: rgba(220,202,187,0.2);
        }

        .hc-dot-fill {
          position: absolute;
          inset: 0;
          background: var(--gold);
          border-radius: 4px;
          transform-origin: ${isRTL ? "right" : "left"};
        }

        @keyframes hc-dot-progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        .hc-dot-fill-anim {
          animation: hc-dot-progress ${DURATION}ms linear forwards;
          transform-origin: ${isRTL ? "right" : "left"};
        }

        .hc-slide-content {
          position: absolute;
          bottom: 14%;
          left: 8%;
          z-index: 10;
          max-width: 540px;
          pointer-events: none;
        }

        .hc-eyebrow {
          font-size: 0.65rem;
          color: var(--gold);
          letter-spacing: 0.35em;
          text-transform: uppercase;
          margin-bottom: 14px;
          opacity: 0.9;
          font-family: var(--font-sans);
        }

        .hc-slide-title {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 700;
          text-transform: uppercase;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 14px;
          letter-spacing: 0.02em;
        }

        .hc-slide-subtitle {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          font-family: var(--font-sans);
          max-width: 420px;
        }

        @media (max-width: 768px) {
          .hc-slide-content { left: 6%; bottom: 18%; max-width: 85%; }
          .hc-slide-title { font-size: clamp(1.6rem, 6vw, 2.2rem); }
          .hc-slide-subtitle { font-size: 0.82rem; }
        }
      `}</style>

      <div className="hc-root" ref={containerRef} role="region" aria-label="Hero Carousel">
        
        <div className="hc-global-bg">
          <img src="/abu_simbel_bg.png" alt="Abu Simbel" className="hc-global-bg-img" />
          <div className="hc-global-overlay" />
        </div>

        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="hc-slide"
            ref={(el) => { slideRefs.current[i] = el; }}
            aria-hidden={i !== current}
          >
            <div
              className="hc-nubia-text"
              ref={(el) => { nubiaRefs.current[i] = el; }}
            >
              NUBIA
            </div>

            {/* Slide text content removed */}
          </div>
        ))}

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
                  <div
                    key={dotKey}
                    className="hc-dot-fill hc-dot-fill-anim"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
