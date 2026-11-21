# The second reader's report (page script lines 7100 to 11700), decided again on c1ed776b65

The helper's report as handed back, 21 November 2026. Viewport 412x915, clean storage, the live tree served on this machine. Line numbers are today's `zone.html`. Probes are in this folder. «As written» is the switch «joined words: as written» (`?maqaf=maqaf`, or under the fold of the panel of switches, drawn only with `?rail=all`).

A helper's verdict is a claim until I prove it while mending; the ship's note says which I proved.

**2. A reading chosen through a witness is remembered under a dead key. STILL PRESENT, at rest.**
Ruth 1:2 word 3: press pill «Elimelech», close, reopen: `CONTROL card reopens on: "Elimelech"`. Then press its witness («the same record, carried by 2 more witnesses»), close, reopen: `TEST line: "Elimelech [M3]"`, `TEST card reopens on: pill 0 of 6 "[was] Elimelech"`. No «same wording» line met in 167 words (same goTo).
Lives: goTo 12367-12380 (`routeKey(group.records[0])`, 12372, yields "undefined | no m"); routeKey 10684; reopening pick 12061.
Mend: `key: routeKey(group)`. Probe: `f2.mjs`.

**4. A failed shard is asked again from its own failure. NOT REACHABLE AT REST (the concordance: Menu, or `?dict=on`).**
Ruth 1:1 word 1, a block pressed, shard requests aborted: `after 1s: 280 ... after 5s: 1486 shard requests since the press`, one file, no further press; the table says «press the block again».
Lives: paint 9999-10010 (handler 10009); dictKey 9545-9553.
Mend: the handler leaves a failed mark in blockEntries, cleared when the block is pressed. Probe: `f4.mjs`.

**8. Label names TAHOT over MACULA's pieces. GONE.**
Exodus 36:21 word 2: chip `PIECE:MACULA`, label `reading · MACULA at this place`. All 55 such words on disk: `labels naming TAHOT/STEP over a MACULA chip: 0`.
Lives: piecesWho/placeWho 11001-11006; label 11033. The side remark still holds: STEP TAHOT off turns that line into `cubit [M14]`.
Probes: `f8.mjs`, `f8-all.mjs`, `f8-related.mjs`.

**9. The redraw hook keeps the previous block. NOT REACHABLE AT REST (`?rail=all`).**
Ruth 1:1 word 4: press the whole-form division, then «names: as sound» (a real click). Under «No dictionary on this shelf gives this form whole.» now stand the old block's `3 readings carrying a source's own sign switched off` and `4 of another entry than H8199, withheld`. At rest the rail draws two rows; both rebuild the card.
Lives: renderReadings 11634 (returns 11933, 11975); hook set 12672, cleared only in closeHud 5907.
Mend: `redrawReadings = null` on entering renderReadings. Probe: `f9.mjs`.

**10. A pick on a maqaf-keyed inner rung of a spaced run. First half STILL PRESENT at rest; second half GONE.**
Genesis 35:7 words 6-8, a cell at rest: press the two-block division, its maqaf block, «Beth-el». Card: `El + Beth-el`; the line stays `El+Beth-+-el`, marked chosen. The standalone cell at 35:15, drawn afterwards, is unchanged and unmarked (as written too): ruledSurfaces 6078-6083 returns null there.
Lives: cellMap 10597; refreshJoinGloss parts 13341-13346.
Mend: cellMap tests for a maqaf as well as a space; the run's line prints a ruled several-word block over its words. Probe: `f10.mjs`.

**11. Only the first head word bold. NOT REACHABLE AT REST (as written).**
Genesis 12:8 words 9-10. At rest the cell is a span-store place, not a chain: weights 700/700/700. As written, the run's card reached from the chain band: 700/700/400; a plain chain there: all 700.
Lives: openSurfaces 10197; lit 10266; openNamedRun 15428-15448.
Mend: trim each piece at 10197. Probe: `f11.mjs`.

**12. A let-down run line keeps its small size. NOT REACHABLE AT REST; the visible form could not be produced.**
fitRunLine 14304-14319 is unchanged (return 14306 before reset 14310), but no run line is let down at 412px: Genesis at rest 0 of 56 cells (320px too), as written 0 of 2,861; Esther 0 of 419; Ruth 0 of 175. At 240px, as written, Esther has 5; none can be ruled whole. Every source off in one press there: `line[g bare] inline font-size=8.66px ... (the same element)`.
Mend: move the reset above the parts test. Probes: `f12-scan.mjs`, `f12.mjs`, `f12c.mjs`.

**13. A bare run line keeps its title. NOT REACHABLE AT REST (as written).**
At rest no run line went bare in six shelf orders. As written, shelves off in the order «no year given», 57th, 58th: `bare 28; bare with a title 26`, e.g. Genesis 1:2 `line[g bare] text=" " title="top + before"`. Where a press lays the sections again, titles are empty.
Lives: refreshJoinGloss bare branch 13386-13391.
Mend: `line.title = ""` there. Probes: `f13c.mjs`, `f13.mjs`.

## Outside the findings

- Finding 12 is the weakest verdict. The code fault is unchanged, but its precondition (a run line shrunk to fit) never occurred at 412px or 320px in the books walked. Only the leftover size on an emptied line at 240px was shown, never a whole reading printed small.
- Finding 9 was pressed on a plain divided word, not a run card. The reader's own steps name a divided word, and the code path is the same for a run's card.
- Seen in passing, not examined: at rest, with all 13 sources switched off on the panel, the Genesis 12:8 cell still reads `Bethel` with a `CC BY-NC 4.0` chip.
