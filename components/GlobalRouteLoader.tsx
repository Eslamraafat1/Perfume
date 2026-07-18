"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import NubiaLoader from "./NubiaLoader";

const MIN_DISPLAY_MS = 400;
const SHOW_DELAY_MS  = 80; // wait a tiny bit before showing — avoids flicker on fast loads

export default function GlobalRouteLoader() {
  const pathname   = usePathname();
  const prevPath   = useRef(pathname);
  const showTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownAt    = useRef<number>(0);

  const [visible, setVisible] = useState(false);

  const clearAll = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (minTimer.current)  clearTimeout(minTimer.current);
  };

  const show = useCallback(() => {
    clearAll();
    showTimer.current = setTimeout(() => {
      shownAt.current = Date.now();
      setVisible(true);
    }, SHOW_DELAY_MS);
  }, []);

  const hide = useCallback(() => {
    clearAll();
    const elapsed   = Date.now() - shownAt.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    hideTimer.current = setTimeout(() => setVisible(false), remaining);
  }, []);

  // Hide when the route actually changes
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      hide();
    }
  }, [pathname, hide]);

  // Intercept anchor clicks — only trigger for real cross-page navigations
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external, hash, mailto, tel, download, _blank
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.getAttribute("download") ||
        anchor.target === "_blank"
      ) return;

      // Skip if navigating to the same path (including hash changes)
      const targetPath = href.split("?")[0].split("#")[0];
      if (targetPath === pathname || targetPath === "") return;

      show();
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname, show]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        animation: "nlFadeIn 0.25s ease forwards",
      }}
    >
      <style>{`
        @keyframes nlFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes nlFadeOut { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
      <NubiaLoader />
    </div>
  );
}
