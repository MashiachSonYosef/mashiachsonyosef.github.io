# The default sources: one merged plan (critic, v49)

**Basis**
- `pt/reader/zone.html`: 17,179 lines, sha256 `4049381a9eb3482c…`, live main `ace7f07eba`. Line numbers below are for that file and will drift, so each place is also named by its function.
- Ledger: `default-picks-v1` with the `v1.1` STEP mend, pinned.

**Scope** (the owner's relayed word: not Genesis 1, which an outside agent only skimmed on the live site)
- Every figure covers all 39 books: 305,431 places, 1,062 ketiv/qere words.
- Examples come from Daniel, Ruth, Psalms, Jeremiah, Isaiah, Amos and Malachi.

**My own measures**
- Scripts: `…/v49/plan/critic/tools/` (`verify_rest.py`, `leaves_pg.py`, `final_counts.py`, `raw_collide.py`).
- Per-book output: `…/v49/plan/critic/final-counts-by-book.tsv`.

**Order of this plan:** the critic's findings (§0), then bake → record → page → checks → round → measures, with the owner's open calls last.

---

## 0. The critic's findings

### 0.1 Where the four parts contradict each other, and how this plan settles it

| # | What the parts say | Settled as | Why |
|---|---|---|---|
| 1 | **STEP's layer.** The spec part prints today's place line, else STEP's own ledger pick, which changes 616 resting words. The page and checks parts keep today's line wherever STEP has a pick. | **STEP is today's line, unchanged.** It is filled only where STEP has no pick of its own. | The owner's answer of 14 Nov, call 1 (`OWNER-ANSWERS-2026-11-14.md`): "Which default rests first: STEP's, today's line". The 13 Nov prototype said the same. The spec's 459 replacements (e.g. Daniel 2:5:5 «circumcise(-ing)» M14 → «word + the») become an owner call (§8, call 2). STEP's ledger words never print on the line, so the spec's 22 two-word TAHOT spans and the signs-folding question disappear. |
| 2 | **What moves at rest.** spec 616, data 259, page 243, checks 259. | **212 lines in 29 books.** | I measured 267 places with no STEP pick. Of those, 23 are ketiv/qere and 1 has no pick from any source. The other **243** have MACULA words. **31** of those 243 already print MACULA's own words through the place line: the zone's `pg` pieces are MACULA's, credited `PIECE:MACULA`, e.g. «tent + his». Filling them again would only turn «tent + his» into «tent his» and turn check-line-reads-the-place-v1 P2 red. So the fill applies only where the place's pieces do not answer: **212 places**. There, 55 bare words gain words, 151 words change and 6 change only their credit. |
| 3 | **BDB's words on the line.** The spec and checks parts print the first highlight only, with no sense number on the line. The data and page parts print the record's highlight whole with « · sense N». | **The record's highlighted words (slot 5), whole, then « · sense N».** | Owner answer, call 3: "the entry's own words for the sense BDB files the verse under, with the sense's number". That answered the prototype, which printed «shape, create · sense 1.». Printing only the first highlight (brief call 3) was never ruled; it is §8, call 4. |
| 4 | **How shares are counted.** The spec part counts only what prints, over the record's 305,184 words: STEP 98.6% in Genesis. The other parts count each source's coverage from the ledger: STEP 99.91%. | **Coverage, from the ledger and the zone, by one rule (§2.2).** | The owner's own figures are coverage ("even if its 99.9% TAHOT"). Coverage needs no resting record, so there is no loop between fingerprints and labels. Ketiv/qere words count as "no pick" for MACULA, UBS and BDB, because the line never prints them there (the page part's rule), so the note matches the line except at joined runs. |
| 5 | **Ties for STEP's second.** checks: "MACULA/UBS tie in 31 of 32 books". data: 24. | **23 ties in 29 books** under this plan's rule. | The checks part counted the 7 books with no second as 0 = 0 ties. |
| 6 | **Names.** Three different sets: spec `fh.line.source`, `?line=`, `srcStep`, rail `here`/`fill`; page `fh.defaults`, `?then=`, `default-*`, `defaults`/`fills`; checks `fh.defaults`, `?second=`, `#defaultNote`. | **One set (§1).** | This follows the brief, the data paths (`data/default-picks/`) and the owner's own words "default toggles" and "secondary". |
| 7 | **Joined runs.** spec: out of reach under every source. page and brief: a source takes a run where it reads every word of it. checks: open. | **The brief's call 5:** a non-STEP source takes a run where it has a line at every word. Otherwise the run line stands. | Ruling 2 says "the line under every word follows it". Nothing moves at rest, because STEP never takes a run. Whether to keep it is §8, call 3. |
| 8 | **Long lines.** spec: clamp to three rows. page: no clamp. | **No clamp.** | The page's own law: `// NO CLAMP, as before: the box's display is never changed (2026-10-03 …)`, above `paintRuling`, lines 9130–9131. It is §8, call 5. |
| 9 | **The card's list of sources.** page: pressable. spec: not pressable. | **Not pressable in v1.** | The comment above `rowPills` (16864–16870): "so the row stays the one place a switch is decided". It is §8, call 9. |
| 10 | **"Reads first" set to anything but "the source here".** page: the sources still apply. spec: no pill is lit, and pressing one sets the order back to "the source here". | **The spec's behavior.** | The STEP pill *is* the rail's existing «the source here» position (`reads` entry, 3731–3733, `{ id: "place", lab: "the source here" }`). Two dimensions (order × source) would light «STEP» over an oldest-first line. |
| 11 | **The note's chooser buttons.** The page part gives them ids and points all four pills at one `aria-describedby="default-say"`. | **The chooser buttons have no id, and each pill has its own `.mode-dir`.** | `rowPills` (16877) mirrors every `#modeRow button` that has an id. `paintMenu` (16878–16900) copies the text of each pill's `aria-describedby` element. The page part's layout would put four chooser buttons in the Menu and the same note under every mirror. |
| 12 | **Where the bake runs in the round.** data: after `records`. checks: before `records`. | **Before `records`.** | `records` runs `check-c0-refusals-v1 --write` (the gate, which opens pages) and `emit-store-manifest-v1` (round-v1.sh 131–147). Both must see the defaults. |
| 13 | **The rail rows' voice.** page: "arrange". spec: "them". | **"them".** | `VOICE_LEDE.arrange` (build-toggle-design-v1.mjs:101) says "no reading is added", but made pills do add readings. The BSB's `suggested` row is also "them" (3777). |
| 14 | **The per-book file's name.** page: `.json`. data: `.json.gz`. | **`data/default-picks/<book>.bin`**: gzip -9 of minified JSON, read by the page's `unpack` (2665). | This is how zones (`data/zones/*.bin`) and shards are served, so there is no Content-Encoding question on Pages. |
| 15 | **The auto second.** data and checks: stored in the index. spec and page: computed on the page. | **Computed on the page** from `fills`, among the sources switched on. The checks recompute it in node. | A source switched off must reroute it. A stored value would go stale. |
| 16 | **A named row that no longer resolves.** brief: counted. data and the 14 Nov letter to Moses: refused. | **Refused**, as the letter told the corpus lane. | Today: 0 missing of 152,648. |
| 17 | **STEP's picks 2..n at rest.** brief and spec: pills. page: text. | **Text in the card's `.r-piece` line at rest. Pills only under a non-STEP source.** | The card's pills at rest stay byte for byte, so the gate's S2 and the chain do not move. |

### 0.2 Claims in the parts that I checked against the files and found wrong or incomplete

- **"Today's line stands" at the 31 `PIECE:MACULA` places.** Every part would fill them and change the line, and checks decision 9 noted P2 would turn red. They are already MACULA's own reading at the place, so this plan leaves them.
- **UBS «NO DATA YET».** Only the spec part named it. The other three parts' rule ("any piece whose pick 1 is not a sign") would print «NO DATA YET» on the line under UBS at **13 places**. This plan counts it as no pick, like «-», and adds it to the corpus lane's questions (§3.4).
- **The spec's group label «the source here» collides** with the rail's existing position label of the same words (3732), which names a different switch. This plan has no visible group label; the group has only an `aria-label`.
- **check-clean-address-v1 does not "learn both flags".** It names no URL flags, only `/toggles/` (197, 243). It needs only `/toggles/` rebuilt.
- **The page part's site list for "raw" (non-spanJoin) text is short.** There are 63 `spanJoin(` calls. Display paths that list misses include `refreshJoinGloss`'s ruled-parts branch (10906), `textOfCell` 8995/9003, the card's text at 9957–9972 and `kqPlace` 5371. §0.5 replaces the flag with one rule inside `spanJoin`.
- **The page part says 16 ketiv/qere places sit among STEP's gaps.** It is 23.
- **The data part's "199 replace + 60 fill" (259 places)** includes the 31 MACULA-piece places and ketiv/qere places. It is 212 under this plan.
- **The figures in the owner's notes** («UBS 84.1%», «BDB 36.4%», «STEP 99.9%», from `coverage.py`) count UBS's «-» picks, BDB picks with no words, and ketiv/qere words. Counted the way the line prints, the totals are STEP >99.9% (305,196), MACULA 96.7%, UBS 80.2% and BDB 33.8%.
- **All parts agree, and I confirmed:**
  - STEP's pick 1 is always kind r (305,164 of 305,164).
  - BDB fills none of STEP's gaps in any book.
  - STEP is the auto second for MACULA, UBS and BDB in all 39 books.

### 0.3 What the owner asked that no part fully covered

- **«and %s then».** The shares appear as soon as a source is chosen: under the lit pill (which the Menu mirrors) and in the note. No part had put the share where a phone reader sees it: under the lit pill, in the Menu.
- **«even if its 99.9% … auto select a second source».** The parts disagreed on the count. Here it is 212 words, listed per book in §7 with examples across books, as the owner's call 1 to confirm.
- **The live audit.** An independent agent reads the live site. After the ship, a first visit anywhere shows the four pills and those 212 words, and nothing else changed. A live law holds the served index equal to `main` (§5, check-live-v1 L5). The ship ends with the `gh-pages` merge and push.

### 0.4 Risks to the line at rest, and their guards

| Risk | Guard |
|---|---|
| A stored non-STEP choice leaks into a resting record. | bake-resting-lines-v1 refuses unless `__default.on === "step"` and `__default.second` equals the auto second recomputed in node. |
| The index fails to load, so the 212 fills silently drop. | bake-resting-lines-v1 refuses when `index.json` lists the work and the page reports `__default.book === null`. The page shows today's line and hides the pills. |
| A `/` in a source's words passes through `spanJoin` («heaven / sky» → «heaven + sky»). | The source-words set (§0.5). At rest it holds no text with a `/`. Check D19. |
| Any edit to `zone.html` makes the 40 resting records and every chain book stale. | The round runs `defaults,records,lines,chain,door`. |
| check-same-product S1 differs from the live site at 212 words on the first ship. | `--expect data/default-picks/index.json`: the fills are read from the bake, never typed. |
| The note changes the page at rest. | The note is hidden at rest. Only the four pills and the 212 words are new at rest. |
| A first paint flashes under a stored non-STEP choice. | Boot awaits the book file, as `RUN_CARDS` does (3974). |

### 0.5 Simpler than the parts

1. **STEP never prints its own ledger words on the line.** No STEP short form, no `signsOffLine` question, no two-word spans.
2. **One rule in `spanJoin` instead of a `raw` flag threaded through objects:**
   - Add `const SOURCE_WORDS = new Set()`, and in `spanJoin` (3425): `if (SOURCE_WORDS.has(s)) return s.trim().replace(/\.$/, "");` before today's split.
   - The set is rebuilt, never grown piecemeal, on every switch and when a book file lands. It holds the slash-bearing texts of the active non-STEP layers in this book, plus the slash-bearing texts the reader has ruled.
   - Measured over the whole store: only 2 store rows equal such a text: M3 «thumbs/big toes of» (MACULA itself) and M17 «juice of purslane / mallows». Both print better raw. 0 zone gloss values equal one (5 books checked).
   - Texts without a slash print the same either way, so all 63 call sites stay as they are.
3. **The shares come from the ledger and the zone only.** The brief's `resting-labels.json` and its fingerprint loop disappear.
4. **STEP's gaps travel in `index.json` (`step_leaves`, 213 rows in total).** The rest state never fetches a book file. A reader's own second for STEP works without one too.
5. **No dim ink in v1, the card's list is not pressable, and the chain schema stays `CHAIN_BOOK_V3`.**

---

## 1. One set of names (spelled the same in every file)

| What | Name |
|---|---|
| Pill text (owner's words) | «STEP» «MACULA» «UBS» «BDB». «Jastrow» comes later. Order (also the tie-break): STEP, MACULA, UBS, BDB, Jastrow. |
| Source ids, index keys | `step` `macula` `ubs` `bdb` (`jastrow` later) |
| Buttons | `#default-step` `#default-macula` `#default-ubs` `#default-bdb`, each with `aria-describedby="default-<id>-dir"` (a `.mode-dir` span) |
| Group, note | `span#default-pick.default-pick[role=group]`, `p#default-note[aria-live=polite]` |
| Storage | `fh.defaults`: the first source; missing or invalid means `"step"`. `fh.defaults.second`: JSON `{first: second}`; a missing key means auto. Neither collides with any of the 23 existing `fh.*` keys (checked), `fh.sources.defaults` included. |
| Address flags (one load, never stored, like `?senses=`) | `?default=step|macula|ubs|bdb`, `?second=auto|step|macula|ubs|bdb`. Neither collides with the 12 existing flags: at, b, blobs, c, chain, dict, fixture, mode, nums, rail, senses, t. |
| Rail (TOGGLES) | `defaults` (lab «default source»), `second` (lab «second source»), voice `them` |
| Window | `window.__default = { on, second, auto, chosen, ready, failed, book, note }` |
| JS | `DFLT_KEY`, `DFLT_SECOND_KEY`, `DFLT_IDS`, `dfltFirst`, `dfltChosen`, `DFLT_IX`, `DFLT_BOOK`, `DFLT_LEAVES`, `DEFAULT_PICKS`, `defaultPicksReady()`, `dfltFirstNow()`, `dfltAuto()`, `dfltSecond()`, `placeYields()`, `defaultAt()`, `runTakesDefault()`, `chooseDefault()`, `chooseDefaultSecond()`, `paintDefaultPills()`, `reopenForDefaults`, `SOURCE_WORDS` |
| Data | `data/default-picks/index.json`, `data/default-picks/<book>.bin`, `data/default-picks/PIN.json`, `data/default-picks-receipt-v1.json` |
| Tools | `tools/bake-default-picks-v1.mjs`, `tools/check-default-picks-v1.mjs` |

- **Kept apart from these existing names:** `DEFAULTS_KEY = "fh.sources.defaults"` (3658), `SOURCE_DEFAULTS`, `SWITCHES_DEFAULT`, `DEF_POS` "at this place" (11 tools match that phrase), and the reset's state word "default".
- **Credit chips keep the shelf's short names** («STEP TAHOT», «UBS DBH», «BDB unabr.»). Those name the credited rows, which is a different thing from the pills.

## 2. Bake: `tools/bake-default-picks-v1.mjs`

### 2.1 Inputs and pins

- **Pins** in a new `data/default-picks/PIN.json`, all verified today:

  | File | Bytes | sha256 |
  |---|---|---|
  | RULE.md | 10,730 | f8885830… |
  | receipt-v1.json | 28,573 | 89b2a4b6… |
  | rows-v1.jsonl (152,423 lines) | 6,106,263 | 21f2a35b… |
  | RULE-AMENDMENT.md | 3,764 | ff65e904… |
  | receipt-v1.1.json | 4,854 | daf37748… |
  | step-mend-v1.1.jsonl (1,265 lines) | 187,094 | 29953b99… |
  | rows-added-v1.1.jsonl (225 lines, numbered from 152,423) | 8,743 | f6064de7… |

  The 39 book files are held to receipt-v1 `outputs[]`.
- **Arguments.** The ledger is never guessed: `--ledger <dir holding default-picks-v1/ and default-picks-v1.1/>`, read through `arg(`. Without it the bake prints usage and exits 2.
  - Defaults: `--out data/default-picks`, `--zones data/zones`, `--store data/route-store`, `--pin data/default-picks/PIN.json`, `--receipt data/default-picks-receipt-v1.json`; plus `--dry`.
  - It has a `startedAs` guard.
- **Header** in the style of bake-word-senses-v1:
  - `RULE: default-picks-rule-v1-each-source-prints-its-own-pick-and-the-source-that-fills-most-of-what-it-leaves-is-its-second`
  - `LEDGER:` (it writes into `data/`)
  - a REFUSED list and a `Run:` line
  - no Hebrew in any literal or in its output.

### 2.2 The one counting rule (the bake, the page and the checks hold the same rule)

At place n (`WORD_N`: one-based over every entry, marks included, in section order, as at 4152):

- **STEP has a line** if its mended pick 1 has words, **or** the zone's `pg` pieces are present and every one carries a non-empty `g` (the place reading).
- **MACULA has a line** if the word is not `kq` and `macula[0]` is non-empty.
- **UBS has a line** if the word is not `kq` and some piece's pick 1 contains a letter or digit and is not «NO DATA YET». In practice the only sign-only text is «-» (10,910 pieces).
- **BDB has a line** if the word is not `kq` and pick 1's record highlight (slot 5) is non-empty.
- **`fills[x][y]`** counts the places where x has no line and y has one.
- **STEP's leaves** are the places where STEP has no line and the word is not `kq`: 213 in total. MACULA has words at 212 of them, UBS at 202 and BDB at 0.

### 2.3 The per-book file `data/default-picks/<book>.bin` (gzip -9, minified JSON)

```json
{ "schema_version": "DEFAULT_PICKS_BOOK_V1", "rule_id": "<RULE id>", "book": "ruth",
  "zone": { "entries": 1388, "places": 1296, "places_sha256": "<sha256 of the place labels in WORD_N order, joined by \n>" },
  "ledger": { "file": "ruth.jsonl", "sha256": "…", "mend_places": 0, "store_read": "a9373b8d30ef", "store_resolved": "4d1357b26ca5" },
  "bdb_words": ["word, thing", "…"],
  "places": [ null, [step, macula, ubs, bdb], … ] }
```

`places[n-1]` is `null` at a mark or where no source picks. Otherwise each slot is `0` (no picks) or:

- **step:** `[[kind, words|0, letter?], …]`.
  - kind: 0 = r, 1 = v, 2 = a.
  - words: the ledger's string byte for byte, after the mend.
  - letter: a variant's letter as given; the variant's Hebrew is not carried.
  - Never printed on the line.
- **macula:** `"words"`, which is also its line.
- **ubs:** `[line|0, [[piece, words], …]]`.
  - `line` is the pick 1 glosses of the pieces that have a line, joined by " + ", or 0.
  - Glosses are kept byte for byte, " / " and «-» included.
  - The page numbers picks from 1 within each piece.
- **bdb:** `[[sense, w], …]`.
  - sense: the marker of `point<p>:<m>.` with its period dropped; `""` for "the entry".
  - w: a 1-based index into `bdb_words` (one slot 5 per record), or 0.
- The page puts the ledger's text on the line without changing it. It adds only " · sense N" to BDB's words and drops a closing period, as `spanJoin` already does for every pill (#42).

Expected size, by the data part's measure of almost this shape: about 3.8 MB gz for the 39 books; Genesis about 225 KB; Ruth about 17 KB.

### 2.4 `data/default-picks/index.json` (fetched at boot on every page)

```json
{ "schema_version": "DEFAULT_PICKS_INDEX_V1", "rule_id": "<RULE id>", "generated_by": "tools/bake-default-picks-v1.mjs",
  "pin": "data/default-picks/PIN.json", "store_version": "4d1357b26ca5",
  "sources": [ { "id": "step", "pill": "STEP", "m": { "r": "M4", "v": "M19", "a": "M19" } },
               { "id": "macula", "pill": "MACULA", "m": "M3" }, { "id": "ubs", "pill": "UBS", "m": "M18" }, { "id": "bdb", "pill": "BDB", "m": "M46" } ],
  "books": { "ruth": { "file": "ruth.bin", "bytes": 0, "sha256": "…", "entries": 1388, "places": 1296, "kq": 12,
      "has":   { "step": 1293, "macula": 1242, "ubs": 1014, "bdb": 410 },
      "fills": { "step": { "macula": 1, "ubs": 1, "bdb": 0 }, "macula": { "step": 52, "ubs": 4, "bdb": 1 },
                 "ubs": { "step": 280, "macula": 232, "bdb": 23 }, "bdb": { "step": 883, "macula": 833, "ubs": 627 } },
      "step_leaves": [[2989, "feet his", "feet / legs", 0], …] } } }
```

- Ruth's numbers above are measured. The `step_leaves` row is Ruth 3:14:2 (its n is illustrative).
- `step_leaves` rows are `[n, macula line|0, ubs line|0, bdb [sense, words]|0]`.
- The index carries counts, never strings to display, and no `second` (§0.1 #15).
- M ids were checked in `data/route-store/index.json`: M3 MACULA, M4 TAHOT, M18 UBS v0.9.2, M19 TBESH, M46 unabridged BDB.

### 2.5 Steps

1. **Pins.** Hold every pin; hold each book file to receipt-v1.
2. **Rows.** Load rows-v1 and rows-added-v1.1. Re-resolve all 152,648 rows by `[key, rank, m, sha16]` in `shards/<sha256(key)[:2]>.bin`. The one row held twice (119921, M14 «defile») is counted.
3. **Mend.** Replace `step` at the 1,265 mended places.
4. **Per book**, in `outputs` order:
   - read the zone;
   - map n → label and refuse on any mismatch;
   - build `places` and `bdb_words`, and count by §2.2.
5. **Write** the 39 files, then the index, then the receipt. Only changed bytes are written, so a second run writes nothing.
6. **Print** one line per book, e.g. `  ok  ruth · 1,296 places · STEP 1,293 · MACULA 1,242 · UBS 1,014 · BDB 410 · STEP leaves 3 (MACULA 1)`.

### 2.6 REFUSED, and counted

**REFUSED** (each said in words, nothing written):
1. A pin or a book file is not its bytes.
2. A zone word has no ledger place, a ledger place has no zone word, or the order differs (today 0 of 305,431).
3. A mend line names a place v1 lacks, or changes a kind-r pick (today 0).
4. Picks are not numbered 1..n (per piece for UBS); a kind-v pick lacks `[letter, Hebrew]`; or a BDB meaning is neither `point<p>:<m>.` nor "the entry".
5. A named row is missing from the served store, or its m id is in no store's `m_sources` (today 0).
6. A BDB record's slot 5 differs between two of its picks (today 0).
7. A printed text holds U+FFFD or a control character other than U+000A (today 0; Genesis 30:37:11 has one U+000A, counted).
8. A count misses what the receipts say:
   - receipt-v1 `picks_per_place`: STEP 267/299,349/5,500/315; MACULA 8,965/296,466; UBS 48,478/255,427/1,490/36; BDB 189,731/110,877/4,542/281;
   - receipt-v1.1 `mend`: 1,265 places; a 1,088 and v 298 picks changed; 15 merged;
   - after the mend: v 748, a 5,376.
   - receipt-v1's `variant_picks` 850 and `alternative_picks` 5,422 are not held; the receipt records them as asked (question 2).

**Counted, in `data/default-picks-receipt-v1.json`:**
- per book and per source: `has` and `fills`;
- the 212 rest fills, each with its label;
- the 31 leaves where the zone's pieces answer;
- UBS «-» (10,910 pieces) and «NO DATA YET» (13 pick 1s);
- BDB pick 1s with no highlight (11,668);
- line picks naming no row (STEP 17,077), or whose first row is another source's (STEP 55,445, MACULA 176,657, BDB 33,194);
- slashes per source (MACULA 2, UBS 133,145, BDB 25,779);
- line lengths over 40 characters (UBS 33,831, BDB whole 15,506);
- `kq` words (1,062).

## 3. Record (what the tree keeps as true)

### 3.1 Data kept in the tree

- **Copied:** the two RULE files and the two receipts, under `data/default-picks/default-picks-v1/` and `data/default-picks/default-picks-v1.1/` (about 48 KB), as `data/word-senses/` does.
- **Not copied:** the 95 MB of book files and rows tables stay on the corpus lane's store, read through `--ledger`.

### 3.2 The resting-lines record

- **`tools/resting-lines-v1.mjs`:**
  - In `linesInPage` (109), `state` gains `defaults: (window.__default||{}).on || null, second: (window.__default||{}).second || null`.
  - `linesOnPage` waits on `window.__default.ready` only when `on !== "step"`; at rest the line needs no book file.
  - `whyNotOfThisTree` (190–203) needs no change: `index.json` joins `read_off.files` because the page asks for it.
- **`tools/bake-resting-lines-v1.mjs`** refuses:
  - "a stored default leaked into a first visit" unless `defaults === "step"` and `second` equals the auto second recomputed from the index;
  - "the defaults did not load" when the index lists the work and `__default.book` is null.

### 3.3 The card chain

- **`tools/card-readings-v1.mjs`:**
  - The state literal (about line 169) adds the same two fields in the same order; K3 compares the two state literals with `JSON.stringify`.
  - `STATES.lifted.holds` (80–91) gains `defaults: "step"`.
  - The `late` wait (200–214) also waits on `__default.ready` after the first card, so the first card's reopen when the book file lands cannot race the reading, as in the BSB fault of 13 November.
  - The new `p.r-dflt` lines are not read in v1, so `CHAIN_BOOK_V3` stands.
- **`build-chain-book-v2` / `check-chain-book-v2`:** K3's lifted test adds `lifted.defaults !== "step"`.

### 3.4 Letter to the corpus lane (append to FOR-MOSES-2026-11-14-default-picks-questions.md's thread)

- The bake refuses on any row it cannot re-resolve.
- The checks hold the files to receipt-v1.1.
- **Question 8:** what do UBS's «-» (10,910 pieces) and «NO DATA YET» (13 pick 1s; the spec part found 17 picks in all) mean at a place? Until answered, both are "no pick" for the line, and the card prints them as given.

## 4. Page: `pt/reader/zone.html`

Steps 1–6 land first, with no visible change until the index lands; `?default=ubs` tests them. Steps 7–10 expose the switch.

### Step 1. State and fetch

- **State**, after the senses block (3530–3546):
  - `DFLT_KEY`, `DFLT_SECOND_KEY` and `DFLT_IDS = ["step","macula","ubs","bdb"]`.
  - `dfltFirst`: from `QUERY.get("default")`, else storage, else `"step"`.
  - `dfltChosen`: from storage (JSON); `?second=` applies to the current first for one load.
  - `let DFLT_IX = null, DFLT_BOOK = null, DFLT_LEAVES = null, DEFAULT_PICKS = null, dfltWait = null, dfltFailed = false, dfltNote = false; let reopenForDefaults = () => {};`
- **Helpers:**
  - `dfltOn(id)`: the source's M ids (from the index) are not in `sourcesOff`; for STEP that is M4.
  - `dfltFirstNow()`: null when `defOrder !== "place"`; otherwise `dfltFirst` if it is on, else `"step"` if STEP is on, else null.
  - `dfltAuto(first)`: the source y ≠ first that is on and has the largest `DFLT_BOOK.fills[first][y] > 0`, ties by `DFLT_IDS` order; null if none.
  - `dfltSecond(first)`: the reader's choice if it is on and is not the first, else `dfltAuto(first)`. A chosen second that fills 0 stays chosen and shows «0%».
- **`defaultPicksReady()`**, modeled on `pieceBookReady` (3628: the promise resets on failure) and `suggestedReady` (3408: sets the window state):
  - fetch `data/default-picks/${DFLT_BOOK.file}` and decode it with `unpack`;
  - refuse unless `book === BOOK` and `places.length === DFLT_BOOK.entries`;
  - then rebuild `SOURCE_WORDS`.
- **Boot:**
  - Add `DFLT_IX` to the destructuring at 3893.
  - Add `fetch(\`${ROOT}data/default-picks/index.json\`).then((r) => (r.ok ? r.json() : null)).catch(() => null)` beside the source-suggested index (about 3927), before `...OVERLAY_IX`.
- **After `WORD_N`** (4152):
  - `DFLT_BOOK = DFLT_IX && DFLT_IX.schema_version === "DEFAULT_PICKS_INDEX_V1" && DFLT_IX.books && DFLT_IX.books[BOOK] || null;`
  - `DFLT_LEAVES = new Map((DFLT_BOOK ? DFLT_BOOK.step_leaves : []).map((r) => [r[0], r]));`
  - `if (DFLT_BOOK && dfltFirst !== "step") await defaultPicksReady().catch(() => {});` This avoids a flash, as `RUN_CARDS` does at 3974.

### Step 2. The layer, beside `placeLine` (12306)

- **`placeYields(word)`** factors out the yields at 12307–12314: `defOrder !== "place"`, `lookup === "headword"`, `licencePref !== "any"`, `masorah === "letters"`, and the no-names condition.
  - `placeLine` starts `if (!word || placeYields(word) || !Array.isArray(word.pg) || !word.pg.length) return null;`, which behaves exactly as today.
- **`defaultAt(word)`:**

```js
const defaultAt = (word) => {
  if (!DFLT_BOOK || !word || word.kq || placeYields(word)) return null;
  const n = WORD_N.get(word), first = dfltFirstNow(); if (!n || !first) return null;
  const second = dfltSecond(first);
  if (first === "step") {                         // STEP is today's line; only its leaves are filled (212 at rest)
    const leaf = DFLT_LEAVES.get(n);
    return leaf && second ? made(second, leafLine(leaf, second), "second", first) : null;
  }
  const t1 = lineOf(first, n); if (t1) return made(first, t1, "first");
  if (!second || second === "step") return null;  // STEP as the second is today's line
  const t2 = lineOf(second, n); return t2 ? made(second, t2, "second", first) : null;
};
```

- **`lineOf(src, n)`** reads `DEFAULT_PICKS.places[n-1]`:
  - macula: the string;
  - ubs: `slot[0]`;
  - bdb: `bdb_words[w-1]`, plus `" · sense " + sense` when sense is not `""`.
  - It returns null while the book file is absent, so today's line stands until it lands.
- **`made(src, text, layer, of)`** returns `{ text, rs: [{ ...readingOfId(M), reads: "default", src, layer, of }], why: "default", src, layer, mId: M }`, with M from `DFLT_IX.sources`.
- **`runTakesDefault(run)`:** `!!(run.__words && run.__words.length && run.__words.every((w) => !!defaultAt(w)))`. This is false everywhere at rest.

### Step 3. `lineUnder` and `spanJoin`

- **`lineUnder`** (12332): between the headword branch (12334–12335) and the `placeLine` call (12336), insert `{ const d = defaultAt(word); if (d) return d; }`.
  - The default stands above the pointing filter, as the place reading does; `placeShown` is not applied to it.
- **`spanJoin`** (3425): first `const s = String(t); if (SOURCE_WORDS.has(s)) return s.trim().replace(/\.$/, "");`, then today's body.
- **`rebuildSourceWords()`** clears the set and adds:
  - every `/`-bearing line and pick text of the active non-STEP first and second in this book;
  - the `/`-bearing texts the reader has ruled. They are kept in `SOURCE_WORDS_RULED` when a pick is recorded (10121, 10216) and cleared by reset.
  - At rest the set holds none.

### Step 4. The painters and runs

- **`wordBlock`** (12755) and **`repaintGlossOrder`** (13296): no text change, because `spanJoin` covers them.
  - Set `ge.dataset.src` and `ge.dataset.layer` where `lineMoved.why === "default"`, and delete them otherwise.
  - In `repaintGlossOrder`, do this before `lineStands` (about 13306), which compares neither attribute.
  - At rest the attributes appear on 212 words.
- **`repaintLive`** (13407) needs no change.
- **`refreshJoinGloss`** (10825): add `&& !runTakesDefault(run)` to the span-store branch (10865) and to the whole-form branch (10879).
  - The parts branch then reads each word's own `.g`.
- **`chainReadsWhole`** (7719): after the ruling test (about 7726), `if (runTakesDefault(run)) return false;`, so the pressed word's own card opens.
- **`licenseChipFor`** (5325; `says` at about 5346): when `uniq[0].reads === "default"`, the title is:
  - first: `${pill}’s own reading at this place, chosen on the row of sources`;
  - second: `${pill}’s own reading at this place, filling out ${ofPill}`, plus ` — chosen for ${zone.work}` when it is the auto second.
  - `data-line` is the M id.
  - The chip stays hidden on the line (`.he-text .g .g-lic {display:none}`, 2302).
- **Unchanged:** `kqPlace` (5106), `kqPickG`, `paintPairs` (5356) and `mOfPick`.

### Step 5. The card (`openHud`, 8295)

- **`placeSet`** (8766): prefix `!defaultAt(word) &&`, so under a non-STEP source the card opens on the whole form.
- **`placeOfCell`** (8829): `defaultAt(w) || placeLine(w)` in the run branch and `defaultAt(word) || placeLine(word)` in the word branch.
  - `textOfCell` (8984), `readingsOfCell`, `coverText` (9087) and `lineSaid` (9838) then follow.
- **The reading row label** (`atPlace`, 9070–9071). Let `d = defaultAt(word)`:
  - `d.layer === "first"` → `reading · ${pill} at this place` (BDB adds ` · sense ${n}` or ` · the entry`);
  - `d.layer === "second"` → `reading · ${pill} at this place · ${ofPill} has none here` (at rest at the 212: `reading · MACULA at this place · STEP has none here`);
  - first ≠ STEP, no `d`, and the place reading answers → `reading · TAHOT at this place · ${pill} has none here`;
  - at rest elsewhere it stays `reading · TAHOT at this place`;
  - after a ruling, `markRuled` (9104) is unchanged.
- **`poolFor`'s place block** (7442–7466), when `opts.place.why === "default"`:
  - If the group found by `drawn(text)` has no record of `opts.place.mId`, unshift a made row `[0, text, text, mId, null, null, null]` into `PLACE_ROWS` and the group, as the piece-store case at 7447–7450 does. The card then credits the source the line credits.
  - Under a non-STEP first, also add that source's picks 2..n in order. Each is found by `drawn` or made the same way, and marked `g.dfltRank = i + 1`.
  - The pill title is `${pill} ${i+1} at this place · pressing it rules this reading wherever this form stands`.
  - Made rows stand above the masorah, entry and names gates, as TAHOT's row does.
- **`sortPool`'s `placeLead`** (7624): rank by `g.dfltRank || (g.placeFirst && defOrder === "place" ? 1 : Infinity)`. This is identical to today at rest.
- **The sources at this place** (`renderReadings`, 9630–9661):
  - The existing `p.r-piece` keeps its place, its `<b>` and its conditions. Only its `<i>` (9642) changes, from «here the source reads » to «here STEP reads ». Eight tools read `.r-piece … b`; none reads the `<i>`, and no tool matches «TAHOT at this place» (grep).
  - STEP's picks 2..n follow outside `<b>` in `span.r-more`: ` · 2 «pleasant» (another number)` or ` · 2 «…» (a meaning variant, K)`.
  - After it, add one `p.r-dflt[data-src]` per other source that is on and has picks: `<i>here MACULA reads </i><b>…</b>`, its own `r-more`, and its chip. BDB adds `<span class="n"> · sense 11</span>`. UBS prints «-» as given.
  - The source whose words print on the line gets `<span class="r-on"> · on the line</span>`, or ` · on the line, filling out STEP`.
  - These are not buttons, and they sit outside `.r-pills`, so S2 is unchanged.
  - Lazy load as the BSB does (9659–9662): `if (DFLT_BOOK && !DEFAULT_PICKS && !dfltWait) defaultPicksReady().then(reopen)`.
  - The BSB line (about 9664–9669) stays beside them.
- **CSS:**
  - add `#hud.tight .rows .band > .r-dflt` to the tight-card rule (1569);
  - style `.r-dflt` beside `#hud .r-piece` (about 1760–1766);
  - `cardNotes` (7927) gains `:not(.r-dflt)`.

### Step 6. The export

- **`gatherSection`** (5638): `const at = defaultAt(w) || placeLine(w)`; `placeShown` applies only when `at.why !== "default"` (5639).
- **`attributionFor`** (5519): no change. Its `spanJoin(at.text) === shownText` holds through `SOURCE_WORDS`.

### Step 7. The header (HTML before the reset pill, 2491; after «word senses», 2478)

```html
<span class="default-pick" id="default-pick" role="group" aria-label="the source the line under each word reads" hidden>
  <span class="mode-pick"><button type="button" class="blob-btn" id="default-step" aria-pressed="true" aria-describedby="default-step-dir">STEP</button><span class="mode-dir" id="default-step-dir"></span></span>
  <span class="mode-pick"><button type="button" class="blob-btn" id="default-macula" aria-pressed="false" aria-describedby="default-macula-dir">MACULA</button><span class="mode-dir" id="default-macula-dir"></span></span>
  <span class="mode-pick"><button type="button" class="blob-btn" id="default-ubs" aria-pressed="false" aria-describedby="default-ubs-dir">UBS</button><span class="mode-dir" id="default-ubs-dir"></span></span>
  <span class="mode-pick"><button type="button" class="blob-btn" id="default-bdb" aria-pressed="false" aria-describedby="default-bdb-dir">BDB</button><span class="mode-dir" id="default-bdb-dir"></span></span>
</span>
<!-- last child of #modeRow -->
<p class="default-note" id="default-note" aria-live="polite" hidden></p>
```

**CSS** (near #modeRow, 1320): `#modeRow .default-pick { display: inline-flex; gap: 0.55rem; flex-wrap: nowrap; }` and `#modeRow .default-note { flex-basis: 100%; }`. The chooser reuses `#modeRow .def-order .dfp` (1779, 1493).

**Pill text** is the name only.

**Under the lit pill (`.mode-dir`):**
- `{a} · then {Y}`, e.g. «50.5% · then STEP» (BDB in Daniel) or «>99.9% · then MACULA» (STEP in Psalms);
- `{a}` alone where there is no second, e.g. «100%» (STEP in Malachi);
- `fetching…`, or `could not be fetched`.
- Unlit pills show nothing. The Menu copies this text.

**Pill titles:**
- STEP: `STEP’s own reading at each word: its TAHOT translation at this place, the line as it rests — {a} of {work}`
- MACULA: `MACULA’s own words at each word, as MACULA gives them — {a} of {work}`
- UBS: `the UBS dictionary’s meaning filed at each word, its glosses as it gives them — {a} of {work}`
- BDB: `the unabridged BDB’s sense filed at each word: the entry’s highlighted words, with the sense’s number — {a} of {work}`
- A lit non-STEP pill adds ` · press again to go back to STEP`. A lit STEP adds ` · press to show or hide the note`.
- A pill whose source is off is `disabled`, with the title `{short name} is switched off on the switches` (e.g. «UBS DBH is switched off on the switches»).
- Under a non-place order: `the line reads «{lab}» on the switches; press to read it from {pill} here`.

**Pressing:**
- An unlit pill: it lights, the lit one goes off, and the note opens.
- A lit non-STEP pill: STEP lights.
- A lit STEP: the note opens or closes.
- Under a non-place order: first `chooseDefOrder("place")` (13518), then the choice.

**The note** is shown when the first is not STEP, when the reader opened it on STEP, or under a non-place order. `{work}` is `zone.work`, never typed.
- `{X} reads every word of {work}.` when `has === places`.
- Otherwise: `{X} is partial: its own reading at {a} of {work}.` followed by one of:
  - `{Y} fills out {b}, chosen for this book.` (auto);
  - `{Y} fills out {b}.` (the reader's choice);
  - `No other source reads the rest.`
  
  and then `Today’s line stands at the other {c}.`, left out when c = 0.
- `{c}` carries the title `pairs written one way and read another ({kq} words of {work}) keep today’s line under every source; joined words a dictionary reads as one keep its line unless {X} reads every word of them`.
- **The chooser:** `<span class="def-order" role="group" aria-label="fill it out with">fill it out with <button type="button" class="dfp" data-second="step" aria-pressed="true">STEP 68.1%</button> …</span>`.
  - The first's own button is absent. A source filling 0 is `disabled` and shows «0%».
  - The auto button's title: `chosen for {work}: the source that fills the most of what {X} leaves here`. Pressing the auto source clears the reader's choice.
  - The buttons have **no id**, so the Menu does not mirror them.
- **Other states:**
  - non-place order: `The line reads «{lab}» on the switches. Press a source to read the line from it here.`
  - while loading: `{X}: fetching its readings for {work}…`
  - on failure: `{X}: its readings for {work} could not be fetched; the line stands as it was. The next press or card tries again.`

**Number format:** 0 → «0%»; all → «100%»; `c*1000 < N` → «<0.1%»; `c*1000 >= 999*N` and not all → «>99.9%»; otherwise `Math.floor(1000*c/N)/10` with one decimal. Each share is printed from its own count, never as 100 minus the others; the title gives exact counts.

**Examples:**
- Ruth, BDB: «BDB is partial: its own reading at 31.6% of Ruth. STEP fills out 68.1%, chosen for this book. Today’s line stands at the other 0.2%.» Chooser: STEP 68.1%, MACULA 64.2%, UBS 48.3%.
- Amos, UBS: «UBS is partial: its own reading at 82.5% of Amos. STEP fills out 17.4%, chosen for this book.» Chooser: STEP 17.4%, MACULA 14.8%, BDB 2.3%.
- Psalms, STEP (opened): «STEP is partial: its own reading at >99.9% of Psalms. MACULA fills out <0.1%, chosen for this book. Today’s line stands at the other <0.1%.»
- Malachi, STEP: «STEP reads every word of Malachi.»

**Script:** `paintDefaultPills()` and the click handlers go beside the senses pill painter (about 14280–14286). The group is `hidden` where `DFLT_BOOK` is null (the Tikkunei Zohar, commentary); the stored choice is kept.

### Step 8. The rail (TOGGLES, after `senses`, 3770–3776; not in `LEAD`, 14176)

```js
{ id: "defaults", voice: "them", lab: "default source", why: "whose own reading at each word the line prints: STEP’s (its TAHOT translation, the line as it rests), MACULA’s, the UBS dictionary’s or the unabridged BDB’s, each as the source gives it; where it has none a second source fills it out, and where neither has one the line stands as it is",
  positions: [{ id: "step", lab: "STEP" }, { id: "macula", lab: "MACULA" }, { id: "ubs", lab: "UBS" }, { id: "bdb", lab: "BDB" }],
  live: () => !!DFLT_BOOK, waits: "the corpus lane’s default picks laid on this book (tools/bake-default-picks-v1.mjs)",
  get: () => dfltFirst, set: (id) => chooseDefault(id), now: () => sayDefault() },
{ id: "second", voice: "them", lab: "second source", why: "the source that fills the words the default source leaves: for each book the one that fills the most, or your own choice",
  positions: [{ id: "auto", lab: "chosen for this book" }, { id: "step", lab: "STEP" }, { id: "macula", lab: "MACULA" }, { id: "ubs", lab: "UBS" }, { id: "bdb", lab: "BDB" }],
  live: () => !!DFLT_BOOK, waits: "the corpus lane’s default picks laid on this book (tools/bake-default-picks-v1.mjs)",
  get: () => dfltChosen[dfltFirst] || "auto", set: (id) => chooseDefaultSecond(id), now: () => saySecond() },
```

- Ids are letters only and positions are literal objects, as `togglesFrom` parses them (build-toggle-design-v1.mjs, `starts` and `pos` regexes).
- The position equal to the first source is drawn dead.

### Step 9. Reset (14322–14351)

- `SWITCHES_DEFAULT` gains `defaults: "step"`.
- `switchesAtDefault` gains `&& (!DFLT_BOOK || (dfltFirst === "step" && !dfltChosen.step))`.
- The handler: when not at that state, `dfltChosen = {}`, remove `fh.defaults.second`, `dfltNote = false`, set `"step"` through an internal `setDefault("step")` (not the toggle-the-note press path), and clear `SOURCE_WORDS_RULED` with the picks.
- The title at 2491 becomes: `the switches back to their default (English off, framed off, card numbering on, the concordance hud off, word senses off, the line from STEP with a second source chosen for each book) and every reading picked on this page forgotten`.

### Step 10. Answering a switch (after `reopenForSenses`, about 16569)

```js
reopenForDefaults = () => { rebuildSourceWords(); paintDefaultPills(); if (document.getElementById("railRows")) railSwitch(); repaintGlossOrder(); reopenCard(); };
```

- `chooseDefault(id)` and `chooseDefaultSecond(id)`:
  1. store the choice (try/catch);
  2. set `window.__default`;
  3. if a non-STEP layer needs the book file and it is absent, paint «fetching…» and run `defaultPicksReady().then(reopenForDefaults, paintFailed)`; otherwise call `reopenForDefaults()`.
- `relayBuiltSections` is not needed, because no cell moves. Sections built later follow through `materialise` (16465) → `wordBlock` → `lineUnder`.

### Precedence (owner: a reader's ruling > a toggle > record order)

| Switch | Under the sources |
|---|---|
| A ruling | Wins everywhere it reaches (`ruledLine` 5057, `held`). Switching source never clears it; reset does. |
| Look up by headword; license ≠ any; pointing «letters only»; names lead «yield» at a name | The layer yields exactly as `placeLine` does (`placeYields`). |
| The line reads / reads first ≠ «the source here» | No layer and no pill lit; pressing a pill sets the place order. |
| Sources (rail) | A source switched off gives no line; its pill and chooser button are disabled; the auto second is recomputed; no chip names it. STEP is off when M4 is off. |
| Pointing keep / only | The layer stands above the filter, as the place reading does. |
| Source signs | STEP is today's line, so nothing changes; UBS «-» is no pick. |
| Joined words as written / license runs | A run line stands unless `runTakesDefault`. |
| Joined words as separate words | Each word follows the layer. |
| Pairs | Today's line under every source. |
| Word senses, framed, numbering, English reader, concordance hud, BSB | No interaction. |
| Search | Made pills are not indexed (v1). |
| Reset | STEP, auto second, note closed. |

### The seven open questions to the corpus lane: stated behavior until answered

1. **STEP picks that name no row** (17,077 line picks; Genesis 949, e.g. Amos 1:1:2 «Amos»). The line is today's either way. Under a non-STEP first, STEP's picks show as text, credited M4 (kind r) or M19 (v, a).
2. **receipt-v1's STEP counts.** Held to receipt-v1.1 (748 v, 5,376 a). The mismatch is printed as `  --` by D1c.
3. **The variant letter** (K at 725 of 748; also S, P, F, V, H, A, AH, B, BH, C, D, E). Printed as given, «(a meaning variant, K)», and never tied to the pair halves.
4. **BDB words per sense.** Slot 5 whole plus « · sense N». Two senses of one record differ only by N (refusal 6 holds it).
5. **Places the piece store lacks** (Genesis 24, Ruth 11, Amos 4). Nothing changes. Defaults key by `WORD_N` and never read the piece store; these places are counted.
6. **Picks whose named row the entry gate withholds** (estimates: STEP 1,014; MACULA 7,241; UBS 1,319; BDB 224). The made pill stands above the gates and the line prints the pick. Counted.
7. **Jastrow.** One index `sources` entry, a fifth slot (`DEFAULT_PICKS_BOOK_V2`), and one literal position in each TOGGLES entry, which needs a `zone.html` edit because `togglesFrom` parses literals only.
8. **(new) UBS «-» and «NO DATA YET».** No line pick; the card prints them as given.

## 5. Checks

### 5.1 New: `tools/check-default-picks-v1.mjs`

- **Header:** `// RUN: tree`, `// GUARDS: <the bake's RULE id>`, `// LEDGER: -`.
- **Flags:** `--ledger <dir>` (optional; laws that need it print `  --  Dn not judged here: the ledger is not on this machine`) and `--self-test`.
- **What it never imports:** the bake's reader or counter. It imports only the RULE id. It prints no Hebrew in literals or output (U+ codes instead).
- **Works opened** are derived from the data, never named:
  - w1: the smallest work with a place both STEP and its second leave (Ruth today);
  - w2: the smallest work with no second for STEP (Nahum);
  - w3: the smallest work with a rest fill at a word today draws bare;
  - w4: a work on disk the index does not list (the Tikkunei Zohar).

**Laws:**

- **D0 · the rule.** The guarded rule equals the bake's.
- **D1 · the bake is the ledger** (node, all 39 books).
  - a. Every pin and book file hashes as named.
  - b. Every place's picks equal the check's own parse of the ledger with the mend applied, and `places.length` equals the zone's entries.
  - c. After the mend: v 748, a 5,376, 15 merged.
  - d. Each book file's sha256 equals the index (judged without the ledger too).
- **D2 · every named row re-resolves.** 152,648 rows. Missing fails; doubles are counted and named.
- **D3 · the index's counts.** `has`, `fills` and `step_leaves` equal the counts recomputed in node from the book files and the zones by §2.2, in all 39 books. The auto second follows the tie order; the expected totals are 29 books MACULA, 23 ties, 10 none.
- **D4 · first visit** (no flag, nothing stored).
  - Exactly «STEP» is pressed. The pills read the index names in order.
  - The note is hidden.
  - `fh.defaults` is null and `__default.second` equals the node auto second.
  - The Menu mirrors the four pills, and no chooser button.
- **D5 · at rest the line is the record's**, byte for byte, in every section of w1–w3, except exactly at the index's fillable leaves.
  - There the text is the second's, the chip `data-line` is its M, and the card's pressed pill equals the line.
  - Node side: no leaf is a place whose `pg` pieces all carry words. Expected total 212.
- **D6 · the pills.**
  - Each pill, pressed in the row and in the Menu, leaves exactly one lit.
  - `__default.on` and `fh.defaults` follow, and a reload keeps them. `?default=` is not stored.
  - The note shows by the rule of Step 7, its strings equal `pct()` of D3's counts, and the lit-pill press behaves as stated.
- **D7 · the line under each X** (every place of w1–w3, for each X).
  - It equals the node model: ruling (skipped), `kq` → the record's line, a run where X does not read every word → the record's run line, X's line, the non-STEP second's line, the record's line.
  - Chips name X's or Y's M. No chip names a source that is switched off.
- **D8 · the second can be changed.**
  - For each other Z, the lines that change are exactly the places where X has none and Y or Z has a line.
  - The note follows. The choice is kept per first. Reset brings back auto.
- **D9 · a ruling outranks a source.** It holds across switching, across joined words out and back, and when switching back to STEP.
- **D10 · reset.** From X with a chosen second and a ruling: reset is enabled, then STEP with auto lights, and every line equals the record.
- **D11 · back to STEP is the first paint.** All lines, and the first five cards (pills, pressed pill, `.r-now .v`), byte for byte.
- **D12 · the card answers as the line** (C1 under each X, on the first 20 words).
  - Where no pool pill prints X's pick, a made pill credited to X stands first and pressed.
  - `.r-piece` is unchanged at rest apart from its `<i>`, and the BSB line stays.
  - Gate-withheld picks still print, and are counted.
- **D13 · several picks.** X's picks 2..n appear in the ledger's order, with UBS numbers restarting per piece and the variant letter as given. The line takes pick 1.
- **D14 · a work with no defaults file (w4).** The group and note are hidden, no defaults book file is requested, and the lines equal the record.
- **D15 · fetches.**
  - The index is fetched once, at boot.
  - The book file is not fetched at load at rest. It is fetched once at the first card, and at load under a stored X.
  - With the book file aborted through `p.route`, today's line stands, the failure note shows, and there are no page errors.
- **D16 · no page errors**, and lines settle within twenty readings.
- **D17 · reads first.** Under «oldest first» no pill is lit and the line is unchanged from today. Pressing a pill sets «the source here».
- **D18 · sources off.** An off source's pill is disabled, the auto second is recomputed, and no chip names it.
- **D19 · `SOURCE_WORDS`.**
  - At rest it holds no text with a `/`.
  - Under each X it holds no text that a TAHOT (M4) row prints in that book.
  - The store collisions are exactly the measured two, listed.

### 5.2 Fault harness (`--self-test`): each law must go red

**Node side, on in-memory copies:**
- H1: change one STEP pick's words → D1 red.
- H2: leave the mend off at one place → D1 red.
- H3: flip one row's sha16 → D2 red.
- H4: break one tie the other way → D3 red.
- H5: count UBS «-» and BDB picks with no words → D3 red.
- H6: print the left share as a remainder → D6 red.

**Page side, through `p.route`:**
- H7: one MACULA pick changed in a served book file → D7 red at exactly that place.
- H8: the book file aborted → D15 stays green.
- H9: an index with another `fills` → D4 red.
- H10: `fh.defaults = "ubs"` set before a "first visit" → D4 red, and bake-resting-lines refuses.

### 5.3 Existing tools that must learn the new state

- **check-card-opens-on-the-line-v1:** trials with `fh.defaults` = macula, ubs, bdb. C1 holds under each.
- **check-ruled-equals-first-paint-v1:** the loop (about 33) gains `["he", "ubs"]` via `?default=ubs`.
- **check-line-follows-card-v1:** an F law under X.
- **check-menu-switches-v1:** M1 and M2 hold. M3's flip list gains `default-macula`, which lights in both the row and the Menu while `default-step` goes dark.
- **check-reset-pill-v1:** R1 counts a non-STEP first or a chosen second for STEP as off-default. R4 puts STEP with auto back. `atDefault` (67) gains the defaults.
- **check-page-fetches-v1:**
  - F1 (63): a chapter page's load fetches no `data/default-picks/<book>.bin`.
  - F4 analog (90): the first card fetches it once; a second card fetches nothing more.
  - The index is allowed at boot.
- **check-same-product-v1:**
  - `STATES` (40) becomes `[name, id, back]` with MACULA, UBS and BDB pressed, then `default-step` to come back. The old live build lacks the ids, so those states are "not compared".
  - S1 learns `--expect data/default-picks/index.json`: every line difference on a sampled page is a listed fill, and every listed fill there differs as listed.
  - S2 is unchanged.
- **check-word-senses-v1:** W2 (168) also reads `__default.on` and `fh.defaults`; the verdict (379) requires `"step"` with nothing stored. W5 also runs under `?default=ubs`.
- **check-line-reads-the-place-v1:** stays green, because the 31 MACULA-piece places are not filled. Confirm P1–P3 in the run.
- **build-toggle-design-v1:** no code change. Run it again to rebuild `/toggles/` (rows `defaults` and `second`). check-clean-address-v1 then holds.
- **check-live-v1:** L5: the live `data/default-picks/index.json` equals this checkout's, byte for byte.
- **run-checks-v1:** no edit. It finds the new check by its `// RUN:` header and lists its `  --` lines.
- **No change:** check-chapter-pages-v3 (holds against the rebaked records), build-front-door-v1, bake-search-index-v1 (made pills are not indexed), and the kq checks.

## 6. Round and ship

1. **round-v1.sh:**
   - new flag `--default-picks <dir>`;
   - `STEPS` (57) becomes `zones,stamps,search,defaults,records,lines,chain,door`;
   - the `defaults` step runs `node tools/bake-default-picks-v1.mjs --ledger "$DEFAULT_PICKS"`, or prints «no --default-picks given: data/default-picks stands as it is», then runs `node tools/check-default-picks-v1.mjs` for its node laws;
   - it runs after `zones` (it reads `pg` and `kq`) and before `records` (the gate and the manifest).
2. **Order of work:**
   1. the bake, run with the ledger, plus `--dry` first;
   2. the page, steps 1–10;
   3. `build-toggle-design-v1`;
   4. `round-v1.sh --stamp 2026-11-14 --default-picks <dir> --steps defaults,records,lines,chain,door`, which rebakes all 40 resting records and every chain book, because `zone.html` changed;
   5. `node tools/run-checks-v1.mjs` (the full suite) plus check-default-picks-v1 with `--ledger` and `--self-test`.
3. **Ship** (CLAUDE.md):
   1. commit on `main`;
   2. merge `main` into `gh-pages` with the message «gh-pages follows main»;
   3. push both;
   4. run `check-live-v1` against the live origin (L5 included), plus a first-visit spot read of one fill in each of three books (e.g. Daniel 1:4:6, Psalms 10:5:2, Ruth 3:14:2).

## 7. Measures (published with the ship, all 39 books)

**What moves at rest (STEP with its auto second): 212 lines in 29 books.**
- By book:
  - Ezekiel 53, Job 21, I Samuel 19, Deuteronomy 18, II Samuel 17, Jeremiah 10, Psalms 9, II Kings 7, Proverbs 7;
  - Daniel 6, Exodus 6, Ezra 6, I Kings 6, Isaiah 5, Genesis 4;
  - 2 each: Ecclesiastes, I Chronicles, Joshua, Leviticus;
  - 1 each: Amos, Habakkuk, II Chronicles, Lamentations, Nehemiah, Numbers, Obadiah, Ruth, Song of Songs, Zephaniah.
- What prints there today:
  - 55 are bare and gain MACULA's words, e.g. Ruth 3:14:2 → «feet his»;
  - 151 change words, from M4 rows read from another place (68), M14 (55), M9 (16), M25 (6) and others (6);
  - 6 change only their credit.
- Examples:
  - Daniel 1:4:6 «blemish» (M9) → «physical defect»;
  - Daniel 4:16:22 «form» (M14) → «lord my»;
  - Jeremiah 17:11:10 «sea» (M25) → «days his»;
  - Jeremiah 17:24:22 «Hephzi-bah» (M14) → «on it»;
  - Psalms 10:5:2 «archer» (M14) → «ways his»;
  - Psalms 18:51:1 «tower» (M14) → «gives great»;
  - Isaiah 27:2:4 «fermenting» (M9) → «pleasant».
- Unchanged:
  - 31 places already print MACULA's own words through the place line;
  - 23 ketiv/qere places;
  - 1 place where no source picks (Ruth 3:12:5 «mother», M9).
- Ten books move nothing: Esther, Haggai, Hosea, Joel, Jonah, Judges, Malachi, Micah, Nahum, Zechariah.

**Shares per book** (this plan's rule; `final-counts-by-book.tsv`):

| book | places | kq | STEP | then | MACULA (then STEP) | UBS (then STEP) | BDB (then STEP) | left under BDB+STEP |
|---|---|---|---|---|---|---|---|---|
| amos | 2,042 | 2 | >99.9% | MACULA 1 (=UBS) | 96.7% (+3.2%) | 82.5% (+17.4%) | 44.0% (+55.8%) | 1 |
| daniel | 5,923 | 125 | 99.8% | MACULA 6 (=UBS) | 96.9% (+3.0%) | 77.3% (+22.6%) | 50.5% (+49.3%) | 7 |
| deuteronomy | 14,294 | 7 | 99.8% | MACULA 18 | 96.7% (+3.2%) | 77.8% (+22.1%) | 31.8% (+68.0%) | 18 |
| ecclesiastes | 2,987 | 10 | >99.9% | MACULA 2 (=UBS) | 97.1% (+2.8%) | 77.7% (+22.2%) | 39.0% (+60.9%) | 2 |
| esther | 3,045 | 13 | 100% | none | 96.9% (+3.0%) | 80.5% (+19.4%) | 32.6% (+67.3%) | 0 |
| exodus | 16,713 | 6 | >99.9% | MACULA 6 (=UBS) | 95.9% (+4.0%) | 78.3% (+21.6%) | 32.8% (+67.0%) | 6 |
| ezekiel | 18,729 | 80 | 99.7% | MACULA 53 | 97.4% (+2.5%) | 78.0% (+21.9%) | 32.4% (+67.2%) | 54 |
| ezra | 3,754 | 31 | 99.8% | MACULA 6 (=UBS) | 97.7% (+2.2%) | 83.8% (+16.1%) | 39.5% (+60.3%) | 6 |
| genesis | 20,612 | 12 | >99.9% | MACULA 4 (=UBS) | 96.2% (+3.7%) | 78.1% (+21.8%) | 35.9% (+64.0%) | 4 |
| habakkuk | 671 | 0 | 99.8% | MACULA 1 (=UBS) | 98.8% (+1.1%) | 85.2% (+14.7%) | 47.5% (+52.3%) | 1 |
| haggai | 600 | 1 | 100% | none | 98.1% (+1.8%) | 80.6% (+19.3%) | 30.3% (+69.6%) | 0 |
| hosea | 2,381 | 6 | 100% | none | 97.3% (+2.6%) | 80.0% (+19.9%) | 44.6% (+55.3%) | 0 |
| i-chronicles | 10,740 | 39 | >99.9% | MACULA 2 (=UBS) | 94.6% (+5.3%) | 84.0% (+15.9%) | 26.9% (+72.9%) | 3 |
| i-kings | 13,139 | 38 | >99.9% | MACULA 6 (=UBS) | 95.8% (+4.1%) | 79.7% (+20.2%) | 28.8% (+71.0%) | 6 |
| i-samuel | 13,258 | 51 | 99.8% | MACULA 19 | 95.9% (+4.0%) | 78.6% (+21.3%) | 27.1% (+72.7%) | 20 |
| ii-chronicles | 13,314 | 39 | >99.9% | MACULA 1 (=UBS) | 96.1% (+3.8%) | 80.4% (+19.5%) | 26.0% (+73.8%) | 2 |
| ii-kings | 12,275 | 66 | >99.9% | MACULA 7 (=UBS) | 95.7% (+4.2%) | 80.6% (+19.2%) | 25.8% (+74.0%) | 11 |
| ii-samuel | 11,032 | 72 | 99.8% | MACULA 17 | 95.4% (+4.5%) | 78.9% (+21.0%) | 24.6% (+75.1%) | 21 |
| isaiah | 16,923 | 49 | >99.9% | MACULA 5 (=UBS) | 98.4% (+1.5%) | 83.7% (+16.2%) | 45.2% (+54.7%) | 6 |
| jeremiah | 21,831 | 129 | >99.9% | MACULA 10 | 96.5% (+3.4%) | 77.5% (+22.4%) | 28.4% (+71.4%) | 14 |
| job | 8,339 | 32 | 99.7% | MACULA 21 | 99.0% (+0.9%) | 82.5% (+17.4%) | 45.4% (+54.3%) | 21 |
| joel | 957 | 1 | 100% | none | 98.5% (+1.4%) | 82.5% (+17.4%) | 40.7% (+59.2%) | 0 |
| jonah | 688 | 0 | 100% | none | 98.1% (+1.8%) | 79.9% (+20.0%) | 30.2% (+69.7%) | 0 |
| joshua | 10,031 | 29 | >99.9% | MACULA 2 (=UBS) | 94.5% (+5.4%) | 78.3% (+21.6%) | 29.1% (+70.8%) | 2 |
| judges | 9,885 | 20 | >99.9% | none | 95.4% (+4.5%) | 79.0% (+20.9%) | 29.5% (+70.4%) | 1 |
| lamentations | 1,540 | 20 | >99.9% | MACULA 1 (=UBS) | 97.9% (+2.0%) | 82.7% (+17.2%) | 41.4% (+58.4%) | 1 |
| leviticus | 11,950 | 3 | >99.9% | MACULA 2 (=UBS) | 96.0% (+3.9%) | 76.2% (+23.7%) | 35.2% (+64.6%) | 2 |
| malachi | 876 | 0 | 100% | none | 98.1% (+1.8%) | 81.1% (+18.8%) | 36.0% (+63.9%) | 0 |
| micah | 1,396 | 4 | 100% | none | 98.1% (+1.8%) | 83.2% (+16.7%) | 42.1% (+57.8%) | 0 |
| nahum | 558 | 4 | 100% | none | 98.9% (+1.0%) | 84.0% (+15.9%) | 50.5% (+49.4%) | 0 |
| nehemiah | 5,312 | 22 | >99.9% | MACULA 1 (=UBS) | 96.9% (+3.0%) | 83.8% (+16.1%) | 31.6% (+68.3%) | 1 |
| numbers | 16,408 | 8 | >99.9% | MACULA 1 (=UBS) | 96.7% (+3.2%) | 81.8% (+18.1%) | 29.4% (+70.5%) | 1 |
| obadiah | 291 | 0 | 99.6% | MACULA 1 (=UBS) | 97.2% (+2.7%) | 81.0% (+18.9%) | 35.3% (+64.2%) | 1 |
| proverbs | 6,914 | 61 | 99.8% | MACULA 7 (=UBS) | 98.8% (+1.1%) | 87.8% (+12.1%) | 49.2% (+50.6%) | 7 |
| psalms | 19,583 | 60 | >99.9% | MACULA 9 (=UBS) | 98.9% (+1.0%) | 84.8% (+15.1%) | 44.0% (+55.8%) | 11 |
| ruth | 1,296 | 12 | 99.7% | MACULA 1 (=UBS) | 95.8% (+4.0%) | 78.2% (+21.6%) | 31.6% (+68.1%) | 3 |
| song-of-songs | 1,250 | 3 | >99.9% | MACULA 1 (=UBS) | 97.4% (+2.5%) | 85.2% (+14.8%) | 56.9% (+42.9%) | 1 |
| zechariah | 3,127 | 6 | 100% | none | 97.3% (+2.6%) | 79.5% (+20.4%) | 30.8% (+69.1%) | 0 |
| zephaniah | 767 | 1 | 99.8% | MACULA 1 (=UBS) | 97.9% (+2.0%) | 82.0% (+17.9%) | 38.8% (+61.0%) | 1 |
| **all 39** | 305,431 | 1,062 | >99.9% (305,196) | MACULA 212 | 96.7% (+3.2%) | 80.2% (+19.7%) | 33.8% (+66.0%) | 235 |

**Also recorded with the ship:**
- made pills per source under each X (receipt `picks_printed`: STEP 18,679, MACULA 10,849, BDB 10,682; nearly every UBS pick);
- lines over 40 characters (UBS 33,831, BDB 15,506);
- runs each source reads whole (of 2,177 run lines: MACULA 1,681, UBS 1,377, BDB 278);
- the live check's number.

## 8. The owner's open calls (last; each has a v1 behavior above)

1. **Confirm the fill at rest.** Message 3 is built as written: 212 words in 29 books (examples in §7). The alternative is to fill only the 55 bare words.
2. **STEP's own reading where today's line is another dictionary's single-word line.** About 460–500 words, for example:
   - Daniel 2:5:5 «circumcise(-ing)» (M14) → «word + the»;
   - Habakkuk 2:2:4 «record» → «write down»;
   - Ecclesiastes 1:17:6 «A licentious person» → «madness».
   
   v1 keeps today's line (your answer of 14 Nov). Should STEP's own reading print instead?
3. **Joined words (#90).**
   - Under STEP, the 4,402 run words keep their line (v1).
   - Under MACULA, UBS or BDB, a source takes a run only where it reads every word (MACULA 1,681, UBS 1,377, BDB 278 of 2,177 runs). Keep?
4. **BDB's line words.** v1 prints the record's highlighted words whole with « · sense N», as ruled. 15,506 of these lines run past 40 characters (the longest is 341). The alternative is the first highlight only (2,735 over 40 characters, longest 126), with the whole list on the card.
5. **Long UBS and BDB lines:** printed whole (v1, the page's no-clamp rule of 3 Oct), or clamped to three rows?
6. **UBS «-» (10,910) and «NO DATA YET» (13):** no line pick, so the second fills them (v1), or print them as given? This decides UBS 80.2% against the 84.1% in your note. The «NO DATA YET» half also goes to the corpus lane.
7. **Shares.** v1 counts each source's own reading, the way the line can print it: STEP >99.9%, MACULA 96.7%, UBS 80.2%, BDB 33.8% over the 39 books. Your note's figures counted signs, empty BDB picks and ketiv/qere words. OK?
8. **Dim ink** on words the chosen source does not print: none in v1. Alternatives: only while the source is not STEP, or always.
9. **The card's list of sources:** information only (v1), or pressable as the same page-wide switch?
10. **«today’s line» as a choice of second source**, so a source can stand alone over today's line. Not offered in v1.
11. **Credit.** v1 credits the pick's own source even where the store row printing the same words is another source's (STEP 55,445; MACULA 176,657; BDB 33,194 line picks). The 14 Nov letter told the corpus lane the row's source would be credited.
12. **Tie-break** in row order: MACULA beats UBS for STEP's second in 23 books. BDB can never be STEP's second.
13. **The card's reading row** keeps «reading · TAHOT at this place» at rest (v1), or reads «STEP at this place» to match the pill?
14. **/toggles/:** the two rail rows (default source, second source) filed under «them» (someone else's words), not «arrange».

## Decisions only the owner can make

- Confirm the fill at rest that your third message asks for: STEP's auto second (MACULA) prints at 212 words in 29 books. Of those, 55 bare words gain words (e.g. Ruth 3:14:2 «feet his»), 151 words change (e.g. Daniel 1:4:6 «blemish» to «physical defect»; Jeremiah 17:11:10 «sea» to «days his»; Psalms 10:5:2 «archer» to «ways his»; Isaiah 27:2:4 «fermenting» to «pleasant»), and 6 change only their credit. Keep all 212, or fill only the 55 bare words?
- STEP's own reading where today's line is another dictionary's single-word line (about 460–500 words, e.g. Daniel 2:5:5 «circumcise(-ing)» to «word + the»; Habakkuk 2:2:4 «record» to «write down»): keep today's line (v1, following your answer of 14 Nov that STEP rests as today's line), or print STEP's own words?
- Joined words (#90): under STEP the 4,402 run words keep their dictionary line (v1). Under MACULA, UBS or BDB, should a source take a run only where it reads every word of it (MACULA 1,681, UBS 1,377, BDB 278 of 2,177 runs)?
- BDB's line words: the record's highlighted words whole plus « · sense N» (v1, as ruled on the prototype; 15,506 lines over 40 characters, the longest 341), or only the first highlight (2,735 over 40, the longest 126) with the whole list on the card?
- Long UBS and BDB lines: print them whole (v1, the page's no-clamp rule of 3 October), or clamp them to three rows?
- UBS «-» (10,910 pieces) and «NO DATA YET» (13): treat them as no line pick so the second source fills those words (v1; UBS 80.2%), or print them as given (UBS near 84.1%, the figure in your note)?
- Shares: count each source's own reading the way the line can print it (STEP >99.9%, MACULA 96.7%, UBS 80.2%, BDB 33.8% over the 39 books), not the 99.9 / 97.1 / 84.1 / 36.4 in your note, which counted signs, BDB picks with no words, and ketiv/qere words. OK?
- Dim ink for the words the chosen source does not print: none (v1), only while the source is not STEP, or always?
- The card's list of what each source reads at a word: information only (v1), or pressable as the same page-wide switch as the pills?
- Offer «today’s line» as a choice of second source, so a source can stand alone over today's line (not in v1)?
- Credit: the line's chip names the pick's own source even where the store row printing those words is another source's (STEP 55,445; MACULA 176,657; BDB 33,194 line picks). The 14 November letter to the corpus lane said the row's source would be credited. Which?
- Tie-break for the auto second in row order (STEP, MACULA, UBS, BDB): MACULA beats UBS for STEP's second in 23 books. BDB can never be STEP's second, because it places every citation through STEP's reading. OK?
- The card's reading row at rest: keep «reading · TAHOT at this place» (v1), or say «STEP at this place» to match the pill?
- /toggles/: file the two rail rows (default source, second source) under «them» (someone else's words) rather than «arrange»?

## Could not determine

- Nothing was run in a browser. The paint paths (wordBlock, repaintGlossOrder, refreshJoinGloss, the card's poolFor place block), the first-paint wait under a stored source, the Menu mirror and the tight-card fold are all read from pt zone.html (17,179 lines, sha256 4049381a…), not watched.
- Whether repaintGlossOrder refreshes every joined run when a source changes (the page part says it does at about 13316). The run rule depends on it; verify in the first browser run.
- The exact count of single words where STEP's own ledger reading differs from today's line: 459 (the spec part's fold) to about 512 (the brief's), depending on how signs and brackets are folded. Under this plan they do not move, so the count only matters for owner call 2.
- Why the spec part's resting-record units cover 305,184 of the 305,431 zone words (247 words). This plan counts zone words and ledger places, which match exactly.
- What UBS «-» and «NO DATA YET» mean at a place, what the variant letters mean, and what receipt-v1's STEP counts (850 / 5,422) measured. These are the corpus lane's questions 2, 3 and 8.
- How many picks the card's entry gate actually withholds. The data part's figures (STEP 1,014; MACULA 7,241; UBS 1,319; BDB 224) are estimates from the zone's tg, not the lattice's core-piece tags.
- Whether the gate's S2 reading of chapter pages' first cards falls on any of the 212 rest-fill words. If it does, the gate receipt moves with the ship.
- Out of scope, noticed in passing: (1) 250 store rows written with a spaced slash (M13 228, M4 13, M23 5, …) print today through spanJoin with the slash read as « + »; whether that is intended was not determined. (2) numsPref rests «off» on a first visit (zone.html 14251) while SWITCHES_DEFAULT.nums is «on» (14322), so reset is enabled on a first visit; check-reset-pill-v1 works around this by pressing the pill. Neither is part of this plan.
