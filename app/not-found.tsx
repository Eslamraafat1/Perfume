import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div style={{ background: "var(--black)", color: "var(--white)", minHeight: "100vh" }}>
      <Navbar />
      <main
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "160px 20px 80px",
          gap: "20px",
        }}
      >
        <p style={{ color: "var(--gold)", letterSpacing: "0.3em", fontSize: "0.8rem" }}>404</p>
        <h1 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
          This Scent Has Faded
        </h1>
        <p style={{ color: "var(--white-muted)", maxWidth: "480px" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/products" className="btn-primary">
          Explore the Collection
        </Link>
      </main>
      <Footer />
    </div>
  );
}
