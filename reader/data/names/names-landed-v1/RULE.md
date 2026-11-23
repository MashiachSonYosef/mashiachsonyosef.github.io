# RULE — names for the landed rows v1: names v2's rule, read on the rows of v200, v201, v202 and v207

21 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone.

## What is asked

The page lane's ask C (letter of 20 November, section 4, «A gap to know of»; and the rehearsal of v207, «No returning row carries a name mark»): «a short names list for the rows of v200, v201 and v202 (and of v207), by the same rule as names v2.» Names v2 read the store as served at 54416ff5785b. The rows of v200, v201 and v202 landed after it (ship 11c); the rows of v207 have not landed. So no names list has read them, and a name among them stands unmarked.

## The rule applied

Names v2's rule (`<the Tabernacle>/corpus-lane-builds/moses-names-gate-v1/names-v2/RULE.md`) is applied as it stands in four parts: which sources are read; each read source's own mark and how it is read (every clause, word for word); the class of a row; and the lists' line shape. Only one part is set here, because a landed line is not a row of the store names v2 read: the road from a line to its source's entries (below). The owner's rule stands as names v2 quotes it: a row is set apart only on what its own source says of it, never on our reading of the English, never by a class list we chose, never row by row.

## Which lines are read

- v200: `<the Tabernacle>/corpus-lane-builds/moses-audit-calls-v1/call5-returns-v1/call5-returns-v1.jsonl`, every line (call 5's rows back under the plain key, and v188's two lines reissued there).
- v201: `<the Tabernacle>/corpus-lane-builds/moses-store-lists-v1/whole-renderings-v1/whole-renderings-v1.jsonl`, every line.
- v202: `<the Tabernacle>/corpus-lane-builds/moses-spelling-bridge-v1/bridge-v1/form-rows-v1.jsonl`, every line. (`form-rows-not-landed-v1.jsonl` is not read: those lines are not landed.)
- v207: `<the Tabernacle>/corpus-lane-builds/moses-send-back-v1/send-back-v1/landing-own-language-v1.jsonl` and `landing-bible-dictionaries-v1.jsonl`, every line. `landing-harkavy-v1.jsonl` is withdrawn by the lane and is not read.

## The row of a landed line

For v200, v201 and v202 the line's row is read from the served store given (its store_version is named in the receipt): the row under the line's key (`to_key` if it has one, else `key`) whose m_id is the line's `m` and whose route text is the line's `route`, byte for byte. There must be exactly one; the build stops otherwise. Where the line names a rank, the row's rank must be that rank; the build stops otherwise. Lines that name one row (the same key, m_id and words) are that one row: its class is read from the entries every such line reaches, all together, as names v2 reads a row from every catalog row it reaches; and it is one line of the lists, naming each of its relay lines. The `rank` written is the row's rank in the served store. A served row whose facts already carry `name: 1` is counted.

For v207 nothing has landed. Each line is its own row: the line's key, the line's rank (`null` where the line names none), its `m`.

## Is the line's source read

By names v2's list of read sources, by source key (every key that begins `hewiktionary` is read). A line of a source names v2 does not read goes to `no-rule-yet-v1.jsonl` with its source and why, and nothing more is judged of it:

- where names v2's «Not read» paragraph names the source's work, that sentence is quoted byte for byte (its PanLex sentence for every source key that begins `panlex_`; its Davidson 1855 sentence for every source key that begins `davidson_1855_`; its ConceptNet sentence for `conceptnet_`; its PanLex sentence, which names MUSE, for `muse_`);
- else: «names v2 has no reader for this source key».

A source key names v2 does not name is not read by a reader written for another key, even where the two come from one file. (So English Wiktionary's translation tables for other languages written in Hebrew letters, `kaikki_english_wiktionary_nonhebrew_hebrew_script_translation_table`, are not read by the reader of `kaikki_english_wiktionary_hebrew_translation_table`.) Davidson's own entries are read by another seat; this list only says names v2 has no rule for them.

## How a landed line reaches its source's entries

A line names its own record: `rid` (its catalog card, the catalog's `evidence_support_id`), and `record_file` with `record_loc` (its citation: `record_file` + `#` + `record_loc`). The roads, in order; the first that reaches anything is the line's road.

1. **The card the line names.** The catalog row whose `evidence_support_id` is the line's `rid`. Its `m_source_key` must be the line's source key, and its `cit_local_pointer` must be the line's citation, byte for byte; the build stops otherwise. A card named and not found in the catalog is counted, and the next road is tried.
2. **The line's own citation.** Where the line names no card (or its card is not found): the line's citation, read by its source's reader as names v2 reads a catalog row's citation, where that reader reads the source's own file through the citation alone (every reader but the two BDBs', which read the catalog's `part_of_speech` column) and the citation is of the reader's shape.
3. **Names v2's roads 1 and 2, on the line's cell.** Else: the catalog rows in the line's cell (the line's key with edge spaces taken off, and its source's label in the served store) whose `r_route_text` is the line's route, byte for byte; if none, those whose `d_exact_text` is the line's definition, byte for byte. Where the line's own `record_loc` names a section of Strong's (`section:<n>`), every catalog row reached must cite Strong's number `H<n>`; the build stops otherwise.
4. Else the line is **not reached**. Its row is listed under the class `not reached`, never guessed.

As in names v2, a reached catalog row (or the line's own citation, on road 2) is read only through its own source key and its citation (all of it, every part between its `|`, with the cache folder's prefix `ledgers/work/ldmprs/source-cache/` taken off), and for the two BDBs through `part_of_speech`.

## The class of a row, and the lists

Names v2's classes, unchanged: a name row (every entry reached is exactly name); a people's name row (exactly people); a common-word row (exactly word); partly a name (some entry has name, not every one is exactly name); other (everything else, labelled by its kinds joined with ` and ` in the order name, people, word, title, pn, other, none; and `not reached`).

Each line names a row as names v2 does, `k` its key, `rank`, `m` its m_id, `sha` the first 16 hex of the sha256 of its route text, and adds where it comes from: `relay` (v200, v201, v202 or v207), `list` (the relay list's file name) and `lines` (the line numbers in that list, counted from 1). The lists are in relay order (v200, v201, v202, v207's own-language list, v207's Bible dictionaries list), then by the first line that names the row.

- `name-rows-landed-v1.jsonl`: the name rows, with `entries` (the source's own entries reached, distinct, in order met) and `marks` (the marks read, distinct, in order met).
- `partly-a-name-rows-landed-v1.jsonl`: with `kinds`, `entries` and `marks`.
- `gentilic-rows-landed-v1.jsonl`: with `entries` and `marks`.
- `common-word-rows-landed-v1.jsonl`: `k`, `rank`, `m`, `sha` and where it comes from only. Data for the gate the other way; nothing is withheld by it.
- `other-rows-landed-v1.jsonl`: with `class`, `entries` and `marks`.
- `no-rule-yet-v1.jsonl`: every line of a source names v2 does not read, as `k`, `rank`, `m`, `sha`, where it comes from, `source` (its source key), `class` `NO_RULE_YET` and `why`.

Every line read is in exactly one row, and every row in exactly one list. The receipt counts each list by relay (rows, and relay lines), by m_id and by source key, the roads taken, the marks met, and the sources with no rule yet. For each source with no rule yet it also counts the values of the catalog's `part_of_speech` column on the lines' cards, as it stands: that is not read as a mark (for Davidson, names v2 says that column is our rewording, not the source's); it says only what a later rule would have before it.

## The gate, as ruled (unchanged)

At a place that is not listed as a name, a name row is withheld, and counted. At a place listed as a name, a name row stands. A people's name row, a row partly a name, and every other row stand. The places are names v1's (`names-v1/place-names-v1.jsonl`); nothing here rebuilds them.

Amended after the first run, before any ship. The first run found that a v202 row in the name list was landed for a place that names v1's place list does not hold as a name, so the gate would withhold the row at the very place it was landed for. So the receipt now also counts, for each v202 row in the name list, every place its lines name (`places`: book and place): whether names v1's place list holds that place, and if so by whom (its `by`). names v1's place list is read for this alone, as a further input. No class changes and no place is rebuilt; the place list is names v1's question.

## Checks (each one stops the build)

1. Every landed line of v200, v201 and v202 finds exactly one served row, at the rank it names where it names one.
2. Every card found is of its line's source key and carries its line's citation.
3. Every citation read is of the shape its reader reads, and every entry it names is in its file (a Strong's number with no entry is `none`, counted, as in names v2).
4. Every line read is in exactly one row; the six lists hold every row once.
5. No file written holds a machine path or the home folder's name.
6. The second count agrees on every list.
7. Two runs give the same bytes.

## The second count

A separate script, not importing the builder. It joins the lines to the served store by its own code, finds the cards by its own reading of the catalog, and reads the marks by another road where one exists: the catalog's own `part_of_speech` column where it carries the source's field (TAHOT's grammar, with the span; the Kaikki dictionaries; the Kaikki translation tables; DBnary; BiblicalTools; and the BDB column checked against BDB's own file); the source files, read by its own code, where the catalog carries no mark (Strong's for the Wikisource numbers, Hebrew Wiktionary). For a line with no card it reads TAHOT's grammar from the catalog rows that cite the same TAHOT file and line, and from the file by its own code where none does, and it follows names v2's cell roads by whole strings. Its receipt says `agree: true` only when its six lists are the builder's, line for line, on `k`, `rank`, `m`, `sha`, `kinds`, `class`, `relay`, `list`, `lines` and `source`.

## Not here

The store is not changed. The places are not rebuilt. Names v2's lists are not changed. Nothing is fetched. No rule is written for a source names v2 does not read.
