# Call 3: a run of several words rests word by word (ship 5). Design and measures

In this report S means `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`. Every script and output is under `S/v77/ship56-design/call3-runs/`; full paths are listed at the end.

What I did and did not touch:
- I wrote nothing outside that folder.
- I ran no git command, no round, no bake and no browser. I used light node and python reads only, under `nice`.
- Every `zone.html:N` is a line of the combined ship, `S/ship/reader/zone.html`, which is the code ship 5 builds on.

What the measures read:
- **The live build.** The records in `S/v76/live-records` (40 books). Each file is byte-identical to `S/old/reader/data/resting-lines/`, the checkout of main 46bbbf7d50. I checked all 40 by sha256. The zones, the span store and the chain books come from that same checkout.
- **The combined ship.** I read its own tree as its running round left it:
  - the records in `S/ship/reader/data/resting-lines`, written 17:55:42 to 17:58:31 UTC;
  - its `data/default-picks-receipt-v1.json`, written 17:59 UTC.
- The build will re-measure on its own tree.

## The answer in brief

1. **v181's list is exactly what the live records hold.** It has 2,177 lines over 4,402 words, and every line matches a record line by place, text and credit.
2. **Every one of those lines is a span-store line.** At rest, no whole form, run card or HUD run draws a line over several words.
3. **The kinds already move 521 of them in the combined ship.** 502 change to English Wiktionary's row, and 19 fall to their words. That leaves 2,158 lines over 4,363 words, which is also the ship's own receipt.
4. **Each word's own line under the page's existing rule is STEP's reading at the place.** This holds at 4,393 of the 4,402 words, and each one matches v181's STEP reading letter for letter. 9 words, in 6 runs, have no reading of their own at the place.
5. **The rule this design proposes.** The span line yields to the words wherever every word has the place's own reading. The page already applies this test to whole forms (zone.html:12186).
   - On the combined ship with call 4, this moves 2,153 runs over 4,353 words.
   - It holds 5 runs (10 words) with put-back 2.
6. **The cards change too.** Today a run word's card opens on the whole run. In the 12 chain books that is 338 cards, and 64 of them sit where the line already reads word by word. Under call 3 the card opens on the word pressed, and the joined reading is one press away.

## 1. v181's list

**Where it was.** The list was in neither `S/dl-v184` (only the letter is there) nor `S/dl-v195`. I fetched it read-only from the lane's store:
- key `v2/ledgers/all/audit-lines-and-pills/lines-and-pills-v1/lines-over-several-words-v1.jsonl`;
- saved to `call3-runs/dl-v181/…`;
- 384,463 bytes, sha256 `12228dc4e7ab9566f3c809500ccc63aeece0f0244480644fc2a779509b0d778a`, the same as FOR-ELIJAH-v181.md:65.

Fetched beside it, each matching the letter:
- RULE.md, `5e6bd1e3…` (:61);
- receipt-v1.json, `88e71c12…` (:63);
- verify-receipt-v1.json, `f72383f8…` (:69);
- the builder, `fa84ee6c…` (:62). I read it and did not run it.

The store's copy of the letter is byte-identical to the one in dl-v184 (sha256 `83e7c293…`).

**What a line says.** Example: `{"book":"genesis","first":"1:8:9","last":"1:8:10","words":["י֥וֹם","שֵׁנִֽי"],"line":"Monday","credit":"M13","step":["a day","second"]}`.
- `first` and `last` are chapter:verse:word. Words count from 1, and scribal marks are not counted (lines-and-pills RULE.md:11).
- `words` is the Hebrew of each word covered.
- `line` is the text the page drew over them at rest, with its chip taken off, read from the records (RULE.md:9).
- `credit` is the source the chip names.
- `step` is STEP's Translation of each covered word. It comes from the TAHOT lines the numbering ties to the place, with pieces joined by "/" (RULE.md:12, :26; letter :26).

**Counts.** From measure-runs-v1.mjs, written to `out/summary-v1.json`:
- 2,177 lines over 4,402 words, in 37 books;
- 2,139 lines cover 2 words, 30 cover 3, 6 cover 4 and 2 cover 5;
- by credit: M13 1,097 · M2 514 · M17 331 · M46 83 · M19 64 · M18 24 · M9 18 · M33 17 · M60 14 · M64 6 · M199 5 · M197 3 · M57 1.

The letter says 456 lines print STEP's own words letter for letter (letter :23). I re-derived 456 when sign-only pieces are set aside, and 455 when they are kept (letters-v181-v1.py).

## 2. The page's runs today

### Where a line over several words comes from

| What could draw one | How it is laid | At rest |
|---|---|---|
| **The span store**: `data/span-store/<book>.json`, span-store v2.1 (relay v85), baked by tools/bake-span-store-v2.mjs. Its index holds 2,845 places, 462 ink keys and 1,698 rows. | Fetched for a book its index lists (4778). Its keys load into SPAN_BY_KEY (4779-4780). spanCardsOf lays each place as a cell where the words' letters, joined by the ink's gaps, equal the key (4781-4807). This happens whatever the runs switch says (4839-4843). layRunLanes gives each word the longest place over it (4713-4765). The section's build (17949-17966) and appendWord (13508-13563) join the place's words, plus a paseq between them (bridgeAt 17958), into one cell. | **The only source of resting runs.** |
| **Maqaf chains**, built from the text by appendWord | The cell is keyed by its words' keys joined by the maqaf | Its line reads a whole form from the baked table only where some word lacks the place's reading (12186-12205). This happens 0 times at rest. |
| **Run cards** (`data/run-cards`) and **HUD runs**, including the toggle lattice (`data/hud-runs`, `data/hud-toggles`) | HUD_LANES.lay (4826-4849) | **Not laid at rest.** The runs switch rests off (3716-3722), and `if (runsPref === "off") cards = []` (4838). Line 4843 passes withRunCards = false, because hudSetFor (4205-4210) names a set for each of the 39 books listed in hud-toggles/index.json. |
| **The word lattice** (tools/project-lattice-v12-v1.mjs) and the zone's `spans` field | Per word only: `spans` is one word's division into pieces, for example בראשית → ב + ראשית | No runs |

**How the page draws a run's line.** refreshJoinGloss (12130-12276) tries these in order:
1. A ruling on the run's whole form: that line, with one chip (12147-12158).
2. **The span store's line** (12165-12185). It takes the first row that spanRowsOn keeps (4297): not switched off, and since the kinds build, not resting shut. That row is drawn as one `.g` line with `data-span`, one chip and one blob. This is the store's instruction I2: "one line, one blob and one card over all its words".
3. A whole form, but only where not every word has the place's reading (12186).
4. Otherwise, the words' own lines as parts (12206-12276). Each word's line sits in its own cell under the word, with its own chip. A "+" stands between cells but not beside a hidden sign's gap. A part that is only a sign is drawn as a gap, unless every part is one (12238-12244). Each part gets its own blob.

**The records, the default picks and the chain books.**
- tools/resting-lines-v1.mjs:104-112 keeps a whole line as one unit `[first entry, entries, text, credit]`, and a word-by-word cell as one unit per word. tools/bake-resting-lines-v1.mjs:137 counts the first kind as `lines_over_more_than_one_word`.
- tools/bake-default-picks-v1.mjs:953-969 counts those units for the receipt's `runs_read_whole` (:1199-1201, "under STEP the run's own line stands").
- On the page, runTakesDefault (6160-6164) lets a source other than STEP take a run only where it reads every word.
- The chain books press each word and record the card the page opens, along with `over` (tools/card-readings-v1.mjs:179, :401). The press handler (14413-14427) decides which card that is:
  - a maqaf chain whose line reads word by word opens the pressed word's own card (chainReadsWhole 8743-8762; `__openWord` 14262-14288);
  - every other run opens the run's own card (openNamedRun 14233-14254), standing on the whole run wherever a span row exists (9836-9842).

**Measured: what the page does with every span place today.** measure-span-places-v1.mjs follows spanCardsOf, layRunLanes, the section build, appendWord and refreshJoinGloss over the live data. Every cell it says reads whole is a record line over the same entries, with the same text and credit: 0 faults, and exactly 2,177 such cells. Of the 2,845 places:

| What the page does with the place | Places |
|---|---|
| Sits in a cell of its own and reads one line: **the runs** | 2,177 |
| Sits in a larger cell and **already reads word by word** | 640 |
| · the larger cell is keyed by its words with spaces, because the place joined a maqaf chain beside it (example: II Samuel 10:6) | 555 |
| · the cell is keyed by a maqaf chain | 79 |
| · the cell has no key | 6 |
| Is a rung inside a longer place's cell (I3) | 23 |
| Is not laid, because it overlaps a laid place | 5 |

measure-runs-v1.mjs classes the 2,177 record lines the same way: 2,177 span-store lines, 0 whole forms, 0 other.

**Shape of the 2,177 runs** (from the same output):
- 1,002 are maqaf chains whose span key is the chain's own key;
- 1,157 are spaced;
- 18 have mixed gaps, for example «פנים אל־פנים»;
- 41 runs each hold one bridged paseq. 27 of them are «all around» in Ezekiel (סָבִיב ׀ סָבִיב).

### What the kinds build did

**In the code.** spanRowsOn (4293-4297) drops any span row whose dictionary rests shut, whether the kinds switch is open or shut (DESIGN.md:202).
- The line then reads the first open row.
- A run with no open row falls through to its words, and chainReadsWhole (8753) opens the pressed word's own card.
- spanCardsOf still lays the cell. So the integrator's "no longer laid" (integrator-notes.txt:34-35) means the run's line and card, not the cell.
- On a card, shut span rows are kept out of the pool (8295-8297).

**Measured.** measure-runs-v1.mjs applies the ship's own kinds record (`S/ship/reader/data/dictionary-kinds-v1.json`, sha256 `53f799f0…`) through `tools/dictionary-kinds-v1.mjs`. Of the 2,177 live runs:
- **1,656 are unchanged.**
- **502 move to the next open row.** All of them go from Wikidata (M2) to English Wiktionary (M13):
  - 370 «the Children of Israel, Israelites, Jews»;
  - 98 «son of man; human being (literally, son of Adam)»;
  - 21 «commoners, laymen»;
  - the rest are smaller groups.
- **19 fall to their words**, 39 words in all: 12 Wikidata, 6 Lexibank, 1 OMW. Examples: «Mount Zion» 7 times, «EVERYWHERE» 4 times.

**Checked against the ship's own records.** compare-ship-runs-v1.mjs compares them with the live records:
- 1,656 runs are the same;
- 502 changed text and credit;
- 19 appear only in the live records;
- 0 appear only in the ship's.

So the read words and the store round moved no run line. The ship's receipt says `run_lines` 2,158 and `words` 4,363. This matches DESIGN.md:394-396 (521 = 502 + 19). The integrator's eight-book rehearsal saw 7 of these 19 (integrator-notes.txt:31-32).

## 3. The design

**The rule.** A run's joined reading stays on the line only where some word of the run has no reading of its own at the place. Where every word has one, the run reads its words' own lines. The joined reading is then the run's whole rung, one press away on the card of any of its words.

The rules that decide it:
- **Question 8, taken.** «each word of a run of several words shows its own reading, and the joined reading («Monday», «the Jewish people») is a press away» (OWNER-QUESTIONS-2026-11-14.md:22; the owner's note at :5).
- **Open question #90, as it was put** (SECOND-LOOK-2026-11-14.md:34): «on a run of joined words where every word has its own place reading, should the place's reading lead, as it does on a single word?» The rule's test is exactly that question's condition.
- **The calls' own rule** (calls-v1/RULE.md:15, :84; FOR-ELIJAH-v189.md:88): «STEP's reading of each word leads and the joined reading is a press away».
- **«An example names a class»** (each-dictionary-as-a-category/THE-OWNERS-WORDS-2026-11-15.md:14). The rule runs over every run of the 39 books. It also covers HUD runs and run cards once a reader lays them. It is not a list.
- **«A class that can be argued is walked: kept a press away»** (HOW-THE-OWNER-WANTS-TO-WORK-2026-11-15.md:24; word 5 at :13). Nothing leaves the store, the span store or the card.
- **No claims.** STEP's reading at the place is "STEP's reading made at that place" (v181 RULE.md:9). A joined row is a dictionary's reading of the letters. The line prints the first, and the card offers the second under its own source.

**Each word's own line.** It is exactly the line lineUnder (13653) gives the word standing alone.
- Under STEP at rest, the default layer answers only at STEP's leaves and at STEP's words where today's line is bare (6085-6105).
- Everywhere else the place's own reading answers: placeLine (13632-13648). That is TAHOT's pieces at the word, each credited to the source that wrote it (here PIECE:TAHOT). It is drawn by placeShown (3561-3568), then as a part of the run's line (12206-12276).
- **Measured.**
  - 4,393 words have a place reading, all PIECE:TAHOT; 9 have none.
  - My model reproduces all 299,933 one-word place lines in the live records, text and credit, with 0 differences.
  - Its 4,393 lines equal v181's STEP reading of the same word, by letters with signs set aside: 4,393 equal, 0 differ (compare-step-v1.py).
  - The pieces of all 4,402 words are identical in the live and the combined ship's zones (own-lines-ship-v1.py).
- These are the place's pieces, not STEP's ledger words, so PLAN-MERGED §0.1 #1 still holds at runs.

**Under MACULA, UBS or BDB.** Each word reads lineUnder under that source. The clause that keeps a reading written across two words together stays in force (6110-6157). 412 of the runs that fall carry such a reading, for example «there-» «-fore» and «Beth-» «-el» (summarize-call3-v1.py).
- runTakesDefault (6160) then governs only the held runs.
- This is where PLAN-MERGED §8 call 3 (PLAN-MERGED.md:718-720) is superseded (LANDING-PLAN.md:213).
- On the ship's receipt, the runs a source reads at some words but not all are: MACULA 144, UBS 739, BDB 454. Under this design those runs mix sources word by word. How many words that is was not measured.

**The held class** (5 runs and 10 words with call 4; 6 runs and 12 words without):

| Run | Line it keeps | Source |
|---|---|---|
| Daniel 1:13:8-9 | «food» | SDBH |
| Daniel 1:15:14-15 | «food» | SDBH |
| Jeremiah 39:3:9-10 | «Nergal-sar-ezer» | TBESH |
| Jeremiah 39:3:17-18 | «Nergal-sar-ezer» | TBESH |
| Song of Songs 6:12:6-7 | «Amminadib» | TBESH |

- **Why they cannot fall yet.** v181 has STEP's reading here, but not one per word. It gives «[the] delicaci[es] of» for both words at Daniel and «people of/-/prince» for both at Song of Songs 6:12. At Jeremiah STEP's word is «Shar- | ezer», which belongs to call 4's « | » class.
- **What falling would print.** The words would read rows found by letters, not readings made at the place:
  - at Daniel, «morsel» + «spoil (from the margin for 957.)», both Strong's, from the ship's lattice leaders;
  - at Song of Songs 6:12, «Ben-ammi» + «noble».
- **They wait with put-back 2.** II Samuel 6:10:15-16 «Obed-Edom» joins the class only without call 4. Call 4 (call4 list line 406) lays «Edom» at 6:10:16, so with call 4 that run falls.

**Where the joined reading goes.**
- **Maqaf chains (1,002 runs).** Pressing either word opens that word's own card (14425 with chainReadsWhole false). Its top carries two rows:
  - «Chain · complete divisions · N» (10534). The chain as written comes first, for example «על־כן», with the words' division pressed.
  - «Chain · word» (10544).

  Pressing the whole rung opens the chain's card on it. Its band «Exact selectable routes» (10760) lists the span rows in the store's order, each with its own chip. At Amos 3:2 these are «alternative spelling of עַל כֵּן (“therefore”)» and «therefore», both from English Wiktionary. The live chain book records exactly these pills on the whole rung today.
- **Spaced runs (1,157, plus 18 with mixed gaps).** Pressing a word opens the run's own card (openNamedRun 14233).
  - It stands on "the words one by one", with the pressed word's block open (9845).
  - That block reads the word's own place reading (placeOfCell 9895-9902).
  - The joined reading is the first button of «Complete divisions · N» (10559): the run as the store names it, for example «יום שני».
- **Shut sources.** Their joined rows stay behind the kinds' count and press (8295-8297), for example Wikidata's «the Jewish people» and Lexibank's «MONDAY».
- **Ruling.** A joined reading the reader presses rules the run, and the line then reads it whole (12147-12158).

**The changes**, all in `S/ship/reader/zone.html`:
1. **One test**, placed beside runTakesDefault (6160): every word of the run, marks aside, has the place's own reading: `run.__words.filter((w) => !w.mark).every((w) => placeLine(w))`.
   - The marks must be set aside. appendWord pushes a bridged paseq into `__words` (13521). Without that, all 41 paseq runs would be held by mistake.
2. **refreshJoinGloss's span branch** (12172) adds "not every word reads its place". The whole-form branch (12186) already has this condition, so both use the one test.
3. **chainReadsWhole** (8753) adds the same condition.
4. **The run card's opening** (9836-9842) opens on the as-written rung only where the run's line reads it whole. Otherwise it opens on the words one by one.
5. **Call 4 dependency.** The test must see call 4's laid words as the place's reading. If call 4's projector writes them where placeLine reads, nothing more is needed. Otherwise the test must also ask call 4's field.
6. **Nothing else changes**: spanCardsOf, the cells, the rungs, rulings and the kinds gate stay as they are.

**Off rest.** The place stops leading (placeYields 6069; or TAHOT switched off) when the reader moves the order away from the place, or chooses the headword, a license class, or «letters only». Joined readings then stand again, as whole forms do today. With «license runs» turned on, run cards and HUD runs draw by the same test.

## 4. Measures

### Runs resting today, by source
From summarize-call3-v1.py; each cell is runs / words.

| Source | Live | Combined ship | Falls in ship 5 (with call 4) |
|---|---|---|---|
| M13 English Wiktionary | 1,097 / 2,216 | 1,599 / 3,220 | 1,599 / 3,220 |
| M2 Wikidata | 514 / 1,029 | 0 | 0 |
| M17 SDBH | 331 / 671 | 331 / 671 | 329 / 667 |
| M46 BDB unabridged | 83 / 166 | 83 / 166 | 83 / 166 |
| M19 TBESH | 64 / 143 | 64 / 143 | 61 / 137 |
| M18 UBS | 24 / 48 | 24 / 48 | 24 / 48 |
| M9 Strong's (OS) | 18 / 36 | 18 / 36 | 18 / 36 |
| M33 Lexical Index | 17 / 34 | 17 / 34 | 17 / 34 |
| M60 Aramaic Wiktionary | 14 / 28 | 14 / 28 | 14 / 28 |
| M64 Lexibank | 6 / 12 | 0 | 0 |
| M199 ETCBC | 5 / 11 | 5 / 11 | 5 / 11 |
| M197 STEP expanded Strong | 3 / 6 | 3 / 6 | 3 / 6 |
| M57 OMW | 1 / 2 | 0 | 0 |
| **All** | **2,177 / 4,402** | **2,158 / 4,363** | **2,153 / 4,353** |

The live runs cover 4,443 entries: 4,402 words plus 41 paseqs.

### Runs by book
From table-by-book-v1.py; each cell is live runs / words → combined-ship runs / words → runs / words that fall in ship 5.

| Book | Runs and words |
|---|---|
| Numbers | 216/434 → 214/430 → 214/430 |
| Ezekiel | 180/364 → same → same |
| Jeremiah | 163/328 → 162/326 → 160/322 |
| Joshua | 140/286 → same → same |
| Exodus | 130/262 → same → same |
| Genesis | 128/267 → 126/263 → same |
| Isaiah | 120/242 → 117/236 → same |
| I Chronicles | 111/223 → 110/221 → same |
| Judges | 109/220 → same → same |
| I Kings | 89/181 → same → same |
| II Kings | 88/177 → same → same |
| II Chronicles | 69/138 → same → same |
| II Samuel | 69/138 → same → same |
| Psalms | 63/126 → 59/118 → same |
| I Samuel | 59/118 → same → same |
| Deuteronomy | 58/117 → 56/113 → same |
| Ezra | 49/98 → same → same |
| Nehemiah | 45/90 → same → same |
| Zechariah | 45/90 → same → same |
| Leviticus | 39/81 → same → same |
| Proverbs | 29/65 → 27/60 → same |
| Job | 26/53 → same → same |
| Malachi | 25/50 → same → same |
| Hosea | 20/40 → same → same |
| Daniel | 18/36 → same → 16/32 |
| Esther | 18/36 → same → same |
| Amos | 17/34 → 16/32 → same |
| Haggai | 13/26 → same → same |
| Ecclesiastes | 8/16 → same → same |
| Song of Songs | 7/14 → same → 6/12 |
| Lamentations | 6/12 → 5/10 → same |
| Micah | 6/12 → same → same |
| Habakkuk | 5/10 → same → same |
| Nahum | 3/6 → same → same |
| Ruth | 3/6 → same → same |
| Zephaniah | 2/4 → same → same |
| Jonah | 1/2 → same → same |

Joel, Obadiah and the Tikkunei Zohar have 0 runs.

### Words whose line moves
From summarize-call3-v1.py:

| Basis | Without call 4 | With call 4 |
|---|---|---|
| Live | 4,390 words in 2,171 runs | 4,392 in 2,172 |
| Combined ship | 4,351 in 2,152 | 4,353 in 2,153 |

Of the 2,153 runs that fall on the combined ship:
- **456 keep their letters.** Only the credit and the drawing change: «therefore» becomes «there-» + «-fore», «Bethel» becomes «Beth-» + «-el», «Obed-Edom» becomes «Obed-» + «Edom».
- **1,697 change their words.**

### Cards
From measure-chain-cards-v1.py, over the 12 live chain books:
- **274 words of resting runs** open their card on the whole rung.
- **64 more words** open on the whole rung even though their line already reads word by word. Example: Hosea 3:1:14-15. The line reads «[the] people of» + «Israel», but the card opens on «בני ישראל» with «the Jewish people» pressed.

All 338 open on the word pressed after call 3. Amos 8:3 accounts for 2 of them, and those 2 already do in the combined ship.

### Examples
Live and ship lines are from the records. The lines after call 3 come from the model.

- **Exodus 1:1:3-4.**
  - Live: «the Jewish people» (M2).
  - Combined ship: «the Children of Israel, Israelites, Jews» (M13).
  - After call 3: «[the] sons of» + «Israel», both PIECE:TAHOT.
  - On the card, under «Complete divisions», the rung «בני ישראל» holds «the Children of Israel, Israelites, Jews» and «alternative spelling of בְּנֵי יִשְׂרָאֵל», both M13. «the Jewish people» (M2) sits behind the kinds' press.
- **Genesis 1:8:9-10.**
  - «Monday» (M13), the same live and on the ship.
  - After call 3: «a day» + «second».
  - The rung «יום שני» holds «Monday» (M13) and «MONDAY» (M64, shut at rest).
- **II Samuel 6:10:15-16, a maqaf chain.**
  - «Obed-Edom» (M17), live and on the ship.
  - Word 16 has no place reading: the piece store lacks it, and its tie is open-q11.
  - With call 4 the run falls: «Obed-» (PIECE:TAHOT) + «Edom» (STEP's words, from call 4).
  - The rung «עבד־אדם» holds «Obed-Edom» (SDBH and UBS) and «servant of» (BDB, Open Scriptures).
  - Without call 4 the run is held.
- **II Samuel 10:6:15-17, «Aram Zoba».**
  - The place «ארם צובא» (words 16-17) is laid. It shares one cell with the maqaf chain וְאֶת־אֲרַם (words 15-16), and that cell has no key the store holds.
  - So it already reads word by word, live and on the ship: «and» + gap, «Aram», «Zobah» (record entries 14-16).
  - Call 3 does not change its line.
  - Today a press on word 16 or 17 opens the run's card on «Aram Zoba» (9839-9842). I read this from the code; there is no chain book for II Samuel. After call 3 the card opens on the word, and «Aram Zoba» (SDBH and UBS) is one press away.
  - The run in the same verse at 10:6:28-29, «twelve» (M13), becomes «two [plus]» + «ten».

### Against the plan's 2,177 lines over 4,402 words
- **On the live records they are identical.** All 2,177 lines match by place, text and credit, and this is also the live receipt's `runs_read_whole`.
- **They will differ by ship 5, for two reasons.**
  - The kinds have already taken 19 runs (39 words) to their words, and moved 502 runs to M13.
  - The rule holds 5 runs (10 words).
- **So call 3 moves 2,153 runs over 4,353 words**, not 2,177 over 4,402.
- **The check still holds all 2,177 v181 lines**: 2,172 word by word and 5 held, each named.

## 5. What else changes
- **Records and receipt.** `lines_over_more_than_one_word` drops to 5 across the 39 books. `runs_read_whole` drops to 5 lines over 10 words, and its "what" text must be restated (bake-default-picks-v1.mjs:1200).
- **Checks to restate:**
  - check-span-store-v1 S2 and S3 (tools/check-span-store-v1.mjs:7-17). S2 should expect a run's line only where a word lacks the place's reading. S3 should expect a card opened on the word.
  - check-run-line-follows-division-v1 D1 (:13, :83). This becomes "before anything is pressed, the run reads its words".
  - check-default-picks-v1 D7 text (:140-146). Its model derives from the base records, so its code adapts on its own.
  - check-card-opens-on-the-line-v1:117 skips words inside a run. It should take them in.
- **New clause in check-audit-calls-v1.** For each v181 line, either:
  - each word stands under its own one-word line with v181's STEP letters (signs aside), credited PIECE:TAHOT, or M4 at call 4's place; or
  - one held line spans exactly those words, with v181's text and credit.

  Expected: 2,172 lines word by word and 5 held, each named.
- **Pin v181's file** beside `calls-v1/` (bytes and sha256 as above, 2,177 lines) and read it through `readPinned` (tools/pinned-v1.mjs:33).
- **Unchanged by construction:** the search reads the span store itself (bake-search-index-v1.mjs:169-175, :318), and nothing leaves the store or the span store.
- **Put-back to Moses.** The 3 runs that are not call-4 places (Daniel 1:13:8-9, Daniel 1:15:14-15, Song of Songs 6:12:6-7) join put-back 2. The question for each word is: "which is STEP's line at each word, where v181 gives one reading for both?"

## Not measured
- Whether the spaced run's card presses the place reading on the opened block. I traced it in the code (placeOfCell 9895-9902, poolFor 8391); a page run of the check will confirm.
- How many words change under MACULA, UBS or BDB. The receipt counts runs, not words.
- Chain-book link counts after the change.
- Cards in the 27 books without a chain book.
- The «2,835 places» figure in #90's framing.

## Files
- Scripts:
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/measure-runs-v1.mjs`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/measure-span-places-v1.mjs`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/compare-ship-runs-v1.mjs`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/compare-step-v1.py`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/summarize-call3-v1.py`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/table-by-book-v1.py`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/measure-chain-cards-v1.py`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/own-lines-ship-v1.py`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/letters-v181-v1.py`
- Outputs:
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/out/summary-v1.json`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/out/runs-v1.jsonl`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/out/span-places-v1.jsonl`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/out/span-places-summary-v1.json`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/out/ship-runs-compare-v1.json`
  - `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/out/call3-moves-v1.json`
- v181's downloaded list: `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call3-runs/dl-v181/v2/ledgers/all/audit-lines-and-pills/lines-and-pills-v1/lines-over-several-words-v1.jsonl`