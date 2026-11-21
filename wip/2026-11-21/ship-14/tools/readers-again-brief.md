# Re-proving reader-reported page faults on the current tree (read-only)

You are checking whether faults reported on 10 November 2026 against the reader page of fireandhail.com still exist on today's live build. You change nothing in any repository. You write probes and a report in your own folder only.

## Where things are

- S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
- The live tree, checked out: `S/s13` (commit c1ed776b65). The page is one file, `S/s13/reader/zone.html` (about 14,000 lines, script inside it). READ ONLY: do not edit, move or delete anything under `S/s13`, `S/old` or `/home/user/mashiachsonyosef.github.io`, and run no git command that changes state.
- It is served on this machine: `http://127.0.0.1:8899/zone.html?b=<book>` (book slugs are the file names in `S/s13/reader/data/zones/*.bin`: amos, ruth, daniel, genesis, obadiah, tikkunei-zohar, ...). The whole site root is `http://127.0.0.1:8912/`. If either server is down, start it: `cd S/s13/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 >/dev/null 2>&1 &` (and port 8912 from `S/s13`).
- Query parameters the page reads: `&default=ubs|bdb|macula|step` (the first default source), `&kinds=open` (opens the dictionaries that rest shut), `&commentary=on`.
- The findings: the reader's report named in your task, under `/home/user/mashiachsonyosef.github.io/wip/2026-11-10/review/readers/`. Its line numbers are from the page as it stood on 10 November. About fifteen ships have landed since: functions have moved, been renamed, or been mended. Find code by name with Grep, and read only the regions you need.

## How to probe

- Playwright is installed: in an `.mjs` file anywhere, `import { createRequire } from "node:module"; const { chromium } = createRequire(import.meta.url)("playwright");` then `chromium.launch()` with no options. Phone viewport 412x915.
- Start clean: clear localStorage once at the first load (not on reloads, if you test what is remembered).
- The page is ready when `section.seg .he-text .wb` exists and `window.__default` is absent or has `ready` or `failed` set; then wait about a second.
- A card opens by clicking a word (`.wb .w span`, or `.wb .w`). Its rows arrive later: wait for `#hud > .rows .b-read .r-pills button` (or `#hud .r-dflt`, `#hud .r-piece`) before reading it.
- Worked examples: `S/s18w/tools/pointer-relay-2.mjs` (press a pill, relay the section, read the line) and `S/s18w/tools/verse-cells.mjs` (a verse's words and lines).
- Put every probe you write in your own folder (named in your task) and run it from there.

## What counts as an answer

For each finding give one verdict:

- STILL PRESENT: you made a browser show it the way a reader would meet it (or, where no click reaches it, by calling the page's own function inside the page; say which).
- GONE: you made the same steps and the page does the right thing, or the code the finding names no longer exists and nothing does the same job wrongly.
- NOT REACHABLE AT REST: present, but only with a switch a reader must turn on (say which).
- COULD NOT DECIDE: say what stopped you.

A finding is a claim, not a fact: "gone" is as useful to me as "present". Do not answer from reading code alone when a browser can decide it. Spend at most about fifteen minutes on any one finding; if stuck, say so and move on.

## What to hand back

Write `REPORT.md` in your folder and return its text (under 700 words). For each finding: its number in the reader's report, one line saying what it is, the verdict, the evidence (the lines your probe printed, short), where it lives now (function names and current line numbers in zone.html), the smallest mend you would make (described, not applied), and the probe's file name. Print Hebrew as U+ codes or mask it.
