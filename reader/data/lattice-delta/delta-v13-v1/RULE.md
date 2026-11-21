# RULE — the lattice delta v13: names_this_verse widened for the aligned sources, the lattice's grade against the page's pointing grade v5 and the unpointed rule, and the lattice at the places STEP gives no tag (lattice delta v1)

20 November 2026 AD. Corpus lane (Moses). Written before the builder. Nothing served is changed: these are lists keyed to lattice v12 for the serving lane. No new copy of the lattice is written; every output is a delta against v12's own lines.

## Why

The serving lane's letter of 16 November, asks 3 and 4:

- ask 3: «names_this_verse widened for aligned sources (your v171 §4): the owner took it. Reissue the lattice so an aligned translation names every verse where it reads the word so; "cites here" then means the same for every source. Nothing at rest moves.»
- ask 4: «Your lattice and the two rules above: whether its grade follows v5 (the text's word) and the unpointed rule, so the lattice's own tiers and the page agree.»

and its letter of 17 November, ask 1: «Does the lattice's own grade at an untagged place agree with the lemma's entries? If the lattice should carry a place's entry where TAHOT gives none, MACULA's lemma is one source for it.»

## 1. Terms

- **The lattice**: lattice v12, `moses-lattice-ledger-v1/candidate/positions-<book>-v12.jsonl.gz` and `routes-<book>-v12.jsonl.gz`, 39 books, read line by line. **A position**: one line of a positions file, keyed by `book`, `i`, `j`; **ON** when its `c0` is `ON`. **An entry**: one member of a position's `megacompspan` array, numbered from 0 in the array's order (`entry`); its `reading` (form, ketiv or qere), `key`, `surface` and `route_grades` as v12 writes them. **The entry's routes**: the `routes` array of the routes file line of the same book whose `key` is the entry's key; **a route index** is a place in that array, counted from 0, the index v12's `route_grades` uses. A key with no line has no routes.
- **A span card**: one member of `cards_by_key` of one member of a position's `span_megacompspans`; `span` numbers the record, `card` the member, both from 0; its `key` and `names_this_verse` as v12 writes them.
- **The catalog**: `definition-poc/output/structured-evidence-catalog-v86.csv.gz`, streamed; its columns by their header names. **A catalog row's key**: `k_normalized_key` with edge whitespace trimmed (as the lattice reads it).
- **A source's label**: `m_source_label`. **A route's sources**: the route's `sources` array.
- **The store**: the store as served, read only, store_version 54416ff5785b (`index.json` and `shards/NN.bin`, a key's rows `[rank, route, definition, m_id, year, cut, headwords, ., ., closes, facts]`; `facts.n` the row's entry numbers).
- **The word numbering**: word numbering v1.1, `moses-word-numbering-v1/build-v1.1/numbering-v1.1/<book>.jsonl`. Each line is a word of our text with its `book` (the file), `ref`, `tahot.tied` (the TAHOT rows it ties: file label and line counted from 1) and `macula_xml_ids` (the MACULA rows it ties).
- **Letters**: the characters U+05D0 to U+05EA.
- **cleanText**: delete U+200E, U+200F, U+202A to U+202E, U+2066 to U+2069; replace each run of whitespace by one space; trim.
- **exactSourceKey**: trim; NFD; delete U+0591 to U+05BD, U+05BF, U+05C1, U+05C2, U+05C4, U+05C5, U+05C7; delete U+200E, U+200F, U+202A to U+202E, U+2066 to U+2069; delete U+05C0 and U+05C3; replace each run of whitespace by one space; NFC. (The catalog builder's own key for TAHOT's and MACULA's rows, `exactSourceKey` in `build_structured_evidence_catalog.mjs`; the lattice then trims it.)
- **readable English**: cleanText of it is 1 to N characters long (N = 1,200 for TAHOT, 400 for MACULA), holds a Latin letter A to Z or a to z, and is not, ignoring case, «no gloss», «unknown», «tbd» or «n/a».

## 2. The aligned translations, declared from the sources' own data

A source is an aligned translation when its catalog rows are readings of the words of a Bible text verse by verse, each row citing in its own pointer (`cit_local_pointer`) the verse and word it was read from (`#ref:`). Counted over the whole catalog, the builder lists every label any of whose rows carries `#ref:` and how many of its rows do. Two do, every one of their rows (the build stops if any other label has such a row, or if either has a row without one):

- **M4**, `STEP Bible Translators Amalgamated Hebrew OT aligned component translation` (TAHOT): each row a span of one TAHOT row's pieces and its English.
- **M3**, `MACULA exact Hebrew morph surfaces with Cherith English definitions` (MACULA): each row one MACULA word-piece and its English.

The catalog keeps one row per key and reading for both (the first verse it met), so a route of either names one verse only. Every other source is a dictionary, a word list or a wiki: its rows name no verse and nothing here changes for them.

## 3. Names this verse, widened (ask 3)

### 3.1 A source's readings at a verse

**TAHOT.** The four TAHOT files as the STEP manifest lists them (bytes and sha256 checked). A **TAHOT record** is a line whose first tab column is a verse reference `Book.c.v#nn=Type` or `Book.c.v(c.v)#nn=Type` (Book three characters: a digit 1 to 3 then a capital and a small letter, or a capital and two small letters), with at least six tab columns, whose second column holds a letter. (The catalog's reader took only the first form; a record of the second form, whose verse carries a second number in brackets, is read here too, and its readings are counted apart.) Its Hebrew is column 2 trimmed, its English column 4 trimmed. As the catalog builder does (`tahotAlignedSpans`):

1. Cut the Hebrew and the English at every `/`. If the two counts differ the record gives no reading.
2. **Atoms**, in order: for each Hebrew part, its text before the first backslash, where it holds a letter, is a semantic atom with that part's number; then, for each piece after a backslash, each maqaf (U+05BE) in it is a maqaf atom.
3. Every run of consecutive atoms holding at least one semantic atom is a **span**. Its headword is its atoms' text joined. Its English is the English parts from its first semantic atom's number to its last, joined by `/` and trimmed, then cleanText. Its key is exactSourceKey of the headword, trimmed.
4. A span is a reading when its key holds a letter and its English is readable English (N = 1,200).

**MACULA.** `macula-hebrew.tsv` as MACULA's source manifest lists it (bytes and sha256 checked), cut into tab columns, every line holding as many as the header (else the build stops). A row is a reading, as the catalog's MACULA reader admits it (`deriveRoute`), when: cleanText of `text` holds a letter, holds no whitespace, no A to Z, a to z or digit and no Arabic, Cyrillic or Greek letter, none of `/ | = , ; ( ) [ ] { } < >`, and nothing outside U+0590 to U+05FF, the apostrophe, the double quote, U+2018, U+2019, U+201C, U+201D and U+2010 to U+2015 and the hyphen; its `class` is not `x`; cleanText of `english` is not empty, holds a Latin letter, holds nothing outside U+0020 to U+007E, U+00A0 to U+024F, U+2010 to U+2027 and U+2030 to U+205E, is at most 400 characters, and is not (ignoring case) «unknown», «no gloss», «n/a», «na», «tbd», «null», «nil», question marks only or dashes only. Its key is exactSourceKey of cleanText of `text`, trimmed; its English is cleanText of `english`; the key holds a letter and the English is readable English (N = 400).

**The verse of a source row.** A TAHOT record or a MACULA row stands in the verse (`book`, `ref`) of every word of the word numbering that ties it. A row no word ties stands in the verse its own reference names: TAHOT's verse in brackets where it gives one, else its `c.v`; MACULA's `ref` (`GEN 1:1!1` is Genesis 1:1); the book by the source's own book code. Counted apart. (Where our text numbers its verses otherwise than the sources, the tie places the reading in our verse: Exodus 20, Deuteronomy 5, Numbers 26:1.)

**A source's readings at a verse**: the set of (key, English) pairs of its readings that stand in that verse.

### 3.2 The rule

At a position in verse (`book`, `ref`), a route r of an entry (or of a span card) under key K **names this verse** when:

- v12 names it (it is in v12's `names_this_verse`), or
- some aligned source A whose label is among r's sources has, among its readings at that verse, the pair (K, r's `text`), both compared byte for byte.

The widened `names_this_verse` is every route index that names this verse, in ascending order. `counts.names_this_verse` is its length. Ketiv and qere entries are each asked under their own key. Nothing else in a position or a route changes. Nothing at rest moves: the order of the routes and every grade stand as v12 has them.

A v12 name the second clause does not reproduce stays as v12 has it; each is listed in the receipt with its verse, key and route.

### 3.3 Checks on the readings (hard stops)

- Every catalog row of M4 or M3: the source row its pointer cites (TAHOT by file and line; MACULA by `xml-id`) is a reading under the row's key with the row's `r_route_text`, and that pair is among the source's readings at the row's verse. A catalog row not reproduced so is a stop.
- Every v12 name is on a route of M4 (v12 read no other source's verse).
- Every v12 name whose verse our text and TAHOT number alike is reproduced by the second clause; the others are listed.

### 3.4 The delta: `names-this-verse-delta-v1.jsonl.gz`

One line for each entry and each span card where the widened list adds at least one route, in the order of the 39 books as the lattice reads them, then of the positions, the entries, the spans and the cards: `book`, `i`, `j`, `ref`, `surface` (the position's), then `entry` and `reading`, or `span` and `card`, then `key`, `names_this_verse` (the widened list), `added` (the routes added, ascending) and `added_by` (`M4` and `M3`: the added routes each source's own reading names; a route both read stands under both).

Counts in the receipt, by source and by book: **names added** (entries or span cards and routes), **verses added** (distinct book, verse, key and route text newly named), **routes widened** (distinct key and route text naming at least one more verse), and the entries and span cards touched; how many names come only from TAHOT records of the bracketed form, and how many from rows no word ties.

## 4. The lattice's grade against the page's pointing grade v5 and the unpointed rule (ask 4)

### 4.1 What is compared

The lattice's grade of each route of every entry of every ON position: the tier of `route_grades.grade_of_index` that holds the route index (VOWEL_MATCH, NORMALIZED, VOWEL_MISMATCH). Span cards are not compared here: the page asks a span by the span grade (v169).

**A route's headwords**: every distinct non-empty `source_headword` of the catalog rows whose key is the entry's key and whose `r_route_text` is the route's text, every source. Their order: the rows sorted by `source_priority` (as a number, 999 where it is not one) then `source_order` (as a number, 0 where it is not one), ties in catalog order; first appearance.

**The lattice's lines** (build-lattice-ledger-v11): vowelForm_L(t) = delete U+034F; NFKD; delete U+0591 to U+05AF, U+05BD, U+05BE, U+05BF, U+05C0, U+05C3 to U+05C7; delete every character but U+05B0 to U+05BC, U+05C1, U+05C2 and the letters. isPointed_L(t): NFKD of t holds a character U+05B0 to U+05BB. The lattice's grade of a route: V = the vowelForm_L of its headwords that are isPointed_L; NORMALIZED when V is empty; VOWEL_MATCH when V holds vowelForm_L of the entry's surface; else VOWEL_MISMATCH.

Check (hard stop): this grade, from the headwords above, is v12's at every route; the first twelve headwords are the routes file's `headwords`; and re-sorting each tier by year (`earliest_year` as a number where it is a finite one, else last; ties by route index) gives v12's `sorted_route_index`.

### 4.2 The page's rules, as stated (read as text from `pointing-grade-v1.mjs`, sha256 14550f54256def0b1f21594daa464aeddb7b1cfd24f5d612ce43673d0579affd; never run)

- vowelForm_P(t) = delete U+034F; NFKD; replace U+05C7 by U+05B8 (**v3**); delete U+0591 to U+05AF, U+05BD to U+05C0, U+05C3 to U+05C7; delete every character but U+05B0 to U+05BC, U+05C1, U+05C2 and the letters; then, where the string begins with bet, gimel, dalet, kaf, pe or tav, followed by any characters U+05B0 to U+05BB, U+05C1, U+05C2, followed by a dagesh U+05BC, delete that dagesh (**v2**).
- textForm(t) = vowelForm_P(t), then where it begins with a letter other than he and vav followed by any characters U+05B0 to U+05BB, U+05C1, U+05C2, followed by U+05BC, delete that dagesh (**v5**: the dagesh that joins the word to the word before).
- isPointed_P(t): NFKD of t holds a character U+05B0 to U+05BB, or a vav followed at once by U+05BC (**v4**: a shureq is a vowel).
- The page's grade of a route: V = the vowelForm_P of its headwords that are isPointed_P; **n** (NORMALIZED) when V is empty; **m** (VOWEL_MATCH) when V holds vowelForm_P(S), or the surface begins the text's word and V holds textForm(S); else **x** (VOWEL_MISMATCH). S is the entry's `surface`. Every entry's surface begins a word of the text (a whole word, a written or read form, or a word of a maqaf chain), so the second clause is always asked.
- **The unpointed rule** (`unpointed-row-rule-v1`): where the gate acts at an entry (some route grades m), a route grading m stands, x rests held back as pointed otherwise, and n rests held back as not pointed. Where no route grades m, nothing is held back for the pointing.

The page grades each store row by its own source's headwords; the lattice grades a route card that gathers every source's rows with the same words. This comparison keeps the lattice's card and asks only the rules, so the mesh does not enter it.

### 4.3 The classes

Each route's grade is computed four more times, adding the page's steps one at a time in its own order: G1 adds v2, G2 adds v3, G3 adds v4, G4 adds v5. G4 is the page's grade. A route **agrees** when G4 is the lattice's grade. Every other route is in exactly one class: its lattice grade, its page grade, and the first step at which its grade left the lattice's (`v2`, `v3`, `v4`, `v5`). The receipt counts every class, with up to six examples each (book, verse, surface, route text, headwords). It also counts the entries where the gate acts by the lattice's grades and by the page's, and the routes the unpointed rule holds back as not pointed that the lattice ranks in its second tier.

### 4.4 The delta, OFF unless the page lands it: `grade-v5-delta-v1.jsonl.gz`

One line for each entry with at least one route that does not agree: `book`, `i`, `j`, `ref`, `surface`, `entry`, `reading`, `key`, `changes` (each `[route index, lattice grade, page grade, step]`, ascending by route) and `gate` (`lattice` and `v5`: whether some route grades VOWEL_MATCH). A reader that lands it moves each route named to its new tier and sorts each tier as v12 does (year, then route index). It is labelled OFF: the lattice as served keeps v12's grades until the page takes it.

## 5. The lattice at the places STEP gives no tag (ask 1 of 17 November)

### 5.1 The places and their entries

- **An untagged place**: an ON position none of whose `pieces` with `role` core carries a tag holding a Strong's number (numberOf below). Its entry is the one that carries `lemma` (the form entry; the qere entry at a place written one way and read another); its lemma is that `lemma.macula`.
- **numberOf(tag)**: an optional H or A, then noughts, then digits: «H» and the digits, the noughts taken off; none where the digits are only noughts or there are none. (The page's `numberOf`.)
- **The entries of MACULA's lemma** (`te`), as the page's `lemmaEntries` states it (read as text from `entry-gate-v1.mjs`, sha256 d3f778a3dd2e0f54c150772166316217470e70c9ead7a27db50725d0ba5562f7; never run): none where there is no lemma, the lemma trimmed holds whitespace, the lemma is not isPointed_P, or the place is written one way and read another; else the store's rows under the lemma's letters (NFD, its letters only) that carry among their headwords (slot 6) a string holding no cantillation (U+0591 to U+05AF) that is isPointed_P and whose vowelForm_P is the lemma's vowelForm_P; the numberOf of each of their `facts.n`, once each, in the order of their digits as numbers.
- **A route's numbers**: the numberOf of every `facts.n` of the store's rows under the entry's key whose route (slot 1) is the route's text, once each. **Its verdict**: `this` when one of its numbers is one of the entries, `other` when it has numbers and none is, `none` when it has none.

### 5.2 The classes, every untagged place in exactly one

In this order, the first that holds:

1. `NO_LEMMA_ENTRIES`: the lemma gives no entries (the receipt says why: no lemma, several words, unpointed, written one way and read another, or no numbered row headed by it).
2. `NO_ROUTES`: the entry has no routes.
3. Else let **the lattice's first tier** be the tier of the route v12 sorts first. `PART_FIRST_TIER_HOLDS_ANOTHER_ENTRY` when a route of the first tier is `other` and a route of the entries stands outside it; `PART_FIRST_TIER_HOLDS_ANOTHER_ENTRY_ONLY` when a route of the first tier is `other` and no route of the entries stands outside it; `PART_OWN_ENTRY_BELOW_THE_FIRST_TIER` when no route of the first tier is `other` and a route of the entries stands outside it; else `AGREE`.

The lattice and the lemma's entries **part** at a place of class 3 other than `AGREE`.

### 5.3 The list: `untagged-places-v1.jsonl`

One line per untagged place, in lattice order: `book`, `i`, `j`, `ref`, `surface`, `entry`, `reading`, `key`, `pieces` (how many), `lemma`, `te` (the entries of MACULA's lemma: the labelled field the lattice would carry, OFF unless the page lands it), `te_why_none` where it is empty, `class`, `first_tier`, `top` (the first route: index, text, tier, numbers, verdict), `routes` (counts by tier and verdict), and `parting` (every route of the first tier that is `other`, and every route of the entries outside the first tier: index, text, tier, numbers, verdict, primary source).

## 6. Checks, each a hard stop

1. The TAHOT files are the bytes and sha256 the STEP manifest lists; `macula-hebrew.tsv` the bytes and sha256 MACULA's source manifest lists; the two page files the sha256 above.
2. §2: the aligned translations are exactly M4 and M3, every row of theirs cites a verse, no other row does.
3. §3.3.
4. §4.1.
5. Every untagged place is in exactly one class, and the classes add up.
6. A second count by another road agrees (`verify-delta-v1.mjs`): it finds each verse's source rows through the word numbering's own lines (not the builder's inverted map), cuts TAHOT's spans and reads MACULA's rows by its own code, writes the page's and the lattice's lines character by character (not by the builder's patterns), reads the store by its own reader, recomputes all three files and compares them line by line; and it applies the names delta to v12 in memory and finds every other field of every position unchanged.
7. No file written holds a path of this machine or the home folder's name.

## Amended

*A1, after the builder's first run, before any ship.* A TAHOT record or a MACULA row that no word of our text ties names no verse. It is still read, and a catalog row that cites it is still checked against it (§3.3, its first half; it has no verse for the second). The first run placed such rows in the verse their own reference names, as §3.1 said. They are words our text does not have: of TAHOT's 180, 152 are typed X (words of other witnesses, as «let us go into the field» at Genesis 4:8 and the nun line at Psalm 145:13), 27 are typed R (Joshua 21:36-37, which our text does not carry) and one is the Leningrad text's «O Lord» at 2 Samuel 7:22, where our text reads יְהֹוָ֣ה אֱלֹהִ֑ים for its אֲדֹנָ֣י יְהוִ֑ה; MACULA's 130 are Joshua 21:36-37 again and pieces MACULA writes apart where our text writes one word or reads another. So their readings are not readings of our words. In the first run they added 4 names that no tied row gives (3 by TAHOT, 1 by MACULA). In §3.4 the count of names from rows no word ties is replaced by the counts of these rows and of their readings, which stand nowhere. And §3.3's last check now reads: every v12 name is reproduced by the second clause, or stands in a verse our text numbers otherwise than TAHOT, or the catalog's row for it cites a TAHOT row no word of our text ties in that verse (v12 named such a reading by the row's own verse, as at 1 Samuel 14:41, whose longer reading in other witnesses TAHOT carries as X rows); those are kept as v12 has them and listed with their reason; any other is a stop.

*A2, after the third run, before any ship: cases the text above left unsaid, written as the builder already reads them.* (1) §5.1: an entry carries `lemma` when its `lemma` is an object (v12 writes `null` where the word has no MACULA headword key); where no entry carries one, the place's entry is its first and it has no lemma. (2) §5.2: `te_why_none` is the first that holds of `NO_LEMMA`, `WRITTEN_ONE_WAY_READ_ANOTHER`, `LEMMA_OF_SEVERAL_WORDS`, `LEMMA_UNPOINTED`, `NO_NUMBERED_ROW_HEADED_BY_IT`. (3) §3.2: on a span card the count that follows the list is `grade_counts.names_this_verse`. (4) §4.3: the examples of a class are from different places. (5) The receipt also gives, by book and source, the verses added and the routes widened, and a few named places for the relay: every line of the key פשעי (the Amos card of v171 §4), and the first places where a name comes only from a bracketed TAHOT record, only from MACULA, or on a span card.

*A3, before any ship: two clauses of §3.1 written out in full.* (1) TAHOT, step 3: as the catalog builder does, inside one record a span is passed over when an earlier span of the same record has the same English and the same headword folded (the marks exactSourceKey deletes taken out, every whitespace character taken out, a leading `norm:` taken off, then NFC). Measured over the four files, this passes over no span, so it changes no reading; the builder and the second count keep it. (2) MACULA: «dashes only» is one or more of the hyphen, U+2013 and U+2014, and nothing else.
