# Ships 5 and 6 in one build: the design (page lane, 15 November 2026)

S = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`. Code is cited at `S/ship/reader` as it stands, which is main **add346d851**, the combined ship now live (ship-next). My scripts and outputs are in `S/v77/ship56-design/design/` and listed at the end; each figure says which one counted it. Figures from the four readers are marked as theirs. I wrote nothing into S/ship or any other tree, ran no round, bake, browser or git command that writes anything, and kept to light node scripts under `nice -n 19` with capped heaps.

---

## 0. Read first

### One build, not two
Ships 5 and 6 go as one build. The reasons:
- Ship 6 (v187) moves no resting line and no pill. Its store change and ship 5's one store change (the UBS collocation facts) are both store steps before the round, so they share one round, one suite and one gate.
- Neither ship reads anything the other writes. Ship 5's call 7b facts are on M18 rows; ship 6 retexts M46 rows.
- If ship 6's checks go red and cannot be mended inside the build, drop its commits (§9, commits 2–4) and store steps 1–4. Ship 5 does not depend on them.

### The base
- Main add346d851, plus toggles round 2 (S/pt, branch toggles-fixes, 47c5a68277..b152652e7f), which ships first.
- If round 2 has not shipped when the build starts, merge toggles-fixes first. The conflicts are in §11.

### Ten decisions taken here
Each says the rule that decides it.

**1. Strong's sign at the rendering is not scoped. It runs over every work, the Tikkunei Zohar included.**
- The rule: «a rule is made over a dictionary's own category and runs over the whole shelf».
- The signs switch rests off on every page.
- The kinds were scoped to the 39 books because up to 3,360 Tikkunei Zohar places would have gone bare. This rule makes no line bare. On the ship's Tikkunei Zohar table, 309 of 309 signed keys have a plain reading (`signed-lines-on-ship-v1`).

**2. Strong's sign held alone in a bracket, «(+) archer» and «(X) very», counts as Strong's sign on the rendering.**
- Strong's own key says so. The M14 ledger's declaration names it: `data/ledgers-v1/wikisource_strongs_explicit_forms/declaration.json:424-428`, `open_paren.holds_sign_alone`: «opens only a sign set on the word after the bracket».
- This corrects the lead's «306 … are not Strong's sign» for **81 readings** (M14 80, M9 1) on 61 keys (`ubs-and-bracket-reach-v1`).
- The other 226, like «(X great) delight», put the sign on an optional word (`holds_words_before_the_word`, :571-575) and are not signed renderings.
- The page then holds the source-signs ledger's first pattern wider than the ledger counted it. This goes back to the corpus lane (§10, put-back 1). If the lead prefers the ledger's pattern as it stands, this is one regular expression in one place.

**3. The witnessed order columns follow the rule.**
- `bake-witnessed-order-v1.mjs:113` takes `readings[0]`. It should take the row's first reading without the sign.
- The rule: the signs switch rests off under every order, so «a rendering carrying its source's sign does not lead the line while the signs switch rests off» reaches these columns too.

**4. UBS's collocation mark lands over its category, not as call 7b's list.**
- The category is 2,649 rows on 764 keys:
  - every meaning that prints the row's text carries `LEXCollocations` in UBS's own file;
  - and the row carries no `name` fact.
- 7b's 1,261 rows were chosen by a test of the English, «literally:» or « > ». The lead called that road wrong for call 6.
- The owner's rule: «a list that names rows one at a time mends only those rows».

**5. Question 10 is carried in the row's own facts, not in the default picks index.**
- The fact is `picked_at`: the places where UBS's own pick names the row.
- Carried in the index it would have added 125,766 bytes (22,504 gzipped) to a 41,570-byte (14,201 gzipped) file that every book page fetches at boot (`ubs-and-bracket-reach-v1`, `q10_asked`).
- In the row it costs nothing at boot: the card fetches the row's shard in any case.

**6. Call 4 is built on the default picks layer, with no projector.** This is the call-4 reader's design, which I take whole.

**7. Call 3's test counts call 4's stands as the place's own reading.** With that, II Samuel 6:10:15-16 falls. 5 runs over 10 words stay held.

**8. Question 12 is built (one pill). Question 11 needs no work** (print as ruled).

**9. v187's hold is one rule over the printed text: a Hebrew character directly beside a Latin letter or a digit.**
- It holds 11 lines: 8 done and 3 settled.
- It replaces the plan's five names and the reader's «letter rule plus ארבעים 10».
- The two mechanisms that join them are both held, and both are put back to the lane:
  - rule 25's tag reading: 8 rows;
  - rule 23's added closes: 3 rows.

**10. v187's 228 settled rows land in this ship.**
- Question 18 is taken: «BDB's Hebrew in its printed order at 231 openings, letters kept as the provider's. *Recommended: allow.*»
- The note of 15 November: everything goes ahead as recommended except question 3.
- Question 17 is taken too: the 38 held rows stay notes with gaps.
- Lands: **740 = 512 done + 228 settled**.

### What moves at rest
The base is the combined ship's own records (`S/ship/reader/data/resting-lines`, 401,248 lines), not live.

| part | resting lines | cards | how counted |
|---|---|---|---|
| Call 4, STEP's words stand | 432 (402 words replaced, 26 credit only, 3 appear, 1 inside a run) | the pressed pill moves with each line | `call4-on-ship-records-v1` over the call-4 reader's m1-places.json |
| Call 3, a run reads its words | 2,153 runs over 4,353 words (with call 4); 5 runs over 10 words held | 338 chain-book cards open on the word pressed | call-3 reader, on the combined ship's records |
| Call 7, Strong's sign | 1 Bible line (Job 1:21, «X after»→«appear»), plus 1,871 Tikkunei Zohar lines on 309 keys, plus 6 more if decision 2 holds. 13 more Bible lines that open with the sign are call-4 places, where STEP's words decide | the old signed pill leaves the card under «off» at each of those places; with decision 2, 81 readings at up to 7,739 word places of the 39 books (upper bound) | `signed-lines-on-ship-v1`; call-4 reader m13 |
| Call 7, UBS collocations | 0 (the 8 «Sea of Reeds» lines are span lines, which carry no facts; call 3 moves them) | at the word's own key, after the entry gate: 121,941 pills at 17,524 word places; question 10 keeps 17,425 at 2,072; at pieces' keys, a press away: 303,057 at 26,297 (both upper bounds) | `ubs-kind-card-reach-v1` |
| Question 12 | 0 | 153 pointer pills (14,995 places) fold into the reading they print | the corpus lane's figure (v191); not measured here |
| v187, words back | 0 | 0 pills; 740 BDB notes print the words back | v187 reader; `words-back-recount-v1` |

---

## 1. Call 7a reworked: Strong's sign does not lead the line

**Rule id:** `signed-rendering-rule-v1-a-rendering-that-carries-strongs-sign-does-not-lead-the-line-while-the-signs-switch-rests-off`

**Rests on:**
- The lead's call of 15 November: «The mend is at that grain: a rendering carrying its source's sign does not lead the line while the signs switch rests off.»
- The owner, 3 October, on the signs switch: «preselect it off for now».
- The owner's rule: «a rule is made over a dictionary's own category and runs over the whole shelf».

**What the rule is.** A rendering opening with Strong's sign sorts after every rendering that does not. The sign is `X `, `× ` or `+ ` at the head, or (decision 2) the same sign alone in a bracket.
- It is a sort, not a filter. A pool whose every reading carries the sign keeps its order, as the switch's own rule does for such a card (zone.html:11557-11563).
- Nothing leaves a card.
- Call 7a's list lands no fact. Its 136 whole lists lose nothing: today 0 resting lines read a signed rendering of an M9 list (call-7 reader §3.2).

**Data.** Nothing new is pinned. Two sources are cited:
- the M14 declaration (in tree) for the bracketed shape;
- the source-signs ledger v1, the switch's patterns.

7a, 7c and 7d stay pinned in `data/audit-calls/calls-v1/` as they are.

**Tools.**

`tools/gloss-store-v1.mjs`
- Beside `signOnly` (:80), export the predicate and its expression:
  ```js
  STRONG_SIGN = /^(\((X|×|\+)\)|X|×|\+) /u
  opensWithStrongSign = (t) => STRONG_SIGN.test(String(t))
  ```
- In `readingPool` (:391), at the comparators (:437-446), the sign becomes the first key of all three orders:
  ```js
  signed = (r) => (opensWithStrongSign(r.text) ? 1 : 0)
  ```
  - `byOldest` stays the second key.
  - The characters order: `signed || ledger || byOldest || at`.
  - The corpus order: `signed || corpus || byOldest`.
- Bump `GLOSS_RULE_ID` (:65) to `zone-gloss-rule-v8-printed-form-ledger-division-whole-without-a-ledger-a-rendering-carrying-strongs-sign-after-every-plain-one-antiquity-1940-lastuary`.
- Add one clause to `GLOSS_RULE_TEXT` (:173-182).
- Every leader that derives from `readingPool` moves with no other edit:
  - `glossFor` (:463), `tableFor` (:512);
  - regloss-zone's table, `gloss_m` and its alternate, the order deltas and the license columns (regloss-zone.mjs:163; gloss-m-v1.mjs:104, :154, :160, :225, :282);
  - the projector's `leadersAt` (:422), `rowLeader` (:617), its cites (:386) and its cards' groups (:549).

`tools/project-lattice-v12-v1.mjs`
- `firstUnder` (:578-584) sorts by tier before the pool's order. So `o.m` and `o.x` could still put a signed reading first. Sort it by `(signed, rank, at)` instead.
- The `only` test then asks of that leader, as today. `o.m` and `o.x` are reader positions, not the line at rest.

`tools/bake-witnessed-order-v1.mjs:113`
- `const line = readings.find((t) => !opensWithStrongSign(t)) ?? readings[0];`
- Bump its rule to `witnessed-order-bake-rule-v2-…-the-rows-first-reading-without-strongs-sign`.
- Its receipt counts the keys where it stepped past a signed first reading. The call-7 reader counted 2,453 such Bible keys on live: entry-and-lists 2,451, same-place 1, entry 1.

**Page (zone.html).**
- :3510 `SOURCE_SIGN[0]` becomes the module's `STRONG_SIGN`. Carry `opensWithStrongSign` under that name beside `hasSourceSign` (:3511), between markers, so a check can lift it out and run it.
- :3472-3477, the comment: name the M14 declaration as the source of the bracketed shape.
- :8651 `signLast` becomes:
  ```js
  signsPref === "printed" ? 0
    : signsPref === "below" ? hasSourceSign(a.text) - hasSourceSign(b.text)
    : opensWithStrongSign(a.text) - opensWithStrongSign(b.text)
  ```
  - Its place in the chain (:8656) stays: after `licPref`, before the name orders.
  - With it, a line repainted live under a switch (`poolFor(storeOnly)` → `sortPool`) agrees with the bake.
- `drawPills` (:11551-11570) does not change. Its off position already hides a signed reading that is not the line's. So the old signed line's pill leaves the card where the line moved, and the line «N readings carrying a source's own sign switched off» (:11569) counts it.

**Round.** No new step. The zones step (regloss, the commentaries, the lattice) re-bakes every leader under rule v8. The witnessed bake runs at the head of that step.

**What moves at rest.**

*Bible: 1 line.* Job 1:21 (record entry 2), «X after» [M14] → «appear» [M14]. STEP's own pick there, «I came out», is question 3's class and stays held.
- 13 more Bible lines opened with the sign on the ship's records. All 13 are call-4 places, so STEP's words take the line and call 4 decides:
  - Deuteronomy 28:59 «+ aloud»;
  - Ezekiel 7:13 «X at all»;
  - Hosea 6:3 «+ be able»;
  - I Kings 7:41 and 7:42 «+ advertise»;
  - Jeremiah 5:12 and 49:20 «X before»;
  - Nehemiah 7:45 «+ bethink themselves»;
  - Numbers 3:43 «+ command»;
  - Proverbs 23:7 and Psalms 31:6 «X at all»;
  - Esther 9:17 and I Chronicles 23:23 «+ fork» (the kinds' rank-loss class).
- Counted by `signed-lines-on-ship-v1` over the ship's 40 records, and the call-4 reader's m13.

*Tikkunei Zohar: 1,871 lines on 309 table keys*, plus 6 bracketed lines with decision 2.
- 302 keys go to Strong's next reading of the same list, 7 to another source; 0 stay signed and 0 go bare.
- The most frequent: «X after»→«appear» (20 keys), «X any wise»→«appoint» (13), «X at all»→«burn up» (12), «X again»→«away» (12), «+ advertise»→«appear» (11).
- These next readings are the next words of Strong's alphabetical King James list. They are plain renderings, not better meanings.

*Commentary sidecars:* not measured. The build's compare and gate meet them.

**Checks.**

New: `tools/check-sign-does-not-lead-v1.mjs`. Each law fails on add346d851 and passes after the build.
- **G1, one rule, one place.** The page's `opensWithStrongSign`, lifted out of zone.html, answers as the module's over every reading of the store (K2's method). Fails today: the page has no such function.
- **G2.** No baked leader opens with the sign where its pool, under the same gates, holds a reading that does not. Covered: `zone.gloss`, `gloss_orders.*`, `gloss_m.alt`, the license columns, and the sidecar's o.l, o.la, o.s, o.m, o.x, o.c and e[…].l/la.
  - Today on live it fails at 3,840 Bible `zone.gloss` keys and 309 Tikkunei Zohar keys, among others (call-7 reader §3.3).
- **G3.** No resting line of the records opens with the sign where the word's pool at rest holds a plain reading. Today: 1,885 lines (14 Bible, 1,871 Tikkunei Zohar).
- **G4.** Each witnessed column takes its row's first reading without the sign. Fails today at 2,453 keys.

Amended:
- `check-witnessed-order-v1`: its rebuild of a column takes the first reading without the sign.
- Checks that rebuild baked lines through `readingPool` follow with no edit: check-carrier-survives, check-lattice-projection, check-proper-name.

---

## 2. Call 7b reworked: UBS's collocation mark as a kind

**Rule ids:**
- the kinds entry `ubs-collocation`, under `dictionary-kinds-rule-v1-…`, with the record's version moving to the build's date (e.g. `2026-11-16a`);
- the facts tool: `ubs-collocations-rule-v1-a-row-carries-the-collocations-its-ubs-meanings-name-and-the-places-ubs-own-pick-names-it`.

**Rests on:**
- The lead's call: «UBS's own phrase mark … is a kind its source states, and belongs with the headings on the card by kind».
- The owner: «we need to think in terms of each dictionary as a category».
- Question 10, taken: «UBS's phrase meanings where UBS itself chose them (4,551 words): keep them on the card at rest. *Recommended.*»

**The category** (`ubs-and-bracket-reach-v1`, ship store ccec4fa3071b).
- UBS's mark reaches 3,121 M18 rows.
- **2,649 rows on 764 keys** form the set: every meaning that prints the row's text carries a collocation, and the row carries no `name` fact.
- Two groups stay out:
  - 47 rows are also the text of a meaning without one. They are a plain reading too, so they stand.
  - 425 are UBS's own name rows. They stay under the names gate, as its ruling stands: they stand where the text's word is a name.
- The set holds 1,251 of 7b's 1,261 rows. The other 10 are 3 «also a plain meaning» (מלא 72, עמד 159, שסע 20) and 7 name rows, each by its class.
- 7c and 7d are untouched. 7d (192 SDBH rows) stays held: SDBH's own data shows no mark.

**Data.**
- `data/ubs-collocations/PIN.json` names two files from the corpus lane's store, by key, bytes and sha256. They stay on the lane's store and are given on the command line, as the row-entries ledger is:
  - `old-local-999-footsteps/ledgers/work/ldmprs/source-cache/ubs-sdbh-hebrew-2026-07-15/UBSHebrewDic-v0.9.2-en.JSON` (23,110,129 bytes, sha256 1686a25d…);
  - `ubs-sdbh-hebrew-definition-routes-v1.csv.gz` (sha256 3567c700…).
  Both hashes are the ones the calls' receipt names.
- The derived list `data/ubs-collocations/ubs-collocation-rows-v1.jsonl`:
  - 2,649 lines `{k, rank, m:"M18", sha, collocations:[…UBS verbatim], meanings:[LEXID…], picked_at:["<book> <c:v:w>"…]}`;
  - plus a receipt, both pinned by sha256.
- `picked_at` comes from the default picks ledger v1's UBS picks. That ledger is already pinned in `data/default-picks/PIN.json` (rows tables v1, v1.1, v1.2; the book files held to receipt-v1's outputs).
  - Measured: 16,299 UBS pick references (16,081 at pick 1) at 8,252 places name 2,643 of the 2,649 rows.
  - The card asks the row's key at 4,156 of those places (5,951 pairs: 2,817 at the word's key, 3,134 at a piece's key). At the rest, the row is on no card at rest.
- When the corpus lane sends UBS's own categories per row (letter Ask 2), its list replaces this derived one under the same apply tool.

**Tools.**
- New `tools/derive-ubs-collocations-v1.mjs`, on the model of derive-fold-strike-landing-v1.
  - It refuses a file that is not its pinned bytes.
  - It reads meanings with `LEXCollocations` through the route file's `normalized_key` and `r_route_text` → `lex_id`.
  - It refuses a set row the store does not hold once.
  - It writes the list and its receipt (rows 2,649, keys 764, name rows 425 and plain meanings 47 left out, 7b inside 1,251, references 16,299).
- New `tools/apply-ubs-collocations-v1.mjs`, on the model of apply-name-rows-v1 (tools/apply-name-rows-v1.mjs:1-80):
  - pinned; finds rows by key, rank, m and sha16 through the follower; idempotent; `--dry` and `--on`;
  - writes facts `phrase` (the collocations) and `picked_at`;
  - refuses a miss the record does not explain;
  - records itself in the index's facts receipts.
- `tools/gloss-store-v1.mjs:108-122`, the FACTS_SLOT doc: add `phrase` and `picked_at`.
- `tools/dictionary-kinds-v1.mjs`:
  - `reads` (:204) gains `stands_at`, the name of a fact that lists places where a row stands though its entry rests it shut;
  - the rule it returns (:224) becomes `(row, place = null) => …`: an entry with `stands_at` is passed over when `place` is in `factsOf(row)[e.stands_at]`;
  - the bakes call it with no place, so the line never reads the row.
- `data/dictionary-kinds-v1.json`, `rests_off`, gains:
  ```json
  { "id": "ubs-collocation", "say": "that the UBS dictionary gives under a collocation",
    "families": ["ubs-dictionary"], "fact": "phrase", "stands_at": "picked_at",
    "ruling": "the lead, 15 November 2026 …; question 10, taken …" }
  ```
  `say` holds no Hebrew.
- The search index needs no edit: the fact entries' rows are already left out (bake-search-index-v1.mjs:136, :237, :290).

**Page (zone.html).**
- :2865-2900, the page's copy of `restsOffOf`: the same edit, line for line (`reads` at :2875).
- :8261-8264 and :8298, the kinds gate: `shutAway(rows, placeOfW)`, where `placeOfW` is `${BOOK} ${label}:${k}` of the asked word (the table `dfltPlaceSaid` builds, :6168-6175). It is null for a run's card. A row kept at its own pick's place enters the pool and is not counted.
- The count (:8473-8491) is unchanged. The card says «N that the UBS dictionary gives under a collocation · show» beside the other entries (:3825-3832); an empty card says it as it does today (:11009).
- `makePill` (:11501-11508): an opened collocation pill's title carries UBS's own collocation from `phrase`.
- The live line's pool (`storeOnly`) never passes a place, so it stays shut, as the bake does.

**Round.** The facts are written in store step 9 (§7), before the round. The round's zones and lattice bake at rest, through `openRouteStore({ atRest: true })`, with the entry shut everywhere. The search drops the 2,649 rows.

**What moves at rest.**
- *Lines:* 0.
  - 7b's rows lead no resting line (call-7 reader: 0 of 400,474).
  - The 8 «Sea of Reeds» lines are span-store lines; span rows carry no facts slot, so the entry cannot reach them.
- *Cards* (`ubs-kind-card-reach-v1`). Only the entry gate is applied (a row's numbers against the word's tag); the pointing and stem gates are not. Upper bounds:
  - at the word's own key: 121,941 pills at 17,524 word places;
  - question 10 keeps 17,425 pills at 2,072 word places;
  - at pieces' keys (blocks a press away): 303,057 at 26,297;
  - 7b alone would be 50,304 at 10,975 (question 10 keeps 6,652 at 1,062).
- Most-touched keys: איש, יד, עד, יום, עשה.
- By book, word places / pills at the word's key:
  - Genesis 1,230/8,379; Jeremiah 1,196/7,498; Psalms 1,148/6,681; Ezekiel 1,105/7,786; II Kings 1,012/6,363; Isaiah 960/6,396; Exodus 913/7,022;
  - … Haggai 34/226; Nahum 24/194; Obadiah 15/176.
  - The full list is in the output file.

**Checks.**
- `check-dictionary-kinds-v1`:
  - **K1:** the entry resolves to `ubs_sdbh_hebrew_v0_9_2`.
  - **K2:** the module and the page answer alike with and without a place, the place drawn both from the row's own `picked_at` and from outside it.
  - **New K6:** every row of the derived list carries `phrase` equal to its collocations and `picked_at` equal to its places; no other row carries `phrase`; no row with `name` carries it. Fails today: no row carries it.
  - **K4 (page):** at a place in `picked_at` the pill stands and is not counted; at another place of the same key it is counted.
- `check-audit-calls-v1`, new clause **A12**:
  - 7a lands no fact;
  - 7b ⊂ the set, its 10 others named by class;
  - 7c and 7d carry no `phrase`;
  - each 7e place is in its row's `picked_at`.

---

## 3. Call 4: STEP's own words are the line at 785 places

**Rule id:** `steps-reading-stands-rule-v1-where-step-spells-or-parts-the-word-otherwise-its-own-pick-1-is-the-line-credited-to-step`

**Rests on:**
- The corpus lane's call 4, accepted by the owner: «where STEP spells or parts the word otherwise (853 places), STEP's reading stands» (calls-v1/RULE.md:16).
- Question 4: «the line under STEP is always credited to STEP».
- «No claims»: the replaced rows stay on the card.
- Question 2's hold of the 46, and question 3 stays held.

**The stands category**, by STEP's own tie, never by place name. A call-4 line stands where all of these hold:
- its action is `steps_words_are_the_line`;
- STEP's words hold no « | »;
- the zone word is not a pair whose read form holds several words (the zone's `kq.words_read`, v192's category).

That is **785 = 779 plain words + 6 pairs** whose read form is one word.
- Out by category: 14 v192 places, 46 « | » places (held), 8 `none`.
- None of the 853 is among question 3's 157.

**Data.** No new pin. Call 4's list is pinned twice already: `data/audit-calls/PIN.json` and `data/default-picks/PIN.json:145-157` (held_split_v189, sha256 8e08514b…). The index's `step_words` carries `[n, words, 1]` at a stands place.

**Tools: `tools/bake-default-picks-v1.mjs`, the only reader of call 4.**
- **:391-396.** Derive `stands` beside `heldSplit` from the same pinned list. Refuse where:
  - the place is not a zone word whose letters are `s` (853/853 pass);
  - STEP's pick 1 after the mends is not call 4's words byte for byte (785/785 pass);
  - a stands place is a « | » place or a read form of several words.
- **:843-850.** A stands place never rests bare.
- **:886-918.** Write `[n, words, 1]` at each stands place, the 6 pairs included, and count it as printing (`stepWordsAt` 2) whatever the record drew.
- **The header (:66-104) and the receipt (:1183-1192):** say so; count `stands` (785), held (46), none (8) and v192 (14).

**Page (zone.html).**
- **:4865.** Keep `DFLT_STEP_WORDS` as n → words: round 2's concordance (`madeOf`) reads it so. Add `DFLT_STEP_STANDS = new Set(rows with r[2] === 1)`.
- **:6095** `stepOwn`: `DFLT_STEP_WORDS.has(n) && (DFLT_STEP_STANDS.has(n) || dfltTodayBare(word))`.
- **Pairs.** A pair never asks `lineUnder`. So:
  - `kqPlace` (:5848-5866) and the branch of several words in `kqPickG` (:5901-5921) take STEP's words at a stands pair under STEP, and back the read half.
  - STEP's own data names that half: call 4's marker is =Q(K) or =Q(k) at all 6, and the ledger's pick 1 is the read form's reading (call-4 reader m8).
  - At Lamentations 4:3:10 the backing moves from the ketiv group to the qere. Say so in put-back 5.
- **The halves rule.** Round 2 moves it into `dfltAcross`. A word read by its own place pieces counts as read by STEP: `(defaultAtWord(w) || {}).src === d.src || (d.src === "step" && placeLine(w))`. Only II Samuel 6:10:16 needs this.
- **:6187 and :15776-15783.** The chip says «STEP's own reading at this place, where STEP spells or parts the word otherwise» at a stands place. The STEP pill's title drops «only where today's line was bare» for those places.

**Round.** The defaults step (the bake), then records and lines. Then the defaults again with `--receipt-only`; it converges, since stands do not read the records. No new step.

**What moves at rest** (`call4-on-ship-records-v1`, on the combined ship's records).
- Of 785:
  - unchanged 353 (STEP's words already, credited M4);
  - **26** change only their credit (to M4);
  - **402** change their words;
  - **3** appear where none stood (Ezekiel 6:3:15, II Samuel 18:8:4, Psalms 145:6:4: all pairs, so ship 3 could not print them);
  - **1** sits inside a run (II Samuel 6:10:16, with call 3).
- **432 lines move.** Live's count was 440.
  - The kinds already turned 8 «replaced» into «unchanged», by printing STEP's words where a shut source left the line bare.
  - The two «+ fork» lines (Esther 9:17, I Chronicles 23:23) are now call 4's «thir-» and «three».
- The credits of the 402 replaced lines: M14 190, M4 123 (TAHOT's reading of another place spelled the same), M9 32, M25 19, M3 16, M5 4, M11 4, M17 3, M18 3, and 7 more.
- Lines moved by book (unchanged / credit / replaced / appear / run, and the total that moves):

| book | | book | |
|---|---|---|---|
| Amos | 2/0/1/0/0, 1 | Isaiah | 13/0/22/0/0, 22 |
| Daniel | 31/5/25/0/0, 30 | Jeremiah | 21/0/23/0/0, 23 |
| Deuteronomy | 13/0/26/0/0, 26 | Job | 13/0/26/0/0, 26 |
| Ecclesiastes | 5/0/5/0/0, 5 | Joshua | 6/1/5/0/0, 6 |
| Esther | 7/2/7/0/0, 9 | Judges | 18/1/13/0/0, 14 |
| Exodus | 10/1/14/0/0, 15 | Lamentations | 6/0/8/0/0, 8 |
| Ezekiel | 30/0/17/1/0, 18 | Leviticus | 7/0/7/0/0, 7 |
| Ezra | 8/0/4/0/0, 4 | Malachi | 1/0/2/0/0, 2 |
| Genesis | 10/2/7/0/0, 9 | Micah | 1/0/2/0/0, 2 |
| Habakkuk | 0/0/2/0/0, 2 | Nahum | 2/0/3/0/0, 3 |
| Hosea | 2/1/3/0/0, 4 | Nehemiah | 11/1/12/0/0, 13 |
| I Chronicles | 12/3/11/0/0, 14 | Numbers | 10/2/18/0/0, 20 |
| I Kings | 14/0/9/0/0, 9 | Proverbs | 13/0/22/0/0, 22 |
| I Samuel | 13/0/11/0/0, 11 | Psalms | 30/1/34/1/0, 36 |
| II Chronicles | 15/1/16/0/0, 17 | Ruth | 3/0/5/0/0, 5 |
| II Kings | 10/3/17/0/0, 20 | Song of Songs | 3/0/9/0/0, 9 |
| II Samuel | 9/2/12/1/1, 16 | Zechariah | 3/0/4/0/0, 4 |
| | | Zephaniah | 1/0/0/0/0, 0 |

**Checks.**
- `check-default-picks-v1`:
  - its second road (:362-392) derives stands too;
  - **D3** (:802-845) counts them;
  - **new D21:** at each stands place the record draws STEP's words as the line draws them, under M4. Fails today at 432 places.
- `check-audit-calls-v1`, new clause **A10:** the index's stands are exactly the category (785), with 46 held, 8 none and 14 v192, each by its class.
- The gate: §8.

---

## 4. Call 3: a run reads its words

**Rule id:** `run-reads-its-words-rule-v1-a-run-whose-every-word-has-its-own-reading-at-the-place-reads-word-by-word-the-joined-reading-a-press-away`

**Rests on:**
- Question 8, taken: «each word of a run of several words shows its own reading, and the joined reading («Monday», «the Jewish people») is a press away. *Recommended: yes, this settles your open question #90.*»
- «An example names a class.»

**The rule.** A run's joined line stays only where some word of the run has no reading of its own at the place.
- A word's own reading is its place pieces (`placeLine`) or a call-4 stands place.
- Marks are set aside: a bridged paseq is in `__words` (appendWord, :13521).

**Data.** Pin v181's `lines-over-several-words-v1.jsonl` beside the calls' lists:
- 384,463 bytes, sha256 12228dc4e7ab9566f3c809500ccc63aeece0f0244480644fc2a779509b0d778a, 2,177 lines;
- a `PIN.json` entry `call3_lines_over_several_words_v181`;
- read through `readPinned` (tools/pinned-v1.mjs:33).

**Page (zone.html).**
- One test beside `runTakesDefault` (:6163):
  ```js
  runReadsItsWords = (run) => run.__table == null
    && run.__words.filter((w) => !w.mark).every((w) => placeLine(w) || DFLT_STEP_STANDS.has(WORD_N.get(w)))
  ```
- :12172, the span branch: add `&& !runReadsItsWords(run)`.
- :12186, the whole-form branch: use the same test in place of its own `every(placeLine)`.
- :8753-8754 `chainReadsWhole`: the same test before the span check.
- :9836-9842, the run card's opening: open on the as-written rung only where the run's line reads it whole; otherwise open on the words, one by one.
- Nothing else changes: spanCardsOf, the cells, the rungs, the rulings, the kinds gate.

**What moves at rest** (call-3 reader, on the combined ship's records, with call 4).
- **2,153 runs over 4,353 words** fall:
  - 456 keep their letters and change only credit and drawing («therefore» → «there-» + «-fore»);
  - 1,697 change their words.
- By source: English Wiktionary 1,599/3,220; SDBH 329/667; BDB 83/166; TBESH 61/137; UBS 24/48; Strong's (OS) 18/36; Lexical Index 17/34; Aramaic Wiktionary 14/28; ETCBC 5/11; STEP's expanded Strong 3/6.
- By book: Numbers 214/430, Ezekiel 180/364, Jeremiah 160/322, Joshua 140/286 … Jonah 1/2. The reader's table holds the rest.
- **Held: 5 runs over 10 words.** Some word has no reading of its own:
  - Daniel 1:13:8-9 and 1:15:14-15, «food» (SDBH);
  - Jeremiah 39:3:9-10 and 39:3:17-18, «Nergal-sar-ezer» (TBESH);
  - Song of Songs 6:12:6-7, «Amminadib».
- **Cards:** 338 chain-book cards open on the word pressed, not on the whole rung.
- Records: `lines_over_more_than_one_word` → 5.
- Default picks receipt: `runs_read_whole` → 5 lines over 10 words, its «what» restated (bake-default-picks-v1.mjs:1199-1201).

**Checks.**
- Restated:
  - `check-span-store-v1` S2 and S3 (:7-17): a run's line only where a word lacks its own reading; the card opens on the word.
  - `check-run-line-follows-division-v1` D1 (:13, :83).
  - `check-default-picks-v1` D7's text (:140-146).
  - `check-card-opens-on-the-line-v1:117` takes words inside runs.
- New clause in `check-audit-calls-v1`, **A11:** each of v181's 2,177 lines is either word by word in the records, each word with its own line, or held over exactly its words with v181's text and credit. 2,172 and 5. Fails today: 2,158 read whole.

---

## 5. Questions 11 and 12 (pointer pills)

**Question 11.** «Recommended: print as ruled until a source's own fact separates them». No change.

**Question 12.**
- **Rule id:** `pointer-one-pill-rule-v1-a-pointer-that-prints-the-english-of-a-reading-on-its-card-is-that-readings-pill`.
- **Rests on** the answer «153 pointer pills now print the same English as another reading on the card … *Recommended: one pill.*», and the house's rule of one reading, one pill.

**Page (zone.html).** In `poolFor`, once the groups are built (:8370-8380) and `FORM_OF` is here:
- A group whose every record is a pointer row that resolves joins the group whose drawn text is `drawn(resolved.text)`. Resolving uses `formOfResolves` (:3687), with the names-held flag.
- Its rows follow that group's own rows as carriers.
- The pill prints the reading. Its title and `data-pointer` carry «also <the pointer's own words>».
- `makePill` (:11508) then meets no pointer text on such a group.
- The map arrives after the first paint, so a card drawn before it is rebuilt when it lands, as the lines are.

**Check.** `check-form-of-v1`, new **F12**: no card prints the same English twice where one is a pointer's resolution. It fails today (the lane's count: 153 pills at 14,995 places). **Lines:** 0.

---

## 6. Ship 6: v187, words back

**Rule ids:**
- `row-strike-rule-v7-…-a-retext-from-words-back-keeps-the-rows-closes-and-facts`;
- `row-strikes-follow-rule-v2-…-a-retexted-row-is-followed-to-its-new-words`;
- `words-back-landing-rule-v1-the-lanes-words-back-land-by-key-and-rank-held-where-the-printed-text-sets-a-hebrew-character-against-a-latin-letter-or-a-digit`.

**Rests on:**
- The owner: «just push the ledgers we did live».
- Questions 17 and 18, taken.
- «A rule … runs over the whole shelf», for the seam hold.

**What lands.**
- The seam census over v187's final list, by the v187 reader's m1b-seams.mjs, output read: 11 rows put a Hebrew character directly beside a Latin letter or a digit.
  - 8 done: יהורם 13, נבל 83, שבט 48, גנזים 5, ארבעים 10 (joined inside words_back by rule 25), and אחר 71, טרם 7, יהוה 24 (joined by rule 23's closes).
  - 3 settled: יהורם 11, חשתי 6, נפש 117.
- All 11 are held. **740 land: 512 done and 228 settled.** The 38 held rows stay notes with gaps (question 17).

**Figures** (`words-back-recount-v1`, a design copy of the reader's m2-recount.mjs with the hold widened, against store ccec4fa3071b):

| | 512 done | 228 settled |
|---|---|---|
| rows with closes / closes | 59 / 103 (88 carried, 15 added) | 29 / 37 (29 carried, 8 added) |
| pieces put back | 686 | 594 |
| rows carrying `n` | 503 | 228 |
| rows with ledger cuts now | 2 | 3 |
| v178 made-spaces lines that lose rows | 53 (all 53 then unserved) | 25 (25) |
| v178 words-taken-out lines that lose rows | 489 (450 then unserved) | 219 (200) |

The reader counted for 515 and 228 separately:
- the default picks name 482 rows (7,352 references) and 220 rows (2,856 references);
- BDB's ledger cannot classify 425 and 228 of the new texts.

The build's tools recount these for the 740.

**Data.** Pin `data/made-spaces/words-back-v1/`:
- RULE ab551ae3…;
- words-back-final f03fa594… (789 lines);
- in-921-lost-none 0ed92496… (132 lines);
- the 4 receipts.

`tools/derive-words-back-v1.mjs` (new) runs the seam rule over the whole list, re-proves every line on the store and writes:
- `retext-v1.jsonl` (740 lines);
- `held-v1.jsonl` (49 lines: 11 seam and 38 held).
Both are pinned.

**Tools.**
1. **`tools/strike-rows-v1.mjs` → rule v7.**
   - The whitelist (:194) accepts `from_slot: "words_back"`.
   - The header (:124-130) says so.
   - The retext (:360-377) refuses unless all of these hold:
     - slots 1 and 2 equal the old route;
     - slot 9 equals the line's closes;
     - the sense mark equals the line's entry;
     - the closes are spaces of words_back, rising;
     - the printed text equals `closed(words_back, closes)`.
   - It then writes slots 1 and 2 = words_back and slot 9 = [closes, closes] or null; clears slots 7 and 8; keeps slots 0, 3–6 and 10; and records the old row whole. No fold occurs (m2: no new text is already an M46 text under its key).
2. **`tools/row-strikes-follow-v1.mjs`.** Retire the seam (:182-185, :198, :211, :227). Answer `retexted` with the new name `[key, rank, m, sha16(new text)]`, and follow back the other way.
   - The v187 reader's prototype `ship6-words-back/proto/row-strikes-follow-v2-proto.mjs` and its rehearsal (sim-retext.mjs) answered all 515 from both read versions.
   - Its consumers:
     - `apply-sense-openings-v1` (:139-142) keys by the followed text;
     - `apply-row-entries-v1` (:195-198) names by the new sha16;
     - `bake-default-picks-v1` (:465) accepts `retexted`, and :469 prints `routePrinted(found[0])` as :447 does;
     - `made-spaces-second-road-v1` (:98, :345) takes a retexted row off its old texts without removing it.
3. **`tools/apply-made-spaces-v1.mjs`** (:269, :278, :283): a retexted row takes its closes from the derived list by key and rank. Count those closes apart.
4. **`tools/project-lattice-v12-v1.mjs`** (:288-296): the binyan file names rows by their old text. Follow each `(m, rank, route)` through the retext to the new text, so the page's lookup by the current text (zone.html:8229) still finds its stem.
   - Without this, 50 of the reader's 515 rows lose their stem and could print as new notes.
   - With it, nothing moves.
5. **`apply-name-rows-v1`** runs again with no change, because check-names-gate:237 compares the record's «rounds since».

**What moves at rest.**
- Nothing: 0 lines and 0 pills. A sense-mark row gives no reading, and the retext keeps the mark.
- The 740 notes print BDB's words back.
- BDB's default line prints the ledger's slot 5, never the row, so it does not move (v187 reader, m4b and m4c).

**Checks.**

New `tools/check-words-back-v1.mjs`. Every law fails today (no retext):
- **W1:** the pins.
- **W2:** each retexted row has words_back in both slots, slot 9 as given, slots 0, 3–6 and 10 byte for byte, and its note's text equal to the printed text.
- **W3:** the round records each old row whole, with no fold.
- **W4:** the 49 held rows are unchanged.
- **W5:** the other v174 rows are unchanged.
- **W6:** the v178 falls are meets-v1.json's less the held rows: 53+25 and 489+219 lines.
- **W7:** the follower answers `retexted` from both read versions.
- **W8:** the sidecars' stems name the new texts.

Amended:
- `check-audit-calls` A9 (:291-292): compare the printed text.
- `check-sense-openings` O3, O4 (:176-184, :233).
- `check-entry-gate`: its lists (:190), E3 (:324), E5 (:409).
- `check-default-picks` D2 (:749-752) and the receipt's account (:773).
- `check-made-spaces` M3, M5, M6.
- `check-ledger-divisions` D3, plus one law: every uncovered row is a sense-mark row.

---

## 7. The round, in order

**Store steps.** These come before the round and are not run by it, as the round's header says (round-v1.sh:48-69). Write them as one script, `ship56-store-steps.sh <tree> <moment>`, on the model of `S/v64/steps/ship4-store-steps.sh`:
- each step `--dry` first, with its figures compared to the ones below;
- each step then run for real, with `--on`;
- the script prints the sha256 of every file it wrote.

1. `derive-words-back-v1`: 740 to retext, 49 held.
2. `strike-rows-v1` (v7) with the retext list: 740 retexted, 0 folded, routes 651,752 and keys 122,496 unchanged, a new store version.
3. `apply-ledger-divisions-v1`: slots 7 and 8 derived again for the retexted rows. Its receipt names the uncovered rows.
4. `apply-source-years-v1 --dry` (expect 0), then `apply-made-spaces-v1`: slot 9 on 88 rows with 140 closes; the second road holds the falls of the table above.
5. `apply-row-entries-v1`: 0 moved.
6. `apply-name-rows-v1`: 0 rows.
7. `apply-sense-openings-v1`: all 2,008 lines found, 0 moved.
8. `derive-ubs-collocations-v1`: 2,649 rows.
9. `apply-ubs-collocations-v1`: 2,649 rows gain `phrase`, 2,643 gain `picked_at`.

**Then `tools/round-v1.sh --stamp <date> --lattice … --stems … --stems-extension … --default-picks …`** with every step:
- **zones:** the witnessed bake with the sign step; regloss under gloss rule v8 at rest; the commentaries; the lattice with the sign in `firstUnder` and the stems followed; the read words.
- **stamps.**
- **search:** the UBS fact rows leave the index.
- **defaults:** call 4's stands.
- **records.**
- **lines:** round 2's `compare-resting-lines-v1 --before HEAD`, then the receipt-only pass of the defaults.
- **chain.**
- **door.**

No new round step is needed. Every new rule rides an existing step.

---

## 8. The gate, and the all-lines comparison

**The gate:**
```
node tools/check-same-product-v1.mjs --old <live> --new <built> \
  --expect data/default-picks/index.json --expect data/dictionary-kinds-v1.json \
  --expect data/audit-calls/PIN.json --expect data/form-of-pills-v1.json --diff build/ship56-gate.diff
```

`data/audit-calls/PIN.json` gains a `rule_id` (`audit-calls-landing-rule-v1-…`) and `landings` entries for calls 7, 4 and 3, each naming its rule id. The gate tells every file by its rule_id (:103-112).

Owed classes:

**(a) Stands** (default-picks index, its third element)
- At a stands place, the new line is `drawnStep(words)` under M4, whatever the old line was.
- Today it is owed only where the old line was blank: `gains` (:405) and :428-432.
- Said in the diff as `stands:`.

**(b) Strong's sign** (audit-calls, call 7's landing)
- On S1, the old text opens with `STRONG_SIGN` (imported from gloss-store); the new text does not; and a row under the word's keys in the new store prints it.
- On S2, the lost pill is the old line's signed reading, and the pressed pill moves with the line.

**(c) Runs** (audit-calls, call 3's landing, with v181's pinned list)
- At rest, a word whose old line was one of v181's run lines now reads its own place pieces as the page draws them, or the stands words, under its chip.
- Under a source pressed, a word of a run that falls may read anything but a run line.
- S2 owes the first cards of such words, opened on the word.

**(d) UBS collocations** (kinds record). S2 is tightened:
- Today a lost pill passes when every carrier is in `SHUT ∪ FACT_IDS`. With M18 in `FACT_IDS`, that would excuse any lost UBS pill.
- Instead, ask `stoodShut` with the card's place: a fact-family carrier must carry the reading only in rows that rest shut there, so a question-10 place owes the pill.

**(e) Pointer fold** (form-of map): a card that lost a pointer pill whose resolution is the English of another pill on the same card.

**The all-lines comparison.** Round 2's `compare-resting-lines-v1` lists the moved lines. The lead's classifier, `S/v76/lines-compare-v2.mjs` → v3, learns these classes, tried in this order before the existing ones:

1. **`steps-reading-stands`.** The place is a stands place of the new index, and the new line is STEP's words under M4. **Expect 431**, plus 1 inside a run.
2. **`runs-read-their-words`.** The old unit spans more than one entry. In the new record each of its entries stands under a line of its own. Every non-mark word of it has pieces that print, or is a stands place. **Expect 2,153**, with 4,353 «(its words)».
3. **`strongs-sign`.** The old text opens with `STRONG_SIGN`. The new text, printed by a row under the word's keys in the new store, does not. **Expect 1 + 1,871**, plus 6 with decision 2.

`kinds-shut` meets the UBS entry through the new record by itself (expect 0). A `words-back` class (expect 0) catches any line whose text is a retexted row's old or new text. Unexplained must be 0.

---

## 9. The order of commits

1. **Pins.**
   - v181's list and the audit-calls PIN's `rule_id` and landings for calls 7, 4 and 3;
   - `data/made-spaces/words-back-v1/`;
   - `data/ubs-collocations/PIN.json`.
2. **The follower's `retexted`** and its consumers: apply-sense-openings, apply-row-entries, the bake's :465/:469, the second road, check-audit-calls A9, check-sense-openings, check-entry-gate, check-default-picks D2, check-made-spaces. Dormant until a retext exists.
3. **strike-rows v7**, `derive-words-back-v1` and `check-words-back-v1`.
4. **apply-made-spaces** and the projection's stems following the retext.
5. **The UBS kind:** derive and apply tools; FACTS_SLOT doc; the record and module with `stands_at`; the page's copy and kinds gate; check-dictionary-kinds K1, K2, K4 and K6; check-audit-calls A12; the gate's S2 tightening.
6. **The sign:** gloss-store predicate and pool; GLOSS_RULE v8; projector `firstUnder`; the witnessed bake; the page's `SOURCE_SIGN[0]` and `signLast`; `check-sign-does-not-lead-v1`; the gate's class (b).
7. **Call 4:** the bake; the page's stands, pairs, halves, chip and title; check-default-picks D3 and D21; check-audit-calls A10; the gate's class (a).
8. **Call 3:** the page's test and three branches; the restated checks; check-audit-calls A11; the bake's receipt text; the gate's class (c).
9. **Question 12:** the page's fold; check-form-of F12; the gate's class (e).
10. **PIPELINE.md and PIPELINE-MANIFEST**, including PIPELINE.md:108's retext refusal.
11. **Generated:** the store steps (§7), then the round's outputs. One commit, after the gate.

Then main, the merge into gh-pages with the message «gh-pages follows main», both pushed, and check-live-v1.

---

## 10. Held, and put back to the corpus lane

**Held:**
- 46 « | » places (put-back 2).
- 8 `none` places; 14 v192 places carried by v192's pieces.
- 5 runs over 10 words.
- 7c unchanged; 7d (SDBH's mark not found).
- The 226 «(word) word» lines: the sign is not on the rendering.
- 47 UBS rows that are also plain meanings; 425 UBS name rows.
- v187: 11 seam rows, 38 held rows.
- Question 3's 157 words.

**Put back:**
1. The source-signs ledger to v1.1, with Strong's sign alone in a bracket: 81 readings, per the M14 declaration.
2. BDB's ledger: shapes for Hebrew points, or a line saying a sense-mark row is outside it. The reader counted 653 uncovered texts of 743.
3. The binyan file keyed by the new texts (the reader's 267 rows of 743).
4. The 11 seams, both mechanisms: rule 25's tag reading (8) and rule 23's closes before occurrence counts (3: «C518», «…57», «…39»). Is that how BDB prints them?
5. UBS's collocations per row (Ask 2), which replace the derived list; and SDBH's mark, if it has one.
6. STEP's reading per word at the 3 held runs that are not « | » places (Daniel 1:13 and 1:15, Song of Songs 6:12).
7. Row entries v1.2 and default picks v1.3 by the new sha16. Already asked.

---

## 11. Risks, and the conflicts with toggles round 2

**Risks:**
1. **The rule ids.** Gloss rule v8 moves every zone's `emitted_from` rule. Kinds K3 and the gate read those stamps.
2. **The Tikkunei Zohar's 1,871 lines** move to the next alphabetical King James rendering. The rule decides it, not the quality of the result. If the lead wants that work kept as it is, the switch is one parameter passed through the record's scope, in the page and the bakes alike.
3. **The UBS kind's card reach** is large: up to 121,941 pills at 17,524 places at the word's key. S2 samples few cards; the K4 page law is the real proof.
4. **The follower v2** touches nine consumers. A missed one goes red, not silent.
5. **The sense openings on the stem.** If the stems are not followed, 50 retexted rows could print as new notes. W8 holds it.
6. **Machine load.** The round with the lattice takes about 43 minutes, and the suite needs `--timeout` or round 2's ready-wait fixes. The v187 reader's OOM incident applies: cap the heaps of the store steps.

**Conflicts with round 2** (b152652e7f; its zone.html diff, read from S/pt's objects, is `design/round2-zone.diff`):

`tools/gloss-store-v1.mjs:79-83`
- Round 2 escapes `SIGN_GAP` and `signOnly`.
- Call 7's predicate sits beside them. Take round 2's lines first.

`tools/check-same-product-v1.mjs`
- Round 2 imports `SIGN_GAP`, `signOnly` and `signsOff`, turns the ready wait into a fault, and adds the data-wn parts.
- Ship 5 adds classes (a) to (e) and the S2 tightening.
- Merge by hand. Fold the two imports into one.

`tools/check-default-picks-v1.mjs` (307 lines changed by round 2)
- Round 2: units once, D5 neighbors, D7 w5, D20.
- Ship 5 touches D3, D5 and D7 and adds D21.
- Build on top of round 2.

`zone.html`, the default layer
- Round 2 renames `defaultAt` to `dfltAcross` and adds `dfltApartUnit` and `dfltUnitHeld`.
- Call 4's halves edit goes into `dfltAcross`.
- Round 2's `madeOf` reads `DFLT_STEP_WORDS.get(n)` as words, so keep that Map's shape.

`zone.html`, `refreshJoinGloss`
- Round 2 adds the unit-once parts (unitSkip, data-wn) in the parts loop.
- Call 3 edits only the span and whole-form branches above it. Separate, and they compose: more runs fall into the parts loop.

`zone.html`, the run card's label
- Round 2's `placeWho` (ship :10155) is apart from call 3's opening (:9836-9842).

`tools/resting-lines-v1.mjs` and `tools/round-v1.sh`
- Round 2's changes stand. Ship 5 and 6 add nothing to them.

---

## Measures: scripts and outputs (all in `S/v77/ship56-design/design/`)

**`ubs-and-bracket-reach-v1.mjs` → `.out.json`, `.log`**
- Reads: UBS's file and route file (the call-7 reader's `dl-ubs`), the ship store, the default picks ledger v1 with its rows tables, the 39 zones.
- Gives:
  - the UBS set (2,649, 425 names, 47 plain);
  - the readings that leave a pool (2,661);
  - the question-10 references (16,299 at 8,252 places; 5,951 pairs where the card asks the key) and the index alternative's bytes;
  - the bracketed sign (81 readings, 61 keys, 7,739 word places);
  - the sign readings (M14 15,605, M9 751, M3 2).

**`ubs-kind-card-reach-v1.mjs` → `.out.json`, and `.only7b.out.json` with `--only-7b`**
- Card reach after the entry gate (`tools/entry-gate-v1.mjs` numberOf), by book.

**`call4-on-ship-records-v1.mjs` → `.out.json`**
- The 785 against the combined ship's records and against live's.

**`signed-lines-on-ship-v1.mjs` → `.out.json`**
- Signed resting lines on the ship's and live's records (1,885 and 6; 1,883 and 6).
- The Tikkunei Zohar's 309 table keys under the rule.

**`words-back-recount-v1.mjs` → `.out.json`**
- The v187 figures for 512 and 228.
- The reader's m1b-seams.mjs, run over `S/dl-v195/v187/…/words-back-final-v1.jsonl`, printed the 11 seams to stdout.

**`round2-zone.diff`**
- Toggles round 2's zone.html hunks, cdd93e381f..b152652e7f.

**Taken as measured by the readers:**
- call 7 (call7-signs/): the 13 Bible lines of live, baked leaders, the 7b and 7e figures;
- call 3 (call3-runs/): runs, sources, books, cards;
- v187 (ship6-words-back/): the 515 figures, stems, the follower's rehearsal.

**Stays to be measured in the build:**
- commentary sidecars' signed lines;
- words that change under MACULA, UBS and BDB pressed (call 3);
- the 740's default-picks references and BDB-ledger uncovered count;
- the UBS kind's pills after the pointing and stem gates;
- question 12's 153, recounted on this store.
