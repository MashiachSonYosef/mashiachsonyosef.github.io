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
