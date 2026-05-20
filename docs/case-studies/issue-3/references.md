# References

External references consulted while compiling this case study.

## Templates compared (R6)

- [`link-foundation/js-ai-driven-development-pipeline-template`](https://github.com/link-foundation/js-ai-driven-development-pipeline-template)
  - `.github/workflows/release.yml` — comprehensive CI + release.
  - `.github/workflows/example-app.yml` — universal-app build (web/desktop/mobile).
  - `.github/workflows/links.yml` — lychee link checker with Web Archive fallback.
  - `examples/universal-app/` — Vite + React + Capacitor + Electron Forge reference.
- [`link-foundation/rust-ai-driven-development-pipeline-template`](https://github.com/link-foundation/rust-ai-driven-development-pipeline-template)
  - `.github/workflows/release.yml` — full Rust CI/CD pipeline.
  - `Cargo.toml` lints/profile reference.
- [`link-foundation/python-ai-driven-development-pipeline-template`](https://github.com/link-foundation/python-ai-driven-development-pipeline-template)
  - `.github/workflows/docs.yml`, `release.yml`.
- [`link-foundation/csharp-ai-driven-development-pipeline-template`](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template)
  - `.github/workflows/docs.yml`, `release.yml`.

## Database / persistence (R5)

- [`link-foundation/link-cli`](https://github.com/link-foundation/link-cli) — the canonical Rust crate (also exposes a `[lib]`).
- [`linksplatform/doublets-rs`](https://github.com/linksplatform/doublets-rs) — the `doublets` storage crate `link-cli` depends on.
- [`link-foundation/links-notation`](https://github.com/link-foundation/links-notation) — LiNo parser/encoder.
- [`okaywal`](https://crates.io/crates/okaywal) — pure-Rust write-ahead log.
- [`redb`](https://crates.io/crates/redb) — pure-Rust embedded ACID DB; potential transactional backend.
- [`bonsaidb`](https://crates.io/crates/bonsaidb) — sled-based document DB; another transactional-layer reference.

## Universal-app shell (R2/R4)

- [Capacitor docs](https://capacitorjs.com/docs) — wrap a web bundle into iOS/Android.
- [Electron Forge](https://www.electronforge.io/) — Electron packaging used by the JS template.
- [Tauri](https://v2.tauri.app/) — Rust-native desktop shell, considered as a follow-up.
- [Next.js Static Exports](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports) — `output: 'export'` for GitHub Pages.

## GitHub Pages (R1/R4.1)

- [`actions/configure-pages`](https://github.com/actions/configure-pages)
- [`actions/upload-pages-artifact`](https://github.com/actions/upload-pages-artifact)
- [`actions/deploy-pages`](https://github.com/actions/deploy-pages)

## CI/CD hygiene (R6)

- [Prettier](https://prettier.io/) — formatter.
- [`jscpd`](https://github.com/kucherenko/jscpd) — copy-paste detector.
- [`secretlint`](https://github.com/secretlint/secretlint) — secret scanner.
- [`lychee`](https://github.com/lycheeverse/lychee) — link checker.
- [Wayback Machine availability API](https://archive.org/wayback/available) — link archive fallback.

## SatyaVera context

- [`Svetozar-Technologies/indian-law`](https://github.com/Svetozar-Technologies/indian-law) — source of the 846 acts.
- This repository's existing `apphosting.yaml`, `firestore.rules`, `next.config.ts` — preserved by this PR.
