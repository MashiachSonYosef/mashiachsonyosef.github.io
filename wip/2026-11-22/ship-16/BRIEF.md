# Ship 16's build: the translation tables return under the source ledger v1.1 (relay v210)

You build, in a sandbox, everything ship 16 lands, and hand back one script that applies it to a reader tree, with proof that it works on the sandbox. You do not run the round, the gate or the suite, and you ship nothing.

## Where things are

- S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
- **Your sandbox:** `S/s12`, branch `ship16`, checked out at main 571e4a449a; the reader is `S/s12/reader`. Ship 12's tool patches are already applied there (see «What is done» below). You may change anything under `S/s12/reader`, and `git checkout -- .` / `git clean` inside `S/s12` to start over. Do not commit, push, or run any other git command that changes state outside `S/s12`.
- **Do not touch** `S/s13` (a suite is running on it), `S/old`, or `/home/user/mashiachsonyosef.github.io` (except reading). Do not start web servers on ports 8899, 8912, 8914 (in use).
- **Your work folder:** `S/s20w` (tools in `S/s20w/tools/`, logs in `S/s20w/logs/`).
- **The store** is read only: `cd S && NODE_USE_ENV_PROXY=1 node r2.mjs get <outdir> <key...>` and `... list <prefix>`. Never write to it. Put each download in its own new folder; run Python that reads downloads with `python3 -I`.
- **Already downloaded** (each matched to the hash its letter names): `S/dl-v210-data/v2/ledgers/all/toggle-ledgers/source-corpus-v1.1.json` (and its README) and `S/dl-v210-data/v2/ledgers/all/send-back/send-back-v1.1/` (RULE.md, ANSWERS.md, landing-own-language-v1.1.jsonl, withdrawn lists, receipt-v1.1.json, verify-receipt-v1.1.json). Relay v210's letter: `S/dl-letters-v210-v217/v2/letters/moses-send-back-v1/FOR-ELIJAH-v210.md`. Read it first, whole.
- **Ship 12 (held, never shipped), the machine you port:** its record `/home/user/mashiachsonyosef.github.io/wip/2026-11-21/v207/` (`PLAN.md`, `REHEARSAL.md` especially its last sections, `tools/apply-12.sh`, `tools/rehearse-landings-12.sh`, `the-35-sources-as-the-index-held-them.json`), its tools in `S/s15w/tools/` (`pin-add-send-back.py`, `make-readmission-record.py`, `patch-03-kinds.py`, `patch-04-ledgers-excluded.py`, `readmit-sources-v1.mjs`, `check-readmission-v1.mjs`, and the other patches), and the store steps it ran after a landing, `S/s13w/store-steps-11c.sh`. The environment ship 12 used: `S/s12w/env.sh`; use `S/s19w/env.sh` (it sources the chain of environments the round needs).

## What ship 16 lands, and what it must not

Relay v210 corrects relay v207. Ship 12 had cut v207 to PanLex, the translation tables and Harkavy, and held it. Now:

- **Lands:** the translation tables' rows that the ledger v1.1 admits row by row: in the own-language list v1.1 these are the lines of M78 (114) and M103 (12), 126 lines. Their sources (M78, M103) are re-admitted to the store's index on the ground the ledger v1.1 gives (BY_ROW, admitted by Wiktionary's own language field).
- **Held, not landed:** PanLex's lines of the same list (M24 3,329 and M82 615). The ledger v1.1 admits them row by row too, but at rest on the Tikkunei Zohar 20 of them print «wolf» where the Zohar reads «of the father», which waits on the Zohar's prefix split (an open ruling). They stay struck, and each of their lines is recorded as not landed, held with its source, with that reason.
- **Out:** Harkavy (withdrawn whole by v210, refused by the owner); Moses's Bible dictionaries list (waits on the owner). Neither is pinned.
- **The source record:** `data/source-corpus-v1.json` is emitted from the ledger v1.1 (`tools/emit-source-corpus-v1.mjs`, which today names v1 at its v2 address; it must name v1.1 and read v1.1's shape), and `tools/check-source-corpus-v1.mjs` learns the new value BY_ROW: a BY_ROW witness's served rows stand only where the ledger's `admitted_rows` names them (read v1.1's README and the ledger's own fields for how `admitted_rows` names a row: by m, key and words). Its law that no witness the shelf cites is one M refuses must hold on the sandbox after the landing, and must fail if a row of a BY_ROW witness stands that `admitted_rows` does not name (prove that once by a deliberate test, then undo it).

## The one new clause

The landings derivation (`tools/derive-landings-v1.mjs`) refuses a line whose source the store does not admit. Give a pin's list a way to name sources it holds back (for example `held_sources: {"M24": "<why>", "M82": "<why>"}`); the derivation puts each such line in the not-landed list with its own kind and that reason, and lands nothing of it. `tools/check-landings-v1.mjs` (its law G5 knows one kind of not-landed line today) must accept the new kind only where the pin's list names that source with that reason. Every other law of every check stays as strict as it is.

## What is done in the sandbox already

Applied there, each cleanly: ship 12's copies of `tools/pinned-v1.mjs` and `tools/derive-landings-v1.mjs` (main + ship 12's holes clause), `tools/readmit-sources-v1.mjs` and `tools/check-readmission-v1.mjs` (new), and ship 12's patches 02, 05, 06, 07, 08, 09 and 10 (`S/s15w/tools/`). Main has not changed any of these tools since ship 12 copied them. Not yet done: the pin (patch for v1.1), the re-admission record (for M78 and M103 only), the kinds (patch-03 put PanLex's, the translation tables' and Harkavy's sources into families; ship 16 needs the translation tables' only), the ledgers' manifest (patch-04: read it and decide what ship 16 needs of it), the new clause, the source record and its check, the re-admission, the landing, the store steps.

## Rules

- House style of comments and records: say the law and why in plain words, with the date (22 November 2026) where you add a law. American English. No model or tool names.
- No Hebrew letters in any tool's source or string literal (write U+ escapes, built without typing them: the Write tool and heredocs on this machine turn a typed backslash-u escape into the character). Records copied from the lane stay byte for byte.
- Every file a pin names is the bytes its relay's letter names (hash them).
- A patch is a Python script of exact replacements, each `old` asserted to occur once.

## What to hand back

1. `S/s20w/apply-16.sh <reader dir> <moment prefix> <log dir>`: on a reader tree at main (or main plus ship 15), applies everything in order, as `apply-12.sh` did, and stops at the first fault. It must be runnable (chmod +x, `bash -n` clean). It must leave the store with every store step done and nothing left to write (as apply-12.sh's last lines prove).
2. Its run on the sandbox, from a clean checkout of 571e4a449a plus the tool patches above: the log, the store before and after (version, rows), the sources re-admitted, lines landed and not landed by kind and source.
3. These checks run on the sandbox after it, with their results: `check-readmission-v1`, `check-landings-v1`, `check-language-admitted-v1`, `check-source-corpus-v1` (and its deliberate failing test), `check-dictionary-kinds-v1` (its node laws; skip a browser law if it needs a port in use, and say so), `check-lane-state-v1`, `check-ledger-declared-v1`, `check-no-import-side-effects-v1`, `check-nothing-hand-typed-v1`, `check-scope-derived-v1`, `check-strike-language` or whichever check reads the strike tool (find it), and the strike tool run dry (it must strike nothing).
4. Your report as your final text (under 700 words): what you built, each decision you made that the brief did not settle and why, the figures, every check's result, and anything that worries you.
