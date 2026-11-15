# The review of round 2, its two findings fixed: running notes (15 November 2026)

Tree: scratch pt, branch toggles-fixes (from b152652e7f). Scratch: v75/fix/ (probes/, out/, logs/, merge/, engine/,
engine-r1/, shadow/). Ports: 8963 (scratch servers), 8964 (the tree's site with its own engine).

Note on 8914: during this part the lead moved scratch old, which 8914 serves, from 46bbbf7d50 to add346d851 (the
combined ship, with the kinds). A comparison of 8914 against this tree now shows the kinds' own differences (Nehemiah
1:6's «the Children of Israel, Israelites, Jews», and 18 cards with English Wiktionary's pills), which are not this
round's. So the gate's S1 was run here against round 1's own page (cdd93e381f's zone.html, its engine extracted as
build-front-door does, served over the same tree on 8963): the same data on both sides, only the page between them.

## Finding 1: N4 held for a resting mouse pointer only

Reproduced on the tree before the change (probes/n4-shift.mjs, the reviewer's own probe, out/n4-shift-tree-before.json):
the critic's case (Ruth 1:1:3, 1100 by 900, a script click, left alone) 4 pills from 516 to 333; a phone with touch,
the word tapped, Ruth 1:1:3 501 to 317 and Obadiah 1:1:1 506 to 322; a real mouse click held (0 moved).

What the rebuild added (probes/n4-seen.mjs, out/n4-seen-tree-before.json): at Ruth 1:1:3 the card went tight, and the
three source lines it added are hidden there, and so are the two lines that stood before it (here STEP reads, the
BSB's). The reader saw less, and the pills jumped.

A source pressed while its file is on its way, on a touch phone (probes/n4-press.mjs, out/n4-press-tree-before.json):
MACULA (or BDB) tapped on the row, then the word tapped; when the file lands the line under the word moves to the
source's words and the card is built again under the finger: 5 of 5 pills moved (Obadiah 1:1:1 503 to 320).

The fix (zone.html, reopenForDefaults and reopenCardFree):
- At rest (under STEP, or none lit) the landing does not build the open card again at all. Every line stood as drawn
  before the file, and nothing on the card is contradicted; what the file adds, each source's line at the place,
  comes with the next card opened.
- Under a source whose file was still on its way, the line under the word has just moved, so the card follows it, but
  not under the reader's hand: the pointer over it, the focus in it, or a finger's last press on it or on the word
  that opened it (a finger has no hover). The hold ends at the pointer leaving, the focus leaving, or a press anywhere
  else (a click, read after its own handlers ran); a card closed or built again meanwhile (hudGen) is let be.

After (out/n4-shift-tree-after.json, out/n4-press-tree-after.json): every case 0 pills moved; the press case's line
reads MACULA's «vision» while the card under the finger stands as it was.

The check, check-landing-holds-the-card-v1 (H2 now a phone with touch and a tap; H1 the hand gone, the card still as it
opened, then opened again with the source lines; H4 the critic's own case; H5 the press case on a phone):
- tree: all green, 50 s (logs/landing-tree-after.log)
- HEAD's page (a shadow of HEAD's zone.html on 8963): H1, H2, H4, H5 red, 50 s (logs/landing-headpage.log): H2 8 of 8
  pills 184 px up, H4 183 px, H5 8 of 8 moved, H1 the card built again with 3 source lines once the hand left.

What this changes in another check: check-press-paints-before-seen-v1 L2 waited for the first card at rest to show the
sources' lines (it relied on the landing building that card again). It now opens the card again until one carries
them. Its L2 alone on Ruth (a scratch copy with L1 skipped): green, 24 s, with the new wait; HEAD's wait also passed on
the tree, but only because the BSB's file built the first card again (below), so it was a matter of timing.

### The same harm through the BSB's file: left for the lead

The first card at rest also asks the BSB's book file (source suggested, «on for now, on every card»), and when that
file lands the card is built again (renderReadings: suggestedReady().then(... reopen)). With the BSB's file held 6 s
and the default picks' file let through (probes/n4-bsb.mjs, out/n4-bsb-tree.json, the tree after this fix): Ruth
1:1:3, the critic's case, 4 pills 464 to 332; a phone tap, 449 to 317 (the card goes tight with the BSB's line and the
three source lines). The BSB's file is two to three times the default picks' file (Ruth 49 KB against 20 KB, Psalms
759 KB against 352 KB), so on a slow line it is the one that usually lands last.

Not changed here: the finding names the default sources' file, and the BSB's reopen is what makes the owner's
«on every card» true for the first card. The choices, for the lead and the owner: (a) as for the default sources, the
card standing open is not built again, and the BSB's line comes with the next card (the first card then lacks it);
(b) fetch the BSB's file at idle after the first paint, so the first card has it (every visitor downloads it); (c)
hold its rebuild under the hand as reopenCardFree holds the default file's (the critic's open-and-wait case still
jumps). The change for (a) is one line in renderReadings and merges with the kinds branch (their hunks stand at base
10252 and 10467, the line at base 10384).

## Finding 2: the gate's S1 red on this round's apart-unit hold

Reproduced (logs/s1-r1-vs-tree-before.log): check-same-product-v1 as at HEAD, --old 8963 (round 1's engine) --new
8964 (the tree's engine) --every 30 --expect data/default-picks/index.json: FAIL S1, 2 differ, nehemiah 7 BDB s184 #3
«in Babylonia» to «from + Tel» and #4 «in Babylonia» to «Melah»; S2 green; 3 min 57 s. The same two lines the
reviewer saw (against 8914 when it was still 46bbbf7d50: logs/s1-every30-before.log has them beside the kinds' lines).

The fix (check-same-product-v1): heldIn also works out, per source, the units a source reads at every word of them, as
the page does (zone.html dfltEntriesOf, dfltHalvesOf, dfltAcross, dfltUnitOf): one entry across words (the lattice's
headword the same at each word, its letters running across their boundary), else one reading across words, where the
source's line at every word is its own, one source's as the halves leave it, from one and the same pick in its book
file. In the loop, a word of such a unit whose words are not all in the one cell (the run the new build draws the
word in) is owed the new build's line as it rests, as a held half is. Counted apart, «held apart» in --diff.

The node model counts every unit of the 39 books (probes/units-node.mjs, out/units-node.json): BDB 202, UBS 8, MACULA
5, the 215 the page builder counted on the page; none at rest.

After (logs/s1-r1-vs-tree-after.log): S1 and S2 green, «2 at a word of one unit a source reads at every word of it, its
words standing apart», both Nehemiah 7:61 lines «held apart»; 3 min 52 s. On a wrong state, a new build that prints the
unit under both apart words (round 1's engine as old and new, logs/s1-wrongstate.log): S1 red at exactly nehemiah 7
BDB s184 #3 and #4, «the line as it rests owed at a word of one unit BDB reads at every word of it, its words standing
apart». Units printed once (Nehemiah 7:11, 7:28, Amos 5's Bethel) are not held and gave no difference.

One rule in one place: the tools now hold the units' grouping twice (check-default-picks-v1 unitGroupsOf, which reads
the runs from its page, and check-same-product-v1, which reads the cells from the page it compares). A module both
import would be the one place; check-default-picks-v1 is not this finding's, so it is left as it stands, for the lead.

## Merge with kinds-build

git merge-file -p of each file (ours, base 46bbbf7d50, theirs kinds-build) in merge/:
- zone.html: 2 conflicts, the same two blocks line for line as HEAD's own merge (the reset pill's title in the row of
  pills; the ruling's record in remember(), DFLT_OWN beside kindPick); this part adds none.
- check-same-product-v1.mjs: 0 conflicts (HEAD: 0).

## Lint

The page at its baseline (4 no-misleading-character-class, 175 no-use-before-define, 9 no-useless-assignment, 1
no-unused-vars, 2 no-unmodified-loop-condition). The three tools this part changed, no warning before or after
(v29/lint/tools/review-fix-r2, review-fix-r2-head).

## The finger's hold proven apart

A scratch page with the finger's part of the hand taken out (the at-rest rule kept), served on 8963: the landing
check is green at H1, H2, H4 and red at exactly H5, 8 of 8 pills moved (logs/landing-nofinger.log). With it: green
(logs/landing-tree-after2.log, 50 s).

## Other checks run on the tree after the change

- check-default-picks-v1 whole (page laws on ii-samuel, obadiah, nahum and the rest; node laws): every law green but
  D20, red as on HEAD (the receipt on disk is the ship's; the page builder's notes say the same), 5 min 33 s
  (logs/default-picks-tree.log). D12, D13 and D15 open first cards at rest and read them.
- check-press-paints-before-seen-v1 L2 alone on Ruth (scratch copy, L1 skipped; L1 opens no card): green, 24 s.

## Committed (branch toggles-fixes, scratch pt)

- 7386615f10 the page and its checks: reader/zone.html, reader/tools/check-landing-holds-the-card-v1.mjs,
  reader/tools/check-press-paints-before-seen-v1.mjs.
- 5685197294 the gate's S1: reader/tools/check-same-product-v1.mjs.

Ranges changed (line numbers in the committed files):
- zone.html: the comment above defaultPicksReady 3907-3908; the sources' lines comment in renderReadings 10643-10645;
  the comment above reopenForDefaults and THE FILE LANDS UNDER THE READER'S HAND 18137-18157; dfltFinger and its
  pointerdown listener 18159-18162; reopenCardFree 18163-18178; reopenForDefaults 18182.
- check-same-product-v1.mjs: the S1 header 38-44; UNITS 127-128; apartSeen 131; heldIn 164-192 and 203-211; unitsIn
  216-217; the loop's hold 367-381; the summary line 398.
- check-press-paints-before-seen-v1.mjs: the L2 header 20-22; L2's wait for the book's file 119-129.
- check-landing-holds-the-card-v1.mjs: H1 and H2 rewritten, H4 and H5 added (the file's laws and helpers).

## The BSB's reopen, measured on the first card (probes/first-card-files.mjs, out/first-card-files-tree.json)

Ruth at rest on the tree, the first word clicked, nothing held: the default picks' file landed at 1,955 ms and the
BSB's at 1,956 ms, and the card stood with one source line: the BSB's landing built it again with the default file
already here. With the BSB's file held 3 s: the default file at 1,899 ms, the BSB's at 4,875 ms, and again one source
line, the card built again at 4,875 ms. So in use the first card at rest is still built again once, by the BSB's
file, whichever lands last; this round's fix takes away the default file's own rebuild (and the second jump where the
default file lands last), and the BSB's is the lead's call above.
