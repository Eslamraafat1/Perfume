"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { useSiteContent } from "@/app/context/SiteContentContext";

const CATEGORIES_STATIC = [
  { 
    id: "for-him", 
    title: "For Him", 
    titleAr: "للرجال", 
    defaultImg: "/perfume_1.png",
    contentKey: "cat1_image",
    bg: "linear-gradient(135deg, #0f172a, #1e293b)", 
    desc: "Bold, masculine, and unforgettable.", 
    descAr: "عطور ذات طابع ذكوري جريء وحضور قوي لا يُنسى." 
  },
  { 
    id: "for-her", 
    title: "For Her", 
    titleAr: "للنساء", 
    defaultImg: "/perfume_2.png",
    contentKey: "cat2_image",
    bg: "linear-gradient(135deg, #2a0a18, #4c1130)", 
    desc: "Elegant, floral, and completely captivating.", 
    descAr: "مزيج أنيق من الزهور يمنحكِ جاذبية ساحرة طوال اليوم." 
  },
  { 
    id: "unisex", 
    title: "Unisex", 
    titleAr: "للجنسين", 
    defaultImg: "/perfume_3.png",
    contentKey: "cat3_image",
    bg: "linear-gradient(135deg, #18181b, #27272a)", 
    desc: "Balanced and harmonious for anyone to wear.", 
    descAr: "توازن مثالي وتركيبة متناغمة تناسب الجميع بامتياز." 
  },
  { 
    id: "oriental", 
    title: "Oriental", 
    titleAr: "شرقي", 
    defaultImg: "/perfume_4.png",
    contentKey: "cat4_image",
    bg: "linear-gradient(135deg, #291a0c, #4a2c11)", 
    desc: "Rich oud, amber, and spices from the East.", 
    descAr: "أصالة الشرق في مزيج غني من العود والعنبر والتوابل." 
  },
];

export default function CategorySection() {
  const { isRTL } = useLanguage();
  const { get: sc } = useSiteContent();
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);

  // Build categories with dynamic images from Supabase (via SiteContentContext)
  const CATEGORIES = CATEGORIES_STATIC.map((cat) => ({
    ...cat,
    img: sc(cat.contentKey) || cat.defaultImg,
  }));

  return (
    <section className="cat-section">
      <div className="cat-header fade-up">
         <span style={{ fontSize: "0.7rem", color: "var(--gold)", letterSpacing: "0.35em", textTransform: "uppercase" }}>
           {isRTL ? "مجموعات العطور" : "Fragrance Collections"}
         </span>
         <h2 className="cat-main-title">{isRTL ? "اكتشف ما يناسبك" : "Find Your Signature"}</h2>
      </div>

      <div className="cat-container fade-up">
        {CATEGORIES.map((cat, i) => {
          const isActive = hoveredIndex === i;
          return (
            <div 
              key={cat.id} 
              className={`cat-panel ${isActive ? "active" : ""}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onClick={() => setHoveredIndex(i)}
              style={{ background: cat.bg }}
              role="button"
              tabIndex={0}
            >
              <div className="cat-content">
                <div className="cat-text">
                  <h3 className="cat-title">{isRTL ? cat.titleAr : cat.title}</h3>
                  <p className="cat-desc">{isRTL ? cat.descAr : cat.desc}</p>
                  <Link href={`/products?category=${cat.id}`} className="cat-btn">
                    {isRTL ? "تسوق الآن" : "Explore"}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }}>
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>

                <div className="cat-img-wrapper">
                  <Image
                    src={cat.img}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 768px) 90vw, 50vw"
                    className="cat-img"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                
                {/* Vertical title for non-active state */}
                <h3 className="cat-vertical-title">{isRTL ? cat.titleAr : cat.title}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .cat-section {
          padding: 100px 60px;
          background: #06091a;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }

        .cat-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .cat-main-title {
          font-family: var(--font-serif);
          font-size: clamp(1.3rem, 2.2vw, 2rem);
          text-transform: uppercase;
          color: #fff;
          margin-top: 14px;
          font-weight: 700;
          line-height: 1.1;
        }

        .cat-container {
          display: flex;
          width: 100%;
          max-width: 1400px;
          height: 65vh;
          min-height: 500px;
          gap: 12px;
          border-radius: 30px;
          overflow: hidden;
          padding: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(220,202,187,0.1);
        }

        .cat-panel {
          position: relative;
          flex: 1;
          border-radius: 22px;
          overflow: hidden;
          cursor: pointer;
          transition: flex 0.8s cubic-bezier(0.25, 1, 0.5, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cat-panel.active {
          flex: 4;
          cursor: default;
        }

        .cat-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #000;
          opacity: 0.3;
          transition: opacity 0.5s ease;
          z-index: 1;
        }

        .cat-panel.active::before {
          opacity: 0;
        }

        .cat-content {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 40px;
          opacity: 1;
          z-index: 2;
        }

        .cat-img-wrapper {
          position: absolute;
          ${isRTL ? "left: 10%;" : "right: 10%;"}
          bottom: -5%;
          height: 110%;
          width: 82%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.8s cubic-bezier(0.25, 1, 0.5, 1);
          opacity: 0.3;
          transform: translateX(${isRTL ? "-30%" : "30%"}) scale(0.85);
          pointer-events: none;
        }

        .cat-panel.active .cat-img-wrapper {
          opacity: 1;
          transform: translateX(0) scale(1.1);
        }

        .cat-img {
          height: 100%;
          width: 100%;
        }

        @media (min-width: 769px) {
          .cat-img {
            filter: drop-shadow(0 20px 40px rgba(0,0,0,0.6));
          }
        }

        .cat-text {
          position: relative;
          z-index: 10;
          max-width: 45%;
          opacity: 0;
          transform: translateX(${isRTL ? "40px" : "-40px"});
          transition: all 0.6s ease;
          transition-delay: 0s;
          pointer-events: none;
        }

        .cat-panel.active .cat-text {
          opacity: 1;
          transform: translateX(0);
          transition-delay: 0.3s;
          pointer-events: auto;
        }

        .cat-title {
          font-family: var(--font-serif);
          font-size: clamp(2.5rem, 5vw, 5rem);
          color: #fff;
          margin-bottom: 16px;
          line-height: 1.1;
          text-transform: uppercase;
        }

        .cat-desc {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.7);
          margin-bottom: 36px;
          line-height: 1.6;
          font-family: var(--font-sans);
        }

        .cat-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          color: var(--gold);
          padding: 16px 36px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid rgba(220,202,187,0.3);
          transition: all 0.4s ease;
          font-family: var(--font-sans);
        }

        .cat-btn:hover {
          background: rgba(220,202,187,0.08);
          border-color: var(--gold);
          transform: translateY(-2px);
        }

        .cat-vertical-title {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(${isRTL ? "90deg" : "-90deg"});
          white-space: nowrap;
          font-family: var(--font-serif);
          font-size: 1.8rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #fff;
          transition: all 0.4s ease;
          pointer-events: none;
          z-index: 10;
        }

        .cat-panel.active .cat-vertical-title {
          opacity: 0;
          transform: translate(-50%, -50%) rotate(${isRTL ? "90deg" : "-90deg"}) scale(0.8);
        }

        @media (max-width: 1024px) {
          .cat-section { padding: 80px 40px; }
          .cat-title { font-size: 3rem; }
          .cat-desc { font-size: 1rem; }
        }

        @media (max-width: 768px) {
          .cat-section { padding: 60px 20px; }
          .cat-container {
            flex-direction: column;
            height: 85vh;
            border-radius: 20px;
          }
          .cat-panel {
            width: 100%;
            border-radius: 14px;
          }
          .cat-vertical-title {
            transform: translate(-50%, -50%); /* Horizontal on mobile */
            font-size: 1.4rem;
          }
          .cat-panel.active .cat-vertical-title {
            transform: translate(-50%, -50%) scale(0.8);
          }
          .cat-content {
            flex-direction: column;
            justify-content: center;
            padding: 30px;
          }
          .cat-img-wrapper {
            position: absolute;
            ${isRTL ? "left: -10%;" : "right: -10%;"}
            bottom: -10%;
            width: 70%;
            height: 90%;
            transform: translateY(${isRTL ? "-10%" : "10%"}) scale(0.8);
            opacity: 0.2;
          }
          .cat-panel.active .cat-img-wrapper {
            transform: translateY(0) scale(1);
          }
          .cat-text {
            max-width: 100%;
            text-align: ${isRTL ? "right" : "left"};
            transform: translateY(20px);
          }
          .cat-title { font-size: 2.2rem; margin-bottom: 12px; }
          .cat-desc { font-size: 0.95rem; margin-bottom: 24px; }
          .cat-btn { padding: 12px 28px; font-size: 0.75rem; }
        }
      `}</style>
    </section>
  );
}
