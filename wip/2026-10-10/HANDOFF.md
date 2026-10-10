# Handoff, 10 October 2026: saved, not live

**Shipped since (10 October):** the reading place (item 1 below) and every Masoretic mark gold by Moses's classes (relay v72.2.1; data/masoretic-marks-v1.json, tools/project-masoretic-marks-v1.mjs, tools/check-masoretic-gold-v1.mjs). The marks went live deep (#76500c), then bright (#bd890f), and now stand on the borders' gold, `--mark-ink: var(--gold)` (main 9ba114b20), by the owner's word: "id just use the same gold as the borders and logo was". The reader here does not have the gold yet: bring main in before shipping anything from this branch (zone.html will conflict around the reading place, which both carry).

**Next up: the palette fold** (a regular and a dim per color, three linens, the logo dyed to match). It is drafted, partly reviewed and not live; see palette-fold/README.md for what is open.

Moses, 11 October: READY and not yet wired are word order (moses-word-order-v1, relay v70), word numbering (moses-word-numbering-v1, relay v71.1.1) and set-apart letters and paragraph marks (moses-set-apart-v1, relay v73). Still being checked, not to be wired: the license ledger v1.2.3 (relay v67.4.3) and accent types (relay v74). MAM's license per Moses: Sefaria's version record says "CC-BY-SA" with no version; the page's source line says "CC-BY-SA 4.0".

This branch saves work the owner has seen in screenshots but has not yet asked to ship. Apart from the two pieces above, nothing here is on main or gh-pages. Before shipping: run the suite, run the door build (book and chapter addresses load the built engine, so they show none of this until it runs), and delete this `wip/` folder.

## What the reader change holds (reader/zone.html)

1. **The reading place.** The owner, 9 to 10 October: "seems like yes if that works", "id say yes if you ask me", "agree scrollbar dragging doesnt count".
   - As the reader reads, the address follows the chapter (/amos/7/), by history.replaceState, with no back-button steps. Arrival is never rewritten.
   - /amos lands on the kept verse and names its chapter.
   - A reopened chapter address lands on the kept verse inside it.
   - A link elsewhere opens where it says and offers a "Back to 7:14" button. The no-popup call was the assistant's; the owner left it open.
   - The rule comments in reader/tools/check-clean-address-v1.mjs and reader/tools/build-front-door-v1.mjs are amended to match. They are comment-only changes.
2. **The license chip and the blob follow the English** on every path that changes it (the owner, 10 October). 57 change paths were probed.
   - One function makes every chip: licenseChipFor, with its text from licenseTextOf. That is where Moses's pill table plugs in.
   - Fixed: under the headword lookup a line wore the form's chip, wrong on 13,018 lines.
   - Fixed: MACULA-only lines were credited to TAHOT.
   - Fixed: the exporter now credits the reading shown.
   - Off-screen blobs redraw within a few seconds of a whole-book switch.
3. **Blob geometry.**
   - The top sits at two set heights: flat over the consonants and the maqaf, and one raised height for marks above. The bottom in the English reader mirrors it at two set depths.
   - Band walls: a piece's edge stops at a band it gave up to a neighbor's mark.
   - One line at every seam (the owner: "see how it could be 1 line?"), with square corners on seams.
   - A blob appears only where the English shown splits at "+" into pieces its own division answers. A single unsplit word has none, and a word gains or loses its blob as its English changes.
   - In the English reader the English keeps its order and the ties cross; in the Hebrew reader nothing crosses. The license chip rides above the English in the English reader, and only crossing lines get extra height.
4. **Checks.** reader/tools/check-blob-precision-v1.mjs is the pixel test, new and unregistered. Run on Genesis, first 60 sections, both readers: no ink outside a blob and none inside two. The suite was not run.

## Waiting on the owner

- **The draw question,** rule A or rule B, from the license ledger relay v67.1.1. The assistant leans A.
- **Credits where the line and the card disagree.** The line credits TAHOT and the card the oldest store source on about 42 of 173 Ruth lines. The assistant would credit the source whose words are shown.
- **Runs in the English reader.** Parts still stand in Hebrew order, as "evening + and + there was". The assistant leans toward English order with crossing ties.
- **Gold Masoretic marks.** The mockups are approved in principle. A deeper gold (#76500c) reads at small sizes. This would reverse the 2026-09-11 and 2026-10-02 color rulings. The exact build is a color webfont: serve our own Hebrew font, after its license is checked.
- **Word numbers.** Hebrew words only, by verse, on the Masoretic count, faint, gold leaning.

## Waiting on Moses

- **A corrected pill table.** See PROMPT-FOR-MOSES-2026-10-10-license-pills.md here. The license relays v67.1.1, v67.2.2 and v67.3.2 are deliberately not wired, because the v1.2 pill rule gives PanLex "CC0 1.0", OmegaWiki "cc0-1.0", Kaikki "GFDL" alone and MUSE nothing.
- **A Masoretic marks ledger.** See PROMPT-FOR-MOSES-2026-10-10-masoretic-marks.md.
- **A positioning ledger for the zig-zag,** which the owner has asked Moses for.
- **The piece-blob ledger v1.3.1** (relay v65.4.1) is READY on R2 and not yet wired. All 367 "+" lines with no division are on its PLACE_HAS_NO_BRANCH list (1,094 places, 1,092 of them Leningrad spelling differences).

## Scratch kept here

- `probes/`: the change-path probe (probe.mjs, shots.mjs and its helpers), the adapted pixel test (blobwide-live.mjs) and the depth census (depth.mjs). Their paths point at the old session's scratchpad and port 8921; adjust them before use.
- `zigzag-variants/`: three designers' patches for the English-reader crossing (A clean ribbons, B woven over and under, C slim strands). Each is against a draft copy, not the current reader. None was chosen; the compact crossing in the reader is the baseline.
