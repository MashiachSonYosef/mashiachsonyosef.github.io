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

## What the page does now (four changes, `tools/patch-1.py`)

Rule: `words-stand-alone-rule-v1-at-rest-each-word-is-its-own-cell-and-card-and-a-joined-cell-stands-only-where-a-dictionary-that-stands-files-it`.

1. **The switch rests at «as separate words».** A reader who chose «as written» on their device keeps it; `?maqaf=` sets it for one load (the checks ask it). The stroke stays in the text on the word that carries it.
2. **A place the span store names is one cell only where a row of it stands**: of a dictionary that does not rest shut and that no switch has off, no pointer, and not held back by the place under «only this pointing» (the row a joined line reads, `spanLineRow`). Elsewhere its words are words. Opened, the dictionaries that rest shut bring every place back: at once where no card stands open, and when the card closes where the press was a card's own (so the card stays).
3. **A card that does stand on a run asks each word as its own word**: its own pointed form, its place's entry, whether its place is a name. Before, a run's card asked its words with no pointing and no entry, so their cells skipped the gates the baked line passed (ship 9's known fault: Amos 2:11, the line «young + he will rule as God», the run's card «Bani + Israel»).
4. **The book's run file is not asked for** while the license runs rest off, since nothing is laid from it (222 KB for Isaiah on every first visit until now).

On Isaiah at rest after the change (`tools/rest-probe.mjs`): 24 joined cells of the 139 places, 115 set aside, no row cut, every word's line as on live in all 1,291 verses. The 24: Immanuel (twice), Maher-shalal-hash-baz, Shear-jashub (twice), Kir of Moab, Kir-hareseth, Eglath-shelishiyah, Esar-haddon, Merodach-baladan, Hephzi-bah, «that + except» (7), «for + except», «that + though», «strength of + strength» (2), «re- + -lease». «Yahweh of hosts» (53 places) is two words again: its one joined row is from a source that rests shut.

Cards (`tools/card-probe.mjs`): at 2:9 the two words of the joined pair each open their own card, gated by their own entry (H8213, H0376I), with no chain at the top. At 1:9 «Yahweh» opens its own card under H3068G as a name; on live that press opened the run's card with no entry at all.

## Before and after, for the owner

`shots/isaiah-1-6-before-after.png`, `shots/isaiah-2-9-before-after.png`, `shots/isaiah-12-2-before-after.png`: a Pixel 7's Chrome, live on the left, this tree on the right.

## The checks

- `check-maqaf-pair-drawn-v1`: L5 added (at rest no wrapper joins a pair; each word its own cell and card, headed by that word, no chain at its top); L2 to L4 are the laws of «as written» and are held on the page asked with `?maqaf=maqaf` (`tools/patch-check-pair.py`).
- `check-words-stand-alone-v1` (new; draft copy in `tools/`): A1 the rest; A2 the standing places recounted from the span file; A3 the other positions; A4 the asked words; A5 no row cut on a phone; A6 the dictionaries opened from a card.
- Next: the records (`tools/pipeline-10a.sh`: the lines, the chain books, the door, the switches page, every resting line against live), the whole suite in two lanes, the checks that held the chain's card at rest moved to `?maqaf=maqaf` or to the new rest, then the gate.

## Still on ship 10's list, not in this pass

The key's line under the place's entry (the «behold» lines; Moses's v202 form rows), Strong's «Compare» pairs and v196's names' meanings and definition rows, the rail's count, the reading rows card, a Hebrew web font. The owner's open questions: how a name's meaning reads on a card; a second read of Isaiah.
