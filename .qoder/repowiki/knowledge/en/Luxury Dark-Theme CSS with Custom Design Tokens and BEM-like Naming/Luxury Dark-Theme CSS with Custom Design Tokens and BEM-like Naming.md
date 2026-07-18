---
kind: frontend_style
name: Luxury Dark-Theme CSS with Custom Design Tokens and BEM-like Naming
category: frontend_style
scope:
    - '**'
source_files:
    - app/globals.css
    - app/layout.tsx
    - postcss.config.mjs
    - package.json
    - components/Navbar.tsx
---

The perfume e-commerce app uses a custom CSS architecture layered on top of Tailwind CSS v4 (installed via @tailwindcss/postcss in PostCSS) but relies almost entirely on hand-written styles rather than utility classes. The visual system is built around a luxury dark theme centered on midnight-blue backgrounds (--black, --dark, --dark-2, --dark-3) and champagne-gold accents (--gold, --gold-light, --gold-dark).

Design tokens and typography are centralized in app/globals.css as CSS custom properties under :root. Font families are loaded both via Google Fonts imports and Next.js next/font/google (Bodoni_Moda, Inter, Amiri, Cairo, Tajawal) and exposed as CSS variables (--font-bodoni, --font-inter, --font-tajawal, etc.) so the same token names can be swapped for Arabic RTL layouts. A local OTF font (/fonts/Agraham.otf) is also registered via @font-face.

Styling methodology: Components use class names following a BEM-like convention (header-container, navbar, navbar-brand, product-card, product-card-image, dashboard-sidebar, etc.). There is no tailwind.config.* file — Tailwind is present only as a PostCSS plugin, and virtually no tw-* utilities appear in the codebase. All layout, spacing, colors, shadows, transitions, and animations are declared as explicit CSS rules in globals.css (a single ~4000-line stylesheet).

Responsive strategy: No media-query breakpoints are defined; responsiveness is achieved through fluid sizing (clamp() for headings), CSS Grid with auto-fill / minmax(), and flexbox wrapping. Directional support is handled by html[lang="ar"] and [dir="rtl"] selectors that swap font stacks and reset letter-spacing.

Animation and motion: GSAP (gsap dependency) is installed for advanced animations, while most UI transitions rely on CSS @keyframes (fadeInUp, fadeIn, heroZoom, scrollPulse) and a shared --transition cubic-bezier variable.

Component-scoped style ownership: Each page/component imports ./globals.css at the root level via app/layout.tsx; there are no per-component CSS modules or styled-jsx files. Shared component styles (Navbar, Footer, HeroCarousel, etc.) live in the global stylesheet and are referenced by their BEM-like class names from React components.