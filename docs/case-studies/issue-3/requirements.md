# Requirements decomposition — Issue #3

Each requirement is given a stable ID so the rest of this case study (and the
PR description) can reference it. Requirements are extracted verbatim from the
issue body and then refined into atomic, testable statements.

## R1 — Next.js + GitHub Pages

> "Make sure we fully support building next.js app as GitHub Pages website, with /app route for all SPA related"

- **R1.1** The repository MUST build a Next.js bundle suitable for static hosting on GitHub Pages (no server runtime).
- **R1.2** The bundle MUST contain an `/app` route that boots a client-only Single Page Application.
- **R1.3** The static export MUST work alongside the existing Firebase App Hosting deployment without breaking it.

## R2 — `/app` SPA as universal-app basis

> "the /app route, should be prepared in such a way, so it will contain SPA, that we will later be able to use as a basis for web app, mobile app and desktop app."

- **R2.1** The `/app` route MUST run entirely client-side (no `getServerSideProps`/server actions).
- **R2.2** The SPA assets MUST be portable enough to be embedded by a desktop shell (e.g. Electron) and a mobile shell (e.g. Capacitor) later.
- **R2.3** Routing inside `/app` MUST work when served from `/app/index.html` (hash or path-based; documented).

## R3 — `./js` for frontend, `./rust` for backend

> "All frontent related logic should be moved to ./js folder, and all server related logic should be moved to ./rust folder."

- **R3.1** A `./js` folder MUST exist and be the long-term home for frontend code (Next.js app, SPA, shared UI, helpers).
- **R3.2** A `./rust` folder MUST exist and be the long-term home for the API server and persistence layer.
- **R3.3** Migration MUST NOT regress the current Next.js build. (Migration may be staged across PRs; this PR sets up the scaffolding and migration plan.)

## R4 — GitHub-hosted distribution; servers focus on Rust

> "We will rely on GitHub infrastructure to support web app, mobile app and desktop app. And our servers will only focus on rust implementation of API and operating with database."

- **R4.1** A CI workflow MUST publish the web SPA to GitHub Pages.
- **R4.2** CI workflows MUST build (and optionally package) desktop and mobile artifacts so they can be downloaded via GitHub Releases.
- **R4.3** Server code MUST be implemented in Rust; no JS/Node server is in scope for the Rust API.

## R5 — Database: link-cli (Rust) + transactional log

> "For database make sure we use rust version of [link-cli](https://github.com/link-foundation/link-cli) as library, with addition of transactional layer, that will repeat all changes to database in separate file, so it will be easier to reconstruct database if it is broken for some reason."

- **R5.1** The Rust API crate MUST depend on `link-cli` (Rust) as a library (not as a CLI sub-process).
- **R5.2** A transactional layer MUST wrap database writes and append each write to a separate change log file.
- **R5.3** Reconstruction from the change log alone MUST be possible — i.e. the change log is a complete journal of writes.

## R6 — Best practices from four templates

> "Use all the best practices from CI/CD templates ... compare for all GitHub workflow and CI/CD scripts file"
>
> - <https://github.com/link-foundation/js-ai-driven-development-pipeline-template>
> - <https://github.com/link-foundation/rust-ai-driven-development-pipeline-template>
> - <https://github.com/link-foundation/python-ai-driven-development-pipeline-template>
> - <https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template>

- **R6.1** The CI workflow MUST adopt the JS template's checks (lint, format, duplication, secret scan, file size, link check, fresh-merge simulation).
- **R6.2** The Rust workflow MUST adopt the Rust template's checks (`cargo fmt`, `cargo clippy`, `cargo test` on Linux/macOS/Windows, caching).
- **R6.3** Where templates also have a defect, the same defect MUST be reported upstream (or recorded for follow-up).

## R7 — Case study deliverable

> "We need to collect data related about the issue to this repository, make sure we compile that data to `./docs/case-studies/issue-{id}` folder"

- **R7.1** A `docs/case-studies/issue-3/` folder MUST exist with: requirements, research, proposed solutions, plan, references.
- **R7.2** It MUST cite known existing components/libraries that solve similar problems.
- **R7.3** It MUST be reachable from the PR description.

## R8 — Single PR, deliberate

> "Please plan and execute everything in a single pull request, you have unlimited time and context"

- **R8.1** All work MUST land in the existing PR [#4](https://github.com/Svetozar-Technologies/SatyaVera/pull/4) on branch `issue-3-c86d84590f77`.
- **R8.2** The PR MUST be a draft until every requirement has either an implementation, a clearly tracked TODO, or a justified deferral.
