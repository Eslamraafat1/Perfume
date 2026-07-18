---
kind: error_handling
name: Ad-hoc try/catch with no centralized error system
category: error_handling
scope:
    - '**'
source_files:
    - app/api/upload/route.ts
    - lib/supabase.ts
    - app/context/CartContext.tsx
    - app/context/HeroSlidesContext.tsx
    - app/context/ProductContext.tsx
    - app/context/SiteContentContext.tsx
    - app/checkout/page.tsx
    - app/dashboard/page.tsx
---

This Next.js perfume e-commerce app has no centralized error handling architecture. Errors are handled locally and inconsistently across the codebase:

- **API routes**: `app/api/upload/route.ts` wraps each handler in a try/catch, returning `NextResponse.json({ error: ... }, { status })` for both validation failures (400) and Supabase upload errors (500). There is no shared error-response helper or custom error class.

- **React contexts** (`app/context/*.tsx`): Each context uses its own pattern — some swallow errors silently with empty `catch {}` blocks (e.g., `CartContext` localStorage read/write), others throw `new Error(error.message)` on Supabase errors and rely on callers to catch them (e.g., `HeroSlidesContext`, `ProductContext`, `SiteContentContext`). Context hooks like `useCart`, `useHeroSlides`, `useLanguage`, `useProducts`, `useSiteContent` all defensively `throw new Error("useX must be used inside XProvider")` when called outside their provider.

- **Pages/components**: `app/checkout/page.tsx` maintains local `errorMessage` state and sets it from try/catch blocks; `app/dashboard/page.tsx` sprinkles dozens of inline try/catch blocks around individual operations, throwing `new Error(...)` strings that bubble up without a global boundary.

- **Library layer**: `lib/supabase.ts` performs environment validation using try/catch around `new URL()` but otherwise just exports a configured client — no error wrapping or typed error propagation.

There is no dedicated `errors/` directory, no custom error classes, no error middleware, no `ErrorBoundary` component, and no convention for distinguishing recoverable vs. fatal errors. The only consistent pattern is that Supabase client calls return `{ data, error }` tuples which callers either check explicitly or unwrap into thrown `Error`s.