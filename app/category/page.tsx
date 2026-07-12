"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProducts, Product } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CATEGORIES = [
  { id: "All", label: "All Fragrances", icon: "✦", image: "/perfume_hero.png" },
  { id: "Oud & Woody", label: "Oud & Woody", icon: "🪵", image: "/perfume_3.png" },
  { id: "Sweet & Floral", label: "Sweet & Floral", icon: "🌹", image: "/perfume_2.png" },
  { id: "Fresh & Citrus", label: "Fresh & Citrus", icon: "🍋", image: "/perfume_5.png" },
  { id: "Oriental Spice", label: "Oriental Spice", icon: "🌶", image: "/perfume_1.png" },
];

const PRICE_RANGES = [
  { id: "all", label: "All Prices" },
  { id: "0-500", label: "Under 500 EGP" },
  { id: "500-1000", label: "500 – 1,000 EGP" },
  { id: "1000-2000", label: "1,000 – 2,000 EGP" },
  { id: "2000+", label: "Above 2,000 EGP" },
];

const GENDER_FILTERS = [
  { id: "all",    label: "All",    labelAr: "الكل",   icon: "✦" },
  { id: "men",    label: "Men",    labelAr: "رجالي",  icon: "♂" },
  { id: "women",  label: "Women",  labelAr: "نسائي",  icon: "♀" },
  { id: "unisex", label: "Unisex", labelAr: "مشترك", icon: "⚧" },
];

function CategoryContent() {
  const { products, loading } = useProducts();
  const { addToCart, isInCart } = useCart();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("cat");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState("all");
  const [toast, setToast] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // ─── Entrance animations ───
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cat-hero-title",
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        ".cat-hero-sub",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.4 }
      );
      gsap.fromTo(
        ".cat-pill",
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.6, ease: "back.out(1.4)", delay: 0.5 }
      );
      gsap.fromTo(
        ".filter-panel",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.7 }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  // ─── Animate cards when filter changes ───
  useEffect(() => {
    if (!gridRef.current || loading) return;
    const cards = gridRef.current.querySelectorAll(".product-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.07, duration: 0.55, ease: "power2.out" }
    );
  }, [loading, selectedCategory, searchQuery, sortBy, priceRange]);

  // ─── Filtering & Sorting ───
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (priceRange !== "all") {
      result = result.filter((p) => {
        if (priceRange === "0-500") return p.price < 500;
        if (priceRange === "500-1000") return p.price >= 500 && p.price < 1000;
        if (priceRange === "1000-2000") return p.price >= 1000 && p.price < 2000;
        if (priceRange === "2000+") return p.price >= 2000;
        return true;
      });
    }

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy, priceRange]);

  function handleQuickAdd(product: Product) {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
    });
    setToast(product.name);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div ref={pageRef} style={{ background: "var(--black)", color: "var(--white)", minHeight: "100vh" }}>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span className="toast-icon">✦</span>
          <span className="toast-msg">{toast} added to cart!</span>
        </div>
      )}

      {/* ─── HERO BANNER ─── */}
      <section className="cat-hero-banner">
        <div className="cat-hero-bg" />
        <div className="cat-hero-overlay" />
        <div className="cat-hero-content">
          <span className="section-tag" style={{ color: "var(--gold)", letterSpacing: "0.3em" }}>✦ Nubia Collection</span>
          <h1 className="cat-hero-title">
            Discover Our
            <br />
            <span className="gold-text">Fragrances</span>
          </h1>
          <p className="cat-hero-sub">
            Handcrafted luxury perfumes sourced from the world&apos;s rarest botanical gardens. Find your signature scent.
          </p>
        </div>
      </section>

      {/* ─── CATEGORY PILLS ─── */}
      <section className="responsive-pad" style={{ padding: "50px 60px 0", maxWidth: "1300px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`cat-pill${selectedCategory === cat.id ? " cat-pill-active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span style={{ fontSize: "1.1rem" }}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ─── FILTER PANEL ─── */}
      <section className="responsive-pad" style={{ padding: "30px 60px 50px", maxWidth: "1300px", margin: "0 auto" }}>
        <div className="filter-panel glass-panel" style={{ padding: "20px 28px" }}>
          <div className="filter-panel-inner">
            {/* Search */}
            <div className="cat-search-wrapper">
              <svg className="cat-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="search-field"
                placeholder="Search fragrances, notes, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>Price:</span>
              {PRICE_RANGES.map((r) => (
                <button
                  key={r.id}
                  className={`filter-tab${priceRange === r.id ? " active" : ""}`}
                  onClick={() => setPriceRange(r.id)}
                  style={{ padding: "7px 16px", fontSize: "0.75rem" }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="sort-select-wrapper" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>Sort:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Recommended</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Results count */}
            <div style={{ fontSize: "0.8rem", color: "var(--white-muted)", whiteSpace: "nowrap" }}>
              {loading ? "Loading..." : `${filteredProducts.length} fragrance${filteredProducts.length !== 1 ? "s" : ""}`}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS GRID ─── */}
      <section className="responsive-pad" style={{ padding: "0 60px 120px", maxWidth: "1300px", margin: "0 auto" }}>
        <div className="products-grid" ref={gridRef}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card" style={{ opacity: 0.4 }}>
                <div className="product-card-image" style={{ background: "var(--dark-2)", height: "300px" }} />
                <div className="product-card-body">
                  <div style={{ height: "18px", background: "var(--dark-2)", marginBottom: "8px", borderRadius: "4px" }} />
                  <div style={{ height: "14px", background: "var(--dark-2)", width: "60%", borderRadius: "4px" }} />
                </div>
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "100px 20px" }}>
              <div style={{ fontSize: "4rem", opacity: 0.3, marginBottom: "20px" }}>🌿</div>
              <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.5rem", marginBottom: "12px" }}>No Fragrances Match</h3>
              <p style={{ color: "var(--white-muted)", marginBottom: "32px", fontSize: "0.9rem" }}>
                Try adjusting your search or resetting filters.
              </p>
              <button
                className="btn-gold-outline"
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); setSortBy("default"); setPriceRange("all"); }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <CategoryProductCard
                key={product.id}
                product={product}
                index={index}
                onQuickAdd={() => handleQuickAdd(product)}
                inCart={isInCart(product.id)}
              />
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--black)" }} />}>
      <CategoryContent />
    </Suspense>
  );
}

/* ─── Category Product Card ─── */
function CategoryProductCard({
  product,
  index,
  onQuickAdd,
  inCart,
}: {
  product: Product;
  index: number;
  onQuickAdd: () => void;
  inCart: boolean;
}) {
  return (
    <div className="product-card" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="product-card-image" style={{ position: "relative", height: "340px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {product.badge && <span className="product-card-badge">{product.badge}</span>}
        <div className="product-card-overlay" />
        <div className="product-card-actions">
          <button
            className="product-card-quick-add"
            onClick={(e) => { e.preventDefault(); onQuickAdd(); }}
          >
            {inCart ? "✓ In Cart" : "+ Add to Cart"}
          </button>
          <Link href={`/product/${product.id}`} className="product-card-view-btn">
            View Details
          </Link>
        </div>
      </div>
      <div className="product-card-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {product.category || "Luxury Fragrance"}
          </span>
          <div style={{ color: "var(--gold)", fontSize: "0.7rem" }}>★★★★★</div>
        </div>
        <h3 className="product-card-name" style={{ fontFamily: "var(--font-title)", fontSize: "1.15rem", color: "var(--white)", margin: "4px 0 6px" }}>
          {product.name}
        </h3>
        <p className="product-card-desc" style={{ color: "var(--white-muted)", fontSize: "0.8rem", marginBottom: "16px", minHeight: "36px" }}>
          {product.description}
        </p>
        <div className="product-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
          <span className="product-price" style={{ color: "var(--gold)", fontWeight: 600, fontSize: "1.1rem" }}>
            {product.price.toLocaleString()} EGP
          </span>
          <Link href={`/product/${product.id}`} className="btn-gold-outline" style={{ padding: "7px 18px", fontSize: "0.72rem" }}>
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
