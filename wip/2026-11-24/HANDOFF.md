# Handoff, 24 November 2026: where the page lane stands, and how to pick it up

## State

- **Live:** main 8c53c71284 (ship 20), gh-pages 0bfcfb215b, live check 88. Every relay of the corpus lane through v222 is landed or waits on a named owner call.
- **The foundation:** the thirty-nine books (Sefaria's Miqra according to the Masorah) with the twelve Bible dictionaries open at rest. Seventeen more sources are served shut at rest, a press away (`data/dictionary-kinds-v1.json`); PanLex is held with its source.
- **The store (R2):** 6.93 GB in 93,303 objects (listed 24 November), under the free allowance from December. The site never reads it; it is the lanes' handoff and holds the round's inputs too large for git. Owner's: three dashboard settings (scratch lifecycle 14 days, the 7-day abort of unfinished uploads, a budget alert).

## The direction (read first)

`THE-PRINCIPLE.md`: serve each source as it serves itself; STEP decides the thirty-nine books; machinery that reconciles sources stays; a rule that overrides a source's answer, or fires where nothing needed deciding, is the fault. `REVIEW-WEEK-PLAN.md`: the five reviews. **First job: the departures list** (every place the page departs from STEP, each rule counted where it acted on a real conflict and where it acted on nothing), its first entry the maqaf pair.

## Open with the owner

Davidson (filed among the twelve, while relay v217 says his place at rest is the owner's: settle which is true); the seventeen (my take: English Wiktionary's Hebrew entries the best to reopen; Classical Hebrew Words, Hebrew Wiktionary, Jastrow and Kethoneth Yoseph worth a sample read; the rest stay shut); the M51 Bible dictionaries list, ETCBC, STEP's expanded Strong, Harkavy; the Davidson measure I owe (what his rows would move at rest).

## How a ship runs (`ship-harness/`)

The round is in the repository (`reader/tools/round-v1.sh`); the harness around it was in a scratch folder and is copied here from ship 20:
- `chain.sh <pass> <suite>` runs `pipeline-21.sh` (the apply step, then the round from the start, then the resting-line diff against live via `lines-diff.mjs`), then `gate-then-suite.sh` (the gate `check-same-product-v1` against live on ports 8914/8912, then the whole suite in two lanes).
- `ship21.sh` commits the tree as one commit on main and makes gh-pages follow main («gh-pages follows main»); it refuses unless the pass ended DONE on this very zone.html and main has not moved.
- Two trees: a ship tree at main (was `S/s13`) and the live tree for comparison (was `S/old`), both clones of this repository.
- The round's inputs come from the store (`ENVIRONMENT-RESOLVED.txt` lists the seven, under `$S` = the scratch folder); a new session downloads them again with `r2.mjs` (read only; credentials from the environment, never printed), each into its own new folder, Python reading them with `python3 -I`.
- After a push: `check-nothing-unlanded-v1` on the tree, then the live check run on GitHub (live-check.yml), then move the live tree to the new main.
- Expected reds before a push: check-nothing-unlanded-v1 (until the push) and check-reading-rows-v1 R1 (the small phone's nine short rows, red on live too).

## Ship 21 (24 November 2026): the way home is the woven mark from the first paint

The owner, on Genesis while it loaded: «wrong home page logo on genesis». The door's 1,273 pages copied zone.html's text link («The Tabernacle») and only the script laid the mark in, so the old text showed while a page loaded. `tools/build-front-door-v1.mjs` now writes the mark into each page's way home (and refuses a zone.html whose way home is not the one text link it expects); the door step run again changed each page by that one line. Nine door and mark checks pass; Genesis 1 read on the new build shows the mark. Shipped without the full round and gate, as nothing under a word, no zone and no card changes: main 3476e24ebf, gh-pages 7de59f4e7c. Its live check runs on the Pages build.
