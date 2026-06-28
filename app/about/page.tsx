"use client";

import React, { useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import gsap from 'gsap';

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Simple, reliable hero animation
      gsap.fromTo('.about-hero-content', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main style={{ background: "var(--black)", color: "var(--white)", minHeight: "100vh", overflowX: "hidden" }} ref={containerRef}>
      <Navbar />

      {/* ─── SECTION 1: HERO ─── */}
      <section style={{
        position: "relative",
        padding: "160px 24px 100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, var(--dark-3) 0%, var(--black) 100%)",
        textAlign: "center",
        overflow: "hidden"
      }}>
        {/* Glow Effects */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(220, 202, 187, 0.1) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 1
        }} />

        <div className="about-hero-content" style={{ position: "relative", zIndex: 2, maxWidth: "800px", margin: "0 auto" }}>
          <span style={{
            display: "inline-block",
            border: "1px solid rgba(220, 202, 187, 0.3)",
            borderRadius: "40px",
            padding: "6px 20px",
            fontSize: "0.75rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: "24px",
            background: "rgba(220, 202, 187, 0.05)"
          }}>
            ✦ Our Story
          </span>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: "24px",
            textTransform: "uppercase"
          }}>
            The Essence of <br />
            <span className="gold-text">Maison Luxe</span>
          </h1>
          <p style={{
            color: "var(--white-muted)",
            fontSize: "1.05rem",
            lineHeight: 1.85,
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Established with a passion for olfactory excellence, Maison Luxe crafts premium niche fragrances that merge royal Eastern heritage with contemporary French sophistication.
          </p>
        </div>
      </section>

      {/* ─── SECTION 2: OUR STORY ─── */}
      <section style={{
        padding: "100px 24px",
        background: "var(--dark)",
        borderTop: "1px solid rgba(220, 202, 187, 0.08)",
        borderBottom: "1px solid rgba(220, 202, 187, 0.08)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="about-grid">
            {/* Image */}
            <div className="about-image" style={{
              position: "relative",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(220, 202, 187, 0.15)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              height: "480px"
            }}>
              <img 
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000" 
                alt="Perfume crafting" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span className="section-tag" style={{ color: "var(--gold)" }}>✦ Heritage &amp; Passion</span>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                textTransform: "uppercase",
                marginBottom: "20px",
                lineHeight: 1.2
              }}>
                Crafting Liquid Memories
              </h2>
              <p style={{ color: "var(--white-muted)", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: "20px" }}>
                At Maison Luxe, we believe a fragrance is more than a scent—it is an invisible statement, a powerful form of self-expression that commands presence. 
              </p>
              <p style={{ color: "var(--white-muted)", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: "30px" }}>
                Every bottle undergoes a rigorous 90-day maceration ritual in our climate-controlled dark vaults. This slow maturation allows the natural oils to bond, ensuring exceptional longevity, projection, and sillage.
              </p>
              
              <div style={{ display: "flex", gap: "40px", paddingTop: "24px", borderTop: "1px solid rgba(220, 202, 187, 0.12)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", color: "var(--gold)", fontWeight: 700 }}>15+</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--white-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>Years of Mastery</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", color: "var(--gold)", fontWeight: 700 }}>90 Days</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--white-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>Maceration Vaults</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: CORE PHILOSOPHY ─── */}
      <section style={{
        padding: "100px 24px",
        background: "var(--black)",
        borderBottom: "1px solid rgba(220, 202, 187, 0.08)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span className="section-tag" style={{ color: "var(--gold)" }}>✦ Our Philosophy</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", textTransform: "uppercase" }}>The Pillars of Our Craft</h2>
          </div>

          <div className="triple-grid">
            <div className="glass-panel" style={{ padding: "40px 30px", borderRadius: "16px", borderTop: "3px solid var(--gold)" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "20px" }}>🪵</div>
              <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", marginBottom: "12px", color: "var(--white)" }}>Artisan Craftsmanship</h3>
              <p style={{ color: "var(--white-muted)", fontSize: "0.88rem", lineHeight: 1.7 }}>
                We blend traditional perfumery techniques with modern molecular tuning, honoring the heritage of the craft while pushing its boundaries.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: "40px 30px", borderRadius: "16px", borderTop: "3px solid var(--gold)" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "20px" }}>🌹</div>
              <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", marginBottom: "12px", color: "var(--white)" }}>Pure Ingredients</h3>
              <p style={{ color: "var(--white-muted)", fontSize: "0.88rem", lineHeight: 1.7 }}>
                We use only the highest quality absolutes, resins, and essential oils, ethically sourced to ensure sustainability and unparalleled richness.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: "40px 30px", borderRadius: "16px", borderTop: "3px solid var(--gold)" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "20px" }}>👑</div>
              <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", marginBottom: "12px", color: "var(--white)" }}>Exclusivity</h3>
              <p style={{ color: "var(--white-muted)", fontSize: "0.88rem", lineHeight: 1.7 }}>
                Produced in small, meticulously controlled batches, our fragrances are designed for those who appreciate true luxury and individuality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: MASTER PERFUMERS ─── */}
      <section style={{
        padding: "100px 24px",
        background: "var(--dark)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span className="section-tag" style={{ color: "var(--gold)" }}>✦ The Noses</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", textTransform: "uppercase" }}>Our Master Perfumers</h2>
          </div>

          <div className="perfumers-grid">
            <div className="glass-panel" style={{ padding: "40px", borderRadius: "20px", textAlign: "center" }}>
              <div style={{ width: "140px", height: "140px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 24px", border: "2px solid var(--gold)" }}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400" alt="Master Perfumer Elena" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", color: "var(--gold)", marginBottom: "4px" }}>Elena Rostova</h3>
              <p style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--white-muted)", letterSpacing: "0.1em", marginBottom: "16px" }}>Chief Nose &amp; Co-Founder</p>
              <p style={{ color: "var(--white-muted)", fontSize: "0.85rem", lineHeight: "1.7" }}>
                Elena studied under third-generation distillers in Grasse. She specializes in floral-oriental harmonies and raw rose extraction.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: "40px", borderRadius: "20px", textAlign: "center" }}>
              <div style={{ width: "140px", height: "140px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 24px", border: "2px solid var(--gold)" }}>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400" alt="Master Perfumer Karim" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", color: "var(--gold)", marginBottom: "4px" }}>Karim El-Amin</h3>
              <p style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--white-muted)", letterSpacing: "0.1em", marginBottom: "16px" }}>Master of Woody &amp; Oud Syntheses</p>
              <p style={{ color: "var(--white-muted)", fontSize: "0.85rem", lineHeight: "1.7" }}>
                Karim brings 18 years of oriental blending experience, utilizing rare ambergris, saffron, and aged Cambodian oud.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
