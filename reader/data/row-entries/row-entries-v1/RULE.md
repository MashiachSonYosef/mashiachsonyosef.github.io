# RULE — the entry each row belongs to (row entries v1)

13 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. The clauses were written from a census of the catalog's citations, source by source, and from a measure of how the served rows reach the catalog (both recorded in the receipt).

## What is asked

The serving lane's ask 3 of 12 November, its second half: for each row, the entry it belongs to where its source says so (a Strong's number, a BDB entry, a lemma), so that "this word's entry" can be a gate like the stem. The first half, the entry at each place, is already in the lattice v12 positions files the page reads: each piece carries `tag`, TAHOT's Strong's number at that place (relay v171, section 3).

## Which rows

Every row of the served route store whose source names its entries, fifteen sources:

| m_id | source | what names the entry |
|---|---|---|
| M9 | Strong's via Open Scriptures | the entry's own id, a Strong's number |
| M14 | Strong's via Hebrew Wikisource | the entry's own number |
| M5 | BDB via Open Scriptures | BDB's own entry id; the number from the same provider's lexical index |
| M33 | the Open Scriptures lexical index | its own entry id; the number from the entry's own cross-references |
| M46 | the unabridged BDB | BDB's own entry id; the number from the file's own column |
| M4 | TAHOT, read at its places | the tag TAHOT gives at every place it reads those letters so |
| M3 | MACULA, read at its words | the number MACULA gives at every word it reads so |
| M7 | the unfoldingWord lexicon (UHAL) | the entry's file, named by a Strong's number |
| M17 | the SDBH via HiperBiblia | the record's id, a Strong's number |
| M18 | the UBS dictionary | the entry's id; the numbers from the entry's own list |
| M19 | TBESH | the entry's own extended Strong's number |
| M45 | the BibleTools lexicon | the record's id, a Strong's number |
| M23 | Classical Hebrew Words | the record; it names no number |
| M97 | Davidson | a box on a page; it names no number |
| M184 | Kethoneth Yoseph | a box on a page; it names no number |

Every other source of the store names its entries by its own ids (a Wiktionary line, a Wikidata lexeme, a page) and names no Strong's number. Their rows have no line here; the receipt names each of those m_ids with its row count, so every served row is counted once.

## What is read

- The served route store: `index.json` and its 256 shards, as read from fireandhail.com/reader/data/route-store/ on 12 November 2026 AD. A row is `[rank, route text, definition text, m_id, year, cut flag, headwords, …]`; the builder reads the first four slots.
- The page's row-strikes record, `reader/data/row-strikes-v1.json`, as read from fireandhail.com on 13 November 2026 AD.
- The structured evidence catalog v86 (`structured-evidence-catalog-v86.csv.gz`), the catalog the store was built from.
- The sidecar of unmerged cards (`moses-unmerged-cards-v1/store-unmerged`), only for the check in "The check".
- The providers' own files, each named in the receipt by its sha256: the Open Scriptures lexical index (`LexicalIndex.xml`), the unabridged BDB (`unabridged-BDB-Hebrew-lexicon.csv`), the UBS dictionary (`UBSHebrewDic-v0.9.2-en.JSON`), the BibleTools lexicon, the four TAHOT files, and MACULA (`macula-hebrew.tsv`).
- The catalog builder's own code, replayed and not rewritten: `stepbible_routes.mjs` (how TAHOT's readings were cut) and `panlex_hebrew_english_routes.mjs` (the letters MACULA's readings are keyed by), each named by its sha256. MACULA's reading rule (which words have a reading, in `macula_hebrew_surface_gloss_routes.mjs`, not exported) is written into the builder from that file, and is checked by giving back every catalog row of M3 (see "The check").

## The road from a row to the catalog

A row is the store's `(K, rank, route text, definition text, m_id)`. Its **cell** is the catalog rows whose `k_normalized_key`, trimmed, is K and whose `m_source_label` is `index.json`'s label for the m_id.

1. **By the text.** The store's own join rule (`index.json`, `join_rule`, with its one amended clause): the rows of the cell whose `r_route_text` is the route text byte for byte; for M14 also the rows of the cell of which the route text is one of the declared comma pieces.
2. **By the definition.** Where step 1 finds none: the rows of the cell whose `d_exact_text` is the row's definition text byte for byte.
3. **By the record of strikes.** Where steps 1 and 2 find none: the row-strikes record's actions that made this row (an action whose `to_key` and `to_rank`, or else `key` and `rank`, and `m` are this row's). Each names the key the row stood under before: a re-key's `key`, and a restore's `restored_from.key`. Steps 1 and 2 are made again in the cell of each such key.
4. Otherwise the row is **unreached**. It is listed with the actions the record names for it, if any.

## The entry each catalog row names

A catalog row's citation is its `cit_local_pointer` up to the first `|`. The entry is read from it, source by source:

- **M9**: `#entry:H<digits>`; the entry is `H<digits>`.
- **M14**: `#strong:H<digits>`; the entry is `H<digits>`.
- **M5**: `#entry:<id>`; the entry is BDB's id. Its numbers are the `strong` of every `<xref>` in the lexical index whose `bdb` is that id.
- **M33**: `#entry:<id>`; the entry is the index's id. Its numbers are the `strong` of every `<xref>` inside that `<entry>`.
- **M46**: `#bdb:BDB<digits>`; the entry is `BDB<digits>`. Its numbers are the file's `StrongNumber` cell for that `BDBid`, parted at `_`.
- **M7**: the file name `H<digits>.md`; the entry is `H<digits>`.
- **M17**: `#record:<id>`; the entry is the id as written (`H` or `A`, digits, and a letter or none). `A` marks an Aramaic word under Strong's numbers.
- **M18**: `#main-id:<id>`; the entry is the UBS id. Its numbers are that entry's `StrongCodes`, `H` or `A` and digits.
- **M19**: `#eStrong:<e>#dStrong:<d>`; the entry is `<d>` up to the first space.
- **M45**: `#id:h<digits>`; the entry is `h<digits>`. The record's own `strongs` field must say the same number.
- **M23**: `#record:<n>`; the entry is `record:<n>`. No number.
- **M97**, **M184**: the page image's name and its `#bbox:`; the entry is `<page>:<box>`. No number.
- **M4**: TAHOT's readings were cut by the catalog builder, word by word, into spans of pieces, and the catalog keeps one row per key and reading, citing the first place. A row stands for every place where TAHOT reads those letters so. The builder replays the catalog builder's own `parseTahotRecord` and `tahotAlignedSpans` over the four TAHOT files in their order, and gathers every span under its key, `d` and `r`. The entries of a catalog row are, at every place of its key, `d` and `r`, the tag of each piece the span covers, each with the number of places where it stands. A piece's tag is its part of the fifth column (parted at `/`), up to its first backslash (what follows a backslash tags a mark of punctuation, as the Hebrew column's does), with its braces and a plus sign taken off.
- **M3**: likewise MACULA. The builder replays MACULA's reading rule over `macula-hebrew.tsv` and gathers every word under its key, `d` and `r`. The entries of a catalog row are the `strongnumberx` of every word of its key, `d` and `r`, parted at `|`, each with the number of words where it stands.

A row's entries are the entries of all its catalog rows, distinct.

## Numbers

A number is `H` and the digits with their leading zeros taken off. A letter after the digits (STEP's capital letters, MACULA's small ones) stays in the entry and is not in the number: the two are separate schemes and are not compared here. The number of an `A` entry is `H` and its digits. `H0` is not a number. A lexical index `strong` of letters only (`b`, `c`, `d`, `i`, `k`, `l`, `m`, `s`) is a prefix's code, not a number. STEP's numbers from H9000 (its prefixes and suffixes) are numbers like any other.

## The line

One line per key, `{"k": K, "rows": [...]}`, in the store's order (shards `00` to `ff`, keys in each shard's order), holding the key's rows of the fifteen sources in the key's order. A row is an array of six slots:

1. `rank`: the row's rank, as the store holds it;
2. `m`: its m_id;
3. the first 16 hex of the sha256 of its route text's UTF-8 bytes;
4. its road: `text`, `definition`, `strikes` or `unreached`;
5. its entries, distinct, in the order first met (catalog rows in catalog order; for M4 and M3 the places in file order); for M4 and M3 each is `[entry, places]`;
6. its numbers, distinct, in ascending order of the digits.

(Amended after the first run, before any ship: the first run wrote one line per row with named fields, 46 MB; one line per key with slots holds the same in about half.)

A row is told apart by its rank, its m_id and the hash together: the pieces the store cut from one record share a rank. Where the store holds one row twice (the same key, rank, m_id and text), the ledger lists it twice, as the store does. (Added after the second count, which first told rows apart without the hash.)

## Classes, counted per source

- **one number**, **several numbers**, **no number** (the source names entries but none carries a number), **unreached**.
- The same again counting only the numbers below H9000, the words' own entries (from H9000 STEP tags prefixes and suffixes): **one entry's number**, **several entries' numbers**, **no entry's number**.

## The check

The evidence road of store v2.2 reaches catalog rows by another way: the sidecar's cards at the row's `(K, rank, route text, m_id)`, their evidence ids, the catalog rows of those ids in the row's cell. For every row that road reaches, each catalog row it reaches must be among the row's catalog rows. A row where it is not is a break, and nothing ships.

The replays must give back the catalog: for every catalog row of M4, its key, `d` and `r` are a span of the replay, and the replay's first place is the place the citation names (its line, verse and span); for every catalog row of M3, its key, `d` and `r` are a group of the replay whose first line, last line and number of words are the citation's `line`, `last-line` and `occurrences`.

## The gate this makes possible

Not applied here; the ruling is the owner's. At a place whose core piece carries TAHOT's tag with number N: a row whose numbers hold N is this entry's, whatever its headword's points; a row with numbers, none of them N, is another entry's; a row with no number is left as it is. The builder measures it on the outside reader's fourteen verb cards of Genesis 1 (`reconcile`), and on nothing else. Beside the gate, the reconcile measures two more partings that are not part of it: STEP's letters, where a row's entries are STEP's own (TAHOT's tags, TBESH's numbers) and the place's tag carries a letter; and BDB's own entries, where a BDB row names an entry with no number.

## Not here

- The dictionaries beside the store (Jastrow and the others the page reads from its own files) are not in the route store and are not read.
- A row's year, licence, text and order are not touched. Nothing served changes.
