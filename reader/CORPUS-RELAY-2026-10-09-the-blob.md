# Corpus relay · 2026-10-09 · the blob

For the corpus lane, for a blob ledger. This page says what the serving lane now draws to tie a Hebrew word to its
English, what it reads to do it, where that reading runs out, and what a ledger would need to carry so that every
word can wear a blob with certainty. It is a proof of concept: live on run cells, and on every word behind a
preview address. It decides nothing the owner has not ruled.

## The owner's words

Today, on Genesis 1:2 (תֹהוּ וָבֹהוּ under "any naming"): *"i think we need to work on blob precision before you even
get the ledger toggle which is coming. every + will basically be blobable or even every word without a prefix, etc.
so we need these to be tight like splitting between characters and not cutting off tops of words"*. Then, drawn
over the page: *"see how its a flat line"*, and *"also i spotted a bad overlap"*. And: *"once you get the POC to me i
can pass it to moses for a ledger for you for it"*.

## What the page draws

- **One blob per piece.** A word whose English line has a `+` in it is as many pieces as its English has parts,
  cut between the letters where its division cuts it: the vav of וָבֹהוּ to "and", the rest to "emptiness". A word
  whose division does not answer its English part for part is one blob, whole.
- **Each English piece stands under its own Hebrew piece**, in the Hebrew's direction, as a run's words' parts
  already stand under their words. So "and" stands under the vav and no tie crosses another. The reading's text
  is not touched, only where each piece stands; read from the Hebrew's side it gives the text's order.
- **The outline, measured from the ink.** Each stretch of letters is painted on a canvas three times finer than the
  screen and read off pixel by pixel. The top is one flat line, a breath (2 px) above the row's tallest letter. It
  rises in an arch over each point, accent, lamed's flag or maqaf above the letters, with eased shoulders. In the
  English reader the feet are drawn the same way. Nothing the face paints is cut: no top of a word, no dot.
- **Seams.** Two pieces, or two words of a chain, share one straight seam in the middle of the space between their
  inks. Where the inks stand closer than a pixel (a vav and a bet a fifth of a pixel apart), the two blobs share
  one line and never overlap. Where one ink reaches over the other (a lamed's flag over the next letter, a vowel
  under it), the seam steps between three bands: above the letters, the letters, and below them.
- **Where it shows.** Live on every run cell. On every word behind `?blobs=every`, for example
  `https://fireandhail.com/genesis/?blobs=every`, and in the English reader with `&mode=en` added. Without that
  address, a lone word wears no blob until the ledger says which words do.

## What the page reads to split a word today

For each word, in order, the first that answers the English part for part:

1. **TAHOT's own pieces at this place** (each word's `pg`, from compspan v13.8's pg v4), when the line is TAHOT's
   word for word. Its pieces' letters must spell the printed word.
2. **The book's span row for the form** (the span ledger's cells), when it has as many cells as the line has parts.
3. **TAHOT's pieces again**, when only the count agrees.

Across the 39 books, at the line's default (the source at this place):

| | words |
|---|---|
| words on the shelf, marks apart | 305,431 |
| default lines with a `+` | 144,624 |
| split by TAHOT's own pieces | 144,255 |
| split by the span row | 2 |
| no division on the shelf, so whole | 367 |
| ketiv/qere places, not tied yet | 1,062 |

The 367 are mostly Aramaic, where the article is a suffix ("secret + the" for רָזָא in Daniel) and TAHOT and the
span ledger leave the form undivided. The `+` lines by part count are 127,597 of 2, 16,302 of 3, 724 of 4 and 1 of 5.

## What the serving lane needs delivered

A blob ledger, per book, on the HUD record's place axis (`p`, the shelf place), one line per place:

1. **`p`, `s`, `k`**: the place and its printed word, so every line proves its join byte for byte.
2. **`blob`**: `PIECES`, `WHOLE` or `NONE`, and why for `NONE` (a mark, a ketiv/qere half the ledger does not yet
   divide, a word the owner rules bare).
3. **`pieces`**: for `PIECES`, each piece's letters and its character range in `s` (start and end, the points
   after a letter belonging to that letter, the maqaf to the last piece), and who divides it so (the source and
   its rule), as the span ledger credits a division.
4. **`readings`**: for each reading that can stand on the line at that place, keyed as the route store keys its
   rows (m id and row id), which piece each `+` part of it reads. TAHOT's place reading is one of these; the
   form-keyed readings of the other line positions are the rest. A reading whose parts no division answers is
   listed with the reason, never forced.
5. **The 367 and the 1,062**: a division for the words the shelf leaves whole (the Aramaic suffixes first), and the
   ketiv/qere halves' own divisions, each credited.

Candidate only until the owner rules which places wear a blob. The page reads the ledger beside the zone, as it
reads the HUD runs, and draws nothing new where the ledger is silent.

## What the serving lane checks

`tools/check-blob-precision-v1.mjs`, held to the pixels and not to the page's own numbers. It photographs each
cell with its Hebrew painted black on white and its blobs hidden, then asks the blob paths about every dark pixel.

- Every ink pixel of a word that wears a blob lies inside a blob, Hebrew and English alike, in both readers.
- No pixel lies inside two blobs except along a seam they share.
- A word set in pieces wears one blob per piece, standing over its English pieces in their order.
- A run part set in pieces reads its word's own line, character for character.
- At the default no lone word wears a blob.
- A redraw costs under 4 ms a cell. It measures about 1 ms here.

Today over the first book's cells it reads 0 pixels outside and 0 in two, across about 170,000 Hebrew and
116,000 English ink pixels in five settings.
