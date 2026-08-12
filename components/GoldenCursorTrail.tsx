"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  baseOpacity: number;
  colorIdx: number;
  type: "orb" | "star" | "sparkle";
  angle: number;
  spin: number;
}

const COLORS = [
  [240, 210, 150], // warm gold
  [220, 195, 145], // muted gold
  [255, 235, 180], // bright gold
  [200, 165, 100], // deep gold
  [250, 245, 220], // cream
];

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  outerR: number, innerR: number,
  points: number, angle: number
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI / points) * i + angle;
    if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    else ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
}

export default function GoldenCursorTrail() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const particles   = useRef<Particle[]>([]);
  const mouse       = useRef({ x: -999, y: -999, px: -999, py: -999 });
  const rafId       = useRef<number | null>(null);
  const spawnTimer  = useRef(0);
  const frameCount  = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const onMove = (e: MouseEvent) => {
      // Ignore simulated mouse events on mobile touch
      if (e.movementX === 0 && e.movementY === 0) return;
      
      mouse.current.px = mouse.current.x;
      mouse.current.py = mouse.current.y;
      mouse.current.x  = e.clientX;
      mouse.current.y  = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    /* ── Spawn helpers ── */
    const spawn = (x: number, y: number, type: Particle["type"], burst = false) => {
      const maxLife = burst
        ? 45 + Math.random() * 35
        : 35 + Math.random() * 45;

      const speed = burst
        ? 1.5 + Math.random() * 3.5
        : 0.4 + Math.random() * 1.8;

      const angle = burst
        ? Math.random() * Math.PI * 2
        : -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;

      const size = type === "orb"
        ? (burst ? 4 + Math.random() * 8 : 6 + Math.random() * 10)
        : type === "star"
        ? 3 + Math.random() * 6
        : 2 + Math.random() * 4;

      particles.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: maxLife,
        maxLife,
        size,
        baseOpacity: burst ? 0.7 + Math.random() * 0.3 : 0.5 + Math.random() * 0.4,
        colorIdx: Math.floor(Math.random() * COLORS.length),
        type,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.15,
      });
    };

    const burstAt = (x: number, y: number) => {
      for (let i = 0; i < 12; i++) spawn(x, y, "orb", true);
      for (let i = 0; i <  8; i++) spawn(x, y, "star", true);
      for (let i = 0; i <  6; i++) spawn(x, y, "sparkle", true);
    };

    let lastClick = 0;
    const onClick = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastClick < 200) return;
      lastClick = now;
      burstAt(e.clientX, e.clientY);
    };
    window.addEventListener("click", onClick);

    /* ── Draw loop ── */
    const draw = (ts: number) => {
      frameCount.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Spawn trail particles */
      const { x, y, px, py } = mouse.current;
      const moved = Math.hypot(x - px, y - py);

      if (x > 0 && y > 0 && ts - spawnTimer.current > 16) {
        spawnTimer.current = ts;

        // If it's the very first move, don't draw a line from -999
        if (px > 0 && py > 0) {
          const count = Math.min(Math.ceil(moved / 8) + 1, 5);
          for (let i = 0; i < count; i++) {
            const t  = i / count;
            const sx = px + (x - px) * t + (Math.random() - 0.5) * 6;
            const sy = py + (y - py) * t + (Math.random() - 0.5) * 6;

            if (Math.random() < 0.6) spawn(sx, sy, "orb");
            if (Math.random() < 0.35) spawn(sx, sy, "star");
            if (Math.random() < 0.2)  spawn(sx, sy, "sparkle");
          }
        } else {
          // Just spawn at cursor
          spawn(x, y, "orb");
        }
      }

      /* Update & render */
      particles.current = particles.current.filter(p => {
        p.x    += p.vx;
        p.y    += p.vy;
        p.vy   -= 0.04;          // gentle upward drift
        p.vx   *= 0.97;
        p.vy   *= 0.97;
        p.angle += p.spin;
        p.life  -= 1;

        if (p.life <= 0) return false;

        const t     = p.life / p.maxLife;
        const alpha = Math.sin(t * Math.PI) * p.baseOpacity;
        const [r, g, b] = COLORS[p.colorIdx];
        const curSize = p.size * (0.3 + t * 0.7);

        ctx.save();
        ctx.globalAlpha = alpha;

        if (p.type === "orb") {
          // Outer glow
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, curSize * 2.8);
          grd.addColorStop(0,   `rgba(${r},${g},${b},0.9)`);
          grd.addColorStop(0.4, `rgba(${r},${g},${b},0.4)`);
          grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, curSize * 2.8, 0, Math.PI * 2);
          ctx.fill();
          // Core
          ctx.fillStyle = `rgba(${Math.min(r+40,255)},${Math.min(g+40,255)},${Math.min(b+40,255)},1)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, curSize * 0.55, 0, Math.PI * 2);
          ctx.fill();

        } else if (p.type === "star") {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, curSize * 3);
          grd.addColorStop(0,   `rgba(${r},${g},${b},0.5)`);
          grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, curSize * 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(${Math.min(r+50,255)},${Math.min(g+50,255)},255,0.95)`;
          drawStar(ctx, p.x, p.y, curSize, curSize * 0.45, 4, p.angle);
          ctx.fill();

        } else {
          ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`;
          ctx.lineWidth   = Math.max(0.8, curSize * 0.4);
          ctx.lineCap     = "round";

          // Horizontal
          ctx.beginPath();
          ctx.moveTo(p.x - curSize * 2, p.y);
          ctx.lineTo(p.x + curSize * 2, p.y);
          ctx.stroke();
          // Vertical
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - curSize * 2);
          ctx.lineTo(p.x, p.y + curSize * 2);
          ctx.stroke();
          
          const grd2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, curSize * 1.5);
          grd2.addColorStop(0, `rgba(${r},${g},${b},0.6)`);
          grd2.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = grd2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, curSize * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        return true;
      });

      rafId.current = requestAnimationFrame(draw);
    };

    rafId.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        9997,
        pointerEvents: "none",
      }}
    />
  );
}
