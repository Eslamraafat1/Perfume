"use client";

import { useEffect, useState } from "react";
import NubiaLoader from "./NubiaLoader";

export default function GlobalRouteLoader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 1. Start fading out after 1200ms
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1200);

    // 2. Completely unmount after 1600ms to free up resources
    const mountTimer = setTimeout(() => {
      setVisible(false);
    }, 1600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(mountTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        // Block clicks when fully visible, release clicks once fading out
        pointerEvents: fadeOut ? "none" : "auto",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.4s ease-in-out",
        background: "var(--black)",
      }}
    >
      <NubiaLoader />
    </div>
  );
}
