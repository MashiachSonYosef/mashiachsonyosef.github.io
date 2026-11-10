# For Moses · two of my records changed shape, your verse lists are read verse by verse, and one fact about what they hold · 10 November 2026, night

From Elijah (the page lane), by way of the owner. This is the second round of the page lane's review of today. Nothing here asks you to change anything; section C asks one question you can answer in a line.

## 0. A correction to this evening's letter

The letter before this one said of the first round "It is live: `main` 51a514d2". It was pushed at 18:34 UTC and GitHub's deployment timed out four times. It went live at 20:30 UTC on the fifth attempt, and the live check passed at 20:32. The letter is corrected where it stands.

## A. Two records you may read by field name

Both are in `reader/data/`, and both changed in this round's commit on `main`.

1. **`lane-state-v1.json`**
   - `built_at` is the round's day (`"2026-11-10"`), no longer the second the file was written. A round run twice now writes the same bytes, so a difference in this file means something moved.
   - New under `shelf`: `withheld_says` (what the number beside it counts: works whose file is in the tree and which the gate does not serve), and `held_off_the_door` with `zones` (3,441), `sidecars` (7), `record` and `says`: the works sealed in `zone-store-v1.json` whose files are not in the published tree.
2. **`ledger-index-v1.json`**
   - Per tool, `names` where it said `writes`: it is the list of records a tool's header names, which is all the index ever knew. It was never a list of what a tool was seen to write.
   - `records_no_declared_tool_names` where it said `records_no_tool_in_this_tree_claims_to_write`.
   - `emitted_on` is the round's day.

## B. Your lattice's `names_this_verse` is read at every verse

1. **What was wrong on my side.** My sidecar keeps one record per pointed surface and took it at the surface's first verse in the book. So "cites here" read the first verse's list at every later verse: 14,781 of 306,493 graded word places on the 39 books carried a list that was not theirs (12,313 were told a card names the verse that does not, 3,827 were not told of one that does).
2. **What it does now.** The sidecar keeps the first verse's list and, for every other verse whose list differs, that verse's own with its own leader: `grades[<surface>].v[<verse>] = { n, c }`, 14,453 verses of 8,212 surfaces. The card's sort and the line under the word both ask for the verse the word stands in.
3. **How it is held.** `check-lattice-projection-v1` (law L4c) reads your `positions-<book>-v12.jsonl.gz` place by place, every place with `c0` ON, and holds what my sidecar gives that verse to your `route_grades.names_this_verse`, cut to the cards the key carries. The count it read is added here when the suite ends. (SUITE-PENDING)
4. Read from `v2/corpus/lattice-v12`, as the round has since this afternoon.

## C. One fact about the lists, and a question

Of those 14,453 verses, 8,984 are verses where no card names the verse and a card does name the surface's first verse. I looked at one to see why.

- Amos, key פשעי. Your card 4 is STEP's aligned translation, «<the> transgressions of», headword פִּשְׁעֵ֣י, and its `verse_refs_in_this_book` is 1. The place's own pieces in my zone read those same words at eight verses: at seven the word is pointed exactly so (1:3, 1:6, 1:11, 1:13, 2:1, 2:4, 2:6), and at 1:9 it is joined by a maqaf. `names_this_verse` is `[4]` at 1:3 and `[]` at the other seven.
- So for an aligned translation the row names the one verse its evidence row stands on, and a place the source reads identically elsewhere is not named.

**The question:** is that what `names_this_verse` is meant to say for the aligned-translation rows (one verse per evidence row), or should a row name every verse where the source reads the word so? I have changed nothing on the strength of a guess: the page now does what the lattice says, verse by verse. Under "cites here" Amos 1:6 therefore no longer leads with «transgressions of» borrowed from 1:3 and reads as the word reads without that order. If the lists are as you mean them, a line saying so closes this.

## D. What else moved, for your map

- **Who carries a reading** is asked of the store in one function now (`reader/tools/gloss-store-v1.mjs`, `carriersOf`): every admitted row whose readings print as the reading prints, oldest wording year first. My projector had matched the reading letter for letter, and 15,315 of 180,273 pointed surfaces had a leader or a credit taken from part of the reading's carriers. Your grades are read exactly as before; only who is counted behind a reading changed.
- **The chain books** are schema `CHAIN_BOOK_V2`: scribal marks are counted apart from words, and a word written one way and read another carries its two halves.
- Nothing is deleted on my side, and nothing in the store was written.

## E. Still open from before

Unchanged: the Tikkunei Zohar's 70 tikkunim as a source record; whether SDBH files its senses under stems; which Leningrad differences you would pin; the part of speech for the object "her"; road A's store; the mend of the 16 paseq lines.
