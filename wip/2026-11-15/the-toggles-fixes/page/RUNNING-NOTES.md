# The page part of the toggles fixes: running notes (15 November 2026)

Tree: scratch pt, branch toggles-fixes from main 46bbbf7d50. The page part edits reader/zone.html only, and
adds or amends the checks that would have caught each finding. Probes and logs: scratch v73/page/.

## Order of work (the brief's)

1. BLOCKING: a ruling painted over at card open under another default (sets of several pieces).
2. Lone halves of TAHOT's two-word readings under MACULA and UBS.
3. A ruled made pill withheld from the export elsewhere.
4. The names gate's count on pointer pills ("given as a name by its source").
5. The readiness signal at rest (window.__default.ready).
6. The nits: form-of wait; kept credit's chip title; pressed pill after a ruled made pill; three sentences; .r-more ink;
   the Menu mirror's aria; STEP's second reading at the 46 held places.
7. Reset after a ruling, timed on II Samuel and Psalms against live.

## Done so far (10:15 UTC), each proven by a probe against live (8914) and the tree (8921)

Probes and their outputs: scratch v73/page/probes, v73/page/out.

1. The ruling at card open (f1-ruling-open.mjs): live 9 faults (Ruth 1:1:5 painted «that there was» under MACULA;
   the card left open at 1:1:1 flipped to «and happened»; MACULA's own «and happened» ruled, back on STEP, 1:1:5 painted
   «and + it was» with «beacon» pressed; Daniel 1:1:1 «year» painted «in + year» with «+ whole age» pressed); tree:
   every ruling held, the card reads the ruling and presses it (the block's «happen» on a piece ruling).
   How: the card opens on the division its ruling stands on (ruledOnPieces / ruledWhole in openHud); an open paints
   nothing over a ruled line (paintGloss); a ruled made pill is made again in the pool wherever the form stands
   (withRuledMade), so it is the pressed pill (nit 7 with it).
2. Lone halves (split-count.mjs): live Ruth 4 / Daniel 16 / Amos 3 lone halves under MACULA and under UBS; tree 0
   under every source, the pairs whole. How: defaultAt holds a word of the place's reading across words (TAHOT's
   «Beth-» «-lehem») to a source's line only where that source reads every word of it (dfltHalvesOf); the card's label
   says so («one reading across 2 words, MACULA reads 1 of them») instead of «MACULA has none here».
   check-default-picks-v1's model (D7) learned the same rule (acrossOf, wholeAcross).
3. The export of a ruled made pill (export-ruled.mjs): live «1 reading was not exported» at Ruth 1:1 and 1:19 under
   MACULA, «2» back on STEP; tree 0, each cited from MACULA. How: ruledMadeAt hands the export a place that makes the
   ruled row again.
4. Pointers to a name (f4-names.mjs): live Genesis 32:29:11 «2 given as a name», 42:16:1 «1 given as a name» (pointers
   counted); tree 32:29:11 «1 given as a name» (a row its source marks a name), and the pointers print as themselves
   («second-person masculine singular past (suffix conjugation) of ... (sará)»); at the name place 11:29:9 both resolve.
5. Ready at rest: window.__default.ready is true at once where the line rests on STEP or no source is in force.
6. Nits (n6-small.mjs, formof-wait.mjs): the card draws at once with the form-of map held back 12 s (tree 67 pills at
   1.5 s, live 0); the ruled made reading's chip says «MACULA’s own reading at Ruth 1:1:1, chosen by the reader for
   every place this form stands»; the pressed pill is the ruling (Ruth 1:1:5, 1:19:8); the reset title, STEP's title
   and the note under another order; a second that fills nothing is no second, the rail draws it dead; the picks' words
   in the reading's ink, the dead «#hud .r-more» rule gone (cursor and size); the Menu's mirror carries
   aria-expanded and aria-controls; STEP's second reading at the held places says «(STEP reads this word as two)».
7. The reset after a ruling (t7-reset.mjs; a word ruled, MACULA pressed, UBS chosen as its second, reset pressed).
   As loaded (the first 9 to 12 sections built) the reset is as fast as live: II Samuel live 377 ms, tree 612 to
   673 ms; Psalms live 689 ms, tree 585 ms (load 6). With every section built it was slow, and the cause was the
   reset's own: it laid every built section again after the switches had already drawn every line anew (II Samuel
   695 sections, 12,003 lines made anew; Psalms 2,527 sections, 22,803 lines). Now it lays again only the sections a
   ruling stands in (relayBuiltSections(only)): II Samuel 13.5 s live, 9.6 s tree (113 lines made anew); Psalms
   57.1 s live, 20.5 s tree (974 made anew, the ruled «which» standing in many sections); every line after the reset
   is a fresh page's first paint (0 differ of 11,032 and 19,583). What is left is the switch's own repaint, the same
   on live and on the tree: STEP pressed from MACULA with every section built, II Samuel 5.2 s, Psalms 12.3 s, the
   profile's self time in fitRunLine (2.75 s of II Samuel's), its forced layouts per run. That is the completeness
   critic's N3 (a source press repaints every built line in one task), in repaintGlossOrder and fitRunLine, outside
   this finding's functions: left for the second round.

## Commits (branch toggles-fixes)

- 4c7edc00f3 «A ruling holds at its card under every source; a reading across words stands or goes whole»: zone.html
  (items 1 to 7), check-default-picks-v1.mjs (D7's model: acrossOf, wholeAcross; placesOf's beginsHalf/endsHalf;
  moreWant's «STEP reads this word as two»; the header's D7), and the new check-rulings-under-sources-v1.mjs (U1 to
  U6: red on live, Obadiah and Ruth; green on the tree, 43 s).
- daa33c2785 «Three checks hold the page part's fixes»: check-names-gate-v1 N9 (item 4; SERVE_BASE added),
  check-form-of-v1 F12 (the form-of wait), check-menu-switches-v1 M2 (the mirror's aria-expanded, aria-controls).
  Each red on live, green on the tree.

## Readiness, the contract (item 5; the tools part made its two checks hold it, commit ec22497676)

window.__default.ready is true once every line stands as the sources in force draw it: at once at rest on STEP, or
with no source in force (another order on the reads switch, a work the index does not list); under MACULA, UBS or
BDB once that source's book file is here; failed is true where the file could not be fetched (every line is then
the line as it rests). A card asking for the book file at rest does not make ready false. Probe n5-ready.mjs (Ruth):
live at rest {on: step, ready: false} and «not in 35 s»; the tree ready at first paint (4 ms); under
?default=macula both ready once the file is here (7 ms, 4 ms).

## The checks run (logs: scratch v73/page/out/checks)

| check | tree | live |
|---|---|---|
| check-rulings-under-sources-v1 (new) | all pass, 43 s | U1 to U5 FAIL |
| check-default-picks-v1 (node laws, the page laws on w1 ii-samuel, w2 obadiah, w3 nahum, w4 tikkunei-zohar) | D4 to D19 pass, D20 FAIL (the receipt on disk is HEAD's: the tools part's D20 is green on the new receipt; the round's bake writes it), 405 s | not run |
| check-ruled-equals-first-paint-v1 | all pass (E0 silent), 96 s | (tools part: E0 red at rest) |
| check-card-opens-on-the-line-v1 | all pass, 307 s (23 settings, 230 cards) | (tools part: HEAD's check 1,522 s) |
| check-reset-pill-v1 | all pass, 26 s | |
| check-menu-switches-v1 (with M2's aria) | all pass, 10 s | M2, M3, M4 FAIL |
| check-dictionary-toggle-v1 | all pass, 65 s | |
| check-line-reads-the-place-v1, Ruth | P3 FAIL, 75 s | P3 FAIL, the same (pre-existing) |
| check-line-reads-the-place-v1, Amos (the default) | all pass, 72 s | |
| check-form-of-v1 (with F12) | all pass, 97 s | F12 FAIL |
| check-names-gate-v1 (with N9) | all pass, 30 s | N9 FAIL |
| check-color-channels-v1 | all pass, 8 s | |

The Ruth P3 red is not this part's: it is the same on live (main 46bbbf7d50). Ruth 1:1:19 and 1:2:9, «sons + his»
(the set's pieces «sons», «his»): the card opens on the core block and presses «young», owed the line's piece «sons».
For the lead (the core block's selection, core-block-rule-v1; check-line-reads-the-place-v1 is green on Amos).

Lint: the page at the baseline (4 no-misleading-character-class, 175 no-use-before-define, 9 no-useless-assignment,
1 no-unused-vars ORDER_RULE_ID, 2 no-unmodified-loop-condition); every tool changed lints clean.

## For the lead

- The merge with the kinds' branch: zone.html's resetPill title (line 2553) stands in the header row the phone fix
  moves; the rest of this part's ranges are listed in the report.
- Re-bake the default picks' receipt (the round with --default-picks, or bake-default-picks-v1 --receipt-only), then
  check-default-picks-v1 whole (D20 green), --ledger and --self-test.
- The second round: the critic's N1 to N9 (README); N3 is item 7's remainder.
