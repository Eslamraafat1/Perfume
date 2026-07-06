"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useProducts } from "../context/ProductContext";
import { useSiteContent } from "../context/SiteContentContext";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";

export default function DashboardPage() {
  const { products, loading, addProduct, deleteProduct } = useProducts();
  const { get: sc, update: scUpdate, uploadImageAndUpdate } = useSiteContent();
  const [activeTab, setActiveTab] = useState<"overview" | "add" | "products" | "content">("overview");

  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "missing_env" | "error">("checking");
  const [dbErrorMessage, setDbErrorMessage] = useState("");

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.from("products").select("id").limit(1);
        if (error) {
          setDbStatus("error");
          setDbErrorMessage(error.message);
        } else {
          setDbStatus("connected");
        }
      } catch (err) {
        setDbStatus("error");
        setDbErrorMessage(err instanceof Error ? err.message : "Network error");
      }
    }
    checkConnection();
  }, []);

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
      // Step 1: Upload image to Supabase Storage via Server API Route (bypasses browser CORS & adblockers)
      setUploadProgress("Uploading image to Supabase Storage...");
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("fileName", fileName);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(`Image upload failed: ${errData.error || uploadRes.statusText}`);
      }

      const uploadData = await uploadRes.json();
      const image_url = uploadData.imageUrl;

      // Step 2: Add product record to database
      setUploadProgress("Saving product to database...");

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
            <span className="sidebar-logo-text">Nubia</span>
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
          <div style={{ fontSize: "0.75rem", color: "var(--white-muted)", letterSpacing: "0.05em", display: "flex", flexDirection: "column", gap: "4px" }}>
            {dbStatus === "checking" && (
              <div>
                <span style={{ color: "#eab308" }}>●</span>&nbsp; Checking Supabase...
              </div>
            )}
            {dbStatus === "connected" && (
              <div>
                <span style={{ color: "#22c55e" }}>●</span>&nbsp; Supabase Connected
              </div>
            )}
            {dbStatus === "missing_env" && (
              <div style={{ color: "#ef4444" }}>
                <span style={{ color: "#ef4444" }}>●</span>&nbsp; Config Missing (.env.local)
              </div>
            )}
            {dbStatus === "error" && (
              <div style={{ color: "#ef4444" }} title={dbErrorMessage}>
                <span style={{ color: "#ef4444" }}>●</span>&nbsp; Connection Failed
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        {/* Mobile Navigation Tabs */}
        <div className="dashboard-mobile-nav">
          <button
            className={`dashboard-mobile-nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`dashboard-mobile-nav-item ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            Add Product
          </button>
          <button
            className={`dashboard-mobile-nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={`dashboard-mobile-nav-item ${activeTab === "content" ? "active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            Site Content
          </button>
        </div>

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

              {dbStatus === "missing_env" && (
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                  lineHeight: "1.5"
                }}>
                  <strong>⚠️ Supabase Configuration Missing:</strong> Environment variables are not loaded by Next.js.
                  Please update <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code>.env.local</code> file,
                  then stop your terminal (Ctrl+C) and run <code>npm run dev</code> again to apply the changes.
                </div>
              )}
              {dbStatus === "error" && (
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                  lineHeight: "1.5"
                }}>
                  <strong>⚠️ Supabase Connection Error:</strong> {dbErrorMessage || "Could not connect to the database."}
                  Please check your internet connection or verify your Supabase API keys in <code>.env.local</code>.
                </div>
              )}

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
  const [editLang, setEditLang] = useState<"en" | "ar">("ar");

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

  function TextField({ label, fieldKey, multiline = false, languageSpecific = true }: { label: string; fieldKey: string; multiline?: boolean; languageSpecific?: boolean }) {
    const actualKey = languageSpecific ? `${editLang}_${fieldKey}` : fieldKey;
    const [val, setVal] = useState(sc(actualKey));
    
    useEffect(() => {
      setVal(sc(actualKey));
    }, [actualKey, sc]);

    const isSavingThis = saving === actualKey;
    return (
      <div className="form-group" style={{ marginBottom: "16px" }}>
        <label className="form-label">{label} <span style={{opacity:0.4, fontSize:"0.7rem"}}>({actualKey})</span></label>
        {multiline ? (
          <textarea
            className="form-textarea"
            rows={3}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            style={{ fontSize: "0.88rem", direction: editLang === "ar" && languageSpecific ? "rtl" : "ltr" }}
          />
        ) : (
          <input
            className="form-input"
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            style={{ fontSize: "0.88rem", direction: editLang === "ar" && languageSpecific ? "rtl" : "ltr" }}
          />
        )}
        <button
          className="btn-submit"
          style={{ marginTop: "8px", padding: "8px 20px", fontSize: "0.78rem" }}
          disabled={isSavingThis}
          onClick={() => saveText(actualKey, val)}
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
        <label className="form-label">{label} <span style={{opacity:0.4, fontSize:"0.7rem"}}>({fieldKey})</span></label>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "100px" }}>

      {/* LANGUAGE TOGGLE */}
      <div style={{ position: "sticky", top: "70px", zIndex: 10, display: "flex", gap: "12px", background: "rgba(20,20,20,0.9)", backdropFilter: "blur(10px)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(201,169,110,0.4)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
        <div style={{ marginRight: "auto", display: "flex", alignItems: "center", fontWeight: 600, color: "var(--gold)" }}>
          🌐 Editing Language / لغة التعديل:
        </div>
        <button className={editLang === "ar" ? "btn-submit" : "btn-reset"} onClick={() => setEditLang("ar")}>عربي (Arabic)</button>
        <button className={editLang === "en" ? "btn-submit" : "btn-reset"} onClick={() => setEditLang("en")}>English</button>
      </div>

      {/* ── GENERAL (Navbar & Announce) ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">🌐 General Settings</h2>
        <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          <TextField label="Announcement 1" fieldKey="ann_1" />
          <TextField label="Announcement 2" fieldKey="ann_2" />
          <TextField label="Nav: Home" fieldKey="nav_home" />
          <TextField label="Nav: Products" fieldKey="nav_products" />
          <TextField label="Nav: Collection" fieldKey="nav_collection" />
          <TextField label="Nav: About Us" fieldKey="nav_about" />
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">🏠 Hero Section</h2>
        <div style={{ marginTop: "24px" }}>
          <ImageField label="Hero Background Image" fieldKey="hero_image" />
          <div style={{ borderTop: "1px solid rgba(220,202,187,0.1)", paddingTop: "20px", marginTop: "8px" }}>
            <TextField label="Eyebrow Text" fieldKey="hero_eyebrow" />
            <TextField label="Title Line 1" fieldKey="hero_title_1" />
            <TextField label="Title Line 2 (Gold Italic)" fieldKey="hero_title_2" />
            <TextField label="Title Line 3" fieldKey="hero_title_3" />
            <TextField label="Subtitle" fieldKey="hero_subtitle" multiline />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
              <TextField label="Primary Button" fieldKey="hero_btn_primary" />
              <TextField label="Secondary Button" fieldKey="hero_btn_secondary" />
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">🗂️ Categories Section</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          <TextField label="Section Eyebrow" fieldKey="cat_eyebrow" />
          <TextField label="Section Title" fieldKey="cat_title" />
        </div>
        <TextField label="Section Description" fieldKey="cat_desc" multiline />

        {([1, 2, 3, 4] as const).map((n) => (
          <div key={n} style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid rgba(220,202,187,0.1)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--gold)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
              Category {n}
            </div>
            <ImageField label={`Category ${n} Image`} fieldKey={`cat${n}_image`} />
            <div className="checkout-form-row-2" style={{ gap: "0 24px" }}>
              <TextField label="Name" fieldKey={`cat${n}_name`} />
              <TextField label="Subtitle" fieldKey={`cat${n}_sub`} />
            </div>
          </div>
        ))}
      </div>

      {/* ── PROCESS SECTION ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">⏳ Process (From Seed to Bottle)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          <TextField label="Section Eyebrow" fieldKey="proc_eyebrow" />
          <TextField label="Section Title" fieldKey="proc_title" />
        </div>
        <TextField label="Section Description" fieldKey="proc_desc" multiline />

        {([1, 2, 3, 4] as const).map((n) => (
          <div key={n} style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(220,202,187,0.1)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", marginBottom: "12px" }}>Step {n}</div>
            <TextField label="Step Title" fieldKey={`proc_step${n}_title`} />
            <TextField label="Step Description" fieldKey={`proc_step${n}_desc`} multiline />
          </div>
        ))}
      </div>

      {/* ── NOTES / INGREDIENTS ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">🌿 Rare Ingredients</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          <TextField label="Section Eyebrow" fieldKey="notes_eyebrow" />
          <TextField label="Title Line 1" fieldKey="notes_title_1" />
          <TextField label="Title Line 2" fieldKey="notes_title_2" />
        </div>
        <TextField label="Section Description" fieldKey="notes_desc" multiline />

        {([1, 2, 3, 4, 5, 6] as const).map((n) => (
          <div key={n} style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(220,202,187,0.1)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", marginBottom: "12px" }}>Ingredient {n}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
              <TextField label="Name" fieldKey={`note${n}_name`} />
              <TextField label="Origin" fieldKey={`note${n}_origin`} />
            </div>
            <TextField label="Description" fieldKey={`note${n}_desc`} multiline />
          </div>
        ))}
      </div>

      {/* ── STORY & TESTIMONIALS ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">📖 Brand Story & Testimonials</h2>
        
        <div style={{ fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", marginBottom: "12px" }}>Brand Story</div>
        <TextField label="Story Eyebrow" fieldKey="story_eyebrow" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          <TextField label="Story Title 1" fieldKey="story_title_1" />
          <TextField label="Story Title 2" fieldKey="story_title_2" />
        </div>
        <TextField label="Paragraph 1" fieldKey="story_p1" multiline />
        <TextField label="Paragraph 2" fieldKey="story_p2" multiline />

        <div style={{ fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", marginTop: "32px", marginBottom: "12px", borderTop: "1px solid rgba(220,202,187,0.1)", paddingTop: "20px" }}>Testimonials</div>
        <TextField label="Testimonial Section Title" fieldKey="test_title" />
        
        {([1, 2, 3] as const).map((n) => (
          <div key={n} style={{ marginTop: "20px", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--white-muted)", marginBottom: "12px" }}>Review {n}</div>
            <TextField label="Customer Name" fieldKey={`test${n}_name`} />
            <TextField label="Product Reviewed" fieldKey={`test${n}_product`} />
            <TextField label="Review Text" fieldKey={`test${n}_text`} multiline />
          </div>
        ))}
      </div>

      {/* ── NEW: THE ART OF GIFTING ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">🎁 The Art of Gifting</h2>
        <div style={{ marginTop: "24px" }}>
          <ImageField label="Gifting Background/Product Image" fieldKey="gift_image" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <TextField label="Eyebrow Text" fieldKey="gift_eyebrow" />
            <TextField label="Title" fieldKey="gift_title" />
          </div>
          <TextField label="Description" fieldKey="gift_desc" multiline />
          <TextField label="Button Text" fieldKey="gift_btn" />
        </div>
      </div>

      {/* ── NEW: SIGNATURE DISCOVERY ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">🔍 Signature Discovery (CTA)</h2>
        <div style={{ marginTop: "24px" }}>
          <ImageField label="Discovery Background Image" fieldKey="sig_image" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <TextField label="Title Line 1" fieldKey="sig_title_1" />
            <TextField label="Title Line 2" fieldKey="sig_title_2" />
          </div>
          <TextField label="Description" fieldKey="sig_desc" multiline />
          <TextField label="Button Text" fieldKey="sig_btn" />
        </div>
      </div>

      {/* ── NEW: EDITORIAL SPOTLIGHT ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">📖 Editorial Spotlight</h2>
        <div style={{ marginTop: "24px" }}>
          <ImageField label="Editorial Feature Image" fieldKey="edit_image" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <TextField label="Eyebrow Text" fieldKey="edit_eyebrow" />
            <TextField label="Title" fieldKey="edit_title" />
          </div>
          <TextField label="Description" fieldKey="edit_desc" multiline />
          <TextField label="Button Text" fieldKey="edit_btn" />
        </div>
      </div>

      {/* ── NEW: CURATED LOOKBOOK ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">✨ Curated Lookbook / Spotlight</h2>
        <div style={{ marginTop: "24px" }}>
          <ImageField label="Lookbook Main Image" fieldKey="look_image" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <TextField label="Eyebrow Text" fieldKey="look_eyebrow" />
            <TextField label="Title" fieldKey="look_title" />
          </div>
          <TextField label="Description" fieldKey="look_desc" multiline />
          <TextField label="Button Text" fieldKey="look_btn" />
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">⬇️ Footer</h2>
        <TextField label="Footer Description" fieldKey="footer_desc" multiline />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          <TextField label="Copyright Text" fieldKey="footer_copyright" />
          <TextField label="Made With Love Text" fieldKey="footer_made" />
        </div>
      </div>

    </div>
  );
}

