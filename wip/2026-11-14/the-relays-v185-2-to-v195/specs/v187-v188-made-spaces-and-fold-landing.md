# v187-v188-made-spaces-and-fold-landing

## Verified

FETCH AND HASH. Every file the three letters list was fetched into dl-v195/v187, dl-v195/v188 and dl-v195/v188.1: 16 + 15 + 20 = 51 files. All 51 match the letter's byte count and sha256 (none bad, none missing, none over 60 MB; the largest is landing-fold-strike-v1.jsonl at 11,581,861 bytes). The page store under pt matches what Moses read. pt/reader/data/route-store/index.json hashes to 1cd2e558… at store_version 4d1357b26ca5, struck-ranks-v1.json.gz to 514f0530…, and data/row-strikes-v1.json to 9813318d…, each equal to the input named in counts-v1.json. The M46 v2.1 lists are byte-identical to the pinned v2 lists (2f8b86bc…, ad5d9463…). All four lane verifiers say AGREE or agree:true. The two-run files repeat the shipped hashes. No downloaded script was run.

RE-DERIVED, v187. Every figure holds.
- Statuses: 789 = done 520 + settled 231 + held_unsettled 36 + held_damaged 2.
- The correction: 921 v174 rows have a text that is a line of v178's words-taken-out list. That is 789 (the final list) + 132 (in-921-lost-none). None of the 789 falls outside the 921, and the two lists don't overlap.
- Against store 4d1357b26ca5: all 789 stand at key, rank and text as M46. Definition == route on all 789. Slot 9 == [route_closes, route_closes] on all 789.
- Closes: 124 on 85 rows are carried and 30 are added, 154 in all. prints == closed(words_back, closes) on every line, and every close is a space.
- «literal» comes back 6 ways.
- When the 520 done rows land: 56 made-spaces lines and 496 words-taken-out lines lose rows, and 56 and 457 are then unserved. The 231 settled rows would move 26/222 more (26/203 unserved).
- Row shape: all 789 rows are 11 slots. All 789 carry facts.opens; 780 carry n, including 511 of the 520 done rows. 6 rows carry ledger cuts (row[7]), 3 of them done rows.

RE-DERIVED, v188. Every figure holds.
- 4,252 lines under 3,676 keys, all action land; 1 piece line; 61 with cut 1 (M9 42, M5 19).
- Credited: M3 1,818, M5 236, M23 210, M17 175, M60 167, M19 164, M4 156, M21 123.
- Struck holder of the credit: M8 2,082, M12 1,201, M39 298, M24 255, M51 243, M20 78.
- 3,660 lines carry the struck row's definition.
- Flags: maqaf 48, near-copy-in-list 8, near-copy-served 1,556, Jastrow overlay 1,538, two or more asserting 2,736.
- Holes: no hole is taken now. struck-ranks types [rank, credited struck m] at all 4,252. No two lines share key and rank. No row of any source prints the words (whitespace collapsed), and no same-source row holds them.
- 145 keys are new. Every year equals its source's most-carried year in the store. Every line has the fields strike-rows' land needs.
- Rule 8 reproduced 61/61 as case-folded whole-word containment; with exact case it gives 60.
- Left-out: 865 readings, all printed now, 376 of them naming the row-strikes record.
- No M14 route has a comma outside brackets (57 whole, 1 piece).

RE-DERIVED, v188.1. Every figure holds; one example needed a search.
- M9: 4,847 lines; 4,817 same, 30 counts.
- M5: 4,878 lines; 4,802 same, 62 counts, 14 new.
- M46: both lists unchanged; nothing is gone.
- Each count rises by exactly the v188 lines of that source whose route or definition is the text. Each new line's counts are v188's alone, with no span rows.
- My own diff gives the same 106 changes as changes-after-v188-v1.jsonl.
- «Japho , a place in Palestine» goes from 1 row to 2. The בקיע rank 7 example matches the letter. My first search for it missed because of a prefix encoding mismatch; it matched when found by its English.
- Maqaf lines: 48, of which 18 are M9/M5/M46 (M5 17, M46 1; M14 has 1). Only one stands behind a list line: איל rank 25.
- M46 lands 21 rows, 20 texts.
- Receipts: routes +4,252, keys +145; M9 rows +80 and pieces +42; M5 +236 and +19; M33 +1; M46 8,915 to 8,936; M14 +58; texts with a made space and no row 2,301 to 2,287.

INCONSISTENCIES FOUND are listed in put_back.

## Landing spec

# Landing spec: v187, v188, v188.1

## 0. Order across relays (one store change per step; round, gate and ship at the end)

1. **v189 call 5 first** (strike-rows). v188 then skips the 48 lines whose words call 5 re-keys to the plain key (v188 letter :37; v189 letter :43). If v188 landed first, call 5's NO_TWIN re-keys would refuse at those keys: `to_key_holds_text` false against any source's holder (strike-rows-v1.mjs:223).
2. **v188**, with **v188.1 pinned in the same store change** (v188.1 letter :24).
3. **apply-row-entries** after v188 needs `--the-store-has-moved-on`, with v190's v1.1 ledger if v190 has landed. The landed rows have no line.
4. **v187 last**, after three things:
   - after v189, whose lists name M46 rows by their current text (call 2 names 42 openings);
   - after v190;
   - only once the retext resolver below is in the consumers.

   v190 and v195 were both read at 4d1357b26ca5 and name the 520 rows by their old sha16.
5. **Re-bake default picks** after v188 and after v187. v195's 8,528 WAITS_FOR_V188 picks name v188 rows, and its step-unread ranks assume v188.

## 1. v188: land 4,204 of 4,252 lines

**Converter** `wip/2026-11-14/landing-v188/convert-v188.mjs`, following the convert-v162.mjs precedent. It reads `landing-fold-strike-v1.jsonl` (c1990493…) against the store after call 5 and re-proves every line:
- the key and rank hold no row;
- struck-ranks-v1 types [rank, credited_in_the_build_to.m];
- no same-source row holds the route.

It drops exactly the lines v188's own left-out rule drops at that moment: some row under the key prints the words, whitespace collapsed (RULE.md step 6). Expected: the 48 maqaf-flagged lines, by key and rank.

It writes `land-v188-v1.jsonl` with these fields: m, key, rank, route, definition, headwords, year, cut, kind, why, rank_from, record_loc, record_file, place "before", and each line's line number in Moses's file.

Do **not** use `--leave-off "<m>|<key>"` (strike-rows-v1.mjs:144). 11 of the 48 share (m, key) with a v188 line that must land: M5 בוא, M3 בית, M3 הלך, M59 חלל, M3 נתן, M4 סור, M3 עבר, M4 קרא.

**strike-rows-v1 to v6, one change.** Today `land` writes slot 5 as null (strike-rows-v1.mjs:249), but v188.1 RULE.md:16 lands slot 5 = 1 where `cut` is 1. Version 6 must:
- write `cut` into slot 5 (61 rows);
- raise `index.counts.cuts_by_source` (M9 +42, M5 +19) and `readings_that_are_a_cut_of_a_sibling_record` (+61). Without this, C5 goes red (check-store-continuity-v1.mjs:250).

**Run.** `node tools/strike-rows-v1.mjs --list land-v188-v1.jsonl --reason "relay v188 …" --dry`, then for real. Expect: land 4,204, already held 0, 145 keys made.

**Then, in the same store change:**
- `apply-ledger-divisions-v1` (slots 7 and 8 for landed rows of ledgered sources);
- `apply-source-years-v1 --dry` (expect 0 moved);
- `apply-made-spaces-v1` with the v188.1 pin (section 2);
- `apply-row-entries-v1 --the-store-has-moved-on`;
- `apply-name-rows-v1` and `apply-sense-openings-v1` (expect 0 moved).

**Checks:**
- `check-route-store-exact-k-v1`: L4, L5 (holes typed, no rank across two records), L8.
- `check-store-continuity-v1`: C1 with routes_landed, and C5.
- A new landing check: each landed line stands once at its key and rank with its route, definition, m, year, cut and headwords; and each skipped line's words are printed under its key.

## 2. v188.1: pin the lists after v188

**Folder.** Put the files in `data/made-spaces/made-spaces-v1.1/`. The lane's folder is called made-spaces-v1, but `data/made-spaces/made-spaces-v1/` is already v168's folder, so the copy needs another name. The folder holds:
- RULE.md (40d78ae9…), receipt-v1.1.json (b51c9aed…), lane-verify-receipt-v1.1.json;
- openscriptures_strongs.made-spaces-v1.1.jsonl (333ef7bb…, 4,847 lines);
- openscriptures_bdb_1906.made-spaces-v1.1.jsonl (aef21b48…, 4,878 lines);
- changes-after-v188-v1.jsonl (cb5f17b0…), meets-v1.json (a83dcff6…).

Put receipt-v2.1.json (c4bb842d…) and lane-verify-receipt-v2.1.json in `made-spaces-v2/`, beside the unchanged M46 lists.

**PIN.json.** A v188.1 entry replaces the v168 entry; the tool refuses two lists for one source (apply-made-spaces-v1.mjs:161). The v178 entry keeps its lists and its never_closed file; only its receipt becomes receipt-v2.1.json.

**Tool change** in apply-made-spaces-v1.mjs:140 and check-made-spaces-v1. Match the receipt's output by sha256, bytes and lines, not by file name. receipt-v1.1 names the lists by the builders' names (`…made-spaces-v1.jsonl`) while giving the v1.1 sha256 (v188.1 letter :28). As the tool stands today, the run refuses.

**Counts.** The receipts read store `4d1357b26ca5+v188`. With call 5 landed first, no served store is ever that one, so the tool records the counts and does not hold them (apply-made-spaces-v1.mjs:281-286). Hold them in check-made-spaces by a second road instead. Each line's rows should equal its receipt count less three things:
- the rows v189 takes off (meets-v1.json `v189.falls`: 4 lines, 9 rows);
- the v188 lines not landed (the איל rank 25 «) hart , stag , deer» line: rows_field_2 goes 2 to 1);
- the v187 rows retexted (meets-v1.json `v187.groups.lands_now`).

**Expected moves:** slot 9 written on landed rows whose definition text is a list line: M9 +30, M5 +85. No route text closes.

## 3. v187: retext the 520 done rows; hold 269

**Pin** `data/made-spaces/words-back-v1/`: RULE.md (ab551ae3…), words-back-final-v1.jsonl (f03fa594…, 789 lines), in-921-lost-none-v1.jsonl (0ed92496…, 132 lines) and the four receipts. Accept Moses's spacing rule (letter :22) for piece-to-piece seams. Hold 5 done rows until put-back 1 is answered, unless the page accepts the rule as written; land the other 515 now.

**The existing retext action can't be used.** strike-rows' `retext` takes only from_slot definition or source_unicode (strike-rows-v1.mjs:149), replaces the route only, and truncates the row to 7 slots (:324). That would strip slot 10 (opens on 520 rows, n on 511) and slot 9.

**New action:** strike-rows v6 `retext` with from_slot `words_back`, or a separate `tools/apply-words-back-v1.mjs`. It must:
- find exactly one M46 row with key and rank, row[1] == route and row[2] == route;
- set row[1] = row[2] = words_back;
- set slot 9 to [closes, closes], or null (64 rows get one);
- clear slots 7 and 8 for re-derivation;
- keep slot 10;
- record the old row whole in row-strikes-v1.json.

**Resolver** (one module that reads the record): (key, rank, m, old route or old sha16) → the row's text now. Wire it into:
- `apply-sense-openings-v1` (:118 matches by route). Without it, the 520 rows lose `opens` and print as pills.
- `apply-row-entries-v1` (:160, sha16). Without it, 511 rows lose n.
- `bake-default-picks-v1` (:236; refuses at :496). BDB picks name these rows: v189 counts 966 references to 39 of its 42 openings, and 62 of the 789 old texts stand in the baked BDB words.
- `apply-made-spaces-v1`. A retexted row takes its closes from words-back by key and rank. Today line :238 would set them to null.
- The matching checks (sense-openings O3, made-spaces, default-picks).

The names lists hold none of these rows, so apply-name-rows needs no change.

**After the retext:**
- run `apply-ledger-divisions-v1`, `apply-made-spaces-v1`, `apply-sense-openings-v1` and `apply-row-entries-v1`, then re-bake the default picks.

**Checks:**
- each retexted row: words_back in both fields, slot 9 as given, facts unchanged, and senseOpened(row).text === prints;
- the other 1,488 v174 rows are unchanged;
- the v178 list counts fall exactly by meets' figures (56/496);
- O1-O7 hold on all 2,008 v174 lines.

## Depends on

- v189 call 5 (calls-v1/call5-maqaf-keys-v1.jsonl) lands before v188. v188 then skips the 48 maqaf-flagged lines by key and rank; in the other order, strike-rows refuses call 5's re-keys (strike-rows-v1.mjs:223).
- v188.1 is pinned in the same store change as v188, with apply-made-spaces-v1 run after the landing (v188.1 letter :24).
- v189's lists that name M46 rows by their current text (call 2's 42 openings: done 35, settled 5, held 2; call 6) land before v187.
- v190 (row entries v1.1): apply-row-entries runs with --the-store-has-moved-on after v188. v187 lands after v190, and only once apply-row-entries resolves retexted rows (511 of the 520 carry n).
- v195 (default picks v1.2): its WAITS_FOR_V188 picks (8,528) resolve only after v188 lands. Its step-unread-landing ranks assume v188. Its BDB rows that name v187's rows by old sha16 need the retext resolver in bake-default-picks-v1.
- Page tool changes: strike-rows-v1 to v6 (land carries cut and raises cuts_by_source; retext from words_back keeps slots 9 and 10); apply-made-spaces-v1 and check-made-spaces-v1 match a receipt's output by sha256; one retext resolver used by apply-sense-openings-v1, apply-row-entries-v1, apply-made-spaces-v1, bake-default-picks-v1 and their checks.
- Owner's word on v187 section 3 (the 231 settled rows) and on the 38 held rows. Until then they stay notes with gaps.

## Moves at rest

v188 (4,204 lines landed after call 5's skip). These are measured at key level against store 4d1357b26ca5 with the page's own pool rule (readingKey, oldest first, min year and min rank). Landed rows are read whole, and the per-place gates are not applied, so these are upper bounds. The round measures the real moves against the recordings.
- New readings on a key's card: about 2,249.
- Merges into a reading the card already prints: about 1,955. Each adds a carrier; 1,657 of them end a reading's sole credit, and 250 make the merged reading older.
- 145 keys are new to the store, so words with no reading may now print one.
- The oldest-first leader changes at about 1,792 keys:
  - 1,225 because a landed row's rank (the struck row's hole) lends a better rank to an older reading it merges with. For example, under אבגתא, «Abagtha, a eunuch of Xerxes» gives way to «Abagtha» (M3 rank 1 merging with M9's «Abagtha.» of 1890). This restores the order from before the strike.
  - 395 because a new reading leads.
  - 145 because the key is new.
  - 27 because a merge made a reading older.
- So resting lines, chain books, the search index and default picks all need the round. With the Jastrow overlay on, 1,538 more lines merge by text.
- Store counts: routes +4,204 (net of call 5); cuts_by_source M9 +42 and M5 +19 (61 in all; slightly fewer if any skipped line carried one); row_strikes routes_landed +4,204.

v188.1. No resting line moves. Slot 9 is written on about 30 landed M9 rows and 85 landed M5 rows (their definition texts), so the record under those pills prints closed, and 14 new BDB texts close. The receipts' counts are recorded and held by the second road described in the spec.

v187 (520 rows). No pill, line or index entry moves, since an opening gives no reading (sense-openings O6). The 520 notes on cards print BDB's words in place of their gaps: 713 pieces come back, and 64 rows carry closes. BDB default-pick words that name these rows change too; 62 of the old texts appear among the baked BDB words. Chain books change where they record those cards. The v178 M46 lists lose rows: 56 made-spaces lines and 496 words-taken-out lines, of which 56 and 457 are then served by no row.

## Put back to the corpus lane

- v187, fused seams. Reading a piece's own tags as nothing (RULE.md:25, letter :22) joins a Hebrew piece straight onto an English word in 8 rows. Done: יהורם 13 «יֹרָםa Levite»; נבל 83 «— נֵ֫בֶלabsolute»; שבט 48 «(synonymמַטֶּה»; גנזים 5 «constructגִּנְזֵי»; יהוה 24 «יְהוָֺהC518». Settled: יהורם 11 «יְהוֺ׳priest»; חשתי 6 «articleהַח׳»; נפש 117 «נ׳in D». In each, the old text had a space there. v168's own rule keeps a space that markup alone held apart. Please reissue these lines with the seam kept, or confirm that the provider prints them joined. The page holds the 5 done rows until you answer.
- v187, held rows. RULE.md:33 says a held row's words_back keeps the provider's order, but 3 held rows have one settled run reordered and the other left in provider order: שש 33, הלול 8, רכב 81. Which text lands once the owner rules?
- v187, route_closes. The field is missing on 704 of the 789 lines; it appears only when non-empty. Letter :11 says every line gives it. Please state in RULE.md that a missing field means none, or write [].
- v187, old texts. The retext changes the text that other files use to name these rows. Row entries name a row by sha16 of its route (v190 v1.1); default picks name it by [key, rank, m, sha16] (v195 v1.2); v189 call 2 names it by its text. All of these were read at 4d1357b26ca5, before the retext. Please ship with v187 a map of key, rank, m, old sha16 to new sha16 for the rows that land, or confirm that the page should resolve through v187's own list.
- v188, letter :33. It says '865 readings of 860 routes', but left-out-v1.jsonl holds 865 readings of 861 routes: the 860 left out whole, plus רחלים «ewe, sheep», whose «sheep» lands as v188's one piece line (rank 2, M14). The count of routes left out whole (860, counts-v1.json) is right.
- v188, RULE.md:25 (rule 8). The comparison is case-folded whole-word containment (it reproduces 61 of 61; exact case gives 60), but the RULE doesn't say so. One line, אביר rank 14 M5 «strong», is a cut only of «the Strong», which is BDB's name for God, another sense. Please state the comparison, and say whether a containment that holds only when case is ignored makes a cut.
- v188.1, letter :28. The receipts name the lists by the builders' file names (…made-spaces-v1.jsonl) while the shipped files are …-v1.1.jsonl. The page will match by sha256. A note only; no reissue is needed.
- v188.1, section 3, letter :38. With v189 landed first, the receipts' store (4d1357b26ca5+v188) is never served. Once v189, v188 and v187 have landed, the page will name its store version, and asks you to run the builders again as you offered.

## Owner questions

- v187 section 3, asked by Moses. May the whole Hebrew pieces of 231 BDB openings be put in BDB's printed order, as Sefaria's BDB witnesses it? The characters stay the provider's; only the order of whole pieces changes. For example, «ק׳ יוֹם אֵידָם» is stored backwards as «יוֺם אֵידָם ׳ק». Until you answer, these rows stay notes with gaps.
- v187, the 38 held rows. In 36, no witness settles the order of the Hebrew. In 2, the provider's Hebrew is damaged by a stray control character (גבעה 31 and לוי 23). Keep all 38 as notes with gaps, as now?
- v188 section 4, asked by Moses. Should the store be rebuilt as one row per key, words and source, so that striking one source never takes another source's reading? This would also keep each source's own credit where the build kept one row: 2,736 v188 lines had two or more admitted sources behind them, and the 48 maqaf-key readings give way to another source's row.
