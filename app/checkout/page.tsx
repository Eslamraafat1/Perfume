"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/app/context/CartContext";
import gsap from "gsap";

const INSTAPAY_NUMBER = "01069166033";

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
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "instapay">("cod");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [instapayConfirmed, setInstapayConfirmed] = useState(false);
  const [depositRef, setDepositRef] = useState("");

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

  // Animate InstaPay panel when selected
  useEffect(() => {
    if (paymentMethod === "instapay") {
      const panel = document.getElementById("instapay-panel");
      if (panel) {
        gsap.fromTo(
          panel,
          { opacity: 0, y: 20, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)" }
        );
      }
    }
  }, [paymentMethod]);

  const shippingCost = totalPrice >= 1500 ? 0 : 80;
  const finalTotal = totalPrice + shippingCost - discount;
  const depositAmount = Math.ceil(finalTotal * 0.3); // 30% deposit

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "LUXE10") {
      setDiscount(Math.round(totalPrice * 0.1));
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid promo code");
      setDiscount(0);
    }
  };

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(INSTAPAY_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const WHATSAPP_NUMBER = "201509919280";

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      setErrorMessage("من فضلك اكمل البيانات المطلوبة (الاسم، التليفون، العنوان).");
      return;
    }
    if (paymentMethod === "instapay" && !instapayConfirmed) {
      setErrorMessage("من فضلك أكد إنك دفعت الديبوزت عن طريق InstaPay.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const orderId = "ML-" + Math.floor(100000 + Math.random() * 900000);

      const itemsText = items
        .map(
          (item, i) =>
            `${i + 1}. ${item.name}${item.size ? ` (${item.size})` : ""} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} EGP`
        )
        .join("\n");

      const paymentLabel =
        paymentMethod === "cod"
          ? "الدفع عند الاستلام"
          : paymentMethod === "instapay"
          ? `InstaPay Deposit — ${depositAmount.toLocaleString()} EGP${depositRef ? ` | Ref: ${depositRef}` : ""}`
          : "بطاقة ائتمان";

      const msg = [
        `🌹 *طلب جديد — Nubia*`,
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
        paymentMethod === "instapay" ? `💳 ديبوزت InstaPay: ${depositAmount.toLocaleString()} EGP` : null,
        ``,
        `💳 طريقة الدفع: ${paymentLabel}`,
        `━━━━━━━━━━━━━━━━━━`,
        `شكراً لاختيارك Nubia ✦`,
      ]
        .filter((line) => line !== null)
        .join("\n");

      const encodedMsg = encodeURIComponent(msg);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;

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

      window.open(whatsappUrl, "_blank");
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

      <style>{`
        /* ── InstaPay Keyframes ── */
        @keyframes ip-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,200,180,0.5); }
          50%       { box-shadow: 0 0 0 18px rgba(0,200,180,0); }
        }
        @keyframes ip-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ip-float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-6px) rotate(2deg); }
        }
        @keyframes ip-orbit {
          from { transform: rotate(0deg) translateX(28px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(28px) rotate(-360deg); }
        }
        @keyframes ip-spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ip-badge-pop {
          0%   { transform: scale(0.7) rotate(-10deg); opacity: 0; }
          80%  { transform: scale(1.1) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes ip-dot-blink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1; transform: scale(1.2); }
        }
        @keyframes ip-border-glow {
          0%, 100% { border-color: rgba(0,200,180,0.5); box-shadow: 0 0 10px rgba(0,200,180,0.15); }
          50%       { border-color: rgba(0,200,180,1);   box-shadow: 0 0 28px rgba(0,200,180,0.4); }
        }
        @keyframes checkmark-draw {
          from { stroke-dashoffset: 60; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes copy-success {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }

        /* Payment option card */
        .payment-option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(220,202,187,0.1);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .payment-option:hover {
          background: rgba(220,202,187,0.05);
          border-color: rgba(220,202,187,0.25);
          transform: translateY(-1px);
        }
        .payment-option.active-gold {
          background: rgba(220,202,187,0.08);
          border: 1px solid var(--gold);
        }
        .payment-option.active-instapay {
          background: rgba(0,200,180,0.07);
          border: 1px solid #00c8b4;
          animation: ip-border-glow 2.5s ease-in-out infinite;
        }

        /* InstaPay Card Logo badge */
        .ip-logo-badge {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: linear-gradient(135deg, #00c8b4 0%, #7c3aed 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          animation: ip-pulse 2.4s ease-in-out infinite;
          overflow: hidden;
        }
        .ip-logo-badge img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 14px;
        }

        /* InstaPay Panel */
        .instapay-panel {
          margin-top: 16px;
          padding: 28px;
          background: linear-gradient(145deg, rgba(0,200,180,0.07) 0%, rgba(124,58,237,0.07) 100%);
          border: 1px solid rgba(0,200,180,0.2);
          border-radius: 18px;
          position: relative;
          overflow: hidden;
        }
        .instapay-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(0,200,180,0.06) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: ip-shimmer 3s linear infinite;
          pointer-events: none;
        }

        /* Phone number display */
        .ip-phone-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(0,200,180,0.35);
          border-radius: 12px;
          padding: 16px 20px;
          margin: 16px 0;
          backdrop-filter: blur(10px);
        }
        .ip-phone-number {
          font-family: 'Courier New', monospace;
          font-size: clamp(1.1rem, 3vw, 1.5rem);
          font-weight: 700;
          letter-spacing: 0.15em;
          background: linear-gradient(90deg, #00c8b4, #7c3aed, #00c8b4);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ip-shimmer 2.5s linear infinite;
        }
        .ip-copy-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #00c8b4, #7c3aed);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .ip-copy-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 20px rgba(0,200,180,0.4);
        }
        .ip-copy-btn.copied {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          animation: copy-success 0.3s ease;
        }

        /* Deposit amount badge */
        .ip-deposit-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(0,200,180,0.15), rgba(124,58,237,0.15));
          border: 1px solid rgba(0,200,180,0.4);
          border-radius: 50px;
          font-size: 0.85rem;
          color: #00c8b4;
          margin-bottom: 8px;
          animation: ip-badge-pop 0.4s ease-out;
        }

        /* Steps indicator */
        .ip-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 20px 0;
        }
        .ip-step {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .ip-step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00c8b4, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
          position: relative;
        }
        .ip-step-num::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1px solid rgba(0,200,180,0.4);
        }

        /* Confirm checkbox area */
        .ip-confirm-area {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: rgba(0,200,180,0.06);
          border: 1px solid rgba(0,200,180,0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 16px;
        }
        .ip-confirm-area:hover {
          background: rgba(0,200,180,0.1);
          border-color: rgba(0,200,180,0.5);
        }
        .ip-confirm-area.confirmed {
          background: rgba(0,200,180,0.12);
          border-color: #00c8b4;
        }
        .ip-checkbox {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 2px solid rgba(0,200,180,0.6);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .ip-checkbox.checked {
          background: linear-gradient(135deg, #00c8b4, #7c3aed);
          border-color: transparent;
        }

        /* Orbiting dots decoration */
        .ip-orb-container {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          pointer-events: none;
        }
        .ip-orb-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px dashed rgba(0,200,180,0.2);
          animation: ip-spin-slow 8s linear infinite;
        }
        .ip-orb-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00c8b4;
          top: 50%;
          left: 50%;
          margin: -3px 0 0 -3px;
          animation: ip-orbit 8s linear infinite;
        }
        .ip-orb-dot:nth-child(3) {
          animation: ip-orbit 8s linear infinite reverse;
          background: #7c3aed;
          animation-delay: -4s;
        }

        /* Loading dots */
        .ip-loading-dots span {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00c8b4;
          margin: 0 3px;
          animation: ip-dot-blink 1.2s ease-in-out infinite;
        }
        .ip-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ip-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        /* Place order button InstaPay style */
        .btn-instapay {
          background: linear-gradient(135deg, #00c8b4 0%, #7c3aed 100%);
          box-shadow: 0 8px 32px rgba(0,200,180,0.35);
        }
        .btn-instapay:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,200,180,0.5);
        }

        /* Responsive */
        @media (max-width: 600px) {
          .ip-phone-display { flex-direction: column; align-items: flex-start; }
          .ip-copy-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* Hero Header */}
      <section className="responsive-pad checkout-title-section" style={{
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

      <section className="responsive-pad" style={{ padding: "60px 60px 120px", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="checkout-grid">

          {/* Left Column */}
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

                  <div className="checkout-form-row-2">
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

                  <div className="checkout-form-row-1-2">
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
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                  {/* COD Option */}
                  <label
                    className={`payment-option ${paymentMethod === "cod" ? "active-gold" : ""}`}
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      style={{ accentColor: "var(--gold)", transform: "scale(1.2)", flexShrink: 0 }}
                    />
                    <div style={{
                      width: "46px", height: "46px", borderRadius: "12px",
                      background: "rgba(220,202,187,0.1)", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0
                    }}>
                      💵
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--white)", fontSize: "0.95rem" }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--white-muted)", marginTop: "4px" }}>Pay with cash upon receiving your luxury box.</div>
                    </div>
                  </label>

                  {/* Card Option */}
                  <label
                    className={`payment-option ${paymentMethod === "card" ? "active-gold" : ""}`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      style={{ accentColor: "var(--gold)", transform: "scale(1.2)", flexShrink: 0 }}
                    />
                    <div style={{
                      width: "46px", height: "46px", borderRadius: "12px",
                      background: "rgba(220,202,187,0.1)", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0
                    }}>
                      💳
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--white)", fontSize: "0.95rem" }}>Credit / Debit Card</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--white-muted)", marginTop: "4px" }}>Pay securely online with Visa, Mastercard, or ValU.</div>
                    </div>
                  </label>

                  {/* ── InstaPay Option ── */}
                  <label
                    className={`payment-option ${paymentMethod === "instapay" ? "active-instapay" : ""}`}
                    onClick={() => setPaymentMethod("instapay")}
                    style={{ flexDirection: "column", alignItems: "flex-start", gap: 0 }}
                  >
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%" }}>
                      <input
                        type="radio"
                        name="payment"
                        value="instapay"
                        checked={paymentMethod === "instapay"}
                        onChange={() => setPaymentMethod("instapay")}
                        style={{ accentColor: "#00c8b4", transform: "scale(1.2)", flexShrink: 0 }}
                      />
                      <div className="ip-logo-badge">
                        <img src="/unnamed.webp" alt="InstaPay" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, color: "#00c8b4", fontSize: "1rem" }}>InstaPay</span>
                          <span style={{
                            padding: "2px 10px",
                            background: "linear-gradient(90deg,#00c8b4,#7c3aed)",
                            borderRadius: "20px",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            color: "white",
                            letterSpacing: "0.05em"
                          }}>
                            ⚡ INSTANT
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "rgba(0,200,180,0.7)", marginTop: "4px" }}>
                          ادفع ديبوزت 30% عبر InstaPay · الباقي عند الاستلام
                        </div>
                      </div>
                    </div>

                    {/* Expanded Panel */}
                    {paymentMethod === "instapay" && (
                      <div id="instapay-panel" className="instapay-panel" style={{ width: "100%", marginTop: "22px" }} onClick={(e) => e.stopPropagation()}>
                        {/* Orbiting decoration */}
                        <div className="ip-orb-container">
                          <div className="ip-orb-ring" />
                          <div className="ip-orb-dot" />
                          <div className="ip-orb-dot" />
                        </div>

                        {/* Deposit amount */}
                        <div style={{ marginBottom: "4px" }}>
                          <div className="ip-deposit-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#00c8b4"/>
                            </svg>
                            مبلغ الديبوزت المطلوب
                          </div>
                          <div style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, color: "white", lineHeight: 1.2 }}>
                            <span style={{
                              background: "linear-gradient(90deg, #00c8b4, #a78bfa)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text"
                            }}>
                              {depositAmount.toLocaleString()}
                            </span>
                            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "1rem", marginLeft: "6px" }}>EGP</span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
                            (30% من الإجمالي — الباقي {(finalTotal - depositAmount).toLocaleString()} EGP عند الاستلام)
                          </div>
                        </div>

                        {/* Steps */}
                        <div className="ip-steps">
                          <div className="ip-step">
                            <div className="ip-step-num">1</div>
                            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.75)", paddingTop: "4px" }}>
                              افتح تطبيق InstaPay أو أي بنك بيدعمه
                            </div>
                          </div>
                          <div className="ip-step">
                            <div className="ip-step-num">2</div>
                            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.75)", paddingTop: "4px" }}>
                              حوّل <strong style={{ color: "#00c8b4" }}>{depositAmount.toLocaleString()} EGP</strong> على الرقم التالي
                            </div>
                          </div>
                          <div className="ip-step">
                            <div className="ip-step-num">3</div>
                            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.75)", paddingTop: "4px" }}>
                              اكد الدفع بالأسفل وأكمل الطلب — هنتواصل معاك فوراً ✦
                            </div>
                          </div>
                        </div>

                        {/* Phone Number */}
                        <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#00c8b4", marginBottom: "6px", opacity: 0.8 }}>
                          رقم InstaPay
                        </div>
                        <div className="ip-phone-display">
                          <span className="ip-phone-number">{INSTAPAY_NUMBER}</span>
                          <button
                            type="button"
                            className={`ip-copy-btn ${copied ? "copied" : ""}`}
                            onClick={handleCopyNumber}
                          >
                            {copied ? (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ strokeDasharray: 60, strokeDashoffset: 0, animation: "checkmark-draw 0.35s ease forwards" }} />
                                </svg>
                                تم النسخ!
                              </>
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="white" strokeWidth="2"/>
                                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="white" strokeWidth="2"/>
                                </svg>
                                انسخ الرقم
                              </>
                            )}
                          </button>
                        </div>

                        {/* Optional ref input */}
                        <div style={{ marginTop: "12px" }}>
                          <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "6px" }}>
                            رقم المرجع / Reference (اختياري)
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="مثال: TXN123456789"
                            value={depositRef}
                            onChange={(e) => setDepositRef(e.target.value)}
                            style={{ fontSize: "0.85rem", borderColor: "rgba(0,200,180,0.3)", background: "rgba(0,0,0,0.3)" }}
                          />
                        </div>

                        {/* Confirm checkbox */}
                        <div
                          className={`ip-confirm-area ${instapayConfirmed ? "confirmed" : ""}`}
                          onClick={() => setInstapayConfirmed(!instapayConfirmed)}
                        >
                          <div className={`ip-checkbox ${instapayConfirmed ? "checked" : ""}`}>
                            {instapayConfirmed && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                  style={{ strokeDasharray: 60, strokeDashoffset: 0, animation: "checkmark-draw 0.4s ease forwards" }} />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.88rem", color: instapayConfirmed ? "#00c8b4" : "rgba(255,255,255,0.7)" }}>
                              ✅ أنا دفعت الديبوزت {depositAmount.toLocaleString()} EGP عبر InstaPay
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "3px" }}>
                              بتأكيدك ده، الطلب هيتأكد وهنتواصل معاك لتأكيد باقي المبلغ عند الاستلام
                            </div>
                          </div>
                        </div>

                        {/* Live status */}
                        {instapayConfirmed && (
                          <div style={{
                            display: "flex", alignItems: "center", gap: "10px", marginTop: "14px",
                            padding: "10px 16px", background: "rgba(0,200,180,0.1)",
                            border: "1px solid rgba(0,200,180,0.3)", borderRadius: "10px"
                          }}>
                            <div className="ip-loading-dots">
                              <span /><span /><span />
                            </div>
                            <span style={{ fontSize: "0.82rem", color: "#00c8b4" }}>
                              جاهز للإرسال — اضغط على زر الطلب بالأسفل
                            </span>
                          </div>
                        )}
                      </div>
                    )}
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
                className={`btn-primary ${paymentMethod === "instapay" ? "btn-instapay" : ""}`}
                disabled={isSubmitting}
                style={{ width: "100%", justifyContent: "center", padding: "20px", fontSize: "1rem" }}
              >
                {isSubmitting ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="ip-loading-dots"><span /><span /><span /></span>
                    Processing Your Order...
                  </span>
                ) : paymentMethod === "instapay" ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
                    </svg>
                    تأكيد الطلب + InstaPay · {finalTotal.toLocaleString()} EGP
                  </span>
                ) : (
                  `Place Order · ${finalTotal.toLocaleString()} EGP`
                )}
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

                {/* InstaPay deposit summary box */}
                {paymentMethod === "instapay" && (
                  <div style={{
                    marginTop: "8px",
                    padding: "16px",
                    background: "linear-gradient(135deg, rgba(0,200,180,0.08), rgba(124,58,237,0.08))",
                    border: "1px solid rgba(0,200,180,0.25)",
                    borderRadius: "12px",
                    animation: "ip-badge-pop 0.4s ease-out"
                  }}>
                    <div style={{ fontSize: "0.75rem", color: "#00c8b4", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                      ⚡ InstaPay Breakdown
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>
                      <span>ديبوزت الآن (30%)</span>
                      <span style={{ color: "#00c8b4", fontWeight: 700 }}>{depositAmount.toLocaleString()} EGP</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                      <span>عند الاستلام (70%)</span>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{(finalTotal - depositAmount).toLocaleString()} EGP</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
