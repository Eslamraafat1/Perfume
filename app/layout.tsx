import type { Metadata } from "next";
import { Bodoni_Moda, Inter, Amiri, Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "./context/ProductContext";
import { CartProvider } from "./context/CartContext";
import { SiteContentProvider } from "./context/SiteContentContext";
import { LanguageProvider } from "./context/LanguageContext";
import { HeroSlidesProvider } from "./context/HeroSlidesContext";
import FragranceFinderWidget from "@/components/FragranceFinderWidget";
import ScrollToTop from "@/components/ScrollToTop";
import GlobalRouteLoader from "@/components/GlobalRouteLoader";
import SplashCursor from "@/components/SplashCursor";
import ScratchGiftCard from "@/components/ScratchGiftCard";
import { SITE_URL, SITE_NAME, jsonLdScript } from "@/lib/site";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
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

const tajawal = Tajawal({
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  subsets: ["arabic"],
  variable: "--font-tajawal",
  display: "swap",
});

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nubia | Luxury Fine Fragrances & Niche Perfumes",
    template: "%s | Nubia Fine Fragrances",
  },
  description:
    "Discover Nubia's exclusive collection of luxury niche perfumes and extrait de parfum. Handcrafted with the world's rarest botanical essences and aged to perfection.",
  keywords: [
    "luxury perfume",
    "fine fragrance",
    "niche perfume",
    "oud perfume",
    "عطور نيش",
    "عطور فاخرة",
    "عطور مصر",
    "Nubia perfume",
    "extrait de parfum",
    "موقع عطور",
  ],
  authors: [{ name: "Nubia Maison Luxe" }],
  creator: "Nubia",
  publisher: "Nubia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nubia — Luxury Fine Fragrances & Perfumes",
    description:
      "Crafted from the world's rarest botanical essences. Explore our exclusive collection of luxury perfumes.",
    url: siteUrl,
    siteName: "Nubia Fragrances",
    images: [
      {
        url: "/perfume_hero.png",
        width: 1024,
        height: 1024,
        alt: "Nubia Luxury Fine Fragrance",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nubia — Luxury Fine Fragrances",
    description:
      "Crafted from the world's rarest botanical essences. Explore our exclusive luxury perfumes.",
    images: ["/perfume_hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google7ef3ee91e72fc7b6",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": `${siteUrl}/#store`,
  name: SITE_NAME,
  url: siteUrl,
  logo: `${siteUrl}/perfume_hero.png`,
  description:
    "Luxury niche perfumery offering extrait de parfum handcrafted from the world's rarest botanical essences.",
  currenciesAccepted: "EGP, USD",
  paymentAccepted: "Credit Card, Cash on Delivery",
  priceRange: "$$$",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: SITE_NAME,
  url: siteUrl,
  inLanguage: ["en", "ar"],
  publisher: { "@id": `${siteUrl}/#store` },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodoni.variable} ${inter.variable} ${amiri.variable} ${cairo.variable} ${tajawal.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd) }}
        />
        <SiteContentProvider>
          <LanguageProvider>
            <CartProvider>
              <HeroSlidesProvider>
                <ProductProvider>
                  {children}
                  <ScrollToTop />
                  <FragranceFinderWidget />
                  <GlobalRouteLoader />
                  <SplashCursor RAINBOW_MODE={false} COLOR="#a89558" />
                  <ScratchGiftCard />
                </ProductProvider>
              </HeroSlidesProvider>
            </CartProvider>
          </LanguageProvider>
        </SiteContentProvider>
      </body>
    </html>
  );
}
