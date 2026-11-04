import type { Metadata } from "next";
import { SITE_NAME } from "./site";

export const DEFAULT_OG_IMAGE = {
  url: "/perfume_hero.png",
  width: 1024,
  height: 1024,
  alt: "Nubia Luxury Fine Fragrance",
};

interface PageMetaInput {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
}

/**
 * Per-route metadata: self-referencing canonical + full Open Graph/Twitter block
 * (child `openGraph` objects replace the parent's, so the image is repeated here).
 */
export function pageMetadata({ path, title, description, noindex }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      images: [DEFAULT_OG_IMAGE],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
