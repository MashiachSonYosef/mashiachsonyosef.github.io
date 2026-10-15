# The week of 2026-10-15: serve only what is ready; the blobs and the English order

The owner, 2026-10-14: "focus this week on 2 main things: 1. not serving
extraneous things we arent ready to serve yet ... and 2. the blobs and
english ordering"; "theres no need to push so often anymore"; "a final push
late in the week".

## Standing on 2026-10-15

Live (main b64cec2c1, gh-pages 29948a0d0): the finale (every Masoretic mark
gold, the reading place), the blobs, the palette fold, the logo re-woven.

Local in the ship worktree, committed to nothing yet, for the one push late
in the week:

- a crossing's outline is drawn after every fill ("the overlap drops one of
  the blob lining")
- every "+" word wears a blob at the default; `?blobs=runs` is the old way
  ("no blobs on + signed words?"; "id blob everything, everything except
  literally a 1:1")
- a split English row is no longer capped at 11em (it clipped "and + <to>
  the + darkness", Genesis 1:4, at phone width)
- the English reader's 12px of room under a tied word keys on the tie, not
  on the pieces: a press repaints the line, the pieces are gone for 60 ms,
  and the card was placed under a block 12px short, over the Hebrew line
  (the overlaps gate caught it)
- every-word ties are drawn near the screen first and the rest in slices:
  drawn in one loop, adam-min-haadamah (73,140 words, 11,675 in one section)
  held its page past a minute
- the blob check's B6 now asks the default to blob every split word and
  `?blobs=runs` to blob none
- the export file opens with a UTF-8 byte order mark: the file already held
  the headwords, UTF-8, byte for byte ("1. headword: בְּרֵאשִׁ֖ית" in a probe
  of Genesis 1:1); the phone's viewer read it as Latin-1 and showed "×Ö°×"

## The rules, from the owner's examples

### English reader: word order (R)

- R1 A word's pieces stand left to right in the Hebrew's own order:
  prefix(es), stem, suffix. לביתך is to + house + your.
- R2 One hop, and only one: a possessive suffix (my, your, his, her, its,
  our, their) stands before its stem. לביתך reads "to your house" (1 3 2);
  על־משמרתי "at my post"; ואל־כל־שכניו "and to all its neighbors"; ועד־מבואו
  "its entrance" ("'its' in english would come first eventhough technically
  the hebrew asks it to come second"). OPEN, the owner's call: uniform
  (at + post + my) or English (at + my + post). The owner leans English
  ("appears to want to say at + my + post"; על־מעוריהם, על־כבודך "a suffix
  correctly flipped that we may want to make an exception to").
- R3 A maqaf never reorders. The words of a chain keep their order, and each
  keeps its own pieces by R1 and R2: אל־כל־ישראל "to all Israel";
  יהושע־בן־נון "Joshua the son of Nun" ("the middle maqaf would indeed just
  stay in the middle"); בן־נון "[the] son of Nun"; גם־אני "also I"; אשר־באו
  "who they came"; את־כל־הארץ "all the land"; בין־פארן, ובין־תפל, בעשתי־עשר
  likewise. "maqafs are like reverse unos": the hop inside a word is never
  taken across a maqaf.
- R4 Two words with a space are two words in order: בעבר הירדן "on [the]
  other side of the Jordan"; עוג מלך הבשן "Og king of the Bashan" (Og is
  word 1); אל־בני ישראל; ככל אשר.
- R5 The article ה is a piece with a pill of its own: את־האור is את + ה +
  אור ("wouldnt 'the' be considered its own potential R pill").
- R6 The bug to take out: "the maqaf flip is happening everywhere". The
  reader applies the one-word hop (prefix + stem + suffix) to a prefix +
  stem chain across a maqaf (עד־באכם against עד־המקום).

### Readings that one license gives for several words (U)

- U1 One license, one reading, one order: its words are never rearranged.
  אף כי־אמר "did he say that indeed?" must never print as "indeed? + that +
  did he say". It wears one blob around all of it, or none.
- U2 No welded form for anything that is not a maqaf chain (קדש ברנע,
  כי־אבן מקיר תזעק): "the weld of a non maqaf is not something we do."
- U3 An underline over two words stands only where one license defines both.
  ככל אשר־צונו combined two preferred translations: wrong. Until a ledger
  says which spans are single-license, every double-word underline comes
  off (יהוה צבאות too): "for now all the double word underlines need to
  go". Wanted when the ledger comes: ואם־אב + אני.
- U4 The "+" between license chips never floats up between the licenses
  (אל־האשה: to + the + woman).
- U5 The HUD and the book-page runner say the same order (בעבר הירדן was
  right in the HUD and unflipped on the page).

### Blobs (B)

- B1 Blob everything but a literal 1:1: every "+" word, bereshit on A+B too.
  Done locally.
- B2 When the weld or the full form is chosen, the blob merges and the "+"
  goes, in anticipation: "it's all formulaic".
- B3 A maqaf gets a third, dropped height: "even just a lil brief dip",
  artist's choice.
- B4 A crossing never loses an outline. Done locally.

### Toggles: serve only what is ready (T)

- T1 Keep on the book page: the Hebrew/English reader toggle (cached with
  the place), the dictionary on/off set, and one label that does not toggle,
  "source suggested", saying the source's suggestion is forced for all 39.
- T2 Every other toggle moves to /toggles/ until it is checked.
- T3 Source suggested: most show pieces (A + B) rather than the whole (AB).
  Ask whether the division keys we served first are steering it.

### Chrome (C)

- C1 Cache the English reader toggle with the place; a menu beside the
  bottom bar that folds open, holding the reader toggle and the others.
- C2 The logo, home, in the bottom bar's empty left; flipping to Deuteronomy
  and back lands on Joshua 3 again.
- C3 Card numbers: gold, the Hebrew's count, a small arrow beside the number
  ("1 ▶"); size optional; red and gold together read orangeish, so gold
  alone.
- C4 Condense the CC BY 4.0 pill, maybe inside the HUD on press.
- C5 The commentary pill lists each commentary selectable and drops open
  (Genesis 1 has about 130); the commentary English is undercovered.

### Export (E)

- E1 Byte order mark added. An export ledger to plan with Moses.

## Ledgers to ask Moses for ("remind me to tell moses")

1. The condensed license ledger (promised for the start of this week).
2. One ledger, any name, for: no word swap inside a single-license reading;
   how a HUD's words are ordered while the English reader is on (R1-R6,
   U1); which spans are blobbed and how (B1-B3).
3. Which double-word spans are a single license (U3).
4. An export ledger: what an export carries, in what order, with what
   encoding.
5. The word-order ledger (relay v70) and word numbering (v71.1.1) are READY
   and unwired; C3 and R1-R6 wire them.

## Tokens

- No push until late in the week. One suite, one door build, one commit on
  main, one merge to gh-pages, one push.
- "is there a way at the end of it all to offer a compressed tool that can
  recreate all of it": the repository with its tools is that tool; what is
  missing is one command that runs them in order from the ledgers. Design
  it after the push.

## The week's order

1. Today: the suite on the local fixes; the rules written; the Moses prompt.
2. English order R1-R6 in the English reader and the runner (U5); the
   double-word underlines off (U3); no non-maqaf weld (U2); the floating
   "+" (U4).
3. Blobs B2 and B3; the toggle cached and the bottom-bar menu and home
   (C1, C2); the card numbers (C3).
4. Toggles T1 and T2; the pill and the commentary list (C4, C5); the suite;
   the push.
