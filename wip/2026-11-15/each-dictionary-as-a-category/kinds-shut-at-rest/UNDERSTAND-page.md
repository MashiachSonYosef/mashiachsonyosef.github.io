# Kinds shut at rest: what the page does today, and the least that gives the first ship

15 November 2026. The page part of the kinds-shut-at-rest design. Read only: the tree is `main 46bbbf7d50` (scratchpad/rt), `reader/zone.html`, 18,213 lines. Every line number below is in that file. Nothing served was changed.

The run before this one was stopped partway. It left scripts and one output in the scratch folder (`scratchpad/v70/page/`): `fn-map.txt`, `kinds_provisional.py` (a regex stand-in for the kinds, written before the table landed), `rest_model.py` + `rest_model.out`, and `card_measure.py`, `search_measure.py`, `span_lines.py` with no saved output. It left no notes file. I reused all the scripts. I reran them under the table's own kinds (`kinds_table.py`, below) rather than the regex, and saved each output beside its script (`*_table.out`, `wikt_names.out`).

## 0. The kind, as the table files it

The table of the 119 is on disk (`../TABLE-what-each-dictionary-is.md`). `MEASURES-what-each-kind-supplies.md` is not. Its last kind is the table's word-pair-list, knowledge-base and encyclopedia-titles. On the page's own unit, the source `key` (what the rail groups chips by and what `source-defaults-v1.json` already keys by), that is 16 keys and 45 M ids (`kinds_table.py`):

- **word-pair-list:** PanLex ×2, MUSE, Lexibank, English Wiktionary's translation tables (Kaikki's table M34, DBnary M37)
- **knowledge-base:** ConceptNet ×2, OmegaWiki, Wikidata ×2, Hebrew WordNet ×2 (omw_*)
- **encyclopedia-titles:** Hebrew Wikipedia's titles
- **no rows:** the two English-Wikipedia intro keys; the table calls them «other», 0/18

25 of the 45 ids have rows: 118,674 store rows.

Two places where the table differs from the lead's list:

- **Hebrew WordNet** is in the kind.
- **English Wiktionary's translation tables (7,006 rows)** are in the kind. The table files them as word-pair-list, apart from English Wiktionary's own entries.

The earlier regex left both out. The figures below are the table's.

## 1. The sources switch, end to end

- **State.** `SOURCES_KEY = "fh.sources.off"` (2983). `let sourcesOff = new Set(JSON.parse(localStorage…))` (2984) is read once, at parse time, before boot. Its ids are M ids. A copy for checks sits in `window.__sourcesOff` (2993).
- **Kept on the device.** The registry entry `TOGGLES {id:"sources"}` (4142) has `set(ids, on)` (4146–4156). It adds or deletes each id, writes `localStorage[SOURCES_KEY]`, then calls `rebuildSourceWords(); paintDefaultPills(); dfltRailRows(); dfltSay(); repaintGlossOrder(); reopenCard()`.
- **Two more writers at boot:**
  - The overlay migration (4368–4377): a reader who had turned an overlay's old single switch off gets its ids.
  - **The resting-off record, `data/source-defaults-v1.json`** (fetched at 4338; merged at 4383–4391). This is the precedent nearest the new ship.
    - It is a hand record, `{version, off: {<source key>: {why, ruling}}}`, today holding only Uhlemann's Latin (2026-10-03a).
    - Once per version, for each reader (`DEFAULTS_KEY = "fh.sources.defaults"`, 4059), every M id whose key it names is added to the reader's own `sourcesOff`.
    - From then on the reader owns it. **Reset does not touch it** (see below).
- **At rest today.** For a fresh reader, `sourcesOff` is Uhlemann's ids (MSAM2), not empty. Every `sourcesOff.size` test in the page therefore already runs at rest. Uhlemann carries no resting line: the line model below finds 0 live asks with MSAM2 off.
- **The rail's strip.**
  - `sourceSwitch` (14736) draws the strip from the book's baked table `zone.emitted_from.toggles.sources.sources`, with per-id `leads/carries/changes/darkens/wc/lic/y`, plus the overlays' per-book counts (`OVERLAY_BOOKS`).
  - It groups chips by source `key`. Each set is priced from `rec.joint.sets[sorted ids]`, the joint-switch-cost bake (`priceOf`, 14749). A set that is not baked says «not baked».
  - Chips are laid on shelves by `SHELVINGS` (14716: century / language / license), kept as `fh.sources.shelve` (2991).
  - `isOff(g)` = every id of the group is in `sourcesOff` (14817).
  - A chip (`chip`, 14835) is a switch box plus a name that opens the source's declarations. Its title already says «rests off until you turn it on: <why>» for a `SOURCE_DEFAULTS` key (14854).
  - A shelf's switch flips every id on the shelf (14901–14912). `sayFold` says «N sources · K switched off».
  - The rail's indicator `railSay` (14320) prints `«<n> dictionaries · <sourcesOff.size> off ▾»` (14342). That counts **ids**, not sources.
- **How an off source leaves a card.** `poolFor` (7667) drops it at the row grain, after the entry gate (7698), the names gate (7720), the pointing, and the stem (≈7825). The drop is at 7841–7850: `routes.filter(row => !sourcesOff.has(row[3]))`, and the same for `extra` (the overlays' rows). `withheldBySources` counts **records (rows)**, not pills. `opts.everySource` lifts it (used by `attributionFor`, 6028).
  - A reading an off source shares with an on one stands, credited to the on one. This is automatic: the off row never enters the group (`groups`, ≈7915), so `leadRecord` (6005) and the chip see only on rows. **The lead's «credited to the open one» needs no new code at the card.**
- **What the card says.**
  - On the card's withheld line (`drawPills`, ≈11053–11078; the dataset at 11039): `«${n} withheld by your source switches (${sourcesOffSay()})»`.
  - On a card the switches emptied (10467–10476): `«N records withheld by your source switches — K sources off»` + «No record is left to read here. Nothing here says the shelf lacks it.».
  - `sourcesOffSay` (14129) counts source keys among `sourcesOff` that this book's record knows.
- **Reset.** The reset block (15307–15373) uses `SWITCHES_DEFAULT = {mode, blobs, nums, dict, signs, namelead, senses, defaults}` (15314), `switchesAtDefault` (15323) and the click handler (15331). **It does not touch `sourcesOff` at all.** The pill's title (2553) lists what it resets, and sources are not in it.

## 2. The line under a word when a source is off

`lineUnder` (13078) reads in this order. Every source test reads `sourcesOff`.

1. **The headword switch.**
2. **`defaultAt`** (5784): the default sources STEP/MACULA/UBS/BDB, from `data/default-picks/`.
   - `dfltOn(id)` (3716) = the source's M is not in `sourcesOff`.
   - The auto second is `dfltAuto` (≈3728), among the four only.
   - All four are Bible dictionaries, **untouched by the kind**.
3. **`placeLine`** (13057): TAHOT/MACULA pieces. It yields when a piece's own M is off (13060, 13073).
4. **Under «only this pointing»** (13101–13127): the lattice sidecar's leader, `onlyLeaders(gr, tags, isName)` (3313) → `l`, then `la`.
   - Each carries its carriers (`l[4]`). With every carrier of `l` off, `la` answers.
   - With `la`'s carriers off too, the result is `{why: "sources-bare"}`.
   - A name leads first where `here.nl` and the key's line is its name (`gloss_names`).
5. **The source switches** (13132–13141): where every carrier `zone.gloss_m[k].by` is off, the baked alternate `gm.alt` answers if one of its carriers is on, else `sources-bare`.
6. **The licence column** (`zone.gloss_orders[colId]` + `gloss_m_orders`, 13149–13160), then **letters / lattice orders** (13171 on), else the baked `zone.gloss[k]`.

The bakes answer only one step: «all carriers of this reading are off» (`gm.alt`, `o.la`). The comment at 2965 states the known limit.

Past that, a word goes live:

- `repaintLive` (14155) asks `partNeedsLive` (14144): any carrier off. `moved.why` is `sources` or `sources-bare`, or a baked line's `gm.by` has **any** off id.
- It then asks `poolFor(k, {storeOnly:true, word})` and prints the pool's first reading. If the pool is empty, the line goes bare: `dataset.off = "sources"`, title «no source that is switched on answers this word».
- A shard that does not arrive leaves the baked line, marked `data-off="unreachable"`.
- `materialise` (17491) calls `repaintLive` for every section built while `sourcesOff.size`.
- The card's head reading follows the live pool (9580, 9612). The baked column under the switches is `switchedReading` (5337).

**What a word shows when every reading it had came from off sources:** the empty-pool text above on the card, and a bare line with the «no source that is switched on» title.

**Measured, the line under the kind shut** (`rest_table.py`, a static model of `lineUnder` + `partNeedsLive` for one-form words; pairs (1,062) and several-form runs are not modeled; the store is not read, so a live answer is counted, not computed; output `rest_table.out`):

| | Bible books (39) | Tikkunei Zohar |
|---|---|---|
| words modeled | 305,431 | 148,277 |
| place lines (untouched) | 303,307 | — |
| lattice leaders that move | 19 (11 to `la`, 8 to the default pick) | — |
| words bare by the switch | 0 | 3,595 «sources-bare» (2,562 more move to `gm.alt`) |
| **live pool asks at first paint** | **27** | **21,866** (15,709 of them baked lines with only *some* carrier shut) |

The Tikkunei Zohar has no place readings, no lattice, and runs on oldest first, so the kind reaches it everywhere. **A page-only shut costs the Tikkunei Zohar about 21,900 live pool asks on every first paint.**

**Span lines** (`span_lines_table.py` → `span_lines_table.out`; `spanRowsOn` 4047 filters the span store's rows by `sourcesOff`):

- **Bible books:** 521 resting lines over more than one word are credited to the kind. 502 would go to the next open row; 19 have no open row, and the words' own lines stand.
  - 370 of the 502 are Wikidata's «the Jewish people» → English Wiktionary's «the Children of Israel, Israelites, Jews» (this is task 58's Exodus 1:1 class).
  - 98 are «human, common name of Homo sapiens…» → «son of man; human being (literally, son of Adam)».
  - 39 one-word resting lines in the Bible books are credited to the kind, among them PanLex's «Rabshakeh» ×16 and Wikidata's «railroad tie…» (Proverbs 30:10).
- **Tikkunei Zohar:** 8,358 lines credited to the kind.

## 3. The model to copy: «held back at rest, shown on a press»

**Word senses** (word-senses-rule-v1) is the exact model.

- **State.** `SENSES_KEY = "fh.senses"`, `sensesPref` (3621–3626). `?senses=on|off` sets it for one load (for checks). `window.__senses`.
- **The switch.** `chooseSenses` (3632) stores it and calls `reopenForSenses` (assigned at 17587): `forgetSensePicks()` (17565) when going off, `paintSensesPill()`, the rail drawn again (`railSwitch`), `reopenCard()`.
- **In the pool** (`poolFor` 7882–7896): held back last, after every other gate. A row another gate withheld is counted there, not again. The count is **pills, not rows**, counted as the card prints them (`sensesDrawn`, the set of `readingKey`s). Counting rows once said «4» and showed 2 (Obadiah 1:3).
- **The pool carries** `withheldBySense` / `sensesShown`, set at 8051. `carryWithheld` (8062) copies every count to the card's filtered copies.
- **The card's own «show».** In the withheld line (11064–11076) a `<button class="senses-switch">` reads «N word senses, not definitions, held back — show» / «N word senses shown — hide». It has `aria-label` «word senses» and `aria-pressed`, and the focus comes back to it after the card is rebuilt (`sensesFocus`).
- **The empty card** says it too (10469).
- **The header row pill** `#sensesPill` (2524, painted by `paintSensesPill` 15067–15074). It is there because the card's withheld line folds away on a tight card, most cards on a phone (the review of 14 November, comment at 2518). The Menu mirrors it for free: `paintMenu` (17913) mirrors every visible `#modeRow` button.
- **Purple:** the `.senses-switch` / sense pill style.
- **Reset.** `SWITCHES_DEFAULT.senses = "off"`, compared in `switchesAtDefault`, put back in the click handler (15364).
- **The line.** «The resting line is the store's, and no switch moves it». A sense the reader pressed prints on its line and is forgotten when the switch goes off (`forgetSensePicks`).

**The names gate's wording**, `nameWithheld` (3200) in `poolFor` 7720–7726, only under «only» and only where the place is not a name:

- withheld line: «N given as a name by its/their source, withheld» (11060)
- empty card: «N record(s) withheld as a name — their own source gives it/them as a name, and the word here is not one» (10471)

## 4. Everything that assumes every source is on at rest

| site | what it assumes | under the kind shut |
|---|---|---|
| first paint, `materialise` → `repaintLive` (17491, 14155) | `sourcesOff.size` is 0 or Uhlemann-only, so no live asks | 27 Bible / 21,866 Tikkunei Zohar live asks unless the bake already left the kind out |
| the baked line `zone.gloss`, `gloss_m.by/alt`, `gloss_orders`, the lattice `o.l/o.la/e`, `gloss_names` (tools/regloss-zone, the lattice projector) | baked over every source | must be baked with the kind out (see 6) |
| the default picks (5784, 3716, `dfltAuto`) | — | not reached: all four sources and their seconds are Bible dictionaries |
| the suggested cell (BSB, 10382; `SUGGESTED_IX.m`) | — | not reached: its own source, not in the kind |
| the concordance table (`DICT`, 8349 on) | reads `data/dictionary-store` and never `sourcesOff` | follows the card's pressed reading; the providers' table it opens is not filtered by any switch today (not established whether it lists PanLex and the others) |
| search `english()` (15442) | drops an off source's pairs (`off`, 15447) | at rest **13,588 of 156,892** folded English readings answer nothing and 24,127 of 484,737 pairs go (`search_measure_table.out`): «peru», «republic of peru», «tarica», «wheatberry» find nothing; «sperm» keeps M17 |
| the Menu mirror (17907) | mirrors the row's pills | free if a header pill is added |
| the chapter pages' plain list (`#porch`, 775; `tools/resting-lines-v1.mjs` `readAtRest` 162) | read off a fresh page, the page's own defaults | follows whatever rest the page draws; `linesOnPage` (122) waits for the lattice and the default book file but **not for `window.__livePending`**, so a page-only shut relies on «two equal readings 350 ms apart» while live asks run |
| the reset (15314) | sources are not a reset switch | must learn the kind |
| `railSay` (14342) | `sourcesOff.size` as «N off» | would count 45 shut ids as «off» |
| `sourcesOffSay` (14129) | every off id is the reader's | would name the kind as the reader's switches |
| `withheldBySources` (7841) | every off row is the reader's | the kind needs its own count |
| checks: `tools/check-source-switch-v1.mjs` S0 (112–131: a fresh reader finds exactly the record's resting-off keys off and every other chip on), `check-overlays-v1`, `check-search-v1` 428, `rows-beside-the-store-v1.mjs` `restingOff` (62) | the resting set is `source-defaults-v1.json` | each must read the new record too |

There is no page cache keyed by «rest». Cached state is per-key: the pool cache `cache.get(poolKey(surface))` (9581), `GLOSS_STANDS`, `pickedByForm`, `DFLT_MADE`. **What is keyed by rest is baked:** `resting-lines/*.json.gz` (`state.sources_off`, resting-lines-v1 109), the zone's gloss columns, the lattice leaders, the span store order, the joint switch costs (`toggles.sources.joint.sets`, priced from all-on), and the search index (filtered live).

## 5. Pill order, the line's leader, and the era sorter

- **Pill order:** `sortPool` (8087). Its tiers are: `primary` by the order in force, then `licPref`, `namePref`, `nameLead`, `placeLead`, signs, then oldest via `EARLIEST_FIRST` (5999) / `leadRecord` (6005).
- **The line's leader** is chosen in `lineUnder` (13078) and in the bakes. The card's first pill is meant to be the line (the name lead 8166–8183, the witnessed column, the place first).
- **`source-corpus-v1.json`** is fetched at 4326 into `CORPUS_REC`. `CORPUS_OF(m)` (2897) is read in exactly three places:
  - `sortPool`'s `era` (8126, the «corpus» order)
  - `outside` (8127, «outside-era»)
  - the rail's language shelf (`g.corpus`, 14805; `SHELVINGS` 14727)
- Its use for the DEF_POS liveness is at 4603.

**What a kind may touch:** a kind withholds rows before the pool (as the switches do) and adds one count and one switch. It must not enter `sortPool`, `EARLIEST_FIRST`, `CORPUS_OF` or the language shelving. Those are orders and shelvings, and the later ship's headings are a grouping on top of them.

## 6. The least code for the first ship

### The record (one line per rule)

`reader/data/dictionary-kinds-v1.json`, loaded beside `source-defaults` in the boot `Promise.all` (4310–4340). It holds:

- **`families`:** `{family, kind, keys: [<source key>…], own_words: {text, where}}`
- **`rests_off`:** a list. Each entry is `{id, say, keys: [...]}` with optionally `fact: "name"`.

The page needs one predicate, `restsOff(row)`: the first entry whose `keys` holds `m_sources[row[3]].key` and, where `fact` is given, whose `factsOf(row)[fact]` is truthy. A later category is one more entry (a `fact` + `is` pair once the store carries part of speech or labels). No new code.

The first ship's two entries are the kind and Wiktionary's names:

```json
[
  { "id": "word-lists-and-knowledge-bases", "say": "from word lists and knowledge bases", "keys": ["…16 keys…"] },
  { "id": "english-wiktionary-name", "say": "given as a name by English Wiktionary", "keys": ["kaikki_wiktionary_hebrew"], "fact": "name" }
]
```

Not settled: whether `kaikki_wiktionary_aramaic` (92 name rows) is «English Wiktionary» for this rule. The table files it as an Aramaic dictionary, a family of its own.

### Two roads for the line (the one decision that matters)

**A. Page only.** The kind joins an effective off set, and lines move live.

- The page would keep the reader's own set apart (`sourcesOffOwn`, persisted at 2983–2984 / 4148–4150 / 4372 / 4387) and make `sourcesOff` = own ∪ the kind's ids while shut.
- **It is not enough for Wiktionary's names**, which are a row fact the line's bakes cannot see. 13 Tikkunei Zohar keys (78 places) have a baked line that only a Kaikki name row prints: «Jerusalem (a city…)», «Boaz (male given name)», «Obadiah (a book…)», «Kabul…», «Kyiv…»; `wikt_names.out`. In the Bible books, 0.
- It costs the Tikkunei Zohar ~21,900 live asks per first paint.

**B, recommended: the bake leaves the rested-off rows out of the resting line, and the page gates only the card.**

- regloss-zone and the lattice leaders are baked over the store with every `restsOff` row withheld. Then `gloss_m.by` never names a shut id, the line and its chip are an open dictionary's, and nothing on the page asks live.
- The page then needs no change in `lineUnder`, `partNeedsLive` or `repaintLive`.
- Opening the kind changes the cards, not the line. That is the word senses' own rule: «the resting line is the store's, and no switch moves it».
- The zone stamps what it baked out (e.g. `emitted_from.toggles.sources.rests_off: {version, ids}`), so a check can hold the page and the bake to one record.
- **Span lines** stay on the page: `spanRowsOn` (4047) also drops `restsOff` rows while shut. It is runtime already, with no live asks. Not established: whether span-store rows carry the name fact.

### Functions that change (road B)

1. **The new state**, beside `SENSES_KEY` (3621):
   - `KINDS_KEY = "fh.kinds"`, `kindsPref` = `?kinds=` query → `localStorage` → `"shut"`
   - `window.__kinds`
   - `chooseKinds(id)`, and `reopenForKinds` (mirrors `reopenForSenses` 17587: forget picks of a now-shut reading as `forgetSensePicks` 17565 does, `railSwitch()`, `reopenCard()`, paint the pill)
   - `restsOff(row)` beside `factsOf` (2813)
   - load `KINDS_REC` in the boot fetch (4310–4340)
2. **`poolFor`** (7667): one gate right after the source switches (7841–7850), skipped under `opts.everySource`, applied to `routes` and `extra`.
   - While shut: withhold `restsOff` rows.
   - Count **pills**, as `sensesDrawn` (7890) does: `readingKey`s the withheld rows print that no kept row prints. A shared reading is not counted; it stands credited to the open row.
   - Count per entry, for the wording.
   - Set `pool.withheldByKind = [{say, n}]` / `pool.kindsShown` at 8049–8052, and add them to `carryWithheld` (8062).
3. **`drawPills`' withheld line** (11053–11078): a `<button class="kinds-switch">` with `aria-label` «word lists and knowledge bases» and `aria-pressed`, the same pattern as the senses button:
   - shut: «24 from word lists and knowledge bases · 3 given as a name by English Wiktionary — show»
   - open: «… shown — hide»
   - also `pills.dataset.kindWithheld` (beside 11039)
4. **The empty-pool card** (10467–10476): one more bit, so a card the kind emptied says «N shut … show», not «No record is left».
   - **Bible: 28 keys / 44 places** whose every store reading (before the other gates) is the kind's.
   - **Tikkunei Zohar: 336 keys / 3,360 places.** Source: `card_measure_table.out`.
5. **`sourceSwitch`** (14736): one switch above the shelves (before `chooser`, 14820).
   - It reads «word lists and knowledge bases: shut | open», with the count of chips it holds.
   - While shut, a chip whose key is in a key-only entry is drawn shut and disabled (class `rests`), its title «shut with word lists and knowledge bases; the switch above opens them». Its `isOff` must not read the reader's `sourcesOff`.
   - Open, the chips act as today.
6. **`railSay`** (14320/14342): «· K off» stays the reader's own off count; add «· word lists shut» while shut.
7. **The reset**:
   - `SWITCHES_DEFAULT.kinds = "shut"` (15314)
   - `switchesAtDefault` (15323)
   - the click handler (15331–15367): `chooseKinds("shut")`
   - the pill's title (2553)
8. **Search `english()`** `off` (15447): also true for an id of a key-only entry while shut. The search then agrees with the card. A reading answered only by the kind is not found; saying «found only in the shut dictionaries» is optional.
9. **`spanRowsOn`** (4047), as above.
10. **Recommended: a header pill** `#kindsPill` beside `#sensesPill` (2524), for the reason the senses pill exists: the card's line folds away on a phone. The Menu mirrors it at no cost.

### Functions that must not change

- `lineUnder` (13078), `placeLine` (13057), `partNeedsLive` (14144), `repaintLive` (14155): under B
- `defaultAt` (5784), `dfltOn` (3716), `dfltAuto`
- **The names gate** `nameWithheld` (3200) / `poolFor` 7720: the Bible dictionaries' name rows keep the gate exactly as it is. Wiktionary's name rows meet the new rule *before* it only in this sense: they are counted under the kind, not «as a name». Order the new gate before the names gate if Wiktionary's name rows must never be counted twice, or after it if «given as a name, withheld» should keep its count at non-name places. **Recommended: after the source switches and after the names gate.** A row the names gate already withheld at a non-name place is counted there, as today. At a name place, or under «keep», the new gate takes it.
- `sortPool` (8087), `EARLIEST_FIRST` (5999), `leadRecord` (6005), `CORPUS_OF` (2897) and the era / outside orders (8126–8127)
- The word senses (3621…, 7882–7896)
- `SOURCE_DEFAULTS` (4383–4391): Uhlemann stays a reader-owned resting-off source. **The two are different on purpose:** that record merges once into the reader's set and reset leaves it; the kind is a gate reset returns to.
- `attributionFor` (6028): `everySource` lifts the kind with the switches.
- The default-pick bake and the suggested cell

### What the kind holds on a card (before the other gates; `card_measure_table.out`)

| | Bible books | Tikkunei Zohar |
|---|---|---|
| distinct word keys | 39,266 | 16,943 |
| keys with a pill only the kind prints | 6,549 (24,725 such pills) | 3,466 (16,393) |
| keys where the kind shares a reading with an open dictionary | 2,582 | 1,547 |

**Bible places:** 165,697 of 304,369 carry at least one pill only the kind prints.

**Genesis 1:22's פרו:** 23 rows, 7 of the kind, 6 pills only the kind prints (Peru, Republic of Peru, Tarica, country in South America, pro, the OmegaWiki definition).

**English Wiktionary's names** (`wikt_names.out`):

| | rows | keys | places | pills |
|---|---|---|---|---|
| Kaikki Hebrew name rows | 1,590 | | | |
| Bible pills only they print | | 3,314 | 39,726 | 77,759 |
| Tikkunei Zohar pills only they print | | 292 | 8,667 | |

These are before the names gate, which already withholds them at non-name places under «only».

## Not established

- The live pool's answer at the 27 Bible and 21,866 Tikkunei Zohar words: the model counts the asks and does not read the pool.
- Pairs (1,062 Bible words) and several-form runs: not modeled.
- The card counts are before the entry, pointing, names and stem gates, so they are upper bounds of what a card would say.
- Whether the span store's rows carry the name fact.
- Whether the concordance table lists the kind's providers.
- What the joint switch costs (`toggles.sources.joint.sets`) should price once the rest is not all-on.
- Whether `kaikki_wiktionary_aramaic`'s 92 name rows are under the rule.
- No browser probe was run.
