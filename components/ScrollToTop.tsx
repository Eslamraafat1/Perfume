"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

export default function ScrollToTop() {
  const { isRTL } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      style={{
        position: "fixed",
        bottom: "36px",
        [isRTL ? "right" : "left"]: "36px",
        zIndex: 9999,
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        border: "1px solid rgba(220, 202, 187, 0.3)",
        background: visible
          ? "rgba(10, 15, 36, 0.85)"
          : "rgba(10, 15, 36, 0)",
        backdropFilter: visible ? "blur(12px)" : "blur(0px)",
        color: "var(--gold)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.4rem",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
        boxShadow: visible
          ? "0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(220,202,187,0.1)"
          : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(220, 202, 187, 0.12)";
        e.currentTarget.style.borderColor = "var(--gold)";
        e.currentTarget.style.transform = "translateY(-4px) scale(1.1)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.6), 0 0 30px rgba(220,202,187,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(10, 15, 36, 0.85)";
        e.currentTarget.style.borderColor = "rgba(220, 202, 187, 0.3)";
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(220,202,187,0.1)";
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: "transform 0.3s ease",
        }}
      >
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>
  );
}
