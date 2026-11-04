import { cache } from "react";
import type { Metadata } from "next";
import { loadProduct } from "@/lib/catalogue";
import { SITE_URL, SITE_NAME, jsonLdScript } from "@/lib/site";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import type { Product } from "@/app/context/ProductContext";

/**
 * Server layout for the (client-rendered) product page: it fetches the product
 * once on the server to emit per-product <title>, canonical, Open Graph tags and
 * Product + BreadcrumbList JSON-LD, so search engines get them in the initial HTML.
 * If Supabase is not configured or unreachable, the demo catalogue is used (lib/catalogue.ts).
 */
const getProduct = cache(async (id: string): Promise<Product | null> => {
  try {
    return (await loadProduct(id)).product;
  } catch {
    return null;
  }
});

function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const path = `/product/${id}`;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Fragrance",
      alternates: { canonical: path },
    };
  }

  const description = truncate(product.description || `${product.name} by Nubia.`);
  const image = product.image_url
    ? { url: product.image_url, alt: product.name }
    : DEFAULT_OG_IMAGE;

  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      images: [image],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: [image.url],
    },
  };
}

function buildOffers(product: Product, url: string) {
  const prices = (product.sizes ?? [])
    .map((s) => Number(s.price))
    .filter((p) => Number.isFinite(p) && p > 0);

  if (prices.length > 1) {
    return {
      "@type": "AggregateOffer",
      priceCurrency: "EGP",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      url,
    };
  }
  return {
    "@type": "Offer",
    priceCurrency: "EGP",
    price: prices[0] ?? Number(product.price),
    url,
    seller: { "@id": `${SITE_URL}/#store` },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  const url = `${SITE_URL}/product/${id}`;

  const jsonLd = product
    ? [
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${url}#product`,
          name: product.name,
          description: truncate(product.description || product.name, 500),
          image: [product.image_url, ...(product.images ?? [])].filter(Boolean),
          url,
          brand: { "@type": "Brand", name: "Nubia" },
          ...(product.category ? { category: product.category } : {}),
          offers: buildOffers(product, url),
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
            { "@type": "ListItem", position: 3, name: product.name, item: url },
          ],
        },
      ]
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
