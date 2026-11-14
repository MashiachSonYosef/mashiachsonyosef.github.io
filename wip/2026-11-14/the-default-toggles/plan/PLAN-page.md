# The default sources in zone.html: page plan

I read `pt/reader/zone.html` at main ace7f07eba: 17,179 lines, sha256 4049381a…cfff63. Line numbers below are that file's, each given with its function, because they will drift. Every measure covers all 39 books (305,431 word places). None is drawn from Genesis 1: the outside reader's Genesis 1 audit was a cursory look, not a basis. Nothing was edited outside my folder.

## 0. Where the owner's words and the brief disagree (the owner's words are followed)

| The brief (written before the owner's messages) | The owner, 14 Nov | What this plan does |
|---|---|---|
| Five pills, with a separate resting pill «98% STEP TAHOT, 2% others» (`default-resting`, stored `resting`) | One pill per source, its name only. «STEP» is where it rests. | Four pills; stored ids `step` `macula` `ubs` `bdb`. No resting label is computed, so the brief's §2.6 loop (a label in index.json computed from the resting records) never arises. |
| "UBS default 78%" printed under each pill | Name only. Choosing a source notes that it is partial and gives percentages. | Percentages appear only in the note under the row. |
| Where X has no pick, the resting line stands | A second source is chosen automatically (the one that fills most of what the first leaves, per book). The reader can change it. Today's line stands only where both leave. | Two layers: first, then second. |
| The rest state is today's line, byte for byte | «even if its 99.9% TAHOT you could still auto select a second source» | At rest, STEP plus its auto second. This changes 243 lines in 31 books (§1.5). |
| Call 4: clamp long lines to three rows | Not answered. The page's own rule is "NO CLAMP" (paintRuling comment, 9124–9131, of 2026-10-03). | Lines print whole; put to the owner. |

## 1. What the line does

### 1.1 The rule at a word

The word's place `n` is `WORD_N.get(word)` (set at 4152). Precedence is the owner's: a ruling, then a toggle, then record order.

1. **A reader's ruling.** Unchanged: wordBlock's `held` (12751) and repaintGlossOrder's `held0` (13282).
2. **placeLine's yields.** Headword lookup, a license class, the letters switch, and no-names at a name (12307–12314). The default yields to them exactly as placeLine does.
3. **The first source F's line pick at n.** Applies when F ≠ STEP, F's M is switched on, and the word is not ketiv/qere.
4. **Otherwise, the second source T's line pick**, under the same conditions.
5. **Otherwise, today's line:** the rest of lineUnder's chain, untouched.

It is independent of «reads first»: F leads wherever it has a pick, whatever order is set.

### 1.2 STEP prints today's line (pass-through)

- STEP's pick 1 is TAHOT's reading at the place, which is the line at rest. So wherever STEP leads or fills, today's line stands, with today's chip. STEP never prints a text of its own on the line.
- STEP as the second source therefore means: today's line wherever F has no pick.
- The ledger's own STEP words differ from today's line at about 4,850 words. 4,402 of them sit under joined-run lines (#90, the owner's Monday call); about 450–510 are single words. The page does not print the ledger's STEP words there (decision 1).

### 1.3 What each source prints on the line

The bake computes the line text; the page prints it raw, never through spanJoin.

- **MACULA:** the ledger's joined words.
- **UBS:** for each piece, the first pick's glosses exactly as given (`a / b`), with pieces joined by ` + `.
  - A piece whose first pick is a sign alone (`-`, `—`, `<…>`, `[…]`, `¿`, `~`, `X`, `×`, `+`) is left out of the line.
  - If every piece is like that, there is no line pick. The card still prints `-` as given.
- **BDB:** pick 1's record highlight (slot 5) whole, then ` · sense N` taken from the point (`point17:11.` gives `sense 11`; `the entry` gives no number). An empty slot 5 means no line pick.

### 1.4 The second source and the shares

- The second source is computed per book: the source with the largest fill. Ties go by pill order: step, macula, ubs, bdb. If the first leaves nothing, there is no second.
- Measured with the line's own rule (v1 plus the v1.1 mend; my `fills.py`, `fills-by-book.tsv`):

| First | Its share | Second chosen | Second fills | Neither |
|---|---|---|---|---|
| STEP | 99.91% | MACULA in 32 books; none in 7 (Haggai, Hosea, Joel, Jonah, Malachi, Micah, Nahum, where STEP is 100%) | 0.08% | 0.00% |
| MACULA | 97.06% | STEP in all 39 | 2.93% | 0.00% |
| UBS | 80.56% | STEP in all 39 | 19.44% | 0.01% |
| BDB | 34.06% | STEP in all 39 | 65.85% | 0.09% |

- The 84.1% (UBS) and 36.4% (BDB) in the owner's note of 14 Nov count UBS «-» picks and BDB picks with no words as picks. The line can print neither (decision 3).

### 1.5 At rest: the 243 lines that change

- At rest the page runs STEP plus its auto second. That changes **243 lines in 31 books** (`restchange.py`).
  - By book: Ezekiel 59, I Samuel 22, Job 21, Deuteronomy 19, II Samuel 17, Jeremiah 12, Genesis 8.
  - What those lines print today: 55 are bare and gain MACULA's words; 73 read an M4 (TAHOT) store row through the table; 55 M14; 31 PIECE:MACULA; 16 M9; 13 others.
  - At 37 of the 243 the words stay the same and only the credit changes.
- 16 more such places are ketiv/qere words; they keep today's line.
- This is decision 2.

### 1.6 Pairs and runs

- **Ketiv/qere words keep today's line under every source** (1,062 words). wordBlock's kq branch never calls lineUnder, and `defaultAt` returns null at `word.kq`, so the card agrees with the line.
- **Joined runs:**
  - A run's span-store line or whole-form line yields only where `defaultAt` gives a non-STEP pick at every word of the run. Otherwise the run line stands, unmixed.
  - At rest no run moves: STEP covers every word of all 2,177 run lines.
- **Shares and pairs:** the bake counts a ketiv/qere place as "no line pick" for every source except STEP. This keeps the note's figures true to the line.
- **Shares and runs:** run words are not excluded from the shares. This is a known difference, measured by check D3.

### 1.7 The seven open questions to Moses: the page's behavior until each is answered

1. **STEP picks that name no row** (949 in Genesis). The line is today's anyway. On the card the STEP entry prints the ledger's words, credited M4 (kind r) or M19 (kinds v, a).
2. **receipt-v1's STEP counts.** The page reads no receipt. The index carries the bake's counts, held to receipt-v1.1.
3. **The letter on a variant pick.** Printed as given, «2 «…» (a meaning variant, K)», and never tied to the pair's halves.
4. **BDB's words per point.** Slot 5 whole plus «· sense N». Two senses of one record differ only by N.
5. **Places the piece store lacks.** Nothing changes: default paths key by WORD_N and never read the piece store.
6. **Picks whose named row the entry gate withholds.** The pick stands as a pill above the gates, as TAHOT's place row does today (poolFor 7442–7465). For STEP's 155 Genesis cases the line is today's line.
7. **Jastrow.** Data only: one entry in index.json `sources`, plus one literal position in each TOGGLES entry (build-toggle-design-v1.mjs:69,74 parses only literals).

## 2. Data the page reads (contract with the bake)

### 2.1 `data/default-picks/index.json`

Fetched in the boot `Promise.all`.

```json
{ "rule": "default-picks-rule-v1", "ledger": "default-picks-v1.1",
  "order": ["step", "macula", "ubs", "bdb"],
  "sources": { "step": {"pill": "STEP", "m": "M4", "m_more": "M19"}, "macula": {"pill": "MACULA", "m": "M3"},
               "ubs": {"pill": "UBS", "m": "M18"}, "bdb": {"pill": "BDB", "m": "M46"} },
  "books": { "<book>": { "file": "<book>.json", "places": 20612, "entries": 22329, "pairs": 12,
      "has":   {"step": 0, "macula": 0, "ubs": 0, "bdb": 0},
      "fills": {"step": {"macula": 0, "ubs": 0, "bdb": 0}, "macula": {}, "ubs": {}, "bdb": {}},
      "then":  {"step": "macula", "macula": "step", "ubs": "step", "bdb": "step"},
      "step_leaves": [[n, "<macula line>"|0, "<ubs line>"|0, "<bdb line>"|0]] } } }
```

- The M ids are verified in `data/route-store/index.json`: M3 MACULA, M4 TAHOT, M18 UBS v0.9.2, M19 TBESH, M46 unabridged BDB.
- `step_leaves` lists every place where STEP's pick 1 has no words: 267 over the 39 books. With it, STEP-first needs no book file for the line, whatever second the reader picks.
- `has` and `fills` are counted with the §1.3 predicate.

### 2.2 `data/default-picks/<book>.json`

Fetched lazily.

```json
{ "book": "<book>", "rule": "default-picks-rule-v1", "places": [ null, [step, macula, ubs, bdb] ] }
```

- `places` is indexed by WORD_N − 1. Each slot is `0` (no pick) or `[line, [[k, words, note]]]`.
  - `line` is the printed text; `1` for STEP; `0` where the source has picks but no line pick.
  - `note` is one of `""`, `"another number"`, `"a meaning variant, K"`, `"sense 11"`, `"the entry"`.
- The page refuses the file unless `book === BOOK` and `places.length === entries`.

### 2.3 For tools

`window.__default = { on, then, auto, chosen, listed, ready, failed, book }`.

## 3. Edits, in order

Steps 1–6 land as one change before any UI, testable with `?default=ubs`. Steps 7–10 expose it.

### Step 1: state and fetching (no visible change while no index lands)

- **After `spanJoin` (3425):**
  ```js
  const lineText = (ov) => (ov && ov.raw ? String(ov.text) : spanJoin(ov.text));
  ```
- **After the senses block (3530–3546),** modeled on SENSES_KEY / chooseSenses:
  - Keys: `DFLT_KEY = "fh.defaults"` and `DFLT_THEN_KEY = "fh.defaults.then"` (JSON `{first: then|"auto"}`). Both are kept distinct from `DEFAULTS_KEY = "fh.sources.defaults"` (3658).
  - `const DFLT_IDS = ["step","macula","ubs","bdb"]`.
  - `let dfltFirst` from `?default=` (one load, not stored), else storage, else `"step"`. `let dfltThenPick` from `?then=` the same way.
  - `let DFLT_IX = null, DFLT_BOOK = null, DFLT_LEAVES = null, DEFAULT_PICKS = null, dfltWait = null, dfltFailed = false`.
  - `let reopenForDefaults = () => {}`.
  - `dfltAuto(first) = DFLT_BOOK.then[first]`; `dfltThen()` (reader's pick, else auto); `dfltNeedsBook = () => dfltFirst !== "step"`.
  - `defaultPicksReady()`: the promise resets on failure, as `pieceBookReady` does (3628–3630), and it sets the window variable, as `suggestedReady` does (3408–3413).
  - `chooseDefault(id)`:
    - Stores the choice. Pressing the lit non-STEP pill gives `"step"`; pressing STEP while lit does nothing.
    - If the book file is needed and absent, it says «fetching» and calls `defaultPicksReady().then(reopenForDefaults)`. Otherwise it calls `reopenForDefaults()`.
  - `chooseDefaultThen(id)` works the same way and refuses `id === dfltFirst`.
- **Boot:** add `DFLT_IX` to the destructuring at 3893 and the fetch beside 3937, both before `...OVERLAY_IX`.
- **After 4152 (WORD_N):**
  - Set `DFLT_BOOK` only if `DFLT_IX.rule` and `order` match. Build the `DFLT_LEAVES` Map from `step_leaves`.
  - `if (DFLT_BOOK && dfltNeedsBook()) await defaultPicksReady();` This is the RUN_CARDS precedent at 3974: first paint waits only for readers whose stored first is not STEP, so there is no flash.

### Step 2: the layer (beside placeLine, 12306–12331)

- **`placeYields(word)`:** factor out lines 12308–12314 (lookup, licencePref, masorah letters, the noname condition). placeLine calls it; its behavior is identical.
- **`defaultAt(word)`:** returns null unless `DFLT_BOOK`, the word is not kq, `!placeYields(word)`, and `n` is set. Then:
  - Effective first = F if its M is on, else `"step"`.
  - If the first is STEP: return null unless `DFLT_LEAVES.has(n)`.
  - Otherwise: if F's line text at n exists, return `{text, raw: true, rs: [{...readingOfId(M), reads: "default", src}], why: "default", src, layer: "first", mId: M, more}`.
  - Then T = `dfltThen()`. If T is absent, is STEP, or is off, return null. Otherwise return T's text with `layer: "then"`.
  - Texts come from `DFLT_LEAVES` when the first is STEP, else from `DEFAULT_PICKS.places[n-1][slot][0]`. `more` holds picks 2..n from the book file, when it is loaded.
- **`defaultLayerAt(word, d)`:** returns `"first"`, `"then"` or `"none"`, for `ge.dataset.default`. It is set only when F ≠ STEP or the layer is `then`, so the resting DOM changes only at the 243 filled words.
- **`runTakesDefault(run)`:** `run.__words.every((w) => !!defaultAt(w))`.

### Step 3: lineUnder (12332)

Between the headword branch (12334–12335) and `placeLine` (12336), insert:

```js
{ const d = defaultAt(word); if (d) return d; }
```

### Step 4: the painters

- **wordBlock, 12755:** `return lineText(ov)` (was `spanJoin(ov.text)`). After the ge is made (12785–12788), set or clear `ge.dataset.default`.
  - The wasRuled path (12751, 12808–12817) is untouched; a ruling still wins.
  - The chip path (12797–12807) already uses `licenseChipFor(lineMoved.rs)`.
- **repaintGlossOrder (13270):**
  - 13296: `[lineText(moved)]`.
  - Set or clear `st.ge.dataset.default` before `lineStands` (13306). lineStands compares neither the attribute nor the layer, so without this the attribute goes stale.
- **repaintLive, 13406:** `parts.push(moved ? (moved.text ? lineText(moved) : "—") : …)`.
- **refreshJoinGloss (10825):**
  - Add `&& !runTakesDefault(run)` to the span-store branch (10865) and to the whole-form branch (10879).
  - The parts branch then reads each word's `.g`, already painted by wordBlock.
- **chainReadsWhole (7719):** after the ruling test (7726), `if (runTakesDefault(run)) return false;`. The pressed word's own card then opens.
- **licenseChipFor, 5346:** `uniq[0].reads === "default" ? "<pill>'s own pick at this place" : …`.
  - The chip stays hidden on the line (`.he-text .g .g-lic {display:none}`, 2302). Its `data-line` (M3, M18 or M46) and its title are what the export, the copy guard and the checks read. The reader sees the credit on the card.
- **Raw rulings:**
  - ruledLine0 (5038) and textOfCell (8969): `p.raw ? String(p.text) : spanJoin(p.text)`.
  - The pick records at 10121 and 10216 gain `...(group.raw ? {raw: true} : {})`.
- **No change needed:** placeCutOf (4950), ruledSurfaces (4959), ruledMs (4966) and piecesAt (4998). A ruling made on the card under a default is on the whole form, because no set division is open. A ruling made earlier on TAHOT's division still composes from TAHOT's pieces, since a ruling outranks a toggle. mOfPick (4923) keeps `line = M`, because `pieceLineOfM(M18)` is null.
- **No change needed:** kqPlace (5106), kqPickG (5159), paintPairs (5356).

### Step 5: the card (openHud, 8295)

- **placeSet, 8766:** prefix `!defaultAt(word) &&`. setCut is then null, there is no core block (8814–8815), and the card opens on the whole form.
- **placeOfCell (8829–8842):**
  - Run branch: `defaultAt(w) || placeLine(w)`.
  - Word branch: `defaultAt(word) || placeLine(word)`.
- **textOfCell, 8984:** `if (at) return lineText(at)`. readingsOfCell (9030) is already right: it returns `at.rs`.
- **atPlace (9070–9071):** if `defaultAt(word)` gives d, the label reads `reading · ${pill} at this place`. Otherwise «reading · TAHOT at this place», as today.
- **lineSaid, 9838:** keep it. Both sides fold through spanJoin.
- **poolFor place block (7442–7465):** add a branch for `opts.place.why === "default"`. For pick 1 and then `more`, in order:
  - Find the group by `drawn(text)`.
  - Move a record of the pick's own M first. If there is none, unshift a made row `[0, text, text, M, null, null, null]` into PLACE_ROWS. This puts the source's own row first (RULE.md) and keeps the D card's credit equal to the line's chip.
  - If there is no group, make one.
  - Set `g.text = text; g.raw = true; g.place = true; g.dfltRank = i + 1; g.dfltSrc = src`.
  - Made rows stand above the masorah, entry and names gates, as TAHOT's row does.
- **sortPool's placeLead, 7624:**
  ```js
  const placeRank = (g) => g.dfltRank || (g.placeFirst && defOrder === "place" ? 1 : Infinity);
  ```
  placeLead compares those ranks. At rest this is identical to today.
- **makePill, 10225:** `btn.textContent = route.raw ? String(route.text) : spanJoin(route.text)`, plus `btn.dataset.dflt = "ubs:2"`.
- **The defaults row,** in renderReadings between the STEP place line (9630–9661) and the BSB line (9664):
  - The existing `p.r-piece` stays where and when it stands. Only its `<i>` changes, from «here the source reads » to «STEP ». Eight tools read `.r-piece` and its `b`, never the `<i>`.
  - STEP's picks 2..n follow in a `span.r-more` outside `b`.
  - Each other source with picks gets a `p.r-dflt[data-src]`: `<i>UBS </i><b>beginning</b>`, then `<span class="r-more"> · 2 «…» (another number)</span>`, then the chip. Its class is `on` for the first source and `then` for the second.
  - Pressing an entry calls `chooseDefault(src)`. Its title: «UBS's own pick at this place · press to make UBS the source the line reads first, on every page».
  - Lazy load, as for the BSB (9659–9662): `if (DFLT_BOOK && !DEFAULT_PICKS && !dfltWait) defaultPicksReady().then(reopen)`.
- **CSS and helpers:**
  - Add `#hud.tight .rows .band > .r-dflt` to 1569, so it is hidden on tight cards; the header and the Menu still reach the switch.
  - Style `.r-dflt` beside `#hud .r-piece` (1760–1766).
  - cardNotes (7927): add `:not(.r-dflt)`.

### Step 6: the export

- **gatherSection, 5638:** `const at = defaultAt(w) || placeLine(w)`. At 5639, `placeShown` applies only when `at.why !== "default"`.
- **attributionFor, 5519:** `at && lineText(at) === shownText`. The second hit clause (5528, `r.text === shownText`) already catches raw texts.

### Step 7: the header

HTML after the reset pill (2491):

```html
<span class="mode-pick dflt-pick" id="default-pick" hidden>
  <span class="dflt-row" id="default-row" role="group" aria-label="whose own pick the line under each word prints"></span>
  <span class="mode-dir" id="default-say"></span>
  <span class="def-order dflt-then" id="default-then" role="group" aria-label="the second source, where the first has no pick" hidden></span>
</span>
```

- **Buttons** are built from `DFLT_IX.sources`: `button.blob-btn#default-step|macula|ubs|bdb[aria-pressed][aria-describedby=default-say]`, with text «STEP» «MACULA» «UBS» «BDB». The second row uses `button.dfp#default-then-<id>`, with text «STEP 64.0%».
- **The Menu** mirrors every one automatically (rowPills, 16877); M1 holds.
- **Titles:**
  - STEP: «STEP's own reading at each word, TAHOT's at this place: the line as it rests»
  - MACULA: «MACULA's own words at each word, as MACULA gives them; a second source fills the words it leaves»
  - UBS: «the UBS dictionary's own meaning at each word, its glosses as it gives them; …»
  - BDB: «the sense the unabridged BDB files each verse under: its entry's words, with the sense's number; …»
  - When the source is switched off: «BDB is switched off on the sources row». The button is disabled, the effective first becomes STEP, and the stored choice is kept.
- **The note `#default-say`** (book name from `zone.work`):
  - «STEP · every word of Genesis» when the first covers the whole book.
  - «BDB 35.9% (partial) · then STEP 64.0% · neither <0.1%» otherwise.
  - «BDB · fetching its picks for Genesis…» while loading.
  - «BDB · its picks for Genesis could not be fetched; the line stands as it was» on failure.
  - Number format: `fmt(v)` gives «0%», «100%», «<0.1%», «>99.9%», or one decimal.
- **The second row:** the auto choice's title is «chosen for you: it fills the most of what BDB leaves in Genesis». The row is hidden when the first leaves nothing.
- **Script:** `paintDefaultPills()` and the click handlers go beside paintSensesPill (14280–14286).
- **CSS** near 1486–1493: `#modeRow .dflt-pick {flex-basis:100%}` and a row flex for the pills. The `#modeRow .def-order .dfp` styles already exist (1779–1793).
- **Dim ink,** only if the owner takes call 6: `.he-text .wb > .g[data-default="none"] {color: var(--tekhelet-dim)}`.

### Step 8: the rail (TOGGLES, after the senses entry at 3770–3776)

Two entries:

```js
{ id: "defaults", voice: "arrange", lab: "default source",
  why: "whose own pick at each word the line prints: STEP's (TAHOT's reading here, where the line rests), MACULA's, the UBS dictionary's or the unabridged BDB's, each as the source gives it; a second source fills where the first has none, and the line stands as it was where neither has one",
  positions: [{ id: "step", lab: "STEP" }, { id: "macula", lab: "MACULA" }, { id: "ubs", lab: "UBS" }, { id: "bdb", lab: "BDB" }],
  live: () => !!DFLT_BOOK,
  waits: "the corpus lane's default picks laid on this book (tools/bake-default-picks-v1.mjs)",
  get: () => dfltFirst, set: (id) => chooseDefault(id), now: () => (sayDefault text) }
```

- The second entry is `{ id: "fills", voice: "arrange", lab: "then", … }` with positions `auto` «chosen for this book», plus the four sources.
- Ids are letters only and positions are literals, so build-toggle-design-v1 can parse them. Both stay under the fold (LEAD at 14176 is unchanged).

### Step 9: reset (14322–14350)

- `SWITCHES_DEFAULT` gains `defaults: "step", fills: "auto"`.
- `switchesAtDefault` (14325–14326) gains `&& dfltFirst === "step" && (dfltThenPick.step || "auto") === "auto"`.
- The handler, after 14349: `if (!atRest) { dfltThenPick = {}; store; chooseDefault("step"); }`.
- The title at 2491 becomes: «the switches back to their default (English off, framed off, card numbering on, the concordance hud off, word senses off, STEP with the second source chosen for the book) and every reading picked on this page forgotten».

### Step 10: answering a switch (after reopenForSenses, 16569)

```js
reopenForDefaults = () => {
  paintDefaultPills();
  if (document.getElementById("railRows")) railSwitch();
  repaintGlossOrder();
  reopenCard();
};
```

- relayBuiltSections (16519) is not needed: no cell moves.
- repaintGlossOrder refreshes every run that holds a stand (13316). Sections built later get the default through materialise (16465), then wordBlock, then lineUnder.

## 4. Every path that paints a line now asks `defaultAt`

**Why the prototype's paint was undone:** its `paintDefaultLines` wrote `.g` directly, keyed by DOM index. Each of these painted it over:

- `repaintGlossOrder` (lineUnder). This fires on every load once the lattice lands, because the default masorah is «only»: `latticeReady().then(repaintGlossOrder)` at 4189.
- The card's open: `paintGloss` with `!ruled` (9210–9218) paints `coverText()`, which reads TAHOT's set and placeLine through `textOfCell` and `placeOfCell`.
- Sections built later (`materialise`).
- `relayBuiltSections`: reset, maqaf/runs switches, `forgetSensePicks`.
- `refreshJoinGloss`'s span branch.
- `repaintLive` under sources off.

**How the new code reaches it on each path:**

| Path | Reaches `defaultAt` through |
|---|---|
| First paint, later sections, relay | wordBlock → lineUnder |
| Every switch | repaintGlossOrder → lineUnder |
| Sources off | repaintLive → lineUnder |
| Runs | refreshJoinGloss and chainReadsWhole → `runTakesDefault` |
| Card open | placeSet, placeOfCell, textOfCell, readingsOfCell and atPlace → `defaultAt` |
| Card pills | poolFor, placeLead, makePill and lineFirst → the default's made pill pressed |
| Export | gatherSection and attributionFor |

The open card paints back exactly the line's own text and chip, so `paintRuling` keeps both.

## 5. Risks

- **First-paint flash.**
  - At rest there is none: index.json joins the boot `Promise.all` and `step_leaves` is in it.
  - A stored non-STEP default waits one fetch before first paint (the brief measured a similar shape at 196–260 KB gz for Genesis).
  - If the fetch fails, today's lines and the failure note show, and the next card or press retries.
- **spanJoin turns every "/" into " + ".** The raw flag has to reach all nine sites in steps 4–6; one missed site prints «heaven + sky».
- **The export, the copy guard and the D card** must credit X. That is the reason for the own-row-first rule in poolFor and for the attributionFor change.
- **kqWeld copies pool groups without `raw` or `dfltRank`** (8943). Pairs are excluded from `defaultAt`, so this stays safe only while that holds.
- **pieceLine / divisionFor** lays any " + " line under the word's letters. UBS pieces are MACULA's, while the division is TAHOT's. Not verified in a browser.
- **Long lines.** 33,831 UBS lines and 15,506 BDB lines run over 40 characters; with no clamp, words and verses grow tall.
- **At-rest changes stale the resting records.** The 243 at-rest changes, plus any edit to zone.html, make the 40 resting-lines records and the chain files stale, so the round must run `lines`, `chain` and `door`.
  - index.json becomes an input to the resting line, so `whyNotOfThisTree` must fingerprint it. There is no loop, because the resting bake never writes it.
- **A ruling on a made pill reaches every place the form stands** (the existing law). The pill's title must say so.
- **The name "default" is already taken** (`DEFAULTS_KEY`, `SOURCE_DEFAULTS`, `SWITCHES_DEFAULT`, the reset state). The new names are `fh.defaults`, `default-*` ids and the `defaults` and `fills` rail ids, used consistently.
- **One extra boot fetch** (index.json) on every page; check-page-fetches-v1 may count it.
- **Noticed in passing, not in scope:** `numsPref` rests «off» (14313) while `SWITCHES_DEFAULT.nums` is «on». So a fresh visit shows reset enabled with an empty state, and pressing it turns numbering on.

## 6. Tools this touches (for the tools part)

- New `tools/bake-default-picks-v1.mjs`. It writes §2, refuses on any pin or hash miss, counts with the line's predicate, and holds its counts to receipt-v1.1.
- New `check-default-picks-v1.mjs`: D1–D10 as in the brief, with D1 meaning STEP lit and the auto second at rest, and the 243 at-rest lines named.
- `resting-lines-v1` state gains `default: "step", fills: "auto"`, and its fingerprint gains index.json.
- `build-toggle-design-v1` must run again for the new rail ids.
- Trials under `?default=` and `?then=` go into `check-card-opens-on-the-line-v1`, `check-ruled-equals-first-paint-v1`, `check-line-follows-card-v1` and `check-reset-pill-v1`.
- The `card-readings-v1` chain gains a `defaults` field and waits for `window.__default.ready`.
- Shipping ends with the merge of `main` into `gh-pages` and the push (CLAUDE.md).

## Decisions only the owner can make

- STEP prints today's line wherever it leads or fills. The ledger's own STEP words differ from today's line at about 4,850 words: 4,402 under joined-run lines (#90) and about 450–510 single words. Keep today's line until #90 is ruled (recommended), or print STEP's ledger words?
- Should the rest state carry STEP's auto second, as message 3 reads? If yes, 243 lines change in 31 books for every first-time visitor: 55 bare words gain MACULA's words, and 73 lines that today read TAHOT's store row through the table become MACULA's. The other choice: the second source starts only when the reader presses a pill.
- Should the note print the line's own shares? UBS would read 80.6% and BDB 34.1%, not the 84.1% and 36.4% in your note of 14 Nov, because a UBS «-» alone and a BDB pick with no words cannot print on the line.
- Long UBS and BDB lines (33,831 UBS and 15,506 BDB lines over 40 characters): print them whole under the page's no-clamp rule of 3 October (recommended), or clamp to three rows with the whole line on the card (the brief's call 4)?
- Joined runs: should a run's dictionary line yield only where the non-STEP sources have a pick at every word of the run, and otherwise stand unmixed (the brief's call 5)?
- Ketiv/qere words: should they keep today's line under every source in v1 (1,062 words; 2.1% of Daniel), as the brief's call 7 recommends?
- Words where neither source has a pick: draw them in dim ink (the brief's call 6), or no mark?
- The card's row of sources: should pressing an entry be the same page-wide switch as the header (the brief's call 9)? And should STEP's picks 2..n stay listed as text, not pills, while STEP rests, so the card at rest is unchanged?
- The reader-facing words: «(partial)», «then», «neither», «every word of <Book>», and the pill order STEP, MACULA, UBS, BDB as the tie-break when choosing the second source.

## Could not determine

- Nothing was run in a browser. The paint paths, the timing of the awaited book file at first paint, and the card's behavior are all read from the code, not watched.
- Whether GitHub Pages gzips .json in transit. That decides between <book>.json and <book>.json.gz. The plan follows source-suggested/<book>.json and uses .json.
- The per-book file size in the shape of §2. Nothing was baked; the brief's near shape measured 196–260 KB gz for Genesis and 3.2–4.2 MB gz for the 39 books.
- Whether pieceLine/divisionFor (11250) lays a UBS line joined with " + " under the right letters. UBS's pieces are MACULA's, while the word's division is TAHOT's.
- How many words under each first source keep a run line with the page's live lanes. The lanes depend on the maqaf and runs switches. The brief's runs_cover.py (ledger against the resting records) found that, of 2,177 run lines, STEP covers every word of all 2,177, MACULA 1,681, UBS 1,377 and BDB 278.
- Moses's answers to the seven questions, including what a variant's letter («K») means. The page's stated behavior for each is in §1.7.
- Whether check-page-fetches-v1 or another tool counts boot fetches. The plan adds one, data/default-picks/index.json, on every page.
- Whether the owner meant the auto second to apply at rest for first-time visitors (message 3 reads so) or only once a reader presses a pill.
- Why the default numbering preference rests «off» while SWITCHES_DEFAULT.nums is «on» (14313 against 14322). It is outside this task and noted only.
