"use client";

import { useMemo } from "react";

export default function NubiaLoader() {
  const particleCount = useMemo(() => {
    if (typeof window === "undefined") return 16;
    return window.innerWidth < 768 ? 6 : 16;
  }, []);

  return (
    <div className="nubia-loader">
      <div className="nubia-loader-aurora" />
      <div className="nubia-loader-particles" aria-hidden="true">
        {Array.from({ length: particleCount }).map((_, i) => (
          <span
            key={i}
            style={{
              left: `${6 + (i * 6) % 88}%`,
              animationDelay: `${(i * 0.35).toFixed(2)}s`,
              animationDuration: `${2.5 + (i % 3) * 0.6}s`,
            }}
          />
        ))}
      </div>

      <div className="nubia-loader-ring" />

      <div className="nubia-loader-bottle">
        <svg viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nl-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--gold-light)" />
              <stop offset="100%" stopColor="var(--gold-dark)" />
            </linearGradient>
            <clipPath id="nl-bottle-clip">
              <path d="M40 62C28 62 24 68 24 78V154C24 164 32 170 42 170H78C88 170 96 164 96 154V78C96 68 92 62 80 62H72V38H48V62H40Z" />
            </clipPath>
          </defs>

          <path
            className="nl-bottle-outline"
            d="M40 62C28 62 24 68 24 78V154C24 164 32 170 42 170H78C88 170 96 164 96 154V78C96 68 92 62 80 62H72V38H48V62H40Z"
          />

          <g clipPath="url(#nl-bottle-clip)">
            <rect
              className="nl-liquid"
              x="18"
              y="70"
              width="84"
              height="110"
              rx="4"
            />
          </g>

          <rect x="42" y="22" width="36" height="20" rx="4" fill="url(#nl-gold)" opacity="0.9" />
          <path
            d="M48 22L60 10L72 22"
            stroke="url(#nl-gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
        </svg>
      </div>

      <h1 className="nubia-loader-title">Nubia</h1>
      <p className="nubia-loader-subtitle">Crafting your fragrance</p>
      <div className="nubia-loader-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
