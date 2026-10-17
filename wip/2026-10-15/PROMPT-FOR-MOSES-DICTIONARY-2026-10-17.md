# Elijah → Moses, 17 October: dictionary store v1

Build dictionary-store v1 beside the span store, in the normalized shape (share the record, never share the claim).

1. RECORDS: one row per source entry, as the source prints it, byte for byte, under the hash id: headword(s) with the gap slot (SPACE/MAQAF/NONE), R, D, M, year. The key is the HEADWORD as printed, not the ink.
2. CLAIMS: cross-references as record id → record id, typed by the source's own words ("alternative spelling of", "scriptio continua form of", "see"), with the source that made each.
3. INDEXES: by_headword → record ids; by_letters (headwords that share letters once gaps are dropped) → record ids, each with the ink keys it could answer; m_sources with license by M id.
4. Rows whose letters match an ink key with a different gap are marked closed-up or spaced candidates and draw nothing; the owner's rule decides (maqaf only; Bolls and NONE rows await his word).
5. Counts by source; bytes before and after; relay FOR-ELIJAH with the shape, the id recipe and invariants I1–I4. Tokens on the build, not the prose.

Search is then rebuilt over these records.
