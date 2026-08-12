"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─────────────────────────────────────────────────────────
   Gold fireworks canvas — full-screen, behind everything
───────────────────────────────────────────────────────── */
function GoldFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    type Spark = {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      size: number; color: [number,number,number];
      trail: { x:number; y:number }[];
    };
    const sparks: Spark[] = [];

    const GOLD_PALETTE: [number,number,number][] = [
      [240,210,140], [255,235,170], [200,165,90],
      [220,195,130], [255,245,200], [180,145,80],
    ];

    function burst(cx: number, cy: number) {
      const count = 55 + Math.floor(Math.random() * 30);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 2.5 + Math.random() * 5;
        const life  = 55 + Math.random() * 50;
        sparks.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life, maxLife: life,
          size: 1.5 + Math.random() * 3,
          color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
          trail: [],
        });
      }
    }

    // Fire 3 bursts on load
    const positions = [
      { x: canvas.width * 0.25, y: canvas.height * 0.35 },
      { x: canvas.width * 0.75, y: canvas.height * 0.30 },
      { x: canvas.width * 0.50, y: canvas.height * 0.25 },
    ];
    const delays = [200, 600, 1050];
    const timers = positions.map((pos, i) =>
      setTimeout(() => burst(pos.x, pos.y), delays[i])
    );

    let raf: number;
    function draw() {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 7) s.trail.shift();

        s.x  += s.vx;
        s.y  += s.vy;
        s.vy += 0.06;   // gravity
        s.vx *= 0.985;
        s.vy *= 0.985;
        s.life -= 1;

        const t     = s.life / s.maxLife;
        const alpha = t * t;
        const [r, g, b] = s.color;

        // Trail
        if (s.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(s.trail[0].x, s.trail[0].y);
          for (let j = 1; j < s.trail.length; j++) {
            ctx.lineTo(s.trail[j].x, s.trail[j].y);
          }
          ctx.strokeStyle = `rgba(${r},${g},${b},${(alpha * 0.4).toFixed(2)})`;
          ctx.lineWidth   = s.size * 0.4;
          ctx.lineCap     = "round";
          ctx.stroke();
        }

        // Glow halo
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3.5);
        grd.addColorStop(0, `rgba(${r},${g},${b},${(alpha * 0.8).toFixed(2)})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(255,248,220,${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        if (s.life <= 0) sparks.splice(i, 1);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────── */
export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<any>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("last-order");
    if (saved) setOrder(JSON.parse(saved));
  }, []);

  return (
    <div
      ref={pageRef}
      style={{ background: "var(--black)", color: "var(--white)", minHeight: "100vh", overflow: "hidden" }}
    >
      <Navbar />

      {/* Gold fireworks background */}
      <GoldFireworks />

      <style>{`
        /* ─── Unboxing keyframes ─── */
        @keyframes ub-drop {
          0%   { transform: translateY(-120px) scale(0.6) rotate(-8deg); opacity: 0; }
          55%  { transform: translateY(12px)   scale(1.06) rotate(2deg);  opacity: 1; }
          75%  { transform: translateY(-6px)   scale(0.97) rotate(-1deg); }
          100% { transform: translateY(0)      scale(1)    rotate(0deg);  opacity: 1; }
        }
        @keyframes ub-ribbon-h {
          0%,40% { transform: scaleX(1); opacity: 1; }
          100%   { transform: scaleX(0); opacity: 0; }
        }
        @keyframes ub-ribbon-v {
          0%,40% { transform: scaleY(1); opacity: 1; }
          100%   { transform: scaleY(0); opacity: 0; }
        }
        @keyframes ub-lid {
          0%,45% { transform: translateY(0) rotateX(0);   opacity: 1; }
          100%   { transform: translateY(-70px) rotateX(-50deg); opacity: 0; }
        }
        @keyframes ub-bottle {
          0%    { transform: translateY(40px) scale(0.6); opacity: 0; filter: blur(4px); }
          100%  { transform: translateY(-18px) scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes ub-glow-pulse {
          0%,100% { box-shadow: 0 0 30px rgba(201,169,110,0.3), 0 0 60px rgba(201,169,110,0.1); }
          50%     { box-shadow: 0 0 60px rgba(201,169,110,0.6), 0 0 100px rgba(201,169,110,0.3); }
        }
        @keyframes ub-spark {
          0%   { transform: translate(0,0) scale(0) rotate(0deg); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translate(var(--sx),var(--sy)) scale(0) rotate(var(--sr)); opacity: 0; }
        }
        @keyframes ub-float {
          0%,100% { transform: translateY(0px) rotate(-3deg); }
          50%     { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes ub-shimmer-title {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes ub-ring {
          0%   { transform: scale(0); opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes fade-up-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ub-box     { animation: ub-drop 1s 0.15s cubic-bezier(0.34,1.56,0.64,1) both; }
        .ub-lid     { animation: ub-lid  0.55s 0.9s ease-in both; }
        .ub-rib-h   { animation: ub-ribbon-h 0.4s 0.75s ease-in both; }
        .ub-rib-v   { animation: ub-ribbon-v 0.4s 0.75s ease-in both; }
        .ub-bottle  { animation: ub-bottle 0.75s 1.25s cubic-bezier(0.34,1.56,0.64,1) both; }
        .ub-float   { animation: ub-float 4s 2s ease-in-out infinite; }
        .ub-spark   { animation: ub-spark 1.4s ease-out forwards; }
        .ub-ring    { animation: ub-ring 1s ease-out both; }
        .ub-glow    { animation: ub-glow-pulse 2.5s 2s ease-in-out infinite; }
        .ub-title   {
          background: linear-gradient(90deg,#9a7830,#c9a96e,#f0d890,#fff8dc,#f0d890,#c9a96e,#9a7830);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ub-shimmer-title 3.5s linear infinite;
        }
        .ub-fadeup  { animation: fade-up-in 0.7s ease both; }
      `}</style>

      <section
        style={{
          padding: "140px 24px 100px",
          maxWidth: "820px",
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* ══ UNBOXING SCENE ══ */}
        <div
          style={{
            position: "relative",
            width: "200px",
            height: "260px",
            margin: "0 auto 56px",
            perspective: "800px",
          }}
        >
          {/* Sparks */}
          {[
            { sx:"-90px", sy:"-80px", sr:"30deg",  delay:"1.2s", c:"#f0d890", s:"12px" },
            { sx: "85px", sy:"-95px", sr:"-25deg", delay:"1.3s", c:"#dcccbb", s:"9px"  },
            { sx:"-110px",sy:"-20px", sr:"45deg",  delay:"1.35s",c:"#c9a96e", s:"10px" },
            { sx: "100px",sy:"-15px", sr:"-40deg", delay:"1.25s",c:"#f6f0ea", s:"8px"  },
            { sx:  "10px",sy:"-120px",sr:"20deg",  delay:"1.15s",c:"#dbcabb", s:"11px" },
            { sx:"-60px", sy: "80px", sr:"-30deg", delay:"1.4s", c:"#c9a96e", s:"7px"  },
            { sx: "70px", sy: "75px", sr:"35deg",  delay:"1.45s",c:"#f0d890", s:"6px"  },
            { sx:"-130px",sy: "40px", sr:"-20deg", delay:"1.5s", c:"#dcccbb", s:"8px"  },
            { sx: "120px",sy: "50px", sr:"50deg",  delay:"1.28s",c:"#f6f0ea", s:"7px"  },
          ].map((s, i) => (
            <div
              key={i}
              className="ub-spark"
              style={{
                position: "absolute",
                top: "45%", left: "50%",
                width: s.s, height: s.s,
                marginTop: `-${parseInt(s.s)/2}px`,
                marginLeft: `-${parseInt(s.s)/2}px`,
                borderRadius: "50%",
                background: `radial-gradient(circle, white 0%, ${s.c} 60%)`,
                boxShadow: `0 0 8px ${s.c}, 0 0 20px ${s.c}`,
                animationDelay: s.delay,
                ["--sx" as string]: s.sx,
                ["--sy" as string]: s.sy,
                ["--sr" as string]: s.sr,
              } as React.CSSProperties}
            />
          ))}

          {/* Expanding ring */}
          <div className="ub-ring" style={{
            position: "absolute", top: "45%", left: "50%",
            width: "80px", height: "80px",
            marginTop: "-40px", marginLeft: "-40px",
            borderRadius: "50%",
            border: "2px solid rgba(201,169,110,0.7)",
            animationDelay: "1.1s",
          }} />
          <div className="ub-ring" style={{
            position: "absolute", top: "45%", left: "50%",
            width: "60px", height: "60px",
            marginTop: "-30px", marginLeft: "-30px",
            borderRadius: "50%",
            border: "1.5px solid rgba(240,216,144,0.5)",
            animationDelay: "1.3s",
          }} />

          {/* ── BOX BODY ── */}
          <div className="ub-box ub-glow" style={{
            position: "absolute",
            bottom: 0, left: "50%",
            transform: "translateX(-50%)",
            width: "130px", height: "130px",
            background: "linear-gradient(150deg, #1e2d52 0%, #0d1630 50%, #1a2848 100%)",
            border: "1px solid rgba(201,169,110,0.5)",
            borderRadius: "10px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}>
            {/* Nubia N watermark */}
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-serif)", fontSize: "3.5rem", fontWeight: 800,
              background: "linear-gradient(135deg,#c9a96e,#f0d890,#dcccbb,#c9a96e)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              opacity: 0.25,
            }}>N</div>
            {/* Gold stripe top */}
            <div style={{ position:"absolute", top:"14px", left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#c9a96e,#f0d890,#c9a96e,transparent)" }} />
            {/* Gold stripe bottom */}
            <div style={{ position:"absolute", bottom:"14px", left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#c9a96e,#f0d890,#c9a96e,transparent)" }} />
          </div>

          {/* ── RIBBON ── */}
          <div style={{
            position: "absolute", bottom: 0, left: "50%",
            transform: "translateX(-50%)",
            width: "130px", height: "130px",
            pointerEvents: "none",
          }}>
            <div className="ub-rib-v" style={{
              position:"absolute", top:0, bottom:0,
              left:"50%", width:"18px", marginLeft:"-9px",
              background:"linear-gradient(180deg,#a07840,#f0d890,#c9a96e,#f0d890,#a07840)",
              transformOrigin:"top center",
              boxShadow:"0 0 8px rgba(201,169,110,0.4)",
            }} />
            <div className="ub-rib-h" style={{
              position:"absolute", left:0, right:0,
              top:"50%", height:"18px", marginTop:"-9px",
              background:"linear-gradient(90deg,#a07840,#f0d890,#c9a96e,#f0d890,#a07840)",
              transformOrigin:"left center",
              boxShadow:"0 0 8px rgba(201,169,110,0.4)",
            }} />
            {/* Bow center knot */}
            <div style={{
              position:"absolute", top:"50%", left:"50%",
              transform:"translate(-50%,-50%)",
              width:"26px", height:"26px", borderRadius:"50%",
              background:"radial-gradient(circle,#fff8dc 0%,#f0d890 40%,#c9a96e 100%)",
              boxShadow:"0 0 14px rgba(201,169,110,0.8)",
            }} />
          </div>

          {/* ── LID ── */}
          <div className="ub-lid" style={{
            position: "absolute",
            bottom: "124px", left: "50%",
            transform: "translateX(-50%)",
            width: "144px", height: "32px",
            background: "linear-gradient(150deg, #2a3a6a 0%, #1a2850 100%)",
            border: "1px solid rgba(201,169,110,0.5)",
            borderRadius: "8px 8px 0 0",
            transformOrigin: "bottom center",
            boxShadow: "0 -4px 20px rgba(201,169,110,0.2)",
          }} />

          {/* ── BOTTLE emerging ── */}
          <div className="ub-bottle ub-float" style={{
            position: "absolute",
            bottom: "120px", left: "50%",
            transform: "translateX(-50%)",
            fontSize: "4rem",
            lineHeight: 1,
            filter: "drop-shadow(0 -12px 25px rgba(201,169,110,0.7)) drop-shadow(0 6px 12px rgba(0,0,0,0.6))",
          }}>
            🧴
          </div>
        </div>

        {/* ══ TITLE ══ */}
        <h1
          className="ub-title ub-fadeup"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "16px",
            lineHeight: 1.2,
            animationDelay: "1.6s",
          }}
        >
          Your Fragrance Awaits ✦
        </h1>

        <p
          className="ub-fadeup"
          style={{
            color: "var(--white-muted)",
            fontSize: "clamp(0.9rem,2vw,1.05rem)",
            maxWidth: "500px",
            margin: "0 auto 48px",
            lineHeight: 1.9,
            animationDelay: "1.8s",
          }}
        >
          Your order is being prepared with the utmost care in our
          fragrance vault. Expect a royal delivery experience.
        </p>

        {/* ══ ORDER CARD ══ */}
        {order && (
          <div
            className="ub-fadeup"
            style={{
              background: "linear-gradient(145deg, rgba(12,18,40,0.95), rgba(18,26,55,0.9))",
              border: "1px solid rgba(201,169,110,0.2)",
              borderRadius: "24px",
              padding: "clamp(24px,4vw,40px)",
              textAlign: "left",
              marginBottom: "40px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
              animationDelay: "2s",
            }}
          >
            {/* Header row */}
            <div style={{
              display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
              borderBottom: "1px solid rgba(201,169,110,0.12)",
              paddingBottom: "20px", marginBottom: "24px",
            }}>
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "6px" }}>Order ID</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>{order.id}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.68rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "6px" }}>Payment</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#fff" }}>
                  {order.payment_method === "cod"
                    ? "💵 Cash on Delivery"
                    : order.payment_method === "instapay"
                    ? "📲 InstaPay Deposit"
                    : "💳 Card"}
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "10px" }}>📦 Delivery Address</div>
              <p style={{ fontSize: "0.9rem", color: "var(--white-muted)", lineHeight: 1.75 }}>
                <strong style={{ color: "#fff" }}>{order.customer_name}</strong><br />
                {order.shipping_address}, {order.governorate}, Egypt<br />
                📞 {order.customer_phone}
              </p>
            </div>

            {/* Items */}
            <div style={{ borderTop: "1px solid rgba(201,169,110,0.08)", paddingTop: "20px", marginBottom: "20px" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "14px" }}>🛍 Items Ordered</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 16px", borderRadius: "12px",
                    background: "rgba(201,169,110,0.05)",
                    border: "1px solid rgba(201,169,110,0.08)",
                    fontSize: "0.88rem",
                  }}>
                    <span style={{ color: "#fff" }}>
                      {item.name}
                      <span style={{ color: "rgba(220,202,187,0.5)", fontSize: "0.78rem", marginLeft: "8px" }}>
                        {item.size} · x{item.quantity}
                      </span>
                    </span>
                    <span style={{ color: "var(--gold)", fontFamily: "var(--font-serif)", fontWeight: 700 }}>
                      {(item.price * item.quantity).toLocaleString()} EGP
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div style={{ borderTop: "1px solid rgba(201,169,110,0.08)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", color: "rgba(255,255,255,0.5)" }}>
                <span>Subtotal</span><span>{order.subtotal?.toLocaleString()} EGP</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", color: "#4caf50" }}>
                  <span>Discount</span><span>-{order.discount?.toLocaleString()} EGP</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", color: "rgba(255,255,255,0.5)" }}>
                <span>Shipping</span><span>{order.shipping === 0 ? "Free 🎁" : `${order.shipping} EGP`}</span>
              </div>
              {order.payment_method === "instapay" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.86rem", color: "#00c8b4", fontWeight: 600 }}>
                    <span>📲 InstaPay Deposit (30%)</span>
                    <span>{Math.ceil(order.total * 0.3).toLocaleString()} EGP</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", color: "rgba(255,255,255,0.45)" }}>
                    <span>Remaining on Delivery (70%)</span>
                    <span>{(order.total - Math.ceil(order.total * 0.3)).toLocaleString()} EGP</span>
                  </div>
                </>
              )}
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: "clamp(1rem,2vw,1.15rem)", fontWeight: 800,
                borderTop: "1px solid rgba(201,169,110,0.15)",
                paddingTop: "16px", marginTop: "4px",
              }}>
                <span style={{ color: "#fff" }}>Total</span>
                <span style={{
                  fontFamily: "var(--font-serif)",
                  background: "linear-gradient(90deg,#c9a96e,#f0d890,#c9a96e)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  {order.total?.toLocaleString()} EGP
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ══ CTA BUTTONS ══ */}
        <div
          className="ub-fadeup"
          style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", animationDelay: "2.2s" }}
        >
          <Link href="/products" className="btn-primary" style={{ textDecoration: "none" }}>
            Continue Shopping
          </Link>
          <Link href="/" className="btn-gold-outline" style={{ textDecoration: "none", padding: "16px 36px" }}>
            Go to Homepage
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
