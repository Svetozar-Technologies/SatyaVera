# Solutions per requirement

For each requirement from `requirements.md`, this document lists candidate
solutions, the chosen approach, and what is implemented in this PR vs. what
is left as a tracked follow-up.

## R1 — Next.js + GitHub Pages

**Candidates**

1. Use `output: 'export'` to statically export the entire app and publish the
   resulting `out/` directory to GitHub Pages.
2. Keep the SSR Next.js app on Firebase App Hosting and create a second,
   smaller Vite SPA that lives under `/app` and is published to Pages.
3. Hybrid: gate `next.config.ts` on `STATIC_EXPORT=1` so the same source can
   produce both an SSR bundle (Firebase) and a static export (Pages). API
   routes are excluded from the export and the SPA calls the Rust API
   directly via `NEXT_PUBLIC_API_BASE`.

**Chosen:** option 3 — hybrid. It preserves the current Firebase build
(used in `apphosting.yaml`) and adds a Pages target without forking the
codebase.

**Implemented in this PR**

- `next.config.ts` now reads `STATIC_EXPORT`, `BASE_PATH`, and
  `NEXT_PUBLIC_BASE_PATH` env vars. When `STATIC_EXPORT=1` it sets
  `output: 'export'`, `images.unoptimized: true`, and applies
  `basePath`/`assetPrefix` so the bundle works under `/<repo>/`.
- A new `.github/workflows/deploy-pages.yml` workflow builds with
  `STATIC_EXPORT=1`, copies `out/` to a Pages artifact, and deploys via
  `actions/deploy-pages@v5`.
- README documents both deployment paths.

**Deferred** — Some existing pages still depend on `firebase-admin`
(server-only). For the static export build, those pages need a
`'use client'` shim or to be excluded via `dynamic = 'force-static'`. This
PR adds the build target; converting individual pages happens in follow-up
PRs once `/app` is the universal-app shell.

## R2 — `/app` SPA as universal-app basis

**Candidates**

1. Add a single `src/app/app/page.tsx` client-only page that mounts a
   minimal SPA shell.
2. Add `src/app/app/[[...slug]]/page.tsx` (catch-all) so all client
   routing happens beneath `/app/*` without filesystem-level pages.
3. Build a separate Vite SPA in `js/app/` and embed it via an iframe.

**Chosen:** option 2 — catch-all client route. Lets the SPA own its own
router (hash or path) while staying inside the Next.js app for now. We can
extract it into a separate Vite project later by copying the same component
tree without changing the import graph.

**Implemented in this PR**

- `src/app/app/page.tsx` — landing route for `/app` that re-exports the
  same client shell.
- `src/app/app/[[...slug]]/page.tsx` — catch-all SPA entry point that
  forces static rendering (`dynamic = 'force-static'`) and uses `'use
  client'` for the actual UI.
- `src/app/app/_components/SpaShell.tsx` — the client component. Starts
  with a placeholder home view and a tiny hash-based router so it works
  identically on `index.html` (Pages), inside Electron, and inside Capacitor.

## R3 — `./js` for frontend, `./rust` for backend

**Candidates**

1. Move every existing folder under `src/` into `./js/` in this PR.
2. Leave the current Next.js app untouched and add **empty scaffolds** for
   `./js` and `./rust` with a documented migration plan.
3. Mixed: move only the genuinely new code into `./js` / `./rust`, and
   migrate the existing `src/` folder incrementally.

**Chosen:** option 2 — scaffold + documented plan. A bulk rename in this
PR would create thousands of conflicts against in-flight branches, would
require a simultaneous overhaul of `tsconfig.json`, `next.config.ts`,
ESLint rules, Tailwind PostCSS paths, the Firestore ingestion scripts, and
every `import` path. The migration plan in `plan.md` lists the staged
sub-PRs that complete R3 over time.

**Implemented in this PR**

- `./js/README.md` — explains how the existing `src/`, `public/`,
  `scripts/` map onto the long-term `js/web/`, `js/spa/`, `js/scripts/`,
  `js/shared/` layout.
- `./rust/` Cargo workspace skeleton (see R5 below).
- Workflows treat both `./js` and `./rust` as first-class trees with
  their own change-detection paths.

## R4 — GitHub-hosted distribution

**Implemented**

- GitHub Pages deploy workflow (`deploy-pages.yml`) covers R4.1.
- Rust workflow (`rust-ci.yml`) builds the future server crate on every
  PR/push, ensuring the Rust target stays green.

**Deferred**

- Desktop (Electron Forge / Tauri) and mobile (Capacitor) packaging
  workflows are designed in `research.md` and added once the `/app` SPA
  has more than a placeholder shell. We keep them out of the initial PR
  to avoid breaking CI before the artefacts they package actually exist.

## R5 — link-cli with transactional change log

**Candidates**

1. Shell out to `clink` from the API server.
2. Add `link-cli` as a `Cargo.toml` dependency and call its library API
   directly. Wrap every mutating call in a `Transactional` adapter that
   appends a LiNo-encoded record to `changes.log` before invoking the
   underlying write.
3. Reimplement a doublet store from scratch.

**Chosen:** option 2 — depend on `link-cli` as a library and put the
transactional layer in our own crate. This satisfies R5.1 (library use)
and gives us full control over the journal format for R5.2/R5.3.

**Implemented in this PR (scaffold)**

- `rust/Cargo.toml` workspace with a `satyavera-db` member crate.
- `rust/db/Cargo.toml` declares `link-cli = "0.1"` as a dependency.
- `rust/db/src/lib.rs` defines a `TransactionalStore` trait, an
  append-only file-backed implementation, and a stub `LinkCliStore` that
  documents the wiring to `link_cli`'s public API. The stub is wrapped in
  a `#[cfg(feature = "link-cli")]` so CI builds the crate without
  pulling the full `link-cli` dependency tree yet (it is heavy and not
  needed to validate the scaffolding).
- `rust/db/tests/transactional.rs` proves round-trip: writes go through
  the transactional layer, the journal file ends up with every record,
  and replaying the journal into a fresh store reproduces the data.

**Deferred**

- A full HTTP API layer (axum/actix) that exposes `TransactionalStore`
  via REST/JSON or the Next.js `/api` contract used today. The Rust crate
  in this PR has the storage interface and tests; the wire layer is the
  natural next sub-PR.

## R6 — Best practices from templates

**Implemented**

- New `.github/workflows/ci.yml` — replaces the previous minimal CI with:
  detect-changes, lint, build (JS), file-size limit, secret scan,
  documentation validation, and the test job (no tests yet → conditional
  skip with a TODO comment). Drives Next.js, not npm publishing.
- `.github/workflows/rust-ci.yml` — mirrors the Rust template's
  `lint`/`test` jobs (matrix Linux/macOS/Windows, cache, `cargo fmt`,
  `cargo clippy`, `cargo test`, `RUSTFLAGS=-Dwarnings`).
- `.github/workflows/deploy-pages.yml` — Next.js static export → Pages.
- `.github/workflows/links.yml` — lychee link checker (adapted from JS template).
- Hygiene files: `.prettierrc`, `.prettierignore`, `.jscpd.json`,
  `.secretlintrc.json`, `.lycheeignore`.

**Reported gaps in upstream templates** — captured in `research.md` § "Gaps".
Filing them upstream is a follow-up item in `plan.md`.

## R7 — Case study deliverable

**Implemented**

- `docs/case-studies/issue-3/` (this folder) — `README.md`,
  `requirements.md`, `research.md`, `solutions.md`, `plan.md`,
  `references.md`.

## R8 — Single PR, deliberate

**Implemented**

- All changes land in PR #4 on branch `issue-3-c86d84590f77`.
- The PR description (updated by this PR) summarises which requirements
  are implemented, which are deferred with rationale, and where to find
  the case study.
