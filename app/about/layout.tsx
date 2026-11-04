import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/about",
  title: "About Nubia",
  description:
    "The essence of Nubia — premium niche fragrances that merge royal Eastern heritage with contemporary French sophistication.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
