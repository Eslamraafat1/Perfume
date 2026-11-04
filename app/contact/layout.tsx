import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/contact",
  title: "Contact Us",
  description:
    "Get in touch with Nubia Fine Fragrances for orders, questions and personalised fragrance advice.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
