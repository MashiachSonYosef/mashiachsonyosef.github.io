# The first reader's report (page script lines 2566 to 7100), decided again on c1ed776b65

The helper's report as handed back, 21 November 2026. Browser, 412x915, empty storage, the live tree served on this machine. Line numbers are today's `zone.html`. Probes are in this folder (`lib.mjs` is shared; the `explore-*` and `list-*` files are how the helper found its way).

A helper's verdict is a claim until I prove it while mending; the ship's note says which I proved.

**1. One-word pair: the ketiv's ruling is looked up under another key. STILL PRESENT.**
Daniel 2:43 word 1, at rest `"and + that"`, chip PIECE:TAHOT, qere underlined.
- Ketiv ruled on its card: `"and + Di (read <he>)"`, chip M4, ketiv underlined. BDB (OS) chip pressed off and on: `"and + that"`, chip NONE, qere underlined.
- No switch: a plain word of the ketiv's letters ruled «whom» at 2:8, then scrolled to 2:43: `"which"`, chip M9, ketiv underlined.

Lives: `kqPickG` 6299-6305, `kqPick` 6336, `paintPairs` 6786, builder 15297. Mend: in the one-word branch take the ruled half from `latestRuled(kqMemRegions(regions, word))`, as 6308 does, and stop 6336 answering for a KETIV. Probe: `f1-f9-pair-ruling.mjs A|B|S`.

**9. A ruled written form's chip is null. STILL PRESENT.**
Same pair, the plain word ruled first (the one state where the ketiv's ruling survives a repaint): `"and + Di (read <he>)"` chip M4; a chip off and on: same line, chip NONE.
Lives: `ruledMs` 6085, `ruledSurfaces` 6078-6083; `ruledLine0` strips the suffix at 6159. Mend: strip it in `ruledMs` too, together with 1. Probe: `f1-f9-pair-ruling.mjs C`.

**4. A pair's line and chip ignore the source switches. STILL PRESENT.**
Ruth, all sections built, one chip pressed off:
- Strong's forms (M14): lines still naming M14: plain 0 of 1,284, pairs 1 (4:5 «attain»).
- STEP TAHOT (M4): plain 0, pairs 6 of 12.

Lives: `paintPairs` 6793-6798, 6807; builder 15278, 15325-15330. Mend: where the table is `zone.gloss`, read each half through `switchedReading` and build the chip from `switchedReadings`. Probes: `f4-census.mjs`, `f4-pair-switches.mjs`.

**5. The pointing gate reads the last card's word. Live line GONE; export STILL PRESENT.**
- Live line: Amos, two sources off, 2,221 lines (1,250 read live): no card opened against three cards on one key opened first, 0 lines differ (`repaintLive` names the word, 15962).
- Export: Amos 4:10 word 3 ruled «plague», the verse exported: cited from Strong's. The card at 3:7 word 6 (same letters, other pointing) opened and shut, same export: `1 reading withheld`, "does not match any record in the store". After a card on other letters: cited again.

Lives: `askedWord` 3531-3535; `closeHud` 5904 clears neither variable; the exporter's second ask 7123 names no word. Mend: pass `NO_WORD` there. Probes: `f5-export-gate.mjs`, `f5-live-line.mjs`.

**6. Run files fetched and discarded at rest. STILL PRESENT for two of three.**
Genesis: `run-cards/genesis.json` (22,708 bytes) asked at 361 ms, then `hud-runs/genesis.json` (53,278) at 366 ms; first word drawn near 963 ms; none laid. `hud-toggles/genesis.json` no longer asked (5194).
Lives: 5014-5016, 5105-5106. Mend: ask both only when `runsPref !== "off" || !hudSetFor()`. Probe: `f6-run-files.mjs`.

**7. Resting-off default stamped though its source did not load. STILL PRESENT.**
Samaritan index aborted once on visit 1: stamp `2026-10-03a`, off `[]`; later visits, nothing failing: off `[]` (clean profile: `["MSAM2"]`). Met at rest on Tikkunei Zohar, 1a word 212: clean profile 0 pills; faulted profile one pill, Uhlemann's Latin «f. ficus Gen. 3, 7». On the 39 books the shut-at-rest dictionaries mask it.
Lives: 5002-5011. Mend: stamp only when every key of the record met an id. Probes: `f7-defaults-stamp.mjs`, `f7-latin-zohar.mjs`.

**10. A still press on the card's head parks the card. STILL PRESENT.**
Mouse and touch: one press on the head's Hebrew word: `moved` true; next word pressed: card stays at top 254, 161 px under it (unpressed: 8 px under). Hidden on a visit's first card, which the source-suggested file rebuilds (11828).
Lives: 8457-8482, `placeHud` 8275. Mend: `endDrag` marks moved only after a few pixels of travel. Probe: `f10-head-press.mjs`.

**11. A network fault read as absence. STILL PRESENT.**
- Load: catalog index aborted, the book's bin aborted, the bin answered 503: each prints "No book is published on this page yet".
- First request aborted, later ones allowed, three cards opened: lattice, source-suggested (its row on no card) and form-of map each asked once in the visit. `hudTogglesReady`: same code, behind the hidden license-runs switch.

Lives: 5285-5292; 3252-3257, 3744-3749, 3801-3806, 4462-4467. Mend: say an error other than "not on this shelf" as a fault; drop the memo on a rejected fetch. Probe: `f11-network-fault.mjs`.
