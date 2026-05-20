# SatyaVera — Feature catalog

> Companion to [`docs/architecture.md`](./architecture.md). That document
> describes **how** the system is built; this one is an exhaustive list of
> **what** ships today, organised by audience: end-users, advocates,
> administrators, and developers.

Every feature here is in the codebase on the `issue-3-c86d84590f77`
branch as of this commit. Items marked **Planned** are tracked but not
yet implemented; they are listed here so reviewers can see the seam
where a future PR will plug in.

## 1. End-user features (citizens)

### 1.1 GandhiAI chat — `dashboard/ask`

Conversational legal Q&A in English or Hindi.

- Streaming responses via the Vercel AI SDK (`text/event-stream`).
- Provider-swappable at deploy time: Anthropic Claude (default),
  OpenAI GPT-4o, or Google Gemini 2.0 Flash. The active provider is
  selected by `AI_PROVIDER` and shares one `LEGAL_SYSTEM_PROMPT` so
  behaviour is consistent across models.
- Cites specific sections of Indian Central Acts using the new
  Bharatiya codes (BNS / BNSS / BSA 2023) and falls back to the old
  IPC / CrPC / IEA references where relevant.
- Retrieval-augmented: `lib/ai/law-search.ts` pulls matching law text
  from Firestore before the model call and appends it to the prompt as
  authoritative context (see `architecture.md` § 5 "Law retrieval").
- Per-user rate limit (10 messages/minute) and per-day free-tier quota
  (`subscriptions/{uid}.queriesUsedToday`).
- Conversation history is persisted in
  `conversations/{id}/messages/{id}` and visible to the owner only
  (see `firestore.rules`).
- API: `POST /api/chat`, `GET /api/conversations`,
  `GET/POST /api/conversations/{id}/messages`.

### 1.2 Document drafter — `dashboard/drafter`

Generate properly formatted Indian legal documents.

- Supported types (`DocumentType` enum): `FIR`, `RTI`, `COMPLAINT`,
  `BAIL_APPLICATION`, `NOTICE`, `AGREEMENT`, `AFFIDAVIT`, `OTHER`.
- `generateLegalDocument(type, details)` in `lib/ai/providers.ts`
  produces the body with the same shared system prompt so citations
  follow the same format as chat answers.
- Documents are saved per-user under `documents/{id}` with `status`
  (`DRAFT` / `COMPLETED`) and a per-month quota counter.
- API: `POST /api/documents` (generate),
  `GET/PATCH/DELETE /api/documents` (manage drafts).

### 1.3 Rights guides — `dashboard/guides`

Step-by-step playbooks for common legal situations
(eviction, arrest, harassment, RTI filing, …).

- Each guide is a Firestore document under `guides/` with bilingual
  fields (`title`/`titleHi`, `description`/`descriptionHi`,
  `rights[]`/`rightsHi[]`, `steps[]`/`stepsHi[]`).
- Cross-linked to law sections via `relatedLawSections`.
- Admin-seeded by `npm run seed-guides`.
- API: `GET /api/guides`.

### 1.4 Legal-terms dictionary — `dashboard/dictionary`

4 200+ bilingual legal terms.

- Each entry stores `termEn`/`termHi`, `pronunciation`, `origin`
  (Sanskrit / Persian / etc.), category, definition (en/hi), example
  (en/hi), and links to related terms / sections.
- Admin-seeded by `npm run seed-dictionary`.
- API: `GET /api/dictionary`.

### 1.5 Document templates — `dashboard/templates`

Pre-formatted templates for FIRs, RTIs, notices, agreements, affidavits.

- Each template carries a `fields[]` schema (label/labelHi/type/required)
  so the UI renders a form to capture the placeholders.
- `premium: boolean` marks templates that require the Citizen Premium
  plan.
- Admin-seeded by `npm run seed-templates`.
- API: `GET /api/templates`.

### 1.6 Legal quizzes — `dashboard/quiz`

Bite-sized multiple-choice quizzes covering rights basics.

- `quizzes/{id}` metadata + `quizzes/{id}/questions/{n}` subcollection.
- Each question stores bilingual options, `correctIndex`, `explanation`,
  and an optional `lawReference`.
- User attempts are saved under
  `users/{uid}/quizAttempts/{id}` (owner-only access).
- Admin-seeded by `npm run seed-quizzes`.
- API: `GET /api/quizzes`, `GET /api/quizzes/{id}`,
  `POST /api/quizzes/{id}/submit`.

### 1.7 Lawyer marketplace — `dashboard/lawyers`

Browse and book Bar-Council-verified advocates.

- Filter by city, state, specialisation, language, courts.
- Public read on `lawyerProfiles/{uid}`; only the owning advocate can
  edit their card.
- Booking creates a `consultationRequests/{id}` row visible to both
  parties; the advocate can `ACCEPT` / `DECLINE` / mark `COMPLETED`.
- API: `GET /api/lawyers`, `POST/PATCH /api/consultations`.

### 1.8 Document scanner — `dashboard/scanner`

Upload a notice or summons and get a plain-language explanation
(invokes GandhiAI under the hood). UI exists; OCR backend is the next
slice and is wired through the same `/api/chat` streaming layer.

### 1.9 Emergency SOS — `dashboard/sos`

One-tap access to:

- Helpline numbers (police, women, child, senior citizen, legal aid).
- Rights during arrest / detention (Article 22, S. 47 BNSS).
- A profile-stored emergency contact (`users/{uid}.emergencyContact`).

Renders client-side so it works under poor connectivity. No server
calls are required after the profile is cached.

### 1.10 Legal-aid finder — `dashboard/legal-aid`

Static directory of free legal-aid options (DLSA, NALSA, NGOs)
indexed by state and topic.

### 1.11 Bilingual UI

- English and Hindi via JSON dictionaries
  (`lib/i18n/translations/{en,hi}.json`).
- The chosen language persists in `users/{uid}.language` and is shared
  across the chat, drafter, guides, and dictionary.
- Language toggle in the public nav, dashboard sidebar, and the SPA
  shell.

### 1.12 Authentication

- Firebase Authentication: Google, email/password, and phone OTP
  (planned UI for OTP; SDK wired).
- Forgot password flow at `(public)/forgot-password`.
- New users get a default `CITIZEN` profile written to `users/{uid}`
  on first sign-in.
- ID tokens are refreshed every 10 minutes so server verification stays
  fresh.

### 1.13 Subscriptions and payments

- Tiers: `FREE`, `CITIZEN_PREMIUM` (₹99/month, ₹999/year),
  `LAWYER_PRO` (₹499/month, ₹4 999/year).
- Razorpay integration (`lib/payments/razorpay.ts`).
- `POST /api/payments/create-order`, `POST /api/payments/verify`,
  `POST /api/payments/webhook`.
- Daily query counters and monthly document counters live in
  `subscriptions/{uid}` and are reset by date-string comparison.

### 1.14 User settings

`dashboard/settings` lets the user edit their profile, language,
emergency contact, notification preferences, and privacy preferences
(save-chat-history / analytics opt-in). Backed by `GET/PATCH /api/settings`.

## 2. Advocate features

### 2.1 Advocate dashboard — `advocate/`

A separate dashboard mounted under `(dashboard)/advocate/` and routed
to automatically when a user's `users/{uid}.role == "ADVOCATE"`.

### 2.2 Bare-acts library — `advocate/bare-acts`

Full-text browser for 846 Indian Central Acts (34 853 sections),
served from `laws/{slug}` and `laws/{slug}/sections/{n}`.

- Categories: Criminal, Civil, Constitutional, Property, Family,
  Labour, Consumer, Women, Corporate, Tax, Environment, Cyber,
  General — auto-assigned by `js/scripts/law-categories.ts`.
- API: `GET /api/laws`, `GET /api/laws/{slug}`,
  `GET /api/laws/{slug}/sections`.

### 2.3 Case-law search — `advocate/case-law`

Search interface for case citations. The current build links to public
sources; an indexed corpus is on the roadmap.

### 2.4 Drafter — `advocate/drafter`

Same drafter as the citizen surface but with the unlocked template set
(no premium gating) and additional document types for advocates.

### 2.5 Arguments generator — `advocate/arguments`

GandhiAI prompt variant tuned for "outline arguments for / against"
under the same `streamLegalChat` pipeline.

### 2.6 Profile + verification

Advocate sign-up captures Bar Council number, state, years of practice,
specialisations, courts, and fee schedule. The `verified: boolean` flag
is set by an admin after manual review (no automated verification yet).

## 3. Universal-app SPA shell (`/app`)

Issue #3 specifically calls for a `/app` route that "we will later be
able to use as a basis for web app, mobile app and desktop app". That
shell ships in this PR.

- File: `js/src/app/app/page.tsx` + `_components/SpaShell.tsx`.
- Hash router: `#/home`, `#/chat`, `#/guides`, `#/documents`, `#/about`.
- Static export safe: marked `dynamic = "force-static"`, no server
  imports, no Firebase Admin.
- Drop-in for Electron Forge (file://) and Capacitor (capacitor://)
  because the router never touches `window.location.pathname`.
- Reads `NEXT_PUBLIC_API_BASE` so the bundle can be repointed at the
  future Rust backend without code changes; falls back to
  `window.location.origin` for the colocated Next.js dev build.
- Shows current build metadata on the About view: static export flag,
  base path, API base.
- Surface area is intentionally minimal so it is easy to fold in the
  real feature modules one by one.

## 4. Public marketing surface

- `/` — landing page with hero, demo chat, pricing teaser, testimonials,
  disclaimer banner.
- `/pricing` — plan comparison.
- `/login`, `/signup`, `/forgot-password` — Firebase Auth flows.
- `/not-found`, `/error` — global 404 and error boundary.
- Schema.org JSON-LD embedded in `app/layout.tsx` (Organization +
  WebApplication) for SEO.
- Open Graph + Twitter card metadata.

## 5. Indian laws database

- Source: [`Svetozar-Technologies/indian-law`](https://github.com/Svetozar-Technologies/indian-law)
  (846 acts as `.lino` files).
- Ingestion script `js/scripts/ingest-laws.ts`:
  - `npm run ingest-laws -- --repo-path ../../indian-law` for the full
    run.
  - `npm run ingest-laws:dry` — parse only, no Firestore writes.
  - `npm run ingest-laws:test` — limit to 5 laws (with `--dry-run`).
  - `--force` re-ingests laws already present.
- Auto-categorisation by `js/scripts/law-categories.ts` (13 categories
  listed in §2.2).
- Snapshots persisted under `js/data/laws/` so a clean checkout has the
  same view of the data without re-running the ingestion.

## 6. Admin tooling

- `npm run seed-all` — seed guides + dictionary + templates + quizzes.
- `npm run seed-guides`, `npm run seed-dictionary`,
  `npm run seed-templates`, `npm run seed-quizzes` — granular seeds.
- `npm run set-admin -- <uid>` — flip the `admin` custom claim for a
  user (referenced from `firestore.rules` for write access on admin-
  managed collections).
- `npm run export-laws` — round-trip from Firestore back to JSON
  snapshots in `js/data/laws/`.

## 7. Storage layer (`rust/db/satyavera-db`)

The Rust crate that fulfils requirement R5 of issue #3.

- `KeyValueStore` trait — minimal `get` / `put` / `delete` contract.
- `MemoryStore` — default in-memory backend (BTree-backed).
- `TransactionalStore<S>` — decorator that:
  - Appends every mutation to an append-only `FileJournal` before
    touching the backing store.
  - Calls `File::sync_data` on every append so a process crash never
    loses a record.
  - Exposes `replay_from_journal()` to rebuild a store from the
    journal alone (issue requirement R5.3).
- Journal format: tab-separated, hex-encoded records — see
  `architecture.md` § 6.
- `link-cli` Cargo feature gates a placeholder `LinkCliStore` so the
  integration surface is documented today; wiring the real
  `link-cli` engine is a follow-up PR.
- Tests: `cargo test --all-features` exercises the round-trip
  contract (writes flow through; replay reconstructs equivalent
  state; reopening the journal appends instead of truncating).

## 8. Continuous integration features

Every check enforced by `.github/workflows/*` on every PR:

### JavaScript (`js.yml`)

| Check                       | Hard gate? | What it does                                                     |
| --------------------------- | ---------- | ---------------------------------------------------------------- |
| `detect-changes`            | n/a        | Skips downstream JS jobs when only docs change.                  |
| `check-file-line-limits`    | hard       | Rejects tracked JS/TS files > 1 500 lines.                       |
| `lint` → ESLint             | hard       | `npm run lint`.                                                  |
| `lint` → Prettier           | advisory   | `prettier --check` over JS/TS/JSON/MD/YAML. Will harden once the legacy tree is formatted. |
| `lint` → jscpd              | advisory   | Code-duplication detection. Will harden after dedup pass.        |
| `lint` → secretlint         | hard       | `@secretlint/secretlint-rule-preset-recommend`.                  |
| `build (firebase)`          | hard       | `npm run build` — Firebase App Hosting target.                   |
| `build (pages)`             | hard       | `npm run build:pages` — GitHub Pages static export.              |
| `pages-deploy`              | hard       | Push `js/out/` to GitHub Pages on push to `main`.                |
| `validate-docs`             | hard       | Docs files ≤ 2 500 lines; required docs (`README.md`, `AGENTS.md`, `docs/case-studies/issue-3/README.md`) exist. |

### Rust (`rust.yml`)

| Check                                     | Hard gate? |
| ----------------------------------------- | ---------- |
| `cargo fmt --all -- --check`              | hard       |
| `cargo clippy --all-targets --all-features` | hard     |
| `cargo build --all-features --verbose`    | hard       |
| `cargo test --all-features --verbose`     | hard       |
| Matrix: ubuntu-latest, macos-latest, windows-latest | hard |
| Cargo cache keyed on `Cargo.lock`         | n/a        |

### Documentation (`links.yml`)

| Check                                     | Hard gate? |
| ----------------------------------------- | ---------- |
| lychee broken-link checker (`.md` + `.html`) | hard    |

All three workflows share the concurrency policy "queue PR runs,
cancel older runs on `main`".

## 9. Developer experience

### Local development

```sh
cd js
npm ci
npm run dev          # Firebase target on http://localhost:3000

# GitHub Pages export
BASE_PATH=/SatyaVera NEXT_PUBLIC_BASE_PATH=/SatyaVera npm run build:pages
```

### Linting and formatting

`js/.prettierrc`, `js/.prettierignore`, `js/.jscpd.json`,
`js/.secretlintrc.json`, and the root `.lycheeignore` carry the
template-recommended config so local runs match CI.

### Type safety

`@/*` aliases to `js/src/*`. Every Firestore document interface is
declared once in `js/src/types/index.ts` (no per-route schema drift).

### Logger

`js/src/lib/logger.ts` exposes `logger.info / warn / error / debug` so
Route Handlers do not call `console.*` directly.

### Scripts

All Node scripts run through `tsx` so they share the same TypeScript
config as the app. Examples: `npm run ingest-laws`, `npm run seed-all`,
`npm run set-admin`.

### Rust

```sh
cd rust
cargo fmt --all -- --check
cargo clippy --all-targets --all-features
cargo test --all-features
```

The workspace forbids `unsafe_code`, enables all-clippy warnings, and
ships a release profile with LTO + 1 codegen unit + strip.

## 10. Documentation surface

| Path                                     | Purpose                                            |
| ---------------------------------------- | -------------------------------------------------- |
| `README.md`                              | Project overview, getting started, tech stack.     |
| `AGENTS.md` + `CLAUDE.md`                | Agent instructions for code contributors.          |
| `js/README.md`                           | Frontend workspace guide.                          |
| `rust/README.md`                         | Backend workspace guide + `satyavera-db` notes.    |
| `docs/architecture.md`                   | This system's architecture (companion to this doc).|
| `docs/features.md`                       | **This file** — feature catalog.                   |
| `docs/case-studies/issue-3/README.md`    | Deep dive on the JS/Rust split.                    |
| `docs/case-studies/issue-3/requirements.md` | Atomic requirements R1–R8.                      |
| `docs/case-studies/issue-3/research.md`  | Survey of upstream CI templates and `link-cli`.    |
| `docs/case-studies/issue-3/solutions.md` | Per-requirement chosen approach.                   |
| `docs/case-studies/issue-3/plan.md`      | Ordered execution plan + follow-ups.               |
| `docs/case-studies/issue-3/references.md`| External references and prior art.                 |

## 11. Planned features (tracked, not in this PR)

These items are documented here so the seam is visible. Each has a
case-study entry in
[`docs/case-studies/issue-3/plan.md`](./case-studies/issue-3/plan.md#follow-up-tracked-not-in-this-pr).

- Migrate Next.js `/api/*` endpoints to a Rust HTTP server (axum),
  one route at a time. The SPA shell already reads
  `NEXT_PUBLIC_API_BASE` so the cutover is configuration-only.
- Replace the placeholder `LinkCliStore` with the real `link-cli`
  storage handle behind the existing Cargo feature.
- Add Electron Forge (desktop) and Capacitor (mobile) build matrices
  to `js.yml`. Both wrap `js/out/` unchanged.
- Restore an optional Docker publish job once the Rust binary is a
  container target.
- Add `cargo audit` / `cargo deny` to `rust.yml`.
- Index a case-law corpus for advocate search.
- Wire OCR for the document scanner.
- File upstream issues against the four
  `link-foundation/*-ai-driven-development-pipeline-template` repos
  for the gaps catalogued in `docs/case-studies/issue-3/research.md`.

## 12. Legal disclaimer

SatyaVera provides legal **information**, not legal **advice**. Every
chat answer, drafted document, guide, and dictionary entry is generated
or seeded from public sources. Users are encouraged to consult a
qualified advocate for specific matters; the disclaimer banner in
`components/layout/disclaimer-banner.tsx` is shown in the dashboard
chrome and the public footer.
