import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // React 19's new `set-state-in-effect` rule fires on patterns that
    // were idiomatic under React 18 (e.g. initialising client-only state
    // from localStorage inside `useEffect`). We treat it as a warning
    // so the migration tracked by issue #3 can land in dedicated PRs
    // rather than blocking the CI reintroduction here.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
