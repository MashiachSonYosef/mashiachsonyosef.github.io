> The store builder's report, as returned to the lead (the builder's own write of this file was refused by the harness; the lead saved it from the workflow's journal).

PARTIAL IN ONE THING ONLY: REPORT.md is not on disk. The Write tool refused it ("Subagents should return findings as text, not write report files") and I did not route around the refusal. This summary is the whole report; the notes folder /home/user/mashiachsonyosef.github.io/wip/2026-11-15/the-ledgers-go-live/build/ship-4-store/ exists and is empty. Everything else is done and proven. Do not re-run this step: the tree holds the proven state after step 5.

# Ship 4, the store side

Tree /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/b4, branch ledgers-build, base ec1c8a6764, three commits (668e0a5ca5, 362eb5b0ba, 0ea924a80a). Steps 1 to 5 of 4.4 ran twice from the committed state and gave the same sha256 table, byte for byte. Three plan figures do not hold: v188 lands 4,201 not 4,204; routes end at 651,302 not 651,305; M5 gains 84 closes not 85. None was bent.

## Deliverables
- Steps script: /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v64/steps/ship4-store-steps.sh <tree> [<YYYY-MM-DD>] (sha256 a9be15995e65…).
- Proven table: /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v64/steps/ship4-store-sha256.txt (sha256 3fffce8bd5f146c64a5660cba3f7ce5708b8f9055095fb98a94b7830d1e944ea; 873 files' sha256 over 5 steps). The two runs: …/v64/steps/run-1/ and …/v64/steps/run-2/.
- Logs of every check and red-state demonstration: /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v64/ship4-store/ (checks/, red/, next/, run-1.out, run-2.out, scripts/).
- The tree's store is left in the state after step 5 (generated, uncommitted). No server of mine is running. Commit messages are plain, with no attribution trailer (the rule: no model or tool names).

## What was built
1. Pins, byte for byte, each file compared with the download by sha256; all 16 files of calls-v1 are named by sha256 in FOR-ELIJAH-v189.md lines 104 to 121.
   - reader/data/audit-calls/PIN.json (AUDIT_CALLS_PIN_V1) and 15 new files in calls-v1/ (call 4's list was there from ship 3, the same bytes). The plan says "13 lists": there are 12 lists and 4 other files. The pin also holds how calls 5, 6 and 2 land (reason, the one leave-off, the order) and the bytes of the re-key map.
   - reader/data/fold-strike-landing/PIN.json (FOLD_STRIKE_LANDING_PIN_V1) and 7 files in landing-v1/ (landing-fold-strike-v1.jsonl c199049388e4…, 4,252 lines). It names the two derived lists by bytes and the three lines held off for their key.
   - reader/data/made-spaces/PIN.json rewritten as MADE_SPACES_PIN_V3: v188.1's entry in the place of v168's (made-spaces-v1.1/, 7 files; v168's folder kept and named as replaced) and v178's entry reading receipt-v2.1.json (2 new files in made-spaces-v2/).
2. strike-rows v6 (row-strike-rule-v6-…-the-hole-is-typed-and-a-landed-cut-is-counted): a landed line may carry cut 1, written to slot 5; index.counts.cuts_by_source and readings_that_are_a_cut_of_a_sibling_record follow, so C5 holds. Also a `figures {…}` line on every run, `--on <moment>`, a count of rows taken at a rank already typed, a plain refusal for a missing list. The retext from words back (v187) is refused, not built.
3. tools/derive-fold-strike-landing-v1.mjs derives land-v188-v1.jsonl and not-landed-v188-v1.jsonl from Moses's list and the store as it stands after call 5. It refuses unless the record's last round is call 5's, unless the lines dropped for their words are exactly the 48 the list flags, and unless the bytes are the pin's. Every line not landed is named with its reason and the row that prints its words.
4. apply-made-spaces-v1 and check-made-spaces-v1 match a receipt's outputs and sources by sha256, bytes and lines, never by name, and hold the counts by the second road (tools/made-spaces-second-road-v1.mjs): the receipt's counts less the rows the row-strikes record took since store 4d1357b26ca5 and the lines of v188 not landed. The check also holds the page's record to the lane's own count (meets-v1.json). The seam for v187: a retext since the receipt's store shuts the road and both refuse in a sentence naming relay v187.
5. tools/check-audit-calls-v1.mjs (A1 to A9), tools/check-fold-strike-landing-v1.mjs (F1 to F7), tools/emit-call5-rekey-map-v1.mjs.
6. Also: tools/step-moment-v1.mjs (new), apply-ledger-divisions-v1.mjs (--on), check-store-continuity-v1.mjs (GUARDS v6; C3), pinned-v1.mjs (heldToPin), PIPELINE.md, tools/round-v1.sh (header).
Lint: no new warnings over 12 tool files. No Hebrew in string literals. check-ledger-declared-v1 ok.

## The steps (moments 2026-11-15T00:00:0N.000Z, N the step)
- 1 call 5: 5,403 struck, 357 re-keyed and landed, 0 folded, 2,550 keys emptied, routes 652,954 → 647,551, keys 124,901 → 122,351. Re-key map: 357 lines, 178 plain keys, 26 named by picks (122 references).
- 2 v188: 4,201 landed (plan 4,204), 51 not landed (48 for their words, 3 for their key), 0 already held, 145 keys made, 61 cuts (M9 42, M5 19; 0 on a line not landed), routes 647,551 → 651,752.
- 3: ledger divisions move 93 slots, none uncovered (no plan figure); source years, dry: 0 move; made spaces: M9 +30, M5 +84 (plan +85), M46 0, all three held by the second road.
- 4 call 6 with the pin's leave-off: 448 withheld, 1 left off (line 293, M74 פעלי־), 393 keys touched (settles D11), 10 emptied, routes → 651,304.
- 5 call 2: 2 withheld (M23 קש 18, M23 ר 9), routes → 651,302, keys 122,486. Then the made spaces again: 0 rows, no shard.
Store versions: 869e4ee14c3a → 31bd2821c084 → fdeac8d92e84 → 093f85761eba → 5bee25fd9681 → 6801640d5206 → d4991b5add5b.

## What the plan did not foresee
1. Three lines of v188 land under a key that ends in a maqaf: line 961 M59 ה־ rank 4 «the», 1881 M4 כל־ rank 2 «all», 1983 M21 ל־ rank 1 «to». Call 5 empties every such key and A3 says none may stand. Landed as listed they make 148 keys, not the plan's 145, three of them ending in U+05BE. Each line's words are already printed under its plain key (ה: M46 rank 2; כל: M5 rank 1, M14 rank 50, M4 rank 106; ל: M5 rank 1), so call 5's own rule would have struck them. The pin names the three, the tool does not land them and refuses any other line of that kind. The plan's 4,204 and its 145 keys cannot both hold; 4,201 gives 145. Put back to Moses.
2. M5 gains 84 closes, not 85: the 85th is the definition of the איל rank 25 line, one of the 48 not landed, which the plan's own second road names.
3. The clock: three tools wrote the time into their records, so no two runs could give one table. `--on` gives the moment; with none the clock is used as before.
4. The made spaces must be recorded again after calls 6 and 2 (step 5b), or check-made-spaces M4 is red.
5. C3 of check-store-continuity was red by 1: call 2 withholds M23 קש rank 18, a row relay v147 landed in a hole an earlier round had typed. strike-rows v6 counts such rows and C3 subtracts them: 127,803 = 127,424 + 380 − 1.
6. The committed state is not a consistent store: the made-spaces pin names v188.1 while the store is as v168 left it. My two checks are red there and apply-made-spaces refuses. The steps script must run on the merged tree before any check or round.
7. PIPELINE-MANIFEST.md and data/ledger-index-v1.json are not regenerated: the round emits both, and the manifest in this tree was already stale from ships 1 and 3. A regeneration to scratch names my three rules with their guards. check-manifest-prints-unguarded-v1 L5 is red until the round regenerates it.

## Proof of the script
- Twice from the committed state: both runs exit 0 and the two tables are the same bytes. The tree's reader/data after run 2 is byte for byte what it was after run 1, and all 269 paths of the table are the tree's bytes now.
- It stops at the first figure that differs: on a store one row short, step 1's dry run gave `DIFFERS routes_before: {"expected":652954,"got":652953}` and two more, "STOPPED at step 1", and the tree's data was untouched.
- At the state after step 5 it stops at step 1 on the tool's refusal, writing nothing.
- Files changed: step 1 260, step 2 261, step 3 146, step 4 200, step 5 6.

## Red on a wrong state (logs in red/)
- Committed store: check-audit-calls A2 to A8 red; check-fold-strike-landing F2 to F5 and F7 red; derive, emit-call5-rekey-map and apply-made-spaces refuse.
- A record copy with one thing wrong: A2, A6, A7, F3 each red alone.
- A store copy with one thing wrong: A3 with A8, A4, A8, A9, F4, F5, F6, F7 each red; the copy put back, both green.
- A pinned byte changed in the tree, then restored: A1, F1. The map with one rank changed: A5. The not-landed list a line short: F2.
- The second road on a wrong record (restored byte for byte): a struck M5 row unrecorded → apply-made-spaces refuses and check-made-spaces M5 is red («15,446 rows here, 15,447 by the second road»); a retext of an M46 row since → refused with the v187 sentence; ranks already typed set to 0 → C3 red.
- After call 5 alone: the pin naming no maqaf line → derive refuses, naming line 961; the pin naming other bytes → refused, nothing written; call 6 with no leave-off → refused.

## For the next builder (the follower and the facts)
The store (reader/data/route-store, uncommitted): version d4991b5add5b, 651,302 routes, 122,486 keys, 256 shards, 16,056,268 bytes; no key ends in a maqaf. index.row_strikes.cumulative: struck 8,033, re-keyed 380, restored 71, landed 4,378, ranks already typed 1, 20 rounds. index.made_spaces names v188.1 and v178. index.row_entries, index.name_rows and index.sense_openings are untouched and now stale.

The record (reader/data/row-strikes-v1.json) gained rounds 17 to 20, each {rule_id, ran_at, reason, list:{file, sha256, lines, left_off}, branch, counts, store_version:{was, now}, rows}:
- 2026-11-15T00:00:01.000Z call5-maqaf-keys-v1.jsonl (7c1778fe…): 5,403 strike, 357 re-key; 869e4ee14c3a → 31bd2821c084.
- 2026-11-15T00:00:02.000Z land-v188-v1.jsonl (c31008de…): 4,201 land; 31bd2821c084 → fdeac8d92e84.
- 2026-11-15T00:00:04.000Z call6-withhold-v1.jsonl (fbd208dd…): 448 withhold, left_off names line 293; 5bee25fd9681 → 6801640d5206.
- 2026-11-15T00:00:05.000Z call2-withhold-v1.jsonl (e2748105…): 2 withhold; 6801640d5206 → d4991b5add5b.

Row shapes, one real example each (`row` is the whole row as it stood, or as it landed):
- struck: {"action":"strike","why":"list","kind":"key_ends_in_a_maqaf","key":"א־","rank":2,"m":"M4","route":"the","row":[2,"the","the","M4","S_NO_SOURCE_YEAR",null,["א־"],null,null,null,{"n":["H9010"]}]}
- re-keyed: {"action":"re-key","why":"list","kind":"key_ends_in_a_maqaf","key":"אהרן־","rank":1,"m":"M4","route":"Aaron","row":[1,"Aaron","Aaron","M4","S_NO_SOURCE_YEAR",null,["אַֽהֲרֹן־"],null,null,null,{"n":["H175"]}],"to_key":"אהרן","to_rank":13,"to_headwords":["אַֽהֲרֹן"]}. In the store now, under אהרן: [13,"Aaron","Aaron","M4","S_NO_SOURCE_YEAR",null,["אַֽהֲרֹן"],null,null,null,{"n":["H175"]}]. Only the rank and the headwords change; every other slot travels. None of the 357 folded.
- withheld: {"action":"withhold","why":"list","kind":"only_the_class_of_word","key":"אביב","rank":29,"m":"M13","route":"a male given name","row":[29,"a male given name","a male given name","M13","S_NO_SOURCE_YEAR",null,["אביב"],null,null,null,{"name":1}]}
- landed: {"action":"land","why":"list","kind":"fold_strike_whole","key":"אבדה","rank":10,"m":"M9","route":"lost","row":[10,"lost","concrete, something lost ; abstract, destruction , i.e. Hades","M9","1890",1,["אֲבֵדָה"]],"land":{"rank":10,"route":"lost","definition":"…","headwords":["אֲבֵדָה"],"year":"1890","rank_from":"the struck row's hole: struck-ranks-v1 holds [10, \"M12\"] under this key, …","place":"before","record_loc":"entry:H9#meaning-frame-route:1","record_file":"…/HebrewStrong.xml","cut":1,…},"landed_at":9}. `rank` is the row's rank; `landed_at` is its position in the key's list. In the store after step 3: [10,"lost","concrete, …","M9","1890",1,["אֲבֵדָה"],null,null,[null,[24,48]]].

What the facts tools will meet:
- No landed row carries facts: of the 4,201, 3,994 have 7 slots, 88 reach slot 7, 5 slot 8, 114 slot 9; none has slot 10. Sources: M3 1,801, M5 219, M23 210, M17 175, M60 167, M19 163, M4 152, M21 122, M13 115, M18 106, M6 103, M9 80, and 50 more.
- Of the 5,403 rows call 5 struck, 4,664 carried facts; of the 357 it moved, 45 did and still do; of call 6's 448, 135 did.
- The re-key map: reader/data/audit-calls/call5-rekey-map-v1.jsonl (generated by step 1; 357 lines, 65,803 bytes, 1d62a7ca8c97…; pinned in data/audit-calls/PIN.json under made_here.call5_rekey_map). A line: {"from":["אהרן־",1,"M4","324a17d21917a99c"],"to":["אהרן",13,"M4","324a17d21917a99c"],"to_headwords":["אַֽהֲרֹן"],"named_by_a_pick":true,"default_picks_naming_it":{"step":1,"macula":0,"ubs":0,"bdb":0}}; sha16 is the first 16 hex of the sha256 of the route.
- The lines not landed, with reasons: reader/data/fold-strike-landing/land-v188-v1/not-landed-v188-v1.jsonl (51 lines).

How the checks that wait on the follower fail now (each run once; logs in next/):
- check-entry-gate-v1: E3 red (totals 382,258 / 374,685 / 373,815, a recount 380,602 / 369,993 / 369,123); E4 red (37; first M9 rows 23,724, the lane 23,646); E5 red (4,740 lines find no row, 3,084 rows have no line, the index says 0 and 0); E14 first half red (28 lines name no row); E8 red (12, «verb» at H6467 credited to no kept row); E7 red (39 sidecars do not name the pinned ledger; it reads only zones and the pin, which my steps do not write).
- check-names-gate-v1: N3 red (107 lines find no row); N4 red (7,412 marked, a recount 7,305).
- check-sense-openings-v1: O3 red (1 line finds no row); O4 red (2,008 marked and 8,915 rows, a recount 2,007 and 8,927).
- check-default-picks-v1 --node: D2 red, 3,944 of 154,583 rows a pick names are missing.
- check-form-of-v1: all ok. F10: 2,266 rows named, 18 followed through a re-key. F9 names 13 rows on 11 slots without failing; the plan says 17 slots. Over Moses's whole v188 list the same count is 13 on 11, so the lines not landed do not explain the 17.
