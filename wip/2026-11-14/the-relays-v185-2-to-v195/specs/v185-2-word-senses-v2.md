# v185-2-word-senses-v2

## Verified

FETCHED into /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/dl-v195/v185.2/ (key path kept, 3.2 MB). All 13 files the letter lists (FOR-ELIJAH-v185.2.md:68-80) match both their bytes and their sha256 (13/13 OK). The letter's own sha256 f1db3df4… equals relay_sha256 in ship-v185.2/RECEIPT-ship.json, which was also fetched; the letter does not hash it, as intended. No .mjs was run. Every file was read with python3 -I scripts in my folder.

RE-DERIVED from the files, checked against the served Jastrow overlay in pt/reader/data/overlays/jastrow (store_version d5324f308ef9, the same version the receipt names; 115,918 rows; (key, rank, m) unique). Every figure below holds.
1. Branches (letter §5, :54-60): WORD_SENSE 4,508 rows under 2,261 keys, NOTE_WORDS_ALSO_A_WORDING 15/12, ASIDE_WORDING 565/294.
   - found_by: PLAIN_NOTE 2,026, THROUGH_ITS_CARD 1,078, DEF_FIELD_TWIN 456, ITS_DEF_FIELD 456, NOTE_WITH_MORE 492.
   - The per-m counts equal the receipt's.
   - All 5,088 lines sit in the overlay at (k, rank, m) with the same route and def (0 misses). Every WORD_SENSE prints exactly «word sense, not definition: » plus its route. No line is listed twice.
2. Legend (letter §1, :7-16):
   - legend-cards-v2 has 4,814 lines, exactly the overlay's rows whose def holds "[".
   - ONLY_SENSE_NOTES 3,958 (2,479 by ITS_RECORDS, 1,479 by ITS_CARD); SOME_ASIDE 828 (550 + 278); BY_THE_LIST 0; NOT_MATCHED 28. That gives matched_by 3,029 / 1,757.
   - legend_holds agrees with class on every line. cards-with-an-aside-v2 (828) is exactly the SOME_ASIDE lines. No (k, m, def) group carries two classes.
   - The page's 3,328 legend rows in jastrow-v1.json are all inside the 3,958. The extra 630 split as 606 with one bracket and 24 with two.
   - The page's own rule run on v2's lists gives 3,926, all inside the 3,958.
3. Twins (§2):
   - 456 DEF_FIELD_TWIN rows under 428 keys. Each has twin_of {rank, m}, with the same m, naming an ITS_DEF_FIELD row of the same key and route, and its def equals its route.
   - All 456 ITS_DEF_FIELD rows have exactly one twin.
   - The set is identical to the 456 twins the page inferred and baked into jastrow-v1.json. חכמים rank 33 M39 is the twin of rank 32.
4. v1 to v2 (§4):
   - All 2,974 v1 word senses stay WORD_SENSE.
   - v1 rows that moved: ASIDE_WORDING to NOT_A_BRACKET 3, NOTE_WORDS_ALSO_A_WORDING to NOT_A_BRACKET 8, NOTE_WORDS_ALSO_A_WORDING to WORD_SENSE 6 (חמץ 93, מאס 66, עלם 117, צלח 72, רהיט 23, רפי 21, all with bracketed defs).
   - 1,770 new lines: 1,072 THROUGH_ITS_CARD word senses, 456 twins, 239 ASIDE_WORDING, 3 NOTE_WORDS_ALSO_A_WORDING (נפילין 2, פתיחה 16, רמה 194; each has one NOTE card and one NONE card).
   - The 1,078 THROUGH_ITS_CARD word senses are 780 bare and 298 bracketed. 6 of them were v1 rows. Every one of their cards is NOTE.
   - 3,430 = 2,974 + 456, and 112,488 = 115,918 − 3,430.
5. The 46 (§3): rebuilt from the overlay against v1's list, they come out as 46 pairs over 31 rows. Today those rows are 18 THROUGH_ITS_CARD and 13 DEF_FIELD_TWIN. (The page's letter :26 called them "46 rows"; they are pairs.)
6. Amendment A2 (RULE.md:17): 0 ITS_DEF_FIELD routes equal a piece of the def field outside its brackets.

NOT RE-DERIVABLE from what was shipped:
- the 39 vs 36 line-B figure, because trial-v1/lines-a-b-v1.jsonl was not shipped;
- the catalog figures (v86, 123,798 cards, 6,293 under no served row);
- "5 would be NOTE_WORDS_ALSO_A_WORDING";
- check 6 on v1's 3,430 rows, because those rows carry no cards.

Scripts and outputs are in /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v53/v185-2-word-senses-v2/.

## Landing spec

## v185.2: Jastrow's word senses v2, as the page lane would land it

**What v2 changes against v1 as built (main ace7f07eba)**

| | v1 as built (data/word-senses/jastrow-v1.json) | v2 |
|---|---|---|
| Rows held back | 3,430 under 1,559 keys (2,974 listed, plus 456 twins the page inferred) | 4,508 under 2,261 keys, all listed by the lane |
| Twins | the page's inference loop (bake-word-senses-v1.mjs:125-138) | `found_by` DEF_FIELD_TWIN, the same 456 rows |
| Legend rows | 3,328 under 1,534 keys, by the page's own rule (:144-161) | 3,958 under 1,806 keys, from the lane's list (`legend_holds`) |
| Asides list | 550 | 828 |

- **Rows held back.** 1,078 rows are added, under 702 new keys, and none leaves. Newly held, by source id: M12 484, M39 471, M75 45, M49 39, M65 36, M106 3.
- **Legend.** 630 rows are added and none leaves.
- **NOTE_WORDS_ALSO_A_WORDING and ASIDE_WORDING** go from 26/329 to 15/565. The page does nothing with these branches, so nothing changes for them. The 11 rows that become NOT_A_BRACKET also change nothing on the page.
- **Record size.** A dry run in the record's shape gives 147,838 bytes, against 115,884 today.

**Order**
- v185.2 touches no shard: only data/word-senses/, the record and the search index. It does not depend on v189 call 5, v188, v188.1, v190 or v195.
  - None of v188's 4,252 lines is credited to a Jastrow source id.
  - The record stays valid only while data/overlays/jastrow/index.json keeps store_version d5324f308ef9. Any relay that rewrites the Jastrow shards forces a re-bake, and a new list if ranks move.
- Bake the search index once, after v185.2 and the store relays (v189, then v188) have all landed.
- Land v185.2 **before v193** (Jastrow's default picks). v193 names overlay rows by (k, rank, m) in rows-jastrow-v1.jsonl. Intersect those rows with v2's 4,508 WORD_SENSE rows before a Jastrow default can print a row's words on the line. That file belongs to v193 and was not downloaded here.

**1. Pin the lane's files byte for byte** in reader/data/word-senses/jastrow-word-senses-v2/:
- the files: RULE.md, word-senses-v2.jsonl (5,088 lines), legend-cards-v2.jsonl (4,814), cards-with-an-aside-v2.jsonl (828), legends-v2.json, word-senses-receipt-v2.json, verify-receipt-v2.json;
- a PIN.json in v1's schema (WORD_SENSES_PIN_V1), relay "v185.2", naming each file with the bytes and sha256 the letter gives, plus a `legend_cards` entry;
- no .mjs, as in v1's folder;
- keep jastrow-word-senses-v1/ untouched: v2's RULE.md:3 says "read it first", and the receipt names v1's rule and list.

**2. New tool `tools/bake-word-senses-v2.mjs`**, copied from v1 with these changes:
- **(a) Accepted `found_by` values.** WORD_SENSE rows: PLAIN_NOTE, NOTE_WITH_MORE, ITS_DEF_FIELD, DEF_FIELD_TWIN, THROUGH_ITS_CARD. The other two branches: THROUGH_ITS_CARD or null.
- **(b) Twins.** A DEF_FIELD_TWIN needs `twin_of` naming an ITS_DEF_FIELD row with the same key, m and route, and its own def must equal its route. Each ITS_DEF_FIELD row has exactly one twin.
- **(c) Cards.** A THROUGH_ITS_CARD row has cards; a WORD_SENSE among them has every card NOTE.
- **(d) Rows come from the list only.** The old inference loop stays as a guard that refuses if it finds any unlisted row; it finds 0 on v2. counts.rows = 4,508; counts.twins = 456, counted inside rows rather than beside them. Change the W1/W7 detail strings to match.
- **(e) Legend rows from the list.** Legend rows = legend-cards lines with legend_holds true, each found in the overlay with the same route and def. Refuse if:
  - legend_holds disagrees with class;
  - the 4,814 lines are not exactly the overlay's bracketed rows;
  - the asides list is not exactly the SOME_ASIDE lines.
  
  Retire the page's own rule. It may stay as a cross-check that every row it picks is in the list.
- **(f) Same record shape.** Write the record in the same shape: rows, legend.rows, legend.text, overlay.store_version, prints. zone.html reads only those (:5065-5074, :10503-10504). Set schema WORD_SENSES_V2 and list.relay v185.2.

**3. Record path.** Choose one:
- **Explicit:** write data/word-senses/jastrow-v2.json and update every reader in one commit:
  - zone.html:4228 (fetch) and :4052 (the waits text);
  - tools/bake-search-index-v1.mjs:229;
  - tools/check-search-v1.mjs:204;
  - tools/check-word-senses-v1.mjs:58 (the import) and :316 (W7 reads v1's PIN.json);
  - tools/round-v1.sh:132;
  - PIPELINE-MANIFEST.md:166.
  
  Then remove jastrow-v1.json.
- **Minimal:** keep the path jastrow-v1.json and change only round-v1.sh and the check.

**4. Checks.** Amend check-word-senses-v1.mjs, or copy it to check-word-senses-v2.mjs.
- **W7 (:313-331) turns red as written.** 16 served rows at 8 keys print a listed word sense's words under the same key and m id but are not word senses:
  - חמץ 92/94, מאס 65/67, עלם 115/116, פתיחה 16/18, צלח 71/73, רהיט 22/24, רמה 194/195, רפי 20/22;
  - 8 of them are bare rows listed as NOTE_WORDS_ALSO_A_WORDING;
  - 8 are NOT_A_BRACKET, with a def field different from the route; under A5 they are definitions from another entry.
  
  Amend W7 to pass a row that the list names in another branch, or whose def field is not its route.
- **W3's twin-at-rest clause (:261)** needs the same exemption. Under v2, 22 Jastrow rows at 12 keys can print a held-back sense's reading in blue. v1 as built had 23 such rows at 21 keys and the clause stayed green, so the exposure does not grow.
- **New W8:**
  - the record's rows are exactly the list's 4,508 WORD_SENSE rows, and include all 3,430 rows of today's record;
  - the record's legend rows are exactly the 3,958 legend_holds rows;
  - the twin guard finds 0.
- **W6** follows the record and needs no code change.
- **check-search-v1** gets the path change only.

**5. Round and ship.**
- Run the bake, then bake-search-index-v1: 1,078 more Jastrow rows drop out of search.
- Run check-word-senses and check-search, then the gate.
- Push main, merge into gh-pages with the message "gh-pages follows main", and push gh-pages.

## Depends on

- Jastrow overlay unchanged at store_version d5324f308ef9 (data/overlays/jastrow/index.json). Re-bake if any relay rewrites its shards; if ranks move, the lane must re-issue the list
- Independent of v189 call 5 -> v188 -> v188.1 and of v190 -> v195 for data: v185.2 touches no route-store or overlay shard
- Search index: re-bake once, after v185.2 and the store relays (v189, v188) have landed
- Recommended: land before v193 (Jastrow default picks). Intersect rows-jastrow-v1.jsonl (4,239 rows by k, rank, m) with v2's 4,508 WORD_SENSE rows so a Jastrow default never prints a word sense as a definition

## Moves at rest

Nothing changes for a reader on a first visit.
- Jastrow's overlay rests off (index toggle rabbinic_witnesses, default "off"), so no Jastrow row reaches a card at rest.
- No resting line moves: the line comes from the store (zone.html:3576), and the plain chapter lists do not change.
- The word senses switch still rests off.

With Jastrow switched on:
- **Word-sense count.** The «N word senses, not definitions, held back — show» count rises wherever the 1,078 new rows reach, and fewer blue Jastrow pills print there. Their keys stand on 5,886 words in 42 zones, 2,166 of them in the Tikkunei Zohar (e.g. בצים at Ezekiel 30:9:6). This is an upper bound: the source switches, pointing and stem gates come first.
- **The 6 v1 rows** that were NOTE_WORDS_ALSO_A_WORDING are now held back.
- **Switch on.** Each new word sense prints as its own purple pill. For the 468 bare word senses with no bracketed row under their key, the record card shows the bare words with no bracket and no legend.
- **Eight keys.** At חמץ, מאס, עלם, פתיחה, צלח, רהיט, רמה and רפי, the same words print both as a purple word sense (one of Jastrow's entries brackets them) and as a blue definition (another entry defines them). With the switch off, the card says «1 … held back» while the same words still stand in blue.
- **Legend.** The purple legend on record cards grows from 3,328 to 3,958 rows (1,534 to 1,806 keys). Most legend rows stand behind a bare row that prints first. By my approximation, the number that can print first goes from about 563 to about 679; the page measured 580 for v1.
- **Search** takes 1,078 more Jastrow rows out of the index.
- **Unchanged:** the 11 rows that become NOT_A_BRACKET, and every NOTE_WORDS_ALSO_A_WORDING and ASIDE_WORDING row, stand as served.

v188 does not depend on this relay. Once it lands, 25 of its lines (3 of them only through v2's new rows) land an admitted source's definition with the same words as a Jastrow word sense under the same key, e.g. אפס rank 28 M5 «extremity». They print in blue. That is correct: a row is set apart only on what its own source says.

## Put back to the corpus lane

- RULE.md:23 says "licence pointer". The project writes American English ("license"), and the page keeps this file byte for byte, so only a reissue fixes it. build-word-senses-v2.mjs has the same word. The "centre" in the jsonl files is Jastrow's own text, which correctly stays as it is.
- The rows read through their cards whose branch did not change carry found_by null and cards []. That is 12 NOTE_WORDS_ALSO_A_WORDING and 326 ASIDE_WORDING rows; the receipt counts 338 that 'agree'. The 3,430 word senses from v1 and A1, which check 6 read through their cards, carry no cards either. So neither check 6 nor the kept branches can be re-derived from the list. Examples: חוך rank 4 M12 «to hawk» (def «[to hawk,] to laugh…», legend ONLY_SENSE_NOTES) and מדד rank 75 M12 «to stretch» (def «(b. h.) [to stretch,] to measure.») stay NOTE_WORDS_ALSO_A_WORDING, while their partners rank 5 and rank 76 became NOT_A_BRACKET. Please put `cards` on every row that was read through cards.
- 468 of the 780 bare THROUGH_ITS_CARD word senses, under 456 keys, have no served row of the same key and words that holds a bracket. Example: אבלים rank 8 M39 «dark», card A00154 senses.1. Their record card cannot show the bracket the owner asked to keep. Could each such row carry the note as Jastrow brackets it, with the entry's headword and numeral, beside rid and sense?
- Clarify for the page: under A5, a served row with the same key, m id and words as a word sense can be a definition from another entry. That is 16 rows at 8 keys: חמץ 92/94, מאס 65/67, עלם 115/116, פתיחה 16/18, צלח 71/73, רהיט 22/24, רמה 194/195, רפי 20/22. Only 6 of the 8 NOT_A_BRACKET ones are named in v1_rows_whose_branch_moved; פתיחה 18 and רמה 195 are named nowhere. A short list of 'same words, other entry' rows would let the page's checks exempt exactly these.
- Minor: the trial file lines-a-b-v1.jsonl was not shipped, so '39 of 397 line Bs (36 in v1)' cannot be checked. In RULE.md the amendments run A1, A2, A3, A5, A4.

## Owner questions

- 468 word senses Jastrow brackets in his entry are served as bare words, e.g. «dark» under אבלים. With the word senses switch on, their pill says «word sense, not definition: dark», but the record card can only show «dark», with no bracket and no legend. Should the card name the Jastrow entry and sense the corpus lane read it from? Or should these stay held back until the lane sends the bracket itself?
- At 8 keys Jastrow has two entries with the same letters: one brackets words as a sense, the other gives the same words as a definition (עלם: «to surround, tie up»; also חמץ, מאס, צלח, רהיט, רפי, פתיחה, רמה). With Jastrow on, the same words would print both as a purple word sense and as a blue definition. Keep both, since this is the source speaking (my recommendation), or mark the entry numeral (I/II) on each?
