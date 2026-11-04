import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Restoring client state (cart, CMS content, hero slides) from localStorage /
      // Supabase inside effects is intentional here; keep it visible as a warning.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // Known tech debt, tracked as warnings so CI still blocks new errors elsewhere:
    // - the admin dashboard declares sub-components inside its render function
    // - SplashCursor is a port of an untyped WebGL fluid-simulation shader
    files: ["app/dashboard/page.tsx", "components/SplashCursor.tsx"],
    rules: {
      "react-hooks/static-components": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "e2e/**",
  ]),
]);

export default eslintConfig;
