"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useProducts } from "../context/ProductContext";
import { useSiteContent } from "../context/SiteContentContext";
import { useHeroSlides, DEFAULT_SLIDES, HeroSlide } from "../context/HeroSlidesContext";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { Product, FRAGRANCE_FAMILIES } from "../context/ProductContext";

export default function DashboardPage() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { get: sc, update: scUpdate, uploadImageAndUpdate } = useSiteContent();
  const { slides: heroSlides, allSlides: heroAllSlides, addSlide: addHeroSlide, updateSlide: updateHeroSlide, deleteSlide: deleteHeroSlide, reorderSlide: reorderHeroSlide, refetch: refetchHero } = useHeroSlides();
  const [activeTab, setActiveTab] = useState<"overview" | "add" | "products" | "content" | "carousel">("overview");

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
  const [gender, setGender] = useState<"men" | "women" | "unisex" | "oriental">("unisex");
  const [fragranceFamily, setFragranceFamily] = useState("");
  const [topNotes, setTopNotes] = useState("");
  const [heartNotes, setHeartNotes] = useState("");
  const [baseNotes, setBaseNotes] = useState("");
  const [longevity, setLongevity] = useState("");
  const [sillage, setSillage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // New State for Variants and Media
  const [sizes, setSizes] = useState<{size: string, price: number}[]>([
    { size: "10ml", price: 50 },
    { size: "30ml", price: 120 },
    { size: "50ml", price: 195 },
    { size: "100ml", price: 320 },
  ]);
  // Existing gallery images (URLs already in DB)
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>([]);
  // New gallery images (Files selected by user)
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
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
    setCategory("");
    setGender("unisex");
    setFragranceFamily("");
    setTopNotes("");
    setHeartNotes("");
    setBaseNotes("");
    setLongevity("");
    setSillage("");
    setSizes([
      { size: "10ml", price: 50 },
      { size: "30ml", price: 120 },
      { size: "50ml", price: 195 },
      { size: "100ml", price: 320 },
    ]);
    setExistingGalleryImages([]);
    setAdditionalImages([]);
    setAdditionalImagePreviews([]);
    setVideoUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setEditingProduct(null);
  };

  const handleEditProduct = (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price.toString());
    setBadge(p.badge || "");
    setImageFile(null);
    setImagePreview(p.image_url);
    setCategory(p.category || "");
    setGender(p.gender || "unisex");
    setFragranceFamily(p.fragrance_family || "");
    setTopNotes(p.top_notes || "");
    setHeartNotes(p.heart_notes || "");
    setBaseNotes(p.base_notes || "");
    setLongevity(p.longevity || "");
    setSillage(p.sillage || "");
    setSizes(p.sizes || []);
    setAdditionalImages([]);
    setAdditionalImagePreviews([]);
    setExistingGalleryImages(p.images || []);
    setVideoUrl(p.video_url || "");
    setActiveTab("add");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || (!imageFile && !editingProduct)) return;

    setIsSubmitting(true);
    try {
      // Step 1: Upload image to Supabase Storage via Server API Route (bypasses browser CORS & adblockers)
      let image_url = editingProduct ? editingProduct.image_url : "";
      if (imageFile) {
        setUploadProgress("Uploading main image...");
        const ext = imageFile.name.split(".").pop() ?? "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("fileName", fileName);

        const upRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!upRes.ok) throw new Error("Failed to upload main image");

        const data = await upRes.json();
        image_url = data.imageUrl;
      }

      // Step 2: Upload additional images (if any)
      let uploadedAdditionalImages: string[] = editingProduct ? (existingGalleryImages) : [];
      if (additionalImages.length > 0) {
        setUploadProgress("Uploading additional images...");
        // If editing, we append. The user can just upload more images and they get appended.
        // Or if they want to replace, they would need a delete feature, but append is safer.
        for (const file of additionalImages) {
          const ext = file.name.split(".").pop() ?? "jpg";
          const fileName = `gallery-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const formData = new FormData();
          formData.append("file", file);
          formData.append("fileName", fileName);

          const upRes = await fetch("/api/upload", { method: "POST", body: formData });
          if (upRes.ok) {
            const data = await upRes.json();
            uploadedAdditionalImages.push(data.imageUrl);
          }
        }
      }

      setUploadProgress("Saving product to database...");

      const productData = {
        name,
        description,
        price: parseFloat(price),
        image_url,
        badge: badge.trim() || null,
        category: category.trim() || undefined,
        gender,
        fragrance_family: fragranceFamily || undefined,
        top_notes: topNotes.trim() || undefined,
        heart_notes: heartNotes.trim() || undefined,
        base_notes: baseNotes.trim() || undefined,
        longevity: longevity.trim() || undefined,
        sillage: sillage.trim() || undefined,
        sizes,
        images: uploadedAdditionalImages.length > 0 ? uploadedAdditionalImages : undefined,
        video_url: videoUrl.trim() || undefined,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        showToast("✦ Fragrance updated successfully!");
      } else {
        await addProduct(productData);
        showToast("✦ Fragrance added to collection!");
      }
      
      handleReset();
      setActiveTab("products");
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
            onClick={() => { setActiveTab("add"); handleReset(); }}
          >
            <span className="nav-icon">✦</span> {editingProduct ? "Edit Product" : "Add Product"}
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

          <button
            id="nav-carousel"
            className={`sidebar-nav-item ${activeTab === "carousel" ? "active" : ""}`}
            onClick={() => setActiveTab("carousel")}
          >
            <span className="nav-icon">🎞</span> Hero Carousel
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
          <button
            className={`dashboard-mobile-nav-item ${activeTab === "carousel" ? "active" : ""}`}
            onClick={() => setActiveTab("carousel")}
          >
            Carousel
          </button>
        </div>

        {/* Topbar */}
        <div className="dashboard-topbar">
          <h1 className="topbar-title">
            {activeTab === "overview" && "Overview"}
            {activeTab === "add" && "Add New Fragrance"}
            {activeTab === "products" && "All Products"}
            {activeTab === "content" && "Site Content Editor"}
            {activeTab === "carousel" && "Hero Carousel Manager"}
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

                  {/* Gender */}
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <div style={{ display: "flex", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
                      {(["men", "women", "unisex", "oriental"] as const).map((g) => {
                        const meta = {
                          men:      { label: "رجالي",  labelEn: "Men",      icon: "♂",  color: "#6ab0f5", rgb: "106,176,245" },
                          women:    { label: "نسائي",  labelEn: "Women",    icon: "♀",  color: "#f5a0c8", rgb: "245,160,200" },
                          unisex:   { label: "مشترك",  labelEn: "Unisex",   icon: "⚧",  color: "#dbcabb", rgb: "220,202,187" },
                          oriental: { label: "شرقي",   labelEn: "Oriental", icon: "🌙", color: "#e8b86d", rgb: "232,184,109" },
                        }[g];
                        const active = gender === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            style={{
                              flex: "1 1 calc(25% - 8px)",
                              minWidth: "80px",
                              padding: "14px 10px",
                              borderRadius: "12px",
                              border: active ? `1.5px solid ${meta.color}` : "1px solid rgba(220,202,187,0.15)",
                              background: active ? `rgba(${meta.rgb},0.1)` : "rgba(255,255,255,0.03)",
                              color: active ? meta.color : "var(--white-muted)",
                              cursor: "pointer",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.82rem",
                              fontWeight: active ? 700 : 400,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "6px",
                              transition: "all 0.25s ease",
                              boxShadow: active ? `0 4px 20px rgba(${meta.rgb},0.2)` : "none",
                            }}
                          >
                            <span style={{ fontSize: "1.4rem" }}>{meta.icon}</span>
                            <span>{meta.labelEn}</span>
                            <span style={{ fontSize: "0.72rem", opacity: 0.7 }}>{meta.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fragrance Family */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-fragrance-family">
                      Fragrance Family
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                      {FRAGRANCE_FAMILIES.map((fam) => {
                        const active = fragranceFamily === fam;
                        return (
                          <button
                            key={fam}
                            type="button"
                            onClick={() => setFragranceFamily(active ? "" : fam)}
                            style={{
                              padding: "8px 16px",
                              borderRadius: "30px",
                              border: active
                                ? "1.5px solid var(--gold)"
                                : "1px solid rgba(220,202,187,0.18)",
                              background: active
                                ? "rgba(220,202,187,0.12)"
                                : "rgba(255,255,255,0.03)",
                              color: active ? "var(--gold)" : "var(--white-muted)",
                              fontSize: "0.78rem",
                              fontWeight: active ? 700 : 400,
                              cursor: "pointer",
                              fontFamily: "var(--font-sans)",
                              transition: "all 0.2s ease",
                              boxShadow: active ? "0 2px 12px rgba(220,202,187,0.2)" : "none",
                            }}
                          >
                            {fam}
                          </button>
                        );
                      })}
                    </div>
                    {fragranceFamily && (
                      <p style={{ fontSize: "0.72rem", color: "var(--gold)", marginTop: "8px" }}>
                        ✦ Selected: {fragranceFamily}
                      </p>
                    )}
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

                  {/* ── NEW: Dynamic Sizes ── */}
                  <div className="form-group full-width">
                    <label className="form-label">Variants & Sizes</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                      {sizes.map((s, idx) => (
                        <div key={idx} style={{
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(220,202,187,0.15)",
                          padding: "12px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "8px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--gold)" }}>
                            <span>Size</span>
                            <input
                              type="text"
                              value={s.size}
                              onChange={(e) => {
                                const newSizes = [...sizes];
                                newSizes[idx].size = e.target.value;
                                setSizes(newSizes);
                              }}
                              style={{ width: "60px", background: "transparent", border: "none", color: "var(--white)", borderBottom: "1px solid rgba(220,202,187,0.3)", outline: "none", textAlign: "right" }}
                            />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--white-muted)" }}>
                            <span>Price (EGP)</span>
                            <input
                              type="number"
                              value={s.price}
                              onChange={(e) => {
                                const newSizes = [...sizes];
                                newSizes[idx].price = Number(e.target.value);
                                setSizes(newSizes);
                              }}
                              style={{ width: "60px", background: "transparent", border: "none", color: "var(--white)", borderBottom: "1px solid rgba(220,202,187,0.3)", outline: "none", textAlign: "right" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── NEW: Gallery Images ── */}
                  <div className="form-group full-width">
                    <label className="form-label">Additional Gallery Images</label>

                    {/* Existing images (from DB) */}
                    {existingGalleryImages.length > 0 && (
                      <div style={{ marginBottom: "14px" }}>
                        <p style={{ fontSize: "0.74rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                          Saved Images ({existingGalleryImages.length}) — click × to remove
                        </p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          {existingGalleryImages.map((src, i) => (
                            <div key={i} style={{ position: "relative", width: "80px", height: "80px" }}>
                              <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "2px solid rgba(220,202,187,0.4)" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt="gallery" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                              <button
                                type="button"
                                onClick={() => setExistingGalleryImages(existingGalleryImages.filter((_, idx) => idx !== i))}
                                style={{
                                  position: "absolute", top: "-8px", right: "-8px",
                                  width: "22px", height: "22px",
                                  background: "#ef4444", color: "#fff",
                                  border: "none", borderRadius: "50%",
                                  fontSize: "0.75rem", cursor: "pointer",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  lineHeight: 1, fontWeight: 700,
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                                }}
                                title="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New images to upload */}
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        background: "rgba(220,202,187,0.07)",
                        border: "1px dashed rgba(220,202,187,0.35)",
                        borderRadius: "10px",
                        cursor: "pointer",
                        color: "var(--gold)",
                        fontSize: "0.82rem",
                        letterSpacing: "0.08em",
                        marginBottom: "10px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(220,202,187,0.13)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(220,202,187,0.07)")}
                    >
                      + Add Images
                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files || []);
                          if (!newFiles.length) return;
                          // Accumulate — don't replace existing selections
                          setAdditionalImages(prev => [...prev, ...newFiles]);
                          const newPreviews = newFiles.map(f => URL.createObjectURL(f));
                          setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
                          // Reset input so same file can be re-added if needed
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {additionalImagePreviews.length > 0 && (
                      <div>
                        <p style={{ fontSize: "0.74rem", color: "var(--white-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                          New images to upload ({additionalImagePreviews.length})
                        </p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          {additionalImagePreviews.map((src, i) => (
                            <div key={i} style={{ position: "relative", width: "80px", height: "80px" }}>
                              <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "2px solid rgba(76,175,80,0.5)" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt="new preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = additionalImages.filter((_, idx) => idx !== i);
                                  const newPreviews = additionalImagePreviews.filter((_, idx) => idx !== i);
                                  setAdditionalImages(newFiles);
                                  setAdditionalImagePreviews(newPreviews);
                                }}
                                style={{
                                  position: "absolute", top: "-8px", right: "-8px",
                                  width: "22px", height: "22px",
                                  background: "#ef4444", color: "#fff",
                                  border: "none", borderRadius: "50%",
                                  fontSize: "0.75rem", cursor: "pointer",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  lineHeight: 1, fontWeight: 700,
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                                }}
                                title="Remove"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── NEW: Video URL ── */}
                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="product-video-url">Video Embed URL (YouTube / Vimeo)</label>
                    <input
                      id="product-video-url"
                      className="form-input"
                      type="url"
                      placeholder="e.g. https://www.youtube.com/embed/..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <p style={{ fontSize: "0.75rem", color: "var(--white-muted)", marginTop: "6px" }}>
                      Please provide the direct embed URL to ensure it plays inside the page beautifully.
                    </p>
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
                      {editingProduct ? "Cancel Edit" : "Clear"}
                    </button>
                    <button
                      id="submit-product-btn"
                      type="submit"
                      className="btn-submit"
                      disabled={isSubmitting || !name || !description || !price || (!imageFile && !editingProduct)}
                    >
                      {isSubmitting ? "Saving..." : (editingProduct ? "✦ Update Collection" : "✦ Add to Collection")}
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
                                id={`edit-product-${product.id}`}
                                className="btn-secondary"
                                style={{ padding: "8px 14px", fontSize: "0.8rem", borderRadius: "8px", minWidth: "60px", background: "transparent", border: "1px solid rgba(220,202,187,0.2)" }}
                                onClick={() => handleEditProduct(product)}
                              >
                                Edit
                              </button>
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
          {/* ── HERO CAROUSEL TAB ── */}
          {activeTab === "carousel" && (
            <HeroCarouselEditor
              slides={heroAllSlides}
              onAdd={addHeroSlide}
              onUpdate={updateHeroSlide}
              onDelete={deleteHeroSlide}
              onReorder={reorderHeroSlide}
              onRefetch={refetchHero}
              showToast={showToast}
            />
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

/* ═══════════════════════════════════════════════════
   HERO CAROUSEL EDITOR COMPONENT
═══════════════════════════════════════════════════ */
interface HeroCarouselEditorProps {
  slides: HeroSlide[];
  onAdd: (slide: Omit<HeroSlide, "id" | "created_at">) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Omit<HeroSlide, "id" | "created_at">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (id: string, direction: "up" | "down") => Promise<void>;
  onRefetch: () => Promise<void>;
  showToast: (msg: string, type?: "success" | "error") => void;
}

function HeroCarouselEditor({
  slides,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  onRefetch,
  showToast,
}: HeroCarouselEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editLang, setEditLang] = useState<"en" | "ar">("ar");

  // Form State
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string>("");
  const [accent, setAccent] = useState("rgba(165,110,60,0.6)");
  const [gradient, setGradient] = useState("linear-gradient(135deg,#0a0519 0%,#1a0a2e 45%,#0f0820 100%)");
  const [glow, setGlow] = useState("rgba(200,140,80,0.35)");
  const [href, setHref] = useState("/products");
  const [active, setActive] = useState(true);

  const [tagEn, setTagEn] = useState("");
  const [tagAr, setTagAr] = useState("");
  const [eyebrowEn, setEyebrowEn] = useState("");
  const [eyebrowAr, setEyebrowAr] = useState("");
  const [title1En, setTitle1En] = useState("");
  const [title1Ar, setTitle1Ar] = useState("");
  const [title2En, setTitle2En] = useState("");
  const [title2Ar, setTitle2Ar] = useState("");
  const [title3En, setTitle3En] = useState("");
  const [title3Ar, setTitle3Ar] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [subtitleAr, setSubtitleAr] = useState("");
  const [btnTextEn, setBtnTextEn] = useState("Explore Collection");
  const [btnTextAr, setBtnTextAr] = useState("استكشف الكولكشن");

  const resetForm = () => {
    setEditingId(null);
    setImgFile(null);
    setImgPreview("");
    setAccent("rgba(165,110,60,0.6)");
    setGradient("linear-gradient(135deg,#0a0519 0%,#1a0a2e 45%,#0f0820 100%)");
    setGlow("rgba(200,140,80,0.35)");
    setHref("/products");
    setActive(true);
    setTagEn("");
    setTagAr("");
    setEyebrowEn("");
    setEyebrowAr("");
    setTitle1En("");
    setTitle1Ar("");
    setTitle2En("");
    setTitle2Ar("");
    setTitle3En("");
    setTitle3Ar("");
    setSubtitleEn("");
    setSubtitleAr("");
    setBtnTextEn("Explore Collection");
    setBtnTextAr("استكشف الكولكشن");
  };

  const handleEditInit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setImgPreview(slide.img);
    setAccent(slide.accent);
    setGradient(slide.gradient);
    setGlow(slide.glow);
    setHref(slide.href);
    setActive(slide.active);
    setTagEn(slide.tag_en || "");
    setTagAr(slide.tag_ar || "");
    setEyebrowEn(slide.eyebrow_en || "");
    setEyebrowAr(slide.eyebrow_ar || "");
    setTitle1En(slide.title1_en || "");
    setTitle1Ar(slide.title1_ar || "");
    setTitle2En(slide.title2_en || "");
    setTitle2Ar(slide.title2_ar || "");
    setTitle3En(slide.title3_en || "");
    setTitle3Ar(slide.title3_ar || "");
    setSubtitleEn(slide.subtitle_en || "");
    setSubtitleAr(slide.subtitle_ar || "");
    setBtnTextEn(slide.btn_text_en || "Explore Collection");
    setBtnTextAr(slide.btn_text_ar || "استكشف الكولكشن");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImgFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImgPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `carousel/slide-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || res.statusText);
    }

    const data = await res.json();
    return data.imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !imgFile) {
      showToast("Please upload an image for the slide.", "error");
      return;
    }

    setSubmitting(true);
    try {
      let finalImgUrl = imgPreview;
      if (imgFile) {
        finalImgUrl = await handleUpload(imgFile);
      }

      const slideData = {
        sort_order: editingId ? (slides.find(s => s.id === editingId)?.sort_order ?? slides.length) : slides.length,
        img: finalImgUrl,
        accent,
        gradient,
        glow,
        href,
        active,
        tag_en: tagEn,
        tag_ar: tagAr,
        eyebrow_en: eyebrowEn,
        eyebrow_ar: eyebrowAr,
        title1_en: title1En,
        title1_ar: title1Ar,
        title2_en: title2En,
        title2_ar: title2Ar,
        title3_en: title3En,
        title3_ar: title3Ar,
        subtitle_en: subtitleEn,
        subtitle_ar: subtitleAr,
        btn_text_en: btnTextEn,
        btn_text_ar: btnTextAr,
      };

      if (editingId) {
        if (editingId.startsWith("default-")) {
          await onAdd({ ...slideData, sort_order: slides.length });
          showToast("✦ Saved default slide as a custom database slide!");
        } else {
          await onUpdate(editingId, slideData);
          showToast("✦ Slide updated successfully!");
        }
      } else {
        await onAdd(slideData);
        showToast("✦ Slide added successfully!");
      }
      resetForm();
      onRefetch();
    } catch (err: any) {
      showToast(err.message || "Failed to save slide.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith("default-")) {
      showToast("Cannot delete system default slides. You can deactivate them instead.", "error");
      return;
    }
    if (!confirm("Are you sure you want to delete this slide?")) return;
    try {
      await onDelete(id);
      showToast("Slide deleted successfully.");
      onRefetch();
    } catch (err: any) {
      showToast(err.message || "Failed to delete slide.", "error");
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    if (slide.id.startsWith("default-")) {
      showToast("Cannot edit status of system default slides directly. Import them first.", "error");
      return;
    }
    try {
      await onUpdate(slide.id, { active: !slide.active });
      showToast(`Slide ${!slide.active ? "activated" : "deactivated"} successfully.`);
      onRefetch();
    } catch (err: any) {
      showToast(err.message || "Failed to update slide.", "error");
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    if (id.startsWith("default-")) {
      showToast("Import slides to database to enable reordering.", "error");
      return;
    }
    try {
      await onReorder(id, direction);
      showToast("Reordered successfully.");
      onRefetch();
    } catch (err: any) {
      showToast(err.message || "Failed to reorder.", "error");
    }
  };

  const handleImportDefaults = async () => {
    const hasRealSlides = slides.some(s => !s.id.startsWith("default-"));
    if (hasRealSlides) {
      if (!confirm("You already have custom slides in the database. Importing defaults might duplicate them or overwrite your order. Proceed?")) return;
    } else {
      if (!confirm("This will import the 4 default slides into your database so you can fully edit or delete them. Proceed?")) return;
    }

    setSubmitting(true);
    try {
      for (const slide of DEFAULT_SLIDES) {
        const { id, ...slideData } = slide;
        await onAdd(slideData);
      }
      showToast("✦ Successfully imported all default slides!");
      onRefetch();
    } catch (err: any) {
      showToast(err.message || "Failed to import defaults.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const hasDefaults = slides.some(s => s.id.startsWith("default-"));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "100px" }}>
      
      {/* LANGUAGE SELECTOR */}
      <div style={{ position: "sticky", top: "70px", zIndex: 10, display: "flex", gap: "12px", background: "rgba(20,20,20,0.9)", backdropFilter: "blur(10px)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(201,169,110,0.4)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
        <div style={{ marginRight: "auto", display: "flex", alignItems: "center", fontWeight: 600, color: "var(--gold)" }}>
          🌐 Edit Language / لغة التعديل:
        </div>
        <button type="button" className={editLang === "ar" ? "btn-submit" : "btn-reset"} onClick={() => setEditLang("ar")}>عربي (Arabic)</button>
        <button type="button" className={editLang === "en" ? "btn-submit" : "btn-reset"} onClick={() => setEditLang("en")}>English</button>
      </div>

      {hasDefaults && (
        <div className="dashboard-card" style={{ border: "1px solid rgba(234,179,8,0.3)", background: "rgba(234,179,8,0.02)" }}>
          <h3 style={{ color: "#eab308", display: "flex", alignItems: "center", gap: "8px", margin: 0, fontSize: "1.05rem" }}>
            ⚠️ System Default Slides Active
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--white-muted)", margin: "8px 0 16px", lineHeight: 1.5 }}>
            The carousel is currently showing default static slides because your database table `hero_slides` is empty.
            To edit, delete, or reorder these slides, import them to your database first.
          </p>
          <button type="button" className="btn-submit" onClick={handleImportDefaults} disabled={submitting}>
            {submitting ? "Importing..." : "📥 Import Default Slides to Database"}
          </button>
        </div>
      )}

      {/* ADD / EDIT SLIDE FORM */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">
          {editingId ? `📝 Edit Slide (${editingId.startsWith("default-") ? "Template" : "DB ID: " + editingId.slice(0,8)})` : "➕ Add New Carousel Slide"}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Slide Image 🖼️</label>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "8px", flexWrap: "wrap" }}>
              {imgPreview && (
                <div style={{ width: "160px", height: "90px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(201,169,110,0.2)", background: "rgba(0,0,0,0.4)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div>
                <input
                  id="slide-image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="slide-image-file" className="btn-submit" style={{ cursor: "pointer", display: "inline-block", padding: "10px 20px" }}>
                  {imgFile ? "Change Selected Image" : "Upload Slide Image"}
                </label>
                <p style={{ fontSize: "0.72rem", color: "var(--white-muted)", marginTop: "6px" }}>
                  Upload high-quality landscape image (16:9 recommended)
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Tag Badge */}
            <div className="form-group">
              <label className="form-label">Tag Badge (e.g. BEST SELLER) - {editLang === "ar" ? "عربي" : "English"}</label>
              {editLang === "ar" ? (
                <input className="form-input" style={{ direction: "rtl" }} type="text" placeholder="مثال: الأكثر مبيعاً" value={tagAr} onChange={e => setTagAr(e.target.value)} />
              ) : (
                <input className="form-input" type="text" placeholder="e.g. BEST SELLER" value={tagEn} onChange={e => setTagEn(e.target.value)} />
              )}
            </div>

            {/* Eyebrow */}
            <div className="form-group">
              <label className="form-label">Eyebrow Text - {editLang === "ar" ? "عربي" : "English"}</label>
              {editLang === "ar" ? (
                <input className="form-input" style={{ direction: "rtl" }} type="text" placeholder="مثال: تشكيلة التوقيع الخاصة" value={eyebrowAr} onChange={e => setEyebrowAr(e.target.value)} />
              ) : (
                <input className="form-input" type="text" placeholder="e.g. The Signature Collection" value={eyebrowEn} onChange={e => setEyebrowEn(e.target.value)} />
              )}
            </div>
          </div>

          {/* Title Lines */}
          <div className="form-group">
            <label className="form-label">Title (3 lines of text for staggered animation) - {editLang === "ar" ? "عربي" : "English"}</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "6px" }}>
              {editLang === "ar" ? (
                <>
                  <input className="form-input" style={{ direction: "rtl" }} type="text" placeholder="السطر 1" value={title1Ar} onChange={e => setTitle1Ar(e.target.value)} />
                  <input className="form-input" style={{ direction: "rtl" }} type="text" placeholder="السطر 2" value={title2Ar} onChange={e => setTitle2Ar(e.target.value)} />
                  <input className="form-input" style={{ direction: "rtl" }} type="text" placeholder="السطر 3" value={title3Ar} onChange={e => setTitle3Ar(e.target.value)} />
                </>
              ) : (
                <>
                  <input className="form-input" type="text" placeholder="Line 1" value={title1En} onChange={e => setTitle1En(e.target.value)} />
                  <input className="form-input" type="text" placeholder="Line 2" value={title2En} onChange={e => setTitle2En(e.target.value)} />
                  <input className="form-input" type="text" placeholder="Line 3" value={title3En} onChange={e => setTitle3En(e.target.value)} />
                </>
              )}
            </div>
          </div>

          {/* Subtitle */}
          <div className="form-group">
            <label className="form-label">Subtitle Description - {editLang === "ar" ? "عربي" : "English"}</label>
            {editLang === "ar" ? (
              <textarea className="form-textarea" style={{ direction: "rtl" }} rows={2} placeholder="وصف تفصيلي قصير..." value={subtitleAr} onChange={e => setSubtitleAr(e.target.value)} />
            ) : (
              <textarea className="form-textarea" rows={2} placeholder="Short description description..." value={subtitleEn} onChange={e => setSubtitleEn(e.target.value)} />
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Button Text */}
            <div className="form-group">
              <label className="form-label">Button Text - {editLang === "ar" ? "عربي" : "English"}</label>
              {editLang === "ar" ? (
                <input className="form-input" style={{ direction: "rtl" }} type="text" value={btnTextAr} onChange={e => setBtnTextAr(e.target.value)} />
              ) : (
                <input className="form-input" type="text" value={btnTextEn} onChange={e => setBtnTextEn(e.target.value)} />
              )}
            </div>

            {/* Target Href Link */}
            <div className="form-group">
              <label className="form-label">Target Link (href)</label>
              <input className="form-input" type="text" placeholder="e.g. /products or /category?cat=Oud" value={href} onChange={e => setHref(e.target.value)} />
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "18px", marginTop: "10px" }}>
            <h4 style={{ margin: "0 0 16px", color: "var(--gold)", fontSize: "0.88rem", letterSpacing: "0.05em" }}>🎨 Advanced Slide Styling & Colors (Glow & Ambient Accent)</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Accent Glow (rgba)</label>
                <input className="form-input" style={{ fontSize: "0.8rem" }} type="text" value={glow} onChange={e => setGlow(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Edge Accent (rgba)</label>
                <input className="form-input" style={{ fontSize: "0.8rem" }} type="text" value={accent} onChange={e => setAccent(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Background Gradient CSS</label>
                <input className="form-input" style={{ fontSize: "0.8rem" }} type="text" value={gradient} onChange={e => setGradient(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button className="btn-submit" type="submit" disabled={submitting}>
              {submitting ? "Saving Slide..." : editingId ? "Save Changes" : "Create Slide"}
            </button>
            {editingId && (
              <button className="btn-reset" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ALL CAROUSEL SLIDES LIST */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">🎞️ Current Carousel Slides</h2>
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {slides.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--white-muted)", fontSize: "0.9rem" }}>
              No slides configured. Add one above!
            </div>
          ) : (
            slides.map((slide, index) => {
              const slideTitle1 = editLang === "ar" ? slide.title1_ar : slide.title1_en;
              const slideTitle2 = editLang === "ar" ? slide.title2_ar : slide.title2_en;
              const slideTitle3 = editLang === "ar" ? slide.title3_ar : slide.title3_en;
              const slideSubtitle = editLang === "ar" ? slide.subtitle_ar : slide.subtitle_en;
              const slideTag = editLang === "ar" ? slide.tag_ar : slide.tag_en;

              const isDefault = slide.id.startsWith("default-");

              return (
                <div key={slide.id} style={{ display: "flex", gap: "20px", padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,169,110,0.1)", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ width: "120px", height: "72px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.05)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide.img} alt="Slide Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--gold)" }}>
                        {slideTitle1} {slideTitle2} {slideTitle3}
                      </span>
                      {slideTag && (
                        <span style={{ background: "rgba(201,169,110,0.15)", color: "var(--gold-light)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700 }}>
                          {slideTag}
                        </span>
                      )}
                      {isDefault && (
                        <span style={{ background: "rgba(234,179,8,0.15)", color: "#facc15", padding: "2px 8px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700 }}>
                          SYSTEM DEFAULT
                        </span>
                      )}
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "var(--white-muted)", lineHeight: 1.4 }}>
                      {slideSubtitle}
                    </p>
                    <div style={{ marginTop: "8px", fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>
                      Link: {slide.href} | Order: {slide.sort_order}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {!isDefault && (
                      <>
                        <button type="button" className="btn-reset" style={{ padding: "6px 10px", fontSize: "0.75rem" }} onClick={() => handleMove(slide.id, "up")} disabled={index === 0}>
                          ▲
                        </button>
                        <button type="button" className="btn-reset" style={{ padding: "6px 10px", fontSize: "0.75rem" }} onClick={() => handleMove(slide.id, "down")} disabled={index === slides.length - 1}>
                          ▼
                        </button>
                      </>
                    )}

                    <button type="button" className="btn-submit" style={{ padding: "8px 16px", fontSize: "0.75rem" }} onClick={() => handleEditInit(slide)}>
                      Edit
                    </button>

                    {!isDefault && (
                      <button type="button" className="btn-reset" style={{ padding: "8px 16px", fontSize: "0.75rem", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }} onClick={() => handleDelete(slide.id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

