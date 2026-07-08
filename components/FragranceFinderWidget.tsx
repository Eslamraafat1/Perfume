"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProducts } from "@/app/context/ProductContext";
import { useCart } from "@/app/context/CartContext";

/* ─── Data ─── */
interface Choice {
  id: string;
  label: string;
  icon: string;
  description: string;
  keywords: string[];
}
interface Step {
  id: string;
  question: string;
  subtitle: string;
  choices: Choice[];
}

const STEPS: Step[] = [
  {
    id: "mood",
    question: "What's your vibe?",
    subtitle: "Choose the feeling you want to embody",
    choices: [
      {
        id: "fresh",
        label: "Fresh & Light",
        icon: "🌊",
        description: "Airy, clean, invigorating",
        keywords: ["citrus", "bergamot", "mint", "fresh", "aqua", "green", "sea"],
      },
      {
        id: "romantic",
        label: "Warm & Romantic",
        icon: "🌹",
        description: "Soft, floral, enchanting",
        keywords: ["rose", "jasmine", "peony", "floral", "romantic", "lily"],
      },
      {
        id: "mysterious",
        label: "Dark & Mysterious",
        icon: "🌙",
        description: "Deep, smoky, intriguing",
        keywords: ["oud", "smoke", "incense", "leather", "dark", "resin", "tar"],
      },
      {
        id: "oriental",
        label: "Exotic & Oriental",
        icon: "✦",
        description: "Rich, spiced, opulent",
        keywords: ["amber", "spice", "vanilla", "musk", "saffron", "cardamom", "oriental"],
      },
    ],
  },
  {
    id: "topNote",
    question: "Your opening note",
    subtitle: "The first impression — what greets the senses",
    choices: [
      {
        id: "citrus",
        label: "Citrus",
        icon: "🍊",
        description: "Orange, Bergamot, Lemon",
        keywords: ["citrus", "orange", "bergamot", "lemon", "grapefruit", "lime"],
      },
      {
        id: "spicy",
        label: "Spicy",
        icon: "🌶️",
        description: "Pepper, Cardamom, Saffron",
        keywords: ["pepper", "cardamom", "saffron", "cinnamon", "clove", "spice"],
      },
      {
        id: "green",
        label: "Green & Herbal",
        icon: "🌿",
        description: "Mint, Green Tea, Herbs",
        keywords: ["mint", "green", "tea", "herb", "basil", "fig"],
      },
      {
        id: "floral-top",
        label: "Floral",
        icon: "🌸",
        description: "Rose Bud, Neroli, Iris",
        keywords: ["rose", "neroli", "iris", "peony", "floral", "blossom"],
      },
    ],
  },
  {
    id: "heartNote",
    question: "The heart of your fragrance",
    subtitle: "The soul that blooms and lingers for hours",
    choices: [
      {
        id: "rose",
        label: "Rose",
        icon: "🌹",
        description: "Velvety, timeless petals",
        keywords: ["rose", "damask", "turkish rose", "bulgarian rose"],
      },
      {
        id: "oud",
        label: "Oud",
        icon: "🪵",
        description: "Rare, resinous, majestic",
        keywords: ["oud", "agarwood", "bukhoor", "agar"],
      },
      {
        id: "jasmine",
        label: "Jasmine",
        icon: "🌼",
        description: "Lush, heady, sensual",
        keywords: ["jasmine", "sambac", "jasmin", "white flower"],
      },
      {
        id: "amber",
        label: "Amber",
        icon: "🟡",
        description: "Warm, golden, enveloping",
        keywords: ["amber", "labdanum", "resin", "ambergris"],
      },
    ],
  },
  {
    id: "baseNote",
    question: "Your lasting signature",
    subtitle: "The foundation that stays with you all day",
    choices: [
      {
        id: "woody",
        label: "Woody",
        icon: "🌲",
        description: "Sandalwood, Cedar, Vetiver",
        keywords: ["sandalwood", "cedar", "vetiver", "woody", "wood"],
      },
      {
        id: "musky",
        label: "Musky",
        icon: "🌫️",
        description: "Soft, skin-like, sensual",
        keywords: ["musk", "white musk", "skin", "musky", "clean"],
      },
      {
        id: "vanilla",
        label: "Sweet & Gourmand",
        icon: "🍦",
        description: "Vanilla, Tonka, Praline",
        keywords: ["vanilla", "tonka", "caramel", "sweet", "praline", "sugar"],
      },
      {
        id: "earthy",
        label: "Earthy & Dark",
        icon: "🪨",
        description: "Patchouli, Moss, Leather",
        keywords: ["patchouli", "moss", "leather", "earth", "vetiver", "oakmoss"],
      },
    ],
  },
];

/* ─── Component ─── */
export default function FragranceFinderWidget() {
  const { products } = useProducts();
  const { addToCart, items } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, Choice>>({});
  const [animDir, setAnimDir] = useState<"forward" | "backward">("forward");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [stepKey, setStepKey] = useState(0);

  /* Matched products */
  const matchedProducts = useMemo(() => {
    if (!showResults) return [];
    const allKeywords = Object.values(selections).flatMap((c) => c.keywords);
    return products
      .map((p) => {
        const text =
          `${p.top_notes ?? ""} ${p.heart_notes ?? ""} ${p.base_notes ?? ""} ${p.description ?? ""} ${p.name ?? ""}`.toLowerCase();
        const score = allKeywords.filter((kw) =>
          text.includes(kw.toLowerCase())
        ).length;
        return { ...p, score };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [showResults, selections, products]);

  /* Keyboard & body lock */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setCurrentStep(0);
    setSelections({});
    setShowResults(false);
    setAnimDir("forward");
    setStepKey(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setCurrentStep(0);
      setSelections({});
      setShowResults(false);
    }, 400);
  };

  const handleSelect = (choice: Choice) => {
    if (isAnimating) return;
    const stepId = STEPS[currentStep].id;
    const newSelections = { ...selections, [stepId]: choice };
    setSelections(newSelections);

    setIsAnimating(true);
    setAnimDir("forward");

    setTimeout(() => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
        setStepKey((k) => k + 1);
      } else {
        setShowResults(true);
      }
      setIsAnimating(false);
    }, 320);
  };

  const handleBack = () => {
    if (isAnimating) return;
    if (showResults) {
      setShowResults(false);
      return;
    }
    if (currentStep === 0) {
      handleClose();
      return;
    }
    setIsAnimating(true);
    setAnimDir("backward");
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setStepKey((k) => k + 1);
      setIsAnimating(false);
    }, 320);
  };

  const step = STEPS[currentStep];

  return (
    <>
      {/* ─── Global Styles ─── */}
      <style>{`
        @keyframes ff-pulse {
          0%,100% { box-shadow:0 0 0 0 rgba(219,202,187,.45),0 8px 30px rgba(0,0,0,.55); }
          55%      { box-shadow:0 0 0 14px rgba(219,202,187,0),0 8px 30px rgba(0,0,0,.55); }
        }
        @keyframes ff-float {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-5px); }
        }
        @keyframes ff-overlay-in {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes ff-modal-in {
          from { opacity:0; transform:translateY(40px) scale(.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes ff-modal-bottom-in {
          from { transform:translateY(100%); }
          to   { transform:translateY(0); }
        }
        @keyframes ff-slide-right {
          from { opacity:0; transform:translateX(55px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes ff-slide-left {
          from { opacity:0; transform:translateX(-55px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes ff-results-in {
          from { opacity:0; transform:scale(.97) translateY(16px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes ff-card-pop {
          from { opacity:0; transform:translateY(20px) scale(.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes ff-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes ff-glow-pulse {
          0%,100% { opacity:.06; }
          50%      { opacity:.13; }
        }
        @keyframes ff-spin {
          to { transform: rotate(360deg); }
        }

        .ff-btn-wrap {
          animation: ff-pulse 3.2s ease-in-out infinite, ff-float 4s ease-in-out infinite;
          transition: transform .25s cubic-bezier(.34,1.56,.64,1);
        }
        .ff-btn-wrap:hover {
          animation: none !important;
          transform: scale(1.12) !important;
        }
        .ff-overlay-anim  { animation: ff-overlay-in .3s ease forwards; }
        .ff-modal-anim    { animation: ff-modal-in .5s cubic-bezier(.34,1.56,.64,1) forwards; }
        .ff-modal-bottom  { animation: ff-modal-bottom-in .45s cubic-bezier(.32,.72,0,1) forwards; }
        .ff-results-anim  { animation: ff-results-in .5s cubic-bezier(.34,1.56,.64,1) forwards; }

        .ff-step-forward  { animation: ff-slide-right .38s cubic-bezier(.4,0,.2,1) forwards; }
        .ff-step-backward { animation: ff-slide-left  .38s cubic-bezier(.4,0,.2,1) forwards; }

        .ff-choice {
          cursor:pointer;
          transition: all .28s cubic-bezier(.4,0,.2,1);
          position:relative;
          overflow:hidden;
        }
        .ff-choice::before {
          content:'';
          position:absolute;
          inset:0;
          background:linear-gradient(135deg,rgba(219,202,187,.08),transparent);
          opacity:0;
          transition:opacity .3s ease;
          border-radius:inherit;
        }
        .ff-choice:hover { transform:translateY(-4px) scale(1.02); }
        .ff-choice:hover::before { opacity:1; }
        .ff-choice:hover .ff-choice-border { border-color:rgba(219,202,187,.55) !important; }
        .ff-choice-selected { transform:translateY(-2px) !important; }
        .ff-choice-selected .ff-choice-border {
          border-color:rgba(219,202,187,.8) !important;
          box-shadow:0 0 28px rgba(219,202,187,.2), inset 0 0 20px rgba(219,202,187,.05);
        }

        .ff-product-card {
          transition: all .32s cubic-bezier(.4,0,.2,1);
          overflow:hidden;
        }
        .ff-product-card:hover { transform:translateY(-6px); }
        .ff-product-card:hover .ff-product-img { transform:scale(1.06); }
        .ff-product-img { transition: transform .55s cubic-bezier(.4,0,.2,1); }

        .ff-back-btn { transition: all .2s ease; }
        .ff-back-btn:hover { color:#fff !important; border-color:rgba(219,202,187,.5) !important; }
        .ff-restart-btn { transition: all .2s ease; }
        .ff-restart-btn:hover { color:#fff !important; border-color:rgba(219,202,187,.5) !important; }
        .ff-close-btn { transition: all .2s ease; }
        .ff-close-btn:hover { background:rgba(255,255,255,.12) !important; color:#fff !important; }

        .ff-add-btn { transition: all .25s ease; }
        .ff-add-btn:not(:disabled):hover { filter:brightness(1.1) !important; transform:scale(1.04); }

        .ff-glow-bg { animation: ff-glow-pulse 3s ease-in-out infinite; }

        .ff-scrollbar::-webkit-scrollbar { width:4px; }
        .ff-scrollbar::-webkit-scrollbar-track { background:transparent; }
        .ff-scrollbar::-webkit-scrollbar-thumb { background:rgba(219,202,187,.25); border-radius:4px; }

        @media (max-width:640px) {
          .ff-choices-grid { grid-template-columns:1fr 1fr !important; gap:10px !important; }
          .ff-results-grid  { grid-template-columns:1fr !important; }
          .ff-modal-desktop { display:none !important; }
          .ff-modal-mobile  { display:flex !important; }
          .ff-modal-content { padding:24px 20px !important; }
        }
        @media (min-width:641px) {
          .ff-modal-desktop { display:flex !important; }
          .ff-modal-mobile  { display:none !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════
          FLOATING BUTTON
      ═══════════════════════════════════ */}
      <button
        id="fragrance-finder-btn"
        className="ff-btn-wrap"
        onClick={handleOpen}
        aria-label="Open Fragrance Finder"
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          position: "fixed",
          bottom: "36px",
          right: "36px",
          zIndex: 200,
          width: "62px",
          height: "62px",
          borderRadius: "50%",
          border: "none",
          background:
            "linear-gradient(135deg,#dbcabb 0%,#c9b49e 40%,#b8997f 100%)",
          color: "#0a0f24",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        {/* Tooltip */}
        <span
          style={{
            position: "absolute",
            right: "calc(100% + 14px)",
            top: "50%",
            transform: `translateY(-50%) translateX(${btnHover ? "0" : "8px"})`,
            opacity: btnHover ? 1 : 0,
            transition: "all .25s ease",
            background: "rgba(10,15,36,.95)",
            border: "1px solid rgba(219,202,187,.25)",
            color: "var(--gold)",
            padding: "7px 14px",
            borderRadius: "30px",
            fontSize: "0.75rem",
            fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            letterSpacing: "0.05em",
          }}
        >
          Find Your Scent
        </span>

        {/* Search Icon */}
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {/* ═══════════════════════════════════
          MODAL OVERLAY
      ═══════════════════════════════════ */}
      {isOpen && (
        <div
          className="ff-overlay-anim"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(4,7,20,.88)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          {/* ── Desktop Modal ── */}
          <div
            className="ff-modal-anim ff-modal-desktop"
            style={{
              display: "none",
              flexDirection: "column",
              width: "100%",
              maxWidth: showResults ? "920px" : "700px",
              maxHeight: "92vh",
              background:
                "linear-gradient(155deg,rgba(18,28,65,.98) 0%,rgba(8,12,30,.99) 100%)",
              borderRadius: "28px",
              border: "1px solid rgba(219,202,187,.14)",
              boxShadow:
                "0 50px 120px rgba(0,0,0,.85),0 0 0 1px rgba(255,255,255,.03)",
              overflow: "hidden",
              position: "relative",
              transition: "max-width .5s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <ModalContent
              step={step}
              currentStep={currentStep}
              showResults={showResults}
              selections={selections}
              animDir={animDir}
              isAnimating={isAnimating}
              stepKey={stepKey}
              matchedProducts={matchedProducts}
              items={items}
              onSelect={handleSelect}
              onBack={handleBack}
              onClose={handleClose}
              onRestart={() => {
                setShowResults(false);
                setCurrentStep(0);
                setSelections({});
                setStepKey(0);
              }}
              onAddToCart={addToCart}
            />
          </div>

          {/* ── Mobile Bottom Sheet ── */}
          <div
            className="ff-modal-bottom ff-modal-mobile"
            style={{
              display: "none",
              flexDirection: "column",
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "92vh",
              background:
                "linear-gradient(170deg,rgba(18,28,65,.99) 0%,rgba(8,12,30,1) 100%)",
              borderRadius: "28px 28px 0 0",
              border: "1px solid rgba(219,202,187,.14)",
              borderBottom: "none",
              boxShadow: "0 -20px 60px rgba(0,0,0,.7)",
              overflow: "hidden",
            }}
          >
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
              <div style={{ width: "40px", height: "4px", borderRadius: "4px", background: "rgba(219,202,187,.3)" }} />
            </div>
            <ModalContent
              step={step}
              currentStep={currentStep}
              showResults={showResults}
              selections={selections}
              animDir={animDir}
              isAnimating={isAnimating}
              stepKey={stepKey}
              matchedProducts={matchedProducts}
              items={items}
              onSelect={handleSelect}
              onBack={handleBack}
              onClose={handleClose}
              onRestart={() => {
                setShowResults(false);
                setCurrentStep(0);
                setSelections({});
                setStepKey(0);
              }}
              onAddToCart={addToCart}
            />
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   MODAL CONTENT (shared desktop + mobile)
═══════════════════════════════════════════ */
interface ModalContentProps {
  step: Step;
  currentStep: number;
  showResults: boolean;
  selections: Record<string, Choice>;
  animDir: "forward" | "backward";
  isAnimating: boolean;
  stepKey: number;
  matchedProducts: Array<{
    id: string;
    name: string;
    image_url: string;
    price: number;
    category?: string;
    top_notes?: string;
    heart_notes?: string;
    base_notes?: string;
    score: number;
    [key: string]: unknown;
  }>;
  items: Array<{ id: string }>;
  onSelect: (c: Choice) => void;
  onBack: () => void;
  onClose: () => void;
  onRestart: () => void;
  onAddToCart: (p: any, size?: string) => void;
}

function ModalContent({
  step,
  currentStep,
  showResults,
  selections,
  animDir,
  isAnimating,
  stepKey,
  matchedProducts,
  items,
  onSelect,
  onBack,
  onClose,
  onRestart,
  onAddToCart,
}: ModalContentProps) {
  const stepAnimClass = !isAnimating
    ? animDir === "forward"
      ? "ff-step-forward"
      : "ff-step-backward"
    : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", maxHeight: "92vh" }}>
      {/* Ambient glow */}
      <div
        className="ff-glow-bg"
        style={{
          position: "absolute",
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "300px",
          background:
            "radial-gradient(ellipse,rgba(219,202,187,.09) 0%,transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "26px 32px 20px",
          borderBottom: "1px solid rgba(219,202,187,.08)",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "13px",
              background:
                "linear-gradient(135deg,rgba(219,202,187,.18),rgba(219,202,187,.04))",
              border: "1px solid rgba(219,202,187,.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              color: "var(--gold)",
            }}
          >
            ✦
          </div>
          <div>
            <div
              style={{
                fontSize: "0.65rem",
                color: "rgba(219,202,187,.55)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "var(--font-sans)",
                marginBottom: "2px",
              }}
            >
              NUBIA
            </div>
            <div
              style={{
                fontSize: "1rem",
                fontFamily: "var(--font-serif)",
                color: "var(--white)",
                lineHeight: 1,
              }}
            >
              Fragrance Finder
            </div>
          </div>
        </div>

        <button
          className="ff-close-btn"
          onClick={onClose}
          id="ff-close-btn"
          aria-label="Close"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid rgba(219,202,187,.18)",
            background: "rgba(255,255,255,.04)",
            color: "rgba(219,202,187,.65)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            lineHeight: 1,
            fontFamily: "var(--font-sans)",
          }}
        >
          ×
        </button>
      </div>

      {/* ── Progress bar ── */}
      {!showResults && (
        <div
          style={{
            padding: "18px 32px 0",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                style={{
                  flex: 1,
                  height: "3px",
                  borderRadius: "3px",
                  overflow: "hidden",
                  background: "rgba(219,202,187,.12)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "3px",
                    background:
                      i < currentStep
                        ? "linear-gradient(90deg,#c4a98a,#dbcabb)"
                        : i === currentStep
                        ? "linear-gradient(90deg,#c4a98a,#dbcabb)"
                        : "transparent",
                    transform: `scaleX(${i < currentStep ? 1 : i === currentStep ? 0.85 : 0})`,
                    transformOrigin: "left",
                    transition: "transform .5s cubic-bezier(.4,0,.2,1)",
                  }}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "9px",
              fontSize: "0.68rem",
              color: "rgba(219,202,187,.4)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{Math.round((currentStep / STEPS.length) * 100)}% complete</span>
          </div>
        </div>
      )}

      {/* ── Scrollable Body ── */}
      <div
        className="ff-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "28px 32px 32px", position: "relative", zIndex: 1 }}
      >
        {!showResults ? (
          /* ─── STEP CONTENT ─── */
          <div key={stepKey} className={stepAnimClass}>
            {/* Question */}
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.7rem,3.5vw,2.3rem)",
                color: "var(--white)",
                marginBottom: "8px",
                lineHeight: 1.15,
              }}
            >
              {step.question}
            </h2>
            <p
              style={{
                color: "rgba(208,203,214,.62)",
                fontSize: "0.9rem",
                marginBottom: "28px",
                fontFamily: "var(--font-sans)",
                lineHeight: 1.5,
              }}
            >
              {step.subtitle}
            </p>

            {/* Choices Grid */}
            <div
              className="ff-choices-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              {step.choices.map((choice) => {
                const selected = selections[step.id]?.id === choice.id;
                return (
                  <div
                    key={choice.id}
                    className={`ff-choice ${selected ? "ff-choice-selected" : ""}`}
                    onClick={() => onSelect(choice)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && onSelect(choice)}
                    aria-pressed={selected}
                  >
                    <div
                      className="ff-choice-border"
                      style={{
                        borderRadius: "18px",
                        border: `1px solid ${selected ? "rgba(219,202,187,.7)" : "rgba(219,202,187,.1)"}`,
                        background: selected
                          ? "linear-gradient(135deg,rgba(219,202,187,.13),rgba(219,202,187,.04))"
                          : "rgba(255,255,255,.03)",
                        padding: "22px 18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        transition: "all .28s ease",
                        position: "relative",
                      }}
                    >
                      {selected && (
                        <div
                          style={{
                            position: "absolute",
                            top: "13px",
                            right: "13px",
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg,#dbcabb,#c4a98a)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            color: "#0a0f24",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </div>
                      )}
                      <span style={{ fontSize: "2rem", lineHeight: 1 }}>
                        {choice.icon}
                      </span>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: "1.05rem",
                            color: selected ? "var(--gold)" : "var(--white)",
                            marginBottom: "4px",
                            transition: "color .25s",
                            lineHeight: 1.2,
                          }}
                        >
                          {choice.label}
                        </div>
                        <div
                          style={{
                            fontSize: "0.76rem",
                            color: "rgba(208,203,214,.5)",
                            fontFamily: "var(--font-sans)",
                            lineHeight: 1.45,
                          }}
                        >
                          {choice.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "26px",
              }}
            >
              <button
                className="ff-back-btn"
                onClick={onBack}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(219,202,187,.2)",
                  color: "rgba(219,202,187,.65)",
                  padding: "10px 22px",
                  borderRadius: "50px",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-sans)",
                }}
              >
                ← {currentStep === 0 ? "Cancel" : "Back"}
              </button>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(219,202,187,.35)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {selections[step.id] ? "Click a card to continue →" : "Select an option"}
              </div>
            </div>
          </div>
        ) : (
          /* ─── RESULTS ─── */
          <div className="ff-results-anim">
            {/* Results Header */}
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 18px",
                  borderRadius: "30px",
                  border: "1px solid rgba(219,202,187,.3)",
                  color: "var(--gold)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-sans)",
                  marginBottom: "14px",
                }}
              >
                ✦ &nbsp; Your Perfect Match &nbsp; ✦
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(1.5rem,3.5vw,2rem)",
                  color: "var(--white)",
                  marginBottom: "10px",
                  lineHeight: 1.2,
                }}
              >
                We found your signature scent
              </h2>
              {/* Selected pills */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  justifyContent: "center",
                  marginTop: "10px",
                }}
              >
                {Object.values(selections).map((s) => (
                  <span
                    key={s.id}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "30px",
                      border: "1px solid rgba(219,202,187,.25)",
                      fontSize: "0.75rem",
                      color: "rgba(219,202,187,.75)",
                      fontFamily: "var(--font-sans)",
                      background: "rgba(219,202,187,.06)",
                    }}
                  >
                    {s.icon} {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            {matchedProducts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 20px",
                  color: "rgba(208,203,214,.6)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🌸</div>
                <p style={{ marginBottom: "20px", fontSize: "1rem" }}>
                  No exact matches found for your combination.
                </p>
                <Link
                  href="/products"
                  onClick={onClose}
                  style={{
                    display: "inline-block",
                    padding: "12px 28px",
                    borderRadius: "50px",
                    background: "linear-gradient(135deg,#dbcabb,#c4a98a)",
                    color: "#0a0f24",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Explore Full Collection →
                </Link>
              </div>
            ) : (
              <div
                className="ff-results-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(195px,1fr))",
                  gap: "16px",
                }}
              >
                {matchedProducts.map((product, idx) => {
                  const inCart = items.some((i) => i.id === product.id);
                  return (
                    <div
                      key={product.id}
                      className="ff-product-card"
                      style={{
                        background: "rgba(255,255,255,.04)",
                        borderRadius: "18px",
                        border: "1px solid rgba(219,202,187,.1)",
                        overflow: "hidden",
                        animation: `ff-card-pop .4s ${idx * 0.08}s cubic-bezier(.34,1.56,.64,1) both`,
                      }}
                    >
                      <Link
                        href={`/product/${product.id}`}
                        onClick={onClose}
                        style={{
                          display: "block",
                          position: "relative",
                          height: "190px",
                          overflow: "hidden",
                          background: "rgba(219,202,187,.05)",
                        }}
                      >
                        {product.image_url && (
                          <Image
                            src={product.image_url}
                            alt={product.name || "Product"}
                            fill
                            className="ff-product-img"
                            style={{ objectFit: "cover" }}
                          />
                        )}
                        {idx === 0 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              background:
                                "linear-gradient(135deg,#dbcabb,#c4a98a)",
                              color: "#0a0f24",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "0.62rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              fontFamily: "var(--font-sans)",
                            }}
                          >
                            ✦ Best Match
                          </div>
                        )}
                      </Link>
                      <div style={{ padding: "16px 14px" }}>
                        <div
                          style={{
                            fontSize: "0.64rem",
                            color: "var(--gold)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: "4px",
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          {product.category || "Luxury"}
                        </div>
                        <Link
                          href={`/product/${product.id}`}
                          onClick={onClose}
                          style={{ textDecoration: "none" }}
                        >
                          <h3
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: "1.1rem",
                              color: "var(--white)",
                              marginBottom: "12px",
                              lineHeight: 1.2,
                            }}
                          >
                            {product.name}
                          </h3>
                        </Link>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              fontFamily: "var(--font-sans)",
                              color: "var(--gold-light)",
                            }}
                          >
                            {(Number(product.price) || 0).toLocaleString()} EGP
                          </span>
                          <button
                            className="ff-add-btn"
                            onClick={() => !inCart && onAddToCart(product)}
                            disabled={inCart}
                            style={{
                              background: inCart
                                ? "transparent"
                                : "linear-gradient(135deg,#dbcabb,#c4a98a)",
                              color: inCart ? "var(--gold)" : "#0a0f24",
                              border: `1px solid ${inCart ? "var(--gold)" : "transparent"}`,
                              padding: "7px 13px",
                              borderRadius: "30px",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              cursor: inCart ? "default" : "pointer",
                              letterSpacing: "0.04em",
                              fontFamily: "var(--font-sans)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {inCart ? "✓ Added" : "Add"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Results Footer */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "24px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                className="ff-restart-btn"
                onClick={onRestart}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(219,202,187,.22)",
                  color: "rgba(219,202,187,.65)",
                  padding: "11px 24px",
                  borderRadius: "50px",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-sans)",
                }}
              >
                ↺ Start Over
              </button>
              <Link
                href="/products"
                onClick={onClose}
                style={{
                  display: "inline-block",
                  background:
                    "linear-gradient(135deg,#dbcabb 0%,#c4a98a 100%)",
                  color: "#0a0f24",
                  padding: "11px 28px",
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.03em",
                  transition: "filter .2s ease",
                }}
              >
                View All Products →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
