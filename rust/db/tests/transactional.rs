//! Round-trip integration test for the transactional storage layer.
//!
//! Proves requirement R5.3 of issue #3: the journal file alone is
//! sufficient to reconstruct the database state. The test writes through
//! a `TransactionalStore`, drops the store, and then replays the same
//! journal into a brand-new empty store. The replayed state must match
//! the pre-drop state exactly.

use satyavera_db::{file_journal::FileJournal, KeyValueStore, MemoryStore, TransactionalStore};
use tempfile::tempdir;

#[test]
fn put_delete_then_replay_reproduces_state() {
    let dir = tempdir().expect("tempdir");
    let journal_path = dir.path().join("changes.log");

    {
        let journal = FileJournal::create(&journal_path).expect("create journal");
        let mut store = TransactionalStore::new(MemoryStore::default(), journal);

        store.put("user:1", "Aanya").expect("put user:1");
        store.put("user:2", "Bharat").expect("put user:2");
        store.put("user:1", "Aanya R.").expect("put user:1 again");
        store.delete("user:2").expect("delete user:2");
        store
            .put("note:tab\there", "value\nwith\nnewlines")
            .expect("put with separators");

        assert_eq!(store.get("user:1").unwrap(), Some("Aanya R.".to_owned()));
        assert_eq!(store.get("user:2").unwrap(), None);
        assert_eq!(
            store.get("note:tab\there").unwrap(),
            Some("value\nwith\nnewlines".to_owned()),
        );
    } // drop the store; only the journal file remains

    // Reconstruct from the journal alone.
    let recovered = TransactionalStore::replay_from_journal(MemoryStore::default(), &journal_path)
        .expect("replay");

    assert_eq!(
        recovered.get("user:1").unwrap(),
        Some("Aanya R.".to_owned())
    );
    assert_eq!(recovered.get("user:2").unwrap(), None);
    assert_eq!(
        recovered.get("note:tab\there").unwrap(),
        Some("value\nwith\nnewlines".to_owned()),
    );
}

#[test]
fn replay_of_missing_journal_yields_empty_store() {
    let dir = tempdir().expect("tempdir");
    let missing = dir.path().join("does-not-exist.log");
    let recovered =
        TransactionalStore::replay_from_journal(MemoryStore::default(), &missing).expect("replay");
    assert_eq!(recovered.get("anything").unwrap(), None);
}

#[test]
fn open_appends_without_truncating() {
    let dir = tempdir().expect("tempdir");
    let journal_path = dir.path().join("changes.log");

    {
        let journal = FileJournal::create(&journal_path).expect("create");
        let mut store = TransactionalStore::new(MemoryStore::default(), journal);
        store.put("k", "v1").unwrap();
    }
    {
        let journal = FileJournal::open(&journal_path).expect("open");
        let mut store = TransactionalStore::new(MemoryStore::default(), journal);
        store.put("k", "v2").unwrap();
    }

    let recovered =
        TransactionalStore::replay_from_journal(MemoryStore::default(), &journal_path).unwrap();
    assert_eq!(recovered.get("k").unwrap(), Some("v2".to_owned()));
}
