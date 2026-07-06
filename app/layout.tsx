import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "./context/ProductContext";
import { CartProvider } from "./context/CartContext";
import { SiteContentProvider } from "./context/SiteContentContext";
import { LanguageProvider } from "./context/LanguageContext";

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
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <SiteContentProvider>
          <LanguageProvider>
            <CartProvider>
              <ProductProvider>{children}</ProductProvider>
            </CartProvider>
          </LanguageProvider>
        </SiteContentProvider>
      </body>
    </html>
  );
}
