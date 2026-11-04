import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/category",
  title: "Fragrance Collections",
  description:
    "Explore Nubia fragrance collections for him, for her, unisex and oriental scents.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
