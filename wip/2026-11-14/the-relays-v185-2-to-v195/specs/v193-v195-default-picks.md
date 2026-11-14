# v193-v195-default-picks

## Verified

FETCHED AND HASHED (store, read only, into /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/dl-v195/v195/ and dl-v195/v193/):
- v195: 21 of 21 files the letter lists (FOR-ELIJAH-v195.md lines 98-118) match byte count and sha256. The letter itself is db8fb543…, which equals ship-v195/RECEIPT-ship.json relay_sha256.
- v193: 12 of 12 listed files match. The 39 book files match receipt-v1.json outputs[] by bytes, sha256 and lines: 3,832 lines and 1,484,010 bytes, as letter line 7 says. The letter is d2fa2128…, which equals ship-v193 relay_sha256.
- NOT ON THE STORE: default-picks-v1.2/inputs/. Letter line 94 and RULE-AMENDMENT line 79 name 9 files there; the store holds none. No file was over 60 MB, and nothing was skipped.

FIGURES RE-DERIVED FROM THE FILES (all hold unless marked). Scripts are in /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v53/v193-v195-default-picks/.

v195:
- Place counts:
  - step-mend has 43,219 lines, with no place twice and none outside v1.
  - 266 places gain STEP picks: r 259, v 159, a 28.
  - 7 places have a variant as pick 1, all ketiv/qere.
  - Only II Samuel 7:22:5 is left with no STEP pick, and no source picks there at all.
- Picks naming no row:
  - v1.1: 17,095 of 305,222 reading picks.
  - v1.2: 14,782.
  - Question-1 re-points: 2,325, of which 2,204 name ["כל",106,"M4",…].
- Totals by kind after v1.2: r 305,481, v 908, a 5,404. All 908 variants carry 4 items. Letters: K 883, AH 2, B 2; the others are as v1.1.
- Where ties did not move, v1.2 changes only rows and variant items: 42,952 of 42,953 places hold. The one exception is Numbers 7:59:17, the broken-bar variant B.
- BDB mend: 165 places, all empty before, 175 picks after. No record's slot 5 differs from v1.
- Rows: the first added row is 152,648, and the highest named is 154,573 of 154,583.
- Waiting picks: WAITS_FOR_V188 8,528 (M3 4,862, M5 3,281, M4 245, M46 49, 91 others; 494 of them on a skipped line), UNREAD_LINE_LANDING 5,146, WAITS_FOR_CALL5_REKEY 1,092 picks on 25 rows, NO_LANDING 15, NO_KEY 1. 12 are tied first by numbering v1.1.
- Unread landing: 4,601 lines, 5,146 places, 73 in Genesis, all M4, with no shared key and rank.
- Entry gate:
  - 2,291 lines: 1,469 skip, 745 print, 77 stale.
  - 5 stale lines carry until_row_entries_v1_1_lands.
  - v190 lets through 60 lines, 47 of them active.
- After call 5: 603 lines, 600 from call 5 (M5 558, M14 16, M3 13, M17 13) and 3 from question 1. v190 lets 2 through, both from question 1.
- Call-5 re-points: 3,921 lines; references 23,888, 16,013 and 122. Other-source references by m: M5 10,327, M17 2,441, M14 1,434, M3 1,297, M46 340, and 174 more.
  - All 3,921 targets equal v189's repoint_picks_to by four parts.
  - The call-5 file hashes 7c1778fe…, as receipt-v1.2 names.
- Branches: merged 192 (103 v + 46 a; 43 tied first); small-letter 310 at 310 places, 244 at ketiv/qere places with no K pick.

v193:
- Lines 3,832; picks 4,096. Picks by words source: ROW 3,057, OPENING 1,039.
- Overlay rows: M12 3,847, M49 212, M39 157, M65 23. All 4,239 re-resolve by [key, rank, m, sha16] in pt's served overlay, d5324f308ef9.
- Bible dictionary-form places by kind: REF_TO 1,057, OTHER_PARENS 680, ALONE 187, PLAY_ON 79, OPENING 33.
- The four branches part the lines: 2,002 + 100 + 1,707 + 23. The lean covers 1,930 places.
- Bible dictionary picks 2,090: 756 name a row under another key, 1,130 under the place's own, 204 none.
- Homographs 3,648; words_in_verse > 1 at 931 picks.
- Table: 303,235 places with 266 left, and after v1.2 303,500 with 1 left.
- Every p is a zone place.

PLAN AGAINST THE BAKE: my re-implementation of the bake's one counting rule reproduces the running receipt for v1.1 exactly:
- has: STEP 305,196, MACULA 295,417, UBS 245,089, BDB 103,493
- every fill, and STEP's 213 leaves
- 212 rest fills in 29 books
- STEP's auto second: MACULA in 29 books, none in 10

So its v1.2 figures in the landing spec stand on the same rule.

NEW FINDINGS, MEASURED:
- All 212 rest fills gain a kind-r STEP pick with words, so 0 remain. Each named row stands under another key than the zone word's.
- 239 non-ketiv/qere words are bare at rest while STEP's pick 1 has words (55 new in v1.2, 184 already in v1.1).
- 190 named Jastrow rows are word-sense rows. At 121 resting places, every row of Jastrow's pick 1 is a word sense.
- Rows v1.2 names that other relays change:
  - v187: 486 'done' M46 rows, 7,375 BDB references.
  - v189 call 6: 23 withheld rows, 453 references.
  - v189 call 5: 26 NO_TWIN rows, 122 references.
- Keys shared with other lists:
  - 35 unread-landing keys are call-5 re-key targets.
  - 358 unread-landing lines share keys with v188, with no rank clash.

## Landing spec

## 0. In short
v195 (default picks v1.2) is sound, and every headline figure re-derives. Laid on PLAN-MERGED as the plan is written, though, it removes the plan's whole change at rest:
- All 212 rest fills gain a STEP reading pick.
- STEP's leaves fall from 213 to 1: II Samuel 7:22:5, where no source picks.
- STEP has no auto second in any of the 39 books.
- Nothing on the line moves at rest.

**Do not ship the running v1.1 build's 212 rest fills.** v1.2 would take them back off the live site, and the owner must restate call 1 first (§3).

v193 (Jastrow) joins as a fifth pill, and nothing moves at rest.

## 1. Order relative to the other relays
1. **v189 call 5** (`tools/strike-rows-v1.mjs`: strike 5,403, re-key 357).
   - From this round on, the default-picks bake must read v1.2. v1.1 names call-5 rows 40,023 times (receipt-v1.2 `call5.references_in_v1_1_by_class`), so bake refusal 5 (`tools/bake-default-picks-v1.mjs:496`) would stop it.
   - v1.2 still names the 26 NO_TWIN rows 122 times, "as they stand" (`call5-repoints-v1.2.jsonl`, `to:null`). After the re-key, the bake must follow them through `data/row-strikes-v1.json` from the old [key־, rank, m, sha16] to the new [key, rank], or refuse.
2. **v189 call 6** (withhold 449).
   - v1.2 names 23 withheld rows 453 times: BDB 414, UBS 38, MACULA 1. v189 line 47 says the same.
   - A withheld row leaves the served store (`strike-rows-v1.mjs` header, lines 21-25). The bake must therefore count a named row that the strike record withholds, not refuse on it.
   - The bake must also read `call6-picks-words-withheld-too-v1.jsonl`, 18 lines:
     - 17 are UBS «NO DATA YET», which is already no line under the plan.
     - At Isaiah 45:4:9 there is no MACULA line («surname»).
3. **v188, then v188.1** (v188 skips its 48 maqaf lines).
4. **v195's unread landing** (`step-unread-landing-v1.2.jsonl`: 4,601 M4 lines, action `land`, `strike-rows-v1.mjs`, row-strike-rule-v5).
   - It goes after call 5 and v188 (RULE-AMENDMENT line 37).
   - Recompute the next free rank at landing time. 35 of its 4,222 keys are plain keys that call 5 re-keys 55 rows into, so the given ranks can clash there. Its 358 lines under v188's keys do not clash.
   - Either land these lines now or wait for the catalog reissue (call 1), not both. That choice is the owner's.
5. **v187 retexts.**
   - v1.2's BDB picks name 486 of the 520 'done' M46 rows, 7,375 times. Once those rows are retexted, sha16 misses and refusal 5 fires.
   - Follow retexts through the strike record. BDB's line prints slot 5, so no line text moves. Alternatively, Moses issues v1.3.
   - Waiting on the owner: 223 rows (2,888 references). Held: 38 rows (742 references).
6. **v190 before v195's 5 stale lines** (`entry-gate-picks-v1.2.jsonl`, `until_row_entries_v1_1_lands`).
   - Under the plan they move nothing: STEP's ledger words never print on the line (`zone.html` 3613-3616).
   - None of the 239 bare places in §3 is on either gate list.
7. **v185.2 (word senses v2)** before Jastrow's slot is baked.
8. **Then** run `bake-default-picks-v1` with v1.2 (and Jastrow), then the round `zones,stamps,search,defaults,records,lines,chain,door`. Zones go first, because the landed rows change the zone gloss.

## 2. v195: what to apply, with which tool
Tool: `tools/bake-default-picks-v1.mjs`. Line numbers are as pt runs it.

**Pins** (`data/default-picks/PIN.json`; relays add "v195"):

| Pin | File | Bytes | sha256 | Lines |
|---|---|---|---|---|
| `amendment_v1_2` | RULE-AMENDMENT.md | 16,209 | 139b2bfd… | |
| `receipt_v1_2` | receipt-v1.2.json | 14,063 | 652d933d… | |
| `mend_v1_2` | step-mend-v1.2.jsonl | 3,847,362 | b160d8cd… | 43,219 |
| `bdb_mend_v1_2` | bdb-mend-v1.2.jsonl | 20,708 | 1148f2cf… | 165 |
| `rows_added_v1_2` | rows-added-v1.2.jsonl | 75,541 | 0088a1ed… | 1,935 (first row 152,648) |

**Code changes:**
- **PINNED and KEPT (145-146).** Add the pins above. Keep the amendment and the receipt under `data/default-picks/default-picks-v1.2/`.
- **`names()`.**
  - Hold receipt-v1.2 `inputs.{v1_receipt, v1_rows_table, v1_1_receipt, v1_1_step_mend, v1_1_rows_added}` to the existing pins.
  - Hold `rule_amendment` and `outputs[]` to the new pins.
  - At 209, hold the first row number: 152,423 + 225 = 152,648.
- **Rows.** Re-resolve 154,583 rows (152,423 + 225 + 1,935). After the landings, re-resolve through the strike record (§1).
- **Mend (246-375).** Apply in two layers: v1.2, else v1.1, else v1.
  - Keep refusal 347 ("the mend changes a pick of kind r") for v1.1 lines only.
  - For v1.2 lines, refuse a place v1 lacks, or a place listed twice.
  - Where v1.1 has picks, refuse any change of kind, entry, gloss, words, or a variant's letter or Hebrew. Rows may change. The one allowed exception is Numbers 7:59:17's broken-bar variant.
- **Variants (372).** A variant now has 4 items: [letter, Hebrew, word number, reference]. All 908 do.
- **BDB.** Replace the bdb array at the 165 places. Refusal 6 still holds.
- **Holds (506-516).** Add:
  - mend lines 43,219
  - 266 places gained (r 259, v 159, a 28)
  - after v1.2: r 305,481, v 908, a 5,404
  - BDB 165 places / 175 picks
  - rows 1,935
- **STEP's line (378-379).** Decide `st[0][1]==="r" && hasText(st[0][4])`. 7 ketiv/qere places have a variant as pick 1.
  - With any kind counted, STEP has 305,430 and reads every word in 38 books.
  - With r only, STEP has 305,423 and reads every word in 34 books. Ruth, II Samuel, II Kings, Jeremiah and Ezekiel become partial.
  - Fills do not move either way.

**Results:**

| Count | v1.1 | v1.2 |
|---|---|---|
| has.step | 305,196 | 305,430 |
| has.bdb | 103,493 | 103,647 |
| fills.step | macula 212, ubs 202 | all 0 |
| fills.macula.step | 9,991 | 10,013 |
| fills.ubs.step | 60,309 | 60,341 |
| fills.bdb.step | 201,703 | 201,783 |
| step_leaves | 213 | 1: [3044,0,0,0], II Samuel |
| rest_fills | 212 | 0 |
| place_reading_answers | 31 | 0 |
| STEP's auto second | MACULA 29 books, none 10 | none in 39 |
| STEP line picks naming no row | 17,094 | 14,784 |
| STEP line picks whose first row is another source's | 55,449 | 71,346 |

MACULA's, UBS's and BDB's auto second stays STEP in 39 books.

## 3. What moves on the page
**Under the plan as written: nothing at rest but the pills.**
- The STEP pill reads «100%» in 38 books and «>99.9%» in II Samuel, with no «then».

**Of the plan's 212 rest fills, 0 remain.**
- All 212 are among the 266 places that numbering v1.1 ties. The other 54 of the 266 are 31 places where the zone's pieces answer and 23 ketiv/qere places.
- Each of the 212 gains a STEP reading pick with words:
  - 202 name a row: M4 196, M3 3, M17 2, M5 1.
  - 8 are UNREAD_LINE_LANDING.
  - 2 are WAITS_FOR_V188.
- Every named row stands under another spelling's key than the zone word's key: LENINGRAD_PLUS 173, CHANGED 24, MAM_PLUS 13, TWO_OR_MORE 2.

**What STEP prints at a bare place that now has a STEP pick: nothing.**
- Example, Ruth 3:14:2:
  - The zone key is מרגלותו.
  - STEP's pick «feet/ his» names [מרגלותיו,1,M4,b171c812…], which the card never looks up.
  - The place is no longer a leaf, so MACULA's «feet his» no longer fills it.
  - STEP's words never print on the line (`zone.html` 5654).
- The same holds at all 55 bare rest-fill places. 54 have an M4 row under another key. 1 has no row: I Samuel 21:14:7.
- The 157 places that print words today keep another dictionary's word. Psalms 10:5:2 keeps «archer» (M14), though STEP now reads «ways/ his».

**Wider than the 212.** 239 non-ketiv/qere words are bare at rest while STEP's pick 1 has words (184 already in v1.1, 55 new in v1.2):
- 221 name an M4 row under another key.
- 16 are UNREAD_LINE_LANDING.
- 2 are WAITS_FOR_V188.
- MACULA has words at all 239.

The plan counts STEP as having a line at all 239 (list: `bare-words-with-step-words-v1.2.tsv`). Its share and «reads every word» therefore overstate what prints.

**Options for the owner (call 1 restated):**

| Option | What happens | Lines that move |
|---|---|---|
| A | Keep the plan as written | 0 |
| B (recommended) | STEP's own words print where today's line is bare and pick 1 is more than a «<…>» mark. They are credited M4, since the row's text is the ledger's words by sha16. The card gets a made STEP pill (the plan's poolFor made row). The leaf rule then counts from what prints. | 239 |
| C | MACULA fills those words | 239 |

## 4. PLAN-MERGED lines that change
| Plan line | Today | Under v1.2 |
|---|---|---|
| 25, 78 (§0.1 #1, §0.5.1) | STEP's ledger words never print on the line | only if option B is ruled |
| 26, 634-656 (§7) | 212 rest fills in 29 books | 0 rest fills |
| 54 | STEP's pick 1 is always r | 7 variant exceptions |
| 85 | 213 step_leaves | 1 |
| 113-125 | pins | add the five pins above |
| 197 | 152,648 rows | 154,583 |
| 198 | mend at 1,265 places | add 43,219 |
| 211, 212, 216-220 | refusals 3, 4 and 8 | as in §2 |
| 237 | rules and receipts kept | also keep v1.2's |
| 356 | card label "STEP has none here" at rest | none at rest |
| 630 | spot reads Daniel 1:4:6, Psalms 10:5:2, Ruth 3:14:2 | these now print today's line |
| 655 | "no source picks: Ruth 3:12:5" | it is II Samuel 7:22:5; Ruth 3:12:5 is ketiv/qere |
| 711-712, 728 | owner calls 1, 2 and 11 | restated (call 2 grows by 157; call 11's credit count rises to 71,346) |

## 5. Checks
**`check-default-picks-v1`:**
- D1c: v 908, a 5,404.
- D2: 154,583 rows, followed through the strike record.
- D3: STEP has no second in any of the 39 books.
- D5: expect 0 fills, or 239 under option B.
- w1: II Samuel. w3: none, so the law must skip with a reason (check lines 538 and 1257).

**Other checks:**
- check-same-product S1 `--expect` lists 0 lines, or 239 under B.
- check-line-reads-the-place-v1 is unchanged.

## 6. v195's other files
| File | What the page does |
|---|---|
| `picks-waiting` | Pin it and count it in the receipt |
| `entry-gate` and `after-call5` | Change nothing under the plan (STEP's picks show on the card as text); needed only under option B |
| `call5-repoints` | Credit branch off at rest |
| merged and small-letter branches | Off at rest; not baked |

## 7. v193: Jastrow as the fifth pill
**Bake: add `--jastrow <dir>`.**
- **Pins:**

  | File | Bytes | sha256 | Lines |
  |---|---|---|---|
  | RULE.md | 15,259 | 67a623af… | |
  | receipt-v1.json | 34,754 | 000df41d… | |
  | rows-jastrow-v1.jsonl | 169,683 | d3335d23… | 4,239 |

  The 39 book files are held to `outputs[]`.
- **Holds:**
  - `table_if_v1_2_step_mend_lands` names b160d8cd.
  - The overlay's index store_version is d5324f308ef9, and all 4,239 rows re-resolve in `data/overlays/jastrow/shards`.
  - Every p is a zone place.
- **Rest rule as data.** The lean is form DICTIONARY with a BIBLE citation that is not PLAY_ON: 1,930 places. 12 are ketiv/qere, which leaves 1,918 lines.
  - Take the first resting pick: at 25 places, pick 1 does not rest.
  - 80 places have 2 resting picks.
- **Credit.** The words are the ROW's route, credited to the row's m (M12, M49, M39 or M65). Otherwise the words are the OPENING, credited to M12.
- **Card.** The card needs a made pill at 877 places: 702 rows under another key and 175 openings.
- **Word senses.** Pin `data/word-senses/jastrow-v1.json` (d5324f308ef9).
  - 121 resting places have pick-1 rows that are all word senses, e.g. Deuteronomy 6:4:1 «to be still,».
  - While the word senses switch is off, there is no Jastrow line at those places.
  - While it is on, the line prints «word sense, not definition: » and the words.
- **Book file** `DEFAULT_PICKS_BOOK_V2`: slot 4 holds `[[words, m, sense, ws, kind], …]`.
- **Index** `DEFAULT_PICKS_INDEX_V2`:
  - add `{id:"jastrow", pill:"Jastrow", m:"M12"}`
  - has and fills become 5×5
  - step_leaves rows gain a fifth item
- **Counts:**
  - has 1,918 (0.6%); the highest book is Leviticus, 242 (2.0%); Haggai has 0.
  - fills.jastrow: step 303,512, macula 293,504, ubs 243,227, bdb 102,284. The auto second is STEP in all 39 books.
  - Jastrow fills others: macula 5, ubs 56, bdb 555, step 0. It is never anyone's auto second.

**Page (`zone.html`):**
- 3620: add jastrow to DFLT_IDS.
- 2510: add `#default-jastrow` and `#default-jastrow-dir` to the pill group.
- DFLT_SLOT: jastrow is slot 4. Add jastrow to dfltPicks, lineOf and leafLine.
- 3768 and 4453: schema checks move to V2.
- 4059 and 4063: TOGGLES get the literal position `{id:"jastrow", lab:"Jastrow"}`.
- `dfltOn("jastrow")`: M12 is not off, and the overlay's store_version matches, as `__sensesFit` does at 4255.
- `made()` credits the pick's own m.
- Rebuild `/toggles/`.

**Checks:**
- D1: 3,832 lines, 4,096 picks.
- D2: 4,239 rows.
- D3: 5×5.
- D4: five pills.
- D6-D8, D13, D18 for X = jastrow.
- D14: Haggai has 0, so its pill is disabled.
- New D20: word senses.
- check-menu-switches M3, and check-word-senses W5 under `?default=jastrow`.

**Nothing moves at rest.**

## 8. Ship
Commit on main, then merge into gh-pages with the message «gh-pages follows main», push both, and run check-live-v1 with L5 (the index).

## Depends on

- v189 call 5 lands first (strike 5,403, re-key 357). From then on the bake must read v1.2, and must follow 26 NO_TWIN rows (122 references) through data/row-strikes-v1.json
- v189 call 6 (withholds 23 rows named 453 times: BDB 414, UBS 38, MACULA 1) and its 18 suppress-the-words picks
- v188, then v188.1, before v195's unread landing (RULE-AMENDMENT line 37)
- v187 retexts 486 'done' M46 rows that BDB picks name 7,375 times. The bake follows the retexts or Moses issues v1.3
- v190 before v195's 5 stale entry-gate lines (they move nothing under the plan as written)
- v185.2 (word senses v2) before Jastrow's slot is baked
- the owner's restated call 1 (options A, B, C over the 239 bare words) before any rest fill ships
- the running v1 + v1.1 build in pt (PLAN-MERGED): its 212 rest fills must not ship

## Moves at rest

Under PLAN-MERGED as written with v1.2, nothing moves on the line at rest. All 212 rest fills of the v1.1 build disappear, and STEP's leaves fall from 213 to 1: II Samuel 7:22:5, where no source picks. STEP has no auto second in any book.

What changes at rest are the pills:
- STEP reads «100%» in 38 books and «>99.9%» in II Samuel, with no «then».
- MACULA, UBS and BDB each show «then STEP».
- BDB's own share rises slightly: has goes from 103,493 to 103,647.

The 55 bare words that the v1.1 build would have filled with MACULA (e.g. Ruth 3:14:2 «feet his») stay bare. The 157 words with another dictionary's line today keep it (e.g. Psalms 10:5:2 «archer»).

Under option B, 239 bare words take STEP's own words, credited to TAHOT (M4), with a made pill on the card. Under option C, the same 239 take MACULA's.

Jastrow (v193) moves nothing at rest: it is never STEP's second. It adds a fifth pill, «Jastrow», at about 0.6% of words (Leviticus 2.0%, Haggai 0).

Card pills at rest: unchanged under A. Under B, the 239 places gain a pressed made STEP pill.

## Put back to the corpus lane

- v193 line 72 says Jastrow's rows rest off on the page under the rabbinic_witnesses toggle. This is wrong for the page. data/serving-rulings-v1.json (jastrow-served) says of the overlay «It starts on and is removable», and zone.html 3861-3870 says the overlays are on unless the reader turns them off. So the owner question 3 of v193 §6 is moot.
- v193 does not check its rows against the word-senses list (RULE.md 76-87). 190 of the 4,239 named rows are rows the page holds back as word senses (data/word-senses/jastrow-v1.json). At 121 resting places, every row of the pick prints a word sense, e.g. Deuteronomy 6:4:1 «to be still,» (שמע 230/231 M12) and Daniel 2:5:7 «it is». Ask Moses to flag word-sense rows per pick, or to take the sense's first row that is not a word sense, and to recount after v185.2.
- v193 places picks on word numbering v1 (RULE.md line 24), while v1.2 reads v1.1 (RULE-AMENDMENT line 7). At the 266 places v1.1 newly ties, STEP's dictionary form was never read. Ask whether any Jastrow place is gained, and to re-issue if so.
- v195 line 33 says the line under STEP's default prints the ledger's words 'as your plan says'. The plan says the opposite: STEP is today's line and its ledger words never print on the line (PLAN-MERGED lines 25 and 78; zone.html 3613-3616). So the statuses and the gate lists do not move the line under the plan.
- v195 does not cover rows that other landings change. v187 retexts 486 'done' M46 rows that BDB picks name 7,375 times (223 more rows, 2,888 references, wait on the owner). v189 call 6 withholds 23 named rows (453 references), and call 5 re-keys 26 named rows (122 references). Ask for a v1.3 rows table against the store after the page lands v189, v188 and v187 (the page sends the store_version), or confirm that the page follows its strike record.
- All 266 places newly tied by v1.1 name rows under another key than the zone word's, or name none: 233 reading picks outside ketiv/qere under another key and 10 with none; at ketiv/qere places, 18 under another key and 5 with none. Example: Ruth 3:14:2, row מרגלותיו against the zone's מרגלותו. The same holds for the 239 bare words. Ask Moses to add row_key (PLACE_FORM or OTHER_FORM) to STEP's picks, as v193 does for Jastrow.
- v195 line 29 names v193 as a list that may land rows under the same key, but v193 lands no route-store rows: its rows are overlay rows already served. Ask which of v190 and v191 actually land rows under route-store keys. Note also that 35 unread-landing keys receive call 5's re-keys (55 rows), so their given ranks clash if call 5 lands first.
- v195 line 94 and RULE-AMENDMENT line 79 say the given lists are copied to default-picks-v1.2/inputs/ (9 files, 2,862,467 bytes). They are not on the store: the store's default-picks-v1.2/ holds 17 files, and the ship scope excludes folders named inputs. Put them on the store, or say they are in git only.
- receipt-v1.2 step.step_lines = 305,495 is defined neither in the letter nor in the amendment.
- receipt-v1.2 gives no totals by kind after v1.2, and the letter's §5 quotes v1.1's 748 variants (K 725). v1.2 holds r 305,481, v 908 (K 883, AH 2, B 2) and a 5,404. Put these into the receipt so the bake can hold them.
- Say why II Samuel 7:22:5 has no pick from any source: STEP, MACULA, UBS and BDB are all empty there.
- Page-lane note, not for Moses: PLAN-MERGED line 655 names Ruth 3:12:5 «mother» as the place where no source picks. That place is II Samuel 7:22:5 (receipt step_leaves.with_no_line_places). Ruth 3:12:5 is a ketiv/qere place.

## Owner questions

- Call 1 restated under v1.2. The plan's 212 rest fills fall to 0. 239 words are bare at rest although STEP's own reading exists there (55 new in v1.2, 184 already in v1.1); 221 of them name a TAHOT row under the other spelling's key, which the card never looks up. Which do you want: (A) leave them bare; (B) print STEP's own words there, credited to TAHOT, with a STEP pill on the card (recommended); or (C) print MACULA's words, as the v1.1 build would at 55 of them?
- Call 2 grows by 157 words. These are words where today's line prints another dictionary's word while STEP's own pick now exists, e.g. Psalms 10:5:2 «archer» (M14) where STEP reads «ways/ his», and Daniel 1:4:6 «blemish» (M9) where STEP reads «blemish» on M17's row. Keep today's line?
- Credit (call 11). Under v1.2, STEP line picks whose first named row is another source's rise from 55,449 to 71,346, because of call 5's re-points to other sources' rows. Is the line under STEP always credited to STEP (v195 §9 and v189's branch)?
- Jastrow's branches. The lean rests 1,930 places. Of those resting picks, 398 stand where the letters cannot tell which word of the verse Jastrow meant, and 1,051 are «ref. to» citations (a later passage explaining the verse). Under the no-claims ruling, should they rest on as placed, or only where one word carries the letters?
- Is a Jastrow pill worth having (v193 Q2)? It covers 0.6% of words overall, 2.0% in Leviticus, and 0 in Haggai. In Haggai, should the pill be hidden or disabled?
- At 121 places, Jastrow's default pick is a word sense, which the page holds back at rest. Should Jastrow print no line there while word senses is off, and «word sense, not definition: …» while it is on?
- v195's unread landing: land the 4,601 STEP rows now, or wait for the catalog reissue (the audit's call 1)? Not both.
- v195 §9: should the merged-picks branch (192) and the small-letter written forms (310) ever rest on?
