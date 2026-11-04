import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/products",
  title: "All Perfumes",
  description:
    "Browse the full Nubia collection of luxury perfumes — filter by fragrance family and gender, search by notes and sort by price.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
