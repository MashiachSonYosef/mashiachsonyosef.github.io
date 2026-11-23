# Ship 19's build: BDB's own entries (`b`) land, with the entry lists v1.1 (relays v218 and v212)

You build, in a sandbox, everything ship 19 lands, and hand back one script that applies it to a reader tree, with proof that it works and what it moves. You do not run the round, the gate or the suite, and you ship nothing.

## Where things are

- S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
- **Your sandbox:** `S/s11`. Start by resetting it to main as it stands: inside `S/s11` run `git checkout -- . && git clean -fd && git fetch -q origin main && git checkout -q -B ship19 7f6c862105c8f21a30b99695c9865d2b46514883`. The reader is `S/s11/reader`. You may change anything under it, and reset it again the same way. No other git command that changes state, anywhere.
- **Do not touch** `S/s12` (another helper builds ship 20 there), `S/s13`, `S/old`, or `/home/user/mashiachsonyosef.github.io` (read only). Start no server on 8899, 8912 or 8914; use 8940 to 8949 and stop it when done.
- **Your work folder:** `S/s28w` (tools in `S/s28w/tools/`, logs in `S/s28w/logs/`).
- **The store is read only**, its text files now mostly kept compressed (`<name>.gz`): `cd S && NODE_USE_ENV_PROXY=1 node r2.mjs list <prefix>` / `get <outdir> <key...>`. A full listing of the store is at `S/s25w/store-listing-after-step5.txt` (key, bytes, time). Each download in its own new folder under S; Python that reads downloads runs with `python3 -I`.
- **The letters:** v218 `S/dl-letters-v218-v220/v2/letters/moses-entry-ledger-v1/FOR-ELIJAH-v218.md` (read it first, whole); v212 `S/dl-letters-v210-v217/v2/letters/moses-entry-ledger-v1/FOR-ELIJAH-v212.md`; v211 beside it. v218's files are on the store under `v2/ledgers/all/entry-ledger/lists-v1.1/` (download them; every file you pin must be the bytes v218's letter names).
- **How the entries landed before:** ship 11 landed v203's and v204's lists, numbers (`n`) only: its record `/home/user/mashiachsonyosef.github.io/wip/2026-11-20/ship-11/`. Ship 15 put STEP's letters (`t`) from relay v211's list in place of v203's: its record `/home/user/mashiachsonyosef.github.io/wip/2026-11-22/ship-15/SHIP-15.md` and tools beside it. The tree's pin is `reader/data/row-entries/PIN.json`; the tool `reader/tools/apply-row-entries-v1.mjs`; the gate `reader/tools/check-entry-gate-v1.mjs` and the page's entry gate in `reader/zone.html` (`entryVerdict`, `bdbEntriesAt`). The store steps the round's environment runs: `S/s20w/tools/store-steps-16.sh` (read it: it picks the English Wiktionary list the pin names) and the environment `S/s19w/env.sh` (`ROW_ENTRIES_LEDGER`, `ROW_ENTRIES_LISTS`).

## What ship 19 lands

Relay v218 reissues both entry lists as v1.1, with v212's two answers settled: «forget» (n.fr.aa) off 27 lines; the 231 lines under the keys that spell אֶל with an ending land as given with l.aa.ab; 102 lines take H4480 and one line H7945. **Land `b`, BDB's own entries, from these lists, on every line that gives it, for the first time,** and the changed `n`. Read relays v212 and v218 on how the page's gate meets `b` (BDB's parting, ruling 6 of 13 November): my page reads reading 1 of v212 (a place asks its word's own key, and the gate gathers from every row of that key, before the pointing and the kinds hold any back).

The one difficulty: **English Wiktionary's list has two reissues.** v211's (`facts-slot-t-v1.1.tsv`, landed by ship 15: v203's lines with `t` widened) and v218's (`lists-v1.1/facts-slot-wiktionary-v1.1.tsv`: v203's lines with `n` and `b` changed at 126 lines, `t` as v203 gave it). Both say they keep v203's 54,261 lines, order and keys. **Land `t` from v211's list and `n` and `b` from v218's**, and prove first that the two lists name the same rows line by line (key, rank, m id, sha16 or whatever each list keys a row by) and differ only in the columns each relay says it changed. If they do not, stop and report; do not choose for me. For the other list (v204, Classical Hebrew Words and Hebrew Wiktionary), v218's v1.1 replaces v204's, landing `n` and `b` as the pin's facts say. The pin keeps each earlier list under `amends`, as ship 15 did.

Update everything that holds `b` back today: the pin's `facts_not_landed` and its words, the entry gate check's law on `b` (it may hold `b` to BDB's own rows the way E2 held `t`; teach it that a list of the pin may land `b`, as ship 15's patch 02 did for `t`), the tool's comments, `PIPELINE.md`. Every other law as strict as it is.

## What I need before the round: what moves

The resting lines are the test. BDB is one of the sources that rest open (the default picks), so its rows being withheld at a place can move a resting line. v218 section 5 counts, from its own records, 3,927 flips of BDB's own rows that carry `b` and no number (left → withheld at 2,215 places) under v212's reading, and says the lists' rows rest shut on the 39 books. **Measure it on the sandbox:** run the store step and the round's tools that the gate's change reaches far enough to bake the resting lines of every book (the round is `tools/round-v1.sh`; you may run its steps on the sandbox; it takes about 40 minutes whole), then compare every resting line and the first card of every chapter with main (`S/s7w/lines-diff.mjs <old reader> <new reader> <out.json>` compares resting lines; `S/old/reader` is main, read only, and no one serves it). Give me the count of places where a BDB row is withheld that was not before, and every resting line that moves, by book, with before and after. Name any place where the line after reads wrong to you, and say how the count compares with v218's figures.

## Rules

- House style in comments and records: the law and why in plain words, dated (23 November 2026). American English. No model or tool names.
- No Hebrew letters in any tool's source or string literal (`\u` escapes built without typing them: the Write tool and heredocs here turn a typed backslash-u escape into the character). Records copied from the lane stay byte for byte.
- A patch is a Python script of exact replacements, each `old` asserted to occur once. New tools may be whole files.
- Every file a pin names is the bytes its relay's letter names.
- Before anything waits on a script: `chmod +x` and `bash -n`.

## What to hand back

1. `S/s28w/apply-19.sh <reader dir> <log dir>`: applies everything in order on a reader tree at main 7f6c862105, stopping at the first fault; it leaves the store with every store step done and nothing left to write (as `S/s20w/apply-16.sh` did). It must also apply cleanly after ship 20 (`S/s29w/apply-20.sh`, being built now: names marks and the bridge's pin), so touch no file ship 20 needs without saying which.
2. Its run on the sandbox from a clean reset, twice (the second writing nothing), with its log.
3. Checks after it, with results: `check-entry-gate-v1`, `check-landings-v1`, `check-names-gate-v1`, `check-default-picks-v1` (node laws), `check-nothing-hand-typed-v1`, `check-no-import-side-effects-v1`, `check-ledger-declared-v1`, and any check that reads what you changed (find them). Prove each law you change fails once by a deliberate fault, then undo it.
4. The measure above: `S/s28w/logs/what-moves.tsv` and its counts.
5. Your report as your final text (under 700 words): what you built, each decision the brief did not settle and why, the figures, every check's result, and anything that worries you.
