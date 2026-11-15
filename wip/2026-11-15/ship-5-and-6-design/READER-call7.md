# Call 7 at the grain of the rendering, and UBS's phrase mark as a kind (ship 5 design, page lane)

S = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`. Scripts and their outputs: `S/v77/ship56-design/call7-signs/`, listed at the end. Every script is plain ASCII, with no Hebrew in any literal.

**What I read**
- The ship tree `S/ship`, read only. Its store is `ccec4fa3071b` (call 5 and v188 landed). Line numbers below are the ship tree's.
- The live build, main `46bbbf7d50`, read out of the ship's git objects (`git --no-optional-locks archive`) into `call7-signs/live/`.
  - Its `data/resting-lines` equal `S/v76/live-records` byte for byte, 40 files of 40, by sha256.
  - The resting lines are measured on these records and on the live zones and sidecars. The combined ship will move some of them; its build re-measures on its own tree.
- From the corpus lane's store, read only:
  - `UBSHebrewDic-v0.9.2-en.JSON` (23,110,129 bytes, sha256 `1686a25d…`)
  - `ubs-sdbh-hebrew-definition-routes-v1.csv.gz` (sha256 `3567c700…`)
  - Both hashes are the ones the calls' receipt names. I also fetched the source-signs ledger v1.

**What I did not do**
- I wrote nothing into S/ship and ran no round, bake or browser.
- One plain `git status` early on may have refreshed the ship index's stat cache. Every later git call used `--no-optional-locks` and only read objects.

## 0. Read first: eight findings that shape the design

1. **Nehemiah 2:13 is already mended in the combined ship, by v192, not by a sign rule.**
   - Live, the place reads «them + X abroad», credited «M9 M14».
   - The read word פרוצים has no sidecar grade of its own, so it reads the zone's table: `zone.gloss["פרוצים"]` = «X abroad», M14 rank 11.
   - v192 lays TAHOT's pieces there: `data/read-words/read-words-v1/read-word-tags-v1.jsonl:52-53`, use NEW_PIECES, «they» and «were broken down» (LANDING-PLAN.md:132).
   - The class it names remains: 12 other Bible lines and 1,871 Tikkunei Zohar lines open with the sign; 28 more Tikkunei Zohar lines carry it in a bracket (§3).
2. **What replaces the signed rendering is the next word of Strong's alphabetical list.**
   - Strong's King James list is in the print's order, alphabetical by the main word. At פרוצים (H6555) it runs abroad, breach, break, burst, come, compel, … (`peek-key.mjs`).
   - Every M14 row of one entry shares rank and year (1890), so the oldest-first pool keeps that row order (`tools/gloss-store-v1.mjs:437-452`).
   - So the mend gives «X at all» → «sell (away, -er, self)» at Ezekiel 7:13:1, which is right there.
   - It also gives «+ bethink themselves» → «breast» at Nehemiah 7:45:2 (the name Shallum), «+ advertise» → «appear» at 1 Kings 7:41:14 (bowls), and «X before» → «ere» at Jeremiah 5:12:3 (not).
   - At all 12 of these Bible places, STEP has its own pick: «the/ seller», «not», «names», «Shallum», «[the] bowls of», and so on. That is question 3's class, which stays held (`q3-class.mjs`).
3. **«Its source's sign» should mean Strong's sign (X, ×, +) on a rendering.**
   - The page's whole SOURCE_SIGN category (STEP's [ ] < > ¿, MACULA's ~) applied to the line would move STEP's own TAHOT rows:
     - 47 Bible lines move. 28 of them have no reading without a sign in the pool. 6 go to another source: «shake» (MUSE) at Deuteronomy 22:20:8 and 22:26:5; «shovel, tool for digging, lifting, and moving bulk materials» at Ezekiel 16:39:1 and Jeremiah 12:1:9; «inside» at Ezekiel 48:15:16 and 48:21:37.
     - 3,144 Tikkunei Zohar lines move as well.
   - Meanwhile 52,889 Bible lines of TAHOT's own pieces keep the same brackets (§3.1, §3.2).
4. **The 306 «(» lines are two things in Strong's own key.** That key is the print's SIGNS EMPLOYED, as the corpus lane's M14 ledger declares it (`data/ledgers-v1/wikisource_strongs_explicit_forms/declaration.json:8`).
   - **80 lines** like «(+) archer» are `open_paren.holds_sign_alone` (:424-428). Its meaning: «opens only a sign set on the word after the bracket: the print's + (a rendering of one or more Heb. words in connection with this one) or its multiplication sign (a rendering from an idiom peculiar to the Heb.), which the edition writes as the capital X». The sign is on the rendering itself.
   - **226 lines** like «(X great) delight» (M14 222, M9 4) are `holds_words_before_the_word` (:571-575): «a word or words that the rendering may take before its principal word». The sign is on an optional word, not on the main rendering.
   - So the plan's put-back (spec v189-audit-calls.md:189: «the sign reaches only the bracket … «archer» … plain one-word renderings») holds for the 226 and not for the 80.
5. **Call 7a's row test («opens with the sign») misses 482 signed renderings.**
   - They sit inside 299 M9 lists whose first rendering has no sign, for example «border, bound, coast, × great, landmark, …» (`m9-signed-inside.mjs`).
   - A rule at the rendering reaches every signed rendering: 16,358 in the ship store (M14 15,605; M9 751; M3 2: MACULA's «X and» and «X also» under ו) (`sign-rows-by-source.mjs`).
6. **UBS's own mark reaches 3,121 store rows on 862 keys, not 1,261.**
   - The mark is `LEXMeanings[].LEXCollocations`, reached through the catalog's own route file.
   - 7b is the subset that also passed v184's English test (opens «literally:» or holds « > »).
   - 1,860 more rows carry the same UBS mark, for example «smooth talk» (חֵלֶק שְׂפָתַיִם) and «one of the city gates of Jerusalem» (שַׁעַר מִזְרָח) (`ubs-phrase-census.mjs`).
7. **No resting line reads a 7b row.**
   - 0 of 400,474 lines read one.
   - At all 4,551 places of 7e, the line is TAHOT's pieces (4,441) or another source's row (110), never the UBS row.
   - 8 lines read a row of the wider category: «Sea of Reeds», 8 times (`ubs-phrase-lines.mjs`).
8. **The kinds record, as it stands, cannot hold question 10's exception.**
   - `restsOffOf` refuses an entry field it does not read (`tools/dictionary-kinds-v1.mjs:204-207`).
   - The default picks bake reads each UBS pick's rows but writes only its words (`tools/bake-default-picks-v1.mjs:781-801`, :794, :924). So data wiring is needed (§4.5).

## 1. How the page and the bakes treat a source's own sign today

**The signs switch** (zone.html)
- :3472-3496: the category, the corpus lane's source-signs ledger v1 of 3 October.
- :3487 `SIGNS_KEY`.
- :3488-3498: off by default, on the owner's words of 3 October 2026: «preselect it off for now».
- :3510 `SOURCE_SIGN` holds five patterns: `^(X|×|\+) `, `¿`, `<…>`, `[…]`, ` ~ `. They are source-blind.
- :3511 `hasSourceSign`; :3513 `signOnly`; :3528-3529 `trimSigns`; :3558 `signsOffLine`; :3561-3568 `placeShown`.
- The switch's positions printed / below / off are at :4498-4504. The default is off (:15991) and reset returns to off (:16047).
- The source-signs ledger counts by pattern and gives each sign to one source:
  - STRONG_SIGN to Strong's: M14 15,572, M9 180 (M3 2 and M46 3 match by pattern alone).
  - ¿, < > and [ ] to STEP TAHOT (M4).
  - ~ to MACULA (M3).
  - Source: `dl-signs/…/LEDGER-source-signs-v1.md`, `source-signs-v1.json`.

**The card**
- `drawPills` (:11551-11570) works at the grain of the rendering, since a pill is a reading.
- Under off, a reading carrying a sign is not offered (:11562), except:
  - the reading standing on the line: «the reading standing on the line keeps its pill whatever it carries» (:11560-11562);
  - a card whose every reading carries one keeps them all (:11563).
- It says «N readings carrying a source's own sign switched off» (:11569). The pressed pill is the line's own reading (`lineFirst`, :11127-11128).
- `sortPool` puts signed readings last only under «below» (`signLast`, :8651; the chain at :8654).

**The line**
- The line has the switch applied only to pieces that are a sign alone: `signsOffLine` on a word's line (:14113), run parts (:12234-12243), a piece pill (:10846), attribution (:6406-6411).
- A rendering that holds a sign and words («X abroad») is drawn whole.

**How a row's text becomes renderings**
- `readingsWith` (`tools/gloss-store-v1.mjs:291-306`) and the page's `readingsOfRow` (zone.html:2958-2979) do the same thing:
  - a sense opening gives nothing;
  - a source with no ledger is one reading, whole;
  - `row[8]` is the texts the row prints;
  - `row[7]` is the cuts;
  - otherwise the row is whole, with made spaces closed by `row[9]`.
- The ledgers are written by `tools/apply-ledger-divisions-v1.mjs`:
  - header :4-48; a shape divides only where the owner answered «divides» (:144);
  - any other answered option is a print step (:129, :145), from `tools/ledger-print-from-declaration-v1.mjs` (:155-163 `stepsOf`/`rowsPrintOf`, :237-244 `printUnder`);
  - the slots are set at :229-236.
- **Strong's**:
  - M9 (Open Scriptures): B01 and B02 were answered «divides» by the owner on 7 November (`data/ledger-branch-answers-v1.json:675`). Its King James lists divide into one reading per rendering; 4,490 rows divide (`data/route-store/index.json:2751`).
  - M14 (Wikisource): one King James rendering per row; 120 rows divide (index.json:3305). Its ledger declares `plus.opens_text`: «The store gives the rendering its own route, so the page prints it as a reading with its sign and nothing divides» (declaration.json:2135).
  - No division ever cuts a sign off its rendering.
- **`divides_keeping_signs`** is about punctuation at a cut, not this switch.
  - The owner, 8 November: «! is legitimate punctuation within a card».
  - It appears in Jastrow `declaration.json:1616`, the unabridged BDB :2871, and Open Scriptures BDB :1017, with answers at `ledger-branch-answers-v1.json:324, 470, 712`.
  - No Strong's ledger uses it.

**Where a signed rendering still prints**
1. On the line, wherever it leads the pool (§3).
2. On the card: the line's own pill; every pill where all carry a sign; under «printed» and «below».
3. In the chain books' lifted state, `"fh.signs": "printed"` (`tools/card-readings-v1.mjs:106-109`).
4. In the search index, which holds every pill (`tools/bake-search-index-v1.mjs:116-124, 232-240`). The page's search reads no signs switch (zone.html:16128-16150).
5. In the record and the export, byte for byte (zone.html:3492-3496).

## 2. What "leads the line" means at each layer, and where the mend lives

| layer | what leads | where |
|---|---|---|
| store pool | `readingPool(...)[0]`: groups by readingKey, ordered by tier, year, ledger, then arrival | gloss-store-v1.mjs:391-452 (comparator :437-446); `glossFor` :463 |
| zone table | `zone.gloss[k]` = `tableFor`→`glossFor`; `gloss_m` and its alternate; the order columns; the licence columns; noname | regloss-zone.mjs:163, 202, 209-210, 244-255, 263-266; gloss-m-v1.mjs:104, 154, 160, 225, 282 |
| sidecar | `o.l` = rowLeader (lenient «only»), `o.la`, `o.s`; `o.m`/`o.x` (firstUnder over the pool's groups); `e[key].l/la` = leadersAt | project-lattice-v12-v1.mjs:615-626, 638-646, 578; 416-428 (pool at :422), :740 |
| page, at rest | `lineUnder` (zone.html:13653): `defaultAt` (:13659; at rest, STEP's words only where today's line is bare) → `placeLine`, TAHOT's pieces (:13660, :13632-13651) → the sidecar leader at the place, under «only» (:13677-13712) → the table (:14088). A pair or joined word reads the table region by region (:14080-14088). Drawn through `signsOffLine` (:14113) | |
| default picks | each source's own pick words (UBS's line is pick 1's glosses, :125, :801-804). STEP's line is «the line as it rests» (:79-99). The pool is never read for the line | bake-default-picks-v1.mjs |
| records | a recording of the page (resting-lines-v1.mjs; state at :121, signs off) | bake-resting-lines-v1.mjs |
| chain books | the card's pressed pill is the line, read at rest and lifted | card-readings-v1.mjs:97-109, 190 |
| search | no leader: every pill of every row | bake-search-index-v1.mjs:123 |

**Where the mend must live (one rule, one place).** It goes in the store pool's order, with a mirror in the page.

1. `tools/gloss-store-v1.mjs`
   - Export one predicate beside `signOnly` (:80): a rendering that opens with Strong's sign, `^(X|×|\+) `, the page's own first pattern.
   - Make it the first key of all three `cmp` orders in `readingPool` (:437-446): a signed reading sorts after every reading without a sign.
   - It is a sort, not a filter, as the switch's own rule is for a card whose every reading is signed (zone.html:11557-11563).
   - Every leader in the table above derives from `readingPool`, so all of them move together.
   - Bump `GLOSS_RULE_ID` to v8 and add a clause to `GLOSS_RULE_TEXT` (:173-190).
2. zone.html
   - Carry the predicate by the same name beside `hasSourceSign` (:3510).
   - `signLast` (:8651) becomes: «printed» → 0; «below» → `hasSourceSign` (as today); «off» → the Strong's predicate.
   - Then a line repainted live under a source switch (`poolFor(storeOnly)` → `sortPool`) agrees with the bake.
   - At rest the card's pressed pill is the baked line (:11127). Under «printed» the line does not move. That is the kinds' rule: «the line is baked once, at rest».
3. The records, chain books and default picks follow by reading the page. The search index has no leader.
4. Checks:
   - A new law: no baked leader opens with the sign where its pool, under the same gates, holds a reading without one; and the page's predicate equals the module's over every reading, by K2's method.
   - The gate: `check-same-product --expect` with a line that differs only where its old text opened with the sign.
5. Outside the pool: the witnessed order columns. `bake-witnessed-order-v1.mjs:86` takes the lane's own row and its first reading. 2,453 Bible keys lead with a sign there (live: entry-and-lists 2,451, same-place 1, entry 1). They follow the mend only if that bake takes «the row's first rendering without a sign».

## 3. Measures (live records, live tree, ship store)

### 3.1 Resting lines that carry a sign, by credit
`census-signed-lines.mjs` over the 40 live records: 400,474 lines, of which 58,032 carry any sign.

| credit | Bible | Tikkunei Zohar |
|---|---|---|
| TAHOT's pieces at the place | 52,889 ([ ] 45,234, < > 8,520, ¿ 1) | — |
| MACULA's pieces | 1 («there ~ be», Jeremiah 50:29:12) | — |
| STEP's TAHOT rows, M4 ([ ], < >) | 86: 39 are STEP's own words filling a bare place, 47 lead the pool | 3,114 |
| **Strong's sign, M14** | **12**, plus 1 credited «M9 M14» (Nehemiah 2:13) | **1,871**, plus 28 with the sign in a bracket (6 «(+) archer», 22 «(+ every) sabbath» kind) |
| other sources' brackets or ~ | — | M23 23, M25 3, M3 4 |

### 3.2 What leads under the mend
`signed-leaders-mend.mjs` replicates the projector's `leadersAt` and the table with the live tree's own modules. It reproduced all 1,912 Strong's lines exactly from the live data.

- **Bible: 13 lines.** 12 come from the sidecar's leader at a place the lattice gave no tag and no pieces (so the entry gate does not ask); 1 from the table (`bible-signed-places.mjs`).
  - All 13 go to Strong's next rendering, another row of the same entry. None goes to the same row, none to another source, none bare.
  - On the ship store, opened at rest, the answers are the same.

| place | line today | leading row | under the mend | STEP's own pick |
|---|---|---|---|---|
| Deuteronomy 28:59:8 | «+ aloud» | גדלת 10 M14 H1419 | «elder(-est)» | «great» |
| Ezekiel 7:13:1 | «X at all» | המכר 2 H4376 | «sell (away, -er, self)» | «the/ seller» |
| Hosea 6:3:7 | «+ be able» | מצאו 13 H4672 | «befall» | «going forth/ his» |
| 1 Kings 7:41:14, 7:42:14 | «+ advertise» | גלות 22 H1540 | «appear» | «[the] bowls of» |
| Jeremiah 5:12:3, 49:20:15 | «X before» | לוא 17 H3808 | «ere» | «not» |
| Job 1:21:2 | «X after» | יצתי 1 H3318 | «appear» | «I came out» |
| Nehemiah 2:13:16 | «them + X abroad» | פרוצים 11 H6555 | «them + (make a) breach» | (v192 lays pieces here) |
| Nehemiah 7:45:2 (a name) | «+ bethink themselves» | שלם 179 H3824 | «breast» | «Shallum» |
| Numbers 3:43:5 | «+ command» | שמת 27 H7761 | «give» | «names» |
| Proverbs 23:7:7 | «X at all» | אכול 11 H398 | «burn up» | «eat» |
| Psalms 31:6:3 | «X at all» | פדית 5 H6299 | «deliver» | «you have redeemed» |

- **Tikkunei Zohar: 1,899 lines** on 191 keys, all from the table.
  - 1,819 go to Strong's next rendering; 80 go to another source (58 with the sign at the start, 22 bracketed); none bare.
  - The most frequent: «X before»→«ere» ×407; «X as»→«but» ×368; «+ afternoon»→«apply» ×175; «X again»→«away» ×91; «+ bird»→«border» ×77.
  - «+ champion» at הבנים (22 lines) goes to a 40-word UBS tree definition on the live store, and to «ebony» on the ship store.
- **The page's whole category instead** (`signed-leaders-mend-page.mjs`, all 5,142 lines reproduced):
  - Bible: 47 pool lines of STEP's rows move (28 have no reading without a sign, 13 go to another STEP row, 6 to another source), plus the 13 Strong's lines.
  - Tikkunei Zohar: 3,144 more lines move (850 have no reading without a sign, 1,816 go to the same source, 477 to another, 1 to the same row).
- **The 136 lists:** today 0 resting lines read a signed rendering of an M9 list, so the outcome «the same row's next rendering» moves no line.

### 3.3 Reach below the resting line
`baked-signed-leaders.mjs`, over live zones and sidecars. These leaders surface when a reader turns TAHOT off, picks the by-sa licence, and so on; the mend moves them with the pool.
- **Bible:**
  - `zone.gloss`: 3,840 of 129,534 keys.
  - `gloss_m` alternate: 686.
  - Order columns: `licence_by_sa` 8,160; the witnessed entry-and-lists order 2,451; `licence_by` 9.
  - Sidecar: `o.l` 5,871, `o.la` 652, `o.x` 591, `o.s` 254, `o.m` 107; `e[].l` 1,863, `e[].la` 520.
- **Tikkunei Zohar:** `zone.gloss` 309 of 12,683 keys; alternate 48; `licence_by_sa` 387.

### 3.4 Call 7a at the grain of the rendering
`call7a-classify.mjs` and `call7a-lists.mjs` on the ship store, with 7a held to its pin. All 16,091 lines were found, one row each.
- 15,785 open with the sign: M14 15,605, M9 180.
- 306 open with «(»: M14 302, M9 4.
- **The 136 lists are:**
  - 132 M9 rows the ledger divides. They hold 951 renderings: 220 open with the sign, 7 open with «(×», 3 carry it inside, 721 carry none. 89 of the 132 carry the sign on the first rendering alone.
  - 4 M9 lists the ledger leaves whole: אשר 166, יעל 53, עבד 175, שתה 43. They hold 45 renderings by comma, 30 without a sign.
  - **754 = 724 + 30** reproduces when a rendering opening «(×» counts as signed; it is 761 if only the bare sign counts.
- Under the rendering-grain rule, none of the 754 leaves the card.

## 4. UBS's phrase mark as a kind

### 4.1 Where the mark lives
- In UBS's own file, entry → `BaseForms[]` → `LEXMeanings[]` → **`"LEXCollocations": ["אבד נֶפֶשׁ"]`**.
  - LEXID `000005001008000`, `LEXForms ["verb pi"]`.
  - `DefinitionShort` «literally: to destroy a life; hence: = action by which someone causes another person to die a violent death».
  - `Glosses` ["to destroy a life > to kill people"]; `LEXReferences` ["02602202700024"].
- 1,757 of 16,224 meanings carry it.
- The M18 store rows are those meanings' DefinitionShort and Glosses, tied through the route file's `normalized_key` + `r_route_text` → `lex_id`.
- The store row carries nothing of the mark today. Facts keys over the ship store are n 369,151; t 37,675; b 15,228; name 7,412; opens 2,008 (FACTS_SLOT doc, gloss-store-v1.mjs:108-121). The 7b rows of אבד carry only `{"n":["H6","H7"]}`.

### 4.2 The category against the list
`ubs-phrase-census.mjs` and `ubs-phrase-meanings.mjs`.
- 3,121 rows: 7b 1,261 (all inside), plus 1,860 others.
- 451 of the 3,121 have only one-written-word collocations: 23 in 7b, 428 others, and 418 of those 428 are UBS's own name rows, e.g. יוידע «man; ► father of Benaiah…» with collocation יְהֹויָדָע.
- 47 rows (3 in 7b: מלא 72, עמד 159, שסע 20) are also the text of a meaning with no collocation.
- **Recommended set:** every meaning of the row's text has a collocation, and UBS does not give the row as a name: **2,649 rows on 764 keys** (7b 1,251, others 1,398).
  - The 47 rows stay at rest; they are a plain meaning too.
  - 425 name rows (7 in 7b) stay under the names gate.
  - The owner's rule that decides it: «a rule is made over a dictionary's own category and runs over the whole shelf; a list that names rows one at a time mends only those rows».
  - «Walk the line where it can be walked» decides the two subsets.

### 4.3 The entry, in the record's shape as it is
```json
{ "id": "ubs-collocation",
  "say": "that the UBS dictionary gives under a collocation",
  "families": ["ubs-dictionary"],
  "fact": "phrase",
  "ruling": "the lead, 15 November 2026 (the-ledgers-go-live/THE-OWNERS-WORDS-2026-11-15.md, «The lead's calls on the store round»): «UBS's own phrase mark … is a kind its source states, and belongs with the headings on the card by kind»; …" }
```
- `restsOffOf` reads all of these fields (dictionary-kinds-v1.mjs:204, 231-233).
- The fact `phrase` holds UBS's collocations verbatim. A tool on the model of apply-name-rows-v1 writes it from a pinned list in the name-rows shape: 7b already carries `meanings` and `collocations`; the rest of the category comes from the corpus lane (letter Ask 2), or from the two files the calls' receipt pins.
- Add the key to the FACTS_SLOT doc.

**What the card says**
- Shut: the entry's count beside the others (zone.html:3825-3832), e.g. «24 from word lists, knowledge bases and encyclopedia titles · 2 that the UBS dictionary gives under a collocation · show». An empty card says «N readings shut at rest: …» (:11009).
- One switch opens every resting entry together (`KINDS_KEY` :3791, `chooseKinds` :3814).
- Opened, a pill's title can carry UBS's own collocation from the fact («a collocation's meaning: אבד נֶפֶשׁ»). The record's `say` holds no Hebrew (dictionary-kinds-v1.mjs:146).
- The bakes at rest drop these rows (`openRouteStore(…, {atRest:true})`, gloss-store-v1.mjs:223). That moves 0 lines for 7b and 8 «Sea of Reeds» lines for the wider category. The search index leaves the fact rows out (bake-search-index-v1.mjs:133-137, 237, 290; not measured in readings).

### 4.5 Question 10: keep UBS's own phrase picks on the card at rest
- **Data.** The default picks bake should write into `data/default-picks/index.json`, which is fetched at boot (the book files are not, at rest), per book: `[n, [k, rank, sha16]…]`, the rows UBS's own pick names at place n that a fact entry rests shut. For 7b that is 5,222 references at 4,551 places in 39 books, 5,183 of them at pick 1 (call 7e). The bake already reads these rows (:781-801).
- **Record.** The entry needs one field, for example `"stands_where": "its-own-pick"`. `restsOffOf` and its page copy must learn to accept it (K2 holds the two copies together).
- **Page.** The kinds gate (zone.html:8261-8264) keeps such a row at that place, uncounted.
- **The line does not change.** At all 4,551 places it is TAHOT's pieces (4,441) or another source's row (110).
- **Under UBS's own default layer**, the pick already stands as UBS's own made row above every gate (zone.html:8397-8440).
- For the 1,860 wider rows, the places are not measured (the ledger's 39 book files, 97.9 MB, were not read). UBS's own references to the 668 meanings only those rows reach: 5,028; to 7b's 1,083 meanings: 4,575.

### 4.6 7c and 7d stay as they are
- **7c (2,202):** none of these rows is reached by a marked meaning, so no fact is written, and its 23,946 UBS references are unchanged (counts-v1.json `call7`).
- **7d (192 M17 rows, 139 keys, all holding « > »):**
  - The SDBH record the dictionary store serves carries no collocation. For אבד, field D has «Dead verb literally: to destroy a life; … to destroy a life > to kill people» with no אבד נֶפֶשׁ.
  - The entry names only the family `ubs-dictionary` (key `ubs_sdbh_hebrew_v0_9_2`), never `sdbh-hiperbiblia` (`hiperbiblia_sdbh`, M17).
  - The fact tool writes M18 rows only.

## 5. Where the lead's call supersedes the plan

| where | what it said | now |
|---|---|---|
| LANDING-PLAN.md:27 | Call 7 lifts 15,785 + 1,261 rows; the 306 «(» lines held | No Strong's row is lifted; the line rule works at the rendering. UBS's mark is a kind |
| :33, :237 | the 306 and 7e wait for ship 7 | The 306 need no landing (only the 80 «(+) word» lines are a decision). 7e is question 10's data |
| :54 (D9) | the 306 held | moot |
| :79, :196-199; spec v189:68, :105-112 | `apply-phrase-rows-v1` with fact `phrase` on 7a and 7b; a phrases gate beside the names gate; a `phrases` switch on the model of `senses` | No fact on Strong's rows. `phrase` goes on UBS rows only, read by the kinds record. No new gate or switch: the kinds gate (zone.html:8261-8264) and switch (:3791-3819). Strong's sign uses `readingPool` / `sortPool` (§2) |
| :212; spec :176 | 17,352 pills leave 5,744 keys' resting cards | Measured instead: 13 Bible and 1,899 Tikkunei Zohar lines (or 0 Tikkunei Zohar lines, scoped). UBS rows go a press away except at UBS's own picks |
| :215; spec :146 | check: 7a and 7b carry phrase | 7a carries no fact; the sign law of §2 applies. The UBS set carries phrase (7b inside it); 7c and 7d do not |
| :248; spec :189 | «the sign reaches only the bracket» | true for 226 lines, not for 80 (§0.4) |
| :325-326; OWNER-QUESTIONS:23 (Q9) | the «phrases» switch and «part of a longer phrase, by Strong's sign X» | Superseded. Strong's sign keeps the signs switch's words (zone.html:11569); UBS's mark speaks through the kinds count |
| OWNER-QUESTIONS:24 (Q10) | keep at the 4,551 words | met by §4.5 |

## 6. Decisions for the lead
1. **Scope of the sign rule.** Recommended: ride the record's scope, the 39 books, through `atRest`. The Tikkunei Zohar then keeps today's rest, as `dictionary-kinds-v1.json` scope.ruling says for it. Unscoped, 1,871 Tikkunei Zohar lines move (+6 if decision 2 is taken), mostly to the next alphabetical rendering. Its resting state is also signs «off».
2. **«(+) archer» (80 rows).** Count a bracketed sign alone as Strong's sign on the rendering (Strong's own key)? That adds 6 Tikkunei Zohar lines and 0 Bible lines.
3. **The witnessed columns (2,453 Bible keys)** stay outside the rule unless their bake changes.
4. **The UBS category:** 1,261 (the list), 3,121 (UBS's mark), or 2,649 (recommended).
5. **The 12 Bible places** get Strong's next rendering while question 3 stays held.

## Scripts and outputs
All under `S/v77/ship56-design/call7-signs/`.

**Counts**
- `census-signed-lines.mjs` → `census-signed-lines.out`
- `signed-leaders-mend.mjs` → `signed-leaders-mend.out.json`
- `signed-leaders-mend-page.mjs` → `signed-leaders-mend-page.out.json`
- `baked-signed-leaders.mjs` → `baked-signed-leaders.out.json`
- `bible-signed-places.mjs` → `bible-signed-places.out.jsonl`
- `q3-class.mjs` → `q3-class.out.json`
- `call7a-classify.mjs` → `call7a-classify.ship.out.json`
- `call7a-lists.mjs` → `call7a-lists.ship.out.json`
- `sign-rows-by-source.mjs` → `sign-rows-by-source.ship.out.json`
- `m9-signed-inside.mjs` → `m9-signed-inside.ship.out.json`
- `ubs-phrase-census.mjs` → `ubs-phrase-census.out.json`
- `ubs-phrase-meanings.mjs` → `ubs-phrase-meanings.out.json`
- `ubs-phrase-lines.mjs` → `ubs-phrase-lines.out.json`

**Helper:** `peek-key.mjs` prints a key's store rows.

**Inputs**
- `live/reader` is the live tree, git `46bbbf7d50`.
- `dl-ubs/` holds the UBS provider file and route file.
- `dl-signs/` holds the source-signs ledger v1.