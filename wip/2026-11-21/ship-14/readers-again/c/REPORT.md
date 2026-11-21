# The third reader's report (page script lines 11700 to 16381), decided again on c1ed776b65

The helper's report as handed back, 21 November 2026. Phone 412x915, clean storage, the live tree served on this machine. Line numbers are today's `zone.html`. Probes are in this folder (`lib.mjs` is shared; `x1-debug.mjs` is a leftover).

A helper's verdict is a claim until I prove it while mending; the ship's note says which I proved.

**3. Reset redraws the rail without its dictionary strip.** GONE; one part left, NOT REACHABLE AT REST (`?rail=all`).
- Obadiah: `at load: chips 13`, `after reset: chips 13`.
- Left: `at load: button shown: "show the scribes' marks (21: verse ends)"`; `word senses pressed: button NOT IN THE PAGE`. Its fold is drawn only under `?rail=all`.
- Where: `railSwitch` 16830 (refill at 16902); `rows.replaceChildren()` 16833 drops the button before 16884 looks for it. Mend: take the button before 16833.
- Probes: `f3-reset-rail.mjs`, `f3-marks-button.mjs`.

**4. The "whole source" box does nothing.** STILL PRESENT, at rest.
- A mouse press on the live box: `chipPressed "true"`, `fold "13 sources, all on"` before and after; `insideSrcRow false`.
- Where: `declBranch` 16321, handler 16347; the panel hangs on the shelf (16767), not inside `.src-row`.
- Mend: find the chip by the panel's key on its shelf. By hand: `chipAfter "false"`, but `panelStillOpen false` (the redraw closes the panel being read).
- Probes: `f4-whole-source-box.mjs`, `f4-mend-road.mjs`.

**9. The rail's line counts ledger ids.** STILL PRESENT, at rest, on a fresh load.
- Obadiah: `railLine "13 dictionaries · 1 off"`, `foldLine "13 sources, all on"`, `idsOff "MSAM2"`, `chipsOff []` (the Samaritan overlay's id, resting off; no chip here). MACULA's chip off (2 ids): `"13 dictionaries · 3 off"` against `"13 sources · 1 switched off"`.
- Where: `railSay` 16140, line 16162. Mend: read the chip count `sayFold` (16709) makes, not `sourcesOff.size`.
- Probe: `f9-rail-count.mjs`.

**14 (both readers). "Only this pointing" lit with no lattice.** GONE.
- `?b=tikkunei-zohar&rail=all`: after the press `masorah "keep"`, `keep:true:lit, only this pointing:false`. Without `rail=all` the row is not drawn.
- Where: `segRow` 16186, lines 16205-16207. The button stays pressable and silent; a `deadAt` on the toggle (4662) would draw it dead.
- Probe: `f14-pointing-refused.mjs`.

**15. The search asks for the letters as typed.** STILL PRESENT, at rest, in a changed shape.
- 18 common words typed without their final: `no readings line 5, another line 13, the same line 0`. U+05DE U+05DC U+05DB: `"advice · became king · king · king's"`; with U+05DA, same word, same 1030 places: `"king · [the] king of · reigned · a king"`. The differing lines suggest the store holds the unfinal letters as a key of their own; the helper did not open the store to confirm.
- Where: `run` 17485, line 17504 `dictKey(L)`. Mend: `dictKey(r.exact[0])`.
- Probes: `f15-search-finals.mjs`, `f15-search-finals-wide.mjs`.

**6. A relay leaves an empty bar row and loses an opened commentary.** NOT REACHABLE AT REST (`&commentary=on`); with it STILL PRESENT, by reset after one pick.
- Ruth 3:3: `commentary opened: barRows 1, commentaryShown 1`; `after relay 1: barRows 2, emptyBarRows 1, commentaryShown 0, commentaryBuilt 0, bar aria-expanded=true`; `bar pressed again: commentaryBuilt 0`; `after relay 2: emptyBarRows 2`. Joined words out and back (`?rail=all`): `emptyBarRowsOnPage 35`, then `71`.
- Where: `relayBuiltSections` 19557, list at 19563; row made at 19232; `inlineBuilt` 18123.
- Mend: add `"c-barrow"` to the list, `inlineBuilt.delete(el)`, reopen where the bar said open.

**13. Two registries are never pruned.** STILL PRESENT, at rest with no query; nothing a reader sees.
- The probe's copy of the page names the registries on `window` (one line added in transit). Ruth 3:3, a pick then reset, twice: `KQ_STANDS 4 (0 gone)`, `6 (2 gone)`, `8 (4 gone)`; `standsOf 251`, `287 (16 gone)`, `303 (32 gone)`. Joined words twice: `standsOf 1257 (1004 gone)`.
- Where: 19567 prunes `GLOSS_STANDS` only; `KQ_STANDS` 6226, `standsOf` 5985. Mend: the same `isConnected` filter for both there.
- Probe for 6 and 13: `f6-f13-relay.mjs`.

**X1. A card moves when a second pill is pressed.** STILL PRESENT, at rest, with or without `&commentary=on`; larger than 31px.
- Obadiah 1:1 word 1, pill "vision": `card top 172.7 -> 92.7 (-80), bottom 860.5 -> 760.5 (-100), height 688 -> 668; word top 868.7 -> 885 (+16.4); gap to the word 8.2 -> 124.6`. Trace: `top 92.67 h 768 cls[]`, then `top 92.67 h 668 cls[tight]`. The page's own placement run once more: `gap 8.2`. No query: the same; words 2 and 5 end `30.8` and `36.6` from their word.
- Two causes: a card above its word has its top set for a height the last fit then changes; and the first pick writes "1 picked" under reset, so the `switches row 213.2px` becomes `229.6px` under the placed card.
- Where: `placeHud` 8266, tops at 8380 and 8402, last `fitBands()` 8450; `paintReset` 17249.
- Mend: after 8450, where the card stands above its word and its height changed, set the top again; hold the reset line's room (finding 10's empty line at a fresh load lets the row grow).
- Probes: `x1-card-moves.mjs`, `x1-sweep.mjs`, `x1-why.mjs`.
