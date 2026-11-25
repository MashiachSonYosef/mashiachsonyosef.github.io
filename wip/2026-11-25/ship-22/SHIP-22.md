# Ship 22: plain words (what is bitter or sour on the page, replaced or deleted)

Page lane, 25 November 2026, on the owner's words of that day: «we can word stuff however you want too, you can remove the word force»; «its hopefully you rejecting by taste what is bitter or sour, rather than unbounded rearrangement»; «taste goes by bitter and sour. there are specific justifications the ox spits out the food»; and, on the list below, «ok deal».

| # | Was | Now | Taste, reason |
|---|---|---|---|
| 1 | commonly force read as | commonly read as | bitter: «force» carries a harmful sense |
| 2 | «Zone reader» in the title while a page loads | the work's English name (empty on the 8 demonstration pages, whose zones carry none) | sour: a working name |
| 3 | Loading the zone… | Loading… | sour: a working word |
| 4 | the paragraph under each chapter («The text arrives sealed from the shelf…») | «Hebrew, word by word: press any word to see its readings. Under each verse, the English the reader shows first, each reading numbered to its source at the foot.» | sour: how the page is built |
| 5 | «…served only inside the reader, sealed and pinned.» | «…shown only in the reader.» | sour: build talk |
| 6 | EXACT SELECTABLE ROUTES | READINGS | sour: jargon |
| 7 | shut at rest / Shut at rest | off by default / Off by default | sour: jargon |
| 8 | the same record, carried by 1 more witness of this reading | also given by 1 more source | sour: wordy jargon |
| 9 | «…the corpus lane reads the word here as another word written alike» | «…read here as another word spelled the same» | sour: an internal name |
| 10 | wording year not supplied / no wording year | (nothing) | sour: padding; deleted |

The same words changed on the front door's word card, so a label reads the same everywhere. Five checks that read the old words follow them. `tools/patch-plain-words.py` (exact replacements, each counted) and the door builder's two additions (the book's name at first paint, read from the zone's own English name).

## Measured

- zone.html changed, so the resting lines were read again off the new page, the chain books baked again, the door and the switches page built: every step exit 0. **Every resting line against live: 0 move in 40 works** (`lines-diff.json`).
- Read on the page (Genesis 1, Isaiah 25): the new labels stand on the cards and the header; no old wording remains in any page of the door.
- The gate against live (ship 21): S1 and S2 ok.
- The whole suite (206 checks): 201 pass on the first run. check-citations-v1, check-dictionary-kinds-v1 and check-kq-declared-weld-v1 read the old words; taught the new (the citations check now reads the credit's own words without its license chip), all three pass. check-nothing-unlanded-v1 red until the push. check-levels-v1 («switching reading does not move the card») is red on live too, with the same figures, and gives different figures run to run (93→73, 86→100): timing, not this ship; it passed in ship 20's suite. On the week's list.

## Shipped

main ea6e1ad08e, gh-pages f515c04b35 («gh-pages follows main»). After the push, check-nothing-unlanded-v1 on the tree passes. The live tree for comparison moved to the new main.

