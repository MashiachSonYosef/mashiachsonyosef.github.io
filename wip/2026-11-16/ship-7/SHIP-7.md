# Ship 7, 16 November 2026 AD: the four cards and tasks 134 and 135

SHIP-STATUS: LANDED. `main` afea14aac6, `gh-pages` b7ca892aa8 (gh-pages follows main). Pages run 1374, success, at b7ca892a; live check run 72, success, at afea14aa.

The owner took the four cards of 16 November (`wip/2026-11-16/the-four-cards/FOUR-CARDS-2026-11-16.md`) with «ok update», and the two calls of that morning (task 134: a row with no pointing qualifies for none; task 135: STEP named, filling out last). The commit message, whole, is `logs/commit-message.txt`.

## How it was built

- Base `main` 8797fa4d5b. Task 135 ported from `S/n7` (one comment conflict, merged by hand), then three builders in parallel worktrees, each committing code only:
  - A, `ship7-pointing`: pointing-grade-rule-v5 (the joining dagesh), unpointed-row-rule-v1, own-pointing-rule-v1 (a store tool). Sent back once: its first v5 also set aside a headword's own first-letter dagesh, which let MACULA's «today» (a piece cut after the article) stand at Genesis 1:5's "day" and moved 752 readings back and 576 held at words with no joining dagesh. Now v5 reads only the text's own word both ways; card 4's figures reproduce to the unit (966 / 601 / 8,783 / 215) and nothing else moves.
  - B, `ship7-spans`: span-grade-rule-v1 (v169 pinned in `data/span-grade/`), span-order-rule-v1, span-line-rule-v1.
  - C, `ship7-notes`: strongs-hedges-rule-v1 (v170 pinned in `data/strongs-hedges-v1/`), provider-note-rule-v1 (H269), parts-a-press-away-rule-v1.
- Merged into `ship7` (one comment conflict with C; four with A, where B's counters joined A's: `pool.withheldUnpointed` declared once, A's wording, B's span counts kept).
- The store tools on the merged tree, each once: the made spaces' note (1 row, 1 shard), English Wiktionary's own pointing (16,239 rows: M13 15,610, M60 629; 256 shards; store 3c0b0da7dc2f -> f0e7d6a18a4a -> 54416ff5785b), the span grade's dry run (nothing to write; 473 held at 351 places).

## Proofs

- The round, whole (2,133 s), then its page steps again after the suite's fixes (1,138 s): 40 records, 403,451 resting lines; 12 chain books, 632,101 links at rest; 16 switches.
- Every resting line against live (`tools/lines-diff.mjs`, `logs/lines-diff.json`): 14 entries moved over 14 words in 8 works, every one by the no-pointing rule, none by the joining dagesh or the span grade:
  - Ezekiel 9:4, 40:34, 40:36 and 1 Samuel 22:13: Strong's «behold» (another word) gives way to English Wiktionary's «defective spelling of אליו». A pointer leading a line; live already holds 1,262 such lines (task 137).
  - 1 Samuel 2:10: the Classical Hebrew Words database's «unjust one», pointed exactly as the place, leads; Strong's concordance's «about» (H5922, right) has no pointing and is held back, and STEP gives the word no tag, so no entry keeps it. A known cost of the rule.
  - Ecclesiastes 5:17 «his life» for «keep alive»; Isaiah 39:2 «precious things» for «beat»; three «since» -> «(here-)after»; two «covet» -> «desire»; 1 Kings 21:29 «chief» -> «desire»; 1 Samuel 4:21 «I-chabod» -> «Ichabod’s».
- The 23 checks the builders named, on the merged tree: all pass.
- The suite, first pass: 3 of 172 failed; two were this ship's to fix:
  - check-form-of-v1 F13: the record named the store it was counted over before the store tools (3c0b0da7dc2f); rebaked, only that version moved (806 pills at 665 keys, unchanged).
  - check-rulings-under-sources-v1 U7: its form, Obadiah 1:8:2's whole form, now offers no reading at rest (it offered only Hebrew Wiktionary's «staging» and «direction», with no pointing). U7 now asks forms in turn; at the next, Nahum 1:14:2 and 3:6:2 (one form, «upon you» masculine and feminine), it found a real fault: the line painted the reader's ruled «about» at 3:6:2, where the pointing holds that reading back, and the card could not press it. Fixed in the page: ruled-reading-stands-rule-v1, a row giving the reading the reader ruled stays under the pointing, as a row of the place's own entry does. U7 red on the page before the fix («under MACULA: the card at 3:6:2 presses «at you», the press pressed «about»»), green after; the rule named in the check's GUARDS.
- The suite, final pass: 170 of 172 pass (189 runs in 59 min; 182 rules declared, 12 unguarded). check-nothing-unlanded-v1, red until landing, passes after it; check-run-card-forms-v1 gave no verdict in 1,500 s under the suite's load, and alone on the final tree all its laws pass in 39 s (`logs/run-card-forms-alone.log`).
- The gate: S1 holds. S2 found 30 first cards (the first three words of nine books' first verses, read on each sampled chapter page, task 112), byte-identical on both passes (`logs/gate-diff.txt`). Every one differs only by pills the pointing gate now holds back at rest. Read on the new tree under «keep» (`tools/s2-keep.mjs`), every pill live shows stands: 1,166 of 1,166 (Zephaniah 1:1's two forms of «to speak» now one pill with both form notes; «anyone» and «The Lord» print as the group's first source writes them).
- After landing: check-nothing-unlanded-v1 passes and leaves no scratch copy; the sha audit of gh-pages against main: 9,366 read-off files, 3,547 zone pins on 1,272 pages, 0 that do not match. `S/old` (8914) is now afea14aac6.

## Known costs and follow-ups

- Task 137: a pointer leads 1,266 resting lines (1,262 live before this ship, mostly the Tikkunei Zohar; 4 new). Card 1 says «a reading like «feminine of …» never leads a line»; span-line-rule-v1 does it for joined readings; single words next.
- 1 Samuel 2:10 «unjust one» (above): where STEP gives a word no tag, the entry gate cannot keep a right unpointed row against a wrong pointed one. MACULA's lemma (the zone's hp) could carry the entry where STEP's tag is missing.
- The piece-class gate still keeps one-letter rows with no pointing («silent»); task 134 was scoped to the pointing gate (builder A).
- The withheld-switch sentence on the whole form (about 38,900 places) says nothing of the parts' readings (builder C).
- To the corpus lane (letter of today): each span row's own entry (the 65 right phrases held back, Strong's 11 names of several words); the 1890 printing on the owner's word; names_this_verse widened for aligned sources; whether the lattice follows v5 and the unpointed rule.
