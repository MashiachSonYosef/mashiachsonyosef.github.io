# Ship 17's build: the spelling bridge's pieces at the 794 other places (relay v214, bridge v1.1)

You build, in a sandbox, everything ship 17 lands, and hand back one script that applies it to a reader tree, with proof that it works and the list of every line it will move. You do not run the round, the gate or the suite, and you ship nothing.

## Where things are

- S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
- **Your sandbox:** `S/s11`, branch `ship17`, at main b0f147b6b0 (ship 15 as shipped); the reader is `S/s11/reader`. You may change anything under `S/s11/reader`, and `git checkout -- .` / `git clean -fd` inside `S/s11` to start over. Do not commit, push, or run any git command that changes state outside `S/s11`.
- **Do not touch** `S/s13` (ship 16's round and suite are running on it), `S/s12`, `S/old`, or `/home/user/mashiachsonyosef.github.io` (read only). Do not start servers on ports 8899, 8912, 8914, and do not kill any `http.server` process: they belong to ship 16's run. If you need a server, use a port of 8930 or above and stop it when done.
- **Your work folder:** `S/s22w` (tools in `S/s22w/tools/`, logs in `S/s22w/logs/`).
- **Downloaded, each the bytes v214's letter names:** `S/dl-v214-data/v2/ledgers/all/spelling-bridge/bridge-v1.1/` (RULE.md, ANSWER-D.md, build-bridge-v1.1.mjs, verify-bridge-v1.1.mjs, bridge-places-v1.1.jsonl, receipt-v1.1.json, verify-receipt-v1.1.json, two-runs-v1.txt, verify-r1/). The letter: `S/dl-letters-v210-v217/v2/letters/moses-spelling-bridge-v1/FOR-ELIJAH-v214.md`. **Read the letter, RULE.md and ANSWER-D.md first, whole.** Run Python that reads downloads with `python3 -I`; never run the lane's scripts from inside the download folder.
- **The ship this extends:** ship 11d laid bridge v1 at 206 places. Its record: `/home/user/mashiachsonyosef.github.io/wip/2026-11-21/ship-11d/SHIP-11D.md` (read it whole) and its tools folder beside it. The tools in the tree: `reader/tools/spelling-bridge-v1.mjs` (the one reading of the list), `reader/tools/apply-spelling-bridge-v1.mjs`, `reader/tools/check-spelling-bridge-v1.mjs`, the gate's expectation in `reader/tools/check-same-product-v1.mjs` (`--expect data/spelling-bridge/PIN.json`), the zones step in `reader/tools/round-v1.sh`, and the pin `reader/data/spelling-bridge/PIN.json`.
- **Ship 16** (the translation tables, being run now) goes live before ship 17. Its patches are in `S/s20w/tools/`, applied by `S/s20w/apply-16.sh`; its applied state on another base is readable at `S/s12/reader`. Ship 17's script must apply cleanly on main b0f147b6b0 **and** on that tree plus ship 16. Check which files both touch (for example `PIPELINE.md`) and make your replacements meet either.
- The round's environment: `S/s21w/env.sh`.

## What ship 17 lands

Relay v214 gives, on every piece of the bridge, `english_tahot_as_written`: STEP's own part of its Translation column, byte for byte, brackets and the space after the stroke kept. With it, the places ship 11d could not word can be laid.

- **Lay:** the 794 places of `use` NEW_PIECES whose class is not STEP_WRITES_OUR_SPELLING (THROUGH_ONE_LETTER 748, SAME_LETTERS 46), **less the 42 of them whose pieces carry STEP's «}+» tag** (the letter's section 5: a tag like «H4648G}+»; bridge v1.2, relay v218, mends it, and I will not read around the fault before the mend). So about 752 places. Count them from the list, do not take my number.
- **Each piece's words:** `english_tahot_as_written` with the spaces taken off its ends, as the letter says to do when joining the pieces. Before writing, prove on every laid piece the letter's section 2: take `[`, `]`, `<`, `>` out, close runs of spaces, trim, and you get v1's `english_tahot`. Refuse the whole run if one fails.
- **The 206 ship 11d laid** are worded by their form rows. Check, at each of the 206, whether `english_tahot_as_written` trimmed is the same as the words laid now. If it is at all 206, one rule words every laid place and nothing at the 206 moves; say so. If it is not at some, keep the 206 as they are, list where and how they differ, and do not change them.
- **Not laid, as now:** the places beside the lattice's own pieces (the 30 STEP_WRITES_OUR_SPELLING and 5 SAME_LETTERS); the places with no pieces (held by the lane with their reasons); and now the 42 «}+» places, each with that reason. The pin says every class laid and not laid with its count, read from the list.
- **No tag is written**, as in ship 11d (its record says why).
- The pin names v1.1's files with their bytes and sha256 (v1's stay where they are, named as what v1.1 extends); copy into the tree the files ship 11d copied for v1 (read what it copied and why), and keep the large list off the tree only if ship 11d did.

## What the tools must learn

- `spelling-bridge-v1.mjs` reads v1.1 (its added fields) and is still the one reading. `apply-spelling-bridge-v1.mjs` lays the new places, proves everything above again first, and run twice writes nothing; it still refuses a laid place that carries other pieces.
- `check-spelling-bridge-v1.mjs`: B1 to B5 hold for the new set (B3's «the 794 new-piece places the pin does not lay carry none» becomes: the places the pin does not lay, the 42 among them, carry none). Add a law if one is needed for the words as written (each laid piece is its part trimmed; the marks off give v1's words). Prove each changed law fails once by a deliberate test, then undo it.
- The gate's expectation (`check-same-product-v1`, `--expect data/spelling-bridge/PIN.json`) must owe a line at every place the pin lays, the new ones included, through the same reading. Read how it finds the laid places and make sure it does not name any place.
- `PIPELINE.md` says what changed. A rule id or version moves only if the house's own rules say it must; say why in plain words with the date (22 November 2026).

## What I need to read before the round: every line that will move

On the sandbox, after applying: for every laid place, the line a reader sees at rest before (the tree's `data/resting-lines/` as main has it, and what the page prints) and after (the place's pieces joined as the page joins them, with the signs at rest). Find how the page draws a place's pieces (`zone.html`, `placeLine`) and how ship 11d's B4 reads the lines at rest; do not guess. Write `S/s22w/logs/lines-that-move.tsv` (book, chapter:verse, word, before, before's credit, after) and give me counts: lines whose words stay and only the credit changes; lines whose words change, by what led before (which source); lines that gain a bracket. Name any place where the after-line looks wrong to you (an empty piece, a piece of punctuation only, a doubled word).

## Rules

- House style in comments and records: say the law and why in plain words, dated. American English. No model or tool names.
- No Hebrew letters in any tool's source or string literal (write `\u` escapes built without typing them: the Write tool and heredocs on this machine turn a typed backslash-u escape into the character). Records copied from the lane stay byte for byte.
- A patch is a Python script of exact replacements, each `old` asserted to occur once. New tools may be whole files.
- Before anything waits on a script: `chmod +x` and `bash -n`.

## What to hand back

1. `S/s22w/apply-17.sh <reader dir> <log dir>`: applies everything in order on a reader tree at main b0f147b6b0 or at that plus ship 16, and stops at the first fault. Runnable and `bash -n` clean. Show it applies on both (for the second, copy what you need from `S/s12/reader` read only, or apply `S/s20w/apply-16.sh` to a throwaway copy if you must; do not run apply-16 on any tree but a copy you made under `S/s22w`).
2. Its run on the sandbox: the log; places and pieces laid by class and book; the 206 comparison; a second run writing nothing.
3. Checks after it on the sandbox: `check-spelling-bridge-v1` (B5 if it can run on a free port; say if not), `check-same-product-v1` cannot run without both builds served, so instead prove its expectation reads the new pin (a small run of its reading code, or a dry path), `check-nothing-hand-typed-v1`, `check-no-import-side-effects-v1`, `check-ledger-declared-v1`, `check-entry-gate-v1`, `check-read-words-v1`, `check-line-reads-the-place-v1`, `check-piece-store-v1`, with results.
4. `lines-that-move.tsv` and its counts.
5. Your report as your final text (under 700 words): what you built, each decision the brief did not settle and why, the figures, every check's result, and anything that worries you.
