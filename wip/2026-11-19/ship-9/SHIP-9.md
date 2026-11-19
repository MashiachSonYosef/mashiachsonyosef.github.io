# Ship 9, the record (from 19 November 2026 AD)

Page lane. The design: `../SHIP-9-DESIGN.md`. The owner's words: `../OWNER-READS-ISAIAH-2026-11-19.md` («do we need 40? maybe we should use 12 dictionarys and slowly add»; that evening «ok so 12 it is lets go with that for now»).

## Item 1: the twelve at rest (dictionary-kinds-rule-v1, a fourth resting entry)

**What changes** (`ship-9-code.patch`):
- **The record** (`reader/data/dictionary-kinds-v1.json`, version 2026-11-19a) gets a fourth resting entry, `not-a-bible-dictionary`, «from dictionaries that are not Bible dictionaries». It names the kinds general-with-entries, rabbinic, aramaic and other, so only the twelve families of the kind bible stand at rest on the 39 books. `kept_by` now says an entry names kinds or families of the store or of an overlay beside it.
- **The rule reaches the overlays** (`restsOffOf` in `reader/tools/dictionary-kinds-v1.mjs`, and the page's copy, line for line). A family is known by its shelf and key: the store's, or the overlay it stands in. A source of the index stands on the store, or on the overlay its index entry names (the page marks each overlay's source with `overlay` as it joins it). An overlay the record files no family of, the span store or the piece store, is never asked: those are packagings, not dictionaries. An entry may name a family beside the store; one naming a family the record does not hold is refused.
- **The page** builds the rule after the overlays' ids join the index, so Jastrow (6 ids) and the five Samaritan works rest shut on a book at rest: 144 ids shut whole, 133 of the store and 11 beside it. The «Shut at rest» block takes an overlay's shut source as a chip from the overlays' own counts for the book (`overlay-book-counts-v1`), and the strip no longer draws it. The bakes read the store alone, as before; the overlays never reached a line.
- **check-dictionary-kinds-v1:** K1 reads every overlay on the disk and asks the rule over the index the page joins; K2 asks every probe again over that index, adds a record whose entry names an overlay's family, and refuses an entry naming a family the record does not hold (instead of one naming an overlay's family); K4 takes the page's ids from the joined index and expects the overlays' shut sources among the block's chips.

**Measured before the round** (`tools/led-by.py` on live, `logs/led-by-live.txt`): of the 305,414 resting lines of the 39 books, 32 are led by a family this entry shuts, and only these move at rest:
- English Wiktionary's Hebrew entries, 27: «to embezzle» (3, Ezekiel 40), «which? (plural referent of either grammatical gender)» (4, Ezekiel 40), «flammable», «bolt», «Hasid» (2), «sea», «to rescue», «a vapour», «town, small town», and the six pointer lines ship 8 resolved («to, towards, into», «pigeon, dove», «Dead, having died»);
- Hebrew Wiktionary, 3: «aid», «buffalo», «pant»;
- Classical Hebrew Words, 2: «piece (of bread)», «no(t)».

**The page before the round** (the kinds check on the tree with Genesis baked as live): K1, K2, K4 and K6 pass. Genesis 1:1's first card holds back 14 readings «from dictionaries that are not Bible dictionaries» (Jastrow's «forest», «prairie», «living in the forest», «wild», …), and one press brings all 14 back, each with the dotted edge. The rail: «21 dictionaries · 1 off», its title «19 more rest shut». K3 and K5 wait on the round (the zones and records still name the record of 15 November).

**The round** (`tools/pipeline-9a.sh`, resumable): the round's steps to the lines, the chain books two at a time, the door, the switches page, every resting line against live, then the checks the change touches. Started 23:52Z.
