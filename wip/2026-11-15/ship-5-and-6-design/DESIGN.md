# Ships 5 and 6 in one build: the design, revised (page lane, 15 November 2026)

S = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`.

**Where the code is.** S/ship was removed while I was revising, after the combined ship went live (the notes record Pages run 1371 and live check 69). S/old now holds main **add346d851**, the same commit, with a clean status. Every code citation below is to `S/old/reader`, and the line numbers are the ones the first draft cited.

My scripts and outputs are in `S/v77/ship56-design/design/` (listed at the end), and each figure names the script that counted it or the reviewer who did. The first draft's scripts read `S/ship/reader` while it existed, and their outputs stand as written. The new script reads `S/old/reader`.

I wrote nothing into S/ship, S/old or any other tree. I ran no round, no bake, no browser and no git command that writes. My scripts were light node scripts under `nice -n 19` with capped heaps.

---

## 0. Read first

### One build, not two
- Ship 6 (v187) moves no resting line and no pill. Its store steps and ship 5's one store change (the UBS collocation facts) share one round, one suite and one gate.
- Neither ship reads what the other writes. Ship 5's facts sit on M18 rows. Ship 6 retexts M46 rows. Each facts tool writes only its own keys of slot 10.
- **Ship 6 goes last:** its commits (§9) and its store steps (§7) come after ship 5's. If its checks go red and cannot be mended inside the build, drop the last commits and store steps 3 to 9; ship 5 stands.

### The base
Main add346d851, plus toggles round 2 as it now stands in S/pt (branch `round2-ship`, 5cd8140755..0b8d555d12, ten commits on add346d851). Round 2 ships first. If it has not shipped when the build starts, merge it first (§11).

### The decisions, each with the rule that decides it
1. **Strong's sign is the source-signs ledger's own pattern.** That is `X `, `× ` or `+ ` at the head of a rendering, which is the page's SOURCE_SIGN[0] as it stands. A sign held alone in a bracket, as in «(+) archer», is not taken in.
   - The rule: the lead's call holds the 306 «(» lines out, and today's letter says so (FOR-MOSES-2026-11-15-each-dictionary-as-a-category.md:18).
   - The M14 declaration's `open_paren.holds_sign_alone` goes to the lead as a question (§12).
2. **The sign rule's scope is the kinds record's:** the 39 books, meaning their zones and their lattice sidecars.
   - The Tikkunei Zohar, the 21 Targum sidecars and the fixtures keep today's order until the lead rules.
   - The rule: the lead's ruling «a work whose zone carries no rests_off stamp (the Tikkunei Zohar, which is in progress, and any other work outside the Bible) keeps today's rest exactly» (data/dictionary-kinds-v1.json:11).
3. **The sign is a key of the pool's own order, in the module and on the page, in every position of the signs switch, on a book of the scope.** «printed» then decides how signs are drawn and which readings are offered, not their order.
   - The rule: «a rendering carrying its source's sign does not lead the line while the signs switch rests off».
   - The bake has no signs position. So a card that followed the order in one position and not in another would disagree with its own line (the code review's S1).
4. **The witnessed columns refuse an entry whose row prints only renderings carrying Strong's sign, where the key's pool at rest holds a reading without it.** That is 2,453 entries. The key leaves the column, and the line under that order reads the base table.
5. **The headword line (hg) takes the first card of the lattice's stack, in the stack's own order, that does not open with the sign.** Same rule as decision 3.
6. **UBS's collocation mark lands over its category (2,649 rows), not as 7b's list.** The fact is named `collocations`, UBS's own field name, not our word «phrase».
   - The rule: «a list that names rows one at a time mends only those rows».
7. **Question 10 is carried in the row's own facts (`picked_at`), not in the default picks index.**
8. **Call 4 is built on the default picks layer, with no projector.**
9. **Call 3's test counts call 4's stands as the place's own reading.**
10. **Question 12: one pill.** It prints the reading with the pointer beside it, as a pointer pill prints today. Question 11 needs no work.
11. **v187: one hold over the printed text.** A row is held where a Hebrew character stands directly beside a Latin letter or a digit. 11 rows are held whole and 740 land.
    - The rule: «an example names a class».

### What moves at rest (the 39 books)
The base is the combined ship's own records (S/old/reader/data/resting-lines, 401,248 lines; the same files S/ship held).

| part | resting lines | cards | counted by |
|---|---|---|---|
| Call 4, STEP's words stand | 432: 402 change words, 26 change credit only, 3 appear, 1 is inside a run | the pressed pill moves with its line | call4-on-ship-records-v1 (the code reviewer reran it: identical) |
| Call 3, a run reads its words | 2,153 runs over 4,353 words; 5 runs over 10 words held | 338 chain-book cards open on the pressed word | the call-3 reader; reproduced by r9 |
| Call 7a, Strong's sign | 1: Job 1:21 «X after»→«appear». The 13 other lines that open with the sign are call-4 places. No later piece opens with it. | under «off», the old line's signed pill leaves the card where the line moved | signed-lines-on-ship-v1; bible-signed-vs-call4-v1; signed-pieces-v1 |
| the witnessed columns | 0 at rest | 2,453 entries refused; those keys read the base table under that order | witnessed-refusals-v1 (new) |
| the headword line | 0 at rest | up to 257 words (105 keys) step past a signed card | r2 |
| Call 7b, UBS collocations | 0 | at the word's own key, 121,941 pills at 17,524 word places, of which question 10 keeps 17,425 at 2,072; at pieces' keys, 303,057 at 26,297. All upper bounds. | ubs-kind-card-reach-v1 |
| Question 12 | 0 | 805 pills at 664 keys (56,455 word-key asks), before the place gates (upper bound) | r11; the lane's 153 at 14,995 counts the same source only |
| v187, words back | 0 | 0 pills; 740 BDB notes print the words back | v187 reader; words-back-recount-v1 |

The Tikkunei Zohar and the Targum sidecars move nowhere in this build. The one exception is question 12's fold, which reaches their cards and moves no line (not measured there).

---

## 1. Call 7a reworked: a rendering that opens with Strong's sign follows every plain one

**Rule ids**
- The module: `zone-gloss-rule-v8-printed-form-ledger-division-whole-without-a-ledger-at-rest-a-rendering-carrying-strongs-sign-after-every-plain-one-antiquity-1940-lastuary`.
- The page: `signed-rendering-rule-v1-on-the-books-the-kinds-record-reaches-a-rendering-that-opens-with-strongs-sign-follows-every-plain-one-in-every-order`.

**What it rests on**
- The lead's call of 15 November: «The page already has the category: a source's own sign, at the grain of the rendering, under the signs switch that rests off. … The mend is at that grain: a rendering carrying its source's sign does not lead the line while the signs switch rests off.»
- The owner, 3 October: «preselect it off for now» (zone.html:3487-3494).
- Its scope is decision 2.

**The category, and what it reaches**
- **The pattern** is the ledger's STRONG_SIGN, «reading begins with "X ", "× " or "+ "» (RULE-source-signs-v1.md:12). It is SOURCE_SIGN[0] (zone.html:3510) byte for byte. It is not scoped by source, because the ledger's is not.
- **On the combined ship's store it reaches 16,358 readings:** M14 15,605; M9 751 (in 479 rows); M3 2 (ubs-and-bracket-reach-v1).
  - The two M3 readings are «X and» and «X also» under ו (ranks 110 and 113). The ledger itself lists them under STRONG_SIGN, and the switch already hides them under «off». Whether «X» is MACULA's own sign goes back to the lane (§10).
  - The ledger's 3 M46 rows («+ other number: …») no longer open with the sign on this store.
- **Outside the rule, by the lead's call, which names Strong's sign:**
  - STEP's brackets. These are TAHOT's own words at the place. The call-7 reader's census on live counts 45,234 Bible lines on TAHOT's place pieces with a square bracket and 8,520 with an angle bracket.
  - MACULA's « ~ ». It stands on 1 Bible line, on MACULA's place pieces, by the same census. It also leads 4 Tikkunei Zohar lines («take ~ back»), which are out of scope.
- **The 306 «(» lines stay held,** with the sign held alone in a bracket among them (§12).

**What the rule is**
- It is a sort, not a filter. On a book of the scope, a reading that opens with the sign sorts after every reading that does not, in every order.
- A pool whose every reading carries the sign keeps its order, and nothing leaves a card.
- Call 7a's list lands no fact. Its 136 whole lists lose nothing against today: 0 resting lines read a signed rendering of an M9 list (call-7 reader §3.2).
- 4 of the 136 the M9 ledger leaves whole, so they are read as one reading (§10, put-back 3).

**Tools**

`tools/gloss-store-v1.mjs`
- Beside signOnly (:80), export `STRONG_SIGN = /^(X|×|\+) /u` and `opensWithStrongSign = (t) => STRONG_SIGN.test(String(t ?? ""))`.
- openRouteStore (:223) takes `{ atRest, signLast }` and returns `signLast`.
- In readingPool (:391), when `signLast` is set, the sign becomes the first key of all three comparators (:437-446):
  - oldest: `signed || byOldest`;
  - characters: `signed || ledger || byOldest || at`;
  - corpus: `signed || corpus || byOldest`.
- GLOSS_RULE_ID (:65) moves to v8. GLOSS_RULE_TEXT (:173-182) gains one clause: on a zone the record of dictionary kinds rests, a reading that opens with the ledger's STRONG_SIGN follows every reading that does not, in every order.
- Every leader drawn from readingPool moves with no other edit. The code review checked each one:
  - glossFor and tableFor;
  - regloss's table and its order deltas;
  - gloss_m and its alternate;
  - the license columns, which take the class's first reading (gloss-m-v1.mjs:229);
  - the projector's leadersAt, rowLeader, cites and card groups.

`tools/regloss-zone.mjs` (:89-95)
- Open the store with `{ atRest, signLast: atRest }`. The scope is the record's, asked of the zone's own fields by restsOffIn.
- On such a zone, write `emitted_from.signs_rest_last` as `{rule, scope, ruling}`.

`tools/project-lattice-v12-v1.mjs`
- **:167-176.** Use the same scope test and write the same stamp on the sidecar. Refuse a zone whose stamp disagrees, as the projector refuses today for `rests_off`.
- **`firstUnder` (:578-584).** Sort by `(signed, rank, at)`. Without this, o.m and o.x could put a signed reading first because its tier ranks better.
- **hg (:666-699).** The candidate card is the first card of the stack, in `L.sorted_route_index` order, whose text does not open with the sign.
  - Where every card opens with it, the candidate is the top card.
  - The existing gates (the source is held; the card is not shut at rest) apply to the candidate as they apply to the top card today.
  - Count `hg_stepped_past_a_signed_card`.
  - Today 257 words on 105 keys have an hg that opens with the sign; all are whole Open Scriptures Strong's lists, e.g. «× break, companion, …» (r2, r3).

`tools/bake-witnessed-order-v1.mjs`
- The row is found as today, over the whole rows (rowOfText, :84).
- **A new typed refusal:** «a rendering carrying Strong's sign leads no line where the key's pool at rest holds one without it». It applies where every reading of the row opens with the sign and the pool the base table reads for the key at rest holds a reading that does not.
- The key then leaves the column. applyGlossOrder lays a column only over its own keys (zone.html:14529-14550), so the line under that order is the base table's under rule v8. The card agrees, because its witnessed sort finds no column entry to lead with.
- **Measured on add346d851** (witnessed-refusals-v1):
  - 2,453 refusals: entry-and-lists 2,451, same-place 1, entry 1, on 2,451 keys.
  - At every one, the row prints that one signed rendering and nothing else: 0 rows also hold a plain reading.
  - Every pool at rest holds a plain reading.
  - So the first draft's `readings.find(...)` would have changed nothing (the code review's B1).
- The rule id moves to `witnessed-order-bake-rule-v2-…-an-entry-whose-row-prints-only-strongs-signed-renderings-is-refused-where-the-pool-holds-a-plain-one`. import-witnessed-orders-v1 and type-witnessed-drops-v1 carry the same id. The receipt counts the refusals per column.

**Page (zone.html)**
- **:3510.** SOURCE_SIGN[0] stays byte for byte. Name it STRONG_SIGN, and carry `opensWithStrongSign` beside hasSourceSign (:3511), between markers, so a check can lift it out and run it.
- **:3472-3477.** The comment says what each position now does:
  - «printed»: every reading offered, its signs drawn, in the pool's order;
  - «below»: every sign of the ledger after the plain readings;
  - «off»: as today.
  - It also names the rule and its scope.
- **Scope by the word's own zone,** as the kinds do (kindsActOn, :3811): `signsLastOn = (bin) => !!(bin && bin.emitted_from && bin.emitted_from.signs_rest_last)`. poolFor sets it on the pool from `opts.bin || zone`, and the welded pair card does the same.
- **:8651, `signLast` becomes:**
  ```js
  signsPref === "below" ? hasSourceSign(a.text) - hasSourceSign(b.text)
    : signsLast ? opensWithStrongSign(a.text) - opensWithStrongSign(b.text) : 0
  ```
  - Its place in the chain (:8656) stays: after the place, piece, kind and license keys; before the names and the order's own keys.
  - The card then agrees with the bake in every position and every order.
  - The live repaint (poolFor with storeOnly, then pool[0], :14786) agrees too.
- **The license class stays ahead of the sign** (licPref before signLast), as the license columns take the class's first reading.
  - Where a reader asks for one license class and that class's only reading carries the sign, that reading leads under that preference.
  - r7 counted 46 such leaders after rule v8 (by-sa 45, by 1).
  - The reader's license choice decides which readings the line may print; the sign orders the readings inside that choice.
- **drawPills (:11551-11570) does not change.** Under «off» it already hides a signed reading that is not the line's. So where the line moved, the old line's signed pill leaves the card and is counted in «N readings carrying a source's own sign switched off».

**Round.** There is no new step. The zones step runs, in order:
- the witnessed bake, with the refusal, at its head;
- regloss under v8 at rest;
- the commentaries, unchanged because they are baked whole;
- the lattice, with firstUnder, hg and the stamp.

**What moves**
- **At rest, 1 line:** Job 1:21 (the record's entry 2), «X after» [M14] → «appear» [M14]. STEP's own pick there is question 3's class and stays held.
- **13 more lines open with the sign today, and all are call-4 stands places** where STEP's words take the line (bible-signed-vs-call4-v1):
  - Deuteronomy 28:59 «+ aloud»;
  - Ezekiel 7:13 «X at all»;
  - Hosea 6:3 «+ be able»;
  - I Kings 7:41 and 7:42 «+ advertise»;
  - Jeremiah 5:12 and 49:20 «X before»;
  - Nehemiah 7:45 «+ bethink themselves»;
  - Numbers 3:43 «+ command»;
  - Proverbs 23:7 and Psalms 31:6 «X at all»;
  - Esther 9:17 and I Chronicles 23:23 «+ fork».
- **No later piece of any line opens with the sign** on the combined ship (signed-pieces-v1: 0).
- **The lead's own example.** On live, Nehemiah 2:13 (the record's entry 16) read «them + X abroad», with the sign opening the second piece. On the combined ship it reads «they + were broken down» [PIECE:TAHOT] (S/old's record, read with peek-record-v1). The default picks already mended that place; this rule closes the class it stood for.
- **Off rest,** under the orders, the license preferences, «only this pointing» and the headword: the call-7 reader's count of signed leaders on live's 39 books (baked-signed-leaders) bounds what moves:
  - table 3,840 keys;
  - gloss_m alternate 686;
  - license by-sa 8,160 and by 9 (46 stay signed, by r7);
  - sidecar o.l 5,871, o.x 591, o.la 652, o.s 254, o.m 107;
  - e[…].l 1,863, e[…].la 520;
  - witnessed 2,453 (refused);
  - hg up to 257 words.
- The Tikkunei Zohar and the Targum sidecars: nothing moves.

**Checks**

New `tools/check-sign-does-not-lead-v1.mjs`. It guards the gloss rule v8 and the signed-rendering rule. Each law fails on add346d851 and passes after the build.
- **G0.** A zone carries `signs_rest_last` exactly where the record's scope reaches it, and each lattice sidecar's stamp is its zone's. Fails today: no zone carries the stamp.
- **G1, one rule, one place.** The page's `opensWithStrongSign`, lifted out of zone.html, answers as the module's does over every reading of the store (K2's method). Fails today: the page has no such function.
- **G2.** On a zone of the scope, a baked leader opens with the sign only where the pool it was drawn from holds no reading without it. Each pool is asked through the tool that bakes it:
  - zone.gloss and gloss_orders.characters and .corpus: the key's pool at rest;
  - gloss_m.alt: that pool with the leader's carriers left out (glossCarriers);
  - licence_pd, licence_by, licence_by_sa: the class's own readings;
  - o.m and o.x: the groups firstUnder ranks;
  - o.c: the groups the citing cards carry;
  - o.l, o.la, o.s and e[…].l/la: the pool after that place's row-grain gates (leadersAt);
  - hg: the stack's cards after the held and shut gates.
  - It fails today at 3,840 table keys of live's 39 books, among others.
- **G3.** No piece of a resting line in a work of the scope opens with the sign where the pool its key reads at rest holds a plain reading. The line is split at « + », with the hidden sign's gap set aside. Fails today at 14 lines.
- **G4.** No witnessed entry opens with the sign where the key's pool at rest holds a plain reading, and the receipt's refusals are this check's own. Fails today at 2,453 entries.

Amended:
- check-witnessed-order-v1: its rebuild refuses the same entries.
- check-lattice-projection: firstUnder and hg, where it rebuilds them by its own road.
- check-carrier-survives and check-proper-name follow through readingPool with no edit.

**GUARDS.** Moved in the same commit as the rule ids they name:
- zone-gloss-rule-v7 at check-antiquity-tier-v1:3, check-gloss-whole-v1:5, check-ledger-divisions-v1:4, check-page-agrees-with-store-v1:15, and the comment at zone.html:8023.
- The witnessed rule at bake-witnessed-order-v1:2 and :62, import-witnessed-orders-v1:2 and :45, type-witnessed-drops-v1:2, check-witnessed-order-v1:3.
- The door step writes PIPELINE-MANIFEST.md again (pipeline-manifest-v1). With these moved, it lists no rule as unguarded.

---

## 2. Call 7b reworked: UBS's collocation mark as a kind

### 2.0 Where the lead's call supersedes question 9 and the plan
Question 9 was taken as recommended (OWNER-QUESTIONS-2026-11-14.md:23): «17,046 readings that their own dictionary marks as part of a longer phrase go a press away, under a switch named «phrases», off at rest. The card says … «part of a longer phrase, by Strong's sign X», or for UBS «a phrase's meaning: …».»

The plan (LANDING-PLAN.md:79, :197-199) builds it so:
- apply-phrase-rows-v1 writes a `phrase` fact on 7a less its 306 «(» lines (15,785 rows) and on 7b (1,261 rows);
- a phrases gate stands beside the names gate;
- a `phrases` switch rests off.

The lead's call of 15 November reworks call 7. Where the two differ, this design follows the call:
- **(a) The switch.** There is no «phrases» switch and no phrases gate.
  - Strong's signed renderings stay in the pool, a press away under the signs switch, as today.
  - UBS's collocation rows rest shut under the kinds' one switch (fh.kinds, zone.html:3791-3794 and 3826-3832). It opens them together with the word lists and English Wiktionary's names, so a reader cannot open UBS's collocations alone in this ship.
- **(b) The card's words.**
  - «part of a longer phrase, by Strong's sign X» is not printed.
  - «a phrase's meaning: …» is replaced by the kinds' count line, «N that the UBS dictionary gives under a collocation · show».
  - UBS's collocation itself rides in an opened pill's title.
- **(c) The facts.** Strong's 15,785 rows get no fact. UBS's 2,649 rows (the category, not 7b's 1,261) get `collocations` and `picked_at`.
- **(d) The reach.** Question 9's 17,046 readings become 0 Strong's rows lifted, since the sign is an order, and 2,649 UBS rows shut at rest (2.1 times 7b), less question 10's places.
- **(e) The headings.** The lead's words are «belongs with the headings on the card by kind» (the-ledgers-go-live/THE-OWNERS-WORDS:34). Headings by kind are a later ship of the kinds (each-dictionary-as-a-category/THE-OWNERS-WORDS-2026-11-15.md:59). This ship rests the mark under the kinds' count line, as the kinds' first ship did.

### Rule ids, and what they rest on
- The kinds entry `ubs-collocation`, under `dictionary-kinds-rule-v1-…`; the record's version moves to the build's date (e.g. `2026-11-16a`).
- The facts tool: `ubs-collocations-rule-v1-a-row-carries-the-collocations-its-ubs-meanings-name-and-the-places-ubs-own-pick-names-it`.
- What they rest on:
  - the lead's call («UBS's own phrase mark … is a kind its source states»);
  - the owner («we need to think in terms of each dictionary as a category»);
  - question 10, taken («keep them on the card at rest»).

### The category, and its edges
Counted by ubs-and-bracket-reach-v1 on store ccec4fa3071b; reproduced by the faithfulness review's ubs-marked-classes-v1.

- **UBS's own mark** is a meaning whose LEXCollocations holds at least one collocation, in UBSHebrewDic-v0.9.2-en.JSON. It is reached from an M18 row through the catalog's route file (`normalized_key`, `r_route_text` → `lex_id`), as the calls' RULE.md:76 reads it.
  - It reaches 3,121 of the 21,732 M18 rows; every row is reached.
- **The category is 2,649 rows on 764 keys:**
  - every meaning whose text is the row's text carries a collocation;
  - and the row carries no `name` fact.
- **7b, described rightly.** 7b is UBS's own mark, read only inside v184's pool of UBS and SDBH rows that open with «literally:» or hold « > » (3,655 rows; RULE.md:73).
  - The category holds 1,251 of 7b's 1,261 rows.
  - It also holds 1,398 marked rows the English test never reached.
- **Three edges the design draws**, each named for the lead:
  1. **47 rows whose text is also the text of a meaning with no collocation stay at rest.**
     - This departs from the call the owner accepted: RULE.md:76 makes a row PHRASE «if one of its meanings is so marked», and amendment 4 (:130) keeps it so.
     - The departure rests on «no claims»: UBS itself says the text is also a plain meaning.
     - 3 of the 47 are 7b rows: מלא 72, עמד 159, שסע 20.
  2. **425 of UBS's own name rows stay under the names gate.** The rule: «The Bible dictionaries' own name entries keep the gate as it is: they stand where the text's word is a name» (each-dictionary-as-a-category/THE-OWNERS-WORDS-2026-11-15.md:69).
     - 7 of 7b's rows follow that rule instead of call 7:
       - בוא r175 and לבוא r129 (לְבֹא חֲמָת);
       - גבעא r5, גבעה r14 and גבעת r8 (גִּבְעַת הָעֲרָלֹות);
       - הנם r14 (גֵּי הִנֹּם);
       - חרוץ r27 (עֵמֶק הֶחָרוּץ).
     - For 297 of the 425, the collocation is one written word, the name's own forms; 128 are several words (ubs-marked-classes-v1).
  3. **154 rows carry only collocations of one written word** (ubs-collocation-shapes-v1).
     - At 35 of them a collocation is the key's own letters (21 have nothing else): שוב r148 and r149 (שׁוב), קדש r174 (קָדֵשׁ), חזיון r10 (חֶזְיֹון).
     - Others are another form of the word: תשע r11 «ninety» (תִּשְׁעִים).
     - They stay in the category. The field is UBS's own, and splitting it by the shape of the Hebrew would be a test of our own.
     - The card's words are literal («under a collocation»), and the fact is named `collocations`, not `phrase`. The question goes to the lead.
- **7c and 7d are untouched.** 7d (192 SDBH rows) stays held, as the lead ruled. But the mark is in the same dictionary's file (§10, put-back 5).

### Data
- `data/ubs-collocations/PIN.json` names two files on the corpus lane's store by key, bytes and sha256. They stay on the store and are given on the command line, as the row-entries ledger is:
  - `old-local-999-footsteps/ledgers/work/ldmprs/source-cache/ubs-sdbh-hebrew-2026-07-15/UBSHebrewDic-v0.9.2-en.JSON` (23,110,129 bytes, 1686a25d…);
  - `ubs-sdbh-hebrew-definition-routes-v1.csv.gz` (3567c700…).
- The derived list `data/ubs-collocations/ubs-collocation-rows-v1.jsonl` holds 2,649 lines `{k, rank, m:"M18", sha, collocations:[UBS verbatim], meanings:[lex_id…], picked_at:[…]}`. It and its receipt are pinned.
- **`picked_at`** entries take the form `"<book slug> <c:v:w>"`, e.g. «i-samuel 6:10:15».
  - This is the label the default picks bake gives a place (bake-default-picks-v1.mjs:593: `${sec.label}:${k}`, marks not counted), with the book file's slug.
  - It is read from the default picks ledger's UBS picks (data/default-picks/PIN.json: rows tables v1, v1.1 and v1.2) through the row-strikes follower, as every facts tool reads its list (round-v1.sh:59-66).
  - 16,299 references (16,081 of them at pick 1) at 8,252 places name 2,643 of the 2,649 rows.
  - The card asks the row's key at 4,156 of those places: 5,951 pairs, 2,817 at the word's own key and 3,134 at a piece's key (ubs-and-bracket-reach-v1).
- When the corpus lane sends UBS's own categories per row (Ask 2), its list replaces this derived one under the same apply tool.

### Tools
- **New `tools/derive-ubs-collocations-v1.mjs`**, modeled on derive-fold-strike-landing-v1.
  - It refuses a file that is not its pinned bytes.
  - It reads the marked meanings through the route file and follows the picks' rows through the row-strikes follower.
  - It refuses a set row the store does not hold exactly once.
  - It writes the list and its receipt: rows 2,649, keys 764, name rows 425 and plain meanings 47 left out, 7b inside 1,251, references 16,299 at 8,252 places naming 2,643 rows.
- **New `tools/apply-ubs-collocations-v1.mjs`**, modeled on apply-name-rows-v1.
  - It is pinned, finds rows by key, rank, m and sha16 through the follower, and is idempotent, with `--dry` and `--on`.
  - It writes the facts `collocations` and `picked_at`.
  - It refuses a miss the record does not explain.
  - It records itself under its own key of the store's index, `ubs_collocations`, as row_entries, name_rows and sense_openings do.
- **`tools/gloss-store-v1.mjs:108-122`**, the FACTS_SLOT doc, adds `collocations` and `picked_at`.
- **`tools/dictionary-kinds-v1.mjs`.**
  - `reads` (:204) gains `stands_at`.
  - The rule (:224) becomes `(row, place = null) => …`: an entry with `stands_at` passes over a row when `place` is in `factsOf(row)[e.stands_at]`.
  - The bakes call it with no place, so the line never reads the row.
  - restsOffIds is unchanged: M18 is a family shut by a fact, not shut whole.
- **`data/dictionary-kinds-v1.json`**, `rests_off`, gains `{"id":"ubs-collocation","say":"that the UBS dictionary gives under a collocation","families":["ubs-dictionary"],"fact":"collocations","stands_at":"picked_at","ruling":"…"}`.
- **The search needs no edit.** bake-search-index-v1.mjs:136, :237, :290 and :328 leave a fact entry's rows out, open or shut. So it does not find a collocation row at question 10's places either. That goes to the lead (§12).

### Page (zone.html)
- **:2865-2900.** The page's copy of restsOffOf takes the same edit, line for line.
- **The place** is `placeOf(word) = ${BOOK} ${DFLT_PLACES[WORD_N.get(word) - 1]}`. That is the walk dfltPlaceSaid makes (:6168-6175), factored out; BOOK is the slug (:2752).
  - On a card it is the open word's place (openPlaceWord), for its own key and its pieces' keys alike.
  - It is null for a run's card and for `opts.word` (the live line and the exporter).
- **The place reaches every site that asks restsOff:**
  - shutAway (:8263);
  - the kinds count (:8483, :8494);
  - the welded pair card's count (:10024);
  - kindPick (:10243);
  - the pill's dotted edge (:11519).
  - Span rows (:4297) carry no facts and are not asked.
- **The effect.** At a place in `picked_at`, with the switch shut or open, the pill stands, is not counted, wears no dotted edge and is not a kind pick. At any other place of the same key it rests shut and is counted.
- **makePill (:11501-11508).** An opened collocation pill's title carries UBS's collocations from `collocations`.
- An empty card says so as it does today (:11009).

### Round
The facts are written in store steps 1 and 2 (§7). The zones and the lattice bake at rest, with the entry shut everywhere.

### What moves
- **Lines: 0.**
  - The set leads none of the 788 single-word resting lines credited to M18 (r12).
  - The only resting lines that print a reading of the set are the 8 «Sea of Reeds» run lines, credited to M18 alone (ubs-set-lines-v1). They are span-store lines with no facts slot, and call 3 moves them.
- **Cards** (ubs-kind-card-reach-v1; the entry gate applied, the pointing and stem gates not; upper bounds):
  - at the word's own key: 121,941 pills at 17,524 word places;
  - of those, question 10 keeps 17,425 at 2,072;
  - at pieces' keys: 303,057 at 26,297;
  - 7b alone would be 50,304 at 10,975 (question 10 keeps 6,652 at 1,062).
  - Most-touched keys: איש, יד, עד, יום, עשה.

### Checks
`check-dictionary-kinds-v1`:
- **K1:** the entry resolves to `ubs_sdbh_hebrew_v0_9_2`.
- **K2:** the module and the page answer alike, with and without a place. The place is drawn both from the row's own `picked_at` and from outside it.
- **K4 (page):** at a place in `picked_at`, the pill stands, is not counted and wears no dotted edge, with the switch shut and with it open. At another place of the same key, it is counted.
- **New K6:** every row of the derived list carries `collocations` and `picked_at` as listed. No other row carries `collocations`, and no row with `name` carries it.

`check-audit-calls-v1`, new **A12**:
- 7a lands no fact.
- 7b's rows are in the category, except its 10 others, named by class: 7 name rows and 3 also-plain rows.
- 7c and 7d carry no `collocations`.
- Each 7e line that names a row of the category has its place in that row's `picked_at` (5,134 of 5,222). The other 88 are named by class: 33 name rows and 55 also-plain rows (r10).

---

## 3. Call 4: STEP's own words are the line at 785 places

**Rule id:** `steps-reading-stands-rule-v1-where-step-spells-or-parts-the-word-otherwise-its-own-pick-1-is-the-line-credited-to-step`

**What it rests on**
- The corpus lane's call 4, accepted by the owner: «where STEP spells or parts the word otherwise (853 places), STEP's reading stands» (calls-v1/RULE.md:16).
- Question 4: the line under STEP is always credited to STEP.
- «No claims»: the replaced rows stay on the card.
- Question 2 holds the 46 places, and question 3 stays held.

**The stands category**, by STEP's own tie, never by place name. A call-4 place stands where:
- its action is `steps_words_are_the_line`;
- STEP's words hold no « | »;
- the zone word is not a pair whose read form is several words (v192's category).

That is **785 = 779 plain words + 6 pairs**. Left out by class: 14 v192 places, 46 « | » places (held) and 8 `none` places. None of the 853 is among question 3's 157.

**Data.** No new pin. Call 4's list is already pinned twice: data/audit-calls/PIN.json and data/default-picks/PIN.json:145-157 (held_split_v189). At a stands place, the index's `step_words` carries `[n, words, 1]`.

**Tools: `tools/bake-default-picks-v1.mjs`, the only reader of call 4**
- **:391-396.** Derive `stands` beside `heldSplit` from the same pinned list. Refuse:
  - a place that is not a zone word with letters `s` (853 of 853 pass);
  - a place where STEP's pick 1 after the mends is not call 4's words byte for byte (785 of 785 pass);
  - a stands place that is a « | » place or a read form of several words.
- **:843-850.** A stands place never rests bare.
- **:886-918.** Write `[n, words, 1]` at each stands place, the 6 pairs included, and count it as printing (stepWordsAt 2).
- **:66-104 (header) and :1183-1192 (receipt):** count stands 785, held 46, none 8 and v192 14.

**Page (zone.html)**
- **:4865.** DFLT_STEP_WORDS keeps its shape, n → words, because round 2's madeOf reads it so. Add `DFLT_STEP_STANDS = new Set(rows with r[2] === 1)`.
- **:6095, stepOwn:** `DFLT_STEP_WORDS.has(n) && (DFLT_STEP_STANDS.has(n) || dfltTodayBare(word))`.
- **Pairs.**
  - kqPlace (:5848-5866) and kqPickG's branch for several words (:5901-5921) take STEP's words at a stands pair under STEP, backing the read half. STEP's own marker is =Q(K) or =Q(k) at all 6 pairs.
  - At Lamentations 4:3:10 the backing moves from the ketiv group to the qere (§10, put-back 7).
- **The halves.** Round 2's dfltAcross gains: `(defaultAtWord(w) || {}).src === d.src || (d.src === "step" && placeLine(w))`. Only II Samuel 6:10:16 needs it; r13 found it reaches no other of the 1,015 places where STEP's words may print.
- **:6187 and :15776-15783.** The chip says «STEP's own reading at this place, where STEP spells or parts the word otherwise». The STEP pill's title drops «only where today's line was bare» at those places.

**Round.** The defaults step, then records and lines, then the defaults again with `--receipt-only`. It converges, because the stands do not read the records (the code review agrees).

**What moves** (call4-on-ship-records-v1, on the combined ship's records)
- Of 785: 353 are unchanged; **26** change credit only; **402** change words; **3** appear where none stood (Ezekiel 6:3:15, II Samuel 18:8:4 and Psalms 145:6:4, all pairs); **1** is inside a run (II Samuel 6:10:16). **432 lines move.**
- The credits of the 402 replaced lines: M14 190, M4 123, M9 32, M25 19, M3 16, M5 4, M11 4, M17 3, M18 3, and 7 more.
- By book (unchanged / credit only / replaced / appear / in a run, then the total that moves): Amos 2/0/1/0/0, 1 · Daniel 31/5/25/0/0, 30 · Deuteronomy 13/0/26/0/0, 26 · Ecclesiastes 5/0/5/0/0, 5 · Esther 7/2/7/0/0, 9 · Exodus 10/1/14/0/0, 15 · Ezekiel 30/0/17/1/0, 18 · Ezra 8/0/4/0/0, 4 · Genesis 10/2/7/0/0, 9 · Habakkuk 0/0/2/0/0, 2 · Hosea 2/1/3/0/0, 4 · I Chronicles 12/3/11/0/0, 14 · I Kings 14/0/9/0/0, 9 · I Samuel 13/0/11/0/0, 11 · II Chronicles 15/1/16/0/0, 17 · II Kings 10/3/17/0/0, 20 · II Samuel 9/2/12/1/1, 16 · Isaiah 13/0/22/0/0, 22 · Jeremiah 21/0/23/0/0, 23 · Job 13/0/26/0/0, 26 · Joshua 6/1/5/0/0, 6 · Judges 18/1/13/0/0, 14 · Lamentations 6/0/8/0/0, 8 · Leviticus 7/0/7/0/0, 7 · Malachi 1/0/2/0/0, 2 · Micah 1/0/2/0/0, 2 · Nahum 2/0/3/0/0, 3 · Nehemiah 11/1/12/0/0, 13 · Numbers 10/2/18/0/0, 20 · Proverbs 13/0/22/0/0, 22 · Psalms 30/1/34/1/0, 36 · Ruth 3/0/5/0/0, 5 · Song of Songs 3/0/9/0/0, 9 · Zechariah 3/0/4/0/0, 4 · Zephaniah 1/0/0/0/0, 0.

**Checks**

`check-default-picks-v1`:
- Its second road (:362-392) derives stands too.
- **D3** (:802-845) counts the stands from the pinned list, the index and the zones, never from the records.
- **D5** (:895-935) **and new D21** judge a record only where its `read_off.files` names the sha256 of the index being checked; any other record is counted, not judged.
  - D21: at each stands place, the record draws STEP's words as the line draws them, under M4, whatever today's line was.
  - D5 stops counting a stands place as «other» or «drawn otherwise».
  - Why: in the round's defaults step the records are the previous round's, read with the old index (amos's record names 013fa911…). D21 judges none of them there and says so. In the lines step, after the records are read again, it judges all 39.
  - As first written, D21 would have stopped the round at its defaults step (round-v1.sh:195-200).
  - D21 holds vacuously on add346d851, whose index has no stands. A10 is the law that fails today.

`check-audit-calls-v1`, new **A10:** the index's stands are exactly the category (785), with 46 held, 8 none and 14 v192, each by its class.

The gate's class (a) is in §8.

---

## 4. Call 3: a run reads its words

**Rule id:** `run-reads-its-words-rule-v1-a-run-whose-every-word-has-its-own-reading-at-the-place-reads-word-by-word-the-joined-reading-a-press-away`

**Rests on:** question 8, taken: «each word of a run of several words shows its own reading, and the joined reading («Monday», «the Jewish people») is a press away». And «an example names a class».

**The rule.** A run keeps its joined line only where some word of the run has no reading of its own at the place.
- A word's own reading is its place pieces (placeLine) or a call-4 stands place.
- Marks are set aside: a bridged paseq is in `__words` (appendWord, :13521).

**Data.** Pin v181's `lines-over-several-words-v1.jsonl`:
- 384,463 bytes, sha256 12228dc4e7ab9566f3c809500ccc63aeece0f0244480644fc2a779509b0d778a, 2,177 lines;
- in PIN.json as `call3_lines_over_several_words_v181`, read through readPinned (tools/pinned-v1.mjs:33).

**Page (zone.html)**
- Beside runTakesDefault (:6163):
  ```js
  runReadsItsWords = (run) => run.__table == null && run.__words.filter((w) => !w.mark).every((w) => placeLine(w) || DFLT_STEP_STANDS.has(WORD_N.get(w)))
  ```
- :12172, the span branch: add `&& !runReadsItsWords(run)`.
- :12186, the whole-form branch: use the same test in place of its own `every(placeLine)`.
- chainReadsWhole (:8743): the same test, before the span check.
- :9836-9842: the run card opens on the as-written rung only where the run's line reads it whole; otherwise it opens on the pressed word.

**What moves** (the call-3 reader, on the combined ship's records, with call 4; reproduced by r9)
- **2,153 runs over 4,353 words fall:** 456 keep their letters and change only credit and drawing; 1,697 change their words.
- By source: English Wiktionary 1,599/3,220; SDBH 329/667; BDB 83/166; TBESH 61/137; UBS 24/48; Strong's (OS) 18/36; Lexical Index 17/34; Aramaic Wiktionary 14/28; ETCBC 5/11; STEP's expanded Strong 3/6.
- **5 runs over 10 words are held:**
  - Daniel 1:13:8-9 and 1:15:14-15, «food» (SDBH);
  - Jeremiah 39:3:9-10 and 39:3:17-18, «Nergal-sar-ezer» (TBESH);
  - Song of Songs 6:12:6-7, «Amminadib».
- 338 chain-book cards open on the pressed word.
- The records' `lines_over_more_than_one_word` → 5. The default picks receipt's `runs_read_whole` → 5 lines over 10 words, its «what» restated (bake-default-picks-v1.mjs:1199-1201).

**Checks**
- Restated: check-span-store-v1 S2 and S3; check-run-line-follows-division-v1 D1; check-default-picks-v1 D7's text; check-card-opens-on-the-line-v1:117.
- New **A11** in check-audit-calls-v1: each of v181's 2,177 lines is either word by word in the records, each word with its own line, or held over exactly its words with v181's text and credit. That is 2,172 and 5. Fails today: 2,158 read whole. r14 confirmed the 5 held carry v181's own text and credit.

---

## 5. Questions 11 and 12

**Question 11.** «Recommended: print as ruled until a source's own fact separates them.» No change.

**Question 12**
- **Rule id:** `pointer-one-pill-rule-v1-a-pointer-whose-resolution-prints-as-another-reading-of-the-card-is-that-readings-pill-the-pointer-beside-it`.
- **Rests on:** the answer «153 pointer pills now print the same English as another reading on the card … *Recommended: one pill.*», the house's rule of one reading, one pill, and the page's pointer rule: «the pill stays the pointer's own row … The page prints the English with the pointer beside it, on the pill and on the line» (zone.html:3647-3651).
- **The fold, in poolFor** (:8370-8380, once FORM_OF is here). A group whose every record is a pointer row that resolves (formOfResolves, :3687, with the names-held flag) joins the group whose drawn text is the resolution's.
- **What the one pill prints:** the reading with the pointer beside it, exactly as a pointer pill prints today (formOfSays, :3694), e.g. «mighty, valiant (plural indefinite form of אביר)».
  - So the owner's display («twelve (feminine of ...)», :11504-11506) stays on the pill's face.
  - No word is added to the face.
- **The pill's attributes:**
  - `data-by` names every carrier, the reading's rows and the pointer's, since both stand behind what the pill prints;
  - `data-pointer` carries the pointer's own text;
  - `data-pointer-by` carries the pointer rows' sources, apart from the carriers.
- **Switching sources off:** with the pointer's source off, the plain reading is left; with the reading's source off, the pointer pill is left, as today.
- **The alias.** The merged group also answers to the pointer's own reading key. So a card whose line is the pointer's text still opens on its pill: o.l at 24 surfaces and the table at 1 key (r5).
- **The reach.** The fold reaches every pointer pill whose resolution prints as another reading of the card, whatever that reading's source.
  - That is wider than the lane's 153 at 14,995 places, which counts only a row of the same source (specs/v191-pointer-map.md:187).
  - Upper bound on the keys the 39 books ask: 805 pills at 664 keys, 56,455 word-key asks, before the place gates (r11). Over every key: 806 at 665 (r5).
  - The build counts it; F12 is a rule, not a count.
- **The fold runs on every page, the Tikkunei Zohar's cards included.** It moves no line, and it is the house's own one-reading-one-pill rule, which already runs everywhere. Not measured on the Tikkunei Zohar; said to the lead.
- **Where the rule id is recorded.** In data/form-of-pills-v1.json. Its bake (tools/bake-form-of-pills-v1.mjs) moves to `form-of-pills-rule-v3-…` and writes `one_pill: {rule, counts over the store at rest}`, so the gate can read it (§8).
- **The map arrives after the first paint,** so a card drawn before it is rebuilt when it lands, as the lines are.
- **Check:** check-form-of-v1, new **F12**.
  - No card prints a pointer's resolution and the same reading of another row as two pills.
  - The one pill shows the pointer (`data-pointer`) and names its rows apart (`data-pointer-by`).
  - The card opens on its line where the line is the pointer.
  - Fails today.
- **Lines: 0.**

---

## 6. Ship 6: v187, words back

**Rule ids**
- `row-strike-rule-v7-…-a-retext-from-words-back-keeps-the-rows-closes-and-facts`;
- `row-strikes-follow-rule-v2-…-a-retexted-row-is-followed-to-its-new-words`;
- `words-back-landing-rule-v1-the-lanes-words-back-land-by-key-and-rank-held-where-the-printed-text-sets-a-hebrew-character-against-a-latin-letter-or-a-digit`.

**Rests on:** the owner's «just push the ledgers we did live»; questions 17 and 18, taken. The seam hold rests on «an example names a class»: the plan named five rows, and the class they stand for is a Hebrew character set directly against a Latin letter or a digit.

**What lands.** The seam census over v187's final list (the v187 reader's m1b-seams.mjs; reproduced by r8 and by words-back-seams-v1) finds 11 rows. The words-back RULE.md (dl-v195/v187/…/words-back-v1/RULE.md) names the two mechanisms:
- **8 seams sit inside words_back,** by its :25 (a piece's own tags read as nothing): 5 done (יהורם 13, נבל 83, שבט 48, ארבעים 10, גנזים 5) and 3 settled (יהורם 11, חשתי 6, נפש 117).
- **3 seams are made by a close,** by its :23 (a tag between a piece and its neighbor with no whitespace closes): all done. They are אחר 71 «מֵאַחֲרֵי57», טרם 7 «בְּטֶרֶם39» and יהוה 24 «יְהוָֺהC518».
- **All 11 are held whole.**
  - The 3 close-made rows could land with the one seam-making close held. But that would print a space our build made where a tag stood, which made-spaces-rule-v1 closes at print.
  - Applying the close prints the seam.
  - Neither is the lane's row, so each waits on put-back 6.
- **740 land: 512 done and 228 settled.** Question 18's 231 settled openings, less the 3 settled seams.
- **The 38 held rows stay notes with gaps** (question 17).

**Figures** (words-back-recount-v1, a design copy of the reader's m2-recount.mjs with the hold widened, against store ccec4fa3071b)

| | 512 done | 228 settled |
|---|---|---|
| rows with closes / closes | 59 / 103 (88 carried, 15 added) | 29 / 37 (29 carried, 8 added) |
| pieces put back | 686 | 594 |
| rows carrying `n` | 503 | 228 |
| rows with ledger cuts now | 2 | 3 |
| v178 made-spaces lines that lose rows | 53 (all 53 then unserved) | 25 (25) |
| v178 words-taken-out lines that lose rows | 489 (450 then unserved) | 219 (200) |

The build's tools recount the default picks references and the BDB ledger's uncovered texts for the 740.

**Data.** Pin `data/made-spaces/words-back-v1/`:
- RULE ab551ae3…;
- words-back-final f03fa594… (789 lines);
- in-921-lost-none 0ed92496… (132 lines);
- the 4 receipts.

`tools/derive-words-back-v1.mjs` (new) runs the seam rule over the whole list, proves every line again on the store, and writes `retext-v1.jsonl` (740 lines) and `held-v1.jsonl` (49 lines: 11 seams, 38 held). Both are pinned.

**Tools**
1. **`tools/strike-rows-v1.mjs` → rule v7.**
   - The whitelist (:194) accepts `from_slot: "words_back"`.
   - The retext (:360-377) refuses unless:
     - slots 1 and 2 equal the old route;
     - slot 9 equals the line's closes;
     - the sense mark equals the line's entry;
     - the closes are spaces of words_back, rising;
     - the printed text equals `closed(words_back, closes)`.
   - It then writes slots 1 and 2 = words_back, slot 9 = [closes, closes] or null, clears slots 7 and 8, keeps slots 0, 3–6 and 10, and records the old row whole.
   - No fold occurs.
2. **`tools/row-strikes-follow-v1.mjs` → rule v2.** It answers `retexted` with `[key, rank, m, sha16(new text)]` and follows back the other way. The reader's prototype answered all 515 from both read versions. Its consumers:
   - apply-sense-openings-v1 (:139-142) keys by the followed text;
   - apply-row-entries-v1 (:195-198) names by the new sha16;
   - bake-default-picks-v1 accepts `retexted` at :465, and at :469 prints `routePrinted(found[0])` as :447 does (the code review confirmed this fix);
   - made-spaces-second-road-v1 (:98, :345) takes a retexted row off its old texts.
3. **`tools/apply-made-spaces-v1.mjs`** (:269, :278, :283): a retexted row takes its closes from the derived list by key and rank. Count those closes apart.
4. **`tools/project-lattice-v12-v1.mjs`** (:288-296): the binyan file names rows by their old text. Follow each through the retext to the new text, so the page's lookup by the current text (zone.html:8229) finds its stem.
5. **apply-name-rows-v1** runs again with no change.

**What moves.** Nothing at rest: 0 lines and 0 pills. The 740 notes print BDB's words back. BDB's default line prints the ledger's slot 5, so it does not move.

**Checks.** New `tools/check-words-back-v1.mjs`:
- **W1:** the pins.
- **W2:** each retexted row has words_back in both slots, slot 9 as given, slots 0, 3–6 and 10 byte for byte, and its note's text equal to the printed text.
- **W3:** the round records each old row whole, with no fold.
- **W4:** the 49 held rows are unchanged.
- **W5:** the other v174 rows are unchanged.
- **W6:** the v178 falls are meets-v1.json's less the held rows: 53 + 25 and 489 + 219.
- **W7:** the follower answers `retexted` from both read versions.
- **W8:** the sidecars' stems name the new texts.

W1-W3 and W6-W8 fail today. **W4 and W5 pass today**, since nothing has been retexted yet; they guard the untouched rows after the build.

Amended:
- check-audit-calls A9 (:291-292);
- check-sense-openings O3 and O4;
- check-entry-gate (:190), E3 and E5;
- check-default-picks D2 (:749-752) and the receipt's account (:773);
- check-made-spaces M3, M5 and M6;
- check-ledger-divisions D3, plus one law: every uncovered row is a sense-mark row.

---

## 7. The round, in order

**Store steps.** These run before the round and are not run by it (round-v1.sh:48-69). They form one script, `ship56-store-steps.sh <tree> <moment>`, on the model of S/v64/steps/ship4-store-steps.sh:
- each step runs `--dry` first, with its figures compared to the ones below, then for real with `--on`;
- the script prints the sha256 of every file it wrote;
- heaps are capped (the v187 reader's OOM incident).

Ship 5:
1. `derive-ubs-collocations-v1`: 2,649 rows.
2. `apply-ubs-collocations-v1`: 2,649 rows gain `collocations` and 2,643 gain `picked_at`.

Ship 6, droppable as a block:

3. `derive-words-back-v1`: 740 to retext, 49 held.
4. `strike-rows-v1` (v7) with the retext list: 740 retexted, 0 folded, routes 651,752 and keys 122,496 unchanged, a new store version.
5. `apply-ledger-divisions-v1`: slots 7 and 8 derived again for the retexted rows.
6. `apply-source-years-v1 --dry` (expect 0), then `apply-made-spaces-v1`: slot 9 on 88 rows with 140 closes.
7. `apply-row-entries-v1`: 0 moved.
8. `apply-name-rows-v1`: 0 rows.
9. `apply-sense-openings-v1`: all 2,008 lines found, 0 moved.

**Then `tools/round-v1.sh --stamp <date> --lattice … --stems … --stems-extension … --default-picks …`** with every step:
- **zones:** the witnessed bake with its refusal; regloss under v8 at rest with the stamp; the commentaries; the lattice with firstUnder, hg, the stamp and the stems followed; the read words.
- **stamps.**
- **search:** the UBS fact rows leave the index.
- **defaults:** call 4's stands. D21 counts the previous round's records here and judges none.
- **records.**
- **lines:** round 2's `compare-resting-lines-v1 --before HEAD`, then the receipt-only pass of the defaults, where D21 judges all 39 records.
- **chain**, which reads every chained book's cards again.
- **door:** pipeline-manifest-v1 writes the manifest again.

No new round step is needed; every new rule rides an existing step.

---

## 8. The gate, and the all-lines comparison

**The gate:**
```
node tools/check-same-product-v1.mjs --old <live> --new <built> \
  --expect data/default-picks/index.json --expect data/dictionary-kinds-v1.json \
  --expect data/audit-calls/PIN.json --expect data/form-of-pills-v1.json --diff build/ship56-gate.diff
```
- **Teaching the gate the new files.** The gate refuses an `--expect` file whose rule_id it does not know (:103-112). It learns two:
  - data/audit-calls/PIN.json gains `rule_id: "audit-calls-landing-rule-v1-…"` and `landings` entries for calls 7, 4 and 3, each naming its rule id;
  - data/form-of-pills-v1.json moves to form-of-pills-rule-v3 and carries `one_pill`.
  - Anything else is still refused.

**Owed classes**
- **(a) Stands** (the default picks index, its third element).
  - At rest: the new line is `drawnStep(words)` under M4, whatever the old line was.
  - Under MACULA, UBS or BDB pressed: owed only where the pressed source has no line at the place and its second source is STEP, because defaultAtWord prints the pressed source's own line where it has one (zone.html:6085-6108).
  - Said in the diff as `stands:`.
- **(b) Strong's sign** (call 7's landing).
  - On S1: a piece of the old line opens with STRONG_SIGN (imported from gloss-store), the same piece of the new line does not, and a row under the word's keys in the new store prints the new text.
  - On S2: the lost pill is the old line's signed reading, and the pressed pill moves with the line.
  - No other pill is newly hidden, now that the bracketed shape is out.
- **(c) Runs** (call 3's landing, with v181's pinned list).
  - At rest, a word whose old line was one of v181's run lines now reads its own place pieces as the page draws them, or the stands words, under its chip.
  - Under a pressed source, a word of a run that falls may read anything but a run line.
  - S2 owes the first cards of such words, opened on the word.
- **(d) UBS collocations** (the kinds record). S2 is tightened.
  - Today a lost pill passes when every carrier is in `SHUT ∪ FACT_IDS` (:495). With M18 in FACT_IDS, that would excuse any lost UBS pill.
  - Instead, ask `stoodShut` with the card's place: a fact-family carrier must carry the reading only in rows that rest shut at that place, so a question-10 place still owes the pill.
- **(e) The pointer fold** (the form-of record's `one_pill`). A card may lose a pointer pill where its resolution is the English of another pill on the same card. The pill that stands must show the pointer (`data-pointer`) and name the pointer's rows (`data-pointer-by`).

**The all-lines comparison.** Round 2's `compare-resting-lines-v1` lists the moved lines. The lead's classifier `S/v76/lines-compare-v2.mjs` → v3 learns three classes, tried in this order before the existing ones:
1. **`steps-reading-stands`:** the place is a stands place of the new index, and the new line is STEP's words under M4. Expect 431, plus 1 inside a run.
2. **`runs-read-their-words`:** the old unit spans more than one entry; in the new record each of its entries stands under a line of its own; every non-mark word has pieces that print or is a stands place. Expect 2,153, with 4,353 «(its words)».
3. **`strongs-sign`:** a piece of the old line opens with STRONG_SIGN, and the same piece of the new line, printed by a row under the word's keys in the new store, does not. Expect 1 (Job 1:21).

`kinds-shut` meets the UBS entry through the new record by itself (expect 0). A `words-back` class (expect 0) catches any line whose text is a retexted row's old or new text. Unexplained must be 0.

---

## 9. The order of commits

Ship 5 first:
1. **Pins:** v181's list; the audit-calls PIN's `rule_id` and its landings for calls 7, 4 and 3; data/ubs-collocations/PIN.json.
2. **The UBS kind:**
   - the derive and apply tools and the FACTS_SLOT doc;
   - the record and the module with `stands_at`;
   - the page's copy, placeOf and the five sites;
   - check-dictionary-kinds K1, K2, K4 and K6; check-audit-calls A12;
   - the gate's S2 tightening and class (d).
3. **The sign:**
   - gloss-store's predicate, `signLast` and GLOSS_RULE v8;
   - regloss's scope and stamp;
   - the projector's scope, stamp, firstUnder and hg;
   - the witnessed bake's refusal (rule v2);
   - the page's STRONG_SIGN, signsLastOn and signLast;
   - check-sign-does-not-lead-v1, with check-witnessed-order and check-lattice-projection amended;
   - the gate's class (b);
   - the GUARDS of §1: check-antiquity-tier-v1:3, check-gloss-whole-v1:5, check-ledger-divisions-v1:4, check-page-agrees-with-store-v1:15, zone.html:8023, and the witnessed rule's four files.
4. **Call 4:** the bake; the page's stands, pairs, halves, chip and title; check-default-picks D3, D5 and D21; check-audit-calls A10; the gate's class (a).
5. **Call 3:** the page's test and its three branches; the restated checks; check-audit-calls A11; the bake's receipt text; the gate's class (c).
6. **Question 12:** the page's fold and alias; bake-form-of-pills v3 with `one_pill`; check-form-of F12; the gate's class (e) and its rule id.
7. **PIPELINE.md** for ship 5.

Ship 6 last:

8. **Pins:** data/made-spaces/words-back-v1/.
9. **The follower's `retexted`** and its consumers: apply-sense-openings, apply-row-entries, the bake's :465 and :469, the second road; with check-audit-calls A9, check-sense-openings, check-entry-gate, check-default-picks D2 and check-made-spaces. GUARDS move at row-strikes-follow-v1:2 and :112 and check-entry-gate-v1:4.
10. **strike-rows v7,** derive-words-back-v1 and check-words-back-v1. GUARDS move at strike-rows-v1:2 and :163, check-fold-strike-landing-v1:4, check-audit-calls-v1:4 and check-store-continuity-v1:4.
11. **apply-made-spaces,** and the projection's stems followed through the retext.
12. **PIPELINE.md** for ship 6, including :108's retext refusal.

Then:

13. **Generated:** the store steps (§7), then the round's outputs, the manifest included. One commit, after the gate.

Then main, the merge into gh-pages with the message «gh-pages follows main», both pushed, and check-live-v1.

To drop ship 6: drop commits 8 to 12 and store steps 3 to 9.

---

## 10. Held, and put back to the corpus lane

**Held**
- 46 « | » places; 8 `none` places; 14 v192 places carried by v192's pieces.
- 5 runs over 10 words.
- 7c unchanged. 7d held, as the lead ruled.
- Call 7a's 306 «(» lines, the 80 that hold the sign alone in a bracket among them.
- The sign rule beyond the 39 books.
- 47 UBS rows that are also plain meanings; 425 UBS name rows.
- v187: 11 seam rows and 38 held rows.
- Question 3's 157 words.

**Put back**
1. **The sign category.** The source-signs ledger v1 counts Strong's sign at the head only (STRONG_SIGN). The M14 declaration's `open_paren.holds_sign_alone` (declaration.json:424-428, count 83) names a bracket that holds the sign alone on the word after it.
   - Please reconcile the two: does the sign category hold «(+) archer»? On this store that is 80 readings of 7a's 306 lines, and 1 M9 rendering, גדול r61 «(×) very.».
   - Also: is «X» MACULA's own sign at ו r110 «X and» and r113 «X also», which the ledger counted under STRONG_SIGN?
2. **The 46 « | » places:** which words are STEP's line, and how « | » is drawn.
3. **The M9 ledger leaves 4 lists whole:** אשר r166, יעל r53, עבד r175 and שתה r43, with 52 renderings with no sign at the head among them (m9-whole-lists-v1). Divide them, or say why whole. Today the signs switch hides each one whole, and אשר's list is on the card at up to 4,836 word places at its own key, plus 718 at a piece's key (whole-list-places-v1).
4. **BDB's ledger:** shapes for Hebrew points, or a line saying a sense-mark row is outside it.
5. **UBS's collocations per row (Ask 2),** to replace the derived list. And tie the rows of M17 (the SDBH as HiperBiblia gives it) to the UBS file's meanings.
   - M17's own records end «UBS Dictionary of Biblical Hebrew © United Bible Societies, 2023. Adapted from Semantic Dictionary of Biblical Hebrew». 7d's אבן r6 «to go to the stones of the pit > to die» is the same UBS meaning as 7b's אבן r42 (meaning 000065001005000, collocation ירד אֶל־אַבְנֵי־בֹור).
   - With the tie, the same rule reaches them.
6. **The 11 seams, by both mechanisms:** RULE.md:25's tag reading (8 rows) and RULE.md:23's closes (3 rows: «…57», «…39», «…C518»). Is that how BDB prints them?
7. **Lamentations 4:3:10:** the plan's own put-back on «drawn as STEP draws it» (LANDING-PLAN.md:252). Also: there the backing moves from the ketiv group to the qere.
8. **STEP's reading per word** at the 3 held runs that are not « | » places: Daniel 1:13 and 1:15, and Song of Songs 6:12.
9. **The binyan file keyed by the new texts;** row entries v1.2 and default picks v1.3 by the new sha16 (already asked).

---

## 11. Risks, and the conflicts with toggles round 2

**Risks**
1. **The rule ids.** Gloss rule v8 moves every zone's `emitted_from` rule. Kinds K3 and the gate read those stamps. The GUARDS are listed in §9.
2. **«printed» changes.** On the 39 books, the card under «printed» puts Strong's signed renderings after the plain ones. The chain books are read under «printed» (card-readings-v1.mjs:107-109), and the chain step reads them again.
3. **The UBS kind's card reach is large:** up to 121,941 pills at 17,524 places at the word's key. S2 samples few cards; the page law K4 is the real proof.
4. **The follower v2 touches nine consumers.** A missed one goes red, not silent.
5. **Machine load.** The round with the lattice takes about 43 minutes, and the suite needs `--timeout`. Cap the store steps' heaps.

**Conflicts with round 2.** Read from `git diff --stat add346d851 0b8d555d12` in S/pt, and from design/round2-zone.diff, the earlier cut, checked against the branch for the names it rests on.
- **tools/gloss-store-v1.mjs:75-84.** Round 2 writes SIGN_GAP and signOnly as escapes. Take its lines first; the predicate, `signLast` and the store option go beside them.
- **tools/check-same-product-v1.mjs** (87 lines changed). Round 2 imports SIGN_GAP, signOnly and signsOff, makes the ready wait a fault, and adds data-wn. Ship 5 adds the two rule ids, classes (a) to (e) and the S2 tightening. Merge by hand, with one import line.
- **tools/check-default-picks-v1.mjs** (310 lines changed): units once, D5 neighbors, D7 w5, D20. Ship 5 touches D3, D5 and D7 and adds D21. Build on top of round 2.
- **zone.html, the default layer.** Round 2 adds dfltAcross, dfltApartUnit and dfltUnitHeld. Call 4's halves edit goes into dfltAcross. Round 2's madeOf reads `DFLT_STEP_WORDS.get(n)` as words, so that Map keeps its shape.
- **zone.html, refreshJoinGloss.** Round 2's unit-once parts sit in the parts loop; call 3 edits only the span and whole-form branches above it, and the two compose. Round 2's placeWho is apart from call 3's run-card opening.
- **tools/resting-lines-v1.mjs and tools/round-v1.sh:** round 2's changes stand, and ships 5 and 6 add nothing to them.

---

## Measures

**Mine, all in `S/v77/ship56-design/design/`**
- `ubs-and-bracket-reach-v1.mjs` → `.out.json`, `.log`.
  - Reads UBS's file and route file (call7-signs/dl-ubs), the ship's store, the default picks ledger v1 with its rows tables, and the 39 zones.
  - Gives: the UBS category (2,649; 425 names; 47 plain); the readings that leave a pool (2,661); question 10's references (16,299 at 8,252 places; 5,951 pairs) and the index alternative's bytes; the bracketed sign (81 readings, 61 keys, 7,739 word places, now only for the lead's question); the sign's reach (M14 15,605, M9 751, M3 2).
- `ubs-kind-card-reach-v1.mjs` → `.out.json`, plus `.only7b.out.json` with `--only-7b`.
- `call4-on-ship-records-v1.mjs` → `.out.json`.
- `signed-lines-on-ship-v1.mjs` → `.out.json`: 1,885 head-signed lines (14 Bible, 1,871 Tikkunei Zohar) and the Tikkunei Zohar's 309 keys, now only for the lead's scope question.
- `words-back-recount-v1.mjs` → `.out.json`.
- **New:** `witnessed-refusals-v1.mjs` → `.out.json`. It reads S/old/reader: the zones, the store opened whole and at rest, and data/witnessed-orders-v2.7.
  - Gives: 2,453 refusals (entry-and-lists 2,451, same-place 1, entry 1) on 2,451 keys.
  - 0 rows that also hold a plain reading; 0 entries kept because every reading is signed.
  - About 10 seconds under nice.
- **New:** `peek-record-v1.mjs`, which prints a record's units. It read Nehemiah 2:13 and Job 1:21 on S/old's records.
- `round2-zone.diff`.
- The first-draft scripts read `S/ship/reader`. To rerun them, point them at `S/old/reader`, the same commit.

**Taken as the reviewers measured them**
- The code review (`review-code/`): r1, r2 and r3 (hg 257 words / 105 keys; leaders), r5 and r11 (question 12: 806 / 805), r6, r7 (46 license leaders), r9 (runs), r10 (7e 5,134 / 33 / 55), r12, r13, r14, r15b (Targum sidecars: 719 keys, 627 words).
- The faithfulness review (`review-faithfulness/`): call7a-grain-v1 (80 + 222 + 4 = 306), m9-whole-lists-v1, whole-list-places-v1, ubs-marked-classes-v1, ubs-collocation-shapes-v1 (154 / 35), b7-names-v1, ubs-set-lines-v1, signed-pieces-v1 (0 later pieces on the ship), bible-signed-vs-call4-v1, words-back-seams-v1.
- The readers: call 7 (baked-signed-leaders: live's leaders; census-signed-lines), call 3, call 4 (m13), v187 (m1b, m2, m4b, m4c).

**Still to be measured in the build**
- How many of the 257 headword words step past a signed card.
- The UBS kind's pills after the pointing and stem gates.
- Question 12's fold on the build's store, and on the Tikkunei Zohar's cards.
- The 740's default picks references and BDB-ledger uncovered count.
- Words that change under MACULA, UBS and BDB pressed (call 3).

---

# (2) Every finding, and what I did with it

| # | finding | checked | what I did |
|---|---|---|---|
| R1 | BLOCKING: decision 2 reverses the lead's call on the 306 «(» lines | Right. Today's letter (:18) names «(+) archer» among the 306, and the lead's call holds them out. The 81 readings are 80 M14 inside 7a plus 1 M9 rendering outside it (call7a-grain-v1, m9-whole-lists-v1). | Decision 2 dropped. STRONG_SIGN is the ledger's head pattern and SOURCE_SIGN[0] stays byte for byte. G1-G4 and gate class (b) use that pattern, with no «plus 6». The 306 stay held. The question goes to the lead with the declaration's evidence. Put-back 1 now asks the lane to reconcile its two documents. |
| R2 | Question 9 is never named | Right | New §2.0, points (a) to (e): switch, card words, facts, reach, headings. |
| R3 | The UBS kind's edges are the design's | Right; RULE.md:73-76 and :130 read | 7b described rightly (UBS's mark read inside v184's English-test pool; the field reaches 3,121 rows). The 47 named as a departure from RULE.md:76 and amendment 4. The names rule quoted exactly, with 7b's 7 name rows. The 154 and 35 named. Fact renamed `collocations`. All asked of the lead. |
| R4 | 4 of the 136 whole lists are read whole | Right | Named, with the 52 renderings and אשר's reach. The switch already hides them whole. Put back to the lane (put-back 3). |
| R5 | Decision 1 decides a Tikkunei Zohar scope the lead has not ruled | Right; the kinds' ruling reads «keeps today's rest exactly» | The sign rule is scoped to the 39 books and their lattice sidecars, by a stamp. The Tikkunei Zohar, the Targum sidecars and the fixtures keep today's order. Put to the lead with the examples. |
| R6 | Question 12's fold drops the pointer display and credits the pointer's source | Right on both counts | The one pill prints «reading (pointer)» as a pointer pill does today; `data-pointer-by` sits apart from `data-by`; F12 checks both. Not taken: the word «also», which would be a new page word on the pill's face. |
| R7 | G3 and the census test only a line's head | Right. On S/old's record, Nehemiah 2:13 now reads «they + were broken down»; later signed pieces on the ship: 0. | G3 and gate class (b) test every piece. The lead's example is reported. |
| R8 | Which sources the predicate reaches | Right; the ledger's own json lists M3 2 and M46 3 under STRONG_SIGN | Scope stated: unscoped by source, as the ledger is. M3's 2 named; M46's 3 no longer open with it. STEP's brackets and MACULA's ~ are outside, by the lead's call. M3's «X» put back. |
| R9 | The search drops rows question 10 keeps | Right (bake-search-index-v1.mjs:237, :290, :328) | Said. Put to the lead; no search change in this ship. |
| R10 | 7d's mark is in the same dictionary's file | Right: 7d אבן r6 is the same meaning as 7b אבן r42 | 7d stays held, as the lead ruled. Put-back 5 now asks to tie M17's rows to UBS's meanings. |
| R11 | The v187 seam hold | Right on both points | Rests on «an example names a class». The two mechanisms are cited as RULE.md:25 and :23. The 3 close-made rows stay held whole; landing them with the close held would print a space our build made. |
| R12 | Wrong cross-reference | Right | Lamentations 4:3:10 now points to the plan's put-back (LANDING-PLAN.md:252), put-back 7. |
| B1 | The witnessed mend changes nothing | Right. My recount on add346d851 with the head pattern: 2,453 entries, 0 rows with a plain reading (witnessed-refusals-v1). | Typed refusal; the key reads the base table. G4 restated. The receipt counts refusals. check-witnessed-order follows. Rule v2. |
| B2 | D21 stops the round at its defaults step | Right: round-v1.sh:195-200, and amos's record names index 013fa911… | D21 and D5 judge only records whose read_off names the checked index's sha256, and count the rest. D3 never reads the records. |
| S1 | Under «printed» the line moves and the card does not | Right | Option (a): the sign is in the pool's own order in every position, on the scope. «printed» decides drawing and offering. Option (b)'s cost goes to the lead. |
| S2 | hg is outside rule v8 | Right (r2: 257 words, 105 keys) | hg steps past signed cards in the stack's own order; the gates apply to the candidate; G2 covers hg. |
| S3 | G2 must name each column's pool | Right (r7: 46) | G2 is written per column pool. The license class stays ahead of the sign, said and put to the lead. |
| S4 | The kinds count under «open» is given no place | Right, and two more sites: kindPick :10243 and the dotted edge :11519 | The place is passed at all five sites. K4 also tests with the switch open. |
| S5 | placeOfW and picked_at need one key | Right: dfltPlaceSaid gives the title, BOOK is the slug | Key defined as `"<slug> <c:v:w>"`, and the page builds it the same way. Null for runs and for opts.word. |
| S6 | A12's 7e clause is red after the build | Right (r10) | The clause holds for the 5,134 lines that name a row of the category; the other 88 are named by class. |
| S7 | Gate class (a) must follow the source pressed | Right (zone.html:6085-6108) | Restated per state. |
| S8 | Class (b) does not owe the newly hidden bracketed pills | Right of the first draft | Moot: decision 2 is dropped, so no pill is newly hidden. |
| S9 | The gate refuses the two new --expect files | Right (:103-112) | The gate learns two rule ids. The form-of record moves to v3 and carries `one_pill`. |
| S10 | Question 12's reach is about five times the figure carried | Right (r11: 805 vs 153); the 153 counts the same source only | F12 and class (e) are written as rules, not counts. The alias added. Both figures carried. |
| S11 | Rule ids move without their guards | Right | Each file named in commits 3, 9 and 10. The manifest is written again at the door. |
| N1 | W4 and W5 pass today | Right | Said in §6. |
| N2 | The derive tool should read picks through the follower | Right | Done. |
| N3 | Scope and search for the UBS entry | Right | Both rules on the 39 books. The search follows the record's entries, and it is said. |
| N4 | Ship 6's commits should come last | Right | Commits and store steps reordered; drop path stated. |
| N5 | The index has no «facts receipts» key | Right | The key is `ubs_collocations`. |
| N6 | Commentary sidecars | Taken as theirs (r15b: 719 keys, 627 words) | Outside the rule's scope with the Targum sidecars; the figure goes to the lead. |

# (3) What stays open for the lead

1. **The bracketed sign.** Does Strong's sign held alone in a bracket count as the sign on the rendering? It covers 80 readings in 7a's 306 lines and 1 M9 rendering, at up to 7,739 word places of the 39 books (upper bound).
   - Evidence for: the M14 declaration's `open_paren.holds_sign_alone`, «opens only a sign set on the word after the bracket» (count 83).
   - Against: the ledger's pattern and today's letter.
   - Built as the call stands; the lane is asked to reconcile.
2. **The sign rule beyond the 39 books.**
   - The Tikkunei Zohar: 1,871 resting lines on 309 table keys would move, 302 keys to Strong's next rendering of the same list and 7 to another source. Examples: «X after»→«appear» (20 keys), «X burn (incense)»→«be male» (10), «X abundantly»→«blaspheme» (10).
   - The 21 Targum sidecars: 719 table keys, 627 words (r15b, an upper bound).
   - Held at today's order, as the kinds are.
3. **«printed».** Under option (a), the card under «printed» puts Strong's signed renderings after the plain ones on the 39 books. Keeping the old order there (option b) needs a baked «printed» column, and other orders would still disagree with their cards under «printed».
4. **License preference over the sign.** At 46 keys (r7), a license class whose only reading carries the sign leads under that preference. Built so because the license choice decides which readings the line may print.
5. **UBS's category edges.**
   - The 47 also-plain rows: a departure from RULE.md:76 and amendment 4.
   - The 154 one-written-word collocations, 35 of them the key's own letters.
   - The fact named `collocations`, not `phrase`.
   - 7 of 7b's rows following the names gate.
6. **One kinds switch.** UBS's collocations open together with the word lists and Wiktionary's names; they get no switch of their own until the headings-by-kind ship.
7. **The search and question 10.** The search leaves the 2,649 rows out, open or shut, even at the 4,156 places where they stand on the card at rest.
8. **Question 12's reach.**
   - The fold folds every pointer pill whose resolution prints as another reading of the card: up to 805 pills (r11), not only the lane's 153 same-source ones.
   - It runs on the Tikkunei Zohar's cards too, with no line moving.
9. **The headword line.** Up to 257 words step past a signed card within the corpus lane's own stack order.
10. **Held and asked of the lane:** 7d (the M17 tie); the 4 whole M9 lists; v187's 11 seams, with the 3 close-made held whole rather than landed with the close held.
11. **Question 3 (157 words)** stays held; not this ship.

The ship tree S/ship no longer exists. S/old holds main add346d851 cleanly, and it is the tree this design cites. The one new script and its output: /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/design/witnessed-refusals-v1.mjs and /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/design/witnessed-refusals-v1.out.json.