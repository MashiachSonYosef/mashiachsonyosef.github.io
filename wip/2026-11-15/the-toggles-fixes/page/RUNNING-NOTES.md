# The page part of the toggles fixes: running notes (15 November 2026)

Tree: scratch pt, branch toggles-fixes from main 46bbbf7d50. The page part edits reader/zone.html only, and
adds or amends the checks that would have caught each finding. Probes and logs: scratch v73/page/.

## Order of work (the brief's)

1. BLOCKING: a ruling painted over at card open under another default (sets of several pieces).
2. Lone halves of TAHOT's two-word readings under MACULA and UBS.
3. A ruled made pill withheld from the export elsewhere.
4. The names gate's count on pointer pills ("given as a name by its source").
5. The readiness signal at rest (window.__default.ready).
6. The nits: form-of wait; kept credit's chip title; pressed pill after a ruled made pill; three sentences; .r-more ink;
   the Menu mirror's aria; STEP's second reading at the 46 held places.
7. Reset after a ruling, timed on II Samuel and Psalms against live.

## Done so far (10:15 UTC), each proven by a probe against live (8914) and the tree (8921)

Probes and their outputs: scratch v73/page/probes, v73/page/out.

1. The ruling at card open (f1-ruling-open.mjs): live 9 faults (Ruth 1:1:5 painted «that there was» under MACULA;
   the card left open at 1:1:1 flipped to «and happened»; MACULA's own «and happened» ruled, back on STEP, 1:1:5 painted
   «and + it was» with «beacon» pressed; Daniel 1:1:1 «year» painted «in + year» with «+ whole age» pressed); tree:
   every ruling held, the card reads the ruling and presses it (the block's «happen» on a piece ruling).
   How: the card opens on the division its ruling stands on (ruledOnPieces / ruledWhole in openHud); an open paints
   nothing over a ruled line (paintGloss); a ruled made pill is made again in the pool wherever the form stands
   (withRuledMade), so it is the pressed pill (nit 7 with it).
2. Lone halves (split-count.mjs): live Ruth 4 / Daniel 16 / Amos 3 lone halves under MACULA and under UBS; tree 0
   under every source, the pairs whole. How: defaultAt holds a word of the place's reading across words (TAHOT's
   «Beth-» «-lehem») to a source's line only where that source reads every word of it (dfltHalvesOf); the card's label
   says so («one reading across 2 words, MACULA reads 1 of them») instead of «MACULA has none here».
   check-default-picks-v1's model (D7) learned the same rule (acrossOf, wholeAcross).
3. The export of a ruled made pill (export-ruled.mjs): live «1 reading was not exported» at Ruth 1:1 and 1:19 under
   MACULA, «2» back on STEP; tree 0, each cited from MACULA. How: ruledMadeAt hands the export a place that makes the
   ruled row again.
4. Pointers to a name (f4-names.mjs): live Genesis 32:29:11 «2 given as a name», 42:16:1 «1 given as a name» (pointers
   counted); tree 32:29:11 «1 given as a name» (a row its source marks a name), and the pointers print as themselves
   («second-person masculine singular past (suffix conjugation) of ... (sará)»); at the name place 11:29:9 both resolve.
5. Ready at rest: window.__default.ready is true at once where the line rests on STEP or no source is in force.
6. Nits (n6-small.mjs, formof-wait.mjs): the card draws at once with the form-of map held back 12 s (tree 67 pills at
   1.5 s, live 0); the ruled made reading's chip says «MACULA’s own reading at Ruth 1:1:1, chosen by the reader for
   every place this form stands»; the pressed pill is the ruling (Ruth 1:1:5, 1:19:8); the reset title, STEP's title
   and the note under another order; a second that fills nothing is no second, the rail draws it dead; the picks' words
   in the reading's ink, the dead «#hud .r-more» rule gone (cursor and size); the Menu's mirror carries
   aria-expanded and aria-controls; STEP's second reading at the held places says «(STEP reads this word as two)».
