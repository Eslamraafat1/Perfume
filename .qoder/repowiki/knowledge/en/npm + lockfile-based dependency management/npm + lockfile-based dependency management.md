---
kind: dependency_management
name: npm + lockfile-based dependency management
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - .gitignore
---

This Next.js project uses npm as its package manager with a committed `package-lock.json` (lockfileVersion 3) to pin the full transitive dependency tree. There is no vendoring, private registry, or custom `.npmrc`; all packages resolve from the public npm registry (`https://registry.npmjs.org/`).

**Manifest and scripts** — `package.json` declares runtime dependencies (`next`, `react`, `react-dom`, `@supabase/supabase-js`, `gsap`) and dev-only tooling (`typescript`, `eslint`, `tailwindcss`, `@tailwindcss/postcss`, type packages). Scripts are thin wrappers around Next CLI commands (`dev`, `build`, `start`, `lint`).

**Lockfile strategy** — `package-lock.json` is tracked in version control, ensuring deterministic installs across CI and local machines. No `node_modules/` directory is committed (ignored via `.gitignore`).

**No vendor/pnp/yarn/pnpm/bun** — The `.gitignore` contains generic templates for Yarn/PnP/pnpm but none of those tools are used; only npm artifacts appear in the repo.

**Conventions observed**
- Runtime vs. build-time deps are split between `dependencies` and `devDependencies`.
- Versions use caret ranges (`^2.x`, `^4`, `^5`) for dev tooling while core framework packages (`next`, `react`, `react-dom`, `eslint-config-next`) are pinned to exact versions to keep the stack coherent.
- No private registries, scoped auth tokens, or `overrides`/`resolutions` fields are present.