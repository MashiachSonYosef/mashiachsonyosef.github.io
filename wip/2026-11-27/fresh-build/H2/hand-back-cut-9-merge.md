H2: the cut-9 merge into S/s16 is done, and every proof the brief asks for passes. S/s16 is left in the «after» state (h2-swap/state reads "after"). Neither place.html nor zone.html has a meta reader-card line (grep count 0 in both). Nothing was committed, pushed or shipped. Nothing was written outside S/s16 and S/s46w/. The store was only read, through PLACE_ANSWERS_STORE_READER="node S/r2.mjs"; r2-put was never used. No write or fetch was refused.

S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad

## What changed
- **The eight tools.** I applied S/s49w/cut9-tools.diff to S/s16 with patch -p1. The dry run was clean, and so was the patch. The eight tools are now byte-equal to S/s14's:
  - build-place-answers-entries-v1.mjs, check-place-answers-entries-v1.mjs, place-answers-bridges-v1.mjs, place-answers-entries-lib-v1.mjs
  - place-answers-entries-strongs-v1.mjs, place-answers-entries-tables-v1.mjs, say-place-answers-fetch-plan-v1.mjs, fetch-place-answers-sources-v1.sh
  - I had not changed any of them since 19:00 (their times run 03:44 to 13:55), so no merge by hand was needed.
  - The page tools (place-answers-page, check-place-answers-page, project-place-answers-page) also equal S/s14's.
- **place-card-v1.mjs** (the card's one block):
  - The ABSENT line from N/V/cut9/FOR-THE-CARD.md is in, with W: «This dictionary files one entry under this number, and by its own reference to Brown-Driver-Briggs that entry is another word of the number than the one STEP's letter names.»
  - The unfoldingWord credits paragraph is in, word for word from FOR-THE-CARD.md, with the revision.
  - I updated the comment over the old H skip: since the ninth cut no line says H, and a W line names no entry, so its row gives the reason from ABSENT.W.
  - The block is carried line for line into place.html (lines 161 to 873) and zone.html (lines 4184 to 4896) with carry-place-card.py.
- **A new law, P19**, in check-place-card-one-place-v1.mjs:
  - Wherever the part's line says W for unfoldingword_uhal, the cell offers no unfoldingWord pill, and the card's unfoldingWord row carries the W sentence.
  - Across all the tag files, no W line names an id.
- **Its spoil** is "P19" in S/s46w/scripts/h2-spoil.py. It makes pillsAt give an unfoldingWord id under W.
- **Scripts:** h2-walk.mjs now counts the unfoldingWord rows per card. h2-shot.mjs has a new `scroll: "uhal"` option.

## The proofs, with counts
- **Make** with make-place-answers-v1.sh on S/s49w/received/fetched-cut9: clean.
- **Comparison:** exit 0. 305,431 words; 305,290 are equal, and the other 141 are exactly the list, with every cause holding.
- **One-place check:** 21 ok.
  - P6: 254,940 rows, none undrawn.
  - P7: 741 words, 5,867 entries.
  - P16: 248,457 pills in 14,952 cells of 7,415 words.
  - P18: 129,961 meanings.
  - P19: 837 W cells and 837 rows that say why; 745 W lines, none with ids.
- **P19 on the spoiled copy:** P19 fails with 671 found wrong. P16 (1,129), P2 and P3 also go red, so 4 checks fail in all. The module was restored and confirmed byte-equal with cmp.
- **The walk:**
  - 13,497 words: pressed, opened and matched are all 13,497. The head count is 13,432, and taps are 87/87.
  - Timing: median 34.2/34.5 ms, p95 58.9/59.3 ms, max 434 ms.
  - 748 cards with 5,914 entries; 0 moved. There were 34 aborted requests, 0 faults and no JS page errors.
  - Pills: 13,493 cells, the same as the files, all shown as given. 276,693 pills shown; 602 held back by the signs switch; 8 cells empty; no cell sits with no pill pressed at rest. The card's line equals the line under the word on 12,889 words.
  - **unfoldingWord: 10,700 cards draw an unfoldingWord row (10,706 rows), 1,514 cards say W, and 1,050 say there is no entry.**
- **The 300 presses:**
  - 370 words opened, 313 pressed. The line followed on 313, and reset worked on 313. 7 words had no other pill to press.
  - Divisions and cells on 50 words: all pressed and redrawn, reset on 50.
  - Export: whole-word cells 164/164; piece cells 31/129 (that is your next step); today's card 5/20.
  - 0 page errors.
- **Switch proofs:**
  - With the switch on, the page equals S/base on 50/50 places, read twice, with 0 errors.
  - Resting lines: 30,559 across five books, the same as base at rest, with the switch on and with it off again; no errors.
- **The eight tree checks:** each exits 0, run alone. They are build-derived, k-maqaf-preserved-v2, ledger-declared, no-import-side-effects, nothing-hand-typed, nothing-hard-wired, scope-derived and sidecars-all-named.

## The pins
They equal S/s14's:

| Pin | sha256 |
|---|---|
| joined | 79eb1640a5db… |
| entries | f555ad5702c9… |
| places | 641953e29f93… |
| page | a173241d9367… |
| sources.json | 9950bf1accad… |

How the page pin moves: from cut 8's ab1afe1e4c50 to a173241d9367, and only because of the cut-9 data (unfoldingWord read whole, plus the W lines). The pills step changed no projection, and the page tools equal S/s14's.

## The pictures (S/s46w/shots-cut9/)
- 01: Genesis 1:3 word 5 at rest. It shows the line «and + there was», the cells, READINGS · 148 with «there was» pressed, and the listing below.
- 01b: the same word with «to be» pressed.
- 02 and 02b: Genesis 1:1 word 1, first the root's cell, then the prefix's cell.
- 03: the maqaf run's card at Genesis 1:3 words 5–6.
- 04: the chain's card at Malachi 2:5.
- 05: Ruth 3:12 word 5.
- 06: Exodus 30:33 word 11.
- 07: Genesis 1:11 word 7.
- 08 (new): Genesis 1:7 word 1, «made» (H6213H, a W word). It shows the line «and + he made», the cells, READINGS · 70 with «he made» pressed, and no unfoldingWord pill among them.
- 08b (new): the same card scrolled to its unfoldingWord row. The row shows the CC BY-SA 4.0 label and the W sentence, with «The other parts of this word» below it.

## What still reads badly
- The export carries a pill pressed on a piece in only 31 of 129 piece cells. This is your call (1), for the next step.
- The 73 words whose resting reading is not among their pills (plus 14 that have no line) are still open. This is your call (2), for the next step.
- On a W card the unfoldingWord row is a sentence only, and there is no unfoldingWord pill. That is the law, but on 1,514 cards readers lose that source.
- Root cells carry about 70 to 150 pills each (70 on «made»), which is a long scroll.
- The row and credits still name «unfoldingWord Hebrew and Aramaic Lexicon», while the lexicon calls itself «Unlocked Hebrew and Aramaic Lexicon». The name is kept as FOR-THE-CARD.md gives it.
- The written-form note «matched by letters only» still reads awkwardly.
- The 17 real gaps from the 70 checks at rest are still waiting for the next step.

## Paths
- Card block: S/s16/reader/tools/place-card-v1.mjs; carried into S/s16/reader/place.html and S/s16/reader/zone.html.
- Check: S/s16/reader/tools/check-place-card-one-place-v1.mjs (P19).
- The eight patched tools: S/s16/reader/tools/.
- Scripts: S/s46w/scripts/h2-spoil.py, h2-walk.mjs, h2-shot.mjs.
- Logs in S/s46w/logs/:
  - make-cut9.log, lines-compare-cut9.log, one-place-cut9.log, spoiled-cut9.log
  - walk-cut9.json/.log, press-cut9.json/.log
  - oldcard50c9-base.json, oldcard50c9-switch.json, oldcard50c9.log, lines-cut9.json/.log
  - tree-cut8/*.cut9.log
  - shot-jobs-cut9.json (08b now names scroll "uhal") and shot-jobs-cut9-08b.json
- Pictures: S/s46w/shots-cut9/
