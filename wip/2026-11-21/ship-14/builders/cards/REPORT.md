# Builder «cards»: the second reader's findings 2, 4, 9, 10, 11, 12 and 13, all mended (10 by half)

As handed back, 21 November 2026. `patch.py` (11 named edits in `zone.html`), `check.mjs` (seven laws, about 70 seconds: 7 fail on live, 7 hold on the copy), `rest-proof.mjs`.

- **2.** The witness's press keeps `routeKey(group)`. Before: the card opened again on «[was] Elimelech». After: on «Elimelech».
- **4.** A failed block keeps its place in `blockEntries`, so no paint asks again. A capture listener on the card's rows gives the place up when that block's button is pressed. Before: 392 requests in 3 seconds, and 383 more at the next press. After: 1 request in 3 seconds; pressed again, 1 more; the store let through and pressed again, 1 more and no failure said.
- **10, first half** (two edits, removable without the others moving). `cellMap` files a named run's maqaf-joined block under the run. `refreshJoinGloss`, only inside a run that has a ruling, draws a pressed several-word block as one part over its words (the existing `data-wn` tie). Before: card «El + Beth-el», line «El + Beth- + -el». After: line «El + Beth-el».
- **9.** `redrawReadings = null` on entering `renderReadings`. Before: the band holds 2 notes of the block before. After: 0.
- **11.** Each piece of `openSurfaces` is trimmed. Before: weights 700 and 400. After: 700 and 700.
- **12, fault shown.** Genesis 3:3 words 4 to 5, joined words as written, 240 wide: the row is let down to 9.93px, and switching off the shelf «no year given» leaves one part, which never reached the reset. Before: «garden» at 9.93px beside a plain word's line at 10.56px. After: 10.56px. It needs 240 wide: no row is let down at 320 or 412 in Genesis.
- **13.** The bare branch removes the title attribute. Before: 13 of 13 bare run lines with a title. After: 0.

At rest: the untouched and the mended page, both served by the builder, are identical at every line element across 31,400 lines (Genesis 22,984, Ruth, Obadiah, Ruth under UBS, Ruth and Esther as written), and 198 cards as they open are identical in content.

Repository checks on the copy, exit 0: choice-memory, run-card-forms, run-line-follows-division, run-cards, dictionary-toggle, block-in-table, rulings-under-sources, span-store, word-senses, ruled-equals-first-paint, concordance-counts-the-line, line-reads-the-place. reading-rows R1 red with the same 9 short as live.

The builder's worries:

- **Finding 10 is half closed.** With the two-block division pressed and nothing picked, the card says «El + Bethel» and the line stays word by word. On live too, and at spaced inner blocks (Genesis 16:14). The mend prints a pressed reading only.
- A pick on the inner block no longer shows as pressed on the card of the chain standing alone. It did before, though no line read it.
- A card's fit is not repeatable: the untouched page read twice differed in one card's «the record, whole» button, and `tight` and a label's `more` moved between reads until one card was opened first.
- Finding 4's table can still mislead: it says «neither the card nor the store has a reading» when the store failed and the card has no pill. Not touched.
- Seen in passing, not touched: Genesis 32:27 as written, a named run inside a larger cell, its whole rung ruled, and the cell's line does not change; `window.__pool` keeps the last block's pool on a block with none.

Read by me: the page diff whole. Applied to the integration copy on top of the other four patches: every edit found once, no Hebrew letter, no new non-ASCII character, and the seven laws hold there.
