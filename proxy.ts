import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/supabase-config";

/**
 * Server-side gate for the admin area (/dashboard/*).
 *
 * - Refreshes the Supabase Auth session cookies (the @supabase/ssr pattern).
 * - Verifies the session JWT (`auth.getClaims()`); without a valid session every
 *   /dashboard route redirects to /dashboard/login.
 * - Demo mode (Supabase not configured): there is nothing to sign in to, so the
 *   dashboard renders a read-only notice instead (see app/dashboard/page.tsx).
 *
 * This is the first line of defence only. Admin rights are checked again in the
 * dashboard (public.is_admin()) and, authoritatively, by Row Level Security on
 * every write and by /api/upload.
 */
export async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/dashboard/login";

  if (!supabaseConfig) {
    if (isLoginPage) return redirectTo(request, "/dashboard");
    return withNoIndex(NextResponse.next());
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  let signedIn = false;
  try {
    const { data } = await supabase.auth.getClaims();
    signedIn = Boolean(data?.claims?.sub);
  } catch {
    signedIn = false; // Auth server unreachable → treat as signed out.
  }

  if (!signedIn && !isLoginPage) {
    const target = redirectTo(request, "/dashboard/login");
    response.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
    return target;
  }
  if (signedIn && isLoginPage) {
    const target = redirectTo(request, "/dashboard");
    response.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
    return target;
  }
  return withNoIndex(response);
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return withNoIndex(NextResponse.redirect(url));
}

function withNoIndex(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
