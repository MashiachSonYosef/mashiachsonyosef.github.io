# A card of one pill opens on its core block, the place's reading on top

14 November 2026. Page lane (Elijah). The owner's call 10 of 13 November, answered on 14 November with «just go with your recommendations its fine»: cards of one pill open on the part that carries the meaning, with the place's reading still on top.

## What was wrong

A word with a prefix or an ending (הַשָּׁמַיִם, בְּרֵאשִׁית, וְהָאָרֶץ) has a line that reads the source's set: TAHOT's pieces at this place, «the + heavens». Its card opened on the set's division standing whole, under the owner's rule of 3 October: one set, one pill, filed under its division. So it printed one pill, the line again.

The fresh readers counted this in relay v184 §5: «a card of one pill that only repeats the line ... the same word without it opens a full card». In the twelve chain books it was 6,461 of the 6,466 cards of such words. Where the core stood alone in the same book, its own card printed a median of 67 pills (`logs/o01-…`).

## The rule

`core-block-rule-v1-a-card-whose-one-pill-is-the-places-set-opens-on-its-core-block-the-set-still-on-top`

- Where the reader has chosen nothing on the card (no division, no block, not the set), and the set has exactly one core piece, the card opens on that block. It shows the readings of the word without its prefix and its ending.
- The set, the place's own reading, stays on top. The line «here the source reads the + heavens» is said above the readings on every block of the set's division. It is never offered as one of a block's pills.
- Pressing the division again stands on the set whole, as before.
- The whole form and every other division carry neither the set nor the source's line, as before.
- A set with no core piece, or with more than one, still opens on the set whole.
- The pressed pill on the core block is the line's own piece for it («heavens», «beginning», «earth») wherever the block offers it. This is the rule the block row already kept (19 October).
- Nothing on the line moves.

## The page (zone.html), edits 97 and 97b

- In `openHud`, after the set's division is chosen: if the card would stand on the set whole and nothing is remembered on it, it opens on the set's single core block instead (`coreAt`).
- In `renderReadings`, the source's line is said whenever the card stands on the set's own division, whether the set whole or a block of it. On any other division it is not said.

## The checks

- `check-compspan-coverage-v1` C3 (edit 98) now holds the new rule:
  - the card opens on the core block where the set has one, and on the set whole otherwise;
  - the set stays on top of every block of its division, and is never one of a block's pills;
  - the division pressed again stands on the set whole;
  - the whole form and the other divisions carry neither the set nor the source's line.

  Run: 19 cards opened on the core block, 0 on the set whole.
- `check-card-opens-on-the-line-v1` (edit 99): on a card that opens on its core block, the reading row and the line are still the set, and the pressed pill is the line's piece for that block. C2 (the first pill is the line) is not asked of such a card, and such cards are counted. Run: 200 cards opened cold under 20 settings, 20 of them on a core block; green.
- `check-line-follows-card-v1` F1 (edit 100): a core-block card is read by the set it says on top. Run: 0 of 60 differ; green (`logs/h03-…`).
- `check-citations-v1` C10 and C11, `check-dictionary-toggle-v1` D7 (edits 101–102), and `check-reading-language-v1` L1 (edit 105) ask what the card says for the line's own reading: the export's citation, the table's row of a divided reading, the reading's language. On a core-block card the row is the block's, so each check first stands the card on the set whole again, its division pressed, as a reader would. All three are green.
- `check-line-reads-the-place-v1` (edit 103):
  - P3: a core-block card says the set on top and is pressed on the line's own piece for its block. Every other card opens pressed on its line, as before. Run: 30 of 30, 10 of them on a core block.
  - P4: a word whose reading here no row prints still holds it as TAHOT's own row. Where the card opens on a block, the check stands it on the set first. Run: 12 of 12.
- `check-piece-store-v1` P9 (edits 104 and 104b) holds the book's piece file back, every ask refused, while it reads the card, wherever the card opens. Then it lets the file through, and the next card at the same cell carries the claims. Its old reading (the first ask refused, the second let through) raced the page's own retry, once the card asked for the file as it opened. Run: green, 3 asks refused.
- `PIPELINE-MANIFEST.md` is emitted again: 155 rules, the new one guarded by six checks.

## What moved, measured against main (82da4fbaf8)

- **Lines at rest:** none (400,242 of 400,242 the same).
- **The chain books' cards** (`logs/h04-…`):

  | | at rest | lifted |
  |---|---:|---:|
  | cards that open on another reading (the core block's) | 6,454 | 6,454 |
  | cards with the same links | 7,900 | 7,900 |
  | links gone (the set, once per card) | 6,454 | 6,453 |
  | links come | 364,599 | 581,474 |

- **Cards of one pill** among words with a prefix or an ending: 6,461 → 15 (`logs/h06-…`). Each of the 15 was opened on the new build (`logs/h08-the-fifteen-cards.txt`):
  - **6 stand on a joined pair's or a maqaf run's card**, which prints the pair's one reading from the span store: «why» (Amos 5:18), «EVERYWHERE» (Amos 8:3), «Anyway, even so, nevertheless» (Hosea 7:10), «for ever and ever» (Micah 4:5, both words), «Ma Tovu (a prayer in Judaism…)» (Zechariah 9:17). The rule does not reach a pair's card. Whether the place's own reading should lead there is call 90, which waits on the owner.
  - **8 open on their core block, which holds one reading.** The core's key, as TAHOT cuts it, has one reading in the store: «nakedness» (Habakkuk 2:15), «schemes» (Hosea 11:6), «lionesses» (Nahum 2:13), «I will restore» (Zechariah 10:6), «vision» (Zechariah 13:4), «filthy» (Zechariah 3:4), «leap» (Zephaniah 1:9). At Hosea 6:9 the core «Shechem» has 9 more rows, all of another entry, and the entry gate withholds them.
  - **1 has two core pieces** (Malachi 1:13, «what + weariness!»), so it stands on the set whole, as the rule says.
- **Weight.** The twelve chain books grow from 14.5 MB to 21.5 MB gzipped, because their cards now hold the cores' readings. The reader page does not load them; only the chain pages do.

## Pictures

- `pictures/core-block-genesis-1-1-1-before.png`, `…-after.png` (בְּרֵאשִׁית): before, one pill «in + beginning». After, «in + beginning» on top, then 61 readings of רֵאשִׁית, «beginning» pressed.
- `pictures/core-block-genesis-1-1-5-before.png`, `…-after.png` (הַשָּׁמַיִם): before, one pill «the + heavens». After, «the + heavens» on top, then 37 readings of שָׁמַיִם, «heavens» pressed.

## Proofs

SUITE. GATE.
