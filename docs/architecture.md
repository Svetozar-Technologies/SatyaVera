# SatyaVera — Architecture

> Companion to [`docs/features.md`](./features.md) (what the system does) and
> [`docs/case-studies/issue-3/`](./case-studies/issue-3/README.md) (why the
> JS/Rust split landed). This document describes **how** the system is put
> together: the layers, the data flow, the deployment topology, and the
> contracts between components.

Audience: contributors who need to change the build, the API surface, the
storage layer, or the deployment pipeline.

## 1. High-level shape

SatyaVera is a bilingual (English / Hindi) AI legal-assistant for India,
shipping as:

1. A **Next.js 16 App Router** application (the production web app), and
2. A **client-only Single Page Application** at the `/app` route (the
   universal-app shell that will later be packaged into desktop / mobile
   wrappers).

The codebase is organised into two top-level workspaces so each language
has its own build, lint, and test pipeline:

```
satyavera/
├── js/        # All TypeScript / React / Next.js code (web + SPA shell).
├── rust/      # Cargo workspace. Storage + future HTTP API. No Node.
├── docs/      # Architecture, features, case studies.
├── .github/   # Per-language CI workflows: js.yml, rust.yml, links.yml.
└── firestore.rules / firestore.indexes.json / firebase.json
```

This split was driven by [issue #3](https://github.com/Svetozar-Technologies/SatyaVera/issues/3),
which calls for "all frontent related logic … in `./js`" and "all server
related logic … in `./rust`". The current state of the migration is:

| Concern                  | Lives in   | Status                                                                                  |
| ------------------------ | ---------- | --------------------------------------------------------------------------------------- |
| Web UI                   | `js/src/app/(public)`, `js/src/app/(dashboard)` | Production (Next.js App Router).                              |
| Universal SPA shell      | `js/src/app/app/`                              | Production (hash-routed, client-only).                        |
| HTTP / streaming API     | `js/src/app/api/*`                             | Production (Next.js Route Handlers; migrates to Rust later).  |
| Storage abstraction      | `rust/db/`                                     | Production (in-memory + journal; `link-cli` backend gated).   |
| Auth, profiles, sessions | `js/src/lib/firebase/*`                        | Production (Firebase Auth + Firestore).                       |
| Data ingestion           | `js/scripts/*`                                 | Production (Node scripts that write Firestore).               |

## 2. Two parallel build targets

The same Next.js source tree under `js/src/` produces **two artefacts**:

| Target | Trigger | Output | Used by |
| --- | --- | --- | --- |
| `output: "standalone"` | `npm run build` | `.next/standalone/` | Firebase App Hosting |
| `output: "export"` | `npm run build:pages` | `js/out/` | GitHub Pages (and later: Electron / Capacitor) |

This is governed entirely by environment variables (`STATIC_EXPORT`,
`BASE_PATH`, `NEXT_PUBLIC_BASE_PATH`) read in
[`js/next.config.ts`](../js/next.config.ts). No code changes are needed
between targets.

### Why two targets?

- **Firebase App Hosting** needs a Node runtime to host Route Handlers
  (`/api/*`), Firestore-backed dashboard pages, and `firebase-admin`.
- **GitHub Pages** is a static file host with no runtime — only assets
  that can be served as-is are allowed. Server-only routes are therefore
  pruned before the export.

### How the prune works

`npm run build:pages` shells out to
[`js/scripts/build-static-export.mjs`](../js/scripts/build-static-export.mjs).
That script:

1. Moves `src/app/api/`, `src/app/(dashboard)/`, `src/app/(public)/`, and
   `src/app/sitemap.ts` into `.static-export-stash/` (a sibling of `src/`).
2. Runs `STATIC_EXPORT=1 next build`. With those routes hidden, Next.js
   exports a tree that contains just `/`, `/app`, error pages, and assets.
3. **Always** restores the stashed paths — in a `try/finally`, plus
   `SIGINT`/`SIGTERM` handlers — so a failing build cannot leave the
   working tree mid-stash.

### Path prefixing

`BASE_PATH=/SatyaVera` (set by CI from `github.event.repository.name`)
makes Next.js emit absolute asset URLs under the repo's GitHub Pages
sub-path. The same value is mirrored as `NEXT_PUBLIC_BASE_PATH` so the
client bundle (e.g. `SpaShell.tsx`) can read it at runtime.

## 3. The `/app` SPA shell (universal-app basis)

`js/src/app/app/page.tsx` boots
[`js/src/app/app/_components/SpaShell.tsx`](../js/src/app/app/_components/SpaShell.tsx).
The shell is deliberately bare so it can be embedded by future desktop
and mobile wrappers without modification.

Properties of the shell:

- **`"use client"`** — no `getServerSideProps`, no server actions, no
  Firebase Admin. Renders in the browser only.
- **`dynamic = "force-static"`** at the route level so it survives the
  `output: "export"` pass.
- **Hash-based routing.** Routes (`home`, `chat`, `guides`, `documents`,
  `about`) live in the URL fragment, e.g. `#/guides`. This works under
  `file://` (Electron) and `capacitor://` (Capacitor) where path-based
  routing breaks because there is no server to map paths to `index.html`.
- **`NEXT_PUBLIC_API_BASE`** — when set, the shell points its `fetch`
  calls at an external API host (the future Rust backend). When unset,
  it falls back to `window.location.origin` so the development build
  keeps talking to the colocated Next.js Route Handlers.

The SPA shell intentionally renders **placeholder views** for `chat`,
`guides`, `documents`. Feature migration from `src/app/(dashboard)/*`
into the shell is tracked in
[`docs/case-studies/issue-3/plan.md`](./case-studies/issue-3/plan.md)
(item D).

## 4. Frontend layers (`js/src`)

```
src/
├── app/                  Next.js App Router routes (pages + Route Handlers).
│   ├── (public)/         Login, signup, pricing, forgot-password (Firebase Auth UI).
│   ├── (dashboard)/      Auth-gated citizen + advocate workspaces.
│   ├── app/              Universal SPA shell (see §3).
│   ├── api/              Server-side Route Handlers (see §5).
│   ├── layout.tsx        HTML shell, providers, JSON-LD, security metadata.
│   ├── page.tsx          Marketing landing page.
│   ├── sitemap.ts        Sitemap (excluded from static export).
│   ├── error.tsx         Error boundary.
│   ├── loading.tsx       Suspense fallback.
│   └── not-found.tsx     404 page.
├── components/
│   ├── ui/               Primitives: Button, Card, Chip, Icon, Field, LangToggle, …
│   ├── layout/           Layout shells: PublicNav, AppNav, Sidebar, Footer, DisclaimerBanner.
│   └── auth-guard.tsx    Wrap a dashboard subtree to require auth.
├── contexts/
│   └── auth-context.tsx  Firebase Auth state + profile bootstrap.
├── hooks/                Data hooks per Firestore collection (use-conversations, use-guides, …).
├── lib/
│   ├── firebase/         Client + admin SDK init, helpers, token verification.
│   ├── ai/               Multi-provider model selection + law-search RAG layer.
│   ├── api/              Route Handler helpers (rate limiter, auth, body validation).
│   ├── i18n/             Translation provider + JSON dictionaries (en, hi).
│   ├── payments/         Razorpay SDK wrapper and pricing tables.
│   └── logger.ts         Minimal structured logger.
└── types/
    └── index.ts          All shared TypeScript interfaces (Firestore docs + UI types).
```

### Provider stack

```
<AuthProvider>             # contexts/auth-context.tsx (Firebase Auth + profile fetch)
  <I18nProvider>           # lib/i18n/context.tsx (en/hi translation lookup)
    <RouteContent />
  </I18nProvider>
</AuthProvider>
```

`AuthProvider` is the source of truth for the current user: it subscribes
to `onAuthStateChanged`, fetches the matching `users/{uid}` profile, and
re-issues Firebase ID tokens every 10 minutes so Route Handlers can keep
verifying them.

### Internationalisation

`js/src/lib/i18n/translations/{en,hi}.json` are key→string maps consumed
by `useI18n().t(key)`. The language toggle persists the preference in
the user's profile (`users/{uid}.language`) and locally in the i18n
context. No server work is involved.

## 5. API layer (Next.js Route Handlers)

```
src/app/api/
├── chat/                 POST: stream a GandhiAI reply (SSE / text stream).
├── conversations/        CRUD for chat history (subcollection: messages).
├── documents/            CRUD for drafted legal documents (FIR, RTI, …).
├── guides/               Read seeded rights-guides.
├── dictionary/           Read seeded legal-terms dictionary.
├── templates/            Read seeded document templates.
├── quizzes/              Read quizzes, submit attempts.
├── laws/                 Read laws + sections (by slug / number).
├── lawyers/              Browse the marketplace; create/update advocate profiles.
├── consultations/        Citizen ↔ advocate booking requests.
├── subscriptions/        Plan status + per-day / per-month usage counters.
├── payments/             Razorpay: create-order, verify, webhook.
└── settings/             User-level preferences (notifications, privacy).
```

Each Route Handler follows the same pattern, codified in
`js/src/lib/api/helpers.ts`:

```ts
export async function POST(req: Request) {
  const decoded = await verifyAuthToken(req);    // 1. Firebase ID-token → uid.
  if (!decoded) return apiError("Unauthorized", 401);

  const { allowed } = rateLimit(`chat-${decoded.uid}`, 10);  // 2. Rate limit per uid.
  if (!allowed) return apiError("Too many requests", 429);

  if (validateContentType(req)) return /* 415 */;
  const body = await req.json();                  // 3. Parse + validate body.
  // … route-specific work (Firestore / AI provider / Razorpay) …
  return apiResponse(payload);
}
```

### Multi-provider AI

`js/src/lib/ai/providers.ts` exports `streamLegalChat()` and
`generateLegalDocument()`. The provider is chosen at request time by the
`AI_PROVIDER` env var:

| `AI_PROVIDER` | SDK package          | Model                       |
| ------------- | -------------------- | --------------------------- |
| `claude`*     | `@ai-sdk/anthropic`  | `claude-sonnet-4-20250514`  |
| `openai`      | `@ai-sdk/openai`     | `gpt-4o`                    |
| `gemini`      | `@ai-sdk/google`     | `gemini-2.0-flash`          |

\* default

The same `LEGAL_SYSTEM_PROMPT` is used for every provider so behaviour
stays consistent across swaps. The prompt encodes the Bharatiya
Nyaya/Nagarik/Sakshya 2023 codes (BNS/BNSS/BSA) replacing IPC/CrPC/IEA.

### Law retrieval (RAG)

`js/src/lib/ai/law-search.ts` is a lightweight retriever invoked before
the chat call:

1. Match the user's query against a fixed `ACT_ALIASES` table (bns →
   `the-bharatiya-nyaya-sanhita-2023`, etc.).
2. Extract explicit section numbers (`Section 302`, `§ 483`).
3. Pull matching documents from Firestore (`laws/{slug}` and
   `laws/{slug}/sections/{n}`).
4. Format the results as a system-prompt suffix so the model grounds its
   answer on the cited text.

This avoids embedding-based vector search for the first cut and keeps
the dependency surface small.

## 6. Backend / Rust workspace (`rust/`)

```
rust/
├── Cargo.toml          # Workspace: members = ["db"]. unsafe_code = forbid. LTO release.
├── README.md
└── db/                 # The satyavera-db crate.
    ├── Cargo.toml
    ├── src/lib.rs      # KeyValueStore trait + TransactionalStore + Mutation enum.
    └── tests/transactional.rs
```

### `satyavera-db`

The crate satisfies requirement R5 of issue #3: every mutation is appended
to an external journal file so the database can be reconstructed from the
journal alone, even if the live store is lost.

Public surface:

```rust
pub trait KeyValueStore {
    fn get(&self, key: &str) -> Result<Option<String>, DbError>;
    fn put(&mut self, key: &str, value: &str) -> Result<(), DbError>;
    fn delete(&mut self, key: &str) -> Result<(), DbError>;
}

pub enum Mutation { Put { key, value }, Delete { key } }

pub struct TransactionalStore<S: KeyValueStore> { /* inner + FileJournal */ }

impl<S: KeyValueStore> TransactionalStore<S> {
    pub fn new(inner: S, journal: FileJournal) -> Self;
    pub fn get(&self, key: &str) -> Result<Option<String>, DbError>;
    pub fn put(&mut self, key: &str, value: &str) -> Result<(), DbError>;
    pub fn delete(&mut self, key: &str) -> Result<(), DbError>;
    pub fn replay_from_journal(inner: S, journal_path: impl AsRef<Path>) -> Result<S, DbError>;
}
```

### Journal format

One line per record, tab-separated, hex-encoded so tabs and newlines in
keys/values cannot break the framing:

```
P\t<hex-key>\t<hex-value>     // put
D\t<hex-key>                  // delete
```

Hex was chosen over base64 to keep the dependency tree minimal — the
encoder/decoder is a few lines in `lib.rs` with `String::from_utf8` for
validation.

### Crash-safety contract

The decorator journals first and stores second:

1. `journal.append(mutation)?` — fsyncs to disk (`File::sync_data`).
2. `inner.put(key, value)?` — mutates the in-memory map (or future
   `link-cli` engine).

Failure modes:

- **Journal write fails** → the inner store is untouched and the caller
  sees the error.
- **Inner write fails after a journal append** → the journal record is
  the source of truth; replaying the journal reconstructs the right
  state. The in-process error tells the caller to abort.
- **Process crash between the two** → on next start, the operator runs
  `replay_from_journal()` against an empty (or any) `KeyValueStore` and
  the inner state converges to the journal's authoritative view.

### `link-cli` integration

The `link-cli` Cargo feature gates a placeholder `LinkCliStore` that
implements `KeyValueStore`. The default backend in this PR is
`MemoryStore` so the contract is unit-testable in CI without pulling the
full `link-cli` dependency graph. Wiring the actual `link-cli` storage
handle is a follow-up slice (see `docs/case-studies/issue-3/plan.md`
item C).

### Future shape

The same workspace will grow `rust/api/` (axum HTTP server) and
`rust/cli/` (operator CLI). Each Next.js `/api/*` endpoint will be
migrated one at a time; the SPA shell already reads
`NEXT_PUBLIC_API_BASE` so it can be repointed without code changes.

## 7. Data model (Firestore)

Today's persistence layer is Cloud Firestore. Security rules live in
[`firestore.rules`](../firestore.rules); indexes in
[`firestore.indexes.json`](../firestore.indexes.json).

| Collection                          | Owner    | Read     | Write    | Purpose                                           |
| ----------------------------------- | -------- | -------- | -------- | ------------------------------------------------- |
| `users/{uid}`                       | user     | self/admin | self    | Profile, role (`CITIZEN`/`ADVOCATE`/`ADMIN`), prefs |
| `users/{uid}/quizAttempts/{id}`     | user     | self     | self     | Quiz history                                      |
| `conversations/{id}`                | user     | owner    | owner    | GandhiAI chat sessions                            |
| `conversations/{id}/messages/{id}`  | user     | owner    | owner    | Messages inside a conversation                    |
| `documents/{id}`                    | user     | owner    | owner    | Drafted legal documents                           |
| `subscriptions/{uid}`               | user     | self     | self     | Plan + counters (queries/day, docs/month)         |
| `laws/{slug}`                       | admin    | public   | admin    | Indian Central Act metadata (846 laws)            |
| `laws/{slug}/sections/{n}`          | admin    | public   | admin    | Full section text (34,853 sections)               |
| `guides/{id}`                       | admin    | public   | admin    | Rights situation guides                           |
| `templates/{id}`                    | admin    | public   | admin    | Document templates (FIR, RTI, …)                  |
| `dictionaryEntries/{id}`            | admin    | public   | admin    | Legal-terms dictionary (en/hi)                    |
| `quizzes/{id}`                      | admin    | public   | admin    | Quiz metadata                                     |
| `quizzes/{id}/questions/{n}`        | admin    | auth     | admin    | Quiz questions                                    |
| `lawyerProfiles/{uid}`              | advocate | public   | self     | Marketplace listings                              |
| `consultationRequests/{id}`         | mixed    | parties  | parties  | Citizen ↔ advocate bookings                       |
| `meta/{id}`                         | admin    | public   | admin    | Category lookups, stats                           |

TypeScript interfaces for every `*Doc` are declared in
[`js/src/types/index.ts`](../js/src/types/index.ts) so the API layer and
the seed scripts stay in lock-step.

### Custom claims

Admin pages and writes rely on Firebase Auth's custom claims
(`request.auth.token.admin == true`). The
[`js/scripts/set-admin.ts`](../js/scripts/set-admin.ts) script flips the
claim for a given uid out of band.

## 8. Authentication and authorisation

### End-user flow

1. The user signs in via `AuthProvider` (Google / email / phone OTP).
2. `AuthProvider` calls `getUserProfile(uid)`; if absent it creates a
   default `users/{uid}` doc with `role = CITIZEN, language = en`.
3. On role-aware sign-in, the provider routes to `/advocate` or
   `/dashboard`.
4. Every 10 minutes the provider forces an ID-token refresh so server
   verification never sees a stale token.

### Server-side guard

`js/src/lib/firebase/admin.ts#verifyAuthToken` strips the
`Authorization: Bearer <jwt>` header and runs it through
`firebase-admin/auth#verifyIdToken`. The decoded token includes the uid
and any custom claims. All Route Handlers call this before touching
Firestore.

### Rate limiting

`js/src/lib/api/rate-limiter.ts` is a process-local sliding-window
limiter keyed on `<route-name>-<uid>`. It's good enough for the
single-instance Firebase App Hosting backend but will be replaced by a
shared-state limiter (Redis / Firestore counter) when the Rust API ships.

### Subscription gating

Free tier users get a fixed quota (queries/day, documents/month) tracked
in `subscriptions/{uid}`. Route Handlers consult that document before
calling the AI provider and increment counters atomically.

## 9. Data ingestion and seeding

Bulk Firestore writes are out-of-band scripts living in
[`js/scripts/`](../js/scripts) and runnable via `npm run`:

| Script                  | Source                                                | Target collection         |
| ----------------------- | ----------------------------------------------------- | ------------------------- |
| `ingest-laws.ts`        | `Svetozar-Technologies/indian-law` (`.lino` files)    | `laws`, `laws/*/sections` |
| `parse-lino.ts`         | (library used by `ingest-laws`)                       | —                         |
| `law-categories.ts`     | category heuristics (13 buckets)                      | `meta`                    |
| `export-laws.ts`        | Firestore                                             | `js/data/laws/*.json`     |
| `seed-guides.ts`        | inline TS dataset                                     | `guides`                  |
| `seed-dictionary.ts`    | inline TS dataset (4 200+ terms)                      | `dictionaryEntries`       |
| `seed-templates.ts`     | inline TS dataset                                     | `templates`               |
| `seed-quizzes.ts`       | inline TS dataset                                     | `quizzes`                 |
| `set-admin.ts`          | (manual)                                              | Firebase Auth custom claim |

Scripts read service-account creds from the same env vars as
`firebase-admin` (`FIREBASE_ADMIN_*`). `npm run ingest-laws:dry` exercises
the parser without writing.

## 10. Continuous integration and delivery

CI is split into three workflows, one per concern, mirroring the
upstream templates at `link-foundation/*-ai-driven-development-pipeline-template`.

### `.github/workflows/js.yml` — JavaScript

| Job                       | Purpose                                                    |
| ------------------------- | ---------------------------------------------------------- |
| `detect-changes`          | Emit booleans for js / docs / workflow paths.              |
| `check-file-line-limits`  | Reject tracked `js/**/*.{ts,tsx,js,jsx,mjs,cjs}` > 1500 LOC. |
| `lint`                    | ESLint (hard); Prettier + jscpd (advisory); secretlint (hard). |
| `build (firebase)`        | `npm run build` — Firebase App Hosting target.             |
| `build (pages)`           | `npm run build:pages` — GitHub Pages export.               |
| `pages-deploy`            | Upload `js/out/` and publish via `actions/deploy-pages@v4` (push to `main` only). |
| `validate-docs`           | Reject docs > 2 500 LOC; assert required doc files exist.  |

### `.github/workflows/rust.yml` — Rust

| Job   | Purpose                                                                                  |
| ----- | ---------------------------------------------------------------------------------------- |
| `lint` | `cargo fmt --check`, `cargo clippy --all-targets --all-features`, with cargo cache.     |
| `test` | `cargo test --all-features` on `ubuntu-latest`, `macos-latest`, `windows-latest`.       |

### `.github/workflows/links.yml` — Broken-link check

Runs lychee against every `*.md` / `*.html` in the repo on every push /
PR that touches Markdown or HTML, with `.lycheeignore` and the lychee
cache for resilience.

### Concurrency and triggers

- `js.yml`: queue PR runs, cancel older runs on `main`.
- `rust.yml`: scoped to `rust/**` paths only; same concurrency strategy.
- `links.yml`: scoped to `*.md` / `*.html` changes.

## 11. Deployment topology

### Production web app (Firebase App Hosting)

`js/apphosting.yaml` drives the App Hosting backend. After the migration
to `./js/`, the App Hosting backend's **Root directory** setting
(Firebase console → App Hosting → backend → Settings) must be `js`. The
build target (`output: "standalone"`) and `apphosting.yaml` contents are
unchanged.

Firestore + Firebase Auth + Firebase Storage are configured at the
project level (no per-service URLs are baked into the bundle).

### Public Pages site

`pages-deploy` in `js.yml` publishes `js/out/` to GitHub Pages on every
push to `main`. The site is served from
`https://<owner>.github.io/SatyaVera/`, which is why the Pages build
sets `BASE_PATH=/SatyaVera`.

A one-time repo setting (Settings → Pages → Source → **GitHub Actions**)
is required; it cannot be set from a workflow.

### Future Rust API

The `rust/` workspace targets a self-hosted axum server. The web app and
the SPA shell will switch to it by setting `NEXT_PUBLIC_API_BASE`; no
code change is needed for the cutover.

### Desktop / mobile (planned)

Electron Forge (desktop) and Capacitor (mobile) will wrap `js/out/`
unchanged. The hash-routed `/app` SPA is the entry point — see
`docs/case-studies/issue-3/solutions.md` for the decision record.

## 12. Cross-cutting concerns

### Security headers

Set in `next.config.ts` for the Firebase target only (static export can't
emit response headers). The CSP whitelists Firebase, Razorpay,
fonts.googleapis.com, and the Google identity toolkit; everything else
is `'self'`.

### Logging

`js/src/lib/logger.ts` is a thin wrapper that prefixes log lines with
the deployment target and a level. Route Handlers also `console.error`
on unhandled failures so they surface in Firebase / Cloud Run logs.

### Error handling

- Client: `js/src/app/error.tsx` and `not-found.tsx` are the global
  boundaries.
- Server: `apiError(message, status)` and `apiResponse(data, status)`
  in `js/src/lib/api/helpers.ts` normalise every Route Handler reply.

### Type-safety boundary

Every Firestore document interface in `js/src/types/index.ts` is
suffixed `Doc`. UI-facing interfaces drop the suffix and convert
`unknown` timestamp fields to `Date`. The boundary is enforced by
hand-written converters in `js/src/hooks/use-*.ts` for now (no
`zod`/`io-ts`); see the case study for the trade-off.

## 13. Where each issue requirement lives

The case study at
[`docs/case-studies/issue-3/`](./case-studies/issue-3/README.md) cross-references
every requirement (R1–R8) to its implementation. Quick index:

| Requirement | Implementation pointer                                                  |
| ----------- | ----------------------------------------------------------------------- |
| R1 Pages    | `js/next.config.ts`, `js/scripts/build-static-export.mjs`, `js.yml`.    |
| R2 SPA      | `js/src/app/app/page.tsx`, `js/src/app/app/_components/SpaShell.tsx`.   |
| R3 split    | This document, `js/README.md`, `rust/README.md`.                        |
| R4 dist     | `js.yml#pages-deploy`; desktop/mobile planned in case study.            |
| R5 db       | `rust/db/` — `TransactionalStore`, `FileJournal`, journal format above. |
| R6 best     | `.github/workflows/js.yml`, `rust.yml`, `links.yml`.                    |
| R7 case     | `docs/case-studies/issue-3/`.                                           |
| R8 single PR | [#4](https://github.com/Svetozar-Technologies/SatyaVera/pull/4).       |

## 14. Open questions and follow-ups

Tracked in `docs/case-studies/issue-3/plan.md` under "Follow-up":

- Move Next.js `/api/*` endpoints to the Rust HTTP server one slice at a time.
- Wire the real `link-cli` storage backend behind the existing Cargo feature.
- Activate Electron / Capacitor build matrices in `js.yml` once the SPA shell
  hosts non-placeholder views.
- Add `cargo audit` / `cargo deny` to the Rust workflow.
- File upstream issues against the four `link-foundation/*-ai-driven-development-pipeline-template`
  repos for the gaps observed in `docs/case-studies/issue-3/research.md`.
