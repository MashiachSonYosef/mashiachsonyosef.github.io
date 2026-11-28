# The laws of the spelling card

Builder H2, 28 November 2026, sandbox `S/s16`, for the frame-laws brief (`BRIEF-H2-FRAME-LAWS.md`, section 3).

## The rule

At rest the reader stands on the place card. Each pill there is a reading that a source gives at this word, found by the source's own address. Behind the switch «readings matched by spelling» (the older card) stands everything the catalog files under a word's letters. That covers:

- the store's rows;
- the overlays beside the store;
- the shards those rows are served in;
- every grade, gate, order and count made over those rows.

A law about such a feature has nothing to judge on the place card at rest, so it stays red there.

Each law below meets three conditions:

- it is red at rest;
- its feature stands behind «readings matched by spelling»;
- it passes with the old card forced (the meta reader-card line `<meta name="reader-card" content="spelling">`, the h2 swap, 70 of 70; logs in `S/s46w/logs/suite-frame-forced/`).

Nothing else is on this list. The only other reds at rest are:

- **F6, owed to the next ship:** the 73 words whose resting line no source gives.
- **Two laws whose ground the shut dictionaries take away (F3):** check-record-pinned-v1's «no reading was capped away» and check-gloss-whole-v1's ruled reading. These are not listed here. The hand-back names them as a decision.

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`

## The list

### The concordance pill and its table

- **check-dictionary-toggle-v1 (D1 to D5).**
  - Feature: the concordance pill (`dictPill`) and the table it opens.
  - Why it is a match by letters: the table lists every reading the catalog files under the word's letters, and where each one stands.
  - The pill is not offered while the place card stands (CARD_ONLY). At rest the check times out waiting for it.
- **check-reset-pill-v1 (R1 onward).**
  - Feature: reset, as this check drives it.
  - Why it is a match by letters: its first step presses the concordance pill above, so it cannot begin without that letters table.
  - Reset itself is proven at rest in the press proof. A reading is pressed, then reset. Every line of the verse comes back as it opened, and the reset pill stands at its default.

### The store's rows withheld or graded

- **check-masorah-toggle-v1 (M2, M4).**
  - Feature: the pointing's «only»; its withheld count; the sidecar's filter leader on the line.
  - Why it is a match by letters: it grades and withholds the catalog's rows found under the letters, by their headwords' pointing.
- **check-pointing-gate-v1 (G2, G5, G6).**
  - Feature: the stem and pointing gate.
  - Why it is a match by letters: it withholds catalog rows of the letters whose source points them as another stem, or does not point them.
- **check-pointing-grade-v1 (P5b).**
  - Feature: a row's grade from its own headwords under «only».
  - Why it is a match by letters: the grade is of rows found under the letters.
- **check-piece-class-v1 (C2, C3).**
  - Feature: a one-letter piece's card withholding the rows pointed only as the other kind.
  - Why it is a match by letters: those rows are the catalog's rows for the piece's one letter.
- **check-read-words-v1 (R7, R8).**
  - Feature: each read word asked its own entry, and the gate over the rows of its letters.
  - Why it is a match by letters: the gate withholds rows filed under the read word's letters.
- **check-span-grade-v1 (G6, G7, G9).**
  - Feature: the span store's joined rows, held back or kept, and their order.
  - Why it is a match by letters: the span store's rows are filed under a run's letters, joined.

### The store's own kinds of reading

- **check-form-of-v1 (F3, F7, F8, F11, F13, F14).**
  - Feature: pointer readings («feminine of …»): the lane's map of store rows whose text points at another entry.
  - Why it is a match by letters: the map is of the catalog's rows, keyed by letters.
- **check-kq-declared-weld-v1 (KW1, KW2, KW7).**
  - Feature: the declared weld, which withholds the catalog's rows under a written form's letters and points at the read word's rows.
  - Why it is a match by letters: both what it withholds and what it points at are rows found under letters.
  - At rest the place card reads each half of a pair at its own address. The written half of Exodus 4:2:4 offers STEP's «what + [is] this?», and the read half offers each read word's own pills (11 on «what»). KW3, KW4, KW5, KW6, KW8 and KW9 pass.
- **check-ledger-divisions-v1 (D5).**
  - Feature: a ledgered store row with a comma, standing as one pill.
  - Why it is a match by letters: it is a row of the catalog under the letters of אשר.
- **check-made-spaces-v1 (M10, M11).**
  - Feature: the spaces our build made inside store records, closed where the text prints.
  - Why it is a match by letters: the law is about those records' printed text, and the records are found under letters.
- **check-overlays-v1 (O6).**
  - Feature: an overlay's reading naming its overlay (Jastrow, the Samaritan works).
  - Why it is a match by letters: the overlays' rows are filed under the word's letters, beside the store.
- **check-piece-store-v1 (P3, P4, P5, P6, P7, P9).**
  - Feature: the piece store overlay, which serves TAHOT's and MACULA's pieces as store rows at a cell.
  - Why it belongs here: it is the older card's packaging of rows. Its P7 ranks a MACULA reading against store rows found under the letters.
  - The place card reads the same pieces from the place answers, by each source's own address (picture 01 of `shots-pills`).
- **check-read-form-offsets-v1 (R3).**
  - Feature: the piece store's alignment of a read form's pieces (`window.__readFormPlaced`).
  - Why it belongs here: the count is of claims the piece store placed, which is the overlay above.
  - At rest the reading itself stands on the place card. At Daniel 3:21:6, block פטשי, MACULA's «trousers» is among 7 readings, placed by MACULA's own letters.
- **check-strongs-hedges-v1 (H5).**
  - Feature: the record line under a store row of Strong's filed under H143, carrying his derivation.
  - Why it is a match by letters: it is a store row under the letters.
  - The place card shows Strong's whole entry in its listing, by the number STEP gives the word.
- **check-word-senses-v1 (W3, W4, W5, W6).**
  - Feature: Jastrow's word senses and their switch (`sensesPill`, CARD_ONLY).
  - Why it is a match by letters: they are rows of the Jastrow overlay, under the letters.
- **check-dictionary-kinds-v1, the clause of K4 on UBS's collocation rows.**
  - Feature: the store's row M18 rank 124 of קרא, «literally: to cry out (someone's) name (», and its `picked_at`.
  - Why it is a match by letters: it is a row of the store under the letters, and the clause asks for that row's own text.
  - Every other K4 law passes at rest. The place card rests UBS's collocation glosses shut at its own address (F3), counts them, and opens them with the same press.
  - At both Genesis 11:9:3 and Genesis 1:5:6, UBS cites the sense at that very word, so its gloss «to name» stands at both.

### The orders of «reads first» (F2: they stand behind «readings matched by spelling», CARD_ONLY)

- **check-lattice-orders-v1 (the line and the first pill under masoretic, cites here and vowels differ).**
  - Feature: the lattice's grade and citations.
  - Why it is a match by letters: it grades the catalog's cards under the letters.
- **check-witnessed-order-v1 (W4).**
  - Feature: the three witnessed columns.
  - Why it is a match by letters: they are baked one reading per key of letters. Its line at Amos 1:1:2, «Dibri», is a name the letters spell.
- **check-source-switch-v1 (the clause under S5: «and the card's first pill no overlay source carries is the line»).**
  - Feature: the line under «oldest first» with MACULA switched off. It moves to the table's alternate for the letters, «[were] four» at Amos 1:3:9, which no source gives at that place.
  - Why it is a match by letters: «oldest first» is the oldest witness for the form, its letters anywhere. The check runs under it.
  - Under «at this place», where the page rests, a line read live under the source switches is the place card's first pill. check-live-line-asks-its-own-word-v1 V2 and V3 pass.

### The store's shards and a whole form's catalog readings

- **check-run-card-forms-v1 (R6).**
  - Feature: a store shard that did not arrive.
  - Why it is a match by letters: the shard serves the catalog's rows under a key of letters. The place card asks no shard, so its readings stand without one.
  - The place card's own file that does not arrive is said, and asked again by the next press: «What the sources say here did not arrive. Press the word again to ask once more.»
- **check-rulings-under-sources-v1 (U7, U9).**
  - Feature: a divided word's whole form pressed alone as a ruling; its store shard.
  - Why it is a match by letters: a reading of a divided word's whole form as one word is a row the catalog files under the whole form's letters. No source reads a divided word whole at its place, and the set's parts are its division. U9 waits on the store's shard.
  - At rest the whole form says «No dictionary on this shelf gives this form whole. The readings of its parts are a press away.»
- **check-readers-faults-rail-v1 (F3).**
  - Feature: the rail drawn again, pressed through `#sensesPill`, the word senses' pill.
  - Why it is a match by letters: that pill is not offered while the place card stands (word senses, above). Playwright's press waits for it and times out.

## The two reds this list does not hold (decision for the lead)

- **check-record-pinned-v1, «no reading was capped away to make room».**
  - Its ground is a card of more than 100 readings among the first ten words of Amos.
  - At rest the largest is Amos 1:1:4 היה, with 84 readings; 65 of UBS's collocation glosses rest shut (F3).
  - With the shut dictionaries opened, the same card offers 149, all present.
- **check-gloss-whole-v1, the ruled reading shown whole.**
  - Its ground is a reading more than 40 characters longer than the line, among the first ten glossed words of Amos.
  - At rest the longest is 39 over, at היה: «to be (someone's wife, concubine, husband, son-in-law)». The longer ones are UBS collocation glosses resting shut.
  - With the shut dictionaries opened, the ground stands, with a reading 65 characters over.
- Both pass with the old card forced. Neither law's feature stands behind «readings matched by spelling».
