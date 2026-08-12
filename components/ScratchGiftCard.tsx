"use client";

import { useEffect, useRef, useState } from "react";

const COUPON_CODE = "NUBIA10";
const STORAGE_KEY = "nubia-scratch-shown";

export default function ScratchGiftCard() {
  const [show, setShow] = useState(false);
  const [scratched, setScratched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const scratchedPct = useRef(0);

  // Show only on first visit (or if ?gift=true is in URL for testing)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceShow = params.get("gift") === "true";
    const seen = sessionStorage.getItem(STORAGE_KEY);
    
    if (!seen || forceShow) {
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem(STORAGE_KEY, "1");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Init canvas scratch layer
  useEffect(() => {
    if (!show || scratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Gold foil gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#c9a96e");
    grad.addColorStop(0.3, "#f0d890");
    grad.addColorStop(0.5, "#dcccbb");
    grad.addColorStop(0.7, "#c9a96e");
    grad.addColorStop(1, "#a07840");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text on foil
    ctx.fillStyle = "rgba(80,50,20,0.5)";
    ctx.font = "bold 13px serif";
    ctx.textAlign = "center";
    ctx.fillText("✦ SCRATCH TO REVEAL ✦", canvas.width / 2, canvas.height / 2 - 8);
    ctx.font = "11px serif";
    ctx.fillText("Your exclusive gift awaits", canvas.width / 2, canvas.height / 2 + 12);
  }, [show, scratched]);

  const getScratchPct = (canvas: HTMLCanvasElement): number => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) cleared++;
    }
    return (cleared / (canvas.width * canvas.height)) * 100;
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || scratched) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const cx = x - rect.left;
    const cy = y - rect.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();
    // Check if 55% scratched
    scratchedPct.current = getScratchPct(canvas);
    if (scratchedPct.current > 55) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setScratched(true);
      setTimeout(() => setRevealed(true), 100);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => { isDrawing.current = true; scratch(e.clientX, e.clientY); };
  const onMouseMove = (e: React.MouseEvent) => { if (isDrawing.current) scratch(e.clientX, e.clientY); };
  const onMouseUp = () => { isDrawing.current = false; };
  const onTouchStart = (e: React.TouchEvent) => { isDrawing.current = true; scratch(e.touches[0].clientX, e.touches[0].clientY); };
  const onTouchMove = (e: React.TouchEvent) => { if (isDrawing.current) scratch(e.touches[0].clientX, e.touches[0].clientY); };

  const copyCode = () => {
    navigator.clipboard.writeText(COUPON_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99000,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
      animation: "fadeInBack 0.5s ease",
    }}>
      <style>{`
        @keyframes fadeInBack { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.85) } to { opacity: 1; transform: scale(1) } }
        @keyframes shimmerGold {
          0% { background-position: -200% center }
          100% { background-position: 200% center }
        }
        @keyframes floatUp { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes codeReveal { from { opacity:0; transform: scale(0.7) } to { opacity:1; transform: scale(1) } }
        .scratch-copy-btn:hover { transform: scale(1.04) !important; }
      `}</style>

      <div style={{
        background: "linear-gradient(145deg, #0a0d1a, #12182e, #0a0d1a)",
        border: "1px solid rgba(220,202,187,0.25)",
        borderRadius: "28px",
        padding: "clamp(28px,5vw,48px)",
        maxWidth: "460px",
        width: "100%",
        textAlign: "center",
        position: "relative",
        animation: "scaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(201,169,110,0.1)",
      }}>
        {/* Close */}
        <button onClick={() => setShow(false)} style={{
          position: "absolute", top: "16px", right: "16px",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "50%", width: "32px", height: "32px",
          color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "1rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>✕</button>

        {/* Gold bottle icon */}
        <div style={{ fontSize: "3rem", marginBottom: "12px", animation: "floatUp 3s ease-in-out infinite" }}>🪙</div>

        <div style={{
          fontSize: "0.65rem", letterSpacing: "0.35em", textTransform: "uppercase",
          color: "var(--gold)", marginBottom: "8px",
        }}>Exclusive Welcome Gift</div>

        <h2 style={{
          fontFamily: "var(--font-serif)", fontSize: "clamp(1.4rem,3vw,1.9rem)",
          color: "#fff", marginBottom: "6px", lineHeight: 1.2,
        }}>Your Personal Offer</h2>

        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", marginBottom: "28px", lineHeight: 1.6 }}>
          Scratch the gold card below to reveal your exclusive discount code.
        </p>

        {/* Scratch area */}
        <div style={{
          position: "relative", borderRadius: "16px", overflow: "hidden",
          height: "120px", marginBottom: "24px",
          border: "1px solid rgba(220,202,187,0.2)",
        }}>
          {/* Prize underneath */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, #0d1526, #1a2540)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "8px",
          }}>
            <div style={{
              fontSize: "0.65rem", letterSpacing: "0.3em",
              color: "rgba(220,202,187,0.6)", textTransform: "uppercase",
            }}>Your Coupon Code</div>
            <div style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.6rem,4vw,2.2rem)",
              fontWeight: 800,
              background: "linear-gradient(90deg,#c9a96e,#f0d890,#dcccbb,#c9a96e)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: revealed ? "shimmerGold 2s linear infinite, codeReveal 0.5s ease" : "none",
              letterSpacing: "0.15em",
            }}>{COUPON_CODE}</div>
            <div style={{ fontSize: "0.72rem", color: "rgba(220,202,187,0.5)" }}>10% off your first order</div>
          </div>

          {/* Scratch canvas overlay */}
          {!scratched && (
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                borderRadius: "16px",
                cursor: "crosshair",
                touchAction: "none",
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={() => { isDrawing.current = false; }}
            />
          )}
        </div>

        {/* Copy button — shown after scratch */}
        {scratched && (
          <button
            className="scratch-copy-btn"
            onClick={copyCode}
            style={{
              width: "100%",
              padding: "14px 24px",
              background: copied
                ? "linear-gradient(135deg, #2d7a4e, #1a5c38)"
                : "linear-gradient(135deg, #c9a96e, #a07840)",
              border: "none", borderRadius: "12px",
              color: copied ? "#fff" : "#0a0d1a",
              fontWeight: 700, fontSize: "0.9rem",
              cursor: "pointer", transition: "all 0.3s ease",
              letterSpacing: "0.1em",
              marginBottom: "12px",
            }}
          >
            {copied ? "✓ Copied to Clipboard!" : `Copy Code: ${COUPON_CODE}`}
          </button>
        )}

        {!scratched && (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}>
            🖱 Scratch with your mouse or finger
          </p>
        )}
        {scratched && (
          <p style={{ color: "rgba(220,202,187,0.5)", fontSize: "0.75rem" }}>
            ✨ Apply at checkout to receive 10% off your order
          </p>
        )}
      </div>
    </div>
  );
}
