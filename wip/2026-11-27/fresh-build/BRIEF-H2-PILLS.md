# Builder H2, next: the card keeps its pills, its divisions and the reader's choice (sandbox S/s16; nothing ships)

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`
`N` = `/home/user/mashiachsonyosef.github.io/wip/2026-11-27/fresh-build`

## The owner's word (27 November, on picture 01, Genesis 1:3 word 5)

> «this part is fine but you dont get to skip R pills and compspan and selectable gloss just because we can play around with how the cards list off D/M»

The listing («At this word», «In the dictionaries») is fine. But the card you seated dropped three things today's card has:
- the **R pills**, a reading on each pill;
- the **compspan**, meaning the word's divisions: the whole form, its pieces and each cover of them, plus the maqaf run's card and a chain's card;
- the **selectable gloss**, meaning a pressed pill puts its reading on the line under the word.

Those are not optional. Picture 08 (`N/H2/shots-cut8/08-…png`) shows them on today's card:
- the line at the top («and + there was»);
- the divisions («ו + יהי», «ויהי») and their cells («יהי», «ו»);
- READINGS, the R pills of the pressed cell;
- the pressed pill «there was» with its credits («also given by 2 more sources»);
- «the record, whole».

What was wrong on today's card is only **where its pills come from**. «beacon», «break», «faint», «quit (one-)self» stand there because the pool matches the word's letters against every row we hold. Nothing else about the frame was at fault.

## What you make

On the 39 books, at rest, the card is today's card in every part of its frame, with its pills filled from the place answers by each source's own address instead of from the pool. Under the pills stands the listing you built («At this word», «In the dictionaries»), as the record of where each pill comes from.

**Reuse today's code for the frame.** That is the line at the top, the divisions and cells, the READINGS band, pressing a pill, the line following the card, reset, export, the maqaf run's card, a chain's card, a written-and-read pair's halves, and «the record, whole». Do not write a second copy of any of it. The change is the source of the pills, at one place in the code.

**The spelling switch.** «readings matched by spelling», off at rest, still brings back today's pool whole, with its pool-only controls («1 off by default · show» and the like).

### Where each pill comes from (the one rule, applied to pills)

A pill stands in a cell only where a source puts that reading on that part of the word by its own address, or by a bridge a source declares. Nothing is matched by letters.

1. **The cells.** The cells are the divisions today's card already draws: the components the zone holds (STEP's pieces at the place, `pg`, or the span ledger's declared row) and the covers made from them.
   - A cell is either one of a source's own pieces at this place, a run of them, or the whole word.
2. **The place readings.**
   - STEP's gloss of each of its pieces at this place goes in that piece's cell. STEP's reading of the whole word, as its pieces join on the line, goes in the whole word's cell.
   - MACULA's words at this place go in the cells their own letters make, by MACULA's own division of the word. Where MACULA divides otherwise than STEP, say so and hold both. The owner, 26 November: «if another dictionary made a different cut our system should be able to hold both».
3. **The dictionary readings.** Under the number STEP gives a piece, each dictionary's own entry, by the bridges as the card draws them now, gives pills in that piece's cell.
   - **The pills are the strings the card already prints as that dictionary's meaning, split only at the source's own marks.** Each «» run of a meaning or an opening, each `<def>` of Strong's and of the Open Scriptures BDB, each gloss of the UBS sense, and STEP's brief lexicon's gloss.
   - Nothing printed plain after «in italics in the record:» is a pill. Strong's KJV renderings are not pills.
   - Where the bridge says «several», the pills are those of the records the card shows as this word's.
   - A UBS sense that cites this very word, or an unabridged BDB line that cites this verse, comes before that dictionary's other pills. The card already says which ones cite.
4. **Grouping.** One reading, one pill, as today (#42): pills with the same printed form are one pill, with every source that gives it credited under it.
5. **A cell with no reading.** A cell no source reads by its own address has no pills. Say so in plain words, something like «No source reads this part by itself here.». Count such cells and report the count.
6. **Order.** The live default sources' order (STEP, MACULA, UBS, BDB, then the others as the card lists them). The pill selected at rest is the line's reading at rest.

### The line

The line at rest must not move: it is the zone's baked line, as now.
- **The resting line among the pills.** At each word, find the resting reading among the cell's pills. Where it is not among them, say what it is and count these words; they should be within the 141 known differences. The line still stands there, and those words are the later step.
- **Pressing.** A pressed pill puts its reading on the line, exactly as today: the same state, the same reset, the same export, and kept for the page session as today.
- **Divisions.** Pressing a division or a cell does what it does today.

## Prove it

1. **The data still holds.** `make-place-answers-v1.sh S/s45w/fetched` ends «everything holds», and the comparison tool exits 0.
2. **check-place-card-one-place-v1, extended:**
   - every pill a card offers is a string the listing prints as a meaning, by the rule above, with its credit;
   - no pill stands without an address;
   - every listing meaning of a shown record is a pill in its cell.
   - Show each new law failing on a spoiled copy.
3. **The walk** (412 wide, the same 29 chapters). Every word pressed opens the card; the pills equal what the files give; no page errors; the median time to open.
4. **Pressing a pill.** On 300 words across the books, press a non-resting pill. The line under the word shows it, export shows it, and reset returns the resting line. Also press a division and a cell on 50 words with pieces.
5. **The 70 card checks.** These were red at rest only because your card lacked these parts. Run them again with the new card at rest, each alone, one at a time.
   - List which pass and which are red, and why.
   - A check whose law is about the pool's own content (a reading matched by letters must appear) is expected red there: name it as such. **Do not edit any check's law.**
   - Then the same checks with the old card forced, as before.
6. **Switch on equals S/base** on 50 places. **Resting lines unmoved** with the switch off, on and off again (five books). **The eight tree checks**, each alone.
7. **Pictures** at phone size, deviceScaleFactor 2, the real reader, in `S/s46w/shots-pills/`:
   - Genesis 1:3 word 5 at rest (divisions, cells, pills, listing), and again with «to be» pressed and the line showing it;
   - Genesis 1:1 word 1 (the prefix's cell and the root's cell);
   - a maqaf run's card;
   - a chain's card (Malachi 2:5);
   - Ruth 3:12 word 5;
   - Exodus 30:33 word 11;
   - Genesis 1:11 word 7.

   Look at each yourself and say what a reader sees and what still reads badly.

## House rules

As in your first brief:
- no Hebrew in zone.html's own code or strings, and none in tool string literals;
- American English;
- plain words on the page;
- each source credited as it asks;
- one browser at a time;
- disk is tight (about 3.3 GB free), so keep logs small;
- if a write or command is refused, do not route around it: say so.

No commit, push or ship.

## Hand back

Your final message, whole:
- how the pills are filled, and the one place in the code that changed;
- the count of cells with no reading, and of words whose resting reading is not among the pills (with the list);
- each proof with its counts;
- the 70 checks' two lists;
- the pictures' paths with what each shows;
- what still reads badly;
- the paths of everything.
