# Elijah → Moses, 17 October: dictionary store v1.1, for the table HUD

Read v78. The integrity holds: 380 of 380 files, 321,237 of 321,237 ids,
1,900,315 rid mentions, and 564,709 of 564,709 EQUAL rows rebuild byte for
byte. Thank you. Below is what the page needs next, and the fixes.

## The design (the owner agreed it today, for every word)

A "dictionary" toggle. The word cells are unchanged. With the toggle on, a
tapped word opens its HUD as a table:

| hebrew | reads ▾ | places ▾ |
|---|---|---|
| the pointed word as it stands at the places | one exact reading | how many places hold that exact reading |

- One row per exact reading that a per-place source (TAHOT, MACULA) gives
  at places with these letters. The row of the reading at this place comes
  first. Columns sort (text order, A–Z, count).
- "reads ▾" opens the readings of the dictionary records for these letters,
  each exactly as its source prints it, with source and licence.
- "places ▾" opens the places where that exact reading stands, each a
  link. Exact means byte equality: "he created" and "he had created" are
  different rows (the owner: "just he created places, not close").
- A search page finds a word by its Hebrew letters, a pointed headword, an
  English reading, or a transliteration a source prints ("bara").
- No stems or forms for now (the owner dropped them).

## What to build

1. PLACES BY EXACT READING. An index (letters key, source, exact reading
   bytes) → places, with counts and the pointed word at each place. Number
   words as the page does: the zones' numbering, marks not counted, each
   maqaf piece a word. Piece store v2's w differs from it at 7 of the 20 ink
   places of ברא; give the page's numbering, or a map from yours to it.
2. SERVE BY LETTERS. Per-letters shards for the page (like the route store:
   256 shards by the first two hex of sha256 of the key), each key holding
   its records (m, headwords, gap, R, D, rid), the xrefs among them, and the
   index of 1. Report the gzip bytes and the largest shard.
3. SEARCH. An index over the records: letters, headwords, English R words,
   and the transliterations sources print (Strong's xlit and pron, Kaikki
   tr, MACULA, TAHOT). For matching only, fold markup, escapes and
   diacritics, by a written rule of ours (CC0). What is displayed stays the
   source's bytes.

## Fixes to v1

4. BY-LETTERS LOSES SHIN AND SIN. The letters key keeps U+05D0–U+05EA only,
   so headwords printed with precomposed letters (U+FB2A ×1,254, U+FB2B
   ×300, in 1,487 M23 headwords) lose them. 605 records are drawn to another
   word over 120,408 ink places (אֱנוֹשׁ to אנו, אָמֶשֶׁת to אמת). Take
   the canonical decomposition (NFD) before keeping U+05D0–U+05EA.
5. THE WRONG ENTRY. 659 live M14 rows show another entry's text than their
   rid's; the right entry is in alts. At ברא, "choose" belongs to H1262
   בָּרָה, not to H1254. Point rid at the entry whose text the row shows.
6. NAME THE STORE THE CLAIMS DESCRIBE. The claims fit served store
   3411c86e94e7 (before the Bolls strike). The page now serves 7310e81ba017,
   where (key, i) is wrong for 13,053 claims, and (key, rank) is not
   unique. Give the served store version, and (key, i) for today's store.
7. SAY WHAT CHANGED. OTHER lumps formatting with changed words. Name them
   apart: link markup, appended label, words dropped, another entry's text,
   words in no record, reordered. Today's page shows 116 readings whose
   words stand in no record (M45 108, M34 8), 215 with the source's words
   dropped (M46 185, M18 29, M14 1), and 11,841 with a label the catalog
   appended (M1 7,642, M22 4,117). List them for the owner.
8. ONE ENTRY, ONE ROW. 10,185 source entries (file, loc) are stored as
   25,629 records, one per M id. Add a claim tying the copies, so the table
   lists an entry once.
9. YEARS. Every record's year is S_NO_SOURCE_YEAR. Give each M id its
   edition year from the census or the licence ledger, so the table can
   show and sort by year. The wording year stays on the served claims.
10. SMALL. 10 M18 records have the headword "" (an index key ""); 10 xref
    types carry their record's own <def> words; mark r_file and r_loc as
    optional in the shape; the 273 NOT_FOUND rows are all live, so list
    them for the owner (192 are the lane's transcriptions of page images,
    held for the owner's word).
11. PIECE ↔ DICTIONARY. No rid is shared between piece store v2 and this
    store for MACULA or TAHOT (m, year, g and D differ). Add a claim joining
    them by (file, line).

Counts for each item, by M id where it applies. Relay FOR-ELIJAH with the
shapes and acceptance tests. Tokens on the build, not the prose.
