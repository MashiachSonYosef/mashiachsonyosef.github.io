# Ship 10b: a default source's line that reads several words (21 November 2026 AD)

Page lane (Elijah). Begun 16:20 UTC, after ship 13 went live (`main` 9017d8f9c6). Nothing here is built yet; this is the measure and the plan.

## What this ship is, and what it leaves

The corpus lane's relay v209 (`spans-v1/`, asked for on 15 November, ask 7) says for every default-pick line which words the line reads, by its own source's data: UBS's lemmas of two words, BDB's headwords of two words, MACULA's words that are two of ours, STEP's «+».

This ship reads that list for **UBS, BDB and MACULA set first**. It changes nothing at rest: STEP's own marks, and the joining of about 400 places at rest, wait for the owner's word as before (`wip/2026-11-20/ship-10/next-pass/SCOPE-two-word-entries.md`).

## Measured on live before building (`tools/spans-on-page.mjs`, `tools/spans-tally.py`, `measures/spans-on-live-*.txt`)

Every book opened with the source set first, every line read at the words of each span of two or more words the list gives that source (all picks, not only the first).

| | UBS first | BDB first | MACULA first |
|---|---|---|---|
| lines with a span of two words or more | 851 in 27 books | 643 in 25 books | 12 in 3 books |
| the source's line under one word, another source's under the next (the name twice), one cell | 220 | 2 | 0 |
| the same, the words standing apart | 193 | 0 | 2 |
| the source's line under each word (its own line again, or another of its lines), one cell | 53 | 46 | 0 |
| the same, apart | 75 | 36 | 0 |
| no line of the source under any word (each word as it rests), one cell | 200 | 220 | 0 |
| the same, apart | 101 | 207 | 6 |
| one line over the whole span, the source's | 8 | 128 | 4 |
| one line over the whole span, another's | 1 | 4 | 0 |

- **The name twice is real and wide under UBS:** «Kadesh-Barnea» under the first word and STEP's «Barnea» under the second, at 413 lines (Deuteronomy 1:2:9, 2:14:4). UBS files its two-word lemma at one word and has no line at the other (the list's own count: 737 such words).
- **BDB prints its own line twice** where its headword is two words and it files the record at both: «Beersheba» «Beersheba», 82 lines (Genesis 21:14:20, 21:32:3).
- UBS files another line of its own at the second word at 128 lines: «Sea of Reeds / Gulf of Aqaba» then «cattails / bulrushes» (Exodus 10:19:11).
- Where each word rests on STEP today, most often the source has no line there to print (BDB's record has no highlighted words), or the page already holds the source's line because TAHOT writes the reading across the two words with a hyphen.

The page guesses a source's unit today from two things that are not the source's: TAHOT's hyphen at the end of a piece, and the lattice's headword running across two words. Its own comment says what it lacks: «the book file gives each place UBS's meaning and its pieces but not the words that meaning covers, which the corpus lane's ledger would have to give». v209 is that.

## The plan

One rule, the page's own of 15 November, read from the source's data instead of guessed:

1. **The bake** (`tools/bake-default-picks-v1.mjs`) pins v209 beside the default picks and lays, in each book's file, the spans of two or more words of each source's first pick: the words, by the page's own word numbers, and the place the line is filed at. A span nested in a longer one of the same source gives way to the longer (three places under UBS).
2. **The page.** Where the source in force reads several words with one line, those words are one unit and take that line:
   - standing in one cell (a stroke joins them, or a run holds them), the line prints once over them;
   - standing apart, each word keeps the line as it rests and the card says what the source reads across them. This is what the page does today at the 39 units of BDB's it can already tell.
   - A line filed beside the words it reads (UBS's «Aram Zoba» at the object marker, II Samuel 10:6:15; five lines) is not printed under the word it is filed at.
3. **The checks.** `check-default-picks-v1` holds the pin, the book files' spans to a recount of the list, and the page: under each source, at every span of the books it reads, no word of a span prints beside a line that reads it too. The gate takes the spans as an expectation for the lines that move under a source pressed.

Not in this ship: a line the list says reads one word other than the one it is filed at (UBS, 34 lines); the list's branches (`other_forms_fit`, 81); a second source's spans; STEP's.

## What a reader will see

At rest, nothing. With UBS first: «Kadesh-Barnea» once over a joined pair instead of «Kadesh-Barnea» «Barnea»; where the two words stand apart, «Kadesh» «Barnea» as at rest, and the card of either says UBS reads the two as «Kadesh-Barnea». With BDB first: «Beersheba» once.

## Built (16:25 to 16:50 UTC), on a tree of live (`S/s13`, branch `ship10b` from 9017d8f9c6)

- **The one reading of the list:** `tools/default-spans-v1.mjs` (new). The pin `data/default-picks/spans-v1/PIN.json`, with the lane's rule and two receipts kept byte for byte. The list (1.7 MB) stays on the lane's store beside the default picks and is read through `--ledger`.
- **What lands:** a source's first pick whose span is two words or more. UBS 771 lines, 761 units (3 nested in a longer one, 4 lines filed beside their words); BDB 640 lines, 313 units; MACULA 12 lines, 6 units. Filed with a line of the source, so the page can print them: UBS 760, BDB 135, MACULA 6.
- **The bake** (`tools/patch-01-bake-spans.py`): each book's file carries `spans`, by word number. Every line that lands is proved to be the source's first pick at its place as the default picks give it (UBS by the piece and the meaning's id, BDB by record and meaning). None refused in 39 books. The index is untouched but for the files' bytes.
- **The page** (`tools/patch-02-page-spans.py`): `dfltSpanUnit`. A word of a unit takes the unit's one line, read at the place it is filed; `dfltUnitOf` answers the unit from the data before the old marks are asked; a line filed beside its words is not printed where it is filed; the card names the unit's reading as «one reading of these N words».
- **Found on the way, on live too:** a joined run's card said a unit's reading at every cell, «Bethel · sense 1 + Bethel · sense 1» at Amos 3:14:10 under BDB, over a line that read it once. Mended (`tools/patch-03-page-run-card-says-a-unit-once.py`): the card says a unit once.

## Read again on the built tree (`measures/spans-on-the-ship-tree-*.txt`)

| | UBS first | BDB first | MACULA first |
|---|---|---|---|
| one line over the whole span, the source's | 441 (was 8) | 174 (was 128) | 4 |
| every word as it rests, the words apart | 332 | 243 | 8 |
| every word as it rests, one cell | 2 | 220 | 0 |
| the source's line under each word | 73 | 0 (was 82) | 0 |
| the name twice | 3 (was 413) | 2 | 0 (was 2) |

What is left is the source's own filing, not a doubled name:

- UBS's 73 and its 3: the two-word lemma is UBS's *second* pick there. Its first pick reads one word by the list («Sea of Reeds / Gulf of Aqaba» is its sense of «sea» at Deuteronomy 1:40:7, and «cattails / bulrushes» its own line at the next word). The line prints the first pick.
- BDB's 2 (II Kings 9:27:7): the two-word record has no highlighted words, so no line; the word before carries another record's.
- BDB's 220 in one cell that rest: records with no highlighted words. Nothing to print.
- UBS's 2 in one cell that rest (Jeremiah 7:32, 19:6): a two-word unit inside a three-word one whose first word stands apart.

## The check (`tools/check-default-spans-v1.mjs`, new; `measures/check-default-spans-v1.txt`)

S1 the pin and the receipts. S2 every book's spans, and with the list on the machine a recount through the one reading (1,423 lines in 39 books). S3 on the page under each source, every book: no name stands twice at any unit filed with a line (UBS 435 units as one line and 325 resting; BDB 87 and 48; MACULA 2 and 4). S4 the card: a unit drawn as one line is said once; a unit resting apart is said as the source's one reading of its words. All pass, 3 min 20 s.

Still to do: the older check's page model (`check-default-picks-v1`), the gate's expectation for lines that move under a source pressed, the pipeline's documents, then the round, the gate and the whole suite.
