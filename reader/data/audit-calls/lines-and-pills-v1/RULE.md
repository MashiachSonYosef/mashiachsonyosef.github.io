# RULE — the line under every word, and every pill of the recorded cards, held to what the source itself says at that place (audit, lines and pills v1)

13 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. Part 1 of the full audit the owner asked for on 13 November. It changes nothing served. It reads the page's own recordings of what it prints, and counts.

**Amended after the builder's first runs, before anything was written to the store.** The first runs showed that a pill must be matched as the page prints it, not as the store words it, and each of these is now written in its place below: (1) a card draws STEP's reading of several pieces with ` + ` between the pieces; (2) a row the store divides prints as its pieces, a made space closes, a last stop can be taken off, and readings that differ only in capitals fold into one pill; (3) the piece store, the Jastrow overlay and the span store name sources of their own, so their indexes are read for labels; (4) the page itself marks a pill that is a reading made at the place, which gives a check on this count; (5) TBESH is read by its second column. The fifth was a fault of this lane's own, found here: default picks v1 (relay v180) read TBESH by its first column, so STEP's alternative numbers that carry a letter had no words there. It is mended in its own relay.

## What is read

- **The lines.** The page records the line it draws under each word as it opens, one file per work: `reader/data/resting-lines/<book>.json.gz` (read from fireandhail.com). A file's `sections` are the verses in order; a line is `[first entry, entries it stands under, the text as drawn, who its chip credits]`; an entry is a word or a scribal mark, counted from 0 in the verse's own order. The credit `PIECE:TAHOT` is STEP's reading made at that place, `PIECE:MACULA` MACULA's; any other credit names the source ids of a row found by the word's letters.
- **The cards.** The page records the card of every word of twelve books, `chain/<book>/chain-v1.json.gz` (read from fireandhail.com). A section's `cells` are the verse's entries in order. A word's card in the state `rest` (a first visit) and `lifted` (every switch that withholds lifted) names its pills by `pool`, an index into `pools`; a pill is `{r, s, y, by}`: `r` the first 12 hexadecimal digits of the sha256 of the pill's text as printed, `s` the same of its source's label, `by` the same of every source that gives the reading where more than one does.
- **The places.** The word numbering v1; the entries of a verse are the lattice v12's positions of that verse in order, the words being those with `c0` ON, numbered from 1.
- **What each source itself says at a place.** STEP: the TAHOT lines the numbering ties to the place (read as default picks v1 reads them, the lines the catalog's reader skips among them). MACULA: the MACULA words tied to the place. UBS and BDB: their picks in default picks v1 (relay v180).
- **The served route store**, for the rows' texts and sources, the places where a row divides at print (its eighth slot) and where a made space closes (its tenth).
- **The indexes of the page's other stores** (`reader/data/piece-store/index.json`, `reader/data/overlays/jastrow/index.json`, `reader/data/span-store/index.json`), for the labels of their sources. The piece store's two sources, `PIECE:TAHOT` and `PIECE:MACULA`, are the page's own mark of a reading made at the place.

## Part A — the line under a word

Every line of the 39 books is put in one class.

A line that stands under **one word**:

- `STEPS_READING_HERE`: its credit is `PIECE:TAHOT`. It is `IN_STEPS_WORDS` when its text equals STEP's Translation of a line tied to the place, both drawn alike: STEP's pieces are its Translation cut at `/`, each trimmed; the line's pieces are its text cut at ` + `, each trimmed, the zero-width space U+200B taken out; on both sides a piece that is empty, or a sign and nothing else (`<…>`, or `¿`), is set aside; the pieces that remain are joined by ` + ` and compared. Otherwise it is `DRAWN_DIFFERENTLY`.
- `MACULAS_READING_HERE`: its credit is `PIECE:MACULA`.
- `A_ROW_BY_LETTERS`: any other credit. With it: whether STEP reads the place (a tied line with Hebrew to read), and whether the line's words are STEP's words there (the same comparison).

A line that stands under **two words or more**: `OVER_SEVERAL_WORDS`, with the words it covers, its credit, and STEP's Translation of each covered word.

A word under no line: `NO_LINE`, with whether STEP reads the place.

Every listed place carries how the numbering ties it to STEP: `agreement_tahot` and `tie_layer` (`main`, or one of the three ties made under an open question: `open-q1` two words in the source, `open-q11` the source's own spelling, `open-q14` two words on one branch), so the receipt can count the misses by their cause.

## Part B — the pills of the recorded cards

For every word of the twelve recorded books, in both states, every pill of the card is read: its sources are `s` and every member of `by`, each matched to a source id by the sha256 of the label the store's index gives that id (a label no id of the store has is counted as not read).

Four sources name places, and a pill that one of them gives is put in one class for that source:

- `ITS_OWN_READING_HERE`: the pill's text is one the source itself gives at this place;
- `NOT_ITS_READING_HERE`: the source reads this place, and the pill's text is not one of its readings here;
- `THE_SOURCE_IS_SILENT_HERE`: the source gives this place no reading.

What a source gives at a place, each text matched by the first 12 hexadecimal digits of its sha256, as the card's `r`:

- **STEP's aligned translation (M4)**: every run of neighbouring pieces of the Translation of the place's TAHOT lines, the whole word among them: as the store words it (the pieces joined by `/` as STEP writes them, whitespace made single), and as a card draws it (each piece trimmed, the pieces joined by ` + `, an empty piece drawn as the zero-width space U+200B, and so too, in one drawing, a piece that is a sign and nothing else).
- **STEP's dictionary TBESH (M19)**: the TBESH gloss of every extended Strong's number the place's TAHOT lines name: in dStrongs (every piece), in the alternative numbers, and in the tags of the meaning variants. TBESH is read by its second column, which holds the number TAHOT names (`H1254A`, `H7225G`); its first column is another numbering (`H1254a`, and one number for several meanings).
- **MACULA (M3)**: the `english` of each MACULA word tied to the place, and every run of neighbouring tied words drawn as a card draws pieces (joined by ` + `, a word with no english as U+200B).
- **UBS (M18)**: the texts of the rows default picks v1 names for UBS's picks at the place.
- **The unabridged BDB (M46)**: the texts of the rows default picks v1 names for BDB's picks at the place.

Every text is matched in each way the page can print it: whole; with its made spaces closed; cut into its pieces where the store divides a row of that source and text (the mark at a cut dropped, each piece trimmed, its made spaces closed); each of those with and without a last stop; and each in its own spelling, with its first letter raised or lowered, all in small letters, all in capitals, and in small letters with the first raised (a card folds readings that differ only in capitals and prints the spelling of the first row it keeps). A source "reads the place" when it gives the place any reading.

**The page's own mark.** A pill one of whose sources is the piece store's `PIECE:TAHOT` is a reading the page itself made at the place from STEP; `PIECE:MACULA` likewise from MACULA. The receipt counts, for each, the marked pills and how many of them this count also finds to be the source's reading there.

A pill is counted once for each of the four sources among its sources. The receipt gives, per book and state: the words, the pills, the pills by source, and for each of the four sources the three classes; and the cards that print at least one pill that is not its source's reading here.

## Checks the builder makes, each a hard stop

1. every verse of a recording has the entries the lattice gives it (a line or a cell never points past them), and every recorded word has a place in the numbering;
2. the lines of each book are the count the recording itself states, and the cards' words are the count each chain book states;
3. every class of Part A adds up to the lines; every pill of Part B is counted once per state;
4. the recordings read are named with their sha256, and the store's version is the one each chain book names;
5. every row default picks v1 names stands in the served store.

## The second count

`verify-lines-and-pills-v1.mjs`, by the same hand and another road: it reads STEP's Translation for a place straight from TAHOT by STEP's own reference (the numbering's `tahot.col1`), not through default picks; it classes the lines again and counts the pills of the STEP source again, and must find the receipt's counts.
