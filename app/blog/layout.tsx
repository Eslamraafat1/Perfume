import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/blog",
  title: "Fragrance Journal",
  description:
    "The Nubia fragrance journal: scent layering, fragrance families, oud in modern niche perfumery, sillage and longevity.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
