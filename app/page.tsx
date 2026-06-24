"use client";

import Link from "next/link";
import Image from "next/image";
import { useProducts } from "./context/ProductContext";

export default function HomePage() {
  const { products } = useProducts();

  return (
    <>
      {/* ─── NAVBAR ─── */}
      <nav className="navbar">
        <a href="/" className="navbar-brand">
          Maison<span> Luxe</span>
        </a>
        <ul className="navbar-links">
          <li><a href="/">Home</a></li>
          <li><a href="#products">Collection</a></li>
          <li><a href="#story">Our Story</a></li>
          {/* <li>
            <Link href="/dashboard" className="navbar-cta">
              Dashboard
            </Link>
          </li> */}
        </ul>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero" id="home">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-tag">✦ Fine Fragrances since 2020</span>
          <h1 className="hero-title">
            The Art of<br />
            <span className="gold-text">Invisible Beauty</span>
          </h1>
          <p className="hero-subtitle">
            Each bottle holds a universe — a whisper of the extraordinary,
            crafted from the world&apos;s rarest ingredients.
          </p>
          <div className="hero-actions">
            <a href="#products" className="btn-primary">
              Explore Collection
            </a>
            <a href="#story" className="btn-secondary">
              Our Story
            </a>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ─── PRODUCTS ─── */}
      <section className="products-section" id="products">
        <div className="products-inner">
          <div className="section-header">
            <div>
              <span className="section-tag">✦ Our Collection</span>
              <div className="divider" />
              <h2 className="section-title">Signature Fragrances</h2>
              <p className="section-subtitle">
                Each perfume is a journey — a story told through scent, bottled with intention.
              </p>
            </div>
            <Link href="/dashboard" className="btn-secondary nav-home-link">
              + Add Product
            </Link>
          </div>

          <div className="products-grid">
            {products.length === 0 ? (
              <div className="products-empty">
                <div className="products-empty-icon">🌹</div>
                <h3>No fragrances yet</h3>
                <p>Visit the dashboard to add your first perfume.</p>
              </div>
            ) : (
              products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─── STORY ─── */}
      <section id="story">
        <div className="story-section">
          <div className="story-text">
            <span className="section-tag">✦ Our Heritage</span>
            <div className="divider" />
            <h2 className="section-title">
              Crafted with<br />
              <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Passion</span>
            </h2>
            <p>
              Born from a deep love of fine fragrance, Maison Luxe was founded
              with a single belief: that a perfume is not simply a scent —
              it is a memory, an emotion, an invisible garment worn next to the skin.
            </p>
            <p>
              Our master perfumers travel the world in search of the rarest
              ingredients — Bulgarian rose, Haitian vetiver, Indian oud —
              and transform them into olfactory masterpieces.
            </p>
            <div className="story-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Fragrances</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">30+</span>
                <span className="stat-label">Countries</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">5★</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>

          <div className="story-image-grid">
            <div className="story-img">
              <Image src="/perfume_3.png" alt="Oud collection" fill sizes="(max-width:768px) 50vw, 25vw" style={{ objectFit: "cover" }} />
            </div>
            <div className="story-img">
              <Image src="/perfume_2.png" alt="Rose collection" fill sizes="(max-width:768px) 50vw, 25vw" style={{ objectFit: "cover" }} />
            </div>
            <div className="story-img">
              <Image src="/perfume_5.png" alt="Aqua collection" fill sizes="(max-width:768px) 50vw, 25vw" style={{ objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="newsletter-section">
        <div className="newsletter-inner">
          <span className="section-tag">✦ Join the Circle</span>
          <h2 className="section-title">
            Receive the<br />
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Essence</span>
          </h2>
          <p>Be the first to discover new fragrances, exclusive offers and olfactory stories.</p>
          <form
            className="newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              id="newsletter-email"
              className="newsletter-input"
              type="email"
              placeholder="Your email address"
              autoComplete="email"
            />
            <button type="submit" className="btn-primary">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">Maison Luxe</div>
            <p className="footer-desc">
              Fine fragrances crafted for those who appreciate the extraordinary.
              Every bottle tells a story.
            </p>
          </div>
          <div className="footer-col">
            <h4>Collection</h4>
            <ul>
              <li><a href="#products">All Fragrances</a></li>
              <li><a href="#products">New Arrivals</a></li>
              <li><a href="#products">Bestsellers</a></li>
              <li><a href="#products">Gift Sets</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#story">Our Story</a></li>
              <li><a href="#story">Ingredients</a></li>
              <li><a href="#">Press</a></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Shipping</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2024 Maison Luxe. All rights reserved.</span>
          <span>Crafted with ♥ for fragrance lovers</span>
        </div>
      </footer>
    </>
  );
}

/* ─── Product Card Component ─── */
function ProductCard({ product, index }: { product: import("./context/ProductContext").Product; index: number }) {
  return (
    <div
      className="product-card"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="product-card-image">
        <img src={product.image} alt={product.name} />
        {product.badge && (
          <span className="product-card-badge">{product.badge}</span>
        )}
        <div className="product-card-overlay" />
        <button className="product-card-add">Add to Cart</button>
      </div>
      <div className="product-card-body">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>
        <div className="product-card-footer">
          <span className="product-price">${product.price}</span>
          <div className="product-rating">★★★★★</div>
        </div>
      </div>
    </div>
  );
}
