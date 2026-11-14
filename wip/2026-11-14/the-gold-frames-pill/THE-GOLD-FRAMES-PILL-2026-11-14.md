# The frames' pill says «gold frames»

14 November 2026. Page lane (Elijah). Held for the next update, on the owner's word: «no need to push a fix for just that though add it to the next update or whatever». The owner, of the page lane's wording in its report on the hidden sign's blob: «oh gold frame is a good wording lets use that on the pill over blob», and then «or just framing?».

## The choice

«gold frames». The row it stands in reads «English reader», «card numbering», «concordance hud», «reset»: two words, lower case. «gold frames» fits that row, keeps the plural of the label it replaces (the switch governs all of them), and names what a reader sees. «framing» names an act, not a thing on the page. It is a one-word change if the owner would rather have it.

## What changes

Only the words a reader sees:

- the pill beside the English reader: «gold frames» where it said «blobs»;
- the reset pill's tooltip: "gold frames off" where it said "blobs off";
- the switches page (/toggles/): ?blobs=runs "draws the gold frames on runs alone".

The address flag ?blobs=, the choice kept on the device (fh.blobs) and the code's own names stay, so no bookmark and no kept choice is lost. The switches page is built again by `tools/build-toggle-design-v1.mjs`; only that sentence moves.

The pill row still stands in two rows at phone width, as before (`pictures/gold-frames-pill-before-and-after.png`).

## What moved, measured against main (f2ba077659)

- **Lines at rest:** none (400,242 of 400,242 the same, `logs/m04-…`).
- **The chain books' cards:** 14,354 words, the same links at rest and lifted (`logs/m05-…`).

## Proofs

- **The suite** (`logs/m03-suite.txt`, on the tree with the rename and nothing else): 153 of 154 pass. The one red is `check-nothing-unlanded-v1`, which is red until a build ships. The checks that press these pills by their ids pass: menu switches, the reset pill, the blanks and names pills, nothing overlaps.
- **The gate** is not run for this alone; it runs with the update this rides in.
