"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProducts, Product } from "../context/ProductContext";

export default function DashboardPage() {
  const { products, addProduct, deleteProduct } = useProducts();
  const [activeTab, setActiveTab] = useState<"overview" | "add" | "products">("overview");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [badge, setBadge] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setPrice("");
    setBadge("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !imagePreview) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600)); // subtle loading feel
    addProduct({
      name,
      description,
      price: parseFloat(price),
      image: imagePreview,
      badge: badge || undefined,
    });
    handleReset();
    setIsSubmitting(false);
    setActiveTab("products");
    showToast("✦ Product added to collection!");
  };

  const userProducts = products.filter((p) => !p.id.startsWith("default-"));
  const totalProducts = products.length;
  const userAdded = userProducts.length;
  const avgPrice =
    products.length > 0
      ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length)
      : 0;

  return (
    <div className="dashboard-layout">
      {/* ─── SIDEBAR ─── */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <Link href="/" style={{ textDecoration: "none" }}>
            <span className="sidebar-logo-text">Maison Luxe</span>
            <span className="sidebar-logo-sub">Admin Dashboard</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Main</span>

          <button
            id="nav-overview"
            className={`sidebar-nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="nav-icon">◈</span> Overview
          </button>

          <button
            id="nav-add"
            className={`sidebar-nav-item ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            <span className="nav-icon">✦</span> Add Product
          </button>

          <button
            id="nav-products"
            className={`sidebar-nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <span className="nav-icon">⊞</span> All Products
          </button>

          <span className="sidebar-section-label">Navigation</span>

          <Link href="/" className="sidebar-nav-item">
            <span className="nav-icon">⌂</span> View Store
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: "0.75rem", color: "var(--white-muted)", letterSpacing: "0.05em" }}>
            <span style={{ color: "var(--gold)" }}>●</span> Store Active
          </div>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main className="dashboard-main">
        {/* Topbar */}
        <div className="dashboard-topbar">
          <h1 className="topbar-title">
            {activeTab === "overview" && "Overview"}
            {activeTab === "add" && "Add New Product"}
            {activeTab === "products" && "All Products"}
          </h1>
          <div className="topbar-right">
            <span className="topbar-badge">{totalProducts} Products</span>
            <Link href="/" className="btn-secondary" style={{ padding: "8px 20px", fontSize: "0.8rem" }}>
              ← Back to Store
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-icon">🌹</div>
                  <span className="stat-card-value">{totalProducts}</span>
                  <span className="stat-card-label">Total Products</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">✦</div>
                  <span className="stat-card-value">{userAdded}</span>
                  <span className="stat-card-label">Added by You</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">💰</div>
                  <span className="stat-card-value">${avgPrice}</span>
                  <span className="stat-card-label">Avg. Price</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">⭐</div>
                  <span className="stat-card-value">5.0</span>
                  <span className="stat-card-label">Avg. Rating</span>
                </div>
              </div>

              <div className="dashboard-card">
                <h2 className="dashboard-card-title">Quick Actions</h2>
                <p className="dashboard-card-subtitle">What would you like to do today?</p>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <button
                    id="quick-add-product"
                    className="btn-submit"
                    onClick={() => setActiveTab("add")}
                  >
                    ✦ Add New Fragrance
                  </button>
                  <button
                    id="quick-view-products"
                    className="btn-reset"
                    onClick={() => setActiveTab("products")}
                  >
                    View All Products
                  </button>
                </div>
              </div>

              {/* Recent products */}
              <div className="dashboard-card">
                <h2 className="dashboard-card-title">Recent Collection</h2>
                <p className="dashboard-card-subtitle">Latest fragrances in your store</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
                  {products.slice(-4).reverse().map((product) => (
                    <div
                      key={product.id}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(201,169,110,0.1)",
                        borderRadius: "12px",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ height: "140px", overflow: "hidden" }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ padding: "12px" }}>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", marginBottom: "4px" }}>
                          {product.name}
                        </div>
                        <div style={{ color: "var(--gold)", fontSize: "0.9rem" }}>${product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── ADD PRODUCT TAB ── */}
          {activeTab === "add" && (
            <div className="dashboard-card">
              <h2 className="dashboard-card-title">New Fragrance</h2>
              <p className="dashboard-card-subtitle">
                Fill in the details below to add a new perfume to your collection.
              </p>

              <form id="add-product-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  {/* Image Upload */}
                  <div
                    className={`image-upload-zone ${imagePreview ? "has-image" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    style={isDragging ? { borderColor: "var(--gold)", background: "rgba(201,169,110,0.06)" } : {}}
                  >
                    <input
                      id="product-image-input"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="upload-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon">🖼️</div>
                        <p className="upload-text">
                          <strong style={{ color: "var(--gold)" }}>Click to upload</strong> or drag &amp; drop
                        </p>
                        <p className="upload-hint">PNG, JPG, WEBP — recommended 800×800px</p>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-name">Fragrance Name</label>
                    <input
                      id="product-name"
                      className="form-input"
                      type="text"
                      placeholder="e.g. Noir Absolu"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Price */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-price">Price (USD)</label>
                    <input
                      id="product-price"
                      className="form-input"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="e.g. 195"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  {/* Badge */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-badge">Badge (optional)</label>
                    <input
                      id="product-badge"
                      className="form-input"
                      type="text"
                      placeholder="e.g. New, Bestseller, Exclusive"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="product-description">Description</label>
                    <textarea
                      id="product-description"
                      className="form-textarea"
                      placeholder="Describe the fragrance notes, mood, and character..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  {/* Actions */}
                  <div className="form-actions">
                    <button type="button" className="btn-reset" onClick={handleReset}>
                      Clear
                    </button>
                    <button
                      id="submit-product-btn"
                      type="submit"
                      className="btn-submit"
                      disabled={isSubmitting || !name || !description || !price || !imagePreview}
                    >
                      {isSubmitting ? "Adding..." : "✦ Add to Collection"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === "products" && (
            <div className="dashboard-card">
              <h2 className="dashboard-card-title">All Products</h2>
              <p className="dashboard-card-subtitle">
                {products.length} fragrance{products.length !== 1 ? "s" : ""} in your collection
              </p>

              <div className="products-table-wrapper">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Badge</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-table">
                            <div className="empty-table-icon">🌹</div>
                            <p>No products yet. Add your first fragrance!</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="table-img"
                            />
                          </td>
                          <td className="table-product-name">{product.name}</td>
                          <td>
                            <span className="table-desc-truncated">{product.description}</span>
                          </td>
                          <td className="table-price">${product.price}</td>
                          <td>
                            {product.badge ? (
                              <span
                                style={{
                                  background: "rgba(201,169,110,0.12)",
                                  color: "var(--gold)",
                                  fontSize: "0.72rem",
                                  padding: "4px 10px",
                                  borderRadius: "12px",
                                  letterSpacing: "0.08em",
                                }}
                              >
                                {product.badge}
                              </span>
                            ) : (
                              <span style={{ color: "rgba(176,168,152,0.3)" }}>—</span>
                            )}
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                id={`delete-product-${product.id}`}
                                className="btn-table-delete"
                                onClick={() => {
                                  deleteProduct(product.id);
                                  showToast("Product removed from collection.");
                                }}
                                disabled={product.id.startsWith("default-")}
                                title={product.id.startsWith("default-") ? "Default products cannot be deleted" : "Delete product"}
                                style={product.id.startsWith("default-") ? { opacity: 0.3, cursor: "not-allowed" } : {}}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ─── TOAST ─── */}
      {toast && (
        <div className="toast" role="alert">
          <span className="toast-icon">✦</span>
          <span className="toast-msg">{toast}</span>
        </div>
      )}
    </div>
  );
}
