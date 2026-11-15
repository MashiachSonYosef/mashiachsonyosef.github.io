# The page part of the toggles fixes, round 2: running notes (15 November 2026)

Tree: scratch pt, branch toggles-fixes (from cdd93e381f). The page part edits reader/zone.html only, and the checks
that hold its fixes. Probes and logs: scratch v75/page/ (probes/, out/, out/checks/, merge/).

Note on the tools: a tool call's text turns a written `־` into the character itself; lines with escapes are
written through a script (v75/page/escape-code.py) and every added line is scanned (v75/page/scan-added.sh).

## Order of work (the brief's)

1. N1 the concordance's «0 locations» for a default source's own words.
2. N2 one unit a source reads at two words printed twice.
3. N3 a source press repaints every built line in one task.
4. N4 the first card at rest rebuilt (and its pills moved) when the book file lands.
5. N7 a kept source's book file asked after the zone and the index.
6. N8 MACULA's title with STEP switched off; N9 «TAHOT» beside «STEP» on one card.
7. The question-3 hold in the page's comment; check-line-reads-the-place-v1 P3 on Ruth.

## 1. N1 (done, 47c5a68277)

Reproduced (probes/n1-concord.mjs, out/n1-concord-{live,tree-before,tree}.json): live and the tree before, Ruth with
the concordance on, said «0 locations» at 1:19:8 and 3:14:2 at rest (STEP's own words), at 1:1:1, 1:1:5, 1:19:8
under MACULA, 1:1:3 and 1:19:8 under UBS and under BDB (STEP's words filling there). After: each says «1 location»
with «here · Ruth …» first; MACULA's «and happened» at 1:1:1 says «2 locations» (here and Ruth 3:8:1, where MACULA
reads the same words).

How: renderDictTab files the default sources' own readings beside the store's for the whole word (madeOf): every
place of the book with these letters where a source reads those words (each pick, as the card makes its pills,
from the book file; STEP's own words and STEP's leaves from the index before the file), this place among them,
by the store's byte equality; a place takes the store's language where the store reads it there. A block's own
letters are counted as before. (The places of the book by their letters are made once a page: DICT.atLetters.)

New check tools/check-concordance-counts-the-line-v1.mjs: K1 at rest at the places of STEP's own words drawn (the
first work by size that draws one: nahum, 2 of its 5), K2-K4 under each source over the work's first 24 words that
stand alone. Live: K1-K4 FAIL («0 locations», 11 min 40 s, since live's page never says ready at rest); tree: all
pass, 100 s. check-dictionary-toggle-v1 on Amos: all pass on the tree (68 s).

## After the restart (15 November, from 16:00 UTC)

The runtime was restarted at about 15:50 UTC; the run before it had committed N1 (47c5a68277) and left the rest
uncommitted in the tree: zone.html (N2 in runs, N3, N4, N8, N9, the question-3 comment, the P3 change), the units in
check-default-picks-v1, check-rulings-under-sources-v1 (U10), check-same-product-v1 and resting-lines-v1 (a part over
several words, data-wn), and three new checks (landing, press-paints, row-and-card names). N7 was not begun. This run
reads that work, keeps what holds up when measured again, finishes it and commits it. Probes after the restart: scratch
v75/page/p2/.

### 2. N2 after the restart

The run before had made a unit print once where its words stand in one run (refreshJoinGloss: one part over its words,
data-wn; drawTies: spanPairs ties it to all their ink). Counted again over the data's 215 units (one entry or one reading
across words, the source's line at every word from one pick: BDB 202, UBS 8, MACULA 5), each under its own source: 178
once, 37 still twice. The 37 are all BDB's, two words written apart that no run holds (Kiriath Arba, Genesis 23:2:3-4;
Abed Nego, Daniel 2:49:13-14; Bethel at Jeremiah 48:13:8-9): no line of the page stands over two such words.

Decided: such a unit is held, each word keeping its line as it rests, and the card says why («reading · STEP at this
place · BDB reads these 2 words as one, and they stand apart»), as call 5 holds a run the source does not read whole.
Printed under each word it is the doubled word the critic found; printed under one only it would read as that word's
alone. Where its words stand is told from the data the section is laid from (dfltTogether: the maqaf the text writes
while the maqaf joins, or one run the lanes laid), so the line and the card agree before the section is built.

zone.html: dfltAcross (the old defaultAt, the halves hold), defaultAt (+ the apart hold through dfltApartUnit, set
where the unit is told), dfltHalfHeld (not an apart unit), dfltUnitHeld; dfltEntriesOf (+ DFLT_SEAT), dfltUnitOf (on
dfltAcross), dfltTogether; the card's label (one branch) and dfltHereNow's filling.

Counted by source and book (p2/out/units-by-source-and-book.txt): live 212 twice, 3 other (a run's span line
standing, El-bethel); tree 175 once, 39 held (all BDB: the 37, and Pi of Pi-hahiroth in another run's cell at
Exodus 14:9:16 and Numbers 33:7:5, which the run before had counted once by mistake), 1 other (I Kings 13:1:9-10,
the span line «El-bethel» stands, as call 5 has it), 0 twice. MACULA 5 and UBS 8 all once.

Checks: check-rulings-under-sources-v1 U10 judges a unit once where its words stand in one run and held where they
stand apart (the card's words too), searching the works whose units the text writes apart until the page draws one
apart (Zechariah 7:2:5-6 «exilic»). Tree: all green, 1 min 56 s. check-default-picks-v1's model (unitsOnce) now
holds an apart unit at today's line too. The rulings check's waits were 120 s and swallowed: now 30 s and a fault
(U0).

### 5. N7, the book's file asked beside the zone (new after the restart)

Under a source other than STEP kept on the device (or ?default=), the page now asks the index a second time before the
boot's fetches, and the book's file the moment that index names the book; defaultPicksReady takes that request as its
first fetch (dfltEarly, once). The boot's own fetch of the index is left as it stands: the line that asks it, and the
line under it, are lines the kinds team changes (KINDS_REC beside DFLT_IX, and their record fetched after the index),
so a change there would not merge; the cost is one more request of the index (41 KB) under a kept source only. At rest
nothing is asked here.

Request order, Psalms with fh.defaults=bdb (p2/out/n7-*.json, ms after the first request): live, the zone and the index
asked at 0 and 2, the book's file at 293; tree, the index at 0 (and again at 2), the zone at 0, the book's file at 24.
With the book's file held 10 s, the first word: live 11.8 s, tree 11.4 s (asked at 106 ms on a loaded machine). A
stalled file still holds the page blank under a kept source, by plan (PLAN-MERGED line 74); only its start moved.
Check: check-landing-holds-the-card-v1 H3 (the zone held 3 s, the book's file asked before the zone arrives).

### The merge with the kinds branch

git merge-file of the tree's zone.html (ours) with kinds-build (theirs) over 46bbbf7d50: 2 conflicts, both already
there between HEAD (and round 1's tip cdd93e381f) and kinds-build, none from this part: the reset pill's title in the
row of pills (round 1's wording against kinds' move of the reset pill) and the ruling's record in remember() (round 1's
DFLT_OWN beside kinds' kindPick). The tools this part changes merge with 0 conflicts (check-default-picks-v1,
check-same-product-v1, resting-lines-v1; check-rulings-under-sources-v1 and the three new checks are not on
kinds-build). N7 does not touch the boot's fetch of the index for this reason (kinds changes the line itself and the
line under it).

### 3. N3 measured again (the run before's design kept)

The press paints the sections within a screen of the window and the open card's at once (dfltRepaint), the rest in
slices of about a fifth of a second nearest first (dfltFreshStep), at once on a scroll that brings one within a screen
or anything that reads its words (materialise); window.__default.ready waits for the last. Its comment said slices of
40 ms (the run before measured 40 ms and chose 200): said right.

Psalms built whole (2,527 sections, 22,803 word blocks), the browser's long tasks (p2/out/n3-*.json):
- live: the press of MACULA 9.9 s in the click itself, longest task 10.0 s, 2 over a second (the press and the file's
  landing), lines stand at 21.0 s; the press back on STEP 11.7 s in the click, longest task 11.8 s.
- tree: the press 0.11 s in the click, longest task 0.48 s, none over a second, lines stand at 29.8 s (158 tasks,
  28.3 s); back on STEP 0.58 s in the click, longest 0.58 s, lines stand at 35.2 s.
The page answers throughout, at the price of the whole book's repaint taking about half as long again in slices as in
one task. A book built whole is what a reader who scrolled through it has; the sections in view are the press's.

### 4. N4 (kept) and its check

reopenCardFree: the book's file landing builds the open card again only where the reader's hand is not on it (the
pointer over the card, or the focus in it); otherwise once the hand leaves. check-landing-holds-the-card-v1 (Obadiah
1:1:1, the book's file held 6 s, the pointer on the first pill and the focus in it): tree H1 (1100 by 900) and H2 (412
by 915) green, 0 of 8 pills moved, the focus stays, 3 source lines once the hand leaves; live H1 red (8 of 8 moved 205
px, the focus out of the card), H2 red too (8 of 8 moved 206 px on the phone, the focus out): the critic's «a phone
does not move» held for Ruth 1:1:3 at 360 by 780, not for this card. 28 s on the tree, 2 min 27 s on live (live never
says its lines stand at rest).

### 6. N8, N9 (kept) and their check

check-row-and-card-name-sources-v1: tree W1, W2 green (18 s); live W1 red (MACULA's title «press again to go back to
STEP» with STEP switched off), W2 red (12 cards «reading · TAHOT at this place» over «here STEP reads»). The name is
the source pill's, STEP, the name the piece line already used; the switches' strip names the same M4 «STEP TAHOT».

### 7. P3 on Ruth: the page was wrong

check-line-reads-the-place-v1 P3 fails on live and on HEAD (a shadow of HEAD's zone.html) at one card: Ruth 1:2:9,
«sons + his», a word of the run «[the] two + sons + his», whose card opens on its core block and presses «young»
where the line's piece is «sons». The card read the place's pieces off the word's own line, which in a run is not drawn
and carries none (the run's part for the word carries them, refreshJoinGloss), so it fell to the pool's first. It
reads the run's part now: P3 30 of 30 on the tree; 1:1:19 (a word alone) pressed «sons» on HEAD already.

### The runs on the tree (after the restart)

- check-rulings-under-sources-v1: all green, 1 min 56 s (U10: MACULA Daniel 4 once; UBS Daniel 4, I Chronicles 2,
  Psalms 2 once; BDB Micah 1, Hosea 5, Zechariah 1 once and 1 apart held, the card «BDB reads these 2 words as one, and
  they stand apart»). Live: U1-U5, U7-U10 and U0 red (U10 «with food» under both words of Daniel 1:8:8-9), 9 min 22 s.
  The apart hold taken out on a scratch page: red at exactly U10, Zechariah 7:2:5-6 «exilic» «exilic».
- check-default-picks-v1 (whole, page and node laws): 24 green, D20 red as before this part (the receipt on disk is the
  ship's: STEP's pills 232 here against 1,015 in the receipt; the round's bake writes it), 6 min 3 s. D7, D8 and D9
  green with the unit model (D8: the earlier run's «Ishbosheth» misses are gone).
- check-concordance-counts-the-line-v1: green, 1 min 36 s (live red K1-K4 from the run before, 11 min 40 s).
- check-landing-holds-the-card-v1: green 28 s; live H1, H2, H3 red.
- check-row-and-card-name-sources-v1: green 18 s; live W1, W2 red.
- check-line-reads-the-place-v1: Ruth green (P3 30 of 30), Amos green; Ruth on live and on HEAD's page red at P3.
- The critic's N1 scenario again (p2/out/n1-concord-tree.json): «1 location», «here · Ruth …» first, at every place
  the critic named, at rest and under each source; «2 locations» for MACULA's «and happened».

### For the corpus lane's letter: UBS's meaning that reads its neighbors' words (not told by the page)

At II Samuel 10:6:15, the object marker «and <obj.>», the UBS book file's place gives the line «Aram Zoba» (pieces
«Aram Zoba» and «-»), and the next two words, Aram (10:6:16) and Zobah (10:6:17), carry no UBS meaning at all; at
10:6:12-13 UBS gives «Arameans of Beth-Rehob» at Aram and «Beth-Rehob» at Beth, Rehob unread. About 340 words in 21
books are of this kind (round 1's count). The book file gives each place UBS's meaning and its pieces, never the words
of the verse that meaning covers; TAHOT marks nothing across these words and the lattice gives each word its own
headword. So the page cannot tell a gloss of the word from a gloss of the word and its neighbors without reading the
English, and does not guess: UBS's «Aram Zoba» prints at the object marker as UBS files it. What the lane would have to
give: for each UBS meaning it files at a place, the words of the verse that meaning covers (its span, by place
numbers or the source's own word ids), or at the least a mark that the meaning is filed at a word that is not its
head. With that the page draws such a meaning once over its words, where they stand in one run, and holds it where
they stand apart, as it now does for BDB's units.
- check-press-paints-before-seen-v1 on a scratch page whose stale sections are never painted (the slicer and the
  scroll guard taken out), Ruth: red at L1 (the page never says its lines stand) and at L2 (under MACULA, Ruth sections
  7, 8 and 9 seen in the window with TAHOT's lines where the first paint draws MACULA's), 15 min 17 s. L2 now opens a
  first card before the presses, so the book's file is here (a press made before it lands draws the line as it rests
  until it lands, and a window read in those milliseconds was a matter of timing).
- The merge with kinds-build: zone.html's 2 conflicts are the same two blocks, line for line, as HEAD's own merge with
  kinds-build; this part adds none.
- Lint: the page at its baseline (4 · 175 · 9 · 1 · 2); the eight tools this part wrote or changed, no warning (one in
  the new landing check, a flag polled in a loop, taken out by waiting on a promise).
- check-press-paints-before-seen-v1 on the tree, WORKS=ruth,psalms: all green, 20 min 39 s. L1 Psalms built whole:
  the longest task 564 ms (148 long tasks, 26.4 s in all; the blobs of the whole book are drawn in the same slices'
  turns), its lines stand after 28.6 s. L2: Ruth (85 sections) and Psalms (2,527 sections), under MACULA, UBS, BDB and
  back on STEP, every window equal to the first paint under the same source in the frame its scroll brought (Psalms:
  2,832, 2,941, 2,946 and 2,847 sections seen in 369 to 493 windows), and every section after. Live's L1 is red
  (the longest task 9.5 s, the run before's log).
- The rest of the brief's list on the tree (Ruth unless said): check-card-opens-on-the-line-v1 green, 5 min 13 s;
  check-reset-pill-v1 green 25 s; check-menu-switches-v1 green 9 s; check-form-of-v1 green 75 s; check-names-gate-v1
  green 27 s; check-color-channels-v1 green 7 s; check-levels-v1 green 16 s; check-landing-holds-the-card-v1 again
  green 27 s.
- check-ruled-equals-first-paint-v1: Amos (its own default book) green, 100 s. Ruth red under UBS at E1 (1:1#0 and
  1:1#4, a split cell ruled to the longest pill reads «and + to be: (Third-person masculine sin…» after the ruling and
  «and + Third-person masculine singular ju…» when laid again; 1:4#1, a core cell 78 against 82 px, «to <the> + he»
  against «for <the> + he») and E4 (1:4#1, pressed «they»). HEAD's own page (a shadow of HEAD's zone.html) is red at
  the same three cells, line for line: older than this part, left for the lead (round 1 ran this check on Amos only).

## Committed (branch toggles-fixes, scratch pt)

- 76af3ee50c the page: zone.html, and the two readers of a part over several words (resting-lines-v1,
  check-same-product-v1).
- b152652e7f the checks: check-rulings-under-sources-v1 (U10, U0), check-default-picks-v1 (unitsOnce),
  check-landing-holds-the-card-v1, check-press-paints-before-seen-v1, check-row-and-card-name-sources-v1 (new).
N1 was 47c5a68277 (before the restart).
