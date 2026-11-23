# Ship 20's build: the name marks (relays v213 and v219) and the spelling bridge v1.2 (relay v220)

You build, in a sandbox, everything ship 20 lands, and hand back one script that applies it to a reader tree, with proof that it works and what it moves. You do not run the round, the gate or the suite, and you ship nothing.

## Where things are

- S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
- **Your sandbox:** `S/s12`. Start by resetting it to main as it stands: inside `S/s12` run `git checkout -- . && git clean -fd && git fetch -q origin main && git checkout -q -B ship20 7f6c862105c8f21a30b99695c9865d2b46514883`. The reader is `S/s12/reader`. You may change anything under it, and reset it again the same way. No other git command that changes state, anywhere.
- **Do not touch** `S/s11` (another helper builds ship 19 there), `S/s13`, `S/old`, or `/home/user/mashiachsonyosef.github.io` (read only). Start no server on 8899, 8912 or 8914; use 8950 to 8959 and stop it when done.
- **Your work folder:** `S/s29w` (tools in `S/s29w/tools/`, logs in `S/s29w/logs/`).
- **The store is read only**, its text files now mostly kept compressed (`<name>.gz`): `cd S && NODE_USE_ENV_PROXY=1 node r2.mjs list <prefix>` / `get <outdir> <key...>`. A full listing is at `S/s25w/store-listing-after-step5.txt`. Each download in its own new folder under S; Python that reads downloads runs with `python3 -I`.
- **The letters:** v219 `S/dl-letters-v218-v220/v2/letters/moses-names-gate-v1/FOR-ELIJAH-v219.md` and v220 `S/dl-letters-v218-v220/v2/letters/moses-spelling-bridge-v1/FOR-ELIJAH-v220.md` (read both first, whole); v213 `S/dl-letters-v210-v217/v2/letters/moses-names-gate-v1/FOR-ELIJAH-v213.md`. v213's files are downloaded at `S/dl-v213-data/v2/ledgers/all/names/names-landed-v1/` (each the bytes its letter names; check). v219's are on the store under `v2/ledgers/all/names/places-at-bridge-v1/`, v220's under `v2/ledgers/all/spelling-bridge/bridge-v1.2/` (download what you pin; every file you pin must be the bytes its letter names).
- **The names gate as it stands:** ship 11 laid names v2 (relay v198): its record `/home/user/mashiachsonyosef.github.io/wip/2026-11-20/ship-11/`; the pin `reader/data/names/PIN.json`, the tool `reader/tools/apply-name-rows-v1.mjs`, the check `reader/tools/check-names-gate-v1.mjs`, the page's names gate in `reader/zone.html`. The place list names v1 (`place-names-v1.jsonl`) is what the gate reads for «a place listed as a name»; find where the tree keeps it and how the page and the sidecars read it.
- **The spelling bridge as it stands:** ships 11d, 17 and 18: `reader/data/spelling-bridge/PIN.json`, `reader/tools/spelling-bridge-v1.mjs`, `reader/tools/apply-spelling-bridge-v1.mjs`, `reader/tools/check-spelling-bridge-v1.mjs`; ship 17's record `/home/user/mashiachsonyosef.github.io/wip/2026-11-22/ship-17/SHIP-17.md` (read its last sections: the classes held, and why). The owner ruled on 23 November («steps is fine»): at the 724 places where call 4 makes STEP's own reading stand, STEP's reading governs and the bridge's pieces are not laid.
- The store steps of the round's environment: `S/s20w/tools/store-steps-16.sh` and `S/s19w/env.sh`.

## What ship 20 lands

1. **v213's 22 name marks** (v200's 18 rows and v202's 4), laid as `name: 1` on the rows v213's lists name, as names v2 was laid. I held them in ship 15 so that the «Kittim» line at Ezekiel 27:6 word 11 would move once.
2. **v219's place-list addition** (`places-v1.1-additions.jsonl`: 1 `ADDED`, Ezekiel 27:6 word 11, and 6 `WITNESS_ADDED`), laid on names v1's place list as v219 section 1 says, **with the 22 marks or before them**, so that no row is held back at a place it was landed for. Names v1's file is not rewritten: keep the addition as its own file the page and tools read with it, or find the house's way.
3. **v219's name list for the translation tables** (`name-rows-tables-v1.jsonl`, 6 rows: «Tigris», «Lebanon», «Lord» twice, «Christ», «April»), because their lines are landed now (ships 16 and 18): lay `name: 1` on each, joined by `k`, `m` and the route's `sha`. Confirm each of the 6 is a served row. **Not** the M51 list (832 rows): M51's lines (the Bible dictionaries list) are not landed and wait on the owner.
4. **The spelling bridge v1.2** (`bridge-places-v1.2.jsonl`) in place of v1.1 in the bridge's pin, read by the bridge's tool. The class of places held for STEP's «}+» tag no longer has a reason: say what becomes of its 42 places (I expect most stay held under call 4's other classes, the « | » places and the places where STEP's reading stands; count them by class). Any place that becomes laid must be read on the page before and after, like ship 17's five. Nothing else of the bridge's holds changes.

## What I need before the round: what moves

- At Ezekiel 27:6 word 11: the line live prints (find it on `S/old/reader`, main, read only) and the line after, and the card.
- Every place where a name row's verdict changes: the 22 marks' rows and the 6 table rows (held back where a place is not a name, standing where it is), with the resting line and first card before and after where it shows. Run the store step and the round's tools on the sandbox (`tools/round-v1.sh`; about 40 minutes whole) and compare every resting line with main (`S/s7w/lines-diff.mjs <old reader> <new reader> <out.json>`), and the commentary zones too (`/home/user/mashiachsonyosef.github.io/wip/2026-11-22/ship-16/tools/commentary-gloss-diff.mjs <old reader> <new reader>`; note it reads a zone's line per key, so read held places on the page).
- The bridge: every place v1.2 lays that v1.1 did not, and any line that moves.

## Rules

- House style in comments and records: the law and why in plain words, dated (23 November 2026). American English. No model or tool names.
- No Hebrew letters in any tool's source or string literal (`\u` escapes built without typing them: the Write tool and heredocs here turn a typed backslash-u escape into the character). Records copied from the lane stay byte for byte.
- A patch is a Python script of exact replacements, each `old` asserted to occur once. New tools may be whole files.
- Every file a pin names is the bytes its relay's letter names.
- Before anything waits on a script: `chmod +x` and `bash -n`.

## What to hand back

1. `S/s29w/apply-20.sh <reader dir> <log dir>`: applies everything in order on a reader tree at main 7f6c862105, stopping at the first fault; it leaves the store with every store step done and nothing left to write (as `S/s20w/apply-16.sh` did). It must also apply cleanly after ship 19 (`S/s28w/apply-19.sh`, being built now: BDB's entries `b` from the entry lists v1.1, which changes `data/row-entries/`, the entry gate's check and the store), so touch no file ship 19 needs without saying which.
2. Its run on the sandbox from a clean reset, twice (the second writing nothing), with its log.
3. Checks after it, with results: `check-names-gate-v1`, `check-spelling-bridge-v1` (`--node`, and B5 on a free port), `check-held-places-v1`, `check-entry-gate-v1`, `check-landings-v1`, `check-nothing-hand-typed-v1`, `check-no-import-side-effects-v1`, `check-ledger-declared-v1`, and any check that reads what you changed (find them). Prove each law you change fails once by a deliberate fault, then undo it.
4. The measure above: `S/s29w/logs/what-moves.tsv` and its counts.
5. Your report as your final text (under 700 words): what you built, each decision the brief did not settle and why, the figures, every check's result, and anything that worries you.
