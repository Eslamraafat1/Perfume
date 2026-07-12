import type { Metadata } from "next";
import { Playfair_Display, Inter, Amiri, Cairo } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "./context/ProductContext";
import { CartProvider } from "./context/CartContext";
import { SiteContentProvider } from "./context/SiteContentContext";
import { LanguageProvider } from "./context/LanguageContext";
import { HeroSlidesProvider } from "./context/HeroSlidesContext";
import FragranceFinderWidget from "@/components/FragranceFinderWidget";
import ScrollToTop from "@/components/ScrollToTop";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-amiri",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nubia — Fine Fragrances",
  description:
    "Discover our exclusive collection of luxury perfumes. Each fragrance is a masterpiece crafted from the world's finest ingredients.",
  keywords: "luxury perfume, fine fragrance, oud, rose, niche perfume",
  openGraph: {
    title: "Nubia — Fine Fragrances",
    description: "Discover our exclusive collection of luxury perfumes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${amiri.variable} ${cairo.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SiteContentProvider>
          <LanguageProvider>
            <CartProvider>
              <HeroSlidesProvider>
                <ProductProvider>
                  {children}
                  <ScrollToTop />
                  <FragranceFinderWidget />
                </ProductProvider>
              </HeroSlidesProvider>
            </CartProvider>
          </LanguageProvider>
        </SiteContentProvider>
      </body>
    </html>
  );
}
