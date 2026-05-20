# Case Study: Issue #3 — Reintroduce CI/CD and split JS/Rust

> Source issue: [Svetozar-Technologies/SatyaVera#3](https://github.com/Svetozar-Technologies/SatyaVera/issues/3)
>
> Implementation pull request: [#4](https://github.com/Svetozar-Technologies/SatyaVera/pull/4)

This folder is a deep-dive analysis of issue #3. It decomposes every requirement, links each requirement to a proposed solution, surveys the four
`link-foundation/*-ai-driven-development-pipeline-template` repositories for best practices, and lists known
components/libraries that solve adjacent problems.

## Layout

| File | Purpose |
| --- | --- |
| `README.md` | This index. Start here. |
| `requirements.md` | The issue body decomposed into atomic, testable requirements. |
| `research.md` | Findings from the four upstream CI/CD templates and the `link-cli` reference. |
| `solutions.md` | Proposed solution(s) per requirement, with chosen approach and trade-offs. |
| `plan.md` | Ordered execution plan that the PR follows. |
| `references.md` | External references, libraries, and prior art consulted. |

## TL;DR for reviewers

1. **`js.yml`** — single JavaScript CI/CD workflow that runs detect-changes,
   file-line-limit, ESLint, Prettier / jscpd (advisory), secret scanning,
   builds the Next.js app for both Firebase App Hosting (`output: standalone`)
   and GitHub Pages (`output: export`) and, on push to `main`, publishes the
   GitHub Pages artifact. Modelled on
   [`link-foundation/js-ai-driven-development-pipeline-template`](https://github.com/link-foundation/js-ai-driven-development-pipeline-template).
2. **`rust.yml`** — separate Rust CI workflow (lint + cross-OS test matrix)
   for the `./rust` workspace. Adapted from
   [`link-foundation/rust-ai-driven-development-pipeline-template`](https://github.com/link-foundation/rust-ai-driven-development-pipeline-template).
3. **`links.yml`** — broken-link checker (lychee) for all Markdown / HTML.
4. **All frontend code lives in `./js`** (issue R3.1, restated in PR #4
   review): `js/src`, `js/public`, `js/scripts`, `js/data`, `js/package.json`,
   `js/next.config.ts`, `js/apphosting.yaml`. The `/app` route remains the SPA
   shell shipped to GitHub Pages.
5. **All backend / database code lives in `./rust`** (issue R3.2). The PR
   introduces the `satyavera-db` crate which depends on `link-cli` as a
   library and adds a replayable transactional journal alongside it.
6. Cross-template best practices that were missing here are now in place:
   link checking, format checks, code duplication checks, secret scanning,
   file-line-limit checks, and dependency caching.

> **Operational note for the Firebase App Hosting deployment**: because
> `apphosting.yaml`, `package.json` and `next.config.ts` now live under
> `./js`, the Firebase App Hosting backend's *Root directory* setting must be
> updated to `js` in the Firebase console. The CI build target
> (`output: standalone`) and `apphosting.yaml` contents are unchanged.
