# `./rust` — Server code

This folder is the home for **all server-side code** (issue #3,
requirement R3.2). The Rust API now owns every runtime `/api/*` endpoint;
the Next.js application under `../js` is frontend-only.

## Layout

```
rust/
  README.md
  Cargo.toml        # workspace
  api/              # Axum HTTP server — owns /api/*
    Cargo.toml
    src/lib.rs      # router + public route contract
    src/handlers.rs # endpoint handlers
    tests/api_routes.rs
  db/               # storage crate — transactional wrapper over link-cli
    Cargo.toml
    src/lib.rs
    tests/transactional.rs
  # cli/            # (planned) operator CLI — follow-up
```

## `api` crate — Rust HTTP server

The `satyavera-api` binary is an Axum server with route parity for the
former Next.js API surface: chat, conversations, documents, public catalog
data, laws, lawyers, consultations, subscriptions, settings, and Razorpay
webhooks.

```bash
cd rust
SATYAVERA_API_AUTH_DISABLED=1 cargo run -p satyavera-api
```

Useful environment variables:

- `SATYAVERA_API_BIND` — listen address, default `127.0.0.1:8787`.
- `SATYAVERA_API_AUTH_DISABLED=1` — local/test auth bypass.
- `FIREBASE_PROJECT_ID` — Firebase project used to verify ID tokens.
- `SATYAVERA_LAWS_DATA_DIR` — directory of law JSON snapshots; defaults
  to `../js/data/laws` when present.
- `SATYAVERA_API_JOURNAL_PATH` — optional append-only mutation journal.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
  `RAZORPAY_WEBHOOK_SECRET` — payment integration settings.

The public route contract is captured in `api/src/lib.rs` as
`API_ROUTE_SPECS` and is tested in `api/tests/api_routes.rs` so future
changes cannot silently move endpoint ownership back into Next.js.

## `db` crate — transactional store over link-cli

The `db` crate implements requirement R5: it depends on
[link-cli](https://github.com/link-foundation/link-cli) as a library and
wraps every mutating call in a `TransactionalStore` that appends each
write to a journal file. The journal alone is sufficient to reconstruct
the database (R5.3).

The default backend in this PR is a tiny in-memory map so the
transactional contract has a unit-testable proof-of-concept that runs in
CI without the heavy `link-cli` dependency tree. The `link-cli` backend
is gated behind the `link-cli` Cargo feature and is wired (but not yet
fully implemented) to demonstrate the integration surface.

```rust
use satyavera_db::{file_journal::FileJournal, KeyValueStore, MemoryStore, TransactionalStore};

let journal = FileJournal::create("changes.log")?;
let mut store = TransactionalStore::new(MemoryStore::default(), journal);

store.put("user:42", "Aanya")?;        // ← appended to changes.log
store.put("user:42", "Aanya R.")?;     // ← appended to changes.log
assert_eq!(store.get("user:42")?, Some("Aanya R.".into()));

// Recover from the journal alone:
let recovered = TransactionalStore::replay_from_journal(
    MemoryStore::default(),
    "changes.log",
)?;
assert_eq!(recovered.get("user:42")?, Some("Aanya R.".into()));
```

See `db/tests/transactional.rs` for the full round-trip test.

## Building

```bash
cd rust
cargo fmt --all -- --check
cargo clippy --all-targets --all-features
cargo test --all-features
```

CI runs the same commands on Ubuntu, macOS, and Windows
(`.github/workflows/rust-ci.yml`).

## Why a transactional layer?

Issue #3 explicitly requires that "all changes to database" are repeated
in a "separate file, so it will be easier to reconstruct database if it
is broken". The journal file is that separate file. The properties we
preserve:

1. **Atomicity at record level** — each write either lands in the
   journal and then in the store, or fails before either side mutates.
2. **Forward recoverability** — replaying the journal on an empty store
   reproduces every put/delete.
3. **Independence** — the journal is decoupled from the storage
   backend, so we can swap the in-memory map for `link-cli` (or any
   future engine) without rewriting recovery logic.
