# Mending proven page faults in an isolated copy (you deliver a patch, a proof and a check; you ship nothing)

You are mending faults in the reader page of fireandhail.com that were proven on today's live build. You work in your own copy of the page. You do not touch the ship tree, any repository, or any other builder's folder. I apply your patch to the ship tree myself after reading it, so what you hand back must be exact and small.

## Where things are

- S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
- The live tree: `S/s13` (commit c1ed776b65), page `S/s13/reader/zone.html` (about 20,000 lines, script inside). READ ONLY. It is served at `http://127.0.0.1:8899/zone.html?b=<book>`: that is your "before".
- Your copy: make it with `bash S/s18w/mk-shadow.sh <your name> <your port>` (name and port are in your task). It creates `S/s18w/shadow/<name>/` with its own `zone.html` (edit this one), `zone.html.base` (the untouched page, never edit), its own copy of `tools/`, and everything else by symlink, served at `http://127.0.0.1:<port>/zone.html?b=<book>`: that is your "after". If the server dies, run the script again; it keeps your edits.
- The proofs of the faults: the reports and probes under `/home/user/mashiachsonyosef.github.io/wip/2026-11-21/ship-14/readers-again/` (folder and finding numbers are in your task). Each report gives the steps, the printed evidence, where the code lives today and a suggested mend. The suggested mend is a suggestion: read the code and decide. Reuse the probes (copy them to your folder; do not edit them in place).
- Your deliverables go in `S/s18w/build/<your name>/`.

## How to probe

- Playwright: in an `.mjs` file anywhere, `import { createRequire } from "node:module"; const { chromium } = createRequire(import.meta.url)("playwright");` then `chromium.launch()` with no options. Phone viewport 412x915. Clear localStorage once at the first load.
- The page is ready when `section.seg .he-text .wb` exists and `window.__default` is absent or has `ready` or `failed`; then wait about a second. A card opens by clicking a word (`.wb .w span` or `.wb .w`); its rows arrive later: wait for `#hud > .rows .b-read .r-pills button` (or `#hud .r-dflt`, `#hud .r-piece`).
- Query parameters: `&default=ubs|bdb|macula|step`, `&kinds=open` (opens the dictionaries that rest shut), `&commentary=on`, `&rail=all` (draws the whole panel of switches).
- To run one of the repository's own checks against your copy: `. S/s18w/env.sh; cd S/s18w/shadow/<name> && node tools/<check>.mjs`. Checks that compare the page with its built files (the engine file, the chapter pages, the manifest, anything "unlanded") will be red in a copy; that is expected, ignore those. Behavior checks must stay as they are on the live tree. `check-reading-rows-v1` law R1 is red on the live tree already (a small phone's rows); it must not get worse.

## Rules for the mend

- The smallest change that makes the page right. No refactor, no rename, no tidy-up beside it. Do not change what a reader sees at rest anywhere else: the lines under the words and the cards as they open must stay exactly as they are (a gate compares 30,000 lines and 54 cards against live before anything ships).
- House style of the page's comments: say the law and why in plain words, with the date (21 November 2026) where you add a law. American English. No model or tool names anywhere.
- The page file holds no Hebrew letters: Hebrew in code is written as backslash-u escapes. Beware: the Write tool and shell heredocs on this machine turn a typed backslash-u escape into the character itself. So build such strings without typing the escape (in Python, `chr(92) + "u05be"`), and before you finish, prove that your patched page has no character in U+0590 to U+05FF and no new non-ASCII character that the base does not already use.
- If a finding turns out not to be mendable safely in a small change, do not force it: say so, with what you learned.

## What to hand back, in `S/s18w/build/<your name>/`

1. `patch.py`: a Python 3 script, usage `python3 patch.py <reader dir>`, that edits `<reader dir>/zone.html` by exact-string replacement. Every `old` string must occur exactly once in the base page (assert it). It must apply cleanly to a fresh copy of `zone.html.base` and produce your `zone.html` byte for byte: prove that by running it on a copy and comparing.
2. `check.mjs`: one browser check for your mends, usage `node check.mjs --base http://127.0.0.1:<port>`. One law per finding, each a short scenario that fails on the live page (`--base http://127.0.0.1:8899`) and passes on your copy. It prints one line per law, `  ok  <id>  <the law in a sentence>  ·  <what it saw>` or `FAIL  <id>  ...`, and exits 1 if any law fails. Address words by verse and word number, not by typing Hebrew. Keep it under about ten minutes of running time.
3. `REPORT.md` is refused by the harness for helpers, so return the report as your final text instead (under 600 words): for each finding, mended or not; what you changed in one or two sentences; the before and after lines your check printed; which repository checks you ran against your copy and their results; anything you saw that worries you.

Do not run git commands that change state. Do not start long suites: run only the handful of repository checks nearest your change.
