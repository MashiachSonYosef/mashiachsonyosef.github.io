# Lens: the store's own record of what was removed, and what the store's build drops

15 November 2026. One reader of several; the lead merges. Read only. Live tree: main 857a3dc0fb (store 4d1357b26ca5, 652,954 rows on 124,901 keys, 146 sources). Ship tree: the same records, byte for byte, except the entry ledger (v190).

Paths below are under `reader/` of the live tree unless they begin `wip/` (the notes branch) or `dl-` (the corpus lane's relays in the scratchpad).

## 0. Peru, as the store has it

- The store did not strike Peru. Under the key פרו it holds six rows that say Peru: Kaikki M13 rank 9 «Peru (a country in South America)» (facts `{"name": 1}`), OmegaWiki M32 rank 12 «Peru», rank 15 «Republic of Peru», rank 19 «A country in South America, with capital Lima.», PanLex M42 rank 17 «country in South America», ConceptNet M1 rank 18 «peru».
- The one Peru row the strike record names is ConceptNet's tagged duplicate: round 13, פרו rank 20 M1 «peru (n)», retexted to «peru» and folded into ConceptNet's own row at rank 18. Nothing of Peru left the card by that.
- What takes «Peru (a country in South America)» off the card at Genesis 1:22:5 is the names gate. The store's part is the mark: `data/names/names-v1/name-rows-v1.jsonl` line 7405 `{"k":"פרו","rank":9,"m":"M13",...,"entries":["Hebrew line 5709"]}`. The mark is Kaikki's own field (`pos` is `name`). The place is not a name by TAHOT or MACULA (not in `place-names-v1.jsonl`). The owner ruled it on 13 November: asked «Names. Hide a dictionary's names, such as «Bara», where the word on the page is not a name.», answered «1-3. ok agree» (`data/rulings/rulings-v2/rulings-2026-11-13-options-v1.json`, which lists this pill: Genesis 1:22:5, pill 12, verdict withheld).
- Only the Kaikki row is marked. The other five Peru rows carry no name mark, because OmegaWiki, PanLex and ConceptNet are "not read for a name ... their names stand" (`data/names/names-v1/RULE.md`). Whether those five show at Genesis 1:22:5, and by which gate if not, is the card lens's.

## 1. The store's arithmetic (every figure from the records)

| step | rows | record |
|---|---|---|
| held before any strike (store 7d3e04a9d270, 196 sources) | 773,847 | `data/store-before-strike-witness-v1.json` |
| language admission, two rounds, 49 M ids | −97,384 | `data/language-admission-v1.json` |
| the license strike, M20 | −22,007 | `data/source-strikes-v1.json` |
| the 88 shards' delta (125 out, 555 in) | +430 | `data/route-store/delta-88-shards-v1-receipt.json` |
| 16 row rounds: taken | −2,180 | `data/row-strikes-v1.json` |
| 16 row rounds: restored 71, landed 177 | +248 | the same |
| served | 652,954 | `data/route-store/index.json` counts |

Of the 2,180 taken by the rounds: 293 struck, 214 withheld (507 readings that left the cards), 116 re-keys that folded into a row already under the new key (73 of them across sources, put back by round 14: 71 landed, 2 already held), 40 pieces merged into 33 rejoined runs, 1,517 tagged ConceptNet duplicates folded.

## 2. Whole sources

### 2.1 Language admission: 49 M ids, 97,384 rows, 15,597 keys left with no row

Rule and tool: `tools/strike-language-v1.mjs` (page lane; header lines 5–67 hold the rule). Record: `data/language-admission-v1.json`. Holes: `data/route-store/struck-ranks-v1.json.gz` (rank and M id only; no text).

How a source was judged: a list of 23 language words matched against (a) a `languages` field if the record has one (none had), (b) the record's own key, license pointer and path with separators made spaces, (c) the catalog's label. These are the corpus lane's label and cache path for the source, not a field of the provider's file. A named language outside Hebrew, Aramaic, Chaldee beats one inside.

| reason in the record | M ids | rows | who |
|---|---|---|---|
| NAMES_A_LANGUAGE_OUTSIDE (round 1, 31 Aug) | M40, M63, M104, M168 Kaikki Yiddish; M131 Kaikki Arabic | 3,767 | label names Yiddish or Arabic |
| DECLARES_ITSELF_NON_HEBREW (round 1) | M24, M82 PanLex "Hebrew-script-language"; M78, M99, M103 Kaikki "non-Hebrew-language" tables | 14,146 | label says so |
| PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE (round 2, 1 Sep) | 12 Harkavy 1925 ids (M88, M100, M113, M117, M118, M121, M122, M125, M126, M127, M140, M146) | 376 | cache folder name holds "yiddish" (and "hebrew") |
| NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION (round 2) | Jastrow M12, M39, M49, M52, M65, M75, M106, M108 (60,926); Davidson 1855 M26, M31, M67, M77, M83, M84, M89, M91, M101, M107, M109, M114, M115, M119, M124, M141, M172 (12,492); ETCBC M8 (4,246); STEP TAHOT Expanded Strong M51 (1,431) | 79,095 | our label names no language |

Per M id: M12 40,258 · M39 14,057 · M24 11,132 · M26 6,751 · M49 4,388 · M8 4,246 · M40 3,149 · M82 2,089 · M51 1,431 · M75 1,234 · M91 898 · M67 856 · M78 787 · M89 633 · M65 617 · M84 580 · M83 564 · M101 534 · M104 530 · M114 430 · M107 404 · M106 372 · M77 314 · M115 232 · M103 138 · M109 112 · M31 78 · M88 57 · M141 49 · M131 45 · M126 44 · M118 43 · M168 43 · M117 40 · M127 39 · M113 32 · M100 29 · M121 28 · M172 22 · M125 21 · M140 21 · M124 20 · M122 18 · M119 15 · M146 4 · M52, M63, M99, M108 0. Sum 97,384.

The owner's words, as the records hold them (the conversations themselves are not in any file I could read):
- 31 August, `data/frame-record-v1.js` owner_stated_frame_2026_08_31 ("stated by the owner, in conversation ... his own wording throughout, except where a line was drafted here and he adopted it"), letter A: «a licensable span of Hebrew or Aramaic — never Syriac, Mandaic, Yiddish or Arabic. ...»; letter M: «the license record and the book it came from. Its language must be Hebrew or Aramaic (Chaldee). Struck: any source naming a language outside that set — Syriac and Mandaic included, though both are Aramaic — and any source that declares itself non-Hebrew without naming which language it is. A source that cannot say it is not Yiddish is not admitted for not having been asked.»
- 1 September, the same file, owner_stated_frame_2026_09_01 ("carrying the corpus lane's drafting ... with the corpus lane's phrasing where he adopted it"), letter N: «the license for that span. HEBREW AND ARAMAIC ONLY. Admission is affirmative: a source declares its language or it is not admitted. Provenance outranks label.»
- 2 September, `data/serving-rulings-v1.json` m-is-the-fortress (the corpus lane's distillation "in the site's own words"): «The defining sources stay strictly Hebrew and Aramaic, always.»

What is ours in it:
- The first rule (commit f1bb9455d7, 31 August) admitted the silent sources. Rule 1a, silence strikes, was written by the page lane the next night (commit 3419f1c690). Its own header says: "Every one of those four IS a Hebrew or Aramaic lexicon. They are struck for not saying so". Commit 4fdede96df adds that Davidson's acquisition manifest "has carried ["Hebrew","English","Chaldee"] since it arrived"; the manifest the gate read had no such field.
- The owner's frame of 1 September does carry "admission is affirmative". The commit that wrote it down (0b70728124) says those rulings were "made in conversation tonight and enforced in the tree before they were written down".
- Jastrow came back on the owner's word. 13 September: «not a fan of the ben yehuda 7 volumes at all currently thinking: yes jastrow, no ben yehuda dictionary, yes pby stays obviously.» (commit cf3ddb0824; the page lane recorded "yes Jastrow" as a lean and did not act). 2 October: told that serving him means declaring by name that his dictionary answers about Hebrew and Aramaic, «oh ok then yea it sounds fine, both good.» (`data/serving-rulings-v1.json` jastrow-served). He is served from an overlay beside the store (`data/overlays/jastrow/`, 115,918 rows), not in the store.
- "The other struck sources stay struck" is the page lane's reading in that same record (site_reads_it_as). Davidson's 17 ids (M97 alone is kept: its label names Hebrew and Chaldee), ETCBC and STEP's expanded Strong are still out of the route store: 18,169 rows. No ruling of the owner names them.
- Harkavy: the label said "exact Hebrew-English dictionary equivalents"; the folder name says Yiddish-English-Hebrew. The record shows no row-level check of which column the 376 readings came from.
- The other way: `data/language-sweep-v1.json` (2 September, strikes nothing) found 497 rows on 235 keys in kept sources that a struck Yiddish lexicon knows and no curated source carries, and three kept Kaikki Aramaic sources that serve Classical Syriac senses though the frame names Syriac out.

### 2.2 The license strike: M20, Bolls, 22,007 rows, 5,527 keys, 24 keys emptied

`tools/strike-source-v1.mjs`, `data/source-strikes-v1.json`, 17 October 2026 (commit 6a3f532e10). Reason as recorded: "the owner's 8 October 2026 ruling: text that needs a provider's permission is out, permanently. Bolls's text is Online Bible's abridged BDB, copyright Larry Pierce, word for word TBESH's Meaning column, which TBESH says needs Online Bible's permission (Moses, 17 October)." The corpus lane's license ledger v1.2.4 agrees (NEGATIVE, LICENCE_ASKS_PERMISSION, evidence class HOLDER_STATEMENT_VIA_TBESH_LINE_48). The owner's own words of 8 October: no ruling text found in any file I read; only this paraphrase.

### 2.3 Lost with the strikes, never struck: 4,256 readings of admitted sources

The corpus lane's v188 (14 November, `dl-v195/v2/letters/moses-fold-strike-landing-v1/FOR-ELIJAH-v188.md`): "The store build kept one route per key and words, and credited it to one source. ... Where the struck source held the credit, its row went out, and every admitted source that printed the same words under that key went out with it. Those readings were never struck. They were lost by the fold, and no one counted what the fold and the strikes did together." 119,391 rows were credited to a source later struck whole (97,384 + 22,007); at 5,112 an admitted source printed the same words; 856 print now from some row; 4,256 are lost. Credit held by: M8 2,082, M12 1,201, M39 298, M24 255, M51 243, M20 78, 20 more 95. Lost from: MACULA 1,818, BDB 236, Classical Hebrew Words 210, SDBH 175, Kaikki Aramaic 167, TBESH 164, TAHOT 156, PanLex 123, 54 more 1,203. Seen in the live store: under שמרון rank 2 is a typed hole of M12 and MACULA's «Samaria» is on no row; the card can still print the word from Strong's «Samaria.» (M9), since a closing stop is dropped at print. v188 flags 1,556 of its lines as having such a near copy served now (capitals or edge marks apart) and 1,538 as words the Jastrow overlay prints. Nobody ruled these off. The landing list (4,252 lines; 4,204 after 48 are skipped) is queued for ship 4.

### 2.4 The fold itself

The catalog's compact package holds one row per exact key and words with one `primary_m_id`; the builder ships it as it is. So a wording two dictionaries share stands under one. Measured by the page lane on 7 November (`wip/2026-11-07/fold/README.md`): over the Bible's keys the fold dropped at most 136,237 (key, text, source) rows (an upper bound); 485,694 lattice cards have a witness the store does not carry (1,357,792 witnesses); 6,390 rows carry another source's year. The corpus lane's census v149 counts items "under the key for another source only": Strong's 20,214 (approximate), UBS 16,869, Kaikki 3,137, BDB 2,080, Hebrew Wiktionary 1,796 (approximate). The words stay on the card; the folded source's credit, year and facts (number, name mark, headword) do not. The owner chose road A, one row per key, text and source, on 7 November («agree with r2 theres no press for space ...», `wip/2026-11-07/OWNER-QUESTIONS-2026-11-07.md`). Not built yet.

### 2.5 Beside and before the store

- Uhlemann 1837 (MSAM2, Samaritan overlay, 1,850 rows) rests off: `data/source-defaults-v1.json`, the owner, 3 October: «lets keep latin negative toggled for now, internal project only». A reader can turn it on.
- Ben-Yehuda's dictionary: never served. `data/ben-yehuda-posture-v1.json`: the owner, 13 September: «not a fan of the ben yehuda 7 volumes at all; currently thinking: no ben yehuda dictionary».
- `data/license-postures-v1.json` removes nothing from a card. It names postures and gates export; one posture (cc_by_sa_unversioned) is not exported.
- `data/source-corpus-v1.json`: the corpus lane's ledger refuses 3 sources (8,173 cards) for language; none is cited in this store. `data/source-declarations-receipt-v1.json`: "19 of the ledger's cache directories were never taken by the catalog". No list of them is in this tree. Census v149: Classical Hebrew Words has 7,207 records behind a served row of 15,084 source records. What the catalog never took is the corpus lane's and I found no rule for it here.

## 3. The 16 rounds of `data/row-strikes-v1.json`

Tool: `tools/strike-rows-v1.mjs` (row-strike-rule v1 to v5). Every row taken is whole in the record. The corpus lane's replay v148 (`dl-moses3/.../moses-store-replay-v1/FOR-ELIJAH-v148.md`) rebuilt the store from the base and the record: "the served store is the base plus the record and nothing else". Lists: 12 from the corpus lane, 3 written by the page lane (rounds 12, 13, 14). The page lane's review of v146: "I read every row of the nine lists ... against the served store ... I found no row wrong on its list" (`wip/2026-11-06/FOR-MOSES-2026-11-06-evening.md`).

| # | shipped | list, lines | what it did | source | basis |
|---|---|---|---|---|---|
| 1 | 6 Nov, beafe5005d | strike-list-v1 (v103.2), 174 | 173 struck, 1 re-keyed (Manasseh), under bare letters ה ו י ך ל מ | M14 | MEND as the record claims, on our criterion |
| 1 | the same | branch B01 | 5 readings of mah struck from מ | M14 | OWNER_RULED «Keep withheld», 6 Nov |
| 2 | 6 Nov, be35f9a6cc | strike-list-two-letters-v1 (v103.3), 34 | 34 struck under כם, ני (readings of min) | M14 | MEND as claimed; asked for by the page lane |
| 3 | 6 Nov, b713ffe28a | strike-render-nothing-v2, 58 | 58 struck | M28 19, M21 15, M3 10, M23 5, others 9 | OWNER_RULED «Take them off» |
| 4 | the same | withhold-another-language-v1, 142 | 142 withheld | 14 Hebrew Wiktionary ids | OWNER_RULED «Withhold them»; MEND |
| 5 | the same | same-kind-in-sister-ledgers-v1, 49 | 49 withheld | 10 Hebrew Wiktionary ids | the same ruling, stretched by the page lane |
| 6 | the same | strike-grammar-words-conjunction-v1, 6 | 6 struck on ו | M46 | "the owner's ask" (words not found); our reading |
| 7 | the same | headword-fixes-v1, 1 | Manasseh's headword mended | M14 | MEND |
| 8 | the same | rekey-or-strike-hewiktionary-v1, 21 | 21 re-keyed from או, הפסק; all folded | 5 Hebrew Wiktionary ids | MEND |
| 9 | the same | rekey-or-strike-m46-v1, 39 | 36 re-keyed (11 landed, 25 folded), 3 struck | M46 | MEND; 3 by our reading |
| 10 | the same | rekey-aramaic-ending-v1, 95 | 81 re-keyed (11 landed, 70 folded), 14 struck | M4 | MEND |
| 11 | the same | rejoin-v1, 33 (17 held) | 73 pieces into 33 runs; 40 rows taken | M14 26, M23 4, M9 2, M17 1 | MEND |
| 12 | 6 Nov, 92c831e759 | withhold-store-halves-v1 (page lane), 23 | 23 halves withheld | M14 21, M23 2 | MEND; the page lane's own list, no ruling |
| 13 | 6 Nov, 7078bab6b0 | retext-conceptnet (page lane), 11,759 | tag off; 10,242 in place, 1,517 folded | M1, M22 | OWNER_RULED «why not just fix it»; MEND |
| 14 | 6 Nov, 546df10654 | restore-cross-source-folds-v1 (page lane), 73 | 71 restored, 2 already held | M4 30, M46 22, Hebrew Wiktionary 21 | MEND of our own fold |
| 15 | 7 Nov, 1df6558cf2 | land-and-decode-v147-v1, 109 | 108 landed, 1 retexted | M14 107, M23 2 | MEND |
| 16 | 7 Nov, 52d37686f8 | land-v162-v1, 69 | 69 landed | M60 34, M13 16, M23 7, M7 7, M25 3, M17 1, M72 1 | MEND |

The `rulings` array holds one ruling: B01, question «Strong's filed the 5 readings of "what" (mah) under the bare letter mem. They are withheld for now, the corpus lane's resting option, and fit only 3 of the mem's 5,930 places. Keep them off the mem cards?», answer «Keep withheld», the owner, 2026-11-06.

Rows, for the lead to quote:
- Round 1: ה rank 76 M14 «beat» (of nakah, "to strike"); ו rank 35 «describe» (of katav); ל rank 139 «woe»; re-key מ rank 58 «Manasseh» to מנשה rank 30. B01: מ rank 56 «what (end, good, purpose, thing)».
- Round 2: כם rank 5 M14 «above», «after», «among» (min's list, 17 rows each under כם and ני).
- Round 3: אביגיל rank 10 M28 «given name»; אבץ rank 13 M21 «atomic number 30»; ה rank 98 M3 «(2019a=1886a+6483)»; עמק rank 8 M17 «NO DATA YET»; אלעם rank 1 M23 «Eliam (to be deleted)»; פעל rank 63 M59 «Pa'al»; ויטה rank 1 M15 «List of phrases containing the word vitae».
- Round 4: מתנים rank 19 M41 «donnant»; תאומים M96 «gemello»; לחיי־ rank 4 M36 «zum Wohl». Round 5: חיכה rank 3 M95 «esperar»; בדולח rank 8 M116 «Kristall».
- Round 6: ו ranks 27–34 M46 «hadst thou sat», «verbs», «general», «adverb», «predicate», «apodosis».
- Round 9: אזדא rank 9 M46 «correctly, exactly» to אדרזדא; struck: אול rank 18 «satraps» ("record word not on file"), קרץ rank 41 «in phrase», ירא rank 90 «plural construct as noun».
- Round 10: א rank 7 M4 «God» to אלה; struck: ומנדע rank 1 M4 «and/ <the>».
- Round 12: העשיר rank 6 M14 «48 marg)»; מנים rank 6 «8 (defective plural))»; ירע rank 27 «4; the rest belong to רָעַע)».
- Round 13: ה rank 110 M1 «he (n, wikt, en 2)» to «he»; פרו rank 20 M1 «peru (n)» folded into rank 18.
- Round 15: דלת «door (two-leaved)», «gate», «leaf»; אזל «fail», «gad about»; ישבילחם rank 1 M14 «Jashubi-lehem. (Prob. ...)» (moved from לחם); ר rank 9 M23 decoded to «[abbreviation of רַבִּי rabbi]».
- Round 16: עדן M17 «Eden»; ענושים rank 8 M23 «fines».

Open in the record:
- Round 1: the record says the parse filed these records under a bare letter. The page lane asked the corpus lane to "say how the parse put them there" (`wip/2026-11-06/FOR-MOSES-2026-11-06.md` item 2). I found no answer. The test for "not their word" was a hand verdict per record (`wip/2026-11-06/misfiled-one-letter-strongs-v1.tsv`) and the corpus lane's rule that kept peh because the bare letter is "mouth" at all 64 of its places.
- Round 12 and the 17 held rejoin lines: 15 are still held. Seen in the live store: העשיר has no «make (1 Kings 22:48 marg)», מנים has no «whereby (Psalm 45:8 (defective plural))». The halves are withheld and the whole renderings have not landed (13 keys of H6238, 2 of H4482).
- Round 16: 39 true drops were named and not landed (`wip/2026-11-07/FOR-MOSES-2026-11-07-landing-v162.md`).

## 4. Other parts of `data/route-store/index.json`, and beside it

- `struck-ranks-v1.json.gz`: 121,594 ranks on 33,509 keys, each `[rank, M id]`. It drops nothing; it types the holes. For the two whole-source strikes it is the only record on the site, and it holds no text.
- `route_delta_landings`: 24 October, 125 rows out and 555 in, all M14 (a row «--bottom» replaced by «bottom», and the pieces after it). Owner, 23 October: «if its licensed we want it» (`data/store-before-strike-witness-v1.json`).
- `pointing_store`, `fold_to_v1`, `join_rule`: no row dropped. The v2 store was proved equal to the served store after the admission filter; the join rule fills the headword slot.
- "a cut of a sibling record": 10,851 rows are pieces the build cut from a sibling (M9 7,889, M1 1,142, M5 755, M17 547, M14 513). The declared comma rule separated 16,776 rows into 144,612 pieces. The damage it did is what rounds 11, 12 and 15 mend.
- `ledgers`: 603 rows print no pill (TAHOT 430) and 2,698 print a part of themselves; overlays: Samaritan 47 no pill and 236 a part, Jastrow 149 a part; span store 31 a part. `data/ledger-branch-answers-v1.json`: every answer "by the owner"; rulings 2 to 4 of 6 November: «ConceptNet's filing tags off (4 branches); the filing marks around a name or a word off ... (17 branches); no pill for a row that renders nothing a translator could print (20 branches)» (the record's wording), and 7 November: «all your picks sound fine.» The shapes that sort a row into a branch are the corpus lane's.
- `name_rows`: 7,412 rows carry `name: 1` (UBS 4,335, Kaikki M13 1,481, Classical Hebrew Words 868, SDBH 449, others 279). Section 0.
- `row_entries`: 374,685 rows carry entry facts; the entry gate reads them. The owner, 13 November: «1-5. agree go ahead» (ruling 1) and «1-3. ok agree» (ruling 6).
- `sense_openings`: 2,008 rows of M46 give no reading and print as a note. Ruling 4, the same words.
- `source_years`: no row dropped. Davidson's year (1848, the catalog's date, on the owner's word of 7 November) is held off his 85 rows by the page lane since 10 November, "until the store keeps one row per key, text and source".
- `made_spaces`: 6,606 spaces our build made close at print on 4,986 route texts. No reading leaves.
- `data/word-senses/`: 3,329 rows of the Jastrow overlay that Jastrow sets in square brackets are held back at rest under a switch on the card. The owner's words are in its PIN.json.

## 5. The builder, `tools/build-route-store.mjs` (158 lines, five rules)

1. Exact key only. Nothing folded, nothing derived.
2. Every route whose M record is complete ships, in rank order. The draft before it shipped at most five per key and dropped 110,151 of 132,717 routes on I Kings; retired 16 August (`PIPELINE.md`, "The top-five gate": "Nothing but a licence removes a reading").
3. A route with no route text, no definition text, or an M record short of key, label, posture or pointer is refused. Refused today: 0 routes, 0 M records.
4. Shards by hash. 5. Inputs recorded.

The builder calls nothing else. The store has not been rebuilt by it since the pointing store landed on 18 September; every change since is one of the tools above writing on the shards (36 version moves in `store_version_history`).

## 6. In today's ship, and queued (the queued lens has these in full)

- Today (ship 1): the entry ledger v1.1 (v190). 12,257 rows go from withheld to kept at 11,895 places; none the other way (`v53/sequence/LANDING-PLAN.md`).
- Ship 4, the store round: v189 call 5 strikes 5,403 rows under keys ending in a maqaf and re-keys 357; v188 lands 4,204; call 6 withholds 449; call 2 withholds 2. The owner on the eight calls, 14 November: «just go with your recommendations its fine» (as v189 quotes it).

## 7. What I could not establish

- The owner's own words of 8 October (permission) and of 31 August (Yiddish). The records paraphrase.
- How the parse filed 17 Strong's records under bare letters.
- Whether Harkavy's 376 readings were Yiddish headwords or the dictionary's Hebrew column.
- What a card prints or a reader can switch for each item: read from `zone.html` only for the withheld line (lines 10339–10346); not opened in a browser.
