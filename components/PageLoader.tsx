"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function PageLoader() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const prevPath = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      const bar = barRef.current;
      if (!bar) return;

      bar.style.width = "0%";
      bar.style.opacity = "1";
      bar.style.transition = "none";

      requestAnimationFrame(() => {
        bar.style.width = "30%";
        bar.style.opacity = "1";
        bar.style.transition = "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        bar.style.width = "100%";
        bar.style.transition = "width 0.15s ease";
        setTimeout(() => {
          bar.style.opacity = "0";
          bar.style.transition = "opacity 0.25s ease";
        }, 150);
      }, 300);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 99999,
        pointerEvents: "none",
      }}
    >
      <div
        ref={barRef}
        style={{
          height: "100%",
          width: "0%",
          opacity: 0,
          background: "linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light), var(--gold))",
          backgroundSize: "200% 100%",
          borderRadius: "0 2px 2px 0",
          boxShadow: "0 0 12px rgba(220,202,187,0.5), 0 0 30px rgba(220,202,187,0.2)",
          animation: "pl-shimmer 1.2s linear infinite",
        }}
      />
      <style>{`
        @keyframes pl-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}
