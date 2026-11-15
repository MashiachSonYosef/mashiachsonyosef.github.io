# Call 4, STEP's own words as the line: design for ship 5

**What I measured on.** The live build, main 46bbbf7d50:
- its resting-line records, `S/v76/live-records`;
- its zones, default-picks index and five default-picks book files, taken read-only with `git show 46bbbf7d50:…` into `D/live/`;
- the records of the build before it, 857a3dc0fb, in `D/pre3-records/`.

The combined ship moves some of these lines (the kinds, the read words, the store round). Its build must measure them again on its own tree.

**What I cite.** Code is cited from `S/ship/reader` as it stands now:
- zone.html, sha256 9bac9f9c…
- tools/bake-default-picks-v1.mjs, f1152de8…
- tools/check-same-product-v1.mjs, 303923db…
- tools/check-default-picks-v1.mjs, c1c97cd6…

**Paths.**
- S = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`
- D = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call4`

Nothing was written into S/ship. I ran no browser, no bake and no round. v181's three lists came from the lane's store with `r2.mjs get` into D/dl-v181; their sha256 match the v181 letter, including 12228dc4…778a.

## 1. What call 4's lines say, and how 853 become 785

The list is `data/audit-calls/calls-v1/call4-steps-reading-stands-v1.jsonl`, sha256 8e08514b…. It is the same bytes in both pins: `data/audit-calls/PIN.json` and `data/default-picks/PIN.json:145-157` (held_split_v189). m1 holds it to the pin.

Each line gives (m14):
- **book, p, s:** 35 books; p is c:v:w; s is the word as written, and at a pair the whole «(K) [Q]» form.
- **tie_layer:** STEP's own tie at the place.
  - open-q11, 784: STEP spells the word otherwise.
  - open-q1, 47: two words in the source.
  - open-q14, 22: two words on one branch of a pair.
- **agreement_tahot:** SAME 792, MAQAF 44, KETIV_QERE 12, SHIFTED 3, OTHER 2.
- **tahot (STEP's row):** marker =L 819, =Q(K) 29, =Q(k) 3, =L(AH+B) 1, =L(P) 1.
- **prints_now, line_now:** v181's reading of the page on 13 November. A_ROW_BY_LETTERS 653, UNDER_NO_LINE 185, STEPS_READING_NOW 8, DRAWN_DIFFERENTLY 4, UNDER_A_LINE_OVER_SEVERAL_WORDS 3.
- **steps_words:** given at 845. « | » appears at 55. «/ /», a read-word boundary, appears at 4, all of them v192 places.
- **piece_store_lacks_the_place:** 851.
- **action:** steps_words_are_the_line 845, none 8.

How the 853 split (m2, m5, m12, m3):

| class | places | what they are | ship 5 |
|---|---|---|---|
| none | 8 | 7 v192 TIES pairs, and Numbers 7:59:17 | All 8 already draw TAHOT's pieces live (PIECE:TAHOT). Nothing to write. |
| v192 line places | 14 | Exactly the call-4 pairs whose read form holds 2 or 3 words (13 and 1). 9 carry « \| » (open-q14), 5 do not. | v192's pieces carry them. |
| « \| » outside v192 | 46 | All open-q1 (MAQAF 44, OTHER 2). | Held. Live: 37 draw a row found by letters, 7 are bare, 2 sit under the run «Nergal-sar-ezer» (Jeremiah 39:3:10 and :18). |
| **lands** | **785** | 784 open-q11 plus Lamentations 4:3:10 (open-q14). That is 779 plain words and 6 pairs whose read form is one word. | STEP's words become the line. |

- The zone word's letters equal `s` at all 853 places (m1). So the plan's "refuse where the letters are not s" refuses nothing today. Keep it as a refusal anyway.
- The plan's «178 appear, 607 replace» is v181's picture of 13 November. At the 785, v181 counts UNDER_NO_LINE 178, A_ROW_BY_LETTERS 605, under a run 1, drawn otherwise 1 (m5).

## 2. What ship 3 already does, and what call 4 moves at rest

**How ship 3 works.**
- The bake (`bake-default-picks-v1.mjs:886-918`) writes `step_words [n, words]` into the index under four conditions:
  - STEP's pick 1 is a line pick of kind r;
  - the word is not a pair;
  - the word's place pieces do not answer;
  - call 4 does not write the place with « | » (heldSplit, :391-396, read through held_split_v189).
- The live receipt has 1,015 such rows. 46 of call 4's 55 « | » places would have had one and are held instead.
- The page prints these words only where today's line is bare (`zone.html:6095`, `stepOwn`), and never at a pair (:6086).
  - The bare test is `dfltTodayBare`, :13760-13764.
  - `lineUnder` asks the default layer first, :13659.
- The STEP pill's title, :15776-15783, says: «the line as it rests: … STEP's own words only where today's line was bare, and elsewhere today's line, whose chip names its own source». The chip, :6187, says: «STEP's own reading at this place, where today's line has no words».
- Measured (m9): 232 places are bare in 857a3dc0fb's records and print STEP's words, credited M4, in the live records. **175 of them are call-4 places**; the other 57 are owner question 2's 57.

**At the 785, three readings per place.** Every place is listed in D/m2-moves.json, under `rows`.
- **The default picks' STEP words** (m2, m8):
  - The live index has them at 779 places, every non-pair, and they equal call 4's words byte for byte at 779 of 779.
  - The 6 pairs have no index row. The live book files hold STEP's pick 1 equal to call 4's words at 6 of 6. At 4 of them, a «K» variant carries the written form's reading.
- **The live line under the STEP pill:**
  - 175: STEP's own words (ship 3's fills).
  - 170: a TAHOT row found by letters that prints the same words, credited M4.
  - 26: another source's row with the same words (M9 10, M14 8, M3 7, M17 1).
  - 410: another reading. By credit: M14 188; M4 122 (TAHOT's reading of another place spelled the same, for example Amos 1:10:6 «palaces + its»); M9 31; M25 18; M3 11; M1 8; M10, M11, M18 and M5 4 each; M17 3; M21 and M28 2 each; nine more with 1 each.
  - 3: bare.
  - 1: under the run «Obed-Edom» [M17].

**What call 4 makes of the live line:**
- **No move in the records: 345** (175 + 170).
- **Credit only, to M4: 26.** For example, Daniel 3:3:24 «Nebuchadnezzar» [M14].
- **Words replaced: 410.** For example:
  - Daniel 2:5:5 «circumcise(-ing)» [M14] becomes «word + the».
  - Amos 1:10:6 becomes «fortresses + its».
  - Judges 1:27:14 «(make to) abide(-ing)» becomes «[the] inhabitants of».
  - Lamentations 4:3:10 «like the + ostriches» [PIECE:TAHOT] becomes «like <the> + ostriches».
- **Appear where none stood: 3.** These are Ezekiel 6:3:15, II Samuel 18:8:4 and Psalms 145:6:4. This confirms the critic's N5 count of 3. All three are pairs: by its own rule the default layer leaves pairs alone (bake :846), and the live receipt lists all three as «a pair: its line keeps today's, which is bare».
- **With call 3: 1,** II Samuel 6:10:16.

So 440 resting lines move: 414 change their words and 26 change only their credit. The ship-5 gate must expect all of them, not only the 3 new lines the plan's line 210 counts.

**By book** (m10). The no-move column adds 175 + 170. The kinds number in brackets is explained in section 4.

| book | lands | no move (fill + same) | credit only | words replaced (live credit shut by the kinds) | appear | run |
|---|---|---|---|---|---|---|
| amos | 3 | 2+0 | 0 | 1 | 0 | 0 |
| daniel | 61 | 20+11 | 5 | 25 | 0 | 0 |
| deuteronomy | 39 | 6+6 | 0 | 27 (1) | 0 | 0 |
| ecclesiastes | 10 | 3+1 | 0 | 6 (1) | 0 | 0 |
| esther | 16 | 5+2 | 2 | 7 | 0 | 0 |
| exodus | 25 | 3+7 | 1 | 14 | 0 | 0 |
| ezekiel | 48 | 18+12 | 0 | 17 (1) | 1 | 0 |
| ezra | 12 | 3+5 | 0 | 4 (1) | 0 | 0 |
| genesis | 19 | 3+6 | 2 | 8 (1) | 0 | 0 |
| habakkuk | 2 | 0 | 0 | 2 (1) | 0 | 0 |
| hosea | 6 | 1+1 | 1 | 3 | 0 | 0 |
| i-chronicles | 26 | 4+8 | 4 | 10 | 0 | 0 |
| i-kings | 23 | 6+8 | 0 | 9 (1) | 0 | 0 |
| i-samuel | 24 | 3+10 | 0 | 11 | 0 | 0 |
| ii-chronicles | 32 | 6+9 | 0 | 17 | 0 | 0 |
| ii-kings | 30 | 2+8 | 3 | 17 | 0 | 0 |
| ii-samuel | 25 | 3+6 | 2 | 12 (1) | 1 | 1 |
| isaiah | 35 | 6+6 | 0 | 23 (2) | 0 | 0 |
| jeremiah | 44 | 5+15 | 0 | 24 (2) | 0 | 0 |
| job | 39 | 10+3 | 0 | 26 | 0 | 0 |
| joshua | 12 | 2+4 | 1 | 5 | 0 | 0 |
| judges | 32 | 10+7 | 1 | 14 (1) | 0 | 0 |
| lamentations | 14 | 4+2 | 0 | 8 | 0 | 0 |
| leviticus | 14 | 4+3 | 0 | 7 | 0 | 0 |
| malachi | 3 | 1+0 | 0 | 2 | 0 | 0 |
| micah | 3 | 1+0 | 0 | 2 (1) | 0 | 0 |
| nahum | 5 | 2+0 | 0 | 3 | 0 | 0 |
| nehemiah | 24 | 7+4 | 1 | 12 | 0 | 0 |
| numbers | 30 | 1+9 | 2 | 18 (1) | 0 | 0 |
| proverbs | 35 | 9+4 | 0 | 22 | 0 | 0 |
| psalms | 66 | 19+9 | 1 | 36 (3) | 1 | 0 |
| ruth | 8 | 1+2 | 0 | 5 | 0 | 0 |
| song-of-songs | 12 | 1+2 | 0 | 9 | 0 | 0 |
| zechariah | 7 | 3+0 | 0 | 4 | 0 | 0 |
| zephaniah | 1 | 1+0 | 0 | 0 | 0 | 0 |
| **all** | **785** | **175+170** | **26** | **410 (18)** | **3** | **1** |

- The chain books (the Twelve) hold 30 of the 785: 17 change their words and 1 only its credit.
- **Question 3's 157:** none of the 853 is among them. m1 rebuilds the 157 by the critic's road: v1.1's 212 rest fills less the 55 bare words. The 157 are already in the index's step_words. So the rule must stay bounded by call 4's category. "STEP's words wherever STEP has a pick" would land question 3, which is held.

## 3. The mechanism: one rule, one place

**The planned projector is not one rule in one place.** `tools/project-steps-reading-v1.mjs` would be a second copy of five things that already exist:
1. **A second reader of call 4.** The bake already reads the pinned copy (bake :391-396). check-default-picks reads it as its second road (:362-372). check-audit-calls-v1 holds the two pins equal (:130-138).
2. **A second carrier of STEP's words.** step_words already carries them at 779 of the 785, byte for byte; the book files carry the other 6.
3. **A second writer of the line.** The default layer already draws STEP's words credited M4 (zone.html:6095).
4. **A second owed set.** The gate reads step_words from the index (check-same-product-v1.mjs:203-217) and expects STEP's words only where the old line is blank (:405, :428-432). D3 and D5 hold the index to the records (check-default-picks-v1.mjs:802-845, :905-938). None of them can see a zone field without reading call 4 again.
5. **A zone write that must be redone every round.** It would have to be laid again after every round's lattice step, as the read words are (round-v1.sh, zones step). It would also have to copy `placeYields` (zone.html:6068-6075) to step aside under oldest first, the headword, a license class or the letters. The default layer already does that at :6086, and so already stays off the line `check-disk-gloss-is-the-line-v1` holds under oldest first.

**The rule, stated once.** At a call-4 place whose action is steps_words_are_the_line:
- if STEP's words are not written with « | »;
- and the place is not a pair whose read form holds several words (that is v192's category, from the zone's own `kq.words_read`; m12);

then the line under STEP is STEP's own pick 1, credited to STEP (M4), whatever today's line is. Everywhere else, STEP's words stand only where today's line is bare.

**Where it lives.**

**The data: `tools/bake-default-picks-v1.mjs`, the only reader of call 4.**
- **:391-396:** derive `stands` beside heldSplit from the same pinned list. Refuse if:
  - a place is not a zone word whose letters are `s` (853/853 pass today);
  - STEP's pick 1 after the mends is not call 4's `steps_words` byte for byte (785/785 pass today);
  - a stands place is a « | » place or a pair whose read form holds several words.
- **:886-918:** write `[n, words, 1]` at each stands place, the 6 pairs included, and count it as printing (stepWordsAt 2, :895-902) whatever the record draws.
- **:843-850:** never mark a stands place as resting bare.
- **Header :66-104 and receipt :1183-1192:** say so, and count the stands places (785).

**The page: `zone.html`.**
- **:4865:** keep the third element. Today the map is `[r[0], r[1]]`, which drops it.
- **:6095** is the only use of DFLT_STEP_WORDS. Change the test to `DFLT_STEP_WORDS.has(n) && (stands(n) || dfltTodayBare(word))`.
- **Pairs.** A pair's line never asks lineUnder (:14104-14111). Change both places that ask the source's own reading:
  - `kqPlace`, :5848-5866;
  - the path for a branch of several words in `kqPickG`, :5917-5921.

  In both, a stands pair takes STEP's words and backs the read half. STEP's own data says which half: call 4's tahot marker is =Q(K) or =Q(k) at all 6, and the ledger's pick 1 is the read form's reading while its «K» variant is the written form's (m8). This is the owner's pair rule (zone.html:5925-5931): the written half backs the line only on a ruling or on the source's own reading of the place.
  - At Lamentations 4:3:10 this moves the backing from the ketiv group, whose joined letters the pieces happen to spell, to the qere that STEP's row names. Put-back 5 should say so.
- **:6152-6156, the halves rule:** count a word read by its own place pieces as read by STEP. Only II Samuel 6:10:16 needs this among the 785 (m7).
- **:6187 and :15776-15783:** the chip's words and the pill's title say where STEP's reading stands.

**Records and chain books need no code.**
- They read the page (`resting-lines-v1.mjs` linesInPage; `build-chain-book-v2.mjs`).
- Every record names `data/default-picks/index.json` by its sha256 (read_off.files; whyNotOfThisTree, :206-223), so the round reads them again.
- Stands do not depend on the records, so the `--receipt-only` pass converges.

**The gate: `check-same-product-v1.mjs`.**
- :216 keeps the mark.
- :405, `gains(i)`, becomes true at a stands place whatever the old line was.
- :428-432 then owe STEP's words, drawn, under M4.

**The checks.**
- check-default-picks-v1: the second road (:362-392) adds stands; D3 counts them; D5 holds each record to STEP's words under M4.
- check-audit-calls-v1 reads its call-4 clauses from the index and the records: 785 stands, the 14 with v192, the 46 held, the 8 none.

**Index and pills.** These follow from the 3 pairs that appear (m15):
- has.step rises by 3, from 305,415, and step_line_rests_bare falls from 15 to 12.
- Ezekiel's STEP share goes from >99.9% to 100%: 18,728 of 18,729 places, and 6:3:15 is the missing one.
- II Samuel and Psalms stay >99.9%.

**II Samuel 6:10:16** (m16):
- Live, words 15-16 (עֹבֵד־אֱדֹם) draw the span store's one line [14, 2, «Obed-Edom», M17] (zone.html:12172).
- `runTakesDefault` is false under STEP (:6163), so call 4 alone cannot show there; it needs call 3. Under call 3 the run rests word by word:
  - word 15: «Obed-» [PIECE:TAHOT], from its own pieces;
  - word 16 (no pieces; ld LENINGRAD_PLUS:ו): «Edom».
- Word 16's index row is [2458, «Edom»], equal to call 4's words. Its lattice leader is also «Edom»: o.l and e["H5654|n"].l, credited STEP's TAHOT.
- So the record reads [15, 1, «Edom», M4] either way. Without the halves fix, though, the leader draws it, not call 4's rule, because «Obed-» ends in a hyphen.
- If call 3 is held, hold this one place and 784 land.

## 4. Read words and kinds against call 4

**Read words (v192).**
- 21 of the 853 places are v192 places: the 14 line places and the 7 none.
- Psalms 10:10, held whole, is not a call-4 place.
- None of the 785 is a read-word place.
- 6 of the 27 places ship 2 lands are not call-4 places.
- At the 14 line places, the read words' pieces against call 4's words (m11):
  - equal as printed: 5;
  - equal without [ ], < > and case: 4;
  - equal once STEP's «/ /» is read as the read-word boundary: 4 (I Chronicles 27:12:6, II Kings 18:27:24, Isaiah 36:12:23, Nehemiah 2:13:17);
  - different shape: Ezekiel 8:6:7, «what/ [are] they?» against two read words. Put-back 4 holds it.
- The plan's assertion («/» drawn as « + », brackets allowed) needs the «/ /» boundary too.
- **Note for call 7:** Nehemiah 2:13:17 is one of these places. Ship 2 already replaces its «X abroad» with v192's read words, so the call-7 rework needs another place to test.

**Kinds.**
- 18 of the 785 live lines are credited to a source the kinds shut whole (m3, m4): ConceptNet M1 8; Wikidata M10, M28 and M53, 7; PanLex M21 2; Hebrew WordNet M43 1.
- 16 of the 46 held places read «Rabshakeh» [M21].
- None rests on English Wiktionary's name rows.
- In the combined ship these 18 lines move first. At 7 of them no row stays open under the word's key at rest (m6), so they may go bare, and ship 3's rule would then print STEP's words before call 4 does.
- After call 4, no call-4 line can read a shut row: STEP's words are credited M4, a Bible dictionary.

**Call 7 overlap.** 11 of the 410 replaced lines open with Strong's sign (m13). Call 4 decides there, because the default layer comes first (zone.html:13659).

## The owner's rules that decide each part

- **Land the 785 and set nothing apart.** «No claims: the page prints what each source says. A row is set apart only on what its own source says of it, and never row by row.» The replaced rows stay on the card. The owner took the recommendation «where STEP spells or parts the word otherwise (853 places), STEP's reading stands» (calls-v1/RULE.md:16).
- **Apply it as a category, not a list.** «Each dictionary is a category … a rule is made over a dictionary's own category.» Call 4's class is STEP's own tie at the place (open-q11, open-q1, open-q14). The v192 and « | » exclusions are categories too (the zone's `kq.words_read`; STEP's open-q1).
- **Do not reach question 3.** «The one exception stays question 3» (OWNER-QUESTIONS-2026-11-14.md:5, :11).
- **Hold the 46.** «Held: 46 places where STEP reads one written word as two TAHOT words» (OWNER-QUESTIONS-2026-11-14.md:10).
- **Credit the 26 to STEP.** Question 4: «the line under STEP is always credited to STEP» (OWNER-QUESTIONS-2026-11-14.md:12).
- **Land the 6 pairs.** «Removing is not more taboo than wrongly adding; walk the line where it can be walked.» STEP's own row and picks say which half backs the line.
- **II Samuel 6:10:16 rides with call 3.** Question 8 (OWNER-QUESTIONS-2026-11-14.md:22).

## Not measured

- What the combined ship's re-projection at rest does to the 18 kinds lines and to the leaders that the store round (v188) moves at call-4 places.
- The chip titles, which the records do not keep.
- Neighbor gaps in runs. I expect none, since every replaced place already carries words.

## Scripts and outputs

All in `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/call4/`:

- m1-places.mjs → m1-places.json, m1.out
- m2-moves.mjs → m2-moves.json, m2.out
- m3-sides.mjs → m3-sides.json, m3.out
- m4-kinds-split.mjs
- m5-layers.mjs
- m6-kinds-18.mjs
- m7-halves.mjs
- m8-pairs.mjs
- m9-ship3-fills.mjs
- m10-table.mjs
- m11-v192-norm.mjs
- m12-pairs-read.mjs
- m13-signs.mjs → m13.out
- m14-fields.mjs
- m15-shares.mjs
- m16-edom.mjs

Data folders: live/, pre3-records/, dl-v181/.