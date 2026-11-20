# Ship 11b, the entries: row entries v1.2 (v197) and the two entry ledgers (v203, v204)

Page lane (Elijah), 20 November 2026 AD. Prepared in a sandbox (`S/s12w/sb`: a copy of ship 11a's store and tools) while ship 11a's checks ran. Nothing here is in a tree that ships yet.

## What lands

1. **Row entries v1.2 (relay v197)** takes the place of v1.1 as the pinned ledger. It is v1.1's rule read on the store as served on 20 November (store 54416ff5785b): 380,633 rows of the fifteen sources, each at the key and rank where it stands. Against the store, 2,843 rows take other facts: 2,829 rows relay v188 landed, which carried none, and 14 rows call 5 re-keyed.
2. **The entry ledger of English Wiktionary (v203)**: 54,261 lines; 53,601 rows of its eight m ids take the numbers (n) of the Bible dictionaries' entries their own pointed head form and kind of word meet.
3. **The entry ledger of Classical Hebrew Words and Hebrew Wiktionary (v204)**: 9,192 lines; 9,156 rows of its 76 m ids take their numbers.

Not landed, and why: v203's root branch (27,806 rows; Moses's call, a root is not a word) and v204's held list (3,578 rows; the source holds more words of a spelling than the index).

## The page lane's call: the numbers land; STEP's letters and BDB's entries from the lists do not, yet

Moses, v203: «The gate as wired reads `t` on TAHOT and TBESH rows only. Here `t` is TBESH's own lettered entries for these rows too. Whether the gate reads it here is yours.»

- The gate reads `t` on any row that carries it. The pin's two partings (ruling 6 of 13 November) name the sources whose rows each reads: STEP's letters on TAHOT's and TBESH's rows, BDB's own entries on BDB's rows. `check-entry-gate-v1` E2 holds the store to that.
- Measured before deciding (`tools/measure-t.py`, on the store): of v203's 16,273 lines that give `t`, **4,380 give fewer letters than STEP's own rows carry for the same numbers**, so the letters would withhold those rows at places the number alone keeps them. The cases are mixed. English Wiktionary's «father» would carry H1G alone, and STEP also tags H1H («(Huram)-abi») and H1I («father of», a part of a name): there the common word would be withheld at a place whose word is, in letters and sense, «father of». «To pass» would carry five letters of H5674 and not H5674G («(Valley of) the Travelers»): there the parting is right.
- So the lists land `n`, which is what the owner agreed on 16 November («every row gets the entry it belongs to») and what the gate itself reads. `t` (16,273 lines) and `b` (62,284 lines) are counted in the store's record as not landed. They can land later with one line of the pin, once the partings are ruled wider or the letters are measured place by place.

## How the tool changed (`tools/apply-row-entries-v1.mjs`; patches in `tools/`)

- **The rows struck before the ledger was read.** v1.2 holds no line for a row a round struck before it was read, and the follower finds no round since, so the clause that gives a struck row's entries to its twin had nothing to read. The pin keeps Moses's `struck-lines-v1.2.jsonl` (4,664 lines), and the twin clause reads them. BDB's «from» (H4480) stays on the two rows it was given to.
- **Facts lists of further sources** (`pin.lists`, named with `--list`): read only if they are the bytes the pin names; a line is followed through the row-strikes record from the store its list was read at; only the facts the pin entry lands are written; a row of a list's source with no line carries nothing.
- **A source the ledger reads and gives nothing may be read by a list.** Classical Hebrew Words (M23) is one of the fifteen: it names no entry of its own, so every line of the ledger gives its rows nothing, and v204 gives 1,116 of them an entry by the join. Where a line of the ledger gives a row of a list's source any fact, the run is refused.

## Rehearsed and run in the sandbox

`rehearsal-in-a-sandbox.txt`. 380,633 rows of the fifteen sources, every line met, none unexplained; 4,061 struck rows with a twin, the same 2 given entries as today; **65,600 rows move: 2,843 of the ledger's (exactly Moses's list of moves), 53,601 and 9,156 of the lists'**. Run for real on the sandbox's store: 15909b6c523c → 739d7f54020c; a second run moves nothing. The check's store laws (E1 to E5, E14, and E16, new) pass there against the ledger and both lists.

## Still to do (as written before the pass; see below for what was done)

The projector names the lists in each zone's sidecar (so a zone projected before a list landed is known stale); the whole round; every resting line against ship 11a read one by one (v197's landed rows are of the twelve that rest open, so lines will move: Moses counts 78,011 flips at 56,785 places, most of them a landed name withheld where the word is another entry); gate; suite; ship.

## The entries pass on the ship tree (pass 3, 20:57 to 21:36 UTC)

On top of the names pass. The store step: 65,600 rows moved, as rehearsed (store 15909b6c523c, the names', moved on). Every step clean (round 1,096 s, lines 217 s, chain books 956 s).

### Every resting line against the names pass: six entries move, each read on the store and on the page

`lines-diff-against-the-names-pass.json`; the page asked with `../tools/places-probe.mjs`. Against live the ship moves twelve: these six and the names' six.

| place | word | before | now | why |
|---|---|---|---|---|
| Ezekiel 9:4, word 3 | to him | «behold» (Strong's) | «to + him» (STEP) | the rows «behold» under these letters are rows v188 landed; they carried no entry, and v1.2 gives them H431 (the Aramaic «behold»). The place is H413, so they are of another entry and are withheld; the line reads STEP's pieces |
| 1 Samuel 22:13, word 2 | to him | «behold» | «to + him» | the same rows |
| Ezekiel 40:34, word 6 | its pillars | «behold» | «pillars + its» | the same rows; the place is H352 |
| Ezekiel 40:36, word 2 | its pillars | «behold» | «pillars + its» | the same rows |
| Ezekiel 12:14, word 4 | his help | «enclosure» (BDB) | «help + his» (STEP) | BDB's landed «enclosure» takes H5835; the place is the word for help |
| Psalm 9:1, word 2 | the heading's «al» | «height» (BDB) | «alumoth» (STEP) | BDB's landed «height» takes H5920 and H5921; STEP reads the heading's two words as one, H5961, and that is the place's entry. STEP's own reading of the place stands where another word's noun stood; the two words after it still read the lexical index's «‘To die for the son’», so the heading is read by two sources that part it differently. Ship 10b's subject |

**Four of the six are ship 9's wrong lines.** Ship 9's record named «behold» at the places of this word as lines that went wrong (Ezekiel 9:4, 40:34, 40:36, 1 Samuel 22:13; the intake notes correct what was right before). All four read right now, by the entry gate, before v202's form rows land: «to + him» at the two places of «to him», «pillars + its» at the two of the pillars. Each card says what it holds back («21 of another entry than H413, withheld»).

### The nearest checks: all ten pass

`check-entry-gate-v1` with 25 laws (E16 and its two lists line by line among them), `check-dictionary-kinds-v1`, `check-form-of-v1`, `check-default-picks-v1`, the names checks and the three store checks.

### The gate: six first cards each gained one pill, and the gate learned why

`gate-diff-before-the-entries-class.txt`. Lines: 30,945 the same. Cards: six differ, each by one pill the old card lacks:

- Job 1:1 word 1 («a man»), twice (the gate reads the book's first cards on both of its sampled pages): **«anyone»**, TAHOT's row call 5 moved from the key with a maqaf. Under v1.1 it kept the letter of the place it came from (H376I) and was withheld by letter; v1.2 reads it at its own key and gives it H376G too. Moses's list names it: kept at 1,045 places.
- Zephaniah 1:1 word 1 («the word of»), twice: **«promised»**, MACULA's landed row; it carried no entry, so its pointing withheld it; with H1696 and H1697 it is of the place's own entry and stands whatever its points.
- Zephaniah 1:1 word 2 (the Name), twice: **«YHWH»**, the SDBH's landed row, the same way.

All three are rows of Moses's list of moves, each now of its place's own entry. The gate takes the entries' receipt as an expectation (`tools/patch-gate-entries.py`; `--expect data/row-entries-receipt-v1.json`): a card may gain a pill that a row of the pinned list of moves carries where the gate's own verdict on that row, with the new facts at the word's tags, is «this entry»; it may lose a pill, and a line may move, where every carrying row is a row of the list now of another entry. Running again with it.
