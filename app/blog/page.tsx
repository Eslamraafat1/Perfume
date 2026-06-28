"use client";

import React, { useRef, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ARTICLES = [
  {
    id: 1,
    title: "The Art of Layering: Creating Your Signature Scent",
    excerpt: "Discover the secrets of combining different fragrances to create a unique olfactory signature that is entirely your own.",
    category: "Guide",
    tag: "Woody",
    date: "Oct 12, 2023",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800",
    featured: true
  },
  {
    id: 2,
    title: "Decoding Fragrance Families: From Floral to Oriental",
    excerpt: "Navigate the complex world of perfumery by understanding the core fragrance families and finding which ones suit your personality.",
    category: "Education",
    tag: "Floral",
    date: "Sep 28, 2023",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800",
    featured: false
  },
  {
    id: 3,
    title: "The Evolution of Oud in Modern Niche Perfumery",
    excerpt: "How the ancient \"liquid gold\" from Southeast Asia has been reimagined by contemporary master perfumers in the West.",
    category: "Ingredients",
    tag: "Amber",
    date: "Sep 15, 2023",
    image: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?q=80&w=800",
    featured: false
  },
  {
    id: 4,
    title: "Sillage and Longevity: The Technical Side of Perfume",
    excerpt: "Understanding the difference between how long a perfume lasts and the trail it leaves behind, and how to maximize both.",
    category: "Education",
    tag: "Citrus",
    date: "Aug 30, 2023",
    image: "https://images.unsplash.com/photo-1557170334-a9632e77c6e4?q=80&w=800",
    featured: false
  },
  {
    id: 5,
    title: "The Psychological Power of Scent and Memory",
    excerpt: "Why certain fragrances transport us instantly to another time and place, and the science behind olfactory memory.",
    category: "Culture",
    tag: "Floral",
    date: "Aug 12, 2023",
    image: "https://images.unsplash.com/photo-1512777576244-b846ac3d816f?q=80&w=800",
    featured: false
  }
];

const SCENT_TAGS = ["All", "Woody", "Floral", "Amber", "Citrus", "Spicy"];

const INSTA_GALLERY = [
  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=400",
  "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=400",
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=400",
  "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=400"
];

export default function BlogPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTag, setSelectedTag] = useState("All");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.fromTo('.header-content > *',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" }
      );

      // Featured Article Animation
      gsap.fromTo('.featured-article',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, ease: "power3.out", delay: 0.4 }
      );

      // Regular Articles Animation
      gsap.fromTo('.article-card',
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.articles-grid',
            start: "top 80%",
          }
        }
      );

      // Reveal new sections
      const reveals = document.querySelectorAll('.reveal-el');
      reveals.forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
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

  // Filtering
  const filteredArticles = selectedTag === "All" 
    ? ARTICLES 
    : ARTICLES.filter(a => a.tag === selectedTag);

  const featuredArticle = filteredArticles.find(a => a.featured) || filteredArticles[0];
  const regularArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);

  return (
    <main style={{ background: "var(--black)", color: "var(--white)", minHeight: "100vh", overflowX: "hidden" }} ref={containerRef}>
      <Navbar />

      {/* ─── SECTION 1: HEADER ─── */}
      <div style={{ padding: "180px 24px 60px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="header-content" style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ color: "var(--gold)", letterSpacing: "0.35em", fontSize: "0.75rem", marginBottom: "16px", textTransform: "uppercase" }}>Journal</p>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 700, textTransform: "uppercase", marginBottom: "20px" }}>
              Scent &amp; Story
            </h1>
            <p style={{ color: "var(--white-muted)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.85 }}>
              Explore the fascinating world of niche perfumery, from rare ingredients to the art of composition.
            </p>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: SCENT TAGS CLOUD ─── */}
      <section className="reveal-el" style={{ padding: "30px 24px", borderTop: "1px solid rgba(220,202,187,0.1)", borderBottom: "1px solid rgba(220,202,187,0.1)", background: "var(--dark)", marginBottom: "60px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "var(--gold)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.15em", marginRight: "16px" }}>Filter Scent:</span>
          {SCENT_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className="glass-panel"
              style={{
                padding: "10px 22px",
                borderRadius: "30px",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: selectedTag === tag ? "1px solid var(--gold)" : "1px solid rgba(220,202,187,0.15)",
                background: selectedTag === tag ? "linear-gradient(135deg, var(--gold), var(--gold-dark))" : "rgba(10,15,36,0.3)",
                color: selectedTag === tag ? "var(--black)" : "var(--white-muted)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: selectedTag === tag ? 700 : 400
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* ─── SECTION 3: FEATURED & GRID ARTICLES ─── */}
      <div style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {featuredArticle ? (
            <div className="featured-article" style={{ marginBottom: "80px", cursor: "pointer" }}>
              <div className="glass-panel about-grid" style={{ border: "1px solid rgba(220,202,187,0.12)", borderRadius: "24px", overflow: "hidden" }}>
                <div style={{ overflow: "hidden", position: "relative" }} className="about-image">
                  <img 
                    src={featuredArticle.image} 
                    alt={featuredArticle.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = "scale(1.04)")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = "scale(1)")}
                  />
                </div>
                <div style={{ padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
                  <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(220,202,187,0.06) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(30px)" }}></div>
                  
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{ display: "flex", gap: "15px", alignItems: "center", marginBottom: "20px" }}>
                      <span style={{ background: "rgba(220,202,187,0.1)", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.7rem", fontWeight: 700, padding: "5px 14px", borderRadius: "20px" }}>
                        {featuredArticle.category}
                      </span>
                      <span style={{ color: "var(--white-muted)", fontSize: "0.82rem" }}>{featuredArticle.date}</span>
                    </div>
                    
                    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", lineHeight: "1.2", marginBottom: "20px", textTransform: "uppercase" }}>
                      {featuredArticle.title}
                    </h2>
                    
                    <p style={{ lineHeight: "1.75", color: "var(--white-muted)", marginBottom: "30px", fontSize: "0.95rem" }}>
                      {featuredArticle.excerpt}
                    </p>
                    
                    <div style={{ color: "var(--gold)", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.1rem" }}>
                      Read Article ➔
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "var(--white-muted)" }}>No articles match the selected scent family.</p>
            </div>
          )}

          {/* Articles Grid */}
          {regularArticles.length > 0 && (
            <div className="articles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px" }}>
              {regularArticles.map((article) => (
                <div key={article.id} className="article-card" style={{ cursor: "pointer" }}>
                  <div style={{ position: "relative", height: "280px", overflow: "hidden", borderRadius: "20px", marginBottom: "24px", border: "1px solid rgba(220,202,187,0.1)" }}>
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease" }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = "scale(1)")}
                    />
                    <div style={{ position: "absolute", top: "16px", left: "16px", zIndex: 2 }}>
                      <span style={{ background: "var(--gold)", color: "var(--black)", padding: "5px 14px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {article.category}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ padding: "0 8px" }}>
                    <span style={{ color: "var(--white-muted)", fontSize: "0.8rem", display: "block", marginBottom: "8px" }}>{article.date}</span>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "var(--white)", marginBottom: "12px", lineHeight: "1.35", textTransform: "uppercase" }}>
                      {article.title}
                    </h3>
                    <p style={{ fontSize: "0.88rem", color: "var(--white-muted)", lineHeight: 1.7, marginBottom: "16px" }}>
                      {article.excerpt}
                    </p>
                    <div style={{ color: "var(--gold)", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.95rem" }}>
                      Read Article ➔
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── SECTION 4: COMMUNITY SCENT MOMENTS ─── */}
      <section className="reveal-el" style={{ padding: "100px 24px", borderTop: "1px solid rgba(220,202,187,0.1)", background: "var(--dark)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span className="section-tag" style={{ color: "var(--gold)" }}>✦ Community</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", textTransform: "uppercase" }}>Scent Moments</h2>
            <p style={{ color: "var(--white-muted)", fontSize: "0.92rem", marginTop: "10px" }}>Tag <strong style={{ color: "var(--gold)" }}>#MaisonLuxe</strong> on Instagram to be featured.</p>
          </div>
          <div className="about-grid">
            {INSTA_GALLERY.map((img, idx) => (
              <div key={idx} style={{ position: "relative", height: "260px", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(220,202,187,0.12)" }}>
                <img src={img} alt={`Community moment ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
