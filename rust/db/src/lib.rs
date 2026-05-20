//! Transactional storage layer for SatyaVera.
//!
//! This crate satisfies requirement R5 of issue #3: wrap every mutating
//! call in a journal so the database can be reconstructed from the
//! journal file alone. The default backend is an in-memory map so the
//! transactional contract has a unit-testable proof-of-concept that
//! runs without pulling the full `link-cli` dependency tree.
//!
//! The `link-cli` Cargo feature wires the same `KeyValueStore`
//! interface to a `link-cli`-backed store; that integration is left
//! pending and behind a feature flag.

#![deny(missing_docs)]

use std::collections::BTreeMap;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};

/// Error type returned by every fallible operation in this crate.
#[derive(Debug, thiserror::Error)]
pub enum DbError {
    /// Filesystem or journal-write failure.
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
    /// Journal record was syntactically malformed.
    #[error("malformed journal record: {0}")]
    Corrupt(String),
}

/// Minimal key/value contract every storage backend must satisfy.
pub trait KeyValueStore {
    /// Read the current value for `key`.
    fn get(&self, key: &str) -> Result<Option<String>, DbError>;
    /// Apply a `put` to the backing store.
    fn put(&mut self, key: &str, value: &str) -> Result<(), DbError>;
    /// Apply a `delete` to the backing store.
    fn delete(&mut self, key: &str) -> Result<(), DbError>;
}

/// Append-only file journal. One record per line:
///
/// ```text
/// P\t<hex-key>\t<hex-value>
/// D\t<hex-key>
/// ```
///
/// Hex encoding keeps tabs and newlines from leaking into a record and
/// keeps the crate dependency-light (no base64 crate needed).
pub mod file_journal {
    use super::{DbError, Mutation};
    use std::fs::OpenOptions;
    use std::io::Write;
    use std::path::{Path, PathBuf};

    /// On-disk append-only journal.
    pub struct FileJournal {
        path: PathBuf,
    }

    impl FileJournal {
        /// Create (or truncate) the journal at `path`.
        pub fn create(path: impl AsRef<Path>) -> Result<Self, DbError> {
            let path = path.as_ref().to_path_buf();
            // Touch the file so callers can rely on it existing.
            OpenOptions::new()
                .create(true)
                .truncate(true)
                .write(true)
                .open(&path)?;
            Ok(Self { path })
        }

        /// Open an existing journal at `path`, creating it if missing
        /// (without truncating).
        pub fn open(path: impl AsRef<Path>) -> Result<Self, DbError> {
            let path = path.as_ref().to_path_buf();
            OpenOptions::new().create(true).append(true).open(&path)?;
            Ok(Self { path })
        }

        /// Path the journal was created with.
        #[must_use]
        pub fn path(&self) -> &Path {
            &self.path
        }

        /// Append a single mutation record to the journal and flush.
        pub fn append(&mut self, mutation: &Mutation) -> Result<(), DbError> {
            let mut file = OpenOptions::new().append(true).open(&self.path)?;
            let line = match mutation {
                Mutation::Put { key, value } => {
                    format!("P\t{}\t{}\n", super::encode(key), super::encode(value))
                }
                Mutation::Delete { key } => {
                    format!("D\t{}\n", super::encode(key))
                }
            };
            file.write_all(line.as_bytes())?;
            file.flush()?;
            file.sync_data()?;
            Ok(())
        }
    }
}

/// A single mutation against the store.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Mutation {
    /// Set `key` to `value`.
    Put {
        /// Key being written.
        key: String,
        /// New value for the key.
        value: String,
    },
    /// Remove `key`.
    Delete {
        /// Key being removed.
        key: String,
    },
}

/// In-memory `KeyValueStore` used by tests and as the default backend.
#[derive(Debug, Default)]
pub struct MemoryStore {
    data: BTreeMap<String, String>,
}

impl KeyValueStore for MemoryStore {
    fn get(&self, key: &str) -> Result<Option<String>, DbError> {
        Ok(self.data.get(key).cloned())
    }
    fn put(&mut self, key: &str, value: &str) -> Result<(), DbError> {
        self.data.insert(key.to_owned(), value.to_owned());
        Ok(())
    }
    fn delete(&mut self, key: &str) -> Result<(), DbError> {
        self.data.remove(key);
        Ok(())
    }
}

/// Decorator that journals every mutation before applying it.
///
/// Ordering matters: we **journal first, store second**. If the journal
/// write fails we never mutate the store. If the store write fails after
/// a successful journal append the journal record is correct (it will
/// re-apply on the next replay) but the in-memory state is rolled back
/// by returning the error to the caller.
pub struct TransactionalStore<S: KeyValueStore> {
    inner: S,
    journal: file_journal::FileJournal,
}

impl<S: KeyValueStore> TransactionalStore<S> {
    /// Wrap `inner` with `journal`. The journal must already exist;
    /// use [`file_journal::FileJournal::create`] or [`open`](file_journal::FileJournal::open).
    pub fn new(inner: S, journal: file_journal::FileJournal) -> Self {
        Self { inner, journal }
    }

    /// Borrow the underlying store (read-only).
    pub fn inner(&self) -> &S {
        &self.inner
    }

    /// Read a key from the underlying store.
    pub fn get(&self, key: &str) -> Result<Option<String>, DbError> {
        self.inner.get(key)
    }

    /// Append a `Put` to the journal and apply it to the store.
    pub fn put(&mut self, key: &str, value: &str) -> Result<(), DbError> {
        self.journal.append(&Mutation::Put {
            key: key.to_owned(),
            value: value.to_owned(),
        })?;
        self.inner.put(key, value)
    }

    /// Append a `Delete` to the journal and apply it to the store.
    pub fn delete(&mut self, key: &str) -> Result<(), DbError> {
        self.journal.append(&Mutation::Delete {
            key: key.to_owned(),
        })?;
        self.inner.delete(key)
    }

    /// Replay a journal file into a fresh store.
    pub fn replay_from_journal(mut inner: S, journal_path: impl AsRef<Path>) -> Result<S, DbError> {
        let path: PathBuf = journal_path.as_ref().to_path_buf();
        if !path.exists() {
            return Ok(inner);
        }
        let file = File::open(&path)?;
        let reader = BufReader::new(file);
        for line in reader.lines() {
            let line = line?;
            if line.is_empty() {
                continue;
            }
            let mut parts = line.split('\t');
            match parts.next() {
                Some("P") => {
                    let key = parts
                        .next()
                        .ok_or_else(|| DbError::Corrupt("P missing key".into()))?;
                    let value = parts
                        .next()
                        .ok_or_else(|| DbError::Corrupt("P missing value".into()))?;
                    inner.put(&decode(key)?, &decode(value)?)?;
                }
                Some("D") => {
                    let key = parts
                        .next()
                        .ok_or_else(|| DbError::Corrupt("D missing key".into()))?;
                    inner.delete(&decode(key)?)?;
                }
                Some(other) => {
                    return Err(DbError::Corrupt(format!("unknown record type {other:?}")));
                }
                None => {}
            }
        }
        Ok(inner)
    }
}

// Tiny dependency-free hex encoder/decoder. Hex is unambiguous over a
// tab/newline-separated record format and avoids pulling base64.
fn encode(s: &str) -> String {
    let mut out = String::with_capacity(s.len() * 2);
    for byte in s.as_bytes() {
        out.push_str(&format!("{byte:02x}"));
    }
    out
}

fn decode(s: &str) -> Result<String, DbError> {
    if !s.len().is_multiple_of(2) {
        return Err(DbError::Corrupt(format!("odd-length hex: {s}")));
    }
    let mut bytes = Vec::with_capacity(s.len() / 2);
    let chars: Vec<char> = s.chars().collect();
    for chunk in chars.chunks(2) {
        let pair: String = chunk.iter().collect();
        let byte = u8::from_str_radix(&pair, 16)
            .map_err(|e| DbError::Corrupt(format!("invalid hex {pair}: {e}")))?;
        bytes.push(byte);
    }
    String::from_utf8(bytes).map_err(|e| DbError::Corrupt(format!("invalid utf-8: {e}")))
}

/// Optional `link-cli`-backed implementation. The integration surface is
/// documented but the actual wiring is deferred to a follow-up PR (see
/// `docs/case-studies/issue-3/plan.md`).
#[cfg(feature = "link-cli")]
pub mod link_cli_store {
    use super::{DbError, KeyValueStore};

    /// Placeholder for a `link-cli`-backed store. Today it just routes
    /// through the in-memory map so feature-gated builds still link.
    /// Replace the inner type with the real `link_cli` storage handle
    /// once the API binding is finalised.
    #[derive(Debug, Default)]
    pub struct LinkCliStore {
        inner: super::MemoryStore,
    }

    impl KeyValueStore for LinkCliStore {
        fn get(&self, key: &str) -> Result<Option<String>, DbError> {
            self.inner.get(key)
        }
        fn put(&mut self, key: &str, value: &str) -> Result<(), DbError> {
            self.inner.put(key, value)
        }
        fn delete(&mut self, key: &str) -> Result<(), DbError> {
            self.inner.delete(key)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_round_trip() {
        let cases = [
            "",
            "hello",
            "with tab\tand newline\n",
            "नमस्ते",
            "key\twith\tseparators",
        ];
        for s in cases {
            assert_eq!(decode(&encode(s)).unwrap(), s);
        }
    }

    #[test]
    fn decode_rejects_garbage() {
        assert!(decode("ZZ").is_err());
        assert!(decode("abc").is_err());
    }
}
