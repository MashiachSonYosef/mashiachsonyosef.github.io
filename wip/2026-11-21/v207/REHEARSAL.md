# Ship 12, relay v207: the rehearsal (21 November 2026, from 06:15 UTC)

Page lane (Elijah). A trial on a copy of ship 11d as shipped (340cff8e3b; scratch tree `s11`, branch `rehearse12`). Nothing here is shipped. The plan is `PLAN.md`; this is what building it found.

## What moves at rest, measured before anything was built

`tools/measure-lines-reach.py`: the three lists against the zones as shipped. The returning rows stand under keys of many words, and almost every such key has a line today:

| work | places its keys reach | keys with no line today |
|---|---|---|
| Davidson | 127,197 | 12 work-and-key pairs (109 places) |
| ETCBC | 96,449 | 0 |
| STEP's Expanded Strong | 53,527 | 0 |
| PanLex | 85,975 | 4 pairs (35 places) |
| Harkavy | 3,269 | 3 pairs (5 places) |
| the translation tables | 379 | 2 pairs (34 places) |

So at rest only about twenty spellings can gain a line, some of them in the Tikkunei Zohar (which rests on every source): «queen», «throne», «bed», «jolting» there; in the thirty-nine books a handful of Davidson's, among them «prefixed masculine proper name» at 2 Chronicles and «proper name of a place» at 1 Chronicles. Those are read one by one after the round. The returning rows carry no wording year, so under a key that has a dated row they do not lead.

**Davidson today is 85 rows.** His one source that survived the strike (M97) serves 85 rows; the seventeen that return bring 12,487. He is one of the owner's twelve, so by the ruling they rest open.

## Built in the trial tree, in order

1. **A pinned list may be kept gzipped** (`tools/pinned-v1.mjs`): weighed as the list's own bytes, the figures the lane's letter gives. The three lists are 38 MB raw and 2.3 MB kept so. Their sha256 are the letter's.
2. **The hole a strike left** (`tools/derive-landings-v1.mjs`, `a_named_rank_is` in the pin): the struck-ranks record must hold the rank for that source under that key; the row lands there where no row stands at it. A line with no hole to take stands after the last row and the last typed hole of its key.
   - **One departure from the lane's words, to put to Moses.** The letter says a null rank takes «the highest served rank under the key plus one». Read so, six null-rank lines of the first list took holes that later lines of the same list name (a hole past the key's last served row). A hole by strike is kept for the row that left it, so here a row with no hole stands after the key's last typed hole too, and every line with a free hole gets it.
3. **The re-admission** (`tools/readmit-sources-v1.mjs`, `data/readmission-v1.json`, readmission-rule-v1): 35 index entries back as the store held them, each with the languages its own source names (the way back the strike tool itself names), no wording year, and how it returns: 31 whole, 4 for their listed rows alone (PanLex's two, the translation tables' two). The strike's own figures stand: 49 sources were struck, 14 are struck now, 35 stand re-admitted.
4. **The three landings**, exactly the lane's counts:

| list | lines | at the hole | hole taken now | no rank named | keys new to the store |
|---|---|---|---|---|---|
| own language | 4,090 | 3,961 | 7 | 122 | 73 |
| Bible dictionaries | 18,164 | 15,679 | 116 | 2,369 | 142 |
| Harkavy | 376 | 341 | 2 | 33 | 41 |

   The store goes from 653,227 rows to 675,857. No line is left unlanded and none is gathered.
5. **The kinds record** (version 2026-11-21a): Davidson's seventeen keys join his family; PanLex's two and the translation tables' one join theirs; three new families (the ETCBC's glosses, STEP's Expanded Strong tags, Harkavy). A fifth resting entry holds the two new Bible dictionaries shut until the owner adds them to the twelve. Shut whole: 18 of the 35 returning ids. Open: Davidson's 17.
6. **The store steps after a landing**, each run and then run dry with nothing left to write.

## Found on the way

- **ETCBC and STEP's Expanded Strong were never wholly gone.** Their rows for joined words are served today from the span store under ids of its own (M199 and M197: 149 and 185 routes), and the corpus lane declared a punctuation ledger for each then (relays v160, v159). A ledger is its source's, by key, so the returning rows (M8, M51) stand under those ledgers without being asked.
- **1,314 returning rows are not covered by those two ledgers.** The declarations were read on the span rows; the returning rows carry shapes they do not name. An uncovered row stands whole and the receipt names it. To ask of Moses: v159 and v160 read again over M51 and M8.
- **Two rows meet two of the owner's answers at once.** «(Mount )Sirion (KJV: Sion)» and «(Mount )Shepher (KJV: mount Shapher)» carry both the optional word (branch B02: print both forms) and the King James form (B03: print the name alone). The ledger tool refuses two print steps on one row, rightly, since no declaration says how they compose. The manifest may now say, for one source, that such a row prints as written (`where_two_print_steps_meet`); both rows do, and the receipt names them. To ask of Moses: a step for the two together.
- **The other 32 returning sources have no ledger.** The manifest says why for each (`excluded`): the lane has declared none, so each row is one reading as its landing line gives it.
- **No returning row carries a name mark.** Names v2 was read before they returned. Davidson's rows include «a masculine proper name» (445 rows) and its kin. This was ask C of my letter of 20 November and is not answered yet. It matters only where such a row could lead a line: read after the round.
- **The headword door** (`tools/project-lattice-v12-v1.mjs`): a card of a source that returned for its listed rows alone is the headword's line only where a served row of that source speaks the card's words. On the thirty-nine books those four sources rest shut anyway, so nothing moves by it today; it holds for a book outside the rest.

## Running now

The round whole on the trial tree, then every resting line against live (`tools/pipeline-12.sh`, pass `trial1`).

## Still to build before a ship

The checks that hold all this: the landings' check (holes, gzipped lists), a check of the re-admission, the language admission's and the lane state's (their counts tie 49 struck to the list's length), the ledgers' (uncovered rows, the two rows under two steps), the kinds'. `tools/strike-language-v1.mjs` must keep a re-admitted source (its repair path writes the record's 49 back today). Then the gate's expectations for whatever moves, the suite, and the ship tree.
