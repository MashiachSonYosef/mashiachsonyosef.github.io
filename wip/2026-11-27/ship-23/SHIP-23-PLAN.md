# Ship 23: the place card at rest (plan)

Page lane, 27 November 2026, night. The owner: «you can ship dont wait for my approval». This ship seats the place card in the live reader at rest. Today's card stands behind the switch «readings matched by spelling».

## What it carries

From the builder's sandbox S/s16 into the ship tree S/s13 (both at live main ea6e1ad08e), by `tools/copy-into-ship-tree.sh`:
- `reader/zone.html`;
- `reader/place.html`;
- the place answers' tools (32 files);
- `reader/data/place-answers-v1/page/` with `PIN.json`, `sources.json` and `lines-known-to-differ.tsv`.

The intermediates (`entries/`, `places/`, `bridges/`, 44 MB) hold whole copies of the sources' files. They stay out of the tree, as STEP's licence summary asks, and the one command makes them again from the public files.

The tree checks that need them say so and are counted as not run here:
- check-place-answers-page-v1 skips without them;
- the entries and places checks are `RUN: given`.

## Two more mends in this ship (found 28 November)

`tools/ship23-edits.py` applies these to the ship tree after the copy:

- **The chapter head.** Every chapter of the 39 books printed «chapter title: no name is on record» over «commonly read as Chapter 2». That read as a title that failed to load, over a number nobody records.
  - The Hebrew text names no chapter, and every source addresses a chapter by its number. So the head now prints «Chapter 2 · 25 verses» plainly, and a title row stands only where a record names the chapter.
  - The basis note loses «No chapter carries a name here: no source on this shelf gives one.»
- **The door's gloss under a book's title.** It was the store's oldest reading of the title's letters anywhere: «bee» under Deuteronomy's title, a dictionary's definition of the book under Leviticus', «Shamoth» under Exodus'.
  - It is now STEP's reading where the title stands in the book's own first verse. Of the 39 books, 25 have one: Genesis «in/ beginning», Exodus «[are] [the] names of», Leviticus «and/ he called», Numbers «in/ [the] wilderness of», Deuteronomy «words», Proverbs «[the] proverbs of», Lamentations «how!», and the prophets by name.
  - The other 14, whose titles do not stand in the first verse, carry no gloss: Judges, the two of Samuel, the two of Kings, the two of Chronicles, Psalms, Ruth, Esther, Daniel, Ezra, Ezekiel, and Obadiah (spelled otherwise in its verse).

## What must hold before the push

1. **The builder's proofs**, from the ninth cut's merge and from the frame's laws (`../fresh-build/BRIEF-H2-CUT-9-MERGE.md`, `../fresh-build/BRIEF-H2-FRAME-LAWS.md`).
2. **The round's steps on the ship tree**: lines, chain, door, switches. Then the lines-diff against live: 0 moves.
3. **The gate (check-same-product-v1) against live**, run twice:
   - **Today's card forced** (the meta reader-card line put into the ship tree's zone.html for the run, then taken out and its sha256 matched):
     - S1: the lines are the same as live under every switch it compares;
     - S2: today's card is the same as live's.
     - This proves today's card ships unharmed behind its switch.
   - **At rest**:
     - S1 holds: no line moves under the default switches or under any default source.
     - S2's differences are the new card, by design, and are counted and read, not owed.
4. **The whole suite**, run twice:
   - At rest: every red is on one of these lists:
     - the builder's `laws-of-the-spelling-card.md`;
     - the F6 reds owed to the lines ship;
     - the three standing reds (check-nothing-unlanded-v1 before the push; check-reading-rows-v1 R1; check-levels-v1, red on live too).
   - With today's card forced: the card checks pass as on live.
5. **STEP's asked credit** stands on both cards and in the export (F9).

## Then

1. Commit on main.
2. Merge main into gh-pages («gh-pages follows main») and push both.
3. Run check-nothing-unlanded-v1, then the live check (live-check.yml), then move S/old to the new main.
4. Write notes, and tell Moses and the owner.

## Next after it

**The lines ship.** It moves the line at the words the place answers read otherwise, group by group, as `../accuracy-pass/the-124-words.md` sorts them:
- **A, B and E:** the page lane mends.
- **D, the 46 places where our text writes two words and STEP's text one.** These are no longer for the corpus lane. STEP's one row is STEP's own address for the span, so at rest the span is one cell and one card across our words: STEP's reading is drawn once across them, as a default source's line over several words is already drawn. Each of our words stays its own card, a press away inside the run card, as in a maqaf run or a chain.
  - Nothing new is built for this. The run-card system holds both cuts already.
  - The default is the source's own unit, not the finest cut either side could make. Were another source to cut the span otherwise, its cut would stand inside the same card.
  - Examples:
    - 1 Chronicles 20:4 words 2–3, «after + this» (today «behind», «thus»);
    - Isaiah 9:5 words 18–19, «father of + perpetuity»;
    - 2 Kings 19:31 words 9–10, «Yahweh of hosts».
- **F and I:** answered by the corpus lane in v223 (I was the lead's own miscount).
- **C, G and H:** stand.

The F6 reds close there.

**How: a rebuild, not edits.** The lines ship does not patch the 141 lines group by group. It rebuilds the resting line at every word from the place answers, through the same pipeline: the line is the place card's default, drawn as the page draws a line. That is the principle the Hebrew text was rebuilt by.
- The comparison tool already draws that line for all 305,431 words: 305,290 equal today's, and 141 differ, each with its cause.
- So the rebuild's lines-diff against live must be exactly those 141, plus the D spans drawn once across their words.
- A group's handling is a rule in the line's drawing, not a hand edit: how a name STEP cuts in two is joined, and a span drawn once across its words. A fault found later is mended in the pipeline and the lines are rebuilt again.

## Ready after this ship: the numbers in gold (settled)

Blue means one thing on the page: what a word means, a reading a source gives. Nothing else takes it, so a reader can trust it at a glance.

Gold is the layer laid over the bare text by those who handed it down: the Masoretes' vowels, accents and counts, and after them the chapter and verse numbers the editions added. The chapter number, and the 2:1 of a verse's address, take gold.
- The Masorah keeps its place inside that layer by where it stands. Its marks sit in the Hebrew letters, and the numbers sit apart from the text, so the two are not confused.
- Leningrad's count stays gold. The other witnesses' counts in the count table take gold too, from the default ink.
- **The word «Chapter»** stays purple, because it is ours.
- **Contrast.** The page's gold #967c26 on the linen #ebdec3 is 3.0:1. That holds for the chapter head's large number. Small numerals, such as a verse's 2:1, take a darker gold of the same hue: #6f5b1a measures 4.9:1. Check it against the palette's bronze before laying it.
