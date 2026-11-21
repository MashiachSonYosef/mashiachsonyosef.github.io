# Builder «load»: the first reader's findings 5, 6, 7, 10 and 11, all mended

As handed back, 21 November 2026. `patch.py` (16 exact replacements in `zone.html`), `check.mjs` (six laws, finding 11 in two halves; all six fail on live, all hold on the copy, about two minutes).

- **5.** The exporter's second ask passes `NO_WORD`, so no card's pointing, entry or name gates it. Before: «after the card at 3:7 word 6 was opened and shut: not cited, 1 withheld». After: «cited from a record, 0 withheld».
- **6.** The load keeps only whether the indexes list the book. `HUD_LANES.lay` fetches both run files the first time a run is to be laid, and stays synchronous at rest. Before: Genesis at rest asks for 2 run files. After: 0; with joined words as written, 7 joined cells and a chain's card the same as on a page loaded so; with the license runs on, both files asked and laid as before (188 of 297 HUD runs, 323 run cards). Pressed after load, live against the copy over Genesis's first 36 sections: cells, lines, chips and cards identical through every position of both switches.
- **7.** The stamp waits while a rested-off source has met no id and an overlay's index did not arrive (one clause more than suggested, so a key no file carries cannot hold the stamp back forever). Before: visit 2 off `[]`. After: visit 1 stamps nothing; visit 2 off `["MSAM2"]`, as a clean visit.
- **10.** The card follows the pointer, and is parked, only after six pixels of travel. Before: a still press marks the card moved, and the next word's card stands 161px under its word. After: not moved, 8px; a drag of sixty pixels still parks the card where it is left.
- **11.** At load, a bin not on the shelf (or its 404) keeps today's sentence; anything else says «This book could not be loaded … (reason)». In the loaders, a 404 is kept as an absence and a rejected fetch or any other status drops the memo, so the next card asks again. Before: «No book is published…» three times, and each of the four files asked once in the visit. After: the fault said with its reason, and each file asked twice and there.

Repository checks on the copy, green: check-hud-runs 8, hud-toggles 8, run-cards 5, run-card-forms 10, words-stand-alone 9, maqaf-pair-drawn 5, drag-offscreen 11, export 20, citations 17, rulings-under-sources 11, source-suggested 7, overlays 9, source-switch 15, form-of 17, card-opens-on-the-line 2. check-reading-rows R1 red with the same line as live; R2 and R3 ok. Rest comparison, live against the copy: 0 differences in cells, lines, chips and cards over Amos (2,179 cells), Genesis's first 160 sections, the Tikkunei Zohar, Ruth under BDB with kinds open, and three run-switch states kept before load.

The builder's worries:

- One of six runs of `check-run-card-forms-v1` on the copy stalled after R5 until a 900 s limit; the other five were green in about 42 s. Taken for the loaded machine, not proven.
- `window.__hudRuns.branch` is null at rest now (it was «OWN/UNION»). No check reads it.
- Finding 7 repairs nobody already stamped; that needs the record's version moved.
- The run files go together: a fault on either leaves both unlaid until the next lay.
- No throttle on retries, as with the shards.
- The masthead's ask also names no word; it runs at load and was left alone.
- A still press no longer sets `justDragged`; its click lands inside the card either way.

Read by me: the page diff whole. Applied to the integration copy on top of the rail, pairs and place patches: every replacement found once, no Hebrew letter, no new non-ASCII character, and the six laws hold there (`check-on-the-integration-copy.txt`).
