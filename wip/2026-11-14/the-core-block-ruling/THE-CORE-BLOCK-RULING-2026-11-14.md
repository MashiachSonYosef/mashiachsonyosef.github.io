# A reading pressed on a core-block card stays on the line

14 November 2026. Page lane (Elijah). A live fault, found while testing the word senses. It rides in the same update.

## What was wrong

Since the core-block rule of this morning (#109), a card of one pill opens on the place's own division, on its core block. Most such cards are words with a prefix or an ending. In the twelve chain books that is 6,461 of 6,466 such cards.

Opening there remembers no division. That is by design: opening a card is not a ruling. But when the reader then presses a reading on that block, the page remembered the reading under the block alone, still with no division.

The card itself paints the line from what it has open, so the line changed at once. Every other painter reads a ruling on the division it was made on: the first paint of a section, the repaint after a switch, and the line at every other place the form stands. With no division they read the ruling on the whole form, found nothing there, and printed the baked line back over the reader's choice.

Measured on main (f2ba077659), Obadiah 1:3, word 10 (`logs/q11-obadiah-1-3-10-main-and-tree.txt`):

| step | the line under the word |
|---|---|
| at rest | in + heart + his |
| «understanding» pressed | in + understanding + his |
| the card closed | in + understanding + his |
| the source signs switch moved | **in + heart + his** |

The same happens when the joined-words switch lays the sections again, and at any later section where the same form stands.

## The fix

The ruling is read where it was made, on the place's own pieces (`placeCutOf`, read by `ruledLine0`, `ruledMs` and `piecesAt`): a ruling with no division pressed, whose block is one of this place's own pieces, is read on this place's own division. A ruling none of whose blocks stands at a place is no ruling there, and the place keeps its own line (`ruledSurfaces`); it used to print the baked column there instead.

The first fix (`blockRuled`) kept the division for the whole form, as a press on the division keeps it. The independent review found the fault in that: the same letters divide otherwise elsewhere, and a division kept for the form opened the card off its own division there (Ruth: a reading pressed at 2:18, word 15, on «מ + שבע + ה»; at 4:15, word 17, the same letters stand as «מ + שבעה»). It was withdrawn. With the ruling read per place, Ruth 4:15 stays on «מ + שבעה» as it does on main (`tools/two-places.mjs` in `../the-word-senses/`), and Obadiah 1:3 ends on «in + understanding + his».

## Proofs

- **The guard.** `check-ruled-equals-first-paint-v1` gained a kind of cell and a check of its own. Its split words had always pressed a division before a reading, so the path every one-pill card now takes was never asked. E4 rules a split word on the block its card opened on, with no division pressed, lays the section again, and asks that the line still reads the reading pressed.
  - On the tree: E1–E4 pass in both readers (`logs/q05-…`): 4 words, «and + in + age», «face», «the + quaking», «and + declare».
  - On main: E4 fails 4 of 4 in both readers, and E1 fails on the same cells (`logs/q06-…`). For example, «age» pressed reads «and + in + age», and laid again reads «and + in + [the] days of».
- **After the review**, E1–E4 pass again with the per-place fix (`logs/q17-…`).
- **The word senses' W5** also holds the neighbor's ruling through the switch's relay (`../the-word-senses/`).

SUITE. GATE.
