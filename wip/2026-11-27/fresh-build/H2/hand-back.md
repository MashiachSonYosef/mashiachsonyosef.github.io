## Builder H2: the place card in the live reader, with the old card behind one switch (sandbox S/s16; nothing committed, pushed or shipped)

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`

The live reader `reader/zone.html` now opens the place card on the 39 books. The old card is still there in full, behind one switch that is off at rest. All proofs ran; the counts are in section 4.

- **Page laws the card broke:** the suite found two at rest, the inks and the direction of a word's parts. Both are fixed and both checks pass at rest now.
- **With the old card forced on:** 82 of 88 card-reading checks pass. The 3 reds are explained in section 5: one is my change, two were red before.
- **Decision for you:** «Special uses:» still prints inside «». The entries file classes it as an opening, and the rule you gave keeps openings quoted (section 3).

### 1. The first builder's work, reviewed

**Kept, because it is sound:**
- `reader/tools/place-card-v1.mjs` is the card's drawing code as one block. I compared it with `S/s14/reader/place.html` and the words, order and notes are the same. Only three things moved:
  - The full credits now sit inside the card, behind a button.
  - A file fetch that fails is let go, so the next press asks again.
  - The look rules are scoped under the card.
- `reader/tools/check-place-card-one-place-v1.mjs` does it the tree's way (as with the sign rule in `gloss-store-v1.mjs`):
  - Both pages carry the block line for line.
  - The check holds the three copies equal and runs the block on its own over the card's files.
- The wiring in zone.html:
  - The place answers' index is asked for once. Which books get the card comes from the data, not a typed list.
  - The place branch sits in `openHud` after the mark's early return.
  - `openPlace` is on every way a word opens: a press on a word, a press on a maqaf mark, and a search hit or link landing (`__openWord`).
  - The head names a pair's kind, and the card's number is the word's own.
  - The sheet keeps one fixed height and its body scrolls inside it.
  - The switch, the reset, and the list of pool-only switches.

**Fixed, each with its reason:**
1. **The trial page typed the card's words a second time.** Its chapter cells wrote «written, not read» again outside the block (the check's P4 failed). They now take `CARD.kindWords`.
2. **The two pool-only pills never left the row.** A pick's own `display:flex` beat its `hidden` attribute. On a work with no place answers the new switch would also have shown. One rule fixes both: `#modeRow .mode-pick[hidden] { display:none }`.
3. **A file landing rebuilt an open place card under the reader.** When the pointer map or the default sources landed, the card was built again, shutting opened entries and resetting the scroll. A place card is now never rebuilt by a file landing.
4. **Flipping the switch could reopen the wrong card.** If the reader had moved the old card to a pair's other half, flipping reopened the old card's half. `chooseCard` now clears that, so the word's own press picks the card.
5. **Colors outside the page's palette (found by the suite at rest).** The card drew some small text in silver and bronze. Its labels, notes and references now use the page's dim purple.
6. **A word's parts read left to right (found by the suite at rest).** Parts on «At this word» ran the wrong way. They now run right to left, so the record's first part stands furthest right (the page's own law). Each part still reads Hebrew then English. The class is `part-row`, because the page already styles `.parts`.

### 2. How the card is seated

- **Same sheet, new body.** Placement, holding still, closing with × / Escape / a press away, and the head (the word once, red and pointed, its number) are all the live page's own. The body is drawn by `PLACE.draw`.
- **Height.** `#hud.place` takes the whole height its placement gives it from the first frame, and the body scrolls inside. Opening an entry moves nothing. Under 320 px of room it opens on the other side of the word, by the page's usual rule.
- **What opens it.** Any word of a book with place answers, while the switch is off:
  - a plain word, and a word with a scribe's letter mark (Genesis 1:1 word 1);
  - a word in a maqaf-tied run (each word gets its own place card);
  - a written-and-read pair (the card shows both forms), and a word written and not read;
  - a search hit or a link landing.
- **What does not.** A scribal mark between words keeps its head-only card; the trial page cannot press marks either. A word from the Tikkunei Zohar, a commentary or a Targum (the page's `bin !== zone`) opens what it opened before. The chain pages are separate static pages and do not use zone.html.
- **Switch names for checks.** `?card=spelling|place` sets it for one load; `fh.card` keeps it on this device. A head line `<meta name="reader-card" content="spelling">` makes the old card the rest state.

### 3. The additions and the audit's two matters

**Addition 1, the unabridged record's one line.**
- When the head classes no run as the meaning or opening, the line prints the first two italic runs plain, after «in italics in the record:», then «… (n)» when there are more.
- 952 records print this way; 147 of them have more than two runs.
- Ruth 3:12 word 5 now reads: «אִם in italics in the record: if · if not, except … (5) (Biblical Hebrew)».
- The check's P9 runs every one of the 9,140 records through the block.

**Addition 2, sentences and stem labels from the data.**
- A record's language prints from the record's own line, recased; it is no longer typed in the page.
- A «cites this verse» label prints the citation's own label fields as given (b[4], b[5]). If the sixth cut writes the stem there ("Hiph`il 1."), it shows with no page change.
- **New names the card reads, for the projection to write:**
  - On a tag's line, `say: {<dictionary>: [sentence…]}`. These print in place of the card's own count of records.
  - On a form or a tag's line, `why: {<entry id>: sentence(s)}`. These print under that record's line; the form's (this word's) wins.
- Until they exist, the card says what it said before.
- The check's P8 plants all three in a copy of the files and sees them print. I copied nothing more from S/s14.

**Audit 1, unfoldingWord.**
- Where the data says the entry is not on hand (code H), no row is drawn.
- The row disappears from **292,871** cards: 293,140 rows in all, and 292,853 cards lose every unfoldingWord row. **6,515** cards keep one (146 numbers whose entry is on hand).
- The credits now say once: «Only part of this lexicon is on hand here: under a number whose entry is not among the files on hand, the card shows no row of it.» On the trial page that is in the page's foot; on the live page it is in the card's «credits in full» (11 shows the start of that panel; the unfoldingWord paragraph sits further down it).

**Audit 2, italics printed as if they were meanings.** Every place the card prints the record's italics now follows one rule: «» only for runs the entries file classes as the entry's meaning or an opening; everything else plain, after «in italics in the record:».
- **«At this word»:** each run's kind is read from the record's own file, which the card now fetches. 5,599 runs (all «tagged_gloss») now print plain, on 5,349 lines; 3,462 lines now have nothing in «».
- **The one line:** as in addition 1.
- **The whole record:** the blue "meaning" look is kept for meanings and openings only.
- **«Special uses:» still prints in «» on 90 lines.** The entries file classes it as the opening of a sub-point of the record of «if», so your rule keeps it quoted. You can see it in picture 10. The file cannot tell it apart from real openings like «life:» or «king:»; 5,378 lines carry an opening that ends in a colon. That is your call.
- **2 Samuel 15:21 word 5** is «and he said» and has no BDB line. The written-not-read word in that verse is word 12, so I took pictures of both.

### 4. The proofs

1. **The place checks.** `make-place-answers-v1.sh` on `S/s45w/fetched` ends «everything holds» in 198 s, with the same pins as before (places 641953e2…, entries b06df87e…, page 9e718bbc…). `check-place-card-one-place-v1` passes P1 to P9:
   - P6: 37,075 words across 114 chapters drawn as the files give them; 36,420 numbers; 219,287 dictionary rows; 35,653 rows not drawn because the entry is not on hand.
   - P7: 741 words with 5,298 whole entries opened.
   - A deliberately spoiled copy of the block makes P8 and P9 fail, so those laws can fail.
2. **The browser walk** (412 wide, scale 2, touch): Ruth 1–4, Genesis 1–5, and V's 20 other chapters.
   - 13,497 words pressed and 13,497 place cards opened. What «At this word» printed matched the file 13,497 times, and the head's number matched the word every time.
   - 87 of 87 real finger taps opened a card; no page errors.
   - **Median time to open:** 13.1 ms from press to card body (95th percentile 25.3, worst 209); 14.1 ms with the dictionaries drawn (95th 29.4, worst 388). These are local-server times.
   - **Opening and shutting entries:** 748 cards, 5,320 entries, all opened and all shut. The sheet moved 7 times, none of them caused by an entry:
     - 3 were the first card of a chapter, where the sheet's own opening animation (it grows from 93 in 100) began while it was being measured;
     - 4 were in Psalms 119, where the sheet stood still but the page scrolled 27–53 px underneath it as it built sections.
   - **Request noise:** the browser logged 200 card-file requests as aborted, yet every card got its data and the card logged no fault. The old card's own fetches do the same on S/base.
   - **Re-checks after the last two fixes:** 889 more words (Ruth 3, Genesis 1, Psalms 44), then Ruth 3 and Genesis 1 again (692 words, 6/6 taps). All matched the files and nothing moved.
   - The trial page on Ruth 3: 258 of 258 words drawn, no errors.
3. **Switch on equals today's card.** 200 places (the 5 you named plus 5 per book), with the switch pressed on, against S/base:
   - **189** were identical in every field on the first reading.
   - Of the 11 that differed, **10** were timing: files that land late (the record link, the "here MACULA reads" lines, the lattice's "another number"). Read on their second opening, they were identical.
   - **1** (Ruth 2:20 word 17, «Naomi») is only the old card's fit. It is folded "tight" at 375 px on base and whole at 740 px here. The new switch makes the page head 92 px taller, the word lands a fraction of a pixel lower, and the card's fit sits right on its edge (731 vs 732 px of room).
4. **The switch does not move the line.** Five books: Ruth, Amos, Jonah, Daniel, Genesis; 30,559 resting lines.
   - Base read live matches base's committed record.
   - The sandbox at rest, with the switch pressed on, and pressed off again all match base: lines, credits and state. No page errors.
   - **What feeds the line at rest:** the zone's baked tables — 304,494 lines are STEP's parts, 799 are STEP's row, 53 MACULA's parts, and 65 are dictionary readings found at bake time (these fall within the later 141-word step) — plus the line's own switches.
   - **Can the old card reach the line?** At runtime, only through a reading a reader presses on the old card. That press lasts the page session and is not kept on the device. At rest there is none. If the switch is turned off after such a press, it stays on its line until reset or reload.
5. **Other works are untouched.** On the Tikkunei Zohar the row is identical and the new switch is not drawn; 8 cards are identical. On Amos opened with `?commentary=on`, the Targum Jonathan on Amos 1:1 opens 26 words; 8 of its cards are identical, and none is a place card.
6. **The suite.** I found 88 checks that read the card.
   - **How they open the page:** 120 of the tree's 121 browser checks launch through `tools/playwright-v1.mjs`. They open the bare `zone.html`, by the runner's address on SERVE_PORT/8899 or their own server.
   - **The smallest way to keep them on the old card:** one line in the page's head, `<meta name="reader-card" content="spelling">`. It holds whichever server or address a check uses, and makes the old card the rest state, so the reset returns to it. An address parameter would mean editing every check, because they build addresses in many ways. Setting `fh.card` from the shared harness would not change the rest state.
   - Results are in section 5. The seven tree-walking checks pass both before and after. `check-manifest-prints-unguarded-v1` fails both before and after: the committed manifest does not print the new rule id.
7. **Pictures** are in section 6.

### 5. The suite's two lists (each check run on its own, on port 8946)

**Place card at rest:** 9 pass, 75 red, 3 skipped, 1 not run. Time limit 240 s for the first 9 checks, 120 s for the rest.
- **Laws of the page the card broke:** `color-channels`, `parts-read-right-to-left`. Both fixed; both pass at rest now.
- **Red because of my change:** `chain-book-v2` (K3: the chain record pins zone.html's hash). It passes on the tree as handed over.
- **Red before too:** `clean-address` (no census in deploy-root on this disk) and `press-paints-before-seen` (no verdict in 900 s on the tree as handed over).
- **The other 70** all go looking for parts the old card has — readings, divisions, the record, the table, the word senses, the shut dictionaries, the BSB row, a run's options, a pair's halves — and find the place card instead:
  - 30 waited out the limit: block-in-table, card-opens-on-the-line, compspan-coverage, concordance-counts-the-line, default-picks, default-spans, dictionary-kinds, form-of, kq-declared-weld, line-follows-card, line-reads-the-place, live-line-asks-its-own-word, made-spaces, overlays, piece-store, pill-whole, read-words, readers-faults-cards/-load/-pairs/-place/-rail, reset-pill, row-and-card-name-sources, ruled-equals-first-paint, ruled-split-fits, rulings-under-sources, search, span-grade, word-senses.
  - 9 hit a browser timeout waiting for the old card's elements: citations, drag-offscreen, gloss-whole, landing-holds-the-card, levels, nothing-overlaps, record-pinned, ruled-mark, usable-card.
  - 31 failed their first law about the old card: card-channels, dictionary-toggle, english-license, hud-toggles, kq-graded, kq-lead-follows-switch, lattice-orders, lattice-parts-in-card, ledger-divisions, maqaf-pair-drawn, masorah-toggle, names-pill, piece-class, pointing-gate, pointing-grade, proper-name, read-form-offsets, reading-language, reading-rows, run-card-forms, run-cards, run-line-follows-division, source-suggested, source-switch, span-store, strongs-hedges, v-volume-in-card, whole-form-parts, witnessed-order, word-address, words-stand-alone.
- **Skipped:** choice-memory (no word offers a division at rest), hoh-in-card, kq-presentation. **Not run:** same-product (it needs inputs named on its command line).

**Old card forced on with the meta line:** 82 pass, 3 red, 2 skipped, 1 not run. Time limit 600 s. The 3 reds are the same three named above: `chain-book-v2` (mine, because zone.html changed), and `clean-address` and `press-paints-before-seen`, both red before. Every check that was red at rest only because of the card passes here.

### 6. Pictures, and what a reader sees (`S/s46w/shots/`, 412 wide, scale 2, taken on `reader/zone.html`)

- **01 Genesis 1:3 word 5:** STEP reads «יְהִי there was + וַ and», with the parts running right to left. Then MACULA, UBS «to be (in existence)», and the BDB «Qal» line next to «1. a. arise, appear, come» (the stem fault). **01b:** its dictionaries.
- **02 Genesis 1:1 word 4:** STEP «<obj.>», MACULA «(et)», UBS «-», and the BDB «1. a.» with no words.
- **03 Ruth 3:12 word 5:** «written, not read», then STEP «if». The line under the word still says «mother». **03b:** the new one line.
- **04 Amos 7:12 word 6:** «go».
- **05 Psalms 44:15 word 6:** «peoples + among the». The MACULA gloss «among not» reads oddly.
- **06:** the unabridged record opened whole, with the cited point marked.
- **07 / 07b:** the row and the menu with the switch off.
- **08 / 08b:** today's card and row with the switch on.
- **09 Ruth 2:11 word 5:** «avow, acknowledge, confess:» stays in «» (it is an opening). This is also the stem fault.
- **10 2 Samuel 15:21 word 12:** «Special uses:» in «»; the line says «mother». **10b:** word 5.
- **11:** the card's credits in full; the unfoldingWord sentence sits further down that panel, below the picture's edge.

**What still reads badly:**
- The line under the 8 written-not-read words, the stem labels, and «cites this verse» where a number recurs in the verse (all later steps).
- «Special uses:».
- Most cards now show 6 dictionaries.
- The BDB words under «At this word» arrive a moment after the rest, because the card fetches a second file of about 31 KB.
- The switch's description wraps to three lines on a phone, and the line from the word to the card crosses the card's head.

### 7. Left out, and what a ship still needs

**Left out:**
- I left the projection tools alone. A citation's run kinds and the `say`/`why` sentences should be written by the projection; then the card's record fetch goes away.
- I did not rebuild the door: the engine files and book pages are unbuilt, so the pictures are of zone.html.
- I re-read only the 11 differing cards, not all 200, on second opening.
- No check's law was edited.

**A ship still needs:**
1. You reconcile the tools with S/s14's sixth cut and send its page changes.
2. Commit the 2 new tools, the trial page and the page data. The data has to be served gzipped. **Decide whether only `page/` ships (about 30 MB).**
3. Rebuild the door's engine and pages, read the chain records again, and re-bake the resting-line records (they name zone.html's hash).
4. Emit the manifest with the new rule id.
5. **Decide the 70 card-reading checks:** pin them to the old card with the meta line, or write place-card versions of them. Add `check-place-card-one-place-v1` to the suite.
6. Merge into gh-pages.

### 8. Paths

**Sandbox:**
- `S/s16/reader/zone.html` (modified, +769 / −7)
- `S/s16/reader/place.html`
- `S/s16/reader/tools/place-card-v1.mjs`
- `S/s16/reader/tools/check-place-card-one-place-v1.mjs`

The checks also wrote derived files under `S/s16/reader/build/` (gitignored).

**Scratch in `S/s46w/`:**
- `scripts/`: the first builder's four scripts, plus `h2-walk.mjs`, `h2-shot.mjs`, `h2-oldcard.mjs`, `h2-oldcard-compare.mjs`, `h2-places-200.cjs`, `h2-lines.mjs`, `h2-other.mjs`, `h2-suite.mjs`, `h2-suite-table.mjs`, `h2-swap.sh`, `h2-count-audit.mjs`, `h2-parts-rtl.py`, `h2-trial-page.mjs`, and the small probes `h2-smoke.mjs`, `h2-404s.mjs`, `h2-console.mjs`, `h2-abort.mjs`.
- `logs/`:
  - build and check: `make-2.log`, `check-place-card-one-place.log`
  - walks: `walk.json`, `walk.log`, `walk-after-last-changes.json`, `walk-final-ruth-3.json`, `walk-1-opening-measured-mid-animation.json`
  - the 200 cards: `places-200.json`, `oldcard-base.json`, `oldcard-switch.json`, plus the `-again` and `-twice` readings
  - lines and other works: `lines.json`, `other-base.json`, `other-sandbox.json`
  - audit counts and trial page: `count-audit.log`, `trial-page.log`
  - suite: `suite-table.txt`, and the folders `suite-place-at-rest/`, `suite-older-forced/`, `suite-before/`, `suite-place-at-rest-rerun/`, `tree-before/`, `tree-after/`
  - diffs: `zone-diff-as-found.patch`, `zone-diff-final.patch`
- `shots/`: 16 pictures.
- `h2-before/`: the first builder's files as I found them.
- `h2-swap/`: the copies the swap script restores from; its state is back to "after".
