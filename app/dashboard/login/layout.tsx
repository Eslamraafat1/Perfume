import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/dashboard/login",
  title: "Admin Sign In",
  description: "Sign in to the Nubia store administration.",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
