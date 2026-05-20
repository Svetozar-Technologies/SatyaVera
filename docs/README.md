# SatyaVera Documentation

Top-level documentation for the SatyaVera project. Start here when you
need a map of the codebase or a reference for what ships in the product
today.

## Contents

| Document | What it covers |
|----------|----------------|
| [architecture.md](./architecture.md) | Full system architecture: dual build targets (Firebase App Hosting + GitHub Pages), the `/app` SPA shell, Next.js layers, API route-handler conventions, the Rust `satyavera-db` workspace, Firestore data model, auth, rate limiting, CI/CD pipelines, deployment topology, per-requirement traceability for issue #3. |
| [features.md](./features.md) | Catalogue of every user-facing and developer-facing feature currently shipped — GandhiAI chat, document drafter, guides, dictionary, templates, quizzes, lawyer marketplace, scanner, SOS, legal-aid, bilingual UI, subscriptions, admin tooling, the Rust storage layer, CI gates (hard vs advisory), and the documentation surface itself. |
| [case-studies/issue-3/README.md](./case-studies/issue-3/README.md) | Deep-dive case study for issue #3: requirements analysis, research, solution sketches, the implementation plan, and source references for the refactor that produced the current repo layout. |

## Repository entry points

- [Root `README.md`](../README.md) — project overview and getting started.
- [`js/README.md`](../js/README.md) — Next.js workspace, scripts, env vars.
- [`rust/README.md`](../rust/README.md) — Cargo workspace, crates, feature flags.
- [`AGENTS.md`](../AGENTS.md) / [`CLAUDE.md`](../CLAUDE.md) — agent instructions and breaking-change notices for contributors.

## Documentation conventions

- Every doc here is expected to stay under 2,500 lines (enforced by the
  `validate-docs` job in `.github/workflows/js.yml`).
- Links inside docs use repo-relative paths so they keep working under
  GitHub Pages, the Firebase build, and local checkouts.
- The lychee link checker (`.github/workflows/links.yml`) verifies every
  link in `docs/*.md`; case studies under `docs/case-studies/` are
  excluded from link-checking because they intentionally cite external,
  potentially unstable references.
