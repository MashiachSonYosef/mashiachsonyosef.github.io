# Default picks on the page: a prototype for the owner — 13 November 2026 AD

Not shipped. Built on a copy of the live build (main `bc5f5f9b09`) to show the owner what the page could do with the corpus lane's default picks ledger (relay v180, mended by v180.1), and to put the calls that are the owner's.

## What was asked

From the owner, through the corpus lane's note of 13 November: STEP's reading leads a card today. It becomes one of several defaults, one for each source that names its own meaning at a place: STEP default, UBS default, MACULA default, BDB default, and later Jastrow default. The leading pill says "STEP default"; opening it lets the reader choose another source's default. Where a source makes more than one pick at a place, its picks stand as 1, 2 and 3 in its own order. Which default rests on first is the owner's.

## What the prototype does

- **On the card.** The reading row says whose default leads: "reading · STEP default ▾". Pressing it opens a row with each source's own pick at this place, each named: at Genesis 1:1 "he created", STEP default «he created», UBS default «to create», MACULA default «created», BDB default «shape, create · sense 1.». Choosing one makes it lead the card, and the choice is kept for the next card.
- **Several picks.** At Genesis 1:4 "good": STEP default 1 «[it was] good», STEP default 2 · another number «pleasant», then UBS default «to be good» and MACULA default «good». BDB has no pick there.
- **On the line.** With a default chosen, the line under each word is that source's pick where it has one, tagged with its name; elsewhere today's line stands. Genesis 1:1 under each:
  - STEP (today's line): in + beginning · he created · God · <obj.> · the + heavens · and + · the + earth
  - UBS: beginning · to create · God · - · heaven / sky · - · earth / ground / land / country / region / area
  - MACULA: in beginning · created · God · <obj.> (today's; MACULA has none) · the heavens · and · the earth
- **The data.** One small file per book, fetched the first time a card asks, as the BSB's "source suggested" file is. Laid compactly it is about 210 KB gzipped for Genesis and about 3 MB for the thirty-nine books. The prototype's own file is the ledger's text uncompressed (5 MB for Genesis); a real bake would be the compact one.

## The owner's calls

1. Which default rests on first. The prototype rests on STEP's, which is the line as it stands today.
2. Whether a chosen default reaches the line under every word, as in the prototype, or only the card.
3. BDB's default is the numbered sense BDB files the verse under. The words that open that sense are a note under ruling 4, so the prototype prints the entry's own highlighted words («shape, create») with the sense's number. Is that the BDB default wanted?
4. UBS's defaults are its dictionary meanings, joined with slashes («earth / ground / land / country / region / area»), not a reading in context; MACULA's read like a running translation («now the earth · was · formless · and empty»). Both as they are?
5. Two lines on the card already say part of what the row says: "here the source reads" (STEP's reading at this place) and "source suggested" (the BSB's whole word). Fold them into the row, or keep them beside it?

## Not in the prototype

- A maqaf-joined pair keeps today's line under any default.
- Jastrow's default (the lane sends it after the four).
- Where a pick is printed: the prototype prints the ledger's words for every pick. A real build would print the served row a pick names where there is one, and the source's own words, credited, where no row prints them (picks printed by no row: STEP 18,679, MACULA 10,849, UBS 796, BDB 10,682).
- A check. The real build gets one, as every ship does.

## The files

- `bake-default-picks-proto.py`: the per-book file from the ledger and its v1.1 mend.
- `proto-edit-default-picks.mjs`: the page's prototype, applied to a copy of `reader/zone.html`.
- `defaults-on-a-card.mjs`, `lines-under-a-default.mjs`: the probes that took the pictures.
