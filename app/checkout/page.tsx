"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import gsap from "gsap";

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("Cairo");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod or card
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  // Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".checkout-title-section",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
      gsap.fromTo(
        ".checkout-col-left",
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(
        ".checkout-col-right",
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", delay: 0.3 }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const shippingCost = totalPrice >= 1500 ? 0 : 80;
  const finalTotal = totalPrice + shippingCost - discount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "LUXE10") {
      setDiscount(Math.round(totalPrice * 0.1));
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid promo code");
      setDiscount(0);
    }
  };

  const WHATSAPP_NUMBER = "201509919280"; // رقم الواتساب بدون +

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      setErrorMessage("من فضلك اكمل البيانات المطلوبة (الاسم، التليفون، العنوان).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const orderId = "ML-" + Math.floor(100000 + Math.random() * 900000);

      // ── بناء قائمة المنتجات ──
      const itemsText = items
        .map(
          (item, i) =>
            `${i + 1}. ${item.name}${item.size ? ` (${item.size})` : ""} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} EGP`
        )
        .join("\n");

      // ── بناء رسالة الواتساب ──
      const msg = [
        `🌹 *طلب جديد — Maison Luxe*`,
        `━━━━━━━━━━━━━━━━━━`,
        `🔖 رقم الطلب: *${orderId}*`,
        ``,
        `👤 *بيانات العميل*`,
        `الاسم: ${fullName}`,
        `التليفون: ${phone}`,
        email ? `الإيميل: ${email}` : null,
        `المحافظة: ${governorate}`,
        `العنوان: ${address}`,
        notes ? `ملاحظات: ${notes}` : null,
        ``,
        `🛍️ *المنتجات*`,
        itemsText,
        ``,
        `💰 *الإجمالي*`,
        `الإجمالي الفرعي: ${totalPrice.toLocaleString()} EGP`,
        shippingCost > 0 ? `الشحن: ${shippingCost} EGP` : `الشحن: مجاني ✅`,
        discount > 0 ? `خصم: -${discount.toLocaleString()} EGP` : null,
        `*الإجمالي الكلي: ${finalTotal.toLocaleString()} EGP*`,
        ``,
        `💳 طريقة الدفع: ${paymentMethod === "cod" ? "الدفع عند الاستلام" : "بطاقة ائتمان"}`,
        `━━━━━━━━━━━━━━━━━━`,
        `شكراً لاختيارك Maison Luxe ✦`,
      ]
        .filter((line) => line !== null)
        .join("\n");

      const encodedMsg = encodeURIComponent(msg);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;

      // حفظ الطلب في localStorage للصفحة التأكيد
      localStorage.setItem(
        "last-order",
        JSON.stringify({
          id: orderId,
          customer_name: fullName,
          customer_phone: phone,
          customer_email: email,
          governorate,
          shipping_address: address,
          order_notes: notes,
          payment_method: paymentMethod,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
          })),
          subtotal: totalPrice,
          shipping: shippingCost,
          discount,
          total: finalTotal,
        })
      );

      // افتح واتساب في tab جديد
      window.open(whatsappUrl, "_blank");

      // امسح الكارت وروح لصفحة التأكيد
      clearCart();
      router.push("/order-confirmation");
    } catch (err) {
      setErrorMessage("حدث خطأ. حاول تاني.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div ref={pageRef} style={{ background: "var(--black)", color: "var(--white)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero Header */}
      <section className="checkout-title-section" style={{
        background: "linear-gradient(135deg, var(--dark-3) 0%, var(--dark) 100%)",
        padding: "140px 60px 50px",
        borderBottom: "1px solid rgba(220,202,187,0.12)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <span className="section-tag" style={{ color: "var(--gold)", letterSpacing: "0.3em" }}>✦ Secure checkout</span>
          <h1 style={{
            fontFamily: "var(--font-title)",
            fontSize: "clamp(2rem, 5vw, 4.5rem)",
            textTransform: "uppercase",
            marginTop: "10px",
            lineHeight: 1.1
          }}>
            Complete Your Order
          </h1>
        </div>
      </section>

      <section style={{ padding: "60px 60px 120px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "40px" }} className="checkout-grid">
          
          {/* Left Column: Shipping & Payment Details */}
          <div className="checkout-col-left">
            <form onSubmit={handleSubmitOrder} style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              
              {/* Shipping Address Card */}
              <div className="glass-panel" style={{ padding: "36px", borderRadius: "var(--radius-lg)" }}>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.3rem", marginBottom: "24px", color: "var(--gold)", borderBottom: "1px solid rgba(220,202,187,0.1)", paddingBottom: "12px" }}>
                  1. Delivery Information
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Eslam Raafat"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        required
                        className="form-input"
                        placeholder="yourname@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        className="form-input"
                        placeholder="e.g. 01012345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
                    <div className="form-group">
                      <label className="form-label">Governorate *</label>
                      <select
                        className="form-input"
                        value={governorate}
                        onChange={(e) => setGovernorate(e.target.value)}
                        style={{ background: "var(--dark)" }}
                      >
                        <option value="Cairo">Cairo</option>
                        <option value="Giza">Giza</option>
                        <option value="Alexandria">Alexandria</option>
                        <option value="Qalyubia">Qalyubia</option>
                        <option value="Gharbia">Gharbia</option>
                        <option value="Dakahlia">Dakahlia</option>
                        <option value="Other">Other Governorate</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Detailed Address *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Street, Building, Apartment No."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Order Notes (Optional)</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Any specific delivery instructions, gift notes, or customization preferences..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="glass-panel" style={{ padding: "36px", borderRadius: "var(--radius-lg)" }}>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.3rem", marginBottom: "24px", color: "var(--gold)", borderBottom: "1px solid rgba(220,202,187,0.1)", paddingBottom: "12px" }}>
                  2. Payment Method
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <label style={{
                    display: "flex", alignItems: "center", gap: "16px", padding: "20px",
                    background: paymentMethod === "cod" ? "rgba(220,202,187,0.08)" : "rgba(255,255,255,0.02)",
                    border: paymentMethod === "cod" ? "1px solid var(--gold)" : "1px solid rgba(220,202,187,0.1)",
                    borderRadius: "12px", cursor: "pointer", transition: "var(--transition)"
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      style={{ accentColor: "var(--gold)", transform: "scale(1.2)" }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--white)", fontSize: "0.95rem" }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--white-muted)", marginTop: "4px" }}>Pay with cash upon receiving your luxury box.</div>
                    </div>
                  </label>

                  <label style={{
                    display: "flex", alignItems: "center", gap: "16px", padding: "20px",
                    background: paymentMethod === "card" ? "rgba(220,202,187,0.08)" : "rgba(255,255,255,0.02)",
                    border: paymentMethod === "card" ? "1px solid var(--gold)" : "1px solid rgba(220,202,187,0.1)",
                    borderRadius: "12px", cursor: "pointer", transition: "var(--transition)"
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      style={{ accentColor: "var(--gold)", transform: "scale(1.2)" }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--white)", fontSize: "0.95rem" }}>Credit / Debit Card</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--white-muted)", marginTop: "4px" }}>Pay securely online with Visa, Mastercard, or ValU.</div>
                    </div>
                  </label>
                </div>
              </div>

              {errorMessage && (
                <div style={{ background: "rgba(220,50,50,0.1)", border: "1px solid #e05252", padding: "16px", borderRadius: "12px", color: "#e05252", fontSize: "0.9rem" }}>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: "100%", justifyContent: "center", padding: "20px", fontSize: "1rem" }}
              >
                {isSubmitting ? "Processing Your Order..." : `Place Order · ${finalTotal.toLocaleString()} EGP`}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-col-right">
            <div className="glass-panel" style={{ padding: "36px", borderRadius: "var(--radius-lg)", position: "sticky", top: "120px" }}>
              <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.3rem", marginBottom: "24px", borderBottom: "1px solid rgba(220,202,187,0.1)", paddingBottom: "16px" }}>
                Order Summary
              </h3>

              {/* Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxHeight: "280px", overflowY: "auto", marginBottom: "28px", paddingRight: "8px" }}>
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ width: "60px", height: "75px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(220,202,187,0.15)", flexShrink: 0 }}>
                      <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontFamily: "var(--font-title)", fontSize: "0.95rem", color: "var(--white)" }}>{item.name}</h4>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "0.8rem", color: "var(--white-muted)" }}>
                        <span>{item.size} x {item.quantity}</span>
                        <span style={{ color: "var(--gold)", fontWeight: 500 }}>{(item.price * item.quantity).toLocaleString()} EGP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Box */}
              <div style={{ marginBottom: "28px", padding: "20px", background: "rgba(220,202,187,0.03)", border: "1px solid rgba(220,202,187,0.1)", borderRadius: "12px" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Promo Code</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="Enter code (e.g. LUXE10)"
                    className="form-input"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    style={{ padding: "10px 16px", fontSize: "0.85rem" }}
                  />
                  <button type="button" onClick={handleApplyPromo} className="btn-gold-outline" style={{ padding: "10px 20px", fontSize: "0.8rem" }}>
                    Apply
                  </button>
                </div>
              </div>

              {/* Price calculations */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid rgba(220,202,187,0.1)", paddingTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--white-muted)" }}>
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{totalPrice.toLocaleString()} EGP</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#4caf50" }}>
                    <span>Discount (10% Off)</span>
                    <span>-{discount.toLocaleString()} EGP</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--white-muted)" }}>
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : `${shippingCost} EGP`}</span>
                </div>
                <div style={{ borderTop: "1px solid rgba(220,202,187,0.12)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-title)", fontSize: "1rem" }}>Total</span>
                  <span style={{ fontFamily: "var(--font-serif)", color: "var(--gold)", fontSize: "1.6rem", fontWeight: 700 }}>
                    {finalTotal.toLocaleString()} EGP
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
