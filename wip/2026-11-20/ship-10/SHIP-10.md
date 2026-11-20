# Ship 10: the words stand alone at rest (begun 20 November 2026 AD)

Page lane (Elijah). The tree: `S/s10`, a working tree of the live commit (`main` e3f36d287c). Nothing is shipped yet; this is the record as it is built.

## The owner's words

- 20 November, of the run cards after the twelve: «right so part of the strip down to 12 might as well just be follow their convention to not do run words at all i assume and we add those when we add other dictionarys that allow it carefully if it actually makes sense, vs shotgunning them all in and slowly pruning out».
- 19 November, three faults drawn on a phone at Isaiah 1:6, 2:9 and 12:2; the device: «phone, chrome».

## What was found

The page already held the switch this needs. «Joined words» (the megacompspan toggles of 8 October, part P1) has two positions: «as written», where a chain the scribes joined with a stroke is one cell with one line and one card, and «as separate words», where each word is its own. It rested at «as written».

Measured on the live tree, Isaiah on a phone (Pixel 7), the switch moved by hand (`tools/pieces-probe.mjs`, `tools/lines-compare.py`):

| | as written (live) | as separate words |
|---|---|---|
| joined cells | 1,851 (1,761 chains, 139 places of the span store among them) | 139 (the places) |
| English rows cut by their own row | 27, every one a chain's | 0 |
| each word's own line, 1,291 verses | | the same in all 1,291 |

So the three faults the owner drew go by the drawing itself, and no word's line moves.

## What the page does now (`tools/patch-1.py` to `patch-4.py`; the whole of it in `zone-html.diff`)

Rule: `words-stand-alone-rule-v1-at-rest-each-word-is-its-own-cell-and-card-and-a-joined-cell-stands-only-where-a-dictionary-that-stands-files-it`.

1. **The switch rests at «as separate words».** A reader who chose «as written» on their device keeps it; `?maqaf=` sets it for one load (the checks ask it). The stroke stays in the text on the word that carries it.
2. **A place the span store names is one cell only where a row of it stands**: of a dictionary that does not rest shut and that no switch has off, no pointer, and not held back by the place under «only this pointing» (the row a joined line reads, `spanLineRow`). Elsewhere its words are words. Opened, the dictionaries that rest shut bring every place back: at once where no card stands open, and when the card closes where the press was a card's own (so the card stays).
3. **A card that does stand on a run asks each word as its own word**: its own pointed form, its place's entry, whether its place is a name. Before, a run's card asked its words with no pointing and no entry, so their cells skipped the gates the baked line passed (ship 9's known fault: Amos 2:11, the line «young + he will rule as God», the run's card «Bani + Israel»). `check-card-opens-on-the-line-v1` passes again (it failed on live under «masoretic» and «oldest»).
4. **The book's run file is not asked for** while the license runs rest off, since nothing is laid from it (222 KB for Isaiah on every first visit until now).
5. **A hidden sign keeps its place beside the word its stroke joins it to.** Found by the build (the default picks' law D5, 7 places) and then on the page: with every word alone, the object marker joined by a stroke drew «<obj.>» under itself, where the page has always left a gap in the pair's row. Two of the owner's rulings meet here: a hidden sign keeps its place as a gap (16 October, «rather than leave stuff out»), and no word is left with nothing under it (3 October, the fourth word of Genesis). Alone in a cell such a word could keep only one of them. So a word whose whole line is a sign stays in the cell of the word its stroke joins it to, drawn as it is on live; the cell has no key, so it is no run and has no card, and each of its two words opens its own. Amos: 33 such words, none showing its sign, as on live.
6. **A part that prints its place's pieces is as wide as they are** (one style rule). The pieces stand on one line and do not wrap; held to a cell's width they ran past their own part and were cut at its edge. This was the cause of the owner's «anc» for «and» at Isaiah 2:9, in either position of the switch.

On Isaiah at rest after the change (`tools/rest-probe.mjs`, `tools/width-probe.mjs`): 163 joined cells (24 places of the span store, 139 where a sign keeps its place), no chain; no row cut at 412 or 360 wide, no cell past the page, no sideways scroll; every word's own line as on live in all 1,291 verses. Asked «as written» on the same build: no row cut either (27 on live).

The 24 places: Immanuel (twice), Maher-shalal-hash-baz, Shear-jashub (twice), Kir of Moab, Kir-hareseth, Eglath-shelishiyah, Esar-haddon, Merodach-baladan, Hephzi-bah, «that + except» (7), «for + except», «that + though», «strength of + strength» (2), «re- + -lease». «Yahweh of hosts» (53 places) is two words again: its one joined row is from a source that rests shut.

Over the 39 books, counted without a browser by the rule the page reads (`tools/places-at-rest.mjs`, `places-at-rest.tsv`): of 2,845 places, **754 stand as a cell at rest** (262 distinct keys) and 2,091 are set aside: 1,985 because every row of theirs rests shut, 106 because the place holds its standing row back. The row a standing place's line reads is the SDBH's at 419, STEP's TBESH at 232, the UBS dictionary's at 36, Strong's at 22, BDB's at 21, the lexical index's at 13, others at 11.

Cards (`tools/card-probe.mjs`): at 2:9 the two words of the joined pair each open their own card, gated by their own entry (H8213, H0376I), with no chain at the top. At 1:9 «Yahweh» opens its own card under H3068G as a name; on live that press opened the run's card with no entry at all.

## Against live, every resting line (the second pass's records, `S/s7w/lines-diff.mjs`)

Three entries moved in 40 works on the second pass. One was a fault of the pass and is mended: at II Kings 16:17 a word written one way and read another, whose read form is the object marker, drew «<obj.>» alone; such a word now stays beside the word its stroke joins it to as any other does (the gap, as on live). The other two are one place and are the rule at work: Psalm 9:1, «מוּת לַבֵּן» in the psalm's heading. On live its two words stood inside a longer chain's cell, which had no line of its own, and read «alumoth» (STEP's aligned translation, by key) and «labben» (STEP's own piece). The chain is no cell now, so the place stands as its own: the Open Scriptures Hebrew Lexical Index, one of the twelve, files the two words as one entry, and the line over both reads its row, «‘To die for the son’».

## Small things done with it

- The signs switch lays the cells again when it moves (a sign's cell is laid by the switch as it stands when a section is built), at once where no card is open, else when the card closes.
- A closed card stands on no run: the run's words are forgotten with it, so nothing after it is asked as that run's word.
- The switch's own description on the rail and on /toggles/ says where it rests.

## Before and after, for the owner

`shots/isaiah-1-6-before-after.png`, `shots/isaiah-2-9-before-after.png`, `shots/isaiah-12-2-before-after.png`: a Pixel 7's Chrome, live on the left, this tree on the right.

## The checks

- `check-maqaf-pair-drawn-v1`: L5 added (at rest no wrapper joins a pair; each word its own cell and card, headed by that word, no chain at its top); L2 to L4 are the laws of «as written» and are held on the page asked with `?maqaf=maqaf` (`tools/patch-check-pair.py`).
- `check-words-stand-alone-v1` (new; a copy in `tools/`): A1 the rest, and what a joined cell may be (a place of the span store, or a sign's cell); A2 the standing places recounted from the span file; A3 the other positions; A4 the asked words, and each word of a sign's cell its own card; A5 no row cut on a phone; A6 the dictionaries opened from a card. On Isaiah: 6 of 6.
- Both fail on the live build, as they must (A1 to A6 all six; L5), and pass on this one.
- Next: the records (`tools/pipeline-10a.sh`: the lines, the chain books, the door, the switches page, every resting line against live), the whole suite in two lanes, the checks that held the chain's card at rest moved to `?maqaf=maqaf` or to the new rest, then the gate.

## Still on ship 10's list, not in this pass

The key's line under the place's entry (the «behold» lines; Moses's v202 form rows), Strong's «Compare» pairs and v196's names' meanings and definition rows, the rail's count, the reading rows card, a Hebrew web font. The owner's open questions: how a name's meaning reads on a card; a second read of Isaiah.

## The suite's first run on the build (two lanes, begun 13:06 UTC), and what it sends back

Pass 5 of the records (`S/s10w/pipe5`, zone.html 36882e0440d3) is the tree the suite reads. Failures as they came, each read:

| check | what failed | cause | mend |
|---|---|---|---|
| check-card-channels-v1 C5 | no head with another word met | at rest no card's head holds a chain | the check reads its first page once more asked «as written» (done) |
| check-span-store-v1 S2 | places «lost» | the check wanted every place laid | the check counts the places set aside against the page's count (done) |
| check-span-grade-v1 G6 | «the card offers no rung» | a place none of whose rows stands under «only» is no cell | the check holds exactly that, and a cell again under «keep» (done) |
| check-card-opens-on-the-line-v1 C1 | a sign's gap against a pressed pill | the check took a sign's cell for a run | a cell with no key is no run (done) |
| check-run-cards-v1, check-run-card-forms-v1 | runs not drawn | they test the chain's card | they ask for the joined words as written (done) |
| check-selection-v1 | a space after a stroke in the copy | **the page**: two cells copied with a space between | the copy writes no space after a word that ends in the stroke |
| check-ruled-equals-first-paint-v1 E1, E4 | cells shift after a ruling is laid again | **the page**: a sign's cell was laid by the word's line, which a ruling moves | lay it by the place's own pieces (the zone's data), which nothing the reader does moves |
| check-rulings-under-sources-v1 U10 | a blank under a word with MACULA, UBS or BDB first | **the page**, in the «as separate words» position since October: a unit held apart «as it rests» lost a line that at rest is STEP's own words | the held line asks STEP's layer |

Page changes owed before the last pass, from this run: the copy; the sign's cell by the place's pieces; the held line; and the pointing switch laying the cells again as the signs and kinds switches do.

### The run's end (14:36 UTC): 180 of 195 pass

The fifteen that did not, and where each stands:

- Moved to the new rest, or asked «as written», the check's own text changed (11): check-card-channels-v1, check-card-opens-on-the-line-v1, check-compspan-coverage-v1 (C4 in two halves: at rest no chain at the top of a chain word's card, asked as written the chain's lattice), check-hud-runs-v1, check-line-reads-the-place-v1 (P4 found its word by the first of its letters on the page; it finds it in its own verse now), check-manifest-prints-unguarded-v1 (the manifest emitted again; a rule's name I had wrapped across two comment lines), check-run-card-forms-v1, check-run-cards-v1, check-span-grade-v1, check-span-store-v1, and the two new ones stand as they were.
- The page mended (4): check-selection-v1 (the copy), check-ruled-equals-first-paint-v1 (the sign's cell laid by the zone's pieces), check-rulings-under-sources-v1 (the held line), and check-reading-rows-v1 R3. R3 is the floor of 23 October («R pills never being less than a row»): on a phone held sideways (640 by 360) the card of a word that carries a note in its head, its record opened whole, showed no reading at all. The floor's code passed over a region squeezed to nothing; a chain word's card always had the chain's two bands in that region, so live never met it. The floor engages on a region of no height now. (R1 fails on live too, as ship 9 recorded.)
- After the push only (1): check-nothing-unlanded-v1.

### The sixteen run again after the mends (two at a time), and the last four

Eleven of the sixteen passed at once. Five did not; each read again:

| check | what it said | cause | mend |
|---|---|---|---|
| check-reading-rows-v1 R1 | «390x664 word at 120px: 2 of 40 rows» | fails on live too (the reading rows card, on ship 10's later list) | none in this pass; R3, which was this ship's, passes |
| check-ruled-equals-first-paint-v1 E1, E4 | cells «not found», one word's line under another's number | **the check**: it lays the sections again by moving the «joined words» switch to «as separate words» and back to «as written», and left the page «as written», which is no longer where it rests, so its cell numbers named other cells | it reads where the switch stands, moves it away and back (`tools/check-ruled-equals-first-paint-v1.mjs`) |
| check-rulings-under-sources-v1 U10 | «the card says «»» at Daniel 1:8:8 under MACULA and UBS | **the page**: the line was mended (the held line) and the card was not. The card of a word of a unit held apart stood on no reading at all, «No exact route in the catalog for this form», under a line that had one | one function, `dfltHeldLine`, read by the line, the card (its pill, its «on the line» mark, the layer it remembers) and the export's citation (`tools/patch-7.py`) |
| check-span-grade-v1 G6 | «deuteronomy 18:1 10-11 (named): no cell at the place under «keep»» | **the check**: the place's one row is English Wiktionary's «the Jewish people», which rests shut, so the place is no cell under either position | the check holds that, and judges the named card where its row stands, with the dictionaries that rest shut opened for the load. Opened, every place is laid, as before the rule: a cell under «only» whose card holds the row back and says so (1 pointed otherwise), a cell under «keep» that reads it (`tools/patch-g6.py`, `patch-g6b.py`) |
| check-span-store-v1 S2 (genesis) | «A CELL WHERE NO ROW STANDS: 22:14» | **the check**: Genesis 22:14 holds one key at two places, words 6-7 (standing) and 12-13 (both rows held back as pointed otherwise). The check named a cell by verse and key, so it took the first place's cell for the second's | a cell is named by its verse, its place's first word and its key |

Daniel 1:8:8 on the card, before and after (the first word of the king's food, which the text writes as two words with a stroke; MACULA, UBS and BDB each read the two as one):

- live, «as separate words» chosen, MACULA first: the line blank; the card «no reading in the catalog for this form», no pill.
- this build, at rest, MACULA first: the line «with + [the] delicaci[es] of»; the card's label «reading · STEP at this place · MACULA reads these 2 words as one, and they stand apart»; one pill, the line's reading; «here STEP reads … · on the line».

The six run again (the four, the new check and the default picks' check): all pass. check-span-grade-v1 G6 now reads «deuteronomy 18:1 10-11 (named): no row of the place rests open, so the place is no cell under either position and its words are words; with the dictionaries that rest shut opened, a cell under «only», «the Jewish people» held back (held back 1 pointed otherwise, 0 with no pointing), and a cell under «keep» that reads «the Jewish people»».

One thing this shows about the rule as built, said plainly: the places set aside are set aside **at rest only**. With the dictionaries that rest shut opened, every place of the span store is laid as it was before this ship, also a place whose every row the pointing holds back under «only this pointing» (its card says what it held back). At rest such a place is words. Kept so on purpose in this pass: the opened page is the page every earlier check of the span cells was written against, and the owner's direction was about the rest.

The last records pass (`S/s10w/pipe6`) began 15:20 UTC on the final page (zone.html 275e0ba815014b93); the whole suite follows it.

### The last records pass (pipe6, 15:20 to 15:42 UTC, zone.html 275e0ba815014b93)

Lines 275 s, the chain books 974 s, the door 37 s, the switches page 14 s. Every resting line against live: the same two entries moved, one place, Psalm 9:1 («alumoth» and «labben» → «‘To die for the son’», the lexical index's row over both); nothing else in 40 works. The manifest is emitted again. An independent read of the page's whole diff (422 lines) is running beside the gate, before the final suite's verdicts are taken.
