# `./js` — Frontend code (Next.js project root)

This folder is the **Next.js project root** for SatyaVera and the long-term
home for all frontend code (web / desktop / mobile), as required by
issue [#3](https://github.com/Svetozar-Technologies/SatyaVera/issues/3)
(R3.1) and confirmed by PR [#4](https://github.com/Svetozar-Technologies/SatyaVera/pull/4)
review feedback.

Every JavaScript-related artefact lives under this directory:

```
js/
  README.md              # this file
  package.json           # npm scripts: dev, build, build:pages, lint, check:api-boundary, ingest-*, seed-*
  package-lock.json
  next.config.ts         # STATIC_EXPORT / BASE_PATH gates for Firebase vs. Pages
  next-env.d.ts
  tsconfig.json          # @/* → ./src/* (relative to this folder)
  postcss.config.mjs
  eslint.config.mjs
  apphosting.yaml        # Firebase App Hosting backend config
  .prettierrc
  .prettierignore
  .jscpd.json
  .secretlintrc.json
  data/                  # Firestore seed data (laws/*.json)
  public/                # static assets served by Next.js
  scripts/               # ingest, seed, build-static-export.mjs
  src/                   # all TypeScript / React source
    app/                 # Next.js App Router pages, including /app SPA shell
    lib/
    types/
    ...
```

## Running locally

All `npm` commands run from this directory:

```sh
cd js
npm ci

# Firebase App Hosting target (default; output: standalone)
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8787 npm run dev
npm run build

# GitHub Pages target (output: export)
BASE_PATH="/SatyaVera" NEXT_PUBLIC_BASE_PATH="/SatyaVera" \
  npm run build:pages
```

`build:pages` runs `node scripts/build-static-export.mjs`, which temporarily
relocates server-rendered page trees (`src/app/(dashboard)`,
`src/app/(public)`, `src/app/sitemap.ts`) into `.static-export-stash/`,
invokes `next build` with `STATIC_EXPORT=1`, and unconditionally restores
them in a `finally` block so the working tree is never left mid-stash.

Runtime API calls belong to the Rust server in `../rust/api`. Browser
code should call `apiUrl("/api/...")` from `src/lib/api/client.ts`
instead of hard-coding an origin. `NEXT_PUBLIC_API_BASE` or
`NEXT_PUBLIC_API_BASE_URL` points the bundle at the deployed Rust API.
`npm run check:api-boundary` fails if a Next.js `src/app/api/**/route.*`
file is reintroduced.

## Continuous integration

`.github/workflows/js.yml` (at the repository root, not under `js/`) runs
every job for this folder. Notable jobs:

- `lint` — ESLint (hard gate), Prettier + jscpd (advisory), secretlint
  (hard gate), plus the Rust-owned API boundary guard.
- `build (firebase)` — `npm run build`, exercising the App Hosting target.
- `build (pages)` — `npm run build:pages` with `BASE_PATH=/SatyaVera`.
- `pages-deploy` — runs only on push to `main`, uploads `js/out/` as a
  Pages artifact and publishes it via `actions/deploy-pages@v4`.

Rust CI lives in `.github/workflows/rust.yml`; link checking lives in
`.github/workflows/links.yml`. The split mirrors the upstream templates
at `link-foundation/*-ai-driven-development-pipeline-template`.

## Firebase App Hosting

`js/apphosting.yaml` continues to drive the production Firebase backend.
**Operational note**: because the Next.js project root moved into `./js/`,
the App Hosting backend's *Root directory* setting (Firebase console →
App Hosting → backend → Settings) must be set to `js`. The build target
(`output: standalone`) serves the frontend only; `/api/*` is served by
the Rust API and configured through `NEXT_PUBLIC_API_BASE`.
