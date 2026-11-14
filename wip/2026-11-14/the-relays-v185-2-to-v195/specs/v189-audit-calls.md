# v189-audit-calls

## Verified

FETCH AND HASH. All 22 files that FOR-ELIJAH-v189.md:104-125 lists were fetched from r2 key v2/ledgers/all/audit-calls/ into /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/dl-v195/v189-audit-calls/. Each one matches the byte count and sha256 the letter gives (comparison list: /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v53/v189-audit-calls/letter-hashes.txt). The store's own copy of FOR-ELIJAH-v189.md is byte-identical to the letter already downloaded (sha256 88232ec9…66ed). I also took ship-v189/RECEIPT-ship.json; the letter gives no hash for it. No file was over 60 MB. I ran no downloaded script.

THE STORE MOSES READ IS THE PAGE'S STORE. counts-v1.json `inputs` gives index sha256 1cd2e558…e19a, row-strikes-now sha256 9813318d…ce8b, 652,954 rows and 124,901 keys. These are byte for byte the page's current pt/reader/data/route-store/index.json and data/row-strikes-v1.json. The concatenated shards hash to 4d1357b26ca5…

FIGURES RE-DERIVED, from the served store (read only) and the local default picks v1/v1.1. The local picks files match the page's PIN: rows-v1 21f2a35b…, rows-added f6064de7…, step-mend 29953b99…. Scripts and output are in v53/v189-audit-calls/.
- 144,587 rows share their key and rank with another row (letter :20). HOLDS.
- One row per line. Every line of the 8 row lists names exactly one store row by key, rank, m and text. Every sha16 in 7a–7c matches its text, and no line repeats. Lines that share key, rank and source with an unlisted row: 7a 15,795; call 6 2 (אברהם 9 M60 and אסא 20 M60); every other list 0 (letter :22-25). HOLDS.
- Call 5 (letter :29-39).
  - The store holds 2,550 keys ending in U+05BE with 5,760 rows. All of them are on the list, none is left out, and every plain key is served.
  - I recomputed the classes from the store line by line: SAME 4,109, OTHER 1,294, NO_TWIN 357.
  - Every `repoint_picks_to` (the lowest-rank twin) recomputes exactly, and each names exactly one row.
  - 137 targets are ambiguous by key, rank and source.
  - Each re-key's to_headwords equals the row's headwords with the end maqaf taken off.
  - Default-pick references: STEP 23,888 / 16,013 / 122 = 40,023, to 3,434 / 461 / 26 rows. MACULA, UBS and BDB make none.
  - By the source the OTHER references re-point to: M5 10,327, M17 2,441, M14 1,434, M3 1,297, M46 340, and 174 more (M13 57, M1 46, M19 35, M59 32, M4 3, M21 1).
  - ALL HOLD.
- Call 6 (letter :47-53).
  - 449 lines; 107 of the rows carry facts name:1 in the store.
  - References: BDB 414, UBS 38, MACULA 1, to 23 rows.
  - 18 suppress lines (17 UBS, 1 MACULA).
  - 230 BDB slot-3 lines: «verb» 199, «adverb» 30, «conjunction» 1.
  - HOLDS.
- Call 7 (letter :57-69).
  - M18 rows that open «literally:» or hold « > »: 3,463 in the store, which is 7b ∪ 7c exactly (1,261 + 2,202). M17: 192, which is 7d exactly.
  - 7e: 5,222 references at 4,551 places, covering all 1,261 rows (5,183 of them at UBS pick 1). 7c rows: 23,946 UBS references.
  - 23 one-written-word flags (10 / 4 / 9). 3 rows with `also_a_meaning_with_no_phrase` (מלא 72, עמד 159, שסע 20).
  - HOLDS.
  - DIFFERS: the letter says 16,091 Strong's rows «open with Strong's own sign X, × or +» (:59; RULE.md:73,75). The store holds 15,785 M14/M9 rows that open with the sign (M14 15,605, M9 180). The other 306 lines of 7a (M14 302, M9 4) open with «(»: «(X great) delight», «(+) archer», «(+ as) yet».
- Call 4 (letter :73-78). These figures are by file: 853 places; layers 784 / 22 / 47; actions 845 / 8; words from v181 657 + 185 + 3; lacking in the piece store 851, of which 844 have STEP's words; 4 drawn otherwise. HOLD.
  - Against default picks v1.1, STEP's pick 1 equals steps_words exactly at 790 of 845 places. The other 55 all join two STEP words with « | ».
- Call 2 (letter :82-83). The 42 v187 statuses check against v187's words-back-final / in-921-lost-none by key, rank and route: 35 / 5 / 1 / 1. BDB references: 966, to 39 rows. HOLDS.
- v188 (letter :43). Exactly 48 v188 lines carry a non-empty served_now_under_the_key_with_a_maqaf. Each matches a call-5 re-key by plain key, words, rank and source. 4 are the same source and 44 another source. HOLDS.

REHEARSAL, on copies in my folder (the page's strike-rows-v1.mjs and a copy of the 4d1357b26ca5 store).
- Call 5: 5,403 struck, 357 re-keyed and landed, 0 folded, 2,728 keys touched, 2,550 emptied, 0 new. Routes 652,954 → 647,551; keys → 122,351; the copy's store version → 0498715537c8. check-route-store-exact-k-v1 L1–L10 all ok.
- Then call 6 as listed: REFUSED, «M74|פעלי־|3|verb names 0 rows». With the leave-off: 448 withheld, 1 left off, 393 keys touched, 10 emptied.
- Call 2: 2 withheld.

## Landing spec

## v189 landing spec (page lane)

The owner's rule is that the corpus lane's own stand on its 8 calls holds and the page lands the lists. OWNER-ANSWERS-2026-11-14.md, last rows.

### 0. Pin
- Write `data/audit-calls/PIN.json` with folder `calls-v1/`.
  - Keep byte for byte: RULE.md, receipt-v1.json, counts-v1.json, verify-receipt-v1.json and the 13 lists, each held to the sha in FOR-ELIJAH-v189.md:104-120.
  - The tools read the lists only through `readPinned`.
- Fetch and pin v181's `lines-and-pills-v1/lines-over-several-words-v1.jsonl` beside them (384,463 bytes, sha256 12228dc4…778a, FOR-ELIJAH-v181.md:65). It is the check for call 3.

### 1. Map: each call, its list, its landing

| call | list | landing |
|---|---|---|
| 1 | none | nothing; it comes with the next catalog reissue |
| 2 | call2-withhold-v1.jsonl (2) | `strike-rows-v1.mjs` action withhold |
| 2 | call2-bdb-openings-not-withheld-v1.jsonl (42) | no store action; check only (v187 retexts them) |
| 3 | none | page rule; checked against v181's lines-over-several-words |
| 4 | call4-steps-reading-stands-v1.jsonl (845 + 8) | NEW projector |
| 5 | call5-maqaf-keys-v1.jsonl (5,403 strike + 357 re-key) | `strike-rows-v1.mjs` |
| 6 | call6-withhold-v1.jsonl (449) | `strike-rows-v1.mjs` withhold, with one leave-off |
| 6 | call6-picks-words-withheld-too-v1.jsonl (18) | default-picks bake: suppress |
| 6 | call6-bdb-point-words-not-printed-v1.jsonl (230) | check only |
| 7 | 7a + 7b (17,352) | NEW apply-phrase-rows-v1 (facts `phrase`) + page switch |
| 7 | 7c (2,202), 7d (192) | check only: no mark, unchanged |
| 7 | 7e (5,222) | data for the owner question below |
| 8 | none | the default picks build (task 105) |

### 2. Order

**a. (Recommended) v190's row-entries facts first.** `apply-row-entries-v1` finds rows by k/rank/m/sha and nulls the facts of any row it has no line for (tools/apply-row-entries-v1.mjs:175 and :193). 45 of the 357 rows call 5 re-keys carry n (t on 16, b on 12). If v190's facts are written before the re-key, they travel with the row (strike-rows keeps every slot).

**b. Call 5.**
- Dry run first:
  `node tools/strike-rows-v1.mjs --list data/audit-calls/calls-v1/call5-maqaf-keys-v1.jsonl --reason "v189 call 5: keys ending in a maqaf (owner 14 Nov; v182 §4)" --dry`
- Then the same command without `--dry`.
- Expect: 5,403 strike, 357 re_key_landed, 0 folded, 2,550 keys emptied, routes 647,551, keys 122,351.
- The 1,294 OTHER_SOURCE_TWIN lines land as strikes, which is the resting option (RULE.md:58). The rows stay whole in row-strikes-v1.json. If the owner rules the credit branch, it lands later as a `restore` list from that record. A restore carries slots 0–6 only (strike-rows-v1.mjs:174), so slots 7–10 must be derived again.
- Re-key ranks are max+1 under the new key, in list order (strike-rows-v1.mjs:343). Land call 5 before any other list that adds rows under the 178 plain keys, or the rehearsed ranks shift.
- Then write the re-key map {from [old key, rank, m, sha] → to [plain key, to_rank, m, sha]} from the round's rows. It is rehearsed in rekey-map-after-call5.jsonl: 357 lines, 26 of them named by picks.

**c. v188, with its 48 flagged lines skipped.** Pin v188.1 with it.
- Do the skip with a derived list that has its own pin and sha, not `--leave-off`.
- `--leave-off` matches by m|key (strike-rows-v1.mjs:144), and 11 of the 48 share m|key with v188 lines that must land.
- strike-rows itself would treat only the 4 same-source lines as already held. The other 44 would land as second rows.

**d. Call 6.**
`node tools/strike-rows-v1.mjs --list …/call6-withhold-v1.jsonl --reason "v189 call 6" --leave-off "M74|פעלי־|struck by v189 call 5, the same row"`
- Rehearsed: 448 withheld, 393 keys touched, 10 emptied.
- Without the leave-off it REFUSES: call5 line 4850 and call6 line 293 are the same row.

**e. Call 2.** `strike-rows-v1.mjs --list …/call2-withhold-v1.jsonl`: 2 withheld (M23).

**f. Re-run the facts tools.**
- These key by k/rank/m/sha, so run them with `--the-store-has-moved-on`:
  - `apply-name-rows-v1`: 107 lines now find no row.
  - `apply-sense-openings-v1`: 1 row.
  - `apply-row-entries-v1`: see (a).
- `apply-made-spaces-v1` and `apply-ledger-divisions-v1` key by text. Run them; a re-key should move nothing.

**g. Call 7.**
- NEW `tools/apply-phrase-rows-v1.mjs`, on the model of apply-name-rows-v1:
  - pinned, finds each row by k/rank/m/sha, idempotent, `--dry`, refuses a miss.
  - Writes facts `phrase` on 16,091 + 1,261 rows. For 7b, carry the collocations, so the card can say so in the source's terms.
- Document the key in gloss-store-v1.mjs FACTS_SLOT.
- zone.html:
  - At rest, drop rows whose facts carry `phrase` from the pool. Place this beside the names gate (zone.html:7553) and count them.
  - Add a switch {id `phrases`, voice `claim`, off at rest, on the model of `senses` at zone.html:4049}, plus reset.
- It does not interact with calls 5 and 6: the lists share 0 rows.

**h. Call 4.**
- NEW `tools/project-steps-reading-v1.mjs` lays `steps_words` on the zone word (book, p) as the place's line at rest, credited to STEP (M4).
  - It refuses if the place is not a zone word, or if the word's letters are not `s`.
  - It writes nothing at the 8 `none` places.
- Under STEP's default the page prints today's line (zone.html:5654). Without this projector nothing moves.
- Land the 790 places that agree with STEP's pick 1 now. Hold the 55 « | » places until Moses answers (put-back 2).

**i. Call 3.**
- The span-run rule: STEP's reading of each word rests, and the joined line is a press away.
- Check it against v181's list: 2,177 lines, 4,402 words.
- The 3 call-4 places that stand under a run need this rule.

**j. Default picks bake (v195's v1.2).**
- Teach `bake-default-picks-v1.mjs` three things:
  1. Follow the re-key map for the 26 rows (122 references) and for v195's 1,092 WAITS_FOR_CALL5_REKEY picks.
  2. Count rows that a v189 round withheld as withheld, not missing: 23 rows, 453 references. Today it refuses (bake-default-picks-v1.mjs:496).
  3. Take the 18 suppress lines. Find each by book, p, source, piece and n, with words equal to picks_words; set its words to 0.
- Hold that the bake carries no BDB slot 3.

**k. Re-project and ship.**
- Re-project the lattice. Re-bake the resting lines, the search index and the chain books.
- Run the checks and the gate.
- Ship: `main`, then merge `main` into `gh-pages` («gh-pages follows main») and push.

### 3. Checks that hold it
- NEW `tools/check-audit-calls-v1.mjs`:
  - The pin bytes match.
  - Every call 2, 5 and 6 line is in a v189 round of row-strikes-v1.json with its action; the one leave-off is named.
  - No key ends in U+05BE.
  - The 357 re-keyed rows stand under their plain keys with to_headwords.
  - None of the 42 BDB openings is struck.
  - 7a and 7b carry `phrase`; 7c and 7d do not, and 7d is unchanged.
  - At the 845 places the resting line is STEP's words.
  - The 18 suppressed picks print no words.
- Existing checks:
  - check-route-store-exact-k-v1 (L1–L10; ok on the rehearsal)
  - check-store-continuity-v1 (C1 arithmetic)
  - check-names-gate-v1
  - check-entry-gate-v1
  - check-sense-openings-v1
  - check-made-spaces-v1
  - check-line-reads-the-place-v1
  - check-disk-gloss-is-the-line-v1

## Depends on

- v189 call 5 lands before v188. v188 then skips its 48 flagged lines (FOR-ELIJAH-v189.md:43). The skip must be a derived, pinned list: 11 of the 48 share m|key with other v188 lines, so strike-rows' --leave-off cannot do it. Rehearsal shows 0 of v188's landing ranks collide with the call-5 re-key ranks.
- v188.1 is pinned with v188. Its counts hold only on 4d1357b26ca5 with v188 in it; after v189 they do not (FOR-ELIJAH-v188.1.md:32-38).
- v190's facts (apply-row-entries v1.1) are best written before call 5. Otherwise the 45 re-keyed rows that carry n/t/b lose them on any later run with --the-store-has-moved-on (apply-row-entries-v1.mjs:175).
- v195 (default picks v1.2): its call5-repoints-v1.2.jsonl already names v189's strike targets. Its 26 re-keyed rows (122 references) and the 1,092 WAITS_FOR_CALL5_REKEY picks need the re-key ranks, which exist only after call 5 lands. Its step-unread-landing must take the next free rank after call 5, or L5 (no rank shared by two M records) fails.
- v195: confirm whether v1.2's rows table still names the 23 rows call 6 withholds (453 references). If it does, the bake needs withheld-by-list tolerance.
- v187 retexts the 42 BDB openings of call 2. After v187, call 2's list lines (by route) no longer find their rows, so the call-2 check must match by key, rank and m, against route or v187_prints.
- Call 3's check needs v181's lines-over-several-words-v1.jsonl, which is not yet in the page tree.
- Call 4's 3 places under a run need call 3's rule.
- Call 5 must be the first list to add rows under its 178 plain keys, so the rehearsed ranks (rekey-map-after-call5.jsonl) hold.

## Moves at rest

- **Call 5:** no card moves for the strikes; v182 found no maqaf key is ever looked up. 357 rows (M41 91, M74 83, M36 44, M13 38, M4 30, M5 12, …) gain their place under 178 plain keys as new pills. 2,550 keys leave the store. Routes 652,954 → 647,551.
- **Call 6:** 448 rows leave the cards of 394 keys; 10 keys empty. 107 of the rows are name rows that the names gate already held at places that are not names; they now also go at name places. 1 sense-opening note goes. Under the UBS or MACULA default, 18 picks print no words; Isaiah 45:4:9 loses MACULA's line «surname», and its second source fills it.
- **Call 2:** 2 rows of classical_hebrew_words go: קש 18, ר 9.
- **Call 7:** 17,352 pills leave the resting cards of 5,744 keys, and 17,313 printed forms leave a key's resting pool. 1 card, שפרפרא «X very early in the morning», prints no pill at rest. All of it comes back under the new «phrases» switch. Card counts and the resting lines move wherever a lifted row printed one.
- **Call 4:** 845 resting lines change:
  - 469 change their words, e.g. Proverbs 21:29:7 «Jabin, the name of two Canaanitish kings + archer» becomes STEP's.
  - 184 keep their text and change only the credit.
  - 185 lines appear where no line stood.
  - 4 gain STEP's brackets.
  - 3 are under runs (with call 3).
  - 55 of the 845 wait on the « | » question.
- **Call 3:** the span-run lines rest word by word: 2,177 lines over 4,402 words.
- **Calls 1 and 8:** nothing moves.

## Put back to the corpus lane

- Call 7a, 306 lines do not open with the sign. The letter (FOR-ELIJAH-v189.md:59) and RULE.md:73,75 say 16,091 Strong's rows «open with Strong's own sign X, × or +». The store holds 15,785 such M14/M9 rows. The other 306 lines (M14 302, M9 4) open with «(», e.g. call7a line 428 «(X great) delight», line 346 «(+) archer», «(+ as) yet». In those rows the sign reaches only the bracket, and «delight», «archer» and «man» are plain one-word renderings. Confirm they belong, or send 7a without them.
- Call 4, 55 places join two STEP words with « | ». They are the open-q1 places (46 of 47) and open-q14 places (9 of 22), e.g. call4 line 258 «Malki- | Shua», «[the] chief | commander», «Asah- | -el». The page has no print rule for « | ». Default picks v1.1's STEP pick 1 at the same places carries only the first word («Malki-», «[the] chief»). Which is STEP's line there, and how is « | » drawn? At the other 790 places steps_words equals STEP's pick 1 exactly.
- Call 4, the 8 action-none places carry line_now, line_now_credit and steps_words all null (e.g. call4 line 100, Deuteronomy 33:2:15). «They print STEP's reading now, as STEP draws it» (letter :77) therefore cannot be held from the file, and 7 of the 8 are places the piece store lacks. Please give STEP's words for them.
- Call 4, «drawn as STEP draws it» (letter :76). The page draws «/» as « + » on every line (gloss rule 3). Confirm that is what is meant: the 4 places then change only by STEP's brackets, e.g. «what + [are] they?» and «like <the> + ostriches».
- A row on two lists. פעלי־ 3 M74 «verb» is on call 5 (strike; call5 line 4850) and on call 6 (withhold; call6 line 293). Its call-5 target פעלי 7 M25 «verb» is itself a call-6 row (call6 line 292). The counts' rows_by_key_and_rank covers overlaps within one list only. Please name overlaps across lists. The page lands call 6 with --leave-off M74|פעלי־, rehearsed.
- Re-key ranks. strike-rows-v1 gives a re-keyed row max+1 under its new key. At 71 of the 357 re-keys that rank is a typed struck hole (struck-ranks-v1, e.g. אדני 58-60 [M20], אויה 6 [M101], אחות 57-58 [M100, M26]). v195's landing takes «the next free rank as of the store, struck-ranks-v1 and v188». Which rank rule do call 5 and v195 assume?
- Row entries after the re-keys. 45 of the 357 re-keyed rows carry entry facts (n: M4 30, M5 12, M14 3; t 16; b 12). apply-row-entries-v1 finds rows by key, rank, m and sha, so every later run nulls them. Please key the next row-entries issue (and v190's v1.1, if it lands after call 5) at the post-landing key and rank from the row-strikes record.
- Default picks and call 6. 453 references (BDB 414, UBS 38, MACULA 1) name 23 rows call 6 withholds. The bake refuses a named row the store no longer holds (bake-default-picks-v1.mjs:496). Does v1.2 still name them? Say how a pick that names a withheld row resolves.
- Minor: at Zephaniah 1:2:2, 1:3:1 and 1:3:4 the UBS pick 1 names row 150565 (אסף 85) twice. withheld_rows_it_names repeats it (call6-picks line 16), and the «31 references» counts it twice.

## Owner questions

- Already with the owner (Moses, letter :93): should call 5's 1,294 rows whose words another source holds keep their own source's credit, as rows of their own under the plain key, instead of being struck? It touches 16,013 STEP references, 461 rows. The strike rests until the owner rules. If the ruling is yes, the rows land back from row-strikes-v1.json through a restore list.
- Already with the owner (letter :94; v187): the 2 held BDB openings, הלך 152 and לוי 23.
- Call 7e: UBS's own default pick names a lifted phrase row 5,222 times at 4,551 places (5,183 of them at pick 1). At those places, does the row come back to rest on the card, since the source itself gives that phrase meaning for the word there, or stay a press away everywhere? Recommendation: back at rest at those places. The bake today carries no row ids per place, so either answer needs data wiring.
- Call 7's switch: its name and its words. For the Jastrow switch the owner chose «word senses». Suggestion: «phrases», off at rest. The card would say, in the source's own terms, «part of a longer phrase, by Strong's sign X», or for UBS, «a phrase's meaning: אבד נֶפֶשׁ».
- Call 6 against the no-claims note of 14 November (THE-OWNER-AND-THE-AUDITOR-2026-11-14.md: where a source marks a row's kind, the card says so in the source's terms). 433 rows say only the kind, such as «a male given name» or «verb». The ruling to withhold them stands and the page lands it. Should they later print as a kind note, e.g. «its source gives only: a male given name», instead of being withheld?
- Call 3 (STEP's reading of each word rests; the joined line is a press away) is the owner's own open call 90 (the Monday / «the Jewish people» joined pairs). Confirm that the 14 November answer settles call 90 as well.
