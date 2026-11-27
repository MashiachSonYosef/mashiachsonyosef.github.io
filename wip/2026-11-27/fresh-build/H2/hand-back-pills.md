## H2: today's card, with its pills from the place answers (sandbox S/s16; nothing committed, pushed or shipped)

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`

On the 39 books, at rest, a press opens today's card in full: the line at the top, the divisions and cells, READINGS and its pills, the record, «the record, whole», the maqaf run's and the chain's lattices, and a pair's halves. No frame code was rewritten. Each cell's pills now come from the place answers, and the listing («At this word», «In the dictionaries») stands under the frame. The spelling switch still brings back today's pool whole.

**Summary of the proofs:**
- The data holds and the comparison exits 0.
- The one-place check passes all 20 of its results, including the new pill laws P16–P18; each new law fails on a spoiled copy.
- Walk: all 13,497 words open and match the files.
- 50 places with the switch on equal S/base; the resting lines of five books are unmoved; the eight tree checks pass.
- **The 70 card checks:** at rest, 33 now pass (before: 0 of 70). Of the 37 red:
  - 20 have expected causes: 19 test the old pool's own content or controls that are hidden at rest, and 1 (compspan-coverage) gave no verdict within 600 s.
  - 17 show real gaps (section 4).
  - With the old card forced, 70 of 70 pass.

**Decisions for you:**
- **The export on piece pills.** For a pill pressed on one cell of a divided word, the export misses it: 32 of 129 carried. Today's card misses too: 5 of 20 carried, on the same kind of word. Making it carry them is a change to the exporter, not to the pills.
- **73 words where the resting reading is not among the pills.** All are inside the known 141 differences. On them, the card presses another pill (for example «if» under the line «mother»). The line itself stands unmoved.
- **One correction to the cut-8 hand-back:** I deleted `S/s46w/h2-before/` there, and I also deleted my scratch copies from this step.

### 1. How the pills are filled

**In the block** (`reader/tools/place-card-v1.mjs`), a new eighth function: `pillsAt(doc, verse, word number, reading, a, b, t)`. A pill stands in a cell only where a source puts that reading on that part of the word by its own address. Nothing is matched by letters.
- **STEP:** each part's gloss goes in that part's cell. The whole word's cell gets the parts joined "/" as the line joins them.
- **MACULA:** its parts go in the cells their own letters make. A part with no letters of its own stands only in the whole word's reading. Where MACULA cuts the word otherwise than STEP, its parts are held to the whole word alone.
- **The dictionaries:** under the number STEP gives a part, each dictionary's entry, as «In the dictionaries» shows it, goes in that part's cell. The pills are the exact strings the listing prints as a meaning:
  - each «» run of a meaning or an opening;
  - each `<def>` of Strong's;
  - each `<def>` of the Open Scriptures BDB that its entry prints;
  - UBS's and unfoldingWord's glosses;
  - the STEP brief lexicon's gloss and the Lexical Index's definition.
- **What is never a pill:** plain italics, Strong's list of renderings, and records of the unabridged BDB set behind.
- **Cited first:** within a dictionary's pills, what cites this place leads (UBS «cites this very word», BDB lines and senses that cite this verse). A UBS sense found by MACULA's dictionary form goes in the cell of that part.
- **Order:** STEP, MACULA, UBS, the two BDB files, then the others as the listing lists them.

**The one place in `zone.html` the pills' source changed:** `poolFor`. When the card asks for pills, the place card is on, and the cell belongs to the open card, it returns `placePool`. That builds the pool's groups from `pillsAt`:
- one reading, one pill, credited to every source that gives it;
- STEP's and MACULA's rows are credited as the line credits them (`readingOfPiece`), and each dictionary's by its own key;
- the reader's source switches still act;
- each pill's sources are in the frame's oldest-first order;
- under a default source other than STEP, that source's pick leads.

**Supporting changes, none of them a second copy of the frame:**
- `openHud` fetches the chapter's file before the frame asks for a cell.
- The listing is appended under the frame.
- The early-return place card from the last step is removed, and four places in the card's head are restored to today's text.
- Presses go back to today's paths (the `openPlace` intercepts are gone).
- `carryWithheld` carries two new fields.
- A cell with no pills says «No source reads this part by itself here.», using the existing empty-cell path.
- The exporter cites the record a place pill stands on (`attributionFor`).
- CSS: the frame keeps its size. The listing takes what is left and scrolls inside itself, with a small floor only on windows at least 600 px tall.
- One read-only hook for checks: `window.__placeCard.pools`.

### 2. Cells with no reading, and resting readings not among the pills

**Cells with no reading:** 539 of 616,975 (every STEP part's cell and every whole word's cell, for every form of all 305,431 words; 9,038,035 pills in all).
- 535 are written forms that STEP records by spelling only.
- 4 are read forms: Proverbs 21:29 word 7 and Job 38:12 word 4.
- Two more kinds of cell get no pills because today's frame asks once per letters: a cell whose letters stand twice in one division (2 seen in the walk), and a cell spanning several words of a run. Both say so in plain words.

**Resting reading not among the pills:** 141 words have a resting line the place answers do not give. Of those:
- 54 have the resting reading among their pills.
- **87 do not:** 14 have no resting line at all, and 73 have a reading that no pill offers.

The 73:
- **Names, as the line spells them:** Zurishaddai ×2, Pedahzur ×2, Ichabod's, Malchishua ×4, Asahel ×7 (including «and + Asahel» twice), Mephibosheth ×4, Amminadib ×2, Nergal-sar-ezer ×2, Nebuzaradan, Sharezer ×2, Yahweh, and «Rabshakeh, a Babylonian official» ×17 (2 Kings 18–19 and Isaiah 36–37).
- **«mother», on four written-not-read words:** Ruth 3:12, 2 Samuel 13:33, 2 Samuel 15:21, Jeremiah 39:12.
- **Every other phrase or single word:**
  - Exodus 4:2 «what + is this?»
  - Ruth 4:5 «attain»
  - 2 Samuel 5:2 «you were + the + one who led out»
  - 2 Samuel 7:22 «judges»
  - 2 Samuel 8:3 «at + the river + Euphrates»
  - 2 Samuel 18:12 «and + [will belong] to + him»
  - 2 Samuel 21:12 «they had hung up + them + there + towards + the Philistines»
  - 2 Kings 5:18 «raw»
  - 2 Kings 6:25 «bear»
  - 2 Kings 18:27 «the water of + feet + their»
  - 2 Kings 22:5 «and + they have put + it»
  - 1 Chronicles 27:12 «of the + Ben + jaminites»
  - 2 Chronicles 34:9 «and + they turned back»
  - Nehemiah 2:13 «they + were broken down»
  - Psalms 9:1 «'To die for the son'»
  - Psalms 10:10 «an army + of disheartened people»
  - Psalms 140:10 «they have covered + them»
  - Isaiah 3:15 «what + is to + you?»
  - Isaiah 36:12 «the water of + feet + their»
  - Jeremiah 14:14 «and + an idol + and + the deceitfulness of»
  - Jeremiah 38:16 «sign»
  - Ezekiel 8:6 «what + are they?»
  - Ezekiel 42:9 «and + was from + under + the + rooms»
  - Ezekiel 48:16 «fifth»
  - Daniel 1:8 «portion (provision) of meat»
  - Daniel 1:16 «delicaci[es] + their»
  - Zephaniah 2:9 «nation»

The full table is in `S/s46w/logs/resting-among-pills.tsv`.

### 3. The proofs

1. **The data.** `make-place-answers-v1.sh S/s45w/fetched` ended «everything holds» (205 s). The comparison exits 0: 305,431 words, 305,290 equal, 141 differ, exactly the list. The pins are unchanged from the ‡ fix (joined b35795b49e41…, page ab1afe1e4c50…). The projection was not touched in this step.
2. **`check-place-card-one-place-v1`:** exit 0, 20 results ok. P1 now counts eight functions. The new laws run over every fifth word of the 114 chapters, 7,415 words:
   - **P16:** every pill is a string the listing prints as that source's meaning (215,473 pills in 14,952 cells).
   - **P17:** no pill stands without its source and an address.
   - **P18:** every meaning the listing prints as this word's, at this word and on each shown record's one line, is a pill in its cell (110,117 meanings).
   - **The spoils:**

| Law | Spoil | Result |
|---|---|---|
| P16 | Strong's renderings made pills | 93,858 found wrong |
| P17 | MACULA's address emptied | 7,294 found wrong |
| P18 | unfoldingWord's glosses dropped | 316 found wrong |

   P18 was then made stricter: it also holds UBS's senses cited at this very word.
3. **The walk** (412 wide, the same 29 chapters):
   - Pressed = opened = listing matched the file: 13,497.
   - 13,493 cells were drawn from the place answers. Their pills equal what the files give in 13,493 of 13,493, and no pill was shown that the place answers did not give.
   - 277,018 pills shown; 602 held back by today's signs switch.
   - No cell stood with no pill pressed at rest.
   - The card's line equals the line under the word in 12,889 cases. The rest are runs and hidden-sign gaps.
   - The head shows the word's own number in 13,432 cases. The 65 others are runs' cards, numbered as runs, as today.
   - 87 of 87 real taps opened a card.
   - **Median time:** 38.9 ms from press to card (95th percentile 73); 39.3 ms with the dictionaries.
   - 748 cards with 5,320 entries opened and shut; the sheet moved 0 times.
   - No page errors; 99 aborted requests.
4. **Pressing** (320 words across all 39 books, plus 20 on today's card):
   - A pill other than the resting one was pressed on 313 words (7 cards had no other pill). The line showed it 313 times, and reset returned the resting line 313 times.
   - Export carried it from a whole-word cell 152 of 164 times. A cell of a divided word: 32 of 129. Today's card: 5 of 20.
   - Divisions and cells on 50 words with pieces: 50 cells and 50 divisions pressed, the readings band redrawn each time, reset returned the line 50 times. No page errors.
5. **The 70 card checks:** see section 4.
6. **The rest:**
   - Switch on = S/base on 50 places, each read twice: 50 of 50 identical in every field, no page errors.
   - Resting lines with the switch off, on and off again: 30,559 lines across Ruth, Amos, Jonah, Daniel and Genesis, all equal to base, no errors.
   - The eight tree checks, each alone, all pass.

**Order of the runs:** the walk and the pressing proof ran before the last five fixes:
- oldest-first sources within a pill;
- the default source's pick leading under its layer;
- the export citing the card's record;
- the listing's floor on short windows;
- UBS on a prefix's cell.

The one-place check, the reruns and the pictures ran on the final code.

**During the tree checks:** nothing-hand-typed caught two letters I had typed literally in the check. I rewrote them as escapes; it passes now.

### 4. The 70 card checks, each alone

**At rest, 33 pass:**
- block-in-table, card-channels, concordance-counts-the-line, default-spans, drag-offscreen, gloss-whole, hud-toggles, kq-graded;
- landing-holds-the-card, lattice-parts-in-card, levels, maqaf-pair-drawn, names-pill, nothing-overlaps, pill-whole, proper-name;
- readers-faults-place, reading-language, reading-rows, record-pinned, row-and-card-name-sources, ruled-equals-first-paint, ruled-mark, ruled-split-fits;
- run-cards, run-line-follows-division, search, source-suggested, span-store, v-volume-in-card, whole-form-parts, word-address;
- usable-card, after the listing's floor fix, run alone.

**Red, expected (20):** 19 test the old pool's own content or a control that is hidden at rest, and 1 gave no verdict. No check's law was edited.
- **Store rows withheld or graded:** masorah-toggle, pointing-gate, pointing-grade, piece-class, read-words, span-grade.
- **The store's own kinds of reading:** form-of (pointer pills), kq-declared-weld (the store's weld), ledger-divisions, made-spaces, overlays, piece-store, strongs-hedges, word-senses.
- **Dictionaries that rest shut:** dictionary-kinds, words-stand-alone.
- **Controls hidden at rest:** dictionary-toggle and reset-pill wait for the pool-only «dictionaries off by default» pill; readers-faults-rail needs the pool-only rail rows.
- **No verdict:** compspan-coverage gave none in 600 s.

**Red, real gaps (17):**
- **The line follows another switch than the pills:** under another order, layer or source switch, the line reads the store's own column or pick, while the pills are the place answers'.
  - card-opens-on-the-line (C1), lattice-orders, witnessed-order (W4);
  - line-follows-card (F6, 2 of 60 cards under UBS and BDB);
  - default-picks (D5 at Daniel 1:16:5; D12 on 41 cards);
  - source-switch (S4), rulings-under-sources (U7).
- **A store-only reading still reaches the line:** live-line-asks-its-own-word (V2, 6 lines), line-reads-the-place (P4, 11 of 12).
- **The export and the chip:**
  - citations (C10/C11): on a page where no card of the word was opened, the export cites the store's record;
  - english-license: the chip names another of the reading's records than the check expects.
- **Pairs, runs and read forms:**
  - read-form-offsets (R3), kq-lead-follows-switch (K7), readers-faults-pairs (F1);
  - readers-faults-cards (C10): a block of several words of a run has no pills.
- **Scenarios that did not finish:** readers-faults-load timed out, and run-card-forms (R6) failed on a run's shard.

**The old card forced:** 70 of 70 pass. The files were restored and match their sha256.

### 5. Pictures (`S/s46w/shots-pills/`, phone size, scale 2, the real reader, each looked at)

- **01 Genesis 1:3 word 5 at rest:** the line «and + there was», the divisions, the cells, READINGS · 148 (pills «there was» pressed, «to be (in existence)», «to exist», «to be» and on), the record, «the record, whole», then the listing.
- **01b:** «to be» pressed; the word's line reads «to be + and» and the card's line «and + to be».
- **02 Genesis 1:1 word 1:** the root's cell (11 pills).
- **02b:** the prefix's cell: «in», «on», «at», «when».
- **03 Genesis 1:3 words 5–6:** the maqaf run's card, with its lattice above the word's divisions (`?maqaf=maqaf`, because maqaf chains are not joined at rest).
- **04 Malachi 2:5:** a chain's card: the chain's divisions, the word's covers, and the root cell's 152 pills.
- **05 Ruth 3:12 word 5:** the line «mother», 26 pills with «if» pressed, the written-not-read note, then the listing.
- **06 Exodus 30:33 word 11:** the cells «from», «his people», «his»; 9 pills, «kinspeople<s>» first.
- **07 Genesis 1:11 word 7.**

### 6. What still reads badly

- The written-form note in the card's head still says «its readings are matched by letters only». That is today's sentence, and it is no longer true here (picture 05).
- On the 73 words, the card presses a pill other than the line's reading.
- A root's cell can hold about 150 pills: every UBS gloss and every Open Scriptures BDB definition. Some pills read oddly on their own, such as «-», «[obj.]», «first: beginning», «here … there .».
- The record slot can list STEP under another source's record for STEP's own reading («Also given by 1 more source»).
- A pill pressed on a divided word's part does not reach the export.
- Under other orders and default sources, the line and the pills can disagree.
- On a window under 600 px tall, the listing gets only what the frame leaves.
- Where MACULA divides a word otherwise (616 forms), its parts' readings stand only in the whole word's reading.

### 7. Paths

**Changed** (`S/s16`; HEAD unchanged at ea6e1ad08e):
- `S/s16/reader/tools/place-card-v1.mjs` (767 lines)
- `S/s16/reader/tools/check-place-card-one-place-v1.mjs` (675 lines)
- `S/s16/reader/zone.html` (+976 / −6 against HEAD)
- `S/s16/reader/place.html` (carries the block)

**Logs** in `S/s46w/logs/`:
- data: `make-pills.log`, `lines-compare-pills.log`, `lines-table.tsv`
- one-place check: `one-place-pills-final.log`, `spoiled-pills.log`
- walk: `walk-pills.json`, `walk-pills.log`
- pressing: `press-export.json` (the run reported), `press-run2.json` (the earlier run), `press.json`, `press-words*.json`
- counts: `resting-among-pills.tsv`, `empty-cells.tsv`, `empty-cells.log`
- suite: `suite-70.txt`, `suite-pills-rest/` with its `.log`, `suite-pills-rest-rerun/`, `suite-pills-usable/`, `suite-pills-forced/` with its `.log`
- 50 places: `oldcard50p-*.json`, `oldcard50p.log`
- resting lines: `lines-pills.json`, `lines-pills.log`
- tree checks: `tree-cut8/*.pills.log`
- pictures: `shot-jobs-pills.json`

**Scripts** in `S/s46w/scripts/`:
- new: `h2-pills-block.py`, `h2-pills-zone.py`, `h2-pills-laws.js`, `h2-pills-try.mjs`, `h2-press.mjs`, `h2-resting-among-pills.mjs`, `h2-empty-cells.mjs`, `h2-find-runs.mjs`, `h2-spoil-run.sh`
- updated: `h2-walk.mjs`, `h2-shot.mjs`, `h2-spoil.py`
- the cut-8 versions are kept as `h2-walk-cut8.mjs` and `h2-shot-cut8.mjs`

**Pictures:** `S/s46w/shots-pills/` (9 files). Disk free: 3.1 GB.
