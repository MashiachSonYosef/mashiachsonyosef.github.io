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

## Trial 1 (06:28 to 07:06 UTC): all three lists landed, and what moved

`trial-1-lines-diff-against-live.json`, `trial-1-every-moved-group-by-cause.txt` (`tools/attribute-moves.mjs`).

**In the thirty-nine books no resting line moves.** Not one of 40 works' lines outside the Tikkunei Zohar differs from live.

**In the Tikkunei Zohar 1,276 lines move, in 43 spellings.** The rest does not reach that work (the lead, 15 November: it keeps its own rest until its work is done), so every returning row stands open there, and its line is the first reading of the pool as the store orders it. Two things happen:

- **158 bare words gain a line** (10 spellings). Right: «throne» (33 places), «how great» (56), «ruler» (15), «jurisdiction» (13), «in the manner of» (3), «bed», «jolting». Wrong for the passage: «wolf» (20; PanLex's Aramaic word, where the Zohar's is «of the father»), «queen» (10; Davidson's row under a spelling that is likely a slip for the word for queen), «proper name of a place» (6; a description, under a spelling that is likely a slip for Jebus).
- **1,118 lines change their reading** (33 spellings), and 1,111 of them by the ETCBC's rows alone. Its rows stood early in the catalog, so each came back at a low rank, and among readings of one year the lower rank leads. Better: «Elijah» for «Elihu» (29), «Isaiah» (50), «Abraham» (23), «I» for «mourn» (6), «life» for «+ age», «woe» for «Evi». Worse: «not» for «power» at 288 places, «Zaccur» for «remember» (21), «Paseah» for «lame» (10), «incurable» for «man» (8), «Uzzah» for «strong» (6), «Elath» for «a doe» (2).

| whose rows carry the new line | spellings | places |
|---|---|---|
| ETCBC | 30 | 1,111 |
| Davidson | 5 | 100 |
| the translation tables | 2 | 34 |
| PanLex | 2 | 24 |
| Harkavy | 2 | 4 |
| STEP's Expanded Strong | 2 | 3 |

**Davidson's rows on the cards of the books.** No line moves, but a dictionary that rests open shows its rows as pills. By a rough test 2,720 of his 12,487 returning rows (22%) are a description, a grammar note or a reference and not a reading: «a masculine proper name» (445 rows), «the proper name of a place», «according to others», «used only in the plural», «Joshua 10:3». Open, his rows would stand on the cards of 101,747 word places of the thirty-nine books (2,924 spellings), and at 48,084 of them at least one new pill would read so. None carries a name mark, so the names gate holds none back.

## What follows: the ship is cut to what moves nothing in the books and little in the Zohar

I had told the owner all 35 sources return in this ship, Davidson open and the other two Bible dictionaries shut. The trial says that is not careful enough: the owner's rule is «slowly add», and I had said that a description ending up as a visible line would be listed for them and not shipped. So:

- **Land now:** PanLex's Hebrew and Aramaic rows (3,956), the translation tables' (134) and Harkavy's (376): 16 sources, 4,466 rows, the first and third lists whole. In the books all three rest shut by their kind already. In the Zohar 62 places gain a line.
- **Held for the owner's word, each with what it would do:** Davidson's seventeen sources (12,487 rows), the ETCBC (4,246), STEP's Expanded Strong tags (1,431). The second list is proved and waits; `data/readmission-v1.json` names the nineteen sources with why. Each lands by one command once the owner says how it rests.

Everything built for the whole return stays: the gzipped pin, the hole a strike left, the re-admission, the headword door. Built in trial 1 and set aside until the held list lands: the kinds' resting entry for Bible dictionaries not yet among the twelve, and the ledger tool's word for a row two print steps meet on (`tools/for-later-two-print-steps.diff`).

**Trial 2** (from 07:14 UTC): the cut ship applied by one script (`tools/apply-12.sh`: the store 653,227 to 657,693 rows, every store step with nothing left to write), then the round and every line against live.

## Trial 2 (07:14 to 07:52 UTC): the cut ship, and exactly what moves

`trial-2-lines-diff-against-live.json`, `trial-2-every-moved-group-by-cause.txt`. One script applied it (`tools/apply-12.sh`): 16 sources re-admitted, 4,466 rows landed (4,302 at the hole the strike left, 9 whose hole another row holds now, 155 with no rank named), the store 653,227 to 657,693 rows, every store step with nothing left to write. Then the round whole.

**62 resting lines move, all in the Tikkunei Zohar, in six spellings.** In the thirty-nine books none.

| places | the line | whose row | read |
|---|---|---|---|
| 33 | bare to «throne» | the translation tables (Aramaic) | right |
| 20 | bare to «wolf» | PanLex (Aramaic) | the letters do spell the Aramaic word for a wolf; in the Zohar they are «of the father», a prefix and a word. The Zohar's prefix split is an open ruling (task 6), and until it is made a whole spelling reads as one word there, as it does at every other such place |
| 4 | «month» to «month» | PanLex | the credit alone |
| 3 | bare to «in the manner of» | Harkavy | right |
| 1 | bare to «jolting» | Harkavy | right |
| 1 | bare to «bed» | the translation tables | right |

## The checks, mended or new (each run on the trial tree)

- `check-landings-v1` G2 learns a list of holes (`tools/patch-06-check-landings-holes.py`): the struck-ranks record holds the line's rank for its source under its key; the row is at the hole, or another row stands there and the row is past the key's last typed hole. Before the mend it named exactly the 9 lines whose hole is taken.
- `check-language-admitted-v1` (`patch-07`): a source that stands re-admitted is judged by the languages its own source names, as the strike tool reads them; every other source by its label, as before. The strike's cumulative figures count the sources struck now with the re-admitted (33 and 16 are the 49).
- `check-readmission-v1`, new, four laws: R1 the record against the pin's lists; R2 the index (each entry as the record returns it; the struck and the re-admitted together the 49); R3 the admission's record; R4 every row of a returning source is a landed line's, so a source back for its listed rows alone carries no other (PanLex 3,956, the translation tables 134), and a struck or held source carries none. On the trial tree R3 failed, rightly: that tree's record was written before the tool listed a kept source as the strike tool does.
- `tools/strike-language-v1.mjs` keeps a re-admission (`patch-08`): run again it rebuilt its record without the re-admissions and wrote all 49 ids back into the index's struck list. Run dry after the mend: 162 sources to 162, 0 rows struck.
- The lane state and its check name the re-admitted beside the struck (`patch-10`).
- Passing unchanged on the trial tree: the store's continuity, the exact ranks, the fold landing, the ledgers' divisions and declarations, the years, the licenses, the made spaces, the words back, the kinds, the zones' receipts, the search.
