# The accuracy pass on the 39 books and the 12 dictionaries: what every helper needs

You are one of several helpers, each on one pass. You measure and report; you fix nothing and ship nothing. Read this whole file, then your own brief.

## The project in a paragraph

fireandhail.com serves the 39 books of the Hebrew Bible word by word (the text is Sefaria's «Miqra according to the Masorah»). Under every word stands one English line, and a press on a word opens its card: the readings («pills») that dictionaries give for it, each credited. 29 source families are served; **12 are Bible dictionaries and open by default** (Strong's 1890 in two editions' rows, BDB Open Scriptures, BDB unabridged, STEP's TAHOT, STEP's TBESH, MACULA, the UBS dictionary, the SDBH, Davidson, the Open Scriptures Lexical Index, UHAL, BiblicalTools); the other 17 are off by default. The line under a word is STEP's own reading at 305,293 of the 305,417 words. Two lanes build the site: the page lane (the lead who briefed you) and the corpus lane («Moses»), which prepares source data and writes «relays» (letters v102 … v222).

## Read first (in this order)

1. `/home/user/mashiachsonyosef.github.io/wip/2026-11-24/THE-PRINCIPLE.md` — the owner's principle: serve each source as it serves itself; on the 39 books STEP decides the division of a word, the entry of each piece and the reading; machinery that reconciles several sources' own answers is the work; **a rule of ours that overrides a source's own answer, or that fires where nothing needed deciding, is the fault.**
2. `/home/user/mashiachsonyosef.github.io/wip/2026-11-25/WEEK-PLAN-39-12.md` — the standard («where does a reader have to stop and work?») and the ten passes.
3. `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/base/reader/PIPELINE.md` — how the site is built (long; read the parts your pass touches).

## Where things are (S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad)

- **The frozen tree: `S/base`** (main at ea6e1ad08e, the live site). **Read only.** Never write in it, never run a tool there that writes (bakes, builds, `round-v1.sh`, anything named apply-, bake-, build-, emit-, project-, regloss-). Read-only tools and your own scripts may read it. The reader is `S/base/reader`.
- **Your work folder: `S/w39/out/<your letter>/`** — your scripts, logs, data files and `findings.md` go here and nowhere else.
- The page is one file, `reader/zone.html` (about 19,000 lines; all of the page's rules are JavaScript in it). The tools are `reader/tools/*.mjs`. Data: `reader/data/`.
  - `data/zones/<book>.bin` — a book (gzip JSON): sections, words, each word's key, pieces (`pg`), marks. `<book>.lattice.bin` beside it carries per-key facts for cards. `<book>.commentary.bin` is out of scope.
  - `data/route-store/` — every served dictionary row, in 256 gzip shards keyed by exact Hebrew key; `index.json` has `m_sources` (M-id → source key, label, license). A row is an array; read it through `tools/gloss-store-v1.mjs` (`openRouteStore`, `factsOf`), never by guessing positions.
  - `data/dictionary-kinds-v1.json` — the 29 families, their kind (the twelve are kind `bible`), their source keys, and which are off by default (`rests_off`).
  - `data/ledgers-v1/<source key>/` — the corpus lane's declaration for each source: how its punctuation divides a row and what prints (`declaration.json`, branches, print steps). `data/ledger-index-v1.json`, `data/ledger-branch-answers-v1.json` (the owner's rulings per branch).
  - `data/resting-lines/<book>.json.gz` — the line under every word as the page prints it by default: per section, rows of [word index, words covered, text, credit].
  - `data/default-picks/`, `data/names/`, `data/row-entries/`, `data/held-places/`, `data/spelling-bridge/`, `data/read-words/`, `data/pointer-entries/`, `data/sense-openings/`, `data/made-spaces/` — each with a PIN.json naming the relay and the sha256 of what it landed.
  - Tools worth knowing: `gloss-store-v1.mjs`, `entry-gate-v1.mjs` (placeEntry, placeTags, bdbEntriesAt, entryVerdict), `pointing-grade-v1.mjs` (gradeRow, heldByPointing), `stem-family-v1.mjs`, `name-lists-v1.mjs`, `zones-on-disk-v1.mjs` (zonesServed), `zone-walk-v1.mjs` (wordListsOf), `serve-tree-v1.mjs` (serves a tree on a port the machine picks), `playwright-v1.mjs`.
  - Two read-only measuring scripts to copy from: `S/s29w/tools/name-flips-20.mjs` (walks every place of the 39 books and asks each gate its verdict on a row, without a browser) and `S/s29w/tools/probe-cards-20.mjs` (opens the page in a browser, presses a word, reads the line and the card; `?kinds=open` in the address opens the sources that are off by default).
- **The corpus lane's store (R2), read only:** `cd /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad && NODE_USE_ENV_PROXY=1 node r2.mjs list <prefix>` and `node r2.mjs get <outdir> <key...>`. A full listing (key, bytes, date) is `S/s32w/store-listing-2026-11-24.txt`; most text files are stored as `<name>.gz`. Sources as received are under `v2/sources/`, the corpus under `v2/corpus/`, relays' data under `v2/ledgers/`, letters under `v2/letters/`. `reader/data/store-path-map-v1.json` maps old addresses to where the bytes stand now. **Never upload.** Put each download in its own new folder under your work folder; run Python that reads downloads with `python3 -I`; do not run an interpreter from inside a download folder.
- Letters already downloaded: `S/dl-letters-v210-v217/`, `S/dl-letters-v218-v220/`, `S/dl-v221-data/`, `S/dl-v222/`. The page lane's own records of every ship: `/home/user/mashiachsonyosef.github.io/wip/<date>/` (read only).

## Rules

- No git command that changes state, anywhere. No push. No edits outside your work folder.
- The machine has 4 cores and several helpers share it: run one heavy process at a time, do not fan out your own parallel jobs, do not start sub-helpers. Stop any server you start. Free disk is about 8 GB: do not download more than about 600 MB in all, and delete downloads you no longer need.
- Measure the whole population by machine wherever you can (every word, every row), then read samples by hand where a machine cannot judge. Say which is which.
- A finding must be something you saw: the place (book chapter:verse, word number), what the source's own bytes say, what the page shows, the count, and the cause (a file and line, or a named rule) where you found it. Keep «verified» and «suspected» apart. Where you can, confirm a finding on the page with a browser.
- Classify each rule-of-ours finding by the principle: it **overrides** a source's own answer; it **fired with nothing to decide**; or it **reconciles** a real conflict between sources (that one is not a fault).
- Propose a mend by rule, never by hand-editing a reading. You do not apply it.
- Plain American English in everything you write; no model or tool names in files.

## What to hand back

1. `S/w39/out/<your letter>/findings.md`: a summary table first, then the findings ranked by how many places they touch, each with its evidence, count, cause, class and proposed mend. Then «what I checked and found clean», with counts. Then «what I could not check, and why».
2. The data behind it as files beside it (tsv or jsonl), named in findings.md.
3. Your final message: under 600 words, the same summary, with the path of findings.md.
