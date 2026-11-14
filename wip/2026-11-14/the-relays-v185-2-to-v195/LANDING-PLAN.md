LANDING PLAN for Moses's eleven relays of 14 November (v185.2, v187 to v195).

The full plan is at /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v53/sequence/LANDING-PLAN.md (59,451 bytes, sha256 efc409bb2a799b2d9069f7c8fe1264b83206ba0a7b41f8d4e3b7b26be0ead758). It covers the order, the disagreements settled, the tool work, each ship's commands, moves and checks, 61 put-backs, 30 owner questions and page-lane notes. My cross-checks are cross1.py to cross8.py in the same folder. They read only, under python3 -I.

ORDER (seven ships). The corpus lane's order holds:
- inside ship 4: call 5, then v188 less its 48 lines with v188.1 pinned, then call 6 and call 2;
- across ships 1 and 3: v190 lands before v195's 5 lines that wait on it.

1. Ship 1: v190, v191, v185.2.
   - All three were proven on store 4d1357b26ca5, and none strikes, lands or retexts a row.
   - v190 meets the store exactly only now (382,258 rows to 382,258 lines). strike-rows carries a re-keyed row's facts whole (strike-rows-v1.mjs:343).
2. Ship 2: v192, before ship 5. It may ride with ship 1 once apply-read-words-v1 exists.
3. Ship 3: the running default-toggles build, re-baked with v195's picks v1.2 instead of v1.1.
   - v1.1's 212 rest fills must not ship, because v1.2 removes all of them.
   - Every row that v1.2 names stands in 4d1357b26ca5 (v195 line 11), and still stands after ship 1.
   - v193 is optional here. It is better as its own ship.
4. Ship 4: the store round.
   - Call 5 (strike-rows): 5,403 struck, 357 re-keyed.
   - v188 through a derived, pinned skip list of the 48 maqaf lines (4,204 land). Not --leave-off: it matches by m and key (:144), and 11 of the 48 lines share m and key with lines that must land.
   - v188.1 pinned in the same store change.
   - Call 6, with --leave-off M74|פעלי־, the row that call 5 already struck: 448 withheld.
   - Call 2: 2 withheld.
   - Facts tools, default picks and form-of pills run through a new follower module.
   - v194's names addendum is pinned, with N7.
   - Routes: 652,954 → 651,305 expected. Confirm against each dry run.
5. Ship 5: calls 7, 4 and 3.
   - Call 7 lifts 15,785 + 1,261 = 17,046 rows. The 306 7a lines that open with «(» are held.
   - Call 4 writes STEP's words as the line at 785 places.
   - Call 3: the span-run rule, held against v181's lines-over-several-words list.
6. Ship 6: v187 retexts 515 of the 520 done rows. The 5 with a fused seam are held. Card notes only.
7. Ship 7 and on: landings that wait on the owner or Moses.
   - v195's unread landing, call 5's credit branch, v190's held list.
   - Call 4's 46 « | » places and the 57 bare words; call 7's 306 lines and 7e.
   - From Moses: v1.4.1, row entries v1.2, default picks v1.3.
   - v193; v194's stem measure, then the stem wiring.

NEW CROSS-RELAY FINDINGS (no single review saw them):
- Call 4 and v192 act on the same 21 places.
  - 21 of v192's 28 places are call-4 places: 14 steps_words_are_the_line and 7 none. 11 of v192's 14 NEW_PIECES places are among them.
  - At Proverbs 21:29:7, STEP's «he considers | way/ his» is v192's read words «he considers» and «way/his».
  - Settled: v192's pieces carry these places; call 4's projector stands aside and asserts that the words are equal.
- Call 4 already prints STEP's words at 182 of the 239 bare words that the v195 review put to the owner. 175 of them land in ship 5. The owner question shrinks to 57 words: 55 gained by v1.2, and 2 more.
- v188 lands 2 class-only «noun» rows of the kind call 6 withholds: line 3957 M72 שם 105, and line 3960 M60 שמא 13.
- Under v185.2, 209 of v193's 4,239 Jastrow rows are word senses (190 under v1). At 134 of Jastrow's 1,930 resting places (121 under v1), every row of pick 1 is a word sense.

DISAGREEMENTS SETTLED:
- D1, where v190 lands. The v194 review said after v188; the v187/v188 review said apply-row-entries runs after v188 with --the-store-has-moved-on. Settled: v190 lands first, and is never run with --moved-on as written. It runs through the follower instead.
- D2, v191. Ship 1; it takes no rank. v195 line 29 is wrong to list it.
- D3, v188's skip. The pinned list and the converter's re-proof are combined: the 48 are chosen by flag, and the converter refuses unless v188's own left-out rule drops exactly those 48.
- D4, call 4 against v192, as in the findings above. At 3 TIES places that call 4 marks "drawn otherwise", the brackets are held until Moses answers.
- D5, call 6 after call 5. The leave-off is safe for call 6, though unsafe for v188.
- D6, v187 and BDB's line. The line does not move: BDB's line is the ledger's slot 5 (bake-default-picks-v1.mjs:428-452). The gapped slot 5 goes to Moses.
- D7 and D8, call 4. It lands 785 = 845 − 14 (v192's places) − 46 (« | » places outside v192).
- D9, call 7a. The 306 «(» lines are held.
- D10, made spaces. Nothing lands from v194; v188.1 is the list.
- D11, call 6's keys. 393 against 394 is decided by the dry run.

TOOL WORK:
- tools/row-strikes-follow-v1.mjs (re-keyed, withheld, struck, landed-after, retexted), used by:
  - apply-row-entries and check-entry-gate E3-E5;
  - apply-name-rows and check-names-gate;
  - apply-sense-openings;
  - apply-made-spaces;
  - bake-default-picks (refusal at :496) and check-default-picks D2;
  - check-form-of F10.
- strike-rows v6:
  - land writes cut into slot 5 (null today, :249) and raises cuts_by_source, or C5 goes red;
  - a retext from words_back keeps slots 9 and 10 (today's retext cuts the row to 7 slots, :324).
- Made spaces: apply-made-spaces and check-made-spaces match a receipt by sha256 (:140 refuses today).
- Ship 1:
  - pointer-map-v1.mjs, bake-form-of rule v2, check-form-of F9-F11;
  - bake-word-senses-v2, with W7 and W3 exempting 16 rows at 8 keys, and a new W8.
- Ship 2:
  - apply-read-words-v1;
  - zone.html tagsAt (3259-3260);
  - E7 (338-341);
  - check-read-words-v1.
- Ship 5:
  - apply-phrase-rows-v1, with a phrases gate and switch;
  - project-steps-reading-v1;
  - the span-run rule, with v181's file pinned (12228dc4…778a).
- check-audit-calls-v1.

Every ship ends: commit on main, merge main into gh-pages with the message «gh-pages follows main», push both, then run check-live-v1.

## Batches

- SHIP 1 — v190 (row entries v1.1), v191 (pointer map v1.4), v185.2 (word senses v2). Store at 4d1357b26ca5: the facts slot changes, and no route, rank or key moves.
- v190:
  - Pin data/row-entries/row-entries-v1.1/: RULE.md ea13ca42…, receipt e5eb1d31…, facts-slot c0a7e556…. The ledger is e63c2402…, 25,207,542 bytes, 52,793 lines.
  - Run tools/apply-row-entries-v1.mjs --ledger <v1.1> --dry, then the real run. Expect 0/0 and 385 M4 rows moved.
  - Do NOT land landing-list-held-v1.1.tsv.
- v191:
  - Pin data/pointer-entries/pointer-map-v1.4/: RULE f159f653…, receipt d904341a…, verify 734d2b2f…, changes e5596740… (682 lines), the-458 63c84847….
  - PIN v2 carries assembled sha256 79b26cf2….
  - New tools/pointer-map-v1.mjs; bake-form-of-pills rule v2 (rulings 5 and 7 still looked up by v1.3's sha 9a532fac…); re-bake the chain books.
- v185.2:
  - Pin data/word-senses/jastrow-word-senses-v2/ (7 files).
  - New tools/bake-word-senses-v2.mjs.
  - Record path: either explicit jastrow-v2.json, with its 7 readers changed in one commit, or keep jastrow-v1.json.
  - Re-bake the search index.
- Round: re-project every zone with --lattice (sidecars name e63c2402…), then the resting lines, chain books, search and records.
- MOVES AT REST:
  - v191: none (0 strings in the 40 resting-line files).
  - v185.2: none (word senses rest off).
  - v190: few or none expected, but grades[surface].e is re-baked, so run the comparator over all 400,242 lines.
- CARDS:
  - v190: 12,257 rows go from withheld to kept at 11,895 places («Lo-» 4,976, «O sons of» 1,490, «<if>?» 711).
  - v191: 459 FORM_OF pills move at 58,017 places; resolved goes from 1,524 to 1,982.
  - v185.2 (Jastrow on): 1,078 more rows held back; the legend goes from 3,328 to 3,958; search drops 1,078 rows.
- CHECKS:
  - check-entry-gate E1-E13 with --ledger v1.1 and --lattice (E4: M4 41,185 / 53,848; E5: 52,793 / 382,258).
  - check-v190.mjs: the moved set equals facts-slot-v1.1.tsv.
  - check-form-of F1, F6, F9 (counted, not failed, while the source files are missing), F10, F11. PIPELINE-MANIFEST guard.
  - Chain books K3; W1-W8; check-search; the suite and the gate.
  - Live: window.__formOf.resolved === 1982.
- The three may share one ship. Split them only to measure v190 alone.
- SHIP 2 — v192 (read-word tags). No store change. Any time after ship 1; MUST precede ship 5 (call 4). It may ride with ship 1.
- Pin data/read-words/read-words-v1/: RULE ca6bd38f…, receipt 0332351b…, read-word-tags 9fac39df… (57 lines), stroke-facts ff65b5de… (16 lines), counts c24d35e0….
- New tools/apply-read-words-v1.mjs, run after project-lattice-v12 and project-piece-gloss:
  - tg on 56 QERE regions (Isaiah 3:15 read word 2 has none);
  - pg at the 14 NEW places;
  - an assert at the 14 TIES places;
  - Psalms 10:10's pieces held, its tags landed.
- zone.html 3259-3260: tagsAt takes the asked key's region.
- check-entry-gate E7 (338-341) allows one tag per QERE region of a read form of several words.
- Stroke facts: nothing to write (16/16 equal v179); keep v179's pin.
- MOVES AT REST: 21 read words at the 14 NEW places (19 with Psalms 10:10 held). Examples:
  - Job 38:1 and 40:6: «manna» becomes «from».
  - I Chronicles 27:12: «to make bricks» becomes «of the/ Ben».
  - Proverbs 21:29: «Jabin…» becomes «he considers», and «archer» becomes «way/ his».
  - Nehemiah 2:13: «X abroad» becomes «were broken down».
  - The TIES places do not move.
- CARDS: 56 read words gated under their own entry; 1,074 rows withheld, 1,562 kept.
- CHECKS: new check-read-words-v1 (Job 38:1 read word 1 reads «from»; I Chronicles 27:12 read word 1 reads «of the/ Ben»), E7, the kq-* checks, check-paseq-place-v1.
- SHIP 3 — the default toggles, with v195's picks v1.2 (v193 optional). After ship 1, so v190 lands before v195's 5 lines that wait on it. No store change.
- Re-bake the running pt build with v1.2, not v1.1. The 212 rest fills must not go live.
- Pins:
  - amendment_v1_2: 139b2bfd…
  - receipt_v1_2: 652d933d…
  - mend_v1_2: b160d8cd…, 43,219 lines
  - bdb_mend_v1_2: 1148f2cf…, 165 lines
  - rows_added_v1_2: 0088a1ed…, 1,935 rows, the first numbered 152,648
- picks-waiting, entry-gate and call5-repoints are pinned and counted. The merged and small-letter branches stay off at rest.
- Expected: has.step 305,430; step_leaves 1 (II Samuel 7:22:5); rest_fills 0; place_reading_answers 0; no STEP auto second in 39 books; 14,784 STEP line picks name no row.
- MOVES AT REST: nothing on the line. Pills only: «100%» in 38 books, «>99.9%» in II Samuel.
- PLAN-MERGED lines to change:
  - line 26 and §7: 212 rest fills → 0
  - line 85: 213 leaves → 1
  - line 655: II Samuel 7:22:5, not Ruth 3:12:5
  - lines 197-198: rows and mend
  - §8: calls 1, 2 and 11 restated
- v193 (Jastrow, the fifth pill): RULE 67a623af…, receipt 000df41d…, rows d3335d23… (4,239 rows); index V2, 5×5; nothing at rest. Recommended as its own ship after owner questions 2, 8 and 9 and put-back 39.
- CHECKS:
  - check-default-picks D1c (v 908, a 5,404), D2 (154,583 rows), D3, D5 (0 fills), w1 (II Samuel), w3 skipped with a reason.
  - check-same-product S1; check-line-reads-the-place-v1.
- It may come after ship 4 instead; its bake then needs the follower from the start.
- SHIP 4 — the store round, in Moses's order: v189 call 5 → v188 (less 48) with v188.1 pinned → call 6 → call 2, plus v194's names-addendum pin.
- PREREQUISITES:
  - tools/row-strikes-follow-v1.mjs, wired into apply-row-entries, check-entry-gate E3-E5, apply-name-rows, check-names-gate, apply-sense-openings, bake-default-picks and check-default-picks, check-form-of F10.
  - strike-rows v6: land writes cut into slot 5 and raises cuts_by_source.
  - wip/2026-11-14/landing-v188/convert-v188.mjs writes land-v188-v1.jsonl (4,204 lines, pinned). It refuses unless v188's left-out rule drops exactly the 48 flagged lines on the store after call 5.
  - apply-made-spaces and check-made-spaces match receipts by sha256 and hold counts by a second road.
  - check-audit-calls-v1; a v188 landing check.
- PINS:
  - data/audit-calls/calls-v1/ (13 lists, to FOR-ELIJAH-v189.md:104-120);
  - v188 landing-v1 (c1990493…);
  - v188.1 in data/made-spaces/made-spaces-v1.1/ (its PIN entry replaces v168's), with receipt-v2.1 beside M46's v2 lists.
- STEPS (each --dry first):
  1. Call 5: expect 5,403 struck, 357 re-keyed, 0 folded, 2,550 keys emptied, routes 652,954 → 647,551. Write the re-key map.
  2. v188 via the skip list: 4,204 landed, 145 keys made, about 61 cuts.
  3. Same store change: apply-ledger-divisions; apply-source-years --dry (0); apply-made-spaces with v188.1 (slot 9: M9 +30, M5 +85).
  4. Call 6 with --leave-off "M74|פעלי־|struck by call 5": 448 withheld, 10 keys emptied.
  5. Call 2: 2 withheld (קש 18, ר 9).
  6. Facts tools through the follower, each expecting 0 moved.
  7. Re-bake the default picks: follow 26 re-keys (122 references) and 1,092 waiting picks; count 23 withheld rows (453 references); take 18 suppress lines. Re-bake form-of: ל־ 3 M13 → ל at 18 slots.
  8. Pin data/names/names-v177-addendum-v1/ (99a414fb…, 26 lines) and add N7. Do not run apply-name-rows on it.
  9. Re-project, bake, check, gate, ship.
- Expected routes: 651,305.
- MOVES:
  - Call 5: no card loses a reading; 357 new pills under 178 plain keys.
  - v188: about 2,249 new readings, about 1,955 merges, 145 new keys; the oldest-first leader changes at about 1,792 keys (upper bound), so resting lines move. Measure with the comparator.
  - v188.1: no line.
  - Call 6: 448 rows leave the cards, 10 keys empty; 18 UBS or MACULA picks print no words (Isaiah 45:4:9 «surname» goes to its second source).
  - Call 2: 2 rows.
- CHECKS:
  - check-route-store-exact-k-v1 L1-L10.
  - check-store-continuity C1 and C5.
  - check-audit-calls-v1: pins; actions; the one leave-off named; no key ends in U+05BE; the 357 re-keyed rows stand under their plain keys; the 42 openings are not struck.
  - The v188 landing check; check-made-spaces.
  - E3-E5 through the follower.
  - check-names-gate with N7; check-sense-openings; check-default-picks D2.
  - check-form-of F9 (17 v188 slots named, not failed) and F10.
  - check-line-reads-the-place; check-disk-gloss-is-the-line.
- SHIP 5 — v189 calls 7, 4 and 3, the page rules. After ship 2 (strict). Best after ship 4 and after put-backs 1-4.
- Call 7:
  - New tools/apply-phrase-rows-v1.mjs writes facts `phrase` on 7a less its 306 «(» lines (15,785 rows) and on 7b (1,261, with their collocations).
  - 7c (2,202) and 7d (192) are unchanged. 7e is kept as data.
  - zone.html: a phrases gate beside the names gate (:7553), and a `phrases` switch off at rest on the model of `senses` (:4049), with reset.
- Call 4: new tools/project-steps-reading-v1.mjs writes STEP's words as the line at 785 places, credited to M4.
  - It stands aside at the 14 v192 places.
  - It holds the 46 « | » places (open-q1).
  - It writes nothing at the 8 `none` places.
  - It refuses where the word's letters are not `s`.
- Call 3: the span-run rule.
  - Pin v181's lines-over-several-words-v1.jsonl (384,463 bytes, 12228dc4…778a).
  - The check holds 2,177 lines over 4,402 words.
  - II Samuel 6:10:16 is the call-4 place under a run that lands.
- MOVES AT REST:
  - Call 4: 785 lines; 178 appear where none stood and 607 replace a line. 175 of them are among the default picks' 239 bare words.
  - Call 3: the run lines rest word by word over 4,402 words.
  - Call 7: lifted rows leave the resting pool, so lines move wherever a lifted row printed one. The reviewer counted 17,352 pills at 5,744 keys for the full lists; recount with 17,046. Under UBS's default no line moves.
- PLAN-MERGED: §8 call 3 is superseded. §0.1 #1 and §0.5.1 now hold except at call 4's places.
- CHECKS:
  - check-audit-calls-v1 clauses: 7a (less 306) and 7b carry phrase; 7c and 7d do not, and 7d is unchanged. The resting line at the 785 is STEP's words; v192's 14 equal STEP's words. Call 3 is held against v181's list.
  - check-line-reads-the-place; check-same-product; check-menu-switches; check-default-picks.
- SHIP 6 — v187 (words back). After ship 4 (the follower exists; call 2's 42 lines are checked by key, rank and m) and after ship 1 (v190's n on 511 of the 520 rows is followed, not matched by sha).
- Pin data/made-spaces/words-back-v1/: RULE ab551ae3…, words-back-final f03fa594… (789 lines), in-921-lost-none 0ed92496… (132 lines), and the 4 receipts.
- Retext by key and rank, never by text (letter :20), with strike-rows v6's `retext` from words_back or a new tools/apply-words-back-v1.mjs. Either sets both texts and slot 9, clears slots 7 and 8, keeps slot 10, and records the old row whole.
- 515 done rows land. The 5 with a fused seam are held. 231 settled and 38 held wait on the owner.
- Then run, through the follower: apply-ledger-divisions, apply-made-spaces (closes from words-back), apply-sense-openings, apply-row-entries, and the default-picks re-bake.
- MOVES: nothing at rest; no pill and no index entry (sense-openings O6).
  - The notes on 515 cards print BDB's words in place of their gaps.
  - For all 520, the reviewer counted 64 rows with closes; recount on the 515.
  - v178's M46 lists lose 56 and 496 lines (for all 520).
  - BDB's default line does not move (it prints the ledger's slot 5).
- CHECKS:
  - Each retexted row carries words_back in both fields and slot 9 as given; facts unchanged; senseOpened(row).text === prints.
  - The other 1,488 v174 rows are unchanged.
  - O1-O7 hold on all 2,008 lines.
  - The made-spaces counts fall by meets-v1.json's figures.
- SHIP 7 AND ON — each its own ship, after answers:
- v195's unread landing: 4,601 M4 rows, only if the owner says now. It goes after ship 4. Recompute ranks at landing time: 35 keys receive call 5's re-keys (55 rows).
- Call 5's credit branch: 1,294 rows, as a restore list from row-strikes-v1.json. A restore carries slots 0-6 (strike-rows-v1.mjs:174), so slots 7-10 are derived again.
- v190's held list: 12 lines, 125 places, only on a one-row-per-source ruling.
- Call 4's 46 « | » places, after put-back 2. Call 4 for the 57 bare words, if the owner chooses B.
- Call 7's 306 «(» lines, after put-back 1. Call 7e, after owner question 15.
- v187's 231 settled and 38 held rows.
- From Moses: pointer map v1.4.1, row entries v1.2, default picks v1.3.
- v193 Jastrow, if it did not ride with ship 3.
- v194's stem amendment:
  1. Run tools/measure-stem-amendment-v1.mjs (read only) after ship 4's re-projection.
  2. Then wire stem-family-rule-v3 in tools/stem-family-v1.mjs 19-26 and zone.html 3105-3112, in its own ship.
- Every ship: main, then merge into gh-pages with «gh-pages follows main», push both, check-live-v1.

## Put back to the corpus lane

- v189 call 7a: 306 lines do not open with the sign. FOR-ELIJAH-v189.md:59 and RULE.md:73,75 say all 16,091 open with Strong's sign X, × or +, but only 15,785 do. The other 306 (M14 302, M9 4) open with «(», e.g. call7a line 428 «(X great) delight» and line 346 «(+) archer». Confirm they belong, or send 7a without them. The page holds them at rest meanwhile.
- v189 call 4: 55 places join two STEP words with « | » (open-q1 46, open-q14 9). The 9 are v192's ketiv and qere places, which v192's per-read-word pieces carry. The 46 are single written words that STEP splits across two TAHOT words («Malki- | Shua», «[the] chief | commander», «Asah- | -el», «not | peoples»). Default picks v1.1 and v1.2 give only the first word as pick 1. Which is STEP's line there, and how is « | » drawn?
- v189 call 4: the 8 `none` places carry no words (line_now and steps_words are null). 7 are v192 TIES places whose zone pieces already print TAHOT's reading: say so in the list. The 8th is Numbers 7:59:17 פְּדָהצֽוּר (call4 line 689), the broken-bar variant place: give STEP's words there.
- v189 call 4 and v192 act on the same 21 places (14 line places and 7 `none`; cross2.py). The page lands v192's pieces there and keeps call 4's projector off them. At II Kings 18:27:24, Isaiah 36:12:23 and Ezekiel 8:6:7, call 4 says to redraw with STEP's brackets («what/ [are] they?»), while v192 says the zone's pieces stand («are they?»). Which wins? Were the two lists meant to meet?
- v189 call 4, «drawn as STEP draws it» (:76). The page draws «/» as « + » (gloss rule 3), so Lamentations 4:3:10 changes only by STEP's brackets («like <the> + ostriches»). Confirm that is what is meant.
- v189: one row on two lists. פעלי־ 3 M74 «verb» is call5 line 4850 (strike) and call6 line 293 (withhold). Its target, פעלי 7 M25, is call6 line 292. The counts cover overlaps within one list only; please name overlaps across lists. The page lands call 6 with a leave-off for this row.
- Re-key rank rule (v189 call 5 and v195 line 29). strike-rows gives a re-keyed row the highest served rank + 1 under its new key (strike-rows-v1.mjs:343). At 71 of the 357 re-keys, that rank is a typed struck hole (e.g. אדני 58-60 [M20], אויה 6 [M101]). v195 takes the next free rank as of the store, struck-ranks-v1 and v188. Which rule do you assume? The page lands call 5 by today's rule and records the ranks.
- v189 call 5 and pointer map v1.4. Call 5 re-keys ל־ 3 M13 «To; the first part of a to-infinitive.» (NO_TWIN) to ל. The map names that row at 18 slots: lines 33, 34, 970, 1280, 1284, 1285, 1295, 1307, 1313, 1314, 1315, 1321, 1333, 2852, 2855, 2856, 2869 and 2870. Add them to call 5's re-point list, or carry the move in v1.4.1.
- v189 call 6 and the default picks. 453 references (BDB 414, UBS 38, MACULA 1) name 23 rows that call 6 withholds: say how such a pick resolves. The page counts them as withheld. Minor: at Zephaniah 1:2:2, 1:3:1 and 1:3:4, row 150565 (אסף 85) is named twice, and the «31 references» count it twice.
- v188 against call 6's rule (new). v188 lands two class-only rows: line 3957, M72 שם 105 «noun», and line 3960, M60 שמא 13 «noun» (both credited in the build to M24 PanLex). Call 6 withholds the same kind of row (M72 שום 74 «noun», M72 שמהתא 3). Send a 2-line withhold supplement to call 6, or say they stand. The page lands them as listed.
- v188 letter :33 says «865 readings of 860 routes». left-out-v1.jsonl holds 865 readings of 861 routes: the extra one is רחלים «ewe, sheep», whose «sheep» lands as v188's one piece line.
- v188 RULE.md:25 (rule 8). The comparison is a case-folded containment of whole words: it reproduces 61 of 61, and exact case gives 60. Please state it. Also say whether a containment that holds only when case is ignored makes a cut: אביר rank 14 M5 «strong» is a cut only of «the Strong», which is BDB's name for God.
- v188.1 receipts name the lists by the builders' file names (…made-spaces-v1.jsonl), while the shipped files are …-v1.1.jsonl. The page matches by sha256. A note only; no reissue is needed.
- v188.1 §3. With call 5 landed first, the receipts' store (4d1357b26ca5+v188) is never served. After ships 4 and 6 the page will give its store version: please run the builders again on it.
- v187, fused seams. Reading a piece's own tags as nothing (RULE.md:25) joins Hebrew onto English in 8 rows where the old text had a space: done rows יהורם 13, נבל 83, שבט 48, גנזים 5, יהוה 24; settled rows יהורם 11, חשתי 6, נפש 117. Reissue them with the seam kept, or confirm the provider prints them joined. The page holds the 5 done rows.
- v187, held rows. RULE.md:33 says a held row keeps the provider's order, but שש 33, הלול 8 and רכב 81 have one settled run reordered and the other left in provider order. Which text lands once the owner rules?
- v187, route_closes. The field is missing on 704 of the 789 lines, though letter :11 says every line gives it. Write [], or say in RULE.md that a missing field means none.
- v187, names that change with the retext. Ship a map from (key, rank, m, old sha16) to the new sha16, or confirm that the page should resolve through v187's own list. Row entries (v190, by sha16), default picks (v195, [key, rank, m, sha16]) and call 2 (by text) all name these rows by the old route.
- v187 and the default picks. BDB's default line prints the ledger's slot 5, not the row (bake-default-picks-v1.mjs:428-452), and 62 of the old texts appear among the baked BDB words. Where slot 5 is an old gapped text, the line keeps the gap while the card prints the words back. Should default picks v1.3 carry the words back in slot 5?
- v190: count the gate's flips. The letter counts only the 257 places whose own reading was withheld. The gate moves 12,257 rows from withheld to kept at 11,895 places, led by «Lo-» (לא rank 24, which gains H3808 from one line, Hos.2.23(2.25)#06=L) at 4,976 places, then «O sons of» at 1,490 and «<if>?» at 711. Please count the flips over all served places, both ways, and name the largest.
- v190 places-v1.1.tsv. 4 of the 257 places carry no tag on the page: II Kings 12:22:1, Jeremiah 48:20:5, Job 38:1:5 and Job 40:6:5. The page mends 253. The 3 places marked not reached are v192 places.
- v190: the letter does not say where v190 lands relative to v189. 28 of the 385 rows stand under keys ending in a maqaf, and call 5 strikes them all. The page lands v190 first; say if you meant otherwise.
- Row entries v1.2, keyed to the page's store after ships 4 and 6. It should carry: the 45 re-keyed rows at their new key and rank; the 3,040 rows v188 lands with no line; the struck and withheld lines (4,664 + 29 + 2), marked; and the 515 retexted rows by their new sha16. Until then the page follows its row-strikes record.
- v190 §5: «v1.1 mends 246 of 270 under the page's key» cannot be checked, because no file lists those places. Please add the list.
- Pointer map v1.4.1, after v188. v188 serves the same English from the same source at 17 ruled-print slots on 14 lines: 48, 622, 805, 985, 1392, 1393, 1643, 2012, 2095, 2140, 2317, 2917, 3007 and 3009. 11 of them are seen on the page, at 848 places (שמרון «Samaria», רב «majority», מאת «hundred, one hundred»). RULE.md §9 line 116 then no longer holds. Send v1.4.1 made on the store after ship 4, with only the lines that change.
- v191: the whole map has no sha256. The page's assembly is 3,015 lines, 2,667,023 bytes, sha256 79b26cf230214a903e59edf92793e1f728f4ad4942073018bcdd89b30053f433. Confirm it, or give yours.
- v191: a ruling file for the ruled print, in the shape of v176's and v177's. It should carry the owner's exact words («just go with your recommendations its fine», OWNER-ANSWERS-2026-11-14.md line 3) and call 8 (line 14), name the files it rules, and say that rulings 5 and 7 carry over to v1.4. RULE.md §0 and the letter quote the page lane's words as if they were the owner's.
- v191: the page's check cannot read its sources. Letter :9 says the check «can hold text to file», but the page has none of the three files: Kaikki Hebrew f1c363…, Kaikki Aramaic 1ed77f… and UBS 1686a2…. Name their store keys, or send an extract for the 464 ruled prints with its own sha256.
- v191: the place counts leave out joined keys. Lines 370 (ביתלחם) and 386 (בנאדם) carry places 0, yet they are the default lead of the joined key in 13 and 3 zones and appear under the CC BY-SA order.
- v191 §6 (line 61), a note only. On the page only מבקשים and ללמד move by 3.1. Lines 416, 417 and 1271 are also-slots the bake never reads.
- v185.2: put `cards` on every row read through cards. 12 NOTE_WORDS_ALSO_A_WORDING rows and 326 ASIDE_WORDING rows carry found_by null and cards [], and so do v1's 3,430 word senses. Without them, check 6 and the kept branches cannot be re-derived.
- v185.2: 468 of the 780 bare THROUGH_ITS_CARD word senses have no served row with the bracket (e.g. אבלים rank 8 M39 «dark»). Could each carry the note as Jastrow brackets it, with the entry's headword and numeral?
- v185.2: send a short list of «same words, other entry» rows. There are 16 at 8 keys: חמץ 92/94, מאס 65/67, עלם 115/116, פתיחה 16/18, צלח 71/73, רהיט 22/24, רמה 194/195, רפי 20/22. פתיחה 18 and רמה 195 are named nowhere. The page's W7 and W3 would then exempt exactly these.
- v185.2, minor. trial-v1/lines-a-b-v1.jsonl was not shipped, so «39 of 397 line Bs» cannot be checked. RULE.md's amendments run A1, A2, A3, A5, A4.
- v192, Psalms 10:10 read word 1. The piece carries TAHOT's spelling חיל where the read word is חל, so the pieces would spell חילכאים, not חלכאים. Carry the edition's letters with TAHOT's spelling beside them, as at I Chronicles 9:4. Also, no store row under חל is of H2428A.
- v192: the lines carry no word number. Please add `place` as v179 did. The page found all 28 places by reference and surface.
- v192 §3: Genesis 14:17, Kedorlaomer, has lost H3540 from its lattice piece. Send a one-line list in this shape, or say it waits for the reissue.
- v192, answers to your §6 and §4. 55 of the 56 read words with a main tag have a store row of their own entry under the read word's key, and 52 have a TAHOT row. The exception is Psalms 10:10 read word 1. The stroke file adds no fact (16/16 equal v179), so the page keeps v179's pin.
- v193: its rows are not checked against the word-senses list. Under v185.2, 209 of its 4,239 rows are word senses (190 under v1). At 134 of its 1,930 resting places (121 under v1), every row of pick 1 is a word sense, e.g. Deuteronomy 6:4:1 «to be still,». Flag word-sense rows per pick, or take the sense's first row that is not a word sense, and recount.
- v193 places its picks by word numbering v1 (RULE.md line 24), while v1.2 reads v1.1. Does Jastrow gain any of the 266 places v1.1 newly ties? If so, reissue.
- Jastrow is not off at rest on the page. «Jastrow's rows rest off on your page» (v193 line 72) and «the Jastrow overlay, which is off at rest» (v194 line 27) are wrong for it. The overlay starts on (data/serving-rulings-v1.json, jastrow-served; zone.html 3861-3870); only Jastrow's word senses rest off. v193's owner question 3 is moot.
- v195 line 33 says the line under STEP's default prints the ledger's words «as your plan says». The plan says the opposite: STEP is today's line (PLAN-MERGED lines 25 and 78). With call 4 ruled, the line is STEP's words only at call 4's places.
- v195 does not cover rows that other landings change: v187 retexts 486 named M46 rows (7,375 BDB references; 223 more rows, 2,888 references, wait on the owner); call 6 withholds 23 rows (453 references); call 5 re-keys 26 rows (122 references). Send a v1.3 rows table on the page's store after ships 4 and 6, or confirm that the page follows its strike record.
- v195: name the key each pick's row is under. All 266 newly tied places, and the 239 bare words, name rows under another key than the zone word's, or none (e.g. Ruth 3:14:2 names מרגלותיו where the zone's word is מרגלותו). Add row_key (PLACE_FORM or OTHER_FORM) to STEP's picks, as v193 does.
- v195 line 29 lists v190, v191 and v193 among lists that land rows under a key. None does: v190's held list lands only on a ruling, v191 lands no row, and v193's rows are overlay rows already served. Only call 5's re-keys and v188 matter there.
- v195 line 94 and RULE-AMENDMENT line 79 name 9 files in default-picks-v1.2/inputs/. The store holds none of them. Put them on the store, or say they are in git only.
- v195 receipt-v1.2: step.step_lines = 305,495 is defined nowhere.
- v195 receipt-v1.2 gives no totals by kind after v1.2: r 305,481; v 908 (K 883, AH 2, B 2, …); a 5,404. Letter §5 quotes v1.1's 748 variants. Please add the totals so the bake can hold them.
- v195: say why II Samuel 7:22:5 has no pick from any source.
- If the owner chooses B for the 57 bare words, send them as a call-4 supplement with STEP's words for the line.
- v194: the ruling-6 figures do not reconcile. You give 76,188 places and 451,716 rows (§2, line 25); the page has 75,998 and 450,215. Give the store version and the variant before the owner is asked.
- v194 line 29: the small-letter sentence. v190's RULE.md lines 11 and 21 keep v1's line 74 («MACULA's small ones») in force. Reword it now as an amendment to v1.1, or name the version that will.
- v194 made spaces, item 3 (line 49). Say plainly that the 14 texts with the sign hold made spaces (they are v188.1's 14 new M5 lines), and the other 331 hold none.
- v194 made-spaces count. After v188's 48 lines are skipped, the figures are at most 534 texts, 91 in a list, 443 in no list and 331 for the addendum. Please state them, as v188.1 §3 does.
- v194 item 2 (line 47): name the field by which a reissued M9 list or ledger will mark a row's closes as moot. Until then, apply-made-spaces-v1 refuses such a row.
- v194 line 23, «the rest»: the rest of which set? 2,268 − 447 − 181 − 1,496 = 144, but 447 − 330 = 117. Name the set and count it by relation.
- v194 line 27, «TBESH's year is 2026». The served M19 rows carry S_NO_SOURCE_YEAR (2,409), 1890 (122), 2023 (68) and 2026 (46). Which year decides the credit?
- v194, names v2. OmegaWiki's «class list I chose» (374 of 387 rows) is the lane's reading, not the source's mark; x-pn and the gentilics need the same care. Use the source's own mark, or put it to the owner before names v2 runs (no-claims note line 17).
- v194 §6 item 4, the reverse gate: send the rows whose own source marks them as a common word, so the page can measure the reach before the owner rules.
- v194, low priority: the amendment (lines 79-83) could say that A+B's 201 = 184 + 17.
- Spelling, by CLAUDE.md (American English): write «license»/«licenses» in FOR-ELIJAH-v191.md:9, pointer-map-v1.4 RULE.md:71, FOR-ELIJAH-v193.md:23, jastrow-word-senses-v2 RULE.md:23 and build-word-senses-v2.mjs («licence pointer»), and answers-v1 RULE.md:23 («licences»). The page keeps these files byte for byte, so only a reissue fixes them. Jastrow's own «centre» stays.

## Owner questions

- For you to see before the first ship; it ships as ruled unless you say otherwise. The update to word-entry facts brings back 12,257 readings on 11,895 words that the 'same entry' gate held back. The largest: «Lo-» (from the name Lo-ammi in Hosea) comes back on 4,976 words that mean 'not', because STEP's own data files it under the same entry as 'not'; «O sons of» on 1,490 words; «<if>?» on 711. This follows your rulings and the no-claims note.
- Jastrow's pill (you named a later «Jastrow» pill). It would choose a reading at about 0.6% of words (2.0% in Leviticus) and none at all in Haggai. In Haggai, should the pill be hidden or shown greyed out?
- Your call 1, now much smaller. The corpus lane's update gives STEP its own reading at all 212 words the plan would have filled from MACULA, so those fills go away. Separately, the corpus lane's call 4, which you accepted, prints STEP's own words at 785 words that today are bare or show another dictionary. That leaves 57 words where the line is bare although STEP has a reading. (A) Leave them bare; (B) print STEP's own words there, as call 4 does elsewhere (recommended); or (C) print MACULA's words?
- Your call 2 grows by 157 words. At these words today's line shows another dictionary's word while STEP now has its own reading, e.g. Psalms 10:5 «archer» (Strong's) where STEP reads «ways his». Keep today's line there?
- Credit on the line under STEP. After the maqaf clean-up, 71,346 of STEP's choices point at a reading another dictionary holds with the same words. Should the line under STEP always be credited to STEP?
- Two side lists of STEP's: joined choices (192) and small-letter written forms (310). Should they ever show at rest? Recommendation: no, keep them a press away.
- 4,601 STEP readings that no dictionary row holds yet. Add them to the store now, or wait for the corpus lane's catalog rebuild, which would make the same rows? Not both.
- Where Jastrow's choices rest. Of the 1,930 words where they would rest, at 398 the letters cannot tell which word of the verse Jastrow meant, and 1,051 come from a 'refers to' note. Should these rest as placed, or only where one word carries the letters?
- At 134 words Jastrow's choice is a 'word sense', which the site holds back at rest. Recommended: with word senses off, show no Jastrow line there; with word senses on, show «word sense, not definition: …». Agree?
- Credit after the maqaf clean-up. In 1,294 cases a reading under a spelling that ends in a maqaf also exists under the plain spelling, but only from another dictionary (STEP's choices point at 461 of them, 16,013 times). The clean-up removes them, and STEP's choice then points at the other dictionary's reading. Should each dictionary keep its own credit instead, by moving its reading over as its own entry? The removal stands until you say.
- One reading per dictionary. When two dictionaries give the same words for the same word, should the store keep the reading once for each dictionary? This decides a 12-line list held back from the entry-facts update (125 places: «Gad» 69, «Perez» 15, «salt» 10, …) and the credit of 2,736 readings that the fold landing brings back.
- BDB openings with gaps. Two openings (הלך 152 and לוי 23) and 36 others stay as notes with gaps. In 36 of the 38 no witness settles the order of the Hebrew; in 2 the provider's file is damaged. Keep them so?
- BDB's Hebrew order. In 231 BDB openings the corpus lane can put the whole Hebrew pieces in BDB's printed order, as Sefaria's copy of BDB shows it (for example «ק׳ יוֹם אֵידָם» is stored backwards). The letters stay the provider's. Allow it?
- The «phrases» switch. 17,046 readings that their own dictionary marks as part of a longer phrase go a press away. The suggested switch name is «phrases», off at rest. The card would say, in the source's own words, «part of a longer phrase, by Strong's sign X», or for UBS, «a phrase's meaning: אבד נֶפֶשׁ». Are the name and words right?
- At 4,551 words, UBS's own default choice is one of those phrase meanings. There, should the reading come back to rest on the card (recommended), or stay a press away everywhere?
- Joined pairs. The corpus lane's call 3, which you accepted, says that on a run of several words each word's own reading rests and the joined reading is a press away. Does that also settle your older open question about joined pairs (Monday, «the Jewish people»)?
- 433 readings that only say what kind of word it is («a male given name», «verb») are withheld, as ruled. Under the no-claims note, should they later print as a kind note instead, e.g. «its source gives only: a male given name»?
- Pointers where the place reads another word. אשר's pointer pill shows «happiness» (5,555 words); עד shows «witness» (1,394); בן shows «valley» (1,756), plus «Benjaminite» and «In (a place or time)» on every בן card. Hold them back where the place reads another word, or print them as ruled?
- On 153 pointer pills (14,995 places) the pill now prints the same English as another reading on the same card, e.g. «mighty, valiant» twice under אבירים. One pill or two?
- Ruling 7 takes the dictionary's first entry. Should it also reach pointers that, once followed, name several entries? That is 28 lines at 9,827 places.
- (Low) Should prefix pointers (ש־, ל־, כ־, ב־) name the prefix's own entry? That is 35 slots at 438 places, and nothing on the page changes either way today.
- 468 of Jastrow's word senses are served without their bracket. With word senses on, the pill says «word sense, not definition: dark», but the card cannot show Jastrow's bracket. Should the card name Jastrow's entry and sense, or keep these held back until the corpus lane sends the bracket?
- At 8 words Jastrow has two entries with the same letters. One brackets the words as a sense; the other gives the same words as a definition (e.g. עלם «to surround, tie up»). Keep both as the source has them (recommended), or mark the entry number (I or II)?
- (Low) Where a word is read differently from how it is written, the update adds an entry tag and pieces at the 28 places where the reading has two or three words. Should the same be done at all 1,054 such places? 985 of the 1,027 one-word cases already carry the tag.
- (Low) Isaiah 3:15's second read word has no entry number. Recommended: show TAHOT's pieces («is to» «you?») with the card ungated. Agree?
- STEP's «a Meaning of» entries. Should an entry STEP files as «a Meaning of» another entry of the same number count as that entry's word? As ruled, 451,716 readings are held back at 76,188 places (the corpus lane's count; the site counts 450,215 at 75,998). With yes, about 356,776 would come back at 41,969 places. You said «kept as ruled» before this column of STEP's was read.
- Gentilics (such as Israelite or Kenite): count them with the names, or apart?
- Some readings give a name's meaning, and their own dictionary marks them as a name: BDB's «gaze» under צפו, marked as a man's name, and Strong's «pomegranate.» at Rimmon. Are they names or readings?
- The names gate the other way. At a name, should readings that their own dictionary marks as common words be held back? At Rimmon that takes WordNet's grenade and Strong's «pomegranate.». Another way is to label such a reading on the card instead of withholding it. Asked only together with a measure of how far it reaches.
- Names v2. May a class list that the corpus lane chose make a reading a name (OmegaWiki: 374 of 387)? Or only the source's own name mark (13)?
