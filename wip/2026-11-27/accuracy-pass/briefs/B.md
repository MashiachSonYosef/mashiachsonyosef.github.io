# Helper B: the footing — every source pinned by sha256

**Question.** For each of the 39 books and each of the 29 source families (the twelve Bible dictionaries first): what file did we receive, what is its sha256, where does this repository pin it, do the bytes hashed again today match, and which check re-hashes it on every build?

Work from: `data/mam-restore-v5-rights-v1.json` (each book's `restore_surface_sha256`), `data/serve-gate-receipt-v1.json` (`served_sha256` per zone), `data/pins-not-kept-v1.json` (53 hashes of pins that were not kept: start here, each is a named gap), `data/source-corpus-v1.json`, `data/dictionary-kinds-v1.json` (each family's `files`), `data/route-store/index.json` (`inputs`, `declarations_sha256`, `store_version`), every `PIN.json` under `data/`, `data/store-path-map-v1.json`, and the checks `tools/check-*.mjs` (grep for sha256 and for each pin's name).

For each source: (1) the chain from the file as the provider published it, to the file the corpus lane received, to the rows we serve; say where each link is hashed and where it is only asserted; (2) fetch the received file from the store where it is under about 100 MB and hash it yourself; for larger ones hash what the store's listing and the corpus lane's receipts give and say you did not re-hash; (3) the check that would fail if the bytes changed, or «none».

For the 39 books: re-hash every served zone against `served_sha256`; find what `restore_surface_sha256` is a hash of, fetch that surface for at least 5 books and re-hash; say whether a check binds the zone we serve to that surface, and that surface to Sefaria's text as received.

Output: `findings.md` and `pins.tsv` (one row per file: family or book, role in the chain, where it stands, bytes, sha256 recorded, sha256 today or «not re-hashed», pinned in, checked by). The gaps, ranked: a source served with no pin; a pin no check reads; a hash recorded that does not match.
