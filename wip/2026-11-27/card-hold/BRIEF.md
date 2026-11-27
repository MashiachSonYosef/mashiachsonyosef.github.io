# Builder: the card holds still when a reader presses another reading

You mend one fault in the reader page of fireandhail.com and prove the mend. You work in your own sandbox and hand back a patch; you do not ship, commit or push.

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`

- **Your sandbox:** `S/s12` (a git worktree at live `main`, ea6e1ad08e, clean). Change files only there, and write your own scripts and logs under `S/s36w/`.
- **Read only:** `S/base` (a frozen copy of live, other helpers read it), `S/old`, `S/s13`, `S/s11` (another builder is at work there), and `/home/user/mashiachsonyosef.github.io`.
- The machine is shared with seven other helpers (4 CPUs): run one browser at a time, and no whole-suite runs.
- House rules (CLAUDE.md is injected for you): American English; `zone.html` and the tools carry no Hebrew letters in string literals; a comment says what the code does and why, in plain words, as the file's own comments do.
- If a shell command with an inline script is refused by the safety check, write the script to a file with the Write tool and run it plainly. Never work around a refusal to delete.

## The fault

`reader/tools/check-levels-v1.mjs` holds the law «switching reading does not move the card» (line ~153): open a word's card, press the second reading's pill, and the card's `top` must not change. It is red on live.

What I measured on `S/base` (412×915, `S/s36w/card-move.cjs` and `S/s36w/card-parts.cjs`; serve the tree with `python3 -m http.server <port> --bind 127.0.0.1` from the tree's root and open `/reader/zone.html?b=<book>`):

```
amos word 1 pills 82   | before top/height 35/747  | after the press: 15/767
amos word 4 pills 139  | before top/height 14/768  | after the press: 27/755
amos word 8 pills 36   | before top/height 164/717 | after the press: 144/737
genesis word 1 pills 26| before top/height 20/762  | after the press: 22/761
genesis word 4 pills 23| before top/height 56/727  | after the press: 36/747
psalms word 1 pills 6  | before top/height 270/507 | after the press: 251/527
psalms word 8 pills 8  | before top/height 112/742 | after the press: 114/740
```

On Amos word 1 the parts say where the height changes: the head, the line (`p.r-now`) and the rows region (`div.rows`, 467px both times) keep their heights; the record's slot at the card's foot (`div.d-slot`) goes from 159px to 179px (its inline max-height follows), its record (`div.d-card`) from 203px to 378px of content. The card stands above its word and is held by its foot (ship 14's law: `placeInBounds` / `holdCard` / `cardAtWord`, `zone.html` ~8151–8181), so its top, and every pill under the reader's finger, moves by what the record's slot gained or lost. On that press the page also scrolled (scrollY 0 → 16).

So two laws meet: a card at its word keeps its foot there, and a reading switch does not move the card. Both can hold only if the card's height does not change on a switch.

## The law to build

**When a reader presses another reading on an open card, the card's outer box holds still: its top, its left and its height are what they were, and the page does not scroll.** Inside the box:

- The record's slot keeps the room it had. A record shorter than the slot leaves the room under it empty (the slot keeps its height); a longer record scrolls inside the slot, as it already does.
- Where the new record's floor (its source line and the lines of record the fit owes above it, `zone.html` ~7896–7944) needs more than the slot has, the readings band yields the difference from its own foot, so the pressed pill does not move; the bands still stop on a row (`snapBandsNow`).
- Only where the card cannot serve the new record's floor inside its present height may the box change, and then it changes as it does today.
- The hold ends when the card is closed, opened at another word, moved by the reader, or the window is resized or turned: a new fit then runs as today. A card the reader has moved (`hudMoved`) is not held by this law at all.
- Other things that redraw an open card (a source switched on or off, «only this pointing», the records drawer, a font arriving, a division pressed) keep today's behavior unless you find the same fault there: then report it, and mend it only if the same hold serves it without bending another law.

This is my recommendation, not a fixed design: if reading the fit (`fitBandsNow`, ~7704–8110, with its history in the comments) shows a smaller or truer mend that gives the same result under the reader's finger, take it and say why. What is fixed is the result: on a press of another reading, nothing under the reader's finger moves.

## Prove it

1. Extend `S/s36w/card-move.cjs` into a measure that, for at least 12 books (Genesis, Exodus, Psalms, Isaiah, Amos, Obadiah, Ruth, Daniel, Ecclesiastes, Job, Ezra, 1 Chronicles) × 10 words spread through the first chapters × every pill of the card up to 12 presses in a row (forward, then back to the first), at three windows (412×915, 360×640, 1280×800), records the card's top, left, height, the page's scrollY and the pressed pill's own top before and 50, 150, 400 and 900 ms after each press. Run it on `S/base` (before) and on your sandbox (after). Report: presses made, presses where anything moved, by window, before and after.
2. The pressed pill is visible and whole after every press; the record's source line (license, credit) is visible after every press; no pill is cut through by its band's edge. Count the breaches before and after.
3. Screenshots (deviceScaleFactor 1) of three cards before and after a press, on the old page and the new, saved under `S/s36w/shots/`; look at them yourself and say what a reader sees, including the empty room under a short record if your mend leaves one.
4. Run the page's own checks that touch the card, one at a time, on your sandbox and name each result. `ls reader/tools/check-*.mjs | wc -l` is about 170; pick those that open cards (grep for `#hud`), at least: check-levels-v1, and every check whose name carries card, band, hud, pill, fit, place, records, drawer. Read how `reader/tools/round-v1.sh` and the suite runner call a check (arguments, environment: `. S/s31w/env.sh` sets what they need). A check red before and after is not yours: say so with its figure on `S/base`.
5. The check itself: `check-levels-v1`'s law stays as written. Add to it (or to the check where it belongs) a law that presses three readings in a row on two cards and holds top, left, height and scrollY, read 400 ms after each press, so the law no longer rests on one press read at 120 ms.
6. If `zone.html` changes, the door's built pages may carry its bytes or its hash: read `S/s34w/after-words.sh` (what had to be rebuilt after the last `zone.html` change: lines, chain, door, switches, lines diff) and say what must be rebuilt at ship time. Do not run the round.

## Hand back

- `S/s36w/apply-card-hold.sh`: applies your change to a clean tree at ea6e1ad08e given as its first argument (a patch file under `S/s36w/` applied with `git apply`, or a script; it must refuse if the tree's `zone.html` is not the bytes you built against).
- `S/s36w/FINDINGS.md`: what the cause was, in the page's own terms; what you changed and why that and not another; the measures before and after (the table from step 1); the checks' results; what a reader sees; anything else that moves the card that you found and did not mend.
- Your final message: under 400 words, the same in short, with every figure you give read from a file you name.
