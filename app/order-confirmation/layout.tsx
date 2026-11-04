import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/order-confirmation",
  title: "Order Confirmation",
  description:
    "Your Nubia order has been received.",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
