"use client";

import React, { useRef, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ Active Index State
  const [faqActive, setFaqActive] = useState<number | null>(null);

  const faqs = [
    {
      q: "How long do Nubia perfumes last on skin?",
      a: "Our fragrances are formulated at highly concentrated Extrait de Parfum levels. Thanks to our 90-day maturation vault process, woody and oud blends typically last 10–12 hours, while fresh citrus notes persist for 6–8 hours."
    },
    {
      q: "What is your shipping policy within Egypt?",
      a: "We offer next-day delivery within Cairo and Giza, and 2-3 business days for other governorates. Shipping is completely free for all orders above 1500 EGP."
    },
    {
      q: "Can I customize a fragrance bottle for a gift?",
      a: "Yes, we offer bespoke calligraphic gold engraving on our signature bottles. You can specify the recipient's initials or name in the order notes at checkout, or contact our VIP concierge."
    },
    {
      q: "What is your return/exchange policy?",
      a: "We include a 2ml discovery vial of the same fragrance with every order. We recommend spraying the vial first. If it doesn't match your chemistry, you can return the unopened 100ml bottle within 14 days for a full refund or exchange."
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animations
      gsap.fromTo('.header-content > *',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" }
      );

      // Contact Info Cards
      gsap.fromTo('.info-card',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: "power2.out", delay: 0.4 }
      );

      // Form Animation
      gsap.fromTo('.contact-form',
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power2.out", delay: 0.6 }
      );

      // Scroll reveals
      const reveals = document.querySelectorAll('.reveal-el');
      reveals.forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: el,
              start: "top 85%"
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main style={{ background: "var(--black)", color: "var(--white)", minHeight: "100vh", overflowX: "hidden" }} ref={containerRef}>
      <Navbar />

      {/* ─── SECTION 1: HEADER & FORM/INFO ─── */}
      <div style={{ padding: "180px 24px 80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          <div className="header-content" style={{ textAlign: "center", marginBottom: "70px" }}>
            <p style={{ color: "var(--gold)", letterSpacing: "0.35em", fontSize: "0.75rem", marginBottom: "16px", textTransform: "uppercase" }}>Get In Touch</p>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 700, textTransform: "uppercase", marginBottom: "20px" }}>
              Contact Us
            </h1>
            <p style={{ color: "var(--white-muted)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.85 }}>
              Whether you have a question about our collections, need assistance with an order, or simply wish to share your thoughts, we are here for you.
            </p>
          </div>

          <div className="about-grid">
            
            {/* Contact Information */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <div className="info-card glass-panel" style={{ padding: "32px", borderRadius: "20px", display: "flex", gap: "20px", borderLeft: "3px solid var(--gold)" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--dark-3)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(220,202,187,0.2)" }}>
                  <span style={{ fontSize: "1.2rem" }}>📍</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", color: "var(--white)", marginBottom: "8px" }}>Our Boutique</h3>
                  <p style={{ color: "var(--white-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    123 Fragrance Avenue, Suite 400<br/>
                    Cairo, Egypt
                  </p>
                </div>
              </div>

              <div className="info-card glass-panel" style={{ padding: "32px", borderRadius: "20px", display: "flex", gap: "20px", borderLeft: "3px solid var(--gold)" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--dark-3)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(220,202,187,0.2)" }}>
                  <span style={{ fontSize: "1.2rem" }}>📞</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", color: "var(--white)", marginBottom: "8px" }}>Phone</h3>
                  <p style={{ color: "var(--white-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    +20 2 1234 5678<br/>
                    <span style={{ fontSize: "0.78rem", color: "rgba(220,202,187,0.6)" }}>Mon-Sat: 10am - 10pm (EST)</span>
                  </p>
                </div>
              </div>

              <div className="info-card glass-panel" style={{ padding: "32px", borderRadius: "20px", display: "flex", gap: "20px", borderLeft: "3px solid var(--gold)" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--dark-3)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(220,202,187,0.2)" }}>
                  <span style={{ fontSize: "1.2rem" }}>✉️</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", color: "var(--white)", marginBottom: "8px" }}>Email</h3>
                  <p style={{ color: "var(--white-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    contact@maisonluxe.com<br/>
                    concierge@maisonluxe.com
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form glass-panel" style={{ padding: "40px", borderRadius: "24px", border: "1px solid rgba(220,202,187,0.15)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "200px", background: "radial-gradient(circle, rgba(220,202,187,0.06) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(30px)" }}></div>
              
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: "var(--white)", marginBottom: "28px" }}>Send a Message</h3>
              
              {isSubmitted ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 0" }}>
                  <div style={{
                    width: "80px", height: "80px",
                    background: "rgba(76,175,80,0.15)",
                    border: "1px solid rgba(76,175,80,0.3)",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "20px", fontSize: "2rem", color: "#4caf50"
                  }}>
                    ✓
                  </div>
                  <h4 style={{ fontFamily: "var(--font-title)", fontSize: "1.4rem", color: "var(--white)", marginBottom: "8px" }}>Message Sent!</h4>
                  <p style={{ color: "var(--white-muted)", fontSize: "0.9rem" }}>We will get back to you as soon as possible.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div className="contact-form-row">
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input 
                      type="text" 
                      name="subject" 
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="How can we help you?"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea 
                      name="message" 
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="form-textarea"
                      placeholder="Your message here..."
                      rows={5}
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: "0.9rem" }}
                  >
                    {isSubmitting ? "Sending..." : "Send Message ➔"}
                  </button>
                </form>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: VIP BESPOKE CONSULTATION ─── */}
      <section className="reveal-el" style={{ padding: "120px 60px", background: "var(--dark)", borderTop: "1px solid rgba(220,202,187,0.1)", borderBottom: "1px solid rgba(220,202,187,0.1)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="about-grid">
            <div>
              <span className="section-tag" style={{ color: "var(--gold)" }}>✦ Exclusive Experience</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 3.5vw, 3rem)", textTransform: "uppercase", color: "var(--white)", marginBottom: "24px" }}>VIP Bespoke Olfactory Mapping</h2>
              <p style={{ color: "var(--white-muted)", fontSize: "0.95rem", lineHeight: "1.85", marginBottom: "20px" }}>
                Step into a sensory sanctuary. Our private boutique features a dedicated VIP Chamber where you can sit with a master scent consultant.
              </p>
              <p style={{ color: "var(--white-muted)", fontSize: "0.95rem", lineHeight: "1.85", marginBottom: "32px" }}>
                During a 45-minute session, we evaluate your scent family preferences, skin pH reaction, and personal aesthetic to curate a custom rotation of 3 signature fragrances that command presence.
              </p>
              <a href="mailto:concierge@maisonluxe.com" className="btn-gold-outline" style={{ textDecoration: "none" }}>Email VIP Concierge</a>
            </div>
            <div style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(220, 202, 187, 0.15)" }} className="about-image">
              <img src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000" alt="Boutique VIP Table" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: FAQ ACCORDIONS ─── */}
      <section className="reveal-el" style={{ padding: "120px 60px", background: "var(--black)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span className="section-tag" style={{ color: "var(--gold)" }}>✦ Questions &amp; Answers</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", textTransform: "uppercase" }}>Olfactory FAQs</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="glass-panel" 
                style={{ 
                  padding: "24px 32px", 
                  borderRadius: "16px", 
                  cursor: "pointer", 
                  border: faqActive === i ? "1px solid var(--gold)" : "1px solid rgba(220,202,187,0.12)",
                  transition: "all 0.3s ease"
                }}
                onClick={() => setFaqActive(faqActive === i ? null : i)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", color: faqActive === i ? "var(--gold)" : "var(--white)", transition: "color 0.2s" }}>
                    {faq.q}
                  </h4>
                  <span style={{ color: "var(--gold)", transition: "transform 0.3s ease", transform: faqActive === i ? "rotate(45deg)" : "rotate(0)" }}>
                    ➕
                  </span>
                </div>
                {faqActive === i && (
                  <p style={{ color: "var(--white-muted)", fontSize: "0.9rem", lineHeight: "1.65", marginTop: "16px", borderTop: "1px solid rgba(220,202,187,0.12)", paddingTop: "16px" }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: MAP ─── */}
      <section style={{ height: "450px", width: "100%", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "var(--dark-3)", opacity: 0.6, mixBlendMode: "multiply", zIndex: 10, pointerEvents: "none" }}></div>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(100%) contrast(125%) brightness(40%)"
        }}></div>
        
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 20 }}>
          <div style={{
            width: "64px", height: "64px",
            background: "var(--gold)", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.8rem",
            boxShadow: "0 0 30px rgba(219,202,187,0.5)",
            animation: "bounce 2s infinite"
          }}>
            📍
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
