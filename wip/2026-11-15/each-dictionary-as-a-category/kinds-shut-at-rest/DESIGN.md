# Kinds shut at rest: the design of the first ship

15 November 2026. This is the page lane's design for the first ship of «each dictionary as a category». The builders build from it. It was written from the tree main 46bbbf7d50 (`scratchpad/rt`, read only), the two readers' notes beside this file (`UNDERSTAND-page.md`, `UNDERSTAND-pipeline-and-measure.md`), the table (`../TABLE-what-each-dictionary-is.md`), its check (`../VERIFY-declare.md`) and the measures (`../MEASURES-what-each-kind-supplies.md`, which landed at 08:29, after both readers had started). Every line number is in that tree. I read the code at each place I cite. Nothing was run on the machine except small reads of the store index.

What ships:

- The kind «word-pair lists, knowledge bases and encyclopedia titles» rests shut on every card.
- The rows English Wiktionary files as a name (its own part of speech, the fact `name`) rest shut on every card, at name places too.
- Both open with one press. Nothing leaves the store. The line under a word at rest never reads a shut row.

---

## 0. Where the decision needs a change to be sound (read first)

The decision holds as the lead stated it, with four small changes. None of them redesigns anything.

1. **«The card says how many readings are shut, in the dictionaries' own terms» cannot be met as worded.** Five of the nine families in the kind describe themselves in no record anyone has read: ConceptNet, OmegaWiki, MUSE, Wikidata and Hebrew Wikipedia's titles (TABLE, «What it says it is»: «No self-description in any record read; the labels ... are this project's»). For PanLex, Lexibank, Hebrew WordNet and Kaikki, the own words are a README line, a release title or a file header. None of those says «word list».
   - **The smallest change that makes it sound:** the card names the kind as the table files it. The table files it by the shape of each dictionary's own data: a pair per line, an edge of a graph, a title. The record keeps each family's own words where it has some, with where they stand, and says «silent» where it has none. The rail shows those words on each chip.
   - The card's words are therefore a filing label, never a claim about a row. Card: «24 from word lists, knowledge bases and encyclopedia titles · show». I spell out «encyclopedia titles» because Hebrew Wikipedia's titles are neither a word list nor a knowledge base. That is one string in the record, and the lead can shorten it there.
2. **«Whatever else the table files there» brings in three families the lead did not name.** The table files them in the kind, so they shut with it:
   - Wikidata's Hebrew lexemes (11,743 rows; it leads 523 resting lines today, including «the Jewish people» ×370 and «human, common name of Homo sapiens…» ×98)
   - Hebrew WordNet (4,487 rows, 99.98% with pointed headwords)
   - English Wiktionary's translation tables, Kaikki M34 and DBnary M37 (7,006 rows; the table files them as word-pair lists, apart from Wiktionary's own entries)

   This is the decision as stated, not a change. It is said here because the owner will meet it first at Exodus 1:1. MEASURES files M34/M37 under Wiktionary, not under this kind; the record follows the table.
3. **«English Wiktionary's category name» reaches 92 more rows than the 1,590 the lead counted.** English Wiktionary's Aramaic entries (Kaikki, key `kaikki_wiktionary_aramaic`) carry the same part of speech from the same extraction, as `name` on 92 rows (TABLE, «What stands» 1). The owner's words («doubt all wiktionary "name" categories») reach them.
   - The record's entry names both families: 1,682 rows.
   - If the lead meant the Hebrew entries only, it is one family id to delete from one line. No code changes.
4. **«The line under a word at rest never reads a shut dictionary» needs the bakes, not the page alone.**
   - A shut that lives only on the page leaves Wiktionary's names on 78 baked Tikkunei Zohar lines (13 keys: Jerusalem, Boaz, Obadiah, Kabul…). The page's switch machinery cannot see a row fact.
   - It also costs about 21,900 live pool asks on every first paint of the Tikkunei Zohar (UNDERSTAND-page §2, §6).
   - So the zones step and the lattice step bake at rest (§3). The round therefore runs whole, lattice included: about 43 minutes.

   Two consequences ship on purpose, and the owner will meet them on a card:

   - **Opening the shut dictionaries changes the cards, not the line.** This is the word senses' rule («the resting line is the store's, and no switch moves it»). The line is baked once, at rest. A reader who opens the kind and presses one of its pills puts it on the line, as any press does. Shutting again forgets that press.
   - **A reading an open dictionary shares with a shut one stands, credited to the open one, on the card and on the line.** The shut dictionary's year goes with it, though. So where the shut co-carrier's year was what ranked a shared reading first, the line can move.
     - This is the rank-loss class: Esther 9:17 and 1 Chronicles 23:23, «three» [Strong's M14] becomes «+ fork» [M14] (UNDERSTAND-pipeline §3, class 4).
     - It follows from the rule and is not a fault of the kind. It is sized in the proof (§7) and named in the gate's expectation (§4).

---

## 1. The record: `reader/data/dictionary-kinds-v1.json`

### Its rule

`dictionary-kinds-rule-v1-each-dictionary-is-filed-by-what-it-says-it-is-and-a-kind-or-a-category-it-marks-in-its-own-data-may-rest-shut`

It is kept by hand, in the serving lane. One family is one line. A resting entry is one line, and each entry names the ruling it carries out.

### Its shape

```json
{
  "rule_id": "dictionary-kinds-rule-v1-…",
  "version": "2026-11-15a",
  "kept_by": "hand, in the serving lane: every source key the store's index names is filed in exactly one family; each family under one kind; a resting entry names kinds or families, and may name a fact the row carries in its own facts slot",
  "kinds": {
    "bible":                 { "say": "Bible dictionaries and the place's own reading" },
    "general-with-entries":  { "say": "general Hebrew dictionaries with entries" },
    "rabbinic":              { "say": "the rabbinic dictionary" },
    "aramaic":               { "say": "Aramaic dictionaries" },
    "lists-and-bases":       { "say": "word lists, knowledge bases and encyclopedia titles" },
    "other":                 { "say": "not filed under a kind" }
  },
  "families": [
    {
      "id": "panlex",
      "family": "PanLex",
      "kind": "lists-and-bases",
      "shape": "word-pair-list",
      "shelf": "store",
      "keys": ["panlex_hebrew_english_meanings_20240301", "panlex_hebrew_english_definitions_20250201"],
      "own_words": [{ "text": "This dataset has been extracted from https://panlex.org (the `20240301` datab…", "where": "route-store/source-declarations-v1.bin, stems.panlex_hebrew_english_meanings_20240301 (channels source_self_description)" }],
      "table": "TABLE-what-each-dictionary-is.md, PanLex (15 November 2026)"
    },
    {
      "id": "conceptnet",
      "family": "ConceptNet 5.7",
      "kind": "lists-and-bases",
      "shape": "knowledge-base",
      "shelf": "store",
      "keys": ["…"],
      "own_words": [],
      "silent": "no self-description in any record read: route-store/index.json m_sources, ledgers-v1/conceptnet_5_7_hebrew_english_cc_by_sa_4_0/declaration.json, source-declarations-v1.bin"
    }
  ],
  "rests_off": [
    {
      "id": "lists-and-bases",
      "say": "from word lists, knowledge bases and encyclopedia titles",
      "kinds": ["lists-and-bases"],
      "ruling": "the lead, 15 November 2026, on the owner's words of that day («we need to think in terms of each dictionary as a category»): this kind rests shut on every card, a press away"
    },
    {
      "id": "english-wiktionary-name",
      "say": "that English Wiktionary files as a name",
      "families": ["english-wiktionary-hebrew-entries", "english-wiktionary-aramaic-entries"],
      "fact": "name",
      "ruling": "the owner, 15 November 2026: «wouldnt the wiser thing be to doubt all wiktionary \"name\" categories?»; the lead: rests off on every card, at name places too"
    }
  ]
}
```

Fields:

- `kinds` uses the lead's five plus `other`.
- `shape` is the table's own finer column, carried and not read by any code: bible-dictionary, bible-aligned-translation, word-pair-list, knowledge-base, encyclopedia-titles, and so on.

### How each M id gets its kind and its own words

**By its source key, never by M id.** `index.m_sources[M].key` names the source key. The source key is in exactly one family. The family has one kind and its own words.

- The store's index names 146 M ids under **38 source keys** (counted from `route-store/index.json`).
- A new table of an existing source lands as a new M id under a known key and is filed with no edit.
- A new key that is not filed turns the check red, so nothing goes unfiled.

**Families and kinds come from the table**, which is on disk and checked by `../VERIFY-declare.md` (every count reproduced). The builder writes the families once from the table's census (`scratchpad/v69/declare/families.json`), then reads each family's own words from the table's «What it says it is» and «Where the quote stands», byte for byte.

- The table's kinds map onto the lead's five: bible-dictionary and bible-aligned-translation → `bible`; general-dictionary-with-entries → `general-with-entries`; rabbinic-dictionary → `rabbinic`; aramaic-dictionary → `aramaic`; word-pair-list, knowledge-base and encyclopedia-titles → `lists-and-bases`; other → `other`.
- Classical Hebrew Words stays `other` as the table files it. Kethoneth Yoseph stays `rabbinic`. VERIFY-declare challenges both (its corrections 1 and 4). Neither is in a resting entry, so nothing on a card moves either way. Re-filing either is one line, later.
- The overlays (Jastrow, the Samaritan works, Uhlemann) are filed as families with `shelf: "overlay"` and their overlay ids, so that every dictionary is in the record. No resting entry may name an overlay family in this ship: the check refuses it, because the gate reads the store's index only (§2).

**The kind that rests shut, by the table** (verified against the index today):

| family | shape | source keys | M ids (with rows) | rows |
|---|---|---|---|---|
| PanLex | word-pair-list | panlex_hebrew_english_meanings_20240301, panlex_hebrew_english_definitions_20250201 | M21, M42 | 38,255 |
| MUSE | word-pair-list | muse_hebrew_english_ground_truth_dictionary | M6, M62 (M16 none) | 24,514 |
| Lexibank (NorthEuraLex) | word-pair-list | lexibank_analysed_v2_2_northeuralex_hebrew | M64 | 974 |
| English Wiktionary's translation tables | word-pair-list | kaikki_english_wiktionary_hebrew_translation_table, dbnary_english_wiktionary_hebrew_translation_gloss | M34, M37 | 7,006 |
| ConceptNet 5.7 | knowledge-base | conceptnet_5_7_hebrew_english_cc_by_sa_4_0, conceptnet_5_7_hebrew_english_cc_by_4_0 | M1, M22 | 13,978 |
| OmegaWiki | knowledge-base | omegawiki_structured_defined_meaning | M32 | 5,363 |
| Wikidata's Hebrew lexemes | knowledge-base | wikidata_hebrew_lexeme_gloss, wikidata_hebrew_explicit_form_english_sense | M2 M10 M28 M48 M53 M61 M73 M76 M81 M87 M94 M138 (M194 none) | 11,743 |
| Hebrew WordNet | knowledge-base | omw_hebrew_pwn30, omw_hebrew_oewn2025_permanent_sense_key_bridge | M43, M57 | 4,487 |
| Hebrew Wikipedia's titles | encyclopedia-titles | wikimedia_hebrew_english_interlanguage_title_20260701 | M15 | 12,354 |
| **9 families** | | **14 keys** | **27 M ids, 25 with rows** | **118,674** |

The two English-Wikipedia intro keys (18 M ids, no row) are filed `other`, as the table files them. The page reader's «16 keys, 45 M ids» counted them in; this record does not. That moves nothing, because they have no rows.

**Wiktionary's name category:** key `kaikki_wiktionary_hebrew` (M11 M13 M25 M50 M69, 1,590 name rows) and key `kaikki_wiktionary_aramaic` (M60 M72 M177, 92 name rows).

### The predicate: one rule, one place

`reader/tools/dictionary-kinds-v1.mjs` exports:

- `DICTIONARY_KINDS_RULE_ID`
- `readKinds(readerDir)`: returns the record and its sha256, or throws.
- `restsOffOf(rec, mSources, factsOf)`: returns `(row) => entry | null`. It resolves each entry's `kinds`/`families` to source keys once, then answers per row: the first entry whose keys hold `mSources[row[3]].key` and whose `fact`, if it names one, is truthy in `factsOf(row)`.
- `restsOffIds(rec, mSources)`: the M ids of entries that name no fact (the whole-source entries). The search and the rail use it.

The module imports nothing from the store reader; `factsOf` is passed in. The page carries `restsOffOf` under the same name, as it carries `nameWithheld` (zone.html 3200, «the function of tools/names-gate-v1.mjs, name for name»). A check runs both over the same rows (§4, K2).

A later category of a dictionary is one more `rests_off` line, once the corpus lane's store carries it in the facts slot: a part of speech, a label, a topic. Examples:

- `{ "families": ["english-wiktionary-hebrew-entries"], "fact": "pos", "is": "prefix" }`
- `{ "families": [...], "fact": "labels", "has": "slang" }`

`restsOffOf` reads `is`/`has` beside `fact` in the first ship already. That is two comparisons, so the later line needs no code. Today the only category any row carries is `name` (UNDERSTAND-pipeline §1; TABLE, «What stands» 5).

### The check that holds the record to the store index

The check is `tools/check-dictionary-kinds-v1.mjs`, laws K1–K3 (§4).

- Every source key in `route-store/index.json` m_sources is in exactly one store family.
- Every family key is in the index, and every overlay family's ids are in its overlay index.
- Every family's kind is one of `kinds`.
- Every resting entry resolves to at least one key, and names no overlay family.
- Every `own_words.where` names a file that is in the tree, or one of the corpus lane's records the table names.
- Its count line prints the kind's keys, M ids and rows, counted from the shards, and the fact entry's rows. It names no figure in its source.

---

## 2. The page: `reader/zone.html`

Model: the word senses switch (3603–3640, 7882–7896, 8049–8066, 11064–11076, 15067–15074, 17565–17592). The kinds switch is its sibling.

### What changes, function by function

**A. State and memory, beside `SENSES_KEY` (3621).**

- `KINDS_KEY = "fh.kinds"`.
- `kindsPref`: `?kinds=open|shut` for one load (checks); else `localStorage[KINDS_KEY]`; else `"shut"`.
  - Stored as `"open@<record version>"`. A reader's «open» holds only for the record version they opened. A new resting line in a later record (a new category) rests shut for everyone until they open it again. This is the same once-per-version idea as `fh.sources.defaults` (4059, 4383–4391).
- `window.__kinds` holds `"shut"` or `"open"`.
- `let KINDS_REC = null;`, `let restsOff = () => null;` and `let RESTS_OFF_IDS = new Set();` are set when the record arrives.
- `chooseKinds(id)` stores the choice and calls `reopenForKinds()`. `reopenForKinds` is assigned beside `reopenForSenses` (17587):
  - shutting forgets the picks of shut readings;
  - then `paintKindsPill()`;
  - then `railSwitch()` if the rail is drawn;
  - then `reopenCard()`.

**B. The predicate**, beside `factsOf` (2813): `const restsOffOf = (rec, mSources, factsOf) => …`, the module's function name for name.

**C. The boot fetch (4310–4342).**

- Add `fetch(`${ROOT}data/dictionary-kinds-v1.json`)`, non-fatal like its neighbors.
- Once the store index is in hand (beside 4383): `restsOff = restsOffOf(KINDS_REC, index.m_sources, factsOf)` and `RESTS_OFF_IDS = new Set(restsOffIds(KINDS_REC, index.m_sources))`.
- **If the record does not arrive**, nothing is gated on the card on that visit. The page sets `window.__kindsFailed = true`, and the rail's switch reads «the record of what rests shut did not arrive; nothing is shut on this visit». The line stays right regardless, because it was baked at rest.

**D. `spanRowsOn` (4047).** A span row is dropped where `restsOff(r.slots)` answers, whether or not the kind is open. Span rows carry no facts slot, so only the whole-source entry reaches them. The span line is a line, and the line never reads a shut row (§0.4). Span rows are filtered at runtime today, so nothing here asks live.

**E. `poolFor` (7667): one gate.** It sits right after the source switches (7838–7850), before the sense openings (7859). It applies to `routes` only, the store's rows: an overlay's id is not in the store's index, so `restsOff` answers null for it.

```js
// THE DICTIONARIES THAT REST SHUT (dictionary-kinds-rule-v1) …
let shutRows = [];
if (!opts.everySource) {
  if (kindsPref === "shut") { const kept = []; for (const row of routes) (restsOff(row) ? shutRows : kept).push(row); routes = kept; }
}
```

- **Its place among the gates** is after the entry gate (7698), the names gate (7720) and the source switches. So:
  - A row the names gate withholds (an English Wiktionary name row at a non-name place, under «only») is counted there, «given as a name by its source, withheld», as today.
  - At a name place, under «keep», or anywhere the names gate does not ask, this gate takes it.
  - A row of a source the reader switched off is counted by the switches.
  - No row is counted twice.
- **The count is in pills, as the card prints them, not in rows.** This is the rule of `sensesDrawn` (7890) and its Obadiah 1:3 lesson. It is computed after `groups` is built (7908–7926) and before `sortPool` (8048):
  - Use the grouping's own key: `nd ? \u0001nd\u0001${m}\u0001${routePrinted(row)}` else `readingKey` of each `readingsOfRow(row)`.
  - Skip a shut row that is a sense opening (`senseOpened`).
  - A key already in `groups` is not counted: it is a reading an open row also prints, and it stands credited to the open row. That is automatic, because `leadRecord` (6005) and the grouping see kept rows only.
  - Each key is counted once, under the first entry, in the record's order, whose row prints it.
  - The result is `pool.withheldByKind = [{ id, say, n }]`, entries with `n > 0` only.
  - With the kind open, `pool.kindsShown` is the number of groups whose every record answers `restsOff`: the pills a shut would take away.
- Set the two at 8049–8052 and add them to `carryWithheld` (8061–8066).

**F. The card's withheld line (11053–11078).** Add a `<button class="kinds-switch">`, a sibling of `.senses-switch`, with the same handling:

- `aria-label` «dictionaries shut at rest» and `aria-pressed` (pressed = open).
- After a rebuild the focus comes back to it through a `kindsFocus` flag.
- Shut: «24 from word lists, knowledge bases and encyclopedia titles · 3 that English Wiktionary files as a name · show». It is the `n` and `say` of each entry, joined by « · », then « · show».
- Open: «27 shut at rest, shown · hide».
- `pills.dataset.kindWithheld = String(total)` goes beside 11036, for the checks.
- The line's guard (11055) adds `pool.withheldByKind?.length || pool.kindsShown`.

**G. The empty card (10467–10476).** Its guard adds the kind.

- The bit reads: `${n} reading${n===1?"":"s"} shut at rest: ${each n and say} — the button opens them`.
- The same `.kinds-switch` button is appended to the paragraph.
- «No record is left to read here. Nothing here says the shelf lacks it.» stays.
- This is where a card emptied by the kind is met: in the Bible, 28 keys at 44 places, though the place's own line still stands there; in the Tikkunei Zohar, 336 keys at 3,360 places (`card_measure_table.out`, before the other gates).

**H. Picks.**

- Where a pick is made (10846, 10941), add `kind: true` when `group.records.every((x) => restsOff(x))`, beside the existing `sense` flag.
- Pull `forgetSensePicks` (17565) into `forgetPicksWhere(test)`. `forgetSensePicks = () => forgetPicksWhere((pk) => pk.sense)` keeps its name, and `forgetKindPicks = () => forgetPicksWhere((pk) => pk.kind)`. One loop, two callers.
- Recommended: an opened kind's pill wears the class `rests` (beside 10966's `sense`) and a quiet dotted border, so the reader sees which pills the press brought.

**I. The rail.** In `sourceSwitch` (14736), one block sits above the shelf chooser (14820). Its title is «Shut at rest», and it holds:

- one switch: «shut | open», `aria-pressed`, calling `chooseKinds`;
- a line per resting entry, from `zone.emitted_from.rests_off.entries` (baked, §3):
  - the whole-source entry lists its families, with their shut source keys as chips of class `kind-chip`, never `.dfp`;
  - the fact entry reads «what English Wiktionary files as a name: N readings on this book».

How the chips behave:

- While shut, the chips are drawn shut and disabled. Their title is the family's own words, or «says nothing of itself in any record read», then «shut with word lists, knowledge bases and encyclopedia titles; the switch above opens them».
- Open, each chip is a source switch like any other: it adds or deletes its ids in `sourcesOff` through `TOGGLES {id:"sources"}.set` (4146–4156).
- These chips are not in `groups` (the baked table, 14736–14812). They sit on no shelf (`SHELVINGS` 14716) and have no `priceOf`. A chip says «on cards only: the line under a word never reads it».
- The kind's sources are left out of the baked `toggles.sources` table by the bake itself (§3), so the shelves stay priced exactly as baked. check-source-switch S1f and S0 read only `.dfp` chips and the baked sets, and they stand.

**J. `railSay` (14342).** «N dictionaries · K off» keeps counting the reader's own `sourcesOff`. Add « · M shut» while shut, where M is the number of shut source keys this book carries. `sourcesOffSay` (14129) does not change: the kind is never in `sourcesOff`.

**K. The header pill (recommended).** `#kindsPill` sits beside `#sensesPill` (2524), painted by `paintKindsPill` beside `paintSensesPill` (15067–15074).

- It reads «shut dictionaries» with `aria-pressed` (pressed = open).
- Its title is «Word lists, knowledge bases and encyclopedia titles, and what English Wiktionary files as a name: shut on every card until you open them. The line under a word never reads them. Kept on this device.».
- The reason is the senses pill's reason: the card's line folds away on a phone. The Menu mirrors it with no new code (`paintMenu` 17913).

**L. Reset (15307–15373).**

- `SWITCHES_DEFAULT.kinds = "shut"` (15315).
- `switchesAtDefault` adds `kindsPref === SWITCHES_DEFAULT.kinds` (15323–15325).
- The click handler adds `if (kindsPref !== SWITCHES_DEFAULT.kinds) chooseKinds(SWITCHES_DEFAULT.kinds);` beside 15365.
- The pill's title (2553) adds «the word lists and knowledge bases shut».
- Reset does **not** touch `sourcesOff` or `SOURCE_DEFAULTS`, as today. Uhlemann stays the reader's own.

**M. Search `english()` `off` (15447).** Add `if (kindsPref === "shut" && RESTS_OFF_IDS.has(id)) return true;`. With the kind shut, the search answers what the cards show, and opening it brings the kind back. The fact entry is baked out of the index (§3), so the search never finds a name of English Wiktionary's, open or shut. That is a stated limit of the index, which counts per source and not per category.

**N. A check hook.** `window.__restsOffIds = [...RESTS_OFF_IDS]` and `window.__kindsVersion = KINDS_REC?.version`.

### What stays untouched

- **The line.** `lineUnder` (13078), `placeLine` (13057), `partNeedsLive` (14144), `repaintLive` (14155) and `materialise` (17491) stay as they are. The kind is never in `sourcesOff`, and the bakes leave it out. So no word asks live at rest, in any book.
- **The default sources.** `defaultAt` (5784), `dfltOn` (3716) and `dfltAuto`: all four sources and their seconds are Bible dictionaries.
- **The names gate.** `nameWithheld` (3200) and its call (7720–7726) stay exactly as they are, for every dictionary's name rows. Wiktionary's name rows meet it first wherever it asks.
- **The orders.** `sortPool` (8087), `EARLIEST_FIRST` (5999), `leadRecord` (6005), `CORPUS_OF` (2897), the era and outside orders (8126–8127), the shelvings (14716) and `priceOf` (14749).
- **The word senses**, everywhere.
- **`SOURCE_DEFAULTS`** (4383–4391): it is reader-owned, and reset leaves it alone. The two resting mechanisms differ on purpose: a source the owner rests off becomes the reader's own switch, while a kind is a gate that reset returns to.
- **`attributionFor`** (6028): `everySource` lifts the kind with the switches.
- **The concordance table** (`DICT`, 8349 on) and the suggested BSB cell (10382).
- **No Hebrew characters in any string literal**; every user-facing string is in the record (`say`) or is American English as above.

---

## 3. The bakes: what is baked at rest is baked with the shut rows out

**One place: the store reader.** `tools/gloss-store-v1.mjs` changes `openRouteStore(storeDir)` (187) to `openRouteStore(storeDir, { atRest = false } = {})`:

- With `atRest`, it reads `readKinds(join(storeDir, ".."))`. It refuses output if the record is missing.
- It builds `withhold = restsOffOf(rec, index.m_sources, factsOf)`.
- The internal `routesFor` (218) returns the rows with `withhold(row)` false, memoized per key. Every function closed over it is therefore at rest with no other edit: `readingPool`, `glossFor`, `tableFor` (453), `carriersOf`.
- The returned object adds `routesWhole(k)` (the unfiltered rows, the same shard cache) and `atRest: { rule, version, sha256 } | null`.

**Which tools open it at rest:**

| tool | change | why |
|---|---|---|
| `tools/regloss-zone.mjs` | line 69: `openRouteStore(storeDir, { atRest: true })` | `zone.gloss`, `gloss_m` (`by`/`alt`), `gloss_orders`, `gloss_m_orders`, `gloss_names` and the switch table are then baked over open rows only. A shut source drops out of `toggles.sources.sources` by itself, because `sourceSwitchCosts` (gloss-m-v1 141) lists the sources that carry a reading. The shelves' joint prices (`jointSwitchCosts` 249) price only open sources, and the page's shelves are built from that table, so the sets still match. |
| | after 430: write `zone.emitted_from.rests_off` and add it to the post-build fields (439) | Contents: `{ rule, record: "data/dictionary-kinds-v1.json", version, sha256, entries: { <id>: { say, ids: { <M>: <keys of this book carrying a row of it> }, rows } } }`, counted with `routesWhole` over the book's keys. The rail draws the kind's block from it (§2 I) with no fetch. |
| `tools/project-lattice-v12-v1.mjs` | line 138: `{ atRest: true }`; stamp `sidecar.rests_off = { version, sha256 }` | Every leader is derived from `store.routesFor` (333, 496): o.m, o.x, o.c, l, la, s, the per-place e[…].l/la, and nl. They become the rest leaders with no other edit. That covers the re-lead the pipeline reader asked for: a word whose l is the kind's reads the next open reading, not la-then-bare. The lattice's own cards (`list`, the fingerprints) come from the lattice file, not the store, so the grades do not move. |
| `tools/bake-search-index-v1.mjs` | in the row loop (256–258): `if (restsFact(row)) continue;`, where `restsFact` is `restsOffOf` limited to entries that name a `fact` | The index counts per source, so a whole-source entry is filtered live by the page (§2 M). A category inside a source cannot be, so it is left out of the index. It writes `rests_off: { version, sha256, facts_left_out: n }` in its header. |
| `tools/card-readings-v1.mjs` | the lifted state (88–89): `keep` adds `"fh.kinds": "open@<version>"` (read from the record) and `holds` adds `kinds: "open"`; the page state (169) adds `kinds: window.__kinds`; the refusal (244) compares `kinds` | Lifted means every switch that withholds a reading is lifted. |
| `tools/resting-lines-v1.mjs` | state (109) adds `kinds: window.__kinds` | The records say they were read with the kind shut. Every record names the record file by sha256, so all 40 are read again. |

Not changed, and why:

- `bake-witnessed-order-v1` (71): its witnesses are old sources at a verse. It refuses a text no served row accounts for, so it keeps the whole store. The check (K3) proves that no witnessed column credits a shut id.
- `bake-default-picks-v1`: no default source is in the kind.
- `build-front-door-v1` and the count stamps: they follow the records.
- `build-zone`, `enrich-gloss-m-v1`, `redrive-zone-gloss-v1`: not in the round.

`reader/PIPELINE.md` and `PIPELINE-MANIFEST.md`: the zones step and the lattice step name `data/dictionary-kinds-v1.json` as an input, read through `openRouteStore(…, { atRest: true })`.

**The round:** the whole round, with `--lattice` (about 43 minutes). The record is an input of the zones and lattice steps; the lines, chain, search, records and door follow.

---

## 4. The checks

### New: `tools/check-dictionary-kinds-v1.mjs`

**K1. The record holds to the store.**
- Law: every source key of the store's index is filed in exactly one family, and every family is under one kind of the record.
- Every resting entry resolves to at least one key, names no overlay family, and has a `say` with no Hebrew letter.
- Every family has own words with where they stand, or says that it is silent.
- Count line: the kind's keys, M ids and rows, counted from the shards, and the fact entry's rows.

**K2. One rule, one place.**
- Law: the page's `restsOffOf`, read out of zone.html and run, answers the same as the module's on every row of every key that holds a shut row, and on one row of every other M id. That is all 1,682 name rows, and every row of the 25 shut M ids.
- This is the method of check-names-gate N6.

**K3. The bakes are at rest.**
- Law: every zone and sidecar names this record's sha256 (`emitted_from.rests_off`, `sidecar.rests_off`).
- No line column names a whole-source shut id: `gloss_m[k].m`, `.by`, `.alt.m`/`.alt.by`, `gloss_m_orders`, the witnessed columns, the lattice's o.m/o.x/o.c/o.l/o.la/o.s and e[…].
- No baked reading is carried only by fact rows. A rebuild with `glossFor` over the at-rest store gives the zone's `zone.gloss` at every key of two books (Genesis, the Tikkunei Zohar).

**K4. The page at rest.** One browser page, Genesis, a fresh reader.
- Law: a fresh reader finds `__kinds` «shut» and `__sourcesOff` exactly as `source-defaults` gives it.
- At Genesis 1:22, the פרו card carries no pill whose every carrier is a shut row; its withheld line has a `.kinds-switch` with `aria-pressed=false` and a count > 0.
- One press opens: the count's pills appear, `aria-pressed=true`, and `fh.kinds` is stored. A reload keeps it open.
- Reset returns to shut and leaves `fh.sources.off` alone.
- The rail's shut block is present, and its chips are disabled while shut.
- `railSay` does not count shut ids as off.
- No word asked live at first paint (`window.__livePending` falls to 0 and the live-ask counter stays 0).

**K5. The records and the chain books.**
- Law: every resting-lines record says `kinds: "shut"` and credits no shut id.
- The chain books' lifted state holds `kinds: "open"`.

### Amended

| check | the law, amended |
|---|---|
| `check-same-product-v1` (the gate) | `--expect` may be given twice, and a file is told by its `rule_id`. With `--expect data/dictionary-kinds-v1.json`: **S1**, a line that differs is one whose old chip is a shut id; or whose old `gloss_m.by`/lattice carriers (old zone) include a shut id (the rank-loss class); or a span line whose old chip is a shut id. Its new chip is not a shut id. And every old line on a sampled page whose chip was a shut id differs. **S2**, a card that differs lost only pills whose every old carrier is a shut whole-source id or a family of a fact entry. The new card's `data-kind-withheld` is at least the number of those pills. The new card has no pill the old card lacks. The common pills keep their order. The pressed pill differs only where the line differs as owed. |
| `check-chain-book-v2` (176) | the lifted state compared includes `kinds: "open"`; at rest it equals the resting-lines records' state, which now carries `kinds` |
| `check-search-v1` (322, 430, 745) | `offOf` also holds `window.__restsOffIds` while `__kinds` is «shut». Its model leaves out the fact entry's rows as the index does: «a source the record rests shut is left out of every count here as the page leaves it out». |
| `gated-card-v1` | `openGatedCard(…, { kinds })`: «rest» (shut) unless asked; «open» sets `?kinds=open`. `check-names-gate-v1`, `check-names-pill-v1` and `check-proper-name-v1` ask with `kinds: "open"`, because they hold the names gate, not the kinds. A law that says «at a name place the row stands» stays true there. |
| the checks that rebuild a baked line from the store: `check-carrier-survives-v1`, `check-lattice-projection-v1`, `check-proper-name-v1`, `check-sense-openings-v1`, `check-antiquity-tier-v1`, `check-witnessed-order-v1` | each opens the store with `{ atRest: true }` wherever it compares with a baked column, and keeps the whole store wherever it compares with a card opened with the kind open. The builder reads each one first (they hold 13, 2, 1, 2, 0 and 0 store calls against `zone.gloss`/`gloss_m`/`o.*`). |
| `check-default-picks-v1` D3 | unchanged in law. It is re-run after the lines, and the round already rebakes the defaults if it goes red. |
| `check-source-switch-v1` S0, S1, S1f | unchanged. The kind's chips are not `.dfp` and are not in the baked table. The design keeps it that way on purpose. |
| checks that clear storage and set `fh.sources.off` (P5 of check-line-reads-the-place, L1 of check-disk-gloss-is-the-line, check-card-opens-on-the-line, check-masorah-toggle, check-overlays) | unchanged. They now run with the kind shut, which is the rest, and the baked line they compare against is baked at rest. |

**The gate's command for this ship:**

`node tools/check-same-product-v1.mjs --old <live> --new <built> --expect data/default-picks/index.json --expect data/dictionary-kinds-v1.json --diff build/kinds-gate.diff`

The diff file is kept with the ship's notes. Each moved line and each card is named there by class.

---

## 5. What moves at rest (from the measures; how each was got is beside it)

**The line, Bible books** (`UNDERSTAND-pipeline` §3, membership B = this kind; the re-lead rebuilt from the tree's modules, checked at 183,430 of 183,434 baked leaders):

- **39 one-word lines change:**
  - 23 to a Bible dictionary, e.g. 2 Kings 18:17ff «Rabshakeh» [PanLex] → «Rabshakeh, a Babylonian official» [Strong's]
  - 8 to the place's own source
  - 7 bare, e.g. Psalms 63:3 «war front, ...», Ecclesiastes 11:9 «young woman»
  - 1 to English Wiktionary (Proverbs 30:10)
  - These include the 2 rank losses, «three» → «+ fork» at Esther 9:17 and 1 Chronicles 23:23.
- **521 multi-word (span) lines credited to the kind:**
  - 502 go to the next open row: 370 Wikidata «the Jewish people» → English Wiktionary «the Children of Israel, Israelites, Jews» (the Exodus 1:1 class, task 58), and 98 «human, common name of Homo sapiens…» → «son of man; human being»
  - 19 fall back to their words' own lines (`span_lines_table.out`)
- **0 lines from Wiktionary's name category**: the span store carries no facts slot, and no other Kaikki-credited line reads a name row only (`kaikki-lines2.mjs`).
- **0 live asks at first paint**, by construction.

**The line, Tikkunei Zohar** (not measured under a bake at rest; bounds only, from `UNDERSTAND-page` §2, §6):

- 8,358 span lines are credited to the kind.
- 336 keys at 3,360 places have only the kind's readings, so their line goes bare.
- 13 keys at 78 places read only English Wiktionary name rows, so their line moves or goes bare (Jerusalem, Boaz, Obadiah, Kabul, Kyiv).
- The exact count is a step of the proof (§7).

**The cards:**

| | pills that leave | cards that lose a pill | cards left with no pill | how |
|---|---|---|---|---|
| this kind + the name category, single-piece cards, 39 books (BN) | 1,153,535 of 9,549,682 | 126,944 of 160,111 | 59 | rebuild, ±6.7% against the 12 chain books |
| the kind as MEASURES files it (without M34/M37), every card, 39 books | 1,961,194 of 16,348,776 (12.0%) | 224,736 of 305,149 | 62 where the kind is all the card has | rebuild validated 14/14 live cards and 14,354/14,354 chain cards |
| the name category alone, Bible | 77,759 pills only it prints, on 3,314 keys at 39,726 places | | | before the names gate, which already takes them at non-name places under «only» |
| Genesis 1:22 פרו | 6 of 23 rows' pills only the kind prints: Peru, Republic of Peru, Tarica, country in South America, pro, OmegaWiki's definition | | | `card_measure_table.out` |

**The search at rest:**

- 13,588 of 156,892 folded English readings answer nothing; 24,127 of 484,737 pairs drop (`search_measure_table.out`). «peru», «republic of peru», «tarica» and «wheatberry» find nothing; «sperm» keeps M17.
- English Wiktionary's 1,682 name rows leave the index outright. Not measured in readings.

---

## 6. The build, in parts

The parts are cut so that two builders never edit the same lines. The interface they share is fixed here:

- the module exports in §1;
- the page names `kindsPref`, `chooseKinds`, `reopenForKinds`, `restsOff`, `RESTS_OFF_IDS`, `KINDS_REC`, `paintKindsPill`, `forgetPicksWhere`, `pool.withheldByKind`, `pool.kindsShown`;
- the zone field `emitted_from.rests_off`.

1. **The record and the rule** (first; small). `reader/data/dictionary-kinds-v1.json`, `reader/tools/dictionary-kinds-v1.mjs`, and `reader/tools/check-dictionary-kinds-v1.mjs` K1 and K2. K2 runs once part 2 lands, and skips with its reason until then. The families are written from `scratchpad/v69/declare/families.json`, with own words copied from the TABLE.
2. **The page: state, pool and card.** zone.html around 2813, 3621–3640, 4047, 4326–4391, 7850–7860, 8044–8066, 10462–10478, 10846, 10941, 10966, 11036–11078, 17565–17592. Depends on part 1's record shape only.
3. **The page: rail, header, reset, search, Menu.** zone.html around 2518–2556, 14320–14347, 14736–14930, 15067–15074, 15307–15373, 15442–15456. It uses part 2's names. It can be written alongside part 2, since the line ranges do not meet, and is merged after it.
4. **The store reader and the bakes.** `tools/gloss-store-v1.mjs` (187–218, 483), `tools/regloss-zone.mjs` (69, 409–439), `tools/project-lattice-v12-v1.mjs` (138 and the sidecar stamp), `tools/bake-search-index-v1.mjs` (256–258 and its header), `reader/PIPELINE.md`, `reader/PIPELINE-MANIFEST.md`. Depends on part 1's module.
5. **The read-off tools and the amended checks.** `tools/card-readings-v1.mjs`, `tools/resting-lines-v1.mjs`, `tools/gated-card-v1.mjs`, `check-chain-book-v2`, `check-search-v1`, `check-same-product-v1`, the six rebuild checks, the three names checks, and K3–K5 of the new check. Depends on parts 1 and 4's API. It can be written alongside 2–4.

Order: 1, then 2, 3, 4 and 5 together, then the proof (§7), then the lead's round, suite and gate.

---

## 7. How it is proven before the lead's round

Each step is run on one book at a time, under `nice -n 15`, in a scratch copy of the built tree. None is a suite, a round or a gate.

1. **The record:** K1 and K2 green, with their count lines equal to §1's table (14 keys, 27 M ids, 25 with rows, 118,674 rows; 1,590 + 92 name rows).
2. **A one-book bake:**
   - `regloss-zone` on Genesis, on Exodus and on the Tikkunei Zohar's zone into scratch, with `--store` the tree's store.
   - Diff old against new `zone.gloss`/`gloss_m`. Every key that moved must have had a shut id in its old `by`, and no new `by` names one.
   - Print the moved keys by class: to a Bible dictionary, to the place's source, bare, rank loss. Genesis and Exodus must agree with the pipeline reader's `measure.out` rows for those books. Exodus carries «the Jewish people».
   - The Tikkunei Zohar's count is the figure §5 lacks.
3. **A one-book projection:** `project-lattice-v12-v1` on Genesis with the lattice folder the lead's round uses (read only). Check that o.l moves only where its carriers held a shut id, and check K3 on that sidecar.
4. **One page probe:** the scratch tree served on a free port, headless, one page, Genesis then the Tikkunei Zohar.
   - K4's laws.
   - Genesis 1:22's card text, opened and shut.
   - Exodus 1:1's span line.
   - The live-ask counter at 0 after first paint on both.
   - A screenshot of the card's withheld line and of the rail's block at phone width.
5. **A two-book gate dry run:** `check-same-product-v1 --every 39 --chapters 1` between the live tree and the scratch tree, with both expectations. Every difference must be accounted for. A difference that is not names a fault before the round does.

**Not established, and left for the proof or for later:**

- What the bake at rest changes in the Tikkunei Zohar (step 2 counts it).
- The rank-loss class across all cards (step 2 counts it per book; the gate's `--diff` lists it).
- Exact pill counts on the 144,258 piece cards outside the chain books (the round's chain step reads 12 books; the rest are estimated at ~10%).
- Whether `check-default-picks-v1` D3 goes red at the 39 moved lines (the round handles it).
- Whether the concordance table lists the kind's providers for an open reading (untouched by this ship).
- What the 92 Aramaic-entry name rows move (expected small; step 2 on Daniel would show it).
