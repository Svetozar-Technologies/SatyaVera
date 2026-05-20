# Execution plan

Ordered steps the PR follows. Items marked **PR** are landing in this PR;
items marked **Follow-up** are tracked here so nothing is lost.

## In this PR

1. **PR** Compile case study (`docs/case-studies/issue-3/`).
2. **PR** Add hygiene config: `js/.prettierrc`, `js/.prettierignore`, `js/.jscpd.json`, `js/.secretlintrc.json`, `.lycheeignore` (at repo root).
3. **PR** Move all JavaScript into `./js/` — `js/src`, `js/public`, `js/scripts`, `js/data`, `js/package.json`, `js/next.config.ts`, `js/postcss.config.mjs`, `js/tsconfig.json`, `js/eslint.config.mjs`, `js/apphosting.yaml`. The Next.js project root is now `./js/`.
4. **PR** Add `.github/workflows/js.yml` — single JS CI/CD workflow (detect-changes, file-line-limit, lint, build matrix `[firebase, pages]`, Pages publish on `main`, validate-docs). Replaces the prior `ci.yml` + `deploy-pages.yml`.
5. **PR** Add `.github/workflows/rust.yml` (lint + cross-OS test matrix; renamed from `rust-ci.yml`).
6. **PR** Add `.github/workflows/links.yml` (lychee link checker).
7. **PR** Make `js/next.config.ts` honour `STATIC_EXPORT`, `BASE_PATH`, `NEXT_PUBLIC_BASE_PATH` so the same source produces Firebase and Pages bundles.
8. **PR** Add `/app` SPA route (`js/src/app/app/page.tsx`, `js/src/app/app/[[...slug]]/page.tsx`, `js/src/app/app/_components/SpaShell.tsx`).
9. **PR** Rewrite `./js/README.md` to document the realised flat layout (`js/src`, `js/public`, `js/scripts`, `js/data`, configs at `js/`).
10. **PR** Add `./rust` Cargo workspace with the `satyavera-db` crate: `TransactionalStore` trait, file-backed journal implementation, replay test, and a feature-gated `link-cli` adapter (depends on `link-cli` as a library).
11. **PR** Update root `README.md` with: GitHub Pages deployment instructions, the `js/` + `rust/` plan, Firebase App Hosting "Root directory: `js`" reminder, link to case study.
12. **PR** Verify `npm run build` (Firebase target) and `npm run build:pages` (GitHub Pages static export) both succeed locally from `./js/`. Verify `cargo fmt --all -- --check`, `cargo clippy --all-targets --all-features`, and `cargo test --all-features` succeed in `./rust/`.

## Follow-up (tracked, not in this PR)

A. **Firebase App Hosting console update**: update the App Hosting backend's
   *Root directory* setting from `/` to `js` so it picks up
   `js/apphosting.yaml` and `js/package.json`. Workflow does not need to
   change; the standalone build target already runs from the same project
   root. Recorded as a release note in the PR description.

B. **Convert Firestore-dependent pages to client-only or remove the
   server dependency** where the page lives under `/app`. The current
   `/app` SPA shell is independent of Firestore so it ships immediately.

C. **Implement the Rust HTTP API** (axum) exposing `TransactionalStore`,
   replacing the Next.js `/api/*` routes one endpoint at a time. Each
   endpoint migration is a separate PR.

D. **Activate desktop and mobile build workflows** (Electron Forge,
   Capacitor) once `/app` has the universal-app shell. Extend `js.yml`
   with the desktop / Android / iOS matrices from the JS template.

E. **Restore optional Docker publish path** from the JS template once we
   have a Rust binary to ship as a container image.

F. **File upstream issues** for the template gaps recorded in
   `research.md` § "Gaps observed in upstream templates":

   - `link-foundation/js-ai-driven-development-pipeline-template`: split the >1500-line release.yml; enable `cache: npm`.
   - `link-foundation/rust-ai-driven-development-pipeline-template`: add `cargo audit` (or `cargo deny`).
   - `link-foundation/python-ai-driven-development-pipeline-template` & `csharp-ai-driven-development-pipeline-template`: document the absence of a Pages preview workflow and consider symmetry.

   Linking back to issue #3 in each upstream issue so the cross-repo
   connection is recorded.
