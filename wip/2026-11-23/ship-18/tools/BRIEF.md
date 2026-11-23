# Ship 18's build: the corpus lane's resting call for the translation tables' rows (relay v221)

You build, in a sandbox, everything ship 18 lands, and hand back one script that applies it to a reader tree, with proof that it works and the list of every line and pill it moves. You do not run the round, the gate or the suite, and you ship nothing.

## Where things are

- S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
- **Your sandbox:** `S/s12`. Start by resetting it to main as it stands: inside `S/s12` run `git checkout -- . && git clean -fd && git fetch -q origin main && git checkout -q -B ship18 b1acf1e22069ed953ccd7a5eac4253ffc52b26c7`. The reader is `S/s12/reader`. You may change anything under it, and reset it again the same way. No other git command that changes state, anywhere.
- **Do not touch** `S/s13`, `S/s11`, `S/old` (the live tree, served by nobody right now), or `/home/user/mashiachsonyosef.github.io` (read only). Start no server on 8899, 8912 or 8914; use 8930 or above and stop it when done.
- **Your work folder:** `S/s26w` (tools in `S/s26w/tools/`, logs in `S/s26w/logs/`).
- **The store is read only**, and its text files are now kept compressed: `cd S && NODE_USE_ENV_PROXY=1 node r2.mjs list <prefix>` / `get <outdir> <key...>`. Each download in its own new folder; Python that reads downloads runs with `python3 -I`.
- **Downloaded, each file the bytes v221's letter names (68 checked):** `S/dl-v221-data/v2/ledgers/all/send-back/two-table-rows-v1/` and the letter `S/dl-v221-data/v2/letters/moses-send-back-v1/FOR-ELIJAH-v221.md`. **Read the letter, `RULE.md` and `ANSWER.md` first, whole.**
- **Ship 16** (live) landed v210's own-language list v1.1 with two lines held by their line («necromancy», «zaatar») and PanLex held with its source: the landings pin `reader/data/landings/PIN.json` (`held_lines`, `held_sources`), `tools/derive-landings-v1.mjs`, `tools/check-landings-v1.mjs` G5, the re-admission record and its check, `data/source-corpus-v1.json` and `tools/check-source-corpus-v1.mjs` (L2, L4: `admitted_lines_not_served`). Its record: `/home/user/mashiachsonyosef.github.io/wip/2026-11-22/ship-16/SHIP-16.md`, its tools beside it. Ship 16's measures of what the rows moved in the commentary zones: `.../ship-16/measures/run2/commentary-lines-that-move.tsv`, made by `.../ship-16/tools/commentary-gloss-diff.mjs` (reads two trees, writes nothing).
- The round's environment: `S/s21w/env.sh`. The round itself (`tools/round-v1.sh`) is long; you may run single tools of it on the sandbox.

## What ship 18 lands

Relay v221 answers the two held lines: both rows are right as English Wiktionary's own words; at the Targum's places the word is another word written alike. It gives the lane's resting call for every row of the translation tables in the Targum and the Zohar, place by place, in `places-v3.1.jsonl` (4,065 row-places): **at each place it marks `at_rest: "held"`, keep the row off at rest.** 134 places are held: 122 in the Targum (`zone: "targum"`: Onkelos and the other Targumim, which on our site are the commentary zones beside each book, `data/zones/*.commentary.bin`), 12 in the Zohar proper and Zohar Chadash, which we do not serve (record them as works not served; do not invent a place). The branches labelled on places (`WIDE_HOLD`, `BRANCH_HELD_BY_CORPUS_POINTS_TIE`) stay **off** at rest: record them, hold nothing by them.

1. **The two rows land.** The landings pin's `held_lines` lets them go (they become landed rows like the other 124: 126 in all), with v221 named as the reason. Every law that reads held lines (derivation, G5, the re-admission record and its check, the source record's L4) follows from the pin, not by hand.
2. **A row held at a place.** Build the way the house keeps a row off one place while it stands elsewhere. Look first for the mechanism closest to this in the page and the round (for example how the pointing gate withholds a row at a place where its points differ, how the names gate holds rows by place, how call 4's held places are read), and follow its semantics: what a reader sees at rest (the line, and whether the row is offered on the card at rest), and whether a switch lifts it. Say which you followed and why. **Key each hold as the letter says: by row (m, key, route), work, verse unit and class**; our commentary text may be another edition than the lane's, so its token row is not ours. Find, on our zone, the word or words of that key in that verse; report every place not found and every verse where the key stands more than once (and what you did there).
3. **The pin and the records:** v221's files the hold reads, pinned by sha256 (copy into the tree what the house copies for a list of this kind; read ship 16's pin and how it kept the large list), and the hold written by a tool in the round, typed on the zone it changes, run twice writing nothing the second time.
4. **A check** (a new one, or a law in the nearest existing check): every place the pinned list holds at rest is held on our zones or named as not served/not found with its reason; nothing else is held; the branches hold nothing. Prove it fails once by a deliberate fault, then undo it.
5. **Two record fixes in the same ship:**
   - `data/spelling-bridge/PIN.json`, the class `a_place_where_steps_reading_stands` (724 places): its reason ends «The place waits until the page lane says how a place both read is drawn (22 November 2026).» The owner ruled on 23 November 2026, in their words «steps is fine»: STEP's reading governs the card at those places, and the pieces are not laid. Reword that sentence to say so. Nothing else of the pin changes, and the bridge's check must still pass.
   - `data/store-path-map-v1.json`, `after_the_cut.left_the_store`: for the 7 entries that say `on_the_corpus_lane_disk_only`, the corpus lane corrected that all are also in git on corpus-staging, under `corpus-lane-builds/moses-coverage-trial-v1/` (the three `jastrow-word-senses-v1/` files) and `corpus-lane-builds/moses-read-words-v1/` (the four `read-words-v1/` files). Say so on each, keeping the disk path. Make it with a tool (the map's section was written by `/home/user/mashiachsonyosef.github.io/wip/2026-11-23/store-move/tools/emit-path-map-after-cut-v1.py`).

## What I need before the round: what moves

On the sandbox after applying (and the zones step's tools that the hold affects run on it): for every commentary-zone and Tikkunei Zohar place whose line or whose card at rest differs from main, before and after (`S/s26w/logs/what-moves.tsv`), with counts by row and by kind of change. In particular:
- the 13 places of the two rows (bare on live; they must stay bare, or show another source's reading if one leads there);
- **the three misfires v221 names** (§6): «midsummer» at its 8 places, «Lord» at Targum Jonathan on 2 Kings 5:13, «preach» at Targum Jonathan on Deuteronomy 13:7: what the page shows there at rest before and after, and the Targum's word in its verse;
- «sour grapes» (69 places held): what each place shows at rest now and after.

## Rules

- House style in comments and records: the law and why in plain words, dated (23 November 2026). American English. No model or tool names.
- No Hebrew letters in any tool's source or string literal (`\u` escapes built without typing them: the Write tool and heredocs here turn a typed backslash-u escape into the character). Records copied from the lane stay byte for byte.
- A patch is a Python script of exact replacements, each `old` asserted to occur once. New tools may be whole files.
- Every file a pin names is the bytes its relay's letter names.
- Before anything waits on a script: `chmod +x` and `bash -n`.

## What to hand back

1. `S/s26w/apply-18.sh <reader dir> <log dir>`: applies everything in order on a reader tree at main b1acf1e220, and stops at the first fault. If the landing must be applied with ship 16's machinery (`derive-landings`, the store steps), it must leave the store with every store step done and nothing left to write, as `S/s20w/apply-16.sh` did.
2. Its run on the sandbox from a clean reset, twice (the second writing nothing), with its log.
3. Checks after it on the sandbox, with results: your new check or law (and its deliberate failure), `check-landings-v1`, `check-readmission-v1`, `check-source-corpus-v1`, `check-language-admitted-v1`, `check-spelling-bridge-v1` (B1 to B3, B6 at least), `check-nothing-hand-typed-v1`, `check-no-import-side-effects-v1`, `check-ledger-declared-v1`, `check-commentary-in-line-v1`, and any check that reads what you changed (find them).
4. `what-moves.tsv` and its counts, the misfires and «sour grapes» as above.
5. Your report as your final text (under 700 words): what you built, which mechanism you followed and why, each decision the brief did not settle, the figures, every check's result, and anything that worries you.
