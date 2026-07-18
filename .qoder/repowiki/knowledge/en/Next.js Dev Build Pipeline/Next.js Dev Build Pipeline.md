---
kind: build_system
name: Next.js Dev Build Pipeline
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - next.config.ts
    - tsconfig.json
    - postcss.config.mjs
    - eslint.config.mjs
---

This project uses the standard Next.js development build pipeline with no custom build orchestration. The entire build system is defined through a small set of configuration files:

- package.json defines four npm scripts — dev (Next dev server), build (next build for production optimization), start (next start to serve the production build), and lint (eslint). There are no custom pre/post hooks, no Makefile, no shell wrappers, and no CI/CD pipeline files in the repository.
- next.config.ts configures only one runtime behavior: allowing Next.js Image to fetch from *.supabase.co remote patterns. No custom webpack, Turbopack, or output overrides are present.
- tsconfig.json sets strict TypeScript mode, ES2017 target, bundler-style module resolution, path aliases (@/* to root), and includes the Next.js compiler plugin. Incremental builds are enabled via .next/types.
- postcss.config.mjs wires Tailwind CSS v4 via @tailwindcss/postcss; there is no separate tailwind.config.js because Tailwind v4 uses CSS-first configuration.
- eslint.config.mjs composes eslint-config-next/core-web-vitals and eslint-config-next/typescript, overriding default ignores to include .next/**, out/**, build/**, and next-env.d.ts.

There is no Dockerfile, no containerization, no cross-compilation, no versioning strategy beyond the 0.1.0 in package.json, and no release automation. Development and deployment are expected to be driven by Next.js built-in CLI commands on any Node.js environment.