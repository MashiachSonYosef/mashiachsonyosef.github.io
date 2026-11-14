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

A reading pressed on a block of the place's own division remembers that division, exactly as pressing the division first would have (`blockRuled`, in both places a reading is pressed: its pill, and a witness pressed in the card's record). Every painter already reads a ruling made that way, so nothing else had to learn anything new.

- It does not apply to a run's card: runs remember their own rungs.
- It does not apply to TAHOT's set chosen whole, which is filed under its division already.

On the tree, the same steps end on «in + understanding + his».

## Proofs

- **The guard.** `check-ruled-equals-first-paint-v1` gained a kind of cell and a check of its own. Its split words had always pressed a division before a reading, so the path every one-pill card now takes was never asked. E4 rules a split word on the block its card opened on, with no division pressed, lays the section again, and asks that the line still reads the reading pressed.
  - On the tree: E1–E4 pass in both readers (`logs/q05-…`): 4 words, «and + in + age», «face», «the + quaking», «and + declare».
  - On main: E4 fails 4 of 4 in both readers, and E1 fails on the same cells (`logs/q06-…`). For example, «age» pressed reads «and + in + age», and laid again reads «and + in + [the] days of».
- **The word senses' W5** also holds the neighbor's ruling through the switch's relay (`../the-word-senses/`).

SUITE. GATE.
