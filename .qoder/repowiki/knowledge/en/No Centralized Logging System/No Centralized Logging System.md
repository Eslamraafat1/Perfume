---
kind: logging_system
name: No Centralized Logging System
category: logging_system
scope:
    - '**'
source_files:
    - lib/supabase.ts
    - app/api/upload/route.ts
---

This repository does not implement a centralized logging system. All log output uses the built-in Node.js/browser `console` API directly scattered across components and API routes — specifically `console.log`, `console.warn`, and `console.error` calls in `lib/supabase.ts`, `app/api/upload/route.ts`, `app/checkout/page.tsx`, `app/context/ProductContext.tsx`, `app/context/SiteContentContext.tsx`, and `app/product/[id]/page.tsx`. There is no dedicated logger module, no structured logging library (e.g., pino, winston, bunyan), no log-level configuration, no log rotation or sink setup, and no conventions around log field shapes or severity classification beyond ad-hoc string messages. The `.gitignore` only excludes standard npm/yarn/pnpm debug logs; nothing is configured to capture application logs.