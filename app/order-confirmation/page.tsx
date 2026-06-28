"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import gsap from "gsap";

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<any>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("last-order");
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);

  // Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scale checkmark
      gsap.fromTo(
        ".success-badge",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
      );
      // Fade in texts
      gsap.fromTo(
        ".success-animate",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out", delay: 0.3 }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [order]);

  return (
    <div ref={pageRef} style={{ background: "var(--black)", color: "var(--white)", minHeight: "100vh" }}>
      <Navbar />

      <section style={{ padding: "160px 24px 100px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        
        {/* Success Badge */}
        <div className="success-badge" style={{
          width: "100px", height: "100px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 36px",
          boxShadow: "0 15px 40px rgba(220, 202, 187, 0.3)"
        }}>
          <span style={{ fontSize: "3rem", color: "var(--black)" }}>✓</span>
        </div>

        <h1 className="success-animate" style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          textTransform: "uppercase",
          marginBottom: "16px",
          color: "var(--gold)"
        }}>
          Thank You For Your Order
        </h1>

        <p className="success-animate" style={{ color: "var(--white-muted)", fontSize: "1rem", maxWidth: "500px", margin: "0 auto 40px", lineHeight: 1.8 }}>
          Your order has been received and is now being prepared in our climate-controlled maturation vault. A confirmation email has been sent.
        </p>

        {order && (
          <div className="success-animate glass-panel" style={{ padding: "36px", borderRadius: "var(--radius-lg)", textAlign: "left", marginBottom: "40px", border: "1px solid rgba(220, 202, 187, 0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(220, 202, 187, 0.1)", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Order ID</span>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 700, color: "var(--white)", marginTop: "4px" }}>{order.id}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Payment Method</span>
                <div style={{ fontSize: "1rem", fontWeight: 500, color: "var(--white)", marginTop: "4px" }}>
                  {order.payment_method === "cod" ? "Cash on Delivery" : "Credit Card"}
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "0.85rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Delivery Address</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--white-muted)", lineHeight: 1.6 }}>
                <strong>{order.customer_name}</strong><br />
                {order.shipping_address}, {order.governorate}, Egypt<br />
                Phone: {order.customer_phone}
              </p>
            </div>

            {/* Items List */}
            <div style={{ borderTop: "1px solid rgba(220, 202, 187, 0.08)", paddingTop: "20px", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "0.85rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Items ordered</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--white)" }}>
                      {item.name} <span style={{ color: "var(--white-muted)", fontSize: "0.8rem" }}>({item.size})</span> x {item.quantity}
                    </span>
                    <span style={{ color: "var(--gold)", fontFamily: "var(--font-serif)" }}>{(item.price * item.quantity).toLocaleString()} EGP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div style={{ borderTop: "1px solid rgba(220, 202, 187, 0.08)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--white-muted)" }}>
                <span>Subtotal</span>
                <span>{order.subtotal?.toLocaleString()} EGP</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#4caf50" }}>
                  <span>Discount</span>
                  <span>-{order.discount?.toLocaleString()} EGP</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--white-muted)" }}>
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "Free" : `${order.shipping} EGP`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 700, color: "var(--white)", borderTop: "1px solid rgba(220, 202, 187, 0.12)", paddingTop: "14px", marginTop: "4px" }}>
                <span>Total Amount Paid</span>
                <span style={{ color: "var(--gold)", fontFamily: "var(--font-serif)" }}>{order.total?.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>
        )}

        <div className="success-animate" style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link href="/products" className="btn-primary" style={{ textDecoration: "none" }}>
            Continue Shopping
          </Link>
          <Link href="/" className="btn-gold-outline" style={{ textDecoration: "none", padding: "16px 36px" }}>
            Go to Homepage
          </Link>
        </div>

      </section>

      <Footer />
    </div>
  );
}
