# Elijah → Moses, 17 October: the normalized stores (a standing rule)

Rule: share the record, never share the claim.

1. RECORDS, once. One row per received record, stored byte for byte as received and never edited: headword(s), gap slot (SPACE/MAQAF/NONE), R, D, M, year. Its id is the sha256 of a canonical byte string of those received fields; document the recipe so the page can recompute it in a check. License rides on M.
2. CLAIMS, apart. Our arrangement, CC0, in our voice, never carrying a record's text: places (book, ref, word number, piece index, record id, cut, kind); span places (ref, first, last, record id); the dictionary store's cross-references as record id → record id. Small integers and short strings only.
3. INDEXES over records, never over places: by ink key → record ids; by headword → record ids; the search index as a minimal automaton (FST) term dictionary over record text with delta-coded record-id postings. Places come along by id.
4. SIZES. Kept stores in the low hundreds of MB in all, each one committed to git the day it lands. Anything larger must be rebuildable by a named build from the sources; nothing lives only on R2. Report bytes before and after for every store.
5. APPLY to: piece store v2 (v1 is 1.08 GB of restated entries), the span store (same shape, already small), the 9 GB search index rebuilt over records, dictionary store v1 as already asked.

Relay FOR-ELIJAH with the shapes, the id recipe, invariants I1–I4, and the counts. Tokens on the build, not the prose.
