# Ship 6: relay v187 (words back), designed on the ship tree

## Summary

- **The plan holds, with two additions.** The 515 rows still stand exactly as v187 read them. A rehearsal in memory, run through a prototype follower, moved no fact, no line and no pick.
- **The owner's 15 November note releases the settled rows.** It takes question 18 ("allow"), so the 231 settled rows can land in ship 6 as well, less 3 held for a fused seam. That makes 228 more, 743 in all.
- **Two places the plan does not name would break or move:**
  - **The stems.** The binyan file names 185 of the 515 rows by their old text, 50 of them with a stem. The page looks a row's stem up by its text. Without a follow, those 50 rows stop being held back by the stem gate and could appear as new notes on cards.
  - **The BDB ledger.** Its classifier has no shape for Hebrew vowel points or accents. 425 of the 515 new texts (653 of 743) would be named "uncovered" in the ledger receipt, which counts 0 today. These rows are notes and give no reading, so nothing prints differently.
- **One fault on my side.** The kernel's out-of-memory killer killed two Chrome renderers of the ship's running suite at about 18:40:00 UTC, while one of my light scripts was running. That suite run may need its browser checks run again (section 7).

**How things were measured.** Store counts come from S/ship/reader/data/route-store at version ccec4fa3071b: 651,752 rows, 122,496 keys, two rounds since v187 read the store (round 17, call 5; round 18, v188's landing). Resting lines come from S/v76/live-records, main 46bbbf7d50, 400,474 lines; the ship will measure again on its own tree. The relay was read from S/dl-v195/v187; every sha256 matches the letter's lines 34–45. Every script is in S/v77/ship56-design/ship6-words-back/, where S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad. Nothing was written into S/ship and no git command was run there. I write `file:N` for a file and line in S/ship/reader.

## 1. What lands

**1.1 The list.** It has 789 lines: done 520, settled 231, held unsettled 36, held damaged 2 (m1-stand.mjs).
- The letter says to retext "by key and rank, never by text" (FOR-ELIJAH-v187.md:20).
- strike-rows finds a row by source, key, rank and route together (tools/strike-rows-v1.mjs:247). Key and rank pick the row; the old route only confirms it.

**1.2 The 5 held for a fused seam.** I ran one rule over all 789 lines: "the printed text joins a Hebrew letter or mark to a Latin letter" (m1b-seams.mjs). It finds exactly the plan's 5 done rows and its 3 settled rows:
- done: יהורם 13, נבל 83, שבט 48, יהוה 24, גנזים 5;
- settled: יהורם 11, חשתי 6, נפש 117.

So **515 land**. Two things about this group:
- **יהוה 24 joins a different way.** Its words_back still has a space there. v187's own two added closes (closes [10, 40], RULE.md:23) take that space out before BDB's occurrence counts «C518» and «305». The same closing mechanism joins אחר 71 («…57») and טרם 7 («…39»), and the letter rule lets both of those land. The other 4 done rows and the 3 settled rows join in words_back itself, by RULE.md:25 ("its own tags read as nothing").
- **One more done row joins by RULE.md:25, to a digit:** ארבעים 10, «…, 40 + 1שָׁנָה», with no close. The review missed it because the served text ended at «1».

**Recommendation:**
- Hold the group by this rule, run over the whole list, not by five names. The owner's rule: "a rule is made over a dictionary's own category and runs over the whole shelf".
- Add ארבעים 10 to the seam put-back and hold it too. Then 514 land; the row has no closes.
- Ask Moses in the same put-back whether the occurrence-count joins (יהוה 24, אחר 71, טרם 7) are how BDB prints them.

All figures below are for 515.

**1.3 The 231 settled and the 38 held: the owner's note settles both.**
- OWNER-QUESTIONS-2026-11-14.md:5: «just push the ledgers we did live bro i cant check everyone before we push stuff». "So every question below goes ahead as recommended … each ship's notes say which recommendations it took … The one exception stays question 3."
- Line 37 (question 17): "BDB openings with gaps (38) stay as notes with gaps until a witness settles them. *Recommended.*"
- Line 38 (question 18): "BDB's Hebrew in its printed order at 231 openings … *Recommended: allow.*"
- the-ledgers-go-live/THE-OWNERS-WORDS-2026-11-15.md:9: "every recommendation … stands as taken, but question 3".
- The plan was written before the note. LANDING-PLAN.md:220 says "231 settled and 38 held wait on the owner", and ship 7 (:238) lists them.

So:
- **Question 18 is taken.** The 231 settled rows land, less the 3 the seam rule holds: **228 land**. They use the same list and the same tool, so they can ride in ship 6.
- **Question 17 is taken.** The 38 stay as notes with gaps; they are no longer waiting.
- Ship 6's notes must say it took questions 17 and 18.

## 2. The 515 against the store as it stands

- **Every row stands as read.** All 789 stand once at their key and rank, under M46, with the old text, the definition equal to the text, and 11 slots (m1).
- **Slot 9 (closes) is as the list gives it.** It is [route_closes, route_closes] on every row; 54 of the 515 carry closes.
- **The facts slot is whole.** Every row's sense mark (`opens`) is the line's entry.
- **The follower finds nothing moved.** Asked from the store v187 read (4d1357b26ca5; page-store-check-v1.json), it answers "served" for all 789.
  - No round touched an M46 row of the list.
  - v188 landed 20 M46 rows, one under a key of the 515 but at another rank.
  - Call 5 moved 26 rows of other sources into the 515's keys (M5 12, M41 6, M4 5, M96 2, M11 1); none was M46.
- **Facts now on the 515:**
  - row entry numbers (`n`) on 506; on the other 9 the sense mark alone. The plan's "511 of the 520" becomes 506 of the 515 (m2-recount.mjs).
  - ledger cuts (slot 7) on 2 rows: יסף 48 [19] and נצב 64 [7]. No print slot (slot 8).
  - slot 5 empty on all 515 (sim-retext.mjs, F).

## 3. The mechanism

**3.1 The retext.** Today strike-rows refuses this kind of retext:
- the whitelist of where a new text may come from refuses "words_back" (strike-rows-v1.mjs:194);
- the header says it is not in this version (:124-130);
- its own retext writes slot 1 only and cuts the row to 7 slots (:374). That would strip the closes and the facts.

**Recommendation: strike-rows v7**, with a retext whose text comes from words_back, rather than a new tool:
- the round record, the store history and the dry-run figures line already exist there;
- the follower already reads retext rows (row-strikes-follow-v1.mjs:168-170);
- check-store-continuity C1–C3 read that record's counts;
- the ConceptNet retext (round 13) already went this way.

For each line, v7 must refuse unless all of these hold:
- slot 1 and slot 2 both equal the old route;
- slot 9 equals the line's route_closes (an absent field means none);
- the row carries a sense mark equal to the line's entry;
- the closes are spaces of words_back, in rising order;
- the printed text equals words_back with those closes taken out.

Then it writes:
- slot 1 and slot 2 = words_back;
- slots 7 and 8 cleared;
- slot 9 = [closes, closes], or none;
- slots 0 and 3–6 and the facts slot (10) kept;
- the old row whole in the record (:373), with the new text, where it came from, and the closes.

No row folds into another: none of the 515 new texts is already an M46 text under its key (m2).

The list v7 lands is derived by a new tools/derive-words-back-v1.mjs, modeled on derive-fold-strike-landing-v1. It reads the pinned relay (data/made-spaces/words-back-v1/: RULE ab551ae3…, list f03fa594…, in-921-lost-none 0ed92496…, the 4 receipts). It runs the seam rule and re-proves every line on the store. It writes a retext list (515 lines, or 743) and a held list, both pinned by sha256.

What the retext changes:
- both texts on 515 rows, 6,559 UTF-16 units longer in all;
- slot 9 on 61 rows: 54 changed, 7 new, none removed;
- slot 7 cleared on the 2 rows that have cuts today;
- one new round and one new store version; rows and keys unchanged.

**3.2 The follower.** Today it refuses any retext since a list was read: the refusal is at row-strikes-follow-v1.mjs:182-185 (defined), :198 (following a name forward), :211 (following a name back) and :227 (the lists).

The prototype (proto/row-strikes-follow-v2-proto.mjs, a copy) replaces the refusal with an answer:
- a retexted row answers `retexted`, with its new name (key, rank, source, sha16 of the new text), the new text, and the round;
- following back is the inverse;
- the lists gain `retexted`, and the record a tool writes gains `rows_retexted_and_followed`;
- a row both moved to another key and retexted since is refused.

A rehearsal ran in memory only: a synthetic round 19 retexting the 515, laid on the M46 rows (sim-retext.mjs, output sim-out.json).
- A. The current follower refuses on a retexted name and on its lists.
- B. From both 90d9eb8e7082 and 4d1357b26ca5, all 515 names answer `retexted` with the new sha16, and all 515 new names follow back to the old ones.
- C. From 90d9eb8e7082 the lists are unchanged from today's (gone 5,403, landed 4,201, re-keyed 357); `retexted` holds 515.
- D. apply-sense-openings' matching, keyed by the followed text, finds exactly one row for each of the 2,008 lines and moves no mark. Keyed by the line's own text, as the tool does today (:142), 515 lines find no row.
- E. 482 rows of the default picks' rows tables answer `retexted`, and each is found once. The other 154,101 rows answer as they do today.
- F. On every retexted row, the note's text is the line's printed text, and slots 0, 3, 4, 5, 6 and 10 are unchanged (515 of 515).

**3.3 The steps, in one store change.**

| # | Step | Where | What it changes |
|---|---|---|---|
| 1 | strike-rows v7 retext | :194, :364-377 | as 3.1 |
| 2 | apply-ledger-divisions (no follower) | slotsOf :197-218, setSlots :230-240 | 2 rows divide (כפר 108 → [21], נצב 64 → [7,16]); 425 uncovered, named in the receipt (:261) and left whole; no print slot. My replay of the tool's own steps reproduces today's slots 7 and 8 on all 515 rows (m5-ledger.mjs). |
| 3 | apply-made-spaces | closes by text :269, :278, :283 | Today it would take the 61 new closes back off, and it refuses because the second road shuts on a retext (made-spaces-second-road-v1.mjs:98, refused at :345). Changes below. |
| 4 | apply-source-years --dry | | 0 |
| 5 | apply-sense-openings | key by the followed text at :139-142; record :180 | 0 rows move |
| 6 | apply-name-rows | no code change | 0 rows; must re-run (below) |
| 7 | apply-row-entries | name the row by its new sha16 at :195-198; record :282 | 0 rows move |
| 8 | the round: default picks | accept a retexted row at :465; record :1002 | 482 rows / 7,352 references followed; book files unchanged |
| 9 | the round: lattice projection | row stems :288-296 | new; see below |

Changes needed in apply-made-spaces:
- read words_back's closes by key and rank for the retexted rows, from the derived list;
- teach the second road that a retext takes a row off its old texts (counted by fallOf) but does not remove the row;
- count the words_back closes apart.

Step 6 is not in the plan's list. It must run again because check-names-gate:237 compares the record's "rounds since". The two rows of step 9 are not in the plan:
- **The default picks bake** must accept `retexted` at :465, and should print a followed row's text with its closes (`routePrinted`) at :469, as :447 already does.
- **The lattice projection** keys row stems by source, rank and text (project-lattice-v12-v1.mjs:292-293), and the page asks them the same way (zone.html:8229). It must follow these lines to the new text: m11-stems.mjs, below.

**3.4 Other places that name these rows by text** (each goes red without a change):
- **check-audit-calls A9.** It accepts slot 1 equal to the opening's printed text (:291-292). After the retext, slot 1 holds the text before closing, so it fails on 13 of the 34 landing openings that carry closes (15 with the 228) (m7-call2.mjs). It should compare the printed text instead.
- **check-sense-openings.** O3 keys lines by the list's text (:176-184); O4 compares the record (:233).
- **check-entry-gate.** The lists at :190, E3 at :324, E5 at :409 (by sha16).
- **check-default-picks.** D2 at :749-752 and the receipt account at :773.
- **check-made-spaces.** M3 (:262-270), M5's second road and its comparison with meets-v1.json (:340-400), and M6.
- **The stem gate's lookups** at check-entry-gate:644, check-names-gate:306, check-pointing-gate:133 and :140 all agree once the projection follows.
- **The text that names the refusal.** PIPELINE.md:108 and strike-rows' header :124-130.

## 4. What moves

**Nothing moves at rest.**
- A row carrying the sense mark gives no reading (gloss-store-v1.mjs:293, zone.html:2960), and the retext keeps that mark (F).
- Of the 400,474 resting lines, none equals a new printed text. 430 equal an old one, case folded, but all are other sources' lines (TAHOT's pieces, for example), and none is credited to M46 (m3-rest.mjs).
- **BDB's default line prints the ledger's slot 5.** It reads `b[0][5]` (bake-default-picks-v1.mjs:855, :864, :920) and DEFAULT_PICKS.bdb_words (zone.html:3996-3998), never the row.
  - At the 6,910 places whose BDB pick 1 names one of the 515 rows, the pick's words are never the row's old printed text nor its new one.
  - Of the 442 later picks that name them, likewise none (m4b-bdbline.mjs, m4c-bdbpicks.mjs).
  - So the plan's put-back at :266 ("the line keeps the gap while the card prints the words back") does not happen at these rows. 28 of the 515's old texts do appear among the ship's 5,181 baked BDB words, but always at other places.

| | 515 | 228 settled | 743 |
|---|---|---|---|
| notes printing BDB's words back | 515 | 228 | 743 |
| pieces put back | 689 | 594 | 1,283 |
| rows with closes / closes | 61 / 106 (89 carried, 17 added) | 29 / 37 | 90 / 143 |
| v178 made-spaces lines that lose rows (then served by none) | 54 (54) | 25 (25) | 79 (79) |
| v178 words-taken-out lines that lose rows (then served by none) | 492 (453) | 219 (200) | 705 (654) |
| rows named in the default picks / BDB references | 482 / 7,352 | 220 / 2,856 | 702 / 10,208 |
| new texts the BDB ledger cannot classify | 425 | 228 | 653 |
| other v174 rows that must stay unchanged | 1,493 | — | 1,265 |

Sources: m2-recount.mjs, m9-settled.mjs, m4-picks.mjs, m4d-settled-refs.mjs, m5c-marks.mjs.

Corrections to the plan's figures:
- **Rows with closes:** 64 for the 520 becomes 61 for the 515.
- **Lines that lose rows:** 56 and 496 become 54 and 492.
- **meets-v1.json** counts its falls for the 520 rows. Take the 5 held rows out of each fall's `by` and it agrees: 54 and 492 lines, 54 and 453 left served by none. Meets' counts after v188 equal the ship store on all 552 of its fall lines (m6-meets.mjs).
- **M5's "still prints a space before a comma":** among the 515 it goes from 35 to 1 (m10-comma.mjs).
- **The BDB ledger.** 425 new texts carry Hebrew points and accents (U+0591–U+05C3) that no M46 text in the store carries today (m5c-marks.mjs). The receipt's uncovered count goes 0 → 425. No check fails on that, but I would add one: every uncovered row is a sense-mark row.
- **The stems.** The binyan file (row-stems-v2.jsonl, sha256 e9d8a201…, the one the sidecars name) names 185 of the 515 rows by their old text, 50 of them with a stem; 82 of the settled rows too. Without the projection following them, those 50 lose their stem. Where the word's stem differs, the stem gate stops holding them back and they appear as notes on cards at rest. How many places: not measured. Call 5's re-keys are not affected: 0 of its 357 rows are named (m12-stems-rekeyed.mjs).
- **Chain books** record pills and the lines above them, not notes (card-readings-v1.mjs; build-chain-book-v2.mjs:174). By the code no change is expected, but not measured. The spec's ":168 chain books change" is not borne out by the code.
- **Records and receipts** that change: the index's sense openings, row entries, name rows and made spaces records; the ledger divisions, made spaces and default picks receipts.

## 5. Checks that must hold

- **A new check-words-back-v1:**
  - pins;
  - each retexted row has words_back in both slots, slot 9 as the list gives it, slots 0, 3–6 and 10 byte for byte, and its note text equal to the printed text;
  - the round records each old row whole, with no fold;
  - the held rows (274, or 46) are unchanged;
  - the other 1,493 v174 rows (or 1,265) are unchanged, the 132 of in-921-lost-none among them;
  - meets' falls less the held rows: 54 and 492 lines;
  - the follower's `retexted` from both read versions.
- **check-sense-openings:** it now has O1–O9, not O1–O7. All must hold on the 2,008 lines; O7–O9 run in the round's browser suite.
- check-entry-gate E3, E5 and E14.
- check-names-gate.
- check-default-picks D2 and its receipt account.
- check-made-spaces M1–M10.
- check-audit-calls A1–A9.
- check-ledger-divisions D3, plus the uncovered rule above.
- check-store-continuity C1–C5. C5 is unaffected: slot 5 is empty on all 515.
- check-route-store-exact-k L1–L10.
- check-fold-strike-landing F4: none of the 515 is a v188 row.
- The round's own: lines read the place, the resting-lines comparison shows 0 moves, the chain books, search.

## 6. New put-backs to Moses

1. **The unabridged BDB ledger** (declaration v109.2) needs shapes for Hebrew points and accents, or a line saying a sense-opening row is outside it: 425 of 515 texts (653 of 743).
2. **The binyan file** names 185 retexted rows by their old text (267 with the settled). Reissue it keyed by the new text, or confirm that the page follows.
3. **The seams.** Add ארבעים 10 to the question, and ask about the occurrence-count joins (יהוה 24, אחר 71, טרם 7).
4. **Row entries v1.2 and default picks v1.3** carrying the new sha16. These are already in the plan (:265, :270, :290).

## 7. Incident

While m4c-bdbpicks.mjs ran (about 300 MB), the kernel's out-of-memory killer killed two Chrome renderers of the ship's suite, about 2 GB each (dmesg 103032.01, about 18:40:00 UTC). The suite's browsers already used about 11 GB. After that I capped the heap of the later scripts (`--max-old-space-size`, 300–700 MB) and read the large files line by line. The ship's lead should check whether that suite run needs its browser checks run again.

## 8. Files

Everything is in /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/ship6-words-back/:
- the store and the follower: m1-stand.mjs, m1b-seams.mjs
- figures for the 515 and the settled rows: m2-recount.mjs, m9-settled.mjs, m10-comma.mjs
- resting lines and BDB words: m3-rest.mjs
- default picks: m4-picks.mjs, m4b-bdbline.mjs, m4c-bdbpicks.mjs, m4d-settled-refs.mjs
- the ledger replay: m5-ledger.mjs, m5b-slot7.mjs, m5c-marks.mjs
- meets and call 2: m6-meets.mjs, m7-call2.mjs
- pinned lists and the pointer map: m8-lists.mjs, m8b-pointers.mjs
- stems: m11-stems.mjs, m12-stems-rekeyed.mjs
- the prototype follower: proto/row-strikes-follow-v2-proto.mjs
- the rehearsal: sim-retext.mjs
- outputs: m1-out.json, m2-out.json, m3-out.json, m4-out.json, m5-out.json, sim-out.json

The rows tables and default-pick ledgers were read from S/dl-v180/v2/ledgers/all/default-picks/ and S/dl-v195/v195/v2/ledgers/all/default-picks/default-picks-v1.2/; their sha256s match the pin. The stems file was read from S/dl-v2/v2/corpus/binyan-ledger/build-r2/row-stems-v2.jsonl.