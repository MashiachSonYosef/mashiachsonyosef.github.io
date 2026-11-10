# No line under the Hebrew (10 November 2026)

The owner, 10 November 2026:

> i think we can get rid of underlining because when things are underlined theyre already put into 1 card, 1 hud. it doesnt benefit i think. and maqafs are already obvious but even for 2 words itll be on one visible card already

This note records what drew a line before, what was taken off, what was left and why, and how each claim was proven. The tools, logs and pictures named here are beside this file.

## 1. What drew a line on the live page

Read off the live build (main `2a92ca6e`) by `tools/probes/lines-seen.mjs`, which reads every bottom border that can be seen, every shadow drawn as a line, every row's own `::after` drawn as a line and every text decoration, on the words' letters, the runs' ink rows and the title. Log: `logs/u1-lines-seen-before.log`.

| book | runs built (one card) | lined, the Hebrew reader | lined, the English reader | with the card numbers on | the title's word |
|---|---|---|---|---|---|
| Amos | 129 (129) | 129, a shadow over the row | 129, a solid border under | 129, the row's `::after`, parted for a number | a solid line under, 1px |
| Ruth | 120 (120) | 120 | 120 | 120 | the same |
| Daniel | 106 to 112 (105 to 111), as far as the page was built | 105 | 111 | 111 | the same |

So the line stood on every run that is one card (a maqaf compound, a run a license names, a span) and on the Hebrew word of the work's title. A run that is not one card (a pair inside it) wore none. A single word has worn none since 19 October, at rest or under the hand: the rule that turned a word's line gold under the hand was still in the sheet, and since that day it reached only the title's word and the dashed mark of a word the page typed.

## 2. What was taken off

All in `reader/zone.html`, by `tools/edits/30-no-line-under-the-hebrew.mjs` (13 exact-text edits; the blocks it replaced are kept whole in `tools/edits/30-from/`) and `31-a-marks-box-stays-as-it-was.mjs`:

- the one line a run wore: the ink row's border (the English reader), the shadow over it (the Hebrew reader), the thicker gold of a named run, and the gold of a named run standing open;
- with the card numbers on, the row's own `::after` that drew the line parted, its six rules, and the tail of `seatNumbers` that wrote the gaps (`--rule-img`, `--rule-ink`);
- the rules that hid the line again for a word alone, for a run that is not one card, and for a pair (they had nothing left to hide);
- the rule that turned a word's line gold under the hand;
- the line under the title's Hebrew word (it was the same rule, `.wb > .w`).

What the sheet says now: `.wb > .w { border-bottom: 1px solid transparent; }`, `.wjoin .wj-ink { border-bottom: 1px solid transparent; }`, `.wjoin.lic .wj-ink { border-bottom-width: 1.5px; }`, `.wb.kq > .w { border-bottom: 1.5px solid transparent; }`. The comment block above them carries the owner's words and the line's history (3 October, 9 October, 19 October), since that history is why the rows are spaced as they are.

## 3. What was left, and why

The ruling was of the line that marked joined words. These are other marks; each is named so the owner can rule on it apart:

1. **The line's room.** Every word's letters and every run's ink row keep the bottom border they had, unseen. Taking the room away would have moved every row by a pixel and every blob and number with it.
2. **A written-and-read pair's bracket.** The half the English reads wears a gold bracket over it. It says which half the line under the pair reads, which nothing else on the page says.
3. **The dashed line under the half of a pair the hand is on** (`.wr:hover`). It says which half a press will open.
4. **A word the page typed** keeps its dashed mark. It says the page typed it. By the sheet's rules it no longer turns gold under the hand (the rule that did that is the one that went); this is read from the rules and not seen, since none of the pages I tested holds such a word.
5. **A scribal mark's box.** It has stood open at the foot since 19 October, when the line under a single word went and took the box's bottom side with it. At rest it is the same on both builds, side by side (`logs/u6-mark-box-live-then-new.log`); the rule that turns the whole box gold when the mark is pressed was not touched.
6. **The dotted mark of an edition's difference**, drawn only when its switch is on (the switch lives on the bench at `/toggles/`).
7. **On the card**, the concordance tab prints its hit word bold with a gold underline inside an example line. It is a search hit's mark, on the card, not on the text.

## 4. Proofs

- **No line is drawn.** `logs/u1-lines-seen-after.log`: Amos, Ruth and Daniel, both readers, the numbers off and on: "no line is drawn" in all twelve readings.
- **Nothing moved.** `tools/probes/geometry-same.mjs` reads the box of every word, letter row, English line, run and ink row of the first forty sections, each card number's seat, and each blob's drawn outline, on the live build and the new one. `logs/u2-geometry-amos.log`: 599 word boxes, 599 letter rows, 673 English lines, 74 runs, 74 ink rows and the number seats are the same in all four settings; four to six blob outlines differ by a tenth of a pixel in the Hebrew reader. `logs/u2-geometry-amos-control-live-against-itself.log`: the live build read twice differs from itself the same way (four outlines, a tenth of a pixel), so that is the page's own jitter and not this change.
- **Pictures**, the first two verses of Amos at a phone's width, before and after: `shots/amos-1-he-before.png`, `shots/amos-1-he-after.png`, `shots/amos-1-en-before.png`, `shots/amos-1-en-after.png`, and with the card numbers on `shots/amos-1-he-nums-before.png`, `shots/amos-1-he-nums-after.png`, `shots/amos-1-en-nums-before.png`, `shots/amos-1-en-nums-after.png`. I looked at each pair: the lines are gone and nothing else differs. Three of the pairs are also set side by side for the owner (`tools/probes/side-by-side.mjs`): `shots/amos-1-hebrew-reader-before-and-after.png`, `shots/amos-1-english-reader-before-and-after.png`, `shots/amos-1-hebrew-reader-numbers-on-before-and-after.png`.
- **The same product.** `logs/u4-gate.log`: 9,403 lines on 18 pages and 54 first cards are the same on the live build and the new one.
- **The suite.** `logs/u5-suite.log`: the whole suite on the tree, 162 runs: 144 of 145 pass. The one red was `check-nothing-unlanded-v1`, which is red on any tree not yet pushed; on the pushed commit it passes (`logs/nothing-unlanded-on-6aae17d8.log`: 320 sources, all landed). After the two text fixes of section 6 the round's records and door steps were run again (`logs/u8-round-records-door-after-34.log`) and the 14 checks that read the changed files pass (`logs/u10-suite-targeted-after-34.log`). The lint finds nothing the live copies did not have.

## 5. The checks

- **New: `check-no-line-under-hebrew-v1`** (`tools/new/`). L1 at rest nothing draws a line on the Hebrew, in both readers with the numbers off and on; L2 nor under the hand, nor with the card open (a word alone and a run, hovered and then pressed); L3 the room is kept; L4 a typed word keeps its dashed mark (said, not failed, where a page has none). On the live build's Amos it fails L1 and L2 (`logs/u9-new-check-on-the-live-build-amos.log`: 520 lines at rest under the four settings; the first four runs of each setting lined under the hand, and again with the card open). On the new build it passes on three pages (`logs/u9-new-check-on-the-new-build-three-pages.log`: 11,794 words' letters, 12 of them in titles, and 1,444 runs' ink rows at rest; 96 words and runs hovered, 96 pressed open; L4 said, since no page holds a typed word).
- **Retired: `check-underline-joins-v1`.** It held the rule of 19 October, a line only under the words one card joins. The rule is repealed, so the check leaves with it.
- **Reworded: `check-hud-runs-v1` H2** asked every run for one line under or over its ink; it asks that none is drawn (`tools/edits/32-checks-that-knew-a-runs-line.mjs`). **`check-card-numbering-v1` N12** named a run's line among the gold a number keeps clear of; a run wears none (edits 32 and 33).

## 6. Two places that still spoke of the line

`tools/edits/34-what-still-spoke-of-the-line.mjs`:

- **The `/toggles/` page** listed "Two-word underlines" among the things waiting to be drawn: "None is drawn: the record that named the spans was wrong ... Comes back span by span when the run store lands." That store landed in October (`check-span-store-v1` dates a review of the page's cells to the 17th; the store served now is v2.1 of 23 October), and its 2,845 places in 39 books stand on the book pages, each one cell, one card and one blob (S1 and S2). So the entry was untrue well before the ruling; it leaves the waiting list. The page was rebuilt by its own tool. `logs/u7-toggles-build.log`: 13 switches, 13 photographed; the page is one line shorter and its photographs are the same bytes.
- **`tools/project-hud-runs-v1.mjs`**: its header said the page gives a run's words "one line, one strip and one card". Comments only.

## 7. Left, named

- The rule id `hud-runs-rule-v1-a-stretch-the-record-puts-in-one-hud-wears-one-line` keeps its words. It is written into the forty files projected from the corpus lane's HUD record; a new name is a new projection from that record, which is not in my container.
- `check-kq-lead-follows-switch-v1` and `check-kq-presentation-v1` call the pair's bracket "the underline" in their laws' words and their names. They test the bracket's class, and pass.
- `reader/zone.html` keeps two orphaned comment blocks after the pair's bracket rule ("...the same mark on the English it backs: two underlines", "A variant site: ... the dotted line") for marks that went on 3 October, and a dead set of text-decoration declarations on the bracketed half. `tools/zone-lib-v1.mjs` line 313 says "the page underlines the one the English follows". The front door's sheet keeps a comment about "the same underline the book pages use for a chosen reading".

None of these draws anything. They are on the review's list of stale words (task 81).

## 8. The corpus lane's answer to ask 5, received the same hour

Moses, 10 November: the space before the comma in «Amos , an Israelite prophet» was made by the corpus lane's flattening of the provider's markup (one space where each tag stood), not by the provider. It will be closed as a print step, v168: one list per source, keyed by the served text, with the places that close and the text as it prints. "Nothing for you to build until v168 lands."

Measured against the served route store (`logs/m1-space-before-stop.log`, `logs/m2-space-before-which-stops.log`): every statement reproduces. M9: 3,736 route texts and 8,130 definition texts hold a space before a comma. M5: none in the route text, 10,500 in the definition text. M33: none. My letter back is `../FOR-MOSES-2026-11-10-ask-5-received-what-the-page-prints.md`; it also corrects a figure of mine (4,845 took a space before a closing bracket too; by the stops alone it is 4,640). Nothing is built; the page still prints the served bytes.

## 9. The ship

- `main` `6aae17d8` ("No line is drawn on the Hebrew: the words one card joins say so by their cell and their card"), pushed at 22:27 UTC: 1,282 files, of which 1,272 are pages pinned to the page's style and script under their new names (`engine-a015ab1c2b14.css`, `engine-28fb235222ca.js`), one is the `/toggles/` page, two are those style and script files themselves, and the rest are `reader/zone.html`, the new check, the retired one and four tools.
- `gh-pages` `3894522c` ("gh-pages follows main"), pushed with it.
- The Pages deployment, run 1351, succeeded on its first attempt in 68 seconds (22:27:41 to 22:28:49). The live check, run 49, passed at 22:29:21: the public site is `main` `6aae17d8`. `logs/poll-no-line-1.log`.
- `check-nothing-unlanded-v1` on the pushed commit: 320 sources, all landed; every build output in step.
- My reference copies of the live build were moved to `6aae17d8`.
