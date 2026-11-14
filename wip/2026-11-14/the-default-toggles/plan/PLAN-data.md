I measured everything below over all 39 books, not just Genesis 1. Genesis 1:1 appears only once, as a sample of the file shape. My scripts and their output are in /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v49/plan/data/. I read the ledger with `python3 -I` and wrote nothing outside that folder.

## 0. What the owner's words change on the data side

The owner's messages win over the brief wherever the two disagree. These are the places they do:

- **Four pills, each a bare source name: «STEP», «MACULA», «UBS», «BDB».** There is no separate resting pill. So the brief's `resting-labels.json` and its fingerprint loop (brief 2.6) go away. Nothing the bake writes depends on the resting-lines record. The index is built only from the ledger, the zones and the store.
- **Every first source gets an automatic second source, worked out per book.** Even STEP at rest gets one. So the index must carry, for every book, the line counts, the fill of every (first, second) pair and the chosen second.
  - At rest, STEP's second changes the live line at a few places (§7.3). This needs the owner's decision (decision 1).
- **The brief's coverage figures change.** The owner's notes quote `coverage.py`, which counts any pick at all: UBS 84.1%, BDB 36.4%. The line can only print a pick that has text. Measured that way:
  - UBS is 80.56% (UBS's "-" alone is not a line pick).
  - BDB is 34.06% (a BDB pick with no highlighted words is not a line pick; its opening is only a note under ruling 4).
  - The index carries both figures.
- **Row re-resolution refuses on a miss**, as the task and the letter to Moses say. The brief said such rows would only be counted.
- **The brief's call 3 (BDB's first highlight only) was never ruled.** On 14 Nov the owner accepted the prototype's version: the record's highlighted words, whole, with the sense number. The data carries them whole. The first highlight is `split(" / ")[0]` if the owner ever asks for it.

## 1. Inputs and pins (all checked today)

Everything is read through `tools/pinned-v1.mjs` (`readPinned`, `readPinnedLines`). The pins live in a new `data/default-picks/PIN.json`:

| Entry | File | Bytes | sha256 | Lines |
|---|---|---|---|---|
| rule | default-picks-v1/RULE.md | 10,730 | f8885830329064d27b71a2231d75abb70787a49a82b4d3fa273e020bb1e14cb8 | |
| receipt | default-picks-v1/receipt-v1.json | 28,573 | 89b2a4b618cd8339fe981c3fac9836979d437ed17c9a2ba48bb23ed08a438116 | |
| rows | default-picks-v1/rows-v1.jsonl | 6,106,263 | 21f2a35bd6bf37b64eb5139125c6119693a9b0d58b39afab49766db74fb128d8 | 152,423 |
| amendment | default-picks-v1.1/RULE-AMENDMENT.md | 3,764 | ff65e904f556d99656d7e20ce7594df23f7b9efaba11c39d27a5cb3b7d39308f | |
| receipt_v1_1 | default-picks-v1.1/receipt-v1.1.json | 4,854 | daf37748afdedcd9eeea5cfe9056345437363275cb85115d647131f481ab6a8c | |
| mend | default-picks-v1.1/step-mend-v1.1.jsonl | 187,094 | 29953b99d886881465432319790c67573634710afd469cb475d3364b3c59e03b | 1,265 |
| rows_added | default-picks-v1.1/rows-added-v1.1.jsonl | 8,743 | f6064de772b426659cf93990613264fe16c64c30523dcaab146a47176818f015 | 225 (first row is number 152,423) |

- **The 39 book files** are pinned by `receipt-v1.json` `outputs[]` (file, bytes, sha256, lines). All 39 match today, and receipt-v1.1 `v1.receipt` names receipt-v1's bytes.
- **What is kept in the tree:** the two RULE files and the two receipts (about 48 KB), under `data/default-picks/default-picks-v1/` and `data/default-picks/default-picks-v1.1/`. This follows the pattern of `data/word-senses/` and `data/row-entries/`.
- **What stays on the corpus lane's store** (about 95 MB): the book files and the rows tables. They are read from `--ledger <dir holding default-picks-v1/ and default-picks-v1.1/>`, the way apply-row-entries-v1.mjs reads its 25 MB ledger.
- **Store:** `data/route-store/` (index.json `store_version` 4d1357b26ca5; the ledger was read at a9373b8d30ef).
  - `data/overlays/{jastrow,samaritan}/index.json` are read only for their `m_sources`, so an m id can be routed to the store it lives in.
  - v1 names no overlay row (M12 and MSAM1: 0 rows). Jastrow's picks will need the overlay (Q7).
- **Zones:** `data/zones/<book>.bin` (gzip JSON).
- **Piece store:** `data/piece-store/<book>.json`, read only to count Q5.

## 2. Ledger places → zone words (checked in all 39 books, not just 3)

The rule for finding a place: for each zone section, with k counting only non-mark words in that section, place = `${sec.label}:${k}`. The page's index for the same word is n = WORD_N, one-based over every entry, marks included, in section order. That is zone.html line 4152: `for (const sec of zone.sections) for (const w of sec.words) WORD_N.set(w, ++n)`.

Results (`places_map` in `measure_defaults.py`; output `out/places-map.tsv`):
- Zone words 305,431 and ledger places 305,431. In every book the two sets are equal.
- In every book the ledger's line order is WORD_N order.
- In every book the entry count (marks included) equals the length of `data/source-suggested/<book>.json` `places`.
- Spot checks:

| Book | Places | Entries (with marks) | Marks |
|---|---|---|---|
| Genesis | 20,612 | 22,329 | 1,717 |
| Psalms | 19,583 | 22,803 | 3,220 |
| Daniel | 5,923 | 6,353 | 430 |
| Ruth | 1,296 | 1,388 | 92 |

- 1,062 zone words carry `kq` (ketiv/qere). The ledger gives each of them its own place.

## 3. Re-resolving every named row (`rows_resolve.py`)

- Rows: rows-v1 (152,423) plus rows-added-v1.1 (225, numbered 152,423 onward), 152,648 in all.
- For each row `[key, rank, m, sha16]`:
  - shard = first two hex characters of sha256(utf8(key));
  - a match is a row r in `shards/<shard>.bin`[key] with `r[0] === rank && r[3] === m && sha256(utf8(r[1])).slice(0,16) === sha16`;
  - the m id must be listed in the main store's `m_sources` (or, from v2 on, an overlay's).
- **Result at 4d1357b26ca5:** 152,647 rows matched once, 1 matched twice, 0 missing.
  - The double is row 119921: key חלל, rank 145, M14, «defile». A divided Strong's row's pieces all share rank 145, and its usage list says «defile» twice. The two matches are byte for byte the same text, with the same facts `{n:["H2490"]}`.
- **Bake rule:**
  - zero matches → REFUSED, naming the row's number and up to 5 places that name it;
  - two or more identical matches → accepted, counted and listed in the receipt.
- **What resolution is for.** The served file carries no row numbers. Ranks shift with every store change, and the card finds a pick's pill by printed text (brief 2.4). Resolution:
  - proves the "a served row prints it" claim holds at the served store version;
  - lets the receipt count, per source, the line picks that name no row, whose first row is another source's, or (approximately) whose every row the entry gate withholds.
- **Counts over the line picks (pick 1) of all 39 books:**

| Source | Line picks | Name no row (made pill) | First named row is another source's | Every named row withheld by the entry gate (estimate, using the zone's `tg`) |
|---|---|---|---|---|
| STEP | 304,977 | 17,077 (Genesis 949, as the letter says) | 55,445 (M17 16,681; M5 15,612; M3 11,990; M14 5,514 …) | 1,014 |
| MACULA | 296,219 | 10,846 | 176,657 (M5 96,517; M17 35,168; M46 26,762 …) | 7,241 |
| UBS | 245,806 | 705 | 70 | 1,319 |
| BDB | 103,907 | 5,585 | 33,194 | 224 |

  - For BDB, every named row of 12,704 line picks is a sense opening (facts `opens`): it prints as a note, not a pill.
  - These line-pick counts come from walking the resting-lines units. They run slightly below the line counts in §7 (STEP 305,164) because 247 words stand under no resting line.

## 4. Each source's line pick, and how it prints

The rule: the line takes pick 1. The card lists picks 1..n in the source's own order.

| Source | Line pick at a place | Places (of 305,431) | Prints | Credit chip (M id, short name) |
|---|---|---|---|---|
| STEP | pick 1 (always kind r where STEP has picks) with words | 305,164 (99.91%); 267 have no STEP pick | the ledger's words through `spanJoin` (zone.html 3425) and `signsOffLine` (3365), exactly as TAHOT's place reading is drawn today | M4 "STEP TAHOT"; picks of kind v or a are M19 "STEP Brief" (card only) |
| MACULA | `macula[0]` not empty | 296,466 (97.06%); 8,965 null | the words as given (pieces joined by a space) | M3 "MACULA" |
| UBS | at least one piece whose pick 1 is not a sign alone | 246,046 (80.56%); 10,907 are only "-"; 48,478 have no pick | each piece's pick 1, with its " / " left intact; pieces joined by " + "; a piece that is a sign alone prints nothing (3 mixed places: Jeremiah 5:22:1, 7:19:1, Judges 6:20:14); 812 places have more than one piece with words | M18 "UBS DBH" |
| BDB | pick 1 has its record's highlighted words (slot 5) | 104,032 (34.06%); 11,668 pick 1s have no highlight (150 of them have a later pick with one, which is not used) | slot 5 whole, then " · sense N", where N is the point's marker; no suffix for "the entry" | M46 "BDB unabr." |

**The "/" → " + " trap (spanJoin, 3425).** Only STEP's text may go through `spanJoin`. In STEP's text "/" is TAHOT's packing of morpheme pieces. Every other source must skip it:
- MACULA: 2 texts hold "/" (Judges 1:6:10 and 1:7:6, «thumbs/big toes of»). The brief named only UBS and BDB.
- UBS: 133,145 line texts hold "/", among them Psalms 5:11:1 «his/her».
- BDB: 25,779 line texts hold "/" (the record's several highlights, joined by " / ").

The index declares this per source as data: `print: "pieces"` for STEP and `"as-given"` for the others, so neither the page nor the checks have to guess. Text printed "as given" still loses a closing period, by the page's display law (BDB 798 texts, UBS 313), so the page's helper is `text.replace(/\.$/, "")` and not spanJoin.

**Character check (`chars.py`):**
- Printed texts contain no Hebrew, no U+FFFD and no zero-width characters.
- One UBS gloss holds a line feed: Genesis 30:37:11 «peeled \nstripes». It is counted, not refused or respelled (source text stays byte for byte); HTML draws it as a space.
- 15 UBS glosses hold a double space.

**STEP compared with today's line.**
- At single-word lines credited PIECE:TAHOT, STEP's pick 1 after spanJoin equals today's text except for the signs. The resting record is drawn with signs off ("​" gaps): Ruth 1:7:6 has «there + <towards>» against «there​».
- At 696 single words today's line is not PIECE:TAHOT while STEP has a pick. At 184 of them the two agree, so about 512 differ.
- 4,402 words sit under a run line.

## 5. The per-book file: `data/default-picks/<book>.json.gz`

The file is gzip -9 of minified JSON, decoded the way the page already decodes zones and shards (DecompressionStream). I could not find out whether GitHub Pages gzips `.json` in transit: the proxy refused my request to the live host with a 403. Shipping `.gz` makes the transfer size certain either way.

```json
{
 "schema_version": "DEFAULT_PICKS_BOOK_V1",
 "rule_id": "default-picks-rule-v1-each-source-prints-its-own-pick-and-the-source-that-fills-most-of-what-it-leaves-is-its-second",
 "book": "genesis",
 "keyed_by": "places[n - 1] for zone word n: one-based over every entry of the zone's sections, marks included, in section order (zone.html WORD_N)",
 "zone": { "file": "data/zones/genesis.bin", "entries": 22329, "places": 20612, "places_sha256": "<sha256 of the place labels in WORD_N order, joined by \\n>" },
 "ledger": { "file": "genesis.jsonl", "bytes": 6161589, "sha256": "02b6958991c1da516b4318d1214ed42f2c6348eb2a2f4fd8bc0869f870b7eb7b", "mend_places": <n>, "store_read": "a9373b8d30ef", "store_resolved": "4d1357b26ca5" },
 "slots": ["step", "macula", "ubs", "bdb"],
 "counts": { "...": "the same block as index.json books.genesis, minus file/bytes/sha256" },
 "bdb_words": ["beginning, chief", "shape, create", "..."],
 "places": [ "..." ]
}
```

**`places[n-1]`** is `null` at a mark or at a place no source picks. Otherwise it is `[step, macula, ubs, bdb]`:
- **step:** `[[kind, words, letter?], …]`.
  - kind: 0 = r (reading), 1 = v (meaning variant), 2 = a (alternative number).
  - words: the ledger's string byte for byte, or 0 where the pick has none (102 alternatives after the mend).
  - letter: the variant's letter as given (K at 725 of 748; also S, P, F, V, H, A, AH, B, BH, C, D, E). The variant's Hebrew is not carried.
  - The pick number is the index + 1, after the v1.1 mend.
- **macula:** the words, or 0.
- **ubs:** `[[words, …], …]`, one array per piece that has picks. Glosses as given, "-" included. Numbers start again in each piece.
- **bdb:** `[[sense, w], …]`.
  - sense: the marker of `point<p>:<m>.` with its period dropped. Today that is digits 93,065 times, "A" 29 times and "I" 3 times; "" stands for "the entry".
  - w: the 1-based index into `bdb_words`, or 0 when the record has no highlighted words.
  - `bdb_words` holds each record's slot 5 once. Slot 5 is the same at every pick of a record in all 39 books (0 records differ).

**Sample** (Genesis 1:1, n = 1..8; `out/genesis-first-places-sample.json`):
```
[[[0,"in/ beginning"]],"in beginning",[["beginning"]],[["1",1]]]
[[[0,"he created"]],"created",[["to create"]],[["1",2]]]
[[[0,"God"]],"God",[["God"]],[]]
[[[0,"<obj.>"]],0,[["-"]],[["1",0]]]
[[[0,"the/ heavens"]],"the heavens",[["heaven / sky"]],[]]
[[[0,"and/ <obj.>"]],"and",[["-"]],[["1",0]]]
[[[0,"the/ earth"]],"the earth",[["earth / ground / land / country / region / area"]],[]]
null
```

**Measured size of exactly this shape** (`shape_size.py`, `out/shape-sizes.tsv`), gzip -9:

| Book | Gzipped | Raw |
|---|---|---|
| Genesis | 222,390 | 1,301,009 |
| Psalms | 298,648 | |
| Jeremiah | 262,823 | |
| Daniel | 75,086 | |
| Ruth | 17,260 | |
| Obadiah | 5,682 | |
| All 39 | 3,742,318 | 19.8 MB |

- **The brief's STEP short form** writes 1 where the words equal the zone word's `pg` glosses joined by "/". That holds at 304,249 of 304,977 STEP pick 1s. It brings the total to 2,762,551 gz (Genesis 162,667).
- **I recommend full words in v1.** The short form ties the file to the zone's `pg` bytes, and a rebuilt zone would silently change STEP's text. The cost is 59 KB more for Genesis. If the short form is adopted later, `zone.places_sha256` plus a check law makes it safe.

## 6. `data/default-picks/index.json`

The page fetches it at boot, beside `data/source-suggested/index.json` (zone.html 3927).

```json
{
 "schema_version": "DEFAULT_PICKS_INDEX_V1",
 "rule_id": "<as above>",
 "generated_by": "tools/bake-default-picks-v1.mjs",
 "ledger": { "from": "r2:mishkan/v2/ledgers/all/default-picks/", "relays": ["v180", "v180.1"], "pin": "data/default-picks/PIN.json" },
 "store_version": "4d1357b26ca5",
 "rests_on": "step",
 "sources": [
  { "id": "step",   "pill": "STEP",   "slot": 0, "print": "pieces",   "m": { "r": "M4", "v": "M19", "a": "M19" } },
  { "id": "macula", "pill": "MACULA", "slot": 1, "print": "as-given", "m": "M3" },
  { "id": "ubs",    "pill": "UBS",    "slot": 2, "print": "as-given", "m": "M18", "sign_alone_is_no_pick": true },
  { "id": "bdb",    "pill": "BDB",    "slot": 3, "print": "as-given", "m": "M46", "sense_suffix": " · sense " }
 ],
 "books": {
  "genesis": {
   "file": "genesis.json.gz", "bytes": 222390, "sha256": "...", "places": 20612, "kq_words": 12,
   "line":  { "step": 20604, "macula": 19847, "ubs": 16124, "bdb": 7415 },
   "any":   { "step": 20604, "macula": 19847, "ubs": 17135, "bdb": 8008 },
   "fills": { "step": { "macula": 8, "ubs": 8, "bdb": 0 }, "macula": { "step": 765, "ubs": 81, "bdb": 70 },
              "ubs": { "step": 4488, "macula": 3804, "bdb": 912 }, "bdb": { "step": 13189, "macula": 12502, "ubs": 9621 } },
   "second": { "step": "macula", "macula": "step", "ubs": "step", "bdb": "step" },
   "rest_fill": [[<n>, "<MACULA words>"], "..."]
  }
 },
 "totals": { "...": "the same fields summed over the 39 books" }
}
```

- **Pill strings** are exactly «STEP», «MACULA», «UBS», «BDB», as the owner wrote them. They must be spelled the same in zone.html, the checks and the notes.
  - They are pill labels, which is a different thing from the short names of the credited sources ("UBS DBH", "BDB unabr."). Chips keep using `data/source-short-names-v1.json`.
- **Percentages** are worked out by the page from `line`, `fills` and `places`. The index carries counts, not strings, so no wording becomes data.
- **`second` per first source** is the source with the largest `fills[first][*]`.
  - A tie goes to the earlier source in pill order STEP, MACULA, UBS, BDB.
  - `null` when the first source leaves nothing.
- **`rest_fill`:** the auto-second's words at the places STEP leaves in that book, keyed by n.
  - 259 places in 32 books, 7.9 KB raw and 2.5 KB gz for all 39.
  - With it, the page can paint STEP + MACULA at first paint without fetching the book file. It is used only if the owner confirms the at-rest change (decision 1).
- **Size:** about 25 KB raw in all.
- **No fingerprint loop.** The index enters the resting-lines record's `read_off.files` fingerprint, and that is safe: none of its bytes come from the resting line, so one `lines` pass after `defaults` settles it.

## 7. Coverage and the second source, per book (all 39 books; `second-source-by-book.tsv`)

### 7.1 Totals (305,431 places)

| First | Its line | Second | Second fills | Left (today's line stays) | Other choices of second |
|---|---|---|---|---|---|
| STEP | 305,164 (99.91%) | MACULA | 259 | 8 | UBS 245; BDB 0 |
| MACULA | 296,466 (97.06%) | STEP | 8,957 (2.93%) | 8 | UBS 875; BDB 688 |
| UBS | 246,046 (80.56%) | STEP | 59,363 (19.44%) | 22 | MACULA 51,295; BDB 6,682 |
| BDB | 104,032 (34.06%) | STEP | 201,132 (65.85%) | 267 | MACULA 193,122; UBS 148,696 |

- In all 39 books, STEP is the second for MACULA, UBS and BDB.
- For STEP as first:
  - the second is MACULA in 32 books, 24 of them a tie with UBS settled by pill order;
  - in 7 books STEP leaves nothing, so there is no second: Haggai, Hosea, Joel, Jonah, Malachi, Micah, Nahum.
- **BDB can never fill what STEP leaves.** The ledger places BDB's picks by STEP's entry number, so BDB's fill of STEP's gaps is 0 in every book. The owner's "say BDB" cannot happen after STEP.
- The 8 places no source can print keep today's line.

### 7.2 By book

Each cell gives: first source's share · its second and how many places that second fills · places left over.

| Book | Places | STEP | MACULA | UBS | BDB |
|---|---|---|---|---|---|
| amos | 2042 | 99.95% · MACULA 1 · left 0 | 96.87% · STEP 64 · 0 | 82.62% · STEP 355 · 0 | 44.17% · STEP 1139 · 1 |
| daniel | 5923 | 99.88% · MACULA 7 · 0 | 99.04% · STEP 57 · 0 | 79.10% · STEP 1238 · 0 | 51.90% · STEP 2842 · 7 |
| deuteronomy | 14294 | 99.87% · MACULA 19 · 0 | 96.80% · STEP 458 · 0 | 77.93% · STEP 3154 · 1 | 31.88% · STEP 9718 · 19 |
| ecclesiastes | 2987 | 99.93% · MACULA 2 · 0 | 97.52% · STEP 74 · 0 | 78.00% · STEP 657 · 0 | 39.20% · STEP 1814 · 2 |
| esther | 3045 | 99.97% · MACULA 1 · 0 | 97.34% · STEP 81 · 0 | 80.99% · STEP 579 · 0 | 32.81% · STEP 2045 · 1 |
| exodus | 16713 | 99.95% · MACULA 9 · 0 | 96.01% · STEP 667 · 0 | 78.41% · STEP 3609 · 0 | 32.90% · STEP 11205 · 9 |
| ezekiel | 18729 | 99.68% · MACULA 59 · 1 | 97.84% · STEP 403 · 1 | 78.43% · STEP 4038 · 2 | 32.68% · STEP 12548 · 60 |
| ezra | 3754 | 99.84% · MACULA 6 · 0 | 98.61% · STEP 52 · 0 | 84.58% · STEP 579 · 0 | 40.01% · STEP 2246 · 6 |
| genesis | 20612 | 99.96% · MACULA 8 · 0 | 96.29% · STEP 765 · 0 | 78.23% · STEP 4488 · 0 | 35.97% · STEP 13189 · 8 |
| habakkuk | 671 | 99.70% · MACULA 2 · 0 | 98.81% · STEP 8 · 0 | 85.25% · STEP 99 · 0 | 47.54% · STEP 350 · 2 |
| haggai | 600 | 100% · none · 0 | 98.33% · STEP 10 · 0 | 80.83% · STEP 115 · 0 | 30.50% · STEP 417 · 0 |
| hosea | 2381 | 100% · none · 0 | 97.61% · STEP 57 · 0 | 80.30% · STEP 469 · 0 | 44.86% · STEP 1313 · 0 |
| i-chronicles | 10740 | 99.97% · MACULA 3 · 0 | 95.05% · STEP 532 · 0 | 84.35% · STEP 1681 · 0 | 27.16% · STEP 7820 · 3 |
| i-kings | 13139 | 99.95% · MACULA 6 · 0 | 96.13% · STEP 509 · 0 | 79.98% · STEP 2631 · 0 | 29.02% · STEP 9320 · 6 |
| i-samuel | 13258 | 99.83% · MACULA 23 · 0 | 96.36% · STEP 482 · 0 | 79.02% · STEP 2777 · 4 | 27.30% · STEP 9616 · 23 |
| ii-chronicles | 13314 | 99.98% · MACULA 2 · 0 | 96.42% · STEP 477 · 0 | 80.74% · STEP 2564 · 0 | 26.24% · STEP 9819 · 2 |
| ii-kings | 12275 | 99.89% · MACULA 13 · 1 | 96.26% · STEP 458 · 1 | 81.16% · STEP 2310 · 2 | 26.05% · STEP 9063 · 14 |
| ii-samuel | 11032 | 99.81% · MACULA 20 · 1 | 96.08% · STEP 432 · 1 | 79.47% · STEP 2261 · 4 | 24.93% · STEP 8261 · 21 |
| isaiah | 16923 | 99.96% · MACULA 6 · 0 | 98.73% · STEP 215 · 0 | 84.00% · STEP 2708 · 0 | 45.41% · STEP 9233 · 6 |
| jeremiah | 21831 | 99.93% · MACULA 13 · 3 | 97.14% · STEP 622 · 3 | 78.11% · STEP 4774 · 5 | 28.81% · STEP 15526 · 16 |
| job | 8339 | 99.75% · MACULA 21 · 0 | 99.44% · STEP 47 · 0 | 82.86% · STEP 1428 · 1 | 45.62% · STEP 4514 · 21 |
| joel | 957 | 100% · none · 0 | 98.64% · STEP 13 · 0 | 82.65% · STEP 166 · 0 | 40.86% · STEP 566 · 0 |
| jonah | 688 | 100% · none · 0 | 98.11% · STEP 13 · 0 | 79.94% · STEP 138 · 0 | 30.23% · STEP 480 · 0 |
| joshua | 10031 | 99.98% · MACULA 2 · 0 | 94.87% · STEP 515 · 0 | 78.55% · STEP 2152 · 0 | 29.25% · STEP 7095 · 2 |
| judges | 9885 | 99.98% · MACULA 2 · 0 | 95.68% · STEP 427 · 0 | 79.28% · STEP 2048 · 0 | 29.63% · STEP 6954 · 2 |
| lamentations | 1540 | 99.87% · MACULA 2 · 0 | 99.29% · STEP 11 · 0 | 83.83% · STEP 249 · 0 | 42.01% · STEP 891 · 2 |
| leviticus | 11950 | 99.97% · MACULA 3 · 0 | 96.11% · STEP 465 · 0 | 76.29% · STEP 2833 · 0 | 35.30% · STEP 7729 · 3 |
| malachi | 876 | 100% · none · 0 | 98.17% · STEP 16 · 0 | 81.16% · STEP 165 · 0 | 36.07% · STEP 560 · 0 |
| micah | 1396 | 100% · none · 0 | 98.42% · STEP 22 · 0 | 83.52% · STEP 230 · 0 | 42.41% · STEP 804 · 0 |
| nahum | 558 | 100% · none · 0 | 99.64% · STEP 2 · 0 | 84.77% · STEP 85 · 0 | 51.08% · STEP 273 · 0 |
| nehemiah | 5312 | 99.98% · MACULA 1 · 0 | 97.36% · STEP 140 · 0 | 84.30% · STEP 834 · 0 | 31.87% · STEP 3618 · 1 |
| numbers | 16408 | 99.99% · MACULA 2 · 0 | 96.82% · STEP 522 · 0 | 81.89% · STEP 2972 · 0 | 29.51% · STEP 11564 · 2 |
| obadiah | 291 | 99.66% · MACULA 1 · 0 | 97.25% · STEP 8 · 0 | 81.10% · STEP 55 · 0 | 35.40% · STEP 187 · 1 |
| proverbs | 6914 | 99.86% · MACULA 10 · 0 | 99.73% · STEP 19 · 0 | 88.66% · STEP 784 · 0 | 49.87% · STEP 3456 · 10 |
| psalms | 19583 | 99.94% · MACULA 10 · 1 | 99.22% · STEP 152 · 1 | 85.11% · STEP 2914 · 1 | 44.19% · STEP 10918 · 11 |
| ruth | 1296 | 99.77% · MACULA 2 · 1 | 96.68% · STEP 42 · 1 | 78.94% · STEP 272 · 1 | 31.94% · STEP 879 · 3 |
| song-of-songs | 1250 | 99.92% · MACULA 1 · 0 | 97.68% · STEP 29 · 0 | 85.36% · STEP 183 · 0 | 57.04% · STEP 536 · 1 |
| zechariah | 3127 | 99.97% · MACULA 1 · 0 | 97.57% · STEP 76 · 0 | 79.76% · STEP 632 · 1 | 31.02% · STEP 2156 · 1 |
| zephaniah | 767 | 99.87% · MACULA 1 · 0 | 98.04% · STEP 15 · 0 | 82.14% · STEP 137 · 0 | 38.85% · STEP 468 · 1 |

### 7.3 What the automatic second does to the resting line (`rest_fill.py`)

STEP leaves 267 places. Today the resting line there:
- stands under no line at 60, where MACULA would add words;
- prints another source's words at 199, which MACULA's would replace. Those 199 are credited M4 77 (a STEP TAHOT row from another place under the same key), M14 58, PIECE:MACULA 32, M9 24, M25 7, and others 9. Examples:
  - Daniel 1:4:6 «blemish» (M9) → «physical defect»
  - Daniel 4:16:22 «form» (M14) → «lord my»
  - Daniel 11:10:14 «from + Gaza» (M4) → «fortress his»
  - Deuteronomy 2:33:8 «build» (M14) → «sons his»
- has no source to fill it at 8, where today's line stays.

So the owner's third message, read literally at rest, moves the live line at 259 words in 32 books. Every resting-lines record for those books moves, and check-same-product's rule "at rest the lines equal the live ones" must name these 259 places.

## 8. The bake: `tools/bake-default-picks-v1.mjs`

**Header**, in the bake-word-senses-v1 style: American English, no Hebrew in any literal, keys printed as \u escapes.
```
#!/usr/bin/env node
// bake-default-picks-v1 · each source's own pick at every word place, laid on the zone's words, and the source that fills the most of what each leaves
//
// RULE: default-picks-rule-v1-each-source-prints-its-own-pick-and-the-source-that-fills-most-of-what-it-leaves-is-its-second
// LEDGER: -
// no frame letter. It reads the corpus lane's default picks v1 and its v1.1 mend (relays v180, v180.1; pinned in
// data/default-picks/PIN.json), the zones and the served route store, and writes data/default-picks/<book>.json.gz,
// data/default-picks/index.json and data/default-picks-receipt-v1.json. No row is judged here and no text is changed.
// ... (the owner's three messages of 14 November quoted; the four print rules of §4; the REFUSED list below)
// Run: node tools/bake-default-picks-v1.mjs --ledger <dir holding default-picks-v1/ and default-picks-v1.1/> [--dry]
```

**Arguments.** All are read through `arg(name, default)`, with a `startedAs` guard (`main-guard-v1.mjs`).
- `--ledger`: required and never guessed; "usage" and exit 2 without it.
- `--out` defaults to `data/default-picks`.
- `--zones` defaults to `data/zones`.
- `--store` defaults to `data/route-store`.
- `--overlays` defaults to `data/overlays`.
- `--pin` defaults to `data/default-picks/PIN.json`.
- `--receipt` defaults to `data/default-picks-receipt-v1.json`.
- `--dry`.

**Steps:**
1. Read the PIN entries and the receipts. Hold every book file to receipt-v1 `outputs[]`.
2. Load the rows tables: v1 (rows 0..152,422) and the added rows (152,423..152,647). Resolve all of them (§3).
3. Apply the mend: replace `step` at the 1,265 listed places.
4. For each of the 39 books, in `outputs` order:
   - read the zone;
   - build n → place and refuse on any mismatch;
   - build `places`, `bdb_words` and the counts;
   - work out `line`, `any`, `fills`, `second` and `rest_fill`.
5. Write the 39 files, then the index, then the receipt. Write only what changed; a second run writes nothing.
6. Print one line per book and a total line, in the house style ("  ok  genesis · 20,612 places · STEP 20,604 · …").

**REFUSED** (each said in words, with nothing written):
1. Any pinned file is not its bytes and line count, or a book file is not the bytes receipt-v1 names.
2. A zone word with no ledger place, a ledger place with no zone word, the ledger's order differing from WORD_N order, or a book with no zone. Today: 0 of 305,431.
3. A mend line names a place v1 lacks, or changes a pick of kind r. Today 0, matching amendment check 1.
4. Picks are not numbered 1..n per source per place, or per piece for UBS. Or a kind-v pick lacks `[letter, Hebrew]`. Or a BDB meaning is neither `point<p>:<marker>.` nor "the entry". Today 0.
5. A named row has no served row under [key, rank, m, sha16], or its m id is in no store's `m_sources`. Today 0 of 152,648.
6. A BDB record's slot 5 differs between two of its picks in a book. Today 0. The per-record table rests on this; it is Q4.
7. A printed text holds U+FFFD or a control character other than U+000A. Today 0; the one U+000A is counted.
8. The bake's own counts miss what the receipts give:
   - receipt-v1 `picks_per_place`: STEP 0/1/2/3+ = 267 / 299,349 / 5,500 / 315; MACULA 8,965 / 296,466; UBS 48,478 / 255,427 / 1,490 / 36; BDB 189,731 / 110,877 / 4,542 / 281. All four match today.
   - receipt-v1.1 `mend`: places changed 1,265; picks changed a 1,088 and v 298; in_v1 v 748 and a 5,391; picks that fall together 15.
   - Today after the mend: v 748, a 5,376, r 305,222.
   - receipt-v1's `step.variant_picks` 850 and `alternative_picks` 5,422 are NOT held. The receipt records them as "not held: asked of the corpus lane on 14 November (question 2)".

**Counted, not refused** (in the receipt, per book and in total):
- line picks per source; places with 2 or more picks;
- UBS "-" alone (10,907) and UBS mixed pieces (3);
- BDB pick 1 with no highlight (11,668), of which 150 have a later pick that has one;
- rows held twice (1);
- per source, line picks that name no row, or whose first row is another source's (§3);
- entry-gate estimates;
- BDB picks whose every row is an opening (12,704);
- STEP pick 1 against the zone's pieces (728 differ);
- slashes per source (MACULA 2, UBS 133,145, BDB 25,779);
- the U+000A (1); `kq` words (1,062);
- ledger places missing from `data/piece-store/<book>.json` (Q5).

**The round.** `tools/round-v1.sh` gets a `defaults` step after `records` and before `lines`. Its steps become `zones,stamps,search,records,defaults,lines,chain,door`, with the ledger passed as `--default-picks <dir>`.
- Without the flag it prints "no --default-picks given: data/default-picks stands as it is", as `--lattice` does.
- `check-default-picks-v1` then holds each file's `zone.places_sha256` to the served zone, so a zone rebuilt without a fresh bake is caught.

## 9. The seven open questions: what the bake does until each is answered

1. **STEP picks that name no row.** 949 in Genesis; 17,077 line picks in all 39. Example: Amos 1:1:2 «Amos».
   - The file carries the ledger's words, and the line prints them credited M4.
   - The card makes a pill when no pool pill prints the same text. The receipt counts these per book.
   - Whatever the cause, nothing changes: the words are STEP's own. A reissue changes the pins and the bake runs again.
2. **receipt-v1's STEP counts.** The bake holds the files to receipt-v1.1 (`in_v1` 748 / 5,391; after the mend 748 / 5,376) and to receipt-v1's `picks_per_place`, which match. It never holds 850 / 5,422. The receipt marks them as asked.
3. **The variant's letter.** Carried verbatim as the third element of a kind-v pick (K at 725 of 748). It is not interpreted and not tied to the page's ketiv/qere halves. The variant's Hebrew is not carried.
4. **BDB words per sense.** Slot 5 is carried once per record in `bdb_words`, with the sense marker per pick. The line prints «words · sense N» (for example «shape, create · sense 1»). Refusal 6 enforces "one slot 5 per record". If the lane issues words per point, that is a new rule and a v2 shape with the words carried per pick.
5. **Places the piece store lacks** (Genesis 24, Ruth 11, Amos 4). The bake does not depend on the piece store; places map to zone words directly. It counts these places and lists them in the receipt. The default line prints there as anywhere else.
6. **Picks whose named row the card withholds** (Genesis 1:8:10 «second»). The bake does not judge gates. The line prints the pick, because the default sits above the gates as the place reading does. The receipt counts, approximately, picks whose every named row the entry gate would withhold: STEP 1,014, MACULA 7,241, UBS 1,319, BDB 224. check-default-picks-v1 D4 expects a made pill there.
7. **Jastrow.** The index's `sources` lists four, so the page draws four pills. When the ledger lands:
   - `DEFAULT_PICKS_BOOK_V2` adds a fifth slot;
   - a `{ id: "jastrow", pill: "Jastrow", slot: 4 }` entry is added;
   - its rows resolve in `data/overlays/jastrow` (M12, store d5324f308ef9);
   - `second` is recomputed with Jastrow included.

## 10. Data-side risks

- **The at-rest second (§7.3)** moves the live line at 259 words in 32 books and moves those books' resting-lines records.
- **MACULA must skip spanJoin too**, at 2 places. The brief listed only UBS and BDB.
- **Credit split.** For 176,657 MACULA line picks and 55,445 STEP line picks, the first named row is another source's: a shared text stands as one row (RULE.md, the amendment's point 1). Which source the chip credits matters (decision 4).
- **The one doubled row (119921)** and the line feed at Genesis 30:37:11 are kept as the source gives them and counted.

## Decisions only the owner can make

- At rest (STEP lit), the automatic second (MACULA in 32 books, a tie with UBS in 24 of them, settled by pill order) would replace today's line at 199 words: 77 credited M4 (a STEP TAHOT row from another place), 58 M14, 32 PIECE:MACULA, 24 M9 and others. It would also fill 60 words that stand under no line today. The owner's third message, read literally, says yes: that moves the live resting line at 259 words and the resting-lines records of 32 books. Confirm, or limit the at-rest fill to the 60 blank words.
- Under STEP at rest, at the 4,402 words under a joined-run line and the roughly 512 single words where STEP's own pick differs from today's line: keep today's line (recommended; #90 stays open), or print STEP's pick (which decides #90 by default)?
- UBS's "-": no line pick, so the second source fills it (UBS 80.56%; recommended, the card still shows "-"), or print it as given (UBS 84.13%, the figure in the owner's notes)? This was the brief's call 8, recommended but never put to the owner.
- Which source the line chip credits where a pick's first named row belongs to another source (STEP 55,445; MACULA 176,657; BDB 33,194; UBS 70 line picks): the pick's own source (the brief; recommended, since the second count held the words to the source's own file), or the row's source and license (the sentence in the 14 November letter to Moses)?
- BDB's line text: the record's highlighted words whole, with « · sense N» (what the owner accepted on the prototype; the data carries this), or only the first highlight (the brief's call 3, never ruled)? 25,779 BDB line texts hold several highlights.
- Ship the per-book file with full STEP words (3.74 MB gz for all 39; Genesis 222 KB; recommended) or with the STEP short form tied to the zone's pieces (2.76 MB; Genesis 163 KB)?
- Tie-break for the automatic second: pill order STEP, MACULA, UBS, BDB (proposed). Note that BDB can never be STEP's second: by construction it fills none of STEP's gaps.

## Could not determine

- Whether GitHub Pages gzips .json in transit: the proxy answered 403 for the live host, so I recommend shipping .json.gz either way.
- The exact count of picks the entry gate withholds: I read the place's entry from the zone word's tg, while the page reads the lattice's core-piece tags. My counts (STEP 1,014; MACULA 7,241; UBS 1,319; BDB 224) are estimates.
- What receipt-v1's STEP counts (variants 850, alternatives 5,422) measured (question 2 to the corpus lane).
- What the variant letters mean beyond their spelling (K 725 of 748; also S, P, F, V, H, A, AH, B, BH, C, D, E) (question 3).
- Why 17,077 STEP line picks name no row (question 1); the bake's behavior does not depend on the answer.
- Nothing was run in a browser. The page-side reading (WORD_N at zone.html 4152, spanJoin 3425, signsOffLine 3365, suggestedReady 3408, the source-suggested index fetch at 3927) comes from the code. Line numbers are from pt zone.html at 17,179 lines.
- Whether the owner means the automatic second to replace an existing non-STEP resting line (199 words) or only to fill empty ones (60 words).
