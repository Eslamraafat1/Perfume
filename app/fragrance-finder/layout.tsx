import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/fragrance-finder",
  title: "Fragrance Finder",
  description:
    "Answer a few questions and let the Nubia Fragrance Finder match you with your signature scent.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
