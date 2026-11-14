I followed the owner's three messages of 14 November wherever they disagree with the brief, and I say so each time. They override the brief in these ways: four pills that show only the source's name; the share of words appears when a source is chosen; every source carries a second source; today's line is used only where both sources leave a word.

Following the relayed request, nothing below is built around Genesis 1. Every number covers all 39 books and is given book by book. The examples come from Psalms, Ruth, Amos, Isaiah, Daniel, Jeremiah, Ezra, Exodus and Habakkuk.

**Basis.** The page file is `pt/reader/zone.html` at sha256 `4049381a…`, 17,179 lines, live main `ace7f07eba`. Line numbers below are for that file and will drift, so every place is also named by its function. The ledger is `default-picks-v1` with the `v1.1` STEP mend.

**My measurements.** The scripts are in `…/v49/plan/spec/tools/` and their output in `…/v49/plan/spec/out/` (`shares-by-book.tsv/json`, `rest-changes.json`, `pairs-by-book.tsv/json`).

---

## 0. What the owner's words override in the brief

| Brief (written before the owner's words) | This spec (the owner's words) |
|---|---|
| Five pills: a resting pill «98% STEP TAHOT, 2% others» plus «STEP default», «UBS default», «MACULA default», «BDB default» | **Four pills that show only the name: «STEP», «MACULA», «UBS», «BDB»** (and «Jastrow» when its ledger lands). STEP is lit at rest. The owner wrote «it could just say BDB». |
| The coverage figure always under each pill (call 10) | The figures appear when a source is chosen. The note says the source is partial and gives **both percentages** (the owner: «notes to them its partial … and %s then»). |
| Where X has no pick, the resting line stands | **The second source fills first. Today's line stands only where both sources leave a word.** A second is chosen automatically even at 99.9% (the owner: «even if its 99.9% … you could still auto select a second source»). |
| `fh.defaults`, `?default=`, `window.__default`, element ids `default-*`, rail id `defaults` | New names that avoid "default" and "def" entirely (§5). The word is already used by `fh.sources.defaults`, `fh.def.order`, `SWITCHES_DEFAULT`, the reset's "default" and `DEF_POS`. |
| Call 9: the card's row of sources can be pressed as the page-wide switch | **Not pressable.** The owner's words do not settle this. The spec follows the page's own principle that the header row is "the one place a switch is decided" (the comment above `rowPills`, about line 16865). |
| Call 5: X leads a joined run where it has a pick at every word | **A run's line stands under every source in v1.** STEP now rests on, so the brief's rule would change the line at rest under 4,402 joined words. That would decide the owner's open call #90 without asking. |
| STEP's line is STEP's ledger pick 1 everywhere | **STEP's layer is today's place line (`placeLine`) wherever it answers, and STEP's ledger pick 1 only where it does not.** This keeps the 29 words where pick 1 and the place line differ, among them 22 where one TAHOT line spans two words (II Kings 19:31 «Yahweh of hosts» would otherwise print under both words). |

---

## 1. Names, used exactly the same everywhere

- **Display names** on the pills, in the note, on the rail, on the card and in titles: `STEP`, `MACULA`, `UBS`, `BDB`, and later `Jastrow`.
  - These are the owner's names for these toggles.
  - The chips keep the shelf's short names from `data/source-short-names-v1.json` ("STEP TAHOT", "STEP Brief", "MACULA", "UBS DBH", "BDB unabr."). Those are a different name for a different thing, so neither file changes.
- **Ids and keys** (lowercase): `step`, `macula`, `ubs`, `bdb`, `jastrow`.
- **Row order and tie-break order:** STEP, MACULA, UBS, BDB, Jastrow.
- **Book titles** in the note come from `zone.work` and are never typed: "Genesis", "II Samuel", "Song of Songs".
- **Source text is printed as each source gives it, byte for byte.** That includes MACULA's "~" («brought ~ up»), UBS's " / " and BDB's highlighted words.
- **New strings use American English.** The rail's existing id `licence` is an identifier and stays.

## 2. The row of source pills

**Where it stands.** The pills go inside `#modeRow` (line 2446), after the «word senses» pick (2478) and before «reset» (2491):

```html
<span class="src-picks" id="srcPicks" role="group" aria-label="the source here: whose reading the line under each word prints" hidden>
  <span class="src-lab" id="srcLab">the source here</span>
  <span class="mode-pick"><button type="button" class="blob-btn src-btn" id="srcStep"   data-src="step"   aria-pressed="true"  aria-describedby="srcStepDir">STEP</button><span class="mode-dir" id="srcStepDir"></span></span>
  <span class="mode-pick"><button type="button" class="blob-btn src-btn" id="srcMacula" data-src="macula" aria-pressed="false" aria-describedby="srcMaculaDir">MACULA</button><span class="mode-dir" id="srcMaculaDir"></span></span>
  <span class="mode-pick"><button type="button" class="blob-btn src-btn" id="srcUbs"    data-src="ubs"    aria-pressed="false" aria-describedby="srcUbsDir">UBS</button><span class="mode-dir" id="srcUbsDir"></span></span>
  <span class="mode-pick"><button type="button" class="blob-btn src-btn" id="srcBdb"    data-src="bdb"    aria-pressed="false" aria-describedby="srcBdbDir">BDB</button><span class="mode-dir" id="srcBdbDir"></span></span>
</span>
…(reset, layerC, marksToggle as today)…
<p class="src-note" id="srcNote" aria-live="polite" hidden></p>   <!-- last child of #modeRow, flex-basis:100% -->
```

- The group wraps as one unit (`display:inline-flex; flex-wrap:nowrap`).
- The group is `hidden` where `index.json` does not list the book: the Tikkunei Zohar, Mark, the Targum and any other work without a defaults file. The stored choice is kept, not cleared.

**The bottom Menu** mirrors the four pills with no new code. `rowPills()` (16877) takes every visible `#modeRow button` that has an id, along with its `.mode-dir` text. The note's chooser buttons have **no id**, so they are not mirrored.
- In v1 the second source can be changed from the note and from the rail, not from the Menu.

**What each pill says.**
- The label is the name only.
- Under the lit pill (`.mode-dir`): its share, then "then {second}" when a second is chosen, for example "35.4% · then STEP" (BDB in Genesis), "98.2%" (STEP in Amos, which has no second) or "99.0% · then MACULA" (STEP in Psalms).
- Under unlit pills the `.mode-dir` is empty, following the owner: the share appears once a source is chosen.

**Pill titles** (exact):
- STEP: `STEP’s own reading at each word: its TAHOT translation at this place, or its brief lexicon where TAHOT reads none — {share} of {work}`
- MACULA: `MACULA’s own reading at each word, as MACULA words it — {share} of {work}`
- UBS: `the UBS dictionary’s meaning filed at each word, its glosses as it gives them — {share} of {work}`
- BDB: `the unabridged BDB’s sense filed at each word: the entry’s own words, with the sense’s number on the card — {share} of {work}`
- Added to a lit pill other than STEP: ` · press again to go back to STEP`. Added to a lit STEP: ` · press to show or hide the note`.

**How pressing works.**
- Exactly one pill is lit while the line reads "the source here".
- Pressing an unlit pill lights it, turns the lit one off and opens the note.
- Pressing a lit pill other than STEP turns it off and lights STEP. This is the owner's "on/off" with STEP as the rest.
- Pressing a lit STEP opens or closes the note.
- If the rail's "the line reads" is set to oldest first or any other reads-first order, no pill is lit. `#srcLab` then reads `the source here · the line now reads {order lab} (the switches)`. Pressing any pill sets the order back to "the source here" (`chooseDefOrder("place")`, 13518) and lights the pill.
- A source switched off on the rail's "sources" row makes its pill `disabled`, with the title `{short name} is switched off on the switches`, for example "UBS DBH is switched off on the switches".
  - If that pill was lit, STEP lights on this page and the stored choice is kept, so turning the source back on restores it.
  - STEP is off when the TAHOT witness (M4) is off, as `placeLine` treats it today.

**The rail.** Two `TOGGLES` entries (3698ff), under the fold (`?rail=all`) and not in `LEAD` (14176). Ids are letters only and positions are literal objects, as `build-toggle-design-v1.mjs` parses them:

```js
{ id: "here", voice: "them", lab: "the source here", why: "whose own reading at each word the line prints: STEP’s, MACULA’s, the UBS dictionary’s or BDB’s; where it gives none, a second source fills it out, and where neither does, the line stands as it is",
  positions: [{ id: "step", lab: "STEP" }, { id: "macula", lab: "MACULA" }, { id: "ubs", lab: "UBS" }, { id: "bdb", lab: "BDB" }],
  live: () => !!LINE_BOOK, waits: "the corpus lane’s default picks laid on this book (tools/bake-default-picks-v1.mjs)",
  get: () => lineSource, set: (id) => chooseLineSource(id), now: () => `${SRC_NAME[lineSource]} · ${shareText(lineSource)}` },
{ id: "fill", voice: "them", lab: "filled out by", why: "the source that fills the words the first leaves: for each book, the one that fills the most, or your own choice; today’s line fills none",
  positions: [{ id: "auto", lab: "chosen for this book" }, { id: "step", lab: "STEP" }, { id: "macula", lab: "MACULA" }, { id: "ubs", lab: "UBS" }, { id: "bdb", lab: "BDB" }, { id: "none", lab: "today’s line" }],
  live: () => !!LINE_BOOK, waits: "…same…", get: () => lineFillChosen(lineSource) || "auto", set: (id) => chooseLineFill(id), now: () => … }
```

- The position equal to the first source is drawn dead.
- The voice is "them" (a switch decides which source is asked), not the brief's "arrange", because the switch adds made pills, which "arrange" says no switch does.
- `/toggles/` lists both rows once `build-toggle-design-v1.mjs` is run again (it photographs `shots/row-here.png` and `shots/row-fill.png`).

## 3. The partial note and the second source

**When it shows.**
- When the first source is not STEP. It is open at load in that case, because the page differs from rest and must say why.
- After any press of a source pill on this page.
- When `?line=` is in the address.
- Hidden at rest (STEP with the second chosen for the book) until the reader presses STEP.

**Exact text.** `{X}` is the first source, `{Y}` the second and `{work}` is `zone.work`:

```
<span class="src-say">{X} is partial: its own reading under {a} of {work}. {Y} fills out {b}, chosen for this book. Today’s line stands under the other {c}.</span>
<span class="src-fill" role="group" aria-label="fill it out with">fill it out with
  <button type="button" class="dfp" data-fill="step"   aria-pressed="true">STEP 63.2%</button>
  <button type="button" class="dfp" data-fill="macula" aria-pressed="false">MACULA 59.9%</button>
  <button type="button" class="dfp" data-fill="ubs"    aria-pressed="false">UBS 49.7%</button>
  <button type="button" class="dfp" data-fill="none"   aria-pressed="false">today’s line</button></span>
```

Variants of the sentences:
- The reader chose the second: drop ", chosen for this book".
- No source fills anything: "No other source reads the rest."
- Second is "today’s line": "{X} is partial: its own reading under {a} of {work}. Today’s line stands under the other {c}."
- Nothing is left (c = 0): the third sentence is omitted.

The first source's own button is absent. A source that fills 0 words in this book is `disabled` and shows "0%". The auto-chosen button carries the title `chosen for {work}: the source that fills the most of what {X} leaves here`.

The phrase "the other {c}" carries a title: `{runs} words under a dictionary’s line over joined words and {pairs} in pairs written one way and read another keep today’s line under every source for now; {n} words no chosen source reads`.

**Shares are counted over the book's zone words (`counts.words`), as what actually prints:**
- **a:** the words in reach where X's pick prints.
- **b:** the words in reach where X has none and Y's prints.
- **c:** the rest. This includes joined-run words and ketiv/qere pair words, which are outside the switch's reach in v1.

**Number format.**
- One decimal, from `toFixed(1)`, never locale formatting.
- 0 words gives "0%" and every word gives "100%".
- A share above 0 but under 0.05 gives "<0.1%"; a share at or above 99.95 that is not all gives ">99.9%".
- Each share is rounded on its own and the title gives exact counts.

**What counts as "has a pick that prints".** These rules are the same in the page, the bake and the checks:
- **STEP:** the place line answers (TAHOT's pieces are all present and glossed, `placeLine` 12306), else the mended ledger pick 1 has words.
- **MACULA:** `macula[0]` is non-empty; null is no pick.
- **UBS:** at least one piece whose pick 1 is not only a sign. A "-" is no pick (10,907 words). The 17 picks whose words are "NO DATA YET" are no pick (see §12).
- **BDB:** pick 1 carries the words the line prints (§6). A pick with no such words is no pick.

**The auto second, computed per book on the page from `index.json` counts.**
- Among the sources that are on and are not the first, it is the one with the largest `fill[first][y]`.
- Ties go by row order (STEP, MACULA, UBS, BDB).
- If the best fill is 0, there is no second: "No other source reads the rest."
- Measured over the 39 books:
  - **MACULA, UBS and BDB:** STEP is the auto second in all 39 books.
  - **STEP:** MACULA in 23 books (in 17 of them UBS fills exactly as much and loses the tie). None in 16 books: Amos, Esther, Habakkuk, Haggai, Hosea, I Chronicles, II Chronicles, Joel, Jonah, Judges, Malachi, Micah, Nahum, Ruth, Song of Songs, Zechariah.
  - **BDB fills none of STEP's gaps in any book.** BDB places a citation only on a word whose STEP reading carries the record's number (RULE.md, BDB section). So the owner's example "say BDB" can never fill STEP's 0.1%, and the rule picks MACULA.

**Measured shares per book.**
- Columns: STEP's share, its auto second and that second's fill; each other source's share with STEP's fill after it; what is left under STEP. "(=UBS)" marks a tie broken by row order.
- The last column counts the words whose line changes at rest (§7).
- These differ from the letter to Moses (BDB 36.4%, STEP 63.5%). That letter's `coverage.py` counted picks with no printable words and counted joined-run and pair words as in reach.

| book | words | STEP | then | MACULA (+STEP) | UBS (+STEP) | BDB (+STEP) | left under STEP | rest: changes |
|---|---|---|---|---|---|---|---|---|
| amos | 2,039 | 98.2 | — | 95.8 (+2.4) | 81.3 (+17.0) | 43.5 (+54.8) | 1.8 | 1 |
| daniel | 5,900 | 97.2 | MACULA (=UBS) 0.1 | 96.3 (+0.9) | 76.8 (+20.4) | 50.1 (+47.1) | 2.7 | 32 |
| deuteronomy | 14,288 | 99.0 | MACULA 0.1 | 96.1 (+3.0) | 77.3 (+21.8) | 31.6 (+67.4) | 0.9 | 45 |
| ecclesiastes | 2,984 | 99.1 | MACULA (=UBS) 0.1 | 96.7 (+2.4) | 77.3 (+21.9) | 38.7 (+60.4) | 0.9 | 8 |
| esther | 3,040 | 98.4 | — | 95.8 (+2.6) | 79.5 (+18.9) | 32.1 (+66.3) | 1.6 | 7 |
| exodus | 16,709 | 98.4 | MACULA (=UBS) <0.1 | 94.5 (+3.9) | 77.0 (+21.4) | 32.6 (+65.8) | 1.6 | 19 |
| ezekiel | 18,694 | 97.4 | MACULA 0.2 | 95.6 (+2.0) | 76.5 (+21.1) | 32.3 (+65.1) | 2.4 | 54 |
| ezra | 3,747 | 96.5 | MACULA (=UBS) 0.1 | 95.7 (+0.9) | 81.6 (+15.0) | 38.6 (+57.9) | 3.4 | 8 |
| genesis | 20,609 | 98.6 | MACULA (=UBS) <0.1 | 95.3 (+3.3) | 77.2 (+21.4) | 35.4 (+63.2) | 1.4 | 12 |
| habakkuk | 670 | 98.5 | — | 97.9 (+0.6) | 84.3 (+14.2) | 47.6 (+50.9) | 1.5 | 2 |
| haggai | 600 | 95.5 | — | 94.0 (+1.5) | 76.5 (+19.0) | 30.0 (+65.5) | 4.5 | 0 |
| hosea | 2,380 | 98.1 | — | 96.5 (+1.5) | 79.0 (+19.1) | 44.2 (+53.8) | 1.9 | 3 |
| i-chronicles | 10,734 | 97.6 | — | 93.2 (+4.4) | 82.3 (+15.3) | 26.5 (+71.0) | 2.4 | 18 |
| i-kings | 13,132 | 98.3 | MACULA (=UBS) <0.1 | 94.9 (+3.4) | 78.6 (+19.8) | 28.7 (+69.6) | 1.7 | 14 |
| i-samuel | 13,245 | 98.7 | MACULA 0.1 | 95.5 (+3.2) | 78.1 (+20.6) | 26.9 (+71.8) | 1.3 | 23 |
| ii-chronicles | 13,307 | 98.7 | — | 95.2 (+3.4) | 79.6 (+19.1) | 25.9 (+72.8) | 1.3 | 23 |
| ii-kings | 12,268 | 98.0 | MACULA (=UBS) <0.1 | 94.7 (+3.3) | 79.5 (+18.5) | 25.5 (+72.5) | 2.0 | 30 |
| ii-samuel | 11,024 | 98.0 | MACULA 0.1 | 94.8 (+3.4) | 78.0 (+20.1) | 24.2 (+73.8) | 1.9 | 33 |
| isaiah | 16,916 | 98.3 | MACULA (=UBS) <0.1 | 97.2 (+1.0) | 82.6 (+15.7) | 44.9 (+53.4) | 1.7 | 36 |
| jeremiah | 21,824 | 97.9 | MACULA <0.1 | 95.3 (+2.6) | 76.3 (+21.6) | 28.2 (+69.7) | 2.1 | 34 |
| job | 8,322 | 98.8 | MACULA 0.2 | 98.6 (+0.4) | 82.2 (+16.8) | 45.3 (+53.5) | 1.0 | 41 |
| joel | 957 | 99.9 | — | 98.5 (+1.4) | 82.5 (+17.4) | 40.8 (+59.1) | 0.1 | 0 |
| jonah | 688 | 99.7 | — | 98.0 (+1.7) | 79.8 (+19.9) | 30.2 (+69.5) | 0.3 | 0 |
| joshua | 10,028 | 96.8 | MACULA (=UBS) <0.1 | 92.7 (+4.2) | 76.1 (+20.8) | 28.4 (+68.4) | 3.1 | 6 |
| judges | 9,874 | 97.6 | — | 93.9 (+3.7) | 77.3 (+20.3) | 29.0 (+68.6) | 2.4 | 13 |
| lamentations | 1,536 | 97.8 | MACULA (=UBS) 0.1 | 97.4 (+0.5) | 82.2 (+15.8) | 41.1 (+56.7) | 2.1 | 8 |
| leviticus | 11,946 | 99.3 | MACULA (=UBS) <0.1 | 95.4 (+3.9) | 75.7 (+23.6) | 35.2 (+64.1) | 0.7 | 9 |
| malachi | 875 | 94.3 | — | 92.5 (+1.8) | 75.7 (+18.6) | 35.7 (+58.6) | 5.7 | 2 |
| micah | 1,395 | 98.8 | — | 97.8 (+1.0) | 82.7 (+16.2) | 41.8 (+57.1) | 1.1 | 2 |
| nahum | 556 | 98.2 | — | 97.8 (+0.4) | 83.1 (+15.1) | 50.2 (+48.0) | 1.8 | 3 |
| nehemiah | 5,305 | 97.9 | MACULA (=UBS) <0.1 | 95.7 (+2.2) | 82.4 (+15.5) | 31.3 (+66.6) | 2.1 | 13 |
| numbers | 16,407 | 97.3 | MACULA (=UBS) <0.1 | 94.2 (+3.1) | 79.5 (+17.8) | 29.1 (+68.2) | 2.7 | 23 |
| obadiah | 291 | 99.7 | MACULA (=UBS) 0.3 | 97.2 (+2.8) | 81.1 (+18.9) | 35.4 (+64.3) | 0 | 1 |
| proverbs | 6,904 | 98.1 | MACULA (=UBS) 0.1 | 97.9 (+0.3) | 87.0 (+11.1) | 48.8 (+49.3) | 1.8 | 28 |
| psalms | 19,558 | 99.0 | MACULA (=UBS) 0.1 | 98.3 (+0.7) | 84.3 (+14.7) | 43.9 (+55.1) | 0.9 | 46 |
| ruth | 1,294 | 98.6 | — | 95.8 (+2.8) | 78.0 (+20.6) | 31.7 (+66.9) | 1.4 | 4 |
| song-of-songs | 1,248 | 98.6 | — | 96.9 (+1.8) | 84.4 (+14.3) | 56.4 (+42.2) | 1.4 | 9 |
| zechariah | 3,124 | 96.9 | — | 94.7 (+2.3) | 76.8 (+20.1) | 30.5 (+66.4) | 3.1 | 5 |
| zephaniah | 766 | 99.2 | MACULA (=UBS) 0.1 | 97.4 (+2.0) | 81.5 (+17.9) | 38.6 (+60.6) | 0.7 | 1 |
| **all 39** | 305,184 | 98.2 | MACULA 0.1 | 95.6 (+2.6) | 79.1 (+19.1) | 33.5 (+64.6) | 1.8 | 616 |

**Notes as the page would print them** (from `tools/notes.py`; the page takes the titles from `zone.work`):
- **Amos, BDB:** "BDB is partial: its own reading under 43.5% of Amos. STEP fills out 54.8%, chosen for this book. Today’s line stands under the other 1.8%." The choices are [STEP 54.8%] [MACULA 52.6%] [UBS 40.0%] [today’s line].
- **Psalms, STEP** (after a press): "STEP is partial: its own reading under 99.0% of Psalms. MACULA fills out <0.1%, chosen for this book. Today’s line stands under the other 0.9%."
- **Malachi, STEP:** "STEP is partial: its own reading under 94.3% of Malachi. No other source reads the rest. Today’s line stands under the other 5.7%." The choices are [MACULA 0%] [UBS 0%] [BDB 0%] disabled, and [today’s line] pressed.

## 4. Per book, and changing book

- Each book is its own page load (`BOOK` comes from `<meta name="reader-book">`, line 2648). On a new book:
  - The **first source carries over** (it is stored globally).
  - The **auto second is computed again for that book** from `index.json`.
  - A **second the reader chose themself carries over**, stored per first source.
  - The shares and the note are that book's.
- If the reader's chosen second fills nothing in the new book, it stays chosen and the note shows "0%". It is not silently replaced.
- In a work with no defaults file, the group and the note are hidden, the line is as it is today, and the stored choices are untouched.
- The static chapter pages (`/<book>/<n>/`) print the rest line (STEP plus its auto second), never a reader's choice. They are rebuilt with the round, under check-chapter-pages-v3.

## 5. Persistence, address flags and reset

- **localStorage**, every read and write wrapped in try/catch as the page does elsewhere:
  - `fh.line.source`: `"step" | "macula" | "ubs" | "bdb"`. Missing or invalid means `"step"`.
  - `fh.line.fill`: a JSON object mapping a first source to its chosen second, for example `{"bdb":"ubs","step":"none"}`, with seconds from `"step"|"macula"|"ubs"|"bdb"|"none"`. A missing key means auto. An entry equal to its own first source is ignored.
  - Neither name collides with `fh.def.order`, `fh.sources.defaults`, `fh.sources.off` or any of the other 27 existing `fh.*` keys.
- **Address flags**, read once and never stored (like `?senses=`):
  - `?line=step|macula|ubs|bdb`
  - `?fill=auto|step|macula|ubs|bdb|none`
  - Neither collides with the page's 12 existing flags (at, b, blobs, c, chain, dict, fixture, mode, nums, rail, senses, t).
  - check-clean-address-v1 must learn both flags.
- **Page state** next to `SENSES_KEY` and `chooseSenses` (3530–3546):
  - `LINE_SRC_KEY` and `LINE_FILL_KEY`; `lineSource`; `lineFillChosen(first)`; `lineSecond()` (resolved, auto or chosen).
  - `chooseLineSource(id)` and `chooseLineFill(id)`: store, fetch the book file if needed, `repaintGlossOrder()` and `reopenCard()`, paint the pills and the note, `railSwitch()`.
  - `window.__lineSource = { first, second, auto, ready, book }`.
- **Reset** (14322ff):
  - `SWITCHES_DEFAULT` gains `line: "step", fill: "auto"`.
  - `switchesAtDefault()` adds `lineSource === "step" && !lineFillChosen("step")`, but only where the group is shown.
  - The handler calls `chooseLineSource("step")`, removes `fh.line.fill` and closes the note.
  - The reset pill's title becomes: `the switches back to their default (English off, framed off, card numbering on, the concordance hud off, word senses off, the line from STEP with a second source chosen for each book) and every reading picked on this page forgotten`.

## 6. The line under each word

**Tiers, in order.** They are computed by a new `pickLine(word)`, called in `lineUnder` (12332) just before today's `placeLine` call:
1. **The first source** prints its pick 1.
2. **The second source** prints where the first has none.
3. **Today's line** where neither has one: the unchanged `lineUnder` chain (the place line when STEP is neither first nor second, then the pointing's leader, then the baked column), with its own chip.
- **Outside reach in v1, today's line always:**
  - Words under a joined run's line (4,402 words; drawn by `refreshJoinGloss`, 10825; tied to call #90).
  - Ketiv/qere pairs (1,054 words; `kqPlace` and `paintPairs` untouched).
  - Under the rail's "joined words: as separate words", each word of a chain is in reach.

**How each source prints:**
- **STEP:** `placeLine` exactly as today, where it answers. Otherwise the ledger pick 1, with its "/" read as " + " (`spanJoin`) and its signs through `signsOffLine` (3365), as TAHOT's are drawn.
- **MACULA:** its words joined by a space, as given. Never through `spanJoin`, which would turn "/" into "+".
- **UBS:** each piece's pick 1, its glosses kept with " / ", pieces joined by " + ", a piece that is only a sign left out. Never through `spanJoin`.
- **BDB:** the record's first highlighted words (`slot 5` up to its first " / "), with the whole highlight in the title. No sense number on the line; it goes on the card and in the title. This is open call 4 below.
- Brief step 5 already provides the helper: `lineText(ov) = ov.raw ? ov.text : spanJoin(ov.text)`, used at `wordBlock` (12612), `repaintGlossOrder` (13270), `coverText` (9087) and `lineSaid`/`lineFirst` (9814/9861).
- **Long lines** (UBS lines over 40 characters: 33,831; BDB: 2,735): clamped to three rows of the 11em box, with the whole text in `g.title`. The C1 law (pressed pill = `.r-now .v` = `g.title`) holds on the whole text.

**Marking.** `.g` gets `data-tier="1"|"2"|"0"|"out"`. While the first source is **not STEP**, tiers 2, 0 and out are drawn in `var(--tekhelet-dim)`, so the chosen source's words stand out. Under STEP nothing is dimmed. Rulings are never dimmed. This is open call 3.

**The chip on the line.** It credits the source whose words print:
- STEP's place line: PIECE:TAHOT or PIECE:MACULA, as today.
- STEP's ledger pick: M4 for kind r, M19 "STEP Brief" for kinds v and a.
- MACULA M3, UBS M18, BDB M46.
- M ids are resolved through `index.m_sources` by the bake, never typed.

`licenseChipFor` (5325; `says` at 5347) learns two cases:
- **First:** `the source the line reads here, chosen on the row of sources`.
- **Second:** `filling out {X} here, chosen for {work}`, or `filling out {X} here, your choice`.

STEP's place line keeps today's title as first ("the source that reads this word so at this place"). As a second it adds `, filling out {X}`.

**Examples from across the books** (`tools/verse_under_each.py`). ² marks STEP filling out (dim ink); italics mark today's line.

| place | today | STEP | MACULA (+STEP) | UBS (+STEP) | BDB (+STEP) |
|---|---|---|---|---|---|
| Psalms 23:1:1 | a psalm | a psalm | psalm | psalm / song | melody |
| Psalms 23:1:6 | I lack | I lack | want | to lack / to be in need (of something) | lack, need, be lacking, decrease |
| Psalms 23:2:4 | at | at | beside | at ² | at ² |
| Ruth 1:16:3 | may not | may not | not | may not ² (UBS gives "-") | may not ² |
| Ruth 1:16:4 | you entreat | you entreat | urge | to entreat / to beg / to intercede | meet, encounter, reach (sense 4) |
| Amos 2:10:3 | you | you | you | you ² ("-") | you ² |
| Amos 2:10:6 | and + I led | and + I led | and led | to lead / to take / to bring | go, come, walk (sense 2) |
| Isaiah 40:1:1 | comfort | comfort | comfort | to comfort / to console / … (clamped) | comfort ² |

## 7. At rest (STEP plus its auto second): what changes

The line changes at **616 words over the 39 books** (0.2%), and the chip alone changes at **197** more:
- **459 words:** STEP's own pick replaces a dictionary's line where the place line does not answer today. For example:
  - Daniel 2:5:5 «circumcise(-ing)» (M14) becomes «word + the».
  - Daniel 5:5:21 «to praise» becomes «hand + the».
  - Daniel 3:5:8 «sackbut» becomes «trigon».
  - Ecclesiastes 1:17:6 «A licentious person» becomes «madness».
  - Habakkuk 2:2:4 «record» becomes «write down».
  - Amos 1:10:6 «palaces + its» becomes «fortresses + its».
- **157 words:** the second fills where STEP has nothing. For example:
  - Jeremiah 17:11:10 «sea» (M25) becomes MACULA «days his».
  - Exodus 22:4:9 «flammable» becomes «livestock his».
  - Daniel 4:16:22 «form» becomes «lord my».
  - Ezra 4:7:10 «man, better known as Artaxerxes I; ◄ son of …» becomes «Artaxerxes».
- **Neither:** II Kings 5:18:23 «raw» stays.
- **Book by book:** the table's last column; Ezekiel 54 and Psalms 46 are the most, while Haggai, Joel and Jonah have none.
- **Consequences for the round:**
  - The resting-lines records, the chapter pages and the chain books are baked again.
  - check-same-product-v1's "at rest equals live" differs at exactly these words on the first ship, which must declare them.
  - check-line-reads-the-place-v1 has to accept STEP's ledger picks where the place line does not answer.
- **How the rest line reaches first paint without fetching the book file:** `index.json` carries these words per book under `rest` (§11), and the page draws them at first paint. The book file is fetched on the first card, as `suggestedReady` does (3408).

## 8. The card

**The reading row label** (`nowK`, 9070–9071). Today it reads "reading · TAHOT at this place". It becomes:
- First source prints: `reading · {X} at this place`. BDB adds ` · sense {n}`, or ` · the entry` (the marker read from `pointP:N.`, so `point17:11.` gives "sense 11").
- Second source prints: `reading · {Y} at this place · {X} has none here`.
- Neither, and the place line answers: `reading · STEP at this place · {X} and {Y} have none here`.
- Neither, and no place line: `reading · at every place this form stands · {X} and {Y} have none here`. If the second is "today’s line", only `{X} has none here`.
- After a ruling, as today: `markRuled` (9104) gives "reading · at every place this form stands".
- At rest the label changes "TAHOT" to "STEP" so that it matches the pill. A grep of the tools found no match on "TAHOT at this place". This is open call 9.

**The pressed pill** is the line's reading, which keeps the C1 law:
- Where a served row's printed text equals the pick (folded as `lineFirst` folds it), that row leads and is pressed.
- Otherwise a made pill `[0, words, words, M, …]` is added to `PLACE_ROWS` (7140), credited to the source and pressed. Its title: `{X}’s own words at this place; no row of the store prints them here`, plus ` · sense {n}` for BDB.
- Being pressed here is not a ruling; the label says "at this place".
- `placeOfCell` (8829) returns `pickLine(w) || placeLine(w)`.
- `placeLead`/`placeFirst` (7624) rank the lit source's picks 1..n first.
- Under MACULA, UBS or BDB the card opens on the whole form, not TAHOT's division (`placeSet`/`setCut`).
- Picks 2..n are pills after pick 1. Their title: `{X} {n} at this place · pressing it rules this reading wherever this form stands`.

**The sources at this place** take the place of "here the source reads" (9641–9650):
- The existing `p.r-piece` stays exactly where and when it is drawn today, with its `<b>` unchanged. Eight tools read `.r-piece:not(.r-sug) b`. Only its `<i>` changes, to `here STEP reads `.
- New `p.r-src[data-src]` lines follow it for each other source that has a pick here: `<i>here MACULA reads </i><b>…</b>` plus the chip. BDB adds `<span class="n"> sense {n}</span>`.
- The source that prints the line gets `<span class="r-on"> · on the line</span>`, or ` · on the line, filling out {X}`.
- Several picks continue after the `<b>`: ` · 2 «pleasant» (another number)` for STEP's kind a, `(a meaning variant (K))` for kind v, and UBS numbers restarting in each piece.
- A UBS "-" prints «-» as given.
- These are not buttons. They stand outside `.r-pills`, so the gate's S2 pill reading is unaffected.
- The BSB's `p.r-piece.r-sug` line (9669) stays beside them, unchanged.
- **On a tight card** (CSS at 1569 hides `.r-piece` and `.r-now .k`), the new `.r-src` lines fold away too. A `span.r-src-tag` after `.v` (never inside it) shows `{X}` or `{Y}` while the first is not STEP.
- **Runs and pairs:** a run's card and a pair's card are as they are today in v1.

## 9. Precedence and the other switches

The order is: a reader's ruling, then the switches that make the place yield today, then the first source, then the second, then today's chain.

| Switch | Under the row of sources |
|---|---|
| A ruling (a reading pressed on a card) | Wins at every place it reaches (`ruledLine` 5057; `repaintGlossOrder`'s held). Changing source never clears a ruling; reset does. A ruled line is never dimmed. |
| look up by: the headword · license other than any · the pointing: the letters only · names lead: yield at a name · the TAHOT witness off | The row yields exactly as `placeLine` does (12306–12318), and today's chain answers. The pills stay lit. The note adds `the line follows «{switch now}» on the switches`. |
| the line reads / reads first other than "the source here" | No pill is lit. Pressing a pill sets "the source here" again (§2). |
| sources (rail) | A switched-off source gives no line and its pill or chooser button is disabled. The auto second is computed again without it. No chip names a source that is switched off. |
| the pointing: keep / only this pointing | The row stands above the filter, as the place reading does. A made pill stands even where the gate withholds the row it names (question 6), and is counted. |
| source signs (no blanks) | STEP's ledger picks are drawn through `signsOffLine`. UBS "-" is no pick. |
| joined words: as written · license runs | The run's line stands under every source (v1). |
| joined words: as separate words | Each word follows the row. |
| pairs | Today's line (v1). |
| word senses · framed · card numbering · English reader | No interaction. The English reader reads the same `.g`. |
| concordance hud | The header pills still switch; the table is unchanged. |
| source suggested (BSB) | Unchanged, beside the sources on the card. |
| search | Made pills are not indexed in v1. |
| reset | STEP, second auto, note closed. |

## 10. The seven open questions to the corpus lane: the page's behavior until answered

1. **STEP picks naming no row** (949 in Genesis): the ledger's words print, credited to STEP (M4 or M19), as made pills on the card.
2. **receipt-v1's STEP counts:** nothing the reader sees changes. The bake and the checks hold to receipt-v1.1 (748 v, 5,376 a).
3. **A variant's letter:** printed as given, «(a meaning variant (K))», and not tied to ketiv/qere halves.
4. **BDB's words for a sense:** the line prints the record's first highlight and the card prints the whole highlight with "sense N" (§12, call 4).
5. **Places the piece store lacks** (Genesis 24, Ruth 11, Amos 4): STEP's ledger pick prints there, because the place line does not answer. They are among the 459.
6. **Picks whose named row the card withholds:** the made pill stands above the gate and the line prints the pick. Counted in the receipt.
7. **Jastrow:** no pill until its ledger lands, then «Jastrow» (id `srcJastrow`, key `jastrow`) last in the row order.

## 11. Data the spec needs (the bake: `tools/bake-default-picks-v1.mjs`)

`data/default-picks/index.json` is fetched in the boot `Promise.all` next to `data/source-suggested/index.json` (3927):

```json
{ "rule": "default-picks-rule-v1",
  "pins": { "receipt-v1.json": "89b2a4b618cd8339…", "receipt-v1.1.json": "daf37748afdedcd9…" },
  "order": ["step", "macula", "ubs", "bdb"],
  "sources": { "step": { "name": "STEP", "m": { "r": "M4", "v": "M19", "a": "M19" } }, "macula": { "name": "MACULA", "m": "M3" },
               "ubs": { "name": "UBS", "m": "M18" }, "bdb": { "name": "BDB", "m": "M46" } },
  "books": { "amos": { "words": 2042, "out": { "runs": 34, "pairs": 2 },
                       "has": { "step": 2003, "macula": 1954, "ubs": 1657, "bdb": 886 },
                       "fill": { "step": { "macula": 0, "ubs": 0, "bdb": 0 }, "macula": { "step": 49, "ubs": 2, "bdb": 4 }, "ubs": { … }, "bdb": { … } },
                       "rest": { "<WORD_N>": ["fortresses + its", "M4"] } } } }
```

- The page computes every share and the auto second from these counts, so turning a source off can recompute them.
- `words` is the zone's `counts.words`. My measure used the resting record's units, which cover 305,184 of 305,431 words; the 247-word gap was not traced.
- `has.step` needs the zone's `pg` to know where the place line answers, so the bake reads the zones.

`data/default-picks/<book>.json` (brief §2.3) holds `{ book, rule, places: [null | [step, macula, ubs, bdb]] }`, indexed `places[WORD_N - 1]`:
- `step`: `[[kind, words | 1, letter?], …]`
- `macula`: words or 0
- `ubs`: `[[piece, n, words], …]`
- `bdb`: `[[marker, record highlight | 0, point words | 0, opening 0|1], …]`. Both BDB texts are carried so that call 4 can be ruled without a new bake. "opening" is 1 where the point's row is listed in `data/sense-openings/`.

## 12. Checks the spec implies (for the check lane)

D1 to D10 as in the brief §4, with "resting" read as "STEP with its auto second", plus:
- **N1:** the note's numbers equal counts recomputed in node from the book file.
- **N2:** the auto second follows the rule, ties included. Run it on Psalms (tie, MACULA), Amos (none) and Ezekiel (MACULA).
- **N3:** `?line=` and `?fill=` are never stored.
- **N4:** changing book carries the first source and recomputes the second. A stored BDB opened on Amos shows "then STEP".
- **N5:** the Menu mirrors the four pills and their `.mode-dir`.
- **N6:** switching a source off reroutes the tiers.
- **N7:** at rest the line equals the rebaked record, and differs from the old record at exactly the `rest` entries.
- **Updates to existing checks:**
  - check-menu-switches-v1 M3 and check-reset-pill-v1 R1/R4 learn the row.
  - check-card-opens-on-the-line-v1 runs C1 under `?line=` for each source.
  - check-page-fetches-v1: a chapter page's load fetches no book defaults file.

## Decisions only the owner can make

- The line at rest moves at 616 words in the 39 books (459 where STEP's own reading replaces a dictionary's line, e.g. Daniel 2:5:5 «circumcise(-ing)» becoming «word + the»; 157 where the auto second fills, e.g. Jeremiah 17:11:10 «sea» becoming MACULA «days his»). The chip alone moves at 197 more. Accept this, as message 3 implies, or keep the resting line byte for byte and apply STEP's own picks and the second only once a reader presses a pill?
- Joined words (tied to call #90): v1 keeps a joined run's line under every source, which keeps 4,402 resting words unchanged. The brief's call 5 (a source leads a run where it has a pick at every word) would replace all 2,177 run lines at rest, because STEP covers every word. When the owner rules #90, should the ruling apply to all four sources alike?
- Dim ink: dim the words the first source does not print only while the first is not STEP (the spec), always (this dims 1.8% at rest, mostly joined-word lines and pairs), or never?
- BDB's line words: the record's first highlight, which is the same at every sense (Ruth 1:16:4 «meet, encounter, reach», sense 4), or the point's own highlighted words where they are not a sense opening (slot 3: «encounter / entreat»)? Your ruling «the entry's own words for the sense BDB files the verse under» may mean slot 3. Should «sense N» also print on the line, or only on the card?
- Long UBS lines are clamped to three rows with the whole text on hover and on the card (33,831 UBS lines run past 40 characters). Is that OK?
- The card's list of what each source reads here is information, not a switch (the spec, which overrides the brief's call 9). Should pressing it switch the whole page instead?
- Should «today’s line» be offered as a second source, so the first source stands alone over today's line (your earlier «62% TAHOT, 38% BDB» form)? The spec offers it.
- Ties for STEP's second: in 17 books MACULA and UBS fill exactly the same words. The spec breaks ties by row order, so MACULA wins. Note that your example «say BDB» can never be STEP's second: BDB places every citation through STEP's reading, so it fills none of STEP's gaps in any book.
- The card's reading row reads «reading · STEP at this place» instead of «reading · TAHOT at this place», to match the pill. OK?
- The percentages count only the words the switch reaches; joined-word lines and ketiv/qere pairs stay with today's line. So STEP shows 98.6% for Genesis, not the 99.9% in the letter. OK, or should coverage count every word the source has a pick at?
- Voice and placement on /toggles/: the spec files the two rail rows (the source here, filled out by) under «them», the sources, not «arrange», this site. OK?
- The 17 UBS picks whose words are «NO DATA YET», and UBS's «-» (10,907 words): the line treats both as no pick. Should the card print «-» as UBS gives it (the spec does) and leave «NO DATA YET» out, pending a word from the corpus lane?

## Could not determine

- Nothing was run in a browser. Card behavior, the first-paint flash under a stored non-STEP source, the Menu mirror and the tight-card fold are read from the code (pt zone.html sha256 4049381a…, 17,179 lines), not seen.
- Which BDB point words (slot 3) are sense openings and which are highlights. This needs the ledger's BDB rows matched to data/sense-openings/pieces-v1 and was not measured.
- Why the resting-lines record's units cover 305,184 of the 305,431 zone words in the 39 books (247 words). The percentages here use the record's words; the bake must use counts.words.
- What UBS's «-» means at a word (a reference with no gloss, or a deliberate «nothing here»), and what the 17 «NO DATA YET» picks are.
- What a variant's letter means (e.g. «K»). RULE.md says only «the variant's letter».
- Whether any tool matches the card label «TAHOT at this place». A grep found none; the 8 tools that read .r-piece read its <b>, but this should be confirmed in a run.
- How refreshJoinGloss and chainReadsWhole behave under «joined words: as separate words» with the row of sources. Not read in full.
- Whether GitHub Pages compresses .json in transit, which decides between .json and .json.gz for the per-book files.
- Whether the Menu should also carry the second-source chooser. In v1 it does not, because the chooser's buttons have no id and rowPills mirrors only buttons that have one.
- Whether the gate's S2 reading of each chapter's first cards changes at rest. At the 616 changed words the card may press a made pill, which stands inside .r-pills.
