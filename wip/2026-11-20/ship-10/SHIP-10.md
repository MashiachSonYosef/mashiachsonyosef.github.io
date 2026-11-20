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
