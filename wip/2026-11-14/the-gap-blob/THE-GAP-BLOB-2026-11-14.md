# A hidden sign's letters wear a blob closed around them

14 November 2026. Page lane (Elijah). The owner, after the bare "+" shipped (main 82da4fbaf8), with a picture of וְאֵת at Genesis 1:1 under English on top: «spacing looks better but blobs will need updated».

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

## Pictures

- `pictures/gap-blob-genesis-1-1-before-and-after.png`: וְאֵת at Genesis 1:1, live and proposed, Hebrew on top and English on top.
- `pictures/gap-blob-three-shapes-hebrew-on-top.png`, `…-english-on-top.png`: a gap between two printed pieces (Genesis 1:10), a gap at the start (Genesis 1:14), and a maqaf run whose first word is the hidden object marker (Genesis 1:7).

## Proofs

SUITE. GATE. LINT.
