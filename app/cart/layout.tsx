import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/cart",
  title: "Your Cart",
  description:
    "Review the fragrances in your Nubia shopping cart.",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
