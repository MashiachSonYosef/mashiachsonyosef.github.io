# Ship 11c, the landings that need no ruling: v201, v200, v202's form rows (prepared, 20 November 2026 AD)

Page lane (Elijah). Begun in the sandbox (`S/s12w/sb`) while ship 11's second pass ran. Nothing here is in a tree that ships.

## The three lists (each fetched read-only and matched to its letter's hashes)

| list | relay | lines | what |
|---|---|---|---|
| `whole-renderings-v1` | v201 | 15 | Strong's two whole renderings whose halves are withheld («make (1 Kings 22:48 marg)» under 13 keys, «whereby (Psalm 45:8 (defective plural))» under 2), each at the rank of its record's other renderings |
| `call5-returns-v1` | v200 | 1,296 | call 5's rows whose words only another source held under the plain key, back under the plain key each with its own source (TAHOT 593, Hebrew Wiktionary's form tables 504, and others), and two of v188's lines reissued under the plain key |
| `bridge-form-rows-v1` | v202 | 167 | STEP's own rows under our text's spelling, for 220 places |

**v202's form rows name the five places names v2 moved** (`ship-11/SHIP-11.md` section 3): «tent/ his» for Genesis 13:3 (and 9:21, 12:8, 35:21), «multitude/ his» for Ezekiel 32:31 (and 31:18, 32:32, 39:11), «hands/ his» for Leviticus 9:22 and 16:21, «hands/ its» for Ezekiel 43:26. Those words are places where our text spells otherwise than the Leningrad text STEP follows, which is why no row of STEP's stood under our letters and MACULA's name led. After this landing each reads STEP's own words for the place.

## The tool (`tools/derive-landings-v1.mjs`, new; landings-rule-v1)

One pin for all such lists (`data/landings/PIN.json`, written by `tools/make-landings-pin.py`), in the order they land. Each list is derived on the store as it stands when its turn comes:

- a line whose own source already prints its words under its key is named as not landed; another source printing them is no hold (a source's records stay its own, the owner, 7 November);
- a line that names its rank lands there, after its own source's rows at that rank, and such rows must stand there;
- a line with no rank takes the highest rank under its key plus one, in the list's order (Moses's words in v200 and v202);
- the facts a line names (n, t, b) go with it.

Rehearsed on the sandbox's store for the first list: 15 land under 15 keys, all with their facts, none refused. The second and third refuse until the one before has landed, as they should.

## Still to build (item 1 is done in the sandbox)

1. **`strike-rows-v1`'s landing writes the facts its line names.** Today a landing writes none (which is why v188's landed rows waited for row entries v1.2).
2. **The tools that lay the lane's facts leave a landed row's facts to its landing.** `apply-row-entries-v1` gives a row landed since the ledger was read nothing, so it would take the landing's facts off again; it has to give such a row what its landing line names, read from the row-strikes record. The same holds for the name mark: none of these lines carries one, so a name among them stands unmarked until the next names list reads it (to say to Moses).
3. A check for the landings (each derived list is its pin's bytes, each landed line stands as a row with its facts, each line not landed is printed by its own source).
4. Then the round, the lines read one by one (the five above are expected), gate, suite, ship.

## Rehearsed to the end in a sandbox (20:45 UTC)

On a second copy of the store with ship 11's entries applied (`S/s13w/sb`; `tools/rehearse-landings.sh`), each list derived when its turn came and landed by `strike-rows-v1` with the facts patch (`tools/patch-strike-rows-facts.py`: a landing writes the facts its line names, and the row-strikes record keeps them with the row):

| list | lines | rows landed | keys | new keys | with facts | not landed |
|---|---|---|---|---|---|---|
| `whole-renderings-v1` (v201) | 15 | 15 | 15 | 0 | 15 | 0 |
| `call5-returns-v1` (v200) | 1,296 | 1,296 | 658 | 0 | 603 | 0 |
| `bridge-form-rows-v1` (v202) | 167 | 164 | 149 | 46 | 164 | 0 |

The store goes from 651,752 rows to 653,227 (+1,475). Moses's own counts hold: 658 plain keys for v200, 149 keys for v202.

**One rule the rehearsal added.** Three of v202's lines name words another of its lines already lands for the same source under the same key: «hands/ his» is one line for Leviticus 9:22 (STEP's tag H3027S) and another for Leviticus 16:21 (H3027G). The store holds one row of a source for a key and its words, and the landing counts a second as already held, so the second line's tag would have been lost and the row withheld by its letter at Leviticus 16:21. Such lines now land as one row carrying every line's facts and headwords, each once, in the lines' order, and the row names the lines it gathers. As landed in the sandbox: «hands/ his» at rank 36 under the letters of «his hand», with both tags; «tent/ his» at rank 16 with its four pointed forms.

## The entries tool leaves a landed row's entries to its landing (item 2, done in the sandbox, 21:00 UTC)

Measured first on the sandbox with the three lists landed: as the tool stood, it would have taken the entries off **782 rows** it had no line for (15 of v201, 603 of v200, 164 of v202: the landed rows of the fifteen sources the ledger reads). With `tools/patch-entries-landed.py` a row a round landed since the ledger or a list was read carries exactly what its landing named, read from the row-strikes record: the same run moves **0 rows**, and counts 782 landed rows carrying their landing's facts, every one with a number.

Still to build for this ship: a check for the landings; a new version of the strike rule's name, since a landing now writes facts; then the round. (The check's side of the clause is done, below.)

## The check follows, and a row brought back is its struck row's twin (22:30 UTC)

`tools/patch-check-entry-gate-landed.py` gives `check-entry-gate-v1` the tool's clause: a row landed since carries what its landing named (E2, E3, E4, E5, E16). Run on the sandbox it left one law red, the twin law under E3, and the fault was real:

- Call 5 struck a row under a key that ends in a maqaf, and the entries tool has always given such a row's entries to its twin: the row of its own source and words under the plain key. Until now a twin was a row the ledger has a line for. v200 lands 603 of the struck rows back under their plain keys, each with the facts it carried at the store v189 was read at (4d1357b26ca5). The check finds twins by walking the store, so it counted them (4,664 struck rows with a twin; the tool said 4,061), and at two of them the returned row carries fewer of STEP's letters than the ledger's line for the struck row gave:

| row | struck under | the ledger's line for the struck row | v200's facts |
|---|---|---|---|
| STEP's «under» | the key with the maqaf, rank 2 | H8478G (13 places), H8478K (2), H8478H (1) | t: H8478G, H8478H |
| STEP's «put» | the key with the maqaf, rank 2 | H5414Q (1), H5414H (1) | t: H5414Q |

- So a row landed back under the key a struck row's words stand under is that row's twin, and takes what the struck row's line alone said, as a twin with a line does (`tools/patch-landed-twin.py`, the tool and the check together). The two rows gain H8478K and H5414H; the pair is recorded in `followed.entries_given_to_a_twin` with `landed_since`. Without it «under» would be judged another entry's at the two places STEP tags H8478K.
- After it, on the sandbox (`check-entry-gate-in-the-sandbox.txt`): E1 to E5, E14 and E16 pass; 4,664 struck rows have a twin; 4 twins given entries (two with a line, as before, and these two). The page laws are skipped there by design (the sandbox holds no zones).
- For Moses: v200's facts at these two rows are the store's of 15 November, older than ledger v1.1's line. Nothing is asked; it is said so he can read it.

## The check for the landings (`tools/check-landings-v1.mjs`, new; 22:45 UTC)

Five laws under landings-rule-v1, run on the sandbox:

- **G1** the pin and its bytes: each list's rule, receipt and list, and the two lists derived from it. 15, 1,296 and 167 lines; 15, 1,296 and 164 rows land; none not landed.
- **G2** every line accounted for once: 1,478 lines made 1,475 rows, 3 lines gathered into the row of the same source and words, each row carrying its lines' facts and headwords.
- **G3** one round per list took its derived list whole, in the pin's order, one right after another (rounds 20, 21, 22 of the record).
- **G4** each landed line stands as one row under its key, at its rank, with the line's words, definition, year, headwords and entries, and what a struck row's line gave it as that row's twin: 1,475 rows stand, 782 carry entries, 2 given a struck row's entries. A row a later round takes or moves is followed by the record and counted.
- **G5** a line not landed is printed by its own source (none today).

Proved able to fail: on a copy of the store with three landed rows spoiled (one's number changed, one's headword dropped, one taken out) G4 names each of the three.

(What was still to build then is built: the next section.)

## The whole sequence, run on a fresh copy of the ship tree (22:37 UTC)

One script applies the ship to a tree in order (`tools/apply-11c.sh`; the store steps in `tools/store-steps-11c.sh`; its log on a fresh copy of ship 11's tree is `the-whole-sequence-on-a-fresh-copy.txt`):

1. **The tools.** The patches above; `derive-landings-v1` and `check-landings-v1` (new); the strike rule's next name, **version 8**: «a landing writes the entries its line names» (`tools/patch-strike-rule-v8.py`: the tool's rule id, header and summary, and the GUARDS lines of the five checks that guard the rule; the words-back round of 15 November keeps version 7, the version it ran under).
2. **The pin and the three landings**, each derived on the store it meets: 15, 1,296 and 164 rows; 651,752 → 653,227 rows.
3. **The store steps after a landing**, in the order ships 5 and 6 set:
   - the ledgers' divisions: 46 slots move (the landed rows' cuts);
   - the sources' years: none moves (held, not written);
   - the made spaces: 5 rows take their closes (BDB's rows among the returns);
   - the own pointing: 3 rows of English Wiktionary's take their records' pointed forms;
   - the entries: the 4 twins as above, nothing else;
   - the names, the sense openings: nothing moves, each records the rounds since;
   - UBS's collocations: the category derived again is the pin's bytes (no name moved, no row of UBS's landed), then laid: nothing moves.
   Each tool run once more dry has nothing left to write.

**Two things the fresh run found.**

- **The made spaces' second road refused the returns.** Its counts are the receipt's (read at «4d1357b26ca5+v188») less the rows gone since and the lines not landed; a row landed since by any other list shut the road («a row the store the receipt read never held»). Eight of v200's returns are BDB's: rows the receipt's store did hold, under the key with the maqaf, struck by call 5 and now back. The road now counts a row another list landed since as a row more, its texts gaining it as a struck row's texts lose it (`tools/patch-second-road-back.py`: the road, the tool and the check together). With it the tool holds every line and the check's M3 to M5 pass.
- **The landings check read the headwords too strictly.** The own-pointing rule lays a record's pointed forms after a bare row's own headwords; G4 now reads a row's headwords as they stood before that rule (`headwordsBeforeOwnPointing`, as the check of v188's landing does).

On the fresh copy afterward: `check-landings-v1`, `check-store-continuity-v1`, `check-fold-strike-landing-v1`, `check-own-pointing-v1` pass, and every store law of `check-entry-gate-v1`, `check-made-spaces-v1`, `check-sense-openings-v1`, `check-ledger-divisions-v1` and `check-names-gate-v1`. What stays red there are page laws only: the copy holds no zones and no door.

**Left for the real tree, after ship 11 is out:** PIPELINE.md's paragraph; the round; every moved line read (the five names-v2 places are expected to read STEP's words); the gate, with a class for the landings if a first card moves; the suite; the ship.

## On the real tree: the round, and every resting line against live (21 November, 00:14 UTC)

Run as `tools/pipeline-11c.sh` (pass `pipe4`) on branch `ship11c` from ship 11 as shipped (98f4c8a605); live for the comparison is ship 11. The store side ended on the same store as both rehearsals (9d3491c7292a after the made spaces and the own pointing, 88fec6d59737 after the entries). The round, the form-of record, the lines, the chain books, the door, the switches page: all ended clean.

**Seventeen entries move in 40 works** (`lines-diff-against-live.json`). Every one is by a row of v202, STEP's own row under our text's spelling; v200's and v201's rows move no resting line. Read on the two stores, and the Bible places asked of both pages:

Fourteen read better.

| place | was | now | the landed row |
|---|---|---|---|
| 2 Samuel 11:24, word 1 | «and + they showed» | «and + they shot arrows» | STEP's row for this very place (H3384A): the archers shot |
| Jeremiah 51:9, word 1 | «cure» (Strong's) | «we healed» | STEP's row for this place (H7495) |
| Ezekiel 27:6, word 11 | «Chittim» (Strong's) | «Kittim» | STEP's row for this place (H3794H); ship 11 said it would come |
| Tikkunei Zohar, ten places of the Aramaic «the prophets» (31b twice, 32a three times, 32b, 54b, 74b, 107a, 116a) | bare | «prophets + the» | STEP's row from Ezra 5:1 (H5029) |
| Tikkunei Zohar 144a, «the winter» | bare | «the + winter» | STEP's row from Song of Songs 2:11 (H5638) |

Three read a neighbor's wording, and are **known**:

| place | was | now |
|---|---|---|
| Daniel 4:21, word 10 («upon my lord the king») | «lord + my» | «O lord + my» |
| 1 Samuel 26:7, word 15 | «[the] place of head + his» | «[is the] place of head + his» |
| 1 Samuel 26:16, word 30 | «[was the] place of head + his» | «[is the] place of head + his» |

Why. At these places our text spells the word otherwise than the Leningrad text STEP follows, the lattice has no reading of the place, and no row of STEP's stood under our spelling. The line was bare, so the page printed STEP's own words for the place (the owner's question 2 of 14 November: STEP's own pick where the line is bare). v202 lands STEP's rows under our spelling: for Daniel two rows of one entry and one pointing («O lord/ my» for 4:16, «lord/ my» for 4:21), for 1 Samuel three (26:11, 26:7, 26:16). The line is no longer bare, so the fill no longer prints, and the first row by rank leads at each of the sibling places. The card holds both pills, and the right one is a press away. The same entry, the same word, STEP's own rendering of it two verses off.

**What the same measure showed on live** (`tools/measure-steps-own-words.py`, `steps-own-words-against-the-line.txt`). Of the 1,021 places where STEP's own words may stand, 785 are call 4's (STEP's reading stands whatever the line is). At the other 236 the line is STEP's pick at 118, another of STEP's own rows at 62 (60 on live before this ship), and another source's row at 56 (58 on live). The 62 are the same class as the three: Leviticus 9:22 reads «hand + his» where STEP reads «hands/ his»; Deuteronomy 7:9 «commandment + his» for «commandments/ his»; 2 Samuel 22:23 «plan + its» for «judgments/ his»; Genesis 13:3 «tent + towards» for «tent/ his». So the landing by itself does not make these places read STEP's reading, which I had expected of the five places ship 11's names moved: the row is under the key now, and an older row of STEP's still outranks it.

**The mend is the next ship's, and it is the corpus lane's own list.** v202 names these places (1,173 where our text spells a word otherwise) and gives STEP's pieces cut onto our letters at 1,035 of them. With the place's own pieces landed, the line reads the place's own reading, as it does everywhere the lattice has one. That is one ship with the pieces; it mends the three above and the sixty that were there before.

