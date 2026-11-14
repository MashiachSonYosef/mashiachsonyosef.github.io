# A hidden sign's letters wear a blob closed around them

14 November 2026. Page lane (Elijah). Shipped: main f2ba077659, gh-pages c22c339806, Pages run 1367, live check 65 green (`logs/k08-poll.txt`). The owner, after the bare "+" shipped (main 82da4fbaf8), with a picture of וְאֵת at Genesis 1:1 under English on top: «spacing looks better but blobs will need updated».

## What was wrong

Under the signs switch off, a piece of a reading that is only a sign («<obj.>», «<the>», «<to>») is not drawn. It keeps its place as a gap (16 October), and its letters wear a blob of their own (23 October: «2 examples of a missing blob»). That blob ran down to the gap's slot in the English row, as every blob runs down to its English. The slot is 0.55em wide and prints nothing.

While the joiner stood beside the gap, the "+" held the slot apart from its neighbor. Since the bare "+" went, the slot stands right against the next piece, so the gap's blob became a thin stalk pressed against its neighbor's blob. Under English on top, where the English runs left to right over letters that run right to left, the stalk crossed the neighbor's blob. In the owner's picture, the vav's «and» blob and the object marker's stalk cross under «and».

## The rule

`gap-blob-rule-v1-a-hidden-signs-letters-wear-a-blob-of-their-own-ink-and-tie-to-nothing`

- A hidden sign's letters still wear a blob of their own. It closes around their ink: its top is drawn as every blob's top is, its foot as every blob's foot is under English on top, and it ties to nothing.
- Every other blob is drawn as before, down (or up) to its English.
- The gap keeps its slot in the line, so the spacing the owner liked stays as it is.

## The page (zone.html), edit 106

- `piecePairs` marks a pair whose English is a gap: a piece of a laid line (`.g-pc.gap`) or a run's cell (`.g-part.gap`).
- `drawPairs` draws such a pair's blob from the letters alone: the top (`topPath`, with its band walls), then the foot (`footPath`) walked back from right to left (`backward`). The path carries `data-gap="1"`.
- A gap's English box shares no seam with the English beside it, since no blob is drawn to it.
- The two comments that said the gap's blob ties to its slot now say it closes around the letters.

## The checks

- `check-sign-gap-joiner-v1` G4 (edit 107): on the pages G3 opens, once their blobs are all drawn, and on the first of them again under English on top:
  - every gap the page lays where blobs are worn has a blob of its own, marked as the gap's;
  - that blob stands within its letters' columns and stops short of the English row;
  - every other blob reaches over its English whole.

  On the prototype: Habakkuk and Zephaniah with Hebrew on top, Habakkuk with English on top. 86 gaps, each with its own blob, and 2,181 other blobs, each over its English. Green.
- Fault harness: G4 fails on the live page («a gap whose letters wear no blob of their own», at Habakkuk 1:3, 1:4 and 1:6). It also fails on a copy that marks the gap's blob but ties it to its slot as before («a gap's blob reaches the English row», at the same three places).

## What moved, measured against main (140e482203)

- **Lines at rest:** none (400,242 of 400,242 the same, `logs/k03-…`). The round wrote every record again only because each one pins the page it was read off.
- **The chain books' cards:** 14,354 words, the same links at rest and lifted (`logs/k04-…`).
- **The blobs:** only the gaps' blobs are drawn anew. The gate compares lines and cards, not drawings, so G4 and the pictures are this change's proof.

## Pictures

- `pictures/gap-blob-genesis-1-1-before-and-after.png`: וְאֵת at Genesis 1:1, before and after, Hebrew on top and English on top.
- `pictures/gap-blob-three-shapes-hebrew-on-top.png`, `…-english-on-top.png`: a gap between two printed pieces (Genesis 1:10), a gap at the start (Genesis 1:14), and a maqaf run whose first word is the hidden object marker (Genesis 1:7).

## Proofs

- **The suite** (`logs/k02-suite.txt`, on the final tree): 153 of 154 pass. The one red is `check-nothing-unlanded-v1`, which is red until a build ships, as before every ship.
  - `check-sign-gap-joiner-v1` (`logs/k02-check-sign-gap-joiner-v1.log`): G1 to G4 green, G4 as on the prototype.
  - `check-blob-precision-v1` (`logs/k02-check-blob-precision-v1.log`): B1 to B7 green. Every ink pixel lies inside its blob and none lies in two, on runs, under any naming, under English on top, and on every word at the default.
- **The gate** (`logs/k05-gate.txt`): 9,423 lines on 18 pages of 9 books and 54 cards, every one the same on both builds.
- **Lint:** the page script and the changed check carry no finding their live copies lack.
- `PIPELINE-MANIFEST.md` is emitted again: 156 rules, the new one guarded by `check-sign-gap-joiner-v1`.
- **After the ship:** `check-nothing-unlanded-v1` passes (`logs/k06-…`). The SHA256s on gh-pages c22c339806 (`logs/k07-…`): 12,762 of 12,762, none wrong.
