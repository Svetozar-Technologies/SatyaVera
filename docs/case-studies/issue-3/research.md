# Research — Templates and prior art

Snapshots below were taken on 2026-05-20 from the `main` branch of each
upstream template. Where a template defines a workflow not present here, the
PR copies the relevant pattern (adapted to Next.js / SatyaVera). Where the
template has the same gap as this repo, the gap is documented in
`solutions.md`.

## Template inventory

| Template | Workflows | Notable best practices |
| --- | --- | --- |
| `link-foundation/js-ai-driven-development-pipeline-template` | `release.yml` (885 lines, "Checks and release"), `example-app.yml` (universal-app build for Pages/desktop/mobile), `links.yml` (lychee + Web Archive fallback) | Detect-changes job to gate downstream jobs, fast-fail check ordering, fresh-merge simulation for PRs, prettier/eslint/jscpd/secretlint, file line-count limit (1500), test matrix node/bun/deno × ubuntu/macos/windows, version-change check, GitHub Pages deploy with `actions/configure-pages` + `actions/deploy-pages`, Electron Forge desktop packaging, Capacitor mobile builds gated by `vars.EXAMPLE_APP_ENABLE_*`, preview-image regeneration via Playwright. |
| `link-foundation/rust-ai-driven-development-pipeline-template` | `release.yml` (675 lines, "CI/CD Pipeline") | `dtolnay/rust-toolchain@stable`, `actions/cache@v5` for `~/.cargo/registry`, `~/.cargo/git`, `target`, `cargo fmt --all -- --check`, `cargo clippy --all-targets --all-features`, `cargo test` matrix on Linux/macOS/Windows, `RUSTFLAGS=-Dwarnings`, OIDC release path with `CARGO_REGISTRY_TOKEN`, changelog-fragment validation, version-modification check, rust-script scripts in `scripts/*.rs`. |
| `link-foundation/python-ai-driven-development-pipeline-template` | `docs.yml`, `release.yml` (354 lines) | docs build separation, `pyproject.toml` validation, `pip-audit`. |
| `link-foundation/csharp-ai-driven-development-pipeline-template` | `docs.yml`, `release.yml` (558 lines) | DocFX-based docs, `dotnet test` matrix. |

The JS and Rust templates are the primary inspiration; the Python and C#
templates contribute the docs-workflow split idea and confirm the
"changelog fragment → release PR" pattern is consistent across the family.

## Detailed findings — JS template

Key files and what we adopt:

- **`.github/workflows/release.yml`** — single workflow that runs:
  1. `detect-changes` (only run downstream jobs if relevant files changed).
  2. `test-compilation` (`node --check` on every `.mjs` for fast syntax fail).
  3. `check-file-line-limits` (enforce 1500-line cap on tracked code).
  4. `version-check` (forbid manual `package.json` version bumps in PRs).
  5. `changeset-check` (PR must add exactly one changeset for code changes).
  6. `lint` (`eslint`, `prettier --check`, `jscpd`, `secretlint`).
  7. `test` matrix (3 runtimes × 3 OS, `fail-fast: false`).
  8. `validate-docs` (file-size + required-files checks for `docs/`).
  9. `release` (npm OIDC trusted publishing, GitHub Release notes).
  10. `instant-release` (manual `workflow_dispatch` shortcut).
  11. `docker-publish` (optional, gated by `vars.DOCKERHUB_IMAGE`).
  12. `changeset-pr` (manual changeset PR helper).

  **Adoption notes:**
  - We adopt items 1, 3, 6, 8, 9 (with `npm run build` instead of npm publishing). Items 2/5/11/12 are JS-package-publish-specific and skipped.
  - The `simulate-fresh-merge.sh` script is reused conceptually (we don't need it yet because the test matrix is small; the comprehensive workflow adds it for the lint job to mirror upstream).

- **`.github/workflows/example-app.yml`** — drives the universal-app build:
  - `web-build` job: builds the Vite app, uploads `dist/` artifact, optionally uploads GitHub Pages artifact.
  - `pages-deploy` job: deploys via `actions/deploy-pages@v5` from the artifact.
  - `desktop-package` job: runs `electron-forge package` on ubuntu/macos/windows.
  - `android-build` / `ios-build`: gated by repo `vars.EXAMPLE_APP_ENABLE_ANDROID_BUILD` / `..._IOS_BUILD`.
  - `preview-regen`: rebuilds README screenshots via Playwright.

  **Adoption notes:**
  - SatyaVera does not yet have a universal-app shell. We adopt the *workflow shape* — build → upload-pages-artifact → deploy-pages — and target the Next.js static export instead.
  - Desktop/mobile packaging is documented but deferred to a follow-up PR once the `/app` SPA stabilises.

- **`.github/workflows/links.yml`** — lychee link checker with Web Archive fallback.

  **Adoption notes:**
  - We adopt the workflow verbatim (path-filtered to markdown/HTML files).
  - The Web Archive fallback script (`scripts/check-web-archive.mjs`) is JS-only in the template; we wire a simpler `--exclude` list for now and link to the template script for the deeper version.

- **Repo hygiene files** — `.prettierrc`, `.prettierignore`, `.jscpd.json`, `.secretlintrc.json`, `.lycheeignore`, `eslint.config.js`.

  **Adoption notes:**
  - SatyaVera already has `eslint.config.mjs` (Next.js flat config). We add `.prettierrc`, `.prettierignore`, `.jscpd.json`, `.secretlintrc.json`, `.lycheeignore` mirroring the template's defaults.

## Detailed findings — Rust template

- Matrix on `ubuntu-latest`, `macos-latest`, `windows-latest`.
- Caches `~/.cargo/registry`, `~/.cargo/git`, `target`.
- `RUSTFLAGS: -Dwarnings` to fail on warnings.
- `cargo fmt --all -- --check`, `cargo clippy --all-targets --all-features`, `cargo test --all-features`.
- `dtolnay/rust-toolchain@stable` with `components: rustfmt, clippy`.
- Changelog fragments in `changelog.d/` (`towncrier`-style — adopted by reference for the future `rust/` migration).

## Detailed findings — link-cli

- The crate publishes both a `lib` (`link_cli`) and a `bin` (`clink`) from the same `Cargo.toml`.
- Public API includes `simplify_changes`, `LinkError`, `cli` module, and persistent storage via the `doublets` and `links-notation` crates.
- This is the binding we need for **R5.1** — we depend on `link-cli` as a `[dependencies]` entry, not by shelling out.

## Known components for the transactional layer

For **R5.2** (append a journal of writes), there are several mature patterns
in the Rust ecosystem we should reuse rather than invent:

- **Append-only log file** — the simplest viable journal. Each write becomes
  one record (JSON line, MessagePack, or LiNo). Crates: `serde_json`,
  `rmp-serde`, or write-as-LiNo via `links-notation`.
- **`tokio-rusqlite` WAL mode** — if we ever back the journal with SQLite, WAL
  is a battle-tested journal already.
- **`okaywal`** — pure-Rust write-ahead log crate (<https://crates.io/crates/okaywal>).
- **`sled`'s log subsystem** — sled is unmaintained but its log file format is
  documented and several forks remain (e.g. `bonsaidb`).
- **`redb`** — pure-Rust ACID embedded DB; could be a fallback persistence
  layer behind the same transactional interface.

The chosen approach for this PR (see `solutions.md`) is the simplest one
that satisfies R5.2/R5.3: an append-only journal file (`changes.log`) that
records LiNo-encoded mutations next to the `link-cli` data file. We document
the interface so heavier crates above can replace the implementation later
without changing call-sites.

## Known components for the universal-app shell

- **Vite + React + Capacitor + Electron Forge** — exactly the stack used in
  `examples/universal-app/` of the JS template. Confirmed working for
  GitHub Pages + desktop + mobile from one bundle.
- **Tauri** — alternative desktop shell (Rust-based). Worth considering once
  the Rust API is in place; can share the same web bundle and skip Node in
  the desktop runtime.
- **Capacitor** — wraps the same web bundle for iOS/Android. The JS template
  already shows the workflow gating for this.

## Known components for Next.js + GitHub Pages

- Next.js's `output: 'export'` produces a fully static site (no server
  runtime). API routes and `next/image` loader limitations apply (we map
  any server route to the Rust API host via `NEXT_PUBLIC_API_BASE`).
- `basePath` and `assetPrefix` need to be set to `/<repo>` for Pages.
- The repo's existing `apphosting.yaml` (Firebase App Hosting) is unaffected;
  Pages export is a separate build mode gated by the `STATIC_EXPORT=1` env
  variable in the deploy workflow.

## Gaps observed in upstream templates

Following R6.3, these gaps were noted while reading the templates. They are
candidates for upstream issues — to be filed as a follow-up to this PR (the
issue requires that we *report* them, not necessarily fix them):

1. **JS template `release.yml` size** — at ~885 lines it exceeds the 1500-line
   limit it enforces. Splitting publish/instant-release/changeset-pr into a
   reusable workflow would help. (Reference: `js-ai-driven-development-pipeline-template`,
   `.github/workflows/release.yml`.)
2. **Rust template lacks `cargo audit`** — no supply-chain scan is run. Adding
   `cargo audit` or `cargo deny` would close the gap parallel to JS template's
   `secretlint`.
3. **No `actions/cache` for npm in lint/test** — the JS template uses
   `npm install` without a Node setup cache step. The `setup-node@v6` action
   supports `cache: npm` natively; turning it on shaves seconds off every job.
4. **`example-app.yml` Pages job has no rollback on failure** — if
   `deploy-pages` fails midway the previous artifact remains live, which is
   fine, but there is no annotated note explaining that. Documentation-only.
5. **Python / C# templates have no GitHub Pages preview** — symmetric to JS.

These will be raised against the respective template repositories once this
PR lands. See `references.md` for the planned upstream issue links.
