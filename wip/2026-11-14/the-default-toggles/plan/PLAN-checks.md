# Default picks: the checks (v49, checks part)

Scope: all 39 books, not Genesis 1. The node laws read every book. The browser laws read three whole works, chosen from the data and never named in the check (check-scope-derived S1). The outside reader is auditing the live site, so the plan ends with a live law.

## 0. Where the owner's words override the brief, and what the checks follow

| Brief | Owner, 14 Nov (the checks follow this) |
|---|---|
| Five pills: a resting pill «98% STEP TAHOT, 2% others» (`default-resting`), then "STEP default", "UBS default" and so on | Four pills that say only the source's name: «STEP» «MACULA» «UBS» «BDB», with «Jastrow» later. «STEP» is the one lit at rest. There is no resting pill and no law about a resting label. |
| No second source | Every first source carries a second, chosen per book: the one that fills the most of what the first leaves. One is chosen even at 99.9%. The reader can change it. Wherever both have no pick, today's line stands. |
| Coverage printed under every pill (`.mode-dir` "78%") | Choosing a source opens a note: it is partial, with the first source's share, the second's share and the rest. |
| Pressing a lit pill other than the resting one returns to rest | "if you click it the other ones go off": exactly one pill is on. What pressing the lit pill again does is a stated behavior the checks hold (decision 8). |

## 1. Measured: STEP's pick against today's line

Scripts are in my folder. Each runs with `python3 -I` against `pt` at ace7f07eba and the pinned ledger, with the v1.1 mend applied.

**Today's line is not the zone's baked key table.**
- `zone.gloss[k]` agrees with today's line at only 8,810 of 20,612 Genesis places.
- The line is `placeLine` (zone.html:12306), which reads `word.pg`, TAHOT's pieces at the place.
- STEP's pick 1 equals the zone's pieces at 304,272 of the 304,294 places where the pieces are whole. All 22 that differ are places whose pieces are MACULA's.
- So the checks compare against the resting-lines record and `word.pg`, never against `zone.gloss`.

**Three books, every place.** Columns are places; "a" counts STEP's pick 1 against the record's line with a fold that ignores case, spacing, joiners, gaps, sign-only pieces, word brackets and a closing stop.

| Book | places | a. STEP pick = today | b. today is a run line (words) | c. one word, today differs | d. today bare, STEP has a pick | e. no STEP pick | MACULA fills e | of those, differs from today |
|---|---|---|---|---|---|---|---|---|
| Genesis | 20,612 | 20,325 | 267 (128 lines) | 9 | 3 | 8 | 8 | 3 by fold, 7 exactly |
| Malachi | 876 | 823 | 50 (25 lines) | 2 | 1 | 0 | 0 (no second) | 0 |
| Psalms | 19,583 | 19,381 | 126 (63 lines) | 40 | 25 | 11 | 10 | 10 |

**All 39 books** (305,431 places, `all39.json`):
- **Where today's line is TAHOT's place reading, STEP is that line.** Every one-word line the record credits `PIECE:TAHOT` equals STEP's pick 1: 299,879 of 299,879, by `fold2_check.py`.
  - Byte for byte through `spanJoin`: 279,340.
  - Once sign pieces are drawn as gaps: about 20,500 more.
  - The rest differ only in word brackets, e.g. «[is] this?» against «is this?».
- **Where STEP's pick and today's line differ:**
  - 500 one-word lines credited to another source: M14 194, M4 129, M9 55, PIECE:MACULA 22, and others.
  - 4,402 words under 2,177 run lines. STEP has a pick at every word of every run.
  - 187 words today draws bare.
- **No STEP pick with words: 267 places.**
  - MACULA has a line at 259 of them; it differs from today at 221 by fold and 255 exactly.
  - Today's line there is credited to M4 at 77, bare at 60, M14 at 58, PIECE:MACULA at 32 and M9 at 24.
- **What both leave under STEP then MACULA: 8 places.** The smallest book holding one is Ruth 3:12:5. No source of the four has a pick there, and today's line reads «mother» (M9).

**How the suite stays green at rest.**
1. **Rule R (recommended): «STEP» at rest draws today's line wherever STEP has a pick of its own.**
   - `defaultLine()` returns null when the lit source is STEP and STEP has a pick here.
   - This is honest, not a relabel: at all 299,879 TAHOT places the line already is STEP's pick.
   - The 5,089 places where they differ are #90's open question (runs) and store rows. They stay as they are.
   - Zero lines move there.
2. **The second fills only where STEP has no pick (owner, message 3).**
   - That moves at most 259 places: 255 exact text changes, 221 changed words. A few bare words gain a line, e.g. Ruth 3:14:2 «feet his».
   - The bake writes the list (`rest-fills`), and the checks hold the page to it exactly.
   - If the owner declines filling at rest, nothing moves.
3. **Printing STEP's own pick everywhere it has one would move about 5,350 words.** That includes every run line, which pre-empts #90. Not recommended for this ship.
4. **Any `zone.html` edit makes all 40 resting-lines records and every chain file stale.** So the ship's round runs `defaults,lines,chain,door`. After that, check-chapter-pages-v3 L1-L3 and check-chain-book-v2 K3/C1 hold against the new records.
5. **check-same-product S1 (live against new) learns `--expect <rest-fills file>`.** It then judges two things: every line difference on a sampled page is a listed fill, and every listed fill on a sampled page differs as listed.

## 2. The contract these checks assume (the page and data plans must use the same names)

- **Storage:** key `fh.defaults`, holding the first source id. The second is kept under `fh.defaults.second`, stored per first (decision 12). Neither is `fh.sources.defaults`, which `DEFAULTS_KEY` at zone.html:3658 already holds.
- **URL:** `?default=<id>` and `?second=<id>`, each for one load and not stored, as `?senses=` works (zone.html:3532).
- **Page state:** `window.__default = { on, second, ready, book, shares }`. The checks wait on it and read the state from it. They never take expected values from it.
- **Pills:** source ids `step`, `macula`, `ubs`, `bdb`; buttons `#default-step`, `#default-macula`, `#default-ubs`, `#default-bdb` in `#modeRow` (zone.html:2446), each with `aria-pressed`. The texts are exactly «STEP», «MACULA», «UBS», «BDB»: the `name` in `data/default-picks/index.json` and the `lab` of the TOGGLES positions, so the name matches everywhere (CLAUDE.md).
- **Note:** `#defaultNote`, with a chooser for the second.
- **Rail:** TOGGLES entry `{ id: "defaults", voice: ..., lab: ..., why: ..., positions: [{ id: "step", lab: "STEP" }, { id: "macula", lab: "MACULA" }, { id: "ubs", lab: "UBS" }, { id: "bdb", lab: "BDB" }] }`. The id is letters only and the positions are literal objects, as build-toggle-design-v1.mjs:69 and :74 parse them.
- **Data:** `data/default-picks/index.json`:
  - `{ rule, pins: {ledger files by sha256}, sources: [{ id, name, credit: {r: "M4", v: "M19", a: "M19"} or {pick: "M3"} }], books: { <book>: { sha256, places, first: { <id>: { has, second, fills, left } } } } }`
  - Per book: `data/default-picks/<book>.json`, `places[n-1]` by WORD_N (zone.html:3407).
  - `rest-fills`: per book, the places where STEP has none and the second has one.
- **Credits:** each line's chip `.g-lic` `data-line` is the source's M: M4 for STEP's reading, M19 for STEP's v/a picks, M3 for MACULA, M18 for UBS, M46 for BDB.

## 3. tools/check-default-picks-v1.mjs

**Header**
```
#!/usr/bin/env node
// RUN: tree
// GUARDS: <the bake's RULE id, default-picks-rule-v1-...>
// LEDGER: -
// no frame letter. A check reads the bake, the ledger where this machine holds it, and the page, and judges them.
```
- **Flags:**
  - `--ledger <dir holding default-picks-v1/ and default-picks-v1.1/>`, read through `arg(`. Never guessed.
  - `--self-test` runs the fault harness (section 4).
- **Imports:** `loadPlaywright`, `launchOptions` (playwright-v1), `serveTree` (serve-tree-v1), `zonesOnDisk` (zones-on-disk-v1), `linesOnPage`, `readRecord`, `recordPath` (resting-lines-v1), and the bake's RULE id only, as K0 does.
- **What it never imports:** the bake's reader, resolver or percent function. Hashing is node's own sha256, as check-chain-book-v2 does.
- **No Hebrew in literals or output.** Hebrew is printed as U+ codes.
- **Without a ledger:** each law that needs it prints `  --  Dn not judged here: the ledger is not on this machine`, which run-checks lists under its verdict.

**The node-side model.** Each opened work is held to an expected line computed in node:
- the zone;
- the record (`data/resting-lines/<w>.json.gz`);
- the bake file;
- the index.

It is computed per place, in this order:
1. A reader's ruling: skip the place.
2. A ketiv/qere pair word: the record's line.
3. A word under a run line: the stated run rule (decision 3).
4. X gives a line: X's text.
5. Otherwise Y gives one: Y's text.
6. Otherwise: the record's text and chip, byte for byte.

**Text per source:**
- STEP: compared by fold2, with the exact bytes held through D5 and D11.
- MACULA: `macula[0]` exactly, never through `spanJoin` (2 MACULA lines carry "/").
- UBS: each piece's first gloss joined by " + ". The " / " stays: 133,770 first glosses carry it. A sign alone ("-") is no pick.
- BDB: slot 5 up to the first " / " (call 3, taken with #107). 25,779 slot-5 texts carry " / ".

**Works opened**, each whole, in a context with nothing stored:
- w1: the smallest work holding a place that both STEP and its second leave (Ruth today).
- w2: the smallest work where STEP leaves nothing, so there is no second (Nahum today).
- w3: the smallest work where the second under STEP fills a place today's line draws bare.
- w4: a work on disk the index does not list (the Tikkunei Zohar today).

**Laws**

- **D0 · the rule.** The rule this check guards is the rule the bake declares.
- **D1 · the bake is the ledger** (node, all 39 books).
  - a. Every ledger file hashes to receipt-v1's `outputs`, and the v1.1 files to receipt-v1.1's. The index's `pins` name exactly these.
  - b. For every book file:
    - `places.length` equals the zone's entries, marks included;
    - an entry is null exactly where every source is empty;
    - at each place, each source's picks equal the ledger's, read by the check's own parse: STEP with the mend replaced (kind, words, letter), MACULA's words, UBS `[piece, n, words]`, BDB `[marker, slot5]`.
  - c. STEP after the mend has 748 picks of kind v and 5,376 of kind a, with 15 merged. That is receipt-v1.1, not receipt-v1's 850 and 5,422. The mismatch is printed as `  --` (question 2).
  - d. Every book file's sha256 equals `index.books[b].sha256` (judged without the ledger too).
- **D2 · every named row re-resolves** (node).
  - Each `[key, rank, m, sha16]` of rows-v1 (152,423) and of rows-added-v1.1 (225, numbered from 152,423) is found in `data/route-store/shards/<sha256(key)[:2]>.bin` under its key, with that rank and that m, and with `sha256(text)[:16]` equal.
  - Missing is a failure. Found twice (1 today) is counted and named.
  - Judged in CI only if the bake ships the rows table (2,270,519 bytes gz measured; decision 11).
- **D3 · the note's numbers are the ledger's** (node, all 39). For each book and each first source X:
  - `has` is the places where X gives a line (the LINE reading of section 1). The second is the arg-max fill, with ties going to the earlier pill (STEP, MACULA, UBS, BDB, Jastrow), and none when the best fill is 0.
  - `fills` and `left = places - has - fills` complete the record. All four must equal `index.books[b].first[X]`.
  - Measured today:
    - First STEP: the second is MACULA in 32 books. In 31 of them the MACULA/UBS tie is broken toward MACULA. 7 books have no second: Haggai, Hosea, Joel, Jonah, Malachi, Micah, Nahum.
    - MACULA, UBS and BDB take STEP as second in all 39 books.
    - Totals: STEP 99.91% (MACULA fills 0.08%, 8 left), MACULA 97.06% (STEP 2.93%, 8 left), UBS 80.56% (STEP 19.44%, 22 left), BDB 34.06% (STEP 65.85%, 267 left).
- **D4 · a first visit rests on STEP** (page, W2's pattern).
  - Exactly one pill has `aria-pressed=true`, and it is «STEP».
  - The source pills read the index's names in its order.
  - `__default.on === "step"`, and `__default.second` is D3's second for the book.
  - `localStorage.getItem("fh.defaults") === null`.
  - The Menu's `#menuPick` mirrors the row.
- **D5 · at rest the line is today's line** (page, every section of w1 to w3, through `linesOnPage`).
  - Every unit's text and credit equal the record byte for byte, except exactly at the bake's `rest-fills` places. There the line is the second's text under the second's chip, and the card's pressed pill equals it.
  - Node side: wherever the record credits PIECE:TAHOT on a one-word line, STEP's pick 1 is the same words by fold2 (0 exceptions today).
- **D6 · each pill turns the others off** (page). Each pill is pressed in the row and then in the Menu:
  - exactly one is pressed;
  - `__default.on` follows, and `fh.defaults` stores it;
  - a reload keeps it, and `?default=` is not stored;
  - the note is shown exactly when `has < places`, and its strings are `pct()` of D3's counts;
  - pressing the lit pill does what decision 8 states.
- **D7 · the line under each X with its second Y** (page, every place of w1 to w3, for each X):
  - each line equals the node model of section 3;
  - chips name X's or Y's M;
  - the line where neither has a pick is the record's line, its own chip kept (and the dim class, if adopted);
  - ketiv/qere pairs keep the record's line;
  - runs follow decision 3;
  - no chip names a source that is switched off.
- **D8 · the second can be changed.** Choose each remaining source Z as second:
  - the lines that change are exactly the places where X has no pick and Y or Z has one, computed in node;
  - the note becomes `pct(has, fillsZ, left)`;
  - the choice is kept (decision 12);
  - reset brings back the automatic second.
- **D9 · a ruling outranks a default** (zone.html:5072).
  - Rule a word under STEP, then switch to each X: the ruled line, its chip and `.chosen` stay. Other words follow X.
  - "joined words" out and back keeps the ruling (E1/E4's relay).
  - Rule under X and switch back to STEP: the ruling stays.
- **D10 · reset.** From X with a changed second and a ruling:
  - `#resetPill` is enabled;
  - pressing it lights «STEP» with its automatic second and forgets the ruling;
  - every line equals the record byte for byte.
- **D11 · back to STEP is the first paint.** After each X, pressing «STEP» returns every line and the cards of the first five words (pills, pressed pill, `.r-now .v`) byte for byte.
- **D12 · the card answers as the line.** Under each X, on the first 20 words of each opened work:
  - the pressed pill = `.r-now .v` = the line;
  - where no pool pill prints the pick, a made pill credited to X stands first and pressed; made pills are counted against the receipt's `picks_printed`;
  - `.r-piece` is unchanged at rest, and the BSB line stays;
  - picks whose named row the entry gate withholds (question 6) still print and are counted.
- **D13 · several picks.**
  - The card shows X's picks 2 to n in the ledger's order, numbered as the source numbers them, with a variant's letter as given.
  - The line takes pick 1.
  - Several picks occur at 5,815 places for STEP, 1,526 for UBS (in one piece) and 4,823 for BDB.
- **D14 · no defaults file** (w4).
  - The source pills and the note are hidden.
  - No `data/default-picks/<w>.json` is requested.
  - The record's lines stand byte for byte.
  - With no such work on disk: `  --  D14 not judged`.
- **D15 · fetches.**
  - `index.json` is fetched once.
  - The book file is fetched once: at boot under the fill at rest, otherwise with the first card or the first press.
  - `__default.ready` is waited on before any line is judged.
  - With the book file aborted (`p.route`), today's line stands everywhere, the note says the source could not be read, and there is no page error.
- **D16 · no page errors**, and lines come to rest within twenty readings.

**The percent function D6 holds** (decision 7):
- `pct(c, N)`: 0 gives "0%"; N gives "100%"; `c*1000 < N` gives "<0.1%"; otherwise `floor(1000*c/N)/10 + "%"`.
- The left share is printed from its own count, never as 100 minus the others. The remainder form would print a false "0.1% left" in 94 of the 312 book-and-source rows where nothing is left.

## 4. The fault harness (`--self-test`): each law must go red

**Node side, on copies held in memory:**
- H1: one STEP pick's words changed; D1 must go red.
- H2: the v1.1 mend left off at one listed place; D1 must go red.
- H3: one row's sha16 flipped; D2 must go red.
- H4: one book's tie broken the other way (UBS before MACULA); D3 must go red.
- H5: shares computed with the ANY reading (UBS "-" counted, BDB slot 3 counted: 84.13% and 36.43%); D3 must go red.
- H6: the left share as a remainder; D6's strings must go red.

**Page side, through `p.route`, never touching disk:**
- H7: a book file served with one MACULA pick changed. D7 must go red at exactly that place, which proves the page reads the file.
- H8: the book file aborted. D15 must stay green.
- H9: an index served with another second. D4 must go red.
- H10: `fh.defaults = "ubs"` set before a "first visit". D4 must go red, and bake-resting-lines must refuse.

Each prints `  ok  Hn the law went red as it should`.

## 5. Existing tools and checks that must learn the new state

- **resting-lines-v1.mjs**
  - Line 109, the `linesInPage` state: add `default: (window.__default||{}).on||null, second: (window.__default||{}).second||null`.
  - `linesOnPage`: after the lattice wait, wait for `__default.ready` when `__default.book` is set, and throw in words after 30 s.
  - `whyNotOfThisTree` needs no change: the index (and the book file under the fill at rest) join `read_off.files` on their own.
- **bake-resting-lines-v1.mjs:** refuse a reading whose state default is not "step" or whose second is not the index's automatic second ("a stored default leaked into a first visit").
- **card-readings-v1.mjs**
  - Line 169: the same two state fields, in the same order. K3 compares the two literals with `JSON.stringify`.
  - `STATES.lifted.holds` (lines 80-91) gains `default: "step"`, and the guard at line 217 tests it.
  - The `late` wait (lines 200-214) also waits for `__default.ready`.
  - `readCard` reads a `defaults` field only if the card prints new lines (for example `p.r-dflt`).
- **build-chain-book-v2.mjs**
  - The states record `read.rest.state` on its own.
  - If the cell gains `defaults`: bump `CHAIN_SCHEMA` from `CHAIN_BOOK_V3` to `CHAIN_BOOK_V4` (line 82), name it in `SHAPE` (line 174), and update the "at rest, and lifted" text (lines 335, 411) to "the «STEP» default lit, its second chosen for the book".
- **check-chain-book-v2.mjs:** K3's lifted test (line about 174) adds `lifted.default !== "step"`. C1-C3 compare `defaults` if it is added.
- **check-same-product-v1.mjs**
  - `STATES` (line 40) becomes `[name, id, back]`, adding `["MACULA", "default-macula", "default-step"]` and likewise UBS and BDB. `read` presses `back` to restore.
  - The old live build lacks the ids, so those states are reported "not compared".
  - Add `--expect <file>` for the fills at rest.
  - S2 is unchanged as long as new card rows stand outside `.r-pills`.
- **check-ruled-equals-first-paint-v1.mjs:** the loop at line 33 becomes `[["he", null], ["en", null], ["he", "ubs"]]`, opening with `?default=ubs`. E1/E4 must hold under UBS, and a ruling under UBS stays through the relay.
- **check-word-senses-v1.mjs:** W2 (line 168) also reads `window.__default.on` and `fh.defaults`. The verdict (line 379) requires "step" with nothing kept, so a stored default cannot pass as rest. W5 also runs under `?default=ubs`: when the switch goes off, the line returns to UBS's line, not to today's.
- **build-toggle-design-v1.mjs:** no code change if the TOGGLES entry fits the regexes at lines 69 and 74. Run it again to rebuild /toggles/.
  - Its `VOICE_LEDE.arrange` says "no reading is added". Made pills add readings: 18,679 STEP picks, 10,849 MACULA and 10,682 BDB are printed by no row. So the voice must be chosen (decision 10).
- **check-clean-address-v1.mjs:** green once /toggles/ carries `id="defaults"`.
- **check-reset-pill-v1.mjs:** R1 counts a non-STEP default or a changed second as off-default. R4 puts «STEP» and its automatic second back. Update the title string at zone.html:2491; no check reads it.
- **check-menu-switches-v1.mjs:** M1 and M2 hold on their own (`rowPills`, zone.html:16877). M3's flip list (line 43) gains `default-macula`: pressed in the Menu, it lights there and in the row, and `default-step` goes dark.
- **check-card-opens-on-the-line-v1.mjs:** add the settings `fh.defaults` = macula, ubs and bdb. C1 holds; C2 checks that the first pill is X's pick 1 where X has one.
- **check-line-follows-card-v1.mjs:** add F2 under X (a source switched off, decision 13).
- **check-page-fetches-v1.mjs:** F1 allows the book's defaults file at load only under the fill at rest. F4's analog: a second card fetches nothing more.
- **check-line-reads-the-place-v1.mjs:** P2 can go red at the 32 fills where today's line is MACULA's own pieces («tent + his» against MACULA's «tent his»), unless decision 9 keeps today's line there.
- **check-live-v1.mjs:** add L5, the live `data/default-picks/index.json` equals this checkout's byte for byte.
- **No change needed:** check-chapter-pages-v3, build-front-door-v1, bake-search-index-v1 (made pills are not indexed in v1), the kq checks.
- **round-v1.sh**
  - New flag `--defaults <dir>`.
  - `STEPS` (line 57) becomes `zones,stamps,search,defaults,records,lines,chain,door`.
  - `if has defaults`: run `node tools/bake-default-picks-v1.mjs --ledger "$DEFAULTS"`, or `--verify` when no folder is given.
  - It must run before `lines`.
- **run-checks-v1.mjs:** no edit. It finds every `tools/check-*.mjs` (line 131) by its `// RUN:` header (line 71) and lists the `  --  not judged` lines. The rule id is counted as guarded through the GUARDS line (pipeline-manifest). The bake declares `// LEDGER:` (check-ledger-declared).

## 6. The seven questions to the corpus lane: stated behavior and the law that holds it

1. **STEP picks that name no row:** they print the ledger's words credited to M4, as a made pill (D12, counted).
2. **receipt-v1's counts:** the checks hold to receipt-v1.1 and print the mismatch (D1c).
3. **A variant's letter:** printed as given; it is not tied to the kq halves, and pairs keep today's line (D13, D7).
4. **BDB's words for a sense:** slot 5 to its first highlight, with "sense N" on the card (D7, D13).
5. **Places the piece store lacks:**
   - The line works by WORD_N. `places_map.py` showed 305,431 zone words match 305,431 ledger places.
   - The card opens on the whole form there.
   - D7 judges these places like any other.
6. **A named row the card withholds:** the made pill stands above the gates (D12 counts it).
7. **Jastrow:** the source list comes from `index.sources`, so a fifth pill needs no edit to the check.


## Decisions only the owner can make

- 1. Does the second source fill at rest under STEP (owner message 3)? Yes moves the live line at 259 places (255 exact text changes, 221 changed words; some bare words gain a line). No moves nothing.
- 2. Where STEP has a pick but today's line differs (500 one-word lines credited to other sources, 4,402 run words in 2,177 runs, 187 bare words), does «STEP» print today's line (recommended: zero moves; runs stay #90's call) or STEP's own pick (about 5,350 words move)?
- 3. Runs under a non-STEP first source: does it replace a run line only when it alone covers every word (MACULA 1,681, UBS 1,377, BDB 278 of 2,177)? Counting its second as well would break every run, because STEP is every other source's second and covers every run word.
- 4. Tie-break for the second: pill order STEP, MACULA, UBS, BDB? MACULA and UBS tie under STEP in 31 of 39 books.
- 5. A second that fills nothing (STEP in Haggai, Hosea, Joel, Jonah, Malachi, Micah, Nahum): no second and no note?
- 6. Share definition: what the line can print (UBS 80.56%, BDB 34.06%), or any pick (UBS 84.13%, BDB 36.43%, the figures in the owner's words file)? Recommend the first.
- 7. Percent format: one decimal, floored, «<0.1%» for small nonzero counts, the left share from its own count (not 100 minus the others)?
- 8. Pressing the lit pill: does nothing, or returns to «STEP»?
- 9. At the 32 fill places where today's line is MACULA's own pieces («tent + his»), keep today's line or print MACULA's words («tent his»)? This decides whether check-line-reads-the-place P2 stays green.
- 10. The voice of the `defaults` rail entry: «arrange» says no reading is added, but made pills add readings. «them» instead?
- 11. Does the bake ship the rows table (2.27 MB gz) so D2 is judged in CI after store changes?
- 12. Is the reader's chosen second stored per first source (`fh.defaults.second`) or once for all?
- 13. When the lit source, or its second, is switched off on the rail: the pill goes dead and «STEP» lights, or the next-best second is taken?

## Could not determine

- Nothing was run in a browser. Every page law is designed from the code, and the element ids, storage keys, URL parameters and `window.__default` shape are the assumed contract until the page lane names them.
- The exact text STEP's pick draws under signs off (joinerBefore and gaps). About 20,500 places match today's line only once signs are drawn as gaps, so the exact bytes must be read off the page, not recomputed in node.
- Which row of the ledger resolves to two store rows (the data lane's count: 1); I did not inspect it.
- Ruth 3:12:5: today's line reads «mother» (M9) at a word no source of the four picks. Not verified whether that word is written and not read.
- Whether GitHub Pages compresses JSON in transit, which affects the fetch laws and the shipped file names.
- What receipt-v1's STEP counts (850 and 5,422) measured (question 2 is open).
- The class name for the dim ink on today's line under a default, and whether the card shows other sources' picks at all (a `defaults` field in the chain only if it does).
- The exact rule id string the bake will declare.
