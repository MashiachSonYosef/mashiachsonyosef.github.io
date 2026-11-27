# Ruth read on the page: all four chapters, every verse, every word

A pilot of the reading loop, 27 November 2026, on the frozen tree `S/base` (main at ea6e1ad08e). Nothing was fixed and nothing was written outside this folder (`S/w39/out/R-ruth/`).

## What was read, and how

- **The lines, by hand:** all 1,296 words of the 85 verses, each English line judged against its Hebrew word in its verse (read from `data/resting-lines/ruth.json.gz` joined to the book file; `sheet.tsv`).
- **The lines, by machine:** every line against TAHOT's own Translation cell at the same row (`line-vs-tahot-ruth.tsv`).
- **The cards, by machine, on the page:** every word's card opened in a browser from its chapter page (`/ruth/1/` … `/ruth/4/`), twice: once for what the card holds (`cards-ch1..4.jsonl`, 45,711 pills), once for what a reader sees of it without scrolling at a phone's width, 412 by 915 (`seen-412.jsonl`).
- **The cards, by hand:** every tenth card (130) and 38 cards behind a doubted line; every distinct «here BDB reads» note (372); 400 of the 718 distinct «here UBS reads» notes (the rest, and MACULA's 918, were only filtered by machine for odd shapes).
- **Pictures:** nine flagged places, verse and card (`shots/`), looked at by eye.

«Verified» below means seen on the page in the browser walk or a picture. «Suspected» is said where a cause was not traced to its line.

## Summary

| # | Cause | Places in Ruth | In the 39 books | Seen by | Class |
|---|---|---|---|---|---|
| 1 | On a divided word the card does not lead with the reading on the line | 565 of 692 divided cards; the pressed pill is out of view on 201 | 145,559 lines have more than one piece | machine, all cards; pictures | a rule of ours overrides STEP's answer in the card's order (the line is right) |
| 2 | Cards longer than the window | 1,015 of 1,296 cards need scrolling; 445 have over 40 pills, 166 over 80 | not counted | machine | follows from 1; no rule at fault of itself |
| 3 | Pills cut in the wrong place, and cross-references printed as readings | 72 cards (117 pills) + 44 cross-reference pills | not counted here | machine, all pills; hand | our print step overrides the source's own punctuation |
| 4 | A year printed beside a source that is not its own | 130 pill titles, 10 records under the pills | not counted | machine | a rule of ours (the wording year) fired where the source has its own year |
| 5 | The first pill on a one-letter suffix is the letter's name | 36 cards | not counted | machine | a reading of another entry on the card |
| 6 | The object marker joined by a maqaf is drawn in the next word's cell, and the plain list under the chapter prints an empty item for it | 25 empty items | 6,584 | data; one picture | the reader's cell is by ruling; the plain list is the fault |
| 7 | UBS's pointers to another word served as readings | 18 cards (20 pills) | not counted | machine | a reading that belongs to another word |
| 8 | One reading as two pills (apostrophe glyph) | 16 cards | not counted | machine | our pooling key |
| 9 | Notes above the pills that are not readings (BDB) | 457 notes in the markup; a reader sees 38, about 9 faulty | not counted | hand, all 372 distinct | our print of BDB's pick |
| 10 | A word the spelling bridge carries is drawn unlike its neighbors and its card has no division | 7 words | 465 (of 799) | data; one picture | the bridge carries STEP's reading and drops STEP's division |
| 11 | Written-and-read places: the line or the pressed pill is not STEP's | 11 words (1 written only, 2 before a read-only word, 2 read only, 1 pair's line, 5 pairs' pressed pill) | 8 written only, 9 + 9 at read-only words, 12 pairs not led by STEP | hand; pictures | rules of ours override answers STEP gives |
| 12 | A divided object marker opens on «self» | 1 card | not counted | machine | the signs switch |
| 13 | STEP's own reading against the verse's sense | 1 word (1:6 «if») | not counted | hand | the source's own; no rule of ours |
| 14 | The page's own words | 14 cards seen (451 in the markup), and smaller items | every book | machine; hand | taste |

Lines that read wrong: **5 of 1,296** (rows 11 and 13). Everything else is on the cards.

## The findings, by how many places each touches

### 1. On a divided word the card does not lead with the reading on the line (verified)

**What a reader meets.** Press וַיְהִי at 1:1 (line «and + it was»): the card opens on the block יהי and its first pills are «beacon», «be(-come)», «accomplished», «committed», «like)», «break»; the pressed pill «it was» is the 60th of 81 and is not in view (`shots/1-1-w1-vayehi-card.png`). Press לְאִישׁ at 1:12 (line «to + a husband»): first pills «person», «people», «husband», «each»; the pressed «a husband» is pill 69 of 69 (`shots/1-12-w16-leish-card.png`). וַתֹּאמֶר «and + she said» opens on «answer» (pressed at 41 of 53); וַיֹּאמֶר «and + he said» on «declare» (27 of 83); חַסְדֵּךְ «loyalty + your» on «mercy», «reproach», «reproof», «beauty» (45 of 56); הַקּוֹצְרִים «the + harvesters» on «cut down», «much discouraged», «grieve» (13 of 13); וַיֵּשֶׁב «and + he sat down» has its pressed pill at 131 of 140 with 21 in view.

**Count (machine, every card).**

| | cards | pressed pill first | median place | beyond the 10th | beyond the 30th | last on the card | worst |
|---|---|---|---|---|---|---|---|
| whole words | 604 | 604 | 1 | 0 | 0 | 0 | 1 |
| divided words | 692 | 127 | 10 | 338 | 153 | 124 | 131 |

At a phone's width the pressed pill is out of view until the pills are scrolled on **201 cards**, all of them divided words. The record under the pills does print the pressed reading in large type, so the reader is not left without it; what is lost is the first thing the eye lands on. The commonest first pills on these cards: «answer» 27, «Yôdh» 19, «declare» 18, «Hē» 17, «person» 14, «abide» 14, «beacon» 13, «avenger» 10. Places: `card-checks.tsv` (pressed_pill_not_first_divided, pressed_pill_beyond_tenth).

**Cause.** The place's reading is put first only for the whole form. `placeOfCell` in `zone.html` (about line 10968) answers for `surface === region.k` and for no block of a division («the set stands whole on its division, never … piece by piece»). A block's pool then goes through `sortPool` (about 9461 to 9615) with no place to lead it: the piece store's rows last (`pieceLast`), oldest first, so Strong's list of 1890 leads and TAHOT, which carries no year, comes last.

**Class.** A rule of ours overrides STEP's answer, in the card's order only: STEP gives the piece's reading at this place and nothing contests it, and the block is still ordered as though no source had answered. The order among the other sources is reconciling work and is not at fault.

**Mend, by rule.** A block's pool leads with the reading its own piece has at this place (the word's `pg` piece, matched by place as `piecePlaceOf` already matches it), exactly as the whole form's pool leads with the line. The rest of the pool keeps its order. A check: on every divided word the first pill of the pressed block is the piece on the line.

**Recurs.** Every divided word. 145,559 of the 305,411 lines of the 39 books have more than one piece.

### 2. Cards longer than the window (verified)

Median 23 pills a card, the longest 238 (וַעֲשֵׂה at 4:11); 445 cards have over 40 pills and 166 over 80. 1,015 of the 1,296 cards hold more pills than are in view (median 17 in view). This is the «SCROLL ↓» the card prints. It is not a fault of itself; with finding 1 it is where a reader stops and works. No mend proposed beyond finding 1.

### 3. Pills cut in the wrong place, and cross-references printed as readings (verified)

- Brackets that do not balance: 117 pills on 72 cards (`pill-fragments.tsv`). «that (belongs, belong» and «belonged) to» (unabridged BDB, on 42 cards of אֲשֶׁר); «like)» (Strong's form lists, 21 cards of the verb «to be»); «is not always clearly defined)» (6); «what) time», «times)», «quails ?)».
- Stray pieces: «-s», «(-teen, -teenth)», «-th» on שִׁבְעָה at 4:15; «hence» on אֹמֶנֶת at 4:16.
- Whole definition sentences as one pill: «a primitive root; to descend (literally, to go downwards; …); causatively» (3:3, where it is the pressed pill); «from אַי and פֹּה; what place?; also (of time) when?; …» (2:19).
- Strong's cross-references riding on the last gloss: 44 pills, «worthy. Compare 802» (19 cards of אִישׁ), «the Lord. Compare 3050, 3069» (18 cards of the Name), «Salmon. Compare 8009».

**Cause.** The print steps declared for the Strong's form lists (M14) and the unabridged BDB (M46) divide a row at commas that stand inside the source's own parentheses; Strong's «Compare …» sentence is taken as part of the last reading. **Class:** our print step overrides the source's own punctuation. **Mend, by rule:** in each source's declaration, a comma inside parentheses divides nothing; a closing sentence that only points to other numbers is not a reading. **Recurs:** wherever these entries are served; the pass on each dictionary counts the 39 books.

### 4. A year beside a source that is not its own (verified)

130 pill titles read «1890 · MACULA exact Hebrew morph surfaces …» (MACULA is of 2022); 27 read «1890 · STEP … TAHOT». Under the pills, in plain view: «MACULA … · wording 1890» on five cards (לָמָּה 1:11 and 1:21, נֶגֶד twice at 4:4, לְפָנִים 4:7); «STEP … TAHOT · wording 2026» at 2:11 שִׁלְשׁוֹם, «· wording 2023» at 2:19 וְאָנָה, «· wording 1890» at 3:8 אִשָּׁה; «SDBH · wording 1890» twice. **Cause:** the row carries the year of the oldest witness of the wording (`zone.html` about 9193 and 12795 to 12801, `yearSaid`) and prints it beside the name of the source credited. **Class:** a rule of ours fired where the source has its own year. **Mend, by rule:** a year printed beside a source's name is that source's own; an older witness's year is said with that witness's name or not at all. The 2026 and 2023 on TAHOT want their own look: no source in the store is of 2026.

### 5. The first pill on a one-letter suffix is the letter's name (verified)

On the suffix «me» the first pill is «Yôdh» (19 cards); on «her», «Hē» (17 cards). Both are the BDB (Open Scriptures) entries for the letters themselves, standing in the pool of the one-letter key as its oldest row. Example: בִי at 1:16, pills «Yôdh», «I», «me» (pressed), «my». **Mend, by rule:** the entry gate that keeps a homonym off a word keeps the alphabet's own entries off a suffix piece (STEP's tag for the piece is H9030 and its fellows, never the letter's entry).

### 6. The object marker joined by a maqaf: one cell in the reader, an empty item in the plain list

In the reader, אֶת־ with the signs off is drawn in the next word's cell with a gap (58 words' own lines are not drawn: they stand in a cell shared with a neighbor; `shots/1-6-w14-et-verse.png` shows «his + people» under אֶת־עַמּוֹ). That is a standing ruling (`zone.html` about 14982) and reads well. But the plain list under each chapter prints the same 25 lines (24 of אֶת־, 1 of אִם־ at 2:21) as an empty item with only its footnote number: «Yahweh¹ · ¹ · people + his¹» (1:6, in `/ruth/1/index.html`). **Class:** the list is a recording of the line and has no cell to share, so the gap stands alone. **Mend, by rule:** in the plain list a line that is only a gap is printed with the word it is joined to, or left out with its dot. **Recurs:** 6,584 lines in the 39 books are a gap alone before a maqaf.

### 7. UBS's pointers served as readings (verified)

«witness (read עֵד)» on 14 cards of עַד «until»; «to sit down (read ישׁב)» on לָשׁוּב «to return» (1:7, 1:16); «Benjaminite (see בֶּן־יְמִינִי)» and «valley (see גַּיְא)» on בֵּן «a son» (4:13, 4:17). These are UBS's notes that another word is to be read or looked up, printed as readings of this one. **Mend, by rule:** a UBS row whose whole reading is a pointer («read …», «see …») is a pointer, not a reading.

### 8. One reading as two pills (verified)

«husband's mother» and «husband’s mother» stand side by side on 10 cards of חָמוֹת; likewise «brother's wife», «take one's stand», «have one's abode» (16 cards in all). The two BDB editions print different apostrophes and the key that pools one reading into one pill does not fold them.

### 9. The notes above the pills («here BDB reads …»)

**First, what a reader sees.** At a phone's width 1,194 of the 1,296 cards fold these notes away (the page's «tight» state, `zone.html` about 1648 and 7891); only 102 cards show them. So of the 457 BDB notes in the markup a reader sees 38, and about 9 of those are faulty (`notes-seen.tsv`). The counts below are of the markup, which a shorter card or a taller window would show.

- 117 notes print the gloss and then pieces of sub-headings: «near / of God» (קָרוֹב, of Boaz), «go, come, walk / of wine / of letters / of shadow on dial», «turn back, return / of dying / field / upon, subject often», «house / of land of Ephraim as», «call, proclaim, read / with name of Baal», «pass over, through, by, pass on / of boundary-line / so Ew Th We Dr Kit Löhr RVm , but order of words difficult».
- 49 say «· 1 (no words given) (sense 1)» (Boaz, Elimelech, God, Obed …).
- 74 trail a second pick: «divide · sense 2 · 2 «divide» (sense 2)».
- Another word's entry: at 2:7 the notes for וְעַד «and + until» and זֶה «this» are the entry of עַתָּה («now / drawing a conclusion, especially / a practical one …»); the note for אִם at 2:21 and for כִּי throughout is a run of the headings of כִּי.
- A sense against the verse: שָׂדֶה «home of beasts» for the fields of Moab and Boaz's field (1:1, 1:2, 2:2); אֲדֹנִי, said to Boaz, «of God» (2:13); הֻגַּד «it has been told» as «be conspicuous» (2:11); יְשַׁלֵּם «may he reward» as «be complete, sound» (2:12); לְכַלְכֵּל «to sustain» as «comprehend, contain» (4:15).

The UBS notes are sound by comparison (400 read by hand: «to find favor», «empty-handed», «to testify», «family circle»); their one stumble is «here UBS reads · 1 «-»» on the 31 object markers and a trailing «· 2 «this»». All 372 distinct BDB notes are in `picks-bdb.tsv`.

**Cause.** BDB's pick at each place (`data/default-picks`, relays v180 to v195) printed through the unabridged BDB's sense openings. **Class:** our print of the pick does not serve BDB as BDB serves itself; where the pick names a neighbor's entry the pick itself is wrong. **Mend, by rule:** the note prints the gloss of the sense picked and nothing after it; a pick with no words prints nothing; a pick is kept only where its entry is the one STEP's tag names for that word. The pass on BDB should measure this over the 39 books.

### 10. A word the spelling bridge carries (verified)

Eight words of Ruth are spelled otherwise in STEP's text and are credited to TAHOT's row through the bridge (M4): 1:5 w1, 1:7 w8, 1:17 w11, 1:19 w4 and w8, 2:6 w13, 2:14 w16, 4:7 w5. Their lines are right. But the seven with more than one piece are printed as one plain string, left to right, with a written «+» («daughters-in-law + her»), where every other divided word draws its pieces in frames, right to left under their letters (`shots/1-6-w14-et-verse.png`, verse 1:7). Their cards offer no division and one pill, and the note prints the row with a slash («here STEP reads daughters-in-law/ her»). הַקֹּצְרִים at 2:14 has 1 pill; the same word with a vav at 2:7 has 13.

**Cause.** The book file gives these words the bridge's note (`ld`) and entries (`te`) but no pieces (`pg`). **Class:** the bridge carries STEP's reading and drops STEP's division at these words. **Mend, by rule:** where the bridge maps a word to TAHOT's row and the difference is a letter the bridge names (a vav or a yod more or less), TAHOT's division is carried with the reading. **Recurs:** 799 words in the 39 books are credited M4; 465 have more than one piece.

### 11. Written-and-read places

**a. A word written and not read: 3:12 word 5, (אם), line «mother» (verified, `shots/3-12-w5-im-verse.png`).** The word is אִם «if». It has no pointing and no STEP tag in the book file, so the line is the first reading of its bare letters, Strong's «mother». TAHOT's own row says what it is: `Rut.3.12#05=Q(K) … K= 'im (אִם) "if" (H0518B=HTc)`. The card says «ketiv — written · no vowels of its own, so its readings are matched by letters only». **Class:** a rule of ours overrides an answer STEP gives. **Mend, by rule:** a written-not-read word takes the pointing, entry and reading of TAHOT's «K=» note. **Recurs:** 8 places in the 39 books and all 8 read by letters: (אם) «mother» at Ruth 3:12, 2 Samuel 13:33 and 15:21, Jeremiah 39:12; (נא) «raw» at 2 Kings 5:18; (את) «sign» at Jeremiah 38:16; (חמש) «fifth» at Ezekiel 48:16; (ידרך) «archer» at Jeremiah 51:3 (`recur-places.tsv`; read from the data, not opened on the page outside Ruth).

**b. The word before a read-only word: 3:5 word 5 תֹּאמְרִי «say», 3:17 word 8 אָמַר «said» (verified).** STEP reads «you are saying» and «he said»; the same תֹּאמְרִי at 3:11 reads «you are saying». TAHOT gives the written word and the read-only אֵלַי on one row, «you are saying/ /to/ me», and the row is not divided at its own «/ /», so MACULA's piece leads. The card knows it: «here STEP reads you are saying/ /to/ me · 2 «you are saying» (a meaning variant, K)». **Mend, by rule:** a TAHOT row that joins two words with «/ /» is divided there, each half read on its own word. **Recurs:** 9 such places in the 39 books.

**c. The read-only word itself: 3:5 word 6 and 3:17 word 9, [אֵלַי], line «to + me» (verified, `shots/3-5-w6-elai-card.png`).** The line is right (MACULA's, and the same words as TAHOT's half). The card opens on the block אל with «power» pressed, and 157 pills of every word spelled אל («these», «against», «nothing», «strength», «Almighty», «not»). With no STEP tag the entry gate has nothing to hold. Same cause and mend as b.

**d. A pair whose line is not STEP's: 4:5 word 13, (קניתי) [קָנִיתָ], line «attain» (verified, `shots/4-5-w13-qanita-card.png`).** STEP reads «you have acquired». The bridge knows the pair (`LENINGRAD_PLUS:ה`: TAHOT's read word is קָנִיתָה) but carries no pieces and no tag, so the line is baked from an unpointed Strong's form-list row. The card holds that very row back («13 of 28 not pointed by their source, held back»), has no «attain» pill at all, and presses «purchased». Line and card disagree. **Mend, by rule:** as finding 10, for the read word of a pair. **Recurs:** 12 pairs in the 39 books are not led by STEP.

**e. Pairs with a division: the pressed pill is the first pill, not the line's reading (verified; cause suspected).** 3:3 w4 line «garments + your», pressed «apparel»; 3:3 w6 «and + you will go down», pressed a whole definition sentence; 3:4 w12 «and + you will lie down», pressed «cast down»; 4:4 w20 «so + let me know», pressed «acknowledge»; 4:6 w5 «to + redeem [it]», pressed «avenger». Five of the six divided pairs in Ruth; on every other divided word the pressed pill is at least the right one. Suspected: on a pair's read half the block's place is not matched to TAHOT's piece, so nothing is marked and the first pill is pressed. Not traced.

### 12. A divided object marker opens on «self» (verified)

4:9 word 15, וְאֵת, line «and» and a gap. The block את opens on «self» pressed: with the signs off its own «<obj.>» is not offered as a pill, so the first pill is pressed. On the undivided אֵת the pill «<obj.>» stands first and pressed. One card in Ruth; every וְאֵת and וְאֶת־ elsewhere.

### 13. STEP's own reading against the verse: 1:6 word 7, כִּי, line «if»

«And she returned from the fields of Moab, for she had heard …». TAHOT's Translation cell at `Rut.1.6#07` is «if»; the page serves it as given (MACULA on the card: «for»; BSB: «When»). No rule of ours; it belongs on a list for STEP. The only line of the 1,292 that carry TAHOT's own words which reads against the verse.

### 14. The page's own words

- «N withheld by your source switches (1 source off)» on a first visit, when the reader has switched nothing: in the markup of 451 cards, shown on 14.
- On the card of (אם) at 3:12, between the record and its credit: «BDB unabr. opens a numbered sense with: 2. figurative of Deborah as» (seen once, in the picture; not counted).
- The BSB row prints the BSB's own cell signs: «vvv — the neighboring English carries it» (4 cards), «(an empty cell) — the BSB's cell is empty» (7). Explained, but «vvv» is still a stumble.
- The chapter head reads «chapter title · no name is on record» above «commonly read as Chapter 1»; the foot of the page prints working language («B-MAM-RESTORE-V5 / N-POSITIONAL-PROTOTYPE · work_id=tanakh/ruth · 85 sealed units …»; «13 sources stand behind this book's readings (13 ledger ids)»). `page-words-ch1.txt` lists every string shown outside the verses.

### Noted and not flagged: STEP's style

- «+ !» for the closing letter of emphasis («you will stay + !»): 9 words in Ruth, 714 in the 39 books. TAHOT's own piece.
- «<the>» in a preposition with a pronoun, where no article stands («to <the> + me», «<in> <the> + her» for «rebuke her»): 54 words in Ruth, 4,877 lines in the 39 books. TAHOT's own cell. It is the one place where the style makes a reader stop; for the owner, not a fault of ours.
- The question he drawn as a gap («still» for הַעוֹד): 8 words. Reads well.

## What I read and found clean

- **Chapters 4, verses 85, words 1,296; no word without a line.**
- **Lines against TAHOT's bytes (machine, all):** 1,292 of 1,296 carry TAHOT's own words at that row (45 with a sign-only piece drawn as a gap, 8 with the question he as a gap). The 4 that do not are findings 11 a, b and d.
- **Lines against the Hebrew (hand, all):** 1,291 read right in their verses: person, number and tense where the English claims one; every name a name (Elimelech, Naomi, Mahlon, Kilion, Orpah, Ruth, Boaz, Perez, Hezron, Ram, Amminadab, Nahshon, Salmah and Salmon as the text has them, Obed, Jesse, David, Rachel, Leah, Tamar, Judah, Moab, Israel, Ephrathah, Beth-lehem across its two words); no name where the word is not one; the eight other written-and-read pairs follow the read word rightly.
- **The line as the page draws it against the data:** the same on all 1,296 (the walk's check found no difference).
- **Whole words' cards (604):** the pressed pill is the first pill and is the line on every one.
- **Chapter pages:** all four open at their own chapter, no page error, no failed request in the walks.
- **Credits on the line:** TAHOT's pieces 1,282, TAHOT's rows through the bridge 8, MACULA's pieces 4, Strong's (Open Scriptures) 1, Strong's form lists 1; each matches what the book file says of the word.

## What I could not check, and why

- **Other books on the page.** Every count «in the 39 books» is read from the data files (`recur.py`), not from the page; only Ruth was opened in a browser.
- **A wide window.** What a reader sees was measured at 412 by 915 only. One card tried at 1280 by 900 folded its notes away as well.
- **The cause of finding 11 e,** and why three TAHOT records carry the years 2026, 2023 and 1890.
- **MACULA's notes by hand** (918 distinct): only filtered for odd shapes; the «~» in «made ~ bitter» is MACULA's own sign (7 notes).
- **The sources off by default, the commentary and the count panel:** out of scope.
- **Twenty words in other books with no row of their own in the resting lines** (`recur-places.tsv`, no_line: among them Daniel 1:13 בַּג, 1 Samuel 25:18, Psalms 44:15) may be covered by a neighbor's line or may be bare; not opened.
- **One 404 in the browser console** on the first probe of `/ruth/1/`; the walks' request log showed no failed request, and I did not find which address it was.

## On the brief

**What helped.** The list of what to flag, kind by kind. «Use the resting lines to read fast and the page to confirm». The line that STEP's style is not a fault unless it hides the sense: it kept about 70 words off the list. `probe-cards-20.mjs` as a pattern for pressing a word.

**What was unclear, or missing.**

- *What a reader sees.* The brief says to open cards and read them. Most of a card's notes are folded away on most cards (1,194 of 1,296 here), and a script reads them from the markup all the same. I flagged 457 BDB notes before I measured that a reader sees 38. Tell readers to record what is in view, and at which window size.
- *Every tenth card is not the unit.* The card faults are by cause, not by place: one walk of every card with a few machine checks found all of them and counted them; reading every tenth by hand found none the machine had missed, though it was the hand reading that said what to check for.
- *The plain list under each chapter* is not mentioned; it is a second place the lines are printed, and it has a fault the reader's view does not (finding 6).
- *Where TAHOT's file is.* A reader cannot tell STEP's own oddity from a page fault without it. It is not under `v2/sources/` in the listing; I read another helper's copy (`S/w39/out/C1/dl-step/`).
- *The resting-lines folder holds forty works* (the Tikkunei Zohar too); a count «in the 39 books» must leave it out.
- *The line is drawn right to left,* piece under its letters: the data says «and + it was», the page shows «it was» then «and». Say so, or a reader flags it.
- *A key to the credits* (PIECE:TAHOT, M4, M9, M14 …) in one line of the brief would save a lookup.
- *flags.tsv by place* does not fit a cause that touches 565 cards. I wrote one row per flagged place and one row per group with the file that lists its places; say whether that is wanted.

**For a reader of a longer book.**

- Take the scripts here rather than write them again: `sheet.py` and `compact.py` (the reading sheet), `vs-tahot.py`, `walk-cards.mjs`, `walk-seen.mjs`, `analyze-cards.py`, `analyze-seen.py`, `brief-card.py`, `picks.py`, `recur.py`. Each names the book in one place (now written as `ruth`).
- Run the machine checks first, then read. The lines that are not TAHOT's bytes are listed in seconds, and they held four of the five wrong lines.
- Read the lines verse by verse in the Hebrew's order and expect very few faults: here 1 in 1,292 among STEP's own words. Those go on a list for STEP, not to a mend.
- One reader holds about 3,000 to 4,000 words of line reading with card samples in one sitting. A long book wants a reader per six to ten chapters, each with its own folder and the same scripts.
- The browser walk runs at about 100 cards a minute on this machine when shared (1,296 cards in 13 minutes). It is the one heavy process; start it first and read the lines while it runs.

**How many words an hour.** This pilot: 1,296 words in about an hour, with every line read by hand, every card walked twice by machine, 168 cards and 772 notes read by hand, and the tools written from nothing. With the tools in hand, the same reading is about **2,500 to 3,000 words an hour**, bounded by the reader's attention and not by the machine. At that rate the 305,417 words are 100 to 120 reader-hours if every line is read by hand. The card faults will not need that: they repeat by cause, so after the first two or three books the cards can be walked and counted by machine alone, and the hand reading spent on the lines.

## The data beside this file

| File | What it holds |
|---|---|
| `flags.tsv` | 29 flagged places and 10 groups: place, word, line, credit, kind, why, cause, recurs |
| `sheet.tsv`, `sheet.txt` | every entry of Ruth: Hebrew, key, line, credit, STEP's tag, pieces |
| `tahot-ruth.tsv`, `line-vs-tahot-ruth.tsv` | TAHOT's 1,294 rows for Ruth; every line against TAHOT's cell |
| `cards-ch1.jsonl` … `cards-ch4.jsonl` | every card as the page built it: head, notes, every pill with its sources, grade, title, pressed or not, the record |
| `seen-412.jsonl`, `notes-seen.tsv` | what of each card is in view at a phone's width; the faulty notes a reader sees |
| `card-checks.tsv` | every place behind each machine check on the cards |
| `pill-fragments.tsv` | the pills whose brackets do not balance |
| `picks-bdb.tsv`, `picks-ubs.tsv`, `picks-macula.tsv` | every distinct note above the pills, by source |
| `recur-places.tsv` | the places in the 39 books behind each recurrence count |
| `page-words-ch1.txt` | every string the chapter page shows outside the verses |
| `shots/` | pictures of nine flagged places, verse and card |
| `walk-log.txt`, `walk-times.txt`, `seen-times.txt` | the walks' own record |
