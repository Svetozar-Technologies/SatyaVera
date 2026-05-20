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

1. Reintroduce a comprehensive CI workflow modelled on
   [`link-foundation/js-ai-driven-development-pipeline-template`](https://github.com/link-foundation/js-ai-driven-development-pipeline-template/blob/main/.github/workflows/release.yml).
2. Add a GitHub Pages deploy workflow that statically exports the Next.js app and ships the `/app` SPA route as the entry point for the
   future web/mobile/desktop universal app.
3. Begin the migration of frontend code into `./js` and backend logic into `./rust`. The PR introduces:
   - a scaffold `./rust` workspace that depends on `link-cli` as a library and adds a separate transactional change log file,
   - a placeholder `./js` README that maps existing `src/`, `public/`, `scripts/` content onto the planned long-term layout.
4. Add cross-template best practices that were missing here: link checking, format checks, code duplication checks, secret scanning,
   file-line-limit checks, fresh-merge simulation, and dependency caching.
