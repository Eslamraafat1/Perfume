import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/checkout",
  title: "Checkout",
  description:
    "Complete your Nubia order.",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
