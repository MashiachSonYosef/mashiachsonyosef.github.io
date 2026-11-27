HAND-BACK FROM BUILDER V: the fresh card on a page — a second reader built on the place answers alone

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`

The second reader is built and proven: `S/s14/reader/place.html` shows all 929 chapters from the place answers alone, the one command makes everything in 172 seconds with every check holding, and a browser walk pressed 16,251 words with no page error. Nothing is committed, pushed or shipped; `reader/zone.html` and every served page are untouched; no tracked file changed (the sandbox holds only new, untracked files).

## 0. Decisions for you

1. **STEP's signs under a word.** The page prints STEP's English exactly as STEP writes it, so `<obj.>`, `<the>` and `¿` show (Ruth 3:1 reads «¿ + not», «to <the> + her»). The live reader hides them. Hiding them is one function in `place.html` (`lineOf`); I left them because the brief says «English exactly as STEP writes it». Say if you want them hidden.
2. **Where the edition sentence stands.** The brief lists it third on the card; I put it at the top, under the word, because at the bottom of seven dictionaries a phone reader would miss it. It is one block to move.
3. **The entries' pin moved.** The entries' builder now writes `entries/PIN.json` (byte-identical to E's old top-level `PIN.json`, sha256 58b5f81d…). The top-level `PIN.json` is now the joined pin. E's check and counts printer read the new place.
4. **93 written forms have no dictionaries.** The tag bridge is built from STEP's main column only, so 74 numbers that stand only in STEP's variants column (on 95 words: 93 written forms, 2 plain words) have no line. The card says so in plain words. The fix belongs in E's bridge builder (read the variants' tags too); I did not change E's output.

## 1. One pin, one command

```
cd S/s14/reader && tools/make-place-answers-v1.sh S/s45w/sources
```

- **What it does:** places, then entries and bridges, then the joined pin, then both parts' checks, then the page's files and their check, then the pin judged against the parts. `--parts-only` stops before the page's files.
- **Time:** 172 seconds for everything; 130 seconds with `--parts-only`. Both runs exit 0.
- **Same bytes as handed over:** all 59 files of the two parts are byte-identical to what P and E handed over, and both part pins are byte-identical.
- **The sources folder:** `S/s45w/sources/` holds links to the files on disk and `sources.json`, the folder's own map (paths relative to the folder, provider, revision). A newer file of a source goes in the folder with its path and revision changed in the map.
- **The joined pin:** `data/place-answers-v1/PIN.json` (105,235 bytes) holds each part's record whole under its own key (`parts.places`, `parts.entries_and_bridges`, `parts.page`) with the bytes and sha256 of the part's pin file. `tools/join-place-answers-pin-v1.mjs --check` fails if a part is rebuilt and not joined again.
- **E's tools in the tree:** the ten are now in `S/s14/reader/tools/` and pass `check-ledger-declared-v1` and `check-no-import-side-effects-v1`. The two writers moved out of the shared library into the builder, each tool got the lane and LEDGER header, and E's check got `// RUN: given`.
- **One gap from nothing:** P's fetch script makes `step/` and `macula/` but does not fetch TBESH or the dictionaries; those were placed by hand as links.

## 2. The page's data

`tools/project-place-answers-page-v1.mjs` writes `data/place-answers-v1/page/` in 25 seconds; two runs give identical bytes. The rules are in `tools/place-answers-page-v1.mjs`.

| Files | Count | As served (gzip) median | Largest | Unpacked median | Unpacked largest |
|---|---|---|---|---|---|
| Chapters | 929 | 19,338 bytes | 66,498 (Psalms 119) | 98,905 | 361,965 |
| Dictionaries by STEP number (`entries/t/`, fifty numbers a file) | 175 | 27,661 | 41,988 | 153,261 | 255,438 |
| Unabridged BDB records whole (`entries/u/`, fifty a file) | 201 | 29,593 | 91,068 | 148,964 | 386,709 |

Every chapter is under 150 KB as served. Unpacked, 172 chapters are over 150 KB; a table of repeated lines per chapter would bring that down, and I did not build it.

- **A dictionary's entry on the page** is the entry of `entries/` with named keys left out and nothing changed. Left out: the raw tree and byte offsets; each UBS sense's list of verses (the count is kept); UHAL's whole file text. `page/index.json` names them.
- **`page/index.json`** (25,940 bytes) holds the books in the tree's display order, the shape in words, and each source's file, sha256 and revision from the two pins.
- **Beyond the brief's list of inputs**, the tool also reads `data/book-order-v1.json` (the order of the book list) and `data/mam-restore-v5-rights-v1.json` (it stops if a zone's credit line is not the rights record's).

**The check** (`tools/check-place-answers-page-v1.mjs`, `// RUN: tree`, exits 3 where the files are not made) passes for all 929 chapters in 21 seconds, laws G1 to G11:
- 305,431 words, 29,395 marks and 306,523 forms held to the zones.
- 1,719,460 STEP strings and 1,427,652 MACULA strings held to the places.
- Every sense said to cite a place is found again by its address in the bridges and entries, with no code shared with the projection.
- 11,461 STEP numbers and 10,022 unabridged records, each in the one file its number names.
- 14 of 14 planted faults in a spoiled copy were caught, each naming its law (`S/s45w/logs/plants.log`).

**What the check found in my first projection:** 2,359 unabridged BDB citations stand in a lettered sub-point of a record's opening. P's printer says «the head» for these. The page's files now say the sub-point.

**A second witness:** P's own printer was run for Ruth 1–4, Genesis 1–5, Amos 7, Psalms 44, 2 Samuel 7, Daniel 2 and Exodus 20. At all 5,178 words it prints the same UBS senses (with how each reaches the word) and the same Open Scriptures BDB entries as the chapter files hold (`S/s45w/logs/cross-printer.log`).

**Counts from the page's pin:**
- 277,336 words carry at least one sense that cites the place; 262,200 carry a UBS sense at the very word.
- UBS at the very word: 259,552 by the entry STEP's number reaches, 19,846 by MACULA's lemma.
- UBS at the verse only (the reckoned word number does not land on the word): 10,544.
- BDB at the verse: 3,581 lines from the Open Scriptures file, 159,642 from the unabridged.
- 1,188 words where the two editions differ; 2,133 sentences.

## 3. The page

`S/s14/reader/place.html`: one file, 609 lines, plain JavaScript, no library, no Hebrew letter typed in it. Address `place.html?b=<book>&c=<chapter>`. It is not linked from any served page.

To see it:
```
cd S/s14 && python3 -m http.server 8931 --bind 127.0.0.1
```
then `http://127.0.0.1:8931/reader/place.html?b=genesis&c=1`. The server must stand at the sandbox root, because the fonts are at `/fonts/`. I stopped my server when I finished.

**What it shows, and why each part stands:**
- **The chapter.** Our Hebrew right to left, a verse at a time, as the zone writes it. Under each word is STEP's English for the row the places say the word meets, parts joined with « + ».
- **Marks** are drawn in a bronze frame with no wash.
- **Pairs.** A written-and-read pair shows both forms with the English under the read form. A word written and not read shows STEP's own word and says «written, not read».
- **The small ring** on a cell's corner marks a word where the editions differ.
- **The card** is fixed to the foot of the window at one height; what opens inside it scrolls inside it.
- **«At this word»**, one row a source, each with name and license, undrawn where the source has no answer:
  - STEP: its parts, its English, its own address.
  - MACULA: both of its English columns.
  - UBS «cites this very word», or «cites this verse» where its word count does not land on the word.
  - BDB in the Open Scriptures file, «cites this verse».
  - BDB unabridged, «cites this verse», with the citing record's own headword.
- **«In the dictionaries»**, under each number of the word a dictionary can be filed by, in the brief's fixed order. Each row has one line and a button that opens the whole entry in the source's own structure:
  - Strong's list as he lists it, with his signs, the lost-sign note and the unbalanced-bracket note.
  - BDB's senses in their nesting.
  - The unabridged record's opening, points and sub-points, with italic runs drawn by kind.
  - The UBS entry's base forms and senses.
  - The sense that cites this place is marked in the opened entry.
- **An ambiguous number** is said as «This number reaches 3 records of this dictionary; nothing in the files says which is meant», with the record that cites this place first.
- **Prefix and suffix parts** show STEP's own number and English only.
- **Credits** stand short on the card and in full at the foot, as each source asks; revisions come from the data.

## 4. The browser walk

At 412 × 915, deviceScaleFactor 2, one browser at a time, against a local server on this machine.

| | First walk | Second walk |
|---|---|---|
| Chapters | 29: Ruth 1–4, Genesis 1–5, and 20 others | 5: Ezekiel 21, Deuteronomy 28, Ruth 3, 2 Kings 18, Psalms 68 |
| Words pressed | 13,497 | 2,754 |
| Cards opened | 13,497 | 2,754 |
| «At this word» equal to the chapter file | 13,497 | 2,754 |
| Page errors | 0 | 0 |
| Real finger taps that opened a card | 87 of 87 | 15 of 15 |
| Cards with every whole entry opened and shut | 748 (5,320 entries) | 150 (1,072 entries) |
| Times the card moved | 0 | 0 |

- The 20 other chapters: Exodus 20, Numbers 7, Deuteronomy 5, Joshua 21, Judges 20, 1 Samuel 17, 2 Samuel 7, 2 Kings 6, Isaiah 9, Jeremiah 3, Ezekiel 6, Amos 7, Psalms 44, 68 and 119, Proverbs 22, Job 38, Daniel 2, Nehemiah 7, 2 Chronicles 34.
- All 1,451 marks of the first walk's chapters were drawn.
- The second walk was chosen for the written-form numbers the dictionaries' list lacks.
- **Time to open a card:** median 1.1 ms, 95th percentile 1.8 ms, largest 6.6 ms. With its dictionaries drawn: median 1.5 ms, 95th percentile 8.6 ms, largest 25 ms. These are local-server figures; a phone on a network pays one fetch of about 28 KB the first time a number's file is needed.
- Reports: `S/s45w/logs/walk.json`, `S/s45w/logs/walk-2.json`.

## 5. The pictures

All in `S/s45w/shots/`, 412 wide, deviceScaleFactor 2. I looked at 15 of the 19 in their final form. Of the other four, 01 and 04b I saw in an earlier take (only style rules changed after), and 02b and 03b I saw only as near equivalents taken before the last changes.

- `01-genesis-1-top.png`: the name in its four colors, «Genesis 1», the lede, the three buttons, then verses 1:1 to 1:4 with red Hebrew and blue English.
- `02-genesis-1-1-word-1-card.png`: the card of the first word. STEP «in + beginning», MACULA the same, UBS «in, on, at, when» with a star and «beginning», BDB unabridged 1. a. «beginning».
- `02b-genesis-1-1-word-1-card-dictionaries.png`: the same card scrolled to the dictionaries.
- `03-genesis-1-3-word-5-and-there-was.png`: STEP «and + there was»; UBS «to be (in existence)», «to exist»; BDB unabridged with the note that the number reaches 3 records. No «beacon» leads anything.
- `03b-genesis-1-3-word-5-dictionaries.png`: its dictionaries.
- `04-amos-7-12-word-6-go.png` and `04b-…-dictionaries.png`: «go». The unabridged BDB lists three records and says nothing in the files says which.
- `05-ruth-3-12-word-5-written-not-read.png`: the cell reads «if» with «written, not read» under it. The card opens with the two sentences, then STEP «if» at Rut.3.12#05=Q(K). No «mother».
- `06-psalms-44-15-word-6.png`: STEP «among the + peoples» (its type V row); MACULA «not (among) + peoples»; UBS «tribe», «people» by MACULA's form; BDB «people».
- `07a-ii-samuel-7-22-word-4.png`: «Yahweh» from STEP, MACULA «Yahweh (GOD)», UBS «YHWH».
- `07b-ii-samuel-7-22-word-5.png`: no English under the word, the ring on its corner. The card says STEP's text has no word that meets this one, names STEP's own unmet word «O Lord» (2Sa.7.22#04=L), and says no source gives a reading here.
- `08a-entry-opened-strongs-list.png`: Strong's entry for H1961 opened. «be(-come), accomplished, committed, like)» is one item with its note; «follow» carries the lost-sign note; × stands on three items.
- `08b-entry-opened-bdb-open-scriptures.png`: the Open Scriptures BDB entry with Qal, I., 1., a., b. nested.
- `08c-entry-opened-bdb-unabridged.png`: the unabridged record whole, with sub-point 1. a. marked «cites this verse».
- `08d-entry-opened-ubs.png`: the UBS entry with the sense «beginning» marked «cites this place».
- `09-ruth-3-14-word-6-written-and-read.png`: a pair, both forms as our text writes them, English under the read form, each form with its own STEP row on the card.
- `10-books-and-chapters.png`: the list of books and chapters.
- `11-foot-credits.png`: the credits in full.
- `12-genesis-8-20-word-11-spelled-otherwise.png`: «The two texts spell this word differently: our text has the letter … more.»

## 6. What still reads badly

1. **An ambiguous number can show another word's record.** At Ruth 3:12 word 5 (אם), STEP's number reaches 5 unabridged records, and the one that cites the verse is the record of כִּי («yea, surely, certainly»). The card shows that headword and says nothing in the files says which record is meant, but a quick reader may take it as this word's sense.
2. **STEP's signs** under words (decision 1 above).
3. **MACULA's two columns** print oddly at times: «(the) (the)», «it.was (there was)», and an empty gloss with only the bracketed word.
4. **The first line under a number can be a homograph's**, as P's note 9.8 said: UBS «mattock» leads for את, and the unabridged BDB's first record for היה is «Yahweh» unless a record cites the verse.
5. **The Open Scriptures BDB entry is thin** (the file is a work in progress by its own account). A sense with no marked meaning shows only its number.
6. **Unabridged BDB records** show `[…]` where the file leaves out a word in another script (6,200 places).
7. **The card takes two thirds of a phone's window**; the chapter band above it is about 300 pixels.
8. **Two STEP variant tags** come from the places with brackets and a blank («{H7992} », «{H2435} »). The page reads the number out of them; the places' reader could trim them.
9. **The page needs a browser with `DecompressionStream`** to read the `.json.gz` files.

## 7. What I left out, and why

- Strong's Wikisource edition as its own row: the brief's fixed order has seven. Its sign shows on the Open Scriptures rendering where that file lost one.
- UBS entry notes and each sense's list of verses: the count is shown.
- TBESH's line for a prefix number: the card says STEP's own number and English only.
- A sentence for MACULA's meetings: only STEP's are said.
- STEP's cut carried onto our letters, the grammar codes, MACULA's lemma and domains: not drawn in this first cut.
- Filters, switches, search: none, as asked.

## 8. The tree's checks

Each run alone in `S/s14/reader`. «Before» is the sandbox as handed over, with P's tools.

| Check | Before | After |
|---|---|---|
| `check-no-import-side-effects-v1` | pass | pass |
| `check-ledger-declared-v1` | pass | pass |
| `check-nothing-hand-typed-v1` | pass | pass |
| `check-nothing-hard-wired-v1` | pass | pass |
| `check-sidecars-all-named-v1` | pass | pass |
| `check-build-derived-v1` | pass | pass |
| `check-scope-derived-v1` | pass | pass |
| `check-k-maqaf-preserved-v2` | not run | pass |
| `check-manifest-prints-unguarded-v1` | red | red |
| `check-nothing-unlanded-v1` | not run | red |

- **`check-manifest-prints-unguarded-v1`** fails L5 with one finding: the committed manifest does not print the new rule id. I confirmed it was red as handed over by running it with only P's check in the tree. It clears when the manifest is emitted again and committed.
- **`check-nothing-unlanded-v1`** is red because nothing is committed: 26 tools and 1,370 data files are owed.
- No tree check lists `reader/*.html` beyond `zone.html` and the `index.html` pages, so none scans `place.html`.

## 9. Paths

**Sandbox, new files (all untracked), under `S/s14/reader/`:**
- `place.html`
- `tools/make-place-answers-v1.sh` (the one command)
- `tools/join-place-answers-pin-v1.mjs`
- `tools/say-place-answers-sources-v1.mjs`
- `tools/place-answers-page-v1.mjs` (the shape and rules)
- `tools/project-place-answers-page-v1.mjs`
- `tools/check-place-answers-page-v1.mjs`
- E's ten tools, brought in and mended: `tools/build-place-answers-entries-v1.mjs`, `tools/check-place-answers-entries-v1.mjs`, `tools/place-answers-entries-lib-v1.mjs`, `tools/place-answers-entries-strongs-v1.mjs`, `tools/place-answers-entries-openscriptures-v1.mjs`, `tools/place-answers-entries-unabridged-bdb-v1.mjs`, `tools/place-answers-entries-tables-v1.mjs`, `tools/place-answers-bridges-v1.mjs`, `tools/say-place-answers-tag-v1.mjs`, `tools/say-place-answers-counts-v1.mjs`
- `data/place-answers-v1/PIN.json` (joined), `data/place-answers-v1/entries/PIN.json` (E's, moved), `data/place-answers-v1/page/` (929 chapter files in 39 book folders, `entries/t/` 175 files, `entries/u/` 201 files, `index.json`, `PIN.json`)

**Work folder `S/s45w/`:**
- `sources/` (the sources folder of links, with `sources.json`)
- `shots/` (the 19 pictures)
- `logs/`: `make-all.log`, `make-parts-1.log`, `check-page-final.log`, `plants.log`, `cross-printer.log`, `walk.json`, `walk-2.json`, `before-*.log` and `after-*.log` for the tree checks, `sha-before.txt` and `sha-after.txt`
- `scripts/`: `walk.mjs`, `shot.mjs`, `plant.mjs`, `cross-printer.mjs`, `tags-not-bridged.mjs`, and the one-time edit scripts `add-headers.py`, `move-writers.py`, `resolve-paths.py`, `make-sources-json.py`
