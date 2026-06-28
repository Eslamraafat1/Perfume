"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useProducts } from "../context/ProductContext";
import { useSiteContent } from "../context/SiteContentContext";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";

export default function DashboardPage() {
  const { products, loading, addProduct, deleteProduct } = useProducts();
  const { get: sc, update: scUpdate, uploadImageAndUpdate } = useSiteContent();
  const [activeTab, setActiveTab] = useState<"overview" | "add" | "products" | "content">("overview");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [badge, setBadge] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [topNotes, setTopNotes] = useState("");
  const [heartNotes, setHeartNotes] = useState("");
  const [baseNotes, setBaseNotes] = useState("");
  const [longevity, setLongevity] = useState("");
  const [sillage, setSillage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.", "error");
      return;
    }
    setImageFile(file);
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
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress("");
    setCategory("");
    setTopNotes("");
    setHeartNotes("");
    setBaseNotes("");
    setLongevity("");
    setSillage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !imageFile) return;

    setIsSubmitting(true);
    try {
      // Step 1: Upload image to Supabase Storage
      setUploadProgress("Uploading image to Supabase Storage...");
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.type,
        });

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      // Step 2: Get public URL of uploaded image
      setUploadProgress("Saving product to database...");
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      const image_url = urlData.publicUrl;

      // Step 3: Add product record to database
      await addProduct({
        name,
        description,
        price: parseFloat(price),
        image_url,
        badge: badge.trim() || null,
        category: category.trim() || undefined,
        top_notes: topNotes.trim() || undefined,
        heart_notes: heartNotes.trim() || undefined,
        base_notes: baseNotes.trim() || undefined,
        longevity: longevity.trim() || undefined,
        sillage: sillage.trim() || undefined,
      });

      handleReset();
      setActiveTab("products");
      showToast("✦ Fragrance added to collection!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  const totalProducts = products.length;
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

          <button
            id="nav-content"
            className={`sidebar-nav-item ${activeTab === "content" ? "active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            <span className="nav-icon">🖼</span> Site Content
          </button>

          <span className="sidebar-section-label">Navigation</span>

          <Link href="/" className="sidebar-nav-item">
            <span className="nav-icon">⌂</span> View Store
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: "0.75rem", color: "var(--white-muted)", letterSpacing: "0.05em" }}>
            <span style={{ color: "#22c55e" }}>●</span>&nbsp; Supabase Connected
          </div>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main className="dashboard-main">
        {/* Topbar */}
        <div className="dashboard-topbar">
          <h1 className="topbar-title">
            {activeTab === "overview" && "Overview"}
            {activeTab === "add" && "Add New Fragrance"}
            {activeTab === "products" && "All Products"}
            {activeTab === "content" && "Site Content Editor"}
          </h1>
          <div className="topbar-right">
            <span className="topbar-badge">
              {loading ? "Loading..." : `${totalProducts} Products`}
            </span>
            <Link
              href="/"
              className="btn-secondary"
              style={{ padding: "8px 20px", fontSize: "0.8rem" }}
            >
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
                  <span className="stat-card-value">{loading ? "—" : totalProducts}</span>
                  <span className="stat-card-label">Total Products</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">☁️</div>
                  <span className="stat-card-value" style={{ fontSize: "1.2rem" }}>
                    {loading ? "—" : "Cloud"}
                  </span>
                  <span className="stat-card-label">Storage Type</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">💰</div>
                  <span className="stat-card-value">{loading ? "—" : `$${avgPrice}`}</span>
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
                  <button id="quick-add-product" className="btn-submit" onClick={() => setActiveTab("add")}>
                    ✦ Add New Fragrance
                  </button>
                  <button id="quick-view-products" className="btn-reset" onClick={() => setActiveTab("products")}>
                    View All Products
                  </button>
                </div>
              </div>

              {!loading && products.length > 0 && (
                <div className="dashboard-card">
                  <h2 className="dashboard-card-title">Recent Collection</h2>
                  <p className="dashboard-card-subtitle">Latest fragrances from Supabase</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
                    {products.slice(0, 4).map((product) => (
                      <div
                        key={product.id}
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,110,0.1)", borderRadius: "12px", overflow: "hidden" }}
                      >
                        <div style={{ height: "140px", overflow: "hidden" }}>
                          <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ padding: "12px" }}>
                          <div style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", marginBottom: "4px" }}>{product.name}</div>
                          <div style={{ color: "var(--gold)", fontSize: "0.9rem" }}>${product.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── ADD PRODUCT TAB ── */}
          {activeTab === "add" && (
            <div className="dashboard-card">
              <h2 className="dashboard-card-title">New Fragrance</h2>
              <p className="dashboard-card-subtitle">
                Image uploads go to Supabase Storage. Product data saves to PostgreSQL.
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
                      accept="image/png,image/jpeg,image/webp,image/jpg"
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
                        <p className="upload-hint">PNG, JPG, WEBP — stored in Supabase Storage ☁️</p>
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

                  {/* Category */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-category">Category</label>
                    <input
                      id="product-category"
                      className="form-input"
                      type="text"
                      placeholder="e.g. Floral, Woody, Oriental"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                  
                  {/* Notes */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-top-notes">Top Notes</label>
                    <input
                      id="product-top-notes"
                      className="form-input"
                      type="text"
                      placeholder="e.g. Bergamot, Lemon"
                      value={topNotes}
                      onChange={(e) => setTopNotes(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-heart-notes">Heart Notes</label>
                    <input
                      id="product-heart-notes"
                      className="form-input"
                      type="text"
                      placeholder="e.g. Jasmine, Rose"
                      value={heartNotes}
                      onChange={(e) => setHeartNotes(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-base-notes">Base Notes</label>
                    <input
                      id="product-base-notes"
                      className="form-input"
                      type="text"
                      placeholder="e.g. Vanilla, Musk"
                      value={baseNotes}
                      onChange={(e) => setBaseNotes(e.target.value)}
                    />
                  </div>

                  {/* Performance */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-longevity">Longevity</label>
                    <input
                      id="product-longevity"
                      className="form-input"
                      type="text"
                      placeholder="e.g. 8-10 hours"
                      value={longevity}
                      onChange={(e) => setLongevity(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-sillage">Sillage</label>
                    <input
                      id="product-sillage"
                      className="form-input"
                      type="text"
                      placeholder="e.g. Strong, Moderate"
                      value={sillage}
                      onChange={(e) => setSillage(e.target.value)}
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

                  {/* Upload Progress */}
                  {uploadProgress && (
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        background: "rgba(201,169,110,0.08)",
                        border: "1px solid rgba(201,169,110,0.2)",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        fontSize: "0.85rem",
                        color: "var(--gold)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span className="spin-icon">⏳</span>
                      {uploadProgress}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="form-actions">
                    <button type="button" className="btn-reset" onClick={handleReset} disabled={isSubmitting}>
                      Clear
                    </button>
                    <button
                      id="submit-product-btn"
                      type="submit"
                      className="btn-submit"
                      disabled={isSubmitting || !name || !description || !price || !imageFile}
                    >
                      {isSubmitting ? "Uploading..." : "✦ Add to Collection"}
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
                {loading
                  ? "Fetching from Supabase..."
                  : `${products.length} fragrance${products.length !== 1 ? "s" : ""} in the database`}
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
                    {loading ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-table">
                            <div style={{ fontSize: "2rem", marginBottom: "12px", opacity: 0.4 }}>⏳</div>
                            <p>Loading products from Supabase...</p>
                          </div>
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
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
                            <img src={product.image_url} alt={product.name} className="table-img" />
                          </td>
                          <td className="table-product-name">{product.name}</td>
                          <td><span className="table-desc-truncated">{product.description}</span></td>
                          <td className="table-price">${product.price}</td>
                          <td>
                            {product.badge ? (
                              <span style={{ background: "rgba(201,169,110,0.12)", color: "var(--gold)", fontSize: "0.72rem", padding: "4px 10px", borderRadius: "12px", letterSpacing: "0.08em" }}>
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
                                onClick={async () => {
                                  try {
                                    await deleteProduct(product.id);
                                    showToast("Product removed from collection.");
                                  } catch {
                                    showToast("Failed to delete product.", "error");
                                  }
                                }}
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
          {/* ── SITE CONTENT TAB ── */}
          {activeTab === "content" && (
            <SiteContentEditor sc={sc} scUpdate={scUpdate} uploadImageAndUpdate={uploadImageAndUpdate} showToast={showToast} />
          )}
        </div>
      </main>

      {/* ─── TOAST ─── */}
      {toast && (
        <div
          className="toast"
          role="alert"
          style={toast.type === "error" ? { borderColor: "#e05252" } : {}}
        >
          <span className="toast-icon">{toast.type === "error" ? "⚠️" : "✦"}</span>
          <span className="toast-msg">{toast.msg}</span>
        </div>
      )}

      <style>{`
        .spin-icon { display: inline-block; animation: spin 1.2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SITE CONTENT EDITOR COMPONENT
═══════════════════════════════════════════════════ */
interface SCEditorProps {
  sc: (key: string) => string;
  scUpdate: (key: string, value: string) => Promise<void>;
  uploadImageAndUpdate: (key: string, file: File) => Promise<void>;
  showToast: (msg: string, type?: "success" | "error") => void;
}

function SiteContentEditor({ sc, scUpdate, uploadImageAndUpdate, showToast }: SCEditorProps) {
  const [saving, setSaving] = useState<string | null>(null);

  async function saveText(key: string, value: string) {
    setSaving(key);
    try {
      await scUpdate(key, value);
      showToast("✦ Saved successfully!");
    } catch {
      showToast("Failed to save.", "error");
    } finally {
      setSaving(null);
    }
  }

  async function handleImageUpload(key: string, file: File) {
    setSaving(key);
    try {
      await uploadImageAndUpdate(key, file);
      showToast("✦ Image updated!");
    } catch {
      showToast("Failed to upload image.", "error");
    } finally {
      setSaving(null);
    }
  }

  function TextField({ label, fieldKey, multiline = false }: { label: string; fieldKey: string; multiline?: boolean }) {
    const [val, setVal] = useState(sc(fieldKey));
    const isSavingThis = saving === fieldKey;
    return (
      <div className="form-group" style={{ marginBottom: "16px" }}>
        <label className="form-label">{label}</label>
        {multiline ? (
          <textarea
            className="form-textarea"
            rows={3}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            style={{ fontSize: "0.88rem" }}
          />
        ) : (
          <input
            className="form-input"
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            style={{ fontSize: "0.88rem" }}
          />
        )}
        <button
          className="btn-submit"
          style={{ marginTop: "8px", padding: "8px 20px", fontSize: "0.78rem" }}
          disabled={isSavingThis}
          onClick={() => saveText(fieldKey, val)}
        >
          {isSavingThis ? "Saving…" : "Save"}
        </button>
      </div>
    );
  }

  function ImageField({ label, fieldKey }: { label: string; fieldKey: string }) {
    const isSavingThis = saving === fieldKey;
    const currentImg = sc(fieldKey);
    return (
      <div className="form-group" style={{ marginBottom: "20px" }}>
        <label className="form-label">{label}</label>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "8px", flexWrap: "wrap" }}>
          <div style={{ width: "100px", height: "100px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(201,169,110,0.2)", flexShrink: 0, background: "rgba(255,255,255,0.03)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentImg} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <input
              id={`img-upload-${fieldKey}`}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(fieldKey, file);
                e.target.value = "";
              }}
            />
            <label
              htmlFor={`img-upload-${fieldKey}`}
              className="btn-submit"
              style={{ cursor: "pointer", padding: "10px 22px", fontSize: "0.8rem", display: "inline-block" }}
            >
              {isSavingThis ? "Uploading…" : "🖼️ Change Image"}
            </label>
            <p style={{ fontSize: "0.72rem", color: "var(--white-muted)", marginTop: "6px" }}>
              PNG, JPG, WEBP — saves to Supabase Storage ☁️
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* ── HERO SECTION ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">🏠 Hero Section</h2>
        <p className="dashboard-card-subtitle">الصورة والنصوص اللي بتظهر في أول الصفحة الرئيسية</p>
        <div style={{ marginTop: "24px" }}>
          <ImageField label="Hero Image (الصورة الرئيسية)" fieldKey="hero_image" />
          <div style={{ borderTop: "1px solid rgba(220,202,187,0.1)", paddingTop: "20px", marginTop: "8px" }}>
            <TextField label="Eyebrow Text (النص فوق العنوان)" fieldKey="hero_eyebrow" />
            <TextField label="Title Line 1 (السطر الأول)" fieldKey="hero_title_1" />
            <TextField label="Title Line 2 — Gold Italic (السطر الذهبي المائل)" fieldKey="hero_title_2" />
            <TextField label="Title Line 3 (السطر الثالث)" fieldKey="hero_title_3" />
            <TextField label="Subtitle (الوصف تحت العنوان)" fieldKey="hero_subtitle" multiline />
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">🗂️ Categories Section</h2>
        <p className="dashboard-card-subtitle">الكاتيجوريز الأربعة اللي بتظهر في قسم &quot;Shop by Collection&quot;</p>

        {([1, 2, 3, 4] as const).map((n) => (
          <div key={n} style={{ marginTop: "28px", paddingTop: "24px", borderTop: n > 1 ? "1px solid rgba(220,202,187,0.1)" : "none" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--gold)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
              Category {n}
            </div>
            <ImageField label={`Category ${n} Image`} fieldKey={`cat${n}_image`} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
              <TextField label="Name (الاسم)" fieldKey={`cat${n}_name`} />
              <TextField label="Subtitle (الوصف الصغير)" fieldKey={`cat${n}_sub`} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
