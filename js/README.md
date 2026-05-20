# `./js` — Frontend code

This folder is the long-term home for **all frontend code** (web/desktop/mobile)
as required by issue #3 (R3.1). The migration is staged: this PR introduces
the folder and the layout plan; subsequent PRs move the existing
`src/`, `public/`, and `scripts/` content into it without breaking the
Next.js build.

## Planned layout

```
js/
  README.md            # this file
  web/                 # Next.js app (server-rendered, Firebase App Hosting)
    src/               # ← migrates from /src
    public/            # ← migrates from /public
    next.config.ts     # ← migrates from /next.config.ts
    tsconfig.json
  spa/                 # /app SPA shell that doubles as desktop/mobile basis
    src/
      App.tsx          # currently at src/app/app/_components/SpaShell.tsx
      main.tsx
    vite.config.ts     # for the future standalone Vite build
    capacitor.config.json
    electron/
      main.cjs
      preload.cjs
    forge.config.cjs
  shared/              # framework-agnostic helpers shared by web + spa
    ai/                # ← migrates from src/lib/ai
    i18n/              # ← migrates from src/lib/i18n
    types/             # ← migrates from src/types
  scripts/             # ingest, seed, migration tooling
    ingest-laws.ts     # ← migrates from /scripts
    seed-*.ts
```

## Why staged migration?

Bulk-renaming `src/` to `js/web/src/` in one commit would touch hundreds of
import paths and force simultaneous changes to:

- `next.config.ts` (entrypoints, `outputFileTracingRoot`),
- `tsconfig.json` (`paths` alias `@/*`),
- `tailwindcss` PostCSS content globs,
- `eslint.config.mjs`,
- Firestore ingestion scripts that read `data/laws/**`,
- every CI workflow and every doc that links a relative path.

Splitting the migration into PR-sized slices keeps the diff reviewable and
avoids regressing the production Firebase App Hosting build. See
`docs/case-studies/issue-3/plan.md` § "Follow-up" for the ordered slices.

## Today's bridge

Until the migration completes, frontend code stays under `/src` and the build
toolchain continues to expect it there. The `/app` SPA shell already lives at
`src/app/app/_components/SpaShell.tsx` and can be lifted into `js/spa/src/`
unchanged once we are ready.

When you add **new** frontend code that does not belong in the existing
Next.js tree (e.g. a Vite-only universal-app shell), create it under
`js/spa/` directly so the migration only goes one way.
