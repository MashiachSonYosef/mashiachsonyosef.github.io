# Builder «pairs»: the first reader's findings 1, 9 and 4, all mended

As handed back, 21 November 2026. `patch.py` (11 exact replacements in `zone.html`), `check.mjs` (four laws, red on live, green on the copy; about 95 seconds), `rest-proof.mjs` and its output.

What changed:

- **Finding 1.** `kqPickG`'s one-word path hands `kqPick` the regions under their memory keys, so the ruled half is looked up where it was remembered.
- **Finding 9.** `ruledMs` strips the memory-key suffix before reading cells, as `ruledLine0` does.
- **Finding 4.** Under `zone.gloss`, `paintPairs` and `wordBlock` read a pair's halves through `switchedReading`. A new `licChipSwitched` builds the chip from `switchedReadings` only when a carrier of the line is off; otherwise the chip is made by the old code.

Before and after, as the check printed:

- **F1 live:** ketiv ruled «and + Di (read …)» [M4]; after a chip off and on, «and + that» with no chip, qere underlined. With 2:8 word 8 ruled, the pair reads «which» [M9], ketiv underlined. **Mended:** the ruled line, [M4], ketiv underlined throughout; with the plain word ruled, the pair stays «and + that» [PIECE:TAHOT].
- **F9 live:** ruled [M4]; after a repaint, same line, no chip. **Mended:** [M4] at every step.
- **F4 live:** STEP off, 6 of 12 Ruth pairs name M4; Strong's forms off, 4:5 reads «attain» [M14]. **Mended:** 0 of 12 in each state (6 chips, 6 bare under STEP off); 4:5 reads «purchased» [M3], its card's first pill; switched on again, every pair as at rest.

At rest:

- Ruth's 12 pairs and Daniel's 125: 0 differ in line, title, classes, whole chip or underlined half, on first drawing and after a chip off and on. Also 0 under `&default=ubs`, for Ruth under MACULA, and in Lamentations, Exodus, Deuteronomy and Esther.
- Across the 39 books none of the 1,062 pairs has a half whose carriers all rest off, so the switch path is never entered at rest.

Repository checks against the copy, all passing: kq-lead-follows-switch, kq-declared-weld, rulings-under-sources, source-switch, maqaf-pair-drawn, kq-graded, english-license, line-follows-card, ruled-equals-first-paint, line-reads-the-place. `check-kq-presentation-v1` skipped itself (its fixture bundle is not on this machine).

Two edits beyond the letter of the findings:

- **A guard finding 9 needs.** With the suffix stripped, a ruled word of a several-word written branch would get a chip naming only that word's source over a line that also prints the other word's reading (Lamentations 1:6 word 2: none on live, M4 without the guard). `kqPickG` asks for no chip there, so it stays as live.
- **Finding 1's sibling, law F1b.** At Deuteronomy 33:2 word 15, with 3:17 word 11 ruled and STEP off, live gives the line to the ketiv («a fire-law»); mended it keeps «foundation + law».

The builder's worries:

- Pairs read the baked alternate and never ask the live pool as plain words do. With a reading's carriers and its alternate's all off, the pair goes bare, unmarked.
- In Daniel under STEP off, 58 moved pairs say what their card says, 65 are bare over a card with no record, and one differs: 9:12 word 3 reads «speak» where the card says «answer». That line is the same on live.
- By reading the code, not run: a ruled word of a several-word read branch wears, after a repaint, that word's chip alone. Left.

Read by me: the page diff whole. Applied to the integration copy on top of the rail builder's patch: every replacement found once, no Hebrew letter, no new non-ASCII character, and the four laws hold there (`check-on-the-integration-copy.txt`).
