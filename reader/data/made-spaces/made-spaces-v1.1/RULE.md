# RULE — the made spaces of the texts v188 brings into the store (made spaces after v188, relay v188.1)

14 November 2026 AD. Corpus lane (Moses). Written before any script of this folder was run.

## What is asked

Our catalog build put a space where the provider had a tag. In some texts of Strong's via Open Scriptures (M9), BDB via Open Scriptures (M5) and the unabridged BDB (M46) that space stands before a comma or the like. The lane's made-spaces lists name every served text that holds such a space, and where it closes at print: relay v168 for M9 and M5 (and M33, which has none), relay v178 for M46 (and M14, which has none). The page writes slot 9 from them and checks every row of those sources against them. The lists are keyed by the served text, so a text that newly enters the store and is in no list prints its made space. The page's letter of 13 November, item 3, says such a text is the lane's to name.

Relay v188 lands 4,252 rows. Some of their texts hold a made space and are in no list. This folder gives each list as it stands once v188 lands.

## Terms

- **The page store now**: the route store at store_version 4d1357b26ca5, as a read-only copy (`index.json` and `shards/`).
- **v188's lines**: `landing-v1/landing-fold-strike-v1.jsonl` of this strand, 4,252 lines, sha256 c199049388e47991e1b3d8af0c22708f516ebb773cbbdad367efe2928c6ade4f.
- **A landed row**: a v188 line written in the store's row shape, `[rank, route, definition, m, year, cut, headwords]`: slot 5 is 1 where the line's `cut` is 1 and null otherwise. A landed row has no slot past 6. It has no print slots, no closes and no row-entries facts, as v188 says.
- **The store after v188**: the page store now with every landed row added under its key, among the key's rows in the order of rank (after any row of the same rank). A key the store does not hold yet is added. Its `index.json` is the page store's with three changes: `counts.routes` and `counts.keys` count the rows and keys it holds, `counts.shard_bytes_total` the bytes of its shards, and `store_version` reads `4d1357b26ca5+v188`, so that no receipt can take it for a store the page served. It is built in a scratch folder outside the strand and taken away when the run ends. Only the shards that take a landed row are written again; every other shard is the page store's bytes.
- **The span store**: the served span store as v168 and v178 read it (`index.json` sha256 3980e7124623d3554dcd0e371b970e81b49fb3e8a0dbea771e2343ee8ea095f6; its 39 book files, sha256 over their lines f8992b5392edb536c3ff16ef2762968bab4133056667a611bedb82bdbce40b26). The served span index read on 14 November 2026 AD differs from it only at `ledgers.applied_on`, and says that the first seven slots of a span row are the lane's byte for byte. The builders read slots 1 to 3 only. The runner checks both of these against the index read on 14 November.
- **The lane's builders**: v168's `build-made-spaces-v1.mjs` with its verifier `verify-made-spaces-v1.mjs`, and v178's `build-made-spaces-v2.mjs` with its verifier `verify-made-spaces-v2.mjs`. **Unchanged** means: the same bytes (the sha256 their receipts name), run beside a copy of their own RULE.md (the same bytes), with every other input they read the same bytes as when they ran: the provider files, the build scripts folder, the provider declarations (v168) and v174's openings list (v178). They write beside themselves, so each is copied with those files into a scratch tree of the same shape and run there. Only the route store differs: it is the store after v188.
- **The current lists**: v168's `openscriptures_strongs.made-spaces-v1.jsonl` and `openscriptures_bdb_1906.made-spaces-v1.jsonl`, and v178's `unabridged_bdb_1906.made-spaces-v2.jsonl` and `unabridged_bdb_1906.words-taken-out-v2.jsonl`, each the bytes the page pins.
- **The lists after v188**: what the lane's builders write from the store after v188, renamed: `openscriptures_strongs.made-spaces-v1.1.jsonl`, `openscriptures_bdb_1906.made-spaces-v1.1.jsonl`, `unabridged_bdb_1906.made-spaces-v2.1.jsonl` and `unabridged_bdb_1906.words-taken-out-v2.1.jsonl`. Each receipt and verifier receipt is kept byte for byte as its script wrote it, renamed: `receipt-v1.1.json`, `lane-verify-receipt-v1.1.json`, `receipt-v2.1.json`, `lane-verify-receipt-v2.1.json`. Inside them the lists keep the builders' own file names; the bytes and sha256 they give are the renamed files'. The rule of each list is its builder's RULE.md, unchanged, named in its receipt by sha256.

## The changes, line by line

A text's line in a list after v188 is:

- **same**: the current list holds a line of that text, byte for byte the same;
- **counts**: the current list holds a line of that text, and the two differ only in `rows_field_1`, `rows_field_2`, `span_rows_field_1` or `span_rows_field_2`;
- **new**: the current list holds no line of that text.

A current line whose text is in no line after v188 is **gone**.

`changes-after-v188-v1.jsonl` holds one line for every line that is counts or new, in the order of the lists (M9, M5, M46's made spaces, M46's words taken out) and within a list in the list's own order. Each gives `m`, `list` (the list after v188), `change`, `text`, `counts_now` (the current line's four counts, or null for a new line), `counts_after`, and `v188`: every v188 line of that source whose route or definition is the text, by `key` and `rank`, with `field` (`route`, `definition`, or `route and definition`) and `maqaf` (true where v188 flags the line `served_now_under_the_key_with_a_maqaf`). A line that is a part (its `part_of` names a definition text) also names, under `v188_part_of`, the v188 lines whose definition is that text and whose route is the part.

The hard stops, each a must:

1. no current line is gone;
2. a counts line differs from the current line in nothing but the four counts, and its two route-store counts rise by exactly the v188 lines of that source whose route is the text (field 1) and whose definition is the text (field 2); its span counts do not move;
3. a new line has at least one v188 line behind it, and its route-store counts are exactly the v188 lines behind it in each field (no row of the page store now serves a new text) and it has no span count;
4. every text of a v188 line of M9, M5 or M46 that has a line after v188 is a counts or a new line;
5. every other line is same;
6. the receipts' rule and builder are the bytes of v168 and v178, and each lane verifier says AGREE.

## M14 and M33

v178's builder reads the Wikisource Strong's (M14) and v168's the lexical index (M33) by the same rule. If either has no line after v188, the receipt's counts of its fields say why. The second count says so again from the provider's files.

## The second count

`verify-new-texts-v1.mjs` does not run, import or copy any builder of the lane or of the catalog. It reads the provider files a character at a time with its own reader:

- Open Scriptures (M9, M5, M33): every entry; for Strong's the first meaning, each def in it and the first usage; for BDB each def and each segment (the entry with its status taken out, cut at every reference, a piece that holds a whole def); for the lexical index each def. A field is read as text, whitespace, tags and comments. The served text of a field is its characters with every tag or comment read as one space, whitespace runs made one space, ends trimmed. A gap between two characters that holds tags or comments and no whitespace is a made space. It closes unless the gap holds a self-closed tag, a tag of a kind that holds another element somewhere in its file, or an end tag and a start tag together.
- The unabridged BDB (M46): the record each v188 line's `record_loc` names, its highlighted words and its points' highlights before the point's first reference, read the same way, with HTML's own block kinds and the kinds the file never closes kept, and a run of spaces, commas, semicolons, colons and dashes taken off each end. Every v188 line of M46 names a highlighted word or a point's highlight; the verifier stops if one does not.
- The Wikisource Strong's (M14): every template and tag in the nine files, and whether any stands with a character that is not whitespace or markup directly on both sides. If none does, no field of the file can hold a made space.

From that reading it builds, for every v188 text of M9, M5, M33 and M46, the places that close and the places kept, and the printed text, and recounts the rows of each text from the current list and v188's lines alone (it does not read the store). It must agree with every counts and new line, and must find every other line same, reading the lists for itself. It writes `verify-receipt-v1.json` with `agree` true, or exits non-zero.

## Where it meets v187, v189 and v190

`meets-v1.mjs` reads the lists after v188, v188's lines, v187's words-back list, v189's call lists, v190's facts list and the page store now (only the shards it needs), and writes `meets-v1.json`:

- **v187** retexts rows of M46 by key and rank. A retexted row takes the closes v187 gives it, not the list's. Its old text stops being served by that row, so the old text's counts fall by one per retexted row. It counts, by v187 status, the rows whose text now is a line of `made-spaces-v2.1` or `words-taken-out-v2.1`.
- **v189** strikes, withholds, re-keys, lifts and holds rows. A strike or a withhold takes the row's texts out of the store, so a text of a list loses one row in each field it stands in. A re-key moves the row's key and not its text. A lift and a hold change no text. It counts, for every list, the rows of each action whose route or definition is a line. It also names the v188 lines that v188's own rule skips if v189's call 5 lands first (the lines flagged with a maqaf key), and which of them stand behind a line of a list.
- **v190** writes slot 10 of TAHOT (M4) rows only, and no text; it counts its lines by source.

## Amended

Amended 14 November 2026 AD, after each script's first run and before the two runs. No list line and no count changed by it.

- **The second count, M14.** It does not look at every template and tag in the nine files. It reads each of the 8,674 entries' `{{ltr|1=…}}` and counts the templates and tags that stand in the definition, after the bold headword: there are none. Seven templates stand in a headword (`{{'}}` in a transliteration), before the definition. So no definition of the file can hold a made space. It also reads, at the line each v188 line of M14 names, the definition with links read as their words and bold and italic marks taken out, and holds it to the line's definition text.
- **The second count, M46.** It reads the highlights of every point of the record before the point's first reference, without asking whether the point opens with a number or a letter, and takes en and em dashes off the ends as well as the hyphen. It looks for the v188 text among those fields, so a wider reading can only find more fields, and every v188 text was found.
- **Where it meets v187.** v187's rows are counted in the three groups of v187's own table: `done` lands now; `done_hebrew_order_settled_by_the_witness` waits for the owner; the two held statuses keep their text. Only the first two can move a count.
- **v188's maqaf skip.** The re-key behind a flagged v188 line is found by its key and words, since the row v189 re-keys is often of another source than the v188 line.

## Checks, each a hard stop

1. every input is the bytes its sha256 here or in its own receipt names;
2. the changes stops 1 to 6 above;
3. the second count agrees;
4. two runs of every script give the same bytes;
5. no file written holds a path of this machine (a drive letter, a colon, a slash and `Users`) or the name of its home folder.

## Axes

Rows: rows of the route store (span rows apart). Texts: distinct served texts. Lines: lines of a list. Places: made spaces in a text. v188 lines: lines of v188's landing list.

## Usage

`node --max-old-space-size=3072 run-lane-builders-v1.mjs <the Tabernacle folder> <999 footsteps folder> <page store copy: index.json and shards/> <span store copy> <served span index read 14 November> <scratch folder>`, then `verify-new-texts-v1.mjs <the Tabernacle folder> <999 footsteps folder>`, then `meets-v1.mjs <the Tabernacle folder> <page store copy>`.
