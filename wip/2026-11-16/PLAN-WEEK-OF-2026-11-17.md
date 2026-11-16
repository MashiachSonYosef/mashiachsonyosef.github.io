# Plan for the week of 17 November 2026 AD

Page lane (Elijah). Written 16 November, evening, after ship 7.

**Where things stand.** Live: `main` afea14aac6, `gh-pages` b7ca892aa8 (ship 7; Pages run 1374, live check 72). Record: `wip/2026-11-16/ship-7/SHIP-7.md`. Letter to Moses, sent: `wip/2026-11-16/FOR-MOSES-2026-11-16-the-four-cards-wired.md`. It asks for each span row's entry, the 1890 printing (the owner's word given), names_this_verse widened, and whether the lattice follows v5 and the unpointed rule.

**The owner's direction (16 November).** Agreed: an entry for every row is the main project. The vowels stay central. They are the text's own reading and say which word stands at a place; the entry a row must belong to is chosen by the word as pointed. What changes is that rows are joined to that word by entry, not judged by their own pointing.

## 1. An entry for every row (main project, both lanes)

Goal: every row carries the entry it belongs to. That covers the route store, the span store, and the dictionaries beside the store (Jastrow, the Samaritan dictionaries). The card at rest then shows the place's own entry, and everything else is one press away. The pointing gate becomes the fallback where no entry is known.

1. **Measure first (page lane, day 1).** Over the 39 books at rest:
   - the share of rows that carry an entry (row facts `n`), per source;
   - the share of word places where every standing row is of the place's own entry;
   - pills at rest per card (median and 90th percentile).

   Base the probe on `wip/2026-11-16/ship-7/tools/flip-measure.mjs` (it reads the store, the entry gate and the names gate as the page does).
2. **Letter to Moses (day 1).** Ask for a ledger, row -> entry with its evidence, in the shape of row-entries v1.1, for the sources that carry none. Name the sources by row count:
   - English Wiktionary: its Kaikki records name senses and etymology; join by pointed headword and gloss to STEP's and BDB's entries.
   - The Hebrew Wiktionary tables, Jastrow, Wikidata and NorthEuraLex.
   - The span store: the 65 right phrases held back today (Ramoth-gilead, «Salt Sea», «day and night»), and Strong's 11 names of several words.
3. **Page lane, meanwhile:** where STEP gives a word no tag, take the place's entry from MACULA's lemma (the zone's `hp`). This fixes 1 Samuel 2:10, where «unjust one» leads and Strong's «about» is held back. Measure, then ship.
4. **When the ledger lands:**
   - the entry gate reads it for every row;
   - the pointing and no-pointing rules act only on rows with no entry;
   - measure what each moves, then round, suite, gate and ship.

## 2. What a card shows at rest (one card for the owner)

- **Recommendation to put, with numbers before and after:**
  - at rest: the place's own reading (STEP), the default sources' picks, and the place's own entry from the dictionaries;
  - «more» for the rest.
- **The measure that counts:** rerun the outside reader's Genesis 1 verb audit (`wip/2026-11-12/an-outside-reader/`, task 88: 132 of 291 pills right) after each ship. Track right readings at rest, not rules.

## 3. Lines

- **Task 137:** a pointer never leads a line, for single words too. It affects 1,266 resting lines, mostly in the Tikkunei Zohar; 4 are new in ship 7 (Ezekiel 9:4, 40:34, 40:36, 1 Samuel 22:13). Measure what leads instead (the pointer's resolved English from `data/form-of-pills-v1.json`, or the next row), then ship. Probe: `wip/2026-11-16/ship-7/tools/pointer-lines.py`.
- **The Tikkunei Zohar's line (task 36):** it has no aligned translation, so its line falls back to a dictionary's first reading. Scope its own approach and put the options to the owner as one card.

## 4. Process

- **Fewer, general rules.** Fold rules into one per dictionary category (task 124). Replace laws tied to sample places with invariants where data movement broke them (check-rulings-under-sources U7 on 16 November).
- **Data steps the page lane can do itself.** Do from the sources' own files what doesn't need a relay to Moses, as own-pointing did.
- **The suite's time limit (task 125):** check-run-card-forms gave no verdict in 1,500 s under load; alone it takes 39 s.

## 5. Carried over (smaller)

- Task 112: the gate's S2 reads each book's first verse on every chapter page.
- Task 61: the span line prints its first row whole where the ledger divides it.
- Tasks 130 to 133: the kinds follow-ups; the ruled pointer pill repainting raw; round 2's leftovers; licence -> license and colour -> color in names that predate the rule.
- The whole form's withheld-switch sentence: about 38,900 places say nothing of the parts' readings.
- The piece-class gate still keeps one-letter rows with no pointing.
- Moses's replies to today's asks.

## Resuming in a new container

The scratch folder does not survive a new container. What a session needs:

- **Tools of record:** `wip/2026-11-16/ship-7/tools/`:
  - `pipeline.sh`, `pipeline2.sh` and `ship.sh` (merge, store tools, round, line diff against live, checks, suite, gate, the one-commit ship and gh-pages following main);
  - `lines-diff.mjs` and `s2-keep.mjs`;
  - `flip-measure.mjs`.
- **More probes:** `wip/2026-11-16/the-four-cards/tools/`.
- **The round's outside inputs:** the lattice v12, the binyan ledger, the stems extension and the default-picks ledger come from the store, read only (`r2.mjs list|get`; never put). Their paths are in `pipeline.sh`'s environment lines; download them again into a fresh scratch.
- **After every ship:**
  - `node tools/check-nothing-unlanded-v1.mjs`;
  - poll the Pages deployment and the live check;
  - run the sha audit of gh-pages against main;
  - `gh-pages` follows `main` with the commit "gh-pages follows main".
