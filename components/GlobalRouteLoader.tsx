"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import NubiaLoader from "./NubiaLoader";

const MIN_DISPLAY_MS = 320;

export default function GlobalRouteLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const showLoader = useCallback(() => {
    setIsLoading(true);
    const showTimer = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(showTimer);
  }, []);

  const hideLoader = useCallback(() => {
    setVisible(false);
    const hideTimer = setTimeout(() => setIsLoading(false), 320);
    return () => clearTimeout(hideTimer);
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(hideLoader, MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [pathname, isLoading, hideLoader]);

  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    const handleChange = () => showLoader();

    window.history.pushState = (...args) => {
      handleChange();
      return originalPushState(...args);
    };

    window.history.replaceState = (...args) => {
      handleChange();
      return originalReplaceState(...args);
    };

    window.addEventListener("popstate", handleChange);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handleChange);
    };
  }, [showLoader]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.getAttribute("download") ||
        anchor.target === "_blank"
      ) {
        return;
      }

      showLoader();
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [showLoader]);

  if (!isLoading) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <NubiaLoader />
    </div>
  );
}
