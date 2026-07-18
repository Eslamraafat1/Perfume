---
kind: configuration_system
name: Environment-based Configuration with Fallback Defaults
category: configuration_system
scope:
    - '**'
source_files:
    - lib/supabase.ts
    - app/api/upload/route.ts
    - next.config.ts
    - package.json
    - README.md
---

This Next.js application uses a minimal, environment-variable-driven configuration approach centered on .env.local files and process.env, with built-in fallback defaults for development convenience.

What system/approach is used
- No dedicated config library or schema validator is used. Configuration is loaded directly from Node's process.env.
- The project follows the standard Next.js convention of using .env.local (ignored via .gitignore) for local secrets and settings.
- Hardcoded fallback credentials are baked into the source so the app runs out-of-the-box without any setup.

Key files and packages
- lib/supabase.ts: central Supabase client initialization; reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, validates them, and falls back to a shared demo Supabase instance when placeholders are detected.
- app/api/upload/route.ts: server-side upload route that re-reads the same env vars and applies identical placeholder detection plus fallback logic inline.
- next.config.ts: static Next.js configuration declaring allowed remote image hosts (*.supabase.co).
- package.json: declares runtime dependencies (@supabase/supabase-js, next, react) and dev tooling; no config-related scripts beyond standard dev/build/start.
- README.md documents the required .env.local variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.

Architecture and conventions
- All external service credentials flow through two environment variables with the NEXT_PUBLIC_ prefix, making them available in both client and server code paths.
- Placeholder detection is done by string matching against known dummy values (placeholder-url-please-set-in-env, your-supabase-url, placeholder-anon-key, your-anon-key-here) rather than strict validation.
- When env vars are missing or contain placeholders, the code logs an informational console message and substitutes a public demo Supabase project URL and publishable key.
- The dashboard page (app/dashboard/page.tsx) surfaces a UI warning when these variables are not configured, guiding users to update .env.local.

Rules developers should follow
- Always set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local before running locally; never commit real secrets.
- Do not add new top-level config files — keep all runtime configuration in environment variables consumed via process.env.
- If introducing new services, follow the existing pattern: read from process.env, detect placeholder values, log a warning, and fall back to a safe default only if appropriate.
- Avoid hardcoding additional secrets in source; use the same env-var plus placeholder-detection plus fallback pattern consistently across client and server modules.