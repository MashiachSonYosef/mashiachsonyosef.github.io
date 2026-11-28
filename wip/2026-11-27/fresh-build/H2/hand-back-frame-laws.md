## H2 hand-back: the frame's laws under the place card at rest (final code)

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`
`N` = `/home/user/mashiachsonyosef.github.io/wip/2026-11-27/fresh-build`

**Result.** At rest, 43 of the 70 checks pass and 27 are red. Every red is on the section 3 list, is the F6 red, or is one of the two F3-ground reds you have accepted. With the old card forced, 70 of 70 pass.

S/s16 is at «after»: there is no meta reader-card line, and all four swapped files match their sha256 (zone.html `197b29998d16ec2e…`). Nothing was committed, pushed or shipped.

**One change since the first restart.** On the final code, picture 01 showed the F6 sentence cut off after «…which no source gives at this». Only two lines of it fit in the record slot.
- **The fix:** in zone.html `fitBandsNow`, the sentence (`sayWhole`) is now owed its whole height wherever a record is owed two lines (windows 660 px tall and up). That is 18 diff lines, including two comments.
- **Measured whole:** at 412×915 on all four unoffered cards tried, plus Daniel 1:16:5; at 375×667 and 900×440 on Ruth 3:12:5.
- **Rerun on that code:** everything (the 70 at rest, the walk, the 141, the presses, the pictures, the switch proofs, the tree checks, the 70 forced).
- **The second restart (10:18)** stopped the walk partway. The walk and everything after it ran again in resumable chains. Each step writes its log when it ends.

### 1. What changed, per F-item, with counts

**F1. The card presses the line.**
- **Code changes:**
  - The line's own reading leads its pill group (`lineLead`).
  - Under a non-STEP default source, its picks 2 to n rank by `dfltRank`, which replaces the old sort that put the layer's pills first.
  - Place rows carry the source's stated year (`placeYear`: MACULA 2022, UBS 2023), and `EARLIEST_FIRST` gives place pills no year rank.
  - Lines read live under the source switches ask the place card by address (`placeLiveLine`).
  - `lineFirst` falls back to the drawn signs-off form, so «<obj.>» and «<the> + -lehemite» are pressed first.
- **line-follows-card F6** (UBS «not» against «almost», BDB «also» against «even»): the line is right. That source has no pick of its own at the place, and the old layer-first sort put the layer's other pills ahead of the line's reading.
- **Walk counts:** 12,889 of 13,495 cells open pressed on the line's reading. «No pill pressed at rest» is 0, except the 5 F6 cards, all among the 73.
- **Lines do not move:** 30,559 lines (Ruth, Amos, Jonah, Daniel, Genesis) equal S/base at rest, with the switch on, and off again. default-picks D7 (every line under each source) is ok.
- **Laws:** ok are card-opens-on-the-line (2), line-follows-card (7), line-reads-the-place P4 (7), live-line-asks-its-own-word V2/V3 (3), default-picks D12 and source-switch S4. default-picks D5 is the F6 red. rulings-under-sources U7/U9 is on the list.

**F2. The orders and overlays.** The «order» and «reads» rows are CARD_ONLY.
- **(b), behind «readings matched by spelling»:** each matches by letters (the key, the form anywhere, or the catalog's cards under the letters):
  - corpus, outside the era, masoretic, cites here, vowels differ and characters;
  - the three witnessed columns, and oldest first;
  - the overlays (Jastrow, Samaritan, the span store). Their chips stay in the row of sources and switch nothing on the place card.
  - The piece store lives on the older card only; the place answers already give its pieces by address.
- **(a):** «at this place» is the default, with 0 moves.
- **(a), the source switches under «at this place»:** lines read live follow the place card's first pill. Against the older card, with 5 sources off (MSAM2, M4, M14, M9, M17):
  - Amos: 1,283 of 2,042 lines move (1,556 read live);
  - Daniel: 3,571 of 5,923 (4,135 read live).
- An order remembered from the older card still orders the lines. The place card then says so (pictures 03/03c).

**F3. What rests shut rests shut.**
- **Code:** `ubsCollocations` is in the block, and pills carry `colloc`. Resting kinds are held back, counted, and opened by the same press. The kinds block now shows under either card.
- **Pills per cell, over 616,975 cells:**

| | median | p95 | p99 | largest |
|---|---|---|---|---|
| before | 2 | 46 | 131 | 153 |
| after | 2 | 37 | 82 | 100 |

  1,309,074 pills are held back, in 98,886 cells. Genesis 1:3:5 goes from 148 to 83, with «65 off by default · show».
- **Walk:** 51,275 pills rest shut in 4,399 cells; 4,398 of those cells say so.
- **Laws:** words-stand-alone is ok (9). For dictionary-kinds K4, only the UBS-row clause is red, and it is on the list.

**F4. The export and the chip.**
- **Code:** the export asks the place card by address, whole-word cell or each line piece (`placeCite`). STEP's credit rides its records.
- **Counts:** piece cells 129 of 129 reach the export (32 of 129 in the pills step), and whole-word cells 164 of 164.
- **Laws:** citations C10/C11 is ok (17), and english-license is ok (5).

**F5. Pairs, runs and read forms.**
- **Code:** `formFor("qere:k")` / `"ketiv:k"` asks each word of a half written as several words. The run's several-word blocks ask the run's own words by address.
- **ok:** readers-faults-cards C10 (the «Beth- + -el» block), kq-lead-follows-switch K7 (51), readers-faults-pairs F1/F9 (4), readers-faults-load law 10 (6, by the yield class), and kq-declared-weld KW3.
- **On the list:** read-form-offsets R3 (piece store) and run-card-forms R6 (store shard).

**F6. The 141 words.**
- **Today's line among the pills (54):** 44 are pressed first. 9 open on a run's or half's own cell, where the line is not offered, and say the sentence. Esther 4:4 has no pill.
- **No resting line (14):** 12 open on a pill. 2 have no pill at all: 1 Samuel 25:18:10 and 2 Kings 2:16:25.
- **Line not among the pills (73):** 59 press nothing and say the sentence. 13 open on a cell whose own piece is offered, pressed first. 2 Samuel 5:2 has no pill.
- **The sentence:** it is now drawn whole (picture 01).

**F7. The written-form note** now reads: «ketiv — written · no vowels of its own; its readings are what each source gives for the written form at this word, by the source's own address». The qere note is the same.

**F8. compspan** is ok both ways: at rest in 733 s and forced in 375 s, 4 laws each.

**F9. STEP's asked credit.**
- **One place:** `STEP_CREDIT` in tools/place-card-v1.mjs, read through `PLACE.credits("step")`.
- **Today's card:** `mLine` adds «Data created by STEPBible.org based on work at Tyndale House, Cambridge: STEPBible-Data», linked to https://STEPBible.github.io/STEPBible-Data, after the chip of every `stepbible_` record. M45 is left as it was.
- **The export, both cards:** a `credit:` line, which picture 04's export shows.

### 2. The 70 checks

**At rest:** S/s46w/logs/suite-frame-rest-final.log, plus compspan.

ok, with law counts:
- block-in-table 5; card-channels 7; card-opens-on-the-line 2; citations 17; concordance-counts-the-line 5; default-spans 8; drag-offscreen 11; english-license 5;
- hud-toggles 8; kq-graded 3; kq-lead-follows-switch 51; landing-holds-the-card 6; lattice-parts-in-card 5; levels 21; line-follows-card 7; line-reads-the-place 7;
- live-line-asks-its-own-word 3; maqaf-pair-drawn 5; names-pill 7; nothing-overlaps 42; pill-whole 6; proper-name 5;
- readers-faults-cards 7; readers-faults-load 6; readers-faults-pairs 4; readers-faults-place 1; reading-language 3; reading-rows 3; row-and-card-name-sources 3;
- ruled-equals-first-paint 12; ruled-mark 10; ruled-split-fits 2; run-cards 5; run-line-follows-division 3; search 18; source-suggested 7; span-store 9;
- usable-card 56; volume-in-card 8; whole-form-parts 1; word-address 7; words-stand-alone 9; compspan-coverage 4.

Red, with the laws that fail:
- **On the list (24):**
  - dictionary-kinds K4 (the UBS-row clause);
  - dictionary-toggle and reset-pill (both time out waiting for the concordance pill);
  - form-of F3 F7 F8 F11 F13 F14; kq-declared-weld KW1 KW2 KW7;
  - lattice-orders (first pill under masoretic and under vowels differ); ledger-divisions D5;
  - made-spaces M10 M11; masorah-toggle M2 M4; overlays O6; piece-class C2 C3;
  - piece-store P3 P4 P5 P6 P7 P9; pointing-gate G2 G5 G6; pointing-grade P5b;
  - read-form-offsets R3; read-words R7 R8; readers-faults-rail F3;
  - rulings-under-sources U7 U9; run-card-forms R6;
  - source-switch (the S5 clause under oldest first); span-grade G6 G7 G9; strongs-hedges H5;
  - witnessed-order W4; word-senses W3 W4 W5 W6.
- **F6 (1):** default-picks D5.
- **F3 ground, your decision (2):**
  - gloss-whole (the ruled reading shown whole, and the page grew only downward);
  - record-pinned (no reading capped away; at rest the largest card here has 84 readings, and with kinds opened it has 149, all present).

The verdicts, and the FAIL lines of every red, are the same as the run before the sentence fix.

**Forced:** S/s46w/logs/suite-frame-forced-final.log. 69 ok, 0 FAILED, plus compspan ok, so 70 of 70. Law counts:
- block-in-table 5; card-channels 7; card-opens-on-the-line 2; citations 17; concordance-counts-the-line 5; default-picks 26; default-spans 8;
- dictionary-kinds 34; dictionary-toggle 11; drag-offscreen 11; english-license 5; form-of 17; gloss-whole 13; hud-toggles 8;
- kq-declared-weld 11; kq-graded 3; kq-lead-follows-switch 51; landing-holds-the-card 6; lattice-orders 24; lattice-parts-in-card 5;
- ledger-divisions 9; levels 21; line-follows-card 7; line-reads-the-place 7; live-line 3; made-spaces 11; maqaf-pair-drawn 5;
- masorah-toggle 15; names-pill 7; nothing-overlaps 42; overlays 9; piece-class 5; piece-store 25; pill-whole 6;
- pointing-gate 6; pointing-grade 8; proper-name 5; read-form-offsets 3; read-words 9;
- readers-faults-cards 7; readers-faults-load 6; readers-faults-pairs 4; readers-faults-place 1; readers-faults-rail 6;
- reading-language 3; reading-rows 3; record-pinned 24; reset-pill 7; row-and-card-name-sources 3;
- ruled-equals-first-paint 12; ruled-mark 10; ruled-split-fits 2; rulings-under-sources 11; run-card-forms 10; run-cards 5;
- run-line-follows-division 3; search 18; source-suggested 7; source-switch 15; span-grade 10; span-store 9; strongs-hedges 5;
- usable-card 56; volume-in-card 8; whole-form-parts 1; witnessed-order 6; word-address 7; word-senses 9; words-stand-alone 9; compspan 4.

### 3. The section 3 list
`/home/user/mashiachsonyosef.github.io/wip/2026-11-27/fresh-build/H2/laws-of-the-spelling-card.md`
- It covers all 24 listed laws. Each entry gives the check and law, the feature, why it matches by letters, and its forced verdict.
- The two F3-ground reds are set apart from the list.

### 4. The F6 red
default-picks D5, at Daniel 1:16:5. The line is «delicaci[es] + their», which no source gives at that place. The card presses nothing and says so. D5 asks for the card pressed on the line. This is owed to the next ship (task 169).

### 5. The proofs (final code)
- **One-place check:** 22 ok, including the new P20 (30,349 of 92,011 UBS pills marked collocation-only). On a spoiled copy, P20 fails with 30,349 wrong, and the module was restored. Run on the final module, which has not changed since.
- **Walk:**
  - 13,497 words, all as the data; heads 13,432, and 65 name a run's range; taps 87 of 87.
  - Open and shut: 748 cards and 5,914 entries, 0 moved.
  - Median 36.7 ms, p95 59.8.
  - 46 aborted entry requests and no other errors; 0 faults.
  - Pills: 13,495 cells as the files; 225,443 shown; 600 held by the signs switch; 6 empty cells, each said; 5 unoffered, all among the 73. unfoldingWord is unchanged (10,700 / 1,514 W / 1,050).
- **Presses:** 370 opened, 313 pressed.
  - The line showed the pill 313 of 313; reset returned it 313, every line of the verse 313, and the pill at default 313.
  - Export: whole-word cells 164 of 164, piece cells 129 of 129; today's card 12 of 20; 0 page errors.
  - Divisions: 50 of 50 pressed and redrawn, and their cells 50 of 50. Reset returned 49 of 50: at Nahum 2:1:10 the line read «—» 900 ms after reset. Pressed again three times, it returned 3 of 3, so this looks like my harness's wait.
- **Switch proofs:**
  - Switch on against S/base: 50 places, 48 the same once STEP's credit (on 17) is taken out. The other 2 are the longer foot's layout: at Micah 7:9:6 a commentary note is hidden, and at 1 Chronicles 14:2:5 a tight card folds its place-reading row.
  - Resting lines: as above.
- **Tree checks:** 8 of 8.
- **Pins:** unchanged since cut 9.

### 6. Pictures (S/s46w/shots-frame/)
- **01:** Ruth 3:12 word 5. Nothing is pressed, and the whole sentence is shown: «The line here, «mother», is today's reading, which no source gives at this place; STEP reads «if».» The F7 ketiv note is at the head.
- **02 / 02b:** Genesis 1:3 word 5, a root's cell at rest. 02 shows 83 readings and «65 off by default · show»; 02b shows the same cell opened, with 148.
- **03 / 03b / 03c:** Genesis 1:1 with «corpus» remembered.
  - 03 is word 2: the lines follow corpus («cut down», «judges», «sign»), and the place card presses «cut down» first, which BDB gives here.
  - 03b is the same word on the spelling card.
  - 03c is word 4: nothing is pressed, and the card says «…is the reading the order «corpus» puts first, an order of readings matched by spelling, and no source gives it at this place; STEP reads «<obj.>».»
- **04:** Genesis 1:7 word 1. The piece pill «to make» is pressed in the divided word's cell, and the line reads «and + to make». The export (png and txt) has «reading: to make · for: Genesis 1:7:1 (piece 2 of 2) · UBS … wording 2023 AD».
- **05:** Genesis 35:7 word 6. The run block of two words offers «Beth- + -el», with the sentence about «Bethel».
- **06 / 06b:** Genesis 1:7 word 1, STEP's credit on the place card and on the spelling card's record line, with the link.

### 7. What still reads badly
- **Same reading, two spellings:** on runs, the sentence sets a joined reading against the same reading in pieces: «Bethel» against «Beth- + -el», «Pedahzur» against «Pedah- + -zur», «Zurishaddai» against «Zuri- + -shaddai».
- **Line among the word's pills, no press:** 9 of these 54 words open on a run's or half's own cell and say the sentence instead of pressing the line.
- **Cells with no pill:** Esther 4:4, 2 Samuel 5:2, 1 Samuel 25:18:10 and 2 Kings 2:16:25.
- **03c:** UBS's reading «-» draws across three lines. The sentence nests guillemets, «STEP reads «<obj.>»».
- **The record slot** reads «Also given by …» without the lead record's own line (pictures 03 and 04).
- **The K4 clause** asks for a store row's text and `picked_at`, while the place card cites UBS's own references.
- **Live lines under the source switches** move a lot against the older card (Amos 1,283).
- **A remembered older-card order** still orders the lines at rest.
- **The switch-on page** differs from S/base by STEP's credit (17 of 50) and 2 layout effects.
- **Today's card's export** carries 12 of 20 piece-cell presses (older card, as before).
- **Windows under 660 px tall:** the sentence keeps the record's one-line floor. At 900×440 it was whole.
- **One cell** of 4,399 rests readings shut without saying so. I have not identified it.

### 8. Paths
- **Code:**
  - S/s16/reader/zone.html
  - S/s16/reader/place.html
  - S/s16/reader/tools/place-card-v1.mjs
  - S/s16/reader/tools/check-place-card-one-place-v1.mjs
- **List:** `N/H2/laws-of-the-spelling-card.md`, with its draft at S/s46w/laws-of-the-spelling-card.md.
- **Logs, in S/s46w/logs/:**
  - suite-frame-rest-final/ and .log, and suite-frame-compspan-rest-final.log;
  - suite-frame-forced-final/ and .log, suite-frame-compspan-forced-final.log, and suite-frame-forced-final.swap.log;
  - walk-frame-final.json and .log; f6-141-final.json and .log;
  - press-frame-final.json and .log, and press-nahum-again.json;
  - oldcard50final.log and oldcard50final-compare.log; lines-final.json and .log; lines-sources-final.json and .log;
  - one-place-frame-final.log; tree-cut8/*.say-fit.log; kinds-counts.json; shots-frame-final.log.
  - Superseded runs are in prior/.
- **Scripts:** S/s46w/scripts/. The resumable chains are h2-final-chain-e1.sh and e2.sh.
- **Pictures:** S/s46w/shots-frame/.
- **Scratch copies:** my zone.html copy and probe file are deleted.

Chromium's own calls to google hosts were refused by the proxy. They are not this work's, and nothing was routed around them.
