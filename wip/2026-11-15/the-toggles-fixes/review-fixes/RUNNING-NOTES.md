# The toggles fixes, after their review: running notes (15 November 2026)

Tree: scratch pt, branch toggles-fixes. The independent review of the toggles fixes returned three findings
(should-fix each). This part reproduced each, fixed what is this ship's, and left one scenario for the lead.
Commits: d4a0b0972e (page, check-rulings-under-sources-v1, check-default-picks-v1) and cdd93e381f
(check-same-product-v1). Probes and logs: scratch v74 (probes in v74/probes, outputs in v74/out, check logs in
v74/out/checks).

## 1. A division pressed alone: the card and its line disagreed after any switch; no law held the open's guard

Reproduced with the reviewer's own probe (v74/out/f1-division-tree.log, f1-division-live.log): Ruth at rest, the
whole form of 1:1:1 pressed on its division row and no pill. The press drew «to be: …» [M13] on 1:1:1 and 1:1:5;
after MACULA both lines read «and + there was» [M4] (the baked column: the painters read a block left alone from it;
live the same); the card at 1:1:5 under MACULA read «that there was» with MACULA's pill pressed over that line, and
back on STEP «to be: …» over it (on live the open painted its reading over the line).

Fixed (zone.html, renderReadings; choose split into remember and choose): a whole form's division pressed with no
reading pressed on it is ruled on the reading the press drew. Once the block's readings land, the reading pressed
there is remembered as a press of its pill remembers it, so the line, the card and the export read it under every
source and at every place (f1-division-tree-after.log: «to be: …» on both lines under MACULA and back on STEP, the
card at 1:1:5 reading it and pressing it). Under MACULA the press rules MACULA's own made reading, its chip naming
the place it is MACULA's own (f1-division-under-tree.log).

Laws (check-rulings-under-sources-v1): U7 (the whole form pressed alone at rest, MACULA and back on STEP, the card
at the other place: both lines, the card's reading, its pressed pill, nothing painted at the open) and U9 (the
open's guard: the same press with the form's catalog shard held back until the card is shut, so the ruling is the
division alone; the card under MACULA at the other place reads «on day», and must paint nothing over the ruled
«over the + day»). Obadiah 1:8:2 and 1:11:1, found from the zones. HEAD's page: U7 red. Live: U7 and U9 red. A copy
of the tree's page without the guard line (v74/mut/zone-noguard.html): U9 alone red. The tree: all green.

What remains (not this ship's): a division pressed whose readings never came before its card closed is the
division alone; the painters read it from the baked column and the card elsewhere reads its own reading there. The
guard keeps the line; the card and the line can still say two things in that case.

## 2. II Samuel 10:6:15-17 under UBS: the name printed twice

Reproduced, the same on live and on the tree: «Aram Zoba» [M18] «Aram» «Zobah». UBS's own pick 1 at 10:6:15 (the
object marker's word, joined by maqaf to «Aram») is the name; UBS has no line at 10:6:16-17; TAHOT writes «Aram»
«Zobah» with no mark across them.

In reproducing it, the hold proved narrower than TAHOT's own writing: a reading ending with a hyphen goes on in the
next word whether or not that one begins with one, and TAHOT writes about half of them so («Tubal-» «Cain», «fif-»
«teen», «In-» «deed»). 361 such readings were not held (read in part by MACULA at 36 more, by UBS at 164 more, by BDB
at 88 more). On the tree before the change: UBS «Tubal-Cain» «Cain» (Genesis 4:22:6-7), «Baal-Hamon» «Hamon» (Song of
Songs 8:11:4-5), BDB «there-» «so · sense 3» (Habakkuk 1:17:1-2) (v74/out/peek-before-tree.log).

Fixed: dfltHalvesOf groups on the first word's hyphen alone (674 readings across words, 313 with both hyphens).
After: «Tubal-» «Cain», «at + Baal-» «Hamon», «there-» «fore» (peek-after-tree.log). Laws: check-rulings U8 (red on
HEAD's page and on live, green on the tree); check-default-picks-v1 D7's model groups the same way (acrossOf), and
the check is green on the tree but for D20 (the receipt on disk is HEAD's: the lead's re-bake, as before).

Left for the lead: a source's line that reads its neighbors' words where TAHOT marks nothing across them, as
10:6:15. UBS (the SDBH) files a name of several words at one word and nothing at the others: about 340 words in 21
books by a text count (v74/out/names-unmarked.log: «Paddan-Aram / Mesopotamia» «Aram», «Kiriath-Arba» «Arba»). The
page cannot tell such a line from the source's reading of its own word without guessing from the text; the corpus
lane can say which words a UBS line spans. The same family as the completeness critic's N2 (one unit printed at two
words), which goes to the second round.

One latent edge, no place in the 39 books today: a word of such a reading whose line at rest is STEP's own words
(a bare line) would be held to the bare line. The one word of a group among STEP's words, II Samuel 6:10:16, is not
bare at rest and keeps «Edom».

## 3. The gate's S1 after the round: red on fix 2's own lines

Reproduced: the tree's chapter pages run /reader/engine-d043256cf007.js, main's engine byte for byte (its md5 is
the engine extracted from 46bbbf7d50's zone.html). Served with the tree's own engine (v74/probes/extract-engine.mjs,
as build-front-door-v1 extracts it; v74/probes/serve-zone.mjs), HEAD's S1 --every 35: FAIL, 8 lines differ (amos 5
and ruth 1, MACULA and UBS: «Bethlehem» to «from + Beth-»; v74/out/checks/s1-head-vs-tree-engine.log).

Fixed (check-same-product-v1, S1, heldIn): under each default source pressed, a word of a reading across words no
one source reads at every word is owed the line as it rests, the new build's own line at rest there (from the zone,
the default picks' book file and the index the new build serves, the second by the bake's autoSecond). After: ok,
the 8 lines held whole as owed (s1-mine-vs-tree-engine.log). With the live engine as the new build: FAIL at the same
8, «the line as it rests owed» (s1-mine-vs-live-engine.log). A three-way merge with kinds-build's copy of the file
(git merge-file on scratch copies) has no conflict.

For the lead: before calling S1 green on a tree, serve that tree's own engine to its chapter pages (or build the
door in scratch); S1 against the tree as served compares main's engine with main's.

## Checks run (logs: v74/out/checks)

| check | tree | before |
|---|---|---|
| check-rulings-under-sources-v1 (U7, U8, U9 new) | all pass, 72 s | HEAD's page: U7, U8 FAIL; live: U1-U5, U7, U8, U9 FAIL; no guard: U9 FAIL |
| check-default-picks-v1 (node and page laws) | all pass but D20 (HEAD's receipt), 352 s | |
| check-same-product-v1 S1 --every 35, the tree's own engine | ok, 8 held as owed, 233 s | HEAD's S1: FAIL, 8 differ |
| check-same-product-v1 S1, the live engine as new | FAIL, 8 not as owed (as it should) | |
| page lint | the baseline: 4, 175, 9, 1 (ORDER_RULE_ID), 2 | |
| tools lint (the three checks, v29/lint/tools/toggles2) | clean | HEAD's copies clean |

## For the lead (the merge with kinds-build)

zone.html merges with two conflicts, the same two before these commits (the reset pill's title in the header row,
and the record a press keeps in choose: kindPick against DFLT_OWN). The second now stands inside remember, which
both choose and the division press use, so its resolution reaches both.
