import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/dashboard",
  title: "Admin Dashboard",
  description:
    "Nubia store administration.",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
