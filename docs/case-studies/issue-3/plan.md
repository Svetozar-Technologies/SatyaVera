# Execution plan

Ordered steps the PR follows. Items marked **PR** are landing in this PR;
items marked **Follow-up** are tracked here so nothing is lost.

## In this PR

1. **PR** Compile case study (`docs/case-studies/issue-3/`).
2. **PR** Add hygiene config: `.prettierrc`, `.prettierignore`, `.jscpd.json`, `.secretlintrc.json`, `.lycheeignore`.
3. **PR** Replace `.github/workflows/ci.yml` with a comprehensive workflow modelled on the JS template.
4. **PR** Add `.github/workflows/deploy-pages.yml` (Next.js static export → GitHub Pages).
5. **PR** Add `.github/workflows/links.yml` (lychee link checker).
6. **PR** Add `.github/workflows/rust-ci.yml` (mirrors the Rust template).
7. **PR** Make `next.config.ts` honour `STATIC_EXPORT`, `BASE_PATH`, `NEXT_PUBLIC_BASE_PATH` so the same source produces Firebase and Pages bundles.
8. **PR** Add `/app` SPA route (`src/app/app/page.tsx`, `src/app/app/[[...slug]]/page.tsx`, `src/app/app/_components/SpaShell.tsx`).
9. **PR** Add `./js/README.md` documenting the long-term `js/` layout and migration mapping.
10. **PR** Add `./rust` Cargo workspace skeleton with `satyavera-db` crate, `TransactionalStore` trait, file journal implementation, and a round-trip test.
11. **PR** Update `README.md` with: GitHub Pages deployment instructions, the `js/` + `rust/` plan, link to case study.
12. **PR** Verify `npm run build` still succeeds locally with the default (Firebase) config.

## Follow-up (tracked, not in this PR)

A. **Migrate `src/` into `js/web/` + `js/spa/` + `js/shared/`.** Staged across
   small PRs so each remains reviewable. Update `tsconfig`, `next.config`,
   ESLint, Tailwind PostCSS, the seed scripts, and all import paths in
   lock-step.

B. **Convert Firestore-dependent pages to client-only or remove the
   server dependency** where the page lives under `/app`. The current
   `/app` SPA shell is independent of Firestore so it ships immediately.

C. **Implement the Rust HTTP API** (axum) exposing `TransactionalStore`,
   replacing the Next.js `/api/*` routes one endpoint at a time. Each
   endpoint migration is a separate PR.

D. **Activate desktop and mobile build workflows** (Electron Forge,
   Capacitor) once `/app` has the universal-app shell.

E. **Restore optional Docker publish path** from the JS template once we
   have a Rust binary to ship as a container image.

F. **File upstream issues** for the template gaps recorded in
   `research.md` § "Gaps observed in upstream templates":

   - `link-foundation/js-ai-driven-development-pipeline-template`: split the >1500-line release.yml; enable `cache: npm`.
   - `link-foundation/rust-ai-driven-development-pipeline-template`: add `cargo audit` (or `cargo deny`).
   - `link-foundation/python-ai-driven-development-pipeline-template` & `csharp-ai-driven-development-pipeline-template`: document the absence of a Pages preview workflow and consider symmetry.

   Linking back to issue #3 in each upstream issue so the cross-repo
   connection is recorded.
